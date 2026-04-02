package com.yong.yonghealth.controller;

import com.yong.yonghealth.dto.FootballSavedTeamRequest;
import com.yong.yonghealth.dto.FootballSavedTeamResponse;
import com.yong.yonghealth.service.ports.in.FootballSavedTeamUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/football/saved-teams")
@RequiredArgsConstructor
public class FootballSavedTeamController {

    private final FootballSavedTeamUseCase footballSavedTeamUseCase;

    @GetMapping
    public ResponseEntity<List<FootballSavedTeamResponse>> findAll() {
        return ResponseEntity.ok(footballSavedTeamUseCase.findAll());
    }

    @PostMapping
    public ResponseEntity<FootballSavedTeamResponse> create(@Valid @RequestBody FootballSavedTeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(footballSavedTeamUseCase.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        footballSavedTeamUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
