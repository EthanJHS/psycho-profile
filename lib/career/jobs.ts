// CORE CAREER — 취준생·직장인용 직무 분류 (채용 직무 기준)
// 점수 철학: 흥미(1차) → 가치(연속 프로필, 2차) → 성격은 '극단적 불일치'일 때만 약한 감점
// 원칙: 정직·겸손(H)을 어떤 직무의 조건으로도 쓰지 않는다 · 정서성(E)은 쓰지 않는다
// AI 전망 기준 시점: 2026-09. 업무 단위로 서술하고 "사라질 직업" 같은 단정은 하지 않는다

import type { HexacoFactor } from '../scoring-hexaco'
import type { InterestTag, Riasec, WorkValue } from '../jobs-v2'

export type JobGroup = '개발' | '데이터' | '기획·PM' | '디자인' | '마케팅·콘텐츠' | '영업·사업' | '경영지원' | '연구·엔지니어링' | '공공·교육·보건'

export interface CareerJob {
  id: string
  name: string
  group: JobGroup
  desc: string                                        // 실제로 하는 일 한 줄
  code: Riasec[]                                      // Holland 코드 1~3순위
  tags: InterestTag[]
  values: Partial<Record<WorkValue, number>>          // -1..1, 없으면 0 (이 직무 환경이 채워주는 정도)
  mismatch?: { factor: Exclude<HexacoFactor, 'H' | 'E'>; when: 'low' | 'high'; note: string }[]
  emerging?: boolean
  ai: { automates: string; rises: string }            // AI가 빠르게 바꾸는 일 / 더 중요해지는 일
}

export const JOB_GROUPS: JobGroup[] = ['개발', '데이터', '기획·PM', '디자인', '마케팅·콘텐츠', '영업·사업', '경영지원', '연구·엔지니어링', '공공·교육·보건']

