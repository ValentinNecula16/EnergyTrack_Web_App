package com.energytrack.backend.controllers;

import com.energytrack.backend.dtos.DeviceRequest;
import com.energytrack.backend.entities.Device;
import com.energytrack.backend.entities.User;
import com.energytrack.backend.repositories.ConsumptionLogRepository;
import com.energytrack.backend.repositories.DeviceRepository;
import com.energytrack.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/devices")

public class DeviceControllers {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConsumptionLogRepository consumptionLogRepository;

    // --- 1. LISTARE DEVICE-URI ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Device>> getUserDevices(@PathVariable Long userId) {
        return new ResponseEntity<>(deviceRepository.findByUserId(userId), HttpStatus.OK);
    }

    // --- 2. ADĂUGARE DEVICE ---
    @PostMapping("/add")
    public ResponseEntity<?> addDevice(@RequestBody DeviceRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        Device device = new Device();
        device.setName(request.getName());
        device.setPowerConsumption(request.getPowerConsumption());
        device.setEnergyClass(request.getEnergyClass());
        device.setLocation(request.getLocation());
        device.setUser(userOpt.get());
        device.setActive(true);
        device.setManualState(true);
        Device savedDevice = deviceRepository.save(device);
        return new ResponseEntity<>(savedDevice, HttpStatus.CREATED);
    }

    // --- 3. ȘTERGERE DEVICE ---
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<?> deleteDevice(@PathVariable Long deviceId) {
        if (!deviceRepository.existsById(deviceId)) {
            return new ResponseEntity<>("Device not found", HttpStatus.NOT_FOUND);
        }
        deviceRepository.deleteById(deviceId);
        return new ResponseEntity<>("Device deleted successfully", HttpStatus.OK);
    }

    // --- 4. SCHIMBARE STATUS (ON/OFF) cu parametru ---
    @PutMapping("/{deviceId}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long deviceId, @RequestParam(required = false) Boolean isActive) {
        Optional<Device> deviceOpt = deviceRepository.findById(deviceId);
        if (deviceOpt.isEmpty()) {
            return new ResponseEntity<>("Device not found", HttpStatus.NOT_FOUND);
        }

        Device device = deviceOpt.get();

        if (isActive == null) {
            boolean newState = !device.isActive();
            device.setActive(newState);
            device.setManualState(newState);
        } else {
            device.setActive(isActive);
            device.setManualState(isActive);
        }

        Device savedDevice = deviceRepository.save(device);
        return new ResponseEntity<>(savedDevice, HttpStatus.OK);
    }

    // --- 4B. TOGGLE SIMPLU (fără parametri) ---
    @PutMapping("/{deviceId}/toggle")
    public ResponseEntity<?> toggleDevice(@PathVariable Long deviceId) {
        System.out.println("🔄 Toggle request for device ID: " + deviceId);

        Optional<Device> deviceOpt = deviceRepository.findById(deviceId);
        if (deviceOpt.isEmpty()) {
            System.out.println("❌ Device not found: " + deviceId);
            return new ResponseEntity<>("Device not found", HttpStatus.NOT_FOUND);
        }

        Device device = deviceOpt.get();
        boolean oldStatus = device.isActive();
        boolean newStatus = !oldStatus;

        device.setActive(newStatus);
        device.setManualState(newStatus);

        Device savedDevice = deviceRepository.save(device);

        System.out.println("✅ Device '" + device.getName() + "' toggled: " +
                oldStatus + " → " + savedDevice.isActive() +
                " (manualState: " + savedDevice.getManualState() + ")");

        return new ResponseEntity<>(savedDevice, HttpStatus.OK);
    }

    // --- 5. STATISTICI LUNARE (kWh + Cost) ---
    @GetMapping("/stats/monthly/{userId}")
    public ResponseEntity<Map<String, Double>> getMonthlyStats(@PathVariable Long userId) {
        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        Double totalKwh = consumptionLogRepository.getTotalConsumptionSince(userId, firstDayOfMonth.atStartOfDay());

        if (totalKwh == null) totalKwh = 0.0;

        double PRICE = 1.3;
        double totalCost = totalKwh * PRICE;

        Map<String, Double> response = new HashMap<>();
        response.put("kwh", Math.round(totalKwh * 100.0) / 100.0);
        response.put("cost", Math.round(totalCost * 100.0) / 100.0);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- 6. STATISTICI DETALIATE PENTRU DASHBOARD ---
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long userId) {
        List<Device> userDevices = deviceRepository.findByUserId(userId);

        double totalKwh = userDevices.stream()
                .mapToDouble(Device::getTotalConsumption)
                .sum();

        double totalCost = userDevices.stream()
                .mapToDouble(Device::getCost)
                .sum();

        Device topConsumer = userDevices.stream()
                .max((d1, d2) -> Double.compare(d1.getTotalConsumption(), d2.getTotalConsumption()))
                .orElse(null);

        List<Map<String, Object>> deviceBreakdown = userDevices.stream()
                .filter(d -> d.getTotalConsumption() > 0)
                .map(d -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", d.getName());
                    item.put("kwh", Math.round(d.getTotalConsumption() * 100.0) / 100.0);
                    item.put("percentage", Math.round((d.getTotalConsumption() / totalKwh) * 100.0 * 100.0) / 100.0);
                    return item;
                })
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("totalKwh", Math.round(totalKwh * 100.0) / 100.0);
        response.put("totalCost", Math.round(totalCost * 100.0) / 100.0);
        response.put("activeDevices", userDevices.stream().filter(Device::isActive).count());
        response.put("totalDevices", userDevices.size());
        response.put("topConsumer", topConsumer != null ? Map.of(
                "name", topConsumer.getName(),
                "kwh", Math.round(topConsumer.getTotalConsumption() * 100.0) / 100.0
        ) : null);
        response.put("deviceBreakdown", deviceBreakdown);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- 7. CONSUM ZILNIC PENTRU CALENDAR ---
    @GetMapping("/daily-consumption/{userId}")
    public ResponseEntity<?> getDailyConsumption(
            @PathVariable Long userId,
            @RequestParam int month,
            @RequestParam int year) {
        try {
            java.time.LocalDateTime start = java.time.LocalDateTime.of(year, month, 1, 0, 0);
            java.time.LocalDateTime end = start.plusMonths(1);

            List<Object[]> rawData = consumptionLogRepository
                    .getDailyConsumptionBetween(userId, start, end);

            // ✅ Factor de corecție DOAR pentru luna curentă
            double correctionFactor = 1.0;
            java.time.LocalDate today = java.time.LocalDate.now();
            boolean isCurrentMonth = (month == today.getMonthValue() && year == today.getYear());

            if (isCurrentMonth) {
                List<Device> userDevices = deviceRepository.findByUserId(userId);
                double totalFromDevices = userDevices.stream()
                        .mapToDouble(Device::getTotalConsumption).sum();
                double totalFromLogs = rawData.stream()
                        .mapToDouble(row -> ((Number) row[1]).doubleValue()).sum();

                if (totalFromDevices > 0 && totalFromLogs > 0) {
                    correctionFactor = totalFromDevices / totalFromLogs;
                }
            }
            // Lunile trecute → correctionFactor = 1.0 mereu

            java.util.LinkedHashMap<Integer, Double> result = new java.util.LinkedHashMap<>();
            for (Object[] row : rawData) {
                java.time.LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                double kwh = ((Number) row[1]).doubleValue() * correctionFactor;
                result.put(date.getDayOfMonth(), Math.round(kwh * 100.0) / 100.0);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/manual-log")
    public ResponseEntity<?> saveManualLog(@RequestBody List<Map<String, Object>> entries) {
        try {
            for (Map<String, Object> entry : entries) {
                Long deviceId = ((Number) entry.get("deviceId")).longValue();
                double hours = ((Number) entry.get("hours")).doubleValue();

                Optional<Device> deviceOpt = deviceRepository.findById(deviceId);
                if (deviceOpt.isEmpty()) continue;

                Device device = deviceOpt.get();

                // 1. Șterge ÎNTOTDEAUNA log-urile de azi pentru acest device
                java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now().toLocalDate().atStartOfDay();
                java.time.LocalDateTime endOfDay = startOfDay.plusDays(1);
                List<com.energytrack.backend.entities.ConsumptionLog> todayLogs =
                        consumptionLogRepository.findByDeviceAndTimestampBetween(device, startOfDay, endOfDay);

                double removedKwh = todayLogs.stream()
                        .mapToDouble(com.energytrack.backend.entities.ConsumptionLog::getConsumption)
                        .sum();
                consumptionLogRepository.deleteAll(todayLogs);

                // 2. Salvează noul log doar dacă hours > 0
                double kwh = Math.round((device.getPowerConsumption() / 1000.0) * hours * 100.0) / 100.0;

                if (kwh > 0) {
                    com.energytrack.backend.entities.ConsumptionLog log =
                            new com.energytrack.backend.entities.ConsumptionLog();
                    log.setDevice(device);
                    log.setUser(device.getUser());
                    log.setConsumption(kwh);
                    log.setTimestamp(java.time.LocalDateTime.now());
                    consumptionLogRepository.save(log);
                }

                // 3. Recalculează totalConsumption pe device
                double newTotal = device.getTotalConsumption() - removedKwh + kwh;
                device.setTotalConsumption(Math.max(0, Math.round(newTotal * 100.0) / 100.0));
                device.setCost(device.getTotalConsumption() * 1.3);
                deviceRepository.save(device);
            }
            return ResponseEntity.ok("Saved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}