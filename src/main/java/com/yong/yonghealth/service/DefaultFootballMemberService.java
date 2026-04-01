package com.yong.yonghealth.service;

import com.yong.yonghealth.domain.FootballMember;
import com.yong.yonghealth.dto.FootballMemberRequest;
import com.yong.yonghealth.dto.FootballMemberResponse;
import com.yong.yonghealth.repository.FootballMemberRepository;
import com.yong.yonghealth.service.ports.in.FootballMemberUseCase;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefaultFootballMemberService implements FootballMemberUseCase {

    private final FootballMemberRepository footballMemberRepository;

    @Override
    public List<FootballMemberResponse> findAll() {
        return footballMemberRepository.findAllByOrderByGradeAscNameAsc().stream()
                .map(FootballMemberResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public FootballMemberResponse create(FootballMemberRequest request) {
        if (footballMemberRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("이미 등록된 이름입니다: " + request.getName());
        }

        FootballMember member = FootballMember.builder()
                .name(request.getName())
                .grade(request.getGrade())
                .build();

        return FootballMemberResponse.from(footballMemberRepository.save(member));
    }

    @Override
    @Transactional
    public FootballMemberResponse update(Long id, FootballMemberRequest request) {
        FootballMember member = footballMemberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. id=" + id));

        if (footballMemberRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("이미 등록된 이름입니다: " + request.getName());
        }

        member.update(request.getName(), request.getGrade());
        return FootballMemberResponse.from(member);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        FootballMember member = footballMemberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. id=" + id));
        footballMemberRepository.delete(member);
    }
}
