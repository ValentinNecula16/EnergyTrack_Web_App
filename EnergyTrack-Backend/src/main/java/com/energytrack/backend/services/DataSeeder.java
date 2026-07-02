package com.energytrack.backend.services;

import com.energytrack.backend.entities.ConsumptionLog;
import com.energytrack.backend.entities.Device;
import com.energytrack.backend.repositories.ConsumptionLogRepository;
import com.energytrack.backend.repositories.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DeviceRepository deviceRepository;
    private final ConsumptionLogRepository logRepository;


    @Override
    public void run(String... args) throws Exception {
        // ⚠️ NU mai generăm automat date random!
        // Așteptăm ca user-ul să introducă manual 5 zile pentru training AI.

        if (deviceRepository.count() > 0 && logRepository.count() == 0) {
            System.out.println("╔════════════════════════════════════════════════════════════╗");
            System.out.println("║  ℹ️  Device-uri găsite, DAR fără istoric de consum        ║");
            System.out.println("╠════════════════════════════════════════════════════════════╣");
            System.out.println("║  📝 Pentru a activa AI-ul, introduceți manual datele      ║");
            System.out.println("║     pentru ultimele 5 zile via Postman:                   ║");
            System.out.println("║                                                            ║");
            System.out.println("║  1️⃣  POST /api/training/save-manual-data?userId=1        ║");
            System.out.println("║     (Body: JSON cu deviceId, date, hoursUsed)             ║");
            System.out.println("║                                                            ║");
            System.out.println("║  2️⃣  POST /api/training/learn-patterns?userId=1&         ║");
            System.out.println("║            startDate=2026-01-13&endDate=2026-01-17        ║");
            System.out.println("║                                                            ║");
            System.out.println("║  🧠 După învățare, backend-ul va genera automat           ║");
            System.out.println("║     date realiste bazate pe pattern-urile tale!           ║");
            System.out.println("╚════════════════════════════════════════════════════════════╝");
        } else if (logRepository.count() > 0) {
            System.out.println("✅ [Seeder] Istoric de consum deja existent. Totul OK!");
        } else {
            System.out.println("ℹ️ [Seeder] Niciun device găsit. Adaugă device-uri din interfață!");
        }
    }

    // Metoda generateHistory() RĂMÂNE în cod (pentru viitor dacă e nevoie),
    // dar NU mai este apelată automat!

    private void generateHistory() {
        List<Device> devices = deviceRepository.findAll();
        Random random = new Random();
        LocalDate today = LocalDate.now();

        // Generăm date pentru ultimele 30 de zile
        for (int i = 30; i >= 1; i--) {
            LocalDate currentDate = today.minusDays(i);

            for (Device device : devices) {
                double hoursActive;
                String name = device.getName().toLowerCase();

                // Logic pentru diferite tipuri de device-uri
                if (name.contains("fridge") || name.contains("refrigerator")) {
                    hoursActive = 24.0; // Frigiderul merge non-stop
                } else if (name.contains("tv") || name.contains("laptop") || name.contains("pc") || name.contains("monitor")) {
                    hoursActive = 2.0 + random.nextDouble() * 6.0; // 2-8 ore
                } else if (name.contains("washing") || name.contains("dishwasher") || name.contains("iron")) {
                    hoursActive = random.nextDouble() > 0.7 ? 1.5 : 0.0; // Merge doar uneori
                } else if (name.contains("air") || name.contains("ac")) {
                    hoursActive = random.nextDouble() * 5.0; // Aer conditionat
                } else if (name.contains("router") || name.contains("wifi")) {
                    hoursActive = 24.0; // Router non-stop
                } else {
                    hoursActive = random.nextDouble() * 3.0; // Restul
                }

                double kwh = (device.getPowerConsumption() * hoursActive) / 1000.0;

                // Adăugăm la totaluri
                device.setTotalConsumption(device.getTotalConsumption() + kwh);
                device.setCost(device.getTotalConsumption() * 0.80);

                ConsumptionLog log = new ConsumptionLog();
                log.setDevice(device);
                log.setUser(device.getUser());
                log.setConsumption(kwh);
                log.setTimestamp(currentDate.atTime(12, 0));

                logRepository.save(log);
            }
            deviceRepository.saveAll(devices);
        }
    }
}