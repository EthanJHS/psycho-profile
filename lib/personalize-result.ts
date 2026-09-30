import { HexacoResult, HexacoFactor, HexacoArchetype, HIGH_THRESHOLD, LOW_THRESHOLD } from './scoring-hexaco'
import { PERSONALIZE_KO } from './personalize-text-ko'

// 결과 개인화 — 어떤 문구를 고를지는 여기서 한 번만 정하고, 문구 자체는 언어별 파일에 둔다
// (한국어: lib/personalize-text-ko.ts, 영어: lib/en/personalize-text.ts)

type Dir = 'high' | 'low'
type HighLow = Record<HexacoFactor, Record<Dir, string>>

export interface PersonalizeText {
  archetypeName: (a: HexacoArchetype) => string
  factorLabel: Record<HexacoFactor, string>
  factorInterp: Record<HexacoFactor, { high: string; mid: string; low: string }>
  factorModifier: HighLow      // subLabel용 수식어 ("탐구적인")
  factorRole: HighLow          // "왜 이 원형인가" 문장 조각
  traitDescriptions: HighLow   // 나를 구분하는 특징
  growthTips: HighLow          // 요인 하나 기준 실천 팁
  comboTips: Record<ComboKey, string>
  shadowNotes: Record<ShadowFactor, string>
  why: (defining: string[], modifiers: string[], archetypeName: string) => string
  secondaryWhy: (hits: { label: string; dir: Dir }[], secondaryName: string) => string
}

// ── 요인 수준 판정 ─────────────────────────────────────────────────────────────
function level(raw: number): 'high' | 'mid' | 'low' {
  if (raw >= HIGH_THRESHOLD) return 'high'
  if (raw <= LOW_THRESHOLD) return 'low'
  return 'mid'
}

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']

// ── subLabel: "개방성이 높은 수호자" ──────────────────────────────────────────
export function getSubLabel(archetype: HexacoArchetype, result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): string | null {
  // 원형의 중립 요인(profile=0) 중 실제 점수가 눈에 띄게 높거나 낮은 요인 찾기
  let bestFactor: HexacoFactor | null = null
  let bestDev = 0
  for (const f of FACTORS) {
    if (archetype.profile[f] !== 0) continue // 이미 정의된 요인은 제외
    const raw = result.scores.raw[f]
    const dev = Math.abs(raw - 3.0)
    if (dev > bestDev && level(raw) !== 'mid') {
      bestDev = dev
      bestFactor = f
    }
  }
  if (!bestFactor) return null
  return t.factorModifier[bestFactor][level(result.scores.raw[bestFactor]) === 'high' ? 'high' : 'low']
}

// ── "왜 이 원형인가" 설명 ────────────────────────────────────────────────────
export function getWhyText(archetype: HexacoArchetype, result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): string {
  // 정의 요인 (profile !== 0) — 방향과 실제 점수가 일치할 때만 설명
  const defining: string[] = []
  for (const f of FACTORS) {
    const pv = archetype.profile[f]
    if (pv === 0) continue
    const lv = level(result.scores.raw[f])
    if ((pv > 0 && lv === 'high') || (pv < 0 && lv === 'low')) defining.push(t.factorRole[f][pv > 0 ? 'high' : 'low'])
  }
  // 중립 요인 중 눈에 띄는 것 — 개인적 변형
  const modifiers: string[] = []
  for (const f of FACTORS) {
    if (archetype.profile[f] !== 0) continue
    const lv = level(result.scores.raw[f])
    if (lv !== 'mid') modifiers.push(t.factorRole[f][lv])
  }
  return t.why(defining, modifiers, t.archetypeName(archetype))
}

// ── 나를 구분하는 특징 3개 ───────────────────────────────────────────────────
export function getDistinguishingTraits(result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): string[] {
  return FACTORS
    .map(f => ({ f, raw: result.scores.raw[f], dev: Math.abs(result.scores.raw[f] - 3.0) }))
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 3)
    .map(({ f, raw }) => t.traitDescriptions[f][raw >= 3.0 ? 'high' : 'low'])
}

// ── 6요인 각각 한 줄 해석 ────────────────────────────────────────────────────
export function getFactorLines(result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): Record<HexacoFactor, string> {
  const out = {} as Record<HexacoFactor, string>
  for (const f of FACTORS) out[f] = t.factorInterp[f][level(result.scores.raw[f])]
  return out
}

