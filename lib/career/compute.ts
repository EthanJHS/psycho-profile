// 응답 + 무료 결과 코드 → 저장·리포트에 쓰는 진로 점수 (서버 채점과 샘플 리포트가 같은 계산을 씀)
import { scoreCareer, type Answers } from './score'
import { scoreHexaco } from '../scoring-hexaco'
import { decodeHexacoAnswers } from '../hexaco-encoding'
import type { LifeStage, Plan } from '../paid-v2/items'

export function computeScores(stage: LifeStage, plan: Plan, answers: Answers, freeCode: string) {
  const hexAnswers = decodeHexacoAnswers(freeCode)
  if (!hexAnswers) return null
  const hex = scoreHexaco(hexAnswers)
  return {
    ...scoreCareer(stage, plan, answers, hex.scores.raw, hexAnswers),
    archetype: { id: hex.primary.id, name: hex.primary.name },
    freeResultCode: freeCode,
  }
}
