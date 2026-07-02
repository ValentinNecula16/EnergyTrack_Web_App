package com.energytrack.backend.services;

import com.energytrack.backend.entities.PushSubscription;
import com.energytrack.backend.repositories.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final PushService pushService;

    public void sendPushNotification(Long userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserId(userId);

        for (PushSubscription sub : subscriptions) {
            try {
                byte[] payload = buildPayload(title, body, url);
                Notification notification = new Notification(sub.getEndpoint(), sub.getP256dh(), sub.getAuth(), payload);
                HttpResponse response = pushService.send(notification);

                int status = response.getStatusLine().getStatusCode();
                if (status == 410) {
                    pushSubscriptionRepository.delete(sub);
                    log.info("Deleted expired subscription for userId={}", userId);
                }
            } catch (Exception e) {
                log.error("Failed to send push notification to userId={}: {}", userId, e.getMessage());
            }
        }
    }

    private byte[] buildPayload(String title, String body, String url) {
        String json = String.format(
                "{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}",
                title.replace("\"", "\\\""),
                body.replace("\"", "\\\""),
                url
        );
        return json.getBytes();
    }
}
