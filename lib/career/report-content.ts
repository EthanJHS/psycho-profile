// CORE CAREER 리포트 — 문구 라이브러리 + 조합별 조립기
// 골격: 성향(나는 이런 사람) → 상황(시기·목적 모듈) → 행동(탐색=선택, 향상=실행)
// 원칙: 단정·진단 표현 금지 · 점수 근거를 함께 보여줌 · 불안을 자극하는 문구 금지

import { scoreHexaco, type HexacoFactor } from '../scoring-hexaco'
import { decodeHexacoAnswers } from '../hexaco-encoding'
import { CLOSE_CALL_GAP } from '../personalize-result'
import type { Riasec, WorkValue } from '../jobs-v2'
import { VALUE_CARDS, LIFE_STAGES, type LifeStage, type Plan, type Goal } from '../paid-v2/items'
import { CAREER_JOBS } from './jobs'
import { MAJORS } from './majors'
import type { CareerScores, JobMatch } from './score'

// ═══════════════ 공통 도구 ═══════════════
type Pair = '을/를' | '이/가' | '은/는' | '과/와' | '이에요/예요' | '으로/로'
// 받침에 맞는 조사 — 괄호 속 영문은 발음에서 빼고 판단 ("품질관리(QA·QC)" → "품질관리")
export function p(word: string, pair: Pair): string {
  const spoken = word.replace(/\([^)]*\)\s*$/, '').trim()
  const code = spoken.charCodeAt(spoken.length - 1) - 0xac00
  const isHangul = code >= 0 && code <= 11171
  const final = isHangul ? code % 28 : 0
  const [a, b] = pair.split('/')
  if (pair === '으로/로') return final !== 0 && final !== 8 ? a : b   // ㄹ 받침은 "로"
  return final !== 0 ? a : b
}
export const w = (word: string, pair: Pair) => word + p(word, pair)
const hi = (x: number | undefined) => (x ?? 0) >= 3.6
const lo = (x: number | undefined) => (x ?? 5) <= 2.4
const stageLabel = (s: LifeStage) => LIFE_STAGES.find(x => x.id === s)!.label
const f1 = (x: number) => x.toFixed(1)
// 목록을 요약할 때 생략 사실을 남김 ("A, B, C 등 5개")
const listShort = (xs: string[], n = 3) => (xs.length > n ? `${xs.slice(0, n).join(', ')} 등 ${xs.length}개` : xs.join(', '))

// ═══════════════ 리포트 구조 ═══════════════
export type Block =
  | { type: 'text'; text: string }
  | { type: 'callout'; tone: 'gold' | 'plain' | 'warn'; title?: string; text: string }
  | { type: 'bars'; items: { label: string; value: number; strong?: boolean }[] }
  | { type: 'list'; title?: string; items: string[]; ordered?: boolean }
  | { type: 'tags'; title?: string; items: string[] }
  | { type: 'picks'; items: Pick[] }
  | { type: 'steps'; items: { when: string; what: string }[] }
  | { type: 'note'; text: string }
  | { type: 'form'; title: string; fields: string[]; note?: string; rows?: number }   // 직접 채워 쓰는 짧은 양식 (행동을 바로 시작할 수 있게). rows = 지시한 최소 행 수
export interface Pick {
  rank: number; name: string; meta: string; badge?: string; desc: string
  why: string[]; caution: string[]; extra?: { label: string; text: string; strong?: boolean }[]
}
export interface Chapter { title: string; sub?: string; blocks: Block[] }
export interface CareerReport { label: string; title: string; summary: string; chapters: Chapter[] }

// ═══════════════ 흥미 ═══════════════
export const RIASEC_NAME: Record<Riasec, string> = { R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '진취형', C: '관습형' }
export const RIASEC_TEXT: Record<Riasec, string> = {
  R: '손과 몸으로 결과를 만드는 일에 끌려요. 설명을 듣기보다 직접 해보면서 배우고, 눈에 보이는 결과물이 나올 때 보람을 느껴요.',
  I: '왜 그런지 원리를 파고드는 일에 끌려요. 정답이 바로 보이지 않는 문제를 오래 붙잡고 푸는 데서 즐거움을 느껴요.',
  A: '정해진 틀보다 나만의 방식으로 표현하는 일에 끌려요. 새로운 것을 만들고, 그 결과에 내 색이 묻어날 때 힘이 나요.',
  S: '사람을 돕고 가르치며 함께 성장하는 일에 끌려요. 누군가에게 실제로 도움이 됐다는 확인이 가장 큰 보람이에요.',
  E: '사람을 움직여 일을 성사시키는 데 끌려요. 목표를 세우고 설득해서 결과를 만들어 내는 과정 자체가 동력이에요.',
  C: '흩어진 것을 정리하고 정확하게 처리하는 일에 끌려요. 체계와 기준이 분명한 환경에서 실력이 드러나요.',
}
export const SHAPE_TEXT = {
  sharp: '흥미가 한두 방향으로 뚜렷하게 모여 있어요. 이런 사람은 어떤 분야를 고르느냐가 만족도를 크게 좌우해요. 흥미와 동떨어진 분야는 조건이 좋아도 오래 버티기 어려울 수 있어요.',
  balanced: '중심 흥미가 있으면서도 다른 분야에도 관심이 열려 있어요. 중심 흥미를 축으로 다른 흥미를 더할 수 있는 분야에서 강점이 커져요.',
  broad: '여러 분야에 비슷하게 끌려요. 이럴 때는 흥미만으로 고르기보다 어떤 조건에서 일하고 싶은지(가치)를 함께 기준으로 삼고, 직접 해 보며 비교하는 과정이 중요해요.',
  flat: '여러 분야에 비슷하게 끌리거나, 아직 강하게 끌리는 분야가 드러나지 않았어요. 이럴 때는 흥미보다 어떤 조건에서 일하고 싶은지(가치)가 더 좋은 선택 기준이 돼요. 직접 해보면서 흥미를 확인하는 과정이 특히 중요해요.',
} as const

// 개인 평균보다 뚜렷하게 높고, 절대값도 "끌린다"(3.5) 이상인 흥미만 "높은 흥미"로 부름. 동점은 함께 (최대 3)
// 비어 있을 수 있음 — 뚜렷한 흥미가 없다는 것도 정상 결과
function strongTypes(s: CareerScores): Riasec[] {
  const it = s.interest!
  return it.top.filter(t => it.rel[t] >= 0.4 && it.raw[t] >= 3.5).slice(0, 3)
}
// 절대값이 "끌린다" 수준(3.5 이상)인 유형 전부 — 여러 유형을 고르게 높게 답한 경우를 "끌림 없음"과 구분
function broadTypes(s: CareerScores): Riasec[] {
  const it = s.interest!
  return (Object.keys(it.raw) as Riasec[]).filter(t => it.raw[t] >= 3.5).sort((a, b) => it.raw[b] - it.raw[a])
}

// ═══════════════ 가치 ═══════════════
const VALUE_DEF = Object.fromEntries(VALUE_CARDS.map(v => [v.id, v.def])) as Record<WorkValue, string>
// 가치가 고르게 나왔을 때 — "중요하지 않음"과 "모두 중요함"은 다른 뜻
// 가치 척도: 1 없어도 상관없다 · 2 있으면 좋다 · 3 중요하다 · 4 매우 중요하다 · 5 없으면 하지 않겠다
// 고르게 나왔을 때 — "중요하지 않음"과 "모두 중요함"은 다른 뜻이라, 평균이 어느 칸인지로 나눔
function flatValueText(s: CareerScores): string {
  const xs = Object.values(s.values.raw).filter(Number.isFinite)
  const m = xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
  const all = xs.every(x => x === xs[0]) ? '열 가지 조건을 모두' : '대부분의 조건을 비슷하게'
  if (m >= 4.5) return `${all} "없으면 하지 않겠다" 수준으로 답했어요. 모두 채워 주는 자리는 드물어서, 조건끼리 부딪힐 때 무엇을 먼저 지킬지는 아직 알 수 없는 상태예요.`
  if (m >= 3.5) return `${all} "매우 중요하다"고 답했어요. 조건이 중요하지 않다는 뜻이 아니라, 조건끼리 부딪힐 때 무엇을 먼저 지킬지는 이번 응답으로 구분되지 않았다는 뜻이에요.`
  if (m >= 2.5) return `${all} "중요하다"고 답했어요. 조건이 중요하지 않다는 뜻이 아니라, 조건끼리 부딪힐 때 무엇을 먼저 지킬지는 이번 응답으로 구분되지 않았다는 뜻이에요.`
  return `${all} "있으면 좋다" 이하로 답했어요. 조건보다 하는 일 자체가 선택 기준이 될 수 있어요.`
}
// 상위 가치 — 3위와 같은 점수가 여럿이면 임의로 자르지 않고 "동점"으로 따로 돌려줌
function valueFocus(s: CareerScores): { top: WorkValue[]; tied: WorkValue[] } {
  const v = s.values
  if (v.flat) return { top: [], tied: [] }
  const all = (Object.keys(v.raw) as WorkValue[]).sort((a, b) => v.raw[b] - v.raw[a])
  const cut = v.raw[all[2]]
  const atOrAbove = all.filter(x => v.raw[x] >= cut)
  if (atOrAbove.length <= 3) return { top: atOrAbove, tied: [] }
  return { top: all.filter(x => v.raw[x] > cut), tied: atOrAbove.filter(x => v.raw[x] === cut) }
}

// ═══════════════ 진로 결정 진단 ═══════════════
type DecisionKey = 'lackInfo' | 'lackSelf' | 'indecision' | 'conflict' | 'majorSwitch' | 'none'
// 각 문구는 해당 응답만 근거로 말한다 — 다른 차원(예: "정보는 있다")을 덧붙여 단정하지 않음
export const DECISION: Record<DecisionKey, { title: string; body: string; actions: string[] }> = {
  lackInfo: {
    title: '정보가 부족해요',
    body: '고르기 어려운 이유 중 하나가, 각 길이 실제로 어떤 일을 하는지 잘 모른다는 데 있어요. 정보가 채워지면 방향이 잡히는 경우가 많아요.',
    actions: [
      '추천 목록에서 두 개를 골라 현직자 인터뷰나 소개 글을 세 개 이상 찾아보세요',
      '관련 채용 공고나 학과 소개 다섯 개를 모아 "실제로 하는 일"을 표로 정리해 보세요',
      '그 길을 먼저 간 사람 한 명에게 30분 대화를 요청해 보세요',
    ],
  },
  lackSelf: {
    title: '나에 대한 기준이 흐릿해요',
    body: '내가 무엇을 잘하고 좋아하는지 확신이 적다고 답했어요. 무엇이 나에게 맞는지 판단할 기준이 흐릿한 상태예요. 이 리포트의 흥미와 가치 결과를 그 기준의 출발점으로 써 보세요.',
    actions: [
      '시간 가는 줄 몰랐던 경험 세 개와 억지로 했던 경험 세 개를 적고 공통점을 찾아보세요',
      '추천 목록을 "끌림"과 "조건" 두 기준으로 각각 순위를 매겨 비교해 보세요',
      '짧은 과제나 프로젝트로 추천 분야 하나를 직접 해보세요',
    ],
  },
  indecision: {
    title: '마지막 결정에서 멈춰요',
    body: '선택지가 좁혀져도 하나로 정하기 어렵다고 답했어요. 완벽한 선택을 찾기보다 "일단 가보고 조정한다"는 관점이 도움이 돼요.',
    actions: [
      '고민 중인 선택지마다 "1년 뒤 후회할 이유"를 하나씩 적어 보세요',
      '결정 마감일을 정하고, 그날까지 모을 정보의 범위를 미리 정하세요',
      '두 선택지를 모두 작게 시도해 보고 실제로 느낀 점을 비교해 보세요',
    ],
  },
  conflict: {
    title: '원하는 길과 주변의 기대가 달라요',
    body: '내가 원하는 길과 가족·주변이 기대하는 길이 다르다고 답했어요. 설득보다 먼저 내 선택의 근거를 정리하는 게 도움이 돼요.',
    actions: [
      '원하는 길의 현실적인 근거(할 일, 전망, 준비 기간)를 정리해 대화를 준비해 보세요',
      '주변의 기대 중 받아들일 수 있는 부분과 없는 부분을 나눠 적어 보세요',
      '두 길의 장점을 함께 살리는 중간 선택지가 있는지 찾아보세요',
    ],
  },
  majorSwitch: {
    title: '전공과 다른 길을 고민하고 있어요',
    body: '지금 전공과 다른 분야에 마음이 가 있어요. 전공을 버리기보다, 전공에서 얻은 것과 새 관심사를 잇는 길을 먼저 찾아보면 선택지가 넓어져요.',
    actions: [
      '관심 분야의 수업을 한 과목 들어보거나 복수·부전공 조건을 확인해 보세요',
      '"내 전공 + 관심 분야"가 겹치는 직무를 추천 목록에서 찾아보세요',
      '관심 분야의 대외활동이나 프로젝트를 하나 해보며 확신을 쌓으세요',
    ],
  },
  // "어려움이 없다"는 "결정을 끝냈다"는 뜻이 아님 — 다음 행동은 선택 단계(STAGE_NONE)에서 고름
  none: {
    title: '크게 막힌다고 답한 요인은 없어요',
    body: '정보, 나에 대한 기준, 주변의 기대, 최종 결정 중 "그렇다" 이상으로 답한 어려움이 없어요.',
    actions: [
      '관심 분야 안에서 후보를 두세 개로 줄이고, 각각 필요한 역량 세 가지를 적어 보세요',
      '후보마다 공고나 요강을 세 개씩 모아 실제로 하는 일을 비교해 보세요',
      '지금까지의 경험을 그 길에 필요한 역량과 연결해 정리하세요',
    ],
  },
}
// 선택 단계별 행동 — 어려움 진단과 별개로, 사용자가 답한 "지금 어디까지 정했는지"를 존중
const STAGE_ACTIONS: Record<'verify' | 'compare', { body: string; actions: string[] }> = {
  verify: {
    body: '방향은 거의 정했다고 답했어요. 이 리포트는 새 방향을 고르기보다, 정한 방향을 점검하는 데 쓰세요. 추천 후보는 정한 방향과 비교해 보는 참고 자료예요.',
    actions: [
      '정한 방향을 한 문장으로 적고, 이 리포트의 흥미·가치 결과와 맞는 점과 걸리는 점을 나란히 적어 보세요',
      '정한 방향의 공고나 요강 열 개를 모아, 필요한 역량과 지금 준비의 차이를 표로 만드세요',
      '그 차이 중 가장 큰 하나를 이번 달에 채울 계획을 세우세요',
    ],
  },
  compare: {
    body: '두세 가지 사이에서 고민 중이라고 답했어요. 고민 중인 선택지를 기준으로 삼고, 추천 후보는 그 선택지들과 비교할 대상으로 쓰세요.',
    actions: [
      '고민 중인 선택지를 적고, 이 리포트의 직무 후보와 겹치는지, 다르다면 무엇이 다른지 확인해 보세요',
      '선택지마다 현직자 이야기나 공고를 세 개씩 모아, 실제로 하는 일과 필요한 준비를 비교표로 만드세요',
      '결정 마감일을 정하고, 그날까지 모을 정보의 범위를 미리 정하세요',
    ],
  },
}

// ═══════════════ 관계 ═══════════════
// 가까운 관계(연인·친구·가족)에 대한 응답 — 직장 능력으로 단정하지 않음. 중간 응답은 "안정형"이 아니라 "뚜렷하지 않음"
export const ATTACHMENT_TEXT = {
  secure: { title: '가까운 관계에서 비교적 편안한 편', body: '가까운 사람에게 기대는 것도, 혼자 지내는 것도 크게 불편하지 않다고 답했어요.', tips: ['상대가 불안해할 때 "별일 아니야"로 넘기기보다 한 번 더 확인해 주면 신뢰가 깊어져요', '편안함이 있는 만큼, 힘든 사람이 먼저 말을 꺼낼 수 있게 자리를 만들어 주세요'] },
  neutral: { title: '뚜렷한 경향은 드러나지 않았어요', body: '관계 문항에 대체로 중간으로 답했어요. 가까운 사람에게 기대는 쪽과 거리를 두는 쪽 어느 쪽으로도 크게 치우치지 않았다는 뜻이에요. 관계를 잘하는지 못하는지를 평가한 결과는 아니에요.', tips: ['최근 가까운 사람과 서운했던 일 하나를 떠올려, 그때 다가갔는지 물러났는지 적어 보세요', '편한 관계와 불편한 관계의 차이가 무엇인지 한 줄로 정리해 보세요'] },
  anxious: { title: '관계에 마음을 많이 쓰는 편', body: '상대의 작은 변화에도 마음이 쓰이는 편이라고 답했어요. 반응이 늦거나 애매하면 불안이 커지기 쉬워요.', tips: ['불안할 때 바로 해석하기보다 "사실"과 "내 추측"을 나눠 적어 보세요', '필요한 것을 돌려 말하기보다 짧고 분명하게 요청해 보세요'] },
  avoidant: { title: '적당한 거리가 편한 편', body: '가까운 관계에서도 적당한 거리를 편하게 느낀다고 답했어요. 가까워질수록 한 발 물러서고 싶어질 수 있어요.', tips: ['힘든 일을 혼자 다 해결하기 전에 한 사람에게만이라도 먼저 말해 보세요', '거리를 두고 싶을 때는 이유를 짧게라도 알려주면 오해가 줄어요'] },
  mixed: { title: '다가가고 싶은 마음과 물러서고 싶은 마음이 함께 있는 편', body: '가까워지고 싶으면서도 너무 가까워지면 부담스러운 마음이 함께 있어요. 그래서 관계에서 에너지를 많이 쓸 수 있어요.', tips: ['지금 드는 마음이 "다가가고 싶음"인지 "피하고 싶음"인지 이름을 붙여 보는 것부터 시작해 보세요', '믿을 만한 한 사람과 편안한 관계 경험을 조금씩 쌓는 것이 도움이 돼요'] },
} as const

