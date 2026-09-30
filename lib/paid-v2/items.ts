// 유료 리포트 v2 — 추가 문항 은행
// 구조: 시기 4개 × 목적 2개(탐색·향상) + 묶음
//   ① 공통 핵심 — 모든 조합 (가치·관계·스트레스). 성향이라 채점은 같고 문구만 시기별 장면
//   ② 목적 모듈 — 탐색: 흥미 18 / 향상: 일·공부 방식 12
//   ③ 시기 배경 — 시기별 선택형 1~2개
//   ④ 시기×목적 모듈 — 그 시기·그 목적에서만 의미 있는 상황 문항
// 설계 원칙: 한 문항 한 개념 · 직업명 대신 활동 · 선택지 간 상충 전제 금지 · 누구나 "예"할 만큼 넓은 문항 금지
// 모든 문항 문구는 자체 작성 (기존 척도 문항을 그대로 옮기지 않음)

import type { InterestTag, Riasec, WorkValue } from '../jobs-v2'

export type LifeStage = 'high' | 'college' | 'jobseeker' | 'worker'
export type Goal = 'find' | 'do'
export type Plan = Goal | 'both'

export const LIFE_STAGES: { id: LifeStage; label: string }[] = [
  { id: 'high',      label: '고등학생' },
  { id: 'college',   label: '대학생' },
  { id: 'jobseeker', label: '취준생' },
  { id: 'worker',    label: '직장인' },
]
export const GOALS: Record<Goal, { label: string; desc: Record<LifeStage, string> }> = {
  find: { label: '탐색', desc: {
    high: '나에게 맞는 계열·학과를 찾고 싶어요',
    college: '전공 이후 어떤 진로가 맞을지 알고 싶어요',
    jobseeker: '어떤 직무로 지원해야 할지 정하고 싶어요',
    worker: '지금 일이 맞는지, 나에게 맞는 일이 뭔지 알고 싶어요' } },
  do: { label: '향상', desc: {
    high: '나에게 맞는 공부법과 입시 전략을 알고 싶어요',
    college: '학업과 팀 프로젝트를 더 잘 해내고 싶어요',
    jobseeker: '서류와 면접에서 나를 더 잘 보여주고 싶어요',
    worker: '지금 자리에서 더 좋은 성과를 내고 싶어요' } },
}

type StageText = Record<LifeStage, string>
const same = (t: string): StageText => ({ high: t, college: t, jobseeker: t, worker: t })
const teenOr = (high: string, other: string): StageText => ({ high, college: other, jobseeker: other, worker: other })

// 한국어 조사 자동 선택 (받침 유무)
function josa(word: string, pair: '을/를' | '이/가' | '은/는' | '과/와'): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0
  const [withFinal, without] = pair.split('/')
  return word + (hasFinal ? withFinal : without)
}
// 시기별로 "무엇을 하는가"를 가리키는 말
const TASK: StageText = { high: '공부', college: '공부나 과제', jobseeker: '취업 준비', worker: '일' }
const byTask = (f: (task: string) => string): StageText =>
  ({ high: f(TASK.high), college: f(TASK.college), jobseeker: f(TASK.jobseeker), worker: f(TASK.worker) })

export const AGREE_SCALE = ['전혀 아니다', '아니다', '보통이다', '그렇다', '매우 그렇다']

export interface ScaleItem { id: string; dim: string; text: StageText; reverse?: boolean }
export interface PlainItem { id: string; dim: string; text: string; reverse?: boolean }
export interface ChoiceItem { id: string; text: string; options: string[]; maxSelect?: number; optional?: boolean }

// ═══════════════ ① 공통 핵심 ═══════════════

