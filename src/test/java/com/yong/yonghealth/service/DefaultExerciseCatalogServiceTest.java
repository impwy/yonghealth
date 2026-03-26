package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.*;
import com.yong.yonghealth.dto.ExerciseCatalogResponse;
import com.yong.yonghealth.dto.ExerciseCatalogSearchResponse;
import com.yong.yonghealth.repository.ExerciseCatalogRepository;
import com.yong.yonghealth.service.ports.in.ExerciseCatalogUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DefaultExerciseCatalogServiceTest {

    @Autowired
    ExerciseCatalogUseCase exerciseCatalogUseCase;

    @Autowired
    ExerciseCatalogRepository exerciseCatalogRepository;

    private ExerciseCatalog createCatalog(String name, BodyPart category, Equipment equipment,
                                           MovementType movementType, List<String> aliases) {
        ExerciseCatalog catalog = ExerciseCatalog.builder()
                .name(name)
                .category(category)
                .equipment(equipment)
                .movementType(movementType)
                .active(true)
                .build();
        for (String alias : aliases) {
            catalog.addAlias(ExerciseCatalogAlias.builder()
                    .exerciseCatalog(catalog)
                    .alias(alias)
                    .build());
        }
        return exerciseCatalogRepository.save(catalog);
    }

    @Test
    @DisplayName("전체 운동 목록을 조회한다 (seed 데이터 포함)")
    void findAll() {
        // given - seed 데이터가 이미 로드됨
        long countBefore = exerciseCatalogRepository.count();
        createCatalog("서비스 테스트 운동 A", BodyPart.CHEST, Equipment.BARBELL, MovementType.PUSH, List.of());

        // when
        List<ExerciseCatalogResponse> result = exerciseCatalogUseCase.findAll();

        // then
        assertThat(result).hasSize((int) countBefore + 1);
    }

    @Test
    @DisplayName("카테고리별 운동 목록을 조회한다")
    void findByCategory() {
        // when - seed 데이터에서 CORE 카테고리 조회
        List<ExerciseCatalogResponse> result = exerciseCatalogUseCase.findByCategory(BodyPart.CORE);

        // then
        assertThat(result).isNotEmpty();
        assertThat(result).allMatch(r -> r.getCategory() == BodyPart.CORE);
    }

    @Test
    @DisplayName("운동명으로 검색한다")
    void searchByName() {
        // when - seed 데이터에서 "벤치" 검색
        ExerciseCatalogSearchResponse result = exerciseCatalogUseCase.search("벤치프레스");

        // then
        assertThat(result.getQuery()).isEqualTo("벤치프레스");
        assertThat(result.getResultCount()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("별칭으로 검색한다")
    void searchByAlias() {
        // given
        createCatalog("서비스 테스트 운동 B", BodyPart.BACK, Equipment.BARBELL, MovementType.PULL,
                List.of("unique_test_alias_xyz"));

        // when
        ExerciseCatalogSearchResponse result = exerciseCatalogUseCase.search("unique_test_alias_xyz");

        // then
        assertThat(result.getResultCount()).isEqualTo(1);
        assertThat(result.getResults().get(0).getName()).isEqualTo("서비스 테스트 운동 B");
    }

    @Test
    @DisplayName("비활성 운동은 전체 조회에서 제외된다")
    void findAll_excludeInactive() {
        // given
        long countBefore = exerciseCatalogRepository.count();
        ExerciseCatalog inactive = ExerciseCatalog.builder()
                .name("비활성 테스트 운동")
                .category(BodyPart.CHEST)
                .equipment(Equipment.BARBELL)
                .movementType(MovementType.PUSH)
                .active(false)
                .build();
        exerciseCatalogRepository.save(inactive);

        // when
        List<ExerciseCatalogResponse> result = exerciseCatalogUseCase.findAll();

        // then
        assertThat(result).hasSize((int) countBefore);
        assertThat(result).noneMatch(r -> r.getName().equals("비활성 테스트 운동"));
    }

    @Test
    @DisplayName("응답에 별칭 목록이 포함된다")
    void responseIncludesAliases() {
        // given
        createCatalog("서비스 테스트 운동 C", BodyPart.CHEST, Equipment.BARBELL, MovementType.PUSH,
                List.of("alias_a", "alias_b"));

        // when
        ExerciseCatalogSearchResponse result = exerciseCatalogUseCase.search("서비스 테스트 운동 C");

        // then
        assertThat(result.getResults().get(0).getAliases()).containsExactlyInAnyOrder("alias_a", "alias_b");
    }
}
