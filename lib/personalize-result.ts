import { HexacoResult, HexacoFactor, HexacoArchetype, HIGH_THRESHOLD, LOW_THRESHOLD } from './scoring-hexaco'

// ── 요인별 해석 텍스트 ─────────────────────────────────────────────────────────
const FACTOR_INTERP: Record<HexacoFactor, { high: string; mid: string; low: string }> = {
  H: {
    high: '원칙을 지키고 속임수 없이 행동합니다. 이익이 되더라도 불공정한 방식은 택하지 않습니다.',
    mid: '원칙과 실용성을 상황에 따라 균형 있게 적용합니다.',
    low: '목표 달성을 위해 규칙을 유연하게 해석하는 편입니다.',
  },
  E: {
    high: '감정 변화에 민감하고 스트레스 상황에서 불안을 쉽게 느낍니다. 공감 능력이 강합니다.',
    mid: '감정을 상황에 맞게 조절하며, 필요할 때 지지를 구합니다.',
    low: '감정적으로 안정적이며, 압박 상황에서도 침착함을 유지합니다.',
  },
  X: {
    high: '사람들 사이에서 에너지를 얻고, 대화와 활동을 주도하는 것을 즐깁니다.',
    mid: '상황에 따라 사교적으로 행동하거나 혼자만의 시간을 선택합니다.',
    low: '혼자 또는 소수와 있을 때 더 편안하며, 조용히 충전하는 유형입니다.',
  },
  A: {
    high: '타인과의 갈등을 피하고 협력을 중시하며, 관계 유지에 에너지를 씁니다.',
    mid: '협력과 독립 사이에서 상황을 읽고 유연하게 대응합니다.',
    low: '자신의 의견을 명확히 주장하고, 타인의 기대에 맞추기보다 기준을 지킵니다.',
  },
  C: {
    high: '계획을 세우고 체계적으로 실행하며, 약속과 기한을 철저히 지킵니다.',
    mid: '구조와 유연성을 상황에 맞게 조율하며 일을 처리합니다.',
    low: '즉흥적이고 유연하게 행동하며, 지나친 계획보다 흐름을 따르는 편입니다.',
  },
  O: {
    high: '새로운 아이디어와 경험에 강한 호기심을 느끼며, 기존 방식에 의문을 품습니다.',
    mid: '익숙한 것과 새로운 것 사이에서 선택적으로 호기심을 발휘합니다.',
    low: '검증된 방식과 안정적인 환경을 선호하며, 불필요한 변화는 피합니다.',
  },
}

// ── 요인 수준 판정 ─────────────────────────────────────────────────────────────
function level(raw: number): 'high' | 'mid' | 'low' {
  if (raw >= HIGH_THRESHOLD) return 'high'
  if (raw <= LOW_THRESHOLD) return 'low'
  return 'mid'
}

// ── 요인 수식어 (subLabel 생성용) ─────────────────────────────────────────────
const FACTOR_MODIFIER: Record<HexacoFactor, { high: string; low: string }> = {
  H: { high: '원칙 지향적인', low: '현실적인' },
  E: { high: '감수성이 풍부한', low: '감정에 흔들리지 않는' },
  X: { high: '활동적인', low: '내향적인' },
  A: { high: '협력적인', low: '독립 지향적인' },
  C: { high: '체계적인', low: '유연한' },
  O: { high: '탐구적인', low: '안정 지향적인' },
}