// 가치 카드 10개 — 한 화면, 카드마다 중요도 1~5
export const VALUE_PROMPT: StageText = {
  high:      '나중에 일을 하게 된다면, 이것이 얼마나 중요할 것 같나요?',
  college:   '앞으로 일을 하게 된다면, 이것이 얼마나 중요할 것 같나요?',
  jobseeker: '첫 직장이나 직무를 고를 때, 이것이 얼마나 중요한가요?',
  worker:    '일에서 이것이 얼마나 중요한가요?',
}
export const VALUE_CARDS: { id: WorkValue; def: string }[] = [
  { id: '성장', def: '일하면서 실력이 계속 는다' },
  { id: '도전', def: '어려운 목표에 부딪혀 해낸다' },
  { id: '안정', def: '고용과 생활이 오래 흔들리지 않는다' },
  { id: '보상', def: '한 만큼 돈으로 충분히 돌려받는다' },
  { id: '자율', def: '일하는 방식과 시간을 스스로 정한다' },
  { id: '동료', def: '마음 맞는 사람들과 함께 일한다' },
  { id: '인정', def: '내 일을 주변에서 알아주고 존중한다' },
  { id: '주도', def: '방향과 결정을 내가 이끈다' },
  { id: '기여', def: '누군가에게, 사회에 도움이 된다' },
  { id: '균형', def: '일 밖의 삶을 지킬 수 있다' },
]
export const VALUE_SCALE = ['없어도 상관없다', '있으면 좋다', '중요하다', '매우 중요하다', '이게 없으면 그 일은 하지 않겠다']

// 관계 — 애착 8문항 (불안 4 · 회피 4)
export const ATTACHMENT_PROMPT: StageText = teenOr(
  '친한 친구나 가족과의 관계를 떠올려 주세요.',
  '가까운 사람(연인, 친한 친구, 가족)과의 관계를 떠올려 주세요.',
)
export const ATTACHMENT_ITEMS: ScaleItem[] = [
  { id: 'AT1', dim: 'anxiety',   text: teenOr('친구의 답장이 늦으면 내가 뭔가 잘못했나 생각하게 된다', '상대의 답장이 늦으면 내가 뭔가 잘못했나 생각하게 된다') },
  { id: 'AT2', dim: 'anxiety',   text: teenOr('친한 친구가 나보다 다른 친구를 더 좋아하게 될까 봐 걱정될 때가 있다', '가까운 사람이 언젠가 나를 떠날까 봐 걱정될 때가 있다') },
  { id: 'AT3', dim: 'anxiety',   text: teenOr('내가 친구를 생각하는 만큼 친구는 나를 생각하지 않는 것 같다고 느낀다', '내가 마음을 쓰는 만큼 상대는 나를 아끼지 않는 것 같다고 느낀다') },
  { id: 'AT4', dim: 'anxiety',   text: teenOr('친구와 서운한 일이 생겨도 비교적 금방 마음이 안정된다', '관계에 작은 문제가 생겨도 비교적 금방 마음이 안정된다'), reverse: true },
  { id: 'AT5', dim: 'avoidance', text: teenOr('친구나 가족에게도 약한 모습을 보이는 게 불편하다', '가까운 사람에게도 약한 모습을 보이는 게 불편하다') },
  { id: 'AT6', dim: 'avoidance', text: teenOr('친구가 나에게 많이 기대면 부담스럽다', '누군가 나에게 많이 기대면 부담스럽다') },
  { id: 'AT7', dim: 'avoidance', text: teenOr('누군가와 너무 가까워지면 거리를 두고 싶어진다', '관계가 깊어질수록 한 발 물러서고 싶어진다') },
  { id: 'AT8', dim: 'avoidance', text: teenOr('친구나 가족과 서로의 깊은 이야기를 나누는 시간이 편하다', '가까운 사람과 서로의 깊은 이야기를 나누는 시간이 편하다'), reverse: true },
]

