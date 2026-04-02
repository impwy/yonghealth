package com.yong.yonghealth.e2e;

import com.yong.yonghealth.repository.WorkoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WorkoutApiE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WorkoutRepository workoutRepository;

    @BeforeEach
    void setUp() {
        workoutRepository.deleteAll();
    }

    @Test
    void workoutExerciseSetFlow_worksEndToEnd() throws Exception {
        long workoutId = createWorkout();
        long exerciseId = createExercise(workoutId);
        createSet(exerciseId);

        mockMvc.perform(get("/api/workouts/{id}", workoutId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exerciseCount").value(1))
                .andExpect(jsonPath("$.totalSetCount").value(1))
                .andExpect(jsonPath("$.exercises[0].displayName").value("벤치프레스"));

        mockMvc.perform(get("/api/workouts/calendar")
                        .param("year", "2026")
                        .param("month", "4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days[0].workoutCount").value(1))
                .andExpect(jsonPath("$.days[0].exerciseCount").value(1))
                .andExpect(jsonPath("$.days[0].totalSets").value(1));

        mockMvc.perform(get("/api/workouts/date/2026-04-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].exerciseCount").value(1))
                .andExpect(jsonPath("$[0].totalSets").value(1));

        mockMvc.perform(delete("/api/workouts/{id}", workoutId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/workouts/{id}", workoutId))
                .andExpect(status().isNotFound());
    }

    private long createWorkout() throws Exception {
        String responseBody = mockMvc.perform(post("/api/workouts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "workoutDate", "2026-04-02",
                                "startTime", "09:00",
                                "endTime", "10:00",
                                "memo", "E2E 운동"
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(responseBody);
        return jsonNode.get("id").asLong();
    }

    private long createExercise(long workoutId) throws Exception {
        String responseBody = mockMvc.perform(post("/api/workouts/{workoutId}/exercises", workoutId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "exerciseCatalogId", 1,
                                "displayName", "벤치프레스",
                                "sortOrder", 1,
                                "note", "메인"
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(responseBody).get("id").asLong();
    }

    private void createSet(long exerciseId) throws Exception {
        mockMvc.perform(post("/api/exercises/{exerciseId}/sets", exerciseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "setNumber", 1,
                                "weight", 100.0,
                                "weightUnit", "KG",
                                "reps", 5
                        ))))
                .andExpect(status().isCreated());
    }
}
