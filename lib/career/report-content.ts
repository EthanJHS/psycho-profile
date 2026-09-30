// CORE CAREER 리포트 — 문구 라이브러리 + 조합별 조립기
// 골격: 성향(나는 이런 사람) → 상황(시기·목적 모듈) → 행동(탐색=선택, 향상=실행)
// 원칙: 단정·진단 표현 금지 · 점수 근거를 함께 보여줌 · 불안을 자극하는 문구 금지

import type { HexacoFactor } from '../scoring-hexaco'
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
  flat: '여러 분야에 비슷하게 끌리거나, 아직 강하게 끌리는 분야가 드러나지 않았어요. 이럴 때는 흥미보다 어떤 조건에서 일하고 싶은지(가치)가 더 좋은 선택 기준이 돼요. 직접 해보면서 흥미를 확인하는 과정이 특히 중요해요.',
} as const

// 개인 평균보다 뚜렷하게 높은 흥미만 "강한 흥미"로 부름
function strongTypes(s: CareerScores): Riasec[] {
  const it = s.interest!
  const strong = it.top.filter(t => it.rel[t] >= 0.4).slice(0, 2)
  return strong.length ? strong : it.top.slice(0, 1)
}

// ═══════════════ 가치 ═══════════════
const VALUE_DEF = Object.fromEntries(VALUE_CARDS.map(v => [v.id, v.def])) as Record<WorkValue, string>

// ═══════════════ 진로 결정 진단 ═══════════════
type DecisionKey = 'lackInfo' | 'lackSelf' | 'indecision' | 'conflict' | 'majorSwitch' | 'none'
export const DECISION: Record<DecisionKey, { title: string; body: string; actions: string[] }> = {
  lackInfo: {
    title: '정보가 부족해요',
    body: '고르지 못하는 이유가 나에 대한 확신보다는, 각 길이 실제로 어떤 일을 하는지 모르는 데 있어요. 정보가 채워지면 생각보다 빨리 방향이 잡히는 유형이에요.',
    actions: [
      '추천 목록에서 두 개를 골라 현직자 인터뷰나 소개 글을 세 개 이상 찾아보세요',
      '관련 채용 공고나 학과 소개 다섯 개를 모아 "실제로 하는 일"을 표로 정리해 보세요',
      '그 길을 먼저 간 사람 한 명에게 30분 대화를 요청해 보세요',
    ],
  },
  lackSelf: {
    title: '나에 대한 기준이 흐릿해요',
    body: '정보는 어느 정도 있지만, 그중 무엇이 나에게 맞는지 판단할 기준이 흐릿한 상태예요. 이 리포트의 흥미와 가치 결과가 바로 그 기준이 될 수 있어요.',
    actions: [
      '시간 가는 줄 몰랐던 경험 세 개와 억지로 했던 경험 세 개를 적고 공통점을 찾아보세요',
      '추천 목록을 "끌림"과 "조건" 두 기준으로 각각 순위를 매겨 비교해 보세요',
      '짧은 과제나 프로젝트로 추천 분야 하나를 직접 해보세요',
    ],
  },
  indecision: {
    title: '마지막 결정에서 멈춰요',
    body: '선택지는 좁혀졌는데 하나를 고르는 순간이 어려운 상태예요. 완벽한 선택을 찾기보다 "일단 가보고 조정한다"는 관점이 도움이 돼요.',
    actions: [
      '남은 선택지마다 "1년 뒤 후회할 이유"를 하나씩 적어 보세요',
      '결정 마감일을 정하고, 그날까지 모을 정보의 범위를 미리 정하세요',
      '두 선택지를 모두 작게 시도해 보고 실제로 느낀 점을 비교해 보세요',
    ],
  },
  conflict: {
    title: '원하는 길과 주변의 기대가 달라요',
    body: '무엇을 원하는지는 어느 정도 알지만, 가족이나 주변의 기대와 부딪혀 결정이 어려운 상태예요. 설득보다 먼저 내 선택의 근거를 정리하는 게 도움이 돼요.',
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
  none: {
    title: '결정을 크게 막는 요인은 없어요',
    body: '정보와 자기 이해가 비교적 갖춰진 상태예요. 이제는 선택을 실행으로 옮기는 단계예요.',
    actions: [
      '추천 목록 중 1순위를 정하고, 필요한 역량 세 가지를 목록으로 만드세요',
      '1순위와 관련된 공고나 입시 요강을 열 개 모아 일정을 잡아 보세요',
      '지금까지의 경험을 그 길에 필요한 역량과 연결해 정리하세요',
    ],
  },
}

// ═══════════════ 관계 ═══════════════
export const ATTACHMENT_TEXT = {
  secure: { title: '안정적으로 관계를 맺는 편', body: '가까운 사람에게 기대는 것도, 혼자 지내는 것도 크게 불편하지 않은 편이에요. 이 안정감은 팀 안에서 갈등을 조율하는 힘이 돼요.', tips: ['상대가 불안해할 때 "별일 아니야"로 넘기기보다 한 번 더 확인해 주면 신뢰가 깊어져요', '안정감이 있는 만큼 팀에서 중재자 역할을 맡으면 강점이 드러나요'] },
  anxious: { title: '관계에 마음을 많이 쓰는 편', body: '상대의 작은 변화에도 민감하고, 사람을 세심하게 챙기는 편이에요. 다만 반응이 늦거나 애매하면 불안이 커지기 쉬워요.', tips: ['불안할 때 바로 해석하기보다 "사실"과 "내 추측"을 나눠 적어 보세요', '필요한 것을 돌려 말하기보다 짧고 분명하게 요청해 보세요'] },
  avoidant: { title: '적당한 거리가 편한 편', body: '관계에서 적당한 거리를 편하게 느끼고, 독립적으로 일을 해내는 힘이 있어요. 다만 가까워질수록 한 발 물러서고 싶어질 수 있어요.', tips: ['힘든 일을 혼자 다 해결하기 전에 한 사람에게만이라도 먼저 말해 보세요', '거리를 두고 싶을 때는 이유를 짧게라도 알려주면 오해가 줄어요'] },
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
export const SUPPORT_NOTICE = '지금 지친 신호가 강하게 나타나요. 혼자 버티기 어렵다면 전문가와 이야기해 보는 것도 좋은 방법이에요. 정신건강 상담전화 1577-0199, 자살예방 상담전화 109 (24시간).'

// ═══════════════ 강점 (HEXACO) ═══════════════
const STRENGTH_HIGH: Record<HexacoFactor, string> = {
  H: '신뢰를 주는 정직함', E: '다른 사람의 감정을 읽는 섬세함', X: '사람들 속에서 에너지를 얻는 추진력',
  A: '갈등을 부드럽게 푸는 포용력', C: '끝까지 해내는 꾸준함', O: '새로운 것을 빠르게 흡수하는 호기심',
}
const STRENGTH_LOW: Partial<Record<HexacoFactor, string>> = {
  E: '압박 속에서도 흔들리지 않는 침착함', X: '혼자 깊게 몰입하는 집중력',
  A: '기준을 분명히 지키는 단호함', C: '상황에 맞춰 방법을 바꾸는 유연함', O: '검증된 방식을 지키는 안정감',
}
function strengths(h: Record<HexacoFactor, number>): string[] {
  const fs: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
  const picked = fs.map(f => ({ f, dev: h[f] - 3 }))
    .filter(x => x.dev >= 0.6 || (x.dev <= -0.6 && STRENGTH_LOW[x.f]))
    .sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev)).slice(0, 3)
    .map(x => (x.dev > 0 ? STRENGTH_HIGH[x.f] : STRENGTH_LOW[x.f]!))
  if (picked.length) return picked
  // 두드러진 요인이 없으면 가장 높은 요인 하나를 강점으로
  const top = fs.reduce((a, b) => (h[b] > h[a] ? b : a))
  return [STRENGTH_HIGH[top]]
}

