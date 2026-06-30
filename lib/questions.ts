import { Question } from '@/types'

// ══════════════════════════════════════════════════════════════════
// 42문항 배치 원칙
//  · 동일 facet 연속 배치 금지 (절대 규칙)
//  · 동일 facet 최소 3문항 이상 간격
//  · 역문항(QR)↔정문항 최소 7문항 이상 간격
//  · 역문항 6개 (QR1~QR6): facet당 1개, 높은 trait → 마지막 옵션
// ══════════════════════════════════════════════════════════════════

export const SAMPLE_QUESTIONS: Question[] = [

  // ══════════════════════════════════════════════════════
  // SECTION 1 — 세계와의 인터페이스 (9문항)
  // boldness·curiosity·anxiety·diligence·patience·humility
  // + QR1(boldness_r) · QR2(diligence_r)
  // ══════════════════════════════════════════════════════

  {
    id: 'Q1',
    text: '오래된 친구가 파티에 데려갔습니다.\n아는 사람이 한 명도 없습니다.\n한 시간 후 당신은:',
    type: 'choice',
    facet: 'boldness',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '새로운 사람 2~3명과 깊은 대화를 나누고 있다', value: 'A' },
      { label: '친구 곁에서 그의 대화에 자연스럽게 섞여 있다', value: 'B' },
      { label: '적당히 어울리되, 조용히 분위기를 관찰하고 있다', value: 'C' },
      { label: '솔직히 빨리 끝나길 기다리고 있다', value: 'D' },
    ],
  },

  {
    id: 'Q3',
    text: '서점에서 고를 시간이 딱 5분입니다.\n당신이 손에 드는 책은:',
    type: 'choice',
    facet: 'curiosity',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '제목부터 낯선, 전혀 몰랐던 분야의 책', value: 'A' },
      { label: '관심 있는 분야를 더 깊이 파고드는 책', value: 'B' },
      { label: '전에 재미있게 읽은 작가의 신작', value: 'C' },
    ],
  },

  {
    id: 'Q5',
    text: '중요한 결정을 내린 후 당신은:',
    type: 'choice',
    facet: 'anxiety',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '결정했으면 끝. 되돌아보는 건 낭비다', value: 'A' },
      { label: '가끔 떠오르지만 크게 흔들리지 않는다', value: 'B' },
      { label: '며칠 동안 다른 선택지가 머릿속을 맴돈다', value: 'C' },
    ],
  },

  {
    id: 'Q2',
    text: '주말에 갑자기 해야 할 일이 생겼습니다.\n당신의 첫 반응은:',
    type: 'choice',
    facet: 'diligence',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '바로 언제 할지 정하고 머릿속에서 지운다', value: 'A' },
      { label: '생각은 하지만 지금 당장 계획 세우진 않는다', value: 'B' },
      { label: '될 대로 되겠지 하고 잊어버린다', value: 'C' },
    ],
  },

  {
    id: 'Q4',
    text: '친한 친구가 솔직한 피드백을 부탁합니다.\n그 피드백이 그를 불편하게 할 것을 알 때:',
    type: 'choice',
    facet: 'patience',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '말한다. 관계보다 그의 성장이 중요하다', value: 'A' },
      { label: '부드럽게 포장해서 말한다', value: 'B' },
      { label: '기회를 보다가 결국 말 못 한다', value: 'C' },
    ],
  },

  {
    id: 'Q7',
    text: '내가 한 일이 좋은 평가를 받았습니다.\n주변에 어떻게 이야기하나요?',
    type: 'choice',
    facet: 'humility',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '먼저 언급하지 않는다. 물어보면 담담하게 말한다', value: 'A' },
      { label: '가까운 사람에게는 기쁘게 공유한다', value: 'B' },
      { label: '적극적으로 알린다. 내 노력의 결과니까', value: 'C' },
    ],
  },

  {
    id: 'Q6',
    text: '중요한 발표를 앞두고 며칠 전부터\n당신의 상태는 어떤가요?',
    type: 'choice',
    facet: 'anxiety',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: '별로 신경 쓰이지 않는다. 그때 가서 하면 된다', value: 'A' },
      { label: '약간 긴장되지만 오히려 집중이 잘 된다', value: 'B' },
      { label: '잠이 잘 안 오거나 계속 시뮬레이션을 돌린다', value: 'C' },
    ],
  },

  // ── 역문항 ──────────────────────────────────────────────────────
  {
    id: 'QR1',
    text: '아무 계획이 없는 토요일 오전입니다.\n당신에게 가장 자연스러운 것은:',
    type: 'choice',
    facet: 'boldness',
    domain: 'BIG5',
    section: 'world',
    reverse: true,
    options: [
      { label: '집에서 혼자 책 읽거나 영상 보며 쉰다', value: 'A' },
      { label: '연락이 오면 나가고, 없으면 집에 있는다', value: 'B' },
      { label: '먼저 누군가에게 연락해 약속을 잡는다', value: 'C' },
    ],
  },

  {
    id: 'QR2',
    text: '별로 하기 싫은 과제가 있습니다.\n마감은 3일 후입니다. 오늘 당신은:',
    type: 'choice',
    facet: 'diligence',
    domain: 'BIG5',
    section: 'world',
    reverse: true,
    options: [
      { label: '기분 날 때 몰아서 하면 된다고 생각하며 미룬다', value: 'A' },
      { label: '조금씩은 하되 억지로 밀어붙이지 않는다', value: 'B' },
      { label: '기분이 어떻든 오늘 분량은 해둔다', value: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SECTION 2 — 결정의 아키텍처 (9문항)
  // regulatory_focus · locus_of_control · humility
  // curiosity × 2 · diligence × 2 · anxiety · patience_r(QR4)
  // ══════════════════════════════════════════════════════

  {
    id: 'Q8',
    text: '새로운 프로젝트를 시작할 때,\n머릿속에서 더 크게 울리는 목소리는:',
    type: 'choice',
    facet: 'regulatory_focus',
    domain: 'DRIVE',
    section: 'decision',
    options: [
      { label: '"이게 성공하면 어떤 가능성이 열릴까?"', value: 'A' },
      { label: '"뭘 조심해야 실패를 피할 수 있을까?"', value: 'B' },
    ],
  },

  {
    id: 'Q10',
    text: '일이 잘못됐을 때\n당신이 가장 먼저 떠올리는 생각은:',
    type: 'choice',
    facet: 'locus_of_control',
    domain: 'DRIVE',
    section: 'decision',
    options: [
      { label: '"내가 뭘 다르게 했어야 했나"', value: 'A' },
      { label: '"상황이 안 좋았다"', value: 'B' },
      { label: '내 탓과 상황 탓이 동시에 온다', value: 'C' },
    ],
  },

  {
    id: 'Q11',
    text: '당신보다 실력이 낮다고 느껴지는 사람과\n팀이 됐습니다. 솔직한 첫 감정은:',
    type: 'choice',
    facet: 'humility',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: '내가 더 많이 해야 한다는 부담', value: 'A' },
      { label: '내가 도움이 될 수 있겠다는 생각', value: 'B' },
      { label: '역할을 명확히 나누면 된다는 실용적 판단', value: 'C' },
    ],
  },

  {
    id: 'Q13',
    text: '선택할 수 있다면:',
    type: 'choice',
    facet: 'curiosity',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: '예측 가능하고 안정적인 삶', value: 'A' },
      { label: '불확실하지만 강렬한 경험이 있는 삶', value: 'B' },
      { label: '두 가지를 번갈아 가며 사는 삶', value: 'C' },
    ],
  },

  {
    id: 'Q12',
    text: '마감이 촉박한 상황에서\n품질과 속도 사이 선택:',
    type: 'choice',
    facet: 'diligence',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: '완성도가 낮아도 제때 낸다', value: 'A' },
      { label: '늦더라도 완성도를 높인다', value: 'B' },
      { label: '상황에 따라 다르다', value: 'C' },
    ],
  },

  {
    id: 'Q15',
    text: '예상치 못한 나쁜 소식을 들었을 때\n당신의 첫 반응은:',
    type: 'choice',
    facet: 'anxiety',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: '곧 괜찮아질 거라 생각하고 빠르게 전환한다', value: 'A' },
      { label: '잠깐 충격이 오지만 상황을 파악하려 한다', value: 'B' },
      { label: '머릿속에서 최악의 시나리오들이 줄지어 펼쳐진다', value: 'C' },
    ],
  },

  {
    id: 'Q14',
    text: '당신의 삶에서 "옳은 것"의 기준은 주로:',
    type: 'choice',
    facet: 'curiosity',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: '사회가 오랫동안 지켜온 원칙', value: 'A' },
      { label: '내가 직접 경험하고 검증한 것', value: 'B' },
      { label: '논리적으로 납득이 되는 것', value: 'C' },
    ],
  },

  // ── 역문항 ──────────────────────────────────────────────────────
  {
    id: 'QR4',
    text: '회의에서 모두가 동의하는 방향이지만\n당신이 보기엔 분명히 잘못됐습니다. 당신은:',
    type: 'choice',
    facet: 'patience',
    domain: 'BIG5',
    section: 'decision',
    reverse: true,
    options: [
      { label: '분위기를 깨더라도 반대 의견을 분명히 낸다', value: 'A' },
      { label: '회의 후 따로 관련자에게 조용히 말한다', value: 'B' },
      { label: '팀의 결정이니 일단 따른다. 반대해도 바꾸기 어렵다', value: 'C' },
    ],
  },

  {
    id: 'Q9',
    text: '여행을 계획한다면:',
    type: 'choice',
    facet: 'diligence',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: '숙소·교통·식당까지 미리 정해두어야 마음이 편하다', value: 'A' },
      { label: '큰 틀만 잡고 현지에서 즉흥적으로 채운다', value: 'B' },
      { label: '그냥 간다. 어떻게든 된다', value: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SECTION 3 — 관계의 역학 (13문항)
  // boldness × 3 · patience × 3 · humility × 2 · anxiety × 1
  // curiosity × 1 · QR3(curiosity_r) · QR5(anxiety_r) · QR6(humility_r)
  // ══════════════════════════════════════════════════════

  {
    id: 'Q17',
    text: '긴 모임이나 사교 행사 후 당신은:',
    type: 'choice',
    facet: 'boldness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '에너지가 오히려 충전된 느낌', value: 'A' },
      { label: '즐거웠지만 이제 혼자 있는 시간이 필요하다', value: 'B' },
      { label: '꽤 소진된 느낌. 회복에 시간이 걸린다', value: 'C' },
    ],
  },

  // ── 역문항 ──────────────────────────────────────────────────────
  {
    id: 'QR5',
    text: '예상치 못한 좋은 소식이 갑자기 생겼습니다.\n당신의 첫 반응은:',
    type: 'choice',
    facet: 'anxiety',
    domain: 'BIG5',
    section: 'relation',
    reverse: true,
    options: [
      { label: '그냥 좋다. 기쁘게 받아들인다', value: 'A' },
      { label: '기쁘지만 혹시 확인해볼 게 있지 않을까 한다', value: 'B' },
      { label: '기쁘면서도 "이 다음에 뭔가 문제가 생기는 건 아닐까" 싶다', value: 'C' },
    ],
  },

  {
    id: 'Q16',
    text: '의견 충돌이 생겼을 때 당신은:',
    type: 'choice',
    facet: 'patience',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '내 입장을 명확히 말하고 상대를 설득하려 한다', value: 'A' },
      { label: '타협점을 먼저 찾으려 한다', value: 'B' },
      { label: '갈등 자체가 불편해서 한 발 물러선다', value: 'C' },
    ],
  },

  // ── 역문항 ──────────────────────────────────────────────────────
  {
    id: 'QR6',
    text: '팀 프로젝트 후 상사가 "누가 이 결과를 이끌었나요?"라고 묻습니다.\n사실 당신이 가장 많이 기여했습니다. 당신은:',
    type: 'choice',
    facet: 'humility',
    domain: 'BIG5',
    section: 'relation',
    reverse: true,
    options: [
      { label: '"제가 핵심적인 역할을 했습니다"', value: 'A' },
      { label: '"저를 포함해 팀 모두의 기여입니다"', value: 'B' },
      { label: '"팀원들 덕분입니다. 저는 도왔을 뿐이에요"', value: 'C' },
    ],
  },

  {
    id: 'Q19',
    text: '가까운 사람이 분명히 잘못된 선택을 하려 합니다.\n당신은:',
    type: 'choice',
    facet: 'patience',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '물어보지 않아도 분명히 말한다', value: 'A' },
      { label: '물어볼 때만 말한다. 그의 선택을 존중한다', value: 'B' },
      { label: '말하고 싶지만 관계가 상할까봐 참는다', value: 'C' },
    ],
  },

  {
    id: 'Q22',
    text: '그룹에서 명확한 리더가 없을 때 당신은:',
    type: 'choice',
    facet: 'boldness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '자연스럽게 방향을 제시하게 된다', value: 'A' },
      { label: '누군가 나서길 기다린다', value: 'B' },
      { label: '필요하다고 느끼면 나서지만 선호하진 않는다', value: 'C' },
    ],
  },

  {
    id: 'Q18',
    text: '성과를 냈을 때 당신이 더 원하는 것은:',
    type: 'choice',
    facet: 'humility',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '주변이 알아봐주는 것', value: 'A' },
      { label: '나 스스로 만족하는 것', value: 'B' },
      { label: '솔직히 둘 다 원한다', value: 'C' },
    ],
  },

  {
    id: 'Q21',
    text: '나와 전혀 다른 가치관을 가진 사람을 만났을 때:',
    type: 'choice',
    facet: 'curiosity',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '오히려 대화가 더 재미있다', value: 'A' },
      { label: '불편하지만 들어볼 수는 있다', value: 'B' },
      { label: '피로하다. 설득하거나 설득당하고 싶지 않다', value: 'C' },
    ],
  },

  {
    id: 'Q23',
    text: '처음 만난 사람과 엘리베이터에서\n30초를 함께해야 합니다. 당신은:',
    type: 'choice',
    facet: 'boldness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '자연스럽게 말을 건다', value: 'A' },
      { label: '상대가 먼저 말하면 받아서 이어간다', value: 'B' },
      { label: '핸드폰을 보거나 조용히 있는다', value: 'C' },
    ],
  },

  {
    id: 'Q24',
    text: '팀 프로젝트에서 내 아이디어가\n채택되지 않았습니다. 당신은:',
    type: 'choice',
    facet: 'humility',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '팀의 결정을 존중하고 최선을 다해 협력한다', value: 'A' },
      { label: '왜 채택 안 됐는지 이해하려 한다', value: 'B' },
      { label: '내 아이디어가 더 낫다는 확신이 있으면 계속 주장한다', value: 'C' },
    ],
  },

  // ── 역문항 ──────────────────────────────────────────────────────
  {
    id: 'QR3',
    text: '자주 쓰던 앱이 대대적으로 개편돼\n인터페이스가 완전히 바뀌었습니다. 당신은:',
    type: 'choice',
    facet: 'curiosity',
    domain: 'BIG5',
    section: 'relation',
    reverse: true,
    options: [
      { label: '익숙한 게 더 좋았는데, 왜 바꿨지 싶다', value: 'A' },
      { label: '어쩔 수 없다. 쓰다 보면 익숙해지겠지', value: 'B' },
      { label: '어떻게 달라졌는지 바로 탐색해본다', value: 'C' },
    ],
  },

  {
    id: 'Q20',
    text: '처음 보는 여러 사람 앞에서 발표를 마쳤습니다.\n그날 밤 당신은:',
    type: 'choice',
    facet: 'anxiety',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '잘 됐든 못 됐든 별로 생각 안 한다', value: 'A' },
      { label: '잘한 부분보다 아쉬운 부분이 계속 떠오른다', value: 'B' },
      { label: '잘 됐으면 뿌듯, 못 됐으면 며칠은 간다', value: 'C' },
    ],
  },

  {
    id: 'Q25',
    text: '상대방이 같은 실수를 세 번째 반복했습니다.\n당신의 반응은:',
    type: 'choice',
    facet: 'patience',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: '침착하게 다시 한번 짚어준다', value: 'A' },
      { label: '짜증이 나지만 표현하지 않으려 한다', value: 'B' },
      { label: '솔직하게 답답함을 표현한다', value: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SECTION 4 — 사고의 구조 (Q26~Q31)
  // ══════════════════════════════════════════════════════

  {
    id: 'Q26',
    text: '중요한 결정을 앞두고\n당신이 더 신뢰하는 것은:',
    type: 'choice',
    facet: 'cog_mode',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '데이터와 논리적 분석', value: 'A' },
      { label: '설명하기 어렵지만 강한 직관', value: 'B' },
      { label: '분석을 하되 마지막은 직관으로', value: 'C' },
    ],
  },

  {
    id: 'Q27',
    text: '오래 믿어온 생각이 틀렸다는 증거를 봤습니다.\n당신의 반응은:',
    type: 'choice',
    facet: 'cog_flex',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '즉시 생각을 바꾼다. 증거가 충분하면 됐다', value: 'A' },
      { label: '납득할 때까지 더 많은 근거가 필요하다', value: 'B' },
      { label: '머리로는 인정하지만 감정은 저항한다', value: 'C' },
    ],
  },

  {
    id: 'Q28',
    text: '새로운 아이디어를 들었을 때\n당신이 먼저 묻는 것은:',
    type: 'choice',
    facet: 'cog_abstract',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '"그게 실제로 어떻게 작동해?"', value: 'A' },
      { label: '"그 아이디어의 핵심 원리가 뭐야?"', value: 'B' },
      { label: '"비슷하게 한 사례가 있어?"', value: 'C' },
    ],
  },

  {
    id: 'Q29',
    text: '정답이 없는 복잡한 문제를 만났을 때:',
    type: 'choice',
    facet: 'cog_depth',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '오히려 몰두한다. 퍼즐 같아서 재미있다', value: 'A' },
      { label: '답이 없으면 에너지 낭비라고 느낀다', value: 'B' },
      { label: '어느 선까지는 생각하고 그 이상은 내려놓는다', value: 'C' },
    ],
  },

  {
    id: 'Q30',
    text: '당신의 에너지가 가장 많이 향하는 시간적 방향은:',
    type: 'choice',
    facet: 'time_orientation',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '지금 이 순간을 충분히 경험하는 것', value: 'A' },
      { label: '미래를 설계하고 준비하는 것', value: 'B' },
      { label: '과거에서 패턴을 찾고 교훈을 얻는 것', value: 'C' },
    ],
  },

  {
    id: 'Q31',
    text: '복잡한 상황을 이해할 때\n더 자연스럽게 하는 것은:',
    type: 'choice',
    facet: 'cog_style',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '전체 구조와 패턴을 먼저 파악한다', value: 'A' },
      { label: '세부 요소부터 하나씩 이해해 나간다', value: 'B' },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SECTION 5 — 핵심 본질 (Q32~Q36)
  // ══════════════════════════════════════════════════════

  {
    id: 'Q32',
    text: '삶에서 마지막까지 포기하기 싫은 것\n하나를 고른다면:',
    type: 'choice',
    facet: 'core_value',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: '자유 — 내 방식대로 살 것', value: 'A' },
      { label: '안정 — 잃을 것이 없는 상태', value: 'B' },
      { label: '성취 — 의미 있는 무언가를 이룬 것', value: 'C' },
      { label: '연결 — 깊이 사랑하고 사랑받는 관계', value: 'D' },
    ],
  },

  {
    id: 'Q33',
    text: '솔직하게, 당신 안에 가끔 있는 감정은:',
    type: 'choice',
    facet: 'shadow',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: '타인의 성공에 기쁘기보다 비교가 먼저 된다', value: 'A' },
      { label: '내 방식대로 되지 않으면 이유 없이 답답하다', value: 'B' },
      { label: '인정받지 못하면 의욕이 눈에 띄게 떨어진다', value: 'C' },
      { label: '위의 것들이 거의 없다', value: 'D' },
    ],
  },

  {
    id: 'Q34',
    text: '가장 피하고 싶은 상황은:',
    type: 'choice',
    facet: 'core_fear',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: '능력 없는 사람으로 보이는 것', value: 'A' },
      { label: '아무도 곁에 없이 혼자 남겨지는 것', value: 'B' },
      { label: '내 뜻대로 할 수 없는 상황에 갇히는 것', value: 'C' },
      { label: '내가 틀렸다는 것이 공개적으로 드러나는 것', value: 'D' },
    ],
  },

  {
    id: 'Q35',
    text: '당신이 스스로를 가장 자랑스럽게 느끼는 순간은:',
    type: 'choice',
    facet: 'self_concept',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: '아무도 못 풀 것 같던 문제를 해결했을 때', value: 'A' },
      { label: '누군가에게 진짜 필요한 사람이 됐을 때', value: 'B' },
      { label: '내가 세운 기준을 끝까지 지켜냈을 때', value: 'C' },
      { label: '전에 없던 무언가를 처음 만들어냈을 때', value: 'D' },
    ],
  },

  {
    id: 'Q36',
    text: '이 검사를 하면서 당신은:',
    type: 'choice',
    facet: 'meta_cog',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: '내가 예상한 대로 답한 것 같다', value: 'A' },
      { label: '생각보다 어려운 선택이 많았다', value: 'B' },
      { label: '솔직하게 했는지 스스로 잘 모르겠다', value: 'C' },
    ],
  },
]

