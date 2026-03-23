package com.yong.yonghealth.dto;

import com.yong.yonghealth.domain.Exercise;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ExerciseResponse {

    private Long id;
    private String name;
    private Integer sortOrder;
    private List<ExerciseSetResponse> sets;

    public static ExerciseResponse from(Exercise exercise) {
        return ExerciseResponse.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .sortOrder(exercise.getSortOrder())
                .sets(exercise.getSets().stream()
                        .map(ExerciseSetResponse::from)
                        .toList())
                .build();
    }
}
