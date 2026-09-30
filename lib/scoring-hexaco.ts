// HEXACO 48문항 채점 + 22원형 매칭 시스템

export type HexacoFactor = 'H' | 'E' | 'X' | 'A' | 'C' | 'O'
export type FactorDirection = 1 | -1 | 0
export type HexacoVector = Record<HexacoFactor, FactorDirection>

export interface HexacoScores {
  raw: Record<HexacoFactor, number>   // 1–5 평균
  direction: HexacoVector              // ↑(1) / ↓(-1) / 중립(0)
}

export interface HexacoArchetype {
  id: string
  name: string
  // +1=↑필수, -1=↓필수, 0=조건없음, 0.5=약한↑(괄호 표시)
  profile: Record<HexacoFactor, number>
  note: string
}

export interface HexacoResult {
  scores: HexacoScores
  primary: HexacoArchetype
  secondary: HexacoArchetype
  primaryDistance: number
  secondaryDistance: number
}

// ─── 문항 메타데이터 ────────────────────────────────────────────────────────
// reverse: true → 채점 시 6 - raw (동의 = 낮은 점수)
interface QuestionMeta {
  id: string
  factor: HexacoFactor
  reverse: boolean
}

export const QUESTIONS: QuestionMeta[] = [
  // H — 정직·겸손
  { id: 'H1', factor: 'H', reverse: false }, // 아첨 안 함 (성실성↑)
  { id: 'H2', factor: 'H', reverse: false }, // 솔직하게 아쉬운 점 말함 시나리오
  { id: 'H3', factor: 'H', reverse: false }, // 규칙 어기는 이익 거부 (공정성↑)
  { id: 'H4', factor: 'H', reverse: false }, // 차액 내러 돌아가는 시나리오
  { id: 'H5', factor: 'H', reverse: true  }, // 사치품 욕구 있다 [역] (탐욕회피↓)
  { id: 'H6', factor: 'H', reverse: false }, // 고연봉보다 만족감 시나리오
  { id: 'H7', factor: 'H', reverse: true  }, // 남들보다 뛰어나다고 생각 [역] (겸손↓)
  { id: 'H8', factor: 'H', reverse: false }, // 역할 강조 안 하는 시나리오

  // E — 정서성
  { id: 'E1', factor: 'E', reverse: true  }, // 위험 상황 겁 안 난다 [역] (두려움↓)
  { id: 'E2', factor: 'E', reverse: false }, // 번지점프 두려워 거절 시나리오
  { id: 'E3', factor: 'E', reverse: true  }, // 걱정 금방 털어버린다 [역] (불안↓)
  { id: 'E4', factor: 'E', reverse: false }, // 발표 앞두고 걱정 먼저 시나리오
  { id: 'E5', factor: 'E', reverse: false }, // 지지 꼭 필요 (의존성↑)
  { id: 'E6', factor: 'E', reverse: false }, // 털어놓고 싶다 시나리오
  { id: 'E7', factor: 'E', reverse: false }, // 헤어짐에 깊은 슬픔 (감성↑)
  { id: 'E8', factor: 'E', reverse: false }, // 이별이 마음에 걸린다 시나리오

  // X — 외향성
  { id: 'X1', factor: 'X', reverse: false }, // 처음 만나는 사람 앞 자신감 (사회적자존감↑)
  { id: 'X2', factor: 'X', reverse: false }, // 자신 있게 자기소개 시나리오
  { id: 'X3', factor: 'X', reverse: false }, // 발표 부담 없음 (사회적대담성↑)
  { id: 'X4', factor: 'X', reverse: false }, // 침묵에 먼저 나서는 시나리오
  { id: 'X5', factor: 'X', reverse: true  }, // 새 사람 만나는 게 피곤하다 [역] (사교성↓)
  { id: 'X6', factor: 'X', reverse: false }, // 모임 나가고 싶다 시나리오
  { id: 'X7', factor: 'X', reverse: true  }, // 혼자 재충전 필요하다 [역] (활력↓)
  { id: 'X8', factor: 'X', reverse: false }, // 분위기 띄우는 역할 시나리오

  // A — 원만성
  { id: 'A1', factor: 'A', reverse: true  }, // 잘못 잊기 힘들다 [역] (용서↓)
  { id: 'A2', factor: 'A', reverse: false }, // 용서하고 예전처럼 시나리오
  { id: 'A3', factor: 'A', reverse: false }, // 남을 너그럽게 평가 (온화함↑)
  { id: 'A4', factor: 'A', reverse: false }, // 괜찮다고 넘어가는 시나리오
  { id: 'A5', factor: 'A', reverse: false }, // 타협하는 편 (유연성↑)
  { id: 'A6', factor: 'A', reverse: false }, // 친구 의견에 맞추는 시나리오
  { id: 'A7', factor: 'A', reverse: true  }, // 짜증 쌓인다 [역] (인내심↓)
  { id: 'A8', factor: 'A', reverse: false }, // 계산대 줄 짜증 없음 시나리오

  // C — 성실성
  { id: 'C1', factor: 'C', reverse: true  }, // 방·책상 어질러짐 [역] (조직성↓)
  { id: 'C2', factor: 'C', reverse: false }, // 목록 만들고 순서 정하는 시나리오
  { id: 'C3', factor: 'C', reverse: false }, // 끝까지 해내는 편 (근면성↑)
  { id: 'C4', factor: 'C', reverse: false }, // 포기 않고 완성하는 시나리오
  { id: 'C5', factor: 'C', reverse: false }, // 꼼꼼하게 확인 (완벽주의↑)
  { id: 'C6', factor: 'C', reverse: false }, // 마감 직전 오류 고치고 제출 시나리오
  { id: 'C7', factor: 'C', reverse: true  }, // 직관적으로 빠르게 결정 [역] (신중성↓)
  { id: 'C8', factor: 'C', reverse: false }, // 더 알아보고 결정하는 시나리오

  // O — 개방성
  { id: 'O1', factor: 'O', reverse: true  }, // 예술이 감동 안 준다 [역] (심미적감상↓)
  { id: 'O2', factor: 'O', reverse: false }, // 미술관·공연 즐거움 시나리오
  { id: 'O3', factor: 'O', reverse: false }, // 알고 싶은 욕구 강함 (탐구성↑)
  { id: 'O4', factor: 'O', reverse: false }, // 자료 찾아보는 시나리오
  { id: 'O5', factor: 'O', reverse: false }, // 독창적 방법 떠올림 (창의성↑)
  { id: 'O6', factor: 'O', reverse: false }, // 색다른 접근법 제안 시나리오
  { id: 'O7', factor: 'O', reverse: true  }, // 통념 의심 안 한다 [역] (비관습성↓)
  { id: 'O8', factor: 'O', reverse: false }, // 납득 안 되는 관습 거부 시나리오
]

