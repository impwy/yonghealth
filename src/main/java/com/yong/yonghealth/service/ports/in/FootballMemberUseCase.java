package com.yong.yonghealth.service.ports.in;

import com.yong.yonghealth.dto.FootballMemberRequest;
import com.yong.yonghealth.dto.FootballMemberResponse;

import java.util.List;

public interface FootballMemberUseCase {

    List<FootballMemberResponse> findAll();

    FootballMemberResponse create(FootballMemberRequest request);

    void delete(Long id);
}
