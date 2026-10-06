// 원형 소개 페이지에 쓰는 계산 — 판정에 쓰는 원형 프로필(lib/scoring-hexaco.ts ARCHETYPES)에서 그대로 뽑는다
// (소개 문구를 따로 지어내지 않아, 판정 기준을 바꾸면 소개도 함께 바뀜)
import { ARCHETYPES, type HexacoFactor } from './scoring-hexaco'

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']

export interface DefiningFactor { factor: HexacoFactor; dir: 'high' | 'low'; strong: boolean }

// 이 원형의 조건이 되는 요인 (프로필 값 ±1 = 뚜렷함, ±0.5 = 약하게)
export function definingFactors(id: string): DefiningFactor[] {
  const a = ARCHETYPES.find(x => x.id === id)
  if (!a) return []
  return FACTORS.filter(f => a.profile[f] !== 0)
    .map(f => ({ factor: f, dir: a.profile[f] > 0 ? 'high' as const : 'low' as const, strong: Math.abs(a.profile[f]) >= 1 }))
    .sort((x, y) => Number(y.strong) - Number(x.strong))
}

export interface SimilarArchetype { id: string; factor: HexacoFactor; otherHigher: boolean }

// 프로필이 가장 가까운 원형들과, 둘을 가르는 가장 큰 차이 요인
export function similarArchetypes(id: string, n = 3): SimilarArchetype[] {
  const a = ARCHETYPES.find(x => x.id === id)
  if (!a) return []
  return ARCHETYPES.filter(b => b.id !== id)
    .map(b => {
      const diffs = FACTORS.map(f => ({ f, d: b.profile[f] - a.profile[f] }))
      const top = diffs.reduce((m, x) => (Math.abs(x.d) > Math.abs(m.d) ? x : m))
      return { id: b.id, dist: Math.sqrt(diffs.reduce((s, x) => s + x.d * x.d, 0)), factor: top.f, otherHigher: top.d > 0 }
    })
    .sort((x, y) => x.dist - y.dist)
    .slice(0, n)
    .map(({ id, factor, otherHigher }) => ({ id, factor, otherHigher }))
}
