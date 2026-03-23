package com.yong.yonghealth.controller;

import com.yong.yonghealth.domain.WeightUnit;
import com.yong.yonghealth.dto.ExerciseSetRequest;
import com.yong.yonghealth.dto.ExerciseSetResponse;
import com.yong.yonghealth.service.ports.in.ExerciseSetUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExerciseSetController.class)
class ExerciseSetControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    ExerciseSetUseCase exerciseSetUseCase;

    @Test
    @DisplayName("POST /api/exercises/{exerciseId}/sets - 세트 생성")
    void create() throws Exception {
        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        ExerciseSetResponse response = ExerciseSetResponse.builder()
                .id(1L)
                .setNumber(1)
                .weight(60.0)
                .weightUnit(WeightUnit.KG)
                .reps(10)
                .build();

        given(exerciseSetUseCase.create(eq(1L), any(ExerciseSetRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/exercises/1/sets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.weight").value(60.0))
                .andExpect(jsonPath("$.reps").value(10));
    }

    @Test
    @DisplayName("PUT /api/sets/{id} - 세트 수정")
    void update() throws Exception {
        ExerciseSetRequest request = ExerciseSetRequest.builder()
                .setNumber(1)
                .weight(80.0)
                .weightUnit(WeightUnit.KG)
                .reps(8)
                .build();

        ExerciseSetResponse response = ExerciseSetResponse.builder()
                .id(1L)
                .setNumber(1)
                .weight(80.0)
                .weightUnit(WeightUnit.KG)
                .reps(8)
                .build();

        given(exerciseSetUseCase.update(eq(1L), any(ExerciseSetRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/sets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weight").value(80.0));
    }

    @Test
    @DisplayName("DELETE /api/sets/{id} - 세트 삭제")
    void deleteSet() throws Exception {
        willDoNothing().given(exerciseSetUseCase).delete(1L);

        mockMvc.perform(delete("/api/sets/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/convert - 단위 변환")
    void convert() throws Exception {
        mockMvc.perform(get("/api/convert")
                        .param("value", "100")
                        .param("from", "KG")
                        .param("to", "LB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.convertedValue").value(220.46));
    }

    @Test
    @DisplayName("POST - 필수값 누락 시 400")
    void create_validationFail() throws Exception {
        ExerciseSetRequest request = ExerciseSetRequest.builder().build();

        mockMvc.perform(post("/api/exercises/1/sets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
