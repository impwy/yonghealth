# YongHealth - 수정 계획서

기존 구현 계획서를 기준으로, 아래 변경 요구사항을 반영한 수정안이다.

- 첫 화면을 **세션 목록**이 아니라 **달력 화면**으로 변경
- 날짜 선택 시 해당 날짜의 운동 일지 목록/상세를 확인 가능하도록 변경
- 운동 종목은 수기 입력 중심에서 **표준 운동명 선택형** 구조로 변경
- 전체 UX를 **모바일 우선**으로 재설계
- Render 배포 환경의 **콜드스타트 체감 개선**을 위한 운영 항목 추가

---

## 1. 변경 요구사항

### 1.1 기능 요구사항

#### FR-1. 달력 기반 홈 화면
- 앱의 첫 화면은 월간 달력이어야 한다.
- 각 날짜 셀에는 해당 날짜의 운동 기록 존재 여부를 표시해야 한다.
  - 예: 점(dot), 운동 횟수 배지, 총 세트 수 등
- 사용자가 날짜를 선택하면 해당 날짜의 운동 일지 목록을 확인할 수 있어야 한다.
- 해당 날짜에 운동 기록이 없으면 빈 상태 화면과 함께 "새 운동 기록" 진입 버튼을 제공해야 한다.

#### FR-2. 날짜별 운동 일지 조회
- 선택한 날짜 기준으로 운동 세션 목록을 조회할 수 있어야 한다.
- 하루에 여러 운동 세션이 있을 경우 목록으로 구분해서 보여줘야 한다.
- 세션을 선택하면 기존 세션 상세/편집 화면으로 이동할 수 있어야 한다.

#### FR-3. 표준 운동명 선택
- 운동 종목은 직접 문자열을 입력하는 방식이 아니라, 미리 준비된 표준 운동 목록에서 선택 가능해야 한다.
- 사용자는 검색 또는 카테고리 필터를 통해 운동명을 빠르게 찾을 수 있어야 한다.
- 선택된 운동명은 세션 내 Exercise 데이터에 저장되어야 한다.
- 필요 시 사용자 정의 입력도 보조 기능으로 남길 수 있어야 한다.
  - 예: 표준 목록에 없는 변형 운동, 머신 이름, 개인 메모

#### FR-4. 운동명 검색/자동완성
- 운동 추가 화면에서 키워드 검색이 가능해야 한다.
- 한글/영문/별칭 검색을 지원해야 한다.
  - 예: "벤치", "벤치프레스", "bench press" 모두 매칭
- 최근 사용한 운동 또는 자주 사용하는 운동을 상단에 우선 노출할 수 있어야 한다.

#### FR-5. 모바일 친화 UI
- 주요 사용 환경을 모바일 브라우저로 가정하고 화면을 재구성해야 한다.
- 달력 날짜 선택 시 모바일에서는 하단 시트(Bottom Sheet) 또는 전체 화면 시트로 일지 목록을 보여줘야 한다.
- 운동 기록 생성/수정 시 버튼, 입력창, 아코디언, 테이블이 작은 화면에서도 조작 가능해야 한다.
- 저장/수정/삭제 버튼은 모바일에서 손가락으로 누르기 쉬운 크기로 제공해야 한다.

#### FR-6. 빠른 진입 동선
- 달력 화면에서 선택 날짜 기준으로 바로 운동 기록 추가가 가능해야 한다.
- 날짜 선택 → 해당 날짜 운동 목록 확인 → 새 기록 추가 흐름이 2~3번 내 탭으로 이어져야 한다.

### 1.2 비기능 요구사항

#### NFR-1. 모바일 사용성
- 360px 이상 화면에서 주요 기능이 가로 스크롤 없이 동작해야 한다.
- 주요 CTA 버튼 높이는 44px 이상을 권장한다.
- 세트 입력 영역은 모바일에서 숫자 입력이 편하도록 구성해야 한다.

