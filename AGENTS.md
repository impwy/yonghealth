# YongHealth 프로젝트 규칙

## 프로젝트 개요
운동 일지와 풋볼 팀 편성을 함께 제공하는 웹 애플리케이션 (Backend + Frontend 모노레포)

## 기술 스택
- **Backend**: Spring Boot 4.0.4, Java 25, Gradle (Kotlin DSL), JPA/MySQL, Lombok
- **Frontend**: Next.js 16.2.1 (App Router), TypeScript, Tailwind CSS 4
- **Backend 포트**: 8080 / **Frontend 포트**: 3000
- **테스트 DB**: H2 인메모리 (`src/test/resources/application.yml`)

## 백엔드 패키지 구조
계층형 플랫 패키지 구조를 사용한다. 도메인별 하위 패키지를 만들지 않는다.
```
com.yong.yonghealth/
├── domain/        (Workout, Exercise, ExerciseSet, WeightUnit, BaseTimeEntity,
│                  ExerciseCatalog, ExerciseCatalogAlias, FootballMember, enum들)
├── dto/           (운동/카탈로그/풋볼 관련 모든 Request/Response DTO)
├── repository/    (Workout/Exercise/Set + ExerciseCatalog + FootballMember Repository)
├── service/       (DefaultWorkoutService, DefaultExerciseService, DefaultExerciseSetService,
│                  DefaultExerciseCatalogService, DefaultFootballMemberService)
│   └── ports/in/  (WorkoutUseCase, ExerciseUseCase, ExerciseSetUseCase,
│                  ExerciseCatalogUseCase, FootballMemberUseCase)
├── controller/    (WorkoutController, ExerciseController, ExerciseSetController,
│                  ExerciseCatalogController, FootballMemberController)
└── global/        (config/, error/, util/)
```

## 백엔드 컨벤션
- **아키텍처**: 헥사고날 스타일 — Service 인터페이스를 `service/ports/in/`에 분리하여 의존 역전 적용
- **구현체 네이밍**: `Default` 접두사 사용 (예: `DefaultWorkoutService`). `Impl` 접미사는 사용하지 않음
- **Lombok**: `@Builder` 패턴 선호. 필요 시 `@AllArgsConstructor`, `@NoArgsConstructor`와 함께 사용
- **Entity**: `BaseTimeEntity` 상속 (createdAt, updatedAt 자동 관리)
- **Cascade 삭제**: Workout → Exercise → ExerciseSet

## 테스트 컨벤션
- **개발 방식**: 기본 원칙은 TDD (`Red → Green → Refactor`) 이다.
- 구현 변경 전 먼저 실패하는 테스트를 작성하고, 테스트를 통과시키는 최소 구현 후 리팩토링한다.
- 새 기능/버그 수정은 테스트 없이 머지하지 않는다.
- **Service 테스트**: `@SpringBootTest` + `@Transactional` + H2 인메모리 DB 사용
- **Domain 로직 테스트**: 순수 JUnit 우선. 영속성/Cascade/감사 필드 검증은 `@SpringBootTest` + `@Transactional`
- **Controller 테스트**: `@WebMvcTest` + `@MockitoBean` (Spring Boot 4.x)
- **Global 테스트**: `GlobalExceptionHandler`, `WebConfig`, initializer, util을 각각 검증한다.
- **E2E 테스트**: 핵심 사용자 흐름은 `@SpringBootTest` + `@AutoConfigureMockMvc` 기반 API E2E를 반드시 포함한다.
- **유틸리티 테스트**: 순수 JUnit (Spring 컨텍스트 불필요)
- 구현마다 테스트를 작성하고 `./gradlew test`로 검증한 후 커밋한다.

### Spring Boot 4.x 테스트 API 변경사항
- `@MockBean` → `@MockitoBean` (`org.springframework.test.context.bean.override.mockito.MockitoBean`)
- `@WebMvcTest` → `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`
- `ObjectMapper` → `tools.jackson.databind.ObjectMapper` (Jackson 3.x)

## Git 브랜치 전략

### 브랜치 구조
```
main          ← 운영 배포 (자동 배포, 직접 커밋 금지)
  └── develop ← 통합 브랜치 (다음 릴리즈 준비)
        ├── feature/XXX  ← 새 기능 개발
        ├── fix/XXX      ← 일반 버그 수정
        └── style/XXX    ← UI/디자인 변경
  └── hotfix/XXX ← 긴급 운영 버그 (main에서 분기 → main + develop 병합)
```

### 브랜치 네이밍 규칙
| 유형 | 네이밍 | 예시 | 분기 원점 | 병합 대상 |
|------|--------|------|-----------|-----------|
| 기능 | `feature/간단한-설명` | `feature/rest-timer` | develop | develop |
| 버그 | `fix/간단한-설명` | `fix/exercise-picker-overlap` | develop | develop |
| 스타일 | `style/간단한-설명` | `style/calendar-redesign` | develop | develop |
| 긴급 | `hotfix/간단한-설명` | `hotfix/login-crash` | main | main + develop |

### 워크플로우
1. `develop`에서 작업 브랜치 생성: `git checkout -b feature/XXX develop`
2. 작업 완료 후 PR 생성: `feature/XXX → develop`
3. 코드 리뷰 후 Squash Merge
4. 릴리즈 준비 완료 시: `develop → main` PR 생성 (버전 태그 포함)
5. main 병합 시 자동 배포

### PR 규칙
- PR 제목: 커밋 prefix와 동일 (`feat: 쉬는 시간 타이머`, `fix: 달력 날짜 버그`)
- 하나의 PR은 하나의 기능/수정에 집중
- `main` 직접 push 금지 (항상 PR을 통해 병합)
- develop → main은 여러 기능을 묶어서 릴리즈 단위로 병합

