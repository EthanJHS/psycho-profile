// English version of paid test scoring logic
// Produces Western academic profile labels: STEM · Applied Sciences · Humanities · Social Sciences · Business · Arts · Interdisciplinary

import {
  PAID_QUESTIONS_EN,
  SubFacet,
  RiasecType,
  AptitudeDim,
  SUB_FACET_LABELS,
} from './paid-questions-en'

export type { SubFacet, RiasecType, AptitudeDim }

// ── Types ─────────────────────────────────────────────────────────────

export interface PaidAnswer {
  id: string
  score: number // 1-5
}

export type HexacoFactor = 'H' | 'E' | 'X' | 'A' | 'C' | 'O'

export type SubFacetScores = Record<SubFacet, number>
export type HexacoScores   = Record<HexacoFactor, number>
export type RiasecScores   = Record<RiasecType, number>
export type AptitudeScores = Record<AptitudeDim, number>

// Western academic profile categories
export type AptitudeProfileEN =
  | 'STEM'               // quantitative + scientific dominant
  | 'Applied Sciences'   // quantitative + spatial + applied dominant
  | 'Humanities'         // verbal + humanistic dominant
  | 'Social Sciences'    // social + humanistic dominant
  | 'Business'           // business + quantitative dominant
  | 'Arts'               // artistic dominant
  | 'Interdisciplinary'  // no clear dominant

export interface PaidScoringOutputEN {
  subFacets: SubFacetScores
  hexaco: HexacoScores
  riasec: RiasecScores
  aptitude: AptitudeScores
  riasecTop3: RiasecType[]
  aptitudeProfile: AptitudeProfileEN
}

// ── Subfacet → HEXACO factor mapping ─────────────────────────────────

const SUBFACET_TO_FACTOR: Record<SubFacet, HexacoFactor> = {
  sincerity: 'H', fairness: 'H', greedAvoidance: 'H', modesty: 'H',
  fearfulness: 'E', anxiety: 'E', dependence: 'E', sentimentality: 'E',
  socialSelfEsteem: 'X', socialBoldness: 'X', sociability: 'X', liveliness: 'X',
  forgivingness: 'A', gentleness: 'A', flexibility: 'A', patience: 'A',
  organization: 'C', diligence: 'C', perfectionism: 'C', prudence: 'C',
  aestheticAppreciation: 'O', inquisitiveness: 'O', creativity: 'O', unconventionality: 'O',
}

// ── Scoring function ──────────────────────────────────────────────────

export function scorePaidAnswersEN(answers: PaidAnswer[]): PaidScoringOutputEN {
  const answerMap = new Map(answers.map(a => [a.id, a.score]))

  // 1. HEXACO 24 subfacets
  const subFacetAccum: Partial<Record<SubFacet, { sum: number; count: number }>> = {}

  for (const q of PAID_QUESTIONS_EN) {
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
  for (const f of Object.keys(SUB_FACET_LABELS) as SubFacet[]) {
    if (subFacets[f] == null) subFacets[f] = 3
  }

  // 2. HEXACO 6 factors
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

  // 3. RIASEC (sum 3–15)
  const riasecAccum: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const q of PAID_QUESTIONS_EN) {
    if (q.section !== 'riasec' || !q.riasecType) continue
    const raw = answerMap.get(q.id)
    if (raw == null) continue
    riasecAccum[q.riasecType] += raw
  }
  const riasec = riasecAccum as RiasecScores
  const riasecTop3 = (Object.keys(riasec) as RiasecType[])
    .sort((a, b) => riasec[b] - riasec[a])
    .slice(0, 3)

  // 4. Academic aptitude
  const aptAccum: Partial<Record<AptitudeDim, { sum: number; count: number }>> = {}
  for (const q of PAID_QUESTIONS_EN) {
    if (q.section !== 'aptitude' || !q.aptitudeDim) continue
    const raw = answerMap.get(q.id)
    if (raw == null) continue
    const score = q.reverse ? 6 - raw : raw
    if (!aptAccum[q.aptitudeDim]) aptAccum[q.aptitudeDim] = { sum: 0, count: 0 }
    aptAccum[q.aptitudeDim]!.sum += score
    aptAccum[q.aptitudeDim]!.count++
  }
  const aptitude = {} as AptitudeScores
  const aptDims: AptitudeDim[] = ['quantitative','verbal','spatial','social','applied','business','scientific','humanistic','artistic']
  for (const dim of aptDims) {
    const acc = aptAccum[dim]
    aptitude[dim] = acc && acc.count > 0 ? acc.sum / acc.count : 3
  }

  // 5. Classify Western academic profile
  const aptitudeProfile = classifyAptitudeEN(aptitude)

  return { subFacets, hexaco, riasec, riasecTop3, aptitude, aptitudeProfile }
}

