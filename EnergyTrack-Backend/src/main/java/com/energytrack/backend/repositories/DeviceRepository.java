package com.energytrack.backend.repositories;

import com.energytrack.backend.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    // Metoda magica: Gaseste toate dispozitivele pentru un anumit user ID
    List<Device> findByUserId(Long userId);
}