// ═══════════════ 일·공부 방식 (향상 공통) ═══════════════
const STYLE_LABEL: Record<string, string> = {
  planning: '계획', improvising: '즉흥 대응', deepFocus: '깊은 몰입', switching: '전환·병행', collab: '협업', ownership: '단독 책임',
  feedback: '피드백 수용', reassurance: '확인 욕구', resultDrive: '성과 동기', meaningDrive: '의미 동기', strengthUse: '강점 활용 기회', strengthClarity: '강점 인식',
}
const STYLE_HIGH: Record<string, { text: string; tip: string }> = {
  planning: { text: '시작하기 전에 순서와 계획부터 세워요. 큰일도 쪼개서 흔들림 없이 진행하는 힘이 있어요.', tip: '계획이 틀어질 때를 대비해 일정의 20%는 빈 시간으로 남겨 두세요' },
  improvising: { text: '계획에 없던 상황에서도 부딪히며 길을 찾는 순발력이 있어요.', tip: '시작 전에 딱 세 줄짜리 계획만 적어 두면 순발력이 더 빛나요' },
  deepFocus: { text: '한 가지에 깊게 몰입할 때 가장 좋은 결과가 나와요. 끊기지 않는 시간이 곧 성과의 조건이에요.', tip: '하루에 90분, 방해받지 않는 시간을 먼저 달력에 막아 두세요' },
  switching: { text: '여러 가지를 오가며 에너지를 얻어요. 한 가지만 오래 붙잡으면 오히려 집중이 떨어져요.', tip: '비슷한 일끼리 묶어서 처리하면 전환에 드는 힘을 줄일 수 있어요' },
  collab: { text: '함께 머리를 맞댈 때 더 좋은 결과가 나와요. 대화 속에서 생각이 정리되는 편이에요.', tip: '막힐 때 15분 정도 누군가와 이야기하는 시간을 습관으로 만들어 보세요' },
  ownership: { text: '내 몫을 끝까지 혼자 책임지는 방식이 편해요. 맡기면 믿을 수 있는 사람이에요.', tip: '혼자 끝내되, 중간에 한 번은 공유하는 지점을 정해 두세요' },
  feedback: { text: '지적을 서운함보다 성장 재료로 받아들여요.', tip: '피드백을 기다리기보다 먼저 요청하면 성장 속도가 더 빨라져요' },
  reassurance: { text: '잘하고 있는지 중간 확인이 없으면 불안해지는 편이에요.', tip: '확인받을 시점을 미리 약속해 두세요 (예: 초안 단계에서 한 번)' },
  resultDrive: { text: '눈에 보이는 결과와 숫자에서 힘을 얻어요.', tip: '결과가 늦게 나오는 일은 중간 목표를 스스로 만들어 두세요' },
  meaningDrive: { text: '왜 하는지 납득될 때 몰입해요. 이유가 불분명한 일에서는 힘이 빠지기 쉬워요.', tip: '시작하기 전에 "이게 누구에게 왜 필요한지"를 한 줄로 적어 보세요' },
}
function styleChapter(s: CareerScores, sub: string): Chapter {
  const st = s.style ?? {}
  const keys = Object.keys(STYLE_LABEL).filter(k => st[k] != null)
  const highs = Object.keys(STYLE_HIGH).filter(k => hi(st[k])).sort((a, b) => st[b] - st[a]).slice(0, 4)
  const blocks: Block[] = [{ type: 'bars', items: keys.map(k => ({ label: STYLE_LABEL[k], value: st[k], strong: highs.includes(k) })) }, { type: 'note', text: '"계획"은 다시 묻지 않고, 무료 검사에서 측정한 성실성 점수를 그대로 썼어요.' }]
  if (highs.length) highs.forEach(k => blocks.push({ type: 'text', text: STYLE_HIGH[k].text }))
  else blocks.push({ type: 'text', text: '한쪽으로 크게 치우친 방식 없이 상황에 따라 방식을 바꾸는 편이에요. 어떤 방식이 가장 잘 맞았는지 기록해 두면 나만의 방식이 선명해져요.' })
  if (hi(st.planning) && hi(st.improvising)) blocks.push({ type: 'callout', tone: 'gold', text: '계획과 즉흥 대응을 모두 잘 쓰는 드문 조합이에요. 큰 흐름은 계획으로, 세부는 순발력으로 가져가면 강점이 극대화돼요.' })
  if (lo(st.strengthUse)) blocks.push({ type: 'callout', tone: 'plain', text: '지금은 잘하는 것을 발휘할 기회가 적다고 느끼고 있어요. 강점을 쓸 수 있는 역할을 하나라도 만들면 만족도가 크게 달라져요.' })
  if (lo(st.strengthClarity)) blocks.push({ type: 'callout', tone: 'plain', text: '내 강점을 구체적으로 말하기 어려운 편이에요. 아래 성장 로드맵의 강점 목록을 내 경험 한 가지와 이어서 문장으로 만들어 보세요.' })
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
      caution: [...m.conflicts.map(c => `포기할 수 없다고 답한 "${c}"${p(c, '은/는')} 이 직무에서 채우기 어려운 편이에요`), ...m.cautions],
      extra: [{ label: 'AI가 빠르게 바꾸는 일', text: job.ai.automates }, { label: '더 중요해지는 일', text: job.ai.rises, strong: true }],
    }
  })
}
function jobWhy(m: JobMatch, s: CareerScores): string[] {
  const job = CAREER_JOBS.find(x => x.id === m.id)!
  const why: string[] = []
  const shared = job.code.filter(t => strongTypes(s).includes(t))
  if (shared.length) why.push(`${shared.map(t => RIASEC_NAME[t]).join('·')} 흥미와 맞닿아 있어요`)
  const tag = job.tags.find(t => s.interest!.tags.includes(t))
  if (tag) why.push(`특히 "${tag}" 활동에 끌린다고 답한 점과 잘 맞아요`)
  const good = (Object.entries(job.values) as [WorkValue, number][])
    .filter(([v, x]) => x >= 0.4 && s.values.rel[v] > 0).sort((a, b) => s.values.raw[b[0]] - s.values.raw[a[0]]).slice(0, 2).map(([v]) => v)
  if (good.length) why.push(`${w(good.join('·'), '을/를')} 채우기 좋은 환경이에요`)
  return why
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
  return {
    title: '나의 흥미 지도', sub: '무엇에 끌리는지. 잘하는지와는 별개로 활동 자체에 대한 끌림이에요.',
    blocks: [
      { type: 'bars', items: order.map(t => ({ label: RIASEC_NAME[t], value: it.raw[t], strong: strong.includes(t) })) },
      ...strong.map(t => ({ type: 'text' as const, text: RIASEC_TEXT[t] })),
      { type: 'callout', tone: 'plain', text: SHAPE_TEXT[it.shape] },
    ],
  }
}
function valuesChapter(s: CareerScores, stage: LifeStage): Chapter {
  const v = s.values
  const blocks: Block[] = []
  if (v.flat) blocks.push({ type: 'text', text: '가치 점수가 고르게 나왔어요. 특정 조건에 크게 좌우되지 않는 편이라, 환경이 달라져도 적응할 여지가 큰 유형이에요.' })
  else blocks.push({ type: 'text', text: `일에서 상대적으로 가장 중요하게 여기는 건 ${w(v.top.join(', '), '이에요/예요')}.` })
  if (v.dealbreakers.length) blocks.push({ type: 'callout', tone: 'gold', text: `특히 ${v.dealbreakers.join(', ')}에는 "이게 없으면 그 일은 하지 않겠다"고 답했어요. ${stage === 'high' ? '진로를 고를 때' : '일을 고를 때'} 이 조건부터 확인하세요.` })
  const all = (Object.keys(v.raw) as WorkValue[]).sort((a, b) => v.raw[b] - v.raw[a])
  blocks.push({ type: 'bars', items: all.map((x, i) => ({ label: x, value: v.raw[x], strong: i < 3 && !v.flat })) })
  if (v.top.length) blocks.push({ type: 'list', items: v.top.map(x => `${x} — ${VALUE_DEF[x]}`) })
  return { title: '나에게 중요한 조건', sub: '일을 고를 때 무엇이 채워져야 하는지', blocks }
}
function relationshipChapter(s: CareerScores, stage: LifeStage): Chapter {
  const t = ATTACHMENT_TEXT[s.attachment.pattern]
  const workTip = stage === 'worker' ? '직장에서는 이 패턴이 상사·동료와의 거리 조절에서 그대로 나타나요.' : stage === 'high' ? '친구 관계에서 이 패턴을 알아 두면 서운한 일을 덜 크게 겪을 수 있어요.' : '팀 프로젝트나 면접 같은 첫 만남에서도 이 패턴이 은근히 드러나요.'
  return { title: '관계에서의 나', blocks: [
    { type: 'callout', tone: 'plain', title: t.title, text: t.body },
    { type: 'text', text: workTip },
    { type: 'list', items: [...t.tips] },
  ] }
}
function stressChapter(s: CareerScores, stage: LifeStage): Chapter {
  const st = s.stress
  const t = stressText(st.main ?? '', stage)
  const blocks: Block[] = [
    { type: 'callout', tone: 'plain', title: t.title, text: t.body },
    { type: 'callout', tone: 'gold', title: '작은 실천', text: t.tip },
  ]
  if ((st.recovery ?? 3) < 3) blocks.push({ type: 'text', text: '이야기할 사람이나 문제를 쪼개는 습관 같은 회복 자원이 부족한 편이에요. 지칠 때 기댈 곳을 하나 정해 두세요.' })
  if (st.level === 'high') blocks.push({ type: 'callout', tone: 'warn', text: SUPPORT_NOTICE })
  return { title: STRESS_CONTEXT[stage].chapter, sub: '스트레스가 쌓였을 때 나타나는 나의 반응', blocks }
}

