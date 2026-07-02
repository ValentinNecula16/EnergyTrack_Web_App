package com.energytrack.backend.dtos;

public class DeviceRequest {
    private String name;
    private Double powerConsumption;
    private String location;
    private String energyClass; // Campul nou
    private Long userId;

    // Getters si Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPowerConsumption() { return powerConsumption; }
    public void setPowerConsumption(Double powerConsumption) { this.powerConsumption = powerConsumption; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    // ACESTEA LIPSEAU SI CAUZAU EROAREA
    public String getEnergyClass() { return energyClass; }
    public void setEnergyClass(String energyClass) { this.energyClass = energyClass; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}