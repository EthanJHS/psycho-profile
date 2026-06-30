import { Question } from '@/types'

// ─────────────────────────────────────────────────────────────────
// 풀버전 80문항 (샘플 20문항 + 이 파일 = 총 100문항)
// 섹션: HEXACO 심화(40) + TCI(20) + 인지심화(10) + 동기(6) + 스트레스(4)
// ─────────────────────────────────────────────────────────────────

export const FULL_QUESTIONS: Question[] = [

  // ══════════════════════════════════════════════════════════════
  // HEXACO 심화 — 기존 6패싯 외 18개 추가 패싯
  // ══════════════════════════════════════════════════════════════

  // ── H: 성실성 (Sincerity) ──
  {
    id: 'H_sin_1',
    text: '좋은 인상을 위해 내 진짜 생각이나 감정을 감추는 경우가 있다.',
    type: 'likert', facet: 'sincerity', domain: 'H', reverse: true,
  },
  {
    id: 'H_sin_2',
    text: '처음 만나는 사람에게도 꾸밈없이 솔직하게 대하는 편이다.',
    type: 'likert', facet: 'sincerity', domain: 'H',
  },
  {
    id: 'H_sin_3',
    text: '원하는 것을 얻기 위해 아첨이나 과장을 사용한다.',
    type: 'likert', facet: 'sincerity', domain: 'H', reverse: true,
  },
  {
    id: 'H_sin_4',
    text: '사람들이 내 솔직함을 때로 불편해한다는 것을 안다.',
    type: 'likert', facet: 'sincerity', domain: 'H',
  },

  // ── H: 공정성 (Fairness) ──
  {
    id: 'H_fair_1',
    text: '규칙을 어기면 아무도 모를 상황이라도 그냥 지나치지 않는다.',
    type: 'likert', facet: 'fairness', domain: 'H',
  },
  {
    id: 'H_fair_2',
    text: '이익이 될 때만 규칙을 지키는 편이다.',
    type: 'likert', facet: 'fairness', domain: 'H', reverse: true,
  },
  {
    id: 'H_fair_3',
    text: '내가 더 유리하더라도 불공정한 거래는 거절한다.',
    type: 'likert', facet: 'fairness', domain: 'H',
  },
  {
    id: 'H_fair_4',
    text: '협상에서 상대방이 모르는 약점을 이용한 적이 있다.',
    type: 'likert', facet: 'fairness', domain: 'H', reverse: true,
  },

  // ── H: 탐욕 회피 (Greed Avoidance) ──
  {
    id: 'H_greed_1',
    text: '화려한 생활 방식이나 사치품에 큰 끌림을 느낀다.',
    type: 'likert', facet: 'greed_avoidance', domain: 'H', reverse: true,
  },
  {
    id: 'H_greed_2',
    text: '돈이나 지위보다 의미 있는 일을 더 중요하게 생각한다.',
    type: 'likert', facet: 'greed_avoidance', domain: 'H',
  },
  {
    id: 'H_greed_3',
    text: '많은 돈을 위해서라면 가치관과 맞지 않는 일도 할 수 있다.',
    type: 'likert', facet: 'greed_avoidance', domain: 'H', reverse: true,
  },
  {
    id: 'H_greed_4',
    text: '부자가 되는 것이 삶의 주요 목표 중 하나이다.',
    type: 'likert', facet: 'greed_avoidance', domain: 'H', reverse: true,
  },

  // ── E: 두려움 (Fearfulness) ──
  {
    id: 'E_fear_1',
    text: '신체적 위험이 예상되는 상황(번지점프, 암벽등반 등)을 피하는 편이다.',
    type: 'likert', facet: 'fearfulness', domain: 'E',
  },
  {
    id: 'E_fear_2',
    text: '결과가 불확실한 상황에서도 과감하게 행동하는 편이다.',
    type: 'likert', facet: 'fearfulness', domain: 'E', reverse: true,
  },
  {
    id: 'E_fear_3',
    text: '위협적인 상황에서 다른 사람들보다 더 두려움을 느낀다.',
    type: 'likert', facet: 'fearfulness', domain: 'E',
  },

  // ── E: 의존성 (Dependence) ──
  {
    id: 'E_dep_1',
    text: '힘든 상황에서 다른 사람의 도움과 위로가 꼭 필요하다.',
    type: 'likert', facet: 'dependence', domain: 'E',
  },
  {
    id: 'E_dep_2',
    text: '혼자서 어려운 문제를 해결하는 것을 선호한다.',
    type: 'likert', facet: 'dependence', domain: 'E', reverse: true,
  },
  {
    id: 'E_dep_3',
    text: '정서적 지지 없이는 스트레스 상황을 헤쳐나가기 힘들다.',
    type: 'likert', facet: 'dependence', domain: 'E',
  },

  // ── E: 감상성 (Sentimentality) ──
  {
    id: 'E_sent_1',
    text: '영화나 소설 속 인물의 감정에 쉽게 이입되어 눈물이 나기도 한다.',
    type: 'likert', facet: 'sentimentality', domain: 'E',
  },
  {
    id: 'E_sent_2',
    text: '오래된 물건이나 장소에서 감정적인 연결을 강하게 느낀다.',
    type: 'likert', facet: 'sentimentality', domain: 'E',
  },
  {
    id: 'E_sent_3',
    text: '타인의 고통이나 슬픔에 깊이 공감하는 편이다.',
    type: 'likert', facet: 'sentimentality', domain: 'E',
  },

  // ── X: 사회적 자기존중 (Social Self-Esteem) ──
  {
    id: 'X_sse_1',
    text: '다른 사람들이 나를 어떻게 생각하는지에 대해 자신감이 있다.',
    type: 'likert', facet: 'social_self_esteem', domain: 'X',
  },
  {
    id: 'X_sse_2',
    text: '모임에서 내가 환영받지 못한다는 느낌이 들 때가 있다.',
    type: 'likert', facet: 'social_self_esteem', domain: 'X', reverse: true,
  },
  {
    id: 'X_sse_3',
    text: '처음 보는 사람들도 나를 좋아할 것이라고 생각한다.',
    type: 'likert', facet: 'social_self_esteem', domain: 'X',
  },

  // ── X: 사교성 (Sociability) ──
  {
    id: 'X_soc_1',
    text: '많은 사람들과 어울리는 활동이 즐겁고 에너지를 준다.',
    type: 'likert', facet: 'sociability', domain: 'X',
  },
  {
    id: 'X_soc_2',
    text: '파티나 모임보다 혼자 있는 시간이 더 편하고 즐겁다.',
    type: 'likert', facet: 'sociability', domain: 'X', reverse: true,
  },
  {
    id: 'X_soc_3',
    text: '아는 사람이 없는 모임에 참석하는 것이 즐겁다.',
    type: 'likert', facet: 'sociability', domain: 'X',
  },

  // ── X: 활력 (Liveliness) ──
  {
    id: 'X_liv_1',
    text: '기분이 자주 들뜨고 활기차게 느껴진다.',
    type: 'likert', facet: 'liveliness', domain: 'X',
  },
  {
    id: 'X_liv_2',
    text: '대부분의 날들이 무기력하거나 평범하게 느껴진다.',
    type: 'likert', facet: 'liveliness', domain: 'X', reverse: true,
  },

  // ── A: 용서 (Forgiveness) ──
  {
    id: 'A_for_1',
    text: '나에게 잘못한 사람을 쉽게 용서하는 편이다.',
    type: 'likert', facet: 'forgiveness', domain: 'A',
  },
  {
    id: 'A_for_2',
    text: '한번 신뢰를 깬 사람은 다시 신뢰하기가 매우 어렵다.',
    type: 'likert', facet: 'forgiveness', domain: 'A', reverse: true,
  },
  {
    id: 'A_for_3',
    text: '복수보다 용서가 더 현명하다고 진심으로 생각한다.',
    type: 'likert', facet: 'forgiveness', domain: 'A',
  },

  // ── A: 온화함 (Gentleness) ──
  {
    id: 'A_gen_1',
    text: '다른 사람을 비판할 때 직접적이기보다 완곡하게 표현하는 편이다.',
    type: 'likert', facet: 'gentleness', domain: 'A',
  },
  {
    id: 'A_gen_2',
    text: '타인의 결점이나 실수를 직접적으로 지적하는 것을 주저하지 않는다.',
    type: 'likert', facet: 'gentleness', domain: 'A', reverse: true,
  },
  {
    id: 'A_gen_3',
    text: '갈등 상황에서 목소리를 높이거나 강하게 나가는 것을 피한다.',
    type: 'likert', facet: 'gentleness', domain: 'A',
  },

  // ── A: 유연성 (Flexibility) ──
  {
    id: 'A_flex_1',
    text: '내가 틀렸다는 것을 알게 되면 쉽게 입장을 바꾼다.',
    type: 'likert', facet: 'flexibility', domain: 'A',
  },
  {
    id: 'A_flex_2',
    text: '논쟁에서 상대의 주장이 타당해도 내 입장을 쉽게 바꾸지 않는다.',
    type: 'likert', facet: 'flexibility', domain: 'A', reverse: true,
  },
  {
    id: 'A_flex_3',
    text: '타협점을 찾는 것이 자신의 입장을 고수하는 것보다 더 중요하다.',
    type: 'likert', facet: 'flexibility', domain: 'A',
  },

  // ── C: 조직화 (Organization) ──
  {
    id: 'C_org_1',
    text: '내 물건과 공간은 항상 정돈된 상태를 유지한다.',
    type: 'likert', facet: 'organization', domain: 'C',
  },
  {
    id: 'C_org_2',
    text: '정리정돈이 안 된 환경에서도 집중력이 크게 영향받지 않는다.',
    type: 'likert', facet: 'organization', domain: 'C', reverse: true,
  },
  {
    id: 'C_org_3',
    text: '약속, 일정, 할 일 목록을 체계적으로 관리한다.',
    type: 'likert', facet: 'organization', domain: 'C',
  },

  // ── C: 완벽주의 (Perfectionism) ──
  {
    id: 'C_perf_1',
    text: '작업을 완성할 때 작은 오류나 불완전함도 그냥 넘기기 어렵다.',
    type: 'likert', facet: 'perfectionism', domain: 'C',
  },
  {
    id: 'C_perf_2',
    text: '"충분히 좋으면 충분하다"는 생각으로 작업을 마무리할 수 있다.',
    type: 'likert', facet: 'perfectionism', domain: 'C', reverse: true,
  },
  {
    id: 'C_perf_3',
    text: '제출한 결과물의 작은 실수가 나중에도 계속 신경 쓰인다.',
    type: 'likert', facet: 'perfectionism', domain: 'C',
  },

  // ── C: 신중성 (Prudence) ──
  {
    id: 'C_pru_1',
    text: '중요한 결정을 내리기 전에 충분히 생각하고 계획을 세운다.',
    type: 'likert', facet: 'prudence', domain: 'C',
  },
  {
    id: 'C_pru_2',
    text: '일단 시작하고 문제가 생기면 그때 해결하는 편이다.',
    type: 'likert', facet: 'prudence', domain: 'C', reverse: true,
  },
  {
    id: 'C_pru_3',
    text: '충동적인 결정으로 나중에 후회한 경험이 자주 있다.',
    type: 'likert', facet: 'prudence', domain: 'C', reverse: true,
  },

  // ── O: 심미적 감수성 (Aesthetic Appreciation) ──
  {
    id: 'O_aes_1',
    text: '음악, 미술, 문학 작품에서 깊은 감동을 자주 경험한다.',
    type: 'likert', facet: 'aesthetic', domain: 'O',
  },
  {
    id: 'O_aes_2',
    text: '예술 작품을 감상하는 데 시간과 에너지를 쓰는 것이 가치 있다.',
    type: 'likert', facet: 'aesthetic', domain: 'O',
  },
  {
    id: 'O_aes_3',
    text: '예술이나 미적인 것에 특별한 관심이 없다.',
    type: 'likert', facet: 'aesthetic', domain: 'O', reverse: true,
  },

  // ── O: 창의성 (Creativity) ──
  {
    id: 'O_cre_1',
    text: '일상적인 문제를 남들과 다른 방식으로 해결하는 편이다.',
    type: 'likert', facet: 'creativity', domain: 'O',
  },
  {
    id: 'O_cre_2',
    text: '새로운 아이디어나 방법을 떠올리는 것이 자연스럽고 즐겁다.',
    type: 'likert', facet: 'creativity', domain: 'O',
  },
  {
    id: 'O_cre_3',
    text: '창의성보다 검증된 방법을 따르는 것이 더 안전하다고 생각한다.',
    type: 'likert', facet: 'creativity', domain: 'O', reverse: true,
  },

  // ── O: 비관습성 (Unconventionality) ──
  {
    id: 'O_unc_1',
    text: '사회 통념이나 일반적인 기대와 다른 방식으로 살고 싶다.',
    type: 'likert', facet: 'unconventionality', domain: 'O',
  },
  {
    id: 'O_unc_2',
    text: '비주류적이거나 실험적인 아이디어에 흥미를 느낀다.',
    type: 'likert', facet: 'unconventionality', domain: 'O',
  },
  {
    id: 'O_unc_3',
    text: '기존 질서와 전통을 따르는 것이 편안하게 느껴진다.',
    type: 'likert', facet: 'unconventionality', domain: 'O', reverse: true,
  },

  // ══════════════════════════════════════════════════════════════
  // TCI 기질 레이어 (20문항)
  // ══════════════════════════════════════════════════════════════

  // ── NS: 탐색적 흥분 (Exploratory Excitement) ──
  {
    id: 'NS_exp_1',
    text: '새로운 장소, 사람, 경험을 찾아다니는 것이 즐겁다.',
    type: 'likert', facet: 'NS_exploratory', domain: 'TCI',
  },
  {
    id: 'NS_exp_2',
    text: '익숙한 루틴보다 예상치 못한 상황이 더 재미있다.',
    type: 'likert', facet: 'NS_exploratory', domain: 'TCI',
  },
  {
    id: 'NS_exp_3',
    text: '새로운 것을 시작하는 것보다 하던 것을 계속하는 것이 편하다.',
    type: 'likert', facet: 'NS_exploratory', domain: 'TCI', reverse: true,
  },

  // ── NS: 충동성 (Impulsivity) ──
  {
    id: 'NS_imp_1',
    text: '좋은 기회가 생기면 깊이 생각하기 전에 먼저 행동한다.',
    type: 'likert', facet: 'NS_impulsivity', domain: 'TCI',
  },
  {
    id: 'NS_imp_2',
    text: '흥미로운 것이 생기면 하던 일을 멈추고 그쪽으로 전환하기 쉽다.',
    type: 'likert', facet: 'NS_impulsivity', domain: 'TCI',
  },
  {
    id: 'NS_imp_3',
    text: '충동적인 결정보다 신중한 계획을 훨씬 선호한다.',
    type: 'likert', facet: 'NS_impulsivity', domain: 'TCI', reverse: true,
  },

  // ── NS: 규칙 회피 (Rule Avoidance) ──
  {
    id: 'NS_rule_1',
    text: '불합리하다고 생각하는 규칙은 따르지 않아도 된다고 생각한다.',
    type: 'likert', facet: 'NS_rule_avoidance', domain: 'TCI',
  },
  {
    id: 'NS_rule_2',
    text: '권위나 위계 구조에 자연스럽게 따르는 편이다.',
    type: 'likert', facet: 'NS_rule_avoidance', domain: 'TCI', reverse: true,
  },

  // ── HA: 예기 불안 (Anticipatory Worry) ──
  {
    id: 'HA_anx_1',
    text: '앞으로 일어날 수 있는 나쁜 일들을 미리 걱정하는 편이다.',
    type: 'likert', facet: 'HA_anticipatory', domain: 'TCI',
  },
  {
    id: 'HA_anx_2',
    text: '미래에 대해 걱정보다는 기대가 앞서는 편이다.',
    type: 'likert', facet: 'HA_anticipatory', domain: 'TCI', reverse: true,
  },
  {
    id: 'HA_anx_3',
    text: '잘 되고 있을 때도 "뭔가 잘못될 것 같다"는 느낌이 드는 경우가 있다.',
    type: 'likert', facet: 'HA_anticipatory', domain: 'TCI',
  },

  // ── HA: 불확실성 두려움 ──
  {
    id: 'HA_unc_1',
    text: '결과가 불분명한 상황은 스트레스를 준다.',
    type: 'likert', facet: 'HA_uncertainty', domain: 'TCI',
  },
  {
    id: 'HA_unc_2',
    text: '정보가 충분하지 않아도 결정을 내리는 것에 불편함이 없다.',
    type: 'likert', facet: 'HA_uncertainty', domain: 'TCI', reverse: true,
  },

  // ── RD: 온기/따뜻함 (Warmth) ──
  {
    id: 'RD_warm_1',
    text: '처음 만나는 사람에게도 따뜻하고 친근하게 대하는 편이다.',
    type: 'likert', facet: 'RD_warmth', domain: 'TCI',
  },
  {
    id: 'RD_warm_2',
    text: '타인의 감정 상태에 민감하게 반응하고 공감하는 편이다.',
    type: 'likert', facet: 'RD_warmth', domain: 'TCI',
  },
  {
    id: 'RD_warm_3',
    text: '다른 사람의 감정적인 문제는 그 사람이 스스로 해결해야 한다고 생각한다.',
    type: 'likert', facet: 'RD_warmth', domain: 'TCI', reverse: true,
  },

  // ── RD: 사회적 민감성 ──
  {
    id: 'RD_sens_1',
    text: '다른 사람에게 거절당하거나 비판받을 때 감정적으로 크게 영향받는다.',
    type: 'likert', facet: 'RD_social_sensitivity', domain: 'TCI',
  },
  {
    id: 'RD_sens_2',
    text: '타인의 평가나 반응에 비교적 영향을 적게 받는다.',
    type: 'likert', facet: 'RD_social_sensitivity', domain: 'TCI', reverse: true,
  },

  // ── P: 야망/인내 (Persistence) ──
  {
    id: 'P_amb_1',
    text: '한번 시작한 것은 어떤 어려움이 있어도 끝까지 해내려 한다.',
    type: 'likert', facet: 'P_persistence', domain: 'TCI',
  },
  {
    id: 'P_amb_2',
    text: '장기 목표를 위해 단기적인 즐거움을 미루는 것에 익숙하다.',
    type: 'likert', facet: 'P_persistence', domain: 'TCI',
  },
  {
    id: 'P_amb_3',
    text: '목표를 이루지 못할 것 같으면 일찍 포기하고 다른 것을 찾는 편이다.',
    type: 'likert', facet: 'P_persistence', domain: 'TCI', reverse: true,
  },

  // ══════════════════════════════════════════════════════════════
  // 인지 심화 (10문항)
  // ══════════════════════════════════════════════════════════════

  // 공간 추론
  {
    id: 'COG_sp_1',
    text: '아래 숫자 중 나머지 셋과 관계가 다른 하나는?\n8, 27, 64, 100',
    type: 'cognitive', facet: 'fluid', domain: 'COG',
    correctAnswer: 'D',
    options: [
      { label: '8 (2³)', value: 'A' },
      { label: '27 (3³)', value: 'B' },
      { label: '64 (4³)', value: 'C' },
      { label: '100 (10²)', value: 'D' },
    ],
  },

  // 귀납 추론
  {
    id: 'COG_ind_1',
    text: '모든 장미는 꽃이다. 일부 꽃은 향기롭다.\n다음 중 반드시 참인 것은?',
    type: 'cognitive', facet: 'fluid', domain: 'COG',
    correctAnswer: 'C',
    options: [
      { label: '모든 장미는 향기롭다', value: 'A' },
      { label: '향기로운 것은 모두 장미다', value: 'B' },
      { label: '일부 장미는 향기로울 수 있다', value: 'C' },
      { label: '향기로운 것은 꽃이 아니다', value: 'D' },
    ],
  },

  // 수열 고급
  {
    id: 'COG_seq_2',
    text: '빈칸에 들어갈 숫자는?\n2, 3, 5, 8, 13, 21, [ ]',
    type: 'cognitive', facet: 'fluid', domain: 'COG',
    correctAnswer: 'B',
    options: [
      { label: '30', value: 'A' },
      { label: '34', value: 'B' },
      { label: '29', value: 'C' },
      { label: '32', value: 'D' },
    ],
  },

  // 언어 유추 고급
  {
    id: 'COG_verb_2',
    text: '교향곡 : 악장 = 소설 : ?',
    type: 'cognitive', facet: 'verbal', domain: 'COG',
    correctAnswer: 'B',
    options: [
      { label: '작가', value: 'A' },
      { label: '챕터', value: 'B' },
      { label: '독자', value: 'C' },
      { label: '출판사', value: 'D' },
    ],
  },

  // 작업기억 고급
  {
    id: 'COG_mem_2',
    text: '다음을 읽고 답하세요:\n"A는 B보다 크고, C는 A보다 크다. D는 B보다 작다."\n가장 큰 것은?',
    type: 'cognitive', facet: 'memory', domain: 'COG',
    correctAnswer: 'C',
    options: [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
      { label: 'C', value: 'C' },
      { label: 'D', value: 'D' },
    ],
  },

  // 논리 추론 고급
  {
    id: 'COG_log_2',
    text: '"비가 오면 땅이 젖는다. 땅이 젖어 있다."\n이로부터 확실히 알 수 있는 것은?',
    type: 'cognitive', facet: 'fluid', domain: 'COG',
    correctAnswer: 'D',
    options: [
      { label: '비가 왔다', value: 'A' },
      { label: '비가 오지 않았다', value: 'B' },
      { label: '항상 비가 오면 땅이 젖는다', value: 'C' },
      { label: '땅이 젖는 원인이 비가 아닐 수도 있다', value: 'D' },
    ],
  },

  // 처리속도 대리 — 규칙 적용 속도
  {
    id: 'COG_rule_1',
    text: '다음 규칙을 적용하세요:\n짝수→÷2, 홀수→×3+1\n\n6 → 3 → ? 에 들어갈 값은?',
    type: 'cognitive', facet: 'fluid', domain: 'COG',
    correctAnswer: 'B',
    options: [
      { label: '9', value: 'A' },
      { label: '10', value: 'B' },
      { label: '6', value: 'C' },
      { label: '4', value: 'D' },
    ],
  },

  // 언어 이해 — 의미 추론
  {
    id: 'COG_mean_1',
    text: '"수박 겉 핥기"와 가장 비슷한 의미를 가진 표현은?',
    type: 'cognitive', facet: 'verbal', domain: 'COG',
    correctAnswer: 'A',
    options: [
      { label: '피상적 이해에 그침', value: 'A' },
      { label: '철저한 분석', value: 'B' },
      { label: '예상 밖의 결과', value: 'C' },
      { label: '빠른 해결', value: 'D' },
    ],
  },

  // 공간 추론 텍스트형
  {
    id: 'COG_sp_2',
    text: '정육면체의 꼭짓점(모서리가 만나는 점)의 수는?',
    type: 'cognitive', facet: 'spatial', domain: 'COG',
    correctAnswer: 'C',
    options: [
      { label: '4개', value: 'A' },
      { label: '6개', value: 'B' },
      { label: '8개', value: 'C' },
      { label: '12개', value: 'D' },
    ],
  },

  // 추상 추론
  {
    id: 'COG_abs_1',
    text: '"의사에게 사과를 하루 한 개씩 먹으면 의사가 필요 없다."\n이 말의 논리적 구조와 가장 유사한 것은?',
    type: 'cognitive', facet: 'verbal', domain: 'COG',
    correctAnswer: 'B',
    options: [
      { label: '의사는 사과를 좋아한다', value: 'A' },
      { label: '꾸준한 예방이 치료를 불필요하게 만든다', value: 'B' },
      { label: '과일을 많이 먹으면 건강해진다', value: 'C' },
      { label: '의사에게 가지 않아도 된다', value: 'D' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // 동기/가치관 (6문항)
  // ══════════════════════════════════════════════════════════════

  {
    id: 'MOT_int_1',
    text: '보상이나 인정이 없어도 그 일 자체가 재미있어서 하는 활동이 있다.',
    type: 'likert', facet: 'intrinsic_motivation', domain: 'MOT',
  },
  {
    id: 'MOT_int_2',
    text: '누군가 지켜보거나 평가하지 않으면 동기가 크게 줄어든다.',
    type: 'likert', facet: 'intrinsic_motivation', domain: 'MOT', reverse: true,
  },
  {
    id: 'MOT_comp_1',
    text: '다른 사람을 이기거나 앞서는 것이 나를 더 열심히 하게 만든다.',
    type: 'likert', facet: 'competitive', domain: 'MOT',
  },
  {
    id: 'MOT_comp_2',
    text: '협력해서 모두 잘 되는 것이 혼자 이기는 것보다 더 만족스럽다.',
    type: 'likert', facet: 'competitive', domain: 'MOT', reverse: true,
  },
  {
    id: 'MOT_mas_1',
    text: '결과보다 실력이 느는 과정 자체에서 보람을 느낀다.',
    type: 'likert', facet: 'mastery_orientation', domain: 'MOT',
  },
  {
    id: 'MOT_mas_2',
    text: '좋은 결과를 얻는 것이 실력이 느는 것보다 더 중요하다.',
    type: 'likert', facet: 'mastery_orientation', domain: 'MOT', reverse: true,
  },

  // ══════════════════════════════════════════════════════════════
  // 스트레스 반응 유형 (4문항)
  // ══════════════════════════════════════════════════════════════

  {
    id: 'STR_type',
    text: '큰 스트레스를 받을 때 나의 주된 반응은?',
    type: 'choice', facet: 'stress_response', domain: 'STR',
    options: [
      { label: '혼자 틀어박혀서 생각하거나 거리를 둔다', value: 'avoidance' },
      { label: '문제를 정면으로 해결하려 달려든다', value: 'approach' },
      { label: '주변 사람들에게 털어놓고 위로를 구한다', value: 'social_support' },
      { label: '그 생각이 계속 머릿속을 맴돈다', value: 'rumination' },
    ],
  },
  {
    id: 'STR_rec_1',
    text: '스트레스에서 회복되는 데 얼마나 걸리는 편인가요?',
    type: 'choice', facet: 'stress_recovery', domain: 'STR',
    options: [
      { label: '몇 시간 이내', value: 'fast' },
      { label: '하루 이틀', value: 'medium' },
      { label: '일주일 이상', value: 'slow' },
      { label: '잘 회복이 안 되는 편', value: 'very_slow' },
    ],
  },
  {
    id: 'STR_tri_1',
    text: '나를 가장 강하게 무너뜨리는 스트레스 원인은?',
    type: 'choice', facet: 'stress_trigger', domain: 'STR',
    options: [
      { label: '관계 갈등이나 거절', value: 'relationship' },
      { label: '성과 실패나 평가', value: 'performance' },
      { label: '불확실성과 통제 불가 상황', value: 'uncertainty' },
      { label: '과부하와 시간 압박', value: 'overload' },
    ],
  },
  {
    id: 'STR_cop_1',
    text: '스트레스를 해소하는 가장 효과적인 방법은?',
    type: 'choice', facet: 'stress_coping', domain: 'STR',
    options: [
      { label: '운동이나 신체 활동', value: 'physical' },
      { label: '창작이나 취미 활동', value: 'creative' },
      { label: '대화나 사회적 연결', value: 'social' },
      { label: '혼자 조용히 쉬는 것', value: 'solitude' },
    ],
  },
]
