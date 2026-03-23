package com.yong.yonghealth.domain.workout;

import com.yong.yonghealth.domain.workout.dto.WorkoutDetailResponse;
import com.yong.yonghealth.domain.workout.dto.WorkoutRequest;
import com.yong.yonghealth.domain.workout.dto.WorkoutResponse;
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

    private final WorkoutService workoutService;

    @PostMapping
    public ResponseEntity<WorkoutResponse> create(@Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> findAll(
            @RequestParam(required = false) LocalDate date) {
        List<WorkoutResponse> responses = (date != null)
                ? workoutService.findByDate(date)
                : workoutService.findAll();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDetailResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(workoutService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResponse> update(
            @PathVariable Long id, @Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.ok(workoutService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workoutService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
