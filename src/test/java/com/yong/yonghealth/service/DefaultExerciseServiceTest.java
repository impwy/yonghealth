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

    private Workout createWorkout() {
        return workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());
    }

    @Test
    @DisplayName("운동 종목을 생성한다")
    void create() {
        // given
        Workout workout = createWorkout();

        ExerciseRequest request = ExerciseRequest.builder()
                .displayName("벤치프레스")
                .sortOrder(1)
                .build();

        // when
        ExerciseResponse response = exerciseUseCase.create(workout.getId(), request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getDisplayName()).isEqualTo("벤치프레스");
        assertThat(response.getSortOrder()).isEqualTo(1);
        assertThat(response.getExerciseCatalogId()).isNull();
        assertThat(response.getCustomName()).isNull();
        assertThat(response.getNote()).isNull();
        assertThat(exerciseRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("카탈로그 ID와 커스텀명으로 종목을 생성한다")
    void createWithCatalog() {
        // given
        Workout workout = createWorkout();

        ExerciseRequest request = ExerciseRequest.builder()
                .exerciseCatalogId(1L)
                .displayName("벤치프레스")
                .customName("클로즈그립 벤치프레스")
                .sortOrder(1)
                .note("삼두 집중")
                .build();

        // when
        ExerciseResponse response = exerciseUseCase.create(workout.getId(), request);

        // then
        assertThat(response.getExerciseCatalogId()).isEqualTo(1L);
        assertThat(response.getDisplayName()).isEqualTo("벤치프레스");
        assertThat(response.getCustomName()).isEqualTo("클로즈그립 벤치프레스");
        assertThat(response.getNote()).isEqualTo("삼두 집중");
    }

    @Test
    @DisplayName("운동 종목을 수정한다")
    void update() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build());

        ExerciseRequest request = ExerciseRequest.builder()
                .exerciseCatalogId(2L)
                .displayName("스쿼트")
                .customName("프론트 스쿼트")
                .sortOrder(2)
                .note("하체 앞쪽")
                .build();

        // when
        ExerciseResponse response = exerciseUseCase.update(exercise.getId(), request);

        // then
        assertThat(response.getDisplayName()).isEqualTo("스쿼트");
        assertThat(response.getCustomName()).isEqualTo("프론트 스쿼트");
        assertThat(response.getSortOrder()).isEqualTo(2);
        assertThat(response.getExerciseCatalogId()).isEqualTo(2L);
        assertThat(response.getNote()).isEqualTo("하체 앞쪽");
    }

    @Test
    @DisplayName("운동 종목을 삭제한다")
    void delete() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
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
