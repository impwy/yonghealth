package com.yong.yonghealth.dto;

import com.yong.yonghealth.domain.WeightUnit;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSetRequest {

    @Positive(message = "세트 번호는 양수여야 합니다")
    private Integer setNumber;

    @Positive(message = "중량은 양수여야 합니다")
    private Double weight;

    @NotNull(message = "중량 단위는 필수입니다")
    private WeightUnit weightUnit;

    @Positive(message = "반복 횟수는 양수여야 합니다")
    private Integer reps;
}
