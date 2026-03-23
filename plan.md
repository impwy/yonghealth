# YongHealth - 구현 계획서

## 1. 기술 스택

### Backend
| 항목 | 기술 |
|---|---|
| Framework | Spring Boot 4.0.4 |
| Language | Java 25 |
| Build | Gradle (Kotlin DSL) |
| ORM | Spring Data JPA / Hibernate |
| Database | MySQL |
| Library | Lombok |

### Frontend
| 항목 | 기술 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | fetch (built-in) |
| Package Manager | npm |

## 2. 프로젝트 구조

### 2.1 백엔드 패키지 구조

```
com.yong.yonghealth
├── domain
│   ├── workout
│   │   ├── Workout.java              (Entity)
│   │   ├── WorkoutRepository.java    (Repository)
│   │   ├── WorkoutService.java       (Service)
│   │   ├── WorkoutController.java    (Controller)
│   │   └── dto
│   │       ├── WorkoutRequest.java
│   │       └── WorkoutResponse.java
│   ├── exercise
│   │   ├── Exercise.java
│   │   ├── ExerciseRepository.java
│   │   ├── ExerciseService.java
│   │   ├── ExerciseController.java
│   │   └── dto
│   │       ├── ExerciseRequest.java
│   │       └── ExerciseResponse.java
│   └── exerciseset
│       ├── ExerciseSet.java
│       ├── ExerciseSetRepository.java
│       ├── ExerciseSetService.java
│       ├── ExerciseSetController.java
│       ├── WeightUnit.java           (Enum)
│       └── dto
│           ├── ExerciseSetRequest.java
│           └── ExerciseSetResponse.java
├── global
│   ├── common
│   │   └── BaseTimeEntity.java       (공통 생성/수정 일시)
│   ├── error
│   │   ├── ErrorResponse.java
│   │   └── GlobalExceptionHandler.java
│   └── util
│       └── WeightConverter.java      (KG ↔ LB 변환)
└── YonghealthApplication.java
```

### 2.2 프론트엔드 디렉토리 구조

```
frontend/
├── app/
│   ├── layout.tsx                 (루트 레이아웃 - 네비게이션)
│   ├── page.tsx                   (메인 페이지 - 세션 목록)
│   └── workouts/
│       ├── new/
│       │   └── page.tsx           (새 운동 기록)
│       └── [id]/
│           └── page.tsx           (세션 상세/편집)
├── components/
│   ├── WorkoutCard.tsx            (세션 카드 컴포넌트)
│   ├── ExerciseAccordion.tsx      (종목 아코디언)
│   ├── SetTable.tsx               (세트 테이블)
│   ├── WorkoutForm.tsx            (세션 입력 폼)
│   └── ui/
│       ├── Navbar.tsx
│       ├── Toast.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   └── api.ts                     (API 호출 함수)
├── types/
│   └── index.ts                   (타입 정의)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 3. 구현 순서

### Phase 1: 기반 구조
1. `BaseTimeEntity` 생성 (createdAt, updatedAt 자동 관리)
2. `ErrorResponse` 및 `GlobalExceptionHandler` 생성
3. `WeightUnit` Enum 및 `WeightConverter` 유틸리티 생성

### Phase 2: Workout (운동 세션)
1. `Workout` Entity 생성
2. `WorkoutRepository` 생성
3. `WorkoutRequest` / `WorkoutResponse` DTO 생성
4. `WorkoutService` 비즈니스 로직 구현
5. `WorkoutController` REST API 구현

### Phase 3: Exercise (운동 종목)
1. `Exercise` Entity 생성 (Workout과 ManyToOne 관계)
2. `ExerciseRepository` 생성
3. DTO, Service, Controller 구현

### Phase 4: ExerciseSet (세트)
1. `ExerciseSet` Entity 생성 (Exercise와 ManyToOne 관계)
2. `ExerciseSetRepository` 생성
3. DTO, Service, Controller 구현

### Phase 5: 단위 변환 API
1. `WeightConverter`에 변환 로직 구현
2. 변환 API 엔드포인트 추가

### Phase 6: 프론트엔드 프로젝트 초기화
1. Next.js 프로젝트 생성 (`frontend/`)
2. Tailwind CSS 설정
3. 타입 정의 (`types/index.ts`)
4. API 클라이언트 (`lib/api.ts`)
5. 루트 레이아웃 및 네비게이션 바

### Phase 7: 프론트엔드 - 메인 페이지
1. 세션 목록 조회 페이지 (`app/page.tsx`)
2. `WorkoutCard` 컴포넌트
3. 날짜 필터링 기능

### Phase 8: 프론트엔드 - 세션 생성 페이지
1. 새 운동 기록 페이지 (`app/workouts/new/page.tsx`)
2. `WorkoutForm` 컴포넌트
3. 종목/세트 동적 추가 UI

### Phase 9: 프론트엔드 - 세션 상세/편집 페이지
1. 세션 상세 페이지 (`app/workouts/[id]/page.tsx`)
2. `ExerciseAccordion` 컴포넌트
3. `SetTable` 컴포넌트
4. 인라인 수정/삭제 기능

### Phase 10: 백엔드 CORS 설정 및 연동 테스트
1. Spring Boot CORS 설정
2. 프론트엔드 ↔ 백엔드 연동 확인

## 4. 엔티티 관계도

```
Workout (1) ──── (N) Exercise (1) ──── (N) ExerciseSet
  │                    │                      │
  ├─ workoutDate       ├─ name                ├─ setNumber
  ├─ startTime         └─ sortOrder           ├─ weight
  ├─ endTime                                  ├─ weightUnit (KG/LB)
  └─ memo                                     └─ reps
```

## 5. 주요 설계 결정

### 5.1 도메인별 패키지 구조
- 계층형(layer) 대신 **도메인형(domain)** 패키지 구조 채택
- 각 도메인이 Entity, Repository, Service, Controller, DTO를 독립적으로 소유
- 도메인 간 결합도를 낮추고 응집도를 높임

### 5.2 세트별 중량 단위
- 중량 단위를 세트 레벨에서 관리 (세트마다 다른 단위 가능)
- 실제 운동 시 KG/LB를 혼용하는 경우를 지원

### 5.3 Cascade 삭제
- Workout 삭제 → Exercise 모두 삭제 → ExerciseSet 모두 삭제
- `CascadeType.ALL` + `orphanRemoval = true` 적용

### 5.4 BaseTimeEntity
- `@MappedSuperclass` + `@EntityListeners(AuditingEntityListener.class)`
- 모든 엔티티에 createdAt, updatedAt 자동 관리
