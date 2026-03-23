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
- [ ] 커밋
