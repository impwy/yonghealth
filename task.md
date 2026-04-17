# YongHealth v2 - 구현 현황

## Backend

### Phase 1: Exercise 엔티티 변경 ✅
- [x] Exercise에 exerciseCatalogId(Long, nullable), displayName, customName, note 추가
- [x] 기존 name → displayName 대체
- [x] ExerciseRequest, ExerciseResponse DTO 수정
- [x] DefaultExerciseService 수정
- [x] 기존 테스트 수정 + 신규 테스트 추가 (카탈로그 ID, 커스텀명 포함 생성/수정)
- [x] `./gradlew test` 통과

### Phase 2: ExerciseCatalog 도메인 ✅
- [x] ExerciseCatalog, ExerciseCatalogAlias 엔티티 생성
- [x] BodyPart, Equipment, MovementType enum 생성
- [x] ExerciseCatalogRepository, ExerciseCatalogAliasRepository 생성
- [x] ExerciseCatalogUseCase 인터페이스 생성
- [x] DefaultExerciseCatalogService 구현
- [x] ExerciseCatalogController 구현 (목록, 검색, 카테고리별 조회)
- [x] ExerciseCatalogResponse, ExerciseCatalogSearchResponse DTO 생성
- [x] 초기 seed 데이터 (ExerciseCatalogDataInitializer - 56종 운동)
- [x] 도메인/서비스/컨트롤러 테스트 작성 및 `./gradlew test` 통과

### Phase 3: 달력 조회 API ✅
- [x] WorkoutCalendarSummaryResponse DTO 생성
- [x] WorkoutDateSummaryResponse DTO 생성
- [x] 월간 달력 요약 API: GET /api/workouts/calendar?year=&month=
- [x] 날짜별 운동 목록 API: GET /api/workouts/date/{date}
- [x] WorkoutRepository에 findByWorkoutDateBetween 쿼리 추가 (exercises fetch join)
- [x] 서비스/컨트롤러 테스트 작성 및 `./gradlew test` 통과

## Frontend

### Phase 4: 타입/API 업데이트 ✅
- [x] types/index.ts에 ExerciseCatalog, Calendar, BodyPart, Equipment, MovementType 타입 추가
- [x] Exercise 타입 변경 (displayName, customName, exerciseCatalogId, note)
- [x] api.ts에 calendarSummary, dateSummary, exerciseCatalog API 추가
- [x] 기존 컴포넌트/페이지 name → displayName 마이그레이션
- [x] `npx next build` 통과

### Phase 5: 달력 홈 화면 ✅
- [x] WorkoutCalendar 컴포넌트 구현 (월간 달력, dot 표시, 월 이동, 오늘 버튼)
- [x] WorkoutDaySheet 컴포넌트 구현 (모바일 하단 시트 + 데스크탑 인라인)
- [x] app/page.tsx 달력 대시보드로 교체
- [x] BottomNav 컴포넌트 구현 (모바일 하단 네비)
- [x] Navbar 단순화 (모바일에서 "새 운동" 버튼 숨김)
- [x] WorkoutForm에 initialDate prop 추가 (달력에서 날짜 전달)
- [x] `npx next build` 통과

### Phase 6: 날짜별 운동 목록 ✅
- [x] app/workouts/date/[date]/page.tsx 구현
- [x] 날짜별 세션 목록 조회 및 표시 (시간, 메모, 종목/세트 수)
- [x] 세션 상세 페이지 이동 연결
- [x] "운동 기록 추가" CTA (날짜 전달)
- [x] `npx next build` 통과

### Phase 7: 운동 선택 UI ✅
- [x] ExercisePicker 컴포넌트 구현 (검색, 카테고리 필터, 직접 입력)
- [x] WorkoutForm에 ExercisePicker 연동
- [x] 세션 상세 페이지에 ExercisePicker 연동
- [x] 직접 입력 fallback
- [x] `npx next build` 통과

### Phase 8: 모바일 UI 최적화 ✅
- [x] 전체 페이지 pb-16 하단 여백 (BottomNav 대응)
- [x] WorkoutDaySheet 하단 시트 (모바일) / 인라인 패널 (데스크탑)
- [x] ExercisePicker 풀스크린 모달 (모바일) / 중앙 모달 (데스크탑)
- [x] 카테고리 필터 가로 스크롤 (no-scrollbar)
- [x] 터치 타겟 44px+ 유지
- [x] `npx next build` 통과

### Phase 9: 성능/배포 개선 ✅
- [x] Health check 엔드포인트 (`GET /health`)
- [x] 프론트엔드 콜드스타트 로딩 상태 (각 페이지에 로딩 UI 포함)
- [x] 최종 빌드 검증: `./gradlew test` 통과 + `npx next build` 통과

