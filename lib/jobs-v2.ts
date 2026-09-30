// 유료 보고서 "직장에서의 나" 직무 추천 (v2)
// 추천 = 흥미(무엇을 하고 싶은가) 중심 + HEXACO(어떻게 일하는가) + 가치 조건(어떤 환경이 필요한가)
// 원칙: 정직·겸손(H) 낮음을 어떤 직무의 '적합 조건'으로도 쓰지 않는다 (특정 직무에 낙인 방지)

import type { HexacoFactor } from './scoring-hexaco'

export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
export type InterestTag =
  | '기계' | '제작' | '야외·신체'
  | '자연과학·데이터' | '수리·IT' | '사회과학·철학'
  | '표현·글' | '심미·디자인' | '발상·기획'
  | '교육' | '상담' | '돌봄'
  | '협상·성사' | '리더십' | '사업'
  | '자료 관리' | '사무·행정' | '재무'
export type WorkValue = '성장' | '도전' | '안정' | '보상' | '자율' | '동료' | '인정' | '주도' | '기여' | '균형'

export interface JobV2 {
  id: string
  name: string
  code: Riasec[]                                   // Holland 코드 (1~3순위)
  tags: InterestTag[]                              // 세부 흥미
  hexaco: Partial<Record<HexacoFactor, 1 | -1>>    // 이 직무에서 특히 유리한 성향만
  supports: WorkValue[]                            // 이 직무 환경이 잘 채워주는 가치
  lacks: WorkValue[]                               // 이 직무 환경에서 보통 채우기 어려운 가치
}

