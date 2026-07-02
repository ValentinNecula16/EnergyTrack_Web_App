package com.energytrack.backend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "device_patterns")
public class DevicePattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "device_id", unique = true)
    private Device device;

    @Column(name = "avg_hours_per_day")
    private Double avgHoursPerDay;

    @Column(name = "min_hours")
    private Double minHours;

    @Column(name = "max_hours")
    private Double maxHours;

    @Column(name = "std_deviation")
    private Double stdDeviation;

    public DevicePattern() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }

    public Double getAvgHoursPerDay() { return avgHoursPerDay; }
    public void setAvgHoursPerDay(Double avgHoursPerDay) { this.avgHoursPerDay = avgHoursPerDay; }

    public Double getMinHours() { return minHours; }
    public void setMinHours(Double minHours) { this.minHours = minHours; }

    public Double getMaxHours() { return maxHours; }
    public void setMaxHours(Double maxHours) { this.maxHours = maxHours; }

    public Double getStdDeviation() { return stdDeviation; }
    public void setStdDeviation(Double stdDeviation) { this.stdDeviation = stdDeviation; }
}