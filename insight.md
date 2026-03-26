# Insights

---

## 아키텍처

### 헥사고날 스타일 (Ports & Adapters)
```
Controller → UseCase(interface) → DefaultXxxService(구현체) → Repository
```
- `service/ports/in/`에 UseCase 인터페이스 분리 → 의존 역전(DIP) 적용
- Controller는 인터페이스에만 의존 → 구현체 교체 시 Controller 불변
- `DefaultXxx` 네이밍 사용 (`Impl` 접미사 지양)
- Service 간 의존도 인터페이스로: `DefaultExerciseService`가 `WorkoutUseCase` 주입
- 테스트 시 `@MockitoBean WorkoutUseCase`로 Mock 주입 용이

### 계층형 플랫 패키지 구조
- 도메인별 패키지(`domain/workout/`, `domain/exercise/`)는 응집도가 높지만 소규모에서 탐색이 번거로움
- 계층별 플랫 구조(`domain/`, `dto/`, `service/`)는 Spring 컴포넌트 스캔과 자연스럽게 맞음
- `service/ports/in/`을 통합 관리하면 UseCase 인터페이스들을 한눈에 파악 가능

---

## JPA 엔티티 설계

### @NoArgsConstructor(access = AccessLevel.PROTECTED)
```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Workout extends BaseTimeEntity { ... }
```
- JPA 스펙상 기본 생성자 필요, `PROTECTED`로 외부 `new Workout()` 호출 차단 → Builder 사용 강제
- `PRIVATE`는 안 됨: Hibernate 프록시가 상속으로 생성자 접근하기 때문

### @Builder 위치
```java
@Builder
public Workout(LocalDate workoutDate, ...) { ... }  // 클래스가 아닌 생성자에 붙임
```
- 클래스 레벨 `@Builder` 대신 생성자에 붙이면 원하는 필드만 Builder 파라미터에 포함 가능
- `id`, `exercises` 같은 JPA 관리 필드를 Builder에서 제외할 수 있음

### Cascade & orphanRemoval
```java
@OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Exercise> exercises = new ArrayList<>();
```
- `cascade = ALL`: 부모 저장/삭제 시 자식도 함께 처리
- `orphanRemoval = true`: 컬렉션에서 제거되면 DB에서도 삭제 (cascade만으로는 `remove()` 시 DB 삭제 안 됨)
- Cascade 삭제 테스트 시 **양방향 연관관계 동기화** 필수:
  - `exerciseRepository.save(exercise)` 만으로는 `workout.getExercises()`에 추가 안 됨
  - `workout.getExercises().add(exercise)`로 부모 컬렉션에 직접 추가해야 Cascade 정상 동작
  - 부모 삭제 시 Hibernate가 컬렉션 순회하며 자식 삭제 → 컬렉션에 없으면 `TransientPropertyValueException`

### LAZY 로딩
```java
@ManyToOne(fetch = FetchType.LAZY)  // @ManyToOne 기본값이 EAGER → 명시적으로 LAZY 설정
```
- EAGER: 조회할 때마다 연관 엔티티 즉시 로딩 → N+1 문제 유발

