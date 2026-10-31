// 원형 공통 문구·결과 신뢰 표시 회귀 검사 — DB·네트워크 없음. report-golden.ts가 import해서 npm run qa:report에서 함께 실행된다.
// 단독 실행: node --no-warnings --import ./scripts/qa/ts-transpile.mjs scripts/qa/archetype-trust.ts
//
// 근거: 2026-10-29 결과 신뢰 정리 (개인 성격 분석툴 창)
// - 원형 공통 문구는 같은 원형이 나온 모든 사람에게 같은 문장 → 개인 사실("당신은")·능력·남의 반응 장담 금지
// - 1·2위 동률(isExactTie)과 같은 답 몰림(isSkewedAnswers)을 화면에 안내
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { QUESTIONS, ARCHETYPES, scoreHexaco, type HexacoFactor } from '../../lib/scoring-hexaco'
import { personalizeResult, isLowSignal, isExactTie, isCloseCall, isSkewedAnswers, SKEW_SHARE } from '../../lib/personalize-result'
import { PERSONALIZE_KO } from '../../lib/personalize-text-ko'
import { ARCHETYPE_DETAILS } from '../../lib/archetypes-hexaco'
import { ARCHETYPE_DETAILS_EN } from '../../lib/en/archetypes-hexaco'

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
const ROOT = new URL('../../', import.meta.url)
const all = (v: number) => Object.fromEntries(QUESTIONS.map(q => [q.id, v])) as Record<string, number>
const COMMON = ['shortDesc', 'light', 'shadow'] as const   // 개인 사실처럼 읽히면 안 되는 원형 공통 문구
function seeded(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
}

// ── 원형 공통 문구 ───────────────────────────────────────────────────────────
test('원형 상세: 22원형이 채점 목록과 같고, 한·영 항목·필드 구성이 같음, 핵심 특성 4개', () => {
  const ids = ARCHETYPES.map(a => a.id).sort()
  assert.deepEqual(Object.keys(ARCHETYPE_DETAILS).sort(), ids, '한국어')
  assert.deepEqual(Object.keys(ARCHETYPE_DETAILS_EN).sort(), ids, '영어')
  for (const id of ids) {
    assert.deepEqual(Object.keys(ARCHETYPE_DETAILS[id]).sort(), Object.keys(ARCHETYPE_DETAILS_EN[id]).sort(), `${id} 필드`)
    assert.equal(ARCHETYPE_DETAILS[id].id, id); assert.equal(ARCHETYPE_DETAILS_EN[id].id, id)
    assert.equal(ARCHETYPE_DETAILS[id].traits.length, 4, `${id} 한국어 특성 수`)
    assert.equal(ARCHETYPE_DETAILS_EN[id].traits.length, 4, `${id} 영어 특성 수`)
  }
})

test('원형 공통 문구(shortDesc·light·shadow): 한국어 "당신" 0건, 영어 you·your 0건', () => {
  for (const [id, d] of Object.entries(ARCHETYPE_DETAILS)) for (const k of COMMON) assert.ok(!d[k].includes('당신'), `${id}.${k}: ${d[k]}`)
  for (const [id, d] of Object.entries(ARCHETYPE_DETAILS_EN)) for (const k of COMMON) assert.doesNotMatch(d[k], /\byou(r|rs|rself)?\b/i, `${id}.${k} (en)`)
})

test('원형 공통 문구: 능력·탁월함을 장담하는 말이 없음 (능숙·탁월·유능·거인·소유자·꿰뚫 / exceptional·expert·master·giant·skilled)', () => {
  const KO = /능숙|탁월|유능|거인|소유자|꿰뚫/
  const EN = /exceptional|expert|master|giant|skilled/i
  for (const [id, d] of Object.entries(ARCHETYPE_DETAILS)) for (const k of COMMON) assert.doesNotMatch(d[k], KO, `${id}.${k}`)
  for (const [id, d] of Object.entries(ARCHETYPE_DETAILS_EN)) for (const k of COMMON) assert.doesNotMatch(d[k], EN, `${id}.${k} (en)`)
})

// ── 동률 ─────────────────────────────────────────────────────────────────────
test('동률 판정: 전부 3·전부 4는 1·2위 동률, 거리 차가 조금이라도 있으면 동률 아님 (근접과 구분)', () => {
  for (const v of [3, 4]) assert.equal(isExactTie(scoreHexaco(all(v))), true, `전부 ${v}`)
  // 근접이지만 동률은 아닌 사례를 찾아 확인 — 무작위 시드 고정
  const r = seeded(29)
  let found = false
  for (let i = 0; i < 5000 && !found; i++) {
    const x = scoreHexaco(Object.fromEntries(QUESTIONS.map(q => [q.id, 1 + Math.floor(r() * 5)])))
    const gap = x.secondaryDistance - x.primaryDistance
    if (gap > 0 && isCloseCall(x)) { assert.equal(isExactTie(x), false, `거리 차 ${gap}`); found = true }
  }
  assert.ok(found, '근접·비동률 사례를 찾지 못함 (전제 확인)')
})