// 스트레스 반응 10문항 (5유형 × 2) — overwork·withdraw·outburst·rumination = 소진 신호 / recovery = 회복 자원
export const STRESS_PROMPT: StageText = {
  high:      '시험·수행평가·입시로 스트레스가 쌓였을 때의 나를 떠올려 주세요.',
  college:   '시험·과제·팀 프로젝트로 스트레스가 쌓였을 때의 나를 떠올려 주세요.',
  jobseeker: '취업 준비로 스트레스가 쌓였을 때의 나를 떠올려 주세요.',
  worker:    '일로 스트레스가 쌓였을 때의 나를 떠올려 주세요.',
}
export const STRESS_ITEMS: ScaleItem[] = [
  { id: 'ST1', dim: 'overwork', text: {
    high: '시험이 다가올수록 쉬지 못하고 공부를 붙잡고 있게 된다',
    college: '과제가 몰릴수록 쉬지 못하고 붙잡고 있게 된다',
    jobseeker: '결과가 잘 안 나올수록 쉬지 못하고 준비에 더 매달린다',
    worker: '일이 몰릴수록 일을 더 붙잡고 놓지 못한다' } },
  { id: 'ST2', dim: 'overwork', text: {
    high: '쉬는 시간에도 해야 할 공부가 머릿속에서 떠나지 않는다',
    college: '쉬는 날에도 해야 할 과제가 머릿속에서 떠나지 않는다',
    jobseeker: '쉬는 날에도 취업 준비 생각이 머릿속에서 떠나지 않는다',
    worker: '퇴근 후에도 해야 할 일이 머릿속에서 떠나지 않는다' } },
  { id: 'ST3', dim: 'withdraw', text: {
    high: '부담되는 과목일수록 손대기가 싫어진다',
    college: '부담되는 과제일수록 손대기가 싫어진다',
    jobseeker: '부담되는 지원서일수록 손대기가 싫어진다',
    worker: '스트레스를 주는 일일수록 손대기가 싫어진다' } },
  { id: 'ST4', dim: 'withdraw', text: teenOr('힘들 때는 친구 연락도 줄이고 혼자 있고 싶어진다', '힘들 때는 주변 연락을 줄이고 혼자 숨고 싶어진다') },
  { id: 'ST5', dim: 'outburst', text: {
    high: '시험 기간에는 가족에게 날카롭게 반응하게 된다',
    college: '과제에 쫓기면 가까운 사람에게 날카롭게 반응한다',
    jobseeker: '준비가 잘 안 풀리면 가까운 사람에게 날카롭게 반응한다',
    worker: '일로 스트레스가 쌓이면 가까운 사람에게 날카롭게 반응한다' } },
  { id: 'ST6', dim: 'outburst', text: same('감정이 상하면 표정이나 말투에 바로 드러난다') },
  { id: 'ST7', dim: 'rumination', text: {
    high: '시험에서 틀린 문제를 머릿속에서 계속 되풀이한다',
    college: '발표나 시험에서 아쉬웠던 순간을 계속 되풀이해 떠올린다',
    jobseeker: '면접이나 지원에서 아쉬웠던 순간을 계속 되풀이해 떠올린다',
    worker: '일에서 한 실수를 머릿속에서 계속 되풀이한다' } },
  { id: 'ST8', dim: 'rumination', text: same('잠들기 전 그날의 불편했던 일을 곱씹는다') },
  { id: 'ST9', dim: 'recovery', text: teenOr('힘들 때 기댈 수 있는 친구나 가족이 곁에 있다', '힘들 때 기댈 수 있는 사람이 곁에 있다') },
  { id: 'ST10', dim: 'recovery', text: byTask(t => `${t === '일' ? '일이' : t + '가'} 막히면 지금 할 수 있는 것부터 정리해 하나씩 한다`) },
]

// ═══════════════ ② 목적 모듈 ═══════════════

// 탐색 — 흥미 18문항 (RIASEC × 3). 활동 자체라 시기별 문구 차이 없음
export interface InterestItem { id: string; type: Riasec; tag: InterestTag; text: string }
export const INTEREST_PROMPT = '잘할 수 있는지와 상관없이, 이 활동에 얼마나 끌리나요?'
export const INTEREST_SCALE = ['전혀 끌리지 않는다', '별로 끌리지 않는다', '보통이다', '끌린다', '매우 끌린다']
export const INTEREST_ITEMS: InterestItem[] = [
  { id: 'IR1', type: 'R', tag: '기계',            text: '고장 난 물건을 직접 뜯어보고 고치기' },
  { id: 'IR2', type: 'R', tag: '제작',            text: '재료를 다듬어 무언가를 직접 만들기' },
  { id: 'IR3', type: 'R', tag: '야외·신체',        text: '야외에서 몸을 쓰며 일하기' },
  { id: 'II1', type: 'I', tag: '자연과학·데이터',   text: '실험이나 데이터로 어떤 현상의 원인 알아내기' },
  { id: 'II2', type: 'I', tag: '수리·IT',          text: '복잡한 문제를 논리나 코드로 풀기' },
  { id: 'II3', type: 'I', tag: '사회과학·철학',     text: '사람과 사회가 왜 그렇게 움직이는지 원리를 파고들기' },
  { id: 'IA1', type: 'A', tag: '표현·글',          text: '떠오른 생각이나 감정을 나만의 방식으로 글이나 말로 풀어내기' },
  { id: 'IA2', type: 'A', tag: '심미·디자인',       text: '공간·화면·물건의 분위기와 스타일 만들어내기' },
  { id: 'IA3', type: 'A', tag: '발상·기획',         text: '아무것도 없는 상태에서 행사·캠페인·콘텐츠 기획안 짜기' },
  { id: 'IS1', type: 'S', tag: '교육',             text: '누군가를 가르치고 그 사람이 성장하는 걸 지켜보기' },
  { id: 'IS2', type: 'S', tag: '상담',             text: '고민 있는 사람의 이야기를 듣고 함께 답을 찾기' },
  { id: 'IS3', type: 'S', tag: '돌봄',             text: '아프거나 도움이 필요한 사람을 직접 돌보기' },
  { id: 'IE1', type: 'E', tag: '협상·성사',         text: '협상이나 제안으로 일을 실제로 성사시키기' },
  { id: 'IE2', type: 'E', tag: '리더십',           text: '팀의 목표를 정하고 사람들을 이끌기' },
  { id: 'IE3', type: 'E', tag: '사업',             text: '새로운 사업이나 수익 모델 기획하기' },
  { id: 'IC1', type: 'C', tag: '자료 관리',         text: '흩어진 정보를 분류해 표나 데이터베이스로 만들기' },
  { id: 'IC2', type: 'C', tag: '사무·행정',         text: '정해진 절차에 따라 정확하게 처리하기' },
  { id: 'IC3', type: 'C', tag: '재무',             text: '예산과 돈의 흐름 관리하기' },
]

