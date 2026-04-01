package com.yong.yonghealth.global.config;

import com.yong.yonghealth.repository.ExerciseCatalogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ExerciseCatalogDataInitializerTest {

    @Autowired
    private ExerciseCatalogRepository exerciseCatalogRepository;

    @Autowired
    private ExerciseCatalogDataInitializer exerciseCatalogDataInitializer;

    @Test
    void seedsCatalogDataOnStartup() {
        assertThat(exerciseCatalogRepository.count()).isGreaterThan(40);
        assertThat(exerciseCatalogRepository.findByActiveTrueOrderByNameAsc())
                .extracting("name")
                .contains("벤치프레스", "바벨 스쿼트", "러닝");
    }

    @Test
    void rerun_doesNotCreateDuplicatesWhenDataExists() throws Exception {
        long countBefore = exerciseCatalogRepository.count();

        exerciseCatalogDataInitializer.run(new DefaultApplicationArguments(new String[0]));

        assertThat(exerciseCatalogRepository.count()).isEqualTo(countBefore);
    }
}
