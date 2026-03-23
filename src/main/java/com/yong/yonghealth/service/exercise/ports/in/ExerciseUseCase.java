package com.yong.yonghealth.service.exercise.ports.in;

import com.yong.yonghealth.domain.exercise.Exercise;
import com.yong.yonghealth.domain.exercise.dto.ExerciseRequest;
import com.yong.yonghealth.domain.exercise.dto.ExerciseResponse;

public interface ExerciseUseCase {

    ExerciseResponse create(Long workoutId, ExerciseRequest request);

    ExerciseResponse update(Long id, ExerciseRequest request);

    void delete(Long id);

    Exercise getExercise(Long id);
}
