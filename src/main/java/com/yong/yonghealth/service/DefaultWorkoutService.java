package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.repository.WorkoutRepository;
import com.yong.yonghealth.dto.*;
import com.yong.yonghealth.service.ports.in.WorkoutUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultWorkoutService implements WorkoutUseCase {

    private final WorkoutRepository workoutRepository;

    @Override
    @Transactional
    public WorkoutResponse create(WorkoutRequest request) {
        Workout workout = Workout.builder()
                .workoutDate(request.getWorkoutDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .memo(request.getMemo())
                .build();

        return WorkoutResponse.from(workoutRepository.save(workout));
    }

    @Override
    public List<WorkoutResponse> findAll() {
        return workoutRepository.findAllByOrderByWorkoutDateDescStartTimeDesc().stream()
                .map(WorkoutResponse::from)
                .toList();
    }

    @Override
    public List<WorkoutResponse> findByDate(LocalDate date) {
        return workoutRepository.findByWorkoutDateOrderByStartTimeAsc(date).stream()
                .map(WorkoutResponse::from)
                .toList();
    }

    @Override
    public WorkoutDetailResponse findById(Long id) {
        return WorkoutDetailResponse.from(getWorkout(id));
    }

    @Override
    @Transactional
    public WorkoutResponse update(Long id, WorkoutRequest request) {
        Workout workout = getWorkout(id);
        workout.update(
                request.getWorkoutDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getMemo()
        );
        return WorkoutResponse.from(workout);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Workout workout = getWorkout(id);
        workoutRepository.delete(workout);
    }

    @Override
    public Workout getWorkout(Long id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("운동 세션을 찾을 수 없습니다. id=" + id));
    }

    @Override
    public WorkoutCalendarSummaryResponse getCalendarSummary(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Workout> workouts = workoutRepository.findByWorkoutDateBetween(startDate, endDate);

        Map<LocalDate, List<Workout>> grouped = workouts.stream()
                .collect(Collectors.groupingBy(Workout::getWorkoutDate));

        List<WorkoutCalendarSummaryResponse.DaySummary> days = grouped.entrySet().stream()
                .map(entry -> WorkoutCalendarSummaryResponse.DaySummary.builder()
                        .date(entry.getKey().toString())
                        .workoutCount(entry.getValue().size())
                        .exerciseCount(entry.getValue().stream()
                                .mapToInt(w -> w.getExercises().size())
                                .sum())
                        .totalSets(entry.getValue().stream()
                                .mapToInt(Workout::getTotalSetCount)
                                .sum())
                        .build())
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .toList();

        return WorkoutCalendarSummaryResponse.builder()
                .year(year)
                .month(month)
                .days(days)
                .build();
    }

    @Override
    public List<WorkoutDateSummaryResponse> getDateSummary(LocalDate date) {
        return workoutRepository.findByWorkoutDateOrderByStartTimeAsc(date).stream()
                .map(WorkoutDateSummaryResponse::from)
                .toList();
    }
}
