// 무료 결과 문구·저장 검증 회귀 검사 — DB·네트워크 없음. report-golden.ts가 import해서 npm run qa:report에서 함께 실행된다.
// 단독 실행: node --no-warnings --import ./scripts/qa/ts-transpile.mjs scripts/qa/free-result.ts
//
// 근거: 2026-10-24 감사 A-2(중간 점수를 특징으로 단정), A-3(무료 응답을 검증 없이 저장),
//       2026-10-26 배포 90fe58f(무료 결과 문구: 응답을 서술, 행동·능력 보장 표현 제거), 6e7526f(저장 전 응답 검증)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { QUESTIONS, scoreHexaco, HIGH_THRESHOLD, LOW_THRESHOLD, type HexacoFactor } from '../../lib/scoring-hexaco'
import { personalizeResult, isLowSignal, type PersonalizeText } from '../../lib/personalize-result'
import { PERSONALIZE_KO } from '../../lib/personalize-text-ko'
import { PERSONALIZE_EN } from '../../lib/en/personalize-text'
import { supabase } from '../../lib/supabase'
import { isValidHexacoAnswers } from '../../lib/analytics'

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
const ROOT = new URL('../../', import.meta.url)
const level = (x: number) => (x >= HIGH_THRESHOLD ? 'high' : x <= LOW_THRESHOLD ? 'low' : 'mid')
function seeded(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
}
const all = (v: unknown) => Object.fromEntries(QUESTIONS.map(q => [q.id, v]))
// 무작위 응답 + 요인별로 치우친 응답 (극단·중간이 고루 나오게)
function sampleAnswers(n: number) {
  const r = seeded(20261026)
  const out: Record<string, number>[] = [all(1), all(3), all(5)] as Record<string, number>[]
  for (let i = 0; i < n; i++) {
    const target = FACTORS.map(() => 1 + Math.floor(r() * 5))
    out.push(Object.fromEntries(QUESTIONS.map(q => {
      const want = i % 2 ? 1 + Math.floor(r() * 5) : Math.max(1, Math.min(5, target[FACTORS.indexOf(q.factor)] + Math.round((r() - 0.5) * 2)))
      return [q.id, q.reverse ? 6 - want : want]
    })))
  }
  return out
}
const SAMPLES = sampleAnswers(3000)
const LANGS: [string, PersonalizeText][] = [['ko', PERSONALIZE_KO], ['en', PERSONALIZE_EN]]

// 문구 사전의 모든 문자열 (함수는 결과 문장에서 따로 확인)
const leaves = (v: unknown): string[] => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : [])

test('데이터 격리: 테스트 환경에는 Supabase 접속이 없음 (환경변수 없이 실행)', () => {
  assert.equal(supabase, null, 'NEXT_PUBLIC_SUPABASE_URL/ANON_KEY가 설정된 상태로 QA를 실행하지 않는다')
})

test('무료 결과 한국어 문구: 단정·보장 표현(습니다·됩니다·힘이 있·철저·반드시)이 없음 — 사전 전체 + 결과 문장 3,000건', () => {
  const BANNED = /습니다|됩니다|힘이 있|철저|반드시/
  const bad = leaves(PERSONALIZE_KO).filter(s => BANNED.test(s))
  assert.deepEqual(bad, [], '문구 사전')
  for (const a of SAMPLES) {
    const p = personalizeResult(scoreHexaco(a), PERSONALIZE_KO)
    const text = [p.subLabel ?? '', p.whyText, ...p.distinguishingTraits, ...Object.values(p.factorLines), p.practicalTip, p.shadowNote ?? '', p.secondaryWhy ?? ''].join(' ')
    assert.doesNotMatch(text, BANNED)
  }
})

test('나를 구분하는 특징: 높음·낮음 요인만, 최대 3개 — 중간 요인만 있으면 0개 (한·영)', () => {
  for (const [lang, t] of LANGS) for (const a of SAMPLES) {
    const r = scoreHexaco(a)
    const nonMid = FACTORS.filter(f => level(r.scores.raw[f]) !== 'mid')
    const traits = personalizeResult(r, t).distinguishingTraits
    assert.ok(traits.length <= Math.min(3, nonMid.length), `${lang}: 특징 ${traits.length}개 > 비중간 요인 ${nonMid.length}개`)
    const allowed = new Set(nonMid.map(f => t.traitDescriptions[f][level(r.scores.raw[f]) as 'high' | 'low']))
    for (const x of traits) assert.ok(allowed.has(x), `${lang}: 중간 요인이나 반대 방향 특징 "${x}"`)
    if (isLowSignal(r)) assert.equal(traits.length, 0, `${lang}: 여섯 요인 모두 중간인데 특징이 있음`)
  }
})

test('무료 응답 검증 isValidHexacoAnswers: 48문항 모두 1~5 정수일 때만 통과', () => {
  assert.equal(isValidHexacoAnswers(all(3)), true, '전부 3')
  assert.equal(isValidHexacoAnswers({ ...all(1), H1: 5 }), true, '1과 5 섞임')
  const missing = all(3); delete missing.O8
  const cases: [string, unknown][] = [
    ['문자열 "3"', all('3')], ['소수 2.5', all(2.5)], ['0', all(0)], ['6', all(6)], ['null 값', all(null)], ['NaN', all(NaN)],
    ['한 문항 누락', missing], ['모르는 키 추가', { ...all(3), Z9: 3 }], ['배열', QUESTIONS.map(() => 3)], ['null', null], ['빈 객체', {}],
  ]
  for (const [name, v] of cases) assert.equal(isValidHexacoAnswers(v), false, name)
})

test('무료 결과 저장 순서: 응답 검증 → 서버 저장(RPC) → 성공한 뒤에만 "저장됨" 표시 (정적 확인)', () => {
  const src = readFileSync(new URL('lib/analytics.ts', ROOT), 'utf8')
  const body = src.slice(src.indexOf('export async function saveHexacoResult'))
  const at = (s: string) => { const i = body.indexOf(s); assert.ok(i >= 0, `saveHexacoResult에 "${s}" 없음`); return i }
  const validate = at('if (!isValidHexacoAnswers(answers))')
  const rescore = at('scoreHexaco(answers)')
  const rpc = at("rpc('complete_hexaco_session'")
  const failReturn = at("console.error('complete_hexaco_session failed'")
  const mark = at("sessionStorage.setItem('pp_hexaco_saved'")
  assert.ok(validate < rescore && rescore < rpc, '검증과 재채점이 저장보다 먼저')
  assert.ok(failReturn < mark, '"저장됨" 표시는 실패 처리 뒤(성공했을 때만)')
})
