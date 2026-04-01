package com.yong.yonghealth.global.error;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void handlesEntityNotFound() throws Exception {
        mockMvc.perform(get("/test/errors/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("없음"));
    }

    @Test
    void handlesValidationFailure() throws Exception {
        mockMvc.perform(post("/test/errors/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ValidationRequest(""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("name")));
    }

    @Test
    void handlesIllegalArgument() throws Exception {
        mockMvc.perform(get("/test/errors/illegal-argument"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 요청"));
    }

    @Test
    void handlesIllegalState() throws Exception {
        mockMvc.perform(get("/test/errors/illegal-state"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("중복 상태"));
    }

    @Test
    void handlesDataIntegrityViolation() throws Exception {
        mockMvc.perform(get("/test/errors/data-integrity"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("중복된 데이터입니다"));
    }

    @RestController
    static class TestController {

        @GetMapping("/test/errors/not-found")
        String notFound() {
            throw new EntityNotFoundException("없음");
        }

        @PostMapping("/test/errors/validation")
        String validation(@Valid @RequestBody ValidationRequest request) {
            return request.name();
        }

        @GetMapping("/test/errors/illegal-argument")
        String illegalArgument() {
            throw new IllegalArgumentException("잘못된 요청");
        }

        @GetMapping("/test/errors/illegal-state")
        String illegalState() {
            throw new IllegalStateException("중복 상태");
        }

        @GetMapping("/test/errors/data-integrity")
        String dataIntegrity() {
            throw new DataIntegrityViolationException("duplicate");
        }
    }

    record ValidationRequest(@NotBlank String name) {
    }
}
