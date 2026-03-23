package com.yong.yonghealth.domain.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByWorkoutDateOrderByStartTimeAsc(LocalDate workoutDate);

    List<Workout> findAllByOrderByWorkoutDateDescStartTimeDesc();
}
