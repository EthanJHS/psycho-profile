// 유료 검사 채점 로직
// HEXACO 24 하위 요인 점수, RIASEC 직접 점수, 학문 적성 점수 산출

import {
  PAID_QUESTIONS,
  SubFacet,
  RiasecType,
  AptitudeDim,
  SUB_FACET_LABELS,
} from './paid-questions'

export type { SubFacet, RiasecType, AptitudeDim }

// ── 타입 ─────────────────────────────────────────────────────────────

export interface PaidAnswer {
  id: string   // PQ1 ~ PQ82
  score: number // 1-5
}

export type HexacoFactor = 'H' | 'E' | 'X' | 'A' | 'C' | 'O'

// 하위 요인별 점수 (1~5 평균)
export type SubFacetScores = Record<SubFacet, number>

// HEXACO 6요인 평균 (하위 요인 평균의 평균)
export type HexacoScores = Record<HexacoFactor, number>

// RIASEC 점수 (합산, 3~15)
export type RiasecScores = Record<RiasecType, number>

// 학문 적성 점수 (1~5)
export type AptitudeScores = Record<AptitudeDim, number>

export interface PaidScoringOutput {
  subFacets: SubFacetScores
  hexaco: HexacoScores
  riasec: RiasecScores
  aptitude: AptitudeScores
  riasecTop3: RiasecType[]
  aptitudeProfile: AptitudeProfile
}

// 적성 프로파일 유형
export type AptitudeProfile =
  | '이과형'    // quantitative + scientific 강세
  | '공학형'    // quantitative + spatial + applied 강세
  | '문과형'    // verbal + humanistic + social 강세
  | '경상형'    // business + quantitative 강세
  | '예술형'    // verbal + humanistic, social 보통
  | '복합형'    // 특정 방향 없음

// ── 하위 요인 → HEXACO 6요인 매핑 ────────────────────────────────────

const SUBFACET_TO_FACTOR: Record<SubFacet, HexacoFactor> = {
  sincerity: 'H', fairness: 'H', greedAvoidance: 'H', modesty: 'H',
  fearfulness: 'E', anxiety: 'E', dependence: 'E', sentimentality: 'E',
  socialSelfEsteem: 'X', socialBoldness: 'X', sociability: 'X', liveliness: 'X',
  forgivingness: 'A', gentleness: 'A', flexibility: 'A', patience: 'A',
  organization: 'C', diligence: 'C', perfectionism: 'C', prudence: 'C',
  aestheticAppreciation: 'O', inquisitiveness: 'O', creativity: 'O', unconventionality: 'O',
}

// ── 채점 함수 ─────────────────────────────────────────────────────────

export function scorePaidAnswers(answers: PaidAnswer[]): PaidScoringOutput {
  const answerMap = new Map(answers.map(a => [a.id, a.score]))

  // 1. HEXACO 24 하위 요인 채점
  const subFacetAccum: Partial<Record<SubFacet, { sum: number; count: number }>> = {}

  for (const q of PAID_QUESTIONS) {
    if (q.section !== 'hexaco' || !q.facet) continue
    const raw = answerMap.get(q.id)
    if (raw == null) continue
    const score = q.reverse ? 6 - raw : raw

    if (!subFacetAccum[q.facet]) subFacetAccum[q.facet] = { sum: 0, count: 0 }
    subFacetAccum[q.facet]!.sum += score
    subFacetAccum[q.facet]!.count++
  }

  const subFacets = {} as SubFacetScores
  for (const [facet, acc] of Object.entries(subFacetAccum)) {
    subFacets[facet as SubFacet] = acc.count > 0 ? acc.sum / acc.count : 3
  }

  // 하위 요인 미응답 시 기본값 3
  for (const f of Object.keys(SUB_FACET_LABELS) as SubFacet[]) {
    if (subFacets[f] == null) subFacets[f] = 3
  }

  // 2. HEXACO 6요인 집계 (하위 요인 평균의 평균)
  const hexacoAccum: Record<HexacoFactor, { sum: number; count: number }> = {
    H: { sum: 0, count: 0 }, E: { sum: 0, count: 0 },
    X: { sum: 0, count: 0 }, A: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 }, O: { sum: 0, count: 0 },
  }

  for (const [facet, score] of Object.entries(subFacets)) {
    const factor = SUBFACET_TO_FACTOR[facet as SubFacet]
    hexacoAccum[factor].sum += score
    hexacoAccum[factor].count++
  }

  const hexaco = {} as HexacoScores
  for (const [f, acc] of Object.entries(hexacoAccum)) {
    hexaco[f as HexacoFactor] = acc.count > 0 ? acc.sum / acc.count : 3
  }

  // 3. RIASEC 채점 (합산 3~15)
  const riasecAccum: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const q of PAID_QUESTIONS) {
    if (q.section !== 'riasec' || !q.riasecType) continue
    const raw = answerMap.get(q.id)
    if (raw == null) continue
    riasecAccum[q.riasecType] += raw
  }

  const riasec = riasecAccum as RiasecScores

  // RIASEC Top3 (Holland Code)
  const riasecTop3 = (Object.keys(riasec) as RiasecType[])
    .sort((a, b) => riasec[b] - riasec[a])
    .slice(0, 3)

  // 4. 학문 적성 채점 (역채점 + 차원당 복수 문항 평균)
  const aptAccum: Partial<Record<AptitudeDim, { sum: number; count: number }>> = {}
  for (const q of PAID_QUESTIONS) {
    if (q.section !== 'aptitude' || !q.aptitudeDim) continue
    const raw = answerMap.get(q.id)
    if (raw == null) continue
    const score = q.reverse ? 6 - raw : raw
    if (!aptAccum[q.aptitudeDim]) aptAccum[q.aptitudeDim] = { sum: 0, count: 0 }
    aptAccum[q.aptitudeDim]!.sum += score
    aptAccum[q.aptitudeDim]!.count++
  }
  const aptitude = {} as AptitudeScores
  const aptDims: AptitudeDim[] = ['quantitative','verbal','spatial','social','applied','business','scientific','humanistic']
  for (const dim of aptDims) {
    const acc = aptAccum[dim]
    aptitude[dim] = acc && acc.count > 0 ? acc.sum / acc.count : 3
  }

  // 5. 적성 프로파일 분류
  const aptitudeProfile = classifyAptitude(aptitude)

  return { subFacets, hexaco, riasec, riasecTop3, aptitude, aptitudeProfile }
}

