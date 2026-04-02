package com.yong.yonghealth.e2e;

import com.yong.yonghealth.repository.FootballMemberRepository;
import com.yong.yonghealth.repository.FootballSavedTeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class FootballApiE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FootballMemberRepository footballMemberRepository;

    @Autowired
    private FootballSavedTeamRepository footballSavedTeamRepository;

    @BeforeEach
    void setUp() {
        footballSavedTeamRepository.deleteAll();
        footballMemberRepository.deleteAll();
    }

    @Test
    void footballMemberFlow_worksEndToEnd() throws Exception {
        long firstId = createMember("김재민", 1);
        createMember("박원용", 2);

        mockMvc.perform(get("/api/football/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("김재민"))
                .andExpect(jsonPath("$[1].name").value("박원용"));

        mockMvc.perform(post("/api/football/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "김재민",
                                "grade", 3
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("이미 등록된 이름입니다")));

        mockMvc.perform(delete("/api/football/members/{id}", firstId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/football/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void footballSavedTeamFlow_worksEndToEnd() throws Exception {
        long firstId = createMember("김재민", 1);
        long secondId = createMember("박원용", 2);
        long thirdId = createMember("최민수", 3);
        long fourthId = createMember("이동혁", 4);

        mockMvc.perform(put("/api/football/members/{id}", secondId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "박원용A",
                                "grade", 5
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("박원용A"))
                .andExpect(jsonPath("$.grade").value(5));

        mockMvc.perform(post("/api/football/saved-teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "일요 2팀",
                                "teams", List.of(
                                        Map.of(
                                                "teamNumber", 1,
                                                "members", List.of(
                                                        Map.of("memberId", firstId, "memberName", "김재민", "memberGrade", 1),
                                                        Map.of("memberId", secondId, "memberName", "박원용A", "memberGrade", 5)
                                                )
                                        ),
                                        Map.of(
                                                "teamNumber", 2,
                                                "members", List.of(
                                                        Map.of("memberId", thirdId, "memberName", "최민수", "memberGrade", 3),
                                                        Map.of("memberId", fourthId, "memberName", "이동혁", "memberGrade", 4)
                                                )
                                        )
                                )
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("일요 2팀"))
                .andExpect(jsonPath("$.teams[0].members[1].memberName").value("박원용A"));

        mockMvc.perform(get("/api/football/saved-teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].teamCount").value(2))
                .andExpect(jsonPath("$[0].teams[1].members[0].memberName").value("최민수"));

        long savedTeamId = objectMapper.readTree(
                mockMvc.perform(get("/api/football/saved-teams"))
                        .andReturn().getResponse().getContentAsString()
        ).get(0).get("id").asLong();

        mockMvc.perform(delete("/api/football/saved-teams/{id}", savedTeamId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/football/saved-teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(delete("/api/football/saved-teams/{id}", savedTeamId))
                .andExpect(status().isNotFound());
    }

    private long createMember(String name, int grade) throws Exception {
        String responseBody = mockMvc.perform(post("/api/football/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name,
                                "grade", grade
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(responseBody);
        return jsonNode.get("id").asLong();
    }
}
