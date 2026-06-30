/**
 * 업무 방식 & 투자 스타일 동적 산출
 *
 * 업무 방식: HEXACO 직업심리학 연구 (Ashton & Lee 2007, De Vries et al. 2011)
 * 투자 프로파일: 행동재무학 (Durand et al. 2008, Mayfield et al. 2008,
 *                Pak & Mahmood 2015) 기반 성격-투자행동 연관성
 *
 * ※ 투자 섹션은 성격 기반 경향성 분석이며 금융 조언이 아닙니다.
 */
import { FacetMap } from './profiles'

// ─── 서술형 성격 내러티브 ──────────────────────────────────────

/**
 * 패싯 점수 조합에서 자연어 성격 설명 문단 생성
 * 연속형 점수를 "당신은 ~하는 경향이 있습니다" 형식으로 종합
 */
function norm(v: number): number { return Math.min(Math.max((v - 1) / 4, 0), 1) }

export function computeNarrative(facets: FacetMap, cogScore: number): string {
  const cur = norm(facets.curiosity)
  const dil = norm(facets.diligence)
  const bol = norm(facets.boldness)
  const hum = norm(facets.humility)
  const anx = norm(facets.anxiety)
  const pat = norm(facets.patience)

  const sentences: string[] = []

  // ── 개방성·호기심 ──
  if (cur >= 0.72) {
    sentences.push('새로운 개념과 분야에 강하게 끌리며, 익숙한 영역을 넘어 탐구하는 것 자체에서 큰 에너지를 얻습니다.')
  } else if (cur >= 0.47) {
    sentences.push('관심 있는 분야에서는 깊이 파고드는 편이지만, 완전히 낯선 영역 진입에는 충분한 이유가 필요합니다.')
  } else {
    sentences.push('검증된 방식과 깊이 아는 영역에서 안정적으로 역량을 발휘하며, 새로움보다 숙련에서 만족감을 얻습니다.')
  }

  // ── 사회적 에너지 & 원만성 조합 ──
  if (bol >= 0.65 && pat >= 0.58) {
    sentences.push('사람들 사이에서 에너지를 얻고, 다양한 관계를 자연스럽게 이어가는 사교적 강점을 지닙니다. 갈등보다 조화를 선택하지만, 필요할 때는 명확하게 방향을 제시하기도 합니다.')
  } else if (bol >= 0.65 && pat < 0.42) {
    sentences.push('사회적 상황에서 주도적이고 직접적입니다. 결론을 빠르게 끌어내고 실행하는 것을 선호하며, 주변에서 에너지 넘치는 존재로 인식됩니다.')
  } else if (bol < 0.42 && pat >= 0.62) {
    sentences.push('조용하지만 깊이 있는 공감 능력을 가지고 있습니다. 타인의 감정과 필요를 잘 읽으며, 관계에서 안정감을 주는 존재입니다.')
  } else if (bol < 0.42) {
    sentences.push('혼자 또는 소규모의 신뢰하는 사람들과 함께할 때 가장 자연스럽습니다. 넓은 인맥보다 소수의 깊은 관계를 선호합니다.')
  } else {
    sentences.push('상황에 따라 리더와 조력자 역할을 유연하게 전환할 수 있으며, 다양한 관계 맥락에 잘 적응합니다.')
  }

  // ── 성실성 & 불안 조합 ──
  if (dil >= 0.65 && anx >= 0.60) {
    sentences.push('높은 기준을 스스로 설정하고 그것을 충족하려는 강한 의지가 있습니다. 완성도에 대한 민감함은 탁월한 결과물을 만들어내는 원동력이지만, 동시에 피로 누적의 원인이 될 수 있습니다.')
  } else if (dil >= 0.65 && anx < 0.42) {
    sentences.push('목표를 향해 꾸준히, 그러나 지나치게 스트레스받지 않으면서 나아가는 균형 잡힌 실행력을 가지고 있습니다.')
  } else if (dil < 0.42 && anx >= 0.60) {
    sentences.push('감수성이 높고 감정의 파동이 세밀합니다. 이 민감함이 창의성과 공감의 원천이지만, 에너지 관리가 중요합니다.')
  } else if (dil < 0.42) {
    sentences.push('흥미와 의미를 느낄 때 폭발적인 집중력을 발휘하며, 루틴보다 새로운 자극과 변화에서 동기를 얻습니다.')
  } else {
    sentences.push('상황의 요구에 따라 성실하게 몰두하면서도 자신의 에너지를 비교적 잘 조절하는 편입니다.')
  }

  // ── 겸손·윤리 의식 ──
  if (hum >= 0.68) {
    sentences.push('진정성과 공정함을 핵심 가치로 여기며, 자신을 과장하거나 타인을 이용하는 방식에 자연스럽게 거부감을 느낍니다. 이런 진정성이 장기적으로 깊은 신뢰를 쌓는 토대가 됩니다.')
  } else if (hum < 0.38) {
    sentences.push('자신의 능력과 성취를 자신감 있게 표현하며, 경쟁 환경에서 자신을 적극적으로 드러내는 것에 거리낌이 없습니다.')
  }

  // ── 인지 수준 통합 ──
  if (cogScore >= 0.75) {
    sentences.push('복잡한 문제를 빠르게 구조화하고 패턴을 찾아내는 분석적 사고가 두드러집니다. 어려운 개념도 체계적으로 분해해 이해하는 방식으로 접근합니다.')
  } else if (cogScore >= 0.5) {
    sentences.push('논리적으로 사고하며 문제의 핵심을 파악하는 능력을 갖추고 있습니다.')
  }

  // ── 마무리 문장 — 성격의 핵심 강점 ──
  const topFacetLabel = (() => {
    const ranked: [number, string][] = [
      [cur, '지적 탐구'], [dil, '성실한 완수'], [bol, '사회적 에너지'],
      [hum, '진정성'], [(1 - anx) * 0.5 + anx * 0.5, '감수성'], [pat, '공감력'],
    ]
    ranked.sort((a, b) => b[0] - a[0])
    return ranked[0][1]
  })()
  sentences.push(`전반적으로 ${topFacetLabel}이(가) 가장 두드러지는 특성이며, 이것이 당신의 선택, 관계, 업무 방식 전반에 걸쳐 일관되게 나타납니다. 아래 점수는 단일 유형이 아닌 당신만의 고유한 성격 지도입니다.`)

  return sentences.join(' ')
}

// ─── 정규화 ───────────────────────────────────────────────
function n(v: number): number {
  return Math.min(Math.max((v - 1) / 4, 0), 1) // 1~5 → 0~1
}

function get(f: FacetMap, key: string): number {
  return n((f as unknown as Record<string, number>)[key] ?? 3)
}

// ─── 업무 방식 ─────────────────────────────────────────────

export interface WorkStyle {
  decisionMaking: string   // 의사결정 방식
  collaboration: string    // 협업 스타일
  environment: string      // 최적 업무 환경
  focus: string            // 집중·몰입 방식
  communication: string    // 소통 방식
  strengths: string[]      // 업무 강점 (3가지)
  watchouts: string[]      // 주의사항 (2가지)
}

