package com.yong.yonghealth.controller;

import com.yong.yonghealth.dto.FootballSavedTeamRequest;
import com.yong.yonghealth.dto.FootballSavedTeamResponse;
import com.yong.yonghealth.service.ports.in.FootballSavedTeamUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FootballSavedTeamController.class)
class FootballSavedTeamControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    FootballSavedTeamUseCase footballSavedTeamUseCase;

    @Test
    @DisplayName("GET /api/football/saved-teams - 저장된 팀 목록 조회")
    void findAll() throws Exception {
        given(footballSavedTeamUseCase.findAll()).willReturn(List.of(
                FootballSavedTeamResponse.builder()
                        .id(1L)
                        .name("일요 2팀")
                        .teamCount(2)
                        .createdAt(LocalDateTime.of(2026, 4, 2, 10, 0))
                        .teams(List.of(
                                FootballSavedTeamResponse.TeamResponse.builder()
                                        .teamNumber(1)
                                        .members(List.of(
                                                FootballSavedTeamResponse.MemberResponse.builder()
                                                        .memberId(1L)
                                                        .memberName("김재민")
                                                        .memberGrade(1)
                                                        .build()
                                        ))
                                        .build()
                        ))
                        .build()
        ));

        mockMvc.perform(get("/api/football/saved-teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("일요 2팀"))
                .andExpect(jsonPath("$[0].teams[0].teamNumber").value(1));
    }

    @Test
    @DisplayName("POST /api/football/saved-teams - 팀 스냅샷 저장")
    void create() throws Exception {
        FootballSavedTeamRequest request = FootballSavedTeamRequest.builder()
                .name("일요 2팀")
                .teams(List.of(
                        FootballSavedTeamRequest.TeamRequest.builder()
                                .teamNumber(1)
                                .members(List.of(
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberId(1L)
                                                .memberName("김재민")
                                                .memberGrade(1)
                                                .build()
                                ))
                                .build(),
                        FootballSavedTeamRequest.TeamRequest.builder()
                                .teamNumber(2)
                                .members(List.of(
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberId(2L)
                                                .memberName("박원용")
                                                .memberGrade(3)
                                                .build()
                                ))
                                .build()
                ))
                .build();

        given(footballSavedTeamUseCase.create(any(FootballSavedTeamRequest.class)))
                .willReturn(FootballSavedTeamResponse.builder()
                        .id(1L)
                        .name("일요 2팀")
                        .teamCount(2)
                        .createdAt(LocalDateTime.of(2026, 4, 2, 10, 0))
                        .teams(List.of())
                        .build());

        mockMvc.perform(post("/api/football/saved-teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("일요 2팀"))
                .andExpect(jsonPath("$.teamCount").value(2));
    }
}
