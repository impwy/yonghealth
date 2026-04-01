package com.yong.yonghealth.domain;

import org.junit.jupiter.api.Test;

import static com.yong.yonghealth.support.TestFixtures.exercise;
import static com.yong.yonghealth.support.TestFixtures.exerciseSet;
import static com.yong.yonghealth.support.TestFixtures.workout;
import static org.assertj.core.api.Assertions.assertThat;

class ExerciseDomainTest {

    @Test
    void update_changesExerciseFields() {
        Exercise exercise = exercise(workout(), "벤치프레스", 1);

        exercise.update(2L, "인클라인 벤치프레스", "상체 메인", 3, "중량 증가");

        assertThat(exercise.getExerciseCatalogId()).isEqualTo(2L);
        assertThat(exercise.getDisplayName()).isEqualTo("인클라인 벤치프레스");
        assertThat(exercise.getCustomName()).isEqualTo("상체 메인");
        assertThat(exercise.getSortOrder()).isEqualTo(3);
        assertThat(exercise.getNote()).isEqualTo("중량 증가");
    }

    @Test
    void addSet_addsSetToCollection() {
        Exercise exercise = exercise(workout(), "스쿼트", 1);
        ExerciseSet first = exerciseSet(exercise, 1);
        ExerciseSet second = exerciseSet(exercise, 2);

        assertThat(exercise.getSets()).containsExactly(first, second);
    }
}
