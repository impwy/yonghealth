# YongHealth v2 - 변경 사항 정리

## 1. 기존 운동 일지 기능 정리

### 도메인/백엔드
- Exercise를 `displayName` 중심 구조로 전환
- ExerciseCatalog / ExerciseCatalogAlias / 관련 enum 추가
- 달력 조회 API, 날짜별 목록 API 추가
- `/health` 엔드포인트 추가
- 세트 중복 생성 방지를 위해 `(exercise_id, set_number)` unique 제약과 버전 필드 적용

### 프론트엔드
- 메인 페이지를 달력 대시보드로 전환
- 날짜별 운동 목록 페이지 추가
- ExercisePicker, BottomNav, TimerSheet 추가
- 모바일 UI와 공통 UI 컴포넌트 정리

---

## 2. 풋볼 기능 추가

### 신규 백엔드 도메인
- `FootballMember` 엔티티 추가
- `FootballMemberRepository` 추가
- `FootballMemberUseCase` / `DefaultFootballMemberService` 추가
- `FootballMemberController` 추가
- `FootballMemberRequest`, `FootballMemberResponse` DTO 추가

### 신규 API
- `GET /api/football/members`
- `POST /api/football/members`
- `DELETE /api/football/members/{id}`

### 검증 규칙
- 이름 필수
- 이름 중복 불가
- 등급은 1~6만 허용

---

## 3. 앱 레이아웃 변경

### 공통 네비게이션
- `AppSidebar` 추가
- 데스크탑: 좌측 세로 사이드바
- 모바일: 상단 탭 바
- `헬스` / `풋볼` 화면 전환 제공

### 기존 네비게이션 조정
- 풋볼 페이지에서는 모바일 `BottomNav` 숨김
- 풋볼 모드에서는 사이드바 강조색을 풋볼 테마로 전환

---

## 4. 풋볼 프론트엔드 화면 추가

### 신규 페이지
- `frontend/src/app/football/page.tsx`

### 신규 컴포넌트
- `FootballPage.tsx`
- `MemberForm.tsx`
- `MemberList.tsx`
- `TeamGenerator.tsx`

### 신규 로직
- `frontend/src/lib/teamGenerator.ts`
  - 등급별 셔플
  - 시작 팀 위치 랜덤화
  - 라운드 로빈 분배
  - 3개 시나리오 동시 생성

### 타입/API 추가
- `types/index.ts`에 `FootballMember`, `FootballMemberRequest`, `GradeGroup`, `TeamResult`, `TeamScenario` 추가
- `lib/api.ts`에 `footballApi` 추가

---

## 5. 풋볼 편성 규칙

- 회원 등급은 `1`, `2`, `3`, `4`, `5`, `6`을 각각 독립적으로 사용한다.
- 3등급과 4등급은 합치지 않는다.
- 각 등급 그룹 안에서 먼저 무작위로 섞는다.
- 각 그룹마다 시작 팀 위치를 랜덤화한 뒤 순차 분배한다.
- 한 번 생성 시 3개의 랜덤 편성안을 함께 보여준다.

---

## 6. 풋볼 UI/테마 폴리시

### 스타일 토큰
- `globals.css`에 풋볼 전용 컬러 토큰 추가
- `football-shell`, `football-panel`, `football-chip`, `football-pitch-card`, `football-member-card` 클래스 추가

### 화면 폴리시
- 풋볼 히어로 영역 추가
- 등급별 현황 보드 추가
- 회원 목록을 카드형 레이아웃으로 정리
- 랜덤 편성 결과를 피치 스타일 카드로 표현

---

## 7. 버그 수정

### BUG-1 ExercisePicker 레이어 겹침
- Portal 적용
- z-index 계층 정리

### BUG-2 TimerSheet 프리셋 가림
- 시트 높이와 스크롤 영역 조정
- 홈 인디케이터 safe area 대응

### BUG-3 풋볼 팀 수 입력 고정 문제
- 원인: number input 변경값을 즉시 숫자로 강제하면서 빈 입력이 바로 `2`로 복원됨
- 수정:
  - 입력 문자열 상태와 실제 팀 수 상태를 분리
  - blur / Enter 시점에만 정규화
  - `+/-` 스텝 버튼 추가

---

## 8. 로컬 실행 관련 수정 메모

- Docker MySQL 컨테이너 `yonghealth-mysql` 사용 가능
- 환경에 따라 `localhost:3306`이 아닌 `127.0.0.1:3306`으로 실행해야 정상 연결된다.
- 풋볼 화면 검증 시 백엔드를 `8081`, 프론트를 `3000` 또는 `3001`로 우회 실행할 수 있다.
