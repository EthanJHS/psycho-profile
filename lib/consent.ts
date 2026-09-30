import type { Lang } from './i18n'

// 개인정보 처리방침 버전 — 방침 내용을 바꾸면 날짜를 올리고, 새 동의를 받는다
export const PRIVACY_VERSION = '2026-09-29'
export const PRIVACY_CONTACT = 'core-trait@naver.com'
export const OPERATOR = 'CORE TRAIT (개인 운영)'
// 영어판은 방침 내용(GDPR 등)이 달라 버전도 따로 관리
export const PRIVACY_VERSION_EN = 'en-2026-09-30'
export const privacyVersion = (lang: Lang) => (lang === 'en' ? PRIVACY_VERSION_EN : PRIVACY_VERSION)

export interface TestConsent { research: boolean }

const keyOf = (lang: Lang) => (lang === 'en' ? 'pp_consent_en' : 'pp_consent')

export function saveConsent(c: TestConsent, lang: Lang = 'ko') {
  sessionStorage.setItem(keyOf(lang), JSON.stringify({ ...c, version: privacyVersion(lang) }))
}

export function loadConsent(lang: Lang = 'ko'): TestConsent | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(keyOf(lang)) ?? 'null')
    return v && v.version === privacyVersion(lang) ? { research: !!v.research } : null
  } catch { return null }
}
