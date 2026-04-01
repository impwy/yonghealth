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
- 티어는 1~6만 허용

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
  - 티어별 셔플
  - 시작 팀 위치 랜덤화
  - 목표 팀 인원 수 계산
  - 목표 인원 수를 넘기지 않는 균등 분배
  - 3개 시나리오 동시 생성

### 타입/API 추가
- `types/index.ts`에 `FootballMember`, `FootballMemberRequest`, `GradeGroup`, `TeamResult`, `TeamScenario` 추가
- `lib/api.ts`에 `footballApi` 추가

---

## 5. 풋볼 편성 규칙

- 회원 티어는 `1`, `2`, `3`, `4`, `5`, `6`을 각각 독립적으로 사용한다.
- 3티어와 4티어는 합치지 않는다.
- 각 티어 그룹 안에서 먼저 무작위로 섞는다.
- 전체 회원 수를 기준으로 팀별 목표 인원 수를 먼저 계산한다.
- 각 그룹마다 시작 팀 위치를 랜덤화하되, 목표 인원 수가 찬 팀은 건너뛴다.
- 결과적으로 팀 간 인원 차이는 최대 1명까지만 허용한다.
- 한 번 생성 시 3개의 랜덤 편성안을 함께 보여준다.

---

## 6. 풋볼 UI/테마 폴리시

### 스타일 토큰
- `globals.css`에 풋볼 전용 컬러 토큰 추가
- `football-shell`, `football-panel`, `football-chip`, `football-pitch-card`, `football-member-card` 클래스 추가

### 화면 폴리시
- 풋볼 히어로 영역 추가
- 티어별 현황 보드 추가
- 회원 목록을 카드형 레이아웃으로 정리
- 랜덤 편성 결과를 피치 스타일 카드로 표현
- 풋볼 Navbar 브랜드를 `SundayFC`로 분기
- 풋볼 모드에서 타이머/새 운동 기록 액션 제거
- 회원 등록을 팝업 모달로 전환
- 회원 목록을 요약/상세 토글 구조로 변경

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

### BUG-4 풋볼 팀 인원 불균형 분배
- 원인: 티어별 라운드 로빈만 적용하고 전체 팀 인원 목표를 계산하지 않아 `10명 / 2팀`에서도 `6:4`가 나올 수 있었음
- 수정:
  - 전체 회원 수와 팀 수로 목표 팀 인원 수를 먼저 계산
  - 추가 슬롯 배정 순서를 랜덤화해 시나리오 다양성 유지
  - 배정 시 목표 인원이 찬 팀은 건너뛰도록 변경

### BUG-5 모바일 회원 등록/목록 UI 과확장
- 원인: 회원 등록 폼과 회원 목록이 한 화면에 항상 펼쳐져 있어 모바일 세로 공간을 과도하게 점유함
- 수정:
  - 회원 등록 폼을 팝업 모달로 이동
  - 회원 목록 기본 상태를 요약 뷰로 변경
  - 상세 목록은 토글로 펼칠 때만 렌더링
  - 회원 추가/삭제 시 기존 편성안 자동 초기화

---

## 8. 로컬 실행 관련 수정 메모

- Docker MySQL 컨테이너 `yonghealth-mysql` 사용 가능
- 환경에 따라 `localhost:3306`이 아닌 `127.0.0.1:3306`으로 실행해야 정상 연결된다.
- 풋볼 화면 검증 시 백엔드를 `8081`, 프론트를 `3000` 또는 `3001`로 우회 실행할 수 있다.

---

## 9. 테스트 체계 정비

### 운영 규칙 반영
- `CLAUDE.md`, `AGENTS.md`에 TDD(`Red → Green → Refactor`) 원칙 추가
- 새 기능/버그 수정 시 테스트 없는 머지 금지 규칙 반영
- `service`, `global`, `domain`, `controller`, `E2E` 전 계층 테스트 원칙 명시

### 정비/확인한 테스트 범위
- Domain logic test:
  - `Workout`, `Exercise`, `ExerciseCatalog`
- Domain persistence/integration test:
  - `Workout` 감사 필드, cascade 삭제
- Service test:
  - `DefaultWorkoutService`
  - `DefaultExerciseService`
  - `DefaultExerciseSetService`
  - `DefaultExerciseCatalogService`
  - `DefaultFootballMemberService`
- Controller slice test:
  - `WorkoutController`
  - `ExerciseController`
  - `ExerciseSetController`
  - `ExerciseCatalogController`
  - `FootballMemberController`
  - `HealthController`
- Global test:
  - `GlobalExceptionHandler`
  - `WebConfig`
  - `ExerciseCatalogDataInitializer`
  - `WeightConverter`
- API E2E test:
  - workout → exercise → set → summary 흐름
  - football member 생성/조회/삭제 흐름
