package com.energytrack.backend.services;

import com.energytrack.backend.entities.Device;
import com.energytrack.backend.entities.User;
import com.energytrack.backend.repositories.DeviceRepository;
import com.energytrack.backend.repositories.PushSubscriptionRepository;
import com.energytrack.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private static final double DEFAULT_MONTHLY_TARGET = 300.0;

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Tracks which notifications have already been sent this month per user
    // Key format: "type_userId" → YearMonth when last sent
    private final Map<String, YearMonth> lastNotificationSent = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 1800000, initialDelay = 60000)
    public void checkConsumptionTargets() {
        List<Long> userIds = pushSubscriptionRepository.findDistinctUserIds();
        if (userIds.isEmpty()) return;

        YearMonth currentMonth = YearMonth.now();
        log.info("Checking consumption targets for {} subscribed users", userIds.size());

        for (Long userId : userIds) {
            try {
                List<Device> devices = deviceRepository.findByUserId(userId);
                double totalKwh = devices.stream().mapToDouble(Device::getTotalConsumption).sum();

                double monthlyTarget = DEFAULT_MONTHLY_TARGET;
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent() && userOpt.get().getMonthlyTarget() != null) {
                    monthlyTarget = userOpt.get().getMonthlyTarget();
                }

                String overKey = "over_" + userId;
                String approachingKey = "approaching_" + userId;

                if (totalKwh > monthlyTarget) {
                    if (!currentMonth.equals(lastNotificationSent.get(overKey))) {
                        notificationService.sendPushNotification(
                                userId,
                                "⚡ Over Energy Target!",
                                String.format("You've used %.1f kWh — %.0f%% of your %.0f kWh monthly target.",
                                        totalKwh, (totalKwh / monthlyTarget) * 100, monthlyTarget),
                                "http://localhost:3000/dashboard"
                        );
                        lastNotificationSent.put(overKey, currentMonth);
                        lastNotificationSent.remove(approachingKey); // reset approaching flag
                    }
                } else if (totalKwh / monthlyTarget > 0.8) {
                    if (!currentMonth.equals(lastNotificationSent.get(approachingKey))) {
                        notificationService.sendPushNotification(
                                userId,
                                "⚠️ Approaching Energy Target",
                                String.format("You've used %.1f kWh (%.0f%% of your %.0f kWh monthly target).",
                                        totalKwh, (totalKwh / monthlyTarget) * 100, monthlyTarget),
                                "http://localhost:3000/dashboard"
                        );
                        lastNotificationSent.put(approachingKey, currentMonth);
                    }
                }
            } catch (Exception e) {
                log.error("Error checking targets for userId={}: {}", userId, e.getMessage());
            }
        }
    }
}