export function computeWorkStyle(facets: FacetMap, cogScore: number): WorkStyle {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  // ── 의사결정 ──
  // 높은 분석력(cog×curiosity) vs 빠른 직관(boldness×low anxiety)
  const analyticScore = cogScore * 0.5 + cur * 0.5
  const intuitiveScore = bol * 0.5 + (1 - anx) * 0.5

  let decisionMaking: string
  if (analyticScore >= 0.65 && analyticScore > intuitiveScore + 0.1) {
    decisionMaking = '데이터와 근거를 충분히 검토한 뒤 결정하는 분석형입니다. 판단 전 다양한 관점과 정보를 수집하며, 성급한 결론보다 정확한 판단을 우선합니다. 시간 압박이 있는 상황에서는 "충분한 근거"의 기준을 낮추는 연습이 필요합니다.'
  } else if (intuitiveScore >= 0.65 && intuitiveScore > analyticScore + 0.1) {
    decisionMaking = '경험과 직관을 바탕으로 빠르게 결정하는 실행형입니다. 불확실성 속에서도 과감하게 행동하며, 결과를 보면서 조정하는 방식이 잘 맞습니다. 중요한 결정에서는 반드시 근거 검토 단계를 추가하세요.'
  } else if (anx >= 0.6 && dil >= 0.6) {
    decisionMaking = '꼼꼼하게 검토하되 결과에 대한 걱정이 결정을 지연시키는 경향이 있습니다. "완벽한 준비"를 기다리기보다 "충분한 준비"로 행동하는 기준을 미리 설정해두는 것이 효과적입니다.'
  } else {
    decisionMaking = '상황과 정보 수준에 따라 분석적·직관적 방식을 유연하게 전환합니다. 이 유연성이 다양한 환경에 빠르게 적응하는 강점이 됩니다.'
  }

  // ── 협업 스타일 ──
  let collaboration: string
  if (bol >= 0.65 && pat >= 0.55) {
    collaboration = '팀을 자연스럽게 이끌면서도 구성원의 의견을 경청하는 협력적 리더 스타일입니다. 회의에서 방향을 제시하되 다양한 관점을 통합하는 데 강점이 있습니다.'
  } else if (bol >= 0.65 && pat < 0.45) {
    collaboration = '주도적이고 직접적인 협업 방식을 선호합니다. 역할과 목표를 명확히 정의하고 빠르게 실행하는 팀 환경에서 최고 성과를 냅니다. 팀원의 속도 차이에 인내심을 의식적으로 발휘하는 것이 관계 유지에 중요합니다.'
  } else if (bol < 0.45 && pat >= 0.6) {
    collaboration = '지원자·조력자 역할에서 탁월합니다. 팀원의 감정과 필요를 잘 파악하고, 갈등을 부드럽게 완화하는 능력이 있습니다. 자신의 의견을 먼저 제시하는 연습을 통해 영향력을 높일 수 있습니다.'
  } else if (bol < 0.45 && pat < 0.45) {
    collaboration = '독립적인 작업에서 최고의 성과를 냅니다. 명확한 역할 분담과 최소한의 미팅이 있는 협업 구조가 잘 맞습니다. 팀 작업 시에는 문서로 소통하는 방식을 선호합니다.'
  } else {
    collaboration = '상황에 따라 리더와 팀원 역할을 유연하게 전환할 수 있습니다. 팀의 필요에 맞춰 적응하는 능력이 다양한 조직 환경에서 강점이 됩니다.'
  }

  // ── 최적 환경 ──
  let environment: string
  if (cur >= 0.65 && bol < 0.5) {
    environment = '조용하고 방해 없는 공간에서 깊이 탐구하는 환경이 최적입니다. 오픈 오피스보다 개인 공간 또는 재택근무 환경, 긴 집중 블록(2~3시간)이 보장될 때 생산성이 극대화됩니다.'
  } else if (bol >= 0.65 && cur >= 0.55) {
    environment = '다양한 사람과 아이디어가 충돌하는 역동적인 환경에서 에너지를 얻습니다. 코워킹, 팀 미팅, 빠른 피드백 루프가 있는 환경에서 아이디어가 폭발적으로 발현됩니다.'
  } else if (dil >= 0.7 && cur < 0.45) {
    environment = '체계적이고 예측 가능한 업무 구조가 있는 환경에서 강점이 발휘됩니다. 명확한 역할, 정해진 프로세스, 안정적인 팀 구성이 지속적인 고성과의 조건입니다.'
  } else if (anx >= 0.65) {
    environment = '심리적 안전감이 보장된 환경이 중요합니다. 명확한 기대치, 충분한 준비 시간, 실수를 허용하는 조직 문화에서 잠재력이 최대로 발휘됩니다.'
  } else {
    environment = '유연한 구조와 적절한 자율성이 있는 환경에서 잘 적응합니다. 과도한 통제보다 목표 기반의 업무 방식이 더 잘 맞습니다.'
  }

  // ── 집중·몰입 ──
  let focus: string
  if (dil >= 0.65 && anx < 0.5) {
    focus = '한 번 집중을 시작하면 장시간 몰입 상태를 유지합니다. 집중 시작까지의 워밍업이 필요할 수 있지만, 일단 시작되면 외부 방해에도 흔들리지 않는 강점이 있습니다.'
  } else if (cur >= 0.65 && dil < 0.5) {
    focus = '흥미로운 과제에서는 강렬한 집중력을 발휘하지만, 지루하거나 반복적인 작업에서는 집중이 분산됩니다. 포모도로 기법(25분 집중/5분 휴식)처럼 짧고 강한 세션을 반복하는 방식이 효과적입니다.'
  } else if (anx >= 0.65 && dil >= 0.55) {
    focus = '높은 기준과 불안 조합으로 완벽한 조건이 갖춰질 때까지 시작을 미루는 경향이 있습니다. "완료 기준"을 미리 문서화하고, 80% 완성 상태에서 다음 단계로 넘어가는 규칙을 만들어두면 효과적입니다.'
  } else {
    focus = '과제의 성격과 환경에 따라 집중 패턴이 달라집니다. 의미 있는 목표와 연결될 때 집중력이 가장 높아집니다.'
  }

  // ── 소통 방식 ──
  let communication: string
  if (bol >= 0.6 && pat < 0.5) {
    communication = '직접적이고 명확한 소통 방식입니다. 핵심을 빠르게 전달하고 결론 중심으로 대화합니다. 감정적 배경이 필요한 상대와 소통할 때는 맥락 설명을 추가하는 것이 오해를 줄입니다.'
  } else if (pat >= 0.65 && bol < 0.5) {
    communication = '상대의 입장을 충분히 이해하고 부드럽게 의사를 전달합니다. 갈등 상황에서 완충제 역할을 잘 합니다. 자신의 의견을 더 명확하고 직접적으로 표현하는 연습이 영향력 확대에 도움됩니다.'
  } else if (hum >= 0.65) {
    communication = '솔직하고 진정성 있는 소통을 중요시합니다. 과장이나 인상 관리보다 사실에 근거한 대화를 선호하며, 이 진정성이 장기적으로 신뢰를 쌓는 핵심 자산이 됩니다.'
  } else {
    communication = '상황에 맞게 소통 방식을 조절하는 유연성이 있습니다. 공식적 발표와 비공식 대화 모두에서 자연스럽게 적응합니다.'
  }

  // ── 강점 목록 ──
  const facetStrengths: Array<[number, string]> = [
    [cur, '새로운 개념을 빠르게 학습하고 연결하는 능력'],
    [dil, '시작한 일을 끝까지 완수하는 강한 완결 의지'],
    [bol, '낯선 환경에서도 자신을 명확히 표현하는 대담성'],
    [hum, '조직 내 신뢰와 윤리적 평판을 자연스럽게 쌓는 능력'],
    [(1 - anx), '압박 상황에서도 감정을 안정적으로 유지하는 침착함'],
    [pat, '다양한 관점을 통합하고 갈등을 완화하는 조율 능력'],
    [cogScore, '복잡한 문제를 체계적으로 분석하는 논리적 사고'],
  ]
  facetStrengths.sort((a, b) => b[0] - a[0])
  const strengths = facetStrengths.slice(0, 3).map(([, s]) => s)

  // ── 주의사항 ──
  const watchouts: string[] = []
  if (anx >= 0.6 && dil >= 0.6) watchouts.push('완벽주의와 불안이 결합되면 과로·번아웃으로 이어질 수 있습니다. "충분히 좋음"의 기준을 의식적으로 낮추세요.')
  if (cur >= 0.65 && dil < 0.45) watchouts.push('흥미가 식으면 프로젝트 중도 포기 패턴이 나타날 수 있습니다. 시작 전 완료 기준과 타임라인을 명확히 설정하세요.')
  if (bol >= 0.7 && pat < 0.4) watchouts.push('빠른 실행 속도가 팀원과의 보조 불일치를 유발할 수 있습니다. 중요한 결정 전 팀의 이해와 동의를 확인하세요.')
  if (anx >= 0.65 && bol < 0.4) watchouts.push('과도한 준비로 행동 시점이 늦어질 수 있습니다. "준비 완료" 기준을 미리 정의하고 그 기준에 도달하면 실행하는 규칙을 만드세요.')
  if (pat >= 0.75 && bol < 0.4) watchouts.push('갈등 회피 성향으로 자신의 의견을 충분히 표현하지 못할 수 있습니다. 직접적 피드백 제공 연습이 필요합니다.')
  if (watchouts.length === 0) watchouts.push('지나친 융통성으로 방향이 자주 바뀔 수 있습니다. 핵심 우선순위 3가지를 고정해두고 흔들리지 않게 관리하세요.')
  if (watchouts.length === 1) watchouts.push('강점이 과도해지면 단점이 됩니다. 자신의 주요 특성이 극단으로 흐르지 않도록 주기적으로 점검하세요.')

  return { decisionMaking, collaboration, environment, focus, communication, strengths, watchouts: watchouts.slice(0, 2) }
}

