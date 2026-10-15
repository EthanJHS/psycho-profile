// 채점 오라클 (정상 동작 회귀) — 브라우저 없이 문항 구조·채점·원형 판정·링크 코드의 현재 동작을 고정하는 특성화 테스트.
// 언제나 통과해야 한다. 고쳐야 할 결함의 기록은 scripts/qa/known-defects.ts에 따로 둔다.
// 실행: npm run qa:oracle  (Node 24 이상, 추가 패키지 없음)
// 정답값은 "현재 동작"이지 "옳은 동작"이 아니다. 채점을 의도적으로 바꿨다면 사용자 확인 후 정답값을 갱신한다.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scoreHexaco, computeHexacoScores, QUESTIONS, ARCHETYPES, type HexacoFactor } from '../../lib/scoring-hexaco'
import { HEXACO_QUESTIONS } from '../../lib/questions-hexaco'
import { HEXACO_QUESTIONS_EN } from '../../lib/en/questions-hexaco'
import { encodeHexacoAnswers, decodeHexacoAnswers } from '../../lib/hexaco-encoding'
import { encodeCompareCode, decodeCompareCode } from '../../lib/compare'

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
type Answers = Record<string, number>

const fill = (f: (id: string, reverse: boolean, factor: HexacoFactor) => number): Answers =>
  Object.fromEntries(QUESTIONS.map(q => [q.id, f(q.id, q.reverse, q.factor)]))
const all = (v: number) => fill(() => v)

// 재현 가능한 무작위 응답 (시드 고정)
function seeded(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
}
const randomAnswers = (rand: () => number) => fill(() => 1 + Math.floor(rand() * 5))

// ── 문항 구조 ────────────────────────────────────────────────────────────────
test('채점 메타: 48문항, 요인별 8문항·역문항 2개', () => {
  assert.equal(QUESTIONS.length, 48)
  for (const f of FACTORS) {
    const qs = QUESTIONS.filter(q => q.factor === f)
    assert.equal(qs.length, 8, `${f} 문항 수`)
    assert.equal(qs.filter(q => q.reverse).length, 2, `${f} 역문항 수`)
  }
})

// 채점 코드와 독립된 기준: 문항별 요인·역채점을 글자로 고정 (+ 정채점, - 역채점).
// QUESTIONS에서 만들어 낸 기대값만 쓰면 역채점 표시가 잘못 바뀌어도 테스트가 함께 움직이므로 따로 둔다.
const KEY_SNAPSHOT =
  'H1+ H2+ H3+ H4+ H5- H6+ H7- H8+ ' +
  'E1- E2+ E3- E4+ E5+ E6+ E7+ E8+ ' +
  'X1+ X2+ X3+ X4+ X5- X6+ X7- X8+ ' +
  'A1- A2+ A3+ A4+ A5+ A6+ A7- A8+ ' +
  'C1- C2+ C3+ C4+ C5+ C6+ C7- C8+ ' +
  'O1- O2+ O3+ O4+ O5+ O6+ O7- O8+'
const KEY = KEY_SNAPSHOT.split(' ').map(s => ({ id: s.slice(0, 2), factor: s[0] as HexacoFactor, reverse: s[2] === '-' }))

test('문항 키 스냅샷: 48문항의 요인·역채점이 고정 기준과 일치', () => {
  assert.deepEqual(QUESTIONS.map(q => ({ id: q.id, factor: q.factor, reverse: q.reverse })), KEY)
})

test('독립 계산: 무작위 응답 1,000건의 요인 점수가 고정 기준으로 직접 계산한 값과 일치', () => {
  const rand = seeded(7)
  for (let i = 0; i < 1000; i++) {
    const answers = randomAnswers(rand)
    const expected = {} as Record<HexacoFactor, number>
    for (const f of FACTORS) {
      const items = KEY.filter(k => k.factor === f).map(k => (k.reverse ? 6 - answers[k.id] : answers[k.id]))
      expected[f] = Math.round((items.reduce((a, b) => a + b, 0) / items.length) * 100) / 100
    }
    assert.deepEqual(computeHexacoScores(answers).raw, expected)
  }
})