export const CAREER_JOBS: CareerJob[] = [
  // ── 개발 ──
  { id: 'backend', name: '백엔드 개발자', group: '개발', desc: '서비스 뒤에서 데이터를 저장·처리하는 서버와 API를 만든다',
    code: ['I', 'R', 'C'], tags: ['수리·IT'], values: { 성장: 0.8, 보상: 0.6, 자율: 0.5, 안정: 0.2, 균형: -0.1 },
    mismatch: [{ factor: 'C', when: 'low', note: '작은 실수가 서비스 장애로 이어져 꼼꼼한 확인 습관이 필요해요' }],
    ai: { automates: '반복적인 코드 작성, 테스트 코드 초안, 문서화', rises: '시스템 설계, AI가 쓴 코드의 검증과 보안 판단' } },
  { id: 'frontend', name: '프론트엔드 개발자', group: '개발', desc: '사용자가 직접 보고 누르는 웹·앱 화면을 코드로 구현한다',
    code: ['I', 'A', 'R'], tags: ['수리·IT', '심미·디자인'], values: { 성장: 0.8, 보상: 0.5, 자율: 0.5, 동료: 0.2 },
    ai: { automates: '디자인 시안을 화면 코드로 옮기는 반복 작업', rises: '사용성·접근성 판단, 복잡한 상호작용 설계' } },
  { id: 'mobile', name: '모바일 앱 개발자', group: '개발', desc: 'iOS·안드로이드 앱을 만들고 출시·업데이트한다',
    code: ['I', 'R', 'A'], tags: ['수리·IT'], values: { 성장: 0.7, 보상: 0.5, 자율: 0.5 },
    ai: { automates: '화면 구성 코드, 반복 기능 구현', rises: '기기 성능·사용 경험 최적화, 출시 품질 판단' } },
  { id: 'game-dev', name: '게임 개발자', group: '개발', desc: '게임의 규칙·조작·그래픽이 실제로 돌아가도록 프로그래밍한다',
    code: ['I', 'A', 'R'], tags: ['수리·IT', '발상·기획'], values: { 성장: 0.7, 도전: 0.5, 동료: 0.4, 균형: -0.4, 안정: -0.2 },
    ai: { automates: '반복 에셋 처리, 테스트 자동화', rises: '재미를 만드는 시스템 설계, 성능 최적화' } },
  { id: 'data-eng', name: '데이터 엔지니어', group: '개발', desc: '흩어진 데이터를 모아 분석·AI에 쓸 수 있게 흐름과 저장소를 만든다',
    code: ['I', 'C', 'R'], tags: ['수리·IT', '자료 관리'], values: { 성장: 0.8, 보상: 0.7, 안정: 0.3, 자율: 0.3 },
    mismatch: [{ factor: 'C', when: 'low', note: '데이터 품질과 파이프라인 안정성을 꾸준히 챙겨야 해요' }],
    ai: { automates: '정형화된 변환 코드와 쿼리 작성', rises: 'AI 학습용 데이터 품질 관리, 데이터 구조 설계' } },
  { id: 'ml-eng', name: 'AI·머신러닝 엔지니어', group: '개발', desc: 'AI 모델을 학습·평가하고 실제 서비스에 붙여 운영한다', emerging: true,
    code: ['I', 'R', 'C'], tags: ['수리·IT', '자연과학·데이터'], values: { 성장: 0.9, 보상: 0.8, 도전: 0.6, 자율: 0.4, 균형: -0.2 },
    ai: { automates: '모델 실험 반복, 기본 파이프라인 구성', rises: '문제 정의, 평가 설계, 모델 오류·편향 검증' } },
  { id: 'embedded', name: '임베디드·하드웨어 개발자', group: '개발', desc: '가전·자동차·로봇 같은 기기 안에서 도는 소프트웨어를 만든다',
    code: ['R', 'I', 'C'], tags: ['기계', '수리·IT'], values: { 안정: 0.5, 성장: 0.6, 보상: 0.5 },
    mismatch: [{ factor: 'C', when: 'low', note: '하드웨어 결함은 되돌리기 어려워 신중한 검증이 필요해요' }],
    ai: { automates: '코드 초안과 시뮬레이션 반복', rises: '하드웨어 제약 판단, 안전 검증' } },
  { id: 'security', name: '보안 엔지니어', group: '개발', desc: '해킹·정보 유출을 막고 취약점을 찾아 고친다',
    code: ['I', 'C', 'R'], tags: ['수리·IT'], values: { 성장: 0.7, 안정: 0.6, 보상: 0.6, 기여: 0.3 },
    mismatch: [{ factor: 'C', when: 'low', note: '작은 허점 하나를 끝까지 추적하는 집요함이 필요해요' }],
    ai: { automates: '로그 분석, 알려진 취약점 탐지', rises: 'AI를 이용한 공격 대응, 보안 정책 판단' } },
  { id: 'qa', name: 'QA·테스트 엔지니어', group: '개발', desc: '서비스가 의도대로 동작하는지 검증하고 오류를 찾아낸다',
    code: ['C', 'I', 'R'], tags: ['자료 관리', '수리·IT'], values: { 안정: 0.5, 균형: 0.3, 동료: 0.3 },
    mismatch: [{ factor: 'C', when: 'low', note: '같은 흐름을 반복 확인하는 꼼꼼함이 핵심이에요' }],
    ai: { automates: '테스트 시나리오 작성과 반복 실행', rises: 'AI 기능의 품질 기준 설계, 예외 상황 발굴' } },

  // ── 데이터 ──
  { id: 'data-analyst', name: '데이터 분석가', group: '데이터', desc: '데이터로 현상을 파악하고 의사결정에 필요한 근거를 만든다',
    code: ['I', 'C', 'E'], tags: ['자연과학·데이터', '자료 관리'], values: { 성장: 0.7, 보상: 0.5, 안정: 0.3, 인정: 0.3 },
    ai: { automates: '기본 쿼리, 정형 리포트, 차트 만들기', rises: '무엇을 분석할지 정하는 질문 설계, 결과 해석과 설득' } },
  { id: 'data-scientist', name: '데이터 사이언티스트', group: '데이터', desc: '통계·머신러닝으로 예측 모델을 만들고 비즈니스 문제를 푼다', emerging: true,
    code: ['I', 'R', 'C'], tags: ['자연과학·데이터', '수리·IT'], values: { 성장: 0.8, 보상: 0.7, 도전: 0.6, 자율: 0.4 },
    ai: { automates: '모델 코드 작성, 반복 실험', rises: '문제 정의, 실험 설계, 인과 해석' } },
  { id: 'ux-research', name: 'UX 리서처', group: '데이터', desc: '사용자를 인터뷰·관찰해 서비스의 문제와 기회를 찾는다',
    code: ['I', 'S', 'A'], tags: ['사회과학·철학', '상담'], values: { 성장: 0.6, 동료: 0.5, 기여: 0.3, 자율: 0.3 },
    mismatch: [{ factor: 'O', when: 'low', note: '낯선 사용자 관점을 받아들이는 열린 태도가 필요해요' }],
    ai: { automates: '인터뷰 녹취 정리, 설문 1차 분석', rises: '좋은 질문 설계, 맥락 해석, 인사이트 설득' } },

  // ── 기획·PM ──
  { id: 'service-planner', name: '서비스 기획자', group: '기획·PM', desc: '서비스의 기능과 화면 흐름을 설계하고 개발·디자인과 조율한다',
    code: ['E', 'A', 'C'], tags: ['발상·기획', '자료 관리'], values: { 성장: 0.7, 동료: 0.4, 주도: 0.4, 인정: 0.3 },
    ai: { automates: '기획서 초안, 경쟁 서비스 조사 정리', rises: '문제 정의, 우선순위 판단, 팀 합의 이끌기' } },
  { id: 'pm', name: '프로덕트 매니저', group: '기획·PM', desc: '제품의 목표와 방향을 정하고 성과 지표로 결과를 책임진다',
    code: ['E', 'I', 'C'], tags: ['리더십', '발상·기획'], values: { 주도: 0.8, 성장: 0.7, 도전: 0.6, 보상: 0.5, 균형: -0.3 },
    mismatch: [{ factor: 'X', when: 'low', note: '여러 팀을 설득하고 조율하는 대화가 일의 큰 부분이에요' }],
    ai: { automates: '데이터 요약, 요구사항 문서화', rises: '무엇을 만들지 결정하는 판단, AI 기능의 가치 정의' } },
  { id: 'ai-planner', name: 'AI 서비스 기획자', group: '기획·PM', desc: 'AI를 활용한 기능을 기획하고 품질 기준과 한계를 정한다', emerging: true,
    code: ['E', 'I', 'A'], tags: ['발상·기획', '수리·IT'], values: { 성장: 0.9, 도전: 0.7, 주도: 0.5, 보상: 0.5 },
    mismatch: [{ factor: 'O', when: 'low', note: '빠르게 바뀌는 기술을 계속 받아들여야 하는 자리예요' }],
    ai: { automates: '프롬프트·시나리오 초안', rises: 'AI 결과 평가 기준 설계, 위험과 윤리 판단' } },
  { id: 'game-planner', name: '게임 기획자', group: '기획·PM', desc: '게임의 규칙·레벨·보상 구조를 설계해 재미를 만든다',
    code: ['A', 'E', 'I'], tags: ['발상·기획', '표현·글'], values: { 성장: 0.6, 도전: 0.5, 동료: 0.4, 균형: -0.4 },
    ai: { automates: '대사·설정 초안, 밸런스 수치 시뮬레이션', rises: '재미의 핵심 설계, 플레이어 심리 이해' } },
  { id: 'biz-strategy', name: '사업 기획·전략', group: '기획·PM', desc: '시장과 숫자를 분석해 회사의 사업 방향과 계획을 세운다',
    code: ['E', 'C', 'I'], tags: ['사업', '재무'], values: { 성장: 0.7, 보상: 0.6, 주도: 0.6, 인정: 0.4, 균형: -0.3 },
    ai: { automates: '시장 자료 조사, 재무 모델 초안', rises: '전략적 판단, 이해관계자 설득' } },

  // ── 디자인 ──
  { id: 'product-designer', name: '프로덕트(UI·UX) 디자이너', group: '디자인', desc: '사용자가 쉽게 쓰도록 서비스의 화면과 사용 흐름을 디자인한다',
    code: ['A', 'I', 'S'], tags: ['심미·디자인', '발상·기획'], values: { 성장: 0.7, 자율: 0.5, 동료: 0.4, 인정: 0.3 },
    ai: { automates: '화면 시안 변형, 아이콘·이미지 생성', rises: '사용자 문제 정의, 디자인 판단 근거 설명' } },
  { id: 'brand-designer', name: '브랜드·그래픽 디자이너', group: '디자인', desc: '로고·패키지·광고물로 브랜드의 인상을 시각적으로 만든다',
    code: ['A', 'E'], tags: ['심미·디자인', '표현·글'], values: { 자율: 0.6, 인정: 0.5, 성장: 0.5, 안정: -0.3, 보상: -0.2 },
    ai: { automates: '시안 대량 생성, 리사이즈·변형 작업', rises: '브랜드 방향 설정, 취향과 선별의 기준' } },
  { id: 'motion-designer', name: '영상·모션 디자이너', group: '디자인', desc: '영상 편집과 움직이는 그래픽으로 콘텐츠를 만든다',
    code: ['A', 'R', 'E'], tags: ['심미·디자인', '표현·글'], values: { 자율: 0.6, 성장: 0.5, 인정: 0.4, 균형: -0.3, 안정: -0.3 },
    ai: { automates: '컷 편집, 자막, 기본 효과', rises: '연출과 스토리 구성, 결과물의 완성도 판단' } },
  { id: 'space-product-design', name: '공간·제품 디자이너', group: '디자인', desc: '실내 공간이나 실제 제품의 형태와 사용성을 디자인한다',
    code: ['A', 'R', 'I'], tags: ['심미·디자인', '제작'], values: { 인정: 0.5, 성장: 0.5, 자율: 0.4, 균형: -0.3 },
    ai: { automates: '렌더링, 시안 변형', rises: '현장 제약 판단, 재료·사용성 결정' } },

  // ── 마케팅·콘텐츠 ──
  { id: 'performance-mkt', name: '퍼포먼스·그로스 마케터', group: '마케팅·콘텐츠', desc: '광고와 실험을 돌려 숫자로 가입·매출을 늘린다',
    code: ['E', 'C', 'I'], tags: ['자료 관리', '사업'], values: { 성장: 0.7, 보상: 0.5, 도전: 0.5, 인정: 0.4 },
    ai: { automates: '광고 문구·소재 변형, 입찰 최적화', rises: '실험 설계, 지표 해석, 예산 판단' } },
  { id: 'brand-mkt', name: '브랜드 마케터', group: '마케팅·콘텐츠', desc: '브랜드의 이야기와 캠페인을 기획해 사람들의 인식을 만든다',
    code: ['A', 'E', 'S'], tags: ['발상·기획', '표현·글'], values: { 성장: 0.6, 인정: 0.5, 동료: 0.5, 자율: 0.3 },
    ai: { automates: '카피 초안, 트렌드 조사 정리', rises: '브랜드 관점의 판단, 캠페인 콘셉트' } },
  { id: 'content-editor', name: '콘텐츠 에디터·크리에이터', group: '마케팅·콘텐츠', desc: '글·영상·SNS 콘텐츠를 기획하고 직접 만든다',
    code: ['A', 'S', 'E'], tags: ['표현·글', '발상·기획'], values: { 자율: 0.7, 인정: 0.5, 성장: 0.5, 안정: -0.4, 보상: -0.2 },
    ai: { automates: '초안 작성, 요약, 편집 보조', rises: '관점과 취재, 독자를 움직이는 이야기' } },
  { id: 'content-strategist', name: '콘텐츠 전략가', group: '마케팅·콘텐츠', desc: '어떤 콘텐츠를 누구에게 어떻게 낼지 전체 방향과 체계를 설계한다', emerging: true,
    code: ['E', 'A', 'I'], tags: ['발상·기획', '사업'], values: { 주도: 0.6, 성장: 0.6, 인정: 0.4 },
    ai: { automates: '성과 데이터 정리, 콘텐츠 대량 생산', rises: 'AI 생산물의 방향·품질 기준 설정' } },
  { id: 'pr', name: '홍보(PR)', group: '마케팅·콘텐츠', desc: '언론·대중과의 관계를 관리하고 회사의 메시지를 전달한다',
    code: ['E', 'S', 'A'], tags: ['표현·글', '협상·성사'], values: { 인정: 0.5, 동료: 0.4, 성장: 0.4, 균형: -0.4 },
    mismatch: [{ factor: 'X', when: 'low', note: '기자·외부 관계자와 계속 소통해야 하는 자리예요' }],
    ai: { automates: '보도자료 초안, 기사 모니터링', rises: '위기 대응 판단, 관계 신뢰' } },

  // ── 영업·사업 ──
  { id: 'bizdev', name: 'B2B 영업·사업개발', group: '영업·사업', desc: '기업 고객을 찾아 제안하고 계약과 제휴를 성사시킨다',
    code: ['E', 'S', 'C'], tags: ['협상·성사', '사업'], values: { 보상: 0.8, 도전: 0.7, 인정: 0.5, 안정: -0.3 },
    mismatch: [{ factor: 'X', when: 'low', note: '처음 보는 사람에게 먼저 다가가는 일이 많아요' }],
    ai: { automates: '잠재 고객 조사, 제안서 초안', rises: '관계 신뢰, 협상 판단' } },
  { id: 'tech-sales', name: '기술영업', group: '영업·사업', desc: '기술 제품을 이해하고 고객의 문제에 맞춰 제안한다',
    code: ['E', 'I', 'R'], tags: ['협상·성사', '기계'], values: { 보상: 0.7, 도전: 0.5, 성장: 0.5 },
    ai: { automates: '제품 비교 자료, 견적 초안', rises: '고객 문제 진단, 기술 설명과 신뢰' } },
  { id: 'md', name: 'MD·상품기획', group: '영업·사업', desc: '무엇을 팔지 고르고 가격·재고·판매 전략을 짠다',
    code: ['E', 'C', 'A'], tags: ['사업', '자료 관리'], values: { 성장: 0.5, 인정: 0.4, 도전: 0.4, 균형: -0.3 },
    ai: { automates: '수요 예측, 판매 데이터 정리', rises: '트렌드 감각, 협력사 협상' } },
  { id: 'cx', name: '고객 성공·CX 매니저', group: '영업·사업', desc: '고객이 서비스를 잘 쓰도록 돕고 불편을 해결해 관계를 유지한다',
    code: ['S', 'E', 'C'], tags: ['상담', '협상·성사'], values: { 동료: 0.5, 기여: 0.5, 안정: 0.3 },
    ai: { automates: '반복 문의 응대, 상담 요약', rises: '복잡한 문제 해결, 고객 관계 관리' } },

  // ── 경영지원 ──
  { id: 'hrm', name: '인사(HRM)', group: '경영지원', desc: '채용·평가·보상 제도를 운영하고 인력을 관리한다',
    code: ['S', 'C', 'E'], tags: ['자료 관리', '상담'], values: { 안정: 0.6, 균형: 0.4, 동료: 0.4 },
    ai: { automates: '서류 1차 검토, 제도 문서 정리', rises: '공정성 판단, 구성원과의 신뢰' } },
  { id: 'hrd', name: '조직문화·교육(HRD)', group: '경영지원', desc: '구성원이 성장하도록 교육과 조직문화 프로그램을 만든다',
    code: ['S', 'E', 'A'], tags: ['교육', '발상·기획'], values: { 기여: 0.6, 동료: 0.6, 성장: 0.4, 균형: 0.3 },
    ai: { automates: '교육 자료 초안, 설문 분석', rises: '조직의 문제 진단, 변화 이끌기' } },
  { id: 'finance', name: '재무·회계', group: '경영지원', desc: '회사의 돈의 흐름을 기록·분석하고 결산과 세무를 챙긴다',
    code: ['C', 'E', 'I'], tags: ['재무', '자료 관리'], values: { 안정: 0.7, 보상: 0.4, 균형: 0.2 },
    mismatch: [{ factor: 'C', when: 'low', note: '숫자 하나의 오류도 큰 문제가 되는 정확성 중심의 일이에요' }],
    ai: { automates: '전표 처리, 정형 보고서', rises: '재무 판단과 해석, 리스크 관리' } },
  { id: 'legal', name: '법무·컴플라이언스', group: '경영지원', desc: '계약서를 검토하고 회사가 법과 규정을 지키도록 관리한다',
    code: ['C', 'E', 'I'], tags: ['사무·행정', '사회과학·철학'], values: { 안정: 0.6, 인정: 0.3, 기여: 0.2 },
    mismatch: [{ factor: 'C', when: 'low', note: '문구 하나까지 검토하는 정밀함이 필요해요' }],
    ai: { automates: '계약서 1차 검토, 판례 검색', rises: 'AI 규제 대응, 최종 법적 판단' } },
  { id: 'ops', name: '경영관리·운영', group: '경영지원', desc: '예산·구매·일정 등 회사가 굴러가게 하는 운영을 관리한다',
    code: ['C', 'E', 'S'], tags: ['사무·행정', '자료 관리'], values: { 안정: 0.7, 균형: 0.4, 동료: 0.3 },
    ai: { automates: '문서 작성, 일정·자료 정리', rises: '예외 상황 판단, 부서 간 조율' } },
  { id: 'ai-governance', name: 'AI 도입·거버넌스 담당', group: '경영지원', desc: '조직에 AI를 도입하고 안전하게 쓰기 위한 기준과 교육을 만든다', emerging: true,
    code: ['E', 'I', 'S'], tags: ['사회과학·철학', '교육'], values: { 성장: 0.8, 기여: 0.5, 도전: 0.5, 주도: 0.4 },
    mismatch: [{ factor: 'O', when: 'low', note: '새 기술과 규제를 계속 공부해야 하는 자리예요' }],
    ai: { automates: '정책 문서 초안, 사례 조사', rises: '위험 판단, 사람과 AI의 역할 설계' } },

  // ── 연구·엔지니어링 ──
  { id: 'researcher', name: '연구개발(R&D) 연구원', group: '연구·엔지니어링', desc: '실험과 분석으로 새로운 기술·소재·제품을 개발한다',
    code: ['I', 'R'], tags: ['자연과학·데이터'], values: { 성장: 0.8, 자율: 0.5, 안정: 0.4, 보상: 0.2 },
    ai: { automates: '문헌 조사, 실험 데이터 정리', rises: '가설 설정, 실험 설계와 해석' } },
  { id: 'process-eng', name: '생산·공정 엔지니어', group: '연구·엔지니어링', desc: '공장의 생산 공정을 설계·개선해 효율과 품질을 높인다',
    code: ['R', 'I', 'C'], tags: ['기계', '자료 관리'], values: { 안정: 0.7, 보상: 0.5, 성장: 0.4, 균형: -0.2 },
    ai: { automates: '설비 데이터 모니터링, 이상 감지', rises: '현장 문제 해결, 자동화 설비 운영' } },
  { id: 'design-eng', name: '설계 엔지니어(기계·전기)', group: '연구·엔지니어링', desc: '제품과 설비의 구조·회로를 설계하고 검증한다',
    code: ['R', 'I', 'C'], tags: ['기계', '제작'], values: { 안정: 0.6, 성장: 0.5, 보상: 0.4 },
    mismatch: [{ factor: 'C', when: 'low', note: '설계 오류는 제작 단계에서 큰 비용이 돼요' }],
    ai: { automates: '도면 초안, 시뮬레이션 반복', rises: '설계 판단, 안전·규격 검증' } },
  { id: 'quality', name: '품질관리(QA·QC)', group: '연구·엔지니어링', desc: '제품이 기준에 맞는지 검사하고 불량의 원인을 찾아 개선한다',
    code: ['C', 'R', 'I'], tags: ['자료 관리', '기계'], values: { 안정: 0.7, 균형: 0.3 },
    mismatch: [{ factor: 'C', when: 'low', note: '기준을 일관되게 지키는 꼼꼼함이 핵심이에요' }],
    ai: { automates: '비전 검사, 불량 데이터 집계', rises: '원인 분석, 품질 기준 설계' } },

  // ── 공공·교육·보건 ──
  { id: 'public-admin', name: '공무원·공공기관 행정', group: '공공·교육·보건', desc: '공공 서비스와 정책을 정해진 절차에 따라 집행한다',
    code: ['C', 'S', 'E'], tags: ['사무·행정'], values: { 안정: 0.9, 균형: 0.6, 기여: 0.4, 보상: -0.3, 자율: -0.3 },
    ai: { automates: '민원 1차 응대, 문서 작성', rises: '복잡한 민원 판단, 정책 조율' } },
  { id: 'teacher', name: '교사·교육 전문가', group: '공공·교육·보건', desc: '학생을 가르치고 성장을 돕는 수업과 활동을 설계한다',
    code: ['S', 'A', 'E'], tags: ['교육'], values: { 기여: 0.8, 안정: 0.6, 균형: 0.3, 보상: -0.2 },
    mismatch: [{ factor: 'X', when: 'low', note: '매일 많은 사람 앞에서 말하고 이끄는 일이에요' }],
    ai: { automates: '수업 자료·문항 초안, 채점 보조', rises: '학생 개인 맞춤 지도, 관계와 동기 부여' } },
  { id: 'counselor', name: '상담·임상심리', group: '공공·교육·보건', desc: '고민이 있는 사람과 대화하며 심리적 어려움을 함께 해결한다',
    code: ['S', 'I', 'A'], tags: ['상담', '사회과학·철학'], values: { 기여: 0.9, 자율: 0.3, 보상: -0.3 },
    ai: { automates: '상담 기록 정리, 심리검사 채점', rises: '관계 형성, 위기 판단' } },
  { id: 'social-worker', name: '사회복지', group: '공공·교육·보건', desc: '도움이 필요한 사람을 찾아 필요한 지원과 서비스를 연결한다',
    code: ['S', 'E', 'C'], tags: ['돌봄', '상담'], values: { 기여: 0.9, 동료: 0.5, 보상: -0.4 },
    ai: { automates: '대상자 서류 처리, 자원 검색', rises: '현장 판단, 사람과의 신뢰' } },
  { id: 'nurse', name: '간호·보건의료', group: '공공·교육·보건', desc: '환자를 돌보고 치료 과정을 곁에서 관리한다',
    code: ['S', 'I', 'R'], tags: ['돌봄', '자연과학·데이터'], values: { 기여: 0.8, 안정: 0.7, 보상: 0.3, 균형: -0.4 },
    mismatch: [{ factor: 'C', when: 'low', note: '투약·기록의 정확성이 환자 안전과 직결돼요' }],
    ai: { automates: '간호 기록 작성, 모니터링 알림', rises: '환자 상태 판단, 돌봄과 소통' } },
]
