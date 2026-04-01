package com.yong.yonghealth.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootballMemberRequest {

    @NotBlank(message = "이름은 필수입니다")
    private String name;

    @NotNull(message = "등급은 필수입니다")
    @Min(value = 1, message = "등급은 1 이상이어야 합니다")
    @Max(value = 6, message = "등급은 6 이하여야 합니다")
    private Integer grade;
}
