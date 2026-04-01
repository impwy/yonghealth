# YongHealth - 기능 명세서

## 1. 개요

YongHealth는 운동 일지와 풋볼 팀 편성을 함께 제공하는 웹 애플리케이션이다.

- 헬스 영역: 운동 날짜, 시간, 종목, 세트별 중량/횟수를 기록하고 조회한다.
- 풋볼 영역: 회원을 등록하고 등급별 랜덤 팀 편성을 생성한다.

## 2. 도메인 모델

### 2.1 Workout (운동 세션)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| workoutDate | LocalDate | 운동 날짜 |
| startTime | LocalTime | 시작 시간 |
| endTime | LocalTime | 종료 시간 (nullable) |
| memo | String | 메모 (nullable) |
| createdAt | LocalDateTime | 생성일시 |
| updatedAt | LocalDateTime | 수정일시 |

### 2.2 Exercise (운동 종목)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| workout | Workout | 소속 세션 |
| exerciseCatalogId | Long | 운동 카탈로그 ID (nullable) |
| displayName | String | 화면 표시용 종목명 |
| customName | String | 직접 입력명 (nullable) |
| note | String | 종목 메모 (nullable) |
| sortOrder | Integer | 화면 표시 순서 |

### 2.3 ExerciseSet (세트)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| exercise | Exercise | 소속 종목 |
| setNumber | Integer | 세트 번호 |
| weight | Double | 중량 |
| weightUnit | WeightUnit | KG / LB |
| reps | Integer | 반복 횟수 |
| version | Long | 낙관적 락/중복 생성 방지용 버전 |

### 2.4 ExerciseCatalog (운동 카탈로그)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| name | String | 운동명 |
| category | BodyPart | 운동 부위 |
| equipment | Equipment | 장비 |
| movementType | MovementType | 동작 유형 |
| active | Boolean | 활성 여부 |
| aliases | List<String> | 검색 별칭 |

### 2.5 FootballMember (풋볼 회원)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| name | String | 회원명, unique |
| grade | Integer | 등급 (1~6) |
| createdAt | LocalDateTime | 생성일시 |
| updatedAt | LocalDateTime | 수정일시 |

### 2.6 WeightUnit

| 값 | 설명 |
|---|---|
| KG | 킬로그램 |
| LB | 파운드 |

## 3. 기능 요구사항

### 3.1 운동 세션 관리

- 운동 세션 생성, 목록 조회, 날짜별 조회, 상세 조회가 가능해야 한다.
- 운동 세션 수정 시 날짜, 시간, 메모를 바꿀 수 있어야 한다.
- 운동 세션 삭제 시 하위 종목과 세트가 함께 삭제되어야 한다.

### 3.2 운동 종목/세트 관리

- 운동 종목은 카탈로그 선택 또는 직접 입력으로 추가할 수 있어야 한다.
- 운동 종목은 displayName 기준으로 화면에 노출되어야 한다.
- 세트는 중량, 단위, 횟수로 등록/수정/삭제할 수 있어야 한다.
- 동일 Exercise 내에서 같은 `setNumber` 중복 생성은 방지되어야 한다.

### 3.3 달력/카탈로그/타이머

- 월간 달력에서 운동 기록이 있는 날짜를 표시해야 한다.
- 특정 날짜를 선택하면 해당 날짜 세션 목록을 보여줘야 한다.
- ExercisePicker에서 카탈로그 검색, 카테고리 필터, 직접 입력 fallback을 제공해야 한다.
- 쉬는 시간 타이머는 전역 상태로 유지되고 모바일/데스크탑에서 진입 가능해야 한다.

### 3.4 공통 네비게이션

- 앱 레이아웃에는 `헬스`와 `풋볼`을 전환하는 공통 네비게이션이 있어야 한다.
- 데스크탑에서는 좌측 사이드바, 모바일에서는 상단 탭 바로 동작해야 한다.
- 풋볼 화면에서는 기존 하단 BottomNav를 숨긴다.

### 3.5 풋볼 회원 관리

- 로그인 없이 회원을 단순 등록/조회/삭제할 수 있어야 한다.
- 회원 등록 시 입력값은 이름, 등급이다.
- 이름은 필수이며 중복 등록을 허용하지 않는다.
- 등급은 1~6 범위만 허용한다.

### 3.6 풋볼 팀 편성

- 팀 수는 최소 2팀 이상이어야 한다.
- 팀 수는 회원 수보다 많을 수 없다.
- 편성은 등급별로 독립적으로 셔플한 뒤 라운드 로빈으로 분배한다.
- 현재 규칙은 `1등급`, `2등급`, `3등급`, `4등급`, `5등급`, `6등급`을 각각 별도 풀로 사용한다.
- 3등급과 4등급은 합치지 않는다.
- 각 등급 분배 시 시작 팀 위치를 랜덤화하여 특정 팀 편중을 줄인다.
- 한 번 생성 시 3개의 랜덤 시나리오를 동시에 보여준다.

### 3.7 풋볼 팀 수 입력 UX

- 팀 수 입력은 수동 숫자 입력과 증가/감소 버튼을 모두 제공한다.
- 입력 중에는 값이 강제로 되돌아가면 안 된다.
- blur 또는 Enter 시점에만 최소/최대 범위로 정규화한다.

