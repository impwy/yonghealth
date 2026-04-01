package com.yong.yonghealth.controller;

import com.yong.yonghealth.dto.FootballMemberRequest;
import com.yong.yonghealth.dto.FootballMemberResponse;
import com.yong.yonghealth.service.ports.in.FootballMemberUseCase;
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

@WebMvcTest(FootballMemberController.class)
class FootballMemberControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    FootballMemberUseCase footballMemberUseCase;

    private FootballMemberResponse sampleResponse() {
        return FootballMemberResponse.builder()
                .id(1L)
                .name("홍길동")
                .grade(3)
                .build();
    }

    @Test
    @DisplayName("GET /api/football/members - 전체 회원 목록 조회")
    void findAll() throws Exception {
        given(footballMemberUseCase.findAll()).willReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/football/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("홍길동"))
                .andExpect(jsonPath("$[0].grade").value(3));
    }

    @Test
    @DisplayName("POST /api/football/members - 회원 등록")
    void create() throws Exception {
        FootballMemberRequest request = FootballMemberRequest.builder()
                .name("홍길동")
                .grade(3)
                .build();

        given(footballMemberUseCase.create(any(FootballMemberRequest.class)))
                .willReturn(sampleResponse());

        mockMvc.perform(post("/api/football/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.grade").value(3));
    }

    @Test
    @DisplayName("PUT /api/football/members/{id} - 회원 수정")
    void update() throws Exception {
        FootballMemberRequest request = FootballMemberRequest.builder()
                .name("수정된 이름")
                .grade(5)
                .build();

        given(footballMemberUseCase.update(eq(1L), any(FootballMemberRequest.class)))
                .willReturn(FootballMemberResponse.builder()
                        .id(1L)
                        .name("수정된 이름")
                        .grade(5)
                        .build());

        mockMvc.perform(put("/api/football/members/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("수정된 이름"))
                .andExpect(jsonPath("$.grade").value(5));
    }

    @Test
    @DisplayName("POST /api/football/members - 이름 누락 시 400")
    void create_missingName() throws Exception {
        FootballMemberRequest request = FootballMemberRequest.builder()
                .grade(3)
                .build();

        mockMvc.perform(post("/api/football/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/football/members - 등급 범위 초과 시 400")
    void create_invalidGrade() throws Exception {
        FootballMemberRequest request = FootballMemberRequest.builder()
                .name("홍길동")
                .grade(7)
                .build();

        mockMvc.perform(post("/api/football/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/football/members/{id} - 회원 삭제")
    void deleteTest() throws Exception {
        willDoNothing().given(footballMemberUseCase).delete(1L);

        mockMvc.perform(delete("/api/football/members/1"))
                .andExpect(status().isNoContent());
    }
}
