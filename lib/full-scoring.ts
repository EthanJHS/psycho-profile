import { Answer } from '@/types'
import { SAMPLE_QUESTIONS } from './questions'
import { FULL_QUESTIONS } from './full-questions'
import { FacetMap, buildLayeredResult } from './profiles'

// ProfileDef stub for backward compat
export type ProfileDef = ReturnType<typeof buildLayeredResult>

function matchProfileFromFacets(fm: FacetMap, _cogScore: number): ProfileDef {
  const n = (v: number) => (v - 1) / 4
  const O = n(fm.curiosity), C = n(fm.diligence), E = n(fm.boldness)
  const A = n(fm.patience), _N = n(fm.anxiety), H = n(fm.humility)

  // 간단한 규칙으로 원형/모드/동력 결정
  const archetype = O > 0.6 && C > 0.6 ? 'architect'
    : O > 0.6 && E > 0.6 ? 'catalyst'
    : C > 0.6 && E > 0.6 ? 'warrior'
    : A > 0.6 && H > 0.6 ? 'sage'
    : A > 0.6 ? 'harmonizer'
    : E > 0.6 ? 'sovereign'
    : O > 0.6 ? 'explorer'
    : 'guardian' as const

  const mode = C > 0.6 ? 'analytical' : O > 0.6 ? 'intuitive' : E > 0.6 ? 'pragmatic' : 'integrative' as const
  const drive = E > 0.6 ? 'achievement' : A > 0.6 ? 'connection' : O > 0.6 ? 'autonomy' : 'security' as const

  return buildLayeredResult(archetype, mode, drive, fm as unknown as Record<string, number>, _cogScore)
}

export const ALL_QUESTIONS = [...SAMPLE_QUESTIONS, ...FULL_QUESTIONS]

export interface FullScoringOutput {
  result: FullTestResult
  facets: Record<string, number>
  cogScore: number
  cogBreakdown: CogBreakdown
  tciScores: TCIScores
  motScores: MotScores
  strScores: StrScores
  life: Record<string, string>
  profile: ProfileDef
}

export interface CogBreakdown {
  fluid: number     // 유동 추론
  verbal: number    // 언어 이해
  memory: number    // 작업 기억
  spatial: number   // 공간 추론
  total: number
  level: 'high' | 'mid_high' | 'mid' | 'mid_low' | 'low'
  label: string
}

export interface TCIScores {
  NS: number          // Novelty Seeking 전체
  NS_exploratory: number
  NS_impulsivity: number
  NS_rule_avoidance: number
  HA: number          // Harm Avoidance 전체
  HA_anticipatory: number
  HA_uncertainty: number
  RD: number          // Reward Dependence 전체
  RD_warmth: number
  RD_social_sensitivity: number
  P: number           // Persistence
  P_persistence: number
}

export interface MotScores {
  intrinsic: number
  competitive: number
  mastery: number
  motivation_type: 'intrinsic' | 'extrinsic' | 'mixed'
  competition_style: 'collaborative' | 'competitive' | 'mixed'
  goal_orientation: 'mastery' | 'performance' | 'mixed'
}

export interface StrScores {
  response: string
  recovery: string
  trigger: string
  coping: string
}

export interface FullTestResult {
  profileId: string
  profileLabel: string
  shortDesc: string
  dominantTraits: string[]
  // 성격 상세
  hexacoSummary: HexacoSummary
  // 인지
  cognitiveStyle: string
  cogBreakdown: CogBreakdown
  // 진로
  careers: { title: string; fit: number; reason: string; detail?: string; growthNote?: string; subRoles?: string[] }[]
  // 학습
  studyMethods: string[]
  studyEnvironment: string
  studySchedule: string
  // 경고
  warnings: string[]
  // 생활
  lifestyle: string
  weeklyRoutine: string[]
  sleepRecommendation: string
  exerciseRecommendation: string
  // 관계
  relationshipStyle: string
  relationshipStrengths: string[]
  relationshipChallenges: string[]
  // 성장
  growthDirection: string
  growthPriorities: string[]
  // 스트레스
  stressProfile: string
  stressTrigger: string
  stressCoping: string
  // 동기
  motivationProfile: string
  // TCI 기질
  temperamentProfile: string
}

