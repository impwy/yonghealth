package com.yong.yonghealth.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"exercise_id", "set_number"}))
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

    @Version
    private Long version;

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
