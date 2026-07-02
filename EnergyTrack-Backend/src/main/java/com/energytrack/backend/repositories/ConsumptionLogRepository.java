package com.energytrack.backend.repositories;

import com.energytrack.backend.entities.ConsumptionLog;
import com.energytrack.backend.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsumptionLogRepository extends JpaRepository<ConsumptionLog, Long> {

    // Găsește ultima înregistrare (pentru startup check)
    Optional<ConsumptionLog> findTopByOrderByTimestampDesc();

    // Găsește log-uri între două date pentru un user
    List<ConsumptionLog> findByUserIdAndTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);

    // Găsește log-uri între două date pentru un device (FIX anti-duplicat)
    List<ConsumptionLog> findByDeviceAndTimestampBetween(Device device, LocalDateTime start, LocalDateTime end);

    // Găsește log pentru un device într-o anumită zi
    Optional<ConsumptionLog> findTopByDeviceOrderByTimestampDesc(Device device);

    // Total consumption de la o dată
    @Query("SELECT SUM(c.consumption) FROM ConsumptionLog c " +
            "WHERE c.user.id = :userId AND c.timestamp >= :startDate")
    Double getTotalConsumptionSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    // ========== HISTORY ENDPOINTS ==========

    // Total consum pentru o lună specifică
    @Query("SELECT SUM(c.consumption) FROM ConsumptionLog c " +
            "WHERE c.user.id = :userId AND c.timestamp >= :startDate AND c.timestamp < :endDate")
    Double getTotalConsumptionBetween(@Param("userId") Long userId,
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    // Consum per device pentru o lună specifică
    @Query("SELECT c.device.id, c.device.name, SUM(c.consumption) " +
            "FROM ConsumptionLog c " +
            "WHERE c.user.id = :userId AND c.timestamp >= :startDate AND c.timestamp < :endDate " +
            "GROUP BY c.device.id, c.device.name " +
            "ORDER BY SUM(c.consumption) DESC")
    List<Object[]> getDeviceBreakdownBetween(@Param("userId") Long userId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    // Consum pe zile pentru o lună specifică
    @Query("SELECT CAST(c.timestamp AS date), SUM(c.consumption) " +
            "FROM ConsumptionLog c " +
            "WHERE c.user.id = :userId AND c.timestamp >= :startDate AND c.timestamp < :endDate " +
            "GROUP BY CAST(c.timestamp AS date) " +
            "ORDER BY CAST(c.timestamp AS date)")
    List<Object[]> getDailyConsumptionBetween(@Param("userId") Long userId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    // Găsește toate lunile care au date (pentru selector)
    @Query("SELECT DISTINCT EXTRACT(YEAR FROM c.timestamp), EXTRACT(MONTH FROM c.timestamp) " +
            "FROM ConsumptionLog c " +
            "WHERE c.user.id = :userId " +
            "ORDER BY EXTRACT(YEAR FROM c.timestamp) DESC, EXTRACT(MONTH FROM c.timestamp) DESC")
    List<Object[]> getAvailableMonths(@Param("userId") Long userId);
}