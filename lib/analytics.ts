'use client'

import { supabase } from './supabase'
import { privacyVersion, type TestConsent } from './consent'
import { ensureProfile } from './profile'
import { langFromPath, isEnVersion } from './i18n'

// 모든 이벤트에 언어를 남김 — 관리자 통계를 언어별로 나눠 보기 위해
const currentLang = () => (typeof window === 'undefined' ? 'ko' : langFromPath(window.location.pathname))

// ── 세션 ID 관리 ──────────────────────────────
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('pp_session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('pp_session_id', id)
  }
  return id
}

export function getTestSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('pp_test_session_id')
}

// ── 도착 정보 (광고·공유 링크의 UTM, 처음 도착한 페이지) ─────────────────────
// 사이트에 처음 들어온 순간의 값을 메모리에만 기억해 둔다. 방문 기록은 나중에(한국어: 바로, 영어: 동의 후)
// 저장되는데, 그때는 이미 다른 페이지로 이동해 주소의 UTM이 사라져 있기 때문. 브라우저 저장소는 쓰지 않음(동의 전 저장 금지)
interface Landing { path: string; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null }
let landing: Landing | null = null
const clip = (v: string | null) => (v ? v.slice(0, 100) : null)

export function captureLanding() {
  if (landing || typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  landing = {
    path: window.location.pathname.slice(0, 200),
    utm_source: clip(params.get('utm_source')),
    utm_medium: clip(params.get('utm_medium')),
    utm_campaign: clip(params.get('utm_campaign')),
  }
}

function getLanding(): Landing {
  captureLanding()
  return landing!
}

// ── 디바이스 구분 ─────────────────────────────
function getDevice(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

// ── 방문 세션 생성 ────────────────────────────
export async function initSession(): Promise<string> {
  const id = getOrCreateSessionId()

  if (sessionStorage.getItem('pp_session_saved')) return id
  if (!supabase) return id
  // 동시에 여러 번 호출돼도 insert는 한 번만
  if (!sessionInit) sessionInit = insertSession(id)
  await sessionInit
  return id
}

let sessionInit: Promise<void> | null = null
async function insertSession(id: string) {
  if (!supabase) return

  const { error } = await supabase.from('sessions').insert({
    id,
    device: getDevice(),
    referrer: document.referrer || null,
    utm_source: getLanding().utm_source,
    utm_medium: getLanding().utm_medium,
    utm_campaign: getLanding().utm_campaign,
    landing_path: getLanding().path,
  })

  // 23505 = 이미 저장된 세션 (중복) → 저장된 것으로 간주
  if (!error || error.code === '23505') sessionStorage.setItem('pp_session_saved', '1')
  else sessionInit = null
}

// ── 이벤트 트래킹 ─────────────────────────────
export async function trackEvent(
  eventType: string,
  metadata: Record<string, unknown> = {}
) {
  const sessionId = getOrCreateSessionId()
  const testSessionId = getTestSessionId()

  if (!supabase) return
  await supabase.from('events').insert({
    session_id: sessionId || null,
    test_session_id: testSessionId || null,
    event_type: eventType,
    metadata: { lang: currentLang(), ...metadata },
  })
}

// ── 관리자 시뮬레이션 여부 (시뮬레이션 결과는 DB에 남기지 않음) ──
export const ADMIN_SIM_KEY = 'pp_admin_sim'
export const HEXACO_VERSION = 'hexaco-v2' // v2: 2026-09-25 A3·C1·C6·O8 문항 교체
export function isAdminSim(): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(ADMIN_SIM_KEY) === '1'
}

// ── 테스트 시작 ───────────────────────────────
export async function startTestSession(testVersion?: string, consent?: TestConsent): Promise<string> {
  // test_sessions.session_id는 sessions를 참조하므로 방문 세션 저장이 먼저 끝나야 함
  await initSession()
  const profileId = await ensureProfile()
  const sessionId = getOrCreateSessionId()
  const testId = crypto.randomUUID()

  if (!supabase) {
    sessionStorage.setItem('pp_test_session_id', testId)
    sessionStorage.setItem('pp_question_start', Date.now().toString())
    return testId
  }

  const { error } = await supabase.from('test_sessions').insert({
    id: testId,
    session_id: sessionId || null,
    is_sample: true,
    device_profile_id: profileId,
    test_version: testVersion ?? null,
    ...(consent ? { consent_version: privacyVersion(isEnVersion(testVersion) ? 'en' : 'ko'), research_consent: consent.research, consented_at: new Date().toISOString() } : {}),
  })

  if (!error) {
    sessionStorage.setItem('pp_test_session_id', testId)
    sessionStorage.setItem('pp_question_start', Date.now().toString())
  }

  await trackEvent('test_start', testVersion ? { test_version: testVersion } : {})
  return testId
}

// ── 이탈 추적 (beforeunload) ──────────────────
export function sendAbandonBeacon(questionIndex: number, total: number, source: 'free' | 'paid' = 'paid') {
  const sessionId =
    typeof window !== 'undefined' ? sessionStorage.getItem('pp_session_id') : null
  if (!supabase || !sessionId) return

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/events`
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const body = JSON.stringify({
    session_id: sessionId,
    event_type: `${source}_test_abandon`,
    metadata: { question_index: questionIndex, total, pct: Math.round(questionIndex / total * 100), source, lang: currentLang() },
  })
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=minimal',
    },
    body,
    keepalive: true,
  }).catch(() => {})
}

// ── 결과 페이지 스크롤 깊이 ──────────────────
const _firedDepths = new Set<number>()
export function initScrollDepthTracking(page: 'free-result' | 'paid-result' | 'hexaco-report' = 'paid-result') {
  if (typeof window === 'undefined') return
  _firedDepths.clear()

  const fire = () => {
    const el = document.documentElement
    const pct = Math.round((el.scrollTop + window.innerHeight) / el.scrollHeight * 100)
    for (const threshold of [25, 50, 75, 100]) {
      if (pct >= threshold && !_firedDepths.has(threshold)) {
        _firedDepths.add(threshold)
        trackEvent('result_scroll_depth', { page, depth: threshold })
      }
    }
  }
  window.addEventListener('scroll', fire, { passive: true })
  return () => window.removeEventListener('scroll', fire)
}

// ── HEXACO 검사 결과 저장 ──────────────────────
export async function saveHexacoResult(
  rawScores: Record<string, number>,   // hexaco_h ~ hexaco_o (1–5 평균)
  archetypePrimary: string,
  archetypeSecondary: string,
  primaryDist: number,
  answers: Record<string, number>,
  version: string = HEXACO_VERSION,
) {
  const testSessionId = getTestSessionId()
  if (!testSessionId || !supabase || isAdminSim()) return
  // 결과 페이지 새로고침 시 완료 이벤트 중복 방지
  if (sessionStorage.getItem('pp_hexaco_saved') === testSessionId) return
  sessionStorage.setItem('pp_hexaco_saved', testSessionId)

  // anon은 test_sessions를 직접 수정할 수 없음 — 미완료 행 1개만 완료 처리하는 RPC 사용
  const { error } = await supabase.rpc('complete_hexaco_session', {
    p_id:        testSessionId,
    p_version:   version,
    p_answers:   answers,
    p_h:         rawScores['H'] ?? null,
    p_e:         rawScores['E'] ?? null,
    p_x:         rawScores['X'] ?? null,
    p_a:         rawScores['A'] ?? null,
    p_c:         rawScores['C'] ?? null,
    p_o:         rawScores['O'] ?? null,
    p_primary:   archetypePrimary,
    p_secondary: archetypeSecondary,
    p_dist:      primaryDist,
  })
  if (error) console.error('complete_hexaco_session failed', error)

  await trackEvent('hexaco_complete', {
    test_version:        version,
    archetype_primary:   archetypePrimary,
    archetype_secondary: archetypeSecondary,
  })
}

// ── HEXACO 결과 화면 행동 (미리보기·시뮬레이션 제외) ──
export async function trackHexaco(
  eventType: 'hexaco_result_view' | 'hexaco_report_click' | 'hexaco_report_view' | 'hexaco_unlock_click' | 'hexaco_share' | 'hexaco_card_save' | 'hexaco_compare_create' | 'hexaco_compare_view',
  metadata: Record<string, unknown> = {},
) {
  if (isAdminSim()) return
  // 퍼널 비율이 새로고침·반복 클릭으로 부풀지 않도록 검사 1회당 이벤트별 1번만 기록
  const onceKey = `pp_tracked_${eventType}_${getTestSessionId() ?? ''}`
  if (sessionStorage.getItem(onceKey)) return
  sessionStorage.setItem(onceKey, '1')
  await trackEvent(eventType, metadata)
}
