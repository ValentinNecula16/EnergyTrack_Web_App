package com.energytrack.backend.controllers;

import com.energytrack.backend.dtos.LoginRequest;
import com.energytrack.backend.dtos.RegisterRequest;
import com.energytrack.backend.entities.User;
import com.energytrack.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            User registeredUser = authService.register(registerRequest);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- ENDPOINT NOU PENTRU LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            User loggedUser = authService.login(loginRequest);
            return new ResponseEntity<>(loggedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Returnam 401 Unauthorized daca login-ul esueaza
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}

    // TODO: Vom adăuga API-ul /login aici mai târziu
