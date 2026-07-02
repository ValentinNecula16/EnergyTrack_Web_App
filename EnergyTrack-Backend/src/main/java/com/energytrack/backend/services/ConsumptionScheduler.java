package com.energytrack.backend.services;

import com.energytrack.backend.entities.ConsumptionLog;
import com.energytrack.backend.entities.Device;
import com.energytrack.backend.entities.DevicePattern;
import com.energytrack.backend.repositories.ConsumptionLogRepository;
import com.energytrack.backend.repositories.DevicePatternRepository;
import com.energytrack.backend.repositories.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
@RequiredArgsConstructor
public class ConsumptionScheduler {

    private final DeviceRepository deviceRepository;
    private final ConsumptionLogRepository consumptionLogRepository;
    private final DevicePatternRepository devicePatternRepository;
    private final PatternLearningService patternLearningService;

    private final Random random = new Random();

    /**
     * Verifică dacă un device este oprit (fie isActive=false, fie manualState=false)
     */
    private boolean isDeviceOff(Device device) {
        if (!device.isActive()) return true;
        if (device.getManualState() != null && !device.getManualState()) return true;
        return false;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        System.out.println("🚀 Backend pornit! Verificăm status...");

        LocalDate today = LocalDate.now();

        // ✅ Verificare resetare lunară la startup - INDIFERENT de ziua din lună
        List<Device> devices = deviceRepository.findAll();
        for (Device device : devices) {
            Optional<ConsumptionLog> lastDeviceLog = consumptionLogRepository
                    .findTopByDeviceOrderByTimestampDesc(device);
            if (lastDeviceLog.isPresent() &&
                    (lastDeviceLog.get().getTimestamp().getMonth() != today.getMonth() ||
                            lastDeviceLog.get().getTimestamp().getYear() != today.getYear())) {
                System.out.println("🔄 Reset lunar detectat la startup pentru: " + device.getName());
                device.setTotalConsumption(0.0);
                device.setCost(0.0);
                deviceRepository.save(device);
            }
        }

        Optional<ConsumptionLog> lastLog = consumptionLogRepository.findTopByOrderByTimestampDesc();

        if (lastLog.isEmpty()) {
            System.out.println("ℹ️ Nu există date. Așteptăm training data manual.");
            return;
        }

        LocalDateTime lastUpdate = lastLog.get().getTimestamp();
        LocalDateTime now = LocalDateTime.now();

        // ✅ Dacă ultimul log e din luna trecută, backfill pornește de la 1 ale lunii curente
        if (lastUpdate.getMonth() != now.getMonth() ||
                lastUpdate.getYear() != now.getYear()) {
            lastUpdate = today.withDayOfMonth(1).atStartOfDay();
            System.out.println("📅 Luna nouă detectată! Backfill pornește de la 1 " + today.getMonth());
        }

        long hoursGap = ChronoUnit.HOURS.between(lastUpdate, now);

        if (hoursGap > 1) {
            System.out.println("⚠️ GAP DETECTAT: " + hoursGap + " ore fără actualizare!");
            smartBackfill(lastUpdate, now);
        } else {
            System.out.println("✅ Totul e la zi! Ultimul log acum " + hoursGap + " ore.");
        }
    }

    private void smartBackfill(LocalDateTime lastUpdate, LocalDateTime now) {
        List<DevicePattern> patterns = devicePatternRepository.findAll();

        if (patterns.isEmpty()) {
            System.out.println("⚠️ Nu există pattern-uri învățate! Așteptăm training data.");
            return;
        }

        System.out.println("🧠 Generăm date bazate pe " + patterns.size() + " pattern-uri permanente...");

        LocalDate startDate = lastUpdate.toLocalDate().plusDays(1);
        LocalDate endDate = now.toLocalDate();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            for (DevicePattern pattern : patterns) {
                Device device = pattern.getDevice();

                if (isDeviceOff(device)) {
                    System.out.println("⏭️ Skip " + device.getName() + " - " + date + " (device OFF)");
                    continue;
                }

                // Anti-duplicat
                LocalDateTime dayStart = date.atStartOfDay();
                LocalDateTime dayEnd = date.atTime(23, 59, 59);
                List<ConsumptionLog> existingLogs = consumptionLogRepository
                        .findByDeviceAndTimestampBetween(device, dayStart, dayEnd);

                if (!existingLogs.isEmpty()) {
                    System.out.println("⏭️ Skip " + device.getName() + " - " + date + " (date deja existente)");
                    continue;
                }

                double hoursToday = patternLearningService.generateRealisticHours(pattern, random);
                double powerKw = device.getPowerConsumption() / 1000.0;
                double consumption = hoursToday * powerKw;
                double roundedConsumption = Math.round(consumption * 100.0) / 100.0;

                ConsumptionLog log = new ConsumptionLog();
                log.setDevice(device);
                log.setUser(device.getUser());
                log.setConsumption(roundedConsumption);
                log.setTimestamp(date.atTime(12, 0));

                consumptionLogRepository.save(log);

                device.setTotalConsumption(device.getTotalConsumption() + roundedConsumption);
                device.setCost(device.getTotalConsumption() * 0.8);
                deviceRepository.save(device);

                System.out.println("✅ " + device.getName() + " - " + date + " - " + hoursToday + "h - " + roundedConsumption + " kWh");
            }
        }

