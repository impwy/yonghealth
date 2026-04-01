package com.yong.yonghealth.service;

import com.yong.yonghealth.dto.FootballMemberRequest;
import com.yong.yonghealth.dto.FootballMemberResponse;
import com.yong.yonghealth.repository.FootballMemberRepository;
import com.yong.yonghealth.service.ports.in.FootballMemberUseCase;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DefaultFootballMemberServiceTest {

    @Autowired
    FootballMemberUseCase footballMemberUseCase;

    @Autowired
    FootballMemberRepository footballMemberRepository;

    private FootballMemberRequest createRequest(String name, int grade) {
        return FootballMemberRequest.builder()
                .name(name)
                .grade(grade)
                .build();
    }

    @Test
    @DisplayName("풋볼 회원을 등록한다")
    void create() {
        // given
        FootballMemberRequest request = createRequest("홍길동", 3);

        // when
        FootballMemberResponse response = footballMemberUseCase.create(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getName()).isEqualTo("홍길동");
        assertThat(response.getGrade()).isEqualTo(3);
        assertThat(footballMemberRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("중복 이름으로 등록 시 예외가 발생한다")
    void create_duplicateName() {
        // given
        footballMemberUseCase.create(createRequest("홍길동", 1));

        // when & then
        assertThatThrownBy(() -> footballMemberUseCase.create(createRequest("홍길동", 2)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 등록된 이름입니다");
    }

    @Test
    @DisplayName("전체 회원 목록을 등급순으로 조회한다")
    void findAll() {
        // given
        footballMemberUseCase.create(createRequest("다", 5));
        footballMemberUseCase.create(createRequest("가", 1));
        footballMemberUseCase.create(createRequest("나", 3));

        // when
        List<FootballMemberResponse> result = footballMemberUseCase.findAll();

        // then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getGrade()).isEqualTo(1);
        assertThat(result.get(1).getGrade()).isEqualTo(3);
        assertThat(result.get(2).getGrade()).isEqualTo(5);
    }

    @Test
    @DisplayName("회원을 수정한다")
    void update() {
        // given
        FootballMemberResponse created = footballMemberUseCase.create(createRequest("수정전", 2));

        // when
        FootballMemberResponse updated = footballMemberUseCase.update(created.getId(), createRequest("수정후", 4));

        // then
        assertThat(updated.getName()).isEqualTo("수정후");
        assertThat(updated.getGrade()).isEqualTo(4);
    }

    @Test
    @DisplayName("수정 시 다른 회원과 이름이 중복되면 예외가 발생한다")
    void update_duplicateName() {
        // given
        FootballMemberResponse first = footballMemberUseCase.create(createRequest("홍길동", 1));
        footballMemberUseCase.create(createRequest("김철수", 2));

        // when & then
        assertThatThrownBy(() -> footballMemberUseCase.update(first.getId(), createRequest("김철수", 5)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 등록된 이름입니다");
    }

    @Test
    @DisplayName("회원을 삭제한다")
    void delete() {
        // given
        FootballMemberResponse created = footballMemberUseCase.create(createRequest("삭제대상", 2));

        // when
        footballMemberUseCase.delete(created.getId());

        // then
        assertThat(footballMemberRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 회원 삭제 시 예외가 발생한다")
    void delete_notFound() {
        // when & then
        assertThatThrownBy(() -> footballMemberUseCase.delete(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("회원을 찾을 수 없습니다");
    }
}
