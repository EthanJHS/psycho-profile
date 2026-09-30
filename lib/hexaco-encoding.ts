import { QUESTIONS } from './scoring-hexaco'

// 48개 응답(1~5)을 5진수로 묶어 36진수 문자열로 변환 (~22자).
// 맨 앞 글자는 문항 버전 — 문항 구성이 바뀌면 올려서 옛 링크가 새 문항으로 잘못 해석되지 않게 함.
const VERSION = 'b' // b = hexaco-v2 (2026-09-25 문항 교체 이후)

export function encodeHexacoAnswers(answers: Record<string, number>): string | null {
  let n = BigInt(0)
  for (const q of QUESTIONS) {
    const v = answers[q.id]
    if (!Number.isInteger(v) || v < 1 || v > 5) return null
    n = n * BigInt(5) + BigInt(v - 1)
  }
  return VERSION + n.toString(36)
}

export function decodeHexacoAnswers(code: string): Record<string, number> | null {
  if (!code.startsWith(VERSION) || !/^[0-9a-z]+$/.test(code.slice(1))) return null
  let n = BigInt(0)
  for (const ch of code.slice(1)) n = n * BigInt(36) + BigInt(parseInt(ch, 36))
  const out: Record<string, number> = {}
  for (let i = QUESTIONS.length - 1; i >= 0; i--) {
    out[QUESTIONS[i].id] = Number(n % BigInt(5)) + 1
    n = n / BigInt(5)
  }
  return n === BigInt(0) ? out : null
}
