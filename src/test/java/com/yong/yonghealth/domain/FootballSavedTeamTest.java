package com.yong.yonghealth.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FootballSavedTeamTest {

    @Test
    @DisplayName("보관 팀에 멤버 스냅샷을 추가한다")
    void addMemberSnapshot() {
        FootballSavedTeam savedTeam = FootballSavedTeam.builder()
                .name("일요 경기")
                .teamCount(2)
                .build();

        FootballSavedTeamMember memberSnapshot = FootballSavedTeamMember.builder()
                .sourceMemberId(1L)
                .memberName("홍길동")
                .memberGrade(2)
                .teamNumber(1)
                .sortOrder(1)
                .build();

        savedTeam.addMemberSnapshot(memberSnapshot);

        assertThat(savedTeam.getMemberSnapshots()).hasSize(1);
        assertThat(savedTeam.getMemberSnapshots().getFirst().getMemberName()).isEqualTo("홍길동");
        assertThat(savedTeam.getMemberSnapshots().getFirst().getSavedTeam()).isEqualTo(savedTeam);
    }
}
