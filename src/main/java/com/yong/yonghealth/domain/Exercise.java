package com.yong.yonghealth.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Exercise extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    private Long exerciseCatalogId;

    @Column(nullable = false)
    private String displayName;

    private String customName;

    @Column(nullable = false)
    private Integer sortOrder;

    private String note;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseSet> sets = new ArrayList<>();

    @Builder
    public Exercise(Workout workout, Long exerciseCatalogId, String displayName, String customName, Integer sortOrder, String note) {
        this.workout = workout;
        this.exerciseCatalogId = exerciseCatalogId;
        this.displayName = displayName;
        this.customName = customName;
        this.sortOrder = sortOrder;
        this.note = note;
    }

    public void update(Long exerciseCatalogId, String displayName, String customName, Integer sortOrder, String note) {
        this.exerciseCatalogId = exerciseCatalogId;
        this.displayName = displayName;
        this.customName = customName;
        this.sortOrder = sortOrder;
        this.note = note;
    }

    public void addSet(ExerciseSet set) {
        sets.add(set);
    }

    public void removeSet(ExerciseSet set) {
        sets.remove(set);
    }
}