// ─── 22개 원형 프로파일 ─────────────────────────────────────────────────────
export const ARCHETYPES: HexacoArchetype[] = [
  { id: 'guardian',    name: '수호자',     profile: { H:1,  E:0,  X:0,  A:1,  C:1,  O:0  }, note: '원칙·책임감·타인을 아끼는 강인한 보호자' },
  { id: 'warrior',     name: '투사',       profile: { H:1,  E:0,  X:1,  A:-1, C:0,  O:0.5}, note: '정의를 위해 싸우는 이상적 전사' },
  { id: 'visionary',   name: '비전가',     profile: { H:1,  E:0,  X:1,  A:0,  C:0.5,O:1  }, note: '원칙 위에 세운 원대한 비전' },
  { id: 'artisan',     name: '장인',       profile: { H:0,  E:0,  X:-1, A:-1, C:1,  O:-1 }, note: '타협 없는 기술과 전통의 완성자' },
  { id: 'sentinel',    name: '수문장',     profile: { H:1,  E:-1, X:-1, A:0,  C:1,  O:0  }, note: '감정 없이 원칙을 지키는 경비자' },
  { id: 'conqueror',   name: '정복자',     profile: { H:-1, E:-1, X:1,  A:-1, C:1,  O:0  }, note: '냉정하고 계획적인 지배자' },
  { id: 'opportunist', name: '기회가',     profile: { H:-1, E:0,  X:1,  A:0,  C:0,  O:1  }, note: '상황을 읽고 기민하게 움직이는 기회주의자' },
  { id: 'strategist',  name: '전략가',     profile: { H:-1, E:0,  X:-1, A:0,  C:1,  O:1  }, note: '배후에서 판을 짜는 조종자' },
  { id: 'charmer',     name: '매혹가',     profile: { H:-1, E:1,  X:1,  A:1,  C:0,  O:0  }, note: '따뜻함을 연기하는 자기중심적 매력가' },
  { id: 'companion',   name: '동반자',     profile: { H:1,  E:1,  X:0,  A:1,  C:0,  O:0  }, note: '진심으로 함께하는 헌신적 동행자' },
  { id: 'empath',      name: '감응자',     profile: { H:0,  E:1,  X:-1, A:0,  C:0,  O:1  }, note: '감정과 상상력으로 세상을 흡수하는 내향적 공감자' },
  { id: 'passionate',  name: '격정가',     profile: { H:0,  E:1,  X:1,  A:-1, C:0,  O:0  }, note: '감정이 폭발하는 충동적 표현자' },
  { id: 'fighter',     name: '전사',       profile: { H:0,  E:-1, X:1,  A:-1, C:0,  O:0  }, note: '냉정하게 싸우는 목표 지향 실행자' },
  { id: 'coordinator', name: '조율자',     profile: { H:0,  E:0,  X:1,  A:1,  C:1,  O:0  }, note: '사람을 연결하고 조직하는 사회적 조정자' },
  { id: 'sage',        name: '현자',       profile: { H:1,  E:0,  X:0,  A:0,  C:1,  O:1  }, note: '원칙·학식·지적 탐구를 갖춘 지혜의 스승' },
  { id: 'analyst',     name: '분석가',     profile: { H:0,  E:-1, X:-1, A:-1, C:0,  O:1  }, note: '냉정하게 해체하는 지적 비평자' },
  { id: 'explorer',    name: '탐험가',     profile: { H:0,  E:-1, X:1,  A:0,  C:-1, O:1  }, note: '두려움 없이 미지로 뛰어드는 모험가' },
  { id: 'dreamer',     name: '몽상가',     profile: { H:0,  E:0,  X:-1, A:0,  C:-1, O:1  }, note: '현실과 분리된 내면 세계의 상상자' },
  { id: 'cynic',       name: '냉소가',     profile: { H:-1, E:-1, X:-1, A:-1, C:0,  O:0  }, note: '인간과 세상에 대한 불신으로 가득 찬 은둔자' },
  { id: 'pragmatist',  name: '실무가',     profile: { H:0,  E:-1, X:0,  A:0,  C:1,  O:-1 }, note: '감정 없이 실용을 추구하는 냉정한 실행가' },
  { id: 'realist',     name: '현실주의자', profile: { H:-1, E:0,  X:0,  A:0,  C:1,  O:-1 }, note: '이상 없이 자기 이익을 계산하는 실용주의자' },
  { id: 'hedonist',    name: '향락가',     profile: { H:-1, E:0,  X:1,  A:0,  C:-1, O:-1 }, note: '지금의 쾌락을 좇는 충동적 자기탐닉자' },
]

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']

