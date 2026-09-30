// 품질 검토용 가상 인물 — 실제 검사와 같은 채점·리포트 코드로 샘플 리포트를 만든다 (DB 저장 없음)
import { buildScreens } from './flow'
import { computeScores } from './compute'
import type { Answers } from './score'
import { QUESTIONS, type HexacoFactor } from '../scoring-hexaco'
import { encodeHexacoAnswers } from '../hexaco-encoding'
import { INTEREST_ITEMS, ATTACHMENT_ITEMS, STRESS_ITEMS, STYLE_ITEMS, type LifeStage, type Plan } from '../paid-v2/items'
import type { Riasec, WorkValue } from '../jobs-v2'

export interface Persona {
  id: string
  stage: LifeStage
  plan: Plan
  who: string                                  // 목록에 보이는 한 줄 소개
  hexaco: Record<HexacoFactor, number>         // 요인별 목표 점수 1~5
  interest: Partial<Record<Riasec, number>>    // 기본 2
  values: Partial<Record<WorkValue, number>>   // 기본 3
  fulfillment?: Partial<Record<WorkValue, number>>  // 직장인 탐색 — 기본 3
  attach: { anxiety: number; avoidance: number }
  stress: Partial<Record<'overwork' | 'withdraw' | 'outburst' | 'rumination' | 'recovery', number>>  // 기본 2 (recovery 3)
  items?: Record<string, number>               // 시기 모듈·일하는 방식 문항 (기본 3)
  choices?: Record<string, string | string[]>  // 기본: 첫 번째 선택지
}

const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)))

function hexacoAnswers(target: Record<HexacoFactor, number>) {
  const out: Record<string, number> = {}
  QUESTIONS.forEach((q, i) => {
    // 문항마다 조금씩 흔들어 요인 안에서 응답이 한 값으로 고정되지 않게
    const v = clamp(target[q.factor] + [0, 0.4, -0.4, 0][i % 4])
    out[q.id] = q.reverse ? 6 - v : v
  })
  return out
}

export function careerAnswers(p: Persona): Answers {
  const a: Answers = {}
  const interestType = Object.fromEntries(INTEREST_ITEMS.map(i => [i.id, i.type]))
  const dimOf = Object.fromEntries([...ATTACHMENT_ITEMS, ...STRESS_ITEMS, ...STYLE_ITEMS].map(i => [i.id, { dim: i.dim, reverse: !!i.reverse }]))
  for (const s of buildScreens(p.stage, p.plan)) {
    if (s.kind === 'cards') {
      for (const v of ['성장', '도전', '안정', '보상', '자율', '동료', '인정', '주도', '기여', '균형'] as WorkValue[]) {
        a[`${s.keyPrefix}${v}`] = s.keyPrefix === 'V_' ? (p.values[v] ?? 3) : (p.fulfillment?.[v] ?? 3)
      }
    } else if (s.kind === 'scale') {
      const t = interestType[s.id] as Riasec | undefined
      const d = dimOf[s.id]
      let v = p.items?.[s.id] ?? 3
      if (t) v = p.interest[t] ?? 2
      else if (d && (d.dim === 'anxiety' || d.dim === 'avoidance')) v = d.reverse ? 6 - p.attach[d.dim] : p.attach[d.dim]
      else if (d && d.dim in { overwork: 1, withdraw: 1, outburst: 1, rumination: 1, recovery: 1 }) {
        v = p.stress[d.dim as keyof Persona['stress']] ?? (d.dim === 'recovery' ? 3 : 2)
      }
      a[s.id] = clamp(v)
    } else {
      const it = s.item
      const pick = p.choices?.[it.id]
      if (pick !== undefined) a[it.id] = pick
      else if (!it.optional) a[it.id] = it.maxSelect ? [it.options[0]] : it.options[0]
    }
  }
  return a
}

export function samplePersonaScores(p: Persona) {
  const code = encodeHexacoAnswers(hexacoAnswers(p.hexaco))
  return code ? computeScores(p.stage, p.plan, careerAnswers(p), code) : null
}

