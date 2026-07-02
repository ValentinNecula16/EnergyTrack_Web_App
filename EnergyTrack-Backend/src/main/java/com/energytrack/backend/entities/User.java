package com.energytrack.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- Importa asta
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User { // <--- Am schimbat 'user' in 'User' (Conventie Java)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore // <--- Asta ascunde parola cand trimiti datele catre React
    private String password;

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    private Double monthlyTarget = 300.0;

    public User() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Double getMonthlyTarget() {
        return monthlyTarget;
    }

    public void setMonthlyTarget(Double monthlyTarget) {
        this.monthlyTarget = monthlyTarget;
    }
}