// ═══════════════ 스트레스 ═══════════════
const STRESS_CONTEXT: Record<LifeStage, { chapter: string; noun: string }> = {
  high: { chapter: '시험·입시 스트레스', noun: '공부' },
  college: { chapter: '학업 스트레스', noun: '과제' },
  jobseeker: { chapter: '취업 준비 스트레스', noun: '취업 준비' },
  worker: { chapter: '일 스트레스', noun: '일' },
}
function stressText(key: string, stage: LifeStage): { title: string; body: string; tip: string } {
  const n = STRESS_CONTEXT[stage].noun
  const T: Record<string, { title: string; body: string; tip: string }> = {
    overwork: { title: '더 매달리는 유형', body: '스트레스를 받을수록 더 붙잡고 매달려요. 성실함의 다른 얼굴이지만, 쉬지 못하는 상태가 길어지면 효율이 오히려 떨어져요.', tip: `하루 중 "${w(n, '을/를')} 생각하지 않는 시간"을 정해 두고 지켜 보세요.` },
    withdraw: { title: '일단 피하고 싶어지는 유형', body: '부담이 커지면 일단 피하고 싶어져요. 게으름이 아니라 스트레스를 줄이려는 반응이에요. 다만 미룬 일이 쌓이면 부담이 더 커져요.', tip: '부담되는 일은 "10분만 하기"처럼 아주 작게 쪼개 시작해 보세요.' },
    outburst: { title: '감정이 겉으로 드러나는 유형', body: '스트레스가 쌓이면 표정이나 말투로 드러나요. 솔직하다는 장점이 있지만, 가까운 사람과 부딪히기 쉬워요.', tip: '날카로워지기 쉬운 때(잠이 부족할 때, 결과 발표 전 등)를 미리 정해 두고, 그때는 중요한 대화를 미뤄 보세요.' },
    rumination: { title: '곱씹는 유형', body: '지나간 일을 머릿속에서 계속 되풀이해요. 돌아보는 힘은 성장에 도움이 되지만, 같은 장면을 반복하는 건 에너지만 소모해요.', tip: '아쉬웠던 일은 "다음에 바꿀 한 가지"만 적고 덮어 보세요.' },
  }
  return T[key] ?? { title: '스트레스 반응이 두드러지지 않는 편', body: '스트레스가 쌓여도 한쪽으로 크게 치우친 반응은 보이지 않아요. 지금의 균형을 지켜 주는 습관을 알아 두면 힘든 시기에 도움이 돼요.', tip: '잘 버틴 날에 무엇을 했는지 짧게 기록해 두세요.' }
}
const STRESS_LEAN: Record<string, string> = { overwork: '더 매달리는 쪽', withdraw: '일단 피하고 싶어지는 쪽', outburst: '감정이 겉으로 드러나는 쪽', rumination: '곱씹는 쪽' }
const STRESS_SHORT: Record<string, string> = { overwork: '더 매달리기', withdraw: '피하기', outburst: '감정 드러내기', rumination: '곱씹기' }
// "유형"으로 부르는 기준: 그 반응 문항 평균이 "그렇다"(3.5) 이상
const STRESS_TYPE_MIN = 3.5
export const SUPPORT_NOTICE = '지금 지친 신호가 강하게 나타나요. 혼자 버티기 어렵다면 전문가와 이야기해 보는 것도 좋은 방법이에요. 정신건강 상담전화 1577-0199, 자살예방 상담전화 109 (24시간).'

// ═══════════════ 강점 후보 (HEXACO) ═══════════════
// 성향 점수는 능력의 증거가 아니라 "경향" — 경험으로 확인할 후보로만 제시
const STRENGTH_HIGH: Record<HexacoFactor, string> = {
  H: '원칙을 지키려는 정직함', E: '다른 사람의 감정에 민감하게 반응하는 편', X: '사람들 속에서 에너지를 얻는 편',
  A: '갈등을 부드럽게 풀려는 태도', C: '맡은 일을 끝까지 해내려는 꾸준함', O: '새로운 것에 대한 호기심',
}
const STRENGTH_LOW: Partial<Record<HexacoFactor, string>> = {
  E: '걱정이나 두려움에 덜 흔들리는 편', X: '혼자 일할 때 에너지를 덜 쓰는 편',
  A: '기준을 분명히 말하는 단호함', C: '상황에 맞춰 방법을 바꾸는 유연함', O: '검증된 방식을 지키는 안정감',
}
// 두드러진 요인이 없으면 빈 목록 — 근거 없이 강점을 만들어 채우지 않음
function strengths(h: Record<HexacoFactor, number>): string[] {
  const fs: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
  return fs.map(f => ({ f, dev: h[f] - 3 }))
    .filter(x => x.dev >= 0.6 || (x.dev <= -0.6 && STRENGTH_LOW[x.f]))
    .sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev)).slice(0, 3)
    .map(x => (x.dev > 0 ? STRENGTH_HIGH[x.f] : STRENGTH_LOW[x.f]!))
}
const NO_STRENGTH_TEXT = '성향 점수에서 두드러진 강점 후보는 나오지 않았어요. 강점이 없다는 뜻이 아니라, 성향 점수만으로는 고를 근거가 부족하다는 뜻이에요. 최근 잘 해낸 일 하나를 떠올려 그때 무엇을 했는지 적어 보면 강점이 보여요.'

// ═══════════════ 일·공부 방식 (향상 공통) ═══════════════
const STYLE_LABEL: Record<string, string> = {
  planning: '성실성', improvising: '즉흥 대응', deepFocus: '깊은 몰입', switching: '전환·병행', collab: '협업', ownership: '단독 책임',
  feedback: '피드백 수용', reassurance: '확인 욕구', resultDrive: '성과 동기', meaningDrive: '의미 동기', strengthUse: '강점 활용 기회', strengthClarity: '강점 인식',
}
const STYLE_HIGH: Record<string, { text: string; tip: string }> = {
  // planning 키는 저장된 점수와의 호환을 위해 유지 — 값은 무료 검사 성실성(정리·꾸준함·꼼꼼함·신중함을 함께 반영)
  planning: { text: '무료 검사에서 성실성이 높게 나왔어요. 맡은 일을 꾸준하고 꼼꼼하게 끝내려는 편이에요. 다만 계획을 세우는 습관을 직접 물은 점수는 아니에요.', tip: '마감이 있는 일은 중간 점검 날짜를 하나 더 정해 두세요' },
  improvising: { text: '계획에 없던 상황에서도 부딪히며 길을 찾는 순발력이 있어요.', tip: '시작 전에 딱 세 줄짜리 계획만 적어 두면 순발력이 더 빛나요' },
  deepFocus: { text: '한 가지에 깊게 몰입할 때 가장 좋은 결과가 나와요. 끊기지 않는 시간이 곧 성과의 조건이에요.', tip: '하루에 90분, 방해받지 않는 시간을 먼저 달력에 막아 두세요' },
  switching: { text: '여러 가지를 오가며 에너지를 얻어요. 한 가지만 오래 붙잡으면 오히려 집중이 떨어져요.', tip: '비슷한 일끼리 묶어서 처리하면 전환에 드는 힘을 줄일 수 있어요' },
  collab: { text: '함께 머리를 맞댈 때 더 좋은 결과가 나와요. 대화 속에서 생각이 정리되는 편이에요.', tip: '막힐 때 15분 정도 누군가와 이야기하는 시간을 습관으로 만들어 보세요' },
  ownership: { text: '여럿이 나누기보다 내 몫을 혼자 맡아 처리하는 방식이 편하다고 답했어요.', tip: '혼자 끝내되, 중간에 한 번은 공유하는 지점을 정해 두세요' },
  feedback: { text: '지적을 서운함보다 성장 재료로 받아들여요.', tip: '피드백을 기다리기보다 먼저 요청해 보고, 받은 의견 중 하나를 바로 고쳐 보세요' },
  reassurance: { text: '잘하고 있는지 중간 확인이 없으면 불안해지는 편이에요.', tip: '확인받을 시점을 미리 약속해 두세요 (예: 초안 단계에서 한 번)' },
  resultDrive: { text: '눈에 보이는 결과와 숫자에서 힘을 얻어요.', tip: '결과가 늦게 나오는 일은 중간 목표를 스스로 만들어 두세요' },
  meaningDrive: { text: '왜 하는지 납득될 때 몰입해요. 이유가 불분명한 일에서는 힘이 빠지기 쉬워요.', tip: '시작하기 전에 "이게 누구에게 왜 필요한지"를 한 줄로 적어 보세요' },
}
// 자기소개서 강점 후보로 쓸 수 있는 방식만 (확인 욕구처럼 부담을 뜻하는 항목은 제외)
const STYLE_STRENGTH: Record<string, string> = {
  deepFocus: '한 가지에 깊게 몰입하는 방식', collab: '함께 머리를 맞대 결과를 내는 방식', ownership: '내 몫을 끝까지 맡아 처리하는 방식',
  feedback: '지적을 고칠 점으로 받아들이는 태도', resultDrive: '결과와 숫자에서 힘을 얻는 동기', meaningDrive: '의미가 납득되면 몰입하는 동기',
  improvising: '계획 밖 상황에서 길을 찾는 순발력', switching: '여러 일을 오가며 처리하는 전환력',
}
function styleChapter(s: CareerScores, sub: string): Chapter {
  const st = s.style ?? {}
  const keys = Object.keys(STYLE_LABEL).filter(k => st[k] != null)
  const highs = Object.keys(STYLE_HIGH).filter(k => hi(st[k])).sort((a, b) => st[b] - st[a]).slice(0, 4)
  const blocks: Block[] = [{ type: 'bars', items: keys.map(k => ({ label: STYLE_LABEL[k], value: st[k], strong: highs.includes(k) })) }, { type: 'note', text: '"성실성"은 다시 묻지 않고 무료 검사 점수를 그대로 썼어요. 정리·꾸준함·꼼꼼함·신중함을 함께 반영한 점수라, 계획 습관만을 뜻하지는 않아요.' }]
  if (highs.length) highs.forEach(k => blocks.push({ type: 'text', text: STYLE_HIGH[k].text }))
  else blocks.push({ type: 'text', text: '"그렇다" 이상으로 뚜렷하게 답한 방식이 없어요. 상황에 따라 방식을 바꾸는 편일 수도 있고, 아직 나에게 맞는 방식을 확인해 볼 기회가 적었을 수도 있어요. 어떤 방식이 가장 잘 맞았는지 기록해 두면 선명해져요.' })
  if (hi(st.planning) && hi(st.improvising)) blocks.push({ type: 'callout', tone: 'gold', text: '성실성이 높으면서도, 계획 없이 부딪히며 길을 찾는 것도 편하다고 답했어요. 큰 흐름은 꾸준함으로, 세부는 순발력으로 가져가는 방식이 맞을 수 있어요.' })
  if (lo(st.strengthUse)) blocks.push({ type: 'callout', tone: 'plain', text: '지금은 잘하는 것을 발휘할 기회가 적다고 느끼고 있어요. 강점을 쓸 수 있는 역할을 하나 만들어 보고, 그 전과 후에 일이 어떻게 느껴지는지 비교해 보세요.' })
  if (lo(st.strengthClarity)) blocks.push({ type: 'callout', tone: 'plain', text: '내 강점을 구체적으로 말하기 어려운 편이에요. 아래 성장 로드맵의 강점 후보 중 하나를 골라, 그 모습이 실제로 드러났던 경험 한 가지와 이어서 문장으로 만들어 보세요.' })
  const tips = highs.map(k => STYLE_HIGH[k].tip).slice(0, 3)
  if (tips.length) blocks.push({ type: 'list', title: '나에게 맞는 방법', items: tips })
  return { title: '나의 일하는 방식', sub, blocks }
}

// ═══════════════ 추천 목록 (직무·학과) ═══════════════
function jobPicks(s: CareerScores, exclude?: string): Pick[] {
  return (s.jobs ?? []).filter(m => m.id !== exclude).slice(0, 5).map((m, i) => {
    const job = CAREER_JOBS.find(x => x.id === m.id)!
    return {
      rank: i + 1, name: job.name, meta: job.group, badge: job.emerging ? '신흥 직무' : undefined, desc: job.desc,
      why: jobWhy(m, s),
      caution: [...m.conflicts.map(c => `포기할 수 없다고 답한 "${c}"${p(c, '은/는')} 이 직무에서 채우기 어려운 경우가 많아요. 지원할 곳에서 꼭 확인하세요`), ...m.cautions],
      extra: [
        ...(job.entry ? [{ label: '진입 요건', text: job.entry, strong: true }] : []),
        { label: 'AI가 빠르게 바꾸는 일', text: job.ai.automates }, { label: '더 중요해지는 일', text: job.ai.rises },
      ],
    }
  })
}
function jobWhy(m: JobMatch, s: CareerScores): string[] {
  const job = CAREER_JOBS.find(x => x.id === m.id)!
  const why: string[] = []
  const it = s.interest!
  const shared = job.code.filter(t => strongTypes(s).includes(t))
  if (shared.length) why.push(`${shared.map(t => `${RIASEC_NAME[t]}(${it.raw[t].toFixed(1)})`).join('·')} 흥미와 맞닿아 있어요`)
  else {
    // 높은 흥미가 없을 때는 "강하다"고 하지 않고 상대 비교로만 설명
    const rel = job.code.filter(t => it.rel[t] > 0).slice(0, 2)
    if (rel.length) why.push(`${rel.map(t => RIASEC_NAME[t]).join('·')} 흥미가 다른 유형보다 조금 높게 나온 점과 이어져요`)
  }
  const tag = job.tags.find(t => it.tags.includes(t))
  if (tag) why.push(`"${tag}" 활동에 끌린다고 답한 점과 맞아요`)
  // 직무명만으로 조건 충족을 약속하지 않음 — 회사·팀마다 다르므로 확인할 조건으로 표현
  const good = (Object.entries(job.values) as [WorkValue, number][])
    .filter(([v, x]) => x >= 0.4 && s.values.rel[v] > 0).sort((a, b) => s.values.raw[b[0]] - s.values.raw[a[0]]).slice(0, 2).map(([v]) => v)
  if (good.length) why.push(`중요하게 답한 ${w(good.join('·'), '과/와')} 맞닿은 경우가 많은 직무예요. 실제로 채워지는지는 회사·팀마다 달라서 확인이 필요해요`)
  return why
}
const pickScores = (s: CareerScores, exclude?: string) => (s.jobs ?? []).filter(m => m.id !== exclude).slice(0, 5).map(m => m.score)
// 점수 차이가 이보다 작으면 순서에 의미를 두지 않고 하나의 후보군으로 안내
const NEAR_TIE = 0.05
function nearTieCount(scores: number[]): number {
  let n = 1
  while (n < scores.length && scores[0] - scores[n] < NEAR_TIE) n++
  return n
}
const PICKS_SCOPE = `추천은 ${CAREER_JOBS.length}개 직무 목록 안에서 흥미와 가치 응답으로 계산한 상대 순위예요. 목록에 없는 길(예: 음악·공연, 전문 자격 직종)은 다루지 못하고, 순위가 높다고 실제 만족이나 합격을 보장하지는 않아요.`
// 추천 보류 — 높은 흥미가 하나도 없고 상위 점수가 거의 같으면, 순위를 매길 근거가 없음
function jobsNoBasis(s: CareerScores, exclude?: string): boolean {
  if (!s.interest || strongTypes(s).length) return false
  const sc = pickScores(s, exclude)
  return !sc.length || sc[0] <= 0.1 || nearTieCount(sc) >= 4
}
// 체험 예시 — 순위 추천은 보류해도, 이미 받은 흥미 응답으로 "먼저 해 볼 것"의 순서는 정할 수 있음
const TRY_EXAMPLES: { types: Riasec[]; text: string }[] = [
  { types: ['I', 'C'], text: '숫자·자료: 공개 데이터 하나로 간단한 표나 그래프 만들기' },
  { types: ['A'], text: '글·콘텐츠: 관심 주제로 짧은 글이나 카드뉴스 하나 만들기' },
  { types: ['S', 'E'], text: '사람·설득: 아는 사람에게 무언가를 소개하거나 제안해 보기' },
  { types: ['C'], text: '정리·운영: 모임이나 행사 하나의 일정과 준비물을 맡아 보기' },
  { types: ['R', 'I'], text: '만들기·기술: 무료 강의로 간단한 웹페이지나 도구 하나 만들기' },
]
function noBasisBlocks(s: CareerScores): Block[] {
  const it = s.interest!
  const broad = broadTypes(s).length > 0
  const scored = TRY_EXAMPLES.map(e => ({ ...e, v: e.types.reduce((a, t) => a + it.raw[t], 0) / e.types.length })).sort((a, b) => b.v - a.v)
  const spread = scored[0].v - scored[scored.length - 1].v >= 0.7
  const blocks: Block[] = [
    { type: 'callout', tone: 'plain', title: '지금 응답으로는 특정 직무를 고를 근거가 부족해요', text: `${broad ? '여러 유형에 고르게 끌린다고 답해서' : '"끌린다" 수준까지 올라온 활동 유형이 없어서'} 직무별 점수도 거의 같게 나왔어요. 이럴 때 순위를 매기면 근거 없는 추천이 돼서, 맞춤 추천은 보류했어요. 대신 서로 다른 분야를 짧게 해 보고, 해 본 뒤의 끌림으로 범위를 정하는 쪽을 권해요.` },
  ]
  if (spread) {
    const first = scored.slice(0, 3), later = scored.slice(3)
    blocks.push({ type: 'list', title: '먼저 해 볼 체험 (흥미 응답이 상대적으로 높은 쪽부터)', items: first.map(e => e.text) })
    blocks.push({ type: 'note', text: `${later.map(e => e.text.split(':')[0]).join(', ')} 쪽은 상대적으로 덜 끌린다고 답했으니 뒤로 미뤄도 돼요. 낮게 답했다고 영영 안 맞는다는 뜻은 아니에요.` })
  } else blocks.push({ type: 'list', title: '서로 다른 분야 체험 예시 (맞춤 추천이 아닌 일반 예시)', items: TRY_EXAMPLES.map(e => e.text) })
  return blocks
}
function majorPicks(s: CareerScores): Pick[] {
  return (s.majors ?? []).slice(0, 5).map((m, i) => {
    const major = MAJORS.find(x => x.id === m.id)!
    const why: string[] = []
    const shared = major.code.filter(t => strongTypes(s).includes(t))
    if (shared.length) why.push(`${shared.map(t => RIASEC_NAME[t]).join('·')} 흥미와 맞닿아 있어요`)
    const tag = major.tags.find(t => s.interest!.tags.includes(t))
    if (tag) why.push(`특히 "${tag}" 활동에 끌린다고 답한 점과 잘 맞아요`)
    if (m.subjectHit.length) why.push(`자신 있다고 답한 ${m.subjectHit.join('·')} 과목과 이어져요`)
    return { rank: i + 1, name: major.name, meta: `${major.field} 계열`, desc: major.desc, why, caution: [], extra: [{ label: '졸업 후 대표 진로', text: major.careers }] }
  })
}

