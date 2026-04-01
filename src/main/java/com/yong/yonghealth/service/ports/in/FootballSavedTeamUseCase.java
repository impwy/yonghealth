package com.yong.yonghealth.service.ports.in;

import com.yong.yonghealth.dto.FootballSavedTeamRequest;
import com.yong.yonghealth.dto.FootballSavedTeamResponse;

import java.util.List;

public interface FootballSavedTeamUseCase {

    List<FootballSavedTeamResponse> findAll();

    FootballSavedTeamResponse create(FootballSavedTeamRequest request);
}
