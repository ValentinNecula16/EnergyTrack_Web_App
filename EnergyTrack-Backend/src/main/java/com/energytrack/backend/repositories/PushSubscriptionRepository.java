package com.energytrack.backend.repositories;

import com.energytrack.backend.entities.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByUserId(Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM PushSubscription ps WHERE ps.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT ps.userId FROM PushSubscription ps")
    List<Long> findDistinctUserIds();
}