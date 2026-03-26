package com.yong.yonghealth.service.ports.in;

import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutUseCase {

    WorkoutResponse create(WorkoutRequest request);

    List<WorkoutResponse> findAll();

    List<WorkoutResponse> findByDate(LocalDate date);

    WorkoutDetailResponse findById(Long id);

    WorkoutResponse update(Long id, WorkoutRequest request);

    void delete(Long id);

    Workout getWorkout(Long id);

    WorkoutCalendarSummaryResponse getCalendarSummary(int year, int month);

    List<WorkoutDateSummaryResponse> getDateSummary(LocalDate date);
}