// 향상 — 일·공부 방식 12문항 (6측면 × 2). 한쪽의 반대편이 아니라 각각 독립된 측면으로 채점
export const STYLE_PROMPT: StageText = byTask(t => `평소 ${josa(t, '을/를')} 할 때의 나를 떠올려 주세요.`)
export const STYLE_ITEMS: ScaleItem[] = [
  { id: 'WS2',  dim: 'improvising', text: same('계획 없이 부딪히면서 방법을 찾을 때 더 잘 풀린다') },
  { id: 'WS3',  dim: 'deepFocus',   text: same('한 가지에 오래 깊게 몰입할 때 결과가 가장 좋다') },
  { id: 'WS4',  dim: 'switching',   text: same('여러 가지를 번갈아 할 때 오히려 에너지가 난다') },
  { id: 'WS5',  dim: 'collab',      text: same('혼자보다 함께 머리를 맞댈 때 더 좋은 결과가 나온다') },
  { id: 'WS6',  dim: 'ownership',   text: same('여럿이 나누기보다 내 몫을 혼자 맡아 처리하는 방식이 편하다') },
  { id: 'WS7',  dim: 'feedback',    text: same('지적을 받으면 서운함보다 고칠 점이 먼저 눈에 들어온다') },
  { id: 'WS8',  dim: 'reassurance', text: same('잘하고 있는지 중간중간 확인받지 못하면 불안해진다') },
  { id: 'WS9',  dim: 'resultDrive', text: same('눈에 보이는 결과나 숫자가 있을 때 더 힘이 난다') },
  { id: 'WS10', dim: 'meaningDrive', text: byTask(t => `${josa(t, '이/가')} 왜 중요한지 납득될 때 더 힘이 난다`) },
  { id: 'WS11', dim: 'strengthUse', text: byTask(t => `${t}에서 내가 잘하는 것을 발휘할 기회가 자주 있다`) },
  { id: 'WS12', dim: 'strengthClarity', text: same('내 강점이 무엇인지 구체적으로 말할 수 있다') },
]

// ═══════════════ ③ 시기 배경 (선택형, 해석 맥락) ═══════════════
export const STAGE_BACKGROUND: Record<LifeStage, ChoiceItem[]> = {
  high: [
    { id: 'grade', text: '학년', options: ['1학년', '2학년', '3학년', 'N수·기타'] },
  ],
  college: [
    { id: 'major', text: '전공 계열', options: ['인문', '사회', '상경', '자연', '공학', '예체능', '교육', '의약', '자유전공·미정'] },
    { id: 'year', text: '학년', options: ['1학년', '2학년', '3학년', '4학년 이상'] },
  ],
  jobseeker: [
    { id: 'major', text: '전공 계열', options: ['인문', '사회', '상경', '자연', '공학', '예체능', '교육', '의약', '기타'] },
    { id: 'prepPeriod', text: '취업 준비 기간', options: ['아직 시작 전', '6개월 미만', '6개월~1년', '1년 이상'] },
  ],
  worker: [
    { id: 'currentJob', text: '지금 하고 있는 직무', options: [] }, // 직무 분류 확정 후 채움
    { id: 'years', text: '경력', options: ['1년 미만', '1~3년', '3~5년', '5~10년', '10년 이상'] },
  ],
}

