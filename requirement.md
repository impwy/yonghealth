# YongHealth 요구사항 기록

이 파일은 사용자가 요청한 요구사항을 **받자마자** 기록하는 진입 문서입니다.
세션이 끊겨도 요청이 유실되지 않도록, 구현 전·중·후 모든 단계에서 이 파일을 먼저 업데이트합니다.

## 기록 규칙
- 새 요청이 들어오면 아래 "Inbox"에 `YYYY-MM-DD` 날짜와 함께 원문을 최대한 그대로 적는다.
- 요청이 분석되어 plan/spec/fix로 흩어지면, Inbox 항목에 해당 문서 링크를 덧붙인다.
- 완료된 항목은 "완료" 섹션으로 이동하되 삭제하지 않는다 (추적성 유지).
- 취소/보류된 항목도 "보류" 섹션으로 이동해 이유를 남긴다.

---

## Inbox (진행 대기/진행 중)

### 2026-04-18 — #4 Vercel Next 설정 경고 수정

**사용자 원문:**
> frontend@0.1.0 build
> next build --webpack
> ⚠ Both `outputFileTracingRoot` and `turbopack.root` are set, but they must have the same value.
> Using `outputFileTracingRoot` value: /vercel/path0.
>   Applying modifyConfig from Vercel
> ▲ Next.js 16.2.1 (webpack)
>   Creating an optimized production build ...
> ⚠ Both `outputFileTracingRoot` and `turbopack.root` are set, but they must have the same value.
> Using `outputFileTracingRoot` value: /vercel/path0.
> vercel error

**추가 요청(2026-04-18):**
> 푸시해줘

**확인된 추가 실패 원인:**
- 원격 브랜치 변경을 rebase한 뒤 Vercel preview에서 `handleDeleteSavedTeam` 중복 선언으로 Webpack compile 실패

**상태:** 진행 중

---

## 진행 중

_현재 작업 중인 요청_

---

## 완료

_merge 또는 배포된 요청_

- 2026-04-18 — 커밋/푸시 및 Vercel 확인
  - 사용자 원문: "commit push and check vercel"
  - 조치: `feature/football-team-improvements` 브랜치에 커밋 `d5a94c0` 생성 후 `origin/feature/football-team-improvements`로 push
  - Vercel: preview 배포 `https://yong-health-r7odsk1tm-yongs-projects-6b7f968d.vercel.app` 상태 `Ready`
  - 참고: preview URL 직접 접근은 Vercel 보호 설정으로 `/football`이 HTTP 401을 반환하지만, `vercel inspect` 기준 빌드와 배포는 성공
- 2026-04-18 — 팀 편성 룰렛 모드
  - 사용자 원문: "룰렛 게임 만들어줘 실제로 룰렛 시작하면 돌림판이 돌아가는 그런 게임"
  - 추가 요청: "테스트 디비니깐 놔둬도돼 한 14명까지 넣고 테스트해줘"
  - 조치: 고정 멤버를 먼저 배치하고, 나머지 멤버를 실제 회전 룰렛으로 한 명씩 뽑아 팀별 티어합·티어 분포·인원 수 균형 기준으로 자동 배정
  - 검증: 테스트 DB 14명 유지, `/football` 화면 headless Chrome 캡처(`/tmp/yonghealth-roulette-14-ready.png`), Chrome DevTools Protocol로 `룰렛` 모드와 `룰렛 시작` 클릭 후 회전 UI 캡처(`/tmp/yonghealth-roulette-spin-check.png`), `cd frontend && npm test`, `cd frontend && npm run lint`, `cd frontend && npm run build`, `./gradlew test`
  - 문서: `spec.md` 풋볼 팀 편성, `plan.md` Phase 19, `fix.md` 풋볼 편성 규칙, `task.md` Phase 19, `insight.md` 룰렛 배정 인사이트

### 2026-04-18 — #2 팀 편성 룰렛 모드 상세 기록

