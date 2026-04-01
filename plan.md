# YongHealth v2 - 구현 계획서

## 1. 기술 스택

| 항목 | 기술 |
|---|---|
| Backend | Spring Boot 4.0.4, Java 25, Gradle (Kotlin DSL), JPA |
| Frontend | Next.js 16.2.1 (App Router), TypeScript, Tailwind CSS 4 |
| DB (개발) | MySQL 8 (Docker) |
| DB (테스트) | H2 인메모리 |
| DB (운영) | PostgreSQL (Neon) |
| 배포 | Render (백엔드) + Vercel (프론트엔드) |

---

## 2. 백엔드 구조

```
com.yong.yonghealth/
├── domain/
│   ├── Workout, Exercise, ExerciseSet, WeightUnit, BaseTimeEntity
│   ├── ExerciseCatalog, ExerciseCatalogAlias
│   ├── BodyPart, Equipment, MovementType
│   └── FootballMember
├── dto/
│   ├── Workout / Exercise / Set 관련 DTO
│   ├── WorkoutCalendarSummaryResponse, WorkoutDateSummaryResponse
│   ├── ExerciseCatalogResponse, ExerciseCatalogSearchResponse
│   └── FootballMemberRequest, FootballMemberResponse
├── repository/
│   ├── Workout / Exercise / Set Repository
│   ├── ExerciseCatalogRepository, ExerciseCatalogAliasRepository
│   └── FootballMemberRepository
├── service/
│   ├── DefaultWorkoutService, DefaultExerciseService, DefaultExerciseSetService
│   ├── DefaultExerciseCatalogService
│   └── DefaultFootballMemberService
├── service/ports/in/
│   ├── WorkoutUseCase, ExerciseUseCase, ExerciseSetUseCase
│   ├── ExerciseCatalogUseCase
│   └── FootballMemberUseCase
└── controller/
    ├── WorkoutController, ExerciseController, ExerciseSetController
    ├── ExerciseCatalogController
    └── FootballMemberController
```

---