export const SECTION_TRANSITIONS: Record<string, {
  title: string
  description: string
  icon: string
  theory: string
}> = {
  world: {
    title: '세계와의 인터페이스',
    description: '당신이 세상을 경험하는 기본 방식을 탐색합니다. 에너지, 호기심, 안정감의 원천이 어디에 있는지 알아봅니다.',
    icon: '🌐',
    theory: '이론적 기반: Big Five 성격 모델 (NEO-PI-R) — 외향성, 성실성, 개방성, 원만성, 신경증',
  },
  decision: {
    title: '결정의 아키텍처',
    description: '선택의 순간, 당신의 뇌는 어떻게 작동하는가? 목표 설정과 실행 방식의 심층 패턴을 파악합니다.',
    icon: '⚡',
    theory: '이론적 기반: 조절 초점 이론 (Higgins 1997) × 통제 소재 이론 (Rotter 1954)',
  },
  relation: {
    title: '관계의 역학',
    description: '타인과 연결되는 방식, 갈등을 처리하는 전략, 공동체 안에서 당신이 차지하는 위치를 탐색합니다.',
    icon: '🤝',
    theory: '이론적 기반: 원만성 × HEXACO 겸손-정직 차원 × 관계 애착 이론',
  },
  cognition: {
    title: '사고의 구조',
    description: '정보를 처리하고 문제를 해결하는 방식. 분석 vs 직관, 구체 vs 추상 — 당신만의 인지 스타일을 발견합니다.',
    icon: '🧠',
    theory: '이론적 기반: 구성 수준 이론 (Trope & Liberman 2010) × 인지 욕구 척도 (NCS)',
  },
  essence: {
    title: '핵심 본질',
    description: '마지막 다섯 질문입니다. 가장 솔직하게 답해주세요. 여기에는 정답이 없습니다 — 오직 당신의 진실만 있습니다.',
    icon: '✨',
    theory: '이론적 기반: 슈워츠 기본 가치 모델 (1992) × 융 심리학 × 메타 인지',
  },
}