export interface HexacoSummary {
  H: { score: number; label: string; highlight: string }
  E: { score: number; label: string; highlight: string }
  X: { score: number; label: string; highlight: string }
  A: { score: number; label: string; highlight: string }
  C: { score: number; label: string; highlight: string }
  O: { score: number; label: string; highlight: string }
}

export function scoreFullAnswers(answers: Answer[]): FullScoringOutput {
  const facetRaw: Record<string, number[]> = {}
  const cogResults: Record<string, { correct: boolean; facet: string }> = {}
  const lifeAnswers: Record<string, string> = {}

  const allQ = ALL_QUESTIONS
  for (const answer of answers) {
    const q = allQ.find(q => q.id === answer.questionId)
    if (!q) continue

    if (q.domain === 'COG') {
      cogResults[q.id] = { correct: answer.value === q.correctAnswer, facet: q.facet }
    } else if (q.domain === 'LIFE' || q.domain === 'STR') {
      lifeAnswers[q.facet] = answer.value as string
    } else {
      let score = answer.value as number
      if (q.reverse) score = 6 - score
      if (!facetRaw[q.facet]) facetRaw[q.facet] = []
      facetRaw[q.facet].push(score)
    }
  }

  // 패싯 평균
  const facets: Record<string, number> = {}
  for (const [k, vals] of Object.entries(facetRaw)) {
    facets[k] = vals.reduce((a, b) => a + b, 0) / vals.length
  }

  // 인지 세분화
  const cogBreakdown = computeCogBreakdown(cogResults)

  // TCI 점수
  const tciScores = computeTCI(facets)

  // 동기 점수
  const motScores = computeMotivation(facets)

  // 스트레스 점수
  const strScores: StrScores = {
    response: lifeAnswers['stress_response'] ?? 'unknown',
    recovery: lifeAnswers['stress_recovery'] ?? 'unknown',
    trigger: lifeAnswers['stress_trigger'] ?? 'unknown',
    coping: lifeAnswers['stress_coping'] ?? 'unknown',
  }

  // 프로파일 매칭
  const facetMap: FacetMap = {
    diligence: facets['diligence'] ?? 3,
    curiosity: facets['curiosity'] ?? 3,
    anxiety: facets['anxiety'] ?? 3,
    boldness: facets['boldness'] ?? 3,
    humility: facets['humility'] ?? 3,
    patience: facets['patience'] ?? 3,
  }
  const profile = matchProfileFromFacets(facetMap, cogBreakdown.total)
  const baseResult = profile

  const result = buildFullResult(
    baseResult, facets, cogBreakdown, tciScores, motScores, strScores, lifeAnswers
  )

  return { result, facets, cogScore: cogBreakdown.total, cogBreakdown, tciScores, motScores, strScores, life: lifeAnswers, profile }
}

// ── 인지 세분화 ──────────────────────────────────────────────────
function computeCogBreakdown(
  results: Record<string, { correct: boolean; facet: string }>
): CogBreakdown {
  const byFacet: Record<string, { correct: number; total: number }> = {}
  for (const { correct, facet } of Object.values(results)) {
    if (!byFacet[facet]) byFacet[facet] = { correct: 0, total: 0 }
    byFacet[facet].total++
    if (correct) byFacet[facet].correct++
  }
  const score = (f: string) => byFacet[f]
    ? byFacet[f].correct / byFacet[f].total
    : 0.5

  const fluid = score('fluid')
  const verbal = score('verbal')
  const memory = score('memory')
  const spatial = score('spatial')
  const total = (fluid * 0.4 + verbal * 0.3 + memory * 0.2 + spatial * 0.1)

  const level = total >= 0.8 ? 'high'
    : total >= 0.65 ? 'mid_high'
    : total >= 0.5 ? 'mid'
    : total >= 0.35 ? 'mid_low'
    : 'low'

  const levelLabel: Record<string, string> = {
    high: '상위권 (상위 ~15%)',
    mid_high: '평균 이상 (상위 ~35%)',
    mid: '평균',
    mid_low: '평균 이하',
    low: '하위권',
  }

  return { fluid, verbal, memory, spatial, total, level, label: levelLabel[level] }
}

