package com.yong.yonghealth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ExerciseCatalogSearchResponse {

    private String query;
    private int resultCount;
    private List<ExerciseCatalogResponse> results;
}
