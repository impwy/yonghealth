package com.yong.yonghealth.repository;

import com.yong.yonghealth.domain.FootballMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FootballMemberRepository extends JpaRepository<FootballMember, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<FootballMember> findAllByOrderByGradeAscNameAsc();
}