// ═══════════════ 챕터 빌더 ═══════════════
function interestChapter(s: CareerScores): Chapter {
  const it = s.interest!
  const order = (Object.keys(it.raw) as Riasec[]).sort((a, b) => it.raw[b] - it.raw[a])
  const strong = strongTypes(s)
  const blocks: Block[] = [{ type: 'bars', items: order.map(t => ({ label: RIASEC_NAME[t], value: it.raw[t], strong: strong.includes(t) })) }]
  if (strong.length) blocks.push(...strong.map(t => ({ type: 'text' as const, text: RIASEC_TEXT[t] })))
  else {
    // 최고점이 여럿이면 하나만 고르지 않음
    const topRaw = it.raw[order[0]]
    const tops = order.filter(t => it.raw[t] === topRaw)
    const which = tops.length === order.length ? `여섯 유형이 모두 같은 점수(${f1(topRaw)})예요` : tops.length > 1 ? `상대적으로는 ${tops.map(t => RIASEC_NAME[t]).join('·')}${p(RIASEC_NAME[tops[tops.length - 1]], '이/가')} 같은 점수로 가장 높지만(${f1(topRaw)}), 강한 흥미라고 부르기는 어려운 수준이에요` : `상대적으로는 ${w(RIASEC_NAME[order[0]], '이/가')} 가장 높지만(${f1(topRaw)}), 강한 흥미라고 부르기는 어려운 수준이에요`
    const broad = broadTypes(s)
    const tagNote = it.tags.length ? ` 다만 "${it.tags.slice(0, 2).join('", "')}" 활동에는 끌린다고 답했으니, 그쪽부터 해 보는 것도 방법이에요.` : ''
    if (broad.length) blocks.push({ type: 'text', text: `${broad.length === order.length ? '여섯 유형 모두' : broad.map(t => RIASEC_NAME[t]).join('·')}에 고르게 끌린다고 답했어요(모두 3.5 이상). 끌림이 없는 게 아니라, 여러 쪽에 비슷하게 끌려서 흥미만으로는 어느 쪽이 더 맞는지 가려내기 어려운 상태예요. 직접 해 보며 어느 쪽에서 시간 가는 줄 모르는지 비교해 보세요.` })
    else blocks.push({ type: 'text', text: `유형별 평균이 "끌린다" 수준(3.5 이상)까지 올라온 활동 유형이 없어요. ${which}.${tagNote} 해 보지 않아서 모르는 것인지, 해 봤는데 끌리지 않았는지를 나눠 보는 것부터 시작하세요.` })
  }
  // 그래프 모양 설명도 절대 수준과 맞춤 — 높은 흥미가 없으면 "중심 흥미가 있다"고 하지 않음
  blocks.push({ type: 'callout', tone: 'plain', text: strong.length ? SHAPE_TEXT[it.shape] : broadTypes(s).length ? SHAPE_TEXT.broad : SHAPE_TEXT.flat })
  return { title: '나의 흥미 지도', sub: '무엇에 끌리는지. 잘하는지와는 별개로 활동 자체에 대한 끌림이에요.', blocks }
}
function valuesChapter(s: CareerScores, stage: LifeStage): Chapter {
  const v = s.values
  const { top, tied } = valueFocus(s)
  const blocks: Block[] = []
  if (v.flat) blocks.push({ type: 'text', text: flatValueText(s) })
  else if (top.length) blocks.push({ type: 'text', text: `일에서 상대적으로 가장 중요하게 여기는 건 ${w(top.join(', '), '이에요/예요')}.` })
  // 동점은 위가 비어 있을 때만 "직접 정하라"고 요청 — 상위 가치가 이미 분명하면 그 아래 동점에 결정을 요구하지 않음
  const last = tied[tied.length - 1]
  if (tied.length && !top.length) blocks.push({ type: 'callout', tone: 'plain', title: `${tied.length}가지를 똑같이 중요하다고 답했어요`, text: `${tied.join(', ')}${p(last, '이/가')} 모두 가장 높은 점수예요. 이 중 무엇을 먼저 지킬지는 아직 정해지지 않은 상태예요. 모두를 채우는 자리는 드물어서, "꼭 지킬 두 가지"와 "조건이 맞으면 양보할 것"을 직접 정해 두면, 실제로 고를 때 기준으로 쓸 수 있어요.` })
  else if (tied.length && top.length === 1) blocks.push({ type: 'text', text: `그다음으로 ${tied.join(', ')}${p(last, '이/가')} 같은 점수예요. ${w(top[0], '이/가')} 가장 분명한 기준이고, 나머지는 함께 따져 볼 조건이에요.` })
  if (v.dealbreakers.length >= 5) blocks.push({ type: 'callout', tone: 'gold', text: `${v.dealbreakers.length}가지 조건에 "이게 없으면 그 일은 하지 않겠다"고 답했어요. 모두 채워 주는 자리는 드물어서, 실제로 고를 때는 이 중 무엇을 먼저 지킬지 정해야 해요.` })
  else if (v.dealbreakers.length) blocks.push({ type: 'callout', tone: 'gold', text: `특히 ${v.dealbreakers.join(', ')}에는 "이게 없으면 그 일은 하지 않겠다"고 답했어요. ${stage === 'high' ? '진로를 고를 때' : '일을 고를 때'} 이 조건부터 확인하세요.` })
  const all = (Object.keys(v.raw) as WorkValue[]).sort((a, b) => v.raw[b] - v.raw[a])
  blocks.push({ type: 'bars', items: all.map(x => ({ label: x, value: v.raw[x], strong: top.includes(x) })) })
  if (top.length) blocks.push({ type: 'list', items: top.map(x => `${x} — ${VALUE_DEF[x]}`) })
  const xs = Object.values(v.raw).filter(Number.isFinite)
  const meanV = xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
  if ((tied.length && !top.length) || (v.flat && meanV >= 2.5) || v.dealbreakers.length >= 5) blocks.push({ type: 'form', title: '조건이 부딪힐 때 먼저 지킬 것', fields: ['부딪히는 두 조건', '먼저 지킬 것', '최소한 이 정도는 있어야 하는 수준', '더 확인할 것'], note: '어떤 조건도 지우지 않고, 둘이 부딪히는 상황 하나만 떠올려 채워 보세요.' })
  return { title: '나에게 중요한 조건', sub: '일을 고를 때 무엇이 채워져야 하는지', blocks }
}
function relationshipChapter(s: CareerScores, stage: LifeStage): Chapter {
  const at = s.attachment
  // 두 축(불안·거리 두기)을 따로 봄 — 둘 다 낮을 때만 "편안", 둘 다 중간이면 "뚜렷하지 않음", 한쪽만 낮으면 그 축만 설명
  const level = (x: number) => (x <= 2.5 ? '낮은 편' : '중간 정도')
  let t: { title: string; body: string; tips: readonly string[] } = ATTACHMENT_TEXT[at.pattern]
  if (at.pattern === 'secure' && (at.anxiety > 2.5 || at.avoidance > 2.5)) {
    t = at.anxiety > 2.5 && at.avoidance > 2.5 ? ATTACHMENT_TEXT.neutral : {
      title: '관계에서 한쪽 경향만 드러났어요',
      body: `상대의 반응에 불안해지는 정도는 ${level(at.anxiety)}(${f1(at.anxiety)})이고, 가까워지면 거리를 두고 싶은 정도는 ${level(at.avoidance)}(${f1(at.avoidance)})예요. 관계를 잘하는지 못하는지를 평가한 결과는 아니에요.`,
      tips: at.anxiety <= 2.5
        ? ['상대의 반응에 크게 흔들리지 않는 편이라면, 상대가 불안해할 때 한 번 더 확인해 주는 것만으로도 신뢰가 깊어져요', '가까워질 때 드는 마음이 편한지 부담스러운지 한 번 적어 보세요']
        : ['가까운 사람에게 기대는 게 어렵지 않은 편이라면, 불안할 때 "사실"과 "내 추측"을 나눠 적어 보세요', '필요한 것을 돌려 말하기보다 짧고 분명하게 요청해 보세요'],
    }
  }
  const scope = stage === 'high'
    ? '친구 관계에서 이 경향을 알아 두면 서운한 일을 덜 크게 겪을 수 있어요.'
    : '이 결과는 연인·친구·가족 같은 가까운 관계에 대한 답이에요. 직장이나 팀에서는 다르게 나타날 수 있으니, 비슷한 면이 보이는지 떠올려 보는 정도로만 활용하세요.'
  return { title: '관계에서의 나', sub: '가까운 사람과의 관계에서', blocks: [
    { type: 'callout', tone: 'plain', title: t.title, text: t.body },
    { type: 'note', text: scope },
    { type: 'list', items: [...t.tips] },
  ] }
}
function stressChapter(s: CareerScores, stage: LifeStage): Chapter {
  const st = s.stress
  const kinds = ['overwork', 'withdraw', 'outburst', 'rumination'].filter(k => Number.isFinite(st.dims[k])).sort((a, b) => st.dims[b] - st.dims[a])
  const strongKinds = kinds.filter(k => st.dims[k] >= STRESS_TYPE_MIN)
  const blocks: Block[] = []
  if (strongKinds.length >= 2) {
    // 높은 반응이 여럿이면 하나로 줄이지 않음 — 모두 보여 주고, 실천은 가장 높은 것 하나부터
    const t = stressText(strongKinds[0], stage)
    const topTie = strongKinds.filter(k => st.dims[k] === st.dims[strongKinds[0]])
    blocks.push(
      { type: 'callout', tone: 'plain', title: '여러 반응이 함께 강하게 나타나요', text: `${strongKinds.map(k => `${STRESS_SHORT[k]}(${f1(st.dims[k])})`).join(', ')}에 모두 "그렇다" 이상으로 답했어요. 한 가지 성향이라기보다 스트레스가 여러 방향으로 새어 나오는 상태예요.` },
      { type: 'list', items: strongKinds.map(k => `${stressText(k, stage).title}: ${stressText(k, stage).body}`) },
      { type: 'callout', tone: 'gold', title: topTie.length > 1 ? `작은 실천 (가장 높게 나온 ${topTie.map(k => STRESS_SHORT[k]).join('·')} 중 우선 ${STRESS_SHORT[topTie[0]]}부터)` : `작은 실천 (가장 높게 나온 ${STRESS_SHORT[strongKinds[0]]}부터)`, text: t.tip },
    )
  } else if (strongKinds.length === 1) {
    const t = stressText(strongKinds[0], stage)
    blocks.push({ type: 'callout', tone: 'plain', title: t.title, text: t.body }, { type: 'callout', tone: 'gold', title: '작은 실천', text: t.tip })
  } else {
    const leanTop = kinds.filter(k => st.dims[k] === st.dims[kinds[0]])
    const allSame = kinds.length > 1 && leanTop.length === kinds.length
    const lean = allSame ? ` 네 반응이 모두 ${f1(st.dims[kinds[0]])}점으로 같아, 어느 반응이 더 두드러지는지는 구분되지 않아요.`
      : kinds.length && st.dims[kinds[0]] >= 3
      ? leanTop.length > 1 ? ` 굳이 꼽자면 ${leanTop.map(k => STRESS_LEAN[k]).join('과 ')}이 같은 점수로 조금 더 높아요(${f1(st.dims[kinds[0]])}).` : ` 굳이 꼽자면 ${STRESS_LEAN[kinds[0]]}이 조금 더 높아요(${f1(st.dims[kinds[0]])}).`
      : ''
    blocks.push(
      { type: 'callout', tone: 'plain', title: '뚜렷한 스트레스 반응은 드러나지 않았어요', text: `더 매달리기, 피하기, 감정 드러내기, 곱씹기 중 "그렇다" 이상으로 답한 반응이 없어요.${lean} 반응이 고정적이라는 뜻은 아니니, 힘든 시기에 실제로 어떻게 했는지 한 번 기록해 보세요.` },
      { type: 'callout', tone: 'gold', title: '작은 실천', text: '잘 버틴 날에 무엇을 했는지 짧게 기록해 두세요. 나에게 맞는 회복 방법이 보여요.' },
    )
  }
  // 반응 방식과 별개로, 지금 지친 정도(직장인)는 따로 짚음
  const wd = s.modules.do?.dims ?? {}
  if (stage === 'worker' && hi(wd.exhaustion) && !strongKinds.length) blocks.push({ type: 'text', text: `스트레스에 반응하는 방식은 뚜렷하지 않지만, 지금 지친 정도는 높게 답했어요(${wd.exhaustion.toFixed(1)}). 반응이 조용하다고 괜찮은 것은 아니에요. 회복이 먼저 필요한 상태일 수 있어요.` })
  if ((st.recovery ?? 3) < 3) blocks.push({ type: 'text', text: '이야기할 사람이나 문제를 쪼개는 습관 같은 회복 자원이 부족하다고 답했어요. 지칠 때 기댈 곳을 하나 정해 두세요.' })
  if (st.level === 'high') blocks.push({ type: 'callout', tone: 'warn', text: SUPPORT_NOTICE })
  return { title: STRESS_CONTEXT[stage].chapter, sub: '스트레스가 쌓였을 때 나타나는 나의 반응', blocks }
}