// 막대 색·개인화 문구가 공유하는 높음/낮음 기준
export const HIGH_THRESHOLD = 3.5
export const LOW_THRESHOLD = 2.5

// ─── 요인 점수 계산 ─────────────────────────────────────────────────────────
export function computeHexacoScores(answers: Record<string, number>): HexacoScores {
  const sums: Record<HexacoFactor, number[]> = { H:[], E:[], X:[], A:[], C:[], O:[] }

  for (const q of QUESTIONS) {
    const raw = answers[q.id]
    if (raw === undefined || raw < 1 || raw > 5) continue
    sums[q.factor].push(q.reverse ? 6 - raw : raw)
  }

  const raw = {} as Record<HexacoFactor, number>
  const direction = {} as HexacoVector

  for (const f of FACTORS) {
    const vals = sums[f]
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 3
    raw[f] = Math.round(avg * 100) / 100
    direction[f] = avg >= HIGH_THRESHOLD ? 1 : avg <= LOW_THRESHOLD ? -1 : 0
  }

  return { raw, direction }
}

// ─── 원형 매칭 ──────────────────────────────────────────────────────────────
// 원점수 기반 가중 평균 거리. 조건 요인은 목표(4.5/1.5)까지, 무조건 요인은 3.0까지의 거리를 약하게 반영
const NEUTRAL_WEIGHT = 0.25
function computeDistance(raw: Record<HexacoFactor, number>, archetype: HexacoArchetype): number {
  let dist = 0
  let totalWeight = 0
  for (const f of FACTORS) {
    const req = archetype.profile[f]
    const weight = req === 0 ? NEUTRAL_WEIGHT : Math.abs(req)
    // 조건 요인은 목표를 넘어선 만큼은 감점하지 않음 (5.0이 4.5보다 덜 맞는 것으로 계산되면 안 됨)
    const gap = req === 0 ? Math.abs(raw[f] - 3) : Math.max(0, (3 + 1.5 * Math.sign(req) - raw[f]) * Math.sign(req))
    dist += weight * gap
    totalWeight += weight
  }
  return Math.round((dist / totalWeight) * 1000) / 1000
}

function conditionCount(arch: HexacoArchetype): number {
  return FACTORS.reduce((n, f) => n + Math.abs(arch.profile[f]), 0)
}

// ─── 메인 함수 ──────────────────────────────────────────────────────────────
export function scoreHexaco(answers: Record<string, number>): HexacoResult {
  const scores = computeHexacoScores(answers)

  const ranked = ARCHETYPES
    .map(arch => ({ arch, dist: computeDistance(scores.raw, arch) }))
    .sort((a, b) => a.dist - b.dist || conditionCount(b.arch) - conditionCount(a.arch))

  return {
    scores,
    primary: ranked[0].arch,
    secondary: ranked[1].arch,
    primaryDistance: ranked[0].dist,
    secondaryDistance: ranked[1].dist,
  }
}