## 3. 프론트엔드 구조

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── football/page.tsx
│   └── workouts/
│       ├── new/page.tsx
│       ├── date/[date]/page.tsx
│       └── [id]/page.tsx
├── components/
│   ├── WorkoutCalendar.tsx
│   ├── WorkoutDaySheet.tsx
│   ├── WorkoutForm.tsx
│   ├── WorkoutCard.tsx
│   ├── ExerciseAccordion.tsx
│   ├── ExercisePicker.tsx
│   ├── SetTable.tsx
│   ├── football/
│   │   ├── FootballPage.tsx
│   │   ├── MemberForm.tsx
│   │   ├── MemberList.tsx
│   │   └── TeamGenerator.tsx
│   └── ui/
│       ├── Navbar.tsx
│       ├── BottomNav.tsx
│       ├── AppSidebar.tsx
│       ├── TimerSheet.tsx
│       ├── EmptyState.tsx
│       ├── Skeleton.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── contexts/TimerContext.tsx
├── lib/
│   ├── api.ts
│   └── teamGenerator.ts
└── types/index.ts
```

---

## 4. 구현 Phase

### Phase 1: Exercise 엔티티 변경
1. Exercise에 `exerciseCatalogId`, `displayName`, `customName`, `note` 추가
2. 기존 `name` 필드를 `displayName` 중심 구조로 전환
3. DTO, 서비스, 테스트 정비

### Phase 2: ExerciseCatalog 도메인
1. 카탈로그/별칭 엔티티 및 enum 추가
2. 목록/검색 API 추가
3. 초기 시드 데이터 반영

### Phase 3: 달력 조회 API
1. 월간 달력 요약 API 추가
2. 날짜별 운동 목록 API 추가
3. 프론트 달력 대시보드에서 사용할 응답 구조 정리

### Phase 4: 프론트엔드 타입/API 업데이트
1. 카탈로그/달력 관련 타입 추가
2. 기존 Exercise 타입을 displayName 구조에 맞춰 정리
3. `lib/api.ts`에 calendar/date/catalog API 추가

### Phase 5: 달력 홈 화면
1. WorkoutCalendar 구현
2. WorkoutDaySheet 구현
3. `/`를 달력 대시보드로 전환
4. BottomNav 도입

### Phase 6: 날짜별 운동 목록
1. `/workouts/date/[date]` 구현
2. 날짜별 세션 목록과 CTA 연결

### Phase 7: 운동 선택 UI
1. ExercisePicker 구현
2. WorkoutForm/세션 상세에 연동
3. 직접 입력 fallback 제공

### Phase 8: 모바일 UI 최적화
1. 모바일 레이아웃, 하단 여백, 터치 타겟 정리
2. 시트/모달/카테고리 스크롤 UX 개선

### Phase 9: 성능/배포 개선
1. `/health` 엔드포인트 추가
2. 콜드스타트 로딩 UI 추가
3. 빌드/배포 검증

### Phase 10: 쉬는 시간 타이머
1. TimerContext 기반 전역 타이머 구현
2. TimerSheet, Navbar, BottomNav 연동
3. 진동/오디오/시각 종료 알림 추가

### Phase 11: 레이어/프리셋 버그 수정
1. ExercisePicker Portal 적용
2. TimerSheet iPhone 프리셋 가림 문제 수정

### Phase 12: UI 디자인 개선
1. 커스텀 컬러 테마 정비
2. EmptyState/Skeleton 공통 UI 추가
3. 달력, 시트, 아코디언, 세트 입력 레이아웃 리디자인

### Phase 13: 풋볼 모드 추가
1. `FootballMember` 도메인 및 API 추가
2. `/football` 페이지 추가
3. AppSidebar 기반 헬스/풋볼 전환 구조 추가
4. 회원 등록/목록/삭제 UI 구현
5. 티어별 랜덤 팀 편성 로직 추가
6. 3개 시나리오 비교 UI 추가
7. 풋볼 전용 테마 CSS 적용

### Bug Fix: 풋볼 팀 수 입력 고정 문제
1. 팀 수를 number input에 즉시 숫자로 강제하던 로직 제거
2. 문자열 입력 상태와 실제 팀 수 상태를 분리
3. blur/Enter 시점에만 정규화
4. `+/-` 스텝 버튼 추가

### Phase 14: 풋볼 편성 규칙/모바일 UX 정비
1. 팀 편성 로직을 총 인원 기준 균등 분배 방식으로 변경
2. `10명 -> 5:5`, `9명 -> 5:4`, `12명/3팀 -> 4:4:4` 같은 목표 인원 수 계산 로직 추가
3. 티어별 셔플은 유지하되, 이미 목표 인원이 찬 팀은 건너뛰도록 조정
4. 회원 등록 폼을 팝업 모달로 변경
5. 회원 목록을 요약/상세 토글 구조로 변경
6. 회원 추가/삭제 후 기존 편성안 자동 초기화

### Phase 15: TDD 테스트 기반 확장
1. `CLAUDE.md`, `AGENTS.md`에 TDD와 테스트 커버리지 원칙 명시
2. domain logic test 추가
3. service integration test 정비
4. controller slice test 정비
5. global(config/error/util) test 추가
6. 핵심 시나리오 API E2E test 추가

---

## 5. 로컬 실행 메모

### 기본 실행
- Backend: `./gradlew bootRun`
- Frontend: `cd frontend && npm run dev`

### Docker MySQL 사용 시
- 개발 DB 컨테이너: `yonghealth-mysql`
- 기본 application.yml은 `localhost:3306`을 사용한다.
- 환경에 따라 `localhost`가 IPv6로 해석되어 접속 실패할 수 있다.
- 이 경우 아래처럼 `127.0.0.1`로 강제 실행한다.

```bash
./gradlew bootRun --args='--spring.datasource.url=jdbc:mysql://127.0.0.1:3306/yonghealth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul'
```

### 화면 확인용 병행 실행
- 이미 8080이 사용 중이면 백엔드를 8081로 실행한다.
- 프론트는 `NEXT_PUBLIC_API_URL`을 맞춰 실행한다.

```bash
./gradlew bootRun --args='--server.port=8081 --spring.datasource.url=jdbc:mysql://127.0.0.1:3306/yonghealth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul'
cd frontend && NEXT_PUBLIC_API_URL=http://127.0.0.1:8081 npm run dev
```

### 풋볼 화면 확인 포인트
- 풋볼 Navbar 브랜드는 `SundayFC`로 보여야 한다.
- 풋볼 모드에서는 상단 타이머와 `새 운동 기록` 버튼이 없어야 한다.
- 회원 목록 기본 상태는 요약 뷰여야 하며, 모바일에서 등록 팝업이 목록 영역 높이를 밀어내면 안 된다.
- 팀 생성 전 예상 인원 수가 총원 기준 균등하게 보여야 한다.
