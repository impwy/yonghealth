package com.yong.yonghealth.domain;

import com.yong.yonghealth.repository.ExerciseCatalogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ExerciseCatalogTest {

    @Autowired
    ExerciseCatalogRepository exerciseCatalogRepository;

    @Test
    @DisplayName("ExerciseCatalog을 생성한다")
    void create() {
        // given
        ExerciseCatalog catalog = ExerciseCatalog.builder()
                .name("테스트 운동 A")
                .category(BodyPart.CHEST)
                .equipment(Equipment.BARBELL)
                .movementType(MovementType.PUSH)
                .active(true)
                .build();

        // when
        ExerciseCatalog saved = exerciseCatalogRepository.save(catalog);

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("테스트 운동 A");
        assertThat(saved.getCategory()).isEqualTo(BodyPart.CHEST);
        assertThat(saved.getEquipment()).isEqualTo(Equipment.BARBELL);
        assertThat(saved.getMovementType()).isEqualTo(MovementType.PUSH);
        assertThat(saved.isActive()).isTrue();
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Alias를 포함하여 생성한다")
    void createWithAliases() {
        // given
        ExerciseCatalog catalog = ExerciseCatalog.builder()
                .name("테스트 운동 B")
                .category(BodyPart.CHEST)
                .equipment(Equipment.BARBELL)
                .movementType(MovementType.PUSH)
                .active(true)
                .build();

        catalog.addAlias(ExerciseCatalogAlias.builder()
                .exerciseCatalog(catalog)
                .alias("test alias 1")
                .build());
        catalog.addAlias(ExerciseCatalogAlias.builder()
                .exerciseCatalog(catalog)
                .alias("test alias 2")
                .build());

        // when
        ExerciseCatalog saved = exerciseCatalogRepository.save(catalog);
        exerciseCatalogRepository.flush();

        ExerciseCatalog found = exerciseCatalogRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getAliases()).hasSize(2);
        assertThat(found.getAliases().stream().map(ExerciseCatalogAlias::getAlias).toList())
                .containsExactlyInAnyOrder("test alias 1", "test alias 2");
    }

    @Test
    @DisplayName("Catalog 삭제 시 Alias도 Cascade 삭제된다")
    void cascadeDelete() {
        // given
        ExerciseCatalog catalog = ExerciseCatalog.builder()
                .name("테스트 운동 C")
                .category(BodyPart.CHEST)
                .equipment(Equipment.BARBELL)
                .movementType(MovementType.PUSH)
                .active(true)
                .build();
        catalog.addAlias(ExerciseCatalogAlias.builder()
                .exerciseCatalog(catalog)
                .alias("test alias")
                .build());

        exerciseCatalogRepository.save(catalog);
        exerciseCatalogRepository.flush();

        long countBefore = exerciseCatalogRepository.count();

        // when
        exerciseCatalogRepository.delete(catalog);
        exerciseCatalogRepository.flush();

        // then
        assertThat(exerciseCatalogRepository.count()).isEqualTo(countBefore - 1);
    }
}
