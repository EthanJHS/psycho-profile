'use client'

import { QUESTIONS } from '../scoring-hexaco'
import { encodeHexacoAnswers } from '../hexaco-encoding'

// 무료 검사 응답(48문항)을 읽고 검증 — 하나라도 빠지거나 1~5 밖이면 null
export function readFreeAnswers(): Record<string, number> | null {
  try {
    const a = JSON.parse(sessionStorage.getItem('hexaco_answers') ?? 'null') as Record<string, unknown> | null
    if (!a) return null
    for (const q of QUESTIONS) {
      const v = a[q.id]
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5) return null
    }
    return a as Record<string, number>
  } catch { return null }
}

// 무료 결과를 짧은 코드로 — 유료 검사 기록에 함께 남겨 두 검사를 확실히 잇는다
export function freeResultCode(a: Record<string, number>): string | null {
  return encodeHexacoAnswers(a)
}