// ── 탐색: 결정 진단 ──
function decisionFor(s: CareerScores, stage: LifeStage): { key: DecisionKey; exploreLow: boolean } {
  const d = s.modules.find?.dims ?? {}
  if (stage === 'college' && hi(d.majorSwitch)) return { key: 'majorSwitch', exploreLow: (d.exploration ?? 3) < 2.8 }
  const keys = (['lackInfo', 'lackSelf', 'indecision', 'conflict'] as const).filter(k => (d[k] ?? 0) >= 3.4).sort((a, b) => (d[b] ?? 0) - (d[a] ?? 0))
  let key: DecisionKey = keys.length ? keys[0] : 'none'
  if (stage === 'high' && !keys.length && lo(d.clarity)) key = 'lackSelf'
  return { key, exploreLow: (d.exploration ?? 3) < 2.8 }
}
const DECISION_STATE: Record<string, string> = {
  '거의 정했다': '이미 방향을 거의 정했다고 답했어요. 이 리포트를 그 선택을 점검하는 근거로 써 보세요.',
  '두세 가지 사이에서 고민 중이다': '두세 가지 사이에서 고민 중이라고 답했어요. 아래 추천 목록과 겹치는 선택지가 있는지 먼저 확인해 보세요.',
  '두세 개 사이에서 고민 중이다': '두세 개 사이에서 고민 중이라고 답했어요. 아래 추천 목록과 겹치는 선택지가 있는지 먼저 확인해 보세요.',
  '관심 분야는 있지만 구체적이지 않다': '관심 분야는 있지만 아직 구체적이지 않다고 답했어요. 추천 목록이 그 관심을 구체화하는 출발점이 될 수 있어요.',
  '관심 분야만 있다': '관심 분야만 있다고 답했어요. 추천 목록이 그 관심을 구체화하는 출발점이 될 수 있어요.',
  '아직 막막하다': '아직 막막하다고 답했어요. 괜찮아요. 막막함은 정보와 경험이 쌓이면 줄어들어요. 아래 "다음 행동"부터 하나씩 해보세요.',
}
function decisionChapter(s: CareerScores, stage: LifeStage): { chapter: Chapter; actions: string[] } {
  const { key, exploreLow } = decisionFor(s, stage)
  const d = DECISION[key]
  const blocks: Block[] = [{ type: 'callout', tone: 'gold', title: d.title, text: d.body }]
  const state = s.modules.find?.choices?.decision
  if (typeof state === 'string' && DECISION_STATE[state]) blocks.push({ type: 'text', text: DECISION_STATE[state] })
  if (stage === 'college' && hi(s.modules.find?.dims.majorFit) && key !== 'majorSwitch') blocks.push({ type: 'text', text: '지금 전공이 잘 맞는다고 느끼고 있어요. 전공을 중심에 두고 흥미가 겹치는 직무부터 살펴보면 좋아요.' })
  if (exploreLow) blocks.push({ type: 'text', text: '직접 부딪혀 본 경험이 아직 적은 편이에요. 짧은 프로젝트나 체험처럼 실제로 해보는 경험이 어떤 조사보다 빠르게 방향을 알려줘요.' })
  if (stage === 'high') {
    const crit = s.modules.find?.choices?.majorCriteria
    if (Array.isArray(crit) && crit.length) {
      const own = crit.includes('내가 좋아하는 분야')
      blocks.push({ type: 'text', text: `학과를 고를 때 중요하게 보는 기준으로 "${(crit as string[]).join('", "')}"${p((crit as string[])[crit.length - 1], '을/를')} 골랐어요.${own ? ' 좋아하는 분야를 기준에 넣은 건 오래 공부할 힘이 돼요.' : ' 여기에 "내가 좋아하는 분야"도 한 번 함께 놓고 비교해 보세요. 대학 4년을 버티는 힘은 흥미에서 나와요.'}` })
    }
  }
  blocks.push({ type: 'list', title: '다음 행동', items: d.actions, ordered: true })
  return { chapter: { title: '왜 결정이 어려울까', sub: '지금 진로 결정을 가장 크게 막고 있는 것', blocks }, actions: d.actions }
}

