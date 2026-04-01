package com.yong.yonghealth.controller;

import com.yong.yonghealth.dto.FootballMemberRequest;
import com.yong.yonghealth.dto.FootballMemberResponse;
import com.yong.yonghealth.service.ports.in.FootballMemberUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/football/members")
@RequiredArgsConstructor
public class FootballMemberController {

    private final FootballMemberUseCase footballMemberUseCase;

    @GetMapping
    public ResponseEntity<List<FootballMemberResponse>> findAll() {
        return ResponseEntity.ok(footballMemberUseCase.findAll());
    }

    @PostMapping
    public ResponseEntity<FootballMemberResponse> create(@Valid @RequestBody FootballMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(footballMemberUseCase.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        footballMemberUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