### Phase 10: 쉬는 시간 타이머 ✅
- [x] TimerContext 구현 (deadline 기반 카운트다운, visibilitychange 대응)
- [x] Providers 클라이언트 래퍼 → layout.tsx 전역 상태 주입
- [x] TimerSheet 구현 (프리셋 60/90/120/180초, ±15초 조절, 일시정지/리셋)
- [x] 종료 알림 (Vibration API + AudioContext + 시각 효과)
- [x] BottomNav(모바일)에 타이머 진입점 (남은 시간 표시)
- [x] Navbar(데스크탑)에 타이머 진입점
- [x] `npx next build` 통과

### Phase 11: BUG-1 ExercisePicker 레이어 겹침 수정 ✅
- [x] ExercisePicker에 createPortal 적용 (document.body 렌더링)
- [x] z-index 계층 정리 (z-40 backdrop, z-50 modal)
- [x] `npx next build` 통과

### BUG-2: TimerSheet 프리셋 가림 수정 (iPhone 12) ✅
- [x] max-h-[70vh] → max-h-[90vh] 로 확장
- [x] 타이머 표시 영역에 flex-1 overflow-y-auto 적용
- [x] 프리셋 섹션에 env-safe-bottom 추가 (홈 인디케이터 대응)

### Phase 12: UI 디자인 개선 ✅
- [x] 커스텀 컬러 테마 정의 (primary indigo, surface, border, status)
- [x] EmptyState 컴포넌트 구현
- [x] Skeleton 컴포넌트 구현 (Calendar, Card, Detail 변형)
- [x] WorkoutCalendar 리스타일 (SVG 화살표, ring 오늘 강조, scale+shadow 선택)
- [x] WorkoutDaySheet 리스타일 (Portal, accent border, EmptyState/Skeleton 연동)
- [x] ExerciseAccordion 리스타일 (SVG chevron, primary border, 뱃지)
- [x] SetTable 카드형 전환 (원형 뱃지, 교차 배경, focus ring)
- [x] 세션 상세 페이지 Skeleton 로딩 적용
- [x] 버튼 계층 색상 통일 (Primary/Secondary/Danger)
- [x] 전체 blue → primary 테마 통일
- [x] `npx next build` 통과

### Phase 13: 풋볼 화면 추가 ✅
- [x] 공통 레이아웃에 헬스/풋볼 전환용 사이드바 추가
- [x] `/football` 페이지 및 풋볼 전용 화면 구성
- [x] 풋볼 회원 등록/목록/삭제 UI 구현
- [x] 풋볼 회원 API 구현 (조회, 등록, 삭제)
- [x] 티어별 랜덤 팀 생성 UI 구현 (1~6티어 개별 분배)
- [x] 한 번에 3개의 랜덤 편성안 표시
- [x] 풋볼 테마 CSS 토큰 및 공통 카드 스타일 적용
- [x] 풋볼 페이지 히어로/현황 보드/상태 메시지 폴리시 적용
- [x] `./gradlew test` 통과
- [x] `cd frontend && npm run build` 통과

### BUG-3: 풋볼 팀 수 입력 고정 문제 수정 ✅
- [x] 팀 수 입력 중 값이 즉시 2로 되돌아가는 문제 수정
- [x] 문자열 입력 후 blur/Enter 시 정규화하도록 변경
- [x] 팀 수 증가/감소 스텝 버튼 추가
- [x] `cd frontend && npm run build` 통과

### Phase 14: 풋볼 편성 균형/모바일 UX 개선 ✅
- [x] 팀 편성 로직을 총 인원 기준 균등 분배 방식으로 변경
- [x] `10명/2팀 -> 5:5`, `9명/2팀 -> 5:4`, `12명/3팀 -> 4:4:4` 규칙 반영
- [x] 티어 셔플은 유지하되 목표 인원 수가 찬 팀은 건너뛰도록 수정
- [x] 회원 등록을 팝업 모달로 전환
- [x] 회원 목록을 요약/상세 토글 구조로 변경
- [x] 회원 추가/삭제 시 기존 편성안 자동 초기화
- [x] `./gradlew test` 통과
- [x] `cd frontend && npm run build` 통과

### Phase 15: TDD 테스트 기반 확장 ✅
- [x] `CLAUDE.md`, `AGENTS.md`에 TDD 원칙 반영
- [x] domain logic test 추가
- [x] service integration test 정비 및 전체 스위트 검증
- [x] controller slice test 정비 및 전체 스위트 검증
- [x] global(config/error/util) test 추가
- [x] API E2E test 추가
- [x] `./gradlew test` 통과

### Phase 16: 풋볼 관리 분리와 저장 팀 스냅샷 ✅
- [x] `/football`과 `/football/manage` 하위 탭 구조 추가
- [x] 팀 생성 화면에서 이번 경기 참가 멤버 선택 UI 추가
- [x] 풋볼 회원 수정 API 및 관리 모달 추가
- [x] 선택된 랜덤 편성안 저장 API 및 조회 UI 추가
- [x] 저장 팀 스냅샷용 Neon SQL 문안 정리
- [x] `./gradlew test` 통과
- [x] `cd frontend && npm run build` 통과

