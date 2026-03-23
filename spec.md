# YongHealth - 운동 일지 앱 기능 명세서

## 1. 개요

하루하루의 운동 기록을 관리하는 웹 애플리케이션.
사용자는 운동 날짜, 시간, 종목, 세트별 중량/횟수를 기록하고 조회할 수 있다.

## 2. 도메인 모델

### 2.1 Workout (운동 세션)
하루의 운동 단위. 하나의 세션에 여러 운동 종목을 포함한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| workoutDate | LocalDate | 운동 날짜 |
| startTime | LocalTime | 운동 시작 시간 |
| endTime | LocalTime | 운동 종료 시간 (선택) |
| memo | String | 메모 (선택) |
| createdAt | LocalDateTime | 생성일시 |
| updatedAt | LocalDateTime | 수정일시 |

### 2.2 Exercise (운동 종목)
하나의 세션 내에서 수행한 개별 운동 종목.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| workout | Workout | FK - 소속 세션 |
| name | String | 종목명 (예: 벤치프레스, 스쿼트) |
| sortOrder | Integer | 종목 순서 |

### 2.3 ExerciseSet (세트)
운동 종목 당 각 세트의 기록.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | Long | PK |
| exercise | Exercise | FK - 소속 종목 |
| setNumber | Integer | 세트 번호 (1, 2, 3...) |
| weight | Double | 중량 |
| weightUnit | WeightUnit | 중량 단위 (KG / LB) |
| reps | Integer | 반복 횟수 |

### 2.4 WeightUnit (중량 단위 - Enum)

| 값 | 설명 |
|---|---|
| KG | 킬로그램 |
| LB | 파운드 |

## 3. 기능 요구사항

### 3.1 운동 세션 관리
- **세션 생성**: 날짜, 시작 시간을 입력하여 새 운동 세션 생성
- **세션 조회**: 전체 목록 조회, 날짜별 조회, 단건 상세 조회
- **세션 수정**: 날짜, 시간, 메모 수정
- **세션 삭제**: 세션 삭제 시 하위 종목/세트 모두 삭제 (cascade)

### 3.2 운동 종목 관리
- **종목 추가**: 세션에 운동 종목 추가 (종목명 입력)
- **종목 수정**: 종목명, 순서 변경
- **종목 삭제**: 종목 삭제 시 하위 세트 모두 삭제 (cascade)

### 3.3 세트 관리
- **세트 추가**: 종목에 세트 추가 (중량, 단위, 횟수 입력)
- **세트 수정**: 중량, 단위, 횟수 변경
- **세트 삭제**: 개별 세트 삭제

### 3.4 중량 단위
- 세트별로 KG 또는 LB 단위를 선택할 수 있다
- 단위 변환 기능: KG ↔ LB 상호 변환 (1 KG = 2.20462 LB)

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

### 4.4 단위 변환
| Method | URI | 설명 |
|---|---|---|
| GET | /api/convert?value={value}&from={unit}&to={unit} | 중량 단위 변환 |

## 5. 프론트엔드 화면 명세

### 5.1 메인 페이지 (`/`)
- 운동 세션 목록을 날짜 역순으로 표시
- 각 세션 카드: 날짜, 시작시간, 운동 종목 수, 총 세트 수 요약
- "새 운동 기록" 버튼
- 날짜 필터링 (날짜 선택)

### 5.2 운동 세션 상세/편집 페이지 (`/workouts/[id]`)
- 세션 정보 표시/수정 (날짜, 시작시간, 종료시간, 메모)
- 운동 종목 리스트 (아코디언 형태)
  - 종목명 표시 / 수정 / 삭제
  - "종목 추가" 버튼
- 각 종목 하위에 세트 테이블
  - 세트번호 | 중량 | 단위(KG/LB 토글) | 횟수
  - 세트 추가 / 수정 / 삭제
- 세션 삭제 버튼 (확인 다이얼로그)

### 5.3 새 운동 기록 페이지 (`/workouts/new`)
- 날짜, 시작시간 입력 폼
- 종목 추가 → 세트 추가를 한 화면에서 진행
- 저장 버튼

### 5.4 공통 UI 요소
- 상단 네비게이션 바 (앱 이름, 홈 링크)
- 로딩 스피너
- 에러/성공 토스트 메시지
- 반응형 레이아웃 (모바일 대응)

## 6. 비기능 요구사항

- Backend: REST API (JSON 응답)
- Frontend: Next.js (App Router, TypeScript)
- 에러 응답은 통일된 포맷 사용
- 입력값 유효성 검증 (중량 > 0, 횟수 > 0 등)
- Backend 포트: 8080 / Frontend 포트: 3000
- CORS 설정으로 프론트엔드 ↔ 백엔드 통신 허용
