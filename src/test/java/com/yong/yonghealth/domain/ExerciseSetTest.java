package com.yong.yonghealth.domain;

import com.yong.yonghealth.repository.ExerciseRepository;
import com.yong.yonghealth.repository.ExerciseSetRepository;
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
class ExerciseSetTest {

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
                .name("벤치프레스")
                .sortOrder(1)
                .build());
    }

    @Test
    @DisplayName("Builder로 ExerciseSet을 생성한다")
    void create() {
        // given
        Exercise exercise = createExerciseWithWorkout();

        // when
        ExerciseSet saved = exerciseSetRepository.save(ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build());

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSetNumber()).isEqualTo(1);
        assertThat(saved.getWeight()).isEqualTo(60.0);
        assertThat(saved.getWeightUnit()).isEqualTo(WeightUnit.KG);
        assertThat(saved.getReps()).isEqualTo(10);
        assertThat(saved.getExercise().getId()).isEqualTo(exercise.getId());
    }

    @Test
    @DisplayName("ExerciseSet 필드를 수정한다")
    void update() {
        // given
        Exercise exercise = createExerciseWithWorkout();
        ExerciseSet exerciseSet = exerciseSetRepository.save(ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build());

        // when
        exerciseSet.update(2, 80.0, WeightUnit.KG, 8);

        ExerciseSet found = exerciseSetRepository.findById(exerciseSet.getId()).orElseThrow();

        // then
        assertThat(found.getSetNumber()).isEqualTo(2);
        assertThat(found.getWeight()).isEqualTo(80.0);
        assertThat(found.getReps()).isEqualTo(8);
    }

    @Test
    @DisplayName("단위를 KG에서 LB로 변경한다")
    void update_weightUnit() {
        // given
        Exercise exercise = createExerciseWithWorkout();
        ExerciseSet exerciseSet = exerciseSetRepository.save(ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build());

        // when
        exerciseSet.update(1, 132.28, WeightUnit.LB, 10);

        ExerciseSet found = exerciseSetRepository.findById(exerciseSet.getId()).orElseThrow();

        // then
        assertThat(found.getWeightUnit()).isEqualTo(WeightUnit.LB);
        assertThat(found.getWeight()).isEqualTo(132.28);
    }

    @Test
    @DisplayName("Exercise 삭제 시 ExerciseSet도 Cascade 삭제된다")
    void cascadeDelete() {
        // given
        Exercise exercise = createExerciseWithWorkout();
        ExerciseSet set = ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();
        exercise.getSets().add(set);
        exerciseRepository.flush();

        assertThat(exerciseSetRepository.findAll()).hasSize(1);

        // when
        exerciseRepository.delete(exercise);
        exerciseRepository.flush();

        // then
        assertThat(exerciseSetRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("BaseTimeEntity의 createdAt이 자동 설정된다")
    void auditFields() {
        // given
        Exercise exercise = createExerciseWithWorkout();

        // when
        ExerciseSet saved = exerciseSetRepository.save(ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build());

        // then
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
