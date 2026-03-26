package com.yong.yonghealth.controller;

import com.yong.yonghealth.dto.*;
import com.yong.yonghealth.service.ports.in.WorkoutUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutUseCase workoutUseCase;

    @PostMapping
    public ResponseEntity<WorkoutResponse> create(@Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutUseCase.create(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> findAll(
            @RequestParam(required = false) LocalDate date) {
        List<WorkoutResponse> responses = (date != null)
                ? workoutUseCase.findByDate(date)
                : workoutUseCase.findAll();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDetailResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(workoutUseCase.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResponse> update(
            @PathVariable Long id, @Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.ok(workoutUseCase.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workoutUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/calendar")
    public ResponseEntity<WorkoutCalendarSummaryResponse> getCalendarSummary(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(workoutUseCase.getCalendarSummary(year, month));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<WorkoutDateSummaryResponse>> getDateSummary(
            @PathVariable LocalDate date) {
        return ResponseEntity.ok(workoutUseCase.getDateSummary(date));
    }
}