### BaseTimeEntity (JPA Auditing)
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {
    @CreatedDate
    @Column(updatable = false)  // SQL UPDATE 구문에서 제외
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```
- `@MappedSuperclass`: 이 클래스 자체는 테이블 없음, 필드만 자식에게 상속
- `@EnableJpaAuditing` 활성화 필요 → 별도 `JpaAuditingConfig` 클래스로 분리

### @Enumerated(STRING)
```java
@Enumerated(EnumType.STRING)  // "KG", "LB" 문자열로 저장
```
- 기본값 `EnumType.ORDINAL`: 0, 1, 2... 숫자 저장 → Enum 순서 변경 시 데이터 오염
- `EnumType.STRING`: 안전하고 가독성 좋음, 항상 사용 권장

### Rich Domain Model (도메인 편의 메서드)
```java
public int getTotalSetCount() {
    return exercises.stream().mapToInt(e -> e.getSets().size()).sum();
}
```
- 비즈니스 로직을 엔티티에 응집 → Service 코드가 단순해짐
- 반대: Anemic Domain Model — 엔티티에 getter/setter만 있고 로직은 Service에

---

## 트랜잭션 & 영속성

### @Transactional 전략
```java
@Service
@Transactional(readOnly = true)   // 클래스 레벨: 모든 메서드에 읽기전용 적용
public class DefaultWorkoutService implements WorkoutUseCase {

    @Transactional                 // 메서드 레벨: 쓰기 필요한 것만 오버라이드
    public WorkoutResponse create(...) { ... }
}
```
- `readOnly = true`: Hibernate 플러시 생략 → 스냅샷 비교 없음 → 성능 향상
- 조회가 대부분인 서비스에서 클래스 레벨 readOnly 선언이 Best Practice

### Dirty Checking (변경 감지)
```java
public WorkoutResponse update(Long id, WorkoutRequest request) {
    Workout workout = getWorkout(id);  // 영속 상태
    workout.update(...);               // 상태 변경
    return WorkoutResponse.from(workout);  // save() 없어도 커밋 시 자동 UPDATE
}
```
- 트랜잭션 내 영속 상태 엔티티 변경 → 커밋 시 Hibernate가 자동으로 UPDATE 쿼리 실행

---

## DTO 패턴

### 정적 팩토리 메서드
```java
public static WorkoutResponse from(Workout workout) {
    return WorkoutResponse.builder().id(workout.getId())...build();
}
```
- 엔티티 → DTO 변환 로직이 DTO 내부에 응집 → Service는 `WorkoutResponse.from(workout)` 한 줄
- 엔티티 구조 변경 시 DTO 파일만 수정

### Request DTO Lombok 조합
```java
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkoutRequest { ... }
```
- `@Builder`만 있으면 Jackson이 기본 생성자 없어서 역직렬화 실패
- `@NoArgsConstructor + @AllArgsConstructor` 함께 필요: Jackson 역직렬화 + Builder 동시 지원

### @Builder.Default 함정
```java
@Builder.Default
private final LocalDateTime timestamp = LocalDateTime.now();
```
- `@Builder` 사용 시 필드 기본값이 Builder에서 무시됨
- `@Builder.Default` 없으면 `timestamp = null`로 초기화

### Jackson 날짜 직렬화
```java
@JsonFormat(pattern = "yyyy-MM-dd")       private LocalDate workoutDate;
@JsonFormat(pattern = "HH:mm")            private LocalTime startTime;
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") private LocalDateTime createdAt;
```
- Jackson 기본값: `LocalDate → [2026, 3, 24]` 배열, `LocalDateTime → 숫자 타임스탬프`
- Request DTO에도 `@JsonFormat` 필요: JSON 파싱 시 포맷 힌트 제공

---

## Spring Data JPA 쿼리

### 메서드 네이밍 쿼리
```java
List<Workout> findAllByOrderByWorkoutDateDescStartTimeDesc();
List<Workout> findByWorkoutDateOrderByStartTimeAsc(LocalDate date);
List<ExerciseCatalog> findByCategoryAndActiveTrueOrderByNameAsc(BodyPart category);
```

### 커스텀 JPQL
```java
@Query("SELECT DISTINCT c FROM ExerciseCatalog c LEFT JOIN c.aliases a " +
       "WHERE c.active = true AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(a.alias) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY c.name ASC")
List<ExerciseCatalog> searchByNameOrAlias(@Param("query") String query);
```
- `DISTINCT`: LEFT JOIN으로 별칭 수만큼 중복 행 발생 → 제거
- `LOWER()`: 대소문자 무관 검색

---

## 전역 예외 처리

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)   // → 404
    @ExceptionHandler(MethodArgumentNotValidException.class)  // → 400
    @ExceptionHandler(IllegalArgumentException.class)  // → 400
}
```
- 유효성 오류 메시지 조합: `getBindingResult().getFieldErrors()`로 필드별 오류 수집 후 `reduce`로 합침

---

## CORS 설정

```java
@Value("${cors.allowed-origins:http://localhost:3000}")
private String allowedOrigins;

registry.addMapping("/api/**")
        .allowedOriginPatterns(origins)  // allowedOrigins 대신 패턴 지원
```
- `allowedOriginPatterns`: 와일드카드 지원 (`*.vercel.app` 가능)
- `allowedOrigins`: 정확한 URL만 허용, 와일드카드 불가
- `,` 구분 + `trim()` 처리: 환경변수로 여러 origin 주입 시 공백 오류 방지

---

## 테스트 전략

### 계층별 분리
| 계층 | 방식 | 목적 |
|------|------|------|
| Controller | `@WebMvcTest` + `@MockitoBean` | HTTP 동작, 직렬화, 유효성 검증 |
| Service | `@SpringBootTest` + H2 + `@Transactional` | 비즈니스 로직, DB 통합 |
| Domain | `@SpringBootTest` + H2 + `@Transactional` | 엔티티, Cascade, 감사 필드 |
| Util | 순수 JUnit | 단순 로직, Spring 불필요 |

### @WebMvcTest (Controller)
- 해당 Controller만 로드 → 경량, 빠름
- Service는 Mock → HTTP 요청/응답, 직렬화, 유효성 검증에 집중

### @SpringBootTest (Service/Domain)
- 실제 Spring 컨텍스트 + JPA + 트랜잭션 동작
- `@Transactional`: 각 테스트 후 자동 롤백 → 테스트 격리 보장
- H2 인메모리 DB: `src/test/resources/application.yml`로 메인 설정 오버라이드
- `ddl-auto: create-drop`으로 매 테스트 사이클마다 스키마 재생성
- Cascade, 연관관계, Dirty Checking 등 **실제 JPA 동작 검증 가능**

### 왜 Service 테스트에 Mock 안 쓰나?
- Mock 객체가 실제 동작과 다르게 설정될 수 있어 프로덕션 버그를 놓칠 위험
- 실제 DB 통합 테스트로 비즈니스 로직 + 영속성 함께 검증하는 것이 목적

---

## 유틸리티 클래스 패턴

```java
public final class WeightConverter {       // 상속 불가
    private WeightConverter() { }          // 인스턴스화 불가
    public static double convert(...) { }  // 정적 메서드만
}
```
- `Math.round(x * 100.0) / 100.0`: 소수점 2자리 반올림 (부동소수점 오차 방지)

---

## 느슨한 결합 설계

```java
private Long exerciseCatalogId;  // FK 제약 없이 ID만 보관 (엔티티 참조 아님)
```
- 카탈로그 삭제/변경 시 운동 기록 보존 가능
- 단점: 조인 쿼리로 카탈로그 정보 가져오기 불편 → 상황에 따른 트레이드오프

---

## Spring Boot 4.x 마이그레이션

| 항목 | 3.x | 4.x |
|------|-----|-----|
| Mock Bean | `@MockBean` | `@MockitoBean` |
| 패키지 | `org.springframework.boot.test.mock.mockito` | `org.springframework.test.context.bean.override.mockito` |
| WebMvcTest | `org.springframework.boot.test.autoconfigure.web.servlet` | `org.springframework.boot.webmvc.test.autoconfigure` |
| ObjectMapper | `com.fasterxml.jackson.databind` | `tools.jackson.databind` (Jackson 3.x) |
| Java | 17/21 | 25 |

---

## 보충 학습 키워드
- N+1 문제와 fetch join / EntityGraph 해결법
- Spring Security 추가 시 WebMvcTest 설정
- QueryDSL vs Spring Data JPA 쿼리 선택 기준
- 페이징 처리 (Pageable, Page<T>)
- 소프트 삭제 (Soft Delete) vs 하드 삭제

---

## Claude Code 훅(Hook) 시스템

### 개요
Claude Code의 훅은 특정 이벤트 발생 시 자동으로 셸 커맨드를 실행하는 자동화 기능이다.
AI가 파일을 수정하거나 툴을 사용할 때 사이드이펙트(포맷팅, 커밋, 로깅 등)를 자동 처리할 수 있다.

### 설정 파일 위치

| 파일 | 범위 | Git 관리 | 용도 |
|------|------|---------|------|
| `~/.claude/settings.json` | 전역 | N/A | 모든 프로젝트에 적용되는 개인 설정 |
| `.claude/settings.json` | 프로젝트 | 커밋 O | 팀 공유 훅, 권한, 플러그인 |
| `.claude/settings.local.json` | 프로젝트 | Gitignore | 개인 오버라이드 (민감 정보) |

설정 로드 순서: user → project → local (나중이 앞을 오버라이드)

### 훅 이벤트 종류

| 이벤트 | 발생 시점 |
|--------|---------|
| `PreToolUse` | 툴 실행 직전 (차단 가능) |
| `PostToolUse` | 툴 성공 후 |
| `PostToolUseFailure` | 툴 실패 후 |
| `SessionStart` | 세션 시작 시 |
| `Stop` | Claude가 응답 완료 시 |
| `UserPromptSubmit` | 사용자 메시지 제출 시 |
| `PreCompact` | 컨텍스트 압축 직전 |

### 훅 구조 (JSON)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "셸 커맨드",
            "timeout": 30,
            "statusMessage": "스피너에 표시될 메시지"
          }
        ]
      }
    ]
  }
}
```

- `matcher`: 매칭할 툴 이름 (`Write`, `Edit`, `Bash` 등), `|`로 복수 지정
- `type`: `command` (셸), `prompt` (LLM 판단), `agent` (에이전트 실행)
- `async: true`: 백그라운드 실행 (Claude를 블로킹하지 않음)

### 훅 stdin 입력 형식

훅 커맨드는 stdin으로 JSON을 받는다:

```json
{
  "session_id": "abc123",
  "tool_name": "Edit",
  "tool_input": { "file_path": "/path/to/file" },
  "tool_response": { "success": true }
}
```

`jq`로 파싱해서 사용:
```bash
jq -r '.tool_input.file_path // ""'
```

### 실제 적용 예시: insight.md 자동 커밋 훅

이 프로젝트에 적용한 훅 — `insight.md` 수정 시 자동으로 git commit:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path // \"\"' | grep -q 'insight\\.md$' && cd /path/to/project && git add insight.md && git commit -m '문서: insight.md 업데이트' 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**핵심 패턴:**
1. `jq -r '...'` — stdin JSON에서 파일 경로 추출
2. `grep -q 'insight\.md$'` — insight.md인지 확인 (다른 파일은 무시)
3. `git add && git commit` — 조건 충족 시 커밋
4. `2>/dev/null || true` — 실패해도 훅이 Claude를 블로킹하지 않도록

### 훅 검증 방법 (pipe-test)

훅 작성 후 실제 stdin을 시뮬레이션해서 동작 확인:

```bash
# Write/Edit 훅 테스트
echo '{"tool_name":"Edit","tool_input":{"file_path":"/path/to/insight.md"}}' | <커맨드>

