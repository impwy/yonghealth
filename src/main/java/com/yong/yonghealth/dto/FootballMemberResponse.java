package com.yong.yonghealth.dto;

import com.yong.yonghealth.domain.FootballMember;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FootballMemberResponse {

    private Long id;
    private String name;
    private Integer grade;

    public static FootballMemberResponse from(FootballMember member) {
        return FootballMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .grade(member.getGrade())
                .build();
    }
}
