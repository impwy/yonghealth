package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.repository.ExerciseRepository;
import com.yong.yonghealth.dto.ExerciseRequest;
import com.yong.yonghealth.dto.ExerciseResponse;
import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.service.ports.in.ExerciseUseCase;
import com.yong.yonghealth.service.ports.in.WorkoutUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultExerciseService implements ExerciseUseCase {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutUseCase workoutUseCase;

    @Override
    @Transactional
    public ExerciseResponse create(Long workoutId, ExerciseRequest request) {
        Workout workout = workoutUseCase.getWorkout(workoutId);

        Exercise exercise = Exercise.builder()
                .workout(workout)
                .exerciseCatalogId(request.getExerciseCatalogId())
                .displayName(request.getDisplayName())
                .customName(request.getCustomName())
                .sortOrder(request.getSortOrder())
                .note(request.getNote())
                .build();

        return ExerciseResponse.from(exerciseRepository.save(exercise));
    }

    @Override
    @Transactional
    public ExerciseResponse update(Long id, ExerciseRequest request) {
        Exercise exercise = getExercise(id);
        exercise.update(
                request.getExerciseCatalogId(),
                request.getDisplayName(),
                request.getCustomName(),
                request.getSortOrder(),
                request.getNote()
        );
        return ExerciseResponse.from(exercise);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Exercise exercise = getExercise(id);
        exerciseRepository.delete(exercise);
    }

    @Override
    public Exercise getExercise(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("운동 종목을 찾을 수 없습니다. id=" + id));
    }
}
