package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.repository.WorkoutRepository;
import com.yong.yonghealth.dto.WorkoutDetailResponse;
import com.yong.yonghealth.dto.WorkoutRequest;
import com.yong.yonghealth.dto.WorkoutResponse;
import com.yong.yonghealth.service.ports.in.WorkoutUseCase;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DefaultWorkoutServiceTest {

    @Autowired
    WorkoutUseCase workoutUseCase;

    @Autowired
    WorkoutRepository workoutRepository;

    @Test
    @DisplayName("운동 세션을 생성한다")
    void create() {
        // given
        WorkoutRequest request = WorkoutRequest.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .memo("아침 운동")
                .build();

        // when
        WorkoutResponse response = workoutUseCase.create(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 24));
        assertThat(response.getMemo()).isEqualTo("아침 운동");
        assertThat(workoutRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("전체 운동 세션을 조회한다")
    void findAll() {
        // given
        workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());
        workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 25))
                .startTime(LocalTime.of(10, 0))
                .build());

        // when
        List<WorkoutResponse> responses = workoutUseCase.findAll();

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 25));
    }

    @Test
    @DisplayName("날짜별 운동 세션을 조회한다")
    void findByDate() {
        // given
        LocalDate targetDate = LocalDate.of(2026, 3, 24);
        workoutRepository.save(Workout.builder()
                .workoutDate(targetDate)
                .startTime(LocalTime.of(9, 0))
                .build());
        workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 25))
                .startTime(LocalTime.of(10, 0))
                .build());

        // when
        List<WorkoutResponse> responses = workoutUseCase.findByDate(targetDate);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getWorkoutDate()).isEqualTo(targetDate);
    }

    @Test
    @DisplayName("운동 세션을 상세 조회한다")
    void findById() {
        // given
        Workout saved = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .memo("테스트")
                .build());

        // when
        WorkoutDetailResponse response = workoutUseCase.findById(saved.getId());

        // then
        assertThat(response.getMemo()).isEqualTo("테스트");
        assertThat(response.getExerciseCount()).isZero();
    }

    @Test
    @DisplayName("존재하지 않는 세션 조회 시 예외가 발생한다")
    void findById_notFound() {
        // when & then
        assertThatThrownBy(() -> workoutUseCase.findById(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("운동 세션을 수정한다")
    void update() {
        // given
        Workout saved = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        WorkoutRequest request = WorkoutRequest.builder()
                .workoutDate(LocalDate.of(2026, 3, 25))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .memo("수정된 메모")
                .build();

        // when
        WorkoutResponse response = workoutUseCase.update(saved.getId(), request);

        // then
        assertThat(response.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 25));
        assertThat(response.getMemo()).isEqualTo("수정된 메모");
    }

    @Test
    @DisplayName("운동 세션을 삭제한다")
    void delete() {
        // given
        Workout saved = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        // when
        workoutUseCase.delete(saved.getId());

        // then
        assertThat(workoutRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("getWorkout으로 엔티티를 직접 조회한다")
    void getWorkout() {
        // given
        Workout saved = workoutRepository.save(Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build());

        // when
        Workout result = workoutUseCase.getWorkout(saved.getId());

        // then
        assertThat(result.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 24));
    }
}
