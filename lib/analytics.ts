'use client'

import { supabase } from './supabase'
import { Answer, TestResult } from '@/types'

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

// ── UTM 파라미터 추출 ─────────────────────────
function getUtm() {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') ?? null,
    utm_medium: params.get('utm_medium') ?? null,
    utm_campaign: params.get('utm_campaign') ?? null,
  }
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

  const { error } = await supabase.from('sessions').insert({
    id,
    device: getDevice(),
    referrer: document.referrer || null,
    ...getUtm(),
  })

  if (!error) sessionStorage.setItem('pp_session_saved', '1')
  return id
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
    metadata,
  })
}

// ── 테스트 시작 ───────────────────────────────
export async function startTestSession(): Promise<string> {
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
  })

  if (!error) {
    sessionStorage.setItem('pp_test_session_id', testId)
    sessionStorage.setItem('pp_question_start', Date.now().toString())
  }

  await trackEvent('test_start')
  return testId
}

// ── 문항 응답 저장 ────────────────────────────
export async function saveAnswer(answer: Answer) {
  const testSessionId = getTestSessionId()
  if (!testSessionId) return

  const startedAt = parseInt(sessionStorage.getItem('pp_question_start') ?? '0')
  const timeSpentMs = startedAt ? Date.now() - startedAt : null

  if (!supabase) return
  await supabase.from('test_answers').insert({
    test_session_id: testSessionId,
    question_id: answer.questionId,
    answer_value: String(answer.value),
    time_spent_ms: timeSpentMs,
  })

  // 다음 문항 시작 시간 갱신
  sessionStorage.setItem('pp_question_start', Date.now().toString())
}

// ── 테스트 완료 저장 ──────────────────────────
export async function completeTestSession(
  result: TestResult,
  facets: Record<string, number>,
  cogScore: number,
  life: Record<string, string>
) {
  const testSessionId = getTestSessionId()
  if (!testSessionId) return

  if (!supabase) return
  await supabase.from('test_sessions').update({
    completed_at: new Date().toISOString(),
    profile_id: result.profileId,
    cog_score: cogScore,
    facet_diligence: facets['diligence'] ?? null,
    facet_curiosity: facets['curiosity'] ?? null,
    facet_anxiety: facets['anxiety'] ?? null,
    facet_boldness: facets['boldness'] ?? null,
    facet_humility: facets['humility'] ?? null,
    facet_patience: facets['patience'] ?? null,
    chronotype: life['chronotype'] ?? null,
    learning_style: life['learning_style'] ?? null,
    execution_style: life['execution_style'] ?? null,
  }).eq('id', testSessionId)

  await trackEvent('test_complete', { profile_id: result.profileId })
}

// ── 결과 페이지 조회 ──────────────────────────
export async function trackResultView(profileId: string) {
  await trackEvent('result_view', { profile_id: profileId })
}

// ── 업그레이드 클릭 ───────────────────────────
export async function trackUpgradeClick(source: string) {
  await trackEvent('upgrade_click', { source })
}

// ── 유료 검사 결과 저장 ───────────────────────
export async function savePaidResult(
  hexaco: Record<string, number>,
  subFacets: Record<string, number>,
  riasecTop3: string[],
  aptitudeProfile: string,
) {
  const sessionId = getOrCreateSessionId()
  if (!supabase) return

  await supabase.from('paid_results').insert({
    session_id: sessionId || null,
    hexaco_h: hexaco['H'] ?? null,
    hexaco_e: hexaco['E'] ?? null,
    hexaco_x: hexaco['X'] ?? null,
    hexaco_a: hexaco['A'] ?? null,
    hexaco_c: hexaco['C'] ?? null,
    hexaco_o: hexaco['O'] ?? null,
    riasec_top3: riasecTop3.join(''),
    aptitude_profile: aptitudeProfile,
    subfacets: subFacets,
    created_at: new Date().toISOString(),
  })

  await trackEvent('paid_test_complete', { riasec_top3: riasecTop3.join(''), aptitude_profile: aptitudeProfile })
}