**사용자 원문:**
> 팀은 한 팀당 최소 4명에서 n명으로 늘어나 거의 6~7까지
> 여기서 팀만드는 방식은 완전 랜덤으로 팀을 만들 수도있고
> 내가 원하는 인원을 팀에 넣은 후에 룰렛을 돌려서 해당 티어의 사람이 팀에 티어 합산에 골고루 맞게 들어갈 수 있도록 만드는거야
>
> 현재 팀을 랜덤으로 만드는데 티어합산이 잘 분배되게 만들었거든.
> 이제 할거 말해줄게.
> 1  팀은 한 팀당 최소 4명에서 n명으로 늘어나 거의 6~7까지
> 2  여기서 팀만드는 방식은 완전 랜덤으로 팀을 만들 수도있고
> 3  내가 원하는 인원을 팀에 넣은 후에 룰렛을 돌려서 해당 티어의 사람이 팀에 티어 합산에 골고루 맞게 들어갈 수 있도록 만드는거야
>
> 1. 실제 룰렛을 게임처럼 보고싶어 - 한 스핀에 한명 배정
>   ex) 현재 다른 룰렛 게임에 한 게임에 한 티어의 인원을 전부 넣고 a넣는다 하고 돌리고 나오면 a에 넣고 b넣는다 하고 돌리고 나오면 b에 넣는식
>   이걸 자동화 하면 좋겠음.
>   2. 티어 균형은 +-1 정도는 괜찮을거같에
>   3. 팀은 그때마다 다르게 만드는데 내가 인원을 넣고 팀 수를 정하면 좋겠어.
>  ex) 14명에 두팀이면 7명씩 세팀이면 1팀 5명 2팀 5명 3팀 5팀
>
> 정확한 요구사항은 requiement.md added 7을 보면 알 수 있음

**컨텍스트:**
- #1 요청(풋볼 편성 UX 개선)은 커밋 `e13397c`로 완료 (완료 섹션 참조)
- 현재 편성은 min-load greedy 자동 분배로 티어합산 균형은 이미 잡혀 있음
- 고정 배정(lockedAssignments)도 이미 지원됨

**해석(요지):**
- 팀 크기: 팀당 최소 4명, 최대 6~7명까지 가변
- 두 가지 편성 모드 병행:
  - (a) **완전 랜덤** — 기존 동작 유지
  - (b) **룰렛** — 일부 멤버를 원하는 팀에 먼저 고정 → 나머지 멤버를 룰렛으로 돌려서 티어합산이 균형 잡히게 배정

**확정(2026-04-18 답변):**
- **룰렛 = 실제 시각 게임** — 돌아가는 휠 애니메이션을 봐야 함 (게임성이 핵심)
- **스핀 단위** — 한 스핀 = 한 명 배정. 기준 UX: "한 티어 인원 전부를 대상 풀에 넣고 → A 배정용으로 돌리고, 결과대로 A 배정 → B 배정용으로 돌리고, 결과대로 B 배정" 을 **자동화**하는 흐름
- **균형 허용치** — 팀 간 티어 인원 차이 ±1 허용 (현행 min-load greedy의 보장과 동일)
- **팀 구성 입력** — 사용자가 (a) 참가 인원 선택, (b) 팀 수를 직접 입력. 팀 크기는 파생값 (대략 4~7명 범위)
- **고정 배정 UI** — 기존 `MemberSelector`의 "자동 / n팀 고정" 드롭다운 그대로 재사용 (룰렛 모드도 고정값을 먼저 반영 후 나머지를 돌림)

**추가 요청(2026-04-18):**
> 룰렛 게임 만들어줘 실제로 룰렛 시작하면 돌림판이 돌아가는 그런 게임
> 고정된 인원을 제외한 인원을 룰렛에 넣고 돌리면 한명씩 티어 합산에 맞게 팀별로 들어가게 만들어줘

**추가 확인 요청(2026-04-18):**
> 테스트 디비니깐 놔둬도돼 한 14명까지 넣고 테스트해줘

**상태:** 완료

- 2026-04-18 — 프론트엔드 빌드 리소스 폭증 확인/수정
  - 사용자 원문: "프론트엔드 빌드하면 커널 cpu 100% 먹는데 확인좀 해줘"
  - 추가 증상: 저장장치 사용량 약 7GB 증가, kernel CPU 130%, 메모리 100%, 컴퓨터 멈춤
  - 조치: `next build --webpack` 고정, `next/font/google` 제거, 시스템 폰트 스택 적용
  - 문서: `fix.md` BUG-6, `plan.md` Bug Fix, `spec.md` 비기능 요구사항, `task.md` BUG-6, `insight.md` Next.js 빌드 안정성
- 2026-04-17 — 풋볼 편성 UX 개선 (티어 균등·고정 배정·클립보드·모바일 압축) → `spec.md`, `fix.md` §4 편성 UX 개선, 커밋 `e13397c`

---

## 보류/취소

_이유와 함께 기록_