// ── TCI 점수 ─────────────────────────────────────────────────────
function computeTCI(f: Record<string, number>): TCIScores {
  const ns_exp = f['NS_exploratory'] ?? 3
  const ns_imp = f['NS_impulsivity'] ?? 3
  const ns_rule = f['NS_rule_avoidance'] ?? 3
  const NS = avg3(ns_exp, ns_imp, ns_rule)

  const ha_ant = f['HA_anticipatory'] ?? 3
  const ha_unc = f['HA_uncertainty'] ?? 3
  const HA = avg2(ha_ant, ha_unc)

  const rd_warm = f['RD_warmth'] ?? 3
  const rd_sens = f['RD_social_sensitivity'] ?? 3
  const RD = avg2(rd_warm, rd_sens)

  const p_per = f['P_persistence'] ?? 3
  const P = p_per

  return {
    NS, NS_exploratory: ns_exp, NS_impulsivity: ns_imp, NS_rule_avoidance: ns_rule,
    HA, HA_anticipatory: ha_ant, HA_uncertainty: ha_unc,
    RD, RD_warmth: rd_warm, RD_social_sensitivity: rd_sens,
    P, P_persistence: p_per,
  }
}

// ── 동기 점수 ─────────────────────────────────────────────────────
function computeMotivation(f: Record<string, number>): MotScores {
  const intrinsic = f['intrinsic_motivation'] ?? 3
  const competitive = f['competitive'] ?? 3
  const mastery = f['mastery_orientation'] ?? 3

  return {
    intrinsic, competitive, mastery,
    motivation_type: intrinsic >= 3.8 ? 'intrinsic' : intrinsic <= 2.5 ? 'extrinsic' : 'mixed',
    competition_style: competitive >= 3.8 ? 'competitive' : competitive <= 2.5 ? 'collaborative' : 'mixed',
    goal_orientation: mastery >= 3.8 ? 'mastery' : mastery <= 2.5 ? 'performance' : 'mixed',
  }
}

// ── 풀 결과 생성 ──────────────────────────────────────────────────
function buildFullResult(
  base: ProfileDef,
  facets: Record<string, number>,
  cog: CogBreakdown,
  tci: TCIScores,
  mot: MotScores,
  str: StrScores,
  life: Record<string, string>
): FullTestResult {

  const hexacoSummary = buildHexacoSummary(facets)

  const studyEnv = buildStudyEnvironment(facets, life)
  const studySchedule = buildStudySchedule(life, cog)
  const sleepRec = buildSleepRecommendation(life, facets)
  const exerciseRec = buildExerciseRecommendation(facets, str)
  const motivationProfile = buildMotivationProfile(mot)
  const temperamentProfile = buildTemperamentProfile(tci)
  const stressProfile = buildStressProfile(str, facets)

  const relStrengths = buildRelationshipStrengths(facets, tci)
  const relChallenges = buildRelationshipChallenges(facets, tci)
  const growthPriorities = buildGrowthPriorities(facets, cog, tci, mot)

  return {
    profileId: base.profileId,
    profileLabel: base.profileLabel,
    shortDesc: base.shortDesc ?? '',
    dominantTraits: base.dominantTraits,
    hexacoSummary,
    cognitiveStyle: base.cognitiveStyle,
    cogBreakdown: cog,
    careers: base.careers,
    studyMethods: base.studyMethods,
    studyEnvironment: studyEnv,
    studySchedule,
    warnings: base.warnings,
    lifestyle: base.lifestyle,
    weeklyRoutine: base.weeklyRoutine,
    sleepRecommendation: sleepRec,
    exerciseRecommendation: exerciseRec,
    relationshipStyle: base.relationshipStyle ?? '',
    relationshipStrengths: relStrengths,
    relationshipChallenges: relChallenges,
    growthDirection: base.growthDirection ?? '',
    growthPriorities,
    stressProfile,
    stressTrigger: buildStressTrigger(str),
    stressCoping: buildStressCoping(str),
    motivationProfile,
    temperamentProfile,
  }
}

