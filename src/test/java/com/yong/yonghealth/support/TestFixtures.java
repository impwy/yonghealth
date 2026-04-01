package com.yong.yonghealth.support;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.domain.Equipment;
import com.yong.yonghealth.domain.Exercise;
import com.yong.yonghealth.domain.ExerciseCatalog;
import com.yong.yonghealth.domain.ExerciseCatalogAlias;
import com.yong.yonghealth.domain.ExerciseSet;
import com.yong.yonghealth.domain.FootballMember;
import com.yong.yonghealth.domain.MovementType;
import com.yong.yonghealth.domain.WeightUnit;
import com.yong.yonghealth.domain.Workout;

import java.time.LocalDate;
import java.time.LocalTime;

public final class TestFixtures {

    private TestFixtures() {
    }

    public static Workout workout() {
        return workout(LocalDate.of(2026, 4, 2), LocalTime.of(9, 0), LocalTime.of(10, 0), "기본 운동");
    }

    public static Workout workout(LocalDate workoutDate, LocalTime startTime, LocalTime endTime, String memo) {
        return Workout.builder()
                .workoutDate(workoutDate)
                .startTime(startTime)
                .endTime(endTime)
                .memo(memo)
                .build();
    }

    public static Exercise exercise(Workout workout) {
        return exercise(workout, "벤치프레스", 1);
    }

    public static Exercise exercise(Workout workout, String displayName, int sortOrder) {
        Exercise exercise = Exercise.builder()
                .workout(workout)
                .exerciseCatalogId(1L)
                .displayName(displayName)
                .customName(null)
                .sortOrder(sortOrder)
                .note("노트")
                .build();
        workout.addExercise(exercise);
        return exercise;
    }

    public static ExerciseSet exerciseSet(Exercise exercise, int setNumber) {
        return exerciseSet(exercise, setNumber, 100.0, WeightUnit.KG, 5);
    }

    public static ExerciseSet exerciseSet(Exercise exercise, int setNumber, double weight, WeightUnit unit, int reps) {
        ExerciseSet exerciseSet = ExerciseSet.builder()
                .exercise(exercise)
                .setNumber(setNumber)
                .weight(weight)
                .weightUnit(unit)
                .reps(reps)
                .build();
        exercise.addSet(exerciseSet);
        return exerciseSet;
    }

    public static ExerciseCatalog exerciseCatalog(String name, BodyPart category, boolean active, String... aliases) {
        ExerciseCatalog catalog = ExerciseCatalog.builder()
                .name(name)
                .category(category)
                .equipment(Equipment.BARBELL)
                .movementType(MovementType.PUSH)
                .active(active)
                .build();

        for (String alias : aliases) {
            catalog.addAlias(ExerciseCatalogAlias.builder()
                    .exerciseCatalog(catalog)
                    .alias(alias)
                    .build());
        }
        return catalog;
    }

    public static FootballMember footballMember(String name, int grade) {
        return FootballMember.builder()
                .name(name)
                .grade(grade)
                .build();
    }
}
