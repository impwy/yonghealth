package com.yong.yonghealth.controller;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.dto.ExerciseCatalogResponse;
import com.yong.yonghealth.dto.ExerciseCatalogSearchResponse;
import com.yong.yonghealth.service.ports.in.ExerciseCatalogUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/exercise-catalog")
public class ExerciseCatalogController {

    private final ExerciseCatalogUseCase exerciseCatalogUseCase;

    @GetMapping
    public ResponseEntity<List<ExerciseCatalogResponse>> findAll(
            @RequestParam(required = false) BodyPart category) {
        if (category != null) {
            return ResponseEntity.ok(exerciseCatalogUseCase.findByCategory(category));
        }
        return ResponseEntity.ok(exerciseCatalogUseCase.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<ExerciseCatalogSearchResponse> search(@RequestParam String query) {
        return ResponseEntity.ok(exerciseCatalogUseCase.search(query));
    }
}