#### NFR-2. 응답 성능
- 달력 월 조회 API는 월 단위 조회에 최적화되어야 한다.
- 날짜별 운동 목록 조회는 평균 응답 속도가 빠르게 유지되도록 인덱스를 구성해야 한다.
- 초기 접속 시 Render 콜드스타트가 있더라도 사용자에게 로딩 상태가 명확히 보여야 한다.

#### NFR-3. 확장성
- 표준 운동명 목록은 추후 카테고리, 자극 부위, 장비, 별칭 검색 등으로 확장 가능해야 한다.
- 사용자 커스텀 운동명과 공용 운동명을 혼용할 수 있는 구조를 고려해야 한다.

---

## 2. 변경 후 프로젝트 구조

## 2.1 백엔드 패키지 구조

> 기존 계층형 플랫 패키지 구조를 유지한다. 도메인별 하위 패키지를 만들지 않는다.
> Service 인터페이스는 `service/ports/in/`에 분리하여 의존 역전을 적용한다.
> 구현체는 `Default` 접두사를 사용한다.

```text
com.yong.yonghealth/
├── domain/          (Workout, Exercise, ExerciseSet, WeightUnit, BaseTimeEntity)
│                    (ExerciseCatalog, ExerciseCatalogAlias, BodyPart, Equipment, MovementType) [신규]
├── dto/             (모든 Request/Response DTO)
│                    (WorkoutCalendarSummaryResponse, WorkoutDateSummaryResponse) [신규]
│                    (ExerciseCatalogResponse, ExerciseCatalogSearchResponse) [신규]
├── repository/      (WorkoutRepository, ExerciseRepository, ExerciseSetRepository)
│                    (ExerciseCatalogRepository, ExerciseCatalogAliasRepository) [신규]
├── service/         (DefaultWorkoutService, DefaultExerciseService, DefaultExerciseSetService)
│                    (DefaultExerciseCatalogService) [신규]
│   └── ports/in/    (WorkoutUseCase, ExerciseUseCase, ExerciseSetUseCase)
│                    (ExerciseCatalogUseCase) [신규]
├── controller/      (WorkoutController, ExerciseController, ExerciseSetController)
│                    (ExerciseCatalogController) [신규]
└── global/          (config/, error/, util/)
```

## 2.2 프론트엔드 디렉토리 구조

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                            (메인 페이지 - 달력 대시보드)
│   └── workouts/
│       ├── new/
│       │   └── page.tsx                    (새 운동 기록)
│       ├── date/
│       │   └── [date]/page.tsx             (날짜별 운동 목록)
│       └── [id]/
│           └── page.tsx                    (세션 상세/편집)
├── components/
│   ├── WorkoutCalendar.tsx                 (월간 달력)
│   ├── WorkoutDaySheet.tsx                 (선택 날짜 운동 목록 - 모바일 하단 시트)
│   ├── WorkoutCard.tsx
│   ├── ExerciseAccordion.tsx
│   ├── ExercisePicker.tsx                  (운동명 검색/선택)
│   ├── SetTable.tsx
│   ├── WorkoutForm.tsx
│   └── ui/
│       ├── Navbar.tsx
│       ├── BottomNav.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   └── api.ts
├── types/
│   └── index.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. 데이터 모델 변경안

## 3.1 기존 모델 유지
- `Workout` : 하루 운동 세션
- `Exercise` : 세션 내 운동 종목
- `ExerciseSet` : 세트 데이터

## 3.2 신규 모델 추가: ExerciseCatalog

### ExerciseCatalog
- `id`
- `name` : 표준 운동명
- `category` : 가슴 / 등 / 하체 / 어깨 / 팔 / 유산소 등
- `equipment` : 바벨 / 덤벨 / 머신 / 맨몸 등
- `movementType` : PUSH / PULL / LOWER / CARDIO / CORE 등
- `active`

### ExerciseCatalogAlias
- `id`
- `exerciseCatalogId`
- `alias` : 별칭 검색용 문자열
  - 예: 벤치, 벤치프레스, bench press

