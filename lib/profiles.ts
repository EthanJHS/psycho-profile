import { ArchetypeId, ModeId, DriveId, TestResult } from '@/types'
import { computeCareers } from './careers'

export interface FacetMap {
  curiosity: number
  diligence: number
  boldness: number
  patience: number
  anxiety: number
  humility: number
}

// ─── 원형 기반 데이터 (12개) ──────────────────────────────────────────────
interface ArchetypeBase {
  id: ArchetypeId
  label: string
  light: string
  shadow: string
  shortDesc: string
  teaser: string
  dominantTraits: string[]
  careers: TestResult['careers']
  studyMethods: string[]
  warnings: string[]
  lifestyle: string
  weeklyRoutine: string[]
  cognitiveStyle: string
  relationshipStyle: string
  growthDirection: string
}

const ARCHETYPES: Record<ArchetypeId, ArchetypeBase> = {
  architect: {
    id: 'architect',
    label: '건축가',
    light: '혼돈 속에서 질서를 창조하는 체계적 사고의 달인',
    shadow: '완벽주의가 행동을 가로막을 때, 설계만 하고 실행하지 못한다',
    shortDesc: '복잡한 시스템을 설계하고 최적화하는 데 탁월한 전략적 지성',
    teaser: '당신의 뇌는 남들이 보지 못하는 연결고리를 본다. 이 능력의 어두운 면도 존재한다.',
    dominantTraits: ['체계적 사고', '장기 계획 수립', '논리적 일관성', '지적 엄밀성', '자율적 작업'],
    careers: [
      { title: '소프트웨어 아키텍트', fit: 97, reason: 'N+1 문제부터 분산 시스템 장애까지, 전체 구조를 설계하는 역할', detail: '시스템 설계, 기술 스택 결정, 팀 아키텍처 가이드', subRoles: ['클라우드 아키텍트', 'DevOps 엔지니어', 'CTO'] },
      { title: '전략 컨설턴트', fit: 91, reason: '비즈니스 문제를 구조화하고 장기 솔루션을 설계하는 능력', growthNote: 'MBA 또는 도메인 전문성 확보 필요' },
      { title: '데이터 과학자', fit: 88, reason: '복잡한 데이터 구조에서 패턴을 발견하는 체계적 접근', subRoles: ['ML 엔지니어', '리서치 사이언티스트'] },
      { title: '도시 계획가', fit: 85, reason: '복잡한 사회 시스템을 설계하는 거시적 사고', growthNote: '사회과학적 맥락 이해 필요' },
      { title: '재무 모델러', fit: 82, reason: '수치와 변수 간 관계를 구조화하는 정밀 사고' },
      { title: '학술 연구자', fit: 80, reason: '지적 탐구를 체계적으로 설계하고 검증하는 역량', subRoles: ['교수', '싱크탱크 연구원'] },
    ],
    studyMethods: ['마인드맵으로 전체 구조 파악 후 세부 학습', '개념 간 관계도 작성', '소크라테스식 자기 질문법', '프로젝트 기반 학습'],
    warnings: ['분석 마비(Analysis Paralysis) — 결정보다 분석에 시간을 더 쓴다', '인간적 요소 과소평가 — 효율성이 관계보다 중요해진다', '완벽주의적 지연 — 시작보다 설계에 집착한다', '소통 단절 — 너무 높은 추상도로 대화한다'],
    lifestyle: '구조화된 루틴 속에서 깊은 작업(Deep Work) 블록을 확보하라. 오전은 복잡한 사고, 오후는 실행과 소통으로 분리하는 것이 최적이다.',
    weeklyRoutine: ['월: 주간 목표 구조화 & 우선순위 매트릭스', '화~목: 깊은 작업 블록 (방해 금지)', '금: 리뷰 & 다음 주 계획', '주말: 비구조적 탐구 (독서, 새로운 시스템 탐색)'],
    cognitiveStyle: '하향식(Top-down) 처리 — 전체 프레임워크를 먼저 구성한 후 세부 사항을 채운다. 추상적 모델링에 강하며 일관성 위반에 민감하다.',
    relationshipStyle: '소수의 깊은 관계를 선호하며, 관계에도 암묵적 계약(기대치)을 설정한다. 상대가 논리적이지 않을 때 답답함을 느낀다.',
    growthDirection: '실행 근육 키우기 — 완벽하지 않아도 출시하는 경험을 쌓아라. "Done is better than perfect"를 의도적으로 연습하라.',
  },

  guardian: {
    id: 'guardian',
    label: '수호자',
    light: '공동체를 안정시키는 신뢰의 닻',
    shadow: '변화에 저항하다 성장 기회를 놓친다',
    shortDesc: '안정과 신뢰를 기반으로 공동체를 지탱하는 헌신적 보호자',
    teaser: '당신이 그 자리에 있기에 모든 것이 돌아간다. 하지만 그 무게는 얼마나 무거운가?',
    dominantTraits: ['강한 책임감', '신뢰성', '공동체 헌신', '위험 민감성', '규범 존중'],
    careers: [
      { title: '프로젝트 매니저', fit: 95, reason: '일정, 예산, 팀을 안정적으로 관리하는 수호자적 역량', subRoles: ['프로그램 매니저', 'PMO'] },
      { title: '의사/간호사', fit: 92, reason: '환자의 안전과 회복을 최우선으로 하는 헌신적 보호', growthNote: '번아웃 예방 전략 필수' },
      { title: '법조인', fit: 88, reason: '규범과 공정성을 수호하는 역할과 가치관의 일치' },
      { title: '교사/교수', fit: 87, reason: '다음 세대를 보호하고 성장시키는 장기적 헌신' },
      { title: '공무원/정책 입안자', fit: 84, reason: '공공의 이익을 위한 안정적 시스템 운영' },
      { title: '리스크 매니저', fit: 81, reason: '잠재적 위험을 사전에 식별하고 완화하는 역량', subRoles: ['컴플라이언스 오피서', '감사'] },
    ],
    studyMethods: ['체계적 반복 학습', '스터디 그룹 활용', '사례 연구 기반 학습', '전문가 멘토링'],
    warnings: ['변화 저항 — 새로운 방식에 불필요하게 오래 저항한다', '과도한 헌신 — 자신의 한계를 넘어 소진된다', '자기 희생 — 타인의 필요를 자신보다 항상 우선시한다', '규칙 우상화 — 규칙의 목적보다 규칙 자체에 집착한다'],
    lifestyle: '안정적인 루틴과 사회적 연결이 에너지 원천이다. 규칙적인 휴식 시간을 의도적으로 지정하고, "거절"을 연습하라.',
    weeklyRoutine: ['주간 시작: 팀/가족 체크인', '중간 지점: 진행 상황 검토', '주말: 공동체 활동 & 자기 돌봄', '정기 일정: 자신을 위한 활동 예약'],
    cognitiveStyle: '귀납적, 경험 기반 처리 — 검증된 방법과 전례를 신뢰한다. 위험 신호에 조기 경보 시스템을 가지고 있다.',
    relationshipStyle: '충성도 높고 신뢰할 수 있는 파트너. 상대의 필요를 먼저 챙기며, 배신에 깊은 상처를 받는다.',
    growthDirection: '자신의 필요에 목소리를 내는 연습을 하라. 변화를 위협이 아닌 성장 기회로 재프레이밍하는 인지 훈련이 필요하다.',
  },

  explorer: {
    id: 'explorer',
    label: '탐험가',
    light: '새로운 지평을 여는 개척자적 자유 정신',
    shadow: '깊이 없는 넓이 — 시작하고 완성하지 않는 패턴',
    shortDesc: '경계를 넘어 새로운 가능성을 발견하는 호기심의 화신',
    teaser: '당신은 지도에 없는 곳으로 간다. 그런데 왜 항상 혼자인가?',
    dominantTraits: ['왕성한 호기심', '모험 지향', '유연한 적응력', '독립성', '신선함 추구'],
    careers: [
      { title: '스타트업 창업자', fit: 94, reason: '미개척 시장을 개척하고 새로운 규칙을 만드는 역할', growthNote: '실행력과 팀 빌딩 능력 개발 필요' },
      { title: '저널리스트/다큐멘터리 감독', fit: 90, reason: '새로운 이야기와 진실을 발굴하는 탐험적 직업' },
      { title: '여행 작가/콘텐츠 크리에이터', fit: 87, reason: '경험을 콘텐츠로 전환하는 자유로운 생산 방식' },
      { title: 'UX 연구원', fit: 85, reason: '사용자 행동의 미지 영역을 탐색하는 체계적 탐험' },
      { title: '인류학자/사회학자', fit: 83, reason: '다른 문화와 사회 구조를 탐험하는 지적 모험', subRoles: ['문화 연구자', '민족지학자'] },
      { title: '벤처 캐피탈리스트', fit: 80, reason: '새로운 비즈니스 가능성을 탐색하고 투자하는 역할' },
    ],
    studyMethods: ['멀티 소스 탐색 학습', '실험 기반 학습', '다학제 연결', '프로젝트 호핑 후 통합'],
    warnings: ['완주 부재 — 시작만 하고 마무리하지 못하는 패턴', '피상적 전문성 — 많이 알지만 깊이가 부족하다', '안정 회피 — 좋은 것도 지루해지면 포기한다', '책임 회피 — 자유를 의무보다 우선한다'],
    lifestyle: '변화와 자극이 생명력이다. 하지만 완수한 프로젝트가 없으면 공허함이 온다. "완료 의식(Completion ritual)"을 만들어라.',
    weeklyRoutine: ['매일: 새로운 것 하나 시도', '주 2회: 깊이 파고드는 시간', '주 1회: 진행 중 프로젝트 완주 체크', '월 1회: 버킷리스트 항목 실행'],
    cognitiveStyle: '발산적 사고(Divergent thinking) 우세 — 가능성의 공간을 최대한 넓힌다. 수렴적 실행 국면에서 에너지가 떨어진다.',
    relationshipStyle: '자유롭고 자극적인 관계를 선호한다. 상대에게 독립성을 허용하며 집착을 견디지 못한다.',
    growthDirection: '"흥미롭지 않아도 완성하는 근육"을 키워라. 하나의 기술을 의도적으로 마스터하는 경험이 자신감의 깊이를 만든다.',
  },

  prophet: {
    id: 'prophet',
    label: '예언자',
    light: '남들이 못 보는 미래와 의미를 먼저 보는 통찰자',
    shadow: '이해받지 못하는 외로움과 과도한 민감성',
    shortDesc: '깊은 직관과 예리한 패턴 인식으로 미래를 예견하는 신비로운 통찰자',
    teaser: '당신은 5년 전에 이미 알았다. 왜 아무도 당신 말을 듣지 않는가?',
    dominantTraits: ['깊은 직관', '패턴 인식', '미래 지향', '감수성', '의미 탐구'],
    careers: [
      { title: '미래학자/트렌드 분석가', fit: 95, reason: '패턴에서 미래를 예측하는 탁월한 직관적 역량' },
      { title: '소설가/각본가', fit: 92, reason: '인간의 심층적 진실을 서사로 구현하는 예술적 통찰' },
      { title: '철학자/신학자', fit: 89, reason: '존재의 근본 질문을 탐구하는 깊은 사유 역량' },
      { title: '심리치료사', fit: 87, reason: '타인의 무의식적 패턴을 읽고 의미를 함께 탐구하는 역할', growthNote: '자기 경계 설정 훈련 필수' },
      { title: '예술 감독/큐레이터', fit: 84, reason: '시대정신과 미적 의미를 포착하는 감수성' },
      { title: '제품 비전 리더(CPO)', fit: 81, reason: '제품의 미래와 사용자의 잠재 필요를 먼저 보는 역량' },
    ],
    studyMethods: ['심층 독서 & 여백 사유', '저널링 통한 패턴 발견', '다학제 연결', '명상적 반추'],
    warnings: ['과도한 감수성 — 외부 자극에 지나치게 영향받는다', '소통 실패 — 직관을 논리로 번역하지 못한다', '고립 선택 — 이해받지 못함에 상처받아 혼자 있으려 한다', '분석 과잉 — 행동 없이 예측만 한다'],
    lifestyle: '조용하고 자극이 적은 환경에서 깊은 사유가 가능하다. 소수의 신뢰하는 사람과의 교류가 회복의 원천이다.',
    weeklyRoutine: ['매일: 저널링 30분', '주 3회: 깊은 독서 시간', '주 1회: 영감 인풋 (전시, 자연)', '주 1회: 신뢰하는 사람과 깊은 대화'],
    cognitiveStyle: '패턴 매칭과 게슈탈트 인식 — 데이터보다 전체적 인상에서 진실을 포착한다. 직관이 때로 논리보다 빠르다.',
    relationshipStyle: '깊고 의미 있는 연결만을 원한다. 피상적 관계는 에너지를 소진시킨다. 상대의 잠재력을 보는 경향이 있다.',
    growthDirection: '직관을 구체적 언어로 번역하는 연습이 필요하다. "나는 X를 느낀다" → "왜냐하면 Y와 Z의 패턴이 보이기 때문이다".',
  },

  warrior: {
    id: 'warrior',
    label: '전사',
    light: '목표를 향해 장애물을 제거하는 불굴의 실행자',
    shadow: '감정을 억압하고 타인을 도구로 보는 냉혹함',
    shortDesc: '명확한 목표와 강한 의지로 결과를 만들어내는 행동의 화신',
    teaser: '당신은 이기기 위해 태어났다. 그런데 무엇을 위해 이기는가?',
    dominantTraits: ['강한 실행력', '경쟁적 동기', '목표 집중', '위험 감수', '리더십'],
    careers: [
      { title: '기업 CEO/임원', fit: 96, reason: '경쟁 환경에서 조직을 승리로 이끄는 전략적 실행력' },
      { title: '영업 총괄/BD 리더', fit: 93, reason: '목표를 향해 장애물을 극복하는 추진력과 설득력' },
      { title: '운동선수/코치', fit: 91, reason: '극한의 수련과 경쟁에서 정점을 추구하는 전사 정신' },
      { title: '군/경찰 간부', fit: 88, reason: '위험 상황에서도 임무를 완수하는 결단력과 용기' },
      { title: '투자/트레이더', fit: 86, reason: '시장이라는 전쟁터에서 수익이라는 목표를 추구', growthNote: '리스크 관리 규율 필수' },
      { title: '기업 변호사/검사', fit: 83, reason: '법정이라는 전쟁터에서 논리로 싸우는 전투적 역량' },
    ],
    studyMethods: ['경쟁 요소 도입 (시험, 기한, 순위)', '실전 훈련 중심', '성과 측정 기반 학습', '집중 부트캠프'],
    warnings: ['감정 억압 — 취약성을 약점으로 본다', '타인 소외 — 협력자를 부속품으로 취급한다', '목적 공허 — 이긴 후의 공허함을 경험한다', '번아웃 — 멈추는 법을 모른다'],
    lifestyle: '경쟁과 도전이 삶의 연료다. 하지만 회복 시간을 의도적으로 설계하지 않으면 소진된다.',
    weeklyRoutine: ['매일: 물리적 운동 (전투 훈련)', '주 목표: 명확한 승리 조건 설정', '주간: 성과 리뷰', '주말: 완전한 단절 & 회복'],
    cognitiveStyle: '목표 지향적, 수단-목적 사고 — 가장 효율적인 경로를 즉시 계산한다. 감정적 요소를 "노이즈"로 처리한다.',
    relationshipStyle: '상대의 능력과 충성도를 기준으로 관계를 평가한다. 약자를 보호하는 기사도적 면이 있지만 약함을 견디지 못한다.',
    growthDirection: '"왜 싸우는가"에 대한 철학적 답을 찾아라. 목적 없는 승리의 공허함을 인식하고, 취약성을 강점으로 전환하는 리더십을 개발하라.',
  },

  alchemist: {
    id: 'alchemist',
    label: '연금술사',
    light: '낡은 것을 새것으로 변환하는 창조적 혁신자',
    shadow: '정착하지 못하고 변화 자체에 중독된다',
    shortDesc: '기존 요소를 새롭게 결합하여 가치를 창조하는 창의적 변혁가',
    teaser: '당신의 손이 닿으면 평범한 것이 특별해진다. 그런데 왜 자신에게는 그 마법을 쓰지 않는가?',
    dominantTraits: ['창의적 종합', '변화 촉진', '비선형적 사고', '직관적 통찰', '과정 즐김'],
    careers: [
      { title: '제품 디자이너/혁신 리더', fit: 94, reason: '기존 요소를 새롭게 결합해 더 나은 경험을 창조', subRoles: ['서비스 디자이너', 'Innovation Lead'] },
      { title: '예술가/뮤지션', fit: 91, reason: '여러 영향을 독창적으로 합성하는 창조 역량' },
      { title: '광고/브랜드 전략가', fit: 89, reason: '다양한 요소를 결합해 설득력 있는 스토리 창조' },
      { title: '과학자/발명가', fit: 86, reason: '기존 지식을 새롭게 연결해 발견을 만드는 창의성' },
      { title: '요리사/푸드 디렉터', fit: 83, reason: '재료를 새롭게 결합하는 창의적 연금술' },
      { title: '경영/조직 혁신가', fit: 80, reason: '낡은 조직 문화를 혁신하는 변화 촉진 역량' },
    ],
    studyMethods: ['다학제 연결 학습', '창작 실험 기반', '은유와 유추를 통한 이해', '비선형적 탐구'],
    warnings: ['미완성 증후군 — 새로운 아이디어가 현재를 방해한다', '변화 중독 — 안정도 필요하다', '평가 회피 — 결과물을 공유하지 않으려 한다', '현실 망각 — 아이디어는 많지만 실행 계획이 없다'],
    lifestyle: '창의적 인풋(전시, 독서, 대화)과 아웃풋(제작, 실험)의 리듬이 필요하다. 완성의 경험을 정기적으로 쌓아라.',
    weeklyRoutine: ['매일: 창의적 인풋 시간', '주 3회: 실험적 제작', '주 1회: 완성품 발표(소규모)', '월 1회: 새로운 분야 탐험'],
    cognitiveStyle: '연상적, 은유적 사고 — 전혀 다른 도메인의 개념을 연결하는 데 탁월하다. 순차적 논리보다 직관적 도약이 자연스럽다.',
    relationshipStyle: '다양하고 자극적인 관계를 선호한다. 상대의 독특함에 매력을 느끼며, 일상적 반복 속 관계는 지루해한다.',
    growthDirection: '창의성의 반대는 평범함이 아니라 완성이다. 아이디어를 완성된 결과물로 만드는 시스템을 구축하라.',
  },

  sovereign: {
    id: 'sovereign',
    label: '군주',
    light: '비전으로 사람들을 이끌고 현실을 만드는 자연스러운 리더',
    shadow: '통제욕이 협력을 방해하고 자아가 피드백을 막는다',
    shortDesc: '명확한 비전과 카리스마로 집단의 에너지를 모으고 방향을 제시하는 천부적 리더',
    teaser: '당신 주변에 사람들이 모인다. 그들이 당신을 따르는가, 아니면 두려워하는가?',
    dominantTraits: ['천부적 리더십', '강한 비전', '카리스마', '결단력', '책임 의식'],
    careers: [
      { title: '정치인/사회 지도자', fit: 96, reason: '대중을 이끌고 사회적 방향을 설정하는 최고의 리더 역할' },
      { title: '기업 CEO', fit: 94, reason: '조직의 비전을 정의하고 자원을 통합하는 최고 리더', growthNote: '겸손과 경청 능력 개발 필수' },
      { title: '영화 감독/공연 연출가', fit: 89, reason: '창작 집단을 이끌고 비전을 현실로 구현하는 리더십' },
      { title: '스포츠 코치', fit: 87, reason: '팀의 역량을 최대화하는 리더십과 전략적 사고' },
      { title: '투자자/펀드 매니저', fit: 84, reason: '시장에 대한 독자적 판단으로 자원을 배치하는 역할' },
      { title: '종교/영성 지도자', fit: 81, reason: '공동체의 방향과 의미를 제시하는 정신적 리더십' },
    ],
    studyMethods: ['리더십 사례 연구', '멘토로부터의 학습', '실제 리더십 경험', '역사적 위인 연구'],
    warnings: ['자아 과잉 — 자신의 판단을 과신하고 피드백을 무시한다', '통제 집착 — 위임하지 못해 병목이 된다', '인정 중독 — 찬사가 없으면 불안해진다', '책임 전가 — 실패 시 타인을 탓한다'],
    lifestyle: '영향력의 장을 계속 확장하되, 정기적으로 "왜 이끄는가"를 되물어야 한다. 신뢰하는 내부 비판자가 필요하다.',
    weeklyRoutine: ['매일: 팀과 비전 공유', '주 2회: 1:1 심층 대화', '주 1회: 전략적 사고 시간', '월 1회: 360도 피드백 수용'],
    cognitiveStyle: '전략적, 빅픽처 사고 — 전체 판을 보고 핵심 레버를 찾는다. 세부 사항보다 방향과 우선순위에 집중한다.',
    relationshipStyle: '자신의 비전을 공유하는 사람들과 강한 결속을 형성한다. 충성을 중요시하며 배신에 가혹하다.',
    growthDirection: '겸손의 리더십 — 취약성을 드러내는 것이 약함이 아니라 강함임을 학습하라. 내부 비판자의 목소리를 차단하지 마라.',
  },

  sage: {
    id: 'sage',
    label: '현자',
    light: '지혜로 타인의 성장을 돕는 시대를 초월한 안내자',
    shadow: '참여보다 관찰을 선택하며 삶의 현장에서 물러난다',
    shortDesc: '깊은 지혜와 균형 잡힌 시각으로 진실과 성장의 길을 밝히는 안내자',
    teaser: '당신은 답을 알고 있다. 그런데 왜 말하지 않는가?',
    dominantTraits: ['깊은 지혜', '균형적 시각', '겸손한 지식', '객관성', '멘토링 역량'],
    careers: [
      { title: '교육자/멘토', fit: 96, reason: '지식을 전달하되 자신이 아닌 학습자의 성장을 중심에 둔다', subRoles: ['코치', '트레이너'] },
      { title: '심리치료사/상담사', fit: 93, reason: '지혜로 타인의 통찰을 안내하는 비지시적 역할' },
      { title: '작가/철학자', fit: 90, reason: '시대를 초월한 진실을 문자로 증류하는 역할' },
      { title: '판사/중재자', fit: 88, reason: '균형 잡힌 관점으로 공정한 판단을 내리는 역할' },
      { title: '의사/한의사', fit: 85, reason: '지식과 경험을 통합해 환자를 안내하는 현명한 역할' },
      { title: '이사회 멤버/어드바이저', fit: 82, reason: '경험에서 우러난 지혜로 전략적 조언을 제공하는 역할' },
    ],
    studyMethods: ['깊이 읽기 & 사유', '역사와 고전 학습', '다양한 관점 탐구', '가르침으로 배우기'],
    warnings: ['행동 회피 — 관찰만 하고 개입하지 않는다', '거리감 — 지적 우월감이 연결을 방해한다', '현실 도피 — 이론 속에 머문다', '판단 유예 과잉 — 명확한 입장을 피한다'],
    lifestyle: '독서와 사유, 그리고 의미 있는 대화가 삶의 근간이다. 자신의 지혜를 나눌 수 있는 공동체가 필요하다.',
    weeklyRoutine: ['매일: 독서 & 저널링', '주 3회: 깊은 대화', '주 1회: 가르치거나 안내하는 활동', '월 1회: 현장 경험 (이론을 실제로)'],
    cognitiveStyle: '통합적, 맥락적 사고 — 여러 관점을 연결해 더 큰 그림을 본다. 옳고 그름보다 복잡성과 맥락을 중시한다.',
    relationshipStyle: '깊고 진솔한 대화를 원한다. 상대의 성장에 진심으로 관심을 가지며, 지혜를 나누는 관계에서 가장 충만함을 느낀다.',
    growthDirection: '지혜는 행동할 때 완성된다. 관찰자 역할에서 벗어나 적극적으로 개입하고, 자신의 판단을 명확히 표현하는 연습을 하라.',
  },

  harmonizer: {
    id: 'harmonizer',
    label: '조율자',
    light: '갈등을 녹이고 다양성을 하나로 엮는 사회적 접착제',
    shadow: '자신의 목소리를 잃고 모든 사람을 기쁘게 하려 한다',
    shortDesc: '다양한 관점과 사람들을 조화롭게 연결하여 공동체를 만드는 탁월한 중재자',
    teaser: '모든 사람이 당신을 좋아한다. 그런데 당신은 자신을 좋아하는가?',
    dominantTraits: ['공감 능력', '갈등 조율', '포용성', '협력 촉진', '관계 유지'],
    careers: [
      { title: 'HR 리더/조직개발 전문가', fit: 95, reason: '다양한 사람들을 연결하고 조직 문화를 만드는 역할' },
      { title: '외교관/국제 협상가', fit: 92, reason: '다른 문화와 이해관계를 조율하는 고차원적 중재' },
      { title: '소셜 워커/비영리 리더', fit: 90, reason: '취약 계층과 자원 사이를 연결하는 조율 역할' },
      { title: '이벤트 기획자/커뮤니티 매니저', fit: 87, reason: '사람들을 연결하는 경험을 설계하는 역할' },
      { title: '교육 행정가/대학 상담사', fit: 84, reason: '학생의 필요와 제도 사이를 중재하는 역할' },
      { title: '가족 치료사', fit: 81, reason: '가족 시스템의 갈등을 중재하는 전문 조율가' },
    ],
    studyMethods: ['그룹 스터디 중심', '사례 기반 토론', '역할극 & 시뮬레이션', '다양한 관점 수집'],
    warnings: ['자기 억압 — 갈등 회피를 위해 자신의 필요를 무시한다', '경계 부재 — "No"라고 말하지 못한다', '감정 소진 — 타인의 감정을 흡수해 지친다', '자기 정체성 혼돈 — 너무 많은 사람에게 맞추다 자신을 잃는다'],
    lifestyle: '사람들과의 연결이 에너지 원천이지만, 혼자 회복하는 시간도 필수다. 자신의 필요를 먼저 채우는 연습이 필요하다.',
    weeklyRoutine: ['매일: 자기 감정 체크인', '주 3회: 사람들과 연결', '주 2회: 혼자만의 재충전 시간', '주 1회: 자신의 필요 목록 작성'],
    cognitiveStyle: '관계적, 맥락적 사고 — 개인보다 관계 시스템을 본다. 감정적 정보를 데이터로 처리하는 탁월한 능력이 있다.',
    relationshipStyle: '모든 관계에 진심을 다하며, 상대가 안전함을 느끼도록 돕는다. 자신이 필요받는 관계에서 의미를 찾는다.',
    growthDirection: '당신의 필요는 타인의 필요만큼 중요하다. 자기 주장(Assertiveness)을 연습하고, 건강한 경계 설정이 더 나은 관계를 만든다는 것을 학습하라.',
  },

  rebel: {
    id: 'rebel',
    label: '반항아',
    light: '낡은 질서에 도전하고 새로운 가능성을 열어젖히는 변혁가',
    shadow: '반항 자체가 목적이 되어 건설보다 파괴에 머문다',
    shortDesc: '기존 질서의 허위와 억압에 저항하며 진정한 변화를 추구하는 반체제적 혁신가',
    teaser: '당신은 규칙을 깬다. 그런데 더 나은 규칙을 세웠는가?',
    dominantTraits: ['비판적 사고', '권위 저항', '독립적 판단', '진정성 추구', '현실 도전'],
    careers: [
      { title: '사회운동가/활동가', fit: 95, reason: '불의에 저항하고 시스템 변화를 이끄는 선구자적 역할' },
      { title: '독립 저널리스트/탐사기자', fit: 92, reason: '권력에 진실을 말하는 반체제적 언론 역할' },
      { title: '파괴적 창업가(Disruptor)', fit: 90, reason: '기존 산업을 무너뜨리는 혁신 기업을 만드는 역할', growthNote: '팀 빌딩 능력 필수 개발' },
      { title: '예술가/반문화 크리에이터', fit: 87, reason: '주류에 저항하는 미학적 언어로 진실을 표현' },
      { title: '법 개혁 변호사', fit: 84, reason: '불공정한 법을 바꾸기 위해 싸우는 역할' },
      { title: '철학자/비판 이론가', fit: 80, reason: '지배적 패러다임을 해체하고 새로운 사유를 여는 역할' },
    ],
    studyMethods: ['비판적 텍스트 읽기', '반론 탐색', '역사적 반체제 사상 연구', '논쟁 & 토론'],
    warnings: ['건설 없는 파괴 — 기존 것을 무너뜨리지만 대안을 제시하지 못한다', '반항 중독 — 옳아서가 아니라 달라서 반대한다', '연대 부재 — 모든 것을 혼자 하려 한다', '냉소 과잉 — 변화 가능성 자체를 포기한다'],
    lifestyle: '저항에는 에너지가 필요하다. 소진을 방지하기 위해 회복의 공간과 같은 편의 공동체가 필요하다.',
    weeklyRoutine: ['매일: 뉴스/이슈 비판적 분석', '주 3회: 연대 네트워크 유지', '주 1회: 건설적 대안 구상', '월 1회: 성과 회고 (변화가 일어났는가)'],
    cognitiveStyle: '비판적, 해체적 사고 — 전제를 의심하고 숨겨진 권력 구조를 본다. 모순을 찾는 데 탁월하다.',
    relationshipStyle: '진정성을 갖춘 소수의 동지와 깊은 연대를 형성한다. 권위에 굴복하는 사람을 이해하기 어렵다.',
    growthDirection: '"나는 무엇을 위해 싸우는가"를 명확히 하라. 반대에서 제안으로, 파괴에서 건설로 에너지 방향을 전환하는 연습이 필요하다.',
  },

  lover: {
    id: 'lover',
    label: '연인',
    light: '깊은 감정적 연결과 아름다움으로 세상을 풍요롭게 한다',
    shadow: '연결에 대한 갈망이 의존성과 경계 상실로 이어진다',
    shortDesc: '감정적 깊이와 미적 감수성으로 관계와 아름다움에 의미를 부여하는 열정적 존재',
    teaser: '당신은 사랑할 때 가장 살아있다. 그런데 혼자일 때도 완전한가?',
    dominantTraits: ['강한 공감', '감정적 깊이', '미적 감수성', '연결 추구', '열정적 헌신'],
    careers: [
      { title: '예술 치료사', fit: 94, reason: '감정적 연결을 통해 치유를 돕는 심층적 역할' },
      { title: '배우/퍼포머', fit: 92, reason: '감정을 예술로 표현하고 관객과 연결하는 역할' },
      { title: '상담 심리사', fit: 90, reason: '깊은 공감으로 내담자와 치유적 관계를 형성하는 역할', growthNote: '자기 경계 설정 훈련 필수' },
      { title: '패션/인테리어 디자이너', fit: 87, reason: '감각적 아름다움을 통해 사람들의 감정에 영향을 주는 역할' },
      { title: '작가/시인', fit: 85, reason: '감정적 경험을 언어로 결정화하는 역할' },
      { title: 'NGO/사회적 기업가', fit: 82, reason: '타인의 고통에 깊이 공감하고 행동으로 연결하는 역할' },
    ],
    studyMethods: ['감정 연결 학습', '스토리텔링 중심 이해', '경험적 몰입 학습', '멘토와의 감성적 연결'],
    warnings: ['감정 과잉 — 이성적 판단이 감정에 압도된다', '경계 상실 — 상대와 합일하여 자아를 잃는다', '의존성 — 관계 없이는 자기 가치를 느끼지 못한다', '집착 — 관계가 끝나도 놓지 못한다'],
    lifestyle: '아름다운 환경, 깊은 관계, 감각적 경험이 삶을 풍요롭게 한다. 혼자 있는 시간에도 자신과 연결하는 연습이 필요하다.',
    weeklyRoutine: ['매일: 아름다운 것 하나 감상', '주 3회: 깊은 관계 연결', '주 1회: 창작 표현 (글, 예술)', '주 1회: 혼자만의 시간 (자기 연결)'],
    cognitiveStyle: '감정적, 관계적 정보 처리 — 사실보다 의미와 감정을 중시한다. 은유와 이야기를 통해 세상을 이해한다.',
    relationshipStyle: '전적으로 헌신하며 상대를 이상화하는 경향이 있다. 감정적 친밀감을 최고의 가치로 여기며, 거절에 깊이 상처받는다.',
    growthDirection: '자기 사랑(Self-love)을 타인 사랑의 기반으로 삼아라. 관계 바깥에서도 완전한 자아를 유지하는 내면의 힘을 키워라.',
  },

  catalyst: {
    id: 'catalyst',
    label: '촉매자',
    light: '에너지와 열정으로 타인과 상황을 활성화시키는 변화의 불꽃',
    shadow: '자신보다 타인의 변화에 집착하며 경계 없이 개입한다',
    shortDesc: '전염성 있는 에너지와 열정으로 사람들을 자극하고 변화를 촉발시키는 역동적 활성화제',
    teaser: '당신 주변에서 항상 무언가가 일어난다. 당신이 없을 때도 그런가?',
    dominantTraits: ['높은 에너지', '전염성 열정', '변화 촉진', '네트워킹', '즉흥적 창의성'],
    careers: [
      { title: '마케터/성장 해커', fit: 95, reason: '에너지와 창의성으로 시장을 자극하고 성장을 촉발' },
      { title: '강연자/코치', fit: 93, reason: '청중의 잠재력을 활성화하는 촉매적 역할' },
      { title: 'PR/커뮤니케이션 전문가', fit: 90, reason: '이야기와 에너지로 브랜드를 살아있게 만드는 역할' },
      { title: '기업가/시리얼 앙트레프레너', fit: 88, reason: '연속적으로 새로운 것을 시작하고 활성화하는 역할', growthNote: '지속 운영 파트너 필요' },
      { title: '교사/교육 혁신가', fit: 85, reason: '학생들의 호기심과 열정을 점화시키는 역할' },
      { title: '이벤트 프로듀서', fit: 82, reason: '경험을 통해 에너지를 폭발적으로 증폭시키는 역할' },
    ],
    studyMethods: ['워크샵 & 해커톤', '실시간 토론 & 브레인스토밍', '소셜 학습', '도전 기반 학습'],
    warnings: ['집중 부재 — 여러 것을 동시에 활성화하다 완수하지 못한다', '타인 변화 집착 — 상대가 변하길 강요한다', '에너지 고갈 — 지속 불가능한 페이스', '깊이 부족 — 표면적 자극에 그친다'],
    lifestyle: '사람들과의 에너지 교환이 삶의 핵심이다. 하지만 내면을 충전할 고독한 시간도 반드시 필요하다.',
    weeklyRoutine: ['매일: 에너지 넘치는 아침 루틴', '주 4회: 사람들과 자극적 교류', '주 2회: 깊은 단독 집중 작업', '주 1회: 에너지 점검 & 회복'],
    cognitiveStyle: '연상적, 빠른 처리 — 자극에서 즉각 아이디어를 생성한다. 실행 중 사고하며 느린 분석 단계를 건너뛰는 경향이 있다.',
    relationshipStyle: '넓고 활기찬 사회 네트워크를 유지한다. 모든 사람에게 에너지를 주지만, 깊은 관계에는 의도적 노력이 필요하다.',
    growthDirection: '자신의 에너지를 점화하되, 완주까지 이끄는 시스템을 만들어라. "깊이"가 "넓이"를 완성시킨다.',
  },
}