test('한 문항만 바꾸면 그 요인만 예상 방향으로 움직임 (정문항 H1↑ → H↑, 역문항 H5↑ → H↓)', () => {
  const up = computeHexacoScores({ ...all(3), H1: 5 }).raw
  assert.deepEqual(up, { H: 3.25, E: 3, X: 3, A: 3, C: 3, O: 3 })
  const down = computeHexacoScores({ ...all(3), H5: 5 }).raw
  assert.deepEqual(down, { H: 2.75, E: 3, X: 3, A: 3, C: 3, O: 3 })
})

test('높음/낮음 경계: 3.5 이상 높음, 2.5 이하 낮음 (48문항 완응답의 요인 점수는 0.125 단위라 2.49·3.49는 나올 수 없음)', () => {
  // H 정문항 6개의 합을 조절해 H 원점수를 경계 근처로 맞춘다 (역문항 H5·H7은 3 고정 → 6점 기여)
  const withHSum = (sum: number) => {
    const a = all(3); const ids = ['H1', 'H2', 'H3', 'H4', 'H6', 'H8']
    let s = 24; let i = 0
    while (s < sum) { a[ids[i++ % 6]]++; s++ }
    while (s > sum) { a[ids[i++ % 6]]--; s-- }
    return computeHexacoScores(a)
  }
  const cases: [number, number, number][] = [[20, 2.5, -1], [21, 2.63, 0], [27, 3.38, 0], [28, 3.5, 1]]
  for (const [sum, raw, dir] of cases) {
    const s = withHSum(sum)
    assert.deepEqual([s.raw.H, s.direction.H], [raw, dir], `H 합계 ${sum}`)
  }
})

test('응답 누락으로 생기는 0.125 단위 밖 점수도 경계 판정 고정 (3.43 → 중간, 2.57 → 중간)', () => {
  // H1을 빼고 나머지 H 7문항 합을 24(평균 3.43) / 18(평균 2.57)로 맞춤 — 높음/낮음 기준값 변경을 잡기 위한 사례
  const base = all(3); delete base.H1
  const high = computeHexacoScores({ ...base, H2: 4, H3: 4, H4: 4 })
  assert.deepEqual([high.raw.H, high.direction.H], [3.43, 0])
  const low = computeHexacoScores({ ...base, H2: 2, H3: 2, H4: 2 })
  assert.deepEqual([low.raw.H, low.direction.H], [2.57, 0])
})

// 고정 응답 한 벌 — 동점 규칙 사례이자, 링크 코드 골든 값의 입력 (대칭이 아니라 순서 변경을 잡을 수 있음)
const FIXED_ANSWERS: Answers = {
  H1: 5, H2: 5, H3: 4, H4: 3, H5: 3, H6: 4, H7: 1, H8: 5, E1: 5, E2: 1, E3: 5, E4: 3, E5: 2, E6: 1, E7: 2, E8: 1,
  X1: 2, X2: 1, X3: 4, X4: 5, X5: 1, X6: 1, X7: 4, X8: 3, A1: 3, A2: 3, A3: 2, A4: 4, A5: 2, A6: 1, A7: 5, A8: 4,
  C1: 4, C2: 2, C3: 2, C4: 1, C5: 1, C6: 1, C7: 3, C8: 2, O1: 4, O2: 1, O3: 3, O4: 4, O5: 4, O6: 4, O7: 5, O8: 4,
}

test('1·2위 거리가 같으면 조건 수가 많은 원형이 이김 (배열 순서상 앞인 전사보다 조건 4개인 탐험가)', () => {
  const r = scoreHexaco(FIXED_ANSWERS)
  assert.deepEqual([r.primary.id, r.secondary.id, r.primaryDistance, r.secondaryDistance], ['explorer', 'fighter', 0.873, 0.873])
})

