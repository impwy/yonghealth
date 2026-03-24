package com.yong.yonghealth.domain;

import com.yong.yonghealth.repository.WorkoutRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class WorkoutTest {

    @Autowired
    WorkoutRepository workoutRepository;

    @Test
    @DisplayName("Builder로 Workout을 생성한다")
    void create() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .memo("아침 운동")
                .build();

        // when
        Workout saved = workoutRepository.save(workout);

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 24));
        assertThat(saved.getStartTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(saved.getEndTime()).isEqualTo(LocalTime.of(10, 30));
        assertThat(saved.getMemo()).isEqualTo("아침 운동");
        assertThat(saved.getExercises()).isEmpty();
    }

    @Test
    @DisplayName("Workout 필드를 수정한다")
    void update() {
        // given
        Workout workout = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        // when
        workout.update(
                LocalDate.of(2026, 3, 25),
                LocalTime.of(10, 0),
                LocalTime.of(11, 30),
                "수정된 메모"
        );

        Workout found = workoutRepository.findById(workout.getId()).orElseThrow();

        // then
        assertThat(found.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 25));
        assertThat(found.getStartTime()).isEqualTo(LocalTime.of(10, 0));
        assertThat(found.getEndTime()).isEqualTo(LocalTime.of(11, 30));
        assertThat(found.getMemo()).isEqualTo("수정된 메모");
    }

    @Test
    @DisplayName("endTime과 memo 없이도 생성 가능하다")
    void create_withOptionalFields() {
        // given & when
        Workout saved = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEndTime()).isNull();
        assertThat(saved.getMemo()).isNull();
    }

    @Test
    @DisplayName("BaseTimeEntity의 createdAt이 자동 설정된다")
    void auditFields() {
        // given & when
        Workout saved = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        // then
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
