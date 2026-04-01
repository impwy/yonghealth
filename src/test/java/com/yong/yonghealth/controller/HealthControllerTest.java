package com.yong.yonghealth.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DataSource dataSource;

    @Test
    void health_returnsDbUpWhenConnectionValid() throws Exception {
        Connection connection = org.mockito.Mockito.mock(Connection.class);
        given(dataSource.getConnection()).willReturn(connection);
        given(connection.isValid(5)).willReturn(true);

        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.db").value("UP"));
    }

    @Test
    void health_returnsDbDownWhenConnectionFails() throws Exception {
        given(dataSource.getConnection()).willThrow(new RuntimeException("db down"));

        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.db").value("DOWN"));
    }
}