test('한·영 문항 ID가 채점 메타와 같은 순서로 일치', () => {
  const ids = QUESTIONS.map(q => q.id)
  assert.deepEqual(HEXACO_QUESTIONS.map(q => q.id), ids)
  assert.deepEqual(HEXACO_QUESTIONS_EN.map(q => q.id), ids)
})

test('언어별 문장 48개가 모두 고유 (E2E가 화면 문장으로 문항 ID를 찾는 전제)', () => {
  for (const qs of [HEXACO_QUESTIONS, HEXACO_QUESTIONS_EN]) {
    const statements = qs.map(q => q.text.split('\n').pop()!.trim())
    assert.equal(new Set(statements).size, 48)
    assert.equal(qs.filter(q => q.text.includes('\n')).length, 24, '상황형 문항 수')
  }
})

// ── 원형 배열 ────────────────────────────────────────────────────────────────
test('ARCHETYPES 순서 고정 (비교 코드가 인덱스를 쓰고, 동점 처리도 순서에 의존)', () => {
  assert.deepEqual(ARCHETYPES.map(a => a.id), [
    'guardian', 'warrior', 'visionary', 'artisan', 'sentinel', 'conqueror', 'opportunist', 'strategist',
    'charmer', 'companion', 'empath', 'passionate', 'fighter', 'coordinator', 'sage', 'analyst',
    'explorer', 'dreamer', 'cynic', 'pragmatist', 'realist', 'hedonist',
  ])
})

test('22원형 각각의 이상적 응답자는 자기 원형으로 판정', () => {
  for (const a of ARCHETYPES) {
    const answers = fill((_, reverse, factor) => {
      const p = a.profile[factor]
      const want = p > 0 ? 5 : p < 0 ? 1 : 3
      return reverse ? 6 - want : want
    })
    assert.equal(scoreHexaco(answers).primary.id, a.id, a.id)
  }
})

// ── 일자 응답·누락 응답 (현재 동작 고정) ─────────────────────────────────────
const GOLDEN: { name: string; answers: Answers; raw: Record<HexacoFactor, number>; primary: string; primaryDistance: number; secondary: string; secondaryDistance: number }[] = [
  { name: '전부 1', answers: all(1), raw: { H: 2, E: 2, X: 2, A: 2, C: 2, O: 2 }, primary: 'cynic', primaryDistance: 0.556, secondary: 'artisan', secondaryDistance: 1 },
  { name: '전부 2', answers: all(2), raw: { H: 2.5, E: 2.5, X: 2.5, A: 2.5, C: 2.5, O: 2.5 }, primary: 'cynic', primaryDistance: 0.944, secondary: 'artisan', secondaryDistance: 1.167 },
  { name: '전부 3 (1·2위 동점)', answers: all(3), raw: { H: 3, E: 3, X: 3, A: 3, C: 3, O: 3 }, primary: 'guardian', primaryDistance: 1.2, secondary: 'opportunist', secondaryDistance: 1.2 },
  { name: '전부 4 (1·2위 동점)', answers: all(4), raw: { H: 3.5, E: 3.5, X: 3.5, A: 3.5, C: 3.5, O: 3.5 }, primary: 'guardian', primaryDistance: 0.9, secondary: 'companion', secondaryDistance: 0.9 },
  { name: '전부 5', answers: all(5), raw: { H: 4, E: 4, X: 4, A: 4, C: 4, O: 4 }, primary: 'visionary', primaryDistance: 0.563, secondary: 'guardian', secondaryDistance: 0.6 },
  { name: '응답 없음 → 전 요인 3.0', answers: {}, raw: { H: 3, E: 3, X: 3, A: 3, C: 3, O: 3 }, primary: 'guardian', primaryDistance: 1.2, secondary: 'opportunist', secondaryDistance: 1.2 },
  { name: '범위 밖 값(6)은 무시', answers: all(6), raw: { H: 3, E: 3, X: 3, A: 3, C: 3, O: 3 }, primary: 'guardian', primaryDistance: 1.2, secondary: 'opportunist', secondaryDistance: 1.2 },
  {
    name: '전부 5에서 C1 하나 누락 → 47개 평균, 판정이 바뀜',
    answers: (() => { const a = all(5); delete a.C1; return a })(),
    raw: { H: 4, E: 4, X: 4, A: 4, C: 4.43, O: 4 }, primary: 'guardian', primaryDistance: 0.485, secondary: 'coordinator', secondaryDistance: 0.485,
  },
  {
    name: '전부 5에서 H 문항 전부 누락 → H는 3.0',
    answers: (() => { const a = all(5); for (const q of QUESTIONS) if (q.factor === 'H') delete a[q.id]; return a })(),
    raw: { H: 3, E: 4, X: 4, A: 4, C: 4, O: 4 }, primary: 'coordinator', primaryDistance: 0.533, secondary: 'charmer', secondaryDistance: 0.778,
  },
]