// ── HEXACO 요약 ───────────────────────────────────────────────────
function buildHexacoSummary(f: Record<string, number>): HexacoSummary {
  const H = avg4(f['humility'], f['sincerity'], f['fairness'], f['greed_avoidance'])
  const E = avg4(f['anxiety'], f['fearfulness'], f['dependence'], f['sentimentality'])
  const X = avg4(f['boldness'], f['social_self_esteem'], f['sociability'], f['liveliness'])
  const A = avg4(f['patience'], f['forgiveness'], f['gentleness'], f['flexibility'])
  const C = avg4(f['diligence'], f['organization'], f['perfectionism'], f['prudence'])
  const O = avg4(f['curiosity'], f['aesthetic'], f['creativity'], f['unconventionality'])

  const label = (s: number) => s >= 4.2 ? '매우 높음' : s >= 3.5 ? '높음' : s >= 2.5 ? '보통' : s >= 1.8 ? '낮음' : '매우 낮음'

  return {
    H: { score: H, label: label(H), highlight: H >= 4 ? '높은 도덕성과 정직성이 신뢰 기반을 형성' : H <= 2.5 ? '실용적 판단과 전략적 사고 우선' : '균형적 도덕 기준' },
    E: { score: E, label: label(E), highlight: E >= 4 ? '감정적 민감성이 높아 공감 능력 탁월, 스트레스 취약' : E <= 2.5 ? '감정적으로 안정적이고 스트레스 내성 강함' : '평균적 감정 조절' },
    X: { score: X, label: label(X), highlight: X >= 4 ? '높은 사회적 에너지, 외부에서 동기 충전' : X <= 2.5 ? '독립적 에너지, 내부에서 동기 충전' : '상황에 따른 유연한 사교성' },
    A: { score: A, label: label(A), highlight: A >= 4 ? '높은 협력 의지와 갈등 회피 성향' : A <= 2.5 ? '직접적이고 경쟁적인 대인관계 방식' : '협력과 주장의 균형' },
    C: { score: C, label: label(C), highlight: C >= 4 ? '높은 자기 통제와 체계적 실행 능력' : C <= 2.5 ? '유연하고 자발적인 생활 방식, 루틴 저항' : '상황적 조직화' },
    O: { score: O, label: label(O), highlight: O >= 4 ? '강한 지적 호기심과 창의적 사고' : O <= 2.5 ? '검증된 방법 선호, 실용적 접근' : '선택적 탐구' },
  }
}

// ── 공부 환경 ─────────────────────────────────────────────────────
function buildStudyEnvironment(f: Record<string, number>, life: Record<string, string>): string {
  const isIntrovert = (f['boldness'] ?? 3) < 3 && (f['sociability'] ?? 3) < 3
  const highAnxiety = (f['anxiety'] ?? 3) >= 3.8
  const highOrg = (f['organization'] ?? 3) >= 3.8

  const parts = []
  parts.push(isIntrovert ? '조용하고 독립적인 공간 (도서관 개인실, 독방)' : '적당한 배경 소음이 있는 공간 (카페, 코워킹)')
  parts.push(highOrg ? '정돈된 책상과 정리된 환경 필수' : '약간의 어수선함은 창의성에 도움')
  parts.push(highAnxiety ? '방해 요소 최소화 — 핸드폰 무음, 알림 차단' : '멀티태스킹 허용 환경도 무방')
  if (life['chronotype'] === 'early_morning' || life['chronotype'] === 'morning') {
    parts.push('오전 집중 환경 구축 우선 (오후 공간은 덜 중요)')
  }
  return parts.join(' / ')
}

