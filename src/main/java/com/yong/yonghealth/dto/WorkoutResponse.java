package com.yong.yonghealth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yong.yonghealth.domain.Workout;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
public class WorkoutResponse {

    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate workoutDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String memo;
    private int exerciseCount;
    private int totalSetCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public static WorkoutResponse from(Workout workout) {
        int totalSets = workout.getExercises().stream()
                .mapToInt(e -> e.getSets().size())
                .sum();

        return WorkoutResponse.builder()
                .id(workout.getId())
                .workoutDate(workout.getWorkoutDate())
                .startTime(workout.getStartTime())
                .endTime(workout.getEndTime())
                .memo(workout.getMemo())
                .exerciseCount(workout.getExercises().size())
                .totalSetCount(totalSets)
                .createdAt(workout.getCreatedAt())
                .updatedAt(workout.getUpdatedAt())
                .build();
    }
}