### 버전 태그
- `v1.0.0` — Phase 1~9 (초기 릴리즈)
- `v1.1.0` — Phase 10~12 (타이머, UI 개선)
- 규칙: `v{major}.{minor}.{patch}` (기능 추가=minor, 버그 수정=patch, 호환 깨짐=major)

## 필수 Git 워크플로우 (모든 변경에 자동 적용)
코드 수정 요청이 들어오면 **지시 없이도** 아래 순서를 반드시 따른다:

1. **브랜치 생성**: 작업 유형에 맞는 브랜치를 develop에서 생성 후 전환
   - 버그 수정 → `git checkout -b fix/설명 develop`
   - 새 기능 → `git checkout -b feature/설명 develop`
   - UI/스타일 → `git checkout -b style/설명 develop`
2. **코드 수정**: 작업 수행
3. **문서 동기화**: `spec.md`, `plan.md`, `fix.md`, `insight.md`를 변경 내용에 맞춰 업데이트
4. **task.md 업데이트**: 해당 항목 체크박스 추가 및 완료 처리
5. **커밋**: 한국어 커밋 메시지로 커밋

단, develop 브랜치가 없으면 main에서 먼저 develop을 생성한다.

## 작업 규칙
- 구현 전 반드시 **explore 에이전트**를 사용하여 기존 코드베이스를 탐색한 후 작업
- 각 Phase 완료 시 **빌드/구조 검증** 수행
- 기능 추가/수정 시 `service`, `global`, `domain`, `controller` 전반의 테스트 영향을 같이 검토한다.
- 핵심 도메인 규칙은 domain logic test로 고정하고, 주요 사용자 시나리오는 E2E로 회귀 방지한다.
- `task.md`에 체크박스로 구현 현황을 업데이트
- 기능/버그 수정이 완료되면 관련 문서(`spec.md`, `plan.md`, `fix.md`, `insight.md`)를 함께 동기화
- 프로젝트 운영 규칙이 바뀌면 `CLAUDE.md`와 `AGENTS.md`를 같이 수정
- 커밋 메시지는 **한국어**로 작성하되, 의미 있는 **prefix**를 사용한다
  - `feat:` 새 기능 추가
  - `fix:` 버그 수정
  - `refactor:` 리팩토링 (기능 변경 없음)
  - `style:` UI/스타일 변경
  - `docs:` 문서 수정
  - `test:` 테스트 추가/수정
  - `chore:` 빌드, 설정 등 기타
  - 예시: `feat: 쉬는 시간 타이머 구현`, `fix: ExercisePicker 레이어 겹침 수정`
- Phase/기능 단위로 **커밋을 남긴다** (작업 완료 후 반드시 커밋)
- Insight는 대화에 인라인 출력하지 않고 `insight.md` 파일에 정리

## 작업 워크플로우
1. `requirement.md`를 읽고 고객 요구사항을 파악한다
2. 수정이 필요한 항목은 `fix.md`에 정리한다
3. 구현 계획은 `plan.md`에 작성하고 실행한다
4. 기능 명세는 `spec.md`에 반영한다
5. 진행 현황은 `task.md`에 체크박스로 업데이트한다
6. 면접/공부에 유용한 기술적 인사이트는 `insight.md`에 정리한다

## 주요 문서
- `requirement.md`: 고객 요구사항 (사용자가 작성, 변경 사항의 출발점)
- `spec.md`: 기능 명세서 (도메인 모델, API, 프론트엔드 화면)
- `plan.md`: 구현 계획서 (패키지 구조, Phase별 계획)
- `task.md`: 구현 현황 체크리스트
- `fix.md`: 수정/리팩토링 변경 체크리스트
- `insight.md`: 개발 과정에서 얻은 인사이트 (면접/공부용)

## 프론트엔드 컨벤션
- App Router 사용 (서버 컴포넌트 기본)
- 컴포넌트는 `components/` 디렉토리에 배치
- API 호출은 `lib/api.ts`에 집중
- 타입 정의는 `types/index.ts`에 관리
- 도메인 로직이 있는 순수 함수는 `lib/`로 분리한다. 예: `teamGenerator.ts`
- 앱 공통 전환 구조는 `app/layout.tsx` + `components/ui/AppSidebar.tsx`를 기준으로 유지한다
- 풋볼 화면 전용 컴포넌트는 `components/football/` 아래에 모은다

## 풋볼 규칙
- 풋볼 회원은 로그인 개념이 아니라 단순 등록 데이터다
- 등급은 `1~6`만 허용한다
- 팀 편성은 `1등급`, `2등급`, `3등급`, `4등급`, `5등급`, `6등급`을 각각 독립적으로 분배한다
- 3등급과 4등급은 합치지 않는다
- 한 번 생성 시 3개의 랜덤 편성안을 보여준다
- 팀 수 입력은 입력 중 문자열 상태를 유지하고, blur/Enter 시점에만 정규화한다

## 로컬 실행 메모
- 개발용 MySQL은 Docker 컨테이너 `yonghealth-mysql` 기준으로 사용한다
- 환경에 따라 `localhost:3306` 대신 `127.0.0.1:3306`으로 실행해야 연결된다
- 화면 확인용으로 백엔드를 8081에 띄울 때는 프론트를 아래처럼 실행한다

```bash
./gradlew bootRun --args='--server.port=8081 --spring.datasource.url=jdbc:mysql://127.0.0.1:3306/yonghealth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul'
cd frontend && NEXT_PUBLIC_API_URL=http://127.0.0.1:8081 npm run dev
```
