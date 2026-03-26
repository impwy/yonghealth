package com.yong.yonghealth.repository;

import com.yong.yonghealth.domain.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByWorkoutDateOrderByStartTimeAsc(LocalDate workoutDate);

    List<Workout> findAllByOrderByWorkoutDateDescStartTimeDesc();

    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.exercises " +
            "WHERE w.workoutDate BETWEEN :startDate AND :endDate " +
            "ORDER BY w.workoutDate ASC, w.startTime ASC")
    List<Workout> findByWorkoutDateBetween(@Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);
}
