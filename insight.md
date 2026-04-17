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

## 풋볼 프론트엔드 UX/로직

### 균등 팀 편성은 "목표 인원 수 계산 → 티어 분배" 순서가 안정적
```ts
const baseSize = Math.floor(memberCount / teamCount);
const remainder = memberCount % teamCount;
```
- 티어별 셔플만 먼저 적용하면 전체 인원 수가 `6:4`처럼 틀어질 수 있음
- 먼저 팀별 목표 인원 수를 계산한 뒤, 각 티어를 넣을 때 목표 인원이 찬 팀을 건너뛰면 랜덤성과 균형을 같이 가져갈 수 있음
- 남는 인원(`remainder`)을 어느 팀에 줄지까지 랜덤화하면 `5:4`, `4:4:4` 같은 균등 분배 안에서도 시나리오 다양성을 유지할 수 있음

### 라운드로빈보다 "min-load greedy"가 티어 균등성에 더 강하다
- 라운드로빈은 시작 인덱스만 랜덤이고 이후 회전 순서가 결정적 → 티어 인원이 팀 수로 나누어 떨어지지 않으면 특정 팀이 해당 티어를 더 많이 가져가기 쉬움
- min-load는 "해당 티어를 가장 적게 가진 팀"을 매 배정마다 고르므로 팀 간 티어 인원 차이를 최대 1명으로 수학적으로 보장
- 동점일 때는 총 인원 수가 적은 팀을 우선, 그래도 동점이면 셔플된 인덱스 순으로 선택 → 인원 균등과 무작위성 모두 유지
- 복잡도는 O(N·T)라 팀/인원 수준에서 부담 없음 (실제 사용 N≤30, T≤6)

### 사전 고정(Lock-in)은 "선배치 + 잔여 분배"로 분리하면 알고리즘이 깔끔
- 고정 멤버를 먼저 팀에 꽂고, 나머지를 같은 min-load 로직으로 돌리면 두 관심사가 결합되지 않음
- 팀 목표 인원(`targetSize`)만 존중하면 고정으로 인한 불균형은 UI 단에서 안내 가능
- 멤버 선택 해제, 팀 수 축소 같은 파생 상황에서는 고정을 "정리(prune)"해 stale 상태를 제거 — 원본 변경 → 파생 무효화 원칙의 연장선

### 룰렛 게임은 "당첨자 선택"과 "팀 배정"을 분리해야 공정성과 균형을 같이 잡는다
- 룰렛 휠은 후보 중 누가 뽑혔는지를 보여주는 장치이고, 팀 배정은 별도 균형 점수로 판단하는 편이 명확하다.
- 고정 멤버를 먼저 팀에 넣은 뒤 남은 멤버만 후보에 넣으면 사용자가 의도한 사전 배정을 침범하지 않는다.
- 당첨 후 각 팀에 넣었을 때의 티어합 spread, 해당 티어 count spread, 인원 spread를 계산해 가장 작은 팀을 고르면 "게임성"과 "균형"을 동시에 유지할 수 있다.
- 휠 애니메이션은 매 스핀의 최종 각도를 누적으로 증가시켜야 다음 스핀에서 뒤로 되감기는 현상이 없다.

### 파생 결과 UI는 모바일에서 "한 벌만 + 2열 그리드"가 스크롤 압박을 크게 줄인다
- 시나리오 3개 나열 → 1개로 전환하면 페이지 길이가 즉각 1/3로 단축
- 팀 카드를 1열 → `grid-cols-2` 로 전환하면 추가 50% 단축 (팀 수가 많아도 탐색 거리 감소)
- "다시 굴리기"를 별도 버튼이 아닌 기존 생성 버튼의 라벨 스왑으로 처리하면 UI 밀도를 늘리지 않고 재실행 흐름 유지

### navigator.clipboard는 HTTPS/localhost + 사용자 제스처가 조건
- `navigator.clipboard.writeText`는 보안 컨텍스트와 user-gesture 요구
- 버튼 onClick 핸들러 안에서 즉시 `await` 호출하면 iOS Safari도 문제 없음
- 실패/성공 피드백은 토스트 없이 버튼 라벨 스왑 + `aria-live="polite"`로도 충분하고 DOM이 늘지 않음
- 타이머로 원상 복구 시 언마운트 누수 방지를 위해 `useRef<Timeout>` + cleanup 필수

