// CORE CAREER 채점 엔진 — 순수 함수 (브라우저·서버 공용)
import type { HexacoFactor } from '../scoring-hexaco'
import type { InterestTag, Riasec, WorkValue } from '../jobs-v2'
import {
  INTEREST_ITEMS, VALUE_CARDS, ATTACHMENT_ITEMS, STRESS_ITEMS, STYLE_ITEMS, STAGE_GOAL_MODULES,
  type LifeStage, type Goal, type Plan,
} from '../paid-v2/items'
import { CAREER_JOBS, type CareerJob } from './jobs'
import { matchMajors, type MajorMatch } from './majors'

export type Answers = Record<string, number | string | string[]>
type Num = Record<string, number>

const RIASEC: Riasec[] = ['R', 'I', 'A', 'S', 'E', 'C']
const VALUES = VALUE_CARDS.map(v => v.id)
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const sd = (xs: number[]) => { const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x - m) ** 2))) }
const r2 = (x: number) => Math.round(x * 100) / 100
const num = (a: Answers, id: string) => (typeof a[id] === 'number' ? (a[id] as number) : NaN)
const valueKey = (v: WorkValue) => `V_${v}`
const fulfillKey = (v: WorkValue) => `F_${v}`

// 같은 dim의 1~5 문항 평균 (역채점 반영)
function dimMeans(items: { id: string; dim: string; reverse?: boolean }[], a: Answers): Num {
  const groups: Record<string, number[]> = {}
  for (const it of items) {
    const v = num(a, it.id)
    if (!Number.isFinite(v)) continue
    ;(groups[it.dim] ??= []).push(it.reverse ? 6 - v : v)
  }
  return Object.fromEntries(Object.entries(groups).map(([d, xs]) => [d, r2(mean(xs))]))
}

// ── 흥미 ──
export interface InterestResult {
  raw: Record<Riasec, number>
  rel: Record<Riasec, number>          // 개인 평균 대비
  top: Riasec[]                        // 상위 3
  tags: InterestTag[]                  // 4점 이상 세부 흥미, 높은 순
  shape: 'sharp' | 'balanced' | 'flat' // 분화도: 뾰족함 / 보통 / 평평함
}
export function scoreInterest(a: Answers): InterestResult {
  const raw = Object.fromEntries(RIASEC.map(t => [t, r2(mean(INTEREST_ITEMS.filter(i => i.type === t).map(i => num(a, i.id)).filter(Number.isFinite)))])) as Record<Riasec, number>
  const m = mean(RIASEC.map(t => raw[t]))
  const rel = Object.fromEntries(RIASEC.map(t => [t, r2(raw[t] - m)])) as Record<Riasec, number>
  const top = [...RIASEC].sort((x, y) => raw[y] - raw[x]).slice(0, 3)
  const tags = INTEREST_ITEMS.map(i => ({ tag: i.tag, v: num(a, i.id) })).filter(x => x.v >= 4).sort((x, y) => y.v - x.v).map(x => x.tag)
  const spread = raw[top[0]] - mean(RIASEC.filter(t => !top.slice(0, 2).includes(t)).map(t => raw[t]))
  const shape = spread >= 1.5 ? 'sharp' : spread >= 0.7 ? 'balanced' : 'flat'
  return { raw, rel, top, tags: [...new Set(tags)], shape }
}

// ── 가치 ──
export interface ValueResult {
  raw: Record<WorkValue, number>
  rel: Record<WorkValue, number>
  top: WorkValue[]              // 상대적으로 가장 중요한 3개
  dealbreakers: WorkValue[]     // 5점 = "없으면 그 일은 하지 않겠다"
  flat: boolean                 // 10개 점수가 거의 같음 → 조건에 크게 좌우되지 않는 타입
  gaps?: { value: WorkValue; importance: number; fulfilled: number; gap: number }[]  // 직장인: 중요도 - 충족도
}
export function scoreValues(a: Answers, withFulfillment = false): ValueResult {
  const raw = Object.fromEntries(VALUES.map(v => [v, num(a, valueKey(v))])) as Record<WorkValue, number>
  const xs = VALUES.map(v => raw[v]).filter(Number.isFinite)
  const m = mean(xs)
  const rel = Object.fromEntries(VALUES.map(v => [v, r2(raw[v] - m)])) as Record<WorkValue, number>
  const flat = sd(xs) < 0.45
  const top = flat ? [] : [...VALUES].sort((x, y) => raw[y] - raw[x]).slice(0, 3)
  const dealbreakers = VALUES.filter(v => raw[v] >= 5)
  const out: ValueResult = { raw, rel, top, dealbreakers, flat }
  if (withFulfillment) {
    out.gaps = VALUES.map(v => ({ value: v, importance: raw[v], fulfilled: num(a, fulfillKey(v)), gap: raw[v] - num(a, fulfillKey(v)) }))
      .filter(g => Number.isFinite(g.gap)).sort((x, y) => y.gap - x.gap)
  }
  return out
}