// ── 탐색: 결정 진단 ──
// 높은 어려움을 하나로 줄이지 않고 모두 돌려줌 — 푸는 순서(정보·경험 → 나의 기준 → 주변 기대 → 최종 결정)로 정렬
const DECISION_ORDER = ['lackInfo', 'lackSelf', 'conflict', 'indecision'] as const
const DECISION_SHORT: Record<string, string> = { lackInfo: '각 길에 대한 정보·경험', lackSelf: '나에 대한 기준', conflict: '주변의 기대와의 차이', indecision: '최종 결정' }
function decisionFor(s: CareerScores, stage: LifeStage): { keys: DecisionKey[]; exploreLow: boolean; exploreHigh: boolean } {
  const d = s.modules.find?.dims ?? {}
  const exploreLow = (d.exploration ?? 3) < 2.8
  const exploreHigh = hi(d.exploration)
  const keys: DecisionKey[] = DECISION_ORDER.filter(k => (d[k] ?? 0) >= 3.4)
  if (stage === 'college' && hi(d.majorSwitch)) keys.unshift('majorSwitch')
  if (stage === 'high' && !keys.length && lo(d.clarity)) keys.push('lackSelf')
  return { keys: keys.length ? keys : ['none'], exploreLow, exploreHigh }
}
const DECISION_STATE: Record<string, string> = {
  '거의 정했다': '이미 방향을 거의 정했다고 답했어요. 이 리포트를 그 선택을 점검하는 근거로 써 보세요.',
  '두세 가지 사이에서 고민 중이다': '두세 가지 사이에서 고민 중이라고 답했어요. 이 리포트의 직무 후보와 겹치는 선택지가 있는지 먼저 확인해 보세요.',
  '두세 개 사이에서 고민 중이다': '두세 개 사이에서 고민 중이라고 답했어요. 이 리포트의 직무 후보와 겹치는 선택지가 있는지 먼저 확인해 보세요.',
  '관심 분야는 있지만 구체적이지 않다': '관심 분야는 있지만 아직 구체적이지 않다고 답했어요. 이 리포트의 직무 후보가 그 관심을 구체화하는 출발점이 될 수 있어요.',
  '관심 분야만 있다': '관심 분야만 있다고 답했어요. 이 리포트의 직무 후보가 그 관심을 구체화하는 출발점이 될 수 있어요.',
  '아직 막막하다': '아직 막막하다고 답했어요. 괜찮아요. 막막함은 정보와 경험이 쌓이면 줄어들어요. 아래 "다음 행동"부터 하나씩 해보세요.',
}
// 맞춤 추천을 보류했으면, 직무 후보를 가리키는 문장을 "체험 예시"로 바꿈 (없는 추천을 참조하지 않도록)
function withoutPicks(text: string): string {
  return text
    .replace('고민 중인 선택지를 적고, 이 리포트의 직무 후보와 겹치는지, 다르다면 무엇이 다른지 확인해 보세요', '고민 중인 선택지를 적고, 각 선택지를 직무 후보 장의 체험처럼 작게 해 볼 방법을 한 가지씩 찾아보세요')
    .replace('이 리포트의 직무 후보와 겹치는 선택지가 있는지 먼저 확인해 보세요.', '이번 응답으로는 맞춤 직무 후보를 고르지 못해서, 고민 중인 선택지를 직접 작게 해 보며 비교하는 쪽을 권해요.')
    .replace('이 리포트의 직무 후보가 그 관심을 구체화하는 출발점이 될 수 있어요.', '이번 응답으로는 맞춤 직무 후보를 고르지 못했으니, 직무 후보 장의 체험 예시 중 관심 분야와 가까운 것부터 해 보세요.')
    .replace(' 추천 후보는 정한 방향과 비교해 보는 참고 자료예요.', '')
    .replace(' 고민 중인 선택지를 기준으로 삼고, 추천 후보는 그 선택지들과 비교할 대상으로 쓰세요.', ' 고민 중인 선택지를 기준으로 삼고, 직접 작게 해 보며 비교하세요.')
    .replace('추천 목록에서 두 개를 골라', '관심 가는 분야 두 개를 골라')
    .replace('"내 전공 + 관심 분야"가 겹치는 직무를 추천 목록에서 찾아보세요', '"내 전공 + 관심 분야"가 겹치는 직무를 찾아보세요')
    .replace('추천 목록을 "끌림"과 "조건" 두 기준으로 각각 순위를 매겨 비교해 보세요', '관심 가는 일을 "끌림"과 "조건" 두 기준으로 각각 순위를 매겨 비교해 보세요')
    .replace('짧은 과제나 프로젝트로 추천 분야 하나를 직접 해보세요', '직무 후보 장의 체험 예시 중 하나를 직접 해보세요')
}
const NOT_NARROWED = ['아직 막막하다', '관심 분야만 있다', '관심 분야는 있지만 구체적이지 않다']
// 새 활동을 더하라는 행동 — 탐색 경험이 이미 많은 사람에게는 "해 본 것 비교"로 바꿈
const NEW_ACTIVITY_ACTIONS = new Set([DECISION.lackSelf.actions[2], DECISION.indecision.actions[2], DECISION.majorSwitch.actions[2]])
function decisionChapter(s: CareerScores, stage: LifeStage, focus: Focus, noBasis: boolean): { chapter: Chapter; actions: string[] } {
  const { keys, exploreLow, exploreHigh } = decisionFor(s, stage)
  const state = s.modules.find?.choices?.decision
  const notNarrowed = typeof state === 'string' && NOT_NARROWED.includes(state)
  const blocks: Block[] = []
  let actions: string[]
  // 전공 전환 고민은 "어려움"과 따로 셈 — 어려움이 하나뿐인데 "여러 가지"라고 부르지 않음
  const named = keys.filter(k => DECISION_SHORT[k])
  const switching = keys.includes('majorSwitch')
  if (named.length >= 2) {
    blocks.push({ type: 'callout', tone: 'gold', title: `${named.length}가지가 함께 막고 있어요`, text: `${named.map(k => DECISION_SHORT[k]).join(', ')}에서 모두 어려움을 느낀다고 답했어요. 한꺼번에 풀려고 하면 더 막막해지니, 앞에서부터 순서대로 하나씩 풀어 보세요.` })
    blocks.push({ type: 'list', items: named.map(k => `${DECISION[k].title}: ${DECISION[k].body}${k === 'indecision' && notNarrowed ? ' 다만 아직 선택지가 좁혀지지 않았다고 답해서, 이 문제는 후보가 2~3개로 줄어든 뒤에 다뤄도 돼요.' : ''}`) })
    // 아직 선택지가 좁혀지지 않았으면 "최종 결정" 행동은 뒤로 미룸
    const act = named.filter(k => !(k === 'indecision' && notNarrowed))
    actions = act.length >= 2
      ? [DECISION[act[0]].actions[0], DECISION[act[1]].actions[0], DECISION[act[0]].actions[1]]
      : [...DECISION[act[0] ?? 'none'].actions]
  } else {
    const key = named[0] ?? (switching ? 'majorSwitch' : 'none')
    const d = DECISION[key]
    let body = d.body
    if (key === 'indecision' && notNarrowed) body += ' 다만 아직 비교할 선택지가 좁혀지지 않았다고 답해서, 결정 연습보다 후보를 2~3개로 줄이는 일이 먼저예요.'
    if (key === 'none' && state === '아직 막막하다') body = '정보, 나에 대한 기준, 주변의 기대, 최종 결정 중 크게 막힌다고 답한 것은 없는데, 전체적으로는 막막하다고 답했어요. 이럴 때는 고민을 더하기보다 직접 해 보는 경험이 먼저예요.'
    blocks.push({ type: 'callout', tone: 'gold', title: d.title, text: body })
    // 선택지가 아직 없으면 "고민 중인 선택지마다…" 대신 후보를 좁히는 행동부터
    actions = key === 'indecision' && notNarrowed ? [...DECISION.none.actions] : [...d.actions]
  }
  if (switching && named.length) blocks.push({ type: 'callout', tone: 'plain', title: DECISION.majorSwitch.title, text: DECISION.majorSwitch.body })
  // 선택 단계(정했다·비교 중)를 어려움 진단보다 우선 — 정한 방향을 추천 1위로 덮지 않음
  if (focus === 'verify' || focus === 'compare') {
    const sa = STAGE_ACTIONS[focus]
    blocks.push({ type: 'text', text: noBasis ? withoutPicks(sa.body) : sa.body })
    // 어려움이 있으면 그중 첫 행동 하나만 끼우고, 나머지는 선택 단계의 행동
    const diff = named.length ? actions.filter(a => !/추천|후보를 두세 개로/.test(a)).slice(0, 1) : []
    actions = [sa.actions[0], ...diff, ...sa.actions.slice(1)].slice(0, 3)
  }
  // 직접 해 보며 범위를 찾는 단계면, 후보를 좁히거나 공고를 모으는 행동보다 체험이 먼저
  if (focus === 'explore' && !named.length) actions = ['해 보지 않아서 모르는 것과, 해 봤는데 끌리지 않았던 것을 나눠 적어 보세요', `${noBasis ? '직무 후보 장의 체험 예시' : '관심 가는 분야'} 중 하나를 골라 짧게 해 보세요`, '해 본 뒤 끌리는 분야가 생기면, 그때 그 분야의 공고나 현직자 이야기를 찾아보세요']
  // 근거가 없어 추천을 보류했으면 "추천 목록에서 고르라"는 행동을 쓰지 않음
  if (noBasis) actions = actions.map(withoutPicks)
  // 이미 경험이 많은 사람에게 "더 해보라"고 하지 않음
  if (exploreHigh) actions = actions.map(a => (NEW_ACTIVITY_ACTIONS.has(a) ? '이미 해 본 활동들을 "다시 하고 싶은 것"과 "아닌 것"으로 나누고, 그 차이가 무엇인지 적어 보세요' : a))
  actions = [...new Set(actions)]
  if (typeof state === 'string' && DECISION_STATE[state] && focus !== 'verify' && focus !== 'compare') blocks.push({ type: 'text', text: noBasis ? withoutPicks(DECISION_STATE[state]) : DECISION_STATE[state] })
  if (stage === 'college' && hi(s.modules.find?.dims.majorFit) && !keys.includes('majorSwitch')) blocks.push({ type: 'text', text: '지금 전공이 잘 맞는다고 느끼고 있어요. 전공을 중심에 두고 흥미가 겹치는 직무부터 살펴보면 좋아요.' })
  if (exploreLow) blocks.push({ type: 'text', text: '직접 부딪혀 본 경험이 아직 적은 편이에요. 짧은 프로젝트나 체험처럼 실제로 해보는 경험이 어떤 조사보다 빠르게 방향을 알려줘요.' })
  if (exploreHigh) blocks.push({ type: 'text', text: '관심 분야를 이미 직접 경험해 봤다고 답했어요. 새 활동을 더하기보다, 해 본 경험을 비교해 정리하는 쪽이 지금 더 도움이 돼요.' })
  if (stage === 'high') {
    const crit = s.modules.find?.choices?.majorCriteria
    if (Array.isArray(crit) && crit.length) {
      const own = crit.includes('내가 좋아하는 분야')
      blocks.push({ type: 'text', text: `학과를 고를 때 중요하게 보는 기준으로 "${(crit as string[]).join('", "')}"${p((crit as string[])[crit.length - 1], '을/를')} 골랐어요.${own ? ' 좋아하는 분야를 기준에 넣은 건 오래 공부할 힘이 돼요.' : ' 여기에 "내가 좋아하는 분야"도 한 번 함께 놓고 비교해 보세요. 대학 4년을 버티는 힘은 흥미에서 나와요.'}` })
    }
  }
  blocks.push({ type: 'list', title: '다음 행동', items: actions, ordered: true })
  return { chapter: { title: '왜 결정이 어려울까', sub: '지금 진로 결정을 막고 있는 것', blocks }, actions }
}

