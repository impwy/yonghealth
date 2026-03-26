package com.yong.yonghealth.domain;

import com.yong.yonghealth.repository.ExerciseRepository;
import com.yong.yonghealth.repository.WorkoutRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ExerciseTest {

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
    @DisplayName("Builder로 Exercise를 생성한다")
    void create() {
        // given
        Workout workout = createWorkout();

        // when
        Exercise saved = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build());

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getDisplayName()).isEqualTo("벤치프레스");
        assertThat(saved.getSortOrder()).isEqualTo(1);
        assertThat(saved.getWorkout().getId()).isEqualTo(workout.getId());
        assertThat(saved.getSets()).isEmpty();
        assertThat(saved.getExerciseCatalogId()).isNull();
        assertThat(saved.getCustomName()).isNull();
        assertThat(saved.getNote()).isNull();
    }

    @Test
    @DisplayName("exerciseCatalogId, customName, note를 포함하여 생성한다")
    void createWithAllFields() {
        // given
        Workout workout = createWorkout();

        // when
        Exercise saved = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .exerciseCatalogId(1L)
                .displayName("벤치프레스")
                .customName("내로우 벤치프레스")
                .sortOrder(1)
                .note("가슴 하부 집중")
                .build());

        // then
        assertThat(saved.getExerciseCatalogId()).isEqualTo(1L);
        assertThat(saved.getDisplayName()).isEqualTo("벤치프레스");
        assertThat(saved.getCustomName()).isEqualTo("내로우 벤치프레스");
        assertThat(saved.getNote()).isEqualTo("가슴 하부 집중");
    }

    @Test
    @DisplayName("Exercise 필드를 수정한다")
    void update() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build());

        // when
        exercise.update(2L, "스쿼트", "프론트 스쿼트", 2, "하체 앞쪽");

        Exercise found = exerciseRepository.findById(exercise.getId()).orElseThrow();

        // then
        assertThat(found.getExerciseCatalogId()).isEqualTo(2L);
        assertThat(found.getDisplayName()).isEqualTo("스쿼트");
        assertThat(found.getCustomName()).isEqualTo("프론트 스쿼트");
        assertThat(found.getSortOrder()).isEqualTo(2);
        assertThat(found.getNote()).isEqualTo("하체 앞쪽");
    }

    @Test
    @DisplayName("Workout 삭제 시 Exercise도 Cascade 삭제된다")
    void cascadeDelete() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build();
        workout.addExercise(exercise);
        workoutRepository.flush();

        assertThat(exerciseRepository.findAll()).hasSize(1);

        // when
        workoutRepository.delete(workout);
        workoutRepository.flush();

        // then
        assertThat(exerciseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("addSet으로 양방향 연관관계를 설정한다")
    void addSet() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build());

        ExerciseSet set = ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        // when
        exercise.addSet(set);
        exerciseRepository.flush();

        // then
        Exercise found = exerciseRepository.findById(exercise.getId()).orElseThrow();
        assertThat(found.getSets()).hasSize(1);
        assertThat(found.getSets().get(0).getWeight()).isEqualTo(60.0);
    }

    @Test
    @DisplayName("BaseTimeEntity의 createdAt이 자동 설정된다")
    void auditFields() {
        // given
        Workout workout = createWorkout();

        // when
        Exercise saved = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .displayName("벤치프레스")
                .sortOrder(1)
                .build());

        // then
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