// ── 공부 스케줄 ───────────────────────────────────────────────────
function buildStudySchedule(life: Record<string, string>, cog: CogBreakdown): string {
  const time = life['chronotype'] ?? 'morning'
  const timeMap: Record<string, string> = {
    early_morning: '오전 6~9시 핵심 집중 블록',
    morning: '오전 10시~오후 1시 핵심 집중 블록',
    afternoon: '오후 2~6시 핵심 집중 블록',
    evening: '오후 8~11시 핵심 집중 블록',
  }
  const blockTime = timeMap[time] ?? '오전 핵심 집중 블록'
  const blockLen = cog.level === 'high' ? '90분 딥워크 × 2세션' : '45분 집중 × 3~4세션'
  return `${blockTime} / ${blockLen} / 세션 사이 10~15분 완전 휴식 / 하루 총 학습 3~4시간 이상은 수익 체감`
}

// ── 수면 추천 ─────────────────────────────────────────────────────
function buildSleepRecommendation(life: Record<string, string>, f: Record<string, number>): string {
  const chrono = life['chronotype'] ?? 'morning'
  const highAnxiety = (f['anxiety'] ?? 3) >= 3.8

  const bedtimeMap: Record<string, string> = {
    early_morning: '22:00~23:00 취침, 05:30~06:30 기상',
    morning: '23:00~00:00 취침, 07:00~08:00 기상',
    afternoon: '00:00~01:00 취침, 08:00~09:00 기상',
    evening: '01:00~02:00 취침, 09:00~10:00 기상',
  }
  const baseRec = bedtimeMap[chrono] ?? '23:00 취침, 07:00 기상'
  const anxietyNote = highAnxiety ? ' / 취침 1시간 전 스크린 차단, 이완 루틴 필수' : ''
  return `권장 수면 7~8시간 / ${baseRec}${anxietyNote}`
}

// ── 운동 추천 ─────────────────────────────────────────────────────
function buildExerciseRecommendation(f: Record<string, number>, str: StrScores): string {
  const highAnxiety = (f['anxiety'] ?? 3) >= 3.8
  const highBoldness = (f['boldness'] ?? 3) >= 4.0

  if (str.coping === 'physical') return '이미 운동이 주요 스트레스 해소법 — 주 4회 이상 유지, 다양한 종목 시도'
  if (highAnxiety) return '유산소 운동 주 3~4회 필수 (불안 감소 효과), 요가·명상 병행 추천'
  if (highBoldness) return '팀 스포츠나 경쟁 요소 있는 운동 (동기 유지), 주 3회 이상'
  return '주 3회 30분 유산소 + 주 2회 근력 운동 (집중력 및 기억력 향상 효과)'
}

// ── 동기 프로파일 ─────────────────────────────────────────────────
function buildMotivationProfile(mot: MotScores): string {
  const parts = []
  if (mot.motivation_type === 'intrinsic') parts.push('내적 동기 주도형 — 일 자체의 의미와 재미가 가장 강력한 연료')
  else if (mot.motivation_type === 'extrinsic') parts.push('외적 동기 반응형 — 보상, 인정, 마감이 있을 때 퍼포먼스 극대화')
  else parts.push('혼합 동기형 — 내적 의미와 외적 보상 모두 필요')

  if (mot.competition_style === 'competitive') parts.push('경쟁 환경에서 에너지 상승')
  else if (mot.competition_style === 'collaborative') parts.push('협력 환경에서 최고 성과 발휘')

  if (mot.goal_orientation === 'mastery') parts.push('숙달 지향 — 실력 향상 과정 자체에서 만족')
  else if (mot.goal_orientation === 'performance') parts.push('성과 지향 — 결과와 평가가 중요한 동기 원천')

  return parts.join(' / ')
}

