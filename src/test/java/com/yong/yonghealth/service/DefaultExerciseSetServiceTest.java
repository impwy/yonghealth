package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.domain.ExerciseSet;
import com.yong.yonghealth.domain.WeightUnit;
import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.repository.ExerciseRepository;
import com.yong.yonghealth.repository.ExerciseSetRepository;
import com.yong.yonghealth.repository.WorkoutRepository;
import com.yong.yonghealth.dto.ExerciseSetRequest;
import com.yong.yonghealth.dto.ExerciseSetResponse;
import com.yong.yonghealth.service.ports.in.ExerciseSetUseCase;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DefaultExerciseSetServiceTest {

    @Autowired
    ExerciseSetUseCase exerciseSetUseCase;

    @Autowired
    ExerciseSetRepository exerciseSetRepository;

    @Autowired
    ExerciseRepository exerciseRepository;

    @Autowired
    WorkoutRepository workoutRepository;

    private Exercise createExerciseWithWorkout() {
        Workout workout = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());
        return exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build());
    }

    @Test
    @DisplayName("세트를 생성한다")
    void create() {
        // given
        Exercise exercise = createExerciseWithWorkout();

        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        // when
        ExerciseSetResponse response = exerciseSetUseCase.create(exercise.getId(), request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getSetNumber()).isEqualTo(1);
        assertThat(response.getWeight()).isEqualTo(60.0);
        assertThat(response.getWeightUnit()).isEqualTo(WeightUnit.KG);
        assertThat(response.getReps()).isEqualTo(10);
        assertThat(exerciseSetRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("세트를 수정한다")
    void update() {
        // given
        Exercise exercise = createExerciseWithWorkout();
        ExerciseSet saved = exerciseSetRepository.save(ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build());

        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(80.0)
                .weightUnit(WeightUnit.KG)
                .reps(8)
                .build();

        // when
        ExerciseSetResponse response = exerciseSetUseCase.update(saved.getId(), request);

        // then
        assertThat(response.getWeight()).isEqualTo(80.0);
        assertThat(response.getReps()).isEqualTo(8);
    }

    @Test
    @DisplayName("세트를 삭제한다")
    void delete() {
        // given
        Exercise exercise = createExerciseWithWorkout();
        ExerciseSet saved = exerciseSetRepository.save(ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build());

        // when
        exerciseSetUseCase.delete(saved.getId());

        // then
        assertThat(exerciseSetRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 세트 수정 시 예외가 발생한다")
    void update_notFound() {
        // given
        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        // when & then
        assertThatThrownBy(() -> exerciseSetUseCase.update(999L, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }
}