// ─── 모드 플레이버 (4개) ──────────────────────────────────────────────────
interface ModeFlavor {
  cognitiveStyleSuffix: string
  descPrefix: string
}

const MODE_FLAVORS: Record<ModeId, ModeFlavor> = {
  analytical: {
    cognitiveStyleSuffix: ' 데이터와 논리를 우선하며, 결론은 검증 가능한 근거로만 도달한다.',
    descPrefix: '분석적 정밀함으로 ',
  },
  intuitive: {
    cognitiveStyleSuffix: ' 직관과 패턴 인식으로 빠른 판단을 내리며, 설명하기 어려운 통찰을 자주 경험한다.',
    descPrefix: '직관의 날카로움으로 ',
  },
  pragmatic: {
    cognitiveStyleSuffix: ' 실용적 결과를 중심으로 사고하며, "작동하는가"가 "아름다운가"보다 중요하다.',
    descPrefix: '실용적 판단으로 ',
  },
  integrative: {
    cognitiveStyleSuffix: ' 다양한 관점을 통합하여 더 큰 그림을 구성하며, 이분법적 사고를 거부한다.',
    descPrefix: '통합적 시각으로 ',
  },
}

// ─── 동력 플레이버 (4개) ─────────────────────────────────────────────────
interface DriveFlavor {
  modifier: string
  motivationNote: string
}

