package com.yong.yonghealth.service.ports.in;

import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.dto.ExerciseRequest;
import com.yong.yonghealth.dto.ExerciseResponse;

public interface ExerciseUseCase {

    ExerciseResponse create(Long workoutId, ExerciseRequest request);

    ExerciseResponse update(Long id, ExerciseRequest request);

    void delete(Long id);

    Exercise getExercise(Long id);
}