export const PERSONAS: Persona[] = [
  {
    id: 'high-find', stage: 'high', plan: 'find', who: '고2 · 그림과 글에 끌리지만 부모님은 경영학과를 바람',
    hexaco: { H: 3.6, E: 3.8, X: 2.8, A: 3.4, C: 2.9, O: 4.4 },
    interest: { A: 5, S: 4, I: 3 }, values: { 자율: 5, 성장: 4, 기여: 4, 보상: 2, 안정: 3 },
    attach: { anxiety: 3.5, avoidance: 2.5 }, stress: { rumination: 4, withdraw: 3 },
    items: { HF1: 5, HF2: 2, HF3: 5 },
    choices: { grade: '2학년', strongSubjects: ['국어·문학', '예술·체육'], decision: '관심 분야는 있지만 구체적이지 않다', majorCriteria: ['내가 좋아하는 분야', '부모님·선생님의 추천'] },
  },
  {
    id: 'high-do', stage: 'high', plan: 'do', who: '고3 · 성실하지만 시험만 보면 긴장해서 실수',
    hexaco: { H: 3.8, E: 4.3, X: 2.6, A: 3.6, C: 4.2, O: 3.0 },
    interest: {}, values: { 안정: 5, 인정: 4 },
    attach: { anxiety: 4, avoidance: 2 }, stress: { overwork: 4, rumination: 4, recovery: 3 },
    items: { HD1: 2, HD2: 2, HD3: 5, HD4: 5, HD5: 3, HD6: 4, HD7: 3, WS3: 4, WS8: 5, WS9: 4, WS12: 2 },
    choices: { grade: '3학년', weakSubjects: ['수학', '과학'], track: '수능 위주' },
  },
  {
    id: 'college-find', stage: 'college', plan: 'find', who: '공대 3학년 · 전공은 무난한데 데이터·사회 문제에 더 끌림',
    hexaco: { H: 3.4, E: 2.8, X: 3.0, A: 3.2, C: 3.4, O: 4.1 },
    interest: { I: 5, S: 3, C: 3 }, values: { 성장: 5, 기여: 4, 자율: 4, 보상: 4 },
    attach: { anxiety: 2, avoidance: 3 }, stress: { withdraw: 3 },
    items: { CF1: 3, CF2: 4, CF3: 4, CF4: 3, CF5: 4, CF6: 2 },
    choices: { major: '공학', year: '3학년', decision: '두세 가지 사이에서 고민 중이다', path: ['취업', '대학원·연구'] },
  },
  {
    id: 'college-do', stage: 'college', plan: 'do', who: '경영 2학년 · 팀플은 도맡지만 발표가 두려움',
    hexaco: { H: 3.3, E: 3.6, X: 2.4, A: 3.0, C: 4.3, O: 3.2 },
    interest: {}, values: { 인정: 4, 보상: 4, 안정: 4 },
    attach: { anxiety: 3, avoidance: 3 }, stress: { overwork: 5, outburst: 3 },
    items: { CD1: 4, CD2: 2, CD3: 5, CD4: 5, CD6: 4, WS5: 2, WS6: 5, WS7: 4, WS9: 5 },
    choices: { major: '상경', year: '2학년' },
  },
  {
    id: 'jobseeker-find', stage: 'jobseeker', plan: 'find', who: '인문계 취준 8개월 · 사람 돕는 일이 좋은데 직무를 못 정함',
    hexaco: { H: 4.0, E: 3.9, X: 3.5, A: 4.1, C: 3.1, O: 3.6 },
    interest: { S: 5, A: 4, E: 3 }, values: { 기여: 5, 동료: 5, 안정: 4, 균형: 4, 보상: 3 },
    attach: { anxiety: 3.5, avoidance: 2 }, stress: { rumination: 4, recovery: 4 },
    items: { JF1: 4, JF2: 4, JF3: 5, JF4: 3, JF5: 2, JF6: 2 },
    choices: { major: '인문', prepPeriod: '6개월~1년', decision: '관심 분야만 있다', orgType: ['공기업·공공기관', '중견·중소기업'] },
  },
  {
    id: 'jobseeker-do', stage: 'jobseeker', plan: 'do', who: '공대 취준 1년 · 서류는 붙는데 면접에서 계속 떨어짐',
    hexaco: { H: 3.5, E: 3.7, X: 2.5, A: 3.3, C: 3.9, O: 3.3 },
    interest: {}, values: { 안정: 5, 보상: 4, 성장: 4 },
    attach: { anxiety: 3, avoidance: 3.5 }, stress: { withdraw: 4, rumination: 5 },
    items: { JD1: 2, JD2: 3, JD3: 4, JD4: 4, JD5: 5, JD6: 5, JD7: 2, WS8: 4, WS12: 2 },
    choices: { major: '공학', prepPeriod: '1년 이상', targetGroup: ['개발', '데이터'] },
  },
  {
    id: 'worker-find', stage: 'worker', plan: 'find', who: '영업 5년 차 · 성과는 내는데 지치고 의미를 잃음',
    hexaco: { H: 3.2, E: 3.4, X: 3.8, A: 3.0, C: 3.6, O: 3.9 },
    interest: { A: 4, I: 4, E: 3 }, values: { 자율: 5, 성장: 5, 균형: 4, 보상: 4, 도전: 3 },
    fulfillment: { 자율: 1, 성장: 2, 균형: 2, 보상: 4, 동료: 3 },
    attach: { anxiety: 2, avoidance: 3 }, stress: { overwork: 4, outburst: 3, recovery: 2 },
    items: { WF1: 4, WF2: 5, WF3: 4, WF4: 4, WF5: 2 },
    choices: { currentJob: 'B2B 영업·사업개발', years: '3~5년', direction: '전혀 다른 분야로 전환' },
  },
  {
    id: 'worker-do', stage: 'worker', plan: 'do', who: '개발 7년 차 · 팀장 제안을 받고 전문가 트랙과 고민',
    hexaco: { H: 3.9, E: 2.6, X: 2.9, A: 3.5, C: 4.0, O: 4.0 },
    interest: {}, values: { 성장: 5, 자율: 4, 인정: 3 },
    attach: { anxiety: 2, avoidance: 3.5 }, stress: { overwork: 3, recovery: 4 },
    items: { WD1: 3, WD2: 2, WD3: 4, WD4: 5, WD5: 4, WD6: 4, WD7: 3, WD8: 2, WD9: 4, WD10: 4, WS3: 5, WS5: 2, WS6: 4, WS11: 4, WS12: 4 },
    choices: { currentJob: '백엔드 개발자', years: '5~10년', track: '아직 모르겠다' },
  },
]