export const JOBS_V2: JobV2[] = [
  // ── 현실형 R ──
  { id: 'mech-eng',     name: '기계·설비 엔지니어',       code: ['R','I','C'], tags: ['기계'],              hexaco: { C: 1 },            supports: ['안정','성장'],        lacks: [] },
  { id: 'electric',     name: '전기·전자 기술자',         code: ['R','I','C'], tags: ['기계'],              hexaco: { C: 1 },            supports: ['안정','보상'],        lacks: [] },
  { id: 'mechanic',     name: '자동차·항공 정비사',       code: ['R','C','I'], tags: ['기계'],              hexaco: { C: 1, E: -1 },     supports: ['안정'],               lacks: ['주도'] },
  { id: 'construction', name: '건축·인테리어 시공 전문가', code: ['R','E','A'], tags: ['제작'],              hexaco: { E: -1 },           supports: ['보상','자율'],        lacks: ['균형'] },
  { id: 'craft',        name: '목공·공예 장인',           code: ['R','A'],     tags: ['제작'],              hexaco: { C: 1 },            supports: ['자율','성장'],        lacks: ['안정','보상'] },
  { id: 'chef',         name: '셰프·조리 전문가',         code: ['R','A','E'], tags: ['제작'],              hexaco: { E: -1, C: 1 },     supports: ['성장','도전'],        lacks: ['균형'] },
  { id: 'trainer',      name: '스포츠·피트니스 트레이너',  code: ['R','S','E'], tags: ['야외·신체','교육'],   hexaco: { X: 1 },            supports: ['자율','기여'],        lacks: ['안정'] },
  { id: 'police-fire',  name: '경찰·소방관',             code: ['R','S','E'], tags: ['야외·신체','돌봄'],   hexaco: { E: -1, C: 1 },     supports: ['안정','기여'],        lacks: ['균형','자율'] },
  { id: 'smart-farm',   name: '농업·스마트팜 운영',        code: ['R','I','E'], tags: ['야외·신체','사업'],   hexaco: { C: 1 },            supports: ['자율'],               lacks: ['안정'] },

  // ── 탐구형 I ──
  { id: 'data-analyst', name: '데이터 분석가',            code: ['I','C','R'], tags: ['자연과학·데이터','수리·IT'], hexaco: { C: 1, O: 1 }, supports: ['성장','보상'],   lacks: [] },
  { id: 'developer',    name: '소프트웨어 개발자',         code: ['I','R','C'], tags: ['수리·IT'],           hexaco: { O: 1 },            supports: ['성장','보상','자율'], lacks: [] },
  { id: 'scientist',    name: '자연과학·공학 연구원',      code: ['I','R'],     tags: ['자연과학·데이터'],    hexaco: { O: 1, C: 1 },      supports: ['성장','자율'],        lacks: ['보상'] },
  { id: 'social-research', name: '사회과학·정책 연구원',   code: ['I','S','A'], tags: ['사회과학·철학'],      hexaco: { O: 1 },            supports: ['기여','성장'],        lacks: ['보상'] },
  { id: 'doctor',       name: '의사',                    code: ['I','S','R'], tags: ['자연과학·데이터','돌봄'], hexaco: { C: 1, E: -1 }, supports: ['보상','기여','인정'], lacks: ['균형'] },
  { id: 'pharmacist',   name: '약사·임상병리사',          code: ['I','C','R'], tags: ['자연과학·데이터'],    hexaco: { C: 1 },            supports: ['안정','보상'],        lacks: ['주도'] },
  { id: 'ux-research',  name: 'UX 리서처',               code: ['I','A','S'], tags: ['사회과학·철학','발상·기획'], hexaco: { O: 1, A: 1 }, supports: ['성장','동료'],   lacks: [] },

  // ── 예술형 A ──
  { id: 'writer',       name: '작가·에디터',              code: ['A','I'],     tags: ['표현·글'],            hexaco: { O: 1 },            supports: ['자율','성장'],        lacks: ['안정','보상'] },
  { id: 'designer',     name: '그래픽·UI 디자이너',        code: ['A','E','R'], tags: ['심미·디자인'],        hexaco: { O: 1 },            supports: ['자율','성장'],        lacks: [] },
  { id: 'creator',      name: '영상 PD·크리에이터',        code: ['A','E','S'], tags: ['발상·기획','표현·글'], hexaco: { O: 1, X: 1 },      supports: ['자율','인정'],        lacks: ['안정','균형'] },
  { id: 'architect',    name: '건축가',                   code: ['A','I','R'], tags: ['심미·디자인'],        hexaco: { O: 1, C: 1 },      supports: ['인정','성장'],        lacks: ['균형'] },
  { id: 'performer',    name: '공연·음악 아티스트',        code: ['A','E','S'], tags: ['표현·글'],            hexaco: { O: 1, X: 1 },      supports: ['자율','인정'],        lacks: ['안정','보상'] },
  { id: 'brand-marketer', name: '브랜드·콘텐츠 마케터',    code: ['A','E'],     tags: ['발상·기획'],          hexaco: { O: 1, X: 1 },      supports: ['성장','동료'],        lacks: [] },

  // ── 사회형 S ──
  { id: 'teacher',      name: '교사',                    code: ['S','A','E'], tags: ['교육'],               hexaco: { X: 1, C: 1 },      supports: ['안정','기여','균형'], lacks: ['보상'] },
  { id: 'counselor',    name: '상담심리사',               code: ['S','I','A'], tags: ['상담','사회과학·철학'], hexaco: { A: 1, H: 1 },      supports: ['기여'],               lacks: ['보상'] },
  { id: 'nurse',        name: '간호사',                   code: ['S','I','R'], tags: ['돌봄'],               hexaco: { C: 1, A: 1 },      supports: ['안정','기여'],        lacks: ['균형'] },
  { id: 'social-worker', name: '사회복지사',              code: ['S','E','C'], tags: ['돌봄','상담'],         hexaco: { A: 1, H: 1 },      supports: ['기여','동료'],        lacks: ['보상'] },
  { id: 'therapist',    name: '물리·작업치료사',          code: ['S','R','I'], tags: ['돌봄'],               hexaco: { A: 1 },            supports: ['안정','기여'],        lacks: [] },
  { id: 'hr',           name: 'HR·사내 교육 담당자',       code: ['S','E','C'], tags: ['교육','상담'],         hexaco: { X: 1, A: 1 },      supports: ['동료','균형'],        lacks: [] },
  { id: 'early-edu',    name: '보육교사·유아교육',         code: ['S','A'],     tags: ['교육','돌봄'],         hexaco: { A: 1 },            supports: ['기여','동료'],        lacks: ['보상'] },

  // ── 진취형 E ──
  { id: 'founder',      name: '창업가',                   code: ['E','A','I'], tags: ['사업','리더십'],       hexaco: { X: 1, O: 1, E: -1 }, supports: ['자율','주도','보상','도전'], lacks: ['안정','균형'] },
  { id: 'bizdev',       name: '사업개발·기업 영업',        code: ['E','C','S'], tags: ['협상·성사'],          hexaco: { X: 1, E: -1 },     supports: ['보상','도전'],        lacks: ['안정'] },
  { id: 'consultant',   name: '경영 컨설턴트',             code: ['E','I','C'], tags: ['사업','리더십'],       hexaco: { X: 1, C: 1, O: 1 }, supports: ['성장','보상','도전'], lacks: ['균형'] },
  { id: 'lawyer',       name: '변호사',                   code: ['E','I','S'], tags: ['협상·성사'],          hexaco: { C: 1, E: -1 },     supports: ['보상','인정'],        lacks: ['균형'] },
  { id: 'pm',           name: '프로젝트·프로덕트 매니저',   code: ['E','C','I'], tags: ['리더십','발상·기획'],   hexaco: { X: 1, C: 1 },      supports: ['주도','성장'],        lacks: [] },
  { id: 'hospitality',  name: '호텔·서비스 매니저',        code: ['E','S','C'], tags: ['리더십'],             hexaco: { X: 1, A: 1 },      supports: ['동료'],               lacks: ['균형'] },
  { id: 'investment',   name: '부동산·투자 전문가',        code: ['E','C','I'], tags: ['협상·성사','재무'],     hexaco: { E: -1 },           supports: ['보상','자율'],        lacks: ['안정'] },

  // ── 관습형 C ──
  { id: 'accountant',   name: '회계사·세무사',            code: ['C','E','I'], tags: ['재무'],               hexaco: { C: 1, H: 1 },      supports: ['안정','보상'],        lacks: [] },
  { id: 'civil-servant', name: '공무원·공공행정',          code: ['C','E','S'], tags: ['사무·행정'],          hexaco: { C: 1 },            supports: ['안정','균형'],        lacks: ['보상','자율'] },
  { id: 'finance-ops',  name: '은행·보험 금융 사무',       code: ['C','E','S'], tags: ['재무','사무·행정'],     hexaco: { C: 1 },            supports: ['안정','보상'],        lacks: ['자율'] },
  { id: 'quality',      name: '품질관리·검사',            code: ['C','R','I'], tags: ['자료 관리'],          hexaco: { C: 1 },            supports: ['안정'],               lacks: ['주도'] },
  { id: 'logistics',    name: '물류·유통 관리',           code: ['C','R','E'], tags: ['자료 관리','사무·행정'], hexaco: { C: 1 },            supports: ['안정'],               lacks: [] },
  { id: 'librarian',    name: '사서·기록관리',            code: ['C','S','A'], tags: ['자료 관리'],          hexaco: { C: 1 },            supports: ['안정','균형'],        lacks: ['보상'] },
  { id: 'legal-ops',    name: '법무·특허 사무',           code: ['C','E','I'], tags: ['사무·행정'],          hexaco: { C: 1 },            supports: ['안정'],               lacks: [] },
]

