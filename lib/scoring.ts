import { Answer, ArchetypeId, ModeId, DriveId } from '@/types'
import { buildLayeredResult } from './profiles'

export interface ScoringOutput {
  result: ReturnType<typeof buildLayeredResult>
  facets: Record<string, number>
  cogScore: number
  life: Record<string, string>
  consistencyScore: number  // 0=일관됨, >2.5=응답 비일관, max≈4
}

// ─── Big Five 패싯 점수 맵 (1~5 스케일) ────────────────────────────────
type FacetKey = 'curiosity' | 'diligence' | 'boldness' | 'patience' | 'anxiety' | 'humility'

const FACET_MAP: Record<string, Record<string, Partial<Record<FacetKey, number>>>> = {
  // ── Section 1: 세계와의 인터페이스 (Q1~Q7) ──
  Q1: { A: { boldness: 5 }, B: { boldness: 3.5 }, C: { boldness: 2.2 }, D: { boldness: 1 } },
  Q2: { A: { diligence: 5 }, B: { diligence: 3 }, C: { diligence: 1 } },
  Q3: { A: { curiosity: 5 }, B: { curiosity: 3.2 }, C: { curiosity: 1.5 } },
  Q4: { A: { patience: 2 }, B: { patience: 3.5 }, C: { patience: 4.8 } },
  Q5: { A: { anxiety: 1 }, B: { anxiety: 2.5 }, C: { anxiety: 4.8 } },
  Q6: { A: { anxiety: 1 }, B: { anxiety: 2.5 }, C: { anxiety: 5 } },
  Q7: { A: { humility: 5 }, B: { humility: 3.5 }, C: { humility: 1.5 } },

  // ── Section 2: 결정의 아키텍처 (Q8~Q15) ──
  // Q8=regulatory_focus, Q10=locus_of_control → computeArchetype에서만 사용
  Q9:  { A: { diligence: 4.5, curiosity: 1.5 }, B: { diligence: 3, curiosity: 3.8 }, C: { diligence: 1, curiosity: 5 } },
  Q11: { A: { humility: 2 }, B: { humility: 4.8 }, C: { humility: 3.2 } },
  Q12: { A: { diligence: 2.5 }, B: { diligence: 4.8 }, C: { diligence: 3 } },
  Q13: { A: { curiosity: 1.5 }, B: { curiosity: 5 }, C: { curiosity: 3 } },
  Q14: { A: { curiosity: 1 }, B: { curiosity: 4.5 }, C: { curiosity: 3.5 } },
  Q15: { A: { anxiety: 1 }, B: { anxiety: 2.5 }, C: { anxiety: 5 } },

  // ── 역문항 (QR1~QR6): 높은 trait = 마지막 옵션(C), 낮은 trait = 첫 옵션(A) ──
  // boldness_r: A=집에서 쉼(1) B=수동적(2.5) C=먼저 연락(5)
  QR1: { A: { boldness: 1 }, B: { boldness: 2.5 }, C: { boldness: 5 } },
  // diligence_r: A=미룸(1) B=조금씩(3) C=오늘 분량 완수(5)
  QR2: { A: { diligence: 1 }, B: { diligence: 3 }, C: { diligence: 5 } },
  // curiosity_r: A=변화 거부(1) B=수용(2.5) C=바로 탐색(5)
  QR3: { A: { curiosity: 1 }, B: { curiosity: 2.5 }, C: { curiosity: 5 } },
  // patience_r: A=반대 의견 표명(1.5) B=조용히 말함(3) C=일단 따름(5)
  QR4: { A: { patience: 1.5 }, B: { patience: 3 }, C: { patience: 5 } },
  // anxiety_r: A=그냥 기쁨(1) B=약간 확인(3) C=걱정 앞섬(5)
  QR5: { A: { anxiety: 1 }, B: { anxiety: 3 }, C: { anxiety: 5 } },
  // humility_r: A=자기 공적 주장(1) B=팀 공유(3) C=팀원 공으로 돌림(5)
  QR6: { A: { humility: 1 }, B: { humility: 3 }, C: { humility: 5 } },

  // ── Section 3: 관계의 역학 (Q16~Q25) ──
  Q16: { A: { patience: 1.5, boldness: 4 }, B: { patience: 3.5, boldness: 3 }, C: { patience: 4.8, boldness: 1.5 } },
  Q17: { A: { boldness: 5 }, B: { boldness: 3 }, C: { boldness: 1 } },
  Q18: { A: { humility: 1.5 }, B: { humility: 5 }, C: { humility: 3 } },
  Q19: { A: { patience: 1.5 }, B: { patience: 3.5 }, C: { patience: 4.8 } },
  Q20: { A: { anxiety: 1 }, B: { anxiety: 5 }, C: { anxiety: 3 } },
  Q21: { A: { curiosity: 4.5 }, B: { curiosity: 2.5 }, C: { curiosity: 1 } },
  Q22: { A: { boldness: 5 }, B: { boldness: 1.5 }, C: { boldness: 3 } },
  Q23: { A: { boldness: 5 }, B: { boldness: 3 }, C: { boldness: 1 } },
  Q24: { A: { humility: 5 }, B: { humility: 3.5 }, C: { humility: 1.5 } },
  Q25: { A: { patience: 4.5 }, B: { patience: 3 }, C: { patience: 1.5 } },
}