### Phase 17: 보관 팀 삭제 기능 ✅
- [x] `FootballSavedTeamUseCase`에 `delete(Long id)` 메서드 추가
- [x] `DefaultFootballSavedTeamService`에 삭제 구현 (EntityNotFoundException 처리)
- [x] `FootballSavedTeamController`에 `DELETE /{id}` 엔드포인트 추가
- [x] Controller/Service/E2E 테스트 작성 및 통과
- [x] 프론트엔드 API 클라이언트에 `deleteSavedTeam` 추가
- [x] `SavedTeamsPanel`에 삭제 버튼 및 로딩 상태 추가
- [x] `FootballPage`에 삭제 핸들러 (confirm 대화상자 포함) 추가
- [x] `spec.md` API 명세 업데이트
- [x] `./gradlew test` 통과
- [x] TypeScript 타입 체크 통과

### Phase 18: 풋볼 편성 UX 개선 (티어 균등·고정 배정·클립보드·모바일 압축) ✅
- [x] `teamGenerator.ts`를 min-load greedy 분배로 교체 (팀 간 티어 인원 차이 ≤ 1 보장)
- [x] `LockedAssignments` 타입 추가 및 `generateTeams`에 사전 고정 인자 추가
- [x] `TeamResult`에 `gradeSum`(티어 단순 합) 필드 추가
- [x] `formatTeamsForClipboard` 유틸 추가 (`n팀: 이름, 이름` 줄바꿈 포맷)
- [x] `MemberSelector`에 "자동 / n팀 고정" 드롭다운 추가, 카드 그리드 모바일 2열로 압축
- [x] `FootballPage`에 `lockedAssignments` 상태 추가, 선택 해제/팀 수 변경 시 자동 정리
- [x] 시나리오 3개 → 1개로 단순화, 같은 버튼을 "다시 굴리기"로 라벨 스왑
- [x] 팀 카드 헤더에 인원 수와 `티어합` 표시, 그리드를 모바일 2열 / lg 3열 / xl 4열로 압축
- [x] 클립보드 복사 버튼 (`aria-live` 피드백 + 2초 후 라벨 복원)
- [x] `spec.md`, `fix.md`, `insight.md` 동기화
- [x] `npx next build` 통과

### BUG-6: 프론트엔드 빌드 리소스 폭증 수정 ✅
- [x] 콜드 빌드에서 `next/font/google` 외부 fetch 실패 확인
- [x] Turbopack 빌드 경로에서 PostCSS 처리 중 panic 발생 확인
- [x] `frontend/package.json` build 스크립트를 `next build --webpack`으로 변경
- [x] `frontend/src/app/layout.tsx`의 Google Fonts import 제거
- [x] `frontend/src/app/globals.css`의 `font-sans`를 시스템 폰트 스택으로 변경
- [x] 콜드 상태 `cd frontend && npm run build` 통과
- [x] `cd frontend && npm test` 통과

### BUG-7: Vercel Next 설정 충돌 경고 수정 ✅
- [x] Vercel 빌드의 `outputFileTracingRoot` / `turbopack.root` 충돌 로그 확인
- [x] Vercel 환경에서는 `turbopack.root`를 제외하도록 `next.config.ts` 조건 처리
- [x] 로컬 Turbopack root 설정은 개발 환경에서 유지
- [x] `cd frontend && VERCEL=1 npm run build` 통과
- [x] `cd frontend && npm run build` 통과
- [x] `cd frontend && npm test` 통과
- [x] `cd frontend && npm run lint` 통과 (기존 `WorkoutForm.tsx` warning 1건)
- [x] `./gradlew test` 통과

### Phase 19: 실제 룰렛 팀 편성 게임 ✅
- [x] 완전 랜덤 / 룰렛 모드 토글 추가
- [x] 고정 멤버 제외 후 남은 멤버만 룰렛 후보로 구성
- [x] `RoulettePlan`에 후보 목록, 당첨 인덱스, 누적 회전 각도, 고정/룰렛 인원 수 추가
- [x] 룰렛 휠을 실제 회전 애니메이션으로 렌더링하고 당첨 위치에 멈추도록 구현
- [x] 당첨 멤버를 티어합, 티어 분포, 인원 수 균형 기준으로 팀 배정
- [x] 룰렛 진행 중 저장/복사/모드 전환 비활성화
- [x] 프론트엔드 룰렛 로직 테스트 추가
- [x] 테스트 DB를 14명까지 채우고 `/football` 화면 렌더링 확인
- [x] Headless Chrome에서 `룰렛` 모드 선택 후 `룰렛 시작` 클릭, 회전 UI 캡처 확인
- [x] `cd frontend && npm test` 통과
- [x] `cd frontend && npm run lint` 통과 (기존 `WorkoutForm.tsx` warning 1건)
- [x] `cd frontend && npm run build` 통과
- [x] `./gradlew test` 통과

