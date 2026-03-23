package com.yong.yonghealth.service.exerciseset.ports.in;

import com.yong.yonghealth.domain.exerciseset.dto.ExerciseSetRequest;
import com.yong.yonghealth.domain.exerciseset.dto.ExerciseSetResponse;

public interface ExerciseSetUseCase {

    ExerciseSetResponse create(Long exerciseId, ExerciseSetRequest request);

    ExerciseSetResponse update(Long id, ExerciseSetRequest request);

    void delete(Long id);
}