// ─── 패싯 평균 계산 ───────────────────────────────────────────────────
function computeFacets(answers: Record<string, string>): Record<FacetKey, number> {
  const sums: Record<FacetKey, number[]> = {
    curiosity: [], diligence: [], boldness: [],
    patience: [], anxiety: [], humility: [],
  }

  for (const [qId, val] of Object.entries(answers)) {
    const qMap = FACET_MAP[qId]
    if (!qMap) continue
    const scores = qMap[val]
    if (!scores) continue
    for (const [facet, score] of Object.entries(scores) as [FacetKey, number][]) {
      sums[facet].push(score)
    }
  }

  const result = {} as Record<FacetKey, number>
  for (const [facet, vals] of Object.entries(sums) as [FacetKey, number[]][]) {
    result[facet] = vals.length > 0
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : 3
  }
  return result
}

// ─── 인지 모드 결정 (Q26~Q31) ─────────────────────────────────────────
// 각 모드 최대 점수: analytical≈9 / intuitive≈9 / pragmatic≈5.5 / integrative≈8
function computeMode(answers: Record<string, string>): ModeId {
  let analytical = 0, intuitive = 0, pragmatic = 0, integrative = 0

  // Q26: 데이터 vs 직관 vs 혼합 — 3방향 균등 기여
  if (answers['Q26'] === 'A') analytical += 2
  else if (answers['Q26'] === 'B') intuitive += 2
  else integrative += 2

  // Q27: 신념 업데이트 속도 — 빠름=분석적 확신, 저항=직관 우위
  if (answers['Q27'] === 'A') analytical += 1.5
  else if (answers['Q27'] === 'B') integrative += 1
  else intuitive += 2

  // Q28: 아이디어 접근 — 작동방식=실용, 원리=분석, 사례=통합
  if (answers['Q28'] === 'A') pragmatic += 2.5
  else if (answers['Q28'] === 'B') analytical += 1.5
  else integrative += 2

  // Q29: 복잡한 문제 — 몰두=통합, 낭비=실용, 일정선=분석+직관
  if (answers['Q29'] === 'A') integrative += 2
  else if (answers['Q29'] === 'B') pragmatic += 3
  else { analytical += 1; intuitive += 1 }

  // Q30: 시간 지향 — 현재=직관, 미래=분석, 과거패턴=통합
  if (answers['Q30'] === 'A') intuitive += 2
  else if (answers['Q30'] === 'B') analytical += 1.5
  else integrative += 2

  // Q31: 전체 vs 세부 — 패턴=직관, 세부=분석
  if (answers['Q31'] === 'A') intuitive += 2
  else analytical += 1.5

  const scores = { analytical, intuitive, pragmatic, integrative }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as ModeId
}

