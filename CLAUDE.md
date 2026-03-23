# YongHealth 프로젝트 규칙

## 프로젝트 개요
운동 일지 웹 애플리케이션 (Backend + Frontend 모노레포)

## 기술 스택
- **Backend**: Spring Boot 4.0.4, Java 25, Gradle (Kotlin DSL), JPA/MySQL, Lombok
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend 포트**: 8080 / **Frontend 포트**: 3000

## 작업 규칙
- 구현 전 반드시 **explore 에이전트**를 사용하여 기존 코드베이스를 탐색한 후 작업할 것
- 각 Phase 완료 시 **빌드/구조 검증**을 수행할 것
- `task.md`에 체크박스로 구현 현황을 업데이트할 것
- `plan.md`의 Phase 순서를 따를 것

## 주요 문서
- `spec.md`: 기능 명세서 (도메인 모델, API, 프론트엔드 화면)
- `plan.md`: 구현 계획서 (패키지 구조, Phase 1~10)
- `task.md`: 구현 현황 체크리스트

## 백엔드 컨벤션
- **패키지 구조**: 도메인형 (`domain/workout`, `domain/exercise`, `domain/exerciseset`)
- **공통 모듈**: `global/common`, `global/error`, `global/util`
- Entity는 `BaseTimeEntity`를 상속 (createdAt, updatedAt 자동 관리)
- Cascade 삭제: Workout → Exercise → ExerciseSet

## 프론트엔드 컨벤션
- App Router 사용 (서버 컴포넌트 기본)
- 컴포넌트는 `components/` 디렉토리에 배치
- API 호출은 `lib/api.ts`에 집중
- 타입 정의는 `types/index.ts`에 관리
