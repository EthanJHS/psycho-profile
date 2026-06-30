// 유료 검사 문항 — 82문항
// HEXACO 24 하위 요인(48) + RIASEC 직접 측정(18) + 학문 적성(16, 차원당 2문항)
// Likert 척도: 1=전혀 아니다 2=아니다 3=보통이다 4=그렇다 5=매우 그렇다

export type PaidSection = 'hexaco' | 'riasec' | 'aptitude'

export interface PaidQuestion {
  id: string          // PQ1 ~ PQ82
  section: PaidSection
  facet?: SubFacet    // HEXACO 하위 요인
  riasecType?: RiasecType
  aptitudeDim?: AptitudeDim
  text: string
  reverse: boolean    // true면 채점 시 (6 - score)
}

// ── HEXACO 24 하위 요인 ───────────────────────────────────────────────
// H(겸손·윤리): sincerity · fairness · greedAvoidance · modesty
// E(감수성):    fearfulness · anxiety · dependence · sentimentality
// X(대담성):    socialSelfEsteem · socialBoldness · sociability · liveliness
// A(원만성):    forgivingness · gentleness · flexibility · patience
// C(성실성):    organization · diligence · perfectionism · prudence
// O(개방성):    aestheticAppreciation · inquisitiveness · creativity · unconventionality

export type SubFacet =
  | 'sincerity' | 'fairness' | 'greedAvoidance' | 'modesty'
  | 'fearfulness' | 'anxiety' | 'dependence' | 'sentimentality'
  | 'socialSelfEsteem' | 'socialBoldness' | 'sociability' | 'liveliness'
  | 'forgivingness' | 'gentleness' | 'flexibility' | 'patience'
  | 'organization' | 'diligence' | 'perfectionism' | 'prudence'
  | 'aestheticAppreciation' | 'inquisitiveness' | 'creativity' | 'unconventionality'

export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
export type AptitudeDim = 'quantitative' | 'verbal' | 'spatial' | 'social' | 'applied' | 'business' | 'scientific' | 'humanistic'

// 하위 요인 한국어 레이블
export const SUB_FACET_LABELS: Record<SubFacet, { label: string; parent: string }> = {
  sincerity:             { label: '진실성',     parent: '겸손·윤리' },
  fairness:              { label: '공정성',     parent: '겸손·윤리' },
  greedAvoidance:        { label: '탐욕 회피',  parent: '겸손·윤리' },
  modesty:               { label: '겸손',       parent: '겸손·윤리' },
  fearfulness:           { label: '두려움 민감성', parent: '감수성' },
  anxiety:               { label: '불안 경향',  parent: '감수성' },
  dependence:            { label: '정서적 의존', parent: '감수성' },
  sentimentality:        { label: '공감·감동',  parent: '감수성' },
  socialSelfEsteem:      { label: '사회적 자존감', parent: '사회적 대담성' },
  socialBoldness:        { label: '공적 자신감', parent: '사회적 대담성' },
  sociability:           { label: '사교성',     parent: '사회적 대담성' },
  liveliness:            { label: '활력·생동감', parent: '사회적 대담성' },
  forgivingness:         { label: '용서·관용',  parent: '공감력·원만성' },
  gentleness:            { label: '온화함',     parent: '공감력·원만성' },
  flexibility:           { label: '유연성·타협', parent: '공감력·원만성' },
  patience:              { label: '인내·분노 조절', parent: '공감력·원만성' },
  organization:          { label: '체계성',     parent: '성실성' },
  diligence:             { label: '근면성',     parent: '성실성' },
  perfectionism:         { label: '완벽주의',   parent: '성실성' },
  prudence:              { label: '신중성',     parent: '성실성' },
  aestheticAppreciation: { label: '미적 감수성', parent: '지적 개방성' },
  inquisitiveness:       { label: '탐구심',     parent: '지적 개방성' },
  creativity:            { label: '창의적 상상력', parent: '지적 개방성' },
  unconventionality:     { label: '비관습적 사고', parent: '지적 개방성' },
}