### 모바일 입력 폼은 인라인보다 모달이 화면 안정성이 높다
- 회원 등록 폼이 목록 위에 인라인으로 있으면, 등록할 때마다 목록 영역이 아래로 밀리면서 모바일 탐색성이 급격히 나빠짐
- 입력 빈도가 낮고 목록 확인 빈도가 높은 화면은 `요약 + 필요 시 모달 입력` 구조가 더 적합함
- `createPortal` 기반 모달로 분리하면 레이아웃 높이를 보존하면서도 모바일/데스크탑 공통 구조를 유지할 수 있음

### 요약 우선 목록은 모바일 인지 부하를 줄인다
- 회원 목록을 항상 전체 노출하면 티어 집계 정보보다 카드 나열이 먼저 눈에 들어와 의사결정 속도가 떨어짐
- 기본 상태는 `전체 인원 + 티어별 인원`만 보여주고, 삭제/세부 확인이 필요할 때만 확장하는 구조가 더 실용적임

### 파생 결과는 원본 데이터 변경 시 즉시 무효화하는 편이 안전하다
- 회원 추가/삭제 후 이전 편성안을 그대로 두면 현재 회원 구성과 맞지 않는 stale UI가 남는다
- 이런 화면은 optimistic update보다 `원본 변경 시 파생 결과 초기화`가 더 예측 가능하다

---

## 테스트 / TDD

### TDD는 "계층별 테스트 역할 분리"가 있어야 유지된다
- domain logic test는 순수 규칙을 빠르게 고정한다.
- service test는 트랜잭션, 정렬, 중복 방지, 집계 같은 비즈니스 규칙을 검증한다.
- controller slice test는 HTTP 계약, 직렬화, validation, 예외 매핑을 고정한다.
- global test는 예외 처리, CORS, initializer, util 같은 횡단 관심사를 검증한다.
- E2E test는 실제 사용자 플로우가 계층을 관통해 깨지지 않는지 최종 확인한다.

### E2E는 테스트 메서드에 `@Transactional`을 걸면 오히려 왜곡될 수 있다
- API E2E는 요청 간 실제 영속성 흐름을 보는 게 목적이다.
- 테스트 메서드 트랜잭션이 바깥에서 영속성 컨텍스트를 잡고 있으면, 이미 로드된 엔티티 컬렉션이 stale 상태로 남을 수 있다.
- 이 경우 요청 단위 트랜잭션과 다르게 보이므로, E2E는 cleanup 기반으로 격리하는 편이 더 현실적이다.

### 저장된 팀은 "라이브 참조"가 아니라 "스냅샷"으로 보관해야 안전하다
- 랜덤 편성 결과를 `football_member` FK만으로 보관하면, 이후 회원 이름/티어 수정이나 삭제가 생겼을 때 과거 편성 기록이 같이 흔들린다.
- 이 화면의 의도는 "그날 선택했던 팀"을 남기는 것이므로, 저장 시점의 이름/티어를 별도 테이블에 복사하는 스냅샷 모델이 더 맞다.
- 원본 회원 ID는 선택적으로 남기되, FK 제약으로 묶지 않으면 현재 명단 변경과 과거 기록을 자연스럽게 분리할 수 있다.

---

## Next.js 빌드 안정성

### Next 16의 기본 Turbopack 빌드는 로컬 환경에 따라 과한 파일시스템 부하를 만들 수 있다
- Next.js 16.2.1에서 `next build`는 기본적으로 Turbopack을 사용한다.
- Turbopack은 코어 병렬화, PostCSS worker, 디스크 캐시를 적극적으로 사용하므로 작은 앱에서도 macOS 파일시스템/커널 CPU가 크게 튈 수 있다.
- 빌드 중 저장장치 사용량과 kernel CPU가 동시에 급등하면 앱 코드 무한 루프보다 번들러/캐시/파일 추적 경로를 먼저 의심하는 편이 빠르다.
- 안정성이 더 중요한 로컬 프로젝트에서는 `next build --webpack`으로 명시 고정해 리소스 폭증을 피하는 선택지가 실용적이다.

