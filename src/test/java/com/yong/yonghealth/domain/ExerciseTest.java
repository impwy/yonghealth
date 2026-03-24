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
                .name("벤치프레스")
                .sortOrder(1)
                .build());

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("벤치프레스");
        assertThat(saved.getSortOrder()).isEqualTo(1);
        assertThat(saved.getWorkout().getId()).isEqualTo(workout.getId());
        assertThat(saved.getSets()).isEmpty();
    }

    @Test
    @DisplayName("Exercise 필드를 수정한다")
    void update() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build());

        // when
        exercise.update("스쿼트", 2);

        Exercise found = exerciseRepository.findById(exercise.getId()).orElseThrow();

        // then
        assertThat(found.getName()).isEqualTo("스쿼트");
        assertThat(found.getSortOrder()).isEqualTo(2);
    }

    @Test
    @DisplayName("Workout 삭제 시 Exercise도 Cascade 삭제된다")
    void cascadeDelete() {
        // given
        Workout workout = createWorkout();
        Exercise exercise = Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build();
        workout.getExercises().add(exercise);
        workoutRepository.flush();

        assertThat(exerciseRepository.findAll()).hasSize(1);

        // when
        workoutRepository.delete(workout);
        workoutRepository.flush();

        // then
        assertThat(exerciseRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("BaseTimeEntity의 createdAt이 자동 설정된다")
    void auditFields() {
        // given
        Workout workout = createWorkout();

        // when
        Exercise saved = exerciseRepository.save(Exercise.builder()
                .workout(workout)
                .name("벤치프레스")
                .sortOrder(1)
                .build());

        // then
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
