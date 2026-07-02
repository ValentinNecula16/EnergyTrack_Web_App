package com.energytrack.backend.services.impl;

import com.energytrack.backend.dtos.LoginRequest;
import com.energytrack.backend.dtos.RegisterRequest;
import com.energytrack.backend.entities.User;
import com.energytrack.backend.repositories.UserRepository;
import com.energytrack.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User register(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();

        // --- LOGICA NOUĂ DE SPARGERE A NUMELUI ---
        String fullName = registerRequest.getFullName();
        if (fullName != null && fullName.contains(" ")) {
            // Dacă a scris "Necula Valentin", punem "Necula" la Prenume și "Valentin" la Nume
            String[] parts = fullName.split(" ", 2); // Spargem doar la primul spațiu
            user.setFirstName(parts[0]);
            user.setLastName(parts[1]);
        } else {
            // Dacă a scris doar "Valentin", punem totul la Prenume
            user.setFirstName(fullName != null ? fullName : "User");
            user.setLastName(""); // Lăsăm gol numele de familie
        }
        // -----------------------------------------

        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public User login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return user;
            }
        }
        throw new RuntimeException("Invalid email or password");
    }
}