package com.yong.yonghealth.domain.workout;

import com.yong.yonghealth.domain.exercise.Exercise;
import com.yong.yonghealth.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Workout extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate workoutDate;

    @Column(nullable = false)
    private LocalTime startTime;

    private LocalTime endTime;

    private String memo;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Exercise> exercises = new ArrayList<>();

    @Builder
    public Workout(LocalDate workoutDate, LocalTime startTime, LocalTime endTime, String memo) {
        this.workoutDate = workoutDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.memo = memo;
    }

    public void update(LocalDate workoutDate, LocalTime startTime, LocalTime endTime, String memo) {
        this.workoutDate = workoutDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.memo = memo;
    }
}