// ─── 투자 스타일 ─────────────────────────────────────────────

export interface InvestmentProfile {
  riskLabel: string         // 위험 수용 수준
  riskColor: string
  riskRationale: string     // 이 위험 수준이 나온 이유
  horizon: string           // 권장 투자 기간
  style: string             // 핵심 투자 스타일
  suitable: string[]        // 성격에 맞는 투자 접근
  avoid: string[]           // 피해야 할 행동·상품
  behavioralBias: string    // 주요 행동 편향과 대처
  principle: string         // 이 성격 유형의 핵심 원칙
}

export function computeInvestmentProfile(facets: FacetMap, cogScore: number): InvestmentProfile {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  // ── 위험 허용도 점수 (연구 기반 가중치) ──
  // Durand et al. (2008): 외향성·개방성이 위험 허용도의 주 예측 변인
  // Pak & Mahmood (2015): 신경증(불안)은 위험 허용도와 강한 음의 상관
  const riskScore =
    bol * 0.35 +        // 외향성/대담성: 위험 수용의 가장 강한 예측 변인
    (1 - anx) * 0.30 +  // 낮은 불안(신경증 역): 손실 내성과 직결
    cur * 0.20 +        // 개방성: 주식 투자 참여 의향과 정적 상관
    dil * 0.15          // 성실성: 체계적 저축·투자 습관과 정적 상관

  let riskLabel: string
  let riskColor: string
  let riskRationale: string

  if (riskScore >= 0.62) {
    riskLabel = '공격적 성장형'
    riskColor = '#ef4444'
    riskRationale = `대담성(${Math.round(bol * 100)}%)과 정서적 안정성(${Math.round((1 - anx) * 100)}%)이 높아 시장 변동성을 견디는 심리적 내성이 강합니다. 손실 상황에서도 충동적 매도보다 전략적 판단이 가능한 유형입니다.`
  } else if (riskScore >= 0.42) {
    riskLabel = '균형 성장형'
    riskColor = '#f59e0b'
    riskRationale = `위험 허용도가 중간 수준입니다. 수익 기회를 놓치지 않으면서도 과도한 변동성에는 심리적 부담을 느낍니다. 안전 자산과 성장 자산의 균형이 중요합니다.`
  } else {
    riskLabel = '안정 보전형'
    riskColor = '#34d399'
    riskRationale = `감수성이 높거나 대담성이 낮은 편으로, 자산 손실에 대한 심리적 반응이 강합니다. 수익보다 원금 보전이 우선이며, 안정적 현금 흐름이 있는 투자 구조가 심리적으로 지속 가능합니다.`
  }

  // ── 투자 기간 ──
  const horizon = (dil >= 0.55 && anx < 0.65)
    ? '장기(5년 이상) — 성실성이 높고 충동 매매 성향이 낮아 복리 효과를 최대로 활용할 수 있습니다.'
    : anx >= 0.65
    ? '중기(3~5년) — 단기 변동성에 심리적 부담을 줄이기 위해 1~2년 내 자금은 투자하지 않는 것을 권장합니다.'
    : '중단기(1~5년) — 투자 기간을 명확히 설정하고 그 기간 중 리밸런싱 횟수를 미리 정해두세요.'

  // ── 핵심 스타일 ──
  let style: string
  if (cur >= 0.65 && cogScore >= 0.55 && dil >= 0.5) {
    style = '리서치 주도형 — 직접 기업과 시장을 분석하는 과정 자체에서 만족감을 느낍니다. 소수의 이해도 높은 종목에 집중 투자하는 방식이 잘 맞습니다.'
  } else if (dil >= 0.65 && cur < 0.5) {
    style = '시스템 자동화형 — 감정이 개입할 여지 없이 규칙 기반으로 자동 투자되는 구조가 최적입니다. 정기 적립식 인덱스 투자가 가장 잘 맞는 유형입니다.'
  } else if (hum >= 0.6 && pat >= 0.55) {
    style = '패시브 분산형 — 시장 평균을 목표로 저비용 인덱스 펀드를 장기 보유하는 방식이 성격과 맞습니다. 전문가 의견을 참고하되 최종 판단은 본인이 합니다.'
  } else if (bol >= 0.65 && cur >= 0.55) {
    style = '기회 추구형 — 시장 기회를 빠르게 포착하고 결단력 있게 실행하는 스타일입니다. 단, 과신 편향을 방지하기 위해 사전 투자 원칙서 작성을 권장합니다.'
  } else {
    style = '균형 분산형 — 특정 스타일보다 다양한 자산에 분산하는 포트폴리오 접근이 심리적으로 가장 안정적입니다.'
  }

  // ── 적합한 투자 접근 ──
  const suitable: string[] = []
  if (dil >= 0.55) suitable.push('정기 적립식 투자 (자동화): 감정 개입 없이 일관성 유지')
  if (cur >= 0.6 && cogScore >= 0.5) suitable.push('가치·성장 주식 직접 투자 (충분한 리서치 후)')
  if (hum >= 0.55) suitable.push('ESG·사회책임 투자: 가치관과 투자 철학의 정렬')
  if (riskScore >= 0.55) suitable.push('국내외 주식형 ETF: 분산 효과와 낮은 비용')
  if (riskScore < 0.5) suitable.push('채권 혼합형 펀드: 주식 변동성을 완화하는 안전망')
  if (pat >= 0.6) suitable.push('장기 배당주: 꾸준한 현금 흐름이 심리적 안정 제공')
  if (suitable.length < 3) suitable.push('글로벌 분산 인덱스 펀드: 리서치 부담 없이 시장 수익 획득')

  // ── 피해야 할 것 ──
  const avoid: string[] = []
  if (anx >= 0.6) avoid.push('일간 수익률 확인 — 단기 변동이 불안을 증폭시켜 패닉 매도를 유발합니다. 월간 또는 분기별 확인으로 제한하세요.')
  if (bol >= 0.7 && dil < 0.55) avoid.push('단기 트레이딩·레버리지 상품 — 과신 편향과 낮은 규율의 조합은 잦은 매매와 손실로 이어집니다.')
  if (cur >= 0.7 && pat < 0.5) avoid.push('테마·유행 투자 — 호기심이 높으면 새로운 유행 상품에 끌리기 쉽습니다. 충동 매수 전 48시간 대기 규칙을 만드세요.')
  if (pat >= 0.7 && bol < 0.4) avoid.push('타인 추천 맹목적 추종 — 공감 능력이 높아 지인이나 커뮤니티 의견에 영향받기 쉽습니다. 직접 근거를 확인하세요.')
  if (avoid.length === 0) avoid.push('단기 성과 압박 — 시장 평균을 이기려는 과도한 욕심이 오히려 평균 이하의 결과를 초래합니다.')
  if (avoid.length === 1) avoid.push('집중 투자 과잉 — 확신이 높다고 한 종목에 자산의 30% 이상 집중하는 것은 피하세요.')

  // ── 행동 편향 ──
  let behavioralBias: string
  if (anx >= 0.65) {
    behavioralBias = '손실 회피 편향(loss aversion) 주의: 같은 금액의 손실이 이익보다 훨씬 크게 느껴져 시장 하락 시 저점 매도를 반복할 위험이 있습니다. 대처법: 자동 적립으로 매도 결정 상황을 최소화하고, 하락 시 "매도 이유"를 최소 3가지 이상 쓰지 못하면 행동하지 않는 규칙을 만드세요.'
  } else if (bol >= 0.7) {
    behavioralBias = '과신 편향(overconfidence bias) 주의: 자신의 분석과 직관을 과대평가해 포트폴리오 집중도를 높이거나 잦은 매매를 하는 경향이 있습니다. 대처법: 투자 결정 전 "내가 틀렸을 때의 시나리오"를 먼저 작성하고, 연간 매매 횟수를 사전에 제한하세요.'
  } else if (cur >= 0.7) {
    behavioralBias = '참신성 편향(novelty bias) 주의: 새로운 테마·기술·트렌드 투자에 끌려 포트폴리오가 분산되거나 불안정해질 수 있습니다. 대처법: "핵심 80% + 탐색 20%" 원칙으로 새로운 투자 아이디어는 전체의 20% 이내로 제한하세요.'
  } else if (pat >= 0.7) {
    behavioralBias = '군중 추종 편향(herding bias) 주의: 공감 능력이 높아 주변 사람들의 투자 이야기에 영향을 받기 쉽습니다. 대처법: 투자 결정 전 "만약 이 정보를 혼자 발견했어도 같은 결정을 했을까?"를 자문하세요.'
  } else {
    behavioralBias = '현상 유지 편향(status quo bias) 주의: 익숙한 자산 구성을 변경하지 않아 리밸런싱을 미루는 경향이 있습니다. 대처법: 연 1~2회 정해진 날짜에 자동으로 리밸런싱을 실행하는 규칙을 미리 설정하세요.'
  }

  // ── 핵심 원칙 ──
  const principles: string[] = []
  if (dil >= 0.6) principles.push('꾸준한 자동 적립이 가장 강력한 무기입니다. 복리는 시간과 일관성이 만들어냅니다.')
  if (hum >= 0.6) principles.push('시장을 이기려 하지 않아도 됩니다. 시장 평균을 일관되게 획득하는 것이 대다수보다 좋은 결과입니다.')
  if (anx >= 0.6) principles.push('투자 결정이 불안할 때는 하지 않는 것이 최선일 수 있습니다. "이해하지 못하는 것에 투자하지 않는다"는 원칙을 지키세요.')
  if (cur >= 0.65) principles.push('지식은 최고의 리스크 관리 도구입니다. 투자 전 충분히 이해하고, 설명할 수 없으면 투자하지 마세요.')
  if (principles.length === 0) principles.push('분산, 일관성, 저비용. 이 세 가지가 장기 투자 성과를 결정하는 핵심 요소입니다.')
  const principle = principles[0]

  return {
    riskLabel,
    riskColor,
    riskRationale,
    horizon,
    style,
    suitable: suitable.slice(0, 4),
    avoid: avoid.slice(0, 3),
    behavioralBias,
    principle,
  }
}

