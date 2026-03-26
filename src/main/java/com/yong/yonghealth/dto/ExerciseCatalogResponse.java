package com.yong.yonghealth.dto;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.domain.Equipment;
import com.yong.yonghealth.domain.ExerciseCatalog;
import com.yong.yonghealth.domain.MovementType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ExerciseCatalogResponse {

    private Long id;
    private String name;
    private BodyPart category;
    private Equipment equipment;
    private MovementType movementType;
    private List<String> aliases;

    public static ExerciseCatalogResponse from(ExerciseCatalog catalog) {
        return ExerciseCatalogResponse.builder()
                .id(catalog.getId())
                .name(catalog.getName())
                .category(catalog.getCategory())
                .equipment(catalog.getEquipment())
                .movementType(catalog.getMovementType())
                .aliases(catalog.getAliases().stream()
                        .map(a -> a.getAlias())
                        .toList())
                .build();
    }
}