## 4. API 엔드포인트

### 4.1 Workout

| Method | URI | 설명 |
|---|---|---|
| POST | /api/workouts | 운동 세션 생성 |
| GET | /api/workouts | 전체 세션 목록 조회 |
| GET | /api/workouts?date={date} | 날짜별 세션 조회 |
| GET | /api/workouts/{id} | 세션 상세 조회 |
| PUT | /api/workouts/{id} | 세션 수정 |
| DELETE | /api/workouts/{id} | 세션 삭제 |

### 4.2 Exercise

| Method | URI | 설명 |
|---|---|---|
| POST | /api/workouts/{workoutId}/exercises | 종목 추가 |
| PUT | /api/exercises/{id} | 종목 수정 |
| DELETE | /api/exercises/{id} | 종목 삭제 |

### 4.3 ExerciseSet

| Method | URI | 설명 |
|---|---|---|
| POST | /api/exercises/{exerciseId}/sets | 세트 추가 |
| PUT | /api/sets/{id} | 세트 수정 |
| DELETE | /api/sets/{id} | 세트 삭제 |

### 4.4 중량 단위 변환

| Method | URI | 설명 |
|---|---|---|
| GET | /api/convert?value={value}&from={unit}&to={unit} | 중량 단위 변환 |

### 4.5 달력 조회

| Method | URI | 설명 |
|---|---|---|
| GET | /api/workouts/calendar?year=&month= | 월간 달력 요약 |
| GET | /api/workouts/date/{date} | 날짜별 운동 세션 목록 |

### 4.6 운동 카탈로그

| Method | URI | 설명 |
|---|---|---|
| GET | /api/exercise-catalog | 전체/카테고리별 목록 |
| GET | /api/exercise-catalog/search?query={query} | 이름/별칭 검색 |

### 4.7 풋볼 회원

| Method | URI | 설명 |
|---|---|---|
| GET | /api/football/members | 전체 회원 목록 조회 |
| POST | /api/football/members | 회원 등록 |
| DELETE | /api/football/members/{id} | 회원 삭제 |

### 4.8 Health Check

| Method | URI | 설명 |
|---|---|---|
| GET | /health | 서버 상태 및 DB 연결 상태 확인 |

## 5. 프론트엔드 화면 명세

### 5.1 앱 레이아웃

- `RootLayout`에 공통 Navbar, AppSidebar, BottomNav를 둔다.
- AppSidebar는 `헬스`와 `풋볼` 탭을 제공한다.
- 풋볼 모드에서는 탭 강조색과 배경 톤을 풋볼 테마로 변경한다.

### 5.2 헬스 메인 페이지 (`/`)

- 월간 달력 대시보드
- 날짜 선택 시 WorkoutDaySheet 노출
- 운동 기록 추가 CTA 제공

### 5.3 운동 세션 상세/편집 (`/workouts/[id]`)

- 세션 정보 수정
- ExerciseAccordion 기반 종목 편집
- 세트 테이블 기반 세트 편집
- 세션 삭제

### 5.4 새 운동 기록 (`/workouts/new`)

- 날짜, 시간, 운동 종목, 세트를 한 화면에서 입력
- ExercisePicker 연동

### 5.5 날짜별 운동 목록 (`/workouts/date/[date]`)

- 해당 날짜 세션 목록
- 세션 상세 이동
- 날짜가 고정된 "운동 기록 추가" CTA

### 5.6 ExercisePicker

- 모바일: 풀스크린 모달
- 데스크탑: 중앙 모달
- 검색, 카테고리 필터, 직접 입력 fallback
- `createPortal`로 렌더링하여 레이어 충돌을 방지한다.

### 5.7 쉬는 시간 타이머

- 모바일 BottomNav와 데스크탑 Navbar에서 진입
- TimerSheet에서 프리셋, ±15초 조절, 일시정지/재개/리셋 제공
- 종료 시 진동/오디오/시각 효과 제공

### 5.8 풋볼 페이지 (`/football`)

- 풋볼 히어로 영역: 현재 회원 수, 팀 수, 랜덤 시나리오 수 표시
- 회원 등록 패널: 이름, 등급 입력
- 회원 목록 패널: 등급순 목록, 등급별 인원 수, 삭제 버튼
- 팀 생성 패널:
  - 팀 수 입력
  - 증가/감소 버튼
  - 생성 조건 안내 메시지
  - 3개의 랜덤 편성안 카드 표시
- 팀 카드에는 팀 인원 수, 팀원 이름, 등급, 소속 등급 풀을 표시한다.
- 풋볼 화면은 잔디/피치 느낌의 전용 테마 CSS를 사용한다.

## 6. 비기능 요구사항

- Backend는 JSON 기반 REST API를 제공한다.
- Frontend는 Next.js App Router와 TypeScript를 사용한다.
- 에러 응답은 통일된 포맷을 사용한다.
- 입력값 유효성 검증을 수행한다.
- 모바일 기준 최소 44px 터치 타겟을 유지한다.
- 헬스와 풋볼 화면 모두 반응형으로 동작해야 한다.
- 개발 기본 포트는 Backend 8080, Frontend 3000이다.
- 로컬에서 별도 인스턴스 확인이 필요할 때 Backend 8081, Frontend 3000/3001로 우회 실행할 수 있다.