// ══════════════════════════════════════════════════════════════
// 기본 분석 — 성격 강점 TOP 5 (VIA 기반)
// ══════════════════════════════════════════════════════════════

export interface CharacterStrength {
  name: string
  icon: string
  desc: string
  howItShows: string
}

export function computeCharacterStrengths(facets: FacetMap, cogScore: number): CharacterStrength[] {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  const pool: (CharacterStrength & { score: number })[] = [
    {
      name: '지적 호기심', icon: '🔭', score: cur * 0.7 + cogScore * 0.3,
      desc: '새로운 아이디어와 분야를 탐구하는 것에서 깊은 즐거움을 찾는 강점입니다.',
      howItShows: '모르는 것을 만나면 불편하기보다 끌립니다. 대화에서 "왜?"를 자주 묻고, 분야를 넘나드는 연결에서 통찰을 만들어냅니다.',
    },
    {
      name: '성실함·완수력', icon: '🎯', score: dil * 0.8 + (1 - anx) * 0.2,
      desc: '시작한 일을 끝까지 완수하는 능력. 약속과 책임을 중요하게 여기며 신뢰를 쌓습니다.',
      howItShows: '마감을 지키고, 스스로 정한 기준을 포기하지 않습니다. 팀에서 "이 사람은 맡기면 된다"는 신뢰의 기반이 됩니다.',
    },
    {
      name: '사회적 용기', icon: '🦁', score: bol * 0.75 + (1 - anx) * 0.25,
      desc: '낯선 상황과 사람 앞에서도 자신을 표현할 수 있는 대담함입니다.',
      howItShows: '새로운 모임에서 먼저 대화를 시작하고, 불편한 진실을 말해야 할 때 회피하지 않습니다.',
    },
    {
      name: '진정성·정직함', icon: '💎', score: hum * 0.85 + pat * 0.15,
      desc: '자신을 과장하거나 타인을 이용하지 않는 근본적 정직함입니다.',
      howItShows: '이득을 위한 아첨보다 불편한 진실을 선택합니다. 장기적으로 가장 깊은 신뢰를 만드는 강점입니다.',
    },
    {
      name: '공감·돌봄', icon: '🌿', score: pat * 0.6 + anx * 0.4,
      desc: '타인의 감정과 필요를 민감하게 읽고 진심으로 돕는 능력입니다.',
      howItShows: '상대방이 말하지 않아도 힘든 것을 알아차립니다. 관계에서 안정감을 주는 존재로 기억됩니다.',
    },
    {
      name: '분석적 사고', icon: '🧠', score: cogScore * 0.7 + cur * 0.3,
      desc: '복잡한 문제를 구조화하고 핵심을 빠르게 파악하는 능력입니다.',
      howItShows: '다른 사람이 놓치는 패턴을 발견합니다. 복잡한 상황을 단순하게 설명하는 데 탁월합니다.',
    },
    {
      name: '겸손한 자기인식', icon: '🌱', score: hum * 0.7 + (1 - bol) * 0.3,
      desc: '자신의 강점과 한계를 현실적으로 인식하고 배움에 열려 있는 자세입니다.',
      howItShows: '자신이 틀렸을 때 인정할 수 있습니다. 피드백을 방어 없이 받아들이며 빠르게 성장합니다.',
    },
    {
      name: '지속성·인내', icon: '⛰️', score: dil * 0.5 + (1 - anx) * 0.3 + pat * 0.2,
      desc: '즉각적인 성과가 없어도 목표를 향해 꾸준히 나아가는 능력입니다.',
      howItShows: '성과가 더디게 나타나는 장기 프로젝트에서 빛납니다. "포기하지 않는 사람"이라는 평가를 받습니다.',
    },
    {
      name: '창의적 발상', icon: '✨', score: cur * 0.7 + bol * 0.3,
      desc: '기존의 틀을 벗어나 새로운 연결과 아이디어를 만들어내는 능력입니다.',
      howItShows: '브레인스토밍에서 예상치 못한 각도를 제시합니다. 다른 분야의 개념을 가져와 문제를 새롭게 봅니다.',
    },
    {
      name: '조화 조율', icon: '🤝', score: pat * 0.6 + hum * 0.2 + (1 - bol) * 0.2,
      desc: '다양한 의견을 통합하고 갈등을 건설적으로 해결하는 능력입니다.',
      howItShows: '의견 충돌이 생겨도 모두가 이길 수 있는 방향을 찾습니다. 팀의 심리적 안전감을 높이는 역할을 합니다.',
    },
  ]

  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(({ score: _s, ...rest }) => rest)
}

// ══════════════════════════════════════════════════════════════
// 심층 분석 — 애착 유형
// ══════════════════════════════════════════════════════════════

export type DeepAnswers = Record<string, string | number>

