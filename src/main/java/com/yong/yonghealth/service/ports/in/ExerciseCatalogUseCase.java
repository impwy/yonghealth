package com.yong.yonghealth.service.ports.in;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.dto.ExerciseCatalogResponse;
import com.yong.yonghealth.dto.ExerciseCatalogSearchResponse;

import java.util.List;

public interface ExerciseCatalogUseCase {

    List<ExerciseCatalogResponse> findAll();

    List<ExerciseCatalogResponse> findByCategory(BodyPart category);

    ExerciseCatalogSearchResponse search(String query);
}
