@AGENTS.md

# CORE TRAIT (psycho-profile)

HEXACO 기반 무료 성격검사(48문항·22원형, 한국어 /hexaco-test · 영어 /en/test)와
유료 진로 리포트(/career — 2026-10-15 공개, 페이앱 결제 후 추가 질문. 검사 시작은 서버가 결제된 주문인지 확인).
proxy.ts가 잠그는 경로는 /admin, /api/admin, /career/samples뿐. Next.js 16 App Router + Supabase + Vercel.
사용자와의 대화는 항상 한국어.

## 명령
- 개발 서버: `npm run dev` (Claude 미리보기는 .claude/launch.json)
- 린트: `npm run lint` · 타입: `npx tsc --noEmit`
- 통합 QA: `npm run qa` — 아래 채점 오라클 → 변이 테스트를 차례로 실행, 한 단계라도 실패하면 거기서 멈추고 실패 반환. 코드를 고친 뒤 매번 실행
- 채점 오라클: `npm run qa:oracle` — 두 파일을 차례로 실행
  - scripts/qa/scoring-oracle.ts: 정상 동작 회귀 (문항 구조·채점·원형 판정·링크 코드 골든 값). 언제나 통과해야 함
  - scripts/qa/known-defects.ts: 고쳐야 할 현재 동작(입력 검증 부재)의 기록. 결함을 고치면 실패 → 거부 테스트로 전환
- 변이 테스트: `npm run qa:mutation` — 채점·링크 코드를 일부러 망가뜨린 임시 사본으로 회귀 오라클이 실패를 잡는지 확인
  ("로드 실패"는 잡은 것으로 치지 않음)
- E2E(Playwright): 아직 도입 전. 도입 후에도 아래 "데이터 격리" 규칙을 지킨다.

## 구조 지도
- 문항: lib/questions-hexaco.ts (ko), lib/en/questions-hexaco.ts (en) — ID는 H1~O8 공통
- 채점·원형: lib/scoring-hexaco.ts (언어 공용, 한 곳뿐)
- 언어별 경로·저장 키·버전: lib/i18n.ts
- 화면: components/hexaco/{TestFlow,ResultHero,ReportBody,CompareView}.tsx (한·영 공용)
- DB 쓰기 — 브라우저: lib/analytics.ts, lib/profile.ts / 서버: app/api/**/route.ts
- 접근 잠금: proxy.ts (Next 16에서 middleware 대신 proxy)

## 불변 조건 (바꾸려면 사용자 승인 + 연쇄 변경)
1. 문항 문구·요인·역채점을 바꾸면 test_version을 올린다(lib/i18n.ts HEXACO_VERSION_BY_LANG,
   lib/analytics.ts HEXACO_VERSION) + lib/hexaco-encoding.ts VERSION 글자도 올린다.
   이전 버전 데이터와 섞어 분석하지 않는다.
2. lib/scoring-hexaco.ts ARCHETYPES 배열 순서는 바꾸지 않는다
   (친구 비교 코드가 인덱스를 쓰고, 동점 처리도 순서에 의존).
3. 한국어(hexaco-v2)와 영어(hexaco-v2-en) 데이터는 절대 합치지 않는다.
4. 한·영 문구 사전은 같은 키를 가진다(타입으로 강제). 한쪽만 고치지 않는다.
5. 동의 전에는 검사 응답을 저장하지 않는다. 영어판은 동의 전 방문 기록도 남기지 않는다.
6. 개인정보 처리방침을 바꾸면 lib/consent.ts PRIVACY_VERSION(_EN)을 올린다.
7. scripts/qa/scoring-oracle.ts 정답값은 "현재 동작" 기록이다. 테스트를 통과시키려고 임의로 고치지 않는다.

## 승인 없이는 하지 않는 것
- git commit·push, 배포, Supabase SQL·마이그레이션 실행, 운영 DB 조회·수정
  - GitHub master에 push하면 Vercel이 운영 사이트(core-trait.com)에 자동 배포한다(2026-10-15 연결). push = 운영 배포로 취급