// ── subLabel: "개방성이 높은 수호자" ──────────────────────────────────────────
export function getSubLabel(
  archetype: HexacoArchetype,
  result: HexacoResult,
): string | null {
  // 원형의 중립 요인(profile=0) 중 실제 점수가 눈에 띄게 높거나 낮은 요인 찾기
  const factors = Object.keys(archetype.profile) as HexacoFactor[]
  let bestFactor: HexacoFactor | null = null
  let bestDev = 0

  for (const f of factors) {
    if (archetype.profile[f] !== 0) continue // 이미 정의된 요인은 제외
    const raw = result.scores.raw[f]
    const dev = Math.abs(raw - 3.0)
    if (dev > bestDev && level(raw) !== 'mid') {
      bestDev = dev
      bestFactor = f
    }
  }

  if (!bestFactor) return null
  const raw = result.scores.raw[bestFactor]
  return level(raw) === 'high'
    ? FACTOR_MODIFIER[bestFactor].high
    : FACTOR_MODIFIER[bestFactor].low
}

// ── "왜 이 원형인가" 설명 ────────────────────────────────────────────────────
const FACTOR_LABEL: Record<HexacoFactor, string> = {
  H: '정직·겸손', E: '정서성', X: '외향성', A: '원만성', C: '성실성', O: '개방성',
}

const FACTOR_ROLE: Record<HexacoFactor, { high: string; low: string }> = {
  H: {
    high: '높은 정직·겸손은 원칙과 책임 지향성을 만들어냈습니다',
    low: '낮은 정직·겸손은 목표 달성 중심의 현실적 판단을 형성했습니다',
  },
  E: {
    high: '높은 정서성은 타인의 감정에 민감하게 반응하는 성향을 더했습니다',
    low: '낮은 정서성은 압박 상황에서 흔들리지 않는 안정감을 만들었습니다',
  },
  X: {
    high: '높은 외향성은 에너지를 사람들과 함께 발산하는 방향으로 나타납니다',
    low: '낮은 외향성은 조용히, 지속적으로 역할을 수행하는 방식으로 나타납니다',
  },
  A: {
    high: '높은 원만성은 관계를 유지하고 협력을 중시하는 성향을 강화했습니다',
    low: '낮은 원만성은 명확한 기준과 독립적인 판단을 중시하게 만들었습니다',
  },
  C: {
    high: '높은 성실성은 계획적이고 책임감 있는 행동 방식을 만들었습니다',
    low: '낮은 성실성은 상황에 유연하게 반응하는 즉흥적인 면을 더했습니다',
  },
  O: {
    high: '높은 개방성은 기존 방식에 의문을 품고 더 나은 방법을 탐색하는 면을 더합니다',
    low: '낮은 개방성은 검증된 방식과 안정적인 환경을 선호하게 만들었습니다',
  },
}

export function getWhyText(
  archetypeName: string,
  archetype: HexacoArchetype,
  result: HexacoResult,
): string {
  const factors = Object.keys(archetype.profile) as HexacoFactor[]

  // 정의 요인 (profile !== 0) — 원형 선택 이유
  const definingParts: string[] = []
  for (const f of factors) {
    const pv = archetype.profile[f]
    if (pv === 0) continue
    const raw = result.scores.raw[f]
    const lv = level(raw)
    // 방향과 실제 점수가 일치할 때만 설명
    if ((pv > 0 && lv === 'high') || (pv < 0 && lv === 'low')) {
      definingParts.push(FACTOR_ROLE[f][pv > 0 ? 'high' : 'low'])
    }
  }

  // 중립 요인 중 눈에 띄는 것 — 개인적 변형
  const modifierParts: string[] = []
  for (const f of factors) {
    if (archetype.profile[f] !== 0) continue
    const lv = level(result.scores.raw[f])
    if (lv !== 'mid') modifierParts.push(FACTOR_ROLE[f][lv])
  }

  const base = definingParts.length > 0
    ? definingParts.join(', ')
    : `극단적으로 치우친 요인은 없지만, 6요인의 전체 균형이 ${archetypeName} 원형과 가장 가깝게 나타났습니다`

  const mod = modifierParts.length > 0
    ? ` 여기에 ${modifierParts.join(', ')}.`
    : ''

  return base + '.' + mod
}