const DRIVE_FLAVORS: Record<DriveId, DriveFlavor> = {
  achievement: {
    modifier: '성취 지향',
    motivationNote: '탁월함을 증명하고 목표를 달성할 때 가장 살아있음을 느낀다.',
  },
  connection: {
    modifier: '관계 중심',
    motivationNote: '깊은 유대와 의미 있는 관계에서 삶의 핵심 에너지를 얻는다.',
  },
  autonomy: {
    modifier: '자율 추구',
    motivationNote: '자신의 방식대로 결정하고 행동할 때 최고의 역량을 발휘한다.',
  },
  security: {
    modifier: '안정 추구',
    motivationNote: '예측 가능하고 안전한 환경에서 깊은 역량을 꽃피운다.',
  },
}

// ─── 프로필 이름 룩업 (48개: 12 archetypes × 4 drives) ──────────────────
const PROFILE_NAMES: Record<ArchetypeId, Record<DriveId, string>> = {
  architect: {
    achievement: '정복하는 건축가',
    connection: '공감하는 건축가',
    autonomy: '자유로운 건축가',
    security: '견고한 건축가',
  },
  guardian: {
    achievement: '탁월한 수호자',
    connection: '헌신적 수호자',
    autonomy: '독립적 수호자',
    security: '철벽 수호자',
  },
  explorer: {
    achievement: '정복하는 탐험가',
    connection: '연결하는 탐험가',
    autonomy: '자유로운 탐험가',
    security: '신중한 탐험가',
  },
  prophet: {
    achievement: '예언하는 선구자',
    connection: '공명하는 예언자',
    autonomy: '홀로 선 예언자',
    security: '수호하는 예언자',
  },
  warrior: {
    achievement: '정복하는 전사',
    connection: '충성스러운 전사',
    autonomy: '고독한 전사',
    security: '방어하는 전사',
  },
  alchemist: {
    achievement: '성공하는 연금술사',
    connection: '나누는 연금술사',
    autonomy: '자유로운 연금술사',
    security: '축적하는 연금술사',
  },
  sovereign: {
    achievement: '정복하는 군주',
    connection: '사랑받는 군주',
    autonomy: '독립적 군주',
    security: '수성하는 군주',
  },
  sage: {
    achievement: '증명하는 현자',
    connection: '나누는 현자',
    autonomy: '은둔하는 현자',
    security: '보존하는 현자',
  },
  harmonizer: {
    achievement: '성과 내는 조율자',
    connection: '사랑받는 조율자',
    autonomy: '독립적 조율자',
    security: '안정된 조율자',
  },
  rebel: {
    achievement: '승리하는 반항아',
    connection: '연대하는 반항아',
    autonomy: '자유로운 반항아',
    security: '저항하는 반항아',
  },
  lover: {
    achievement: '열정적 연인',
    connection: '헌신하는 연인',
    autonomy: '자유로운 연인',
    security: '충실한 연인',
  },
  catalyst: {
    achievement: '폭발하는 촉매자',
    connection: '연결하는 촉매자',
    autonomy: '자유로운 촉매자',
    security: '지속하는 촉매자',
  },
}

