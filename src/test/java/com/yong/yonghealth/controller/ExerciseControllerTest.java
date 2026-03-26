package com.yong.yonghealth.controller;

import com.yong.yonghealth.dto.ExerciseRequest;
import com.yong.yonghealth.dto.ExerciseResponse;
import com.yong.yonghealth.service.ports.in.ExerciseUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExerciseController.class)
class ExerciseControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    ExerciseUseCase exerciseUseCase;

    @Test
    @DisplayName("POST /api/workouts/{workoutId}/exercises - 종목 생성")
    void create() throws Exception {
        ExerciseRequest request = ExerciseRequest.builder()
                .displayName("벤치프레스")
                .sortOrder(1)
                .build();

        ExerciseResponse response = ExerciseResponse.builder()
                .id(1L)
                .displayName("벤치프레스")
                .sortOrder(1)
                .sets(List.of())
                .build();

        given(exerciseUseCase.create(eq(1L), any(ExerciseRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/workouts/1/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.displayName").value("벤치프레스"));
    }

    @Test
    @DisplayName("POST - 카탈로그 ID와 커스텀명 포함 생성")
    void createWithCatalog() throws Exception {
        ExerciseRequest request = ExerciseRequest.builder()
                .exerciseCatalogId(1L)
                .displayName("벤치프레스")
                .customName("클로즈그립 벤치프레스")
                .sortOrder(1)
                .note("삼두 집중")
                .build();

        ExerciseResponse response = ExerciseResponse.builder()
                .id(1L)
                .exerciseCatalogId(1L)
                .displayName("벤치프레스")
                .customName("클로즈그립 벤치프레스")
                .sortOrder(1)
                .note("삼두 집중")
                .sets(List.of())
                .build();

        given(exerciseUseCase.create(eq(1L), any(ExerciseRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/workouts/1/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exerciseCatalogId").value(1))
                .andExpect(jsonPath("$.displayName").value("벤치프레스"))
                .andExpect(jsonPath("$.customName").value("클로즈그립 벤치프레스"))
                .andExpect(jsonPath("$.note").value("삼두 집중"));
    }

    @Test
    @DisplayName("PUT /api/exercises/{id} - 종목 수정")
    void update() throws Exception {
        ExerciseRequest request = ExerciseRequest.builder()
                .displayName("스쿼트")
                .sortOrder(2)
                .build();

        ExerciseResponse response = ExerciseResponse.builder()
                .id(1L)
                .displayName("스쿼트")
                .sortOrder(2)
                .sets(List.of())
                .build();

        given(exerciseUseCase.update(eq(1L), any(ExerciseRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/exercises/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("스쿼트"));
    }

    @Test
    @DisplayName("DELETE /api/exercises/{id} - 종목 삭제")
    void deleteExercise() throws Exception {
        willDoNothing().given(exerciseUseCase).delete(1L);

        mockMvc.perform(delete("/api/exercises/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST - 필수값 누락 시 400")
    void create_validationFail() throws Exception {
        ExerciseRequest request = ExerciseRequest.builder().build();

        mockMvc.perform(post("/api/workouts/1/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
