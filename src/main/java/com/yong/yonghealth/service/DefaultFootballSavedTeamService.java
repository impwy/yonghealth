package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.FootballSavedTeam;
import com.yong.yonghealth.domain.FootballSavedTeamMember;
import com.yong.yonghealth.dto.FootballSavedTeamRequest;
import com.yong.yonghealth.dto.FootballSavedTeamResponse;
import com.yong.yonghealth.repository.FootballSavedTeamRepository;
import com.yong.yonghealth.service.ports.in.FootballSavedTeamUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultFootballSavedTeamService implements FootballSavedTeamUseCase {

    private static final DateTimeFormatter DEFAULT_NAME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final FootballSavedTeamRepository footballSavedTeamRepository;

    @Override
    public List<FootballSavedTeamResponse> findAll() {
        return footballSavedTeamRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(FootballSavedTeamResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public FootballSavedTeamResponse create(FootballSavedTeamRequest request) {
        validateTeams(request);

        FootballSavedTeam savedTeam = FootballSavedTeam.builder()
                .name(resolveName(request.getName(), request.getTeams().size()))
                .teamCount(request.getTeams().size())
                .build();

        for (FootballSavedTeamRequest.TeamRequest teamRequest : request.getTeams()) {
            for (int i = 0; i < teamRequest.getMembers().size(); i++) {
                FootballSavedTeamRequest.MemberRequest memberRequest = teamRequest.getMembers().get(i);
                savedTeam.addMemberSnapshot(FootballSavedTeamMember.builder()
                        .sourceMemberId(memberRequest.getMemberId())
                        .memberName(memberRequest.getMemberName())
                        .memberGrade(memberRequest.getMemberGrade())
                        .teamNumber(teamRequest.getTeamNumber())
                        .sortOrder(i + 1)
                        .build());
            }
        }

        return FootballSavedTeamResponse.from(footballSavedTeamRepository.save(savedTeam));
    }

    private void validateTeams(FootballSavedTeamRequest request) {
        if (request.getTeams() == null || request.getTeams().size() < 2) {
            throw new IllegalArgumentException("보관할 팀 편성은 최소 2팀 이상이어야 합니다");
        }

        Set<Integer> teamNumbers = new HashSet<>();
        for (FootballSavedTeamRequest.TeamRequest teamRequest : request.getTeams()) {
            if (!teamNumbers.add(teamRequest.getTeamNumber())) {
                throw new IllegalArgumentException("팀 번호는 중복될 수 없습니다");
            }
        }
    }

    private String resolveName(String name, int teamCount) {
        String trimmedName = name == null ? "" : name.trim();
        if (!trimmedName.isEmpty()) {
            return trimmedName;
        }

        return DEFAULT_NAME_FORMAT.format(LocalDateTime.now()) + " " + teamCount + "팀 편성";
    }
}