// ── 직장인 탐색: 지금 직장 진단 ──
function workerFindChapters(s: CareerScores): { chapters: Chapter[]; actions: string[]; headline: string } {
  const d = s.modules.find?.dims ?? {}
  const gaps = s.values.gaps ?? []
  // 중요도 4 이상인데 2점 이상 덜 채워지는 가치만 "빈 곳"으로 봄
  const bigGaps = gaps.filter(g => g.gap >= 2 && g.importance >= 4).slice(0, 3)
  const cj = s.currentJob
  const cjName = cj ? CAREER_JOBS.find(x => x.id === cj.id)!.name : null
  const jobFits = cj ? cj.rank <= Math.ceil(cj.total / 4) : null
  // 직무 부적합은 본인이 느끼는 어긋남과 점수상 거리가 함께 있을 때만
  const feelsMisfit = hi(d.misfit)
  const lowRank = cj ? cj.rank > cj.total / 2 : true
  const veryLowRank = cj ? cj.rank > cj.total * 0.75 : false

  type Key = 'burnout' | 'misfit' | 'environment' | 'stay'
  let key: Key = 'stay'
  if (hi(d.cynicism) && s.stress.level !== 'low') key = 'burnout'
  else if ((feelsMisfit && lowRank) || (veryLowRank && (d.misfit ?? 0) >= 3)) key = 'misfit'
  else if (bigGaps.length) key = 'environment'
  const DIAG: Record<Key, { title: string; body: string; actions: string[] }> = {
    burnout: { title: '결정보다 회복이 먼저예요', body: '일에 대한 의미와 관심이 줄고 스트레스 신호도 함께 나타나요. 지친 상태에서 내린 결정은 "무엇이든 지금보다는 낫다"로 기울기 쉬워요. 큰 결정은 조금 회복한 뒤에 내리는 걸 권해요.', actions: ['2주 동안 퇴근 후와 주말에 일 생각을 끊는 시간을 정해 지켜 보세요', '지치게 만드는 원인이 업무량·사람·의미 중 어디에 가장 가까운지 적어 보세요', '회복된 뒤에도 같은 마음이라면, 그때 아래 추천 직무를 구체적으로 살펴보세요'] },
    misfit: { title: '직무 자체가 맞지 않을 가능성이 있어요', body: '지금 직무가 흥미와 가치에 비해 잘 맞지 않는 편이에요. 회사를 바꿔도 같은 직무라면 비슷한 답답함이 반복될 수 있어요. 직무 전환을 진지하게 살펴볼 만해요.', actions: ['아래 추천 직무 중 지금 경력과 가장 가까운 하나를 골라 필요한 역량을 정리해 보세요', '회사 안에서 그 직무로 옮길 수 있는 길(사내 공모, 겸직 프로젝트)이 있는지 확인해 보세요', '옮기기 전에 사이드 프로젝트나 강의로 그 일을 작게 먼저 해보세요'] },
    environment: { title: '직무보다 환경이 문제일 수 있어요', body: `${lowRank ? '직무에도 아쉬운 점이 있지만 그보다 먼저,' : '직무 자체는 크게 어긋나지 않지만,'} 중요하게 여기는 ${w(bigGaps.map(g => g.value).join('·') || '가치', '이/가')} 지금 직장에서 채워지지 않고 있어요. 같은 직무라도 다른 조직에서는 만족도가 크게 달라질 수 있어요.`, actions: ['채워지지 않는 가치를 지금 자리에서 조금이라도 채울 방법이 있는지 먼저 대화해 보세요', '같은 직무의 다른 회사 공고를 보며 그 가치를 채워주는 환경인지 확인해 보세요', '면접을 볼 때 그 가치에 대해 직접 질문할 목록을 만들어 두세요'] },
    stay: { title: '지금 자리가 크게 어긋나 있지는 않아요', body: '지금 직무와 환경이 흥미·가치와 크게 부딪히지 않아요. 옮기기보다 지금 자리에서 역할과 방식을 조정하며 성장하는 쪽이 효율적일 수 있어요.', actions: ['지금 일에서 가장 즐거운 업무의 비중을 늘릴 방법을 한 가지 찾아보세요', '1년 뒤 되고 싶은 모습을 정하고 필요한 경험을 목록으로 만드세요', '추천 직무는 장기적인 선택지로 참고만 해 두세요'] },
  }
  const diag = DIAG[key]
  const now: Block[] = [{ type: 'callout', tone: 'gold', title: diag.title, text: diag.body }]
  if (cj && cjName) {
    const fitText = cj.rank <= 5 ? '흥미와 가치 모두 잘 맞는 편이에요.'
      : jobFits ? '대체로 잘 맞는 편이에요.'
      : !lowRank ? '중간 정도로 맞는 편이에요. 크게 어긋나지는 않지만, 더 잘 맞는 직무도 있어요.'
      : '다른 직무에 비해 흥미나 가치와의 거리가 있는 편이에요.'
    now.push({ type: 'text', text: `지금 직무인 ${w(cjName, '은/는')} ${cj.total}개 직무 중 ${cj.rank}번째로 잘 맞아요. ${fitText}` })
  }
  if (gaps.length) {
    now.push({ type: 'bars', items: gaps.slice(0, 5).map(g => ({ label: g.value, value: Math.max(0, g.gap), strong: g.gap >= 2 })) })
    now.push({ type: 'note', text: '막대는 "중요도 − 지금 채워지는 정도"예요. 길수록 중요한데 채워지지 않는 가치예요.' })
  }
  if (hi(d.turnover) && lo(d.preparing)) now.push({ type: 'callout', tone: 'plain', text: '떠나고 싶은 마음은 큰데 아직 준비한 것은 적은 상태예요. 준비 없이 옮기면 같은 고민이 반복되기 쉬워요. 아래 행동부터 작게 시작해 보세요.' })
  const dir = s.modules.find?.choices?.direction
  const DIR: Record<string, string> = {
    '한 분야의 깊은 전문가': '5년 뒤 한 분야의 깊은 전문가를 원한다고 답했어요. 이직보다 한 분야에서 깊이를 쌓을 수 있는 환경인지가 더 중요한 기준이에요.',
    '사람과 조직을 이끄는 관리자': '5년 뒤 관리자를 원한다고 답했어요. 지금 자리에서 작은 팀이나 프로젝트를 이끄는 경험을 먼저 쌓아 보세요.',
    '내 일을 하는 독립·창업': '5년 뒤 독립·창업을 원한다고 답했어요. 지금 직장에서 배울 수 있는 것(고객, 운영, 영업)을 의도적으로 흡수해 두세요.',
    '지금 일을 안정적으로 지속': '지금 일을 안정적으로 이어가고 싶다고 답했어요. 그렇다면 지금 자리에서 지치지 않는 방식을 찾는 게 가장 큰 과제예요.',
    '전혀 다른 분야로 전환': '전혀 다른 분야로 전환하고 싶다고 답했어요. 아래 추천 직무 중 지금 경력의 강점을 가져갈 수 있는 곳부터 살펴보세요.',
  }
  if (typeof dir === 'string' && DIR[dir]) now.push({ type: 'text', text: DIR[dir] })
  now.push({ type: 'list', title: '다음 행동', items: diag.actions, ordered: true })

  return {
    chapters: [
      { title: '지금 직장 진단', sub: '지금 자리를 바꿔야 할까, 조정하면 될까', blocks: now },
      { title: key === 'stay' ? '장기적으로 잘 맞을 직무' : '옮긴다면 잘 맞을 직무', sub: '흥미를 가장 크게 반영하고, 가치 조건과 성향상 신경 쓸 점을 더해 골랐어요.', blocks: [{ type: 'picks', items: jobPicks(s, cj?.id) }, ...avoidBlock(s), { type: 'note', text: AI_BASIS }] },
    ],
    actions: diag.actions,
    headline: diag.title,
  }
}
const AI_BASIS = 'AI 변화 전망은 2026년 9월 기준으로, 직무 전체가 아니라 업무 단위의 변화를 정리한 것이에요. 기술 변화에 따라 매년 갱신합니다.'
function avoidBlock(s: CareerScores): Block[] {
  return s.avoidEnv.length ? [{ type: 'list', title: '피해야 할 환경', items: s.avoidEnv }] : []
}