export interface AttachmentProfile {
  style: '안정형' | '불안형' | '회피형' | '혼란형'
  color: string
  summary: string
  strengths: string[]
  watchouts: string[]
  growthTip: string
}

export function computeAttachmentStyle(facets: FacetMap, deepAnswers?: DeepAnswers): AttachmentProfile {
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')
  const bol = get(facets, 'boldness')

  // 딥 답변에서 애착 점수 추출 (있을 경우 우선)
  let anxScore: number
  let avoScore: number

  if (deepAnswers) {
    // 딥 페이지에서 facet별 평균(역문항 처리 후) 값을 0~1로 저장
    anxScore = typeof deepAnswers['attachment_anxiety'] === 'number' ? deepAnswers['attachment_anxiety'] as number : 0.5
    avoScore = typeof deepAnswers['attachment_avoidance'] === 'number' ? deepAnswers['attachment_avoidance'] as number : 0.5
  } else {
    // 패싯으로 추정: 높은 불안 → 불안형, 낮은 대담성+낮은 인내 → 회피형
    anxScore = anx * 0.7 + (1 - pat) * 0.3
    avoScore = (1 - bol) * 0.5 + (1 - pat) * 0.5
  }

  const isAnxious = anxScore > 0.55
  const isAvoidant = avoScore > 0.55

  if (isAnxious && isAvoidant) {
    return {
      style: '혼란형',
      color: '#f59e0b',
      summary: '친밀감을 원하지만 동시에 두려워하는 복합적 패턴입니다. 과거의 관계 경험이 "가까워지면 상처받는다"는 믿음을 형성했을 수 있습니다.',
      strengths: ['타인의 감정에 매우 민감하게 반응하는 공감력', '관계의 복잡성을 깊이 이해하는 통찰'],
      watchouts: ['친밀해지면 거리를 두는 접근-회피 패턴', '자신의 감정 반응이 과거 경험에서 비롯된 것인지 현재에서 비롯된 것인지 구분하기 어려움'],
      growthTip: '신뢰할 수 있는 사람 한 명과 작은 취약함을 조금씩 나눠보는 연습이 도움이 됩니다. 즉각적인 깊은 친밀감보다 점진적 신뢰 구축이 핵심입니다.',
    }
  } else if (isAnxious) {
    return {
      style: '불안형',
      color: '#f472b6',
      summary: '친밀감을 강하게 원하지만 관계가 충분히 안정적인지 자주 확인하고 싶어집니다. "나를 충분히 아끼는가"에 대한 민감도가 높습니다.',
      strengths: ['관계에 깊이 헌신하는 능력', '파트너의 감정 변화를 빠르게 감지하는 민감함'],
      watchouts: ['안심을 얻기 위한 지나친 확인 행동', '거절에 대한 과도한 두려움이 자기표현을 억제함'],
      growthTip: '자신을 안심시키는 내적 대화를 연습하세요. "상대방의 행동이 나를 향한 거부가 아닐 수 있다"는 해석의 폭을 넓히는 것이 시작입니다.',
    }
  } else if (isAvoidant) {
    return {
      style: '회피형',
      color: '#60a5fa',
      summary: '독립성을 중요하게 여기며, 감정적으로 깊이 기대거나 의존하는 것이 불편하게 느껴집니다. 친밀해질수록 거리를 두고 싶은 경향이 생길 수 있습니다.',
      strengths: ['감정 소용돌이에서 비교적 안정적인 자기 조절', '독립적으로 문제를 해결하는 능력'],
      watchouts: ['감정적 필요를 숨기다 장기적으로 관계가 단절될 위험', '친밀감에 대한 파트너의 욕구를 "부담"으로 해석하는 경향'],
      growthTip: '취약함을 드러내는 것이 약함이 아니라 신뢰의 표현임을 연습해보세요. 작은 감정 표현부터 시작하면 관계의 깊이가 달라집니다.',
    }
  } else {
    return {
      style: '안정형',
      color: '#34d399',
      summary: '관계에서 대체로 안정감을 느끼며, 친밀함과 독립성 사이의 균형을 자연스럽게 유지합니다. 갈등이 생겨도 관계가 끝날 것이라는 불안보다는 해결 가능하다는 신뢰가 있습니다.',
      strengths: ['관계에서 자신의 욕구와 한계를 솔직하게 표현하는 능력', '파트너에게 일관적인 안정감을 제공하는 존재'],
      watchouts: ['안정형도 스트레스가 극도로 높을 때는 일시적으로 불안·회피 반응이 나타날 수 있음'],
      growthTip: '당신의 안정적 애착은 관계에서 큰 자산입니다. 이 안정감을 불안형·회피형 파트너에게 어떻게 전달할지 이해하면 관계의 폭이 넓어집니다.',
    }
  }
}

// ══════════════════════════════════════════════════════════════
// 심층 분석 — 리더십 스타일
// ══════════════════════════════════════════════════════════════

export interface LeadershipProfile {
  style: string
  icon: string
  summary: string
  strengths: string[]
  blindspots: string[]
  bestEnvironment: string
  growthEdge: string
}

export function computeLeadershipStyle(facets: FacetMap, cogScore: number, deepAnswers?: DeepAnswers): LeadershipProfile {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  const role = deepAnswers?.leadership_role as string | undefined
  const env = deepAnswers?.motivation_env as string | undefined

  // 딥 답변이 있으면 우선 반영, 없으면 패싯으로 추정
  const isDirective = role === 'directive' || (!role && bol >= 0.65 && pat < 0.5)
  const isCoach = role === 'coach' || (!role && pat >= 0.65 && hum >= 0.58)
  const isFacilitator = role === 'facilitator' || (!role && pat >= 0.58 && bol >= 0.45 && bol < 0.65)
  const isExpert = role === 'executor' || (!role && dil >= 0.65 && cogScore >= 0.6 && bol < 0.5)

  if (isDirective) {
    return {
      style: '비전 제시형', icon: '🚀',
      summary: '방향을 명확하게 제시하고 결단력 있게 이끄는 스타일입니다. 불확실한 상황에서 빠르게 판단하고 팀을 하나의 목표로 정렬하는 데 강점이 있습니다.',
      strengths: ['불확실한 상황에서의 빠른 방향 설정', '팀에 명확한 목표와 우선순위 제공', '결단력 있는 실행'],
      blindspots: ['빠른 판단이 팀원의 의견을 충분히 수렴하지 못할 위험', '구성원의 감정적 필요를 간과할 수 있음'],
      bestEnvironment: '빠른 의사결정이 필요한 스타트업, 위기 상황, 명확한 목표가 있는 프로젝트',
      growthEdge: '결정을 내리기 전 팀원에게 의견을 묻는 습관을 의식적으로 만드세요. 더 나은 결정이 나올 뿐 아니라 팀의 헌신도가 높아집니다.',
    }
  } else if (isCoach) {
    return {
      style: '코치형', icon: '🌱',
      summary: '팀원 각자의 강점을 발견하고 성장을 이끄는 스타일입니다. 답을 주는 것보다 질문을 통해 스스로 답을 찾도록 돕는 데 탁월합니다.',
      strengths: ['팀원의 잠재력과 성장 욕구를 빠르게 파악하는 능력', '심리적 안전감을 만드는 소통 방식', '장기적 신뢰 관계 형성'],
      blindspots: ['즉각적인 실행이 필요한 상황에서 코칭 방식이 느릴 수 있음', '팀원이 스스로 답을 찾을 준비가 안 되어 있을 때 답답함 유발'],
      bestEnvironment: '인재 육성이 중요한 조직, 구성원의 자율성과 성장이 핵심인 환경',
      growthEdge: '때로는 직접 방향을 제시하는 속도가 더 효과적입니다. "지금 이 상황은 코칭보다 명확한 지시가 필요한가?" 를 구분하는 감각을 기르세요.',
    }
  } else if (isExpert) {
    return {
      style: '전문가형', icon: '🔬',
      summary: '깊은 전문성과 높은 기준으로 팀의 품질을 끌어올리는 스타일입니다. 실행의 정확성과 체계적 접근을 중요하게 여기며, 전문 지식으로 팀의 신뢰를 얻습니다.',
      strengths: ['높은 전문성을 바탕으로 한 신뢰', '세부 사항까지 놓치지 않는 꼼꼼함', '체계적이고 재현 가능한 프로세스 구축'],
      blindspots: ['전문성에 집중하다 큰 그림을 놓칠 수 있음', '기준이 높아 팀원에게 무거운 부담을 줄 위험'],
      bestEnvironment: '정밀성과 전문성이 요구되는 기술·연구·품질 중심 환경',
      growthEdge: '전문성을 팀원에게 전달하는 방식을 개발하세요. 혼자 잘하는 것보다 팀 전체의 수준을 높이는 것이 리더로서의 다음 단계입니다.',
    }
  } else {
    return {
      style: '조율형', icon: '🤝',
      summary: '다양한 의견을 통합하고 모두가 한 방향으로 나아갈 수 있도록 조율하는 스타일입니다. 갈등 상황에서 절충점을 찾고 팀의 심리적 안전감을 높이는 데 탁월합니다.',
      strengths: ['서로 다른 관점을 통합하는 능력', '팀의 분위기와 에너지를 읽는 감각', '갈등을 건설적으로 해결하는 능력'],
      blindspots: ['의견 충돌이 길어질 때 결단을 내리지 못할 위험', '모두를 만족시키려다 핵심 목표를 놓칠 수 있음'],
      bestEnvironment: '다양한 이해관계자가 있는 프로젝트, 협력과 합의가 중요한 조직',
      growthEdge: '조율과 공감은 강점이지만, 때로는 불편하더라도 명확한 결정을 내려야 할 순간을 놓치지 마세요. "불편한 결정"을 내리는 근육을 키우세요.',
    }
  }
}