for (const g of GOLDEN) {
  test(`판정 고정: ${g.name}`, () => {
    const r = scoreHexaco(g.answers)
    assert.deepEqual(r.scores.raw, g.raw)
    assert.deepEqual(
      [r.primary.id, r.primaryDistance, r.secondary.id, r.secondaryDistance],
      [g.primary, g.primaryDistance, g.secondary, g.secondaryDistance],
    )
  })
}

// ── 결과 링크 코드 (?r=) ─────────────────────────────────────────────────────
test('결과 링크 코드: 무작위 응답 1,000건 인코딩↔디코딩 왕복 일치', () => {
  const rand = seeded(20261015)
  for (let i = 0; i < 1000; i++) {
    const answers = randomAnswers(rand)
    const code = encodeHexacoAnswers(answers)
    assert.ok(code && code.startsWith('b'), '버전 글자 b (hexaco-v2)')
    assert.deepEqual(decodeHexacoAnswers(code), answers)
  }
})

test('결과 링크·비교 코드 골든 값: 이미 공유된 링크가 계속 같은 결과로 열려야 함', () => {
  // 왕복 테스트만으로는 인코딩·디코딩을 함께 바꿔 옛 링크가 깨지는 변경을 잡지 못한다
  assert.equal(encodeHexacoAnswers(FIXED_ANSWERS), 'b7alf9qixev61gnfc360ah0')
  assert.deepEqual(decodeHexacoAnswers('b7alf9qixev61gnfc360ah0'), FIXED_ANSWERS)
  assert.equal(encodeCompareCode(scoreHexaco(FIXED_ANSWERS)), 'cgq4fc6f')
  assert.deepEqual(decodeCompareCode('cgq4fc6f'), { archetypeId: 'explorer', raw: { H: 4.25, E: 1.5, X: 2.88, A: 2.5, C: 1.75, O: 2.88 } })
})

test('결과 링크 코드: 불완전 응답은 코드를 만들지 않고, 잘못된 코드는 거부', () => {
  const missing = all(3); delete missing.O8
  assert.equal(encodeHexacoAnswers(missing), null)
  assert.equal(encodeHexacoAnswers({ ...all(3), H1: 6 }), null)
  assert.equal(decodeHexacoAnswers('a123'), null, '다른 버전 글자')
  assert.equal(decodeHexacoAnswers('b!!'), null, '허용되지 않는 문자')
  assert.equal(decodeHexacoAnswers('bzzzzzzzzzzzzzzzzzzzzzzzzzzzz'), null, '48문항 범위를 넘는 값')
})

// ── 친구 비교 코드 (?f=) ─────────────────────────────────────────────────────
test('비교 코드: 무작위 응답 1,000건 원형·요인 점수 왕복 일치', () => {
  const rand = seeded(42)
  for (let i = 0; i < 1000; i++) {
    const result = scoreHexaco(randomAnswers(rand))
    const code = encodeCompareCode(result)
    assert.ok(code && code.length === 8)
    assert.deepEqual(decodeCompareCode(code), { archetypeId: result.primary.id, raw: result.scores.raw })
  }
})
