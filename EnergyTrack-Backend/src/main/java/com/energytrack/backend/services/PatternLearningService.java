package com.energytrack.backend.services;

import com.energytrack.backend.dtos.ManualConsumptionDTO;
import com.energytrack.backend.entities.ConsumptionLog;
import com.energytrack.backend.entities.Device;
import com.energytrack.backend.entities.DevicePattern;
import com.energytrack.backend.entities.User;
import com.energytrack.backend.repositories.ConsumptionLogRepository;
import com.energytrack.backend.repositories.DevicePatternRepository;
import com.energytrack.backend.repositories.DeviceRepository;
import com.energytrack.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatternLearningService {

    private final ConsumptionLogRepository consumptionLogRepository;
    private final DevicePatternRepository devicePatternRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;


    @Transactional
    public void saveManualTrainingData(Long userId, List<ManualConsumptionDTO> manualData) {
        System.out.println("📝 Salvăm " + manualData.size() + " înregistrări manuale...");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        for (ManualConsumptionDTO dto : manualData) {
            Device device = deviceRepository.findById(dto.getDeviceId())
                    .orElseThrow(() -> new RuntimeException("Device not found"));

            double powerKw = device.getPowerConsumption() / 1000.0;
            double consumption = powerKw * dto.getHoursUsed();

            ConsumptionLog log = new ConsumptionLog();
            log.setDevice(device);
            log.setUser(user);
            log.setConsumption(Math.round(consumption * 100.0) / 100.0);
            log.setTimestamp(dto.getDate().atTime(12, 0));

            consumptionLogRepository.save(log);
        }

        System.out.println("✅ Date manuale salvate!");
    }

    @Transactional
    public void learnPatternsFromManualData(Long userId, LocalDate startDate, LocalDate endDate) {
        System.out.println("🧠 Învățăm pattern-uri PERMANENTE din " + startDate + " până " + endDate + "...");

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<ConsumptionLog> logs = consumptionLogRepository
                .findByUserIdAndTimestampBetween(userId, start, end);

        if (logs.isEmpty()) {
            System.out.println("⚠️ Nu există date pentru învățare!");
            return;
        }

        Map<Long, List<ConsumptionLog>> logsByDevice = logs.stream()
                .collect(Collectors.groupingBy(log -> log.getDevice().getId()));

        for (Map.Entry<Long, List<ConsumptionLog>> entry : logsByDevice.entrySet()) {
            Long deviceId = entry.getKey();
            List<ConsumptionLog> deviceLogs = entry.getValue();

            Device device = deviceRepository.findById(deviceId).orElse(null);
            if (device == null) continue;

            long dayCount = endDate.toEpochDay() - startDate.toEpochDay() + 1;
            double powerKw = device.getPowerConsumption() / 1000.0;

            Map<LocalDate, Double> dailyHours = deviceLogs.stream()
                    .collect(Collectors.groupingBy(
                            log -> log.getTimestamp().toLocalDate(),
                            Collectors.summingDouble(log -> log.getConsumption() / powerKw)
                    ));

            double totalHours = dailyHours.values().stream().mapToDouble(Double::doubleValue).sum();
            double avgHours = totalHours / dayCount;

            double minHours = dailyHours.values().stream().min(Double::compare).orElse(0.0);
            double maxHours = dailyHours.values().stream().max(Double::compare).orElse(0.0);

            double variance = dailyHours.values().stream()
                    .mapToDouble(h -> Math.pow(h - avgHours, 2))
                    .average()
                    .orElse(0.0);
            double stdDev = Math.sqrt(variance);

            // Găsește pattern existent sau creează unul nou
            DevicePattern pattern = devicePatternRepository
                    .findByDeviceId(deviceId)
                    .orElse(new DevicePattern());

            pattern.setDevice(device);
            pattern.setAvgHoursPerDay(Math.round(avgHours * 100.0) / 100.0);
            pattern.setMinHours(Math.round(minHours * 100.0) / 100.0);
            pattern.setMaxHours(Math.round(maxHours * 100.0) / 100.0);
            pattern.setStdDeviation(Math.round(stdDev * 100.0) / 100.0);

            devicePatternRepository.save(pattern);

            System.out.println("✅ Pattern PERMANENT pentru " + device.getName() + ": " +
                    "avg=" + avgHours + "h, min=" + minHours + "h, max=" + maxHours + "h");
        }

        System.out.println("🎉 Pattern-uri învățate PERMANENT! Vor fi folosite FOREVER! 🧠");
    }

    public double generateRealisticHours(DevicePattern pattern, Random random) {
        double hours = pattern.getAvgHoursPerDay() + random.nextGaussian() * pattern.getStdDeviation();
        hours = Math.max(pattern.getMinHours(), hours);
        hours = Math.min(pattern.getMaxHours(), hours);
        return Math.round(hours * 100.0) / 100.0;
    }
}