// ── 관계 · 스트레스 · 방식 · 시기 모듈 ──
export interface AttachmentResult { anxiety: number; avoidance: number; pattern: 'secure' | 'anxious' | 'avoidant' | 'mixed' }
export function scoreAttachment(a: Answers): AttachmentResult {
  const d = dimMeans(ATTACHMENT_ITEMS.map(i => ({ id: i.id, dim: i.dim, reverse: i.reverse })), a)
  const hiA = d.anxiety >= 3.4, hiV = d.avoidance >= 3.4
  const pattern = hiA && hiV ? 'mixed' : hiA ? 'anxious' : hiV ? 'avoidant' : 'secure'
  return { anxiety: d.anxiety, avoidance: d.avoidance, pattern }
}

export interface StressResult { dims: Num; strain: number; recovery: number; main: string | null; level: 'low' | 'moderate' | 'high' }
export function scoreStress(a: Answers): StressResult {
  const dims = dimMeans(STRESS_ITEMS.map(i => ({ id: i.id, dim: i.dim })), a)
  const neg = ['overwork', 'withdraw', 'outburst', 'rumination']
  const strain = r2(mean(neg.map(k => dims[k]).filter(Number.isFinite)))
  const main = [...neg].sort((x, y) => (dims[y] ?? 0) - (dims[x] ?? 0))[0]
  const level = strain >= 3.8 ? 'high' : strain >= 3 ? 'moderate' : 'low'
  return { dims, strain, recovery: dims.recovery, main: (dims[main] ?? 0) >= 3 ? main : null, level }
}

// "계획"은 무료 검사의 성실성(C)으로 이미 측정됨 → 다시 묻지 않고 재사용
export function scoreStyle(a: Answers, hexaco: Record<HexacoFactor, number>): Num {
  return { planning: r2(hexaco.C), ...dimMeans(STYLE_ITEMS.map(i => ({ id: i.id, dim: i.dim })), a) }
}

// 무료 검사 문항을 그대로 쓰는 차원: 발표 부담 = 무료 X3("많은 사람 앞 발표가 부담스럽지 않다")의 역
export const FREE_DERIVED = { presentation: 'X3' } as const
export function scoreModule(stage: LifeStage, goal: Goal, a: Answers, hexacoAnswers?: Record<string, number>) {
  const m = STAGE_GOAL_MODULES[stage][goal]
  const dims = dimMeans(m.items, a)
  const x3 = hexacoAnswers?.[FREE_DERIVED.presentation]
  if (goal === 'do' && (stage === 'high' || stage === 'college') && typeof x3 === 'number') {
    dims[stage === 'high' ? 'performance' : 'presentation'] = 6 - x3
  }
  const choices = Object.fromEntries(m.choices.map(c => [c.id, a[c.id] ?? null]))
  return { dims, choices }
}

// ── 직무 매칭 ──
const CODE_W = [1, 0.6, 0.3]
const CODE_TOTAL = CODE_W.reduce((x, y) => x + y, 0)