// ── 기질 프로파일 ─────────────────────────────────────────────────
function buildTemperamentProfile(tci: TCIScores): string {
  const parts = []
  if (tci.NS >= 3.8) parts.push('새로움 추구 높음 — 탐색·변화 선호, 루틴 저항')
  else if (tci.NS <= 2.5) parts.push('새로움 추구 낮음 — 안정·예측성 선호')

  if (tci.HA >= 3.8) parts.push('위험 회피 높음 — 사전 걱정과 불확실성 민감')
  else if (tci.HA <= 2.5) parts.push('위험 회피 낮음 — 낙관적, 도전 수용')

  if (tci.RD >= 3.8) parts.push('보상 의존 높음 — 사회적 인정과 연결에 민감')
  else if (tci.RD <= 2.5) parts.push('보상 의존 낮음 — 독립적, 타인 평가 영향 적음')

  if (tci.P >= 4.0) parts.push('인내력 매우 높음 — 목표 포기 거의 없음')
  else if (tci.P <= 2.5) parts.push('인내력 낮음 — 장기 과제 완결 어려움')

  return parts.length > 0 ? parts.join(' · ') : '균형적 기질 프로파일'
}

// ── 스트레스 프로파일 ─────────────────────────────────────────────
function buildStressProfile(str: StrScores, f: Record<string, number>): string {
  const recMap: Record<string, string> = {
    fast: '빠른 회복력 (수 시간 내)',
    medium: '평균적 회복 (1~2일)',
    slow: '느린 회복 (1주일+)',
    very_slow: '만성 스트레스 위험 — 전문적 지원 고려 필요',
  }
  const anxiety = f['anxiety'] ?? 3
  const vulnerNote = anxiety >= 4 ? ' / 불안 수치가 높아 스트레스 민감도 증가 상태' : ''
  return `회복 속도: ${recMap[str.recovery] ?? '알 수 없음'}${vulnerNote}`
}

function buildStressTrigger(str: StrScores): string {
  const map: Record<string, string> = {
    relationship: '관계 갈등과 거절 — 사회적 상처에 가장 취약',
    performance: '성과 실패와 평가 — 자기 기준 미달 시 심한 타격',
    uncertainty: '불확실성과 통제 불가 — 예측 불가 상황에서 불안 급상승',
    overload: '과부하와 시간 압박 — 너무 많은 요구가 한꺼번에 올 때',
  }
  return map[str.trigger] ?? '복합적 스트레스 유발 요인'
}

function buildStressCoping(str: StrScores): string {
  const responseMap: Record<string, string> = {
    avoidance: '회피형 — 거리 두기로 에너지 회복. 장기 회피는 문제 누적 주의',
    approach: '접근형 — 문제 직면으로 빠른 해결. 과도한 통제 시도는 소진 위험',
    social_support: '사회적 지지형 — 대화로 해소. 의존 과도 시 주변 부담 가능',
    rumination: '반추형 — 깊은 사고로 의미 찾기. 부정 반추는 우울 전환 주의',
  }
  const copingMap: Record<string, string> = {
    physical: '신체 활동으로 해소 (검증된 최고 효과)',
    creative: '창작·취미 활동으로 승화',
    social: '사람과의 연결로 회복',
    solitude: '혼자만의 조용한 휴식으로 재충전',
  }
  return `반응 패턴: ${responseMap[str.response] ?? '알 수 없음'} / 해소 방법: ${copingMap[str.coping] ?? '알 수 없음'}`
}