// ── 적성 프로파일 분류 ────────────────────────────────────────────────

function classifyAptitude(a: AptitudeScores): AptitudeProfile {
  const stem   = (a.quantitative + a.scientific + a.spatial) / 3
  const eng    = (a.quantitative + a.spatial + a.applied)    / 3
  const lib    = (a.verbal + a.humanistic + a.social)        / 3
  const biz    = (a.business + a.quantitative)               / 2
  const art    = (a.verbal + a.humanistic)                   / 2

  const max = Math.max(stem, eng, lib, biz)
  const threshold = 3.5

  if (max < threshold) return '복합형'
  if (max === eng  && a.applied >= 3.5) return '공학형'
  if (max === stem && a.scientific >= 3.5) return '이과형'
  if (max === biz  && a.business >= 3.5) return '경상형'
  if (max === lib  && art >= 3.5 && a.social < 3.5) return '예술형'
  if (max === lib) return '문과형'
  return '복합형'
}

// ── 결과 텍스트 생성 헬퍼 ────────────────────────────────────────────

export const HEXACO_FACTOR_LABELS: Record<HexacoFactor, string> = {
  H: '겸손·윤리 의식',
  E: '감수성·정서성',
  X: '사회적 대담성',
  A: '공감력·원만성',
  C: '성실성',
  O: '지적 개방성',
}

export const RIASEC_LABELS: Record<RiasecType, { label: string; desc: string }> = {
  R: { label: '현실형', desc: '도구·신체·자연을 다루는 구체적 작업 선호' },
  I: { label: '탐구형', desc: '분석·연구·이론 탐구를 즐기는 지적 성향' },
  A: { label: '예술형', desc: '창작·표현·자유로운 환경을 추구하는 성향' },
  S: { label: '사회형', desc: '교육·돌봄·협력을 통해 사람과 연결되는 성향' },
  E: { label: '진취형', desc: '설득·리더십·경쟁을 즐기는 도전적 성향' },
  C: { label: '관습형', desc: '절차·정확성·안정적 루틴을 선호하는 성향' },
}

export const APTITUDE_DIM_LABELS: Record<AptitudeDim, string> = {
  quantitative: '수리·논리',
  verbal:       '언어·문해',
  spatial:      '공간·시각화',
  social:       '사회·인간 이해',
  applied:      '응용·제작',
  business:     '경영·재무',
  scientific:   '과학·실험',
  humanistic:   '인문학적 탐구',
}

// 하위 요인 수준 (1~5 → low/mid/high)
export function subfacetLevel(score: number): 'low' | 'mid' | 'high' {
  return score >= 3.67 ? 'high' : score >= 2.34 ? 'mid' : 'low'
}

// RIASEC 점수 정규화 (3~15 → 0~1)
export function normalizeRiasec(score: number): number {
  return (score - 3) / 12
}
