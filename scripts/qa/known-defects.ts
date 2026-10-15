// 알려진 결함 기록 — 고쳐야 할 현재 동작을 그대로 고정한다. 정상 동작 회귀(scoring-oracle.ts)와 섞지 않는다.
// 결함을 고치면 여기 테스트가 실패한다 → 그때 "거부해야 함" 테스트로 바꾸고 이 파일에서 지운다 (사용자 승인 후).
// 주의: 서버 API에 입력 검증을 넣어도 scoreHexaco() 자체는 그대로라 아래 테스트는 계속 통과할 수 있다.
//       서버가 잘못된 입력을 400으로 거부하는지는 API 계약 테스트로 따로 확인한다.
// 실행: npm run qa:oracle (회귀 테스트 다음에 실행됨)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scoreHexaco, QUESTIONS, type HexacoFactor } from '../../lib/scoring-hexaco'

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
const all = (v: unknown) => Object.fromEntries(QUESTIONS.map(q => [q.id, v])) as Record<string, number>

// ── 입력 검증 부재: 채점 함수는 48개 정수(1~5)인지 확인하지 않는다 ─────────────
test('[결함 기록] 문자열 "3"은 숫자로 바뀌지 않고 이어붙어 요인 점수가 5를 크게 넘음', () => {
  const r = scoreHexaco(all('3'))
  for (const f of FACTORS) assert.ok(r.scores.raw[f] > 5, `${f} = ${r.scores.raw[f]}`)
})

test('[결함 기록] NaN 응답은 점수 NaN·거리 NaN인데도 원형이 정해짐', () => {
  const r = scoreHexaco(all(NaN))
  assert.ok(FACTORS.every(f => Number.isNaN(r.scores.raw[f])))
  assert.ok(Number.isNaN(r.primaryDistance))
  assert.equal(typeof r.primary.id, 'string')
})

test('[결함 기록] 소수 응답(2.5)도 그대로 채점됨', () => {
  assert.deepEqual(scoreHexaco(all(2.5)).scores.raw, { H: 2.75, E: 2.75, X: 2.75, A: 2.75, C: 2.75, O: 2.75 })
})

test('[결함 기록] 0·null 응답은 누락으로 취급되어 결과가 응답 없음과 같음', () => {
  for (const v of [0, null]) {
    const r = scoreHexaco(all(v))
    assert.deepEqual([r.primary.id, r.primaryDistance], ['guardian', 1.2])
  }
})
