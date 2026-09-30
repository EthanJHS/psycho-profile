// 유료 검사 답변을 URL-safe 문자열로 인코딩/디코딩
// PQ1~PQ86 순서로 점수(1~5)를 연결한 86자리 문자열 → btoa → URL-safe base64
// 예: "3124531245..." → "MzEyNDU..."

import { PAID_QUESTIONS } from './paid-questions'

export type PaidAnswerObj = { id: string; score: number }

export function encodePaidAnswers(answers: PaidAnswerObj[]): string {
  const map = Object.fromEntries(answers.map(a => [a.id, a.score]))
  const digits = PAID_QUESTIONS.map(q => String(map[q.id] ?? 3)).join('')
  // btoa → URL-safe (replace +/ with -_)
  return btoa(digits).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodePaidAnswers(encoded: string): PaidAnswerObj[] {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const digits = atob(b64)
    return PAID_QUESTIONS.map((q, i) => ({
      id: q.id,
      score: Number(digits[i]) || 3,
    }))
  } catch {
    return []
  }
}