// ── 관계 강점/도전 ────────────────────────────────────────────────
function buildRelationshipStrengths(f: Record<string, number>, tci: TCIScores): string[] {
  const s = []
  if ((f['patience'] ?? 3) >= 3.8) s.push('경청과 인내심 — 상대방이 말을 끝까지 하게 해줌')
  if ((f['sincerity'] ?? 3) >= 3.8) s.push('솔직한 표현 — 관계에서 신뢰 구축')
  if (tci.RD_warmth >= 3.8) s.push('따뜻한 공감 — 상대방이 이해받는 느낌')
  if ((f['forgiveness'] ?? 3) >= 3.8) s.push('용서 능력 — 관계 회복력이 높음')
  if ((f['boldness'] ?? 3) >= 4.0) s.push('사교적 에너지 — 새로운 관계 형성이 자연스러움')
  if ((f['humility'] ?? 3) >= 4.0) s.push('겸손한 태도 — 상대방이 편안함을 느낌')
  return s.length > 0 ? s : ['균형적인 관계 강점']
}

function buildRelationshipChallenges(f: Record<string, number>, tci: TCIScores): string[] {
  const c = []
  if ((f['patience'] ?? 3) <= 2.5) c.push('조급함 — 상대방 속도에 맞추기 어려움')
  if ((f['anxiety'] ?? 3) >= 4.0) c.push('관계 불안 — 거절 해석 과민, 과도한 확인 요구')
  if ((f['flexibility'] ?? 3) <= 2.5) c.push('고집스러움 — 타인 의견 수용에 에너지 필요')
  if ((f['boldness'] ?? 3) <= 2.0) c.push('관계 시작의 어려움 — 먼저 다가가기 힘듦')
  if (tci.NS_impulsivity >= 4.0) c.push('충동적 발언 — 나중에 후회할 말을 할 수 있음')
  if ((f['forgiveness'] ?? 3) <= 2.0) c.push('용서 어려움 — 과거 상처가 오래 지속')
  return c.length > 0 ? c : ['특별한 관계 도전 없음']
}

// ── 성장 우선순위 ─────────────────────────────────────────────────
function buildGrowthPriorities(
  f: Record<string, number>,
  cog: CogBreakdown,
  tci: TCIScores,
  mot: MotScores
): string[] {
  const p: { score: number; text: string }[] = []

  // 가장 낮은 패싯 → 성장 우선순위로 전환
  if ((f['diligence'] ?? 3) <= 2.8) p.push({ score: 3 - (f['diligence'] ?? 3), text: '실행 완결 능력 개발 — 시작한 것을 끝내는 시스템 구축' })
  if ((f['boldness'] ?? 3) <= 2.2) p.push({ score: 3 - (f['boldness'] ?? 3), text: '자기 표현 능력 향상 — 작은 발표·공유 경험 축적' })
  if ((f['flexibility'] ?? 3) <= 2.5) p.push({ score: 3 - (f['flexibility'] ?? 3), text: '관점 유연성 훈련 — 반대 의견 옹호 연습' })
  if ((f['organization'] ?? 3) <= 2.5) p.push({ score: 3 - (f['organization'] ?? 3), text: '체계 구축 — 간단한 시스템(노션, 캘린더) 도입' })
  if (tci.HA >= 4.0) p.push({ score: tci.HA - 3, text: '불안 관리 — 인지행동기법 또는 마음챙김 훈련' })
  if (mot.motivation_type === 'extrinsic') p.push({ score: 1, text: '내적 동기 발견 — "왜 이 일을 하는가" 질문을 깊이 탐구' })
  if (cog.verbal <= 0.4) p.push({ score: 1, text: '언어 표현력 강화 — 독서와 글쓰기 루틴' })

  return p
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.text)
}

// ── 유틸 ─────────────────────────────────────────────────────────
function avg2(a: number, b: number) { return (a + b) / 2 }
function avg3(a: number, b: number, c: number) { return (a + b + c) / 3 }
function avg4(a?: number, b?: number, c?: number, d?: number) {
  const vals = [a, b, c, d].filter(v => v !== undefined) as number[]
  if (vals.length === 0) return 3
  return vals.reduce((s, v) => s + v, 0) / vals.length
}
