package com.yong.yonghealth.domain.exerciseset;

import com.yong.yonghealth.domain.exercise.Exercise;
import com.yong.yonghealth.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExerciseSet extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private Integer setNumber;

    @Column(nullable = false)
    private Double weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeightUnit weightUnit;

    @Column(nullable = false)
    private Integer reps;

    @Builder
    public ExerciseSet(Exercise exercise, Integer setNumber, Double weight, WeightUnit weightUnit, Integer reps) {
        this.exercise = exercise;
        this.setNumber = setNumber;
        this.weight = weight;
        this.weightUnit = weightUnit;
        this.reps = reps;
    }

    public void update(Integer setNumber, Double weight, WeightUnit weightUnit, Integer reps) {
        this.setNumber = setNumber;
        this.weight = weight;
        this.weightUnit = weightUnit;
        this.reps = reps;
    }
}
