# YongHealth - 기능 명세서

## 1. 개요

YongHealth는 운동 일지와 풋볼 팀 편성을 함께 제공하는 웹 애플리케이션이다.

- 헬스 영역: 운동 날짜, 시간, 종목, 세트별 중량/횟수를 기록하고 조회한다.
- 풋볼 영역: 회원을 등록하고 티어별 랜덤 팀 편성을 균등 인원 기준으로 생성한다.

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
| grade | Integer | 티어 (1~6) |
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
- 풋볼 관리 화면에서 회원 수정이 가능해야 한다.
- 회원 등록 시 입력값은 이름, 티어다.
- 이름은 필수이며 중복 등록을 허용하지 않는다.
- 티어는 1~6 범위만 허용한다.
- 회원 등록 UI는 화면 인라인 폼이 아니라 팝업 형태로 열려야 한다.
- 회원 목록 UI는 요약/상세 토글을 제공해야 한다.
- 회원 목록을 가린 상태에서는 전체 인원 수와 티어별 인원 수만 보여줘야 한다.
- 회원 관리 기능은 `/football/manage` 탭에서만 제공한다.

### 3.6 풋볼 팀 편성

- 팀 수는 최소 2팀 이상이어야 한다.
- 팀 수는 이번 경기로 선택한 인원 수보다 많을 수 없다.
- 편성 대상은 저장된 전체 회원이 아니라 사용자가 이번 경기 참가자로 선택한 회원 목록이어야 한다.
- 편성은 선택된 회원을 티어별로 독립적으로 셔플한 뒤 분배한다.
- 현재 규칙은 `1티어`, `2티어`, `3티어`, `4티어`, `5티어`, `6티어`를 각각 별도 그룹으로 사용한다.
- 3티어와 4티어는 합치지 않는다.
- 팀별 인원 수는 전체 회원 수 기준으로 최대한 균등해야 하며 팀 간 인원 차이는 1명을 넘기면 안 된다.
- 예시:
  - 10명 / 2팀 → `5:5`
  - 9명 / 2팀 → `5:4`
  - 11명 / 2팀 → `6:5`
  - 12명 / 3팀 → `4:4:4`
  - 12명 / 2팀 → `6:6`
- 각 티어 내에서는 셔플 후, 해당 티어를 가장 적게 보유한 팀부터 우선 배정(min-load greedy)하여 팀 간 티어 인원 차이도 최대 1명이 되도록 보장한다.
- 이미 목표 인원 수가 찬 팀에는 추가 배정하지 않는다.
- 한 번 생성 시 1개의 랜덤 편성을 보여주고, 동일 버튼으로 "다시 굴리기"가 가능하다.
- 팀 카드에는 팀 번호, 인원 수, 티어 합산(단순 합)을 함께 표시한다.
- "클립보드 복사" 버튼을 제공하며 `{팀번호}팀: 이름, 이름 ...` 줄바꿈 포맷으로 복사한다.
- 팀 편성 모드는 `완전 랜덤`과 `룰렛`을 제공한다.
- 룰렛 모드는 고정된 멤버를 먼저 팀에 배치하고, 고정되지 않은 멤버만 룰렛 후보로 사용한다.
- 룰렛은 실제 회전하는 돌림판 UI로 보여주며 한 스핀에 한 명씩 당첨자를 확정한다.
- 당첨 멤버는 배정 후 팀별 티어합 차이, 해당 티어 분포, 인원 수가 가장 균형에 가까워지는 팀으로 들어간다.
- 룰렛 진행 중에는 편성 저장과 클립보드 복사를 비활성화한다.

### 3.6.1 멤버 팀 고정 (Lock-in)

- 선택된 멤버 카드에서 "자동 / n팀 고정" 드롭다운으로 사전에 팀을 지정할 수 있다.
- 고정된 멤버는 편성 시 해당 팀에 먼저 배치되고, 나머지 멤버가 min-load 규칙으로 분배된다.
- 멤버 선택을 해제하면 해당 멤버의 고정도 함께 해제된다.
- 팀 수를 줄여 고정된 팀 번호가 범위를 벗어나면 해당 고정은 자동 해제된다.

