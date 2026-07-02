package com.energytrack.backend.dtos;

import java.time.LocalDate;

public class ManualConsumptionDTO {

    private Long deviceId;
    private LocalDate date;
    private Double hoursUsed;

    public ManualConsumptionDTO() {}

    public ManualConsumptionDTO(Long deviceId, LocalDate date, Double hoursUsed) {
        this.deviceId = deviceId;
        this.date = date;
        this.hoursUsed = hoursUsed;
    }

    // Getters & Setters
    public Long getDeviceId() { return deviceId; }
    public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Double getHoursUsed() { return hoursUsed; }
    public void setHoursUsed(Double hoursUsed) { this.hoursUsed = hoursUsed; }
}