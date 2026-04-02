package com.yong.yonghealth.domain;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static com.yong.yonghealth.support.TestFixtures.exercise;
import static com.yong.yonghealth.support.TestFixtures.exerciseSet;
import static com.yong.yonghealth.support.TestFixtures.workout;
import static org.assertj.core.api.Assertions.assertThat;

class WorkoutDomainTest {

    @Test
    void update_changesWorkoutFields() {
        Workout workout = workout();

        workout.update(
                LocalDate.of(2026, 4, 3),
                LocalTime.of(7, 30),
                LocalTime.of(8, 15),
                "수정된 메모"
        );

        assertThat(workout.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 4, 3));
        assertThat(workout.getStartTime()).isEqualTo(LocalTime.of(7, 30));
        assertThat(workout.getEndTime()).isEqualTo(LocalTime.of(8, 15));
        assertThat(workout.getMemo()).isEqualTo("수정된 메모");
    }

    @Test
    void getTotalSetCount_returnsAggregatedSetCount() {
        Workout workout = workout();
        Exercise bench = exercise(workout, "벤치프레스", 1);
        Exercise squat = exercise(workout, "스쿼트", 2);
        exerciseSet(bench, 1);
        exerciseSet(bench, 2);
        exerciseSet(squat, 1);

        assertThat(workout.getTotalSetCount()).isEqualTo(3);
    }
}