// ── 나를 구분하는 특징 3개 ───────────────────────────────────────────────────
const TRAIT_DESCRIPTIONS: Record<HexacoFactor, { high: string; low: string }> = {
  H: {
    high: '원칙을 어기느니 손해를 감수한다',
    low: '목적을 위해 규칙보다 결과를 본다',
  },
  E: {
    high: '타인의 감정과 고통에 쉽게 공명한다',
    low: '위기 상황에서도 감정에 흔들리지 않는다',
  },
  X: {
    high: '사람들 속에서 에너지를 얻는다',
    low: '혼자만의 시간으로 에너지를 회복한다',
  },
  A: {
    high: '갈등보다 협력을 택한다',
    low: '관계 유지보다 솔직한 기준을 우선한다',
  },
  C: {
    high: '약속과 기한을 철저히 지킨다',
    low: '계획보다 흐름을 따르는 유연함이 있다',
  },
  O: {
    high: '기존 방식에 "왜?"라고 자주 묻는다',
    low: '새로운 것보다 검증된 방식을 신뢰한다',
  },
}

export function getDistinguishingTraits(result: HexacoResult): string[] {
  const factors = (['H', 'E', 'X', 'A', 'C', 'O'] as HexacoFactor[])
    .map(f => ({ f, raw: result.scores.raw[f], dev: Math.abs(result.scores.raw[f] - 3.0) }))
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 3)

  return factors.map(({ f, raw }) => {
    const dir = raw >= 3.0 ? 'high' : 'low'
    return TRAIT_DESCRIPTIONS[f][dir]
  })
}

// ── 6요인 각각 한 줄 해석 ────────────────────────────────────────────────────
export function getFactorLines(result: HexacoResult): Record<HexacoFactor, string> {
  const factors = ['H', 'E', 'X', 'A', 'C', 'O'] as HexacoFactor[]
  const out = {} as Record<HexacoFactor, string>
  for (const f of factors) {
    out[f] = FACTOR_INTERP[f][level(result.scores.raw[f])]
  }
  return out
}

// ── 실천 팁 1개 ──────────────────────────────────────────────────────────────
// 가장 치우친 요인의 방향에 맞는 팁 (낮은 점수 = 결핍으로 보지 않음)
const GROWTH_TIPS: Record<HexacoFactor, { high: string; low: string }> = {
  H: {
    high: '원칙을 지키는 건 강점이지만, 남에게도 같은 기준을 요구하면 마찰이 생깁니다. 판단하기 전에 "내 기준을 설명하는 것"부터 해보세요.',
    low: '결과를 빠르게 내는 힘이 있습니다. 다만 중요한 결정 전에 "이 방식을 모두가 알게 돼도 괜찮은가?"를 한 번 물어보면 신뢰를 오래 지킬 수 있습니다.',
  },
  E: {
    high: '감정을 잘 느끼는 만큼 쉽게 지칠 수 있습니다. 걱정이 커질 때는 바로 해결하려 하기보다 잠깐 거리를 두고 적어보는 습관이 도움이 됩니다.',
    low: '압박 속에서도 침착한 건 큰 강점입니다. 다만 주변 사람이 힘들어할 때 해결책보다 "힘들었겠다"는 말을 먼저 건네보세요.',
  },
  X: {
    high: '사람들 속에서 에너지를 얻는 만큼, 혼자 생각을 정리할 시간을 일부러 확보하면 결정의 질이 높아집니다.',
    low: '혼자 충전하는 방식을 존중하되, 중요한 사람에게 먼저 짧게 연락하는 작은 습관이 관계의 단절을 막아줍니다.',
  },
  A: {
    high: '갈등을 피하고 맞춰주는 편이라면, 불편함을 "나는 이렇게 느꼈다"는 형식으로 한 번 말해보세요. 관계가 오히려 깊어집니다.',
    low: '솔직한 기준은 강점입니다. 지적하기 전에 상대의 의도를 한 문장으로 먼저 인정하면 같은 말도 훨씬 잘 전달됩니다.',
  },
  C: {
    high: '완벽한 계획을 기다리기보다 "충분히 좋은 시작"을 먼저 실행하면, 꼼꼼함이 부담이 아닌 추진력이 됩니다.',
    low: '흐름을 타는 유연함이 있습니다. 가장 중요한 일 하나만 정해 마감을 적어두면, 즉흥성을 잃지 않고도 끝맺음을 만들 수 있습니다.',
  },
  O: {
    high: '떠오르는 아이디어가 많을수록 하나를 끝까지 검증해보는 경험이 중요합니다. 새로운 시도 하나를 골라 작게 완성해보세요.',
    low: '검증된 방식을 신뢰하는 건 안정감의 원천입니다. 한 달에 한 번 익숙하지 않은 방식을 작게 시도해보면 선택지가 넓어집니다.',
  },
}

