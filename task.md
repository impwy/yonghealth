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