### 3.7 풋볼 팀 수 입력 UX

- 팀 수 입력은 수동 숫자 입력과 증가/감소 버튼을 모두 제공한다.
- 입력 중에는 값이 강제로 되돌아가면 안 된다.
- blur 또는 Enter 시점에만 최소/최대 범위로 정규화한다.

### 3.8 풋볼 저장 팀

- 랜덤으로 생성된 편성은 별도 저장이 가능해야 한다.
- 저장 팀은 이후 회원 정보가 수정되거나 삭제되어도 깨지지 않도록 스냅샷 형태로 보관해야 한다.
- 저장 팀은 이름, 팀 수, 저장 시각, 팀별 멤버 이름/티어를 조회할 수 있어야 한다.
- 저장된 팀 편성은 삭제할 수 있어야 한다. 삭제 시 확인 대화상자를 띄운다.

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
| PUT | /api/football/members/{id} | 회원 수정 |
| DELETE | /api/football/members/{id} | 회원 삭제 |

### 4.8 풋볼 저장 팀

| Method | URI | 설명 |
|---|---|---|
| GET | /api/football/saved-teams | 저장된 팀 편성 목록 조회 |
| POST | /api/football/saved-teams | 팀 편성 스냅샷 저장 |
| DELETE | /api/football/saved-teams/{id} | 저장된 팀 편성 삭제 |

### 4.9 Health Check

| Method | URI | 설명 |
|---|---|---|
| GET | /health | 서버 상태 및 DB 연결 상태 확인 |

## 5. 프론트엔드 화면 명세

### 5.1 앱 레이아웃

- `RootLayout`에 공통 Navbar, AppSidebar, BottomNav를 둔다.
- AppSidebar는 `헬스`와 `풋볼` 탭을 제공한다.
- 풋볼 모드에서는 탭 강조색과 배경 톤을 풋볼 테마로 변경한다.
- 상단 Navbar 브랜드는 헬스 모드에서 `YongHealth`, 풋볼 모드에서 `SundayFC`를 사용한다.
- 풋볼 모드에서는 운동용 타이머와 `새 운동 기록` 액션을 숨긴다.

### 5.4 풋볼 팀 생성 페이지 (`/football`)

- 이번 경기 참가 멤버를 선택하는 선택 보드
- 팀 수 입력 및 랜덤 편성 생성
- 3개의 시나리오 비교 및 선택 저장
- 저장된 팀 편성 목록 조회

### 5.5 풋볼 관리 페이지 (`/football/manage`)

- 회원 등록 팝업
- 등록 회원 요약/상세 목록
- 회원 수정/삭제

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
- 회원 등록 패널:
  - 팝업 열기 버튼
  - 모바일/데스크탑 공통 모달에서 이름, 티어 입력
- 회원 목록 패널:
  - 기본 상태는 요약 뷰
  - 전체 인원 수, 티어별 인원 수 표시
  - `회원 목록 보기 / 가리기` 토글 제공
  - 펼친 상태에서만 회원 카드와 삭제 버튼 표시
- 팀 생성 패널:
  - 팀 수 입력
  - 증가/감소 버튼
  - 생성 조건 안내 메시지
  - 현재 인원 기준 예상 팀별 인원 수 표시
  - 3개의 랜덤 편성안 카드 표시
- 팀 카드에는 팀 인원 수, 팀원 이름, 티어를 표시한다.
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
- 개발 기본 원칙은 TDD(`Red → Green → Refactor`) 이다.
- 핵심 도메인 규칙은 domain logic test로 고정해야 한다.
- `service`, `global`, `domain`, `controller` 계층 테스트가 함께 유지되어야 한다.
- 핵심 사용자 흐름은 API E2E 테스트로 회귀를 방지해야 한다.
- Frontend 프로덕션 빌드는 로컬 안정성을 위해 `next build --webpack`으로 실행한다.
- 프론트엔드 폰트는 빌드 시 외부 네트워크 fetch가 필요 없는 시스템 폰트 스택을 사용한다.
- Vercel 배포 환경에서는 Vercel이 주입하는 `outputFileTracingRoot`와 충돌하지 않도록 `turbopack.root`를 설정하지 않는다.