// 두 요인 조합 팁 — 한 요인만 보고 주는 일반적인 팁보다 우선 (둘 다 충분히 치우쳤을 때만)
type Dir = 'high' | 'low'
const COMBO_TIPS: { a: [HexacoFactor, Dir]; b: [HexacoFactor, Dir]; tip: string }[] = [
  { a: ['E', 'high'], b: ['C', 'high'], tip: '걱정이 크면서도 해야 할 일은 끝까지 챙기는 조합이에요. 걱정이 올라올 때 그 걱정을 "할 일 목록"으로 옮겨 적어 보세요. 꼼꼼함이 불안을 다루는 도구가 됩니다.' },
  { a: ['X', 'low'], b: ['O', 'high'], tip: '혼자 깊이 파고든 생각이 많은 편이에요. 이번 주에 그중 하나를 믿을 만한 한 사람에게만 먼저 들려주세요. 큰 자리보다 한 사람이 첫 무대로 편해요.' },
  { a: ['X', 'low'], b: ['E', 'high'], tip: '사람을 만나고 나면 에너지가 많이 빠지는 조합이에요. 약속을 잡을 때 그다음 날 혼자 회복할 시간을 일정에 먼저 넣어 두세요.' },
  { a: ['C', 'high'], b: ['O', 'high'], tip: '아이디어를 실제 결과물로 만드는 힘이 있는 조합이에요. 한 달에 하나, 떠오른 생각을 작은 결과물(글 한 편, 시안 하나)로 끝까지 만들어 보세요.' },
  { a: ['X', 'high'], b: ['C', 'low'], tip: '시작하는 에너지는 큰데 마무리가 흐려지기 쉬운 조합이에요. 시작할 때 마감일을 주변 사람에게 먼저 말해 두면 끝맺음이 쉬워져요.' },
  { a: ['H', 'high'], b: ['A', 'low'], tip: '원칙이 분명하고 할 말은 하는 조합이에요. 지적하기 전에 상대의 의도를 한 문장으로 먼저 인정하면, 같은 말도 훨씬 잘 전달돼요.' },
  { a: ['A', 'high'], b: ['E', 'high'], tip: '상대에게 맞춰 주면서 속으로 마음을 많이 쓰는 조합이에요. 서운한 일이 생기면 참기 전에 "나는 이렇게 느꼈어"라고 짧게 말해 보세요.' },
  { a: ['O', 'high'], b: ['C', 'low'], tip: '관심사가 넓고 새로운 것에 쉽게 끌리는 조합이에요. 새 관심사를 시작할 때 "2주만 해보고 판단하기"처럼 작은 기한을 정해 보세요.' },
]
function comboTip(raw: Record<HexacoFactor, number>): string | null {
  const dev = (f: HexacoFactor, d: Dir) => (d === 'high' ? raw[f] - 3 : 3 - raw[f])
  const matched = COMBO_TIPS
    .filter(c => level(raw[c.a[0]]) === c.a[1] && level(raw[c.b[0]]) === c.b[1])
    .sort((x, y) => (dev(...y.a) + dev(...y.b)) - (dev(...x.a) + dev(...x.b)))
  return matched[0]?.tip ?? null
}

