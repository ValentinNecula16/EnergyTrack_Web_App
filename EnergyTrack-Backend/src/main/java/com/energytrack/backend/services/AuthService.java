package com.energytrack.backend.services;

import com.energytrack.backend.dtos.LoginRequest;
import com.energytrack.backend.dtos.RegisterRequest;
import com.energytrack.backend.entities.User; // Atentie la importul User cu litera mare

public interface AuthService {
    User register(RegisterRequest registerRequest);
    User login(LoginRequest loginRequest); // <--- Metoda noua
}