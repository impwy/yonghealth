# YongHealth 무료 배포 프롬프트

아래 프롬프트를 구현 에이전트에게 전달하세요.

---

## 프롬프트

```
# YongHealth 무료 배포 가이드

## 프로젝트 개요
운동 일지 웹 애플리케이션 (모노레포)
- **Backend**: Spring Boot 4.0.4, Java 25, JPA, Gradle (Kotlin DSL)
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **현재 DB**: MySQL (localhost:3306)
- **API 연결**: `NEXT_PUBLIC_API_URL` 환경변수로 백엔드 URL 설정 (frontend/src/lib/api.ts)

## 배포 아키텍처 (완전 무료)

| 컴포넌트 | 서비스 | 무료 조건 |
|---------|--------|----------|
| Frontend | **Vercel** | Next.js 최적화, Hobby 플랜 무료 |
| Backend | **Render** | Web Service 무료 (비활성 시 슬립, 요청 시 자동 기동) |
| Database | **Neon** (PostgreSQL) | 0.5GB 무료, Serverless |

> DB를 MySQL → PostgreSQL로 전환한다. JPA를 사용하므로 dialect과 driver만 변경하면 된다.

## Phase 1: DB 전환 (MySQL → PostgreSQL)

### 1-1. build.gradle.kts 수정
- `runtimeOnly("com.mysql:mysql-connector-j")` → `runtimeOnly("org.postgresql:postgresql")`

### 1-2. application.yml에 프로필 분리

기존 application.yml은 로컬 개발용으로 유지하고, 배포용 프로필을 추가한다.

`src/main/resources/application-prod.yml` 생성:
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### 1-3. 로컬 MySQL 설정 유지
기존 `application.yml`은 그대로 둔다 (로컬 개발 시 MySQL 사용).
배포 시 `SPRING_PROFILES_ACTIVE=prod` 환경변수로 프로필 전환.

## Phase 2: Backend 배포 준비 (Render)

### 2-1. Dockerfile 생성 (프로젝트 루트)

Java 25을 지원하는 이미지를 사용해야 한다.

```dockerfile
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon || true
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xmx256m", "-Xms128m", "app.jar"]
```

> `-Xmx256m`: Render 무료 티어 메모리 제한(512MB)에 맞춤

### 2-2. render.yaml 생성 (프로젝트 루트, 선택사항)

```yaml
services:
  - type: web
    name: yonghealth-api
    runtime: docker
    plan: free
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: DATABASE_URL
        fromDatabase:
          name: yonghealth-db
          property: connectionString
```

### 2-3. Render 배포 절차
1. https://render.com 가입 (GitHub 연동)
2. Dashboard → New → Web Service
3. GitHub 레포 연결
4. 설정:
   - Name: `yonghealth-api`
   - Runtime: Docker
   - Plan: Free
5. 환경변수 설정:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DATABASE_URL` = Neon에서 받은 연결 문자열
6. Deploy

## Phase 3: Database 설정 (Neon)

### 3-1. Neon 설정
1. https://neon.tech 가입
2. 새 프로젝트 생성 (Region: Asia Pacific - Singapore 권장)
3. Connection string 복사 (형식: `jdbc:postgresql://...neon.tech/yonghealth?sslmode=require`)
4. Render 환경변수 `DATABASE_URL`에 설정

### 3-2. application-prod.yml의 DATABASE_URL 형식
Neon에서 제공하는 연결 문자열을 JDBC 형식으로 변환:
```
jdbc:postgresql://ep-xxx.ap-southeast-1.aws.neon.tech/yonghealth?user=사용자&password=비밀번호&sslmode=require
```

## Phase 4: Frontend 배포 (Vercel)

### 4-1. Vercel 배포
1. https://vercel.com 가입 (GitHub 연동)
2. New Project → GitHub 레포 선택
3. 설정:
   - Framework: Next.js
   - Root Directory: `frontend`
4. 환경변수:
   - `NEXT_PUBLIC_API_URL` = `https://yonghealth-api.onrender.com` (Render 배포 URL)
5. Deploy

### 4-2. CORS 설정 추가
백엔드에 CORS 설정이 필요하다. 아래 클래스를 생성:

`src/main/java/com/yong/yonghealth/global/config/CorsConfig.java`:
```java
package com.yong.yonghealth.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "https://*.vercel.app"
                    )
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

## Phase 5: 검증

1. Neon DB 연결 확인: Render 로그에서 `Started YonghealthApplication` 확인
2. API 테스트: `curl https://yonghealth-api.onrender.com/api/workouts`
3. 프론트엔드: Vercel URL 접속하여 운동 기록 CRUD 테스트
4. 첫 요청 시 Render 무료 티어 콜드스타트로 30초~1분 대기 정상

## 주의사항

- **Render 무료 티어**: 15분 비활성 시 슬립 → 첫 요청 시 콜드스타트 발생 (Spring Boot라 30초~1분 소요)
- **Neon 무료 티어**: 0.5GB 스토리지, 비활성 시 컴퓨트 중단 (요청 시 자동 재개)
- **Vercel 무료 티어**: 월 100GB 대역폭, 개인 프로젝트에 충분
- **비용 0원**: 세 서비스 모두 신용카드 등록 불필요 (Render는 요구할 수 있으나 무료 플랜 선택 가능)
- **build.gradle.kts**: MySQL과 PostgreSQL 드라이버를 동시에 넣으면 로컬/프로덕션 모두 지원 가능
  ```kotlin
  runtimeOnly("com.mysql:mysql-connector-j")        // 로컬 개발
  runtimeOnly("org.postgresql:postgresql")           // 프로덕션
  ```

## 파일 변경 요약

| 파일 | 작업 |
|------|------|
| `build.gradle.kts` | PostgreSQL 드라이버 추가 |
| `src/main/resources/application-prod.yml` | 신규 생성 (프로덕션 DB 설정) |
| `Dockerfile` | 신규 생성 (Render 배포용) |
| `render.yaml` | 신규 생성 (선택, IaC) |
| `src/.../global/config/CorsConfig.java` | 신규 생성 (CORS 허용) |
| 기존 코드 | 변경 없음 |
```

---

> 위 프롬프트를 복사하여 에이전트에게 전달하면 됩니다.
> 기존 코드 변경 없이 설정 파일만 추가하는 방식이라 안전합니다.