export function getPracticalTip(result: HexacoResult): string {
  const combo = comboTip(result.scores.raw)
  if (combo) return combo
  const factors = ['H', 'E', 'X', 'A', 'C', 'O'] as HexacoFactor[]
  const top = factors.reduce((best, f) =>
    Math.abs(result.scores.raw[f] - 3) > Math.abs(result.scores.raw[best] - 3) ? f : best,
  )
  return GROWTH_TIPS[top][result.scores.raw[top] >= 3 ? 'high' : 'low']
}

// ── 그림자 보정: 중립 요인 고점이 그림자와 충돌할 때 문구 추가 ────────────────
// 예: 수호자 그림자 "변화에 저항" + 개방성 5.0 → 보정 문구 추가
const SHADOW_CORRECTIONS: Partial<Record<HexacoFactor, { dir: 'high' | 'low'; note: string; appliesTo?: string[] }>> = {
  C: {
    dir: 'high',
    appliesTo: ['empath', 'companion', 'coordinator'],   // 그림자가 "소진"에 관한 원형에만
    note: '다만 당신은 성실성도 높아, 지친 날에도 해야 할 일은 챙기는 편이에요. 그만큼 회복 시간을 일정에 먼저 넣어 두는 게 중요해요.',
  },
  O: {
    dir: 'high',
    note: '다만 당신은 개방성이 높아, 기존 방식을 고집하기보다 더 나은 방법을 적극적으로 탐색하는 면도 강합니다.',
  },
  E: {
    dir: 'high',
    note: '다만 당신은 감수성이 높아, 타인의 감정을 쉽게 포착하고 그에 반응하는 면이 있습니다.',
  },
  X: {
    dir: 'low',
    note: '다만 당신은 내향적인 면이 강해, 에너지를 소진하지 않고 조용히 지속하는 방식을 선호합니다.',
  },
}

export function getShadowNote(
  archetype: HexacoArchetype,
  result: HexacoResult,
): string | null {
  const factors = Object.keys(SHADOW_CORRECTIONS) as HexacoFactor[]
  for (const f of factors) {
    const correction = SHADOW_CORRECTIONS[f]!
    if (archetype.profile[f] !== 0) continue // 이미 정의된 요인은 건드리지 않음
    if (correction.appliesTo && !correction.appliesTo.includes(archetype.id)) continue
    if (level(result.scores.raw[f]) === correction.dir) return correction.note
  }
  return null
}

// ── 부가 성향이 나온 이유: 부원형이 조건으로 가진 요인 중 실제로 맞은 것 ──
export function getSecondaryWhy(result: HexacoResult): string | null {
  const sec = result.secondary
  const hits = (Object.keys(sec.profile) as HexacoFactor[])
    .filter(f => sec.profile[f] !== 0 && level(result.scores.raw[f]) === (sec.profile[f] > 0 ? 'high' : 'low'))
    .map(f => `${FACTOR_LABEL[f]}${sec.profile[f] > 0 ? '이 높은' : '이 낮은'} 점`)
  if (!hits.length) return `${sec.name}의 특징이 주원형 다음으로 가깝게 나타났어요. 두드러진 요인보다는 전체 균형이 비슷한 경우예요.`
  return `${hits.join(', ')}이 ${sec.name}의 특징과 겹쳐서 부가 성향으로 나타났어요.`
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

export function personalizeResult(result: HexacoResult): PersonalizedResult {
  const { primary } = result
  return {
    subLabel: getSubLabel(primary, result),
    whyText: getWhyText(primary.name, primary, result),
    distinguishingTraits: getDistinguishingTraits(result),
    factorLines: getFactorLines(result),
    practicalTip: getPracticalTip(result),
    shadowNote: getShadowNote(primary, result),
    secondaryWhy: getSecondaryWhy(result),
  }
}
