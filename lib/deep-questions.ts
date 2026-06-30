import { Question } from '@/types'

// ─────────────────────────────────────────────────────────────────
// 심층 분석용 20문항 (심층 분석 티어 전용 · 약 5분)
// 애착유형(6) + 번아웃 지표(4) + 핵심가치(3) + 리더십(4) + 삶의균형(3)
// ─────────────────────────────────────────────────────────────────

export const DEEP_QUESTIONS: Question[] = [

  // ══════════════════════════════════════════════════════════════
  // 애착 유형 — 6문항 (Likert)
  // attachment_anxiety: 불안형 성향 / attachment_avoidance: 회피형 성향
  // ══════════════════════════════════════════════════════════════

  {
    id: 'DA_1',
    text: '친밀한 관계에서 상대방이 나를 충분히 아끼지 않는 것 같다는 불안을 자주 느낀다.',
    type: 'likert', facet: 'attachment_anxiety', domain: 'DEEP',
  },
  {
    id: 'DA_2',
    text: '가까운 사람에게 감정적으로 의존하거나 기대는 것이 불편하게 느껴진다.',
    type: 'likert', facet: 'attachment_avoidance', domain: 'DEEP',
  },
  {
    id: 'DA_3',
    text: '중요한 사람과의 관계가 갑자기 멀어질 것 같은 느낌이 들면 매우 불안해진다.',
    type: 'likert', facet: 'attachment_anxiety', domain: 'DEEP',
  },
  {
    id: 'DA_4',
    text: '감정적으로 너무 가까워지면 나의 독립성을 잃을 것 같아 불편할 때가 있다.',
    type: 'likert', facet: 'attachment_avoidance', domain: 'DEEP',
  },
  {
    id: 'DA_5',
    text: '파트너나 친한 친구에게 내 감정과 생각을 솔직하게 털어놓는 것이 자연스럽다.',
    type: 'likert', facet: 'attachment_anxiety', domain: 'DEEP', reverse: true,
  },
  {
    id: 'DA_6',
    text: '나를 있는 그대로 받아들여주는 관계 안에서 충분한 안도감과 안정감을 느낀다.',
    type: 'likert', facet: 'attachment_avoidance', domain: 'DEEP', reverse: true,
  },

  // ══════════════════════════════════════════════════════════════
  // 번아웃 지표 — 4문항 (Likert)
  // ══════════════════════════════════════════════════════════════

  {
    id: 'DB_1',
    text: '퇴근 후에도 업무나 해야 할 일에 대한 생각을 완전히 멈추기 어렵다.',
    type: 'likert', facet: 'burnout_detachment', domain: 'DEEP',
  },
  {
    id: 'DB_2',
    text: '일에서 예전에 느끼던 보람이나 의미가 최근 들어 줄어든 것 같다.',
    type: 'likert', facet: 'burnout_meaning', domain: 'DEEP',
  },
  {
    id: 'DB_3',
    text: '하루를 마칠 때 감정적으로나 신체적으로나 완전히 탈진한 느낌이 자주 든다.',
    type: 'likert', facet: 'burnout_exhaustion', domain: 'DEEP',
  },
  {
    id: 'DB_4',
    text: '충분히 쉬어도 다음 날 일을 시작할 에너지가 제대로 회복되지 않는 느낌이다.',
    type: 'likert', facet: 'burnout_recovery', domain: 'DEEP',
  },

  // ══════════════════════════════════════════════════════════════
  // 핵심 가치 — 3문항 (강제 선택형)
  // ══════════════════════════════════════════════════════════════

  {
    id: 'DV_1',
    text: '직업이나 커리어를 선택할 때 가장 중요하게 생각하는 것은?',
    type: 'choice', facet: 'value_work', domain: 'DEEP',
    options: [
      { label: '경제적 안정과 보상', value: 'security' },
      { label: '일 자체의 의미와 성취감', value: 'meaning' },
      { label: '자율성과 독립적 판단권', value: 'autonomy' },
      { label: '성장 기회와 배움의 폭', value: 'growth' },
    ],
  },
  {
    id: 'DV_2',
    text: '이상적인 삶에 더 가까운 것을 고른다면?',
    type: 'choice', facet: 'value_life', domain: 'DEEP',
    options: [
      { label: '깊고 안정적인 관계와 커뮤니티', value: 'relationships' },
      { label: '높은 성취와 사회적 인정', value: 'achievement' },
      { label: '자유롭고 다양한 경험의 삶', value: 'freedom' },
      { label: '안정적이고 예측 가능한 삶', value: 'stability' },
    ],
  },
  {
    id: 'DV_3',
    text: '앞으로 5년 안에 가장 개선하고 싶은 영역은?',
    type: 'choice', facet: 'value_growth', domain: 'DEEP',
    options: [
      { label: '커리어 방향과 전문성', value: 'career' },
      { label: '깊고 의미 있는 관계', value: 'relationships' },
      { label: '건강과 체력·에너지 수준', value: 'health' },
      { label: '경제적 여유와 자산', value: 'finance' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // 리더십 & 영향력 스타일 — 4문항 (선택형)
  // ══════════════════════════════════════════════════════════════

  {
    id: 'DL_1',
    text: '팀 프로젝트에서 내가 자연스럽게 맡게 되는 역할은?',
    type: 'choice', facet: 'leadership_role', domain: 'DEEP',
    options: [
      { label: '방향을 제시하고 결정을 주도하는 리더', value: 'directive' },
      { label: '아이디어를 연결하고 분위기를 조율하는 촉진자', value: 'facilitator' },
      { label: '세부 실행을 꼼꼼하게 책임지는 전문가', value: 'executor' },
      { label: '팀원의 강점을 이끌어내는 코치', value: 'coach' },
    ],
  },
  {
    id: 'DL_2',
    text: '팀에서 의견 충돌이 생겼을 때 나는 주로?',
    type: 'choice', facet: 'conflict_style', domain: 'DEEP',
    options: [
      { label: '내 입장을 명확하게 제시하고 설득한다', value: 'assertive' },
      { label: '절충안을 찾아 합의를 이끌어낸다', value: 'compromising' },
      { label: '시간을 두고 자연스럽게 해결되길 기다린다', value: 'avoiding' },
      { label: '상대방 관점을 충분히 이해하는 데 집중한다', value: 'accommodating' },
    ],
  },
  {
    id: 'DL_3',
    text: '팀원이나 동료에게 피드백을 줄 때 나의 방식은?',
    type: 'choice', facet: 'feedback_style', domain: 'DEEP',
    options: [
      { label: '직접적이고 명확하게 개선점을 지적한다', value: 'direct' },
      { label: '잘한 점과 개선점을 균형 있게 전달한다', value: 'balanced' },
      { label: '스스로 답을 찾도록 질문을 던진다', value: 'coaching' },
      { label: '피드백 자체가 불편해서 최대한 부드럽게', value: 'gentle' },
    ],
  },
  {
    id: 'DL_4',
    text: '동기부여가 가장 잘 되는 환경은?',
    type: 'choice', facet: 'motivation_env', domain: 'DEEP',
    options: [
      { label: '명확한 지시와 구체적 목표가 있는 환경', value: 'structured' },
      { label: '자율성이 충분히 보장된 환경', value: 'autonomous' },
      { label: '함께 결정하고 성과를 나누는 협력 환경', value: 'collaborative' },
      { label: '도전적 목표와 지속적 성장 기회가 있는 환경', value: 'growth' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // 삶의 균형 — 3문항 (선택형)
  // ══════════════════════════════════════════════════════════════

  {
    id: 'DLS_1',
    text: '현재 삶에서 가장 만족스러운 영역은?',
    type: 'choice', facet: 'life_satisfied', domain: 'DEEP',
    options: [
      { label: '일·커리어', value: 'work' },
      { label: '관계·소속감', value: 'relationships' },
      { label: '건강·체력', value: 'health' },
      { label: '개인 성장·배움', value: 'growth' },
    ],
  },
  {
    id: 'DLS_2',
    text: '현재 삶에서 가장 부족하다고 느끼는 영역은?',
    type: 'choice', facet: 'life_lacking', domain: 'DEEP',
    options: [
      { label: '일·커리어', value: 'work' },
      { label: '관계·소속감', value: 'relationships' },
      { label: '건강·체력', value: 'health' },
      { label: '경제적 여유', value: 'finance' },
    ],
  },
  {
    id: 'DLS_3',
    text: '지금 당장 삶에서 한 가지를 바꿀 수 있다면?',
    type: 'choice', facet: 'life_change', domain: 'DEEP',
    options: [
      { label: '커리어 방향을 명확히 한다', value: 'career' },
      { label: '더 의미 있는 관계를 만든다', value: 'relationships' },
      { label: '건강 습관을 정착시킨다', value: 'health' },
      { label: '경제적 기반을 다진다', value: 'finance' },
    ],
  },
]
