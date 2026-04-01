package com.yong.yonghealth.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FootballMember extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Integer grade;

    @Builder
    public FootballMember(String name, Integer grade) {
        this.name = name;
        this.grade = grade;
    }

    public void update(String name, Integer grade) {
        this.name = name;
        this.grade = grade;
    }
}
