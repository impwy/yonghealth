package com.yong.yonghealth.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootballSavedTeamRequest {

    private String name;

    @Valid
    @NotEmpty(message = "보관할 팀 편성은 최소 2팀 이상이어야 합니다")
    private List<TeamRequest> teams;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamRequest {

        @NotNull(message = "팀 번호는 필수입니다")
        @Min(value = 1, message = "팀 번호는 1 이상이어야 합니다")
        private Integer teamNumber;

        @Valid
        @NotEmpty(message = "팀원 정보는 비어 있을 수 없습니다")
        private List<MemberRequest> members;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberRequest {

        private Long memberId;

        @NotBlank(message = "팀원 이름은 필수입니다")
        private String memberName;

        @NotNull(message = "팀원 티어는 필수입니다")
        @Min(value = 1, message = "팀원 티어는 1 이상이어야 합니다")
        @Max(value = 6, message = "팀원 티어는 6 이하여야 합니다")
        private Integer memberGrade;
    }
}