// ── Western academic profile classifier ──────────────────────────────
// Maps 9 cognitive dimensions to 7 Western academic track labels
// Threshold 3.5 means the person scored meaningfully above midpoint on that dimension

function classifyAptitudeEN(a: AptitudeScores): AptitudeProfileEN {
  const stemScore     = (a.quantitative + a.scientific) / 2
  const appliedScore  = (a.quantitative + a.spatial + a.applied) / 3
  const humScore      = (a.verbal + a.humanistic) / 2
  const socialScore   = (a.social + a.humanistic * 0.5) / 1.5
  const bizScore      = (a.business + a.quantitative * 0.5) / 1.5
  const artScore      = a.artistic

  const scores: [AptitudeProfileEN, number][] = [
    ['STEM',            stemScore],
    ['Applied Sciences',appliedScore],
    ['Humanities',      humScore],
    ['Social Sciences', socialScore],
    ['Business',        bizScore],
    ['Arts',            artScore],
  ]

  const best = scores.reduce((a, b) => b[1] > a[1] ? b : a)
  const THRESHOLD = 3.5

  if (best[1] < THRESHOLD) return 'Interdisciplinary'

  // Tiebreaker: if top two are within 0.2, prefer the more specific profile
  const [topLabel, topScore] = best
  const second = scores.filter(s => s[0] !== topLabel).reduce((a, b) => b[1] > a[1] ? b : a)
  if (topScore - second[1] < 0.2 && second[1] >= THRESHOLD) {
    // STEM vs Applied Sciences tie → pick by applied vs scientific
    if ((topLabel === 'STEM' && second[0] === 'Applied Sciences') ||
        (topLabel === 'Applied Sciences' && second[0] === 'STEM')) {
      return a.applied > a.scientific ? 'Applied Sciences' : 'STEM'
    }
  }

  return topLabel
}

// ── Facet map helper (same as Korean version) ─────────────────────────

export function buildFacetMapFromSubFacetsEN(sf: SubFacetScores, hexaco: HexacoScores) {
  const avg = (...vals: number[]) => vals.reduce((s, v) => s + v, 0) / vals.length
  return {
    openness:          avg(sf.inquisitiveness * 1.3, sf.creativity * 1.1, sf.unconventionality, sf.aestheticAppreciation * 0.6) / ((1.3 + 1.1 + 1 + 0.6) / 4),
    conscientiousness: avg(sf.diligence * 1.3, sf.organization * 1.1, sf.prudence, sf.perfectionism * 0.8) / ((1.3 + 1.1 + 1 + 0.8) / 4),
    extraversion:      avg(sf.socialBoldness * 1.3, sf.socialSelfEsteem * 1.2, sf.sociability, sf.liveliness * 0.8) / ((1.3 + 1.2 + 1 + 0.8) / 4),
    agreeableness:     avg(sf.patience * 1.3, sf.flexibility * 1.1, sf.gentleness, sf.forgivingness * 0.8) / ((1.3 + 1.1 + 1 + 0.8) / 4),
    emotionality:      hexaco.E,
    honesty:           hexaco.H,
  }
}

