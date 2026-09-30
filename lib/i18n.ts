// 언어별로 달라지는 것 한 곳에 — 경로, 저장 키, 문항 버전, 콘텐츠 묶음
// 채점·판정 로직은 언어와 무관하게 하나 (lib/scoring-hexaco.ts, lib/personalize-result.ts)
import { HEXACO_QUESTIONS, LIKERT_OPTIONS } from './questions-hexaco'
import { HEXACO_QUESTIONS_EN, LIKERT_OPTIONS_EN } from './en/questions-hexaco'
import { ARCHETYPE_DETAILS } from './archetypes-hexaco'
import { ARCHETYPE_DETAILS_EN } from './en/archetypes-hexaco'
import { PERSONALIZE_KO } from './personalize-text-ko'
import { PERSONALIZE_EN } from './en/personalize-text'

export type Lang = 'ko' | 'en'

export const langFromPath = (path: string): Lang => (path === '/en' || path.startsWith('/en/') ? 'en' : 'ko')

export const PATHS = {
  ko: { home: '/', test: '/hexaco-test', result: '/hexaco-result', report: '/hexaco-result/report', privacy: '/privacy', terms: '/terms', share: (id: string) => `/a/${id}` },
  en: { home: '/en', test: '/en/test', result: '/en/result', report: '/en/result/report', privacy: '/en/privacy', terms: '/en/terms', share: (id: string) => `/en/a/${id}` },
} as const

// 문항 버전 = DB에서 언어를 구분하는 기준. 영어 응답은 한국어 응답과 절대 합쳐 분석하지 않는다
export const HEXACO_VERSION_BY_LANG: Record<Lang, string> = { ko: 'hexaco-v2', en: 'hexaco-v2-en' }
export const isEnVersion = (v: string | null | undefined) => !!v && v.endsWith('-en')

// 브라우저 저장 키 — 두 언어 검사를 한 탭에서 해도 섞이지 않게 (진로 리포트는 한국어 응답만 읽음)
export const STORAGE = {
  ko: { answers: 'hexaco_answers', progress: 'pp_hexaco_progress', completed: 'pp_hexaco_completed' },
  en: { answers: 'hexaco_answers_en', progress: 'pp_hexaco_progress_en', completed: 'pp_hexaco_completed_en' },
} as const

export const CONTENT = {
  ko: { questions: HEXACO_QUESTIONS, likert: LIKERT_OPTIONS, archetypes: ARCHETYPE_DETAILS, personalize: PERSONALIZE_KO },
  en: { questions: HEXACO_QUESTIONS_EN, likert: LIKERT_OPTIONS_EN, archetypes: ARCHETYPE_DETAILS_EN, personalize: PERSONALIZE_EN },
} as const
