package com.yong.yonghealth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseRequest {

    private Long exerciseCatalogId;

    @NotBlank(message = "운동 표시명은 필수입니다")
    @Size(max = 100, message = "운동 표시명은 100자 이하여야 합니다")
    private String displayName;

    @Size(max = 100, message = "사용자 정의명은 100자 이하여야 합니다")
    private String customName;

    @NotNull(message = "종목 순서는 필수입니다")
    private Integer sortOrder;

    @Size(max = 500, message = "메모는 500자 이하여야 합니다")
    private String note;
}