### 빌드 시점 외부 폰트 fetch는 콜드 빌드 재현성을 떨어뜨린다
- `next/font/google`은 캐시가 없으면 빌드 시점에 Google Fonts 리소스를 가져와야 한다.
- 네트워크가 막히거나 불안정하면 기능 코드와 무관하게 빌드가 실패한다.
- 프로젝트가 폰트 자체에 강하게 의존하지 않는다면 시스템 폰트 스택을 쓰면 콜드 빌드가 네트워크와 분리된다.

### Vercel이 주입하는 Next 설정은 로컬 설정과 같은 루트를 요구할 수 있다
- Vercel은 Git 배포 중 `outputFileTracingRoot`를 repo root로 보정한다.
- monorepo 로컬 개발용 `turbopack.root`가 app 디렉터리를 가리키면 두 루트가 달라져 경고가 발생한다.
- 배포 환경에서는 플랫폼이 주입하는 tracing root를 우선하고, 로컬 개발용 설정은 `process.env.VERCEL` 조건으로 분리하는 편이 안전하다.

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

---

## Claude Code 실행 모드: Plan Mode vs Accept Edits Mode

### 모드 개요

Claude Code는 파일 수정 및 툴 실행에 대한 **승인 방식**을 모드로 구분한다.
작업 성격에 따라 적절한 모드를 선택하면 효율과 안전성을 모두 잡을 수 있다.

| 모드 | 키 | 특징 |
|------|----|------|
| `default` | 기본 | 위험한 작업마다 개별 승인 요청 |
| `plan` | Plan Mode | 실행 전 계획만 수립, 실제 변경 없음 |
| `acceptEdits` | Edits On | 파일 수정은 자동 승인, Bash는 여전히 확인 |
| `bypassPermissions` | Bypass | 모든 작업 자동 승인 (위험) |

---

### Plan Mode

**언제 쓰나?**
- 복잡한 기능을 구현하기 전에 Claude의 접근 방식을 먼저 검토하고 싶을 때
- 잘못된 방향으로 코드가 대량 변경되는 걸 막고 싶을 때
- 설계 결정에 대해 대화하고 싶을 때

**동작 방식**
- Claude가 파일 읽기, 코드 탐색은 자유롭게 수행
- `Write`, `Edit`, `Bash` 등 **실제 변경·실행은 차단**됨
- 계획(Plan)을 텍스트로 설명하고 사용자가 승인하면 실행 단계로 전환

**활성화 방법**
```bash
# CLI 플래그
claude --plan

# 대화 중 토글
/plan

# settings.json 기본값으로 지정
{ "permissions": { "defaultMode": "plan" } }
```

**CLAUDE.md에서 활용하는 법**
- 구현 전 explore 에이전트 탐색 → Plan Mode로 설계 확인 → 승인 후 구현
- 이 프로젝트 규칙: 각 Phase 완료 시 빌드 검증 후 커밋

---

### Accept Edits Mode (Edits On)

**언제 쓰나?**
- 파일 수정은 빠르게 자동 적용하되, 셸 커맨드(배포, DB 조작 등)는 직접 확인하고 싶을 때
- 코드 작성 속도를 높이면서 위험한 Bash는 통제권을 유지하고 싶을 때

**동작 방식**
- `Write`, `Edit`, `NotebookEdit` → **자동 승인** (확인 창 없음)
- `Bash` → **여전히 개별 승인** 필요
- 읽기 전용 툴(`Read`, `Glob`, `Grep`) → 항상 자동

**활성화 방법**
```bash
# CLI 플래그
claude --acceptEdits

# 대화 중 토글 (Shift+Tab 반복)
# default → acceptEdits → plan 순서로 순환

# settings.json 기본값으로 지정
{ "permissions": { "defaultMode": "acceptEdits" } }
```

---

### 모드 비교: 실제 사용 시나리오

| 시나리오 | 권장 모드 |
|---------|---------|
| 처음 보는 코드베이스 탐색 후 설계 논의 | `plan` |
| 기능 구현 중 (파일 수정 많음, DB 없음) | `acceptEdits` |
| 배포 스크립트, DB 마이그레이션 포함 작업 | `default` |
| 완전히 신뢰하는 반복 작업 자동화 | `bypassPermissions` |

---

### settings.json으로 모드 고정

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

