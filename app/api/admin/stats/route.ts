import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthorized, ADMIN_CHALLENGE } from '@/lib/admin-auth'
import { QUESTIONS, ARCHETYPES, scoreHexaco, HexacoFactor } from '@/lib/scoring-hexaco'

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']
const DAY = 86400000

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

type Row = Record<string, unknown>
const countBy = <T,>(items: T[], key: (t: T) => string | null | undefined) => {
  const m: Record<string, number> = {}
  for (const it of items) { const k = key(it); if (k) m[k] = (m[k] ?? 0) + 1 }
  return m
}
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const variance = (xs: number[]) => { const m = mean(xs); return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1) }
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d

// 무작위 응답 기준 원형 기대 비율 (고정 시드라 호출마다 동일)
function expectedDistribution(n = 5000): Record<string, number> {
  let seed = 42
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const counts: Record<string, number> = {}
  for (let i = 0; i < n; i++) {
    const bias: Record<string, number> = {}
    for (const f of FACTORS) bias[f] = (rand() - 0.5) * 2.4
    const ans: Record<string, number> = {}
    for (const q of QUESTIONS) {
      const v = 3 + (q.reverse ? -bias[q.factor] : bias[q.factor]) + (rand() - 0.5) * 2
      ans[q.id] = Math.max(1, Math.min(5, Math.round(v)))
    }
    const id = scoreHexaco(ans).primary.id
    counts[id] = (counts[id] ?? 0) + 1
  }
  return Object.fromEntries(ARCHETYPES.map(a => [a.id, round((counts[a.id] ?? 0) / n * 100, 1)]))
}
const EXPECTED = expectedDistribution()

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: ADMIN_CHALLENGE })
  }
  const sb = getServiceClient()
  const since14 = new Date(Date.now() - 14 * DAY).toISOString()

  const [sessionsRes, testsRes, eventsRes, recentRes, waitlistRes, surveyRes] = await Promise.all([
    sb.from('sessions').select('device, created_at').gte('created_at', since14),
    sb.from('test_sessions')
      .select('started_at, completed_at, test_version, research_consent, archetype_primary, hexaco_h, hexaco_e, hexaco_x, hexaco_a, hexaco_c, hexaco_o, hexaco_answers')
      .like('test_version', 'hexaco%'),
    sb.from('events').select('event_type, metadata, created_at')
      .in('event_type', ['hexaco_result_view', 'hexaco_report_click', 'hexaco_report_view', 'hexaco_unlock_click', 'hexaco_share', 'waitlist_signup', 'free_test_abandon', 'result_scroll_depth'])
      .gte('created_at', since14).limit(10000),
    sb.from('events').select('event_type, metadata, created_at').order('created_at', { ascending: false }).limit(20),
    sb.from('waitlist').select('email', { count: 'exact', head: true }),
    sb.from('survey_responses').select('rating, opinion, result_type, created_at').order('created_at', { ascending: false }).limit(500),
  ])

  const tests = (testsRes.data ?? []) as Row[]
  const events = (eventsRes.data ?? []) as Row[]
  const completed = tests.filter(t => t.completed_at)
  const answered = completed.filter(t => t.hexaco_answers && typeof t.hexaco_answers === 'object') as (Row & { hexaco_answers: Record<string, number> })[]

  // ── 요약 ──
  const by = (type: string) => events.filter(e => e.event_type === type)
  const started14 = tests.filter(t => String(t.started_at) >= since14)
  const completed14 = started14.filter(t => t.completed_at)
  const overview = {
    visits_14d: sessionsRes.data?.length ?? 0,
    started_total: tests.length,
    completed_total: completed.length,
    completion_rate_14d: started14.length ? Math.round(completed14.length / started14.length * 100) : 0,
    by_version: countBy(completed, t => String(t.test_version)),
    waitlist: waitlistRes.count ?? 0,
  }

  // ── 결과 화면 퍼널 (최근 14일, 검사 1회당 1번씩 기록됨) ──
  const unlock = by('hexaco_unlock_click')
  const result_funnel = {
    completed: completed14.length,
    result_view: by('hexaco_result_view').length,
    report_click: by('hexaco_report_click').length,
    report_view: by('hexaco_report_view').length,
    unlock_click: unlock.length,
    unlock_by_source: countBy(unlock, e => (e.metadata as Row)?.source as string),
  }
  const scroll = by('result_scroll_depth').filter(e => (e.metadata as Row)?.page === 'hexaco-report')
  const scroll_depth = Object.fromEntries([25, 50, 75, 100].map(d => [`${d}%`, scroll.filter(e => (e.metadata as Row)?.depth === d).length]))

  // ── 일별 (최근 7일) ──
  const daily = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.now() - i * DAY).toISOString().slice(0, 10)
    const onDay = (v: unknown) => String(v ?? '').slice(0, 10) === day
    return {
      day,
      started: tests.filter(t => onDay(t.started_at)).length,
      completed: tests.filter(t => onDay(t.completed_at)).length,
      report_view: by('hexaco_report_view').filter(e => onDay(e.created_at)).length,
      unlock_click: unlock.filter(e => onDay(e.created_at)).length,
    }
  })

  // ── 이탈 구간 (48문항, 8문항 단위) ──
  const abandons = by('free_test_abandon').map(e => Number((e.metadata as Row)?.question_index ?? -1)).filter(i => i >= 0)
  const abandon_by_bucket = Array.from({ length: 6 }, (_, b) => ({
    label: `Q${b * 8 + 1}–${b * 8 + 8}`,
    count: abandons.filter(i => i >= b * 8 && i < b * 8 + 8).length,
  }))

  // ── 원형 분포: 실제 vs 기대 (v2만) ──
  const v2 = completed.filter(t => t.test_version === 'hexaco-v2')
  const actual = countBy(v2, t => t.archetype_primary as string)
  const archetype_distribution = ARCHETYPES.map(a => ({
    id: a.id, count: actual[a.id] ?? 0,
    pct: v2.length ? round((actual[a.id] ?? 0) / v2.length * 100, 1) : 0,
    expected_pct: EXPECTED[a.id],
  })).sort((a, b) => b.count - a.count || b.expected_pct - a.expected_pct)

  // ── 요인 평균 (v2) ──
  const factor_means = Object.fromEntries(FACTORS.map(f => {
    const xs = v2.map(t => Number(t[`hexaco_${f.toLowerCase()}`])).filter(x => !isNaN(x) && x > 0)
    return [f, xs.length ? { mean: round(mean(xs)), sd: xs.length > 1 ? round(Math.sqrt(variance(xs))) : 0 } : null]
  }))

  // ── 문항 품질 (v2, 응답 원자료 기준) ──
  // 연구·검사 개선 목적 분석은 선택 동의한 응답만 사용
  const items = answered.filter(t => t.test_version === 'hexaco-v2' && t.research_consent === true).map(t => t.hexaco_answers)
  const scored = (a: Record<string, number>, q: typeof QUESTIONS[number]) => q.reverse ? 6 - a[q.id] : a[q.id]
  const item_stats = QUESTIONS.map(q => {
    const raw = items.map(a => a[q.id]).filter(v => v >= 1 && v <= 5)
    const dist = [1, 2, 3, 4, 5].map(v => raw.filter(x => x === v).length)
    // 교정된 문항-총점 상관: 이 문항을 뺀 같은 요인 합계와의 상관 (낮거나 음수면 문항 점검 필요)
    const same = QUESTIONS.filter(o => o.factor === q.factor && o.id !== q.id)
    const pairs = items.filter(a => same.every(o => a[o.id]) && a[q.id]).map(a => [scored(a, q), same.reduce((s, o) => s + scored(a, o), 0)])
    let item_total_r: number | null = null
    if (pairs.length >= 10) {
      const xs = pairs.map(p => p[0]), ys = pairs.map(p => p[1])
      const mx = mean(xs), my = mean(ys)
      const cov = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
      const den = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) * ys.reduce((s, y) => s + (y - my) ** 2, 0))
      item_total_r = den ? round(cov / den) : null
    }
    return {
      id: q.id, factor: q.factor, reverse: q.reverse, n: raw.length,
      mean: raw.length ? round(mean(raw)) : null,
      sd: raw.length > 1 ? round(Math.sqrt(variance(raw))) : null,
      dist, item_total_r,
    }
  })
  const reliability = Object.fromEntries(FACTORS.map(f => {
    const qs = QUESTIONS.filter(q => q.factor === f)
    const full = items.filter(a => qs.every(q => a[q.id] >= 1 && a[q.id] <= 5))
    if (full.length < 10) return [f, { alpha: null, n: full.length }]
    const itemVars = qs.reduce((s, q) => s + variance(full.map(a => scored(a, q))), 0)
    const totalVar = variance(full.map(a => qs.reduce((s, q) => s + scored(a, q), 0)))
    const k = qs.length
    return [f, { alpha: totalVar ? round(k / (k - 1) * (1 - itemVars / totalVar)) : null, n: full.length }]
  }))

  // ── 디바이스 (최근 14일 방문) ──
  const device_distribution = countBy((sessionsRes.data ?? []) as Row[], s => (s.device as string) ?? 'unknown')

  // ── 설문 ──
  const surveys = (surveyRes.data ?? []) as Row[]
  const survey = {
    count: surveys.length,
    avg_rating: surveys.length ? round(mean(surveys.map(s => Number(s.rating)))) : null,
    rating_dist: [1, 2, 3, 4, 5].map(r => surveys.filter(s => Number(s.rating) === r).length),
    recent_opinions: surveys.filter(s => s.opinion).slice(0, 5).map(s => ({ rating: s.rating, opinion: s.opinion, created_at: s.created_at })),
  }

  // ── CORE CAREER: 시기×목적 조합별 시작·완료 ──
  const { data: careerRows } = await sb.from('assessments').select('stage, plan, completed_at').eq('product', 'career').limit(10000)
  const careerMap: Record<string, { started: number; completed: number }> = {}
  for (const r of (careerRows ?? []) as Row[]) {
    const k = `${r.stage}|${r.plan}`
    careerMap[k] ??= { started: 0, completed: 0 }
    careerMap[k].started++
    if (r.completed_at) careerMap[k].completed++
  }
  const career = Object.entries(careerMap).map(([k, v]) => ({ stage: k.split('|')[0], plan: k.split('|')[1], ...v })).sort((a, b) => b.started - a.started)

  // ── 관문 지표: 다음 제품(유료 결제·CORE CAREER 공개)으로 넘어갈 조건. 최근 14일 기준 ──
  const pct = (a: number, b: number) => (b > 0 ? Math.round(a / b * 1000) / 10 : null)
  const gate = [
    { key: 'completion', label: '무료 검사 완료율', value: pct(completed14.length, started14.length), target: 60, unit: '%', basis: `시작 ${started14.length}명 중 완료` },
    { key: 'satisfaction', label: '결과 만족도', value: survey.avg_rating, target: 4.0, unit: '점', basis: `설문 ${survey.count}건 평균` },
    { key: 'interest', label: '유료 관심률 (진로 리포트 클릭)', value: pct(unlock.length, completed14.length), target: 10, unit: '%', basis: '검사 완료 대비' },
    { key: 'waitlist', label: '사전 알림 신청률', value: pct(by('waitlist_signup').length, completed14.length), target: 3, unit: '%', basis: '검사 완료 대비' },
    { key: 'share', label: '공유율', value: pct(by('hexaco_share').length, completed14.length), target: 5, unit: '%', basis: '검사 완료 대비' },
  ].map(g => ({ ...g, met: g.value != null && g.value >= g.target }))
  const MIN_SAMPLE = 100

  // 저장 상태 — Supabase가 일시정지되면 저장이 조용히 실패하므로 마지막 기록 시각으로 확인
  const health = {
    db_ok: !recentRes.error && !testsRes.error,
    last_saved_at: (recentRes.data?.[0]?.created_at as string | undefined) ?? null,
  }

  return NextResponse.json({
    health,
    gate: { items: gate, sample: completed14.length, minSample: MIN_SAMPLE },
    career,
    overview, result_funnel, scroll_depth, daily, abandon_by_bucket,
    archetype_distribution, factor_means, item_stats, reliability,
    device_distribution, survey,
    recent_events: recentRes.data ?? [],
  })
}
