package com.yong.yonghealth.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExerciseCatalogAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_catalog_id", nullable = false)
    private ExerciseCatalog exerciseCatalog;

    @Column(nullable = false)
    private String alias;

    @Builder
    public ExerciseCatalogAlias(ExerciseCatalog exerciseCatalog, String alias) {
        this.exerciseCatalog = exerciseCatalog;
        this.alias = alias;
    }
}