// ══════════════════════════════════════════════════════════════
// 심층 분석 — 번아웃 리스크
// ══════════════════════════════════════════════════════════════

export interface BurnoutProfile {
  level: '낮음' | '보통' | '주의' | '높음'
  color: string
  score: number  // 0~100
  summary: string
  riskFactors: string[]
  protectiveFactors: string[]
  prevention: string[]
}

export function computeBurnoutRisk(facets: FacetMap, life: Record<string, string>, deepAnswers?: DeepAnswers): BurnoutProfile {
  const dil = get(facets, 'diligence')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')

  // 딥 답변에서 번아웃 지표 추출
  let deepScore = 0
  if (deepAnswers) {
    const d = (k: string) => {
      const v = deepAnswers[k]
      return typeof v === 'number' ? n(v) : 0.5
    }
    deepScore = (d('burnout_detachment') + d('burnout_meaning') + d('burnout_exhaustion') + d('burnout_recovery')) / 4
  }

  // 패싯 기반 위험 요인 점수
  const perfectionistRisk = dil * 0.4 + anx * 0.4 + hum * 0.2  // 완벽주의 패턴
  const interpersonalRisk = (1 - pat) * 0.5 + bol * 0.2 + anx * 0.3  // 대인갈등 소진
  const recoveryPenalty = life?.recovery_speed === 'very_slow' ? 0.2 : life?.recovery_speed === 'slow' ? 0.1 : 0

  const facetScore = perfectionistRisk * 0.5 + interpersonalRisk * 0.3 + recoveryPenalty
  const totalScore = deepAnswers
    ? deepScore * 0.6 + facetScore * 0.4
    : facetScore

  const pct = Math.round(totalScore * 100)

  const riskFactors: string[] = []
  if (dil >= 0.65 && anx >= 0.55) riskFactors.push('높은 기준+불안 조합 — 완벽하지 않으면 쉬지 못하는 패턴')
  if (life?.recovery_speed === 'very_slow' || life?.recovery_speed === 'slow') riskFactors.push('느린 스트레스 회복 속도 — 소진이 축적되기 쉬움')
  if (deepAnswers?.burnout_meaning && Number(deepAnswers.burnout_meaning) >= 4) riskFactors.push('업무에서의 의미 감소 — 동기 저하의 핵심 신호')
  if (deepAnswers?.burnout_detachment && Number(deepAnswers.burnout_detachment) >= 4) riskFactors.push('퇴근 후 분리 어려움 — 심리적 경계 약화')
  if (riskFactors.length === 0) riskFactors.push('현재 주요 번아웃 위험 요인이 감지되지 않음')

  const protectiveFactors: string[] = []
  if (dil < 0.5) protectiveFactors.push('완벽주의 성향이 낮아 "충분히 좋은 것"에 만족하는 경향')
  if (anx < 0.45) protectiveFactors.push('정서적 안정성이 스트레스 축적을 완화')
  if (pat >= 0.6) protectiveFactors.push('타인과의 관계에서 에너지를 얻는 공감력')
  if (life?.recovery_speed === 'fast' || life?.recovery_speed === 'medium') protectiveFactors.push('빠른 스트레스 회복 속도')
  if (protectiveFactors.length === 0) protectiveFactors.push('현재 보호 요인을 강화하는 생활 습관 구축을 권장합니다')

  const prevention = [
    pct >= 60 ? '주 1회 이상 의도적인 "완전 오프" 시간 확보 — 디지털 기기 차단 포함' : '현재 에너지 수준을 유지하는 루틴을 명시적으로 기록하고 지킵니다',
    dil >= 0.65 ? '"충분히 좋은" 기준을 의식적으로 설정하세요. 완벽과 완수 사이의 균형이 지속 가능성을 만듭니다' : '도전적인 목표를 설정할 때 에너지 예산도 함께 계획하세요',
    anx >= 0.6 ? '신체 활동(운동)은 당신의 번아웃 예방에 가장 검증된 방법입니다. 주 3회 이상을 목표로 하세요' : '스트레스가 누적될 때 혼자 해결하려 하지 말고 신뢰하는 사람에게 털어놓는 습관을 만드세요',
  ]

  const level: BurnoutProfile['level'] =
    pct >= 65 ? '높음' : pct >= 45 ? '주의' : pct >= 25 ? '보통' : '낮음'
  const color = level === '높음' ? '#f87171' : level === '주의' ? '#f59e0b' : level === '보통' ? '#60a5fa' : '#34d399'

  const summaryMap: Record<string, string> = {
    '높음': '현재 번아웃의 주요 신호가 감지됩니다. 즉각적인 회복 조치와 환경 변화를 진지하게 고려하세요.',
    '주의': '아직 번아웃 수준은 아니지만, 몇 가지 위험 신호가 있습니다. 예방적 조치를 지금 시작하는 것이 중요합니다.',
    '보통': '전반적으로 관리 가능한 수준입니다. 보호 요인을 의식적으로 강화하면 더 지속 가능해집니다.',
    '낮음': '번아웃 리스크가 낮습니다. 현재 에너지 관리 방식이 효과적으로 작동하고 있습니다.',
  }

  return { level, color, score: pct, summary: summaryMap[level], riskFactors, protectiveFactors, prevention }
}

// ══════════════════════════════════════════════════════════════
// 심층 분석 — 핵심 가치관 프로파일
// ══════════════════════════════════════════════════════════════

export interface ValuesProfile {
  primary: string
  secondary: string
  icon: string
  summary: string
  inCareer: string
  inRelationships: string
  tension: string
}

