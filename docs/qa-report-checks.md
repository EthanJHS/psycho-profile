# 유료 리포트 회귀 검사 (2026-10-24)

담당: 심리측정 및 유료 리포트 QA 창. DB·네트워크 접근 없음.

## 실행
```bash
node --no-warnings --import ./scripts/qa/ts-transpile.mjs scripts/qa/report-golden.ts
node scripts/qa/report-mutation.mjs
```
`npm run qa:report`(= 위 두 줄)는 `npm run qa`에 연결되어 있다 (2026-10-24, 8569eaa).

## 유료 리포트 — `scripts/qa/report-golden.ts` (13개)
| 검사 | 실패하면 |
|---|---|
| 12조합 가상 인물 120명 리포트가 오류 없이 만들어지고, 깨진 문자열이 없고, 화면(ReportView)이 그릴 수 있는 블록만 씀 | 리포트가 안 열리거나 빈칸이 생김 |
| 같은 점수로 두 번 만들면 같은 리포트 | 결과가 매번 달라짐 |
| **리포트 문장이 바뀌면 `REPORT_VERSION`도 바뀌어야 함** (조합별 골든 해시, `scripts/qa/report-golden.json`) | 문구를 바꿨는데 버전을 안 올림 → 발급본에 남는 버전이 틀어짐 |
| 발급 리포트 고정 구조: 완료 시 본문·버전 저장, 열람은 저장본 우선, DB 트리거 | 이미 산 리포트가 다시 바뀔 수 있음 |
| 감사 사례 L-1~L-5·V-1 (서류 장, 흥미 전부 높음, 직장인 진단, 회복 초점, 중간 점수 단정) | 고쳤던 모순이 다시 생김 |
| 주간 검토 2026-10-25: 추천 보류인 취준생 묶음의 지원 직무군 안내에 순위 문장("N위"·"상위 5개") 없음 / 무료 결과 여섯 요인 모두 중간이면 요인 해석에 "평균·균형 있게·유연하게·조율"(영어 average·balanced·flexib·adapt) 없음 | 근거 없는 순위·능력 단정이 다시 생김 |
| 물어본 문항은 리포트 **문장**에 영향 (알려진 미사용 23곳 제외) | 묻기만 하고 안 쓰는 문항이 새로 생김 |

## 무료 결과 — `scripts/qa/free-result.ts` (5개, report-golden.ts가 불러와 같은 실행에서 돈다)
| 검사 | 실패하면 |
|---|---|
| 테스트 환경에 Supabase 접속 없음 (환경변수 없이 실행) | QA가 운영 DB에 닿을 수 있는 상태 |
| 한국어 문구에 "습니다·됩니다·힘이 있·철저·반드시" 없음 (사전 전체 + 결과 문장 3,000건) | 행동·능력을 보장하는 표현이 다시 생김 (90fe58f 기준) |
| 나를 구분하는 특징은 높음·낮음 요인만, 최대 3개, 여섯 요인 모두 중간이면 0개 (한·영) | 중간 점수를 특징으로 단정 (감사 A-2) |
| `isValidHexacoAnswers`: 48문항 모두 1~5 정수일 때만 통과 (문자열·소수·0·6·null·NaN·누락·모르는 키·배열 거부) | 잘못된 응답이 저장될 수 있음 (감사 A-3) |
| 저장 순서: 검증 → 재채점 → RPC → 성공 뒤에만 `pp_hexaco_saved` (정적 확인) | 실패했는데 "저장됨"으로 남아 다시 시도하지 않음 |

`scripts/qa/report-mutation.mjs`: 임시 사본에서 리포트·무료 결과 코드를 일부러 망가뜨려(11가지) 위 검사가 실제로 잡는지 확인. 2026-10-27 기준 11/11. 버전 변이는 파일의 현재 `REPORT_VERSION` 값을 읽어 `-x`를 붙이므로 버전을 올려도 "건너뜀"이 생기지 않음.

## 문구를 바꿀 때 (개인 성격 분석툴 창)
1. `lib/career/report-content.ts`(또는 `jobs.ts`·`majors.ts`의 리포트에 나오는 문구)를 고친다
2. `REPORT_VERSION`을 올린다 (예: `report-2026-10-25`)
3. `QA_UPDATE_GOLDEN=1 node --no-warnings --import ./scripts/qa/ts-transpile.mjs scripts/qa/report-golden.ts` 로 골든 갱신
4. 골든 파일 변경을 같은 커밋에 넣는다

- 버전만 올리고 문장이 그대로이거나, 문장이 바뀌었는데 버전이 그대로면 실패한다
- 감사 사례 검사(L-1~V-1)는 골든과 별개라, 갱신해도 모순이 다시 생기면 실패한다

## 알려진 미사용 문항 (KNOWN_UNUSED)
배경 문항(학년·전공 계열·학년·준비 기간·경력), 취준생 orgType, 직장인 WF4, 직장인 향상 단독의 currentJob. 리포트에 쓰이게 되면 검사가 "참고: 이제 쓰이는 문항"으로 알려 준다 → 목록에서 뺀다.

## 확인하지 못하는 것
- 무료 결과 저장 함수의 실제 동작(RPC 성공·실패 분기)은 DB 목 없이 코드 순서만 확인
- 테스트 기기 표시(is_test, 5b25a60)는 브라우저 흐름이라 미검증 — 사용자가 테스트 기기로 직접 확인 예정
- 운영 DB에 트리거가 실제로 적용됐는지 (운영 DB 조회는 승인 필요)
- 화면에 보이는 모습 (브라우저 확인 아님)
- 심리측정 타당도 (사람 검토 항목은 감사 보고서 10장)

## 다른 창에 요청한 것 (2026-10-24)
- 개인 성격 분석툴 창: package.json에 `qa:report` 추가하고 `qa`에 연결 — 메시지 보냄
- CORE TRAIT 개발 에이전트 설정 창: CLAUDE.md "불변 조건"에 아래 규칙 추가 — 창이 꺼져 있어 메시지 전달 실패, 사용자가 그 창을 열 때 전달 필요
  > 8. 유료 리포트 문장(lib/career/report-content.ts, 리포트에 나오는 jobs.ts·majors.ts 문구)을 바꾸면 REPORT_VERSION을 올리고, QA_UPDATE_GOLDEN=1로 scripts/qa/report-golden.ts를 실행해 골든(report-golden.json)을 같은 커밋에 갱신한다. 이미 발급된 리포트는 DB 저장본이라 바뀌지 않는다(트리거 assessments_report_immutable).