// ── 직장인 탐색: 지금 직장 진단 ──
type WorkerDiag = 'burnout' | 'misfit' | 'environment' | 'feltMisfit' | 'stay'
// 중요도 4 이상인데 2점 이상 덜 채워지는 가치만 "빈 곳"으로 봄
const bigGapsOf = (s: CareerScores) => (s.values.gaps ?? []).filter(g => g.gap >= 2 && g.importance >= 4).slice(0, 3)
function workerDiag(s: CareerScores): WorkerDiag {
  const d = s.modules.find?.dims ?? {}
  const cj = s.currentJob
  // 직무 부적합은 본인이 느끼는 어긋남과 점수상 거리가 함께 있을 때만
  const lowRank = cj ? cj.rank > cj.total / 2 : true
  const veryLowRank = cj ? cj.rank > cj.total * 0.75 : false
  if (hi(d.cynicism) && s.stress.level !== 'low') return 'burnout'
  if ((hi(d.misfit) && lowRank) || (veryLowRank && (d.misfit ?? 0) >= 3)) return 'misfit'
  if (bigGapsOf(s).length) return 'environment'
  // 계산상 가깝더라도 본인이 맞지 않다고 강하게 답했으면 "어긋나지 않음"으로 덮지 않음
  if (hi(d.misfit)) return 'feltMisfit'
  return 'stay'
}
function workerFindChapters(s: CareerScores, focus: Focus): { chapters: Chapter[]; actions: string[]; headline: string; key: WorkerDiag; candidates: string[] } {
  const d = s.modules.find?.dims ?? {}
  const gaps = s.values.gaps ?? []
  const bigGaps = bigGapsOf(s)
  const cj = s.currentJob
  const cjName = cj ? CAREER_JOBS.find(x => x.id === cj.id)!.name : null
  const jobFits = cj ? cj.rank <= Math.ceil(cj.total / 4) : null
  const lowRank = cj ? cj.rank > cj.total / 2 : true
  type Key = WorkerDiag
  const key: Key = workerDiag(s)
  const gapNames = bigGaps.map(g => g.value).join('·') || '가치'
  const DIAG: Record<Key, { title: string; body: string; actions: string[] }> = {
    burnout: { title: '결정보다 회복이 먼저예요', body: '일에 대한 의미와 관심이 줄고 스트레스 신호도 함께 나타나요. 지친 상태에서 내린 결정은 "무엇이든 지금보다는 낫다"로 기울기 쉬워요. 큰 결정은 조금 회복한 뒤에 내리는 걸 권해요.', actions: ['2주 동안 퇴근 후와 주말에 일 생각을 끊는 시간을 정해 지켜 보세요', '지치게 만드는 원인이 업무량·사람·의미 중 어디에 가장 가까운지 적어 보세요', '회복된 뒤에도 같은 마음이라면, 그때 아래 추천 직무를 구체적으로 살펴보세요'] },
    misfit: { title: '직무가 맞지 않을 가능성을 살펴볼 때예요', body: `${hi(d.misfit) ? '지금 직무가 맞지 않는다고 직접 답했고' : '맞지 않는다고 강하게 답하지는 않았지만'}, ${cj ? (hi(d.misfit) ? '흥미 응답과도 거리가 있는 편이에요' : '흥미·가치로 계산한 거리가 큰 편이에요') : '지금 직무가 목록에 없어 흥미와의 거리는 계산하지 못했어요'}. 다만 이 답만으로는 맞지 않는 것이 직무 자체인지, 지금 맡은 업무 구성이나 환경인지 구분할 수 없어요. 직무 전환을 결정하기 전에 무엇이 맞지 않는지부터 나눠 보세요.`, actions: ['지금 일에서 맞지 않는 것을 "업무 내용", "환경·사람", "조건(보상·시간)"으로 나눠 각각 적어 보세요', '업무 내용이 문제라면, 아래 추천 직무 중 지금 경력과 가장 가까운 하나를 골라 필요한 역량을 정리해 보세요', '옮기기 전에 사이드 프로젝트나 사내 겸직으로 그 일을 작게 먼저 해보세요'] },
    environment: { title: '직무보다 환경이 문제일 수 있어요', body: `${hi(d.misfit)
      ? `지금 직무가 맞지 않는다고 답했는데, 응답을 보면 직무 자체보다 중요하게 여기는 ${w(gapNames, '이/가')} 채워지지 않는 쪽이 더 두드러져요.`
      : `${!cj ? '' : lowRank ? '직무에도 아쉬운 점이 있지만 그보다 먼저, ' : '직무 자체는 크게 어긋나지 않지만, '}중요하게 여기는 ${w(gapNames, '이/가')} 지금 직장에서 채워지지 않고 있어요.`} 같은 직무라도 다른 조직에서는 만족도가 크게 달라질 수 있어요.`, actions: ['채워지지 않는 가치를 지금 자리에서 조금이라도 채울 방법이 있는지 먼저 대화해 보세요', '같은 직무의 다른 회사 공고를 보며 그 가치를 채워주는 환경인지 확인해 보세요', '면접을 볼 때 그 가치에 대해 직접 질문할 목록을 만들어 두세요'] },
    feltMisfit: { title: '점수상으로는 가깝지만, 맞지 않다고 느끼고 있어요', body: '흥미와 가치로 계산하면 지금 직무와 크게 어긋나지 않지만, 직접은 맞지 않는다고 답했어요. 이번 응답만으로는 직무 자체, 맡은 업무 구성, 사람·조건 중 어느 쪽 때문인지 구분하기 어려워요. 옮기기 전에 원인부터 나눠 보세요.', actions: ['지금 일에서 맞지 않는 것을 "업무 내용", "환경·사람", "조건(보상·시간)"으로 나눠 각각 적어 보세요', '업무 내용이 문제라면, 지금 직무 안에서 업무 비중을 조정할 수 있는지 확인해 보세요', '환경이나 조건이 문제라면, 같은 직무의 다른 회사 공고에서 그 점이 다른지 확인해 보세요'] },
    stay: { title: '지금 자리가 크게 어긋나 있지는 않아요', body: cj ? '지금 직무와 환경이 흥미·가치와 크게 부딪히지 않아요. 옮기기보다 지금 자리에서 역할과 방식을 조정하며 성장하는 쪽이 효율적일 수 있어요.' : '중요한 조건이 크게 비어 있지 않고, 직무가 맞지 않는다는 응답도 강하지 않아요. 지금 직무가 목록에 없어 흥미와의 거리는 계산하지 못했어요. 옮기기보다 지금 자리에서 역할과 방식을 조정하며 성장하는 쪽이 효율적일 수 있어요.', actions: ['지금 일에서 가장 즐거운 업무의 비중을 늘릴 방법을 한 가지 찾아보세요', '1년 뒤 되고 싶은 모습을 정하고 필요한 경험을 목록으로 만드세요', '추천 직무는 장기적인 선택지로 참고만 해 두세요'] },
  }
  let diag = DIAG[key]
  // 회복이 초점인데 진단이 번아웃이 아니면 — 진단은 그대로 보여 주되, 전환·이직 준비 행동은 회복 뒤로
  if (focus === 'recover' && key !== 'burnout') diag = {
    ...diag,
    body: `${diag.body} 지금은 지친 정도가 높아서, 옮길 준비보다 회복을 먼저 권해요.`,
    actions: [DIAG.burnout.actions[0], DIAG.burnout.actions[1], key === 'stay' ? '회복된 뒤에 지금 자리에서 바꾸고 싶은 점이 남아 있는지 다시 점검해 보세요' : `회복된 뒤에도 같은 문제가 남으면, 그때 ${key === 'environment' ? '같은 직무의 다른 회사 공고와 비교해 보세요' : '아래 직무 목록에서 지금 경력과 가까운 하나를 골라 필요한 역량을 정리해 보세요'}`],
  }
  const now: Block[] = [{ type: 'callout', tone: 'gold', title: diag.title, text: diag.body }]
  if (cj && cjName) {
    // 상대 순위는 목록 안의 비교일 뿐 — 실제 만족이나 원인을 직접 보여주지 않음
    const fitText = cj.rank <= 5 ? '목록 안에서는 흥미·가치 응답과 가까운 쪽이에요.'
      : jobFits ? '목록 안에서 상위권이에요.'
      : !lowRank ? '목록 안에서 중간쯤이에요.'
      : '목록 안에서는 흥미·가치 응답과 거리가 있는 쪽이에요.'
    now.push({ type: 'text', text: `흥미와 가치 응답만으로 계산하면, 지금 직무인 ${w(cjName, '은/는')} ${cj.total}개 직무 중 ${cj.rank}번째예요. ${fitText} 같은 직무라도 맡은 업무와 회사에 따라 실제 만족은 크게 달라서, 이 순위만으로 맞다 안 맞다를 판단하지는 마세요.` })
  }
  if (gaps.length) {
    // 차이만이 아니라 중요도·충족도 원점수를 함께 — "5→3"과 "3→1"은 같은 차이라도 다른 상황
    if (gaps.every(g => g.gap <= 0)) {
      const important = [...gaps].sort((a, b) => b.importance - a.importance).slice(0, 3)
      now.push({ type: 'text', text: `중요하다고 답한 조건이 지금 직장에서 대체로 채워지고 있어요. ${important.map(g => `${g.value}(중요도 ${g.importance}, 충족 ${g.fulfilled})`).join(', ')}.` })
    } else {
      now.push({ type: 'bars', items: gaps.filter(g => g.gap > 0).slice(0, 5).map(g => ({ label: `${g.value} ${g.importance}→${g.fulfilled}`, value: g.gap, strong: g.gap >= 2 && g.importance >= 4 })) })
      now.push({ type: 'note', text: '"중요도→지금 채워지는 정도"이고, 막대 길이는 그 차이예요. 중요도가 높으면서 차이가 큰 것이 먼저 살펴볼 조건이에요.' })
    }
  }
  if (hi(d.turnover) && lo(d.preparing)) now.push({ type: 'callout', tone: 'plain', text: '떠나고 싶은 마음은 큰데 아직 준비한 것은 적은 상태예요. 준비 없이 옮기면 같은 고민이 반복되기 쉬워요. 아래 행동부터 작게 시작해 보세요.' })
  const dir = s.modules.find?.choices?.direction
  const DIR: Record<string, string> = {
    '한 분야의 깊은 전문가': '5년 뒤 한 분야의 깊은 전문가를 원한다고 답했어요. 이직보다 한 분야에서 깊이를 쌓을 수 있는 환경인지가 더 중요한 기준이에요.',
    '사람과 조직을 이끄는 관리자': focus === 'recover'
      ? '5년 뒤 관리자를 원한다고 답했어요. 다만 지금은 회복이 먼저라, 이끄는 경험을 더하는 일은 지친 정도가 줄어든 뒤로 미뤄 두세요.'
      : '5년 뒤 관리자를 원한다고 답했어요. 원하는 것과 맞는 것은 다를 수 있으니, 지금 자리에서 작은 프로젝트 하나를 이끌어 보며 확인해 보세요.',
    '내 일을 하는 독립·창업': '5년 뒤 독립·창업을 원한다고 답했어요. 지금 직장에서 배울 수 있는 것(고객, 운영, 영업)을 의도적으로 흡수해 두세요.',
    '지금 일을 안정적으로 지속': '지금 일을 안정적으로 이어가고 싶다고 답했어요. 그렇다면 지금 자리에서 지치지 않는 방식을 찾는 게 가장 큰 과제예요.',
    '전혀 다른 분야로 전환': focus === 'recover'
      ? '전혀 다른 분야로 전환하고 싶다고 답했어요. 그 마음은 그대로 두고, 회복한 뒤에 아래 직무 중 지금 경력의 강점을 가져갈 수 있는 곳부터 살펴보세요.'
      : '전혀 다른 분야로 전환하고 싶다고 답했어요. 아래 추천 직무 중 지금 경력의 강점을 가져갈 수 있는 곳부터 살펴보세요.',
  }
  if (typeof dir === 'string' && DIR[dir]) now.push({ type: 'text', text: DIR[dir] })
  // 5년 희망(탐색)과 지금 트랙 선택(향상)이 다를 때 — 둘 중 하나를 틀렸다고 보지 않고 관계를 설명
  const track = s.modules.do?.choices?.track
  if (dir === '한 분야의 깊은 전문가' && track === '아직 모르겠다') now.push({ type: 'text', text: '5년 뒤에는 한 분야의 전문가를 원하지만, 당장의 트랙은 아직 모르겠다고 답했어요. 장기 방향은 있고 다음 한 걸음이 정해지지 않은 상태로 볼 수 있어요.' })
  if (dir === '사람과 조직을 이끄는 관리자' && track === '지금 직무의 깊은 전문가') now.push({ type: 'text', text: '5년 뒤에는 관리자를 원하지만, 지금은 전문가 쪽을 택했어요. 전문성을 먼저 쌓은 뒤 이끄는 자리로 가려는 순서일 수 있어요.' })
  now.push({ type: 'list', title: '다음 행동', items: diag.actions, ordered: true })

  // 초점이 지금 자리(유지·환경·회복)면 다른 직무는 참고로 세 개만 — 지금 직무를 기준으로 남김
  const keepCurrent = focus === 'stay' || focus === 'environment' || focus === 'recover' || focus === 'diagnose'
  const noBasis = jobsNoBasis(s, cj?.id)
  const picks = noBasis ? [] : jobPicks(s, cj?.id).slice(0, keepCurrent ? 3 : 5)
  const tie = noBasis ? 0 : Math.min(picks.length, nearTieCount(pickScores(s, cj?.id)))
  const jobBlocks: Block[] = []
  if (cj && cjName) jobBlocks.push({ type: 'note', text: `지금 직무인 ${w(cjName, '은/는')} 이 목록에서 뺐어요(${cj.total}개 중 ${cj.rank}위). ${focus === 'recover' ? '지금은 회복이 우선이라 다른 직무는 참고로 세 개만 두었어요. 회복한 뒤에도 옮기고 싶다면 그때 비교해 보세요.' : focus === 'diagnose' ? '지금은 맞지 않는 원인을 먼저 나눠 보는 단계라, 다른 직무는 참고로 세 개만 두었어요.' : keepCurrent ? '지금은 같은 직무를 기준으로 보는 단계라, 다른 직무는 참고로 세 개만 보여 드려요.' : '아래는 옮긴다면 비교해 볼 후보예요.'}` })
  if (noBasis) jobBlocks.push(...noBasisBlocks(s))
  else {
    jobBlocks.push({ type: 'picks', items: picks })
    if (tie >= 2) jobBlocks.push({ type: 'note', text: `1~${tie}위는 점수 차이가 거의 없어요. 순서보다 하나의 후보군으로 보고, 실제 업무를 비교해 고르세요.` })
  }
  jobBlocks.push(...avoidBlock(s), { type: 'note', text: PICKS_SCOPE }, ...(noBasis ? [] : [{ type: 'note' as const, text: AI_BASIS }]))
  return {
    chapters: [
      { title: '지금 직장 진단', sub: '지금 자리를 바꿔야 할까, 조정하면 될까', blocks: now },
      { title: focus === 'recover' ? '회복한 뒤 살펴볼 직무' : keepCurrent ? '참고로 살펴볼 직무' : '옮긴다면 살펴볼 직무', sub: keepCurrent ? '지금 바로 옮기라는 뜻이 아니에요. 장기적인 선택지로 참고만 해 두세요.' : '흥미를 가장 크게 반영하고, 가치 조건과 성향상 신경 쓸 점을 더해 골랐어요.', blocks: jobBlocks },
    ],
    actions: diag.actions,
    headline: diag.title,
    key,
    candidates: picks.slice(0, Math.max(tie, 1)).map(pk => pk.name),
  }
}
const AI_BASIS = 'AI 변화 전망은 2026년 9월 기준으로, 직무 전체가 아니라 업무 단위의 변화를 정리한 것이에요. 기술 변화에 따라 매년 갱신합니다.'
// 가치가 고르게 나왔으면 "피해야 할 환경"을 임의로 두 개 고르지 않음
function avoidBlock(s: CareerScores): Block[] {
  return s.avoidEnv.length && !s.values.flat ? [{ type: 'list', title: '피해야 할 환경', items: s.avoidEnv }] : []
}