export function computeValuesProfile(facets: FacetMap, deepAnswers?: DeepAnswers): ValuesProfile {
  const cur = get(facets, 'curiosity')
  const hum = get(facets, 'humility')
  const pat = get(facets, 'patience')
  const bol = get(facets, 'boldness')
  const dil = get(facets, 'diligence')

  // 딥 답변에서 가치 추출
  const workVal = deepAnswers?.value_work as string | undefined
  const lifeVal = deepAnswers?.value_life as string | undefined
  const growthVal = deepAnswers?.value_growth as string | undefined

  // 주요 가치 결정 (딥 답변 우선, 없으면 패싯 추정)
  const primary = workVal ?? (
    cur >= 0.65 ? 'growth' :
    dil >= 0.65 ? 'meaning' :
    bol >= 0.65 ? 'achievement' :
    hum >= 0.65 ? 'meaning' :
    pat >= 0.65 ? 'relationships' : 'autonomy'
  )

  const secondary = growthVal ?? lifeVal ?? (
    primary === 'growth' ? 'autonomy' :
    primary === 'meaning' ? 'growth' :
    primary === 'achievement' ? 'security' : 'meaning'
  )

  const valuesMeta: Record<string, { label: string; icon: string; career: string; rel: string }> = {
    security:      { label: '안정·보호', icon: '🏛️', career: '예측 가능한 수입과 고용 안정성을 중시합니다. 변동성보다 지속성에 가치를 둡니다.', rel: '관계에서도 안정성과 신뢰를 가장 중요하게 여깁니다. 갑작스러운 변화보다 일관성 있는 관계를 선호합니다.' },
    meaning:       { label: '의미·목적', icon: '🌟', career: '"이 일이 왜 중요한가"가 급여보다 먼저입니다. 의미 없는 고수익 일보다 의미 있는 적정 수입을 선택하는 경향이 있습니다.', rel: '깊이 있는 대화와 진정성 있는 연결을 추구합니다. 표면적 관계에서는 쉽게 에너지를 잃습니다.' },
    autonomy:      { label: '자율·독립', icon: '🦅', career: '마이크로매니지먼트가 없는 환경, 내 방식대로 일할 수 있는 자율성을 가장 중요하게 여깁니다.', rel: '관계에서도 서로의 독립성을 존중하는 것이 핵심입니다. 지나친 의존이나 통제는 관계를 지치게 만듭니다.' },
    growth:        { label: '성장·배움', icon: '📈', career: '지금 당장의 연봉보다 배울 수 있는 환경인지를 더 중요하게 봅니다. 정체감이 번아웃의 주요 원인이 될 수 있습니다.', rel: '함께 성장하고 서로를 자극하는 관계를 원합니다. 고여 있다는 느낌이 드는 관계는 어렵게 느껴집니다.' },
    achievement:   { label: '성취·인정', icon: '🏆', career: '결과와 성취가 명확하게 인정받는 환경에서 동기가 높아집니다. 성과 지향적 문화가 잘 맞습니다.', rel: '자신의 성취를 함께 기뻐해주는 관계를 원합니다. 성공을 폄하하거나 질투하는 관계는 힘들게 느껴집니다.' },
    relationships: { label: '관계·소속', icon: '🫂', career: '함께 일하는 사람들이 중요합니다. 아무리 좋은 조건이라도 관계가 나쁜 환경에서는 오래 버티기 어렵습니다.', rel: '관계 자체가 삶의 핵심 의미입니다. 깊고 따뜻한 연결이 삶의 만족도를 결정합니다.' },
    freedom:       { label: '자유·다양성', icon: '🌈', career: '다양한 경험과 유연한 근무 방식을 선호합니다. 단조로운 루틴과 경직된 조직은 에너지를 빠르게 소진시킵니다.', rel: '관계에서도 자유롭고 다양한 만남과 경험을 즐깁니다. 획일적이거나 의무적인 관계 패턴이 부담스럽습니다.' },
    stability:     { label: '안정·일관성', icon: '⚓', career: '예측 가능하고 명확한 역할과 책임이 있는 환경을 선호합니다. 갑작스러운 변화와 불확실성이 스트레스의 주요 원인입니다.', rel: '오랜 시간을 함께하는 깊은 관계를 선호합니다. 넓은 인맥보다 소수의 안정적 관계를 더 가치 있게 봅니다.' },
    career:        { label: '커리어·전문성', icon: '💼', career: '전문성을 쌓고 커리어를 발전시키는 것이 삶의 중요한 축입니다.', rel: '커리어를 함께 지지해주고 이해해주는 관계가 중요합니다.' },
    health:        { label: '건강·활력', icon: '💚', career: '신체적 활력이 삶의 질을 결정합니다. 건강을 희생하는 커리어보다 지속 가능한 삶을 선택합니다.', rel: '건강한 생활 습관을 공유하는 관계에서 에너지를 얻습니다.' },
    finance:       { label: '경제적 자유', icon: '💰', career: '경제적 안정과 자유가 확보될 때 다른 가치들을 추구할 수 있다고 믿습니다.', rel: '경제적 가치관이 비슷한 파트너와의 관계가 장기적으로 안정적입니다.' },
  }

  const pm = valuesMeta[primary] ?? valuesMeta['meaning']
  const sm = valuesMeta[secondary] ?? valuesMeta['growth']

  // 가치 충돌 인사이트
  const tension =
    (primary === 'autonomy' && secondary === 'relationships') ? '"자유"와 "연결" 사이에서 긴장이 생길 수 있습니다. 관계가 자신의 자율성을 침범한다고 느낄 때 어떻게 다룰지 미리 생각해두면 도움이 됩니다.' :
    (primary === 'achievement' && secondary === 'health') ? '"성취"와 "건강" 사이에서 trade-off가 생기기 쉽습니다. 단기 성과를 위해 장기 에너지를 태우지 않도록 의식적인 경계가 필요합니다.' :
    (primary === 'meaning' && secondary === 'security') ? '"의미"를 쫓다 보면 경제적 안정이 불안해지는 딜레마가 생길 수 있습니다. 두 가지를 동시에 충족하는 커리어 경로를 찾는 것이 장기 목표가 될 수 있습니다.' :
    (primary === 'growth' && secondary === 'stability') ? '"성장"에 대한 갈망과 "안정"에 대한 욕구가 때로는 충돌합니다. 새로운 도전을 추구할 때 기반이 되는 안전망을 먼저 확보하는 순서가 중요합니다.' :
    `${pm.label}과 ${sm.label}은 대체로 상호보완적입니다. 두 가지 모두 충족될 때 가장 높은 삶의 만족도를 경험합니다.`

  return {
    primary: pm.label, secondary: sm.label, icon: pm.icon,
    summary: `핵심 가치는 ${pm.label}이며, ${sm.label}이(가) 이를 보완합니다. 이 조합은 삶의 중요한 결정들에서 일관되게 나타납니다.`,
    inCareer: pm.career, inRelationships: pm.rel, tension,
  }
}

// ══════════════════════════════════════════════════════════════
// 심층 분석 — 삶의 균형 분석
// ══════════════════════════════════════════════════════════════

export interface LifeBalanceProfile {
  domains: { name: string; icon: string; score: number; insight: string }[]
  overallBalance: '양호' | '보통' | '불균형'
  priority: string
  recommendation: string
}

