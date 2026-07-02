package com.energytrack.backend.dtos;

public class RegisterRequest {

    // React trimite "fullName", nu "firstName/lastName" separat
    private String fullName;

    // React trimite si astea, chiar daca nu le salvam inca in User, trebuie sa le primim ca sa nu dea eroare
    private String phoneNumber;
    private String housingType;

    private String email;
    private String password;

    // --- Getters & Setters ---

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getHousingType() { return housingType; }
    public void setHousingType(String housingType) { this.housingType = housingType; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}