# 다른 파일은 무시되는지 확인
echo '{"tool_name":"Edit","tool_input":{"file_path":"/path/to/plan.md"}}' | <커맨드>
```

JSON 스키마 검증:
```bash
jq -e '.hooks.PostToolUse[] | select(.matcher == "Write|Edit") | .hooks[] | .command' .claude/settings.local.json
# exit 0이면 정상
```

### 다른 활용 사례

```bash
# 파일 저장 시 자동 포맷팅
"jq -r '.tool_input.file_path // \"\"' | { read -r f; prettier --write \"$f\"; } 2>/dev/null || true"

# Bash 커맨드 감사 로그
# PreToolUse + Bash matcher
"jq -r '.tool_input.command' >> ~/.claude/bash-log.txt"

# 코드 변경 시 자동 테스트 실행
"jq -r '.tool_input.file_path // \"\"' | grep -E '\\.(java|ts)$' && ./gradlew test || true"
```

### 주의사항
- `settings.local.json`은 `.gitignore`에 추가되어야 함 (개인 설정)
- 훅 커맨드 실패 시 `|| true` 없으면 Claude가 블로킹될 수 있음
- 쌍따옴표는 JSON 내에서 `\"` 로 이스케이프 필요
- 훅 설정 후 세션 재시작 없이 현재 세션에 바로 적용됨
