// 성격 프로파일 기반 진로 적합도 동적 산출
import { FacetMap } from './profiles'

export interface CareerScore {
  title: string
  fit: number
  reason: string
  contraReason: string
  detail: string
  growthNote: string
  subRoles: string[]
}

const FACET_LABELS: Record<string, string> = {
  curiosity:  '지적 호기심',
  diligence:  '성실성',
  boldness:   '사회적 대담성',
  humility:   '겸손·윤리 의식',
  patience:   '공감·인내력',
  anxiety:    '감수성',
  cog:        '분석적 사고력',
}

interface CareerDef {
  title: string
  // w:            높을수록 적합도 상승 — score += val * w
  w: Partial<Record<string, number>> & { cog?: number }
  // contra:       낮을수록 감점 — score -= (1 - val) * w  (필수 조건: 없으면 큰 불이익)
  contra?: Partial<Record<string, number>> & { cog?: number }
  // penalizeHigh: 높을수록 감점 — score -= val * w       (해당 trait가 오히려 방해)
  penalizeHigh?: Partial<Record<string, number>> & { cog?: number }
  subRoles: string[]
  detail: string
  growthNote: string
  contraReason: string
  descFn: (top: string[]) => string
}

const CAREERS: CareerDef[] = [
  // ── 연구·학술 계열 ─────────────────────────────────────────────────────
  {
    title: '인문·사회과학 연구자',
    // O·H·cog 주도 + anxiety(인간 행동 이해에 감수성 기여)
    w:      { curiosity: 0.38, humility: 0.18, cog: 0.14, diligence: 0.10, patience: 0.10, anxiety: 0.10 },
    contra: { curiosity: 0.20, diligence: 0.10, anxiety: 0.08 },
    subRoles: ['사회학 연구원', '정책 분석가', '문화인류학자', '역사학자'],
    detail: '정해진 답이 없는 복잡한 질문을 오랫동안 붙들고 탐구하는 방식이 학술·연구 환경의 요구와 정확히 일치합니다. 문헌을 종합하고 새로운 개념적 틀을 세우는 작업에서 특히 빛납니다.',
    growthNote: '연구 결과를 비전문가에게 설명하는 커뮤니케이션 능력을 병행해 키우면 사회적 영향력이 크게 확장됩니다.',
    contraReason: '지적 탐구보다 실용적 성과를 선호하거나 한 주제를 오래 붙드는 것이 어렵다면, 연구의 반복적인 깊이 파기 과정이 지루하고 소모적으로 느껴질 수 있습니다.',
    descFn: (t) => `${t[0]}이(가) 두드러지는 이 프로필은 개념과 인간 행동의 맥락을 연결하는 분석적 탐구에 자연스럽게 끌립니다.`,
  },
  {
    title: '연구원·과학자',
    // O·cog·C 핵심 삼각형, patience 불필요
    w:      { curiosity: 0.35, cog: 0.35, diligence: 0.25, humility: 0.05 },
    contra: { curiosity: 0.20, cog: 0.15, diligence: 0.15 },
    subRoles: ['기초과학 연구원', '응용연구 엔지니어', '바이오인포매틱스 연구원', 'R&D 기획'],
    detail: '가설을 세우고 검증하는 반복적 사이클이 이 프로필의 지속력·분석력과 맞닿아 있습니다. 불확실성이 높은 연구 환경에서도 방향을 잃지 않고 깊이를 쌓아가는 능력이 강점입니다.',
    growthNote: '성과를 팀·기관 외부에 알리는 논문·발표 역량을 일찍부터 개발하면 연구자로서의 영향력이 가속됩니다.',
    contraReason: '분석적 사고와 집요한 반복 검증을 즐기지 않는다면 실험 실패가 쌓이는 연구 환경이 큰 스트레스로 다가옵니다. 빠른 결과보다 느린 축적이 기본값인 직군입니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 정밀하고 체계적인 탐구를 지속하는 데 특히 강점을 보입니다.`,
  },
  {
    title: '철학·심리 연구자',
    // O·H 핵심 + anxiety(인간 내면 탐구에 감수성이 기여), patience는 보조
    w:      { curiosity: 0.38, humility: 0.24, cog: 0.14, diligence: 0.10, anxiety: 0.10, patience: 0.04 },
    contra: { curiosity: 0.20, humility: 0.12, anxiety: 0.10 },
    subRoles: ['철학과 연구원', '임상심리 연구원', '인지과학자', '윤리학 컨설턴트'],
    detail: '인간 존재와 의미에 대한 근본적 질문을 다루는 학문에서, 지적 겸손함과 끝없는 탐구심이 함께 작동할 때 가장 탁월한 통찰이 나옵니다.',
    growthNote: '추상적 사유를 구체적 실천 방향으로 연결하는 응용 역량을 키우면 학문의 현실 기여도가 높아집니다.',
    contraReason: '답이 없는 질문을 오래 붙드는 것보다 빠른 결론을 선호하거나 자신의 견해를 강하게 주장하는 성향이라면, 끊임없는 자기 의심과 재검토를 요구하는 철학·심리 학문과 충돌합니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 시너지를 이루는 프로필 — 인간과 의미를 탐구하는 깊은 학문에 자연스럽게 맞아떨어집니다.`,
  },
  {
    title: '교수·학자',
    // patience + curiosity 필수, boldness도 강의에 필요, anxiety(학생 감정 읽기)
    w:      { patience: 0.30, curiosity: 0.26, boldness: 0.14, humility: 0.10, cog: 0.10, anxiety: 0.10 },
    contra: { patience: 0.22, curiosity: 0.15, anxiety: 0.08 },
    subRoles: ['대학 교수', '연구소 선임연구원', '교육과정 개발자', '학술 저술가'],
    detail: '지식을 탐구하는 능력과 타인에게 전달하는 인내력이 동시에 높을 때, 교육·학술 환경은 최고의 무대가 됩니다.',
    growthNote: '학술 성과를 인정받는 데 오랜 시간이 걸릴 수 있습니다. 중간 목표(저술, 강연, 멘토링)로 성취감을 분산하세요.',
    contraReason: '같은 내용을 다양한 학생에게 반복 설명하는 인내력과 지식 탐구에 대한 지속적 열정이 약하다면, 교육자의 긴 호흡이 빠른 소진으로 이어질 수 있습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 균형을 이루는 이 프로필은 지식을 탐구하고 다음 세대에 전달하는 역할에서 빛납니다.`,
  },

  // ── 사람 중심 계열 ─────────────────────────────────────────────────────
  {
    title: '상담심리사·심리치료사',
    // patience 최우선, humility 필수, anxiety(감정 공명 능력 — 낮으면 공감 불가)
    w:      { patience: 0.45, humility: 0.18, curiosity: 0.15, anxiety: 0.22 },
    contra: { patience: 0.30, humility: 0.10, anxiety: 0.20 },
    subRoles: ['임상심리사', '청소년 상담사', '기업 EAP 상담사', '코치·라이프 코치'],
    detail: '타인의 내면을 판단 없이 수용하고 함께 탐색하는 능력이 상담의 핵심입니다. 공감 수준이 높으면서도 자신의 감정 경계를 유지하는 균형이 장기적으로 번아웃을 예방합니다.',
    growthNote: '대리 외상(vicarious trauma)에 주의하세요. 정기적인 수퍼비전과 자기 돌봄 루틴이 지속 가능한 커리어의 핵심입니다.',
    contraReason: '타인의 감정을 판단 없이 오래 수용하는 공감력이 낮다면, 매 세션 타인의 고통을 함께 짊어지는 상담 역할이 빠른 번아웃으로 이어질 수 있습니다.',
    descFn: (t) => `${t[0]}이(가) 핵심 강점인 이 프로필은 타인의 심리를 깊이 이해하고 함께 변화를 만드는 환경에서 탁월합니다.`,
  },
  {
    title: '사회복지사·NGO 기획',
    // patience + humility 필수, anxiety(취약계층 공감 — 낮으면 감정 연결 불가)
    w:      { patience: 0.38, humility: 0.26, diligence: 0.13, curiosity: 0.08, anxiety: 0.15 },
    contra: { patience: 0.22, humility: 0.18, anxiety: 0.15 },
    subRoles: ['사례 관리 복지사', '국제개발 NGO 기획', '사회적기업 운영', '정책 옹호 활동가'],
    detail: '취약계층의 복잡한 상황을 판단 없이 수용하고 구조적 지원을 설계하는 역할입니다.',
    growthNote: '이 분야는 감정 노동이 높습니다. 자신의 한계를 명확히 인식하고 경계를 설정하는 능력이 장기 지속성의 핵심입니다.',
    contraReason: '느린 변화와 구조적 한계 속에서 인내하며 타인의 삶을 지원하는 이 역할은, 효율과 성과를 중시하는 성향과 자주 충돌합니다. 공감보다 논리가 앞선다면 지속하기 어렵습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 시너지를 내는 이 프로필은 사람을 돕는 구조적 지원 역할에서 진정한 의미를 찾습니다.`,
  },
  {
    title: '간호사·의료지원직',
    // patience + diligence 필수, humility(팀 내 협업), anxiety(환자 정서 케어 — 낮으면 기계적 처치에 그침)
    w:      { patience: 0.38, diligence: 0.28, humility: 0.18, anxiety: 0.16 },
    contra: { patience: 0.22, diligence: 0.13, humility: 0.10, anxiety: 0.14 },
    subRoles: ['임상 간호사', '전문 간호사(NP)', '의료 코디네이터', '호스피스 케어 전문가'],
    detail: '환자의 신체적·심리적 상태를 동시에 살피며 체계적인 케어를 제공하는 역할입니다.',
    growthNote: '감정적 소진을 예방하기 위해 업무 종료 후 명확하게 "스위치 오프"하는 루틴이 필수입니다.',
    contraReason: '환자 한 명 한 명에게 반복적으로 시간과 감정을 쏟는 케어 역할은 공감력과 성실성이 함께 높지 않으면 소진과 실수가 빠르게 누적됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 체계적이면서도 따뜻한 의료 케어 환경에 자연스럽게 맞아떨어집니다.`,
  },
  {
    title: 'UX 리서처·서비스 기획',
    // curiosity + patience + anxiety(사용자 감정 이해 — 공감 없이는 표면적 기획에 그침)
    w:      { curiosity: 0.28, patience: 0.25, cog: 0.17, anxiety: 0.18, diligence: 0.12 },
    contra: { patience: 0.18, curiosity: 0.13, cog: 0.10, anxiety: 0.15 },
    subRoles: ['UX 리서처', '프로덕트 매니저', '서비스 디자이너', '고객 경험 전략가'],
    detail: '사용자의 행동 이면에 있는 심층 동기를 파악하고, 그것을 제품·서비스 개선으로 연결하는 역할입니다.',
    growthNote: '리서치 결과를 이해관계자에게 설득력 있게 전달하는 프레젠테이션 스킬을 집중적으로 개발하세요.',
    contraReason: '사용자의 말을 끝까지 듣고 그 이면의 맥락을 분석하는 공감·탐구 역량이 부족하면 표면적 요구에만 반응하는 기획이 되기 쉽습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 사람과 맥락을 깊이 이해하고 제품에 반영하는 리서치 역할에 강점을 보입니다.`,
  },

  // ── 의료 계열 ──────────────────────────────────────────────────────────
  {
    title: '의사·의학직',
    // diligence + cog 핵심, patience + humility 보조, anxiety 미약 / 고불안 = 응급 판단 마비
    w:           { diligence: 0.33, cog: 0.28, patience: 0.18, humility: 0.14, anxiety: 0.07 },
    contra:      { diligence: 0.20, cog: 0.15, patience: 0.10 },
    penalizeHigh: { anxiety: 0.10 },
    subRoles: ['임상의·전문의', '연구중심 의사', '의료 정보학자', '공중보건 전문가'],
    detail: '방대한 의학 지식을 빠르게 통합하고 불완전한 정보 속에서 정확한 판단을 내려야 하는 환경입니다.',
    growthNote: '환자와의 공감적 소통(bedside manner)을 의도적으로 개발하세요. 진단 능력만큼 신뢰 관계가 치료 결과에 영향을 미칩니다.',
    contraReason: '수년간의 지식 축적, 임상 판단력, 환자와의 신뢰 형성이 동시에 요구되는 환경에서 분석력이나 공감력 중 하나라도 낮다면 직무 스트레스가 크게 높아집니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 균형을 이루는 이 프로필은 정밀한 판단과 높은 책임감이 요구되는 의료 환경에 강점을 가집니다.`,
  },

  // ── 콘텐츠·창작 계열 ──────────────────────────────────────────────────
  {
    title: '작가·저널리스트',
    // O + H + cog — 탐구·정직이 핵심, anxiety는 글의 감정적 깊이에 기여
    w:      { curiosity: 0.38, humility: 0.20, diligence: 0.18, cog: 0.14, anxiety: 0.10 },
    contra: { curiosity: 0.20, diligence: 0.10, anxiety: 0.10 },
    subRoles: ['논픽션 작가', '탐사보도 기자', '콘텐츠 전략가', '편집장·에디터'],
    detail: '다양한 분야를 넘나들며 깊이 탐구하고, 그 핵심을 독자가 공감할 수 있는 언어로 변환하는 능력이 이 커리어의 핵심입니다.',
    growthNote: '글쓰기는 결과물이 독자에게 노출되는 커리어입니다. 초기 피드백을 지나치게 내면화하지 않는 심리적 내성이 중요합니다.',
    contraReason: '광범위한 탐구와 이를 정제된 언어로 끝까지 완성하는 끈기가 함께 필요한데, 어느 하나가 약하면 아이디어만 넘치거나 깊이 없는 글이 되기 쉽습니다.',
    descFn: (t) => `${t[0]}이(가) 뒷받침하는 이 프로필은 탐구한 것을 언어로 정제해 세상에 전달하는 작업에 자연스럽게 끌립니다.`,
  },
  {
    title: '예술가·창작자',
    // O + anxiety(감수성이 창작 에너지), anxiety 낮으면 감수성 부족 → 창작 동력 약화
    w:      { curiosity: 0.40, anxiety: 0.25, humility: 0.15, diligence: 0.15, patience: 0.05 },
    contra: { curiosity: 0.25, boldness: 0.10, anxiety: 0.15 },
    subRoles: ['시각 예술가', '영화·영상 감독', '음악 프로듀서', '독립 크리에이터'],
    detail: '내면의 탐구와 새로운 표현 방식을 끊임없이 실험하는 창작 환경에서, 높은 개방성과 감수성이 독창적인 작품의 원천이 됩니다.',
    growthNote: '창작 활동의 경제적 지속 가능성을 위해 자신의 작업을 알리고 유통하는 비즈니스 측면도 함께 고민하세요.',
    contraReason: '내면의 감수성과 새로운 표현에 대한 탐구심이 낮다면 창작의 원천 에너지 자체가 약해집니다. 정서적으로 안정적일수록 예술적 긴장이 사라질 수 있습니다.',
    descFn: (t) => `${t[0]}이(가) 돋보이는 이 프로필은 내면을 탐구하고 세상에 없던 표현을 만드는 창작 환경에서 진정한 몰입을 경험합니다.`,
  },

  // ── 데이터·기술 계열 ──────────────────────────────────────────────────
  {
    title: '소프트웨어 엔지니어',
    // cog + curiosity + diligence 삼각형, boldness 불필요
    w:      { cog: 0.35, curiosity: 0.30, diligence: 0.30, humility: 0.05 },
    contra: { cog: 0.20, diligence: 0.20, curiosity: 0.10 },
    subRoles: ['백엔드 엔지니어', '풀스택 개발자', '시스템 아키텍트', '개발 팀 리드'],
    detail: '복잡한 시스템을 논리적으로 분해하고 체계적으로 구축하는 작업은 분석적 사고력과 끈질긴 문제 해결 의지를 동시에 요구합니다.',
    growthNote: '기술적 역량 외에 비기술 이해관계자와 소통하는 능력을 키우면 시니어 엔지니어로의 성장 속도가 빨라집니다.',
    contraReason: '복잡한 시스템을 논리적으로 분해하고 오류를 끈질기게 추적하는 것을 즐기지 않는다면 개발 환경의 반복적 문제 해결이 소진으로 이어집니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 복잡한 기술 시스템을 설계하고 구축하는 엔지니어링 환경에 잘 적응합니다.`,
  },
  {
    title: '데이터 사이언티스트',
    // cog 최우선, curiosity 필수 / 고대담성 = 분석보다 행동 선호, 정밀 작업 기피
    w:           { cog: 0.40, curiosity: 0.35, diligence: 0.25 },
    contra:      { cog: 0.25, curiosity: 0.15, diligence: 0.10 },
    penalizeHigh: { boldness: 0.08 },
    subRoles: ['ML 엔지니어', '데이터 애널리스트', 'AI 리서처', '비즈니스 인텔리전스 전문가'],
    detail: '데이터에서 숨겨진 패턴을 발견하고 의미 있는 인사이트를 도출하는 과정이 이 프로필의 탐구·분석 성향과 완벽하게 맞아떨어집니다.',
    growthNote: '분석 결과를 비데이터 직군에게 이해시키는 데이터 스토리텔링 능력이 커리어 성장의 핵심 레버입니다.',
    contraReason: '숫자와 패턴에서 의미를 찾는 탐구심과 분석적 정밀성이 낮다면 데이터가 단순한 숫자 덩어리로 느껴지고, 모델링의 반복 작업이 금방 지루해집니다.',
    descFn: (t) => `${t[0]}이(가) 돋보이는 이 프로필은 데이터 속에서 패턴과 의미를 찾아내는 분석적 탐구에 강한 동기를 느낍니다.`,
  },
  {
    title: '공학자·기술직',
    // diligence + cog 핵심, curiosity는 소량(설계 흥미) — 매우 높으면 반복 적용 업무에 답답함
    w:           { diligence: 0.42, cog: 0.32, curiosity: 0.16, boldness: 0.10 },
    contra:      { diligence: 0.25, cog: 0.15 },
    penalizeHigh: { curiosity: 0.12 },
    subRoles: ['기계·전자 엔지니어', '건설·토목 기술직', '제조 공정 엔지니어', '품질관리 전문가'],
    detail: '기술적 정확성과 반복적인 문제 해결을 요구하는 환경입니다. 높은 성실성과 분석 능력의 조합이 복잡한 기술 문제를 체계적으로 해결하는 데 특히 강점을 발휘합니다.',
    growthNote: '기술 역량이 핵심이지만, 프로젝트 관리와 팀 내 소통 능력을 조기에 개발하면 리드 엔지니어로의 성장이 빨라집니다.',
    contraReason: '기술적 정확성과 반복 검증을 즐기지 않으면 품질과 안전이 최우선인 엔지니어링 문화에서 지속적인 압박을 느끼게 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 기술적 정확성과 체계적 문제 해결이 요구되는 공학 환경에서 꾸준히 성장합니다.`,
  },

  // ── 리더십·비즈니스 계열 ──────────────────────────────────────────────
  {
    title: '경영자·임원',
    // boldness 최우선, 높은 겸손함·높은 불안감은 경쟁적 리더십 문화와 불일치
    w:           { boldness: 0.45, diligence: 0.25, cog: 0.20, curiosity: 0.10 },
    contra:      { boldness: 0.30, diligence: 0.10 },
    penalizeHigh: { humility: 0.15, anxiety: 0.14 },
    subRoles: ['스타트업 CEO', '대기업 임원', '사업부장', '조직 변화 관리자'],
    detail: '불확실성이 높은 상황에서 빠르게 결정을 내리고 조직을 하나의 방향으로 이끄는 역할입니다.',
    growthNote: '결단력이 강점이지만, 중요한 결정일수록 다양한 관점을 충분히 수집하는 프로세스를 의도적으로 만드세요.',
    contraReason: '불확실한 상황에서 빠르게 결단을 내리고 전면에 나서는 담대함이 낮다면 리더십 역할의 압박이 지속적 스트레스가 됩니다. 높은 겸손함은 경쟁적 임원 문화와 충돌하기 쉽습니다.',
    descFn: (t) => `${t[0]}이(가) 두드러지는 이 프로필은 조직을 이끌고 전략적 결정을 주도하는 리더십 환경에서 강점을 발휘합니다.`,
  },
  {
    title: '창업가·스타트업',
    // boldness + curiosity 필수, 높은 겸손함·높은 불안감은 피칭·도전에 방해
    w:           { boldness: 0.35, curiosity: 0.30, diligence: 0.25, cog: 0.10 },
    contra:      { boldness: 0.25, curiosity: 0.15 },
    penalizeHigh: { humility: 0.10, anxiety: 0.10 },
    subRoles: ['테크 스타트업 창업', '소셜벤처 창업', '제품 기반 창업', '프리랜서 전문가'],
    detail: '새로운 아이디어를 빠르게 실험하고 실패에서 학습하는 반복 사이클이 이 프로필의 호기심·도전 성향과 잘 맞습니다.',
    growthNote: '창업은 아이디어보다 실행과 팀이 더 중요합니다. 자신의 약점을 보완하는 공동창업자나 초기 팀 구성에 집중하세요.',
    contraReason: '불확실성을 즐기며 빠르게 피벗하는 도전 성향과 자기 확신이 약하다면 창업의 혼돈 속에서 방향을 잃기 쉽습니다. 과도한 겸손함은 투자 유치나 영업에서 약점이 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 새 아이디어를 빠르게 현실로 만드는 창업·스타트업 환경에 잘 맞습니다.`,
  },
  {
    title: '마케팅·광고 기획',
    // boldness + curiosity + anxiety(트렌드·감성 민감성), 높은 겸손함 = 자기주장 약화
    w:           { boldness: 0.28, curiosity: 0.26, diligence: 0.16, patience: 0.10, anxiety: 0.20 },
    contra:      { boldness: 0.18, curiosity: 0.10, anxiety: 0.15 },
    penalizeHigh: { humility: 0.10 },
    subRoles: ['브랜드 전략가', '디지털 마케터', '크리에이티브 디렉터', 'PR 전문가'],
    detail: '소비자 심리를 이해하고 그것을 설득력 있는 메시지로 변환하는 역할입니다.',
    growthNote: '데이터 기반 마케팅이 강화되는 추세입니다. 창의적 감각에 더해 분석 지표를 읽는 능력을 함께 키우세요.',
    contraReason: '설득력 있는 자기표현과 새로운 트렌드에 대한 민감성이 부족하다면 메시지 전달력이 약해지고, 높은 겸손함은 자기주장이 핵심인 마케팅·피칭 상황에서 발목을 잡습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 뒷받침하는 이 프로필은 사람을 이해하고 설득하는 마케팅·커뮤니케이션 역할에 자연스럽게 끌립니다.`,
  },

  // ── 공공·행정 계열 ────────────────────────────────────────────────────
  {
    title: '공무원·행정직',
    // 고호기심 = 관료 속도에 답답함, 고대담성 = 기존 질서에 반발 경향
    w:           { diligence: 0.40, humility: 0.25, patience: 0.20, cog: 0.15 },
    contra:      { diligence: 0.20, humility: 0.15 },
    penalizeHigh: { curiosity: 0.18, boldness: 0.10 },
    subRoles: ['중앙부처 공무원', '지방자치단체 기획', '공공기관 정책연구', '감사·규제 전문가'],
    detail: '체계적인 절차와 공익을 중심으로 운영되는 조직에서 높은 성실성과 겸손함이 장기적 신뢰를 쌓는 토대가 됩니다.',
    growthNote: '빠른 변화보다 점진적 개선이 중심인 환경입니다. 성과가 느리게 드러나는 특성을 이해하고 장기적 관점을 유지하세요.',
    contraReason: '규정과 절차를 따르는 성실함보다 빠른 변화와 새로운 자극을 선호한다면, 관료적 속도와 반복 행정 업무가 쌓이는 공공 환경에서 답답함을 크게 느끼게 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 균형을 이루는 이 프로필은 체계적이고 공익 중심의 조직 환경에서 신뢰받는 구성원이 됩니다.`,
  },

  // ── 교육 계열 (교수와 구분) ───────────────────────────────────────────
  {
    title: '교사·교육자',
    // patience↑↑ + boldness(교실 통솔) + anxiety(학생 감정 상태 읽기 — 낮으면 일방 전달)
    w:      { patience: 0.34, diligence: 0.22, boldness: 0.18, curiosity: 0.13, anxiety: 0.13 },
    contra: { patience: 0.26, boldness: 0.12, anxiety: 0.12 },
    subRoles: ['초·중·고 교사', '특수교육 교사', '유아교육 전문가', '진로상담 교사'],
    detail: '매일 다른 아이들의 상태에 맞추어 같은 내용을 새롭게 전달하는 반복적 헌신이 이 커리어의 본질입니다. 높은 공감력과 현장 대응력이 핵심입니다.',
    growthNote: '교직은 번아웃이 높은 직군입니다. 동료 교사 네트워크와 방학을 활용한 자기 재충전 루틴을 일찍부터 설계하세요.',
    contraReason: '매일 다른 아이들의 상태에 맞추어 반복 설명하는 공감 인내력과 교실을 이끄는 표현력이 함께 부족하다면 교육 현장이 빠르게 소진의 장이 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 다음 세대를 직접 만나고 성장을 함께 목격하는 교육 현장에 자연스럽게 어울립니다.`,
  },

  // ── 법률 계열 ─────────────────────────────────────────────────────────
  {
    title: '변호사·법조인',
    // cog + boldness 핵심, 높은 불안감·높은 겸손함은 법정 대립에서 약점
    w:           { cog: 0.35, boldness: 0.30, diligence: 0.25, curiosity: 0.10 },
    contra:      { cog: 0.20, boldness: 0.20, diligence: 0.10 },
    penalizeHigh: { anxiety: 0.10, humility: 0.08 },
    subRoles: ['민사·형사 변호사', '기업법무 변호사', '검사·판사', '법학 연구원'],
    detail: '복잡한 사실관계를 법리로 재구성하고 상대방 논리를 논박하는 이 역할은 날카로운 분석력과 흔들리지 않는 표현력을 동시에 요구합니다.',
    growthNote: '법률 지식보다 의뢰인과의 신뢰 관계 형성이 장기 커리어를 결정합니다. 공감적 경청 능력을 의도적으로 개발하세요.',
    contraReason: '법리를 정밀하게 구성하고 법정에서 자신 있게 주장을 관철하는 능력이 약하다면 법조 환경의 경쟁적 압박과 높은 정확성 요구가 지속적인 스트레스가 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 논리적 정밀성과 설득력이 요구되는 법률 환경에서 두각을 나타냅니다.`,
  },

  // ── 금융·회계 계열 ────────────────────────────────────────────────────
  {
    title: '금융 전문가·투자 분석가',
    // cog↑↑ + diligence + boldness, 높은 겸손함·높은 불안감은 투자 확신·경쟁에 방해
    w:           { cog: 0.40, diligence: 0.30, boldness: 0.20, curiosity: 0.10 },
    contra:      { cog: 0.25, diligence: 0.15 },
    penalizeHigh: { humility: 0.10, anxiety: 0.15 },
    subRoles: ['투자 분석가', '자산관리사(PB)', '투자은행 뱅커', '퀀트 애널리스트'],
    detail: '시장 데이터를 빠르게 해석하고 리스크를 계산하며 결단을 내리는 환경에서, 높은 분석력과 실행력의 조합이 핵심입니다.',
    growthNote: '금융 시장은 심리전이기도 합니다. 자신의 판단 편향(confirmation bias 등)을 주기적으로 점검하는 메타인지 능력이 장기 생존을 결정합니다.',
    contraReason: '시장 데이터를 빠르게 해석하고 결단을 내리는 분석력과 실행력이 약하다면 고압적인 금융 환경에서 지속적인 불안감을 느끼게 됩니다. 겸손함은 투자 확신을 흔들 수 있습니다.',
    descFn: (t) => `${t[0]}이(가) 돋보이는 이 프로필은 복잡한 숫자와 시장 흐름을 빠르게 해석하는 금융·투자 환경에서 강점을 발휘합니다.`,
  },
  {
    title: '회계사·세무사',
    // 고호기심·고대담성 = 혼자 수치 반복 검증하는 루틴을 못 견딤
    w:           { diligence: 0.50, cog: 0.25, humility: 0.15, patience: 0.10 },
    contra:      { diligence: 0.30, cog: 0.15 },
    penalizeHigh: { curiosity: 0.20, boldness: 0.10 },
    subRoles: ['공인회계사(CPA)', '세무사', '내부감사 전문가', '재무 컨트롤러'],
    detail: '수치의 정확성과 법규 준수가 절대적인 환경입니다. 꼼꼼함과 체계적 절차 준수 능력이 신뢰의 핵심 자산이 됩니다.',
    growthNote: '디지털 전환으로 단순 기장 업무는 자동화됩니다. 세무 전략 자문, M&A 실사, ESG 회계 등 고부가가치 영역으로 이동을 준비하세요.',
    contraReason: '수치를 끝까지 추적하고 규정을 꼼꼼히 준수하는 성향이 낮다면 오류 허용치가 극히 낮은 회계·세무 환경이 만성 스트레스의 원인이 됩니다.',
    descFn: (t) => `${t[0]}이(가) 두드러지는 이 프로필은 수치와 규정의 세계에서 정밀하고 신뢰받는 전문가로 성장합니다.`,
  },

  // ── 의료 확장 계열 ────────────────────────────────────────────────────
  {
    title: '약사·임상병리사',
    // diligence + cog 핵심, anxiety 소량 / 높은 호기심 = 루틴 프로토콜 반복에 답답함
    w:           { diligence: 0.38, cog: 0.28, humility: 0.15, patience: 0.13, anxiety: 0.06 },
    contra:      { diligence: 0.25, cog: 0.15 },
    penalizeHigh: { curiosity: 0.18 },
    subRoles: ['약사', '임상병리사', '의료기기 전문가', '병원약제팀'],
    detail: '약물 상호작용과 검사 수치를 정확하게 해석하고, 환자·의료진과의 소통에서 신뢰를 쌓는 전문직입니다.',
    growthNote: '약학·임상병리 분야는 빠르게 디지털화되고 있습니다. AI 진단 보조 도구와 디지털 치료제 영역에 관심을 갖는 것이 경쟁력이 됩니다.',
    contraReason: '약물 상호작용과 검사 수치를 정밀하게 파악하고 체계적 절차를 반복 준수하는 성향이 약하다면 의료 안전 사고의 리스크가 높아집니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 정밀한 의료 지식과 체계적 절차가 요구되는 의약 전문직에 잘 맞습니다.`,
  },
  {
    title: '물리치료사·작업치료사',
    // patience + diligence + anxiety(환자 심리적 회복 지지 — 낮으면 기계적 재활에 그침)
    w:      { patience: 0.34, diligence: 0.30, humility: 0.13, curiosity: 0.09, anxiety: 0.14 },
    contra: { patience: 0.22, diligence: 0.13, anxiety: 0.13 },
    subRoles: ['물리치료사', '작업치료사', '스포츠 재활 전문가', '노인 재활 전문가'],
    detail: '환자의 신체 기능 회복을 장기적으로 함께 추적하며, 작은 변화에 의미를 부여하고 지속적으로 격려하는 역할입니다.',
    growthNote: '환자의 회복 속도는 기대보다 느릴 수 있습니다. 단기 성과에 집착하지 않고 과정 자체에서 의미를 찾는 심리적 태도가 지속 가능성의 핵심입니다.',
    contraReason: '환자의 느린 회복 과정을 오래 함께하며 반복 케어를 지속하는 끈기가 부족하다면, 성과가 보이지 않는 시기에 빠르게 좌절하고 소진될 수 있습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 환자의 회복 여정을 가까이서 함께하는 재활 의료 역할에 자연스럽게 끌립니다.`,
  },

  // ── 공공 안전·봉사 계열 ───────────────────────────────────────────────
  {
    title: '경찰·소방·군인',
    // 고불안 = 위험 판단 저하, 고호기심 = 위계적 규율 구조 반발 경향
    w:           { boldness: 0.50, diligence: 0.30, patience: 0.10, curiosity: 0.10 },
    contra:      { boldness: 0.35, diligence: 0.15 },
    penalizeHigh: { anxiety: 0.20, curiosity: 0.10 },
    subRoles: ['경찰관', '소방관', '직업 군인', '해양경찰'],
    detail: '위험 상황에서 냉정하게 판단하고 신속하게 행동하는 역할로, 강한 대담성과 체계적 훈련의 조합이 핵심입니다.',
    growthNote: '신체적·심리적 외상(PTSD)에 노출될 수 있습니다. 동료 지원 시스템과 정기적인 심리 상담을 적극적으로 활용하세요.',
    contraReason: '위험 상황에서의 냉정한 판단력과 엄격한 훈련 규율 준수 의지가 낮다면, 강한 위험도와 군대식 규율 문화가 지속적인 부담이 됩니다.',
    descFn: (t) => `${t[0]}이(가) 두드러지는 이 프로필은 위험을 감수하고 타인을 지키는 공공 안전 역할에서 소명감을 찾습니다.`,
  },

  // ── 종교·가치 계열 ────────────────────────────────────────────────────
  {
    title: '성직자·종교지도자',
    // humility↑↑ + patience + anxiety(교인 고통에 깊이 공명 — 낮으면 형식적 위로에 그침)
    w:      { humility: 0.34, patience: 0.26, curiosity: 0.18, boldness: 0.09, anxiety: 0.13 },
    contra: { humility: 0.22, patience: 0.13, anxiety: 0.12 },
    subRoles: ['성직자·목사·스님', '종교 상담사', '영성 지도자', '종교 교육자'],
    detail: '개인의 삶과 공동체의 가치를 연결하는 역할로, 깊은 겸손함과 타인의 고통을 오래 함께할 수 있는 인내력이 소명의 토대가 됩니다.',
    growthNote: '종교 공동체의 변화하는 요구(심리적 지지, 사회적 역할)에 맞게 현대적 상담 역량과 사회 인식을 지속적으로 업데이트하세요.',
    contraReason: '자신을 낮추고 타인의 고통과 오래 함께하는 섬김의 자세가 내면화되지 않은 상태에서는 종교 지도자로서의 진정성을 유지하기 어렵습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 시너지를 이루는 이 프로필은 가치와 의미를 중심으로 사람과 연결되는 종교·영성 역할에 깊이 공명합니다.`,
  },

  // ── 컨설팅·전략 계열 ──────────────────────────────────────────────────
  {
    title: '경영 컨설턴트·전략기획',
    // cog + boldness 핵심, 고겸손·고불안 = 클라이언트 앞 설득력·확신 약화
    w:           { cog: 0.35, boldness: 0.30, curiosity: 0.20, diligence: 0.15 },
    contra:      { cog: 0.20, boldness: 0.20 },
    penalizeHigh: { humility: 0.08, anxiety: 0.08 },
    subRoles: ['전략 컨설턴트', '사업개발(BD) 전문가', '기업 전략기획', '경영혁신 컨설턴트'],
    detail: '다양한 산업의 복잡한 문제를 단기간에 파악하고 실행 가능한 해결책을 제안하는 역할입니다. 빠른 학습력과 설득력 있는 커뮤니케이션이 핵심입니다.',
    growthNote: '컨설팅은 슬라이드가 아니라 실행이 핵심입니다. 의뢰인이 실제로 변화를 만들 수 있도록 내부 역학을 읽는 정치적 감각을 함께 키우세요.',
    contraReason: '복잡한 문제를 빠르게 구조화하고 의뢰인 앞에서 설득력 있게 제시하는 분석력과 담대함이 약하다면 컨설팅의 빠른 속도와 압박이 강한 스트레스 요인이 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 복잡한 경영 문제를 빠르게 진단하고 설득력 있는 솔루션을 제시하는 역할에 강점을 보입니다.`,
  },
  {
    title: 'HR·조직개발·코치',
    // patience + anxiety(구성원 감정·동기 읽기 — 낮으면 형식적 HR에 그침) + boldness + curiosity
    w:      { patience: 0.26, anxiety: 0.22, boldness: 0.22, curiosity: 0.18, diligence: 0.12 },
    contra: { patience: 0.17, boldness: 0.12, anxiety: 0.18 },
    subRoles: ['HR 비즈니스 파트너', '조직개발(OD) 전문가', '임원 코치', '채용·인재관리 전문가'],
    detail: '사람과 조직의 잠재력을 끌어내는 역할로, 개인의 심리를 깊이 이해하면서도 조직 전체의 방향을 함께 조율하는 능력이 요구됩니다.',
    growthNote: '데이터 기반 HR(People Analytics)이 빠르게 성장하고 있습니다. 직관적 인사이트를 데이터로 뒷받침하는 역량이 차별화 포인트가 됩니다.',
    contraReason: '사람의 말을 끝까지 경청하는 공감력과 그룹 앞에서 퍼실리테이션을 이끄는 자신감이 함께 부족하다면 사람 중심 조직 역할에서 소진이 빠릅니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 사람과 조직을 동시에 이해하고 성장을 촉진하는 HR·코칭 역할에 자연스럽게 끌립니다.`,
  },

  // ── 디자인·미디어 계열 ────────────────────────────────────────────────
  {
    title: '그래픽·제품 디자이너',
    // curiosity + anxiety(미적 감수성 필수) + diligence(완성도) + humility(피드백 수용)
    // anxiety 낮으면 시각 언어 직관이 부족해 기능 위주 결과물에 그치기 쉬움
    w:      { curiosity: 0.30, anxiety: 0.25, diligence: 0.25, humility: 0.15, cog: 0.05 },
    contra: { curiosity: 0.15, diligence: 0.10, anxiety: 0.22 },
    subRoles: ['그래픽 디자이너', 'UI 디자이너', '제품(산업) 디자이너', '브랜드 아이덴티티 디자이너'],
    detail: '시각적 아름다움과 기능적 목적을 동시에 충족하는 결과물을 만드는 역할입니다. 클라이언트·사용자의 피드백을 수용하며 반복 개선하는 능력이 핵심입니다.',
    growthNote: 'AI 디자인 툴이 기초 작업을 대체하는 속도가 빠릅니다. 브랜드 전략과 사용자 심리를 읽는 상위 레벨 사고로 포지셔닝을 이동하세요.',
    contraReason: '새로운 시각 언어를 끊임없이 탐구하고 완성도를 높이기 위해 반복 수정하는 집착이 낮다면 클라이언트의 피드백 루프 속에서 창의성이 빠르게 소진됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 아이디어를 시각 언어로 정제하고 완성도 높은 결과물로 구현하는 디자인 환경에 잘 맞습니다.`,
  },
  {
    title: 'PD·영상 크리에이터',
    // curiosity + boldness(팀 리드·방향 제시) + diligence(프로덕션) + anxiety(감성적 스토리 감각)
    w:      { curiosity: 0.30, boldness: 0.25, diligence: 0.22, anxiety: 0.18, cog: 0.05 },
    contra: { curiosity: 0.15, boldness: 0.15, anxiety: 0.18 },
    subRoles: ['방송 PD', '유튜브·OTT 크리에이터', '다큐멘터리 감독', '광고 크리에이티브 디렉터'],
    detail: '아이디어를 영상 언어로 번역하고 팀을 이끌어 하나의 완성된 콘텐츠로 만드는 역할입니다. 창의성과 실행력, 리더십이 동시에 필요합니다.',
    growthNote: '숏폼·유튜브 시대에 PD의 역할 경계가 확장됩니다. 1인 제작 역량과 팀 프로덕션 역량을 함께 갖출수록 경쟁력이 높아집니다.',
    contraReason: '이야기를 발굴하는 탐구심과 팀을 하나의 방향으로 이끄는 리더십이 동시에 약하다면 대규모 프로덕션의 혼돈을 통제하기 어렵습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 스토리와 영상으로 사람의 감정을 움직이는 콘텐츠 제작 환경에서 주도적인 역할을 합니다.`,
  },
  {
    title: '건축가·인테리어 디자이너',
    // curiosity + cog(구조·법규) + diligence(설계 완성도) + anxiety(공간 미적 감수성)
    // 기술·논리만으론 부족 — 공간의 감각적 완성도는 anxiety(감수성)가 받쳐줘야 함
    w:      { curiosity: 0.28, cog: 0.28, diligence: 0.24, anxiety: 0.15, humility: 0.05 },
    contra: { curiosity: 0.15, cog: 0.15, diligence: 0.12, anxiety: 0.15 },
    subRoles: ['건축사', '인테리어 디자이너', '도시계획가', '공간 브랜딩 전문가'],
    detail: '인간의 삶을 담는 공간을 상상하고, 구조·법규·미학을 통합해 현실로 구현하는 역할입니다. 긴 호흡의 프로젝트를 끝까지 완성하는 인내력이 필요합니다.',
    growthNote: '친환경 건축, 모듈러 주택, 스마트 오피스 등 새로운 공간 패러다임이 빠르게 등장하고 있습니다. 지속가능성 관련 전문 자격을 조기에 취득하세요.',
    contraReason: '공간 아이디어를 구조·법규·시공 현실에 맞게 정밀하게 구현하는 기술적 끈기가 부족하다면 설계는 실현되지 못한 드림으로 그칩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 상상한 공간을 정밀하게 현실로 구현하는 건축·디자인 환경에서 깊은 만족을 찾습니다.`,
  },

  // ── 퍼포먼스·엔터테인먼트 계열 ───────────────────────────────────────
  {
    title: '연예인·배우·뮤지션',
    // boldness↑↑ (무대·카메라) + anxiety(감정 표현력 — 낮으면 감정 없는 퍼포먼스)
    w:      { boldness: 0.42, anxiety: 0.28, curiosity: 0.20, diligence: 0.10 },
    contra: { boldness: 0.32, curiosity: 0.10, anxiety: 0.18 },
    subRoles: ['배우', '가수·뮤지션', '개그맨·MC', '스트리머·인플루언서'],
    detail: '대중 앞에서 감정을 표현하고 에너지를 전달하는 역할로, 무대에서의 담대함과 내면의 감수성이 동시에 요구되는 독특한 조합입니다.',
    growthNote: '노출과 평가가 일상인 커리어입니다. 외부 피드백과 자신의 정체성을 분리하는 심리적 경계 설정이 장기 지속성의 핵심입니다.',
    contraReason: '대중의 시선과 평가를 에너지원으로 전환하는 무대 담대함이 낮다면 지속적 노출이 요구되는 퍼포먼스 커리어의 심리적 부담이 매우 클 것입니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 대중 앞에서 감정을 전달하고 에너지로 공간을 채우는 퍼포먼스 역할에 자연스럽게 끌립니다.`,
  },

  // ── 식음료·라이프스타일 계열 ──────────────────────────────────────────
  {
    title: '셰프·요리 전문가',
    // diligence + curiosity + anxiety(맛·감각 민감성 — 낮으면 레시피 기계 실행에 그침) + boldness(주방 리더십)
    w:      { diligence: 0.34, curiosity: 0.26, boldness: 0.16, patience: 0.08, anxiety: 0.16 },
    contra: { diligence: 0.22, curiosity: 0.13, anxiety: 0.12 },
    subRoles: ['레스토랑 셰프', '파티시에·제과 전문가', '푸드 스타일리스트', '요리 연구가'],
    detail: '재료의 특성을 탐구하고 맛의 조합을 실험하는 창의성과, 수백 번 반복해도 흔들리지 않는 기술적 완성도가 이 커리어의 두 축입니다.',
    growthNote: '주방은 체력·심리 소모가 큰 환경입니다. 셰프로서의 브랜드(소셜미디어, 팝업 등)를 조기에 구축하면 물리적 주방에 의존하지 않는 수익 구조를 만들 수 있습니다.',
    contraReason: '매일 같은 메뉴를 흔들리지 않는 퀄리티로 반복 완성하는 숙련 집착과 재료에 대한 탐구심이 함께 약하다면 주방 환경이 단순 노동으로만 느껴질 수 있습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 재료를 탐구하고 맛을 구현하는 반복적 창작 환경에서 깊은 몰입을 경험합니다.`,
  },

  // ── 스포츠·신체 계열 ──────────────────────────────────────────────────
  {
    title: '스포츠·피트니스 전문가',
    // 고호기심 = 반복 훈련에 지적 자극 부족, 고겸손 = 경쟁·자기확신 약화
    w:           { boldness: 0.45, diligence: 0.40, curiosity: 0.10, patience: 0.05 },
    contra:      { boldness: 0.30, diligence: 0.20 },
    penalizeHigh: { curiosity: 0.12, humility: 0.08 },
    subRoles: ['프로 스포츠 선수', '스포츠 코치·감독', '개인 트레이너(PT)', '스포츠 에이전트'],
    detail: '신체적 한계를 반복적으로 극복하는 훈련과 경쟁 환경에서, 강한 의지와 규율이 성과를 만드는 직군입니다.',
    growthNote: '선수 커리어는 신체 나이에 제약을 받습니다. 현역 시절부터 코칭, 해설, 스포츠 비즈니스 등 다음 단계를 준비하는 이중 트랙 전략이 중요합니다.',
    contraReason: '신체적 한계를 반복적으로 극복하는 강인한 의지와 경쟁적 담대함이 없으면 스포츠 환경의 강도 높은 훈련 문화를 장기적으로 지속하기 어렵습니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 신체적 도전과 반복 훈련을 통해 한계를 확장하는 스포츠 환경에서 강한 동기를 느낍니다.`,
  },

  // ── 항공·우주 계열 ────────────────────────────────────────────────────
  {
    title: '파일럿·항공우주 전문가',
    // boldness + diligence + cog, 높은 불안감 = 비상상황 판단 저하 → 안전 리스크
    w:           { boldness: 0.35, diligence: 0.40, cog: 0.25 },
    contra:      { boldness: 0.25, diligence: 0.30 },
    penalizeHigh: { anxiety: 0.28 },
    subRoles: ['민항기 파일럿', '군 조종사', '항공우주 엔지니어', '드론 전문가'],
    detail: '생명과 직결된 절차를 수천 번 반복하면서도 비상 상황에서 냉정하게 판단하는 능력이 요구되는 역할입니다. 규율과 담대함의 조합이 핵심입니다.',
    growthNote: 'UAM(도심항공모빌리티)과 우주 상업화로 관련 직군이 빠르게 확장되고 있습니다. 전통적 조종사 경력에 더해 항공 시스템·자율비행 분야 지식을 갖추면 유리합니다.',
    contraReason: '수천 번의 절차 반복과 비상 상황에서의 냉정한 판단을 동시에 요구하는 항공 환경은, 규율 준수 의지와 담대한 결단력이 모두 높아야 합니다. 어느 하나라도 낮으면 안전 리스크가 됩니다.',
    descFn: (t) => `${t[0]}과 ${t[1]}이(가) 결합된 이 프로필은 하늘을 무대로 정밀함과 담대함을 동시에 발휘하는 항공 환경에서 최고의 역량을 발휘합니다.`,
  },
]

