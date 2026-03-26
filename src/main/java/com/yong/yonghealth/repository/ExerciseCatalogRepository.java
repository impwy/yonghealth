package com.yong.yonghealth.repository;

import com.yong.yonghealth.domain.BodyPart;
import com.yong.yonghealth.domain.ExerciseCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseCatalogRepository extends JpaRepository<ExerciseCatalog, Long> {

    List<ExerciseCatalog> findByCategoryAndActiveTrueOrderByNameAsc(BodyPart category);

    List<ExerciseCatalog> findByActiveTrueOrderByNameAsc();

    @Query("SELECT DISTINCT c FROM ExerciseCatalog c LEFT JOIN c.aliases a " +
            "WHERE c.active = true AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.alias) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY c.name ASC")
    List<ExerciseCatalog> searchByNameOrAlias(@Param("query") String query);
}
