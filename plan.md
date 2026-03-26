# YongHealth v2 - 구현 계획서

## 1. 기술 스택 (유지)

| 항목 | 기술 |
|---|---|
| Backend | Spring Boot 4.0.4, Java 25, Gradle (Kotlin DSL), JPA, Lombok |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| DB (개발) | MySQL / H2 (테스트) |
| DB (운영) | PostgreSQL (Neon) |
| 배포 | Render (백엔드) + Vercel (프론트엔드) |

---

## 2. 패키지 구조 (기존 계층형 플랫 유지)

```
com.yong.yonghealth/
├── domain/          (Workout, Exercise, ExerciseSet, WeightUnit, BaseTimeEntity)
│                    + ExerciseCatalog, ExerciseCatalogAlias, BodyPart, Equipment, MovementType [신규]
├── dto/             (모든 Request/Response DTO)
│                    + WorkoutCalendarSummaryResponse, WorkoutDateSummaryResponse [신규]
│                    + ExerciseCatalogResponse, ExerciseCatalogSearchResponse [신규]
├── repository/      (모든 Repository)
│                    + ExerciseCatalogRepository, ExerciseCatalogAliasRepository [신규]
├── service/         (모든 DefaultXxxService)
│                    + DefaultExerciseCatalogService [신규]
│   └── ports/in/    (모든 UseCase 인터페이스)
│                    + ExerciseCatalogUseCase [신규]
├── controller/      (모든 Controller)
│                    + ExerciseCatalogController [신규]
└── global/          (config/, error/, util/)
```

---

## 3. 프론트엔드 구조 (변경)

```
frontend/src/
├── app/
│   ├── layout.tsx                    (RootLayout + 하단 네비)
│   ├── page.tsx                      (달력 대시보드) [변경]
│   └── workouts/
│       ├── new/page.tsx              (새 운동 기록) [변경: ExercisePicker 연동]
│       ├── date/[date]/page.tsx      (날짜별 운동 목록) [신규]
│       └── [id]/page.tsx             (세션 상세/편집) [변경: ExercisePicker 연동]
├── components/
│   ├── WorkoutCalendar.tsx           [신규]
│   ├── WorkoutDaySheet.tsx           [신규]
│   ├── WorkoutCard.tsx               (유지)
│   ├── ExerciseAccordion.tsx         [변경]
│   ├── ExercisePicker.tsx            [신규]
│   ├── SetTable.tsx                  (유지)
│   ├── WorkoutForm.tsx               [변경]
│   └── ui/
│       ├── Navbar.tsx                [변경: 단순화]
│       ├── BottomNav.tsx             [신규]
│       ├── Toast.tsx                 (유지)
│       └── ConfirmDialog.tsx         (유지)
├── lib/api.ts                        [변경: 신규 API 추가]
├── types/index.ts                    [변경: 신규 타입 추가]
└── ...
```

---

## 4. 구현 Phase

### Phase 1: Exercise 엔티티 변경
1. Exercise 엔티티에 exerciseCatalog(ManyToOne, nullable), displayName, customName, note 추가
2. 기존 name 필드를 displayName으로 대체
3. ExerciseRequest, ExerciseResponse DTO 수정
4. DefaultExerciseService, ExerciseController 수정
5. 기존 테스트 수정 및 검증
6. `./gradlew test` 통과 확인

### Phase 2: ExerciseCatalog 도메인
1. ExerciseCatalog, ExerciseCatalogAlias 엔티티 생성
2. BodyPart, Equipment, MovementType enum 생성
3. Repository, Service, Controller 구현
4. 검색 API (이름 + 별칭 LIKE 검색)
5. 카테고리별 조회 API
6. 초기 seed 데이터 (data.sql)
7. 테스트 작성 및 검증

### Phase 3: 달력 조회 API
1. 월간 달력 요약 API: `GET /api/workouts/calendar?year=&month=`
2. 날짜별 운동 목록 API: `GET /api/workouts/date/{date}`
3. WorkoutCalendarSummaryResponse, WorkoutDateSummaryResponse DTO
4. workoutDate 인덱스 최적화
5. 테스트 작성 및 검증

### Phase 4: 프론트엔드 - 타입/API 업데이트
1. types/index.ts에 ExerciseCatalog, Calendar 관련 타입 추가
2. Exercise 타입 변경 (displayName, customName, catalogId)
3. api.ts에 calendar, date, exerciseCatalog API 추가

### Phase 5: 프론트엔드 - 달력 홈 화면
1. WorkoutCalendar 컴포넌트 구현 (월간 달력, 날짜별 dot 표시)
2. WorkoutDaySheet 컴포넌트 구현 (모바일 하단 시트)
3. app/page.tsx를 달력 대시보드로 교체
4. BottomNav 컴포넌트 구현
5. Navbar 단순화

### Phase 6: 프론트엔드 - 날짜별 운동 목록
1. app/workouts/date/[date]/page.tsx 구현
2. 날짜별 세션 목록 조회 및 표시
3. 세션 상세 이동 연결
4. "운동 기록 추가" CTA

### Phase 7: 프론트엔드 - 운동 선택 UI
1. ExercisePicker 컴포넌트 구현 (검색, 카테고리 필터)
2. WorkoutForm에 ExercisePicker 연동
3. 세션 상세 페이지에 ExercisePicker 연동
4. 직접 입력 fallback

### Phase 8: 모바일 UI 최적화
1. 전체 화면 모바일 레이아웃 재점검
2. 세트 입력 카드형/세로 스택형 전환
3. sticky 액션 버튼 적용
4. 터치 영역 및 네비게이션 최적화

### Phase 9: 성능/배포 개선
1. Health check 엔드포인트 설정
2. Spring Boot startup 최적화
3. 프론트엔드 콜드스타트 로딩 UI
4. 빌드/배포 검증
