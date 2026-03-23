package com.yong.yonghealth.service.ports.in;

import com.yong.yonghealth.dto.ExerciseSetRequest;
import com.yong.yonghealth.dto.ExerciseSetResponse;

public interface ExerciseSetUseCase {

    ExerciseSetResponse create(Long exerciseId, ExerciseSetRequest request);

    ExerciseSetResponse update(Long id, ExerciseSetRequest request);

    void delete(Long id);
}