export function computeLifeBalance(facets: FacetMap, life: Record<string, string>, deepAnswers?: DeepAnswers): LifeBalanceProfile {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  const satisfied = deepAnswers?.life_satisfied as string | undefined
  const lacking = deepAnswers?.life_lacking as string | undefined

  // 각 영역 점수 추정 — 모든 값은 0~1 범위로 먼저 계산 후 100 곱하기
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v * 100)))
  const workScore    = clamp(dil * 0.6 + cur * 0.4)
  const relScore     = clamp(pat * 0.6 + (1 - anx) * 0.4)
  const healthScore  = clamp((1 - anx) * 0.5 + (life?.recovery_speed === 'fast' ? 0.8 : life?.recovery_speed === 'medium' ? 0.65 : 0.4) * 0.5)
  const growthScore  = clamp(cur * 0.7 + dil * 0.3)
  const financeScore = clamp(dil * 0.6 + (1 - anx) * 0.4)

  const domains = [
    { name: '일·커리어', icon: '💼', score: satisfied === 'work' ? Math.min(workScore + 15, 100) : lacking === 'work' ? Math.max(workScore - 20, 20) : workScore, insight: dil >= 0.65 ? '성실성이 높아 일에 많은 에너지를 투자합니다. 번아웃 없이 지속 가능한 속도를 유지하는 것이 핵심입니다.' : cur >= 0.6 ? '의미 있는 일에서 에너지를 얻는 유형입니다. 지금 하는 일의 "왜"가 명확한지 점검해보세요.' : '지금 하는 일과 내가 중요하게 생각하는 것이 얼마나 일치하는지 확인해볼 시점입니다.' },
    { name: '관계·소속', icon: '🫂', score: satisfied === 'relationships' ? Math.min(relScore + 15, 100) : lacking === 'relationships' ? Math.max(relScore - 20, 20) : relScore, insight: pat >= 0.65 ? '관계에서 깊은 공감과 안정감을 주는 능력이 있습니다. 이 강점을 자신을 위해서도 사용하세요.' : '깊은 관계를 원하지만 형성하는 데 시간이 걸리는 유형일 수 있습니다. 한 두 명과의 신뢰를 먼저 쌓는 것이 시작입니다.' },
    { name: '건강·활력', icon: '💚', score: satisfied === 'health' ? Math.min(healthScore + 15, 100) : lacking === 'health' ? Math.max(healthScore - 20, 20) : healthScore, insight: anx >= 0.6 ? '정서적 에너지 소모가 큰 유형입니다. 신체 건강(수면, 운동)이 정서 회복력에 직접 연결됩니다.' : '현재 에너지 수준이 대체로 안정적입니다. 이 수준을 유지하는 루틴을 명시적으로 기록하고 지키세요.' },
    { name: '성장·배움', icon: '📚', score: satisfied === 'growth' ? Math.min(growthScore + 15, 100) : lacking === 'growth' ? Math.max(growthScore - 20, 20) : growthScore, insight: cur >= 0.65 ? '학습 자체에서 에너지를 얻는 강점이 있습니다. 배움을 일과 연결하면 일의 의미도 함께 높아집니다.' : '성장의 방향이 명확해질 때 동기가 높아지는 유형입니다. 지금 배우고 싶은 한 가지를 구체화해보세요.' },
    { name: '경제·안정', icon: '💰', score: lacking === 'finance' ? Math.max(financeScore - 20, 20) : financeScore, insight: dil >= 0.6 ? '체계적인 계획과 실행 능력이 경제적 기반을 쌓는 데 강점이 됩니다.' : '경제적 안정은 다른 영역에서의 자유도를 높입니다. 작은 자동화 저축부터 시작하는 것이 가장 효과적입니다.' },
  ]

  const scores = domains.map(d => d.score)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((a, b) => a + Math.abs(b - avg), 0) / scores.length

  const overallBalance: LifeBalanceProfile['overallBalance'] =
    variance > 25 ? '불균형' : variance > 15 ? '보통' : '양호'

  const lowestDomain = domains.reduce((a, b) => a.score < b.score ? a : b)
  const priority = lowestDomain.name

  const recommendation =
    overallBalance === '불균형'
      ? `삶의 여러 영역 간 편차가 큽니다. 특히 ${priority} 영역이 가장 주의가 필요합니다. 완벽한 균형보다 "가장 부족한 한 영역에 의도적 투자"가 현실적인 시작점입니다.`
      : overallBalance === '보통'
      ? `전반적으로 무난하지만 ${priority} 영역에서 개선 여지가 있습니다. 다른 영역을 해치지 않는 범위에서 이 영역에 작은 투자를 시작해보세요.`
      : '삶의 여러 영역이 대체로 균형을 이루고 있습니다. 이 균형을 유지하면서 특히 중요한 한 영역을 더 깊이 발전시키는 데 집중해도 좋을 시점입니다.'

  return { domains, overallBalance, priority, recommendation }
}

// ─── Holland RIASEC 직업흥미 추정 ─────────────────────────────────────────
// HEXACO 패싯과 Holland 유형의 메타분석 상관관계 기반 추정값
// (Larson et al. 2002, De Fruyt & Mervielde 1997)
// ※ 직접 측정이 아닌 패싯 기반 추정치 — 유료 검사에서 18문항으로 직접 측정

export interface RiasecScore {
  code: string       // 예: 'IC', 'ICA'
  scores: { type: string; label: string; score: number; desc: string; color: string }[]
  topType: string
  topLabel: string
  summary: string
}

export function computeRiasec(facets: FacetMap): RiasecScore {
  const cur = norm(facets.curiosity)
  const dil = norm(facets.diligence)
  const bol = norm(facets.boldness)
  const hum = norm(facets.humility)
  const anx = norm(facets.anxiety)
  const pat = norm(facets.patience)

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

  // 6개 유형별 가중합 (0~1 범위)
  const raw = {
    R: clamp01(dil * 0.40 + (1 - cur) * 0.35 + (1 - bol) * 0.25),
    I: clamp01(cur * 0.50 + dil * 0.30 + (1 - bol) * 0.20),
    A: clamp01(cur * 0.40 + anx * 0.30 + (1 - dil) * 0.30),
    S: clamp01(pat * 0.40 + bol * 0.30 + hum * 0.30),
    E: clamp01(bol * 0.40 + (1 - pat) * 0.25 + (1 - hum) * 0.35),
    C: clamp01(dil * 0.45 + (1 - cur) * 0.35 + (1 - bol) * 0.20),
  }

  // 0~100 정수 변환 후 min/max 정규화로 변별력 확보
  const entries = Object.entries(raw) as [string, number][]
  const vals = entries.map(e => e[1])
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const range = maxV - minV || 0.01

  const scaled: Record<string, number> = {}
  for (const [k, v] of entries) {
    // 30~95 범위로 stretch — 극단값 방지
    scaled[k] = Math.round(30 + ((v - minV) / range) * 65)
  }

  const META: Record<string, { label: string; desc: string; color: string }> = {
    R: { label: '현실형', color: '#6b7280',
         desc: '도구·기계·자연 등 구체적 대상을 다루는 실용 활동을 선호합니다.' },
    I: { label: '탐구형', color: '#6366f1',
         desc: '데이터와 아이디어를 분석하며 지적 문제를 해결하는 데 끌립니다.' },
    A: { label: '예술형', color: '#ec4899',
         desc: '창의적 표현과 비정형적인 방식으로 아이디어를 구현하는 것을 즐깁니다.' },
    S: { label: '사회형', color: '#10b981',
         desc: '사람을 돕고 가르치고 돌보는 활동에서 의미를 찾습니다.' },
    E: { label: '진취형', color: '#f59e0b',
         desc: '설득하고 이끌며 목표를 달성하는 역동적 환경을 선호합니다.' },
    C: { label: '관습형', color: '#38bdf8',
         desc: '데이터 정리, 절차 준수, 체계적 업무에서 안정감을 느낍니다.' },
  }

  const scores = Object.entries(scaled)
    .map(([type, score]) => ({ type, score, ...META[type] }))
    .sort((a, b) => b.score - a.score)

  const top2 = scores.slice(0, 2)
  const code = top2.map(s => s.type).join('')
  const topType = scores[0].type
  const topLabel = scores[0].label

  const SUMMARY: Record<string, string> = {
    I:  '지적 탐구와 분석을 즐기는 탐구형이 가장 강합니다. 데이터·과학·연구 환경에서 높은 만족도를 보입니다.',
    A:  '창의적 표현과 독창성에 끌리는 예술형이 두드러집니다. 정답이 없는 개방적 환경에서 더 잘 작동합니다.',
    S:  '사람과의 연결과 돕는 행위에서 에너지를 얻는 사회형입니다. 교육·상담·협업 중심 환경이 잘 맞습니다.',
    E:  '목표 지향적이고 주도적인 진취형입니다. 설득과 리드가 핵심인 환경에서 강점을 발휘합니다.',
    C:  '체계와 정확성을 중시하는 관습형입니다. 명확한 절차와 데이터 기반 업무에서 안정감을 느낍니다.',
    R:  '구체적이고 실용적인 현실형입니다. 손으로 만들거나 직접 적용하는 환경에서 만족도가 높습니다.',
  }

  return {
    code,
    scores,
    topType,
    topLabel,
    summary: SUMMARY[topType] ?? '',
  }
}