- 패키지 설치, 브라우저 바이너리 다운로드
- lib/scoring-hexaco.ts, 문항 파일, supabase/migrations, proxy.ts matcher, lib/consent.ts 수정
- core-trait.com(운영)을 대상으로 검사 제출

## 데이터 격리 (테스트)
- 테스트 기기 표시(2026-10-26): /admin 맨 위 "이 브라우저를 테스트 기기로 표시"를 켜면
  그 브라우저(localStorage pp_test_device='1')의 기록에 표시가 붙는다 —
  sessions·test_sessions는 is_test=true, events·이탈 비콘은 metadata.is_test=true.
  관리자 통계는 이 기록을 빼고 센다. 유료 테스트 주문은 orders.provider='admin'.
  - 한계: 켜기 전 기록, 켜지 않은 브라우저·기기의 기록에는 표시가 없다.
- 사람이 손으로 하는 테스트는 테스트 기기 표시를 켠 브라우저에서 한다.
- E2E는 그래도 localhost에서만, 브라우저의 외부 요청과 /api/*는 전부 가로채 목 응답으로 처리하고,
  실제 Supabase 도달 0건을 테스트에서 확인한다.
- .env* 파일은 읽거나 출력하지 않는다. 키 값을 대화·로그에 남기지 않는다.
- 공개 저장소다. 비밀·실제 응답 데이터·내부 사업 정보를 커밋하지 않는다.

## 여러 대화창의 역할 (2026-10-24 사용자 결정)
이 프로젝트는 Claude 대화창 여러 개가 함께 다룬다. **같은 파일은 한 창에서만 고친다.** 두 창이 같은 파일을 동시에 고치면 서로 덮어쓴다.
| 창 | 역할 | 고쳐도 되는 파일 |
|---|---|---|
| 개인 성격 분석툴 | 리포트·화면·API 개발, 커밋·배포 | 앱 코드 전반 (lib/, app/, components/) |
| 심리측정 및 유료 리포트 QA | 검토, 검사 기준 | scripts/qa/, docs/의 QA 문서 |
| 평일 코드 자동 건강검진 | 점검 보고 | 없음 (읽기 전용) |
| CORE TRAIT 개발 에이전트 설정 | 규칙·에이전트 설정 | CLAUDE.md, .claude/ |
- 자기 역할 밖의 파일을 고쳐야 하면 직접 고치지 말고, 담당 창에 무엇을 왜 고칠지 메시지로 넘긴다.
- 다른 창이 커밋해 둔 것도 push하면 함께 운영 배포된다. push 전에 `git log origin/master..HEAD`로 무엇이 올라가는지 확인한다.
- 창끼리 맞춰야 하는 결정은 대화가 아니라 이 파일이나 메모리에 적는다 (모든 창이 시작할 때 읽음).

## 에이전트
- 코드 리뷰: .claude/agents/code-reviewer.md (읽기 전용, 명령 실행 도구 없음 → 호출할 때 git diff 출력을 함께 넘김)
- 심리측정 검토: .claude/agents/psychometric-reviewer.md (읽기 전용) — 문항·채점·해석 문구가 바뀌면 권장
- 회귀 QA: /qa-free-test (사용자가 부를 때만)

## 알려진 운영 함정
- Supabase 무료 플랜 자동 일시정지 → 저장이 조용히 실패. 데이터가 비면 상태부터 확인.
- 결과 화면 새로고침 시 중복 저장 방지는 sessionStorage(pp_hexaco_saved)에 의존.
  이 값은 저장 성공 뒤에만 기록된다(실패 시 1.5초 뒤 1회 재시도, 그래도 실패면 다음 결과 열람 때 재시도).
  무료 결과는 48문항이 모두 1~5 정수일 때만 저장한다(lib/analytics.ts saveHexacoResult).
- 미해결(DB 변경 필요): 저장 RPC는 브라우저가 계산해 보낸 점수를 그대로 저장한다(서버 재채점 없음).
  익명 사용자(anon)가 test_sessions·sessions·events에 임의 insert 가능(with check true, 확인됨: 2026-10-27 정책 조회).
  검사 시작 insert 때문에 열어 둔 것으로, 닫으려면 검사 시작을 서버 라우트로 옮겨야 한다(DB 변경, 미착수).
