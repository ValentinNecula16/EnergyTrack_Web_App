package com.energytrack.backend.controllers;

import com.energytrack.backend.config.VapidConfig;
import com.energytrack.backend.dtos.PushSubscriptionRequest;
import com.energytrack.backend.entities.PushSubscription;
import com.energytrack.backend.repositories.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final VapidConfig vapidConfig;

    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribe(@RequestBody PushSubscriptionRequest request) {
        // Avoid duplicate subscriptions for the same endpoint
        pushSubscriptionRepository.findByUserId(request.getUserId()).stream()
                .filter(s -> s.getEndpoint().equals(request.getEndpoint()))
                .findFirst()
                .ifPresent(pushSubscriptionRepository::delete);

        PushSubscription sub = new PushSubscription();
        sub.setUserId(request.getUserId());
        sub.setEndpoint(request.getEndpoint());
        sub.setP256dh(request.getP256dh());
        sub.setAuth(request.getAuth());
        pushSubscriptionRepository.save(sub);

        return ResponseEntity.ok("Subscribed successfully");
    }

    @DeleteMapping("/unsubscribe/{userId}")
    public ResponseEntity<String> unsubscribe(@PathVariable Long userId) {
        pushSubscriptionRepository.deleteByUserId(userId);
        return ResponseEntity.ok("Unsubscribed successfully");
    }

    @GetMapping("/vapid-public-key")
    public ResponseEntity<String> getVapidPublicKey() {
        return ResponseEntity.ok(vapidConfig.getResolvedPublicKey());
    }
}
