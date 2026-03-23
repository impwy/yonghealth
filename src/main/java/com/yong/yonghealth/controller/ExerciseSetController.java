package com.yong.yonghealth.controller;

import com.yong.yonghealth.domain.exerciseset.WeightUnit;
import com.yong.yonghealth.domain.exerciseset.dto.ExerciseSetRequest;
import com.yong.yonghealth.domain.exerciseset.dto.ExerciseSetResponse;
import com.yong.yonghealth.global.util.WeightConverter;
import com.yong.yonghealth.service.exerciseset.ports.in.ExerciseSetUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ExerciseSetController {

    private final ExerciseSetUseCase exerciseSetUseCase;

    @PostMapping("/api/exercises/{exerciseId}/sets")
    public ResponseEntity<ExerciseSetResponse> create(
            @PathVariable Long exerciseId, @Valid @RequestBody ExerciseSetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exerciseSetUseCase.create(exerciseId, request));
    }

    @PutMapping("/api/sets/{id}")
    public ResponseEntity<ExerciseSetResponse> update(
            @PathVariable Long id, @Valid @RequestBody ExerciseSetRequest request) {
        return ResponseEntity.ok(exerciseSetUseCase.update(id, request));
    }

    @DeleteMapping("/api/sets/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exerciseSetUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/convert")
    public ResponseEntity<Map<String, Object>> convert(
            @RequestParam double value,
            @RequestParam WeightUnit from,
            @RequestParam WeightUnit to) {
        double result = WeightConverter.convert(value, from, to);
        return ResponseEntity.ok(Map.of(
                "from", from,
                "to", to,
                "originalValue", value,
                "convertedValue", result
        ));
    }
}
