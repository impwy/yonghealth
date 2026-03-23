package com.yong.yonghealth.domain.workout;

import com.yong.yonghealth.domain.workout.dto.WorkoutDetailResponse;
import com.yong.yonghealth.domain.workout.dto.WorkoutRequest;
import com.yong.yonghealth.domain.workout.dto.WorkoutResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

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

    public List<WorkoutResponse> findAll() {
        return workoutRepository.findAllByOrderByWorkoutDateDescStartTimeDesc().stream()
                .map(WorkoutResponse::from)
                .toList();
    }

    public List<WorkoutResponse> findByDate(LocalDate date) {
        return workoutRepository.findByWorkoutDateOrderByStartTimeAsc(date).stream()
                .map(WorkoutResponse::from)
                .toList();
    }

    public WorkoutDetailResponse findById(Long id) {
        return WorkoutDetailResponse.from(getWorkout(id));
    }

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

    @Transactional
    public void delete(Long id) {
        Workout workout = getWorkout(id);
        workoutRepository.delete(workout);
    }

    public Workout getWorkout(Long id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("운동 세션을 찾을 수 없습니다. id=" + id));
    }
}
