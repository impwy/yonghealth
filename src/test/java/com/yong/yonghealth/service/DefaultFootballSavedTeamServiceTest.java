package com.yong.yonghealth.service;

import com.yong.yonghealth.dto.FootballSavedTeamRequest;
import com.yong.yonghealth.dto.FootballSavedTeamResponse;
import com.yong.yonghealth.repository.FootballSavedTeamRepository;
import com.yong.yonghealth.service.ports.in.FootballSavedTeamUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import jakarta.persistence.EntityNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DefaultFootballSavedTeamServiceTest {

    @Autowired
    FootballSavedTeamUseCase footballSavedTeamUseCase;

    @Autowired
    FootballSavedTeamRepository footballSavedTeamRepository;

    @Test
    @DisplayName("선택된 랜덤 팀 편성을 스냅샷으로 저장한다")
    void create() {
        FootballSavedTeamRequest request = FootballSavedTeamRequest.builder()
                .name("일요 2팀")
                .teams(List.of(
                        FootballSavedTeamRequest.TeamRequest.builder()
                                .teamNumber(1)
                                .members(List.of(
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberId(1L)
                                                .memberName("김재민")
                                                .memberGrade(1)
                                                .build(),
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberId(2L)
                                                .memberName("박원용")
                                                .memberGrade(3)
                                                .build()
                                ))
                                .build(),
                        FootballSavedTeamRequest.TeamRequest.builder()
                                .teamNumber(2)
                                .members(List.of(
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberId(3L)
                                                .memberName("최민수")
                                                .memberGrade(2)
                                                .build()
                                ))
                                .build()
                ))
                .build();

        FootballSavedTeamResponse response = footballSavedTeamUseCase.create(request);

        assertThat(response.getId()).isNotNull();
        assertThat(response.getName()).isEqualTo("일요 2팀");
        assertThat(response.getTeamCount()).isEqualTo(2);
        assertThat(response.getTeams()).hasSize(2);
        assertThat(response.getTeams().getFirst().getMembers().getFirst().getMemberName()).isEqualTo("김재민");
        assertThat(footballSavedTeamRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("팀 번호가 중복되면 저장에 실패한다")
    void create_duplicateTeamNumber() {
        FootballSavedTeamRequest request = FootballSavedTeamRequest.builder()
                .name("중복 팀")
                .teams(List.of(
                        FootballSavedTeamRequest.TeamRequest.builder()
                                .teamNumber(1)
                                .members(List.of(
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberName("A")
                                                .memberGrade(1)
                                                .build()
                                ))
                                .build(),
                        FootballSavedTeamRequest.TeamRequest.builder()
                                .teamNumber(1)
                                .members(List.of(
                                        FootballSavedTeamRequest.MemberRequest.builder()
                                                .memberName("B")
                                                .memberGrade(2)
                                                .build()
                                ))
                                .build()
                ))
                .build();

        assertThatThrownBy(() -> footballSavedTeamUseCase.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("팀 번호는 중복될 수 없습니다");
    }

    @Test
    @DisplayName("보관된 팀을 삭제한다")
    void delete() {
        FootballSavedTeamResponse created = footballSavedTeamUseCase.create(
                FootballSavedTeamRequest.builder()
                        .name("삭제 대상 팀")
                        .teams(List.of(
                                FootballSavedTeamRequest.TeamRequest.builder()
                                        .teamNumber(1)
                                        .members(List.of(
                                                FootballSavedTeamRequest.MemberRequest.builder()
                                                        .memberId(1L).memberName("A").memberGrade(1).build()
                                        )).build(),
                                FootballSavedTeamRequest.TeamRequest.builder()
                                        .teamNumber(2)
                                        .members(List.of(
                                                FootballSavedTeamRequest.MemberRequest.builder()
                                                        .memberId(2L).memberName("B").memberGrade(2).build()
                                        )).build()
                        )).build()
        );

        footballSavedTeamUseCase.delete(created.getId());

        assertThat(footballSavedTeamRepository.findById(created.getId())).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 보관 팀 삭제 시 EntityNotFoundException")
    void delete_notFound() {
        assertThatThrownBy(() -> footballSavedTeamUseCase.delete(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("보관된 팀을 찾을 수 없습니다");
    }
}