## 3.3 기존 Exercise 엔티티 변경

기존
- `name`
- `sortOrder`

변경 후 권장
- `exerciseCatalogId` (nullable)
- `displayName` (스냅샷 성격의 이름 저장)
- `customName` (nullable, 사용자 정의명)
- `sortOrder`
- `note` (선택 사항)

### 설계 의도
- `ExerciseCatalog`는 공용 표준 목록
- `Exercise.displayName`은 기록 당시 이름을 스냅샷으로 보존
- 표준 목록명이 추후 변경되어도 과거 운동 기록 표시가 깨지지 않음
- 표준 목록에 없는 경우 `customName`으로 대응 가능

---

## 4. API 변경안

## 4.1 Workout API

### 월간 달력 요약 조회
`GET /api/workouts/calendar?year=2026&month=3`

응답 예시
```json
{
  "year": 2026,
  "month": 3,
  "days": [
    {
      "date": "2026-03-26",
      "workoutCount": 1,
      "exerciseCount": 5,
      "totalSets": 18
    }
  ]
}
```

### 날짜별 운동 세션 조회
`GET /api/workouts/date/2026-03-26`

응답 예시
```json
{
  "date": "2026-03-26",
  "workouts": [
    {
      "id": 12,
      "startTime": "19:00",
      "endTime": "20:20",
      "memo": "가슴 + 삼두"
    }
  ]
}
```

### 날짜 기준 새 운동 생성
`POST /api/workouts`

요청 예시
```json
{
  "workoutDate": "2026-03-26",
  "startTime": "19:00",
  "memo": "가슴 운동"
}
```

## 4.2 Exercise Catalog API

### 표준 운동 목록 조회
`GET /api/exercise-catalog`

### 키워드 검색
`GET /api/exercise-catalog/search?query=벤치`

### 카테고리별 조회
`GET /api/exercise-catalog?category=CHEST`

---

## 5. 프론트엔드 변경안

## 5.1 메인 화면
기존
- 세션 목록 중심

변경 후
- 월간 달력 중심 대시보드
- 날짜 셀에 운동 여부 표시
- 날짜 탭 시 해당 날짜 운동 일지 목록 표시
- 선택 날짜 기준 "운동 추가" CTA 제공

## 5.2 날짜 선택 UX
### 모바일
- 날짜 탭 시 하단 시트 오픈
- 시트 내에 해당 날짜 운동 목록 렌더링
- 하단에 `운동 기록 추가` 버튼 고정

### 데스크탑
- 우측 패널 또는 모달로 날짜 상세 표시 가능

## 5.3 운동 입력 UX
기존
- 운동명 수기 입력

변경 후
- 검색 가능한 운동 선택 컴포넌트 제공
- 최근 사용 운동 / 자주 사용하는 운동 우선 노출
- 선택 후 세트 입력 영역 자동 추가
- 필요 시 직접 입력 버튼 제공

## 5.4 모바일 최적화 포인트
- 달력 셀 터치 영역 확대
- 네비게이션 단순화
- 하단 고정 CTA 사용
- 세트 입력을 카드형 또는 세로 스택형으로 전환
- 테이블 UI는 모바일에서 카드 UI로 대체 가능
- 저장 버튼은 하단 sticky 처리

---

## 6. 구현 순서 수정안

### Phase 1: 기존 도메인 정리
1. 기존 Workout / Exercise / ExerciseSet 구조 유지 여부 점검
2. `Exercise.name` 사용 지점 파악
3. 기존 데이터 마이그레이션 전략 수립

### Phase 2: Exercise Catalog 도메인 추가
1. `ExerciseCatalog`, `ExerciseCatalogAlias` 엔티티 생성
2. Repository / Service / Controller 구현
3. 초기 표준 운동 데이터 seed 작성
4. 검색 API 구현

