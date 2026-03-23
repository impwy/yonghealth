package com.yong.yonghealth.dto;

import com.yong.yonghealth.domain.ExerciseSet;
import com.yong.yonghealth.domain.WeightUnit;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExerciseSetResponse {

    private Long id;
    private Integer setNumber;
    private Double weight;
    private WeightUnit weightUnit;
    private Integer reps;

    public static ExerciseSetResponse from(ExerciseSet exerciseSet) {
        return ExerciseSetResponse.builder()
                .id(exerciseSet.getId())
                .setNumber(exerciseSet.getSetNumber())
                .weight(exerciseSet.getWeight())
                .weightUnit(exerciseSet.getWeightUnit())
                .reps(exerciseSet.getReps())
                .build();
    }
}
