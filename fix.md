# YongHealth v2 - 변경 사항 정리

## 1. 패키지 구조: 현재 계층형 플랫 구조 유지

기존 구조를 유지하며, 신규 클래스만 해당 계층에 추가한다.

### 신규 추가 파일
- `domain/`: ExerciseCatalog, ExerciseCatalogAlias, BodyPart(enum), Equipment(enum), MovementType(enum)
- `dto/`: ExerciseCatalogResponse, ExerciseCatalogSearchResponse, WorkoutCalendarSummaryResponse, WorkoutDateSummaryResponse
- `repository/`: ExerciseCatalogRepository, ExerciseCatalogAliasRepository
- `service/`: DefaultExerciseCatalogService
- `service/ports/in/`: ExerciseCatalogUseCase
- `controller/`: ExerciseCatalogController

---

## 2. Exercise 엔티티 변경

### 현재
- `name` (String) - 운동명 직접 입력

### 변경 후
- `exerciseCatalog` (ManyToOne, nullable) - 표준 운동 참조
- `displayName` (String) - 기록 당시 이름 스냅샷
- `customName` (String, nullable) - 사용자 정의명
- `note` (String, nullable) - 메모
- `sortOrder` (Integer) - 유지

### 마이그레이션 전략
- 기존 `name` 값 → `displayName`으로 매핑
- `exerciseCatalogId` = null (기존 데이터는 카탈로그 미연결)
- `name` 필드 제거

---

## 3. 신규 도메인: ExerciseCatalog

### ExerciseCatalog
- id, name, category(enum), equipment(enum), movementType(enum), active(boolean)

### ExerciseCatalogAlias
- id, exerciseCatalog(ManyToOne), alias(String)

### Seed 데이터
- 주요 운동 50~70종 초기 데이터 필요

---

## 4. 신규/변경 API

### 신규
- `GET /api/workouts/calendar?year=&month=` - 월간 달력 요약
- `GET /api/workouts/date/{date}` - 날짜별 운동 목록
- `GET /api/exercise-catalog` - 표준 운동 목록 전체/카테고리별
- `GET /api/exercise-catalog/search?query=` - 운동명 검색

### 변경
- `POST /api/workouts/{workoutId}/exercises` - ExerciseRequest에 catalogId, displayName, customName 추가
- `PUT /api/exercises/{id}` - 동일

---

## 5. 프론트엔드 변경

### 메인 페이지 전면 교체
- 세션 목록 → 월간 달력 대시보드
- 날짜별 운동 여부 표시 (dot/badge)

### 신규 컴포넌트
- `WorkoutCalendar.tsx` - 월간 달력
- `WorkoutDaySheet.tsx` - 날짜 선택 시 하단 시트 (모바일)
- `ExercisePicker.tsx` - 운동명 검색/선택
- `BottomNav.tsx` - 하단 네비게이션

### 신규 페이지
- `app/workouts/date/[date]/page.tsx` - 날짜별 운동 목록

### 변경
- `app/page.tsx` - 달력 대시보드로 교체
- `WorkoutForm.tsx` - ExercisePicker 연동
- `ExerciseAccordion.tsx` - displayName/customName 표시
- `lib/api.ts` - 신규 API 추가
- `types/index.ts` - 신규 타입 추가

---

## 6. 비기능 변경

### Render 배포 최적화
- Health check 엔드포인트 설정
- Spring Boot startup 최적화 검토
- 콜드스타트 로딩 UI 제공