        if (endDate.equals(LocalDate.now())) {
            generatePartialDay(now, patterns);
        }

        System.out.println("🎉 Backfill complet!");
    }

    private void generatePartialDay(LocalDateTime now, List<DevicePattern> patterns) {
        double fractionOfDay = now.toLocalTime().toSecondOfDay() / 86400.0;
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        for (DevicePattern pattern : patterns) {
            Device device = pattern.getDevice();

            if (isDeviceOff(device)) {
                System.out.println("⏭️ Skip partial day " + device.getName() + " (device OFF)");
                continue;
            }

            // Anti-duplicat
            List<ConsumptionLog> todayLogs = consumptionLogRepository
                    .findByDeviceAndTimestampBetween(device, todayStart, now);

            if (!todayLogs.isEmpty()) {
                System.out.println("⏭️ Skip partial day " + device.getName() + " (date deja existente azi)");
                continue;
            }

            double expectedHours = patternLearningService.generateRealisticHours(pattern, random);
            double actualHours = expectedHours * fractionOfDay;

            double powerKw = device.getPowerConsumption() / 1000.0;
            double consumption = actualHours * powerKw;
            double roundedConsumption = Math.round(consumption * 100.0) / 100.0;

            ConsumptionLog log = new ConsumptionLog();
            log.setDevice(device);
            log.setUser(device.getUser());
            log.setConsumption(roundedConsumption);
            log.setTimestamp(now);

            consumptionLogRepository.save(log);

            device.setTotalConsumption(device.getTotalConsumption() + roundedConsumption);
            device.setCost(device.getTotalConsumption() * 0.8);
            deviceRepository.save(device);
        }
    }

    @Scheduled(fixedRate = 1800000, initialDelay = 1800000)
    public void periodicUpdate() {
        System.out.println("⏰ Update periodic la " + LocalDateTime.now());

        List<DevicePattern> patterns = devicePatternRepository.findAll();

        if (patterns.isEmpty()) {
            return;
        }

        for (DevicePattern pattern : patterns) {
            Device device = pattern.getDevice();

            if (isDeviceOff(device)) {
                System.out.println("⏭️ Skip periodic " + device.getName() + " (device OFF)");
                continue;
            }

            // Safety check: nu adăuga consum dacă ultimul log e prea recent
            Optional<ConsumptionLog> lastDeviceLog = consumptionLogRepository
                    .findTopByDeviceOrderByTimestampDesc(device);

            if (lastDeviceLog.isPresent()) {
                long minutesSinceLast = ChronoUnit.MINUTES.between(
                        lastDeviceLog.get().getTimestamp(), LocalDateTime.now());
                if (minutesSinceLast < 20) {
                    System.out.println("⏭️ Skip periodic " + device.getName() +
                            " (ultimul log acum " + minutesSinceLast + " min)");
                    continue;
                }
            }

            double powerKw = device.getPowerConsumption() / 1000.0;
            double consumption = powerKw * 0.5;
            double roundedConsumption = Math.round(consumption * 100.0) / 100.0;

            ConsumptionLog log = new ConsumptionLog();
            log.setDevice(device);
            log.setUser(device.getUser());
            log.setConsumption(roundedConsumption);
            log.setTimestamp(LocalDateTime.now());

            consumptionLogRepository.save(log);

            device.setTotalConsumption(device.getTotalConsumption() + roundedConsumption);
            device.setCost(device.getTotalConsumption() * 0.8);
            deviceRepository.save(device);
        }

        System.out.println("✅ Update complet!");
    }

    @Scheduled(cron = "0 0 0 1 * ?")
    public void monthlyReset() {
        System.out.println("🔄 RESETARE LUNARĂ - Prima zi a lunii!");

        List<Device> devices = deviceRepository.findAll();

        for (Device device : devices) {
            device.setTotalConsumption(0.0);
            device.setCost(0.0);
            deviceRepository.save(device);
            System.out.println("   ✅ Reset consum pentru " + device.getName());
        }

        System.out.println("✅ Consum și cost resetate pentru luna nouă!");
        System.out.println("🧠 Pattern-urile AI rămân active!");
    }
}