// ─── 핵심 동력 결정 (Q32~Q35) ─────────────────────────────────────────
function computeDrive(answers: Record<string, string>): DriveId {
  let achievement = 0, connection = 0, autonomy = 0, security = 0

  // Q32: 핵심 가치 (가중치 3)
  if (answers['Q32'] === 'A') autonomy += 3
  else if (answers['Q32'] === 'B') security += 3
  else if (answers['Q32'] === 'C') achievement += 3
  else if (answers['Q32'] === 'D') connection += 3

  // Q33: 그림자 (가중치 1)
  if (answers['Q33'] === 'A') achievement += 1
  else if (answers['Q33'] === 'B') autonomy += 1
  else if (answers['Q33'] === 'C') connection += 1

  // Q34: 핵심 두려움 (가중치 2)
  if (answers['Q34'] === 'A') achievement += 2
  else if (answers['Q34'] === 'B') connection += 2
  else if (answers['Q34'] === 'C') autonomy += 2
  else if (answers['Q34'] === 'D') security += 2

  // Q33: 그림자 D — "위의 것들이 거의 없다" = 안정 지향 신호
  if (answers['Q33'] === 'D') security += 1

  // Q35: 자부심 원천 (가중치 2) — 4방향 균등 배분
  if (answers['Q35'] === 'A') achievement += 2       // 난제 해결
  else if (answers['Q35'] === 'B') connection += 2   // 누군가에게 필요한 존재
  else if (answers['Q35'] === 'C') security += 2     // 내 기준 끝까지 지킴 = 안정/일관성
  else if (answers['Q35'] === 'D') autonomy += 2     // 없던 것 창조 = 자율 표현

  const scores = { achievement, connection, autonomy, security }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as DriveId
}

