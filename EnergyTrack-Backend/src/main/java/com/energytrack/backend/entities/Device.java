package com.energytrack.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- IMPORT NOU
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList; // <--- IMPORT NOU
import java.util.List;      // <--- IMPORT NOU

@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double powerConsumption;
    private Double totalConsumption = 0.0;
    private Double cost = 0.0;
    private boolean isActive = true;

    // Câmpuri noi pentru scheduling și manual control
    private Boolean manualState;  // null = auto, true = manual ON, false = manual OFF

    @Column(name = "on_time")
    private java.time.LocalTime onTime;  // Ora de pornire automată

    @Column(name = "off_time")
    private java.time.LocalTime offTime; // Ora de oprire automată

    private String location;
    private String energyClass;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // --- MAGIA CARE REZOLVĂ ȘTERGEREA ---
    // Asta spune: "Dacă șterg Device-ul, șterge toate log-urile lui"
    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Important: Nu trimite log-urile când cerem doar lista de device-uri (ar bloca React-ul)
    private List<ConsumptionLog> logs = new ArrayList<>();
    // -------------------------------------

    public Device() {}

    public Device(String name, Double powerConsumption) {
        this.name = name;
        this.powerConsumption = powerConsumption;
        this.lastUpdated = LocalDateTime.now();
        this.totalConsumption = 0.0;
        this.cost = 0.0;
    }

    // --- Getters și Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPowerConsumption() { return powerConsumption; }
    public void setPowerConsumption(Double powerConsumption) { this.powerConsumption = powerConsumption; }

    public Double getTotalConsumption() { return totalConsumption == null ? 0.0 : totalConsumption; }
    public void setTotalConsumption(Double totalConsumption) { this.totalConsumption = totalConsumption; }

    public Double getCost() { return cost == null ? 0.0 : cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEnergyClass() { return energyClass; }
    public void setEnergyClass(String energyClass) { this.energyClass = energyClass; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    // Getter și Setter pentru logs
    public List<ConsumptionLog> getLogs() { return logs; }
    public void setLogs(List<ConsumptionLog> logs) { this.logs = logs; }

    public Boolean getManualState() { return manualState; }
    public void setManualState(Boolean manualState) { this.manualState = manualState; }

    public java.time.LocalTime getOnTime() { return onTime; }
    public void setOnTime(java.time.LocalTime onTime) { this.onTime = onTime; }

    public java.time.LocalTime getOffTime() { return offTime; }
    public void setOffTime(java.time.LocalTime offTime) { this.offTime = offTime; }
}