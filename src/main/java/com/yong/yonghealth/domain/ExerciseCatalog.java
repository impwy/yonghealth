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
public class ExerciseCatalog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BodyPart category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "exerciseCatalog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseCatalogAlias> aliases = new ArrayList<>();

    @Builder
    public ExerciseCatalog(String name, BodyPart category, Equipment equipment, MovementType movementType, boolean active) {
        this.name = name;
        this.category = category;
        this.equipment = equipment;
        this.movementType = movementType;
        this.active = active;
    }

    public void addAlias(ExerciseCatalogAlias alias) {
        aliases.add(alias);
    }
}
