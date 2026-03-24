package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.repository.ExerciseRepository;
import com.yong.yonghealth.repository.WorkoutRepository;
import com.yong.yonghealth.dto.ExerciseRequest;
import com.yong.yonghealth.dto.ExerciseResponse;
import com.yong.yonghealth.service.ports.in.ExerciseUseCase;
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
class DefaultExerciseServiceTest {

    @Autowired
    ExerciseUseCase exerciseUseCase;

    @Autowired
    ExerciseRepository exerciseRepository;

    @Autowired
    WorkoutRepository workoutRepository;

    @Test
    @DisplayName("운동 종목을 생성한다")
    void create() {
        // given
        Workout workout = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        ExerciseRequest request = ExerciseRequest.builder()
                .name("벤치프레스")
                .sortOrder(1)
                .build();

        // when
        ExerciseResponse response = exerciseUseCase.create(workout.getId(), request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getName()).isEqualTo("벤치프레스");
        assertThat(response.getSortOrder()).isEqualTo(1);
        assertThat(exerciseRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("운동 종목을 수정한다")
    void update() {
        // given
        Workout workout = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build());

        ExerciseRequest request = ExerciseRequest.builder()
                .name("스쿼트")
                .sortOrder(2)
                .build();

        // when
        ExerciseResponse response = exerciseUseCase.update(exercise.getId(), request);

        // then
        assertThat(response.getName()).isEqualTo("스쿼트");
        assertThat(response.getSortOrder()).isEqualTo(2);
    }

    @Test
    @DisplayName("운동 종목을 삭제한다")
    void delete() {
        // given
        Workout workout = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build());

        // when
        exerciseUseCase.delete(exercise.getId());

        // then
        assertThat(exerciseRepository.findById(exercise.getId())).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 종목 조회 시 예외가 발생한다")
    void getExercise_notFound() {
        // when & then
        assertThatThrownBy(() -> exerciseUseCase.getExercise(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }
}
