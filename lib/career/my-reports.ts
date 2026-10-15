'use client'

import type { LifeStage, Plan } from '../paid-v2/items'

// 이 기기에서 만든 진로 리포트 목록 — 계정이 없어서 링크를 잃어버려도 같은 기기에서는 다시 찾을 수 있게
export interface MyReport { id: string; stage: LifeStage; plan: Plan; at: string }
const KEY = 'ct_career_reports'

export function loadMyReports(): MyReport[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

export function rememberReport(r: MyReport) {
  try {
    const list = [r, ...loadMyReports().filter(x => x.id !== r.id)].slice(0, 20)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* 저장 공간을 못 쓰는 환경 — 링크 복사 안내로 대신 */ }
}

// 결제는 했지만 아직 리포트까지 가지 않은 주문 — 창을 닫았다가 돌아와도 이어갈 수 있게
export interface MyOrder { id: string; stage: LifeStage; plan: Plan; at: string }
const ORDER_KEY = 'ct_career_orders'

export function loadMyOrders(): MyOrder[] {
  try {
    const v = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

export function rememberOrder(o: MyOrder) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify([o, ...loadMyOrders().filter(x => x.id !== o.id)].slice(0, 20)))
  } catch { /* 저장 공간 없음 */ }
}

export function forgetOrder(id: string) {
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(loadMyOrders().filter(x => x.id !== id))) } catch { /* 저장 공간 없음 */ }
}
