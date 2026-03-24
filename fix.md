# 패키지 구조 리팩토링 - 계층형 패키지 구조

## 목표
도메인별 하위 패키지를 없애고, 계층별 플랫 패키지 구조로 변경한다.

## 변경 전 → 변경 후
```
변경 전:                              변경 후:
domain/workout/Workout.java       →  domain/Workout.java
domain/exercise/Exercise.java     →  domain/Exercise.java
domain/exerciseset/ExerciseSet.java → domain/ExerciseSet.java
domain/exerciseset/WeightUnit.java → domain/WeightUnit.java
domain/workout/dto/*.java         →  dto/WorkoutRequest.java 등
domain/workout/WorkoutRepository  →  repository/WorkoutRepository.java
service/workout/Default*          →  service/DefaultWorkoutService.java
service/workout/ports/in/*        →  service/ports/in/WorkoutUseCase.java
controller/ (유지)                →  controller/ (유지)
```

## 체크리스트

### 1. domain 패키지 (Entity만)
- [x] Workout, Exercise, ExerciseSet, WeightUnit → `domain/` 플랫으로 이동
- [x] BaseTimeEntity는 `domain/`으로 이동

### 2. dto 패키지
- [x] 모든 DTO → `dto/` 플랫으로 이동

### 3. repository 패키지
- [x] 모든 Repository → `repository/` 플랫으로 이동

### 4. service 패키지
- [x] DefaultWorkoutService, DefaultExerciseService, DefaultExerciseSetService → `service/` 플랫
- [x] WorkoutUseCase, ExerciseUseCase, ExerciseSetUseCase → `service/ports/in/` 플랫

### 5. controller 패키지 (이미 플랫)
- [x] import 수정만

### 6. global 패키지
- [x] import 수정 (BaseTimeEntity 이동에 따른)

### 7. 테스트 수정
- [x] 모든 테스트 패키지 및 import 수정

### 8. 검증 및 커밋
- [x] 컴파일 검증
- [x] 테스트 검증
- [x] 커밋

---

# 프론트엔드 UX 수정

## 수정 내용

### 1. 메인 페이지 날짜 필터 기본값 → 오늘
- [x] `app/page.tsx`: `dateFilter` 초기값을 `''` → `new Date().toISOString().split('T')[0]`로 변경
- [x] 빌드 검증 통과

### 2. 상세/생성 페이지에 "← 목록으로" 링크 추가
- [x] `app/workouts/[id]/page.tsx`: 상단에 `Link href="/"` 추가
- [x] `app/workouts/new/page.tsx`: 상단에 `Link href="/"` 추가
- [x] 빌드 검증 통과

---

# 모바일 최적화 (iPhone)

## 수정 내용

### 1. Viewport & Safe Area 설정
- [x] `app/layout.tsx`: Viewport export 추가 (device-width, maximumScale:1, viewportFit:"cover", apple web app 설정)
- [x] `app/globals.css`: env(safe-area-inset-*) 패딩, tap-highlight 제거, iOS input 16px 줌 방지

### 2. Navbar 반응형
- [x] `components/ui/Navbar.tsx`: text-lg md:text-xl, px-3 md:px-4, min-h-[44px] 터치 타겟, active: 상태

### 3. 운동 상세 페이지 반응형
- [x] `app/workouts/[id]/page.tsx`: grid-cols-1 md:grid-cols-2, min-h-[44px] 터치 타겟, active: 상태, 반응형 패딩

### 4. 운동 기록 폼 반응형
- [x] `components/WorkoutForm.tsx`: grid-cols-1 md:grid-cols-2, overflow-x-auto 테이블, min-h-[44px]/min-h-[52px] 터치 타겟

### 5. 세트 테이블 반응형
- [x] `components/SetTable.tsx`: overflow-x-auto, min-w-[320px] 테이블, min-h-[44px] 터치 타겟, flex-wrap 추가 폼

### 6. 종목 아코디언 반응형
- [x] `components/ExerciseAccordion.tsx`: min-h-[48px] 헤더, min-h-[44px] 버튼 터치 타겟, active: 상태, truncate 긴 텍스트 대응

### 7. Toast 안전 영역 대응
- [x] `components/ui/Toast.tsx`: top → safe-area-inset-top 반영, 좌우 여백 확보, 중앙 정렬

### 8. 빌드 검증
- [x] `npx next build` 통과
