package com.yong.yonghealth.service.exercise;

import com.yong.yonghealth.domain.exercise.Exercise;
import com.yong.yonghealth.domain.exercise.ExerciseRepository;
import com.yong.yonghealth.domain.exercise.dto.ExerciseRequest;
import com.yong.yonghealth.domain.exercise.dto.ExerciseResponse;
import com.yong.yonghealth.domain.workout.Workout;
import com.yong.yonghealth.service.workout.ports.in.WorkoutUseCase;
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
class DefaultExerciseServiceTest {

    @Mock
    ExerciseRepository exerciseRepository;

    @Mock
    WorkoutUseCase workoutUseCase;

    @InjectMocks
    DefaultExerciseService exerciseService;

    @Test
    @DisplayName("운동 종목을 생성한다")
    void create() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutUseCase.getWorkout(1L)).willReturn(workout);

        ExerciseRequest request = ExerciseRequest.builder()
                .name("벤치프레스")
                .sortOrder(1)
                .build();

        Exercise saved = Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build();

        given(exerciseRepository.save(any(Exercise.class))).willReturn(saved);

        // when
        ExerciseResponse response = exerciseService.create(1L, request);

        // then
        assertThat(response.getName()).isEqualTo("벤치프레스");
        assertThat(response.getSortOrder()).isEqualTo(1);
    }

    @Test
    @DisplayName("운동 종목을 수정한다")
    void update() {
        // given
        Exercise exercise = Exercise.builder()
                .workout(Workout.builder().workoutDate(LocalDate.now()).startTime(LocalTime.of(9, 0)).build())
                .name("벤치프레스")
                .sortOrder(1)
                .build();

        given(exerciseRepository.findById(1L)).willReturn(Optional.of(exercise));

        ExerciseRequest request = ExerciseRequest.builder()
                .name("스쿼트")
                .sortOrder(2)
                .build();

        // when
        ExerciseResponse response = exerciseService.update(1L, request);

        // then
        assertThat(response.getName()).isEqualTo("스쿼트");
        assertThat(response.getSortOrder()).isEqualTo(2);
    }

    @Test
    @DisplayName("운동 종목을 삭제한다")
    void delete() {
        // given
        Exercise exercise = Exercise.builder()
                .workout(Workout.builder().workoutDate(LocalDate.now()).startTime(LocalTime.of(9, 0)).build())
                .name("벤치프레스")
                .sortOrder(1)
                .build();

        given(exerciseRepository.findById(1L)).willReturn(Optional.of(exercise));

        // when
        exerciseService.delete(1L);

        // then
        then(exerciseRepository).should().delete(exercise);
    }

    @Test
    @DisplayName("존재하지 않는 종목 조회 시 예외가 발생한다")
    void getExercise_notFound() {
        // given
        given(exerciseRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> exerciseService.getExercise(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }
}
