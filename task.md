# YongHealth - 구현 현황

## Backend

### Phase 1: 기반 구조 ✅
- [x] `BaseTimeEntity` 생성 (createdAt, updatedAt 자동 관리)
- [x] `ErrorResponse` 및 `GlobalExceptionHandler` 생성
- [x] `WeightUnit` Enum 및 `WeightConverter` 유틸리티 생성

### Phase 2: Workout (운동 세션) ✅
- [x] `Workout` Entity 생성
- [x] `WorkoutRepository` 생성
- [x] `WorkoutRequest` / `WorkoutResponse` DTO 생성
- [x] `WorkoutService` 비즈니스 로직 구현
- [x] `WorkoutController` REST API 구현

### Phase 3: Exercise (운동 종목) ✅
- [x] `Exercise` Entity 생성 (Workout과 ManyToOne 관계)
- [x] `ExerciseRepository` 생성
- [x] DTO, Service, Controller 구현

### Phase 4: ExerciseSet (세트) ✅
- [x] `ExerciseSet` Entity 생성 (Exercise와 ManyToOne 관계)
- [x] `ExerciseSetRepository` 생성
- [x] DTO, Service, Controller 구현

### Phase 5: 단위 변환 API ✅
- [x] `WeightConverter`에 변환 로직 구현
- [x] 변환 API 엔드포인트 추가

## Frontend

### Phase 6: 프로젝트 초기화 ✅
- [x] Next.js 프로젝트 생성 (`frontend/`)
- [x] Tailwind CSS 설정
- [x] 타입 정의 (`types/index.ts`)
- [x] API 클라이언트 (`lib/api.ts`)
- [x] 루트 레이아웃 및 네비게이션 바

### Phase 7: 메인 페이지 ✅
- [x] 세션 목록 조회 페이지 (`app/page.tsx`)
- [x] `WorkoutCard` 컴포넌트
- [x] 날짜 필터링 기능

### Phase 8: 세션 생성 페이지 ✅
- [x] 새 운동 기록 페이지 (`app/workouts/new/page.tsx`)
- [x] `WorkoutForm` 컴포넌트
- [x] 종목/세트 동적 추가 UI

### Phase 9: 세션 상세/편집 페이지 ✅
- [x] 세션 상세 페이지 (`app/workouts/[id]/page.tsx`)
- [x] `ExerciseAccordion` 컴포넌트
- [x] `SetTable` 컴포넌트
- [x] 인라인 수정/삭제 기능

### Phase 10: CORS 설정 및 연동 테스트 ✅
- [x] Spring Boot CORS 설정
- [x] 프론트엔드 ↔ 백엔드 연동 확인