- 프로젝트 `.claude/settings.json`에 설정하면 팀 전체에 적용
- `.claude/settings.local.json`에 설정하면 개인에게만 적용
- CLI 플래그(`--plan`, `--acceptEdits`)가 settings.json보다 우선

---

### Plan Mode와 훅의 상호작용

- Plan Mode에서는 실제 툴이 실행되지 않으므로 `PostToolUse` 훅도 **발동하지 않음**
- 계획 승인 후 실행 단계에서 훅이 정상 동작
- `PreToolUse` 훅은 Plan Mode에서도 동작 (차단 목적으로 활용 가능)

---

## 풋볼 기능 구현 인사이트

### 티어별 랜덤 편성은 "목표 인원 수 + 시작점 랜덤" 조합이 더 안정적

```ts
const baseSize = Math.floor(memberCount / teamCount);
const remainder = memberCount % teamCount;
```

- 각 티어를 먼저 독립적으로 셔플하면 같은 티어 안에서 랜덤성이 확보된다.
- 하지만 단순 라운드 로빈만으로는 `10명 / 2팀`에서도 `6:4`가 나올 수 있으므로, 먼저 목표 팀 인원 수를 계산해야 한다.
- 시작 팀을 매 티어마다 랜덤으로 바꾸고, 이미 목표 인원이 찬 팀은 건너뛰면 편향을 줄이면서도 `5:5`, `5:4`, `4:4:4`처럼 총원 기준 균형을 유지할 수 있다.
- 현재 프로젝트 규칙은 `1~6티어 개별 분배`이며, 3티어와 4티어도 합치지 않는다.

### controlled number input은 "문자열 상태"와 "확정된 숫자 상태"를 분리해야 UX가 망가지지 않는다

```ts
const [teamCountInput, setTeamCountInput] = useState(String(teamCount));
```

- `input[type=number]`를 바로 숫자로 강제하면 사용자가 값을 지우는 순간 `NaN`이 발생한다.
- 이 상태를 `|| 2` 같은 기본값 처리로 덮어쓰면 입력 중 값이 즉시 원래 값으로 튕긴다.
- 해결은 입력 중 상태를 문자열로 유지하고, blur / Enter 시점에만 정규화하는 것이다.
- 실무에서는 숫자 입력 버그가 "유효성 검증" 문제가 아니라 "입력 중 상태 관리" 문제인 경우가 많다.

### 스텝 버튼은 입력 오류를 줄이는 가장 값싼 UX 개선이다

- 팀 수처럼 범위가 좁은 숫자 입력에는 `+/-` 버튼을 함께 두는 편이 낫다.
- 모바일에서 키보드 입력보다 오동작이 적고, 최소/최대 범위도 자연스럽게 통제할 수 있다.
- 텍스트 입력과 버튼 입력을 같이 제공하면 빠른 수정과 정확한 제어를 둘 다 만족시킬 수 있다.

### 테마 CSS는 컴포넌트별 인라인 클래스보다 "도메인 전용 클래스"로 끊는 편이 유지보수에 유리하다

- 풋볼 화면은 일반 primary 테마와 다른 시각 언어가 필요했다.
- `football-shell`, `football-panel`, `football-chip` 같은 공통 클래스를 `globals.css`에 올려두면
  여러 컴포넌트에서 같은 분위기를 반복 적용할 수 있다.
- Tailwind 유틸만으로도 구현 가능하지만, 도메인 테마가 커질수록 공통 클래스로 추상화하는 편이 수정 비용이 낮다.

### 로컬 Docker MySQL 사용 시 `localhost`보다 `127.0.0.1`이 안전할 수 있다

```bash
./gradlew bootRun --args='--spring.datasource.url=jdbc:mysql://127.0.0.1:3306/yonghealth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul'
```

- 환경에 따라 `localhost`가 IPv6로 먼저 해석되면 MySQL 연결이 거부될 수 있다.
- 같은 컨테이너/포트가 살아 있어도 애플리케이션에서는 `Communications link failure`가 날 수 있다.
- 이때 JDBC URL만 `127.0.0.1`로 바꿔도 바로 해결되는 경우가 있다.
- 로컬 실행 이슈는 코드 문제가 아니라 네트워크 해석 문제일 수 있으므로, 애플리케이션 로그와 Docker 상태를 같이 봐야 한다.
