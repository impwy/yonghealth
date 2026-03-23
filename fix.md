# 패키지 구조 리팩토링 - domain / service 분리

## 목표
`domain` 패키지에는 Entity, Repository, DTO만 두고, `service`와 `controller`를 별도 최상위 패키지로 분리한다.
Unit Test는 JPA 없이 순수 Mockito로 동작하도록 한다.

## 변경 전 구조
```
com.yong.yonghealth/
├── domain/
│   ├── workout/
│   │   ├── Workout.java, WorkoutRepository.java, WorkoutController.java
│   │   ├── dto/ (Request, Response, DetailResponse)
│   │   └── service/ (DefaultWorkoutService, ports/in/WorkoutUseCase)
│   ├── exercise/
│   │   ├── Exercise.java, ExerciseRepository.java, ExerciseController.java, ExerciseService.java
│   │   └── dto/
│   └── exerciseset/
│       ├── ExerciseSet.java, ExerciseSetRepository.java, ExerciseSetController.java, ExerciseSetService.java
│       ├── WeightUnit.java
│       └── dto/
```

## 변경 후 구조
```
com.yong.yonghealth/
├── domain/
│   ├── workout/ (Workout, WorkoutRepository, dto/)
│   ├── exercise/ (Exercise, ExerciseRepository, dto/)
│   └── exerciseset/ (ExerciseSet, ExerciseSetRepository, WeightUnit, dto/)
├── service/
│   ├── workout/
│   │   ├── ports/in/WorkoutUseCase.java
│   │   └── DefaultWorkoutService.java
│   ├── exercise/
│   │   ├── ports/in/ExerciseUseCase.java
│   │   └── DefaultExerciseService.java
│   └── exerciseset/
│       ├── ports/in/ExerciseSetUseCase.java
│       └── DefaultExerciseSetService.java
├── controller/
│   ├── WorkoutController.java
│   ├── ExerciseController.java
│   └── ExerciseSetController.java
```

## 체크리스트

### 1. Workout 패키지 분리
- [x] `domain/workout/service/` → `service/workout/`로 이동 (DefaultWorkoutService, ports/in/WorkoutUseCase)
- [x] `domain/workout/WorkoutController.java` → `controller/WorkoutController.java`로 이동
- [x] 패키지 선언 및 import 수정

### 2. Exercise 인터페이스 분리 + 패키지 이동
- [x] `service/exercise/ports/in/ExerciseUseCase.java` 인터페이스 생성
- [x] `domain/exercise/ExerciseService.java` → `service/exercise/DefaultExerciseService.java`로 이동+리네임
- [x] `domain/exercise/ExerciseController.java` → `controller/ExerciseController.java`로 이동
- [x] Controller가 ExerciseUseCase 인터페이스에 의존하도록 수정

### 3. ExerciseSet 인터페이스 분리 + 패키지 이동
- [x] `service/exerciseset/ports/in/ExerciseSetUseCase.java` 인터페이스 생성
- [x] `domain/exerciseset/ExerciseSetService.java` → `service/exerciseset/DefaultExerciseSetService.java`로 이동+리네임
- [x] `domain/exerciseset/ExerciseSetController.java` → `controller/ExerciseSetController.java`로 이동
- [x] Controller가 ExerciseSetUseCase 인터페이스에 의존하도록 수정

### 4. Unit Test 작성 (JPA 없이 순수 Mockito)
- [x] DefaultWorkoutServiceTest 패키지 이동 (service/workout/)
- [x] DefaultExerciseServiceTest 작성 (4개 테스트)
- [x] DefaultExerciseSetServiceTest 작성 (4개 테스트)
- [x] WorkoutControllerTest 패키지 이동 (controller/) + JPA 의존 제거
- [x] ExerciseControllerTest 작성 (4개 테스트)
- [x] ExerciseSetControllerTest 작성 (5개 테스트)

### 5. 정리
- [x] 기존 파일 삭제 확인
- [x] 컴파일 검증 (`./gradlew compileJava`) ✓
- [x] 테스트 검증 (`./gradlew test`) ✓ 전체 통과
- [x] contextLoads 테스트 - DB 없을 때 스킵하도록 @EnabledIfEnvironmentVariable 적용
- [ ] 커밋
