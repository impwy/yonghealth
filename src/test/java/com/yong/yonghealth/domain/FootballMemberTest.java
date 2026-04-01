package com.yong.yonghealth.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FootballMemberTest {

    @Test
    @DisplayName("풋볼 회원 정보를 수정한다")
    void update() {
        FootballMember member = FootballMember.builder()
                .name("기존 선수")
                .grade(3)
                .build();

        member.update("수정된 선수", 5);

        assertThat(member.getName()).isEqualTo("수정된 선수");
        assertThat(member.getGrade()).isEqualTo(5);
    }
}
