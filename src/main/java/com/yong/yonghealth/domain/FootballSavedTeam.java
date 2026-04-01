package com.yong.yonghealth.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FootballSavedTeam extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer teamCount;

    @OneToMany(mappedBy = "savedTeam", cascade = CascadeType.ALL, orphanRemoval = true)
    @jakarta.persistence.OrderBy("teamNumber ASC, sortOrder ASC")
    private final List<FootballSavedTeamMember> memberSnapshots = new ArrayList<>();

    @Builder
    public FootballSavedTeam(String name, Integer teamCount) {
        this.name = name;
        this.teamCount = teamCount;
    }

    public void addMemberSnapshot(FootballSavedTeamMember memberSnapshot) {
        memberSnapshots.add(memberSnapshot);
        memberSnapshot.assignTo(this);
    }
}
