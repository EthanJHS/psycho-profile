import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin1234'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (pw !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = getServiceClient()

  const [
    totalSessions,
    totalTestSessions,
    completedSessions,
    fullCompletes,
    profileStats,
    dailyFunnel,
    recentEvents,
    slowQuestions,
    deviceStats,
    // 유료 검사 전용
    paidResults,
    paidCount,
  ] = await Promise.all([
    sb.from('sessions').select('id', { count: 'exact', head: true }),
    sb.from('test_sessions').select('id', { count: 'exact', head: true }),
    sb.from('test_sessions').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
    sb.from('test_sessions').select('id', { count: 'exact', head: true }).eq('is_sample', false),
    sb.from('test_sessions')
      .select('profile_id')
      .not('completed_at', 'is', null)
      .not('profile_id', 'is', null),
    sb.from('events')
      .select('event_type, created_at')
      .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
      .order('created_at', { ascending: false }),
    sb.from('events')
      .select('event_type, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    sb.from('test_answers')
      .select('question_id, time_spent_ms')
      .not('time_spent_ms', 'is', null)
      .gt('time_spent_ms', 500)
      .order('time_spent_ms', { ascending: false })
      .limit(200),
    sb.from('sessions').select('device'),
    // 유료 검사 결과 전체 (집계용)
    sb.from('paid_results').select(
      'hexaco_h,hexaco_e,hexaco_x,hexaco_a,hexaco_c,hexaco_o,' +
      'riasec_top3,aptitude_profile,pattern_key,completion_ms,device'
    ),
    sb.from('paid_results').select('id', { count: 'exact', head: true }),
  ])

  // ── 프로파일 분포 집계 ─────────────────────────────────────────────
  const profileMap: Record<string, number> = {}
  for (const row of (profileStats.data ?? [])) {
    const id = row.profile_id ?? 'unknown'
    profileMap[id] = (profileMap[id] ?? 0) + 1
  }
  const profileDist = Object.entries(profileMap)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)

  // ── 일별 퍼널 집계 ────────────────────────────────────────────────
  const funnelByDay: Record<string, Record<string, number>> = {}
  for (const ev of (dailyFunnel.data ?? [])) {
    const day = ev.created_at.slice(0, 10)
    if (!funnelByDay[day]) funnelByDay[day] = {}
    funnelByDay[day][ev.event_type] = (funnelByDay[day][ev.event_type] ?? 0) + 1
  }
  const funnelRows = Object.entries(funnelByDay)
    .map(([day, counts]) => ({ day, ...counts }))
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, 7)

  // ── 문항별 평균 응답 시간 ─────────────────────────────────────────
  const questionTimes: Record<string, number[]> = {}
  for (const row of (slowQuestions.data ?? [])) {
    if (!questionTimes[row.question_id]) questionTimes[row.question_id] = []
    questionTimes[row.question_id].push(row.time_spent_ms)
  }
  const questionTimeSorted = Object.entries(questionTimes)
    .map(([qid, times]) => ({
      qid,
      avg_ms: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      count: times.length,
    }))
    .sort((a, b) => b.avg_ms - a.avg_ms)
    .slice(0, 10)

  // ── 디바이스 분포 ────────────────────────────────────────────────
  const deviceMap: Record<string, number> = {}
  for (const row of (deviceStats.data ?? [])) {
    const d = row.device ?? 'unknown'
    deviceMap[d] = (deviceMap[d] ?? 0) + 1
  }

  // ── 전환율 계산 ──────────────────────────────────────────────────
  const starts   = (dailyFunnel.data ?? []).filter(e => e.event_type === 'test_start').length
  const completes = (dailyFunnel.data ?? []).filter(e => e.event_type === 'test_complete').length
  const upgrades  = (dailyFunnel.data ?? []).filter(e => e.event_type === 'upgrade_click').length

  // ── 유료 검사 집계 ───────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paid = (paidResults.data ?? []) as any[]

  // HEXACO 요인별 평균
  const hexacoFactors = ['h','e','x','a','c','o'] as const
  const hexacoAvg: Record<string, number> = {}
  for (const f of hexacoFactors) {
    const key = `hexaco_${f}` as keyof typeof paid[0]
    const vals = paid.map(r => Number(r[key])).filter(v => !isNaN(v) && v > 0)
    hexacoAvg[f.toUpperCase()] = vals.length
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
      : 0
  }

  // 패턴 분포
  const patternMap: Record<string, number> = {}
  for (const r of paid) {
    if (r.pattern_key) patternMap[r.pattern_key] = (patternMap[r.pattern_key] ?? 0) + 1
  }
  const patternDist = Object.entries(patternMap)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)

  // RIASEC top 코드 분포
  const riasecMap: Record<string, number> = {}
  for (const r of paid) {
    if (r.riasec_top3) riasecMap[r.riasec_top3] = (riasecMap[r.riasec_top3] ?? 0) + 1
  }
  const riasecDist = Object.entries(riasecMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 적성 프로파일 분포
  const aptMap: Record<string, number> = {}
  for (const r of paid) {
    if (r.aptitude_profile) aptMap[r.aptitude_profile] = (aptMap[r.aptitude_profile] ?? 0) + 1
  }
  const aptDist = Object.entries(aptMap)
    .map(([profile, count]) => ({ profile, count }))
    .sort((a, b) => b.count - a.count)

  // 평균 완료 시간
  const completionTimes = paid.map(r => r.completion_ms).filter((v): v is number => v != null && v > 0)
  const avgCompletionMs = completionTimes.length
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : null

  // 유료 디바이스 분포
  const paidDeviceMap: Record<string, number> = {}
  for (const r of paid) {
    const d = r.device ?? 'unknown'
    paidDeviceMap[d] = (paidDeviceMap[d] ?? 0) + 1
  }

  return NextResponse.json({
    overview: {
      total_sessions: totalSessions.count ?? 0,
      total_test_sessions: totalTestSessions.count ?? 0,
      completed_sessions: completedSessions.count ?? 0,
      full_completes: fullCompletes.count ?? 0,
      paid_completes: paidCount.count ?? 0,
      completion_rate_14d: starts > 0 ? Math.round((completes / starts) * 100) : 0,
      upgrade_rate_14d: completes > 0 ? Math.round((upgrades / completes) * 100) : 0,
    },
    profile_distribution: profileDist,
    daily_funnel: funnelRows,
    slow_questions: questionTimeSorted,
    device_distribution: deviceMap,
    recent_events: recentEvents.data ?? [],
    // 유료 검사 전용
    paid: {
      hexaco_avg: hexacoAvg,
      pattern_distribution: patternDist,
      riasec_distribution: riasecDist,
      aptitude_distribution: aptDist,
      avg_completion_ms: avgCompletionMs,
      device_distribution: paidDeviceMap,
    },
  })
}
