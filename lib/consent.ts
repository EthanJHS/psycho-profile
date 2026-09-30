// 개인정보 처리방침 버전 — 방침 내용을 바꾸면 날짜를 올리고, 새 동의를 받는다
export const PRIVACY_VERSION = '2026-09-29'
export const PRIVACY_CONTACT = 'core-trait@naver.com'
export const OPERATOR = 'CORE TRAIT (개인 운영)'

export interface TestConsent { research: boolean }

const KEY = 'pp_consent'

export function saveConsent(c: TestConsent) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...c, version: PRIVACY_VERSION }))
}

export function loadConsent(): TestConsent | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
    return v && v.version === PRIVACY_VERSION ? { research: !!v.research } : null
  } catch { return null }
}
