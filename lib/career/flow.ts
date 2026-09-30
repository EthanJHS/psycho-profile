// 시기·목적 조합에 맞춰 화면 순서를 만든다 (답 키는 채점 엔진과 공유)
import {
  STAGE_BACKGROUND, STAGE_GOAL_MODULES, INTEREST_ITEMS, INTEREST_PROMPT, INTEREST_SCALE, STYLE_ITEMS, STYLE_PROMPT,
  VALUE_CARDS, VALUE_PROMPT, VALUE_SCALE, ATTACHMENT_ITEMS, ATTACHMENT_PROMPT, STRESS_ITEMS, STRESS_PROMPT, AGREE_SCALE,
  type LifeStage, type Plan, type Goal, type ChoiceItem,
} from '../paid-v2/items'
import { CAREER_JOBS, JOB_GROUPS } from './jobs'

// v2: 2026-09-30 무료 검사와 겹치는 문항 정리 (WS1·HD8·CD5 삭제 → 무료 응답 재사용, AT5·AT8·ST9·WS6·IA3·IC1 수정)
export const ITEM_BANK_VERSION = 'career-v2'

export type Screen =
  | { kind: 'choice'; section: string; item: ChoiceItem }
  | { kind: 'scale'; section: string; id: string; prompt: string; text: string; scale: string[] }
  | { kind: 'cards'; section: string; keyPrefix: 'V_' | 'F_'; prompt: string; scale: string[] }

// 직무 분류로 채워야 하는 선택지
function fillOptions(c: ChoiceItem): ChoiceItem {
  if (c.options.length) return c
  if (c.id === 'currentJob') return { ...c, options: [...CAREER_JOBS.map(j => j.name), '기타'] }
  if (c.id === 'targetGroup') return { ...c, options: [...JOB_GROUPS] }
  return c
}

export function buildScreens(stage: LifeStage, plan: Plan): Screen[] {
  const goals: Goal[] = plan === 'both' ? ['find', 'do'] : [plan]
  const screens: Screen[] = STAGE_BACKGROUND[stage].map(item => ({ kind: 'choice', section: '기본 정보', item: fillOptions(item) }))

  for (const g of goals) {
    const m = STAGE_GOAL_MODULES[stage][g]
    screens.push(...m.choices.map(item => ({ kind: 'choice' as const, section: m.title, item: fillOptions(item) })))
    screens.push(...m.items.map(i => ({ kind: 'scale' as const, section: m.title, id: i.id, prompt: m.prompt, text: i.text, scale: AGREE_SCALE })))
    if (g === 'find') {
      screens.push(...INTEREST_ITEMS.map(i => ({ kind: 'scale' as const, section: '흥미', id: i.id, prompt: INTEREST_PROMPT, text: i.text, scale: INTEREST_SCALE })))
    } else {
      screens.push(...STYLE_ITEMS.map(i => ({ kind: 'scale' as const, section: '일하는 방식', id: i.id, prompt: STYLE_PROMPT[stage], text: i.text[stage], scale: AGREE_SCALE })))
    }
    if (m.fulfillment) screens.push({ kind: 'cards', section: '지금 직장', keyPrefix: 'F_', prompt: m.fulfillment.prompt, scale: m.fulfillment.scale })
  }

  screens.push({ kind: 'cards', section: '가치', keyPrefix: 'V_', prompt: VALUE_PROMPT[stage], scale: VALUE_SCALE })
  screens.push(...ATTACHMENT_ITEMS.map(i => ({ kind: 'scale' as const, section: '관계', id: i.id, prompt: ATTACHMENT_PROMPT[stage], text: i.text[stage], scale: AGREE_SCALE })))
  screens.push(...STRESS_ITEMS.map(i => ({ kind: 'scale' as const, section: '스트레스', id: i.id, prompt: STRESS_PROMPT[stage], text: i.text[stage], scale: AGREE_SCALE })))
  return screens
}

export function isAnswered(s: Screen, a: Record<string, unknown>): boolean {
  if (s.kind === 'scale') return typeof a[s.id] === 'number'
  if (s.kind === 'cards') return VALUE_CARDS.every(v => typeof a[`${s.keyPrefix}${v.id}`] === 'number')
  if (s.item.optional) return true
  const v = a[s.item.id]
  return Array.isArray(v) ? v.length > 0 : typeof v === 'string'
}

// 리포트까지 만들어 둔 조합 — 4개 시기 × 탐색·향상·묶음 전부
export const isAvailable = (_stage: LifeStage, _plan: Plan) => true
