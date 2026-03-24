# YongHealth 프로젝트 규칙

## 프로젝트 개요
운동 일지 웹 애플리케이션 (Backend + Frontend 모노레포)

## 기술 스택
- **Backend**: Spring Boot 4.0.4, Java 25, Gradle (Kotlin DSL), JPA/MySQL, Lombok
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend 포트**: 8080 / **Frontend 포트**: 3000
- **테스트 DB**: H2 인메모리 (`src/test/resources/application.yml`)

## 백엔드 패키지 구조
계층형 플랫 패키지 구조를 사용한다. 도메인별 하위 패키지를 만들지 않는다.
```
com.yong.yonghealth/
├── domain/        (Workout, Exercise, ExerciseSet, WeightUnit, BaseTimeEntity)
├── dto/           (모든 Request/Response DTO)
├── repository/    (WorkoutRepository, ExerciseRepository, ExerciseSetRepository)
├── service/       (DefaultWorkoutService, DefaultExerciseService, DefaultExerciseSetService)
│   └── ports/in/  (WorkoutUseCase, ExerciseUseCase, ExerciseSetUseCase)
├── controller/    (WorkoutController, ExerciseController, ExerciseSetController)
└── global/        (config/, error/, util/)
```

## 백엔드 컨벤션
- **아키텍처**: 헥사고날 스타일 — Service 인터페이스를 `service/ports/in/`에 분리하여 의존 역전 적용
- **구현체 네이밍**: `Default` 접두사 사용 (예: `DefaultWorkoutService`). `Impl` 접미사는 사용하지 않음
- **Lombok**: `@Builder` 패턴 선호. 필요 시 `@AllArgsConstructor`, `@NoArgsConstructor`와 함께 사용
- **Entity**: `BaseTimeEntity` 상속 (createdAt, updatedAt 자동 관리)
- **Cascade 삭제**: Workout → Exercise → ExerciseSet

## 테스트 컨벤션
- **Service 테스트**: `@SpringBootTest` + `@Transactional` + H2 인메모리 DB 사용
- **Domain 테스트**: `@SpringBootTest` + `@Transactional` — 엔티티 생성/수정, Cascade, 감사 필드 검증
- **Controller 테스트**: `@WebMvcTest` + `@MockitoBean` (Spring Boot 4.x)
- **유틸리티 테스트**: 순수 JUnit (Spring 컨텍스트 불필요)
- 구현마다 테스트를 작성하고 `./gradlew test`로 검증한 후 커밋

### Spring Boot 4.x 테스트 API 변경사항
- `@MockBean` → `@MockitoBean` (`org.springframework.test.context.bean.override.mockito.MockitoBean`)
- `@WebMvcTest` → `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`
- `ObjectMapper` → `tools.jackson.databind.ObjectMapper` (Jackson 3.x)

## 작업 규칙
- 구현 전 반드시 **explore 에이전트**를 사용하여 기존 코드베이스를 탐색한 후 작업
- 각 Phase 완료 시 **빌드/구조 검증** 수행
- `task.md`에 체크박스로 구현 현황을 업데이트
- 커밋 메시지는 **한국어**로 작성
- Insight는 대화에 인라인 출력하지 않고 `insight.md` 파일에 정리

## 주요 문서
- `spec.md`: 기능 명세서 (도메인 모델, API, 프론트엔드 화면)
- `plan.md`: 구현 계획서 (패키지 구조, Phase 1~10)
- `task.md`: 구현 현황 체크리스트
- `fix.md`: 리팩토링 변경 체크리스트
- `insight.md`: 개발 과정에서 얻은 인사이트 정리

## 프론트엔드 컨벤션
- App Router 사용 (서버 컴포넌트 기본)
- 컴포넌트는 `components/` 디렉토리에 배치
- API 호출은 `lib/api.ts`에 집중
- 타입 정의는 `types/index.ts`에 관리