// Academic profile display metadata
export const APTITUDE_PROFILE_META: Record<AptitudeProfileEN, {
  icon: string
  label: string
  description: string
  exampleFields: string[]
}> = {
  'STEM': {
    icon: '🔬',
    label: 'STEM',
    description: 'Strong quantitative and scientific reasoning. You excel at logical deduction, mathematical abstraction, and evidence-based analysis.',
    exampleFields: ['Mathematics', 'Physics', 'Computer Science', 'Statistics', 'Chemistry'],
  },
  'Applied Sciences': {
    icon: '⚙️',
    label: 'Applied Sciences',
    description: 'High systems thinking and spatial-mechanical reasoning. You grasp how things work and can translate principles into practical solutions.',
    exampleFields: ['Engineering', 'Architecture', 'Robotics', 'Materials Science', 'Industrial Design'],
  },
  'Humanities': {
    icon: '📖',
    label: 'Humanities',
    description: 'Strong verbal and interpretive abilities. You think through context, narrative, and meaning — understanding how ideas shape history and culture.',
    exampleFields: ['Literature', 'History', 'Philosophy', 'Languages & Linguistics', 'Cultural Studies'],
  },
  'Social Sciences': {
    icon: '🧭',
    label: 'Social Sciences',
    description: 'Skilled at reading people and understanding group dynamics. You connect individual behavior to broader social and structural patterns.',
    exampleFields: ['Psychology', 'Sociology', 'Political Science', 'Anthropology', 'Communication Studies'],
  },
  'Business': {
    icon: '📊',
    label: 'Business',
    description: 'Strong business and financial acuity. You can read economic structures, identify inefficiencies, and think strategically about value creation.',
    exampleFields: ['Finance', 'Economics', 'Marketing', 'Management', 'Accounting'],
  },
  'Arts': {
    icon: '🎨',
    label: 'Arts',
    description: 'High aesthetic perception and expressive capacity. You instinctively see what others miss — form, mood, tone — and give it a voice.',
    exampleFields: ['Fine Arts', 'Music', 'Film & Media', 'Creative Writing', 'Graphic Design'],
  },
  'Interdisciplinary': {
    icon: '🌐',
    label: 'Interdisciplinary',
    description: 'No single domain dominates — you have broad, balanced abilities across multiple areas. You tend to thrive where fields intersect.',
    exampleFields: ['Cognitive Science', 'Environmental Studies', 'International Relations', 'Bioethics', 'Data Journalism'],
  },
}

// ── Display labels ────────────────────────────────────────────────────

export const HEXACO_FACTOR_LABELS_EN: Record<HexacoFactor, string> = {
  H: 'Honesty-Humility',
  E: 'Emotionality',
  X: 'Extraversion',
  A: 'Agreeableness',
  C: 'Conscientiousness',
  O: 'Openness to Experience',
}

export const RIASEC_LABELS_EN: Record<RiasecType, { label: string; desc: string }> = {
  R: { label: 'Realistic',      desc: 'Hands-on work with tools, machines, and the physical world' },
  I: { label: 'Investigative',  desc: 'Analytical and research-oriented; driven by intellectual curiosity' },
  A: { label: 'Artistic',       desc: 'Creative expression and environments that value originality' },
  S: { label: 'Social',         desc: 'Teaching, helping, and connecting with people in meaningful ways' },
  E: { label: 'Enterprising',   desc: 'Persuasion, leadership, and competitive goal-driven environments' },
  C: { label: 'Conventional',   desc: 'Structured procedures, accuracy, and organized data management' },
}

export const APTITUDE_DIM_LABELS_EN: Record<AptitudeDim, string> = {
  quantitative: 'Quantitative Reasoning',
  verbal:       'Verbal Comprehension',
  spatial:      'Spatial Visualization',
  social:       'Social Understanding',
  applied:      'Applied Systems Thinking',
  business:     'Business & Finance',
  scientific:   'Scientific Reasoning',
  humanistic:   'Humanistic Interpretation',
  artistic:     'Artistic Expression',
}

export function subfacetLevelEN(score: number): 'low' | 'mid' | 'high' {
  return score >= 3.67 ? 'high' : score >= 2.34 ? 'mid' : 'low'
}

export function normalizeRiasecEN(score: number): number {
  return (score - 3) / 12
}

// Section utilities
export const HEXACO_QUESTIONS_EN   = PAID_QUESTIONS_EN.filter(q => q.section === 'hexaco')
export const RIASEC_QUESTIONS_EN   = PAID_QUESTIONS_EN.filter(q => q.section === 'riasec')
export const APTITUDE_QUESTIONS_EN = PAID_QUESTIONS_EN.filter(q => q.section === 'aptitude')