// ── 향상: 시기별 실행 챕터 ──
function doChapters(s: CareerScores, stage: LifeStage): { chapters: Chapter[]; tips: string[] } {
  const d = s.modules.do?.dims ?? {}
  const c = s.modules.do?.choices ?? {}
  const st = s.style ?? {}
  const chapters: Chapter[] = []
  const tips: string[] = []

  if (stage === 'high') {
    const method: string[] = []
    if (hi(st.planning)) method.push('주간 계획표를 만들고 매일 체크하는 방식이 잘 맞아요')
    else if (hi(d.deadline)) method.push('마감이 있어야 속도가 붙는 편이라, 시험 2주 전에 "나만의 모의 마감"을 만들어 두세요')
    if (hi(st.deepFocus)) method.push('과목 하나를 50분씩 깊게 파는 블록 공부가 효과적이에요')
    else if (hi(st.switching)) method.push('25~30분 단위로 과목을 바꿔 가며 공부하면 집중이 오래가요')
    if (hi(st.collab)) method.push('친구에게 설명하며 공부하면 이해가 확실해져요 (가르치며 배우기)')
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
    if (lo(d.efficacy)) exam.push({ type: 'text', text: '노력해도 성적이 오를지 확신이 적은 상태예요. 한 과목을 정해 2주 동안 작은 목표를 달성하는 경험부터 만들어 보세요. 작은 성공이 쌓이면 믿음이 따라와요.' })
    if (hi(d.performance)) exam.push({ type: 'text', text: '무료 검사에서 "많은 사람 앞에서 발표하는 것이 부담스럽지 않다"에 낮게 답했어요. 발표나 모둠 활동이 있는 수행평가가 부담스러울 수 있어요. 발표는 첫 문장만 외워 두고, 모둠에서는 자료 정리처럼 강점을 살릴 역할을 먼저 맡아 보세요.' })
    if (exam.length) chapters.push({ title: '시험과 수행평가', blocks: exam })
  }

  if (stage === 'college') {
    const study: string[] = []
    if (hi(d.reorganize)) study.push('수업 내용을 내 방식으로 다시 정리해야 이해되는 편이에요. 수업 당일에 한 페이지 요약을 만드는 습관이 시험 기간을 크게 줄여줘요')
    if (hi(d.deadline)) study.push('마감 직전에 몰아서 하는 편이에요. 마감 3일 전을 "나만의 마감"으로 정하고 초안만이라도 끝내 두세요')
    if (hi(st.deepFocus)) study.push('공강 시간을 흩어 쓰기보다 한 번에 몰아 깊게 공부하는 시간으로 쓰세요')
    if (hi(d.balance)) study.push('학점과 대외활동 사이에서 균형이 어렵다면, 학기마다 "이번 학기 핵심 하나"를 정해 우선순위를 분명히 하세요')
    if (!study.length) study.push('과목마다 공부 방식을 달리 시험해 보고, 가장 효과 좋았던 방식을 정리해 두세요')
    chapters.push({ title: '학업 전략', blocks: [{ type: 'list', items: study }] })
    tips.push(study[0])
    const team: Block[] = []
    if (hi(d.teamLead)) team.push({ type: 'text', text: '팀 프로젝트에서 역할 분담과 일정 관리를 맡는 편이에요. 이 경험은 그대로 리더십과 조율 역량의 근거가 돼요. 무엇을 조율했는지 기록해 두세요.' })
    if (hi(d.teamFriction)) team.push({ type: 'callout', tone: 'plain', text: '팀에서 제 몫을 안 하는 사람이 있으면 크게 스트레스받는 편이에요. 첫 회의에서 역할과 중간 점검 날짜를 문서로 정해 두면 갈등이 크게 줄어요.' })
    if (hi(d.presentation)) team.push({ type: 'text', text: '무료 검사에서 "많은 사람 앞에서 발표하는 것이 부담스럽지 않다"에 낮게 답했어요. 발표가 부담스러운 편이라면, 전체 대본보다 "첫 30초"만 완벽하게 준비하고 실제 공간에서 한 번 리허설해 보세요.' })
    if (team.length) chapters.push({ title: '팀 프로젝트와 발표', blocks: team })
  }

  if (stage === 'jobseeker') {
    const str = strengths(s.hexaco)
    const highs = Object.keys(STYLE_HIGH).filter(k => hi(st[k])).slice(0, 2).map(k => STYLE_LABEL[k])
    const doc: Block[] = [
      { type: 'tags', title: '자기소개서에 쓸 나의 강점', items: [...str, ...highs.map(h => `${h}에 강한 일하는 방식`)] },
      { type: 'text', text: `예시 문장: "저는 ${w(str[0], '을/를')} 바탕으로 [구체적인 경험]에서 [결과]를 만들었습니다." 강점 하나에 경험 하나를 꼭 짝지어 쓰세요.` },
    ]
    if (hi(d.storyGap)) doc.push({ type: 'callout', tone: 'plain', text: '내 경험 중 무엇을 내세워야 할지 모르는 상태예요. 위 강점 목록을 기준으로 지난 경험을 다시 훑어보면, 평범해 보였던 경험도 강점의 근거가 돼요.' })
    if (lo(d.tailoring)) doc.push({ type: 'text', text: '지원하는 곳마다 자기소개서를 맞춰 고치는 편은 아니에요. 공고의 "주요 업무" 세 가지와 내 경험을 연결하는 문장만 바꿔도 서류 통과율이 달라져요.' })
    chapters.push({ title: '서류: 나를 보여주는 법', blocks: doc })
    tips.push(`자기소개서 첫 문단을 "${str[0]}"${p(str[0], '과/와')} 대표 경험 하나로 다시 써 보세요`)

    const iv: Block[] = []
    iv.push({ type: 'text', text: s.hexaco.X >= 3.5 ? '사람 앞에서 에너지를 얻는 편이라 면접에서 활기가 잘 드러나요. 다만 말이 길어지지 않게 답변을 1분 안에 끝내는 연습을 해 보세요.' : '처음 만나는 사람 앞에서는 차분한 인상을 주는 편이에요. 첫 답변(자기소개)만 완벽히 준비해 두면 이후 답변이 훨씬 편해져요.' })
    if (hi(d.interviewNerves)) iv.push({ type: 'list', title: '면접 긴장 줄이기', items: ['예상 질문 10개를 소리 내어 답하며 녹화해 보세요', '답변은 외우지 말고 핵심 키워드 세 개만 기억하세요', '면접장 도착 후에는 준비물을 확인하기보다 천천히 호흡하세요'] })
    if (hi(d.rejectionRecovery)) iv.push({ type: 'callout', tone: 'plain', text: '불합격 뒤 회복이 오래 걸리는 편이에요. 결과가 나오면 "배운 점 하나"만 적고 다음 지원 일정을 바로 잡아 두세요. 다음 행동이 정해져 있으면 곱씹는 시간이 줄어요.' })
    if (lo(d.feedbackSeeking)) iv.push({ type: 'text', text: '혼자 준비하는 편이에요. 서류나 면접을 한 번이라도 다른 사람에게 보여주면 혼자서는 안 보이던 점이 보여요.' })
    if (lo(d.efficacy)) iv.push({ type: 'text', text: '합격할 수 있다는 확신이 적은 상태예요. 목표 한 곳보다, 작은 합격(서류 통과, 인턴) 경험을 먼저 만들면 자신감이 따라와요.' })
    chapters.push({ title: '면접과 결과 다루기', blocks: iv })
  }

  if (stage === 'worker') {
    const perf: Block[] = []
    if (hi(d.engagement) && hi(d.efficacy)) perf.push({ type: 'callout', tone: 'gold', text: '일에 몰입하고 성과도 느끼고 있어요. 지금은 "무엇을 더 잘할까"보다 "무엇을 더 맡을까"를 고민할 때예요.' })
    else if (lo(d.efficacy)) perf.push({ type: 'callout', tone: 'plain', text: '성과를 내고 있다는 느낌이 적은 상태예요. 실제 성과가 없어서라기보다 성과가 보이지 않는 구조일 수 있어요. 한 달 동안 해낸 일을 매주 세 줄씩 기록해 보세요.' })
    if (lo(d.clearCriteria)) perf.push({ type: 'text', text: '내 성과가 어떤 기준으로 평가되는지 분명하지 않아요. 다음 면담에서 "이번 분기에 가장 중요한 결과 한 가지"를 직접 물어보세요. 기준이 보이면 노력의 방향이 정해져요.' })
    const craft: string[] = []
    if (hi(d.autonomy)) craft.push('일하는 방식을 조정할 재량이 있어요. 강점에 맞게 업무 순서와 방식을 바꿔 보세요')
    if (hi(d.roleAppetite)) craft.push('더 맡고 싶은 역할이 있어요. 지금 업무의 10%를 그 역할에 쓰는 작은 제안부터 해 보세요')
    if (hi(st.collab)) craft.push('함께할 때 힘이 나는 편이라, 협업이 많은 업무의 비중을 늘리면 만족도가 올라가요')
    if (hi(st.meaningDrive)) craft.push('일의 의미가 중요한 편이에요. 내 업무가 누구에게 어떤 도움이 되는지 한 번 정리해 보세요')
    if (hi(st.deepFocus)) craft.push('깊게 몰입할 때 성과가 나는 편이라, 회의 없는 시간을 팀에 요청해 보세요')
    if (!craft.length) craft.push('지금 업무 중 가장 즐거운 일과 가장 소모되는 일을 하나씩 적고, 즐거운 일의 비중을 늘릴 방법을 찾아보세요')
    perf.push({ type: 'list', title: '잡 크래프팅: 직무는 그대로, 일하는 방식을 나에게 맞게', items: craft })
    chapters.push({ title: '지금 자리에서의 성과', blocks: perf })
    tips.push(craft[0])

    const rel: Block[] = []
    if (hi(d.bossStrain)) rel.push({ type: 'callout', tone: 'plain', text: '상사와의 관계가 큰 스트레스예요. 관계 전체를 바꾸려 하기보다 "보고 방식"과 "확인 시점" 두 가지만 맞춰 보세요. 부딪힘의 상당 부분이 기대의 차이에서 와요.' })
    if (lo(d.peerSupport)) rel.push({ type: 'text', text: '동료와 도움을 주고받기가 편하지 않은 상태예요. 작은 도움을 먼저 건네는 것부터 시작하면 관계가 달라져요.' })
    if (hi(d.voice)) rel.push({ type: 'text', text: '공식 자리에서 의견을 말하기 어려운 편이에요. 회의 전에 하고 싶은 말 한 문장을 적어 두고, 회의 초반에 먼저 말해 보세요. 늦을수록 말하기가 더 어려워져요.' })
    if (rel.length) chapters.push({ title: '직장 관계', blocks: rel })

    const burn: Block[] = []
    if (hi(d.exhaustion)) {
      burn.push({ type: 'callout', tone: 'plain', title: '지침 신호가 커요', text: '퇴근할 때 에너지가 다 빠지고 출근 생각만으로도 지치는 상태예요. 의지로 버틸 문제가 아니라 회복이 필요한 신호예요.' })
      burn.push({ type: 'list', items: ['퇴근 후 일 연락을 확인하지 않는 시간을 정하세요', '업무량 조정이 필요하다면 구체적인 업무 목록과 함께 이야기해 보세요', '2주 이상 이 상태가 이어지면 전문가와 상담해 보세요'] })
      if (s.stress.level !== 'low') burn.push({ type: 'callout', tone: 'warn', text: SUPPORT_NOTICE })
      chapters.push({ title: '번아웃 신호', blocks: burn })
    }

    const track = c.track
    const TRACK: Record<string, string> = {
      '지금 직무의 깊은 전문가': s.hexaco.O >= 3.5 ? '전문가 트랙을 원하고, 새로운 것을 흡수하는 호기심도 강해요. 한 분야를 깊게 파되 인접 분야를 하나 더 익히면 대체하기 어려운 전문가가 돼요.' : '전문가 트랙을 원해요. 검증된 방식을 깊게 다지는 강점을 살려, 한 분야의 기준이 되는 사람이 되는 방향이 잘 맞아요.',
      '팀을 이끄는 관리자': s.hexaco.X >= 3.5 || s.hexaco.A >= 3.5 ? '관리자 트랙을 원하고, 사람을 이끌고 조율하는 성향도 잘 받쳐줘요. 작은 프로젝트의 리드를 먼저 맡아 경험을 쌓아 보세요.' : '관리자 트랙을 원하지만, 사람 앞에서 에너지를 쓰는 일은 소모가 클 수 있어요. 많은 사람을 이끌기보다 소수 정예 팀을 깊이 있게 이끄는 방식이 잘 맞아요.',
      '아직 모르겠다': '아직 방향을 정하지 못했다면, 1년 동안 작은 리드 경험과 깊이 있는 전문 과제를 하나씩 해보고 어느 쪽이 더 즐거웠는지 비교해 보세요.',
    }
    if (typeof track === 'string' && TRACK[track]) chapters.push({ title: '커리어 트랙', sub: '전문가로 갈까, 관리자로 갈까', blocks: [{ type: 'text', text: TRACK[track] }] })
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

export function buildCareerReport(s: CareerScores, archetypeName: string): CareerReport {
  const stage = s.stage
  const goals: Goal[] = s.plan === 'both' ? ['find', 'do'] : [s.plan]
  const chapters: Chapter[] = []
  let findActions: string[] = []
  let doTips: string[] = []
  let topPick: string | undefined
  let findHeadline = ''

  if (goals.includes('find')) {
    chapters.push(interestChapter(s), valuesChapter(s, stage))
    if (stage === 'worker') {
      const wf = workerFindChapters(s)
      chapters.push(...wf.chapters)
      findActions = wf.actions
      findHeadline = wf.headline
      topPick = jobPicks(s, s.currentJob?.id)[0]?.name
    } else {
      const picks = stage === 'high' ? majorPicks(s) : jobPicks(s)
      topPick = picks[0]?.name
      chapters.push({
        title: stage === 'high' ? '잘 맞는 계열·학과 TOP 5' : '잘 맞는 직무 TOP 5',
        sub: stage === 'high' ? '흥미를 가장 크게 반영하고, 자신 있는 과목을 더해 골랐어요. 성적이나 입결은 반영하지 않았어요.' : '흥미를 가장 크게 반영하고, 가치 조건과 성향상 특히 신경 쓸 점을 더해 골랐어요.',
        blocks: [{ type: 'picks', items: picks }, ...(stage === 'high' ? [] : avoidBlock(s)), ...(stage === 'high' ? [] : [{ type: 'note' as const, text: AI_BASIS }])],
      })
      const dc = decisionChapter(s, stage)
      chapters.push(dc.chapter)
      findActions = dc.actions
    }
  }
  if (goals.includes('do')) {
    const sub = stage === 'worker' ? '일할 때 나에게 잘 맞는 방식' : stage === 'high' ? '공부할 때 나에게 잘 맞는 방식' : '공부하고 준비할 때 나에게 잘 맞는 방식'
    chapters.push({ ...styleChapter(s, sub), title: stage === 'worker' ? '나의 일하는 방식' : '나의 공부·준비 방식' })
    const dc = doChapters(s, stage)
    chapters.push(...dc.chapters)
    doTips = dc.tips
  }
  chapters.push(relationshipChapter(s, stage), stressChapter(s, stage))

  // 성장 로드맵
  const strs = strengths(s.hexaco)
  const steps: { when: string; what: string }[] = []
  if (goals.includes('find')) steps.push({ when: '이번 주', what: findActions[0] })
  if (goals.includes('do') && doTips[0]) steps.push({ when: goals.includes('find') ? '이번 주' : '이번 주', what: doTips[0] })
  if (topPick) steps.push({ when: '이번 달', what: stage === 'high' ? `${w(topPick, '을/를')} 가르치는 대학 두 곳의 교육과정과 졸업 후 진로를 비교해 보세요` : `${topPick} 관련 공고나 현직자 이야기를 모아 필요한 역량과 내 경험을 나란히 적어 보세요` })
  else if (doTips[1]) steps.push({ when: '이번 달', what: doTips[1] })
  steps.push({ when: '3개월 안', what: topPick ? (stage === 'high' ? `${w(topPick, '과/와')} 관련된 탐구 활동이나 체험 프로그램을 하나 해보세요` : `${w(topPick, '과/와')} 관련된 작은 프로젝트나 경험을 하나 해보세요`) : '지금 가장 잘 맞았던 방법을 3개월 동안 유지하고, 전과 후를 비교해 보세요' })
  chapters.push({ title: '성장 로드맵', blocks: [{ type: 'tags', title: '나의 강점', items: strs }, { type: 'steps', items: steps }] })

  // 요약
  const parts: string[] = [`${archetypeName} 원형인 당신은`]
  if (s.interest) parts.push(`${strongTypes(s).map(t => RIASEC_NAME[t]).join('·')} 흥미가 강하고,`)
  if (s.values.top.length) parts.push(`일에서 ${w(s.values.top[0], '을/를')} 가장 중요하게 여겨요.`)
  else parts.push('특정 조건에 크게 좌우되지 않는 편이에요.')
  if (stage === 'worker' && findHeadline) parts.push(`지금 직장 진단 결과는 "${findHeadline}" 쪽으로 나왔어요.`)
  else if (topPick) parts.push(`가장 잘 맞는 ${stage === 'high' ? '학과는' : '직무는'} ${w(topPick, '이에요/예요')}.`)
  if (goals.includes('do') && doTips[0]) {
    const lastSentence = doTips[0].split('. ').pop()!
    parts.push(`나에게 가장 잘 맞는 방법 하나: ${lastSentence}.`)
  }

  return {
    label: `CORE CAREER · ${stageLabel(stage)} · ${PLAN_LABEL[s.plan]}`,
    title: s.plan === 'both' ? `${stageLabel(stage)} 종합 진로 리포트` : TITLE[stage][s.plan as Goal],
    summary: parts.join(' '),
    chapters,
  }
}
