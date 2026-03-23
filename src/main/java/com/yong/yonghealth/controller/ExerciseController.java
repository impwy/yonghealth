package com.yong.yonghealth.controller;

import com.yong.yonghealth.domain.exercise.dto.ExerciseRequest;
import com.yong.yonghealth.domain.exercise.dto.ExerciseResponse;
import com.yong.yonghealth.service.exercise.ports.in.ExerciseUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseUseCase exerciseUseCase;

    @PostMapping("/api/workouts/{workoutId}/exercises")
    public ResponseEntity<ExerciseResponse> create(
            @PathVariable Long workoutId, @Valid @RequestBody ExerciseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exerciseUseCase.create(workoutId, request));
    }

    @PutMapping("/api/exercises/{id}")
    public ResponseEntity<ExerciseResponse> update(
            @PathVariable Long id, @Valid @RequestBody ExerciseRequest request) {
        return ResponseEntity.ok(exerciseUseCase.update(id, request));
    }

    @DeleteMapping("/api/exercises/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exerciseUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