### Phase 3: Exercise 구조 개편
1. `Exercise`에 `exerciseCatalogId`, `displayName`, `customName`, `note` 반영
2. 기존 `name` 필드를 대체 또는 마이그레이션
3. 기록 생성/수정 API 변경

### Phase 4: 달력 조회 API 추가
1. 월간 달력 요약 API 구현
2. 날짜별 운동 세션 조회 API 구현
3. `workout_date` 기준 인덱스 점검

### Phase 5: 프론트엔드 홈 화면 개편
1. `app/page.tsx`를 달력 대시보드로 변경
2. `WorkoutCalendar` 컴포넌트 구현
3. 날짜별 요약 표시
4. 날짜 선택 시 하단 시트 또는 상세 패널 연결

### Phase 6: 날짜별 운동 목록 화면 구현
1. `app/workouts/date/[date]/page.tsx` 구현
2. 선택 날짜 운동 세션 목록 조회
3. 세션 상세 페이지 이동 연결

### Phase 7: 운동 선택 UI 구현
1. `ExercisePicker` 구현
2. 검색/자동완성 연결
3. 최근 사용 운동 우선 노출
4. 직접 입력 fallback 제공

### Phase 8: 모바일 UI 개선
1. 네비게이션 축소 및 하단 중심 배치
2. 세션 입력 화면 모바일 레이아웃 개선
3. 테이블형 입력 UI 재검토
4. sticky 액션 버튼 적용

### Phase 9: 성능/배포 개선
1. Render Health Check 경로 설정
2. Spring Boot startup 병목 확인
3. 빌드/배포 명령 정리
4. 콜드스타트 체감 개선 항목 반영

---

## 7. 엔티티 관계도 변경안

```text
Workout (1) ──── (N) Exercise (1) ──── (N) ExerciseSet
  │                    │                      │
  ├─ workoutDate       ├─ exerciseCatalogId   ├─ setNumber
  ├─ startTime         ├─ displayName         ├─ weight
  ├─ endTime           ├─ customName          ├─ weightUnit
  └─ memo              ├─ sortOrder           └─ reps
                       └─ note

ExerciseCatalog (1) ──── (N) ExerciseCatalogAlias
  │
  ├─ name
  ├─ category
  ├─ equipment
  └─ movementType
```

---

## 8. Render 운영 변경안

## 8.1 우선 판단
- 현재 체감 문제는 애플리케이션 로직보다 **Render 인스턴스 기동 지연** 가능성이 높다.
- Free 인스턴스 사용 중이라면 콜드스타트가 반복될 수 있다.

## 8.2 우선 적용 항목
1. Health Check 경로를 `/actuator/health` 또는 경량 커스텀 health endpoint로 지정
2. Start Command에서 불필요한 초기화 작업 제거
3. DB migration이 start 단계에 있다면 분리 검토
4. Spring Boot startup 로그/Actuator startup endpoint로 병목 구간 분석
5. 필요 시 유료 인스턴스로 전환 검토

## 8.3 백엔드 코드 차원 권장 사항
- `spring.main.lazy-initialization=true` 검토
- 초기 화면에 필요 없는 무거운 빈 초기화 지연
- JPA 초기화/seed/load 로직이 startup을 지연시키는지 점검
- 외부 API 연결, 대용량 데이터 preload, 불필요한 로그 초기화 제거
- Java 25 기반 AOT Cache 또는 CDS 적용 검토

---

## 9. 최종 추천 방향

### 반드시 반영
- 홈 화면 달력화
- 날짜별 운동 일지 조회
- 표준 운동명 선택 구조
- 모바일 우선 UI

### 설계상 강하게 추천
- `ExerciseCatalog` 도메인 분리
- `Exercise.displayName` 스냅샷 유지
- 날짜별 조회/월 조회 API 분리
- Render 배포 최적화와 Spring Boot startup 분석 병행

### 구현 난이도 대비 효과가 큰 항목
1. 홈 화면 달력 전환
2. 표준 운동명 검색/선택
3. 모바일 하단 시트 UX
4. Render health check + startup 최적화
