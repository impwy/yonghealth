package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.domain.ExerciseSet;
import com.yong.yonghealth.repository.ExerciseSetRepository;
import com.yong.yonghealth.dto.ExerciseSetRequest;
import com.yong.yonghealth.dto.ExerciseSetResponse;
import com.yong.yonghealth.service.ports.in.ExerciseUseCase;
import com.yong.yonghealth.service.ports.in.ExerciseSetUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultExerciseSetService implements ExerciseSetUseCase {

    private final ExerciseSetRepository exerciseSetRepository;
    private final ExerciseUseCase exerciseUseCase;

    @Override
    @Transactional
    public ExerciseSetResponse create(Long exerciseId, ExerciseSetRequest request) {
        Exercise exercise = exerciseUseCase.getExercise(exerciseId);

        ExerciseSet exerciseSet = ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(request.getSetNumber())
                .weight(request.getWeight())
                .weightUnit(request.getWeightUnit())
                .reps(request.getReps())
                .build();

        return ExerciseSetResponse.from(exerciseSetRepository.save(exerciseSet));
    }

    @Override
    @Transactional
    public ExerciseSetResponse update(Long id, ExerciseSetRequest request) {
        ExerciseSet exerciseSet = getExerciseSet(id);
        exerciseSet.update(
                request.getSetNumber(),
                request.getWeight(),
                request.getWeightUnit(),
                request.getReps()
        );
        return ExerciseSetResponse.from(exerciseSet);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ExerciseSet exerciseSet = getExerciseSet(id);
        exerciseSetRepository.delete(exerciseSet);
    }

    private ExerciseSet getExerciseSet(Long id) {
        return exerciseSetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("세트를 찾을 수 없습니다. id=" + id));
    }
}