// ═══════════════ ④ 시기 × 목적 모듈 ═══════════════
export interface StageGoalModule {
  title: string
  prompt: string
  items: PlainItem[]              // AGREE_SCALE 1~5
  choices: ChoiceItem[]
  fulfillment?: { prompt: string; scale: string[] }   // 가치 카드 충족도 (직장인 탐색)
}

export const STAGE_GOAL_MODULES: Record<LifeStage, Record<Goal, StageGoalModule>> = {
  high: {
    find: {
      title: '계열·학과 탐색',
      prompt: '가고 싶은 계열이나 학과를 떠올려 주세요.',
      items: [
        { id: 'HF1', dim: 'clarity',     text: '성적과 상관없이 가보고 싶은 분야가 있다' },
        { id: 'HF2', dim: 'exploration', text: '관심 있는 학과가 실제로 무엇을 배우는지 알아본 적이 있다' },
        { id: 'HF3', dim: 'conflict',    text: '진로를 정할 때 주변의 기대가 크게 작용한다' },
      ],
      choices: [
        { id: 'strongSubjects', text: '상대적으로 자신 있는 과목 영역', maxSelect: 3, options: ['국어·문학', '영어·외국어', '수학', '과학', '사회·역사', '예술·체육', '정보·기술'] },
        { id: 'decision', text: '가고 싶은 계열이나 학과에 대해 지금 나는', options: ['거의 정했다', '두세 가지 사이에서 고민 중이다', '관심 분야는 있지만 구체적이지 않다', '아직 막막하다'] },
        { id: 'majorCriteria', text: '학과를 고를 때 가장 중요하게 생각하는 것', maxSelect: 2, options: ['내가 좋아하는 분야', '졸업 후 취업', '내 성적으로 갈 수 있는지', '부모님·선생님의 추천', '학교 이름'] },
      ],
    },
    do: {
      title: '공부와 입시',
      prompt: '평소 공부하고 시험 보는 나를 떠올려 주세요.',
      items: [
        { id: 'HD1', dim: 'deadline',    text: '시험이 임박해야 집중력이 확 올라간다' },
        { id: 'HD2', dim: 'distraction', text: '공부할 때 휴대폰이나 다른 것에 쉽게 주의가 흐트러진다' },
        { id: 'HD3', dim: 'testAnxiety', text: '시험 전날에는 불안해서 공부가 손에 잘 잡히지 않는다' },
        { id: 'HD4', dim: 'testAnxiety', text: '시험 중에 아는 문제도 긴장해서 실수할 때가 많다' },
        { id: 'HD5', dim: 'intrinsic',   text: '성적과 상관없이 더 알고 싶어서 공부하는 과목이 있다' },
        { id: 'HD6', dim: 'external',    text: '공부하는 가장 큰 이유는 주변의 기대 때문이다' },
        { id: 'HD7', dim: 'efficacy',    text: '노력하면 원하는 성적을 낼 수 있다고 믿는다' },
      ],
      choices: [
        { id: 'weakSubjects', text: '가장 신경 쓰이는 과목 영역', maxSelect: 2, options: ['국어·문학', '영어·외국어', '수학', '과학', '사회·역사', '예술·체육', '정보·기술'] },
        { id: 'track', text: '준비하는 입시 전형', options: ['학생부 위주', '수능 위주', '둘 다', '아직 모르겠다'] },
      ],
    },
  },

  college: {
    find: {
      title: '전공 이후의 진로',
      prompt: '지금 전공과 앞으로의 진로를 떠올려 주세요.',
      items: [
        { id: 'CF1', dim: 'majorFit',    text: '지금 전공이 나와 잘 맞는다고 느낀다' },
        { id: 'CF2', dim: 'majorSwitch', text: '전공과 다른 분야로 진로를 고민하고 있다' },
        { id: 'CF3', dim: 'lackInfo',    text: '졸업 후 어떤 일을 할 수 있는지 잘 모른다' },
        { id: 'CF4', dim: 'lackSelf',    text: '내가 무엇을 잘하고 좋아하는지 확신이 없다' },
        { id: 'CF5', dim: 'indecision',  text: '선택지가 좁혀져도 하나로 결정하기가 어렵다' },
        { id: 'CF6', dim: 'exploration', text: '관심 분야를 수업 밖에서 직접 경험해 본 적이 있다' },
      ],
      choices: [
        { id: 'decision', text: '졸업 후 진로에 대해 지금 나는', options: ['거의 정했다', '두세 가지 사이에서 고민 중이다', '관심 분야만 있다', '아직 막막하다'] },
        { id: 'path', text: '생각하고 있는 길', maxSelect: 2, options: ['취업', '대학원·연구', '전문직 시험', '공무원', '창업', '아직 모르겠다'] },
      ],
    },
    do: {
      title: '학업과 팀 프로젝트',
      prompt: '수업·과제·팀 프로젝트를 할 때의 나를 떠올려 주세요.',
      items: [
        { id: 'CD1', dim: 'reorganize',   text: '수업 내용을 내 방식으로 다시 정리해야 이해가 된다' },
        { id: 'CD2', dim: 'deadline',     text: '과제를 마감 직전에 몰아서 하는 편이다' },
        { id: 'CD3', dim: 'teamLead',     text: '팀 프로젝트에서 역할 분담과 일정 관리를 내가 맡는 편이다' },
        { id: 'CD4', dim: 'teamFriction', text: '팀에서 제 몫을 안 하는 사람이 있으면 크게 스트레스받는다' },
        { id: 'CD6', dim: 'balance',      text: '학점과 대외활동 사이에서 균형 잡기가 어렵다' },
      ],
      choices: [],
    },
  },

  jobseeker: {
    find: {
      title: '지원 직무 탐색',
      prompt: '지금 진로와 지원할 직무를 떠올려 주세요.',
      items: [
        { id: 'JF1', dim: 'lackInfo',    text: '관심 있는 직무가 실제로 어떤 일을 하는지 잘 모른다' },
        { id: 'JF2', dim: 'lackSelf',    text: '내가 무엇을 잘하고 좋아하는지 확신이 없다' },
        { id: 'JF3', dim: 'indecision',  text: '선택지가 좁혀져도 하나로 결정하기가 어렵다' },
        { id: 'JF4', dim: 'conflict',    text: '내가 원하는 길과 가족·주변이 기대하는 길이 다르다' },
        { id: 'JF5', dim: 'exploration', text: '관심 직무에 대해 현직자 이야기나 자료를 직접 찾아본 적이 많다' },
        { id: 'JF6', dim: 'exploration', text: '인턴·대외활동·프로젝트로 관심 분야를 직접 경험해 봤다' },
      ],
      choices: [
        { id: 'decision', text: '지원할 직무에 대해 지금 나는', options: ['거의 정했다', '두세 개 사이에서 고민 중이다', '관심 분야만 있다', '아직 막막하다'] },
        { id: 'orgType', text: '가고 싶은 조직 형태', maxSelect: 2, options: ['대기업', '공기업·공공기관', '중견·중소기업', '스타트업', '외국계', '창업·프리랜서', '아직 모르겠다'] },
      ],
    },
    do: {
      title: '서류와 면접',
      prompt: '지원서를 쓰고 면접을 볼 때의 나를 떠올려 주세요.',
      items: [
        { id: 'JD1', dim: 'efficacy',      text: '원하는 곳에 합격할 만큼 준비할 수 있다고 믿는다' },
        { id: 'JD2', dim: 'storytelling',  text: '내 경험을 자기소개서에서 강점으로 풀어낼 자신이 있다' },
        { id: 'JD3', dim: 'storyGap',      text: '내 경험 중 무엇을 내세워야 할지 모르겠다' },
        { id: 'JD4', dim: 'tailoring',     text: '지원하는 곳마다 자기소개서를 맞춰 고치는 편이다' },
        { id: 'JD5', dim: 'interviewNerves', text: '면접에서 긴장하면 준비한 답이 잘 나오지 않는다' },
        { id: 'JD6', dim: 'rejectionRecovery', text: '불합격 결과를 받으면 다음 지원까지 회복이 오래 걸린다' },
        { id: 'JD7', dim: 'feedbackSeeking', text: '스터디나 첨삭으로 다른 사람의 피드백을 받으며 준비한다' },
      ],
      choices: [
        { id: 'targetGroup', text: '지원하려는 직무군', maxSelect: 2, optional: true, options: [] }, // 직무 분류 확정 후 채움
      ],
    },
  },

  worker: {
    find: {
      title: '나에게 맞는 일 탐색',
      prompt: '지금 하는 일과 앞으로의 방향을 떠올려 주세요.',
      fulfillment: {
        prompt: '지금 직장에서 이것이 얼마나 채워지고 있나요?',
        scale: ['전혀 채워지지 않는다', '조금 채워진다', '보통이다', '꽤 채워진다', '충분히 채워진다'],
      },
      items: [
        { id: 'WF1', dim: 'misfit',     text: '지금 직무가 나와 잘 맞지 않는다고 느낀다' },
        { id: 'WF2', dim: 'cynicism',   text: '예전보다 일에 대한 관심과 의미가 줄었다' },
        { id: 'WF3', dim: 'turnover',   text: '1년 안에 이직이나 전환을 진지하게 생각하고 있다' },
        { id: 'WF4', dim: 'lackInfo',   text: '다른 분야로 옮긴다면 무엇을 해야 할지 막막하다' },
        { id: 'WF5', dim: 'preparing',  text: '전환을 위해 공부하거나 준비하고 있는 것이 있다' },
      ],
      choices: [
        { id: 'direction', text: '5년 뒤, 가장 되고 싶은 모습에 가까운 것', options: ['한 분야의 깊은 전문가', '사람과 조직을 이끄는 관리자', '내 일을 하는 독립·창업', '지금 일을 안정적으로 지속', '전혀 다른 분야로 전환'] },
      ],
    },
    do: {
      title: '지금 자리에서의 성과',
      prompt: '지금 다니는 직장과 일을 떠올려 주세요.',
      items: [
        { id: 'WD1',  dim: 'exhaustion',  text: '퇴근할 때 에너지가 다 빠져나간 느낌이다' },
        { id: 'WD2',  dim: 'exhaustion',  text: '아침에 일하러 갈 생각을 하면 벌써 지친다' },
        { id: 'WD3',  dim: 'efficacy',    text: '지금 하는 일에서 성과를 내고 있다고 느낀다' },
        { id: 'WD4',  dim: 'engagement',  text: '일하다 보면 시간 가는 줄 모를 때가 있다' },
        { id: 'WD5',  dim: 'autonomy',    text: '일하는 방식을 내 스타일에 맞게 조정할 재량이 있다' },
        { id: 'WD6',  dim: 'roleAppetite', text: '지금 일에서 더 맡아보고 싶은 역할이 있다' },
        { id: 'WD7',  dim: 'clearCriteria', text: '내 성과가 어떤 기준으로 평가되는지 분명하다' },
        { id: 'WD8',  dim: 'bossStrain',  text: '상사와의 관계가 일하는 데 큰 스트레스다' },
        { id: 'WD9',  dim: 'peerSupport', text: '동료들과 서로 편하게 도움을 주고받는다' },
        { id: 'WD10', dim: 'voice',       text: '회의나 공식 자리에서 내 의견을 말하기가 어렵다' },
      ],
      choices: [
        { id: 'track', text: '앞으로 가고 싶은 방향에 가까운 것', options: ['지금 직무의 깊은 전문가', '팀을 이끄는 관리자', '아직 모르겠다'] },
      ],
    },
  },
}

// ═══════════════ 조합별 문항 수 ═══════════════
export function itemCount(stage: LifeStage, plan: Plan): number {
  const core = VALUE_CARDS.length + ATTACHMENT_ITEMS.length + STRESS_ITEMS.length + STAGE_BACKGROUND[stage].length
  const goals: Goal[] = plan === 'both' ? ['find', 'do'] : [plan]
  return core + goals.reduce((sum, g) => {
    const m = STAGE_GOAL_MODULES[stage][g]
    const goalModule = g === 'find' ? INTEREST_ITEMS.length : STYLE_ITEMS.length
    return sum + goalModule + m.items.length + m.choices.length + (m.fulfillment ? VALUE_CARDS.length : 0)
  }, 0)
}
