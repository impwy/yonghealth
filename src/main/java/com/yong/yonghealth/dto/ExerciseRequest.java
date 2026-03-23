package com.yong.yonghealth.dto;

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
public class ExerciseRequest {

    @NotBlank(message = "운동 종목명은 필수입니다")
    private String name;

    @NotNull(message = "종목 순서는 필수입니다")
    private Integer sortOrder;
}
