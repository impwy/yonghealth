package com.yong.yonghealth.domain;

import org.junit.jupiter.api.Test;

import static com.yong.yonghealth.support.TestFixtures.exerciseCatalog;
import static org.assertj.core.api.Assertions.assertThat;

class ExerciseCatalogDomainTest {

    @Test
    void addAlias_addsAliasToCatalog() {
        ExerciseCatalog catalog = exerciseCatalog("벤치프레스", BodyPart.CHEST, true);
        ExerciseCatalogAlias alias = ExerciseCatalogAlias.builder()
                .exerciseCatalog(catalog)
                .alias("bench press")
                .build();

        catalog.addAlias(alias);

        assertThat(catalog.getAliases()).containsExactly(alias);
        assertThat(catalog.getAliases().getFirst().getAlias()).isEqualTo("bench press");
    }
}
