package com.yong.yonghealth.controller;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.domain.Equipment;
import com.yong.yonghealth.domain.MovementType;
import com.yong.yonghealth.dto.ExerciseCatalogResponse;
import com.yong.yonghealth.dto.ExerciseCatalogSearchResponse;
import com.yong.yonghealth.service.ports.in.ExerciseCatalogUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExerciseCatalogController.class)
class ExerciseCatalogControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    ExerciseCatalogUseCase exerciseCatalogUseCase;

    private ExerciseCatalogResponse sampleResponse() {
        return ExerciseCatalogResponse.builder()
                .id(1L)
                .name("벤치프레스")
                .category(BodyPart.CHEST)
                .equipment(Equipment.BARBELL)
                .movementType(MovementType.PUSH)
                .aliases(List.of("벤치", "bench press"))
                .build();
    }

    @Test
    @DisplayName("GET /api/exercise-catalog - 전체 목록 조회")
    void findAll() throws Exception {
        given(exerciseCatalogUseCase.findAll()).willReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/exercise-catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("벤치프레스"))
                .andExpect(jsonPath("$[0].category").value("CHEST"))
                .andExpect(jsonPath("$[0].aliases[0]").value("벤치"));
    }

    @Test
    @DisplayName("GET /api/exercise-catalog?category=CHEST - 카테고리별 조회")
    void findByCategory() throws Exception {
        given(exerciseCatalogUseCase.findByCategory(BodyPart.CHEST)).willReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/exercise-catalog").param("category", "CHEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("CHEST"));
    }

    @Test
    @DisplayName("GET /api/exercise-catalog/search?query=벤치 - 검색")
    void search() throws Exception {
        ExerciseCatalogSearchResponse searchResponse = ExerciseCatalogSearchResponse.builder()
                .query("벤치")
                .resultCount(1)
                .results(List.of(sampleResponse()))
                .build();

        given(exerciseCatalogUseCase.search("벤치")).willReturn(searchResponse);

        mockMvc.perform(get("/api/exercise-catalog/search").param("query", "벤치"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("벤치"))
                .andExpect(jsonPath("$.resultCount").value(1))
                .andExpect(jsonPath("$.results[0].name").value("벤치프레스"));
    }
}