export const PAID_QUESTIONS: PaidQuestion[] = [

  // ════════════════════════════════════════════════════════════════
  // HEXACO — H: 겸손·윤리 의식 (8문항)
  // ════════════════════════════════════════════════════════════════

  // H1 진실성 — 자신을 포장하거나 속이는 경향 없음
  {
    id: 'PQ1', section: 'hexaco', facet: 'sincerity', reverse: false,
    text: '나는 다른 사람에게 좋은 인상을 주기 위해 나 자신을 실제보다 좋게 포장하지 않는다.',
  },
  {
    id: 'PQ2', section: 'hexaco', facet: 'sincerity', reverse: true,
    text: '원하는 것을 얻기 위해 약간의 과장이나 거짓말은 괜찮다고 생각한다.',
  },

  // H2 공정성 — 불공정한 이득 거부
  {
    id: 'PQ3', section: 'hexaco', facet: 'fairness', reverse: false,
    text: '내가 유리하더라도 규칙을 어겨 이익을 얻는 것은 하고 싶지 않다.',
  },
  {
    id: 'PQ4', section: 'hexaco', facet: 'fairness', reverse: true,
    text: '들키지 않는다면 부당한 방법으로 더 많은 것을 얻는 것도 나쁘지 않다고 생각한다.',
  },

  // H3 탐욕 회피 — 물질적 욕망 낮음
  {
    id: 'PQ5', section: 'hexaco', facet: 'greedAvoidance', reverse: false,
    text: '나는 화려한 생활보다 수수하고 단순한 삶을 더 선호한다.',
  },
  {
    id: 'PQ6', section: 'hexaco', facet: 'greedAvoidance', reverse: true,
    text: '나는 부유함과 사치스러운 생활 방식을 강하게 원한다.',
  },

  // H4 겸손 — 특별 대우나 과시 욕구 없음
  {
    id: 'PQ7', section: 'hexaco', facet: 'modesty', reverse: false,
    text: '나는 다른 사람들이 나를 특별하거나 뛰어난 사람으로 여겨줄 필요를 느끼지 않는다.',
  },
  {
    id: 'PQ8', section: 'hexaco', facet: 'modesty', reverse: true,
    text: '나는 내 성취나 능력에 사람들이 감탄해 주는 것을 좋아한다.',
  },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — E: 감수성 / 정서성 (8문항)
  // ════════════════════════════════════════════════════════════════

  // E1 두려움 민감성 — 위험·신체적 위협 회피
  {
    id: 'PQ9', section: 'hexaco', facet: 'fearfulness', reverse: false,
    text: '신체적으로 위험할 수 있는 상황이 예상되면 나는 참여를 꺼리는 편이다.',
  },
  {
    id: 'PQ10', section: 'hexaco', facet: 'fearfulness', reverse: true,
    text: '나는 스릴 있고 위험한 활동을 즐기는 편이다.',
  },

  // E2 불안 경향 — 걱정·예기 불안
  {
    id: 'PQ11', section: 'hexaco', facet: 'anxiety', reverse: false,
    text: '나는 일이 잘못될까 봐 자주 걱정하는 편이다.',
  },
  {
    id: 'PQ12', section: 'hexaco', facet: 'anxiety', reverse: true,
    text: '나는 대부분의 일이 잘 풀릴 것이라고 쉽게 낙관한다.',
  },

  // E3 정서적 의존 — 힘들 때 타인 지지 필요
  {
    id: 'PQ13', section: 'hexaco', facet: 'dependence', reverse: false,
    text: '어려운 상황에서 나는 다른 사람의 정서적 지지가 많이 필요하다.',
  },
  {
    id: 'PQ14', section: 'hexaco', facet: 'dependence', reverse: true,
    text: '감정적으로 힘들 때도 나는 혼자서 잘 추스를 수 있다.',
  },

  // E4 공감·감동 — 타인 감정에 깊이 공명
  {
    id: 'PQ15', section: 'hexaco', facet: 'sentimentality', reverse: false,
    text: '나는 다른 사람의 어려움에 깊이 공감하며, 그들의 고통이 나를 감정적으로 움직인다.',
  },
  {
    id: 'PQ16', section: 'hexaco', facet: 'sentimentality', reverse: true,
    text: '나는 타인의 감정적인 어려움을 들어도 나 자신은 별로 영향받지 않는 편이다.',
  },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — X: 사회적 대담성 (8문항)
  // ════════════════════════════════════════════════════════════════

  // X1 사회적 자존감 — 사람들 앞에서의 자신감
  {
    id: 'PQ17', section: 'hexaco', facet: 'socialSelfEsteem', reverse: false,
    text: '나는 다른 사람들과 함께 있을 때 자신감이 있는 편이다.',
  },
  {
    id: 'PQ18', section: 'hexaco', facet: 'socialSelfEsteem', reverse: true,
    text: '나는 낯선 사람들 사이에서 내가 어떻게 보일지 걱정될 때가 많다.',
  },

  // X2 공적 자신감 — 발표·연설 편안함
  {
    id: 'PQ19', section: 'hexaco', facet: 'socialBoldness', reverse: false,
    text: '나는 많은 사람 앞에서 발표하거나 의견을 말하는 것이 편하다.',
  },
  {
    id: 'PQ20', section: 'hexaco', facet: 'socialBoldness', reverse: true,
    text: '나는 낯선 사람에게 먼저 말을 거는 것이 어렵다.',
  },

  // X3 사교성 — 사람들과 어울리는 것을 즐김
  {
    id: 'PQ21', section: 'hexaco', facet: 'sociability', reverse: false,
    text: '나는 파티나 모임 같은 사교적인 자리에서 에너지를 얻는 편이다.',
  },
  {
    id: 'PQ22', section: 'hexaco', facet: 'sociability', reverse: true,
    text: '나는 사람들과 어울리기보다 혼자만의 시간을 훨씬 더 선호한다.',
  },

  // X4 활력·생동감 — 열정적이고 활기찬 성향
  {
    id: 'PQ23', section: 'hexaco', facet: 'liveliness', reverse: false,
    text: '나는 대부분의 시간에 활기차고 열정적인 편이다.',
  },
  {
    id: 'PQ24', section: 'hexaco', facet: 'liveliness', reverse: true,
    text: '나는 자주 무기력하거나 기분이 가라앉는 것을 느낀다.',
  },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — A: 공감력·원만성 (8문항)
  // ════════════════════════════════════════════════════════════════

  // A1 용서·관용 — 상처 준 사람을 용서하는 성향
  {
    id: 'PQ25', section: 'hexaco', facet: 'forgivingness', reverse: false,
    text: '나는 나에게 상처를 준 사람도 비교적 빨리 용서하는 편이다.',
  },
  {
    id: 'PQ26', section: 'hexaco', facet: 'forgivingness', reverse: true,
    text: '나에게 잘못한 사람은 그에 마땅한 결과를 겪어야 한다고 생각한다.',
  },

  // A2 온화함 — 비판보다 이해를 선택
  {
    id: 'PQ27', section: 'hexaco', facet: 'gentleness', reverse: false,
    text: '나는 다른 사람의 실수나 결점을 비판하기보다 이해하려고 노력한다.',
  },
  {
    id: 'PQ28', section: 'hexaco', facet: 'gentleness', reverse: true,
    text: '나는 사람들의 잘못된 행동에 직접적으로 비판이나 불만을 표현하는 편이다.',
  },

  // A3 유연성·타협 — 의견 충돌 시 상대 수용
  {
    id: 'PQ29', section: 'hexaco', facet: 'flexibility', reverse: false,
    text: '다른 사람과 의견이 다를 때, 나는 상대방의 관점을 수용하려고 적극적으로 노력한다.',
  },
  {
    id: 'PQ30', section: 'hexaco', facet: 'flexibility', reverse: true,
    text: '나는 내가 옳다고 생각할 때 쉽게 의견을 바꾸지 않는다.',
  },

  // A4 인내·분노 조절 — 좌절 상황에서 침착함
  {
    id: 'PQ31', section: 'hexaco', facet: 'patience', reverse: false,
    text: '일이 뜻대로 되지 않거나 방해를 받아도 나는 침착함을 잘 유지한다.',
  },
  {
    id: 'PQ32', section: 'hexaco', facet: 'patience', reverse: true,
    text: '나는 기다림이 길어지거나 방해를 받으면 쉽게 짜증이 난다.',
  },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — C: 성실성 (8문항)
  // ════════════════════════════════════════════════════════════════

  // C1 체계성 — 정리·분류를 좋아하는 성향
  {
    id: 'PQ33', section: 'hexaco', facet: 'organization', reverse: false,
    text: '나는 물건이나 업무를 체계적으로 정리하고 분류하는 것을 좋아한다.',
  },
  {
    id: 'PQ34', section: 'hexaco', facet: 'organization', reverse: true,
    text: '나는 주변 환경이 다소 어수선해도 크게 신경 쓰지 않는 편이다.',
  },

  // C2 근면성 — 끝까지 완수하는 성향
  {
    id: 'PQ35', section: 'hexaco', facet: 'diligence', reverse: false,
    text: '나는 맡은 일을 중도에 포기하지 않고 끝까지 최선을 다해 완수한다.',
  },
  {
    id: 'PQ36', section: 'hexaco', facet: 'diligence', reverse: true,
    text: '나는 과제가 지루해지면 끝내지 않고 다른 일로 넘어가는 경향이 있다.',
  },

  // C3 완벽주의 — 실수 없이 꼼꼼하게
  {
    id: 'PQ37', section: 'hexaco', facet: 'perfectionism', reverse: false,
    text: '나는 결과물에 실수가 없도록 꼼꼼하게 확인하고 다듬는 편이다.',
  },
  {
    id: 'PQ38', section: 'hexaco', facet: 'perfectionism', reverse: true,
    text: '나는 "충분히 괜찮다"면 완벽하게 마무리하지 않아도 된다고 생각한다.',
  },

  // C4 신중성 — 충동 억제, 사전 계획
  {
    id: 'PQ39', section: 'hexaco', facet: 'prudence', reverse: false,
    text: '나는 중요한 결정을 내리기 전에 결과를 충분히 생각하고 계획한다.',
  },
  {
    id: 'PQ40', section: 'hexaco', facet: 'prudence', reverse: true,
    text: '나는 충동적으로 행동한 뒤 나중에 후회하는 경우가 종종 있다.',
  },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — O: 지적 개방성 (8문항)
  // ════════════════════════════════════════════════════════════════

  // O1 미적 감수성 — 예술·아름다움에 감동
  {
    id: 'PQ41', section: 'hexaco', facet: 'aestheticAppreciation', reverse: false,
    text: '나는 음악, 미술, 문학 등 예술 작품에서 깊은 감동과 아름다움을 경험한다.',
  },
  {
    id: 'PQ42', section: 'hexaco', facet: 'aestheticAppreciation', reverse: true,
    text: '나는 예술 작품의 아름다움보다 실용적인 가치에 더 관심이 간다.',
  },

  // O2 탐구심 — 복잡한 이론·학문 탐구를 즐김
  {
    id: 'PQ43', section: 'hexaco', facet: 'inquisitiveness', reverse: false,
    text: '나는 복잡한 이론이나 개념을 깊이 탐구하고 이해하는 것이 즐겁다.',
  },
  {
    id: 'PQ44', section: 'hexaco', facet: 'inquisitiveness', reverse: true,
    text: '나는 심층적인 학문 탐구보다 바로 쓸 수 있는 실용적인 정보를 선호한다.',
  },

  // O3 창의적 상상력 — 새로운 방식으로 보는 능력
  {
    id: 'PQ45', section: 'hexaco', facet: 'creativity', reverse: false,
    text: '나는 일상적인 것들을 새롭고 독창적인 방식으로 생각하는 상상력이 있다.',
  },
  {
    id: 'PQ46', section: 'hexaco', facet: 'creativity', reverse: true,
    text: '나는 창의적인 발상보다 검증된 기존 방법을 따르는 것이 더 편하다.',
  },

  // O4 비관습적 사고 — 통념에 의문을 품는 성향
  {
    id: 'PQ47', section: 'hexaco', facet: 'unconventionality', reverse: false,
    text: '나는 사회의 통념이나 기존 관습에 쉽게 의문을 품는 편이다.',
  },
  {
    id: 'PQ48', section: 'hexaco', facet: 'unconventionality', reverse: true,
    text: '나는 검증된 전통적인 방식이 혁신적인 방법보다 대체로 안전하고 신뢰할 만하다고 생각한다.',
  },

  // ════════════════════════════════════════════════════════════════
  // RIASEC — 직업흥미 직접 측정 (18문항, 유형당 3문항)
  // 척도: 1=전혀 관심없다 ~ 5=매우 좋다
  // ════════════════════════════════════════════════════════════════

  // R: Realistic — 현실형 (기계·신체·자연 활동)
  {
    id: 'PQ49', section: 'riasec', riasecType: 'R', reverse: false,
    text: '기계나 도구를 직접 다루고 수리하거나 조립하는 작업을 즐긴다.',
  },
  {
    id: 'PQ50', section: 'riasec', riasecType: 'R', reverse: false,
    text: '실외에서 몸을 쓰거나 구체적인 결과물을 직접 만드는 일에 끌린다.',
  },
  {
    id: 'PQ51', section: 'riasec', riasecType: 'R', reverse: false,
    text: '농업, 건설, 제조처럼 실물을 다루는 환경에서 일하고 싶다.',
  },

  // I: Investigative — 탐구형 (분석·연구·이론)
  {
    id: 'PQ52', section: 'riasec', riasecType: 'I', reverse: false,
    text: '복잡한 문제의 원인을 파악하기 위해 깊이 파고드는 탐구 활동이 좋다.',
  },
  {
    id: 'PQ53', section: 'riasec', riasecType: 'I', reverse: false,
    text: '혼자 깊이 생각하며 새로운 가설이나 이론적 연결을 찾아내는 지적 작업에 끌린다.',
  },
  {
    id: 'PQ54', section: 'riasec', riasecType: 'I', reverse: false,
    text: '관찰과 실험, 데이터 수집을 통해 문제를 체계적으로 검증하는 방식을 선호한다.',
  },

  // A: Artistic — 예술형 (창작·표현·자유)
  {
    id: 'PQ55', section: 'riasec', riasecType: 'A', reverse: false,
    text: '글쓰기, 그림, 음악 등 창작 활동으로 나를 표현하는 것이 좋다.',
  },
  {
    id: 'PQ56', section: 'riasec', riasecType: 'A', reverse: false,
    text: '정해진 규칙보다 자유롭게 내 방식대로 일할 수 있는 환경이 좋다.',
  },
  {
    id: 'PQ57', section: 'riasec', riasecType: 'A', reverse: false,
    text: '미적 감각과 독창성이 필요한 디자인·공연·콘텐츠 작업에 끌린다.',
  },

  // S: Social — 사회형 (교육·돌봄·협력)
  {
    id: 'PQ58', section: 'riasec', riasecType: 'S', reverse: false,
    text: '사람들을 가르치거나 도움으로써 긍정적인 변화를 만드는 일이 좋다.',
  },
  {
    id: 'PQ59', section: 'riasec', riasecType: 'S', reverse: false,
    text: '상담이나 코칭처럼 타인의 문제를 함께 해결하는 역할이 의미 있다.',
  },
  {
    id: 'PQ60', section: 'riasec', riasecType: 'S', reverse: false,
    text: '팀워크와 협력을 중심으로 한 환경에서 일하는 것이 편하고 즐겁다.',
  },

  // E: Enterprising — 진취형 (설득·리더십·경쟁)
  {
    id: 'PQ61', section: 'riasec', riasecType: 'E', reverse: false,
    text: '사람들을 설득하거나 이끄는 리더십 역할을 즐긴다.',
  },
  {
    id: 'PQ62', section: 'riasec', riasecType: 'E', reverse: false,
    text: '경쟁적인 환경에서 목표를 향해 도전하는 것이 자극이 된다.',
  },
  {
    id: 'PQ63', section: 'riasec', riasecType: 'E', reverse: false,
    text: '새로운 사업 아이디어를 구체화하고 실행하는 일에 강하게 끌린다.',
  },

  // C: Conventional — 관습형 (절차·정확·데이터)
  {
    id: 'PQ64', section: 'riasec', riasecType: 'C', reverse: false,
    text: '명확한 절차와 규칙이 있는 구조화된 업무 환경에서 일하는 것이 편하다.',
  },
  {
    id: 'PQ65', section: 'riasec', riasecType: 'C', reverse: false,
    text: '데이터나 수치를 꼼꼼하게 검토하고 오류를 찾아 수정하는 과정에서 보람을 느낀다.',
  },
  {
    id: 'PQ66', section: 'riasec', riasecType: 'C', reverse: false,
    text: '정해진 양식과 기준에 따라 문서나 데이터를 정확하게 처리하는 일에 잘 맞는다.',
  },

  // ════════════════════════════════════════════════════════════════
  // 학문 적성 (8문항)
  // 측정 원칙: 흥미(하고 싶다)가 아니라 자기평가 역량(잘 된다/어렵다)을 측정
  // RIASEC과의 중복 최소화: RIASEC=환경·활동 선호, 적성=인지적 역량 수준
  // 역채점 4개 포함 → 묵시적 동의 편향(acquiescence bias) 통제
  // ════════════════════════════════════════════════════════════════

  // 수리·논리 역량 (정방향): 수식·논리 체계를 빠르게 이해하는 능력
  {
    id: 'PQ67', section: 'aptitude', aptitudeDim: 'quantitative', reverse: false,
    text: '수식이나 논리 추론 문제를 접했을 때 다른 사람보다 빠르게 이해하고 풀어내는 편이다.',
  },
  // 언어·문해 역량 (역채점): 복잡한 글 이해가 어렵다는 진술 → 역채점으로 언어 역량 낮음
  {
    id: 'PQ68', section: 'aptitude', aptitudeDim: 'verbal', reverse: true,
    text: '길고 복잡한 글을 읽고 핵심 논지를 파악하는 것이 나에게는 쉽지 않다.',
  },
  // 공간·시각화 역량 (정방향): 도면·구조를 머릿속으로 회전·변환하는 능력
  {
    id: 'PQ69', section: 'aptitude', aptitudeDim: 'spatial', reverse: false,
    text: '도면, 지도, 입체 도형을 보면 그 구조나 공간 관계를 머릿속으로 자연스럽게 그릴 수 있다.',
  },
  // 사회·인간 이해 역량 (역채점): 타인 심리 파악이 어렵다 → 역채점으로 사회 이해 역량 낮음
  // (RIASEC S형은 "돕고 싶다"는 활동 선호, 이쪽은 타인 심리·집단 역학을 읽는 인지 역량)
  {
    id: 'PQ70', section: 'aptitude', aptitudeDim: 'social', reverse: true,
    text: '다른 사람이 무엇을 원하거나 어떤 상황에 놓여 있는지 파악하는 것이 나에게는 어렵다.',
  },
  // 응용·구현 역량 (정방향): 시스템 원리를 빠르게 파악해 응용하는 능력
  // (RIASEC R형은 "기계를 직접 다루고 싶다"는 활동 선호, 이쪽은 원리 이해·응용 역량)
  {
    id: 'PQ71', section: 'aptitude', aptitudeDim: 'applied', reverse: false,
    text: '기계나 소프트웨어가 어떤 원리로 작동하는지 설명을 들으면 빠르게 이해하고 응용할 수 있다.',
  },
  // 경영·재무 역량 (역채점): 경영 데이터 다루기 어렵다 → 역채점으로 경상 역량 낮음
  {
    id: 'PQ72', section: 'aptitude', aptitudeDim: 'business', reverse: true,
    text: '재무제표, 손익 구조, 시장 분석 같은 경영·경제 데이터를 다루는 것이 나에게는 낯설고 어렵다.',
  },
  // 과학적 추론 역량 (정방향): 데이터에서 인과 관계를 논리적으로 추론하는 능력
  // (RIASEC I형은 "탐구·분석 환경을 선호", 이쪽은 과학적 방법론 실행 역량)
  {
    id: 'PQ73', section: 'aptitude', aptitudeDim: 'scientific', reverse: false,
    text: '실험 결과나 데이터를 보고 원인과 결과의 관계를 논리적으로 추론하는 것이 잘 된다.',
  },
  // 인문학적 해석 역량 (역채점): 맥락·의미 파악 어렵다 → 역채점으로 인문 역량 낮음
  // (RIASEC A형은 "창작·표현하고 싶다"는 활동 선호, 이쪽은 텍스트·역사 맥락 해석 역량)
  {
    id: 'PQ74', section: 'aptitude', aptitudeDim: 'humanistic', reverse: true,
    text: '역사적 사건이나 문학 작품 속 인물의 동기와 시대적 맥락을 해석하는 것이 어렵게 느껴진다.',
  },

  // ── 학문 적성 2차 문항 (PQ75~PQ82) — 각 차원 2번째 문항 ──────────────
  // 1차와 방향을 반전해 차원당 정·역방향 1개씩 균형 확보
  // 다른 측면(세부 인지 역량)을 다뤄 내용 타당도 강화

  // 수리·논리 2차 (역채점): 복잡한 수식 앞에서 막막함 → 역채점으로 수리 역량 낮음
  {
    id: 'PQ75', section: 'aptitude', aptitudeDim: 'quantitative', reverse: true,
    text: '복잡한 수식이나 통계 공식을 보면 어디서부터 접근해야 할지 막막하게 느껴진다.',
  },
  // 언어·문해 2차 (정방향): 논리적 허점 포착 능력
  {
    id: 'PQ76', section: 'aptitude', aptitudeDim: 'verbal', reverse: false,
    text: '상대방의 말이나 글에서 논리적 허점이나 모순을 비교적 잘 찾아내는 편이다.',
  },
  // 공간·시각화 2차 (역채점): 도면·배치도 파악 어려움 → 역채점
  {
    id: 'PQ77', section: 'aptitude', aptitudeDim: 'spatial', reverse: true,
    text: '조립 설명서나 공간 배치도를 보면 전체 구조가 머릿속으로 잘 그려지지 않는다.',
  },
  // 사회·인간 이해 2차 (정방향): 초면에도 성격·의도 파악
  {
    id: 'PQ78', section: 'aptitude', aptitudeDim: 'social', reverse: false,
    text: '처음 만나는 사람도 대화하다 보면 어떤 성격인지, 무엇을 원하는지 비교적 빨리 파악하는 편이다.',
  },
  // 응용·구현 2차 (역채점): 고장 원인 파악 어려움 → 역채점
  {
    id: 'PQ79', section: 'aptitude', aptitudeDim: 'applied', reverse: true,
    text: '기계나 전자기기가 오작동할 때 스스로 원인을 파악하고 해결하는 것이 나에게는 어렵다.',
  },
  // 경영·재무 2차 (정방향): 수익 구조·비용 분석에서 시사점 도출
  {
    id: 'PQ80', section: 'aptitude', aptitudeDim: 'business', reverse: false,
    text: '수익 구조나 비용 분석 자료를 보면 어디가 문제이고 어떻게 개선할지 감이 오는 편이다.',
  },
  // 과학적 추론 2차 (역채점): 연구 방법론 이해 어려움 → 역채점
  {
    id: 'PQ81', section: 'aptitude', aptitudeDim: 'scientific', reverse: true,
    text: '실험 설계나 변수 통제 같은 연구 방법론을 이해하는 것이 나에게는 부담스럽다.',
  },
  // 인문학적 해석 2차 (정방향): 동일 사건의 다층적 해석 이해
  {
    id: 'PQ82', section: 'aptitude', aptitudeDim: 'humanistic', reverse: false,
    text: '같은 역사적 사건이나 문학 작품도 시대·문화·관점에 따라 다르게 해석될 수 있다는 것을 잘 이해한다.',
  },
]

// 섹션별 분리 유틸
export const HEXACO_QUESTIONS  = PAID_QUESTIONS.filter(q => q.section === 'hexaco')
export const RIASEC_QUESTIONS  = PAID_QUESTIONS.filter(q => q.section === 'riasec')
export const APTITUDE_QUESTIONS = PAID_QUESTIONS.filter(q => q.section === 'aptitude')
