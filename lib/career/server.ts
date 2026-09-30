// 서버 전용 — 진로 검사 기록 생성·응답 검증 (브라우저가 보낸 점수를 믿지 않고 응답으로 다시 계산)
import { createClient } from '@supabase/supabase-js'
import { buildScreens } from './flow'
import type { Answers } from './score'
import { VALUE_CARDS, LIFE_STAGES, type LifeStage, type Plan } from '../paid-v2/items'

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const PLANS: Plan[] = ['find', 'do', 'both']

export function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return key ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key) : null
}

export const isStage = (v: unknown): v is LifeStage => LIFE_STAGES.some(s => s.id === v)
export const isPlan = (v: unknown): v is Plan => PLANS.includes(v as Plan)

const isScale = (v: unknown, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= max

// 이 시기·목적의 화면에 있는 문항만 남기고, 값이 선택지 범위 안인지 확인. 빠진 필수 문항이 있으면 null
export function sanitizeAnswers(stage: LifeStage, plan: Plan, raw: unknown): Answers | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, unknown>
  const out: Answers = {}
  for (const s of buildScreens(stage, plan)) {
    if (s.kind === 'scale') {
      if (!isScale(a[s.id], s.scale.length)) return null
      out[s.id] = a[s.id] as number
    } else if (s.kind === 'cards') {
      for (const v of VALUE_CARDS) {
        const k = `${s.keyPrefix}${v.id}`
        if (!isScale(a[k], s.scale.length)) return null
        out[k] = a[k] as number
      }
    } else {
      const it = s.item
      const v = a[it.id]
      if (v == null || (Array.isArray(v) && v.length === 0)) {
        if (it.optional) continue
        return null
      }
      if (it.maxSelect) {
        if (!Array.isArray(v) || v.length > it.maxSelect || new Set(v).size !== v.length || !v.every(o => it.options.includes(o))) return null
        out[it.id] = v as string[]
      } else {
        if (typeof v !== 'string' || !it.options.includes(v)) return null
        out[it.id] = v
      }
    }
  }
  return out
}
