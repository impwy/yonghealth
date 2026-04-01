package com.yong.yonghealth.repository;

import com.yong.yonghealth.domain.FootballSavedTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FootballSavedTeamRepository extends JpaRepository<FootballSavedTeam, Long> {

    List<FootballSavedTeam> findAllByOrderByCreatedAtDesc();
}
