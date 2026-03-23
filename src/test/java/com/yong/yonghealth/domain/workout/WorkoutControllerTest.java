package com.yong.yonghealth.domain.workout;

import com.yong.yonghealth.domain.workout.dto.WorkoutDetailResponse;
import com.yong.yonghealth.domain.workout.dto.WorkoutRequest;
import com.yong.yonghealth.domain.workout.dto.WorkoutResponse;
import com.yong.yonghealth.domain.workout.service.ports.in.WorkoutUseCase;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WorkoutController.class)
class WorkoutControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    WorkoutUseCase workoutUseCase;

    @Test
    @DisplayName("POST /api/workouts - 운동 세션 생성")
    void create() throws Exception {
        WorkoutRequest request = WorkoutRequest.builder()
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        WorkoutResponse response = WorkoutResponse.builder()
                .id(1L)
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutUseCase.create(any(WorkoutRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.workoutDate").value("2026-03-24"));
    }

    @Test
    @DisplayName("GET /api/workouts - 전체 세션 목록 조회")
    void findAll() throws Exception {
        WorkoutResponse response = WorkoutResponse.builder()
                .id(1L)
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutUseCase.findAll()).willReturn(List.of(response));

        mockMvc.perform(get("/api/workouts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @DisplayName("GET /api/workouts?date= - 날짜별 세션 조회")
    void findByDate() throws Exception {
        WorkoutResponse response = WorkoutResponse.builder()
                .id(1L)
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .build();

        given(workoutUseCase.findByDate(LocalDate.of(2026, 3, 24)))
                .willReturn(List.of(response));

        mockMvc.perform(get("/api/workouts").param("date", "2026-03-24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].workoutDate").value("2026-03-24"));
    }

    @Test
    @DisplayName("GET /api/workouts/{id} - 세션 상세 조회")
    void findById() throws Exception {
        WorkoutDetailResponse response = WorkoutDetailResponse.builder()
                .id(1L)
                .workoutDate(LocalDate.of(2026, 3, 24))
                .startTime(LocalTime.of(9, 0))
                .memo("테스트")
                .exercises(List.of())
                .build();

        given(workoutUseCase.findById(1L)).willReturn(response);

        mockMvc.perform(get("/api/workouts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.memo").value("테스트"));
    }

    @Test
    @DisplayName("GET /api/workouts/{id} - 존재하지 않는 세션 조회 시 404")
    void findById_notFound() throws Exception {
        given(workoutUseCase.findById(999L))
                .willThrow(new EntityNotFoundException("운동 세션을 찾을 수 없습니다. id=999"));

        mockMvc.perform(get("/api/workouts/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/workouts/{id} - 세션 수정")
    void update() throws Exception {
        WorkoutRequest request = WorkoutRequest.builder()
                .workoutDate(LocalDate.of(2026, 3, 25))
                .startTime(LocalTime.of(10, 0))
                .build();

        WorkoutResponse response = WorkoutResponse.builder()
                .id(1L)
                .workoutDate(LocalDate.of(2026, 3, 25))
                .startTime(LocalTime.of(10, 0))
                .build();

        given(workoutUseCase.update(eq(1L), any(WorkoutRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/workouts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workoutDate").value("2026-03-25"));
    }

    @Test
    @DisplayName("DELETE /api/workouts/{id} - 세션 삭제")
    void deleteWorkout() throws Exception {
        willDoNothing().given(workoutUseCase).delete(1L);

        mockMvc.perform(delete("/api/workouts/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /api/workouts - 필수값 누락 시 400")
    void create_validationFail() throws Exception {
        WorkoutRequest request = WorkoutRequest.builder().build();

        mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
