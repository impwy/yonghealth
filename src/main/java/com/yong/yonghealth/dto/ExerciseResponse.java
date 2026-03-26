package com.yong.yonghealth.dto;

import com.yong.yonghealth.domain.Exercise;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ExerciseResponse {

    private Long id;
    private Long exerciseCatalogId;
    private String displayName;
    private String customName;
    private Integer sortOrder;
    private String note;
    private List<ExerciseSetResponse> sets;

    public static ExerciseResponse from(Exercise exercise) {
        return ExerciseResponse.builder()
                .id(exercise.getId())
                .exerciseCatalogId(exercise.getExerciseCatalogId())
                .displayName(exercise.getDisplayName())
                .customName(exercise.getCustomName())
                .sortOrder(exercise.getSortOrder())
                .note(exercise.getNote())
                .sets(exercise.getSets().stream()
                        .map(ExerciseSetResponse::from)
                        .toList())
                .build();
    }
}