// ── 향상: 시기별 실행 챕터 ──
function doChapters(s: CareerScores, stage: LifeStage, focus: Focus): { chapters: Chapter[]; tips: string[] } {
  const d = s.modules.do?.dims ?? {}
  const c = s.modules.do?.choices ?? {}
  const st = s.style ?? {}
  const chapters: Chapter[] = []
  const tips: string[] = []

  if (stage === 'high') {
    const method: string[] = []
    if (hi(st.planning)) method.push('주간 계획표를 만들고 매일 체크하는 방식이 잘 맞아요')
    else if (hi(d.deadline)) method.push('마감이 있어야 속도가 붙는 편이라, 시험 2주 전에 "나만의 모의 마감"을 만들어 두세요')
    if (hi(st.deepFocus)) method.push('과목 하나를 50분씩 깊게 파는 블록 공부를 2주 해 보고, 맞는지 확인해 보세요')
    else if (hi(st.switching)) method.push('25~30분 단위로 과목을 바꿔 가며 공부하는 방식을 2주 시험해 보세요')
    if (hi(st.collab)) method.push('친구에게 설명하며 공부해 보고, 설명이 막히는 부분을 따로 표시해 두세요 (가르치며 배우기)')
    else if (hi(st.ownership)) method.push('혼자 문제를 끝까지 풀어 보는 방식이 실력으로 이어져요')
    if (hi(d.distraction)) method.push('공부할 때는 휴대폰을 다른 방에 두세요. 의지보다 환경이 훨씬 강해요')
    if (hi(d.intrinsic)) method.push('궁금한 과목부터 시작해 공부의 흐름을 만든 뒤 다른 과목으로 넘어가세요')
    else if (hi(d.external)) method.push('주변의 기대가 큰 동기라면, 작은 목표를 스스로 세우고 달성 기록을 남겨 "내 동기"로 바꿔 가세요')
    if (!method.length) method.push('여러 방법을 2주씩 시험해 보고, 가장 오래 집중된 방법을 나의 기본 방식으로 정하세요')
    const track = c.track
    const TRACK: Record<string, string> = {
      '학생부 위주': '학생부 위주 전형은 3년 동안 꾸준히 쌓는 과정이 중요해요. 계획을 세우고 지키는 힘이 곧 전략이에요.',
      '수능 위주': '수능 위주 전형은 긴 호흡으로 한 번에 실력을 끌어올려야 해요. 깊게 몰입하는 시간을 매일 확보하는 게 핵심이에요.',
      '둘 다': '두 전형을 함께 준비한다면, 학기 중에는 내신과 수행평가에, 방학에는 수능 과목에 무게를 두는 식으로 시기를 나누세요.',
      '아직 모르겠다': '전형을 아직 정하지 않았다면, 2학년 1학기까지는 내신을 놓치지 않으면서 선택지를 넓게 유지하세요.',
    }
    const blocks: Block[] = [{ type: 'list', items: method }]
    if (typeof track === 'string' && TRACK[track]) blocks.push({ type: 'text', text: TRACK[track] })
    const weak = c.weakSubjects
    if (Array.isArray(weak) && weak.length) blocks.push({ type: 'text', text: `가장 신경 쓰이는 ${w((weak as string[]).join('·'), '은/는')} 하루 공부의 첫 시간에 배치해 보세요. 에너지가 가장 많을 때 어려운 과목을 하면 부담이 줄어요.` })
    chapters.push({ title: '나에게 맞는 공부법', sub: '공부하는 방식과 동기를 바탕으로', blocks })
    tips.push(method[0])

    const exam: Block[] = []
    if (hi(d.testAnxiety)) {
      exam.push({ type: 'callout', tone: 'plain', title: '시험 앞에서 긴장이 큰 편', text: '실력만큼 결과가 안 나오는 이유가 공부량이 아니라 긴장일 수 있어요. 긴장은 없애는 게 아니라 익숙해지는 거예요.' })
      exam.push({ type: 'list', items: ['시험과 똑같은 시간·환경에서 모의고사를 풀어 보는 연습을 늘리세요', '시험 직전 1분은 4초 들이쉬고 6초 내쉬는 호흡을 해 보세요', '오답 노트만큼 "맞힌 문제" 기록도 남겨 자신감을 쌓으세요'] })
      tips.push('시험과 같은 조건에서 모의고사를 푸는 연습을 늘리세요')
    }
    if (lo(d.efficacy)) exam.push({ type: 'text', text: '노력해도 성적이 오를지 확신이 적은 상태예요. 한 과목을 정해 2주 동안 작은 목표를 달성하는 경험부터 만들어 보세요.' })
    if (hi(d.performance)) exam.push({ type: 'text', text: '무료 검사에서 "많은 사람 앞에서 발표하는 것이 부담스럽지 않다"에 낮게 답했어요. 발표나 모둠 활동이 있는 수행평가가 부담스러울 수 있어요. 발표는 첫 문장만 외워 두고, 모둠에서는 자료 정리처럼 강점을 살릴 역할을 먼저 맡아 보세요.' })
    if (exam.length) chapters.push({ title: '시험과 수행평가', blocks: exam })
  }

  if (stage === 'college') {
    const study: string[] = []
    if (hi(d.reorganize)) study.push('수업 내용을 내 방식으로 다시 정리해야 이해되는 편이라고 답했어요. 수업이 끝난 날 핵심 개념 세 개를 한 페이지에 다시 정리하고, 이해되지 않은 부분은 물음표로 남겨 다음 확인 때 먼저 물어보세요')
    if (hi(d.deadline)) study.push('마감 직전에 몰아서 하는 편이에요. 마감 3일 전을 "나만의 마감"으로 정하고 초안만이라도 끝내 두세요')
    if (hi(st.deepFocus)) study.push('공강 시간을 흩어 쓰기보다 한 번에 몰아 깊게 공부하는 시간으로 쓰세요')
    if (hi(d.balance)) study.push('학점과 대외활동 사이에서 균형이 어렵다면, 학기마다 "이번 학기 핵심 하나"를 정해 우선순위를 분명히 하세요')
    if (!study.length) study.push('과목마다 공부 방식을 달리 시험해 보고, 가장 효과 좋았던 방식을 정리해 두세요')
    tips.push(study[0])
    // 학업과 팀 프로젝트는 한 장으로 — 한두 줄짜리 장을 따로 두지 않음
    const team: Block[] = [{ type: 'list', title: '학업', items: study }]
    if (hi(d.teamLead)) team.push({ type: 'text', text: '팀 프로젝트에서 역할 분담과 일정 관리를 맡는 편이에요. 이 경험은 그대로 리더십과 조율 역량의 근거가 돼요. 무엇을 조율했는지 기록해 두세요.' })
    if (hi(d.teamFriction)) team.push({ type: 'callout', tone: 'plain', text: '팀에서 제 몫을 안 하는 사람이 있으면 크게 스트레스받는 편이에요. 첫 회의에서 역할과 중간 점검 날짜를 문서로 정해 두세요. 기준이 문서에 있으면 갈등이 생겨도 이야기할 근거가 돼요.' })
    if (hi(d.presentation)) team.push({ type: 'text', text: '무료 검사에서 "많은 사람 앞에서 발표하는 것이 부담스럽지 않다"에 낮게 답했어요. 발표가 부담스러운 편이라면, 전체 대본보다 "첫 30초"만 완벽하게 준비하고 실제 공간에서 한 번 리허설해 보세요.' })
    if (lo(d.teamLead) && !hi(d.teamFriction)) team.push({ type: 'text', text: '팀 프로젝트에서 역할 분담이나 일정 관리를 맡는 편은 아니라고 답했어요. 리드가 아니어도 "자료 정리", "최종 검토"처럼 맡을 역할을 첫 회의에서 먼저 정해 두면 기여가 분명해져요.' })
    chapters.push({ title: '학업과 팀 프로젝트', blocks: team })
  }

  if (stage === 'jobseeker') {
    const str = strengths(s.hexaco)
    // 확인 욕구처럼 부담을 뜻하는 항목은 강점 후보에서 제외
    const styleStr = Object.keys(STYLE_STRENGTH).filter(k => hi(st[k])).sort((a, b) => st[b] - st[a]).slice(0, 2).map(k => STYLE_STRENGTH[k])
    const cands = [...str, ...styleStr]
    const doc: Block[] = cands.length
      ? [
          { type: 'tags', title: '자기소개서 강점 후보', items: cands },
          { type: 'note', text: '성향과 응답에서 보이는 후보예요. 실제 경험(상황·행동·결과)으로 보여 줄 수 있는 것만 강점으로 쓰세요.' },
          { type: 'text', text: '예시 문장: "저는 [강점]을 바탕으로 [구체적인 경험]에서 [결과]를 만들었습니다." 후보 중 경험으로 증명할 수 있는 것 하나만 골라, 강점 하나에 경험 하나를 짝지어 쓰세요.' },
        ]
      : [{ type: 'callout', tone: 'plain', title: '강점 후보를 고를 근거가 부족해요', text: '성향 점수와 일하는 방식 응답에서 두드러진 강점이 나오지 않았어요. 강점이 없다는 뜻이 아니라, 점수로 고를 근거가 부족하다는 뜻이에요. 최근 잘 해낸 일 세 가지를 적고, 각각 "그때 내가 한 행동"을 한 줄씩 붙여 보면 강점이 보여요.' }]
    if (hi(d.storyGap)) doc.push({ type: 'callout', tone: 'plain', text: `내 경험 중 무엇을 내세워야 할지 모르겠다고 답했어요. ${cands.length ? '위 후보 목록을 기준으로' : '잘 해낸 일을 기준으로'} 지난 경험을 다시 훑어보면, 평범해 보였던 경험도 강점의 근거가 돼요.` })
    if (lo(d.tailoring)) doc.push({ type: 'text', text: '지원하는 곳마다 자기소개서를 맞춰 고치는 편은 아니에요. 다음 지원 공고에서 주요 업무 세 가지를 골라, 각각에 연결되는 내 경험을 한 문장씩 써 보세요. 요건과 경험의 연결이 분명한지 다른 사람에게 확인받아 보세요.' })
    else if (hi(d.tailoring)) doc.push({ type: 'text', text: '이미 지원하는 곳마다 자기소개서를 맞춰 고친다고 답했어요. 다음 단계는 "왜 이 회사인가"를 그 회사의 최근 사업이나 제품 하나와 연결해 한 문장으로 쓰는 거예요.' })
    // 서류의 한 요소(서술 자신감)가 다른 서류 병목(맞춤화·경험 선정·피드백)을 덮지 않게
    const docGap = hi(d.storyGap) || lo(d.tailoring) || lo(d.feedbackSeeking)
    if (hi(d.storytelling) && !docGap && (hi(d.interviewNerves) || hi(d.rejectionRecovery))) doc.push({ type: 'text', text: '경험을 풀어내는 데 자신이 있고 서류에서 크게 막힌 점도 없다고 답했어요. 반면 면접이나 불합격 뒤 회복은 어렵다고 답해서, 시간을 그쪽에 더 쓰는 게 효율적일 수 있어요.' })
    else if (hi(d.storytelling)) doc.push({ type: 'text', text: `경험을 강점으로 풀어내는 데는 자신이 있다고 답했어요.${docGap ? ' 다만 위에서 짚은 서류 과제는 서술 실력과 별개라서, 그 부분은 따로 챙겨야 해요.' : ''}` })
    // 이번 주 행동은 가장 크게 답한 병목에서 고르고, 왜 그것부터인지 밝힘
    const bottleneck: { on: boolean; sev: number; label: string; tip: string }[] = [
      { on: hi(d.interviewNerves), sev: d.interviewNerves ?? 0, label: '면접 긴장', tip: '예상 면접 질문 10개를 소리 내어 답하며 녹화하고, 가장 막힌 답 하나만 다시 다듬어 보세요' },
      { on: hi(d.rejectionRecovery), sev: d.rejectionRecovery ?? 0, label: '불합격 뒤 회복', tip: '최근 불합격 하나에서 "배운 점 하나"만 적고, 다음 지원 일정을 바로 달력에 넣어 보세요' },
      { on: hi(d.storyGap), sev: d.storyGap ?? 0, label: '내세울 경험 고르기', tip: '지난 경험 10개를 적고, 그중 관심 분야나 지원 직무와 이어지는 경험 두 개를 골라 보세요' },
      { on: lo(d.tailoring), sev: 6 - (d.tailoring ?? 3), label: '지원처별 맞춤화 부족', tip: '다음 지원 공고의 "주요 업무" 세 가지를 내 경험과 한 문장씩 연결해 보세요' },
      { on: lo(d.feedbackSeeking), sev: 6 - (d.feedbackSeeking ?? 3), label: '외부 피드백 부족', tip: '자기소개서나 면접 답변 하나를 다른 사람 한 명에게 보여 주고 의견을 받아 보세요' },
      { on: lo(d.efficacy), sev: 6 - (d.efficacy ?? 3), label: '합격 자신감 부족', tip: '목표 한 곳보다, 이번 달에 서류 통과나 인턴처럼 작은 합격 하나를 목표로 정해 보세요' },
    ].filter(b => b.on).sort((a, b) => b.sev - a.sev)
    if (bottleneck.length >= 2) {
      const sameTop = bottleneck.filter(b => b.sev === bottleneck[0].sev)
      doc.push({ type: 'list', title: '지원 준비에서 어렵다고 답한 것 (숫자가 클수록 어렵다고 답한 정도)', items: bottleneck.map(b => `${b.label}(${f1(b.sev)}): ${b.tip}`) })
      doc.push({ type: 'note', text: sameTop.length > 1 ? `${sameTop.map(b => b.label).join('·')}${p(sameTop[sameTop.length - 1].label, '이/가')} 같은 크기라, 이번 주에는 그중 "${bottleneck[0].label}" 하나부터 시작하도록 골랐어요. 나머지도 위 목록에 그대로 남겨 뒀어요.` : `이번 주 행동은 가장 크게 답한 "${bottleneck[0].label}"에서 골랐어요. 나머지도 위 목록에 그대로 남겨 뒀어요.` })
    }
    const tg = Array.isArray(c.targetGroup) && c.targetGroup.length ? (c.targetGroup as string[]).join(', ') : null
    if (tg) doc.push({ type: 'text', text: `지원하려는 직무군으로 ${w(tg, '을/를')} 골랐어요. 아래 양식은 ${tg} 직무 공고를 기준으로 채워 보세요. 같은 직무군 안에서도 회사마다 요건이 달라서, 공고 문장을 그대로 옮겨 적는 게 정확해요.` })
    doc.push({ type: 'form', title: '지원 요건과 내 경험 연결하기', fields: ['지원 요건 (공고 문장 그대로)', '관련 경험', '그때 내가 한 행동', '결과·증거', '부족한 점', '다음에 고칠 것'], rows: 3, note: `${focus === 'explore' || focus === 'narrow' ? '이미 지원 중이거나 지원할 직무가 정해진 뒤에 채우세요. 지금은 로드맵의 기록 하나만 채워도 충분해요. ' : ''}${tg ? `지원하려는 ${tg} 직무 공고 하나를 골라 요건 세 줄만 먼저 채워 보세요.` : '공고 하나를 골라 요건 세 줄만 먼저 채워 보세요.'}` })
    chapters.push({ title: '서류: 나를 보여주는 법', blocks: doc })
    tips.push(bottleneck[0]?.tip ?? '관심 가는 직무 공고 세 개를 골라, 내 경험으로 채워지는 요건과 비는 요건을 표로 나눠 보세요')

    const iv: Block[] = []
    // 면접 인상은 외향성이 뚜렷하게 높거나 낮을 때만 짐작 — 중간이면 단정하지 않음
    iv.push({ type: 'text', text: s.hexaco.X >= 3.5 ? '사람 앞에서 에너지를 얻는 편이라 면접에서 활기가 드러나기 쉬워요. 다만 말이 길어지지 않게 답변을 1분 안에 끝내는 연습을 해 보세요.'
      : s.hexaco.X <= 2.5 ? '처음 만나는 사람 앞에서는 말수가 줄 수 있어요. 첫 답변(자기소개)부터 준비해 두세요. 시작이 정해져 있으면 다음 답변으로 넘어가기가 수월할 수 있어요.'
      : '면접에서 어떤 인상을 주는지는 이번 응답으로 판단하기 어려워요. 모의 답변 하나를 녹화해 보면 말 속도와 길이를 직접 확인할 수 있어요.' })
    if (hi(d.interviewNerves)) iv.push({ type: 'list', title: '면접 긴장 줄이기', items: ['예상 질문 10개를 소리 내어 답하며 녹화해 보세요', '답변은 외우지 말고 핵심 키워드 세 개만 기억하세요', '면접장 도착 후에는 준비물을 확인하기보다 천천히 호흡하세요'] })
    if (hi(d.rejectionRecovery)) iv.push({ type: 'callout', tone: 'plain', text: '불합격 뒤 회복이 오래 걸리는 편이에요. 결과가 나오면 "배운 점 하나"만 적고 다음 지원 일정을 바로 잡아 두세요. 다음 행동이 정해져 있으면 곱씹는 시간이 줄어요.' })
    if (lo(d.feedbackSeeking)) iv.push({ type: 'text', text: '혼자 준비하는 편이에요. 서류나 면접을 한 번이라도 다른 사람에게 보여주면 혼자서는 안 보이던 점이 보여요.' })
    if (lo(d.efficacy)) iv.push({ type: 'text', text: '합격할 수 있다는 확신이 적은 상태예요. 목표 한 곳보다, 작은 합격(서류 통과, 인턴) 하나를 먼저 목표로 잡아 보세요.' })
    chapters.push({ title: '면접과 결과 다루기', blocks: iv })
  }

  if (stage === 'worker') {
    const perf: Block[] = []
    const recovering = focus === 'recover'
    if (recovering) perf.push({ type: 'callout', tone: 'plain', title: '지금은 더하기보다 덜어 내기', text: '이 리포트의 초점은 회복이에요. 그래서 이 장에서는 일을 더 맡는 조언 대신, 부담을 줄이고 지금 하는 일을 덜 힘들게 하는 방법만 골랐어요. 역할을 넓히는 고민은 지친 정도가 줄어든 뒤에 해도 늦지 않아요.' })
    // 더 맡고 싶은 역할이 없다고 답한 사람에게 역할 확대를 권하지 않음
    if (!recovering && hi(d.engagement) && hi(d.efficacy)) perf.push({ type: 'callout', tone: 'gold', text: hi(d.roleAppetite) ? '일에 몰입하고 성과도 느끼고 있어요. 더 맡고 싶은 역할도 있다고 답했으니, 지금은 "무엇을 더 맡을까"를 구체적으로 정할 때예요.' : lo(d.roleAppetite) ? '일에 몰입하고 성과도 느끼고 있어요. 지금 역할을 넓히기보다 깊게 다지고 싶다고 답했으니, 지금 하는 일에서 전문성을 더 쌓고 그것이 인정받는 방법을 찾는 쪽이 맞아요.' : '일에 몰입하고 성과도 느끼고 있어요. 지금의 강점이 어디서 나오는지 정리해 두면 다음 선택의 기준이 돼요.' })
    else if (lo(d.efficacy)) perf.push({ type: 'callout', tone: 'plain', text: '성과를 내고 있다는 느낌이 적은 상태예요. 실제 성과가 없어서라기보다 성과가 보이지 않는 구조일 수 있어요. 한 달 동안 해낸 일을 매주 세 줄씩 기록해 보세요.' })
    if (lo(d.clearCriteria)) perf.push({ type: 'text', text: '내 성과가 어떤 기준으로 평가되는지 분명하지 않아요. 다음 면담에서 "이번 분기에 가장 중요한 결과 한 가지"를 직접 물어보세요. 기준이 보이면 노력의 방향이 정해져요.' })
    // 문장마다 혼자 읽혀도 뜻이 통하게 (요약에 그대로 옮겨도 "그 역할" 같은 지시어가 남지 않도록)
    const craft: string[] = []
    if (hi(d.autonomy)) craft.push('일하는 방식을 조정할 재량이 있다고 답했으니, 가장 에너지가 많은 시간대에 가장 중요한 업무를 두도록 순서를 바꿔 보세요')
    if (hi(d.roleAppetite) && !recovering) craft.push('더 맡고 싶은 역할 하나를 정하고, 지금 업무의 일부(예: 일주일에 반나절)를 그 역할에 쓰는 작은 제안을 준비해 보세요')
    if (hi(st.collab) && !recovering) craft.push('함께할 때 힘이 나는 편이라고 답했으니, 협업이 많은 업무의 비중을 조금 늘려 보고 그 전후를 비교해 보세요')
    if (hi(st.meaningDrive)) craft.push('일의 의미가 중요한 편이에요. 내 업무가 누구에게 어떤 도움이 되는지 한 번 정리해 보세요')
    if (hi(st.deepFocus)) craft.push('깊게 몰입할 때 성과가 나는 편이라, 회의 없는 시간을 팀에 요청해 보세요')
    if (recovering) craft.push('이번 주 업무 중 미루거나 다른 사람과 나눌 수 있는 일 하나를 골라, 조정을 요청해 보세요')
    if (craft.length < 2) craft.push('지금 업무 중 가장 즐거운 일과 가장 소모되는 일을 하나씩 적고, 즐거운 일의 비중을 늘릴 방법을 찾아보세요')
    if (craft.length < 3) craft.push('매주 반복되는 업무 하나를 골라 체크리스트나 템플릿으로 만들어 보세요. 같은 결과를 더 적은 시간에 내는 것도 성과예요')
    if (craft.length < 3) craft.push('내가 빠져도 일이 돌아가도록 업무 인수인계 문서를 한 장 만들어 두세요. 휴가나 이동 때 부담이 줄고, 내 일의 범위도 분명해져요')
    perf.push({ type: 'list', title: '잡 크래프팅: 직무는 그대로, 일하는 방식을 나에게 맞게', items: craft })
    tips.push(craft[0])

    const rel: Block[] = []
    if (hi(d.bossStrain)) rel.push({ type: 'callout', tone: 'plain', text: '상사와의 관계가 큰 스트레스예요. 관계 전체를 바꾸려 하기보다 "보고 방식"과 "확인 시점" 두 가지만 맞춰 보세요. 부딪힘의 상당 부분이 기대의 차이에서 와요.' })
    if (lo(d.peerSupport)) rel.push({ type: 'text', text: '동료와 도움을 주고받기가 편하지 않은 상태예요. 작은 도움을 먼저 건네는 것부터 시작해 보세요.' })
    if (hi(d.voice)) rel.push({ type: 'text', text: '공식 자리에서 의견을 말하기 어려운 편이에요. 회의 전에 하고 싶은 말 한 문장을 적어 두고, 회의 초반에 먼저 말해 보세요. 늦을수록 말하기가 더 어려워져요.' })
    if (rel.length) chapters.push({ title: '직장 관계', blocks: rel })

    const burn: Block[] = []
    if (hi(d.exhaustion)) {
      burn.push({ type: 'callout', tone: 'plain', title: '지침 신호가 커요', text: '퇴근할 때 에너지가 다 빠지고 출근 생각만으로도 지치는 상태예요. 의지로 버틸 문제가 아니라 회복이 필요한 신호예요.' })
      burn.push({ type: 'list', items: ['퇴근 후 일 연락을 확인하지 않는 시간을 정하세요', '업무량 조정이 필요하다면 구체적인 업무 목록과 함께 이야기해 보세요', '2주 이상 이 상태가 이어지면 전문가와 상담해 보세요'] })
      if (s.stress.level !== 'low') burn.push({ type: 'callout', tone: 'warn', text: SUPPORT_NOTICE })
      chapters.push({ title: '번아웃 신호', blocks: burn })
    }

    // 커리어 트랙 — 원하는 것과 맞는 것을 구분하고, 초점(회복·독립)과 5년 희망을 반영
    const track = c.track
    const dir = s.modules.find?.choices?.direction
    let t: string | undefined
    if (typeof track === 'string') {
      if (recovering) t = `${track === '아직 모르겠다' ? '트랙은 아직 모르겠다고' : `${track} 쪽을 원한다고`} 답했어요. 지금은 회복이 먼저라, 리드를 맡거나 새 과제를 더하는 실험은 지친 정도가 줄어든 뒤로 미뤄 두세요. 그때 다시 정해도 늦지 않아요.`
      else if (focus === 'independent') t = `5년 뒤 독립·창업을 원한다고 답했어요. ${track === '아직 모르겠다' ? '관리자와 전문가 중에 고르기보다' : `${track} 트랙과 별개로,`} 지금 자리에서 독립에 필요한 경험(고객을 직접 상대하기, 혼자 끝까지 만든 결과물)을 쌓을 수 있는 과제를 고르는 게 맞아요.`
      else if (track === '지금 직무의 깊은 전문가') t = s.hexaco.O >= 3.5 ? '전문가 트랙을 원한다고 답했어요. 새로운 것에 대한 호기심도 높게 나왔으니, 한 분야를 깊게 파되 인접 분야를 하나 더 익히는 방향을 생각해 볼 수 있어요.' : '전문가 트랙을 원한다고 답했어요. 한 분야를 깊게 다져 그 분야의 기준이 되는 사람이 되는 방향이에요.'
      else if (track === '팀을 이끄는 관리자') {
        t = `관리자 트랙을 원한다고 답했어요. ${s.hexaco.X >= 3.5 || s.hexaco.A >= 3.5 ? '외향성이나 원만성 점수로 보면 사람과 함께 일하는 쪽이 낯설지 않은 편이에요. ' : s.hexaco.X <= 2.5 && s.hexaco.A <= 2.5 ? '외향성·원만성 점수로 보면 사람 앞에서 에너지를 쓰는 일이 소모가 클 수 있어요. ' : ''}다만 원하는 것과 맞는 것은 다를 수 있어서, 작은 프로젝트 하나를 이끌어 보며 확인하는 게 먼저예요.`
        if (s.interest && s.interest.raw.E <= 2.5) t += ' 사람을 이끌고 설득하는 활동에 대한 끌림은 낮게 나왔어요. 관리자가 되고 싶은 이유가 보상·인정·영향력 중 무엇인지 먼저 적어 보면, 관리자 자리와 다른 방법 중 무엇이 맞는지 보여요.'
        if (lo(d.peerSupport)) t += ' 또 동료와 도움을 주고받기가 편하지 않다고 답했어요. 관리자의 일은 상당 부분이 위임과 지원이라, 후배 한 명의 일을 돕는 작은 과제부터 해 보세요.'
      } else if (track === '아직 모르겠다') t = dir === '한 분야의 깊은 전문가'
        ? '당장의 트랙은 모르겠다고 했지만, 5년 뒤에는 전문가를 원한다고 답했어요. 리드 경험과 비교하기보다, 지금 직무에서 깊게 해 보고 싶은 과제 하나를 먼저 골라 보세요.'
        : '아직 방향을 정하지 못했다면, 1년 동안 작은 리드 경험과 깊이 있는 전문 과제를 하나씩 해보고 어느 쪽이 더 즐거웠는지 비교해 보세요.'
    }
    if (t) perf.push({ type: 'callout', tone: 'plain', title: `커리어 트랙: ${track}`, text: t })
    chapters.unshift({ title: '지금 자리에서의 성과', blocks: perf })   // 직장 관계·번아웃 장보다 앞에
  }

  return { chapters, tips }
}

