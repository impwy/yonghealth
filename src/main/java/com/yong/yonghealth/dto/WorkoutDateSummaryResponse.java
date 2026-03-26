package com.yong.yonghealth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yong.yonghealth.domain.Workout;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@Builder
public class WorkoutDateSummaryResponse {

    private Long id;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String memo;
    private int exerciseCount;
    private int totalSets;

    public static WorkoutDateSummaryResponse from(Workout workout) {
        return WorkoutDateSummaryResponse.builder()
                .id(workout.getId())
                .startTime(workout.getStartTime())
                .endTime(workout.getEndTime())
                .memo(workout.getMemo())
                .exerciseCount(workout.getExercises().size())
                .totalSets(workout.getTotalSetCount())
                .build();
    }
}
