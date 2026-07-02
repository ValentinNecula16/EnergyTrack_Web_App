package com.energytrack.backend.config;

import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.security.*;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.util.Arrays;
import java.util.Base64;

@Configuration
public class VapidConfig {

    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @Value("${vapid.public.key:TO_BE_GENERATED}")
    private String configuredPublicKey;

    @Value("${vapid.private.key:TO_BE_GENERATED}")
    private String configuredPrivateKey;

    private String resolvedPublicKey;
    private String resolvedPrivateKey;

    @PostConstruct
    public void init() throws Exception {
        if ("TO_BE_GENERATED".equals(configuredPublicKey) || "TO_BE_GENERATED".equals(configuredPrivateKey)) {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("EC", "BC");
            keyGen.initialize(new ECGenParameterSpec("secp256r1"));
            KeyPair keyPair = keyGen.generateKeyPair();

            org.bouncycastle.jce.interfaces.ECPublicKey pub =
                    (org.bouncycastle.jce.interfaces.ECPublicKey) keyPair.getPublic();
            byte[] pubBytes = pub.getQ().getEncoded(false);
            resolvedPublicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(pubBytes);

            org.bouncycastle.jce.interfaces.ECPrivateKey priv =
                    (org.bouncycastle.jce.interfaces.ECPrivateKey) keyPair.getPrivate();
            byte[] privBytes = priv.getD().toByteArray();
            if (privBytes.length > 32) {
                privBytes = Arrays.copyOfRange(privBytes, privBytes.length - 32, privBytes.length);
            }
            resolvedPrivateKey = Base64.getUrlEncoder().withoutPadding().encodeToString(privBytes);

            System.out.println("\n=== VAPID KEYS GENERATED — paste into application.properties ===");
            System.out.println("vapid.public.key=" + resolvedPublicKey);
            System.out.println("vapid.private.key=" + resolvedPrivateKey);
            System.out.println("================================================================\n");
        } else {
            resolvedPublicKey = configuredPublicKey;
            resolvedPrivateKey = configuredPrivateKey;
        }
    }

    @Bean
    public PushService pushService() throws Exception {
        ECPublicKey pubKey = (ECPublicKey) Utils.loadPublicKey(resolvedPublicKey);
        ECPrivateKey privKey = (ECPrivateKey) Utils.loadPrivateKey(resolvedPrivateKey);

        PushService service = new PushService();
        service.setPublicKey(pubKey);
        service.setPrivateKey(privKey);
        service.setSubject("mailto:energytrack@app.com");
        return service;
    }

    public String getResolvedPublicKey() {
        return resolvedPublicKey;
    }
}
