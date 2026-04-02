package com.yong.yonghealth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FootballSavedTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "saved_team_id", nullable = false)
    private FootballSavedTeam savedTeam;

    @Column
    private Long sourceMemberId;

    @Column(nullable = false)
    private String memberName;

    @Column(nullable = false)
    private Integer memberGrade;

    @Column(nullable = false)
    private Integer teamNumber;

    @Column(nullable = false)
    private Integer sortOrder;

    @Builder
    public FootballSavedTeamMember(
            Long sourceMemberId,
            String memberName,
            Integer memberGrade,
            Integer teamNumber,
            Integer sortOrder
    ) {
        this.sourceMemberId = sourceMemberId;
        this.memberName = memberName;
        this.memberGrade = memberGrade;
        this.teamNumber = teamNumber;
        this.sortOrder = sortOrder;
    }

    void assignTo(FootballSavedTeam savedTeam) {
        this.savedTeam = savedTeam;
    }
}
