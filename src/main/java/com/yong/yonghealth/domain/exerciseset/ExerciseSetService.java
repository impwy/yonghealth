package com.yong.yonghealth.domain.exerciseset;

import com.yong.yonghealth.domain.exercise.Exercise;
import com.yong.yonghealth.domain.exercise.ExerciseService;
import com.yong.yonghealth.domain.exerciseset.dto.ExerciseSetRequest;
import com.yong.yonghealth.domain.exerciseset.dto.ExerciseSetResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExerciseSetService {

    private final ExerciseSetRepository exerciseSetRepository;
    private final ExerciseService exerciseService;

    @Transactional
    public ExerciseSetResponse create(Long exerciseId, ExerciseSetRequest request) {
        Exercise exercise = exerciseService.getExercise(exerciseId);

        ExerciseSet exerciseSet = ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(request.getSetNumber())
                .weight(request.getWeight())
                .weightUnit(request.getWeightUnit())
                .reps(request.getReps())
                .build();

        return ExerciseSetResponse.from(exerciseSetRepository.save(exerciseSet));
    }

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