// ─── 3레이어 결과 빌더 ────────────────────────────────────────────────────
export function buildLayeredResult(
  archetype: ArchetypeId,
  mode: ModeId,
  drive: DriveId,
  facets: Record<string, number>,
  cogScore: number,
): TestResult {
  const base = ARCHETYPES[archetype]
  const modeF = MODE_FLAVORS[mode]
  const driveF = DRIVE_FLAVORS[drive]

  const profileLabel = PROFILE_NAMES[archetype][drive]
  const profileId = `${archetype}_${mode}_${drive}`

  const cognitiveStyle = base.cognitiveStyle + modeF.cognitiveStyleSuffix
  const growthDirection = base.growthDirection + ` [핵심 동기: ${driveF.motivationNote}]`
  const lifestyle = base.lifestyle + ` 당신의 동력원은 "${driveF.modifier}"다.`

  // 동적 진로 계산 (facets + cogScore 반영, contra 패널티 포함)
  const fm: FacetMap = {
    curiosity: facets['curiosity'] ?? 3,
    diligence: facets['diligence'] ?? 3,
    boldness:  facets['boldness']  ?? 3,
    patience:  facets['patience']  ?? 3,
    anxiety:   facets['anxiety']   ?? 3,
    humility:  facets['humility']  ?? 3,
  }
  const careers = computeCareers(fm, cogScore)

  return {
    profileId,
    profileLabel,
    dominantTraits: base.dominantTraits,
    careers,
    studyMethods: base.studyMethods,
    warnings: base.warnings,
    lifestyle,
    weeklyRoutine: base.weeklyRoutine,
    cognitiveStyle,
    relationshipStyle: base.relationshipStyle,
    growthDirection,
    shortDesc: `${modeF.descPrefix}${base.shortDesc}`,
    teaser: base.teaser,
    archetype,
    mode,
    drive,
    light: base.light,
    shadow: base.shadow,
  }
}
