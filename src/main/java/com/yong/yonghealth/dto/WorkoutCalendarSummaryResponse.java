package com.yong.yonghealth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class WorkoutCalendarSummaryResponse {

    private int year;
    private int month;
    private List<DaySummary> days;

    @Getter
    @Builder
    public static class DaySummary {
        private String date;
        private int workoutCount;
        private int exerciseCount;
        private int totalSets;
    }
}