function n(v: number): number {
  return Math.min(Math.max((v - 1) / 4, 0), 1)
}

// raw 0→20%, raw 0.5→60%, raw 1.0→99%
function toFit(raw: number): number {
  return Math.round(Math.min(99, Math.max(20, 20 + raw * 79)))
}

function topTwoContributors(
  career: CareerDef,
  facets: FacetMap,
  cogScore: number,
): string[] {
  const contribs: [string, number][] = []
  for (const [key, w] of Object.entries(career.w)) {
    if (!w) continue
    const val = key === 'cog' ? cogScore : n((facets as unknown as Record<string, number>)[key] ?? 3)
    contribs.push([FACET_LABELS[key] ?? key, val * w])
  }
  contribs.sort((a, b) => b[1] - a[1])
  return contribs.slice(0, 2).map(c => c[0])
}

export function computeCareers(facets: FacetMap, cogScore: number): CareerScore[] {
  const f = facets as unknown as Record<string, number>

  const scored = CAREERS.map((career) => {
    // 긍정 가중합
    let raw = 0
    for (const [key, w] of Object.entries(career.w)) {
      if (!w) continue
      const val = key === 'cog' ? cogScore : n(f[key] ?? 3)
      raw += val * w
    }

    // 필수 조건 패널티: 해당 trait가 낮을수록 감점
    if (career.contra) {
      for (const [key, w] of Object.entries(career.contra)) {
        if (!w) continue
        const val = key === 'cog' ? cogScore : n(f[key] ?? 3)
        raw -= (1 - val) * w
      }
    }

    // 방해 trait 패널티: 해당 trait가 높을수록 감점
    if (career.penalizeHigh) {
      for (const [key, w] of Object.entries(career.penalizeHigh)) {
        if (!w) continue
        const val = key === 'cog' ? cogScore : n(f[key] ?? 3)
        raw -= val * w
      }
    }

    const top = topTwoContributors(career, facets, cogScore)
    return {
      title: career.title,
      fit: toFit(Math.max(0, raw)),
      reason: career.descFn(top),
      contraReason: career.contraReason,
      detail: career.detail,
      growthNote: career.growthNote,
      subRoles: career.subRoles,
    }
  })

  return scored
    .sort((a, b) => b.fit - a.fit)
}
