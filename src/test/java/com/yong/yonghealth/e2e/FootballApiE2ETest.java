package com.yong.yonghealth.e2e;

import com.yong.yonghealth.repository.FootballMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

    @BeforeEach
    void setUp() {
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