// ── 채점 ──────────────────────────────────────────────────────────────────────
export interface CareerInput {
  hexaco: Record<HexacoFactor, number>           // 1~5 요인 평균
  interest: Record<Riasec, number>               // 1~5 유형 평균 (3문항)
  interestTags: Partial<Record<InterestTag, number>> // 1~5 문항 원점수
  values: Record<WorkValue, number>              // 1~5 가치 카드 점수
}

export interface JobMatch {
  job: JobV2
  score: number
  interestFit: number
  styleFit: number
  valueFit: number
  dealbreakers: WorkValue[]  // 포기 못 하는 가치(5점)인데 이 직무가 채우기 어려운 것
}

const CODE_WEIGHTS = [1, 0.6, 0.3]
const WEIGHTS = { interest: 0.55, style: 0.25, value: 0.2 }
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

export function scoreJobs(input: CareerInput): JobMatch[] {
  const types = Object.keys(input.interest) as Riasec[]
  const iMean = mean(types.map(t => input.interest[t]))
  const relInterest = (t: Riasec) => input.interest[t] - iMean // 각자 평균 대비 (-4..4)
  const vKeys = Object.keys(input.values) as WorkValue[]
  const vMean = mean(vKeys.map(v => input.values[v]))
  const relValue = (v: WorkValue) => input.values[v] - vMean

  return JOBS_V2.map(job => {
    // 흥미: Holland 코드 가중 평균 + 세부 태그가 4점 이상이면 가산
    // 분모를 3글자 기준으로 고정 — 2글자 코드 직무가 희석되지 않아 구조적으로 유리해지는 것 방지
    const CODE_TOTAL = CODE_WEIGHTS.reduce((a, b) => a + b, 0)
    let interestFit = job.code.reduce((s, t, i) => s + CODE_WEIGHTS[i] * relInterest(t), 0) / CODE_TOTAL
    const tagHit = job.tags.some(t => (input.interestTags[t] ?? 0) >= 4)
    if (tagHit) interestFit += 0.3

    // 성향: 유리한 요인 방향과 실제 점수의 일치 (-1..1)
    const fs = Object.entries(job.hexaco) as [HexacoFactor, 1 | -1][]
    const styleFit = fs.length ? mean(fs.map(([f, d]) => d * (input.hexaco[f] - 3) / 2)) : 0

    // 가치: 채워주는 가치는 상대 점수만큼 가산, 채우기 어려운 가치는 감산
    const valueFit = (job.supports.reduce((s, v) => s + relValue(v), 0) - job.lacks.reduce((s, v) => s + Math.max(0, relValue(v)), 0)) / 3
    const dealbreakers = job.lacks.filter(v => input.values[v] >= 5)

    const score = WEIGHTS.interest * interestFit + WEIGHTS.style * styleFit + WEIGHTS.value * valueFit - (dealbreakers.length ? 0.5 : 0)
    return { job, score: Math.round(score * 100) / 100, interestFit, styleFit, valueFit, dealbreakers }
  }).sort((a, b) => b.score - a.score)
}
