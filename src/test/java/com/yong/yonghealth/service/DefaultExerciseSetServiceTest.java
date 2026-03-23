package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.domain.ExerciseSet;
import com.yong.yonghealth.repository.ExerciseSetRepository;
import com.yong.yonghealth.domain.WeightUnit;
import com.yong.yonghealth.dto.ExerciseSetRequest;
import com.yong.yonghealth.dto.ExerciseSetResponse;
import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.service.ports.in.ExerciseUseCase;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class DefaultExerciseSetServiceTest {

    @Mock
    ExerciseSetRepository exerciseSetRepository;

    @Mock
    ExerciseUseCase exerciseUseCase;

    @InjectMocks
    DefaultExerciseSetService exerciseSetService;

    @Test
    @DisplayName("세트를 생성한다")
    void create() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();
        Exercise exercise = Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build();

        given(exerciseUseCase.getExercise(1L)).willReturn(exercise);

        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        ExerciseSet saved = ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        given(exerciseSetRepository.save(any(ExerciseSet.class))).willReturn(saved);

        // when
        ExerciseSetResponse response = exerciseSetService.create(1L, request);

        // then
        assertThat(response.getSetNumber()).isEqualTo(1);
        assertThat(response.getWeight()).isEqualTo(60.0);
        assertThat(response.getWeightUnit()).isEqualTo(WeightUnit.KG);
        assertThat(response.getReps()).isEqualTo(10);
    }

    @Test
    @DisplayName("세트를 수정한다")
    void update() {
        // given
        ExerciseSet exerciseSet = ExerciseSet.builder()
                .exercise(Exercise.builder()
                        .workout(Workout.builder().workoutDate(LocalDate.now()).startTime(LocalTime.of(9, 0)).build())
                        .name("벤치프레스").sortOrder(1).build())
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        given(exerciseSetRepository.findById(1L)).willReturn(Optional.of(exerciseSet));

        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(80.0)
                .weightUnit(WeightUnit.KG)
                .reps(8)
                .build();

        // when
        ExerciseSetResponse response = exerciseSetService.update(1L, request);

        // then
        assertThat(response.getWeight()).isEqualTo(80.0);
        assertThat(response.getReps()).isEqualTo(8);
    }

    @Test
    @DisplayName("세트를 삭제한다")
    void delete() {
        // given
        ExerciseSet exerciseSet = ExerciseSet.builder()
                .exercise(Exercise.builder()
                        .workout(Workout.builder().workoutDate(LocalDate.now()).startTime(LocalTime.of(9, 0)).build())
                        .name("벤치프레스").sortOrder(1).build())
                .setNumber(1).weight(60.0).weightUnit(WeightUnit.KG).reps(10).build();

        given(exerciseSetRepository.findById(1L)).willReturn(Optional.of(exerciseSet));

        // when
        exerciseSetService.delete(1L);

        // then
        then(exerciseSetRepository).should().delete(exerciseSet);
    }

    @Test
    @DisplayName("존재하지 않는 세트 수정 시 예외가 발생한다")
    void update_notFound() {
        // given
        given(exerciseSetRepository.findById(999L)).willReturn(Optional.empty());

        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1).weight(60.0).weightUnit(WeightUnit.KG).reps(10).build();

        // when & then
        assertThatThrownBy(() -> exerciseSetService.update(999L, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }
}
