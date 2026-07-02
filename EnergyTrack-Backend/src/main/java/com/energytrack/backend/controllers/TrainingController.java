package com.energytrack.backend.controllers;

import com.energytrack.backend.dtos.ManualConsumptionDTO;
import com.energytrack.backend.services.PatternLearningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "*")
public class TrainingController {

    private final PatternLearningService patternLearningService;

    public TrainingController(PatternLearningService patternLearningService) {
        this.patternLearningService = patternLearningService;
    }

    @PostMapping("/save-manual-data")
    public ResponseEntity<String> saveManualData(
            @RequestParam Long userId,
            @RequestBody List<ManualConsumptionDTO> manualData) {

        patternLearningService.saveManualTrainingData(userId, manualData);
        return ResponseEntity.ok("✅ Date salvate cu succes!");
    }

    @PostMapping("/learn-patterns")
    public ResponseEntity<String> learnPatterns(
            @RequestParam Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        patternLearningService.learnPatternsFromManualData(userId, start, end);
        return ResponseEntity.ok("🧠 Pattern-uri învățate cu succes!");
    }
}