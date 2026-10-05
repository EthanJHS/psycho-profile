// 친구와 비교하기 — 링크에 담는 짧은 코드와 비교 계산 (언어 무관)
// 코드에는 원형과 6요인 점수만 담는다. 48개 응답 전체는 넣지 않음 (결과 링크 코드와 달리 응답을 복원할 수 없음)
import { ARCHETYPES, type HexacoFactor, type HexacoResult } from './scoring-hexaco'

export const COMPARE_FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
export const COMPARE_PENDING_KEY = 'ct_compare_pending'   // 친구 링크로 들어와 검사하러 간 동안 코드를 기억

export interface CompareProfile { archetypeId: string; raw: Record<HexacoFactor, number> }

const PREFIX = 'c'
const STEPS = 32   // 요인 점수는 8문항 평균이라 (점수-1)×8이 0~32의 정수

// 'c' + 원형 번호 1글자 + 요인 6글자 (36진수) = 8글자
export function encodeCompareCode(result: HexacoResult): string | null {
  const idx = ARCHETYPES.findIndex(a => a.id === result.primary.id)
  if (idx < 0) return null
  const digits = COMPARE_FACTORS.map(f => Math.round((result.scores.raw[f] - 1) * 8))
  if (digits.some(d => !Number.isInteger(d) || d < 0 || d > STEPS)) return null
  return PREFIX + idx.toString(36) + digits.map(d => d.toString(36)).join('')
}

export function decodeCompareCode(code: string | null | undefined): CompareProfile | null {
  if (!code || code.length !== 8 || code[0] !== PREFIX || !/^[0-9a-z]+$/.test(code)) return null
  const archetype = ARCHETYPES[parseInt(code[1], 36)]
  if (!archetype) return null
  const raw = {} as Record<HexacoFactor, number>
  for (let i = 0; i < COMPARE_FACTORS.length; i++) {
    const d = parseInt(code[2 + i], 36)
    if (d > STEPS) return null
    raw[COMPARE_FACTORS[i]] = Math.round((1 + d / 8) * 100) / 100   // 채점 모듈과 같은 반올림
  }
  return { archetypeId: archetype.id, raw }
}

export const profileOf = (result: HexacoResult): CompareProfile => ({ archetypeId: result.primary.id, raw: result.scores.raw })

export interface FactorDiff { factor: HexacoFactor; mine: number; theirs: number; gap: number; relation: 'similar' | 'meHigher' | 'themHigher' }
export interface Comparison { similarity: number; factors: FactorDiff[]; closest: FactorDiff; farthest: FactorDiff; sameArchetype: boolean }

const SIMILAR_GAP = 0.5   // 이 미만이면 "비슷하다"로 봄

export function compareProfiles(mine: CompareProfile, theirs: CompareProfile): Comparison {
  const factors: FactorDiff[] = COMPARE_FACTORS.map(f => {
    const gap = Math.abs(mine.raw[f] - theirs.raw[f])
    return { factor: f, mine: mine.raw[f], theirs: theirs.raw[f], gap, relation: gap < SIMILAR_GAP ? 'similar' : mine.raw[f] > theirs.raw[f] ? 'meHigher' : 'themHigher' }
  })
  const meanGap = factors.reduce((s, x) => s + x.gap, 0) / factors.length
  const sorted = [...factors].sort((a, b) => a.gap - b.gap)
  return {
    // 6요인 점수 차이의 평균을 0~100으로 옮긴 값 (평균 차이 2.5점 이상이면 0). 궁합 점수가 아니라 "성향이 얼마나 비슷한가"
    similarity: Math.max(0, Math.min(100, Math.round((1 - meanGap / 2.5) * 100))),
    factors, closest: sorted[0], farthest: sorted[sorted.length - 1],
    sameArchetype: mine.archetypeId === theirs.archetypeId,
  }
}