// ─── 원형 결정 ─────────────────────────────────────────────────────────
function computeArchetype(
  facets: Record<FacetKey, number>,
  regulatory: string, // Q8: A=promotion, B=prevention
  locus: string,      // Q10: A=internal, B=external, C=mixed
): ArchetypeId {
  const n = (v: number) => (v - 1) / 4
  const O = n(facets.curiosity)
  const C = n(facets.diligence)
  const E = n(facets.boldness)
  const A = n(facets.patience)
  const N = n(facets.anxiety)
  const H = n(facets.humility)

  // 반대 특성에 패널티를 추가해 평균값에서 특정 원형이 독점하지 않도록 함
  const scores: Record<ArchetypeId, number> = {
    // 높은 O+C, 낮은 E+N → 내향적 체계 설계자
    architect:   O * 2 + C * 2.5 - E * 0.5 - N * 0.5,
    // 높은 A+C, 낮은 N → 안정 수호자 (O 높으면 탐험가와 구분)
    guardian:    A * 2.5 + C * 1.5 - N * 1.5 - O * 0.3,
    // 높은 O+E, 낮은 C → 자유 탐험가
    explorer:    O * 2.5 + E * 2 - C * 1,
    // 높은 O+N, 낮은 E → 예민한 통찰자
    prophet:     O * 1.5 + N * 2.5 - E * 1,
    // 높은 C+E, 낮은 A → 목표 지향 전사
    warrior:     C * 2 + E * 2.5 - A * 1,
    // 높은 O+A, 중간 C → 유연한 변환자
    alchemist:   O * 2 + A * 2 - Math.abs(N - 0.5) * 1,
    // 높은 E+C, 낮은 H → 지배적 군주
    sovereign:   E * 2.5 + C * 1.5 - H * 2,
    // 높은 O+H, 낮은 E → 깊은 지혜자
    sage:        O * 2 + H * 2.5 - E * 1,
    // 높은 A, 중간 E, 낮은 N → 조율자
    harmonizer:  A * 3 - Math.abs(E - 0.5) * 2 - N * 0.5,
    // 낮은 H+A, 높은 O → 체제 저항자
    rebel:       (1 - H) * 2.5 + O * 1 - A * 0.5,
    // 높은 A+N, 중간 E → 깊은 연결 추구자
    lover:       A * 2 + N * 1.5 - C * 0.5,
    // 높은 E+O, 낮은 C → 변화 촉발자
    catalyst:    E * 2.5 + O * 1 - C * 0.5,
  }

  if (regulatory === 'A') {
    scores.explorer += 0.4; scores.catalyst += 0.4; scores.warrior += 0.2
  } else {
    scores.guardian += 0.4; scores.sage += 0.3; scores.architect += 0.3
  }

  if (locus === 'A') {
    scores.warrior += 0.3; scores.architect += 0.2; scores.rebel += 0.2
  } else if (locus === 'B') {
    scores.harmonizer += 0.3; scores.lover += 0.2
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as ArchetypeId
}

// ─── 인지 점수 프록시 (Q26~Q31) ───────────────────────────────────────
function computeCogScore(answers: Record<string, string>): number {
  let score = 0.52
  if (answers['Q29'] === 'A') score += 0.16  // 복잡한 문제 즐김
  if (answers['Q26'] === 'A') score += 0.10  // 분석 신뢰
  if (answers['Q27'] === 'A') score += 0.08  // 빠른 업데이트
  if (answers['Q28'] === 'B') score += 0.07  // 추상 원리 추구
  if (answers['Q31'] === 'A') score += 0.06  // 전체 구조 파악
  return Math.min(score, 0.98)
}

// ─── 일관성 점수 (역문항↔정문항 쌍 비교) ─────────────────────────────
// 0 = 완전히 일관됨, >2.5 = 비일관 의심, max ≈ 4
function computeConsistencyScore(answers: Record<string, string>): number {
  const pairs: Array<{ fwd: string; rev: string; facet: FacetKey }> = [
    { fwd: 'Q1',  rev: 'QR1', facet: 'boldness'   },
    { fwd: 'Q5',  rev: 'QR5', facet: 'anxiety'    },
    { fwd: 'Q4',  rev: 'QR4', facet: 'patience'   },
    { fwd: 'Q7',  rev: 'QR6', facet: 'humility'   },
    { fwd: 'Q2',  rev: 'QR2', facet: 'diligence'  },
    { fwd: 'Q3',  rev: 'QR3', facet: 'curiosity'  },
  ]
  const diffs: number[] = []
  for (const { fwd, rev, facet } of pairs) {
    const fwdScore = FACET_MAP[fwd]?.[answers[fwd]]?.[facet]
    const revScore = FACET_MAP[rev]?.[answers[rev]]?.[facet]
    if (fwdScore !== undefined && revScore !== undefined) {
      diffs.push(Math.abs(fwdScore - revScore))
    }
  }
  return diffs.length > 0
    ? diffs.reduce((a, b) => a + b, 0) / diffs.length
    : 0
}

// ─── 메인 스코어링 함수 ────────────────────────────────────────────────
export function scoreAnswers(answers: Answer[]): ScoringOutput {
  const answerMap: Record<string, string> = {}
  for (const a of answers) {
    answerMap[a.questionId] = String(a.value)
  }

  const facets = computeFacets(answerMap)
  const mode = computeMode(answerMap)
  const drive = computeDrive(answerMap)
  const archetype = computeArchetype(
    facets,
    answerMap['Q8'] ?? 'A',   // regulatory_focus
    answerMap['Q10'] ?? 'C',  // locus_of_control
  )
  const cogScore = computeCogScore(answerMap)
  const consistencyScore = computeConsistencyScore(answerMap)

  const result = buildLayeredResult(archetype, mode, drive, facets, cogScore)

  return {
    result,
    facets: facets as Record<string, number>,
    cogScore,
    life: {},
    consistencyScore,
  }
}