// ═══════════════ 조립 ═══════════════
const PLAN_LABEL: Record<Plan, string> = { find: '탐색', do: '향상', both: '탐색 + 향상' }
const TITLE: Record<LifeStage, Record<Goal, string>> = {
  high: { find: '나에게 맞는 계열·학과 리포트', do: '나에게 맞는 공부법 리포트' },
  college: { find: '전공 이후의 진로 리포트', do: '학업과 팀 프로젝트 리포트' },
  jobseeker: { find: '나에게 맞는 직무 리포트', do: '서류와 면접 전략 리포트' },
  worker: { find: '나에게 맞는 일 리포트', do: '지금 자리에서의 성과 리포트' },
}

// ── 이번 리포트의 초점 — 요약·진단·로드맵이 모두 같은 결정을 향하게 하는 기준 ──
// 추천 1위 직무가 사용자의 현재 목표(유지·회복 등)를 대신해 행동 계획을 정하지 않도록, 초점을 먼저 정하고 행동은 초점에서 고른다
type Focus = 'recover' | 'stay' | 'environment' | 'diagnose' | 'switch' | 'independent' | 'verify' | 'compare' | 'narrow' | 'explore' | 'improve'
const FOCUS_LABEL: Record<Focus, string> = {
  recover: '회복 먼저', stay: '지금 자리에서 다지기', environment: '같은 일, 맞는 환경 찾기', diagnose: '맞지 않는 원인 나눠 보기', switch: '직무 전환 검토', independent: '독립 준비',
  verify: '정한 방향 점검하기', compare: '후보 비교하기', narrow: '관심 분야 좁히기', explore: '직접 해 보며 범위 찾기', improve: '지금 하는 일 더 잘하기',
}
const STUDENT_FOCUS: Record<string, Focus> = {
  '거의 정했다': 'verify', '두세 가지 사이에서 고민 중이다': 'compare', '두세 개 사이에서 고민 중이다': 'compare',
  '관심 분야는 있지만 구체적이지 않다': 'narrow', '관심 분야만 있다': 'narrow', '아직 막막하다': 'explore',
}
function focusFor(s: CareerScores, workerDiag?: WorkerDiag): Focus {
  if (s.stage === 'worker') {
    // 지친 정도가 높으면 진단(환경·직무)과 상관없이 회복을 먼저 — 지친 사람에게 일을 더하는 계획을 주지 않음
    if (workerDiag === 'burnout' || hi(s.modules.do?.dims.exhaustion)) return 'recover'
    if (workerDiag) {
      if (s.modules.find?.choices?.direction === '내 일을 하는 독립·창업') return 'independent'
      return workerDiag === 'misfit' ? 'switch' : workerDiag === 'feltMisfit' ? 'diagnose' : workerDiag
    }
    return 'improve'
  }
  const state = s.modules.find?.choices?.decision
  const f = typeof state === 'string' && STUDENT_FOCUS[state] ? STUDENT_FOCUS[state] : s.modules.find ? 'narrow' : 'improve'
  // 좁힐 관심 분야가 있다고 했어도, 뚜렷한 흥미가 하나도 없으면 후보를 좁히기보다 직접 해 보는 단계로
  if (f === 'narrow' && s.interest && !strongTypes(s).length) return 'explore'
  return f
}
function roadmapSteps(s: CareerScores, focus: Focus, findActions: string[], doTips: string[], candidates: string[], noBasis = false): { when: string; what: string }[] {
  const top = candidates[0]
  const wd = s.modules.do?.dims ?? {}
  const steps: { when: string; what: string }[] = []
  const add = (when: string, what: string | undefined) => { if (what) steps.push({ when, what }) }
  switch (focus) {
    case 'recover':
      add('이번 주부터', '2주 동안 하루 한 줄씩, 지치게 만든 원인이 업무량·사람·의미·근무 시간 중 어디에 가까웠는지 기록해 보세요')
      add('이번 달', '기록에서 가장 큰 원인 하나를 골라, 지금 자리에서 조정할 수 있는지 상사나 믿을 만한 동료와 이야기해 보세요')
      add('3개월 안', '조정한 뒤 지친 정도가 줄었는지 2주 기록과 비교해 보세요. 줄었다면 지금 자리를 다지고, 그대로라면 그때 지금 직장 진단과 직무 목록을 다시 보고 환경 변경이나 전환을 비교하세요')
      break
    case 'stay':
      add('이번 주', findActions[0])
      add('이번 달', '1년 뒤 지금 직무에서 되고 싶은 모습을 정하고, 거기에 필요한 경험을 목록으로 만드세요')
      // 더 맡고 싶은 역할이 있다고 답한 경우에만 새 과제, 아니면(묻지 않은 경우 포함) 지금 업무 개선 — 아래 양식과 같은 일
      add('3개월 안', hi(wd.roleAppetite)
        ? '지금 직무 안에서 해 보고 싶은 과제 하나를 맡아 끝내고, 하기 전과 후의 만족도와 부담을 비교해 보세요'
        : '새 역할을 늘리기보다, 지금 업무 중 시간을 가장 많이 잡아먹는 일 하나를 줄이거나 표준화해 보세요. 바꾸기 전과 후의 처리 시간과 다시 고친 횟수를 적어 두면 효과를 확인할 수 있어요')
      break
    case 'environment':
      add('이번 주', findActions[0])
      add('이번 달', '같은 직무의 다른 회사 공고 다섯 개를 보며, 지금 채워지지 않는 가치가 채워질 환경인지 확인해 보세요')
      add('3개월 안', '지금 자리에서 조정해 본 결과와 다른 회사의 조건을 같은 표에 놓고, 그 가치를 더 채우는 쪽을 정하세요')
      break
    case 'diagnose':
      add('이번 주', findActions[0])
      add('이번 달', '나눈 것 중 가장 큰 원인 하나를 골라, 업무 내용이면 지금 직무 안에서 비중을 조정할 수 있는지, 환경·조건이면 같은 직무의 다른 회사에서는 다른지 확인해 보세요')
      add('3개월 안', '조정이나 비교 결과를 보고, 지금 자리를 다질지·환경을 바꿀지·직무 전환을 알아볼지 셋 중 하나를 정하세요')
      break
    case 'switch':
      add('이번 주', findActions[0])
      add('이번 달', top ? `${top} 관련 공고나 현직자 이야기를 모아, 필요한 역량과 지금 경력을 나란히 적어 보세요` : '맞지 않는 점을 나눠 본 결과로, 옮기고 싶은 일이 갖춰야 할 조건 세 가지를 적어 보세요')
      add('3개월 안', top ? `${w(top, '과/와')} 관련된 작은 프로젝트나 사내 겸직을 하나 해 보고, 해 본 뒤에도 끌리는지 확인하세요` : '그 조건에 맞는 일을 작게 하나 해 보고, 해 본 뒤에도 끌리는지 확인하세요')
      break
    case 'independent':
      add('이번 주', '지금 경력으로 다른 사람에게 돈을 받고 해 줄 수 있는 일을 한 문장으로 적어 보세요')
      add('이번 달', '그 일을 필요로 할 만한 사람 세 명에게 의견을 묻거나, 작은 외주 하나를 시도해 보세요')
      add('3개월 안', '회사를 다니면서 잠재 고객 다섯 명과 이야기하고 작은 제안 하나를 해 보세요. 첫 고객이 생기면 좋지만, 먼저 볼 것은 대화와 제안을 실제로 했는지예요. 그만두기 전에 필요한 생활비와 준비 기간도 계산해 두세요')
      break
    case 'verify':
      add('이번 주', STAGE_ACTIONS.verify.actions[0])
      add('이번 달', STAGE_ACTIONS.verify.actions[1])
      add('3개월 안', '그 차이 중 가장 큰 하나(경험, 자격, 결과물 등)를 채우고, 정한 방향을 유지할지 다시 점검하세요')
      break
    case 'compare':
      add('이번 주', STAGE_ACTIONS.compare.actions[0])
      add('이번 달', STAGE_ACTIONS.compare.actions[1])
      add('3개월 안', '선택지를 모두 작게 해 보고(강의, 과제, 짧은 프로젝트), 해 본 뒤의 끌림과 필요한 준비를 비교해 하나를 정하세요')
      break
    case 'narrow':
      add('이번 주', findActions[0])
      // 후보 수에 맞는 문장 — 하나뿐인데 "두 개를 고르라"고 하지 않음
      add('이번 달', candidates.length >= 3 ? `${listShort(candidates)} 중 관심 분야와 가까운 두 개를 골라, 공고나 현직자 이야기로 실제로 하는 일을 비교해 보세요`
        : candidates.length === 2 ? `${candidates[0]}와 ${candidates[1]}의 공고나 현직자 이야기를 모아, 실제로 하는 일을 비교해 보세요`
        : candidates.length === 1 ? `${candidates[0]}의 공고와 현직자 이야기를 모아, 관심 분야와 실제로 겹치는지 확인해 보세요`
        : '관심 분야 안의 직무 두세 개를 골라, 공고나 현직자 이야기로 실제로 하는 일을 비교해 보세요')
      add('3개월 안', '그중 하나와 관련된 작은 프로젝트나 경험을 해 보고, 해 본 뒤에도 끌리는지 확인하세요')
      break
    case 'explore':
      add('이번 주', s.interest && broadTypes(s).length && !strongTypes(s).length
        ? '끌린다고 답한 여러 분야 중 실제로 해 본 것과 아직 못 해 본 것을 나눠 적어 보세요'
        : '해 보지 않아서 모르는 것과, 해 봤는데 끌리지 않았던 것을 나눠 적어 보세요')
      add('이번 달', '서로 다른 분야의 짧은 과제 두 개(온라인 강의 1주차, 하루 체험, 작은 과제 등)를 해 보고, 해 본 뒤의 끌림과 피로를 기록하세요')
      add('3개월 안', '다시 하고 싶은 쪽이 있으면 하나 더 깊게 해 보고, 둘 다 아니었다면 다른 분야로 범위를 넓혀 보세요')
      break
    case 'improve':
      add('이번 주', doTips[0])
      add('이번 달', '이번 주에 시작한 방법을 2주 해 본 뒤, 아래 기록으로 계속할지 바꿀지 정하세요')
      add('3개월 안', doTips[1] ? `계속하기로 한 방법은 유지하고, 다음 방법 하나를 같은 방식으로 시험해 보세요: ${doTips[1]}` : '계속하기로 한 방법은 유지하고, 다음으로 바꿔 볼 방법 하나를 같은 방식으로 2주 시험해 보세요')
      break
  }
  // 대학생이 고른 경로(대학원·창업·공무원)는 직무 목록과 별개로 비교 과제를 둠
  // 이미 활동이 많거나 균형이 어렵다고 답했으면, 새 활동을 더하기 전에 줄일 것부터
  const path = s.modules.find?.choices?.path
  if (s.stage === 'college' && Array.isArray(path) && focus !== 'explore') {
    const extra: string[] = []
    if (path.includes('대학원·연구')) extra.push('관심 연구실 두 곳의 최근 연구와 졸업생 진로를 보고, 대학원과 취업의 3년 뒤 모습을 비교해 보세요')
    if (path.includes('창업')) extra.push('작은 사업 아이디어 하나를 2주 안에 실제 사람 다섯 명에게 확인해 보세요. 취업 준비와 병행할 수 있는 크기로요')
    if (path.includes('공무원')) extra.push('원하는 직렬의 시험 과목·일정과 실제 업무를 확인해, 다른 선택지와 같은 표에 놓고 비교해 보세요')
    const busy = hi(s.modules.find?.dims.exploration) || hi(s.modules.do?.dims.balance)
    if (extra.length && busy) steps.push({ when: '이번 주', what: '지금 하는 활동을 모두 적고, 이번 학기에 유지할 것과 줄일 것을 하나씩 정하세요. 이미 해 본 활동을 비교해서 답이 나오면 새 과제는 생략해도 돼요' })
    // 고른 경로가 여럿이어도 이번 달에는 하나만 — 숙제를 늘리지 않음
    if (extra.length) steps.push({ when: '이번 달', what: extra.length > 1 ? `${extra[0]}. 고른 다른 길은 이 비교가 끝난 다음 달에 같은 방식으로 해 보세요` : extra[0] })
  }
  const order = ['이번 주', '이번 주부터', '이번 달', '3개월 안']
  return steps.map(x => (noBasis ? { ...x, what: withoutPicks(x.what) } : x)).sort((a, b) => order.indexOf(a.when) - order.indexOf(b.when))
}

