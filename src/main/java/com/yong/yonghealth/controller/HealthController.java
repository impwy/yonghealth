package com.yong.yonghealth.controller;

import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        String dbStatus;
        try (Connection conn = dataSource.getConnection()) {
            dbStatus = conn.isValid(5) ? "UP" : "DOWN";
        } catch (Exception e) {
            dbStatus = "DOWN";
        }
        return ResponseEntity.ok(Map.of("status", "UP", "db", dbStatus));
    }
}
