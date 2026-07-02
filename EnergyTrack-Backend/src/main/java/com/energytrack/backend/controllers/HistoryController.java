package com.energytrack.backend.controllers;

import com.energytrack.backend.entities.Device;
import com.energytrack.backend.repositories.ConsumptionLogRepository;
import com.energytrack.backend.repositories.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    @Autowired
    private ConsumptionLogRepository consumptionLogRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    // --- 1. LUNILE DISPONIBILE (pentru selector) ---
    @GetMapping("/available-months/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getAvailableMonths(@PathVariable Long userId) {
        List<Object[]> results = consumptionLogRepository.getAvailableMonths(userId);

        List<Map<String, Object>> months = new ArrayList<>();
        String[] monthNames = {"", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (Object[] row : results) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();

            Map<String, Object> item = new HashMap<>();
            item.put("year", year);
            item.put("month", month);
            item.put("label", monthNames[month] + " " + year);
            months.add(item);
        }

        return new ResponseEntity<>(months, HttpStatus.OK);
    }

    // --- 2. DATE ISTORICE PENTRU O LUNĂ SPECIFICĂ ---
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getMonthlyHistory(
            @PathVariable Long userId,
            @RequestParam int year,
            @RequestParam int month) {

        LocalDateTime startDate = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime endDate = startDate.plusMonths(1);

        boolean isCurrentMonth = (year == LocalDate.now().getYear() && month == LocalDate.now().getMonthValue());

        // --- FACTOR DE CORECȚIE pentru luna curentă ---
        double correctionFactor = 1.0;
        if (isCurrentMonth) {
            // Totalul real din devices (sursa de adevăr)
            List<Device> userDevices = deviceRepository.findByUserId(userId);
            double totalFromDevices = userDevices.stream()
                    .mapToDouble(Device::getTotalConsumption)
                    .sum();

            // Totalul din logs (poate fi inflat de duplicate)
            Double totalFromLogs = consumptionLogRepository.getTotalConsumptionBetween(userId, startDate, endDate);
            if (totalFromLogs == null) totalFromLogs = 0.0;

            if (totalFromLogs > 0) {
                correctionFactor = totalFromDevices / totalFromLogs;
            }
        }

        // Total consum (corectat)
        Double rawTotal = consumptionLogRepository.getTotalConsumptionBetween(userId, startDate, endDate);
        if (rawTotal == null) rawTotal = 0.0;
        double totalKwh = rawTotal * correctionFactor;

        // Breakdown per device (corectat)
        List<Object[]> deviceResults = consumptionLogRepository.getDeviceBreakdownBetween(userId, startDate, endDate);
        List<Map<String, Object>> deviceBreakdown = new ArrayList<>();

        for (Object[] row : deviceResults) {
            Map<String, Object> device = new HashMap<>();
            device.put("deviceId", ((Number) row[0]).longValue());
            device.put("name", (String) row[1]);
            double kwh = ((Number) row[2]).doubleValue() * correctionFactor;
            device.put("kwh", Math.round(kwh * 100.0) / 100.0);
            device.put("percentage", totalKwh > 0 ? Math.round((kwh / totalKwh) * 100.0 * 100.0) / 100.0 : 0);
            device.put("cost", Math.round(kwh * 1.3 * 100.0) / 100.0);
            deviceBreakdown.add(device);
        }

        // Consum pe zile (corectat)
        List<Object[]> dailyResults = consumptionLogRepository.getDailyConsumptionBetween(userId, startDate, endDate);
        List<Map<String, Object>> dailyData = new ArrayList<>();

        for (Object[] row : dailyResults) {
            Map<String, Object> day = new HashMap<>();
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            day.put("date", date.toString());
            day.put("day", date.getDayOfMonth());
            double kwh = ((Number) row[1]).doubleValue() * correctionFactor;
            day.put("kwh", Math.round(kwh * 100.0) / 100.0);
            day.put("cost", Math.round(kwh * 1.3 * 100.0) / 100.0);
            dailyData.add(day);
        }

        // Statistici
        double totalCost = totalKwh * 1.3;
        double dailyAvg = dailyData.size() > 0 ? totalKwh / dailyData.size() : 0;

        // Peak day
        String peakDay = "";
        double peakKwh = 0;
        for (Map<String, Object> day : dailyData) {
            double kwh = (Double) day.get("kwh");
            if (kwh > peakKwh) {
                peakKwh = kwh;
                peakDay = (String) day.get("date");
            }
        }

        // Lowest day
        String lowestDay = "";
        double lowestKwh = Double.MAX_VALUE;
        for (Map<String, Object> day : dailyData) {
            double kwh = (Double) day.get("kwh");
            if (kwh < lowestKwh) {
                lowestKwh = kwh;
                lowestDay = (String) day.get("date");
            }
        }

        // Response
        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("totalKwh", Math.round(totalKwh * 100.0) / 100.0);
        response.put("totalCost", Math.round(totalCost * 100.0) / 100.0);
        response.put("dailyAverage", Math.round(dailyAvg * 100.0) / 100.0);
        response.put("daysWithData", dailyData.size());
        response.put("peakDay", peakDay);
        response.put("peakKwh", Math.round(peakKwh * 100.0) / 100.0);
        response.put("lowestDay", lowestDay);
        response.put("lowestKwh", lowestKwh == Double.MAX_VALUE ? 0 : Math.round(lowestKwh * 100.0) / 100.0);
        response.put("deviceBreakdown", deviceBreakdown);
        response.put("dailyData", dailyData);
        response.put("totalDevices", deviceBreakdown.size());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}