// 채점 모듈은 원형별 거리를 내보내지 않아서, 같은 정의(lib/scoring-hexaco.ts computeDistance)로 독립 계산한다
function distances(raw: Record<HexacoFactor, number>) {
  return ARCHETYPES.map(a => {
    let dist = 0, total = 0
    for (const f of FACTORS) {
      const req = a.profile[f]
      const w = req === 0 ? 0.25 : Math.abs(req)
      dist += w * (req === 0 ? Math.abs(raw[f] - 3) : Math.max(0, (3 + 1.5 * Math.sign(req) - raw[f]) * Math.sign(req)))
      total += w
    }
    return { id: a.id, d: Math.round((dist / total) * 1000) / 1000, cond: FACTORS.reduce((n, f) => n + Math.abs(a.profile[f]), 0) }
  })
}
test('전부 4: 여섯 요인 3.5, 수호자·동반자·조율자·현자 4개가 같은 거리, 맨 위는 조건 수 → 목록 순서 규칙대로 정해짐', () => {
  const x = scoreHexaco(all(4))
  assert.deepEqual(FACTORS.map(f => x.scores.raw[f]), [3.5, 3.5, 3.5, 3.5, 3.5, 3.5])
  const ds = distances(x.scores.raw)
  const min = Math.min(...ds.map(d => d.d))
  assert.equal(min, x.primaryDistance, '독립 계산한 최소 거리 = 채점 결과 1위 거리')
  const tied = ds.filter(d => d.d === min)
  assert.deepEqual(tied.map(d => d.id).sort(), ['companion', 'coordinator', 'guardian', 'sage'])
  // 화면 안내("맨 위 이름은 조건 수 우선, 같으면 목록 순서")대로 1위가 정해졌는지
  const expected = [...tied].sort((a, b) => b.cond - a.cond || ARCHETYPES.findIndex(z => z.id === a.id) - ARCHETYPES.findIndex(z => z.id === b.id))
  assert.deepEqual([x.primary.id, x.secondary.id], [expected[0].id, expected[1].id])
  assert.match(readFileSync(new URL('lib/personalize-result.ts', ROOT), 'utf8'), /전부 4면 수호자·동반자·조율자·현자 4개 동률/, '코드 주석의 예시와 일치')
})

test('동률 안내의 근거: 무작위 응답 2,000건에서 isExactTie면 독립 계산으로도 1·2위 거리가 같음', () => {
  const r = seeded(2029)
  for (let i = 0; i < 2000; i++) {
    const x = scoreHexaco(Object.fromEntries(QUESTIONS.map(q => [q.id, 1 + Math.floor(r() * 5)])))
    const ds = distances(x.scores.raw).map(d => d.d).sort((a, b) => a - b)
    assert.equal(isExactTie(x), ds[0] === ds[1], `거리 ${ds[0]} / ${ds[1]}`)
  }
})

// ── 같은 답 몰림 ─────────────────────────────────────────────────────────────
test(`같은 답 몰림: 48문항 중 같은 답이 ${Math.ceil(48 * SKEW_SHARE)}개 이상이면 true, 그보다 하나 적으면 false, 응답이 없으면 false`, () => {
  const n = Math.ceil(48 * SKEW_SHARE)
  const withSame = (k: number) => Object.fromEntries(QUESTIONS.map((q, i) => [q.id, i < k ? 4 : 1 + (i % 3)]))
  assert.equal(n, 41, 'SKEW_SHARE 0.85 → 41개 (기준이 바뀌면 문구·안내 기준도 함께 확인)')
  assert.equal(isSkewedAnswers(withSame(48)), true)
  assert.equal(isSkewedAnswers(withSame(n)), true, `${n}개`)
  assert.equal(isSkewedAnswers(withSame(n - 1)), false, `${n - 1}개`)
  assert.equal(isSkewedAnswers(undefined), false, '응답 없음 (결과 링크 미리보기 등)')
})

test('같은 답 몰림 안내: 전부 3은 lowSignal 안내만(몰림 안내 숨김), 전부 4는 몰림 안내, 일반 응답은 안내 없음', () => {
  const show = (a: Record<string, number>) => { const p = personalizeResult(scoreHexaco(a), PERSONALIZE_KO, a); return { lowSignal: p.lowSignal, skewShown: p.answerSkew && !p.lowSignal } }
  assert.deepEqual(show(all(3)), { lowSignal: true, skewShown: false }, '전부 3')
  assert.equal(isLowSignal(scoreHexaco(all(3))), true)
  assert.deepEqual(show(all(4)), { lowSignal: false, skewShown: true }, '전부 4')
  const r = seeded(1029)
  for (let i = 0; i < 200; i++) {
    const a = Object.fromEntries(QUESTIONS.map(q => [q.id, 1 + Math.floor(r() * 5)]))
    assert.equal(personalizeResult(scoreHexaco(a), PERSONALIZE_KO, a).answerSkew, false, '무작위 응답')
  }
  // 화면 조건이 위 계산과 같아야 함
  assert.match(readFileSync(new URL('components/hexaco/ReportBody.tsx', ROOT), 'utf8'), /personalized\.answerSkew && !personalized\.lowSignal/)
})
