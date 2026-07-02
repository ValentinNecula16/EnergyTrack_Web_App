package com.energytrack.backend.repositories;

import com.energytrack.backend.entities.DevicePattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DevicePatternRepository extends JpaRepository<DevicePattern, Long> {

    // Găsește pattern pentru un device (unic per device, permanent)
    Optional<DevicePattern> findByDeviceId(Long deviceId);
}