// 초점별 양식 — "기록해 보세요/비교해 보세요"를 바로 시작할 수 있게 칸을 줌 (새 추정 없이 응답 순서만 담음)
const FOCUS_FORM: Partial<Record<Focus, { title: string; fields: string[]; note?: string; rows?: number }>> = {
  recover: { title: '2주 회복 기록', fields: ['날짜', '지치게 한 일', '지친 정도 (1~5)'], rows: 3, note: '하루 한 줄이면 충분해요. 2주 뒤에 줄일 일 하나와 도움을 요청할 사람 한 명만 따로 정리해 보세요.' },
  stay: { title: '반복 업무 개선 기록', fields: ['반복 업무 하나', '지금 걸리는 시간', '다시 고친 횟수', '바꾼 방법', '바꾼 뒤 걸리는 시간', '바꾼 뒤 다시 고친 횟수'] },
  improve: { title: '바꿔 본 방법 기록', fields: ['바꿔 본 방법', '시작한 날', '2주 뒤 달라진 점', '계속할지 (예/아니요)'], rows: 2 },
  environment: { title: '지금 자리에서 조정 요청하기', fields: ['바꾸고 싶은 조건 하나', '요청할 문장', '조정 가능한 범위', '확인할 날짜', '결과'] },
  diagnose: { title: '맞지 않는 원인 나눠 보기', fields: ['업무 내용에서 맞지 않는 점', '환경·사람에서 맞지 않는 점', '조건(보상·시간)에서 맞지 않는 점', '가장 큰 것 하나', '확인할 방법'] },
  switch: { title: '옮길 직무 점검표', fields: ['후보 직무', '필요한 역량', '지금 가진 것', '부족한 것', '작게 해 볼 방법'] },
  independent: { title: '독립 준비 기록', fields: ['팔 수 있는 일 한 문장', '이야기해 본 사람 (목표 5명)', '해 본 제안', '받은 반응', '필요한 생활비·준비 기간'] },
  verify: { title: '정한 방향 점검표', fields: ['정한 방향', '이 리포트와 맞는 점', '걸리는 점', '필요한 역량', '지금 내 준비', '가장 큰 차이'] },
  compare: { title: '선택지 비교표', fields: ['선택지', '실제로 하는 일', '필요한 준비', '지금 내 준비', '해 본 뒤 끌림 (1~5)'], rows: 2 },
  narrow: { title: '후보 좁히기 표', fields: ['후보', '실제로 하는 일', '끌리는 점', '걸리는 점', '해 볼 작은 경험'], rows: 2 },
  explore: { title: '체험 기록', fields: ['해 본 활동', '다시 하고 싶은 정도 (1~5)', '피로 (1~5)', '다음 선택', '혼자/함께 중 편했던 쪽 (해당하면)'], rows: 2 },
}

// 원형 1·2위가 근접하면 요약에서도 둘 다 언급 (무료 결과의 근접 표시와 같은 기준)
function archetypeLine(s: CareerScores, archetypeName: string): string {
  const code = (s as CareerScores & { freeResultCode?: string }).freeResultCode
  const ans = code ? decodeHexacoAnswers(code) : null
  if (ans) {
    const r = scoreHexaco(ans)
    const pair = [r.primary.name, r.secondary.name]
    const partner = pair.find(n => n !== archetypeName)
    if (r.secondaryDistance - r.primaryDistance < CLOSE_CALL_GAP && pair.includes(archetypeName) && partner) return `${archetypeName} 원형에 가장 가깝고 ${w(partner, '과/와')}도 거의 같은 거리에 있는 당신은`
  }
  return `${archetypeName} 원형에 가장 가까운 당신은`
}
const RELATED_GROUP: Record<string, string> = { 'data-eng': '데이터', 'ml-eng': '데이터' }

// 발급한 리포트에 함께 저장하는 문장 엔진 버전 — 문구·규칙을 바꾸면 올린다 (이미 발급된 리포트는 저장본 그대로)
export const REPORT_VERSION = 'report-2026-10-25'

export function buildCareerReport(s: CareerScores, archetypeName: string): CareerReport {
  const stage = s.stage
  const goals: Goal[] = s.plan === 'both' ? ['find', 'do'] : [s.plan]
  const chapters: Chapter[] = []
  let findActions: string[] = []
  let doTips: string[] = []
  let candidates: string[] = []
  let findHeadline = ''

  // 초점을 먼저 정하고, 모든 장이 같은 초점을 따르게 함
  const workerKey = stage === 'worker' && goals.includes('find') ? workerDiag(s) : undefined
  const focus = focusFor(s, workerKey)
  const noBasis = stage !== 'high' && goals.includes('find') && jobsNoBasis(s, stage === 'worker' ? s.currentJob?.id : undefined)

  if (goals.includes('find')) {
    chapters.push(interestChapter(s), valuesChapter(s, stage))
    if (stage === 'worker') {
      const wf = workerFindChapters(s, focus)
      chapters.push(...wf.chapters)
      findActions = wf.actions
      findHeadline = wf.headline
      candidates = wf.candidates
    } else {
      const blocks: Block[] = []
      if (noBasis) blocks.push(...noBasisBlocks(s))
      else {
        const picks = stage === 'high' ? majorPicks(s) : jobPicks(s)
        const tie = stage === 'high' ? 1 : Math.min(picks.length, nearTieCount(pickScores(s)))
        candidates = picks.slice(0, Math.max(tie, 1)).map(pk => pk.name)
        if (focus === 'verify') blocks.push({ type: 'note', text: '방향을 거의 정했다고 답했어요. 아래 후보는 새로 고르라는 목록이 아니라, 정한 방향과 비교해 볼 참고 자료예요. 정한 직무나 분야의 이름은 이번 검사에서 받지 않아서, 그 길 자체가 맞는지를 판단한 것은 아니에요.' })
        blocks.push({ type: 'picks', items: picks })
        if (tie >= 2) blocks.push({ type: 'note', text: `1~${tie}위는 점수 차이가 거의 없어요. 순서보다 하나의 후보군으로 보고, 실제 경험으로 비교해 고르세요.` })
      }
      if (stage === 'jobseeker') {
        // 지원하려는 직무군과 추천 후보의 관계를 사실만 보여 줌 — 일부 겹침을 "적합 확인"으로 포장하지 않음
        const tg = s.modules.do?.choices?.targetGroup
        if (Array.isArray(tg) && tg.length && noBasis) {
          // 추천을 보류했으면 순위 비교를 하지 않음 — 고른 직무군은 응답 그대로 두고, 확인 방법으로만 연결
          blocks.push({ type: 'callout', tone: 'plain', title: `지원하려는 직무군: ${(tg as string[]).join(', ')}`, text: `이 직무군을 고른 건 그대로 두었어요. 이번 응답으로는 직무 순위를 매기지 않아서, 이 직무군 안에서 어느 직무가 더 맞는지도 말하지 않아요. 이 직무군의 공고 두세 개에서 실제로 하는 일을 확인하고, 위 체험 예시처럼 작게 해 본 뒤 끌림을 비교해 보세요.` })
        } else if (Array.isArray(tg) && tg.length) {
          const groups = tg as string[]
          const ranked = (s.jobs ?? []).map((m, i) => ({ job: CAREER_JOBS.find(j => j.id === m.id)!, rank: i + 1 }))
          const inGroup = (j: (typeof CAREER_JOBS)[number]) => groups.includes(j.group) || groups.includes(RELATED_GROUP[j.id] ?? '')
          const hit = ranked.filter(r => inGroup(r.job))
          const top5 = hit.filter(r => r.rank <= 5)
          const label = (r: (typeof hit)[number]) => `${r.job.name}(${r.rank}위${groups.includes(r.job.group) ? '' : `, ${r.job.group} 직무군이지만 ${RELATED_GROUP[r.job.id]}와 가까움`})`
          blocks.push({ type: 'callout', tone: 'plain', title: `지원하려는 직무군: ${groups.join('·')}`, text: top5.length
            ? `상위 5개 후보 중 ${top5.length}개가 이 직무군에 들어요: ${top5.map(label).join(', ')}. 직무군이 넓어서, 구체적으로 지원할 직무가 맞는지는 공고의 실제 업무로 따로 확인해야 해요.`
            : `지원하려는 직무군은 상위 5개 후보에 들지 않았어요${hit.length ? ` (가장 가까운 것: ${hit[0].job.name} ${hit[0].rank}위)` : ''}. 흥미 응답으로 계산한 상대 순위라서 지원 방향을 바꾸라는 뜻은 아니에요. 지원하려는 직무와 위 후보를 나란히 놓고, 실제로 하는 일의 공통점과 차이를 확인해 보세요.` })
        }
      }
      const path = s.modules.find?.choices?.path
      if (stage === 'college' && Array.isArray(path) && (path.includes('대학원·연구') || path.includes('창업') || path.includes('공무원'))) {
        blocks.push({ type: 'note', text: `${(path as string[]).filter(x => ['대학원·연구', '창업', '공무원'].includes(x)).join('·')}도 생각하고 있다고 답했어요. 이 목록은 취업 직무 기준이라, 그 길은 아래 로드맵에서 따로 비교하도록 넣었어요.` })
      }
      if (stage !== 'high') blocks.push(...avoidBlock(s), { type: 'note', text: PICKS_SCOPE }, ...(noBasis ? [] : [{ type: 'note' as const, text: AI_BASIS }]))
      chapters.push({
        title: stage === 'high' ? '잘 맞는 계열·학과 TOP 5' : noBasis ? '직무 후보: 지금은 보류' : '우선 살펴볼 직무 후보',
        sub: stage === 'high' ? '흥미를 가장 크게 반영하고, 자신 있는 과목을 더해 골랐어요. 성적이나 입결은 반영하지 않았어요.' : noBasis ? '흥미 응답을 기준으로 직무를 고르는데, 이번에는 고를 근거가 부족했어요.' : '흥미를 가장 크게 반영하고, 가치 조건과 성향상 특히 신경 쓸 점을 더해 골랐어요. 정답이 아니라 비교를 시작할 후보예요.',
        blocks,
      })
      const dc = decisionChapter(s, stage, focus, noBasis)
      chapters.push(dc.chapter)
      findActions = dc.actions
    }
  }
  if (goals.includes('do')) {
    const sub = stage === 'worker' ? '일할 때 나에게 잘 맞는 방식' : stage === 'high' ? '공부할 때 나에게 잘 맞는 방식' : '공부하고 준비할 때 나에게 잘 맞는 방식'
    chapters.push({ ...styleChapter(s, sub), title: stage === 'worker' ? '나의 일하는 방식' : '나의 공부·준비 방식' })
    const dc = doChapters(s, stage, focus)
    chapters.push(...dc.chapters)
    doTips = dc.tips
  }
  chapters.push(relationshipChapter(s, stage), stressChapter(s, stage))

  // 성장 로드맵 — 초점에서 행동을 고름 (고등학생은 기존 학과 탐색 흐름 유지)
  const steps = stage === 'high'
    ? [
        { when: '이번 주', what: findActions[0] ?? doTips[0] },
        ...(candidates[0] ? [{ when: '이번 달', what: `${w(candidates[0], '을/를')} 가르치는 대학 두 곳의 교육과정과 졸업 후 진로를 비교해 보세요` }] : doTips[1] ? [{ when: '이번 달', what: doTips[1] }] : []),
        { when: '3개월 안', what: candidates[0] ? `${w(candidates[0], '과/와')} 관련된 탐구 활동이나 체험 프로그램을 하나 해보세요` : '지금 가장 잘 맞았던 방법을 3개월 동안 유지하고, 전과 후를 비교해 보세요' },
      ].filter(x => x.what)
    : roadmapSteps(s, focus, findActions, doTips, candidates, noBasis)
  const strs = strengths(s.hexaco)
  const roadmap: Block[] = strs.length
    ? [{ type: 'tags', title: '성향에서 보이는 강점 후보', items: strs }, { type: 'note', text: '성향 점수에서 보이는 경향이에요. 실제 경험에서 드러났던 것만 내 강점으로 쓰세요.' }]
    : [{ type: 'note', text: NO_STRENGTH_TEXT }]
  roadmap.push({ type: 'steps', items: steps })
  const studyForm = { title: '한 과목 복습 기록', fields: ['수업·날짜', '다시 정리한 핵심 개념', '아직 모르는 것', '다음 복습에 설명할 수 있었던 것', '걸린 시간·계속할지'], rows: 2 }
  const form = stage === 'high' ? undefined
    : focus === 'stay' && hi(s.modules.do?.dims.roleAppetite) ? { title: '새 과제 기록', fields: ['맡아 본 과제', '하기 전 만족 (1~5)', '한 뒤 만족 (1~5)', '부담 (1~5)', '계속할지'] }
    : focus === 'improve' && stage === 'college' && hi(s.modules.do?.dims.reorganize) ? studyForm
    : FOCUS_FORM[focus]
  if (form) roadmap.push({ type: 'form', ...form })
  // 묶음 상품의 향상 행동은 초점 행동과 섞지 않고 따로 표시 (회복이 초점이면 넣지 않음)
  const sideTip = focus !== 'improve' && focus !== 'recover' && goals.includes('do') ? doTips[0] : undefined
  // 진로를 아직 좁히는 중인 취준생에게는 언제 시작할지를 붙임
  const notYet = stage === 'jobseeker' && (focus === 'explore' || focus === 'narrow' || focus === 'compare')
  if (sideTip) roadmap.push({ type: 'list', title: notYet ? '함께 해 볼 것 (이미 지원 중이라면 지금, 아직 지원할 직무를 정하지 않았다면 후보를 좁힌 뒤)' : '함께 해 볼 것 (지금 하는 일 더 잘하기)', items: [sideTip] })
  chapters.push({
    title: '성장 로드맵',
    sub: stage === 'high' ? undefined : `이번 리포트의 초점: ${FOCUS_LABEL[focus]}. 위의 단계는 이 초점을 향하는 순서예요.`,
    blocks: roadmap,
  })

  // 요약 — 동점·생략·불확실성을 그대로 남기고, "지금 해 볼 것"은 로드맵 첫 행동과 같게
  const parts: string[] = [archetypeLine(s, archetypeName)]
  if (s.interest) {
    const strong = strongTypes(s)
    const broad = broadTypes(s)
    parts.push(strong.length ? `${strong.map(t => RIASEC_NAME[t]).join('·')} 흥미가 상대적으로 높고,`
      : broad.length ? `${broad.length >= 6 ? '여섯 유형 모두' : broad.map(t => RIASEC_NAME[t]).join('·')}에 고르게 끌린다고 답해 흥미만으로는 한쪽을 가려내기 어렵고,`
      : '아직 "끌린다" 수준까지 올라온 활동 유형은 없고,')
  }
  const vf = valueFocus(s)
  if (vf.top.length) parts.push(`일에서 ${w(vf.top.join('·'), '을/를')} 가장 중요하게 여겨요.`)
  else if (vf.tied.length) parts.push(`일에서 ${vf.tied.length}가지 조건을 똑같이 중요하게 여겨요.`)
  else parts.push(flatValueText(s).split('. ')[0] + '.')
  if (stage === 'worker' && findHeadline) parts.push(`지금 직장 진단은 "${findHeadline}" 쪽으로 나왔어요.`)
  if (noBasis) parts.push('지금 응답으로는 특정 직무를 고를 근거가 부족해서, 직접 해 보며 범위를 찾는 쪽을 권해요.')
  else if (stage !== 'worker' && focus === 'explore') parts.push('지금은 직무를 정하기보다 직접 해 보며 범위를 좁히는 단계예요.')
  else if (stage !== 'worker' && focus === 'verify') parts.push('방향은 거의 정했다고 답해서, 이 리포트는 그 방향을 점검하는 데 맞춰 썼어요.')
  else if (stage !== 'worker' && candidates.length) parts.push(`우선 살펴볼 ${stage === 'high' ? '학과' : '후보'}는 ${w(listShort(candidates), '이에요/예요')}.`)
  if (stage !== 'high') parts.push(`이번 리포트의 초점은 "${FOCUS_LABEL[focus]}"${p(FOCUS_LABEL[focus], '이에요/예요')}.`)
  const nowTip = steps[0]?.what
  if (nowTip) parts.push(`지금 해 볼 것 하나: ${nowTip.replace(/[.]$/, '')}.`)

  return {
    label: `CORE CAREER · ${stageLabel(stage)} · ${PLAN_LABEL[s.plan]}`,
    title: s.plan === 'both' ? `${stageLabel(stage)} 종합 진로 리포트` : TITLE[stage][s.plan as Goal],
    summary: parts.join(' '),
    chapters,
  }
}
