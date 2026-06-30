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
  ])

  // 프로파일 분포 집계
  const profileMap: Record<string, number> = {}
  for (const row of (profileStats.data ?? [])) {
    const id = row.profile_id ?? 'unknown'
    profileMap[id] = (profileMap[id] ?? 0) + 1
  }
  const profileDist = Object.entries(profileMap)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)

  // 일별 퍼널 집계
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

  // 문항별 평균 응답 시간
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

  // 디바이스 분포
  const deviceMap: Record<string, number> = {}
  for (const row of (deviceStats.data ?? [])) {
    const d = row.device ?? 'unknown'
    deviceMap[d] = (deviceMap[d] ?? 0) + 1
  }

  // 전환율 계산
  const starts = (dailyFunnel.data ?? []).filter(e => e.event_type === 'test_start').length
  const completes = (dailyFunnel.data ?? []).filter(e => e.event_type === 'test_complete').length
  const upgrades = (dailyFunnel.data ?? []).filter(e => e.event_type === 'upgrade_click').length

  return NextResponse.json({
    overview: {
      total_sessions: totalSessions.count ?? 0,
      total_test_sessions: totalTestSessions.count ?? 0,
      completed_sessions: completedSessions.count ?? 0,
      full_completes: fullCompletes.count ?? 0,
      completion_rate_14d: starts > 0 ? Math.round((completes / starts) * 100) : 0,
      upgrade_rate_14d: completes > 0 ? Math.round((upgrades / completes) * 100) : 0,
    },
    profile_distribution: profileDist,
    daily_funnel: funnelRows,
    slow_questions: questionTimeSorted,
    device_distribution: deviceMap,
    recent_events: recentEvents.data ?? [],
  })
}
