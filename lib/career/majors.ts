// CORE CAREER — 고등학생용 계열·학과 분류
// 추천 = 흥미(1차) + 자신 있는 과목(2차). 성적·입결은 다루지 않는다 (시기마다 바뀌고 검증이 어려움)

import type { InterestTag, Riasec } from '../jobs-v2'

export type Subject = '국어·문학' | '영어·외국어' | '수학' | '과학' | '사회·역사' | '예술·체육' | '정보·기술'
export type MajorField = '인문' | '사회' | '상경' | '교육' | '공학' | '자연' | '의약' | '예체능'

export interface Major {
  id: string
  name: string
  field: MajorField
  desc: string              // 무엇을 배우나
  code: Riasec[]
  tags: InterestTag[]
  subjects: Subject[]       // 이 학과 공부와 이어지는 과목
  careers: string           // 졸업 후 대표 진로
}

export const MAJORS: Major[] = [
  // 인문
  { id: 'korean-lit', name: '국어국문·문예창작', field: '인문', desc: '언어와 문학 작품을 깊이 읽고, 글을 쓰고 분석하는 법을 배워요', code: ['A', 'S', 'I'], tags: ['표현·글'], subjects: ['국어·문학'], careers: '작가·에디터, 출판·방송, 콘텐츠 기획, 국어 교사' },
  { id: 'languages', name: '영어·외국어 계열', field: '인문', desc: '외국어와 그 문화권의 문학·사회를 함께 배워요', code: ['S', 'A', 'E'], tags: ['표현·글'], subjects: ['영어·외국어', '국어·문학'], careers: '통번역, 해외 영업·무역, 외국계 기업, 외국어 교사' },
  { id: 'history-philosophy', name: '사학·철학', field: '인문', desc: '역사와 사상을 통해 사람과 사회가 움직여 온 원리를 탐구해요', code: ['I', 'A', 'S'], tags: ['사회과학·철학', '표현·글'], subjects: ['사회·역사', '국어·문학'], careers: '연구·학예사, 기자, 공공기관, 기획' },
  // 사회
  { id: 'psychology', name: '심리학', field: '사회', desc: '실험과 통계로 사람의 마음과 행동을 과학적으로 연구해요', code: ['I', 'S'], tags: ['사회과학·철학', '상담'], subjects: ['사회·역사', '수학', '과학'], careers: '상담·임상심리, UX 리서치, 인사·조직, 연구' },
  { id: 'media', name: '미디어·커뮤니케이션', field: '사회', desc: '언론·광고·콘텐츠가 사람들에게 전달되는 방식을 배워요', code: ['A', 'E', 'S'], tags: ['표현·글', '발상·기획'], subjects: ['국어·문학', '사회·역사'], careers: '기자·PD, 광고·홍보, 콘텐츠 마케터' },
  { id: 'politics-public', name: '정치외교·행정', field: '사회', desc: '정책이 만들어지고 집행되는 과정과 국제 관계를 배워요', code: ['E', 'S', 'I'], tags: ['사회과학·철학', '사무·행정'], subjects: ['사회·역사', '국어·문학'], careers: '공무원·공공기관, 국제기구, 정책 연구, 기자' },
  { id: 'social-welfare', name: '사회복지', field: '사회', desc: '도움이 필요한 사람을 지원하는 제도와 실천 방법을 배워요', code: ['S', 'E', 'C'], tags: ['돌봄', '상담'], subjects: ['사회·역사'], careers: '사회복지사, 공공 복지 행정, NGO' },
  { id: 'law', name: '법학', field: '사회', desc: '법의 원리와 해석을 배우고 논리적으로 판단하는 훈련을 해요', code: ['E', 'I', 'C'], tags: ['사회과학·철학', '사무·행정'], subjects: ['사회·역사', '국어·문학'], careers: '법조인(법학전문대학원), 법무팀, 공무원' },
  // 상경
  { id: 'business', name: '경영학', field: '상경', desc: '마케팅·인사·재무·전략 등 조직을 운영하는 방법을 배워요', code: ['E', 'C', 'S'], tags: ['사업', '리더십'], subjects: ['사회·역사', '수학'], careers: '기획·마케팅, 인사, 재무, 창업' },
  { id: 'economics', name: '경제학', field: '상경', desc: '시장과 돈의 흐름을 수학적 모델과 데이터로 분석해요', code: ['I', 'E', 'C'], tags: ['재무', '자연과학·데이터'], subjects: ['수학', '사회·역사'], careers: '금융·증권, 경제 분석, 공공기관, 데이터 분석' },
  { id: 'accounting-finance', name: '회계·세무·금융', field: '상경', desc: '기업의 돈을 기록·분석하고 관리하는 전문 지식을 배워요', code: ['C', 'E', 'I'], tags: ['재무', '자료 관리'], subjects: ['수학', '사회·역사'], careers: '회계사·세무사, 금융권, 재무팀' },
  // 교육
  { id: 'education', name: '교육학·사범 계열', field: '교육', desc: '가르치는 방법과 학생의 성장을 돕는 원리를 배워요', code: ['S', 'A', 'E'], tags: ['교육'], subjects: ['국어·문학', '영어·외국어', '수학', '과학', '사회·역사'], careers: '교사, 교육 콘텐츠 기획, 기업 교육(HRD)' },
  { id: 'early-childhood', name: '유아교육·아동학', field: '교육', desc: '아이들의 발달과 돌봄, 놀이 중심 교육을 배워요', code: ['S', 'A'], tags: ['교육', '돌봄'], subjects: ['국어·문학', '예술·체육'], careers: '유치원 교사, 아동 상담, 교육 기관' },
  // 공학
  { id: 'computer', name: '컴퓨터공학·소프트웨어', field: '공학', desc: '프로그래밍과 컴퓨터 시스템의 원리를 배우고 직접 만들어요', code: ['I', 'R', 'C'], tags: ['수리·IT'], subjects: ['수학', '정보·기술'], careers: '개발자, 데이터·AI 엔지니어, 보안' },
  { id: 'ai-data', name: 'AI·데이터사이언스', field: '공학', desc: '데이터를 분석하고 인공지능 모델을 만드는 수학·프로그래밍을 배워요', code: ['I', 'R', 'C'], tags: ['수리·IT', '자연과학·데이터'], subjects: ['수학', '정보·기술'], careers: 'AI·머신러닝 엔지니어, 데이터 사이언티스트' },
  { id: 'electrical', name: '전기·전자공학', field: '공학', desc: '반도체·회로·통신처럼 전기 신호로 동작하는 기술을 배워요', code: ['R', 'I', 'C'], tags: ['기계', '수리·IT'], subjects: ['수학', '과학'], careers: '반도체·전자 기업, 설계 엔지니어, 연구원' },
  { id: 'mechanical', name: '기계공학', field: '공학', desc: '자동차·로봇·설비가 움직이는 원리를 배우고 설계해요', code: ['R', 'I'], tags: ['기계', '제작'], subjects: ['수학', '과학'], careers: '설계·생산 엔지니어, 자동차·로봇 산업' },
  { id: 'chemical-materials', name: '화학공학·신소재', field: '공학', desc: '새로운 소재와 화학 공정을 연구하고 대량 생산 방법을 설계해요', code: ['I', 'R', 'C'], tags: ['자연과학·데이터', '제작'], subjects: ['과학', '수학'], careers: '배터리·반도체 소재, 공정 엔지니어, 연구원' },
  { id: 'architecture-eng', name: '건축·토목', field: '공학', desc: '건물과 도시 기반 시설을 설계하고 짓는 방법을 배워요', code: ['R', 'A', 'I'], tags: ['제작', '심미·디자인'], subjects: ['수학', '과학', '예술·체육'], careers: '건축가, 시공·설계 엔지니어, 공공 기술직' },
  { id: 'industrial', name: '산업공학', field: '공학', desc: '데이터와 수학으로 생산·물류·서비스의 효율을 높이는 법을 배워요', code: ['I', 'C', 'E'], tags: ['자료 관리', '자연과학·데이터'], subjects: ['수학', '정보·기술'], careers: '데이터 분석, 생산 관리, 컨설팅, 물류' },
  // 자연
  { id: 'math-stats', name: '수학·통계학', field: '자연', desc: '수학적 원리와 데이터를 다루는 통계적 사고를 깊이 배워요', code: ['I', 'C'], tags: ['자연과학·데이터', '수리·IT'], subjects: ['수학'], careers: '데이터 분석, 금융·보험 계리, 연구, 교사' },
  { id: 'physics-chem', name: '물리·화학', field: '자연', desc: '실험과 이론으로 물질과 자연 현상의 근본 원리를 탐구해요', code: ['I', 'R'], tags: ['자연과학·데이터'], subjects: ['과학', '수학'], careers: '연구원, 반도체·소재 산업, 교사' },
  { id: 'life-science', name: '생명과학·바이오', field: '자연', desc: '생명 현상을 분자·세포 수준에서 연구하고 바이오 기술을 배워요', code: ['I', 'R', 'S'], tags: ['자연과학·데이터'], subjects: ['과학'], careers: '바이오·제약 연구원, 품질관리, 의학 계열 진학' },
  { id: 'env-earth', name: '환경·지구과학', field: '자연', desc: '기후·환경·지구의 변화를 관측하고 문제를 해결하는 법을 배워요', code: ['I', 'R', 'S'], tags: ['자연과학·데이터', '야외·신체'], subjects: ['과학', '사회·역사'], careers: '환경 연구·컨설팅, 기상, 공공기관' },
  // 의약
  { id: 'medicine', name: '의학·치의학·한의학', field: '의약', desc: '사람의 몸과 질병을 배우고 진단·치료하는 의사가 되는 과정이에요', code: ['I', 'S', 'R'], tags: ['자연과학·데이터', '돌봄'], subjects: ['과학', '수학'], careers: '의사, 의학 연구' },
  { id: 'nursing', name: '간호학', field: '의약', desc: '환자를 돌보고 건강 회복을 돕는 전문 간호를 배워요', code: ['S', 'I', 'R'], tags: ['돌봄', '자연과학·데이터'], subjects: ['과학'], careers: '간호사, 보건 공무원, 보건교사' },
  { id: 'pharmacy', name: '약학', field: '의약', desc: '약의 작용과 개발, 안전한 사용법을 배워요', code: ['I', 'C', 'S'], tags: ['자연과학·데이터'], subjects: ['과학', '수학'], careers: '약사, 제약 연구·개발' },
  { id: 'health-rehab', name: '보건·재활 계열', field: '의약', desc: '물리치료·작업치료·임상병리처럼 몸의 회복을 돕는 기술을 배워요', code: ['S', 'R', 'I'], tags: ['돌봄', '야외·신체'], subjects: ['과학', '예술·체육'], careers: '물리·작업치료사, 임상병리사, 병원·재활센터' },
  // 예체능
  { id: 'design', name: '디자인(시각·산업·UX)', field: '예체능', desc: '보기 좋고 쓰기 좋은 화면·제품·브랜드를 만드는 법을 배워요', code: ['A', 'E', 'R'], tags: ['심미·디자인', '발상·기획'], subjects: ['예술·체육', '정보·기술'], careers: 'UI·UX 디자이너, 브랜드 디자이너, 제품 디자이너' },
  { id: 'fine-arts', name: '순수미술·공예', field: '예체능', desc: '회화·조소·공예로 자기만의 표현을 깊이 있게 다듬어요', code: ['A', 'R'], tags: ['심미·디자인', '제작'], subjects: ['예술·체육'], careers: '작가, 공예가, 미술 교육' },
  { id: 'film-music', name: '영상·음악·공연', field: '예체능', desc: '영화·영상·음악·연기로 이야기와 감정을 표현해요', code: ['A', 'E', 'S'], tags: ['표현·글', '발상·기획'], subjects: ['예술·체육', '국어·문학'], careers: 'PD·감독, 음악가·배우, 콘텐츠 제작' },
  { id: 'sports', name: '체육·스포츠과학', field: '예체능', desc: '운동과 몸의 원리를 배우고 지도하는 법을 익혀요', code: ['R', 'S', 'E'], tags: ['야외·신체', '교육'], subjects: ['예술·체육', '과학'], careers: '트레이너·코치, 체육 교사, 스포츠 마케팅' },
]

export interface MajorMatch { id: string; score: number; subjectHit: Subject[] }
const CODE_W = [1, 0.6, 0.3]
const CODE_TOTAL = CODE_W.reduce((a, b) => a + b, 0)

export function matchMajors(rel: Record<Riasec, number>, tags: InterestTag[], strongSubjects: string[]): MajorMatch[] {
  return MAJORS.map(m => {
    let interest = m.code.reduce((s, t, i) => s + CODE_W[i] * rel[t], 0) / CODE_TOTAL
    if (m.tags.some(t => tags.includes(t))) interest += 0.35
    const subjectHit = m.subjects.filter(s => strongSubjects.includes(s))
    const subjectFit = subjectHit.length ? 1 : strongSubjects.length ? -0.3 : 0
    return { id: m.id, score: Math.round((0.7 * interest + 0.3 * subjectFit) * 100) / 100, subjectHit }
  }).sort((a, b) => b.score - a.score)
}