export interface JobMatch {
  id: string
  score: number
  interestFit: number
  valueFit: number
  conflicts: WorkValue[]                      // 포기 못 하는 가치인데 이 직무 환경이 채우기 어려운 것
  cautions: string[]                          // 성격상 특히 신경 쓸 점 (극단적 불일치일 때만)
}
export function matchJobs(interest: InterestResult, values: ValueResult, hexaco: Record<HexacoFactor, number>, jobs: CareerJob[] = CAREER_JOBS): JobMatch[] {
  return jobs.map(job => {
    let interestFit = job.code.reduce((s, t, i) => s + CODE_W[i] * interest.rel[t], 0) / CODE_TOTAL
    if (job.tags.some(t => interest.tags.includes(t))) interestFit += 0.35

    const wSum = Object.values(job.values).reduce((s, w) => s + Math.abs(w ?? 0), 0) || 1
    const valueFit = Object.entries(job.values).reduce((s, [v, w]) => s + (w ?? 0) * values.rel[v as WorkValue], 0) / wSum
    const conflicts = values.dealbreakers.filter(v => (job.values[v] ?? 0) <= -0.2)

    const cautions = (job.mismatch ?? [])
      .filter(m => (m.when === 'low' ? hexaco[m.factor] <= 2.2 : hexaco[m.factor] >= 3.8))
      .map(m => m.note)

    const score = 0.6 * interestFit + 0.3 * valueFit - (conflicts.length ? 0.6 : 0) - 0.15 * cautions.length
    return { id: job.id, score: r2(score), interestFit: r2(interestFit), valueFit: r2(valueFit), conflicts, cautions }
  }).sort((x, y) => y.score - x.score)
}

// 중요한 가치가 채워지지 않는 환경 → "피해야 할 환경" 문장
export const LACKING_ENV: Record<WorkValue, string> = {
  성장: '늘 같은 일만 반복하고 배울 것이 없는 자리',
  도전: '변화 없이 정해진 일만 처리하는 자리',
  안정: '성과에 따라 자리가 쉽게 흔들리는 환경',
  보상: '잘해도 보상으로 이어지지 않는 구조',
  자율: '세세한 지시와 결재가 많은 조직',
  동료: '혼자 고립되어 일하는 환경',
  인정: '성과가 드러나지 않는 뒷단 업무',
  주도: '결정권 없이 지시만 따르는 역할',
  기여: '누구에게 도움이 되는지 느끼기 어려운 일',
  균형: '야근과 주말 근무가 당연한 문화',
}

// ── 전체 ──
export interface CareerScores {
  stage: LifeStage
  plan: Plan
  hexaco: Record<HexacoFactor, number>
  interest?: InterestResult
  values: ValueResult
  style?: Num
  attachment: AttachmentResult
  stress: StressResult
  modules: Partial<Record<Goal, ReturnType<typeof scoreModule>>>
  jobs?: JobMatch[]            // 상위 8개만 저장
  majors?: MajorMatch[]        // 고등학생 탐색: 상위 8개
  currentJob?: { id: string; rank: number; total: number; score: number; interestFit: number; valueFit: number }  // 직장인: 지금 직무의 적합도
  avoidEnv: string[]
}

export function scoreCareer(stage: LifeStage, plan: Plan, a: Answers, hexaco: Record<HexacoFactor, number>, hexacoAnswers?: Record<string, number>): CareerScores {
  const goals: Goal[] = plan === 'both' ? ['find', 'do'] : [plan]
  const hasFind = goals.includes('find')
  const interest = hasFind ? scoreInterest(a) : undefined
  const values = scoreValues(a, stage === 'worker' && hasFind)
  const modules = Object.fromEntries(goals.map(g => [g, scoreModule(stage, g, a, hexacoAnswers)]))
  const allJobs = interest && stage !== 'high' ? matchJobs(interest, values, hexaco) : undefined
  let currentJob: CareerScores['currentJob']
  if (allJobs && stage === 'worker' && typeof a.currentJob === 'string') {
    const job = CAREER_JOBS.find(j => j.name === a.currentJob)
    const idx = job ? allJobs.findIndex(m => m.id === job.id) : -1
    if (idx >= 0) currentJob = { id: allJobs[idx].id, rank: idx + 1, total: allJobs.length, score: allJobs[idx].score, interestFit: allJobs[idx].interestFit, valueFit: allJobs[idx].valueFit }
  }
  const majors = interest && stage === 'high'
    ? matchMajors(interest.rel, interest.tags, Array.isArray(a.strongSubjects) ? (a.strongSubjects as string[]) : []).slice(0, 8)
    : undefined
  const important = VALUES.filter(v => values.raw[v] >= 4).sort((x, y) => values.raw[y] - values.raw[x])
  return {
    stage, plan, hexaco,
    interest, values,
    style: goals.includes('do') ? scoreStyle(a, hexaco) : undefined,
    attachment: scoreAttachment(a),
    stress: scoreStress(a),
    modules,
    jobs: allJobs?.slice(0, 8),
    majors,
    currentJob,
    avoidEnv: important.slice(0, 2).map(v => LACKING_ENV[v]),
  }
}
