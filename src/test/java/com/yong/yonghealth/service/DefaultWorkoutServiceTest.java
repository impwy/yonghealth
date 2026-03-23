package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.Workout;
import com.yong.yonghealth.repository.WorkoutRepository;
import com.yong.yonghealth.dto.WorkoutDetailResponse;
import com.yong.yonghealth.dto.WorkoutRequest;
import com.yong.yonghealth.dto.WorkoutResponse;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class DefaultWorkoutServiceTest {

    @Mock
    WorkoutRepository workoutRepository;

    @InjectMocks
    DefaultWorkoutService workoutService;

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

        Workout saved = Workout.builder()
                .workoutDate(request.getWorkoutDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .memo(request.getMemo())
                .build();

        given(workoutRepository.save(any(Workout.class))).willReturn(saved);

        // when
        WorkoutResponse response = workoutService.create(request);

        // then
        assertThat(response.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 24));
        assertThat(response.getMemo()).isEqualTo("아침 운동");
        then(workoutRepository).should().save(any(Workout.class));
    }

    @Test
    @DisplayName("전체 운동 세션을 조회한다")
    void findAll() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutRepository.findAllByOrderByWorkoutDateDescStartTimeDesc())
                .willReturn(List.of(workout));

        // when
        List<WorkoutResponse> responses = workoutService.findAll();

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 24));
    }

    @Test
    @DisplayName("날짜별 운동 세션을 조회한다")
    void findByDate() {
        // given
        LocalDate date = LocalDate.of(2026, 3, 24);
        Workout workout = Workout.builder()
                .workoutDate(date)
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutRepository.findByWorkoutDateOrderByStartTimeAsc(date))
                .willReturn(List.of(workout));

        // when
        List<WorkoutResponse> responses = workoutService.findByDate(date);

        // then
        assertThat(responses).hasSize(1);
    }

    @Test
    @DisplayName("운동 세션을 상세 조회한다")
    void findById() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .memo("테스트")
                .build();

        given(workoutRepository.findById(1L)).willReturn(Optional.of(workout));

        // when
        WorkoutDetailResponse response = workoutService.findById(1L);

        // then
        assertThat(response.getMemo()).isEqualTo("테스트");
        assertThat(response.getExerciseCount()).isZero();
    }

    @Test
    @DisplayName("존재하지 않는 세션 조회 시 예외가 발생한다")
    void findById_notFound() {
        // given
        given(workoutRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> workoutService.findById(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("운동 세션을 수정한다")
    void update() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutRepository.findById(1L)).willReturn(Optional.of(workout));

        WorkoutRequest request = WorkoutRequest.builder()
                .workoutDate(LocalDate.of(2026, 3, 25))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .memo("수정된 메모")
                .build();

        // when
        WorkoutResponse response = workoutService.update(1L, request);

        // then
        assertThat(response.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 25));
        assertThat(response.getMemo()).isEqualTo("수정된 메모");
    }

    @Test
    @DisplayName("운동 세션을 삭제한다")
    void delete() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutRepository.findById(1L)).willReturn(Optional.of(workout));

        // when
        workoutService.delete(1L);

        // then
        then(workoutRepository).should().delete(workout);
    }

    @Test
    @DisplayName("getWorkout으로 엔티티를 직접 조회한다")
    void getWorkout() {
        // given
        Workout workout = Workout.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutRepository.findById(1L)).willReturn(Optional.of(workout));

        // when
        Workout result = workoutService.getWorkout(1L);

        // then
        assertThat(result.getWorkoutDate()).isEqualTo(LocalDate.of(2026, 3, 24));
    }
}