// ── 실천 팁 1개 ──────────────────────────────────────────────────────────────
// 두 요인 조합 팁이 한 요인 팁보다 우선 (둘 다 충분히 치우쳤을 때만). 낮은 점수 = 결핍으로 보지 않음
const COMBO_RULES = [
  { key: 'E_high+C_high', a: ['E', 'high'], b: ['C', 'high'] },
  { key: 'X_low+O_high',  a: ['X', 'low'],  b: ['O', 'high'] },
  { key: 'X_low+E_high',  a: ['X', 'low'],  b: ['E', 'high'] },
  { key: 'C_high+O_high', a: ['C', 'high'], b: ['O', 'high'] },
  { key: 'X_high+C_low',  a: ['X', 'high'], b: ['C', 'low'] },
  { key: 'H_high+A_low',  a: ['H', 'high'], b: ['A', 'low'] },
  { key: 'A_high+E_high', a: ['A', 'high'], b: ['E', 'high'] },
  { key: 'O_high+C_low',  a: ['O', 'high'], b: ['C', 'low'] },
] as const satisfies readonly { key: string; a: readonly [HexacoFactor, Dir]; b: readonly [HexacoFactor, Dir] }[]
export type ComboKey = typeof COMBO_RULES[number]['key']

function comboTip(raw: Record<HexacoFactor, number>, t: PersonalizeText): string | null {
  const dev = (f: HexacoFactor, d: Dir) => (d === 'high' ? raw[f] - 3 : 3 - raw[f])
  const matched = COMBO_RULES
    .filter(c => level(raw[c.a[0]]) === c.a[1] && level(raw[c.b[0]]) === c.b[1])
    .sort((x, y) => (dev(y.a[0], y.a[1]) + dev(y.b[0], y.b[1])) - (dev(x.a[0], x.a[1]) + dev(x.b[0], x.b[1])))
  return matched[0] ? t.comboTips[matched[0].key] : null
}

export function getPracticalTip(result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): string {
  const combo = comboTip(result.scores.raw, t)
  if (combo) return combo
  const top = FACTORS.reduce((best, f) =>
    Math.abs(result.scores.raw[f] - 3) > Math.abs(result.scores.raw[best] - 3) ? f : best,
  )
  return t.growthTips[top][result.scores.raw[top] >= 3 ? 'high' : 'low']
}

// ── 그림자 보정: 중립 요인 고점이 그림자와 충돌할 때 문구 추가 ────────────────
// 예: 수호자 그림자 "변화에 저항" + 개방성 5.0 → 보정 문구 추가
const SHADOW_RULES = {
  C: { dir: 'high', appliesTo: ['empath', 'companion', 'coordinator'] },   // 그림자가 "소진"에 관한 원형에만
  O: { dir: 'high' },
  E: { dir: 'high' },
  X: { dir: 'low' },
} as const satisfies Partial<Record<HexacoFactor, { dir: Dir; appliesTo?: readonly string[] }>>
export type ShadowFactor = keyof typeof SHADOW_RULES

export function getShadowNote(archetype: HexacoArchetype, result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): string | null {
  for (const f of Object.keys(SHADOW_RULES) as ShadowFactor[]) {
    const rule: { dir: Dir; appliesTo?: readonly string[] } = SHADOW_RULES[f]
    if (archetype.profile[f] !== 0) continue // 이미 정의된 요인은 건드리지 않음
    if (rule.appliesTo && !rule.appliesTo.includes(archetype.id)) continue
    if (level(result.scores.raw[f]) === rule.dir) return t.shadowNotes[f]
  }
  return null
}

// ── 부가 성향이 나온 이유: 부원형이 조건으로 가진 요인 중 실제로 맞은 것 ──
export function getSecondaryWhy(result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): string | null {
  const sec = result.secondary
  const hits = FACTORS
    .filter(f => sec.profile[f] !== 0 && level(result.scores.raw[f]) === (sec.profile[f] > 0 ? 'high' : 'low'))
    .map(f => ({ label: t.factorLabel[f], dir: (sec.profile[f] > 0 ? 'high' : 'low') as Dir }))
  return t.secondaryWhy(hits, t.archetypeName(sec))
}

// ── 통합 export ───────────────────────────────────────────────────────────────
export interface PersonalizedResult {
  subLabel: string | null        // "탐구적인"
  whyText: string                // "왜 이 원형인가"
  distinguishingTraits: string[] // 나를 구분하는 특징 3개
  factorLines: Record<HexacoFactor, string> // 요인별 한 줄 해석
  practicalTip: string           // 실천 팁
  shadowNote: string | null      // 그림자 보정 문구
  secondaryWhy: string | null    // 부가 성향이 나온 이유
}

export function personalizeResult(result: HexacoResult, t: PersonalizeText = PERSONALIZE_KO): PersonalizedResult {
  const { primary } = result
  return {
    subLabel: getSubLabel(primary, result, t),
    whyText: getWhyText(primary, result, t),
    distinguishingTraits: getDistinguishingTraits(result, t),
    factorLines: getFactorLines(result, t),
    practicalTip: getPracticalTip(result, t),
    shadowNote: getShadowNote(primary, result, t),
    secondaryWhy: getSecondaryWhy(result, t),
  }
}
