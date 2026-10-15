---
name: qa-free-test
description: 무료 48문항 검사(한·영)의 회귀 QA. 정적 검사 → 채점 오라클 → (도입된 경우) Playwright E2E → 한국어 보고. 사용자가 /qa-free-test 로 부를 때만 실행.
disable-model-invocation: true
argument-hint: "[smoke|full] [ko|en|all]"
allowed-tools: Read, Grep, Glob, Bash(git status), Bash(git diff:*), Bash(npm run lint), Bash(npx tsc --noEmit), Bash(npm run qa:oracle), Bash(npm run qa:mutation), Bash(npx playwright test:*)
---

# 무료 검사 회귀 QA

코드는 수정하지 않는다. 실패하면 원인 추정과 수정안만 보고하고, 수정은 사용자 승인 후에 한다.

## 0. 사전 확인
- `git status`, `git diff --stat`으로 변경 파일 목록을 보고서에 적는다.
- 변경 파일에 문항·채점·해석 문구(lib/questions-hexaco.ts, lib/en/questions-hexaco.ts, lib/scoring-hexaco.ts,
  lib/archetypes-hexaco.ts, lib/en/archetypes-hexaco.ts, lib/personalize-*.ts, lib/en/personalize-text.ts)가 있으면
  보고 끝에 psychometric-reviewer 검토를 권한다.

## 1. 정적 검사
- `npm run lint`
- `npx tsc --noEmit`

## 2. 채점 오라클 (브라우저 없음, 수 초)
- `npm run qa:oracle` — 정상 동작 회귀(scoring-oracle.ts) 다음에 결함 기록(known-defects.ts)이 실행된다.
  보고서에는 두 결과를 따로 적는다 ("회귀 N/N 통과", "알려진 결함 M건 여전히 존재").
- 회귀 테스트가 실패하면 정답값을 고치지 않는다. 의도된 채점 변경인지 사용자에게 묻는다.
- 결함 기록 테스트가 실패하면 결함이 고쳐졌다는 뜻일 수 있다 — 확인해 보고하고, 거부 테스트로의 전환을 제안한다.
- 변경 파일에 lib/scoring-hexaco.ts, lib/hexaco-encoding.ts, lib/compare.ts, scripts/qa/scoring-oracle.ts가 있으면
  `npm run qa:mutation`도 실행한다 (망가뜨린 사본으로 오라클이 실패를 잡는지 확인, 수 초. 원본 파일은 건드리지 않음).
  "놓침", "로드 실패", "건너뜀"이 있으면 그대로 보고한다.

## 3. E2E (Playwright가 도입된 경우에만)
- playwright.config.ts가 없으면 이 단계는 "미도입 — 건너뜀"으로 보고한다.
- 있으면 먼저 확인하고, 하나라도 어긋나면 실행하지 않고 중단한다:
  - baseURL이 localhost
  - 모든 spec이 e2e/fixtures/isolation.ts의 fixture를 사용 (grep으로 확인)
- 인자 `smoke` → `npx playwright test --grep @p0` / `full` 또는 인자 없음 → `npx playwright test`
- 언어 인자 `ko`·`en` → 해당 project만 실행

## 3-1. 코드 리뷰 (변경분이 있을 때)
- code-reviewer 서브에이전트에는 명령 실행 도구가 없다. `git diff` 출력을 프롬프트에 그대로 넣어 호출한다.

## 4. 보고 (한국어)
- 표: 단계 / 결과(통과·실패·건너뜀) / 소요 시간
- 실패마다: 재현 경로, 기대값 vs 실제값, trace 경로(test-results/)
- E2E를 돌렸다면 "실제 외부 요청 0건" 확인 결과를 한 줄로 반드시 적는다.
