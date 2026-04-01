package com.yong.yonghealth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yong.yonghealth.domain.FootballSavedTeam;
import com.yong.yonghealth.domain.FootballSavedTeamMember;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Getter
@Builder
public class FootballSavedTeamResponse {

    private Long id;
    private String name;
    private Integer teamCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private List<TeamResponse> teams;

    public static FootballSavedTeamResponse from(FootballSavedTeam savedTeam) {
        Map<Integer, List<MemberResponse>> groupedMembers = new LinkedHashMap<>();
        for (FootballSavedTeamMember memberSnapshot : savedTeam.getMemberSnapshots()) {
            groupedMembers.computeIfAbsent(memberSnapshot.getTeamNumber(), ignored -> new java.util.ArrayList<>())
                    .add(MemberResponse.from(memberSnapshot));
        }

        List<TeamResponse> teams = groupedMembers.entrySet().stream()
                .map(entry -> TeamResponse.builder()
                        .teamNumber(entry.getKey())
                        .members(entry.getValue())
                        .build())
                .toList();

        return FootballSavedTeamResponse.builder()
                .id(savedTeam.getId())
                .name(savedTeam.getName())
                .teamCount(savedTeam.getTeamCount())
                .createdAt(savedTeam.getCreatedAt())
                .teams(teams)
                .build();
    }

    @Getter
    @Builder
    public static class TeamResponse {
        private Integer teamNumber;
        private List<MemberResponse> members;
    }

    @Getter
    @Builder
    public static class MemberResponse {
        private Long memberId;
        private String memberName;
        private Integer memberGrade;

        public static MemberResponse from(FootballSavedTeamMember memberSnapshot) {
            return MemberResponse.builder()
                    .memberId(memberSnapshot.getSourceMemberId())
                    .memberName(memberSnapshot.getMemberName())
                    .memberGrade(memberSnapshot.getMemberGrade())
                    .build();
        }
    }
}
