package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.dto.ExerciseCatalogResponse;
import com.yong.yonghealth.dto.ExerciseCatalogSearchResponse;
import com.yong.yonghealth.repository.ExerciseCatalogRepository;
import com.yong.yonghealth.service.ports.in.ExerciseCatalogUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultExerciseCatalogService implements ExerciseCatalogUseCase {

    private final ExerciseCatalogRepository exerciseCatalogRepository;

    @Override
    public List<ExerciseCatalogResponse> findAll() {
        return exerciseCatalogRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(ExerciseCatalogResponse::from)
                .toList();
    }

    @Override
    public List<ExerciseCatalogResponse> findByCategory(BodyPart category) {
        return exerciseCatalogRepository.findByCategoryAndActiveTrueOrderByNameAsc(category).stream()
                .map(ExerciseCatalogResponse::from)
                .toList();
    }

    @Override
    public ExerciseCatalogSearchResponse search(String query) {
        List<ExerciseCatalogResponse> results = exerciseCatalogRepository.searchByNameOrAlias(query).stream()
                .map(ExerciseCatalogResponse::from)
                .toList();

        return ExerciseCatalogSearchResponse.builder()
                .query(query)
                .resultCount(results.size())
                .results(results)
                .build();
    }
}
