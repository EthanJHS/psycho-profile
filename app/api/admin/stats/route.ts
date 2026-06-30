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
    // 행동분석
    paidAnswersRaw,
    abandonEvents,        // paid_test_abandon
    scrollDepthEvents,
    // 무료 행동분석
    freeAnswersRaw,
    freeAbandonEvents,    // free_test_abandon
    freeScrollDepthEvents,
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
    // 행동분석: 유료 문항 응답 (최근 5000개)
    sb.from('paid_answers')
      .select('question_id,question_index,answer_value,time_spent_ms')
      .order('created_at', { ascending: false })
      .limit(5000),
    // 이탈 이벤트
    sb.from('events')
      .select('metadata')
      .eq('event_type', 'paid_test_abandon')
      .order('created_at', { ascending: false })
      .limit(500),
    // 스크롤 깊이 (유료)
    sb.from('events')
      .select('metadata')
      .eq('event_type', 'result_scroll_depth')
      .not('metadata->>page', 'eq', 'free-result')
      .limit(2000),
    sb.from('paid_results').select('id', { count: 'exact', head: true }),
    // 무료 행동분석
    sb.from('test_answers')
      .select('question_id,answer_value,time_spent_ms')
      .order('created_at', { ascending: false })
      .limit(5000),
    sb.from('events')
      .select('metadata')
      .eq('event_type', 'free_test_abandon')
      .order('created_at', { ascending: false })
      .limit(500),
    sb.from('events')
      .select('metadata')
      .eq('event_type', 'result_scroll_depth')
      .eq('metadata->>page', 'free-result')
      .limit(2000),
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

  // ── 행동분석 집계 ────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidAns = (paidAnswersRaw.data ?? []) as any[]

  // 문항별 응답 수 (몇 명이 각 문항에 도달했는지)
  const qReachMap: Record<string, number> = {}
  const qTimeMap:  Record<string, number[]> = {}
  // 문항별 답변 분포 (1~5 각 몇 명)
  const qDistMap:  Record<string, number[]> = {}  // [1,2,3,4,5] counts

  for (const row of paidAns) {
    const qid = row.question_id as string
    qReachMap[qid] = (qReachMap[qid] ?? 0) + 1
    if (row.time_spent_ms != null && row.time_spent_ms > 200 && row.time_spent_ms < 120000) {
      if (!qTimeMap[qid]) qTimeMap[qid] = []
      qTimeMap[qid].push(row.time_spent_ms as number)
    }
    if (row.answer_value != null) {
      if (!qDistMap[qid]) qDistMap[qid] = [0, 0, 0, 0, 0]
      const v = Math.min(5, Math.max(1, row.answer_value as number))
      qDistMap[qid][v - 1]++
    }
  }

  // 문항 퍼널: index 0~81 순서대로 도달 수
  const questionFunnel = Array.from({ length: 82 }, (_, i) => {
    const qid = `PQ${i + 1}`
    return { qid, index: i, reach: qReachMap[qid] ?? 0 }
  })

  // 느린 문항 TOP 10 (유료)
  const paidSlowQuestions = Object.entries(qTimeMap)
    .map(([qid, times]) => ({
      qid,
      avg_ms: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      count: times.length,
    }))
    .sort((a, b) => b.avg_ms - a.avg_ms)
    .slice(0, 10)

  // 이탈 지점 분포
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const abandonData = (abandonEvents.data ?? []) as any[]
  const abandonByIdx: Record<number, number> = {}
  for (const ev of abandonData) {
    const idx = (ev.metadata as { question_index?: number })?.question_index ?? -1
    if (idx >= 0) abandonByIdx[idx] = (abandonByIdx[idx] ?? 0) + 1
  }
  // 구간(10문항)으로 묶기
  const abandonByBucket = Array.from({ length: 9 }, (_, b) => {
    const start = b * 10, end = Math.min(81, start + 9)
    const count = Object.entries(abandonByIdx)
      .filter(([i]) => Number(i) >= start && Number(i) <= end)
      .reduce((s, [, c]) => s + c, 0)
    return { label: `Q${start + 1}~${end + 1}`, count }
  })

  // 스크롤 깊이 분포
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollData = (scrollDepthEvents.data ?? []) as any[]
  const scrollDist: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 }
  for (const ev of scrollData) {
    const d = (ev.metadata as { depth?: number })?.depth
    if (d) scrollDist[`${d}%`] = (scrollDist[`${d}%`] ?? 0) + 1
  }

  // 답변 분포 샘플 (HEXACO 섹션 대표 문항 PQ1~PQ12)
  const answerDistSample = ['PQ1','PQ13','PQ25','PQ37','PQ49','PQ67'].map(qid => ({
    qid,
    dist: qDistMap[qid] ?? [0, 0, 0, 0, 0],
  }))

  // ── 무료 행동분석 집계 ──────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freeAns = (freeAnswersRaw.data ?? []) as any[]

  const fqReachMap: Record<string, number> = {}
  const fqTimeMap:  Record<string, number[]> = {}
  const fqDistMap:  Record<string, number[]> = {}

  for (const row of freeAns) {
    const qid = row.question_id as string
    fqReachMap[qid] = (fqReachMap[qid] ?? 0) + 1
    if (row.time_spent_ms != null && row.time_spent_ms > 200 && row.time_spent_ms < 120000) {
      if (!fqTimeMap[qid]) fqTimeMap[qid] = []
      fqTimeMap[qid].push(row.time_spent_ms as number)
    }
    if (row.answer_value != null) {
      if (!fqDistMap[qid]) fqDistMap[qid] = [0, 0, 0, 0, 0]
      const v = Math.min(5, Math.max(1, Number(row.answer_value)))
      fqDistMap[qid][v - 1]++
    }
  }

  const allFreeQids = [...new Set(freeAns.map(r => r.question_id as string))]
  const freeQuestionFunnel = allFreeQids.map((qid, i) => ({
    qid, index: i, reach: fqReachMap[qid] ?? 0,
  }))

  const freeSlowQuestions = Object.entries(fqTimeMap)
    .map(([qid, times]) => ({
      qid,
      avg_ms: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      count: times.length,
    }))
    .sort((a, b) => b.avg_ms - a.avg_ms)
    .slice(0, 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freeAbandonData = (freeAbandonEvents.data ?? []) as any[]
  const freeAbandonByBucket = Array.from({ length: 5 }, (_, b) => {
    const start = b * 9, end = Math.min(41, start + 8)
    const count = freeAbandonData.filter(ev => {
      const idx = (ev.metadata as { question_index?: number })?.question_index ?? -1
      return idx >= start && idx <= end
    }).length
    return { label: `Q${start + 1}~${end + 1}`, count }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freeScrollData = (freeScrollDepthEvents.data ?? []) as any[]
  const freeScrollDist: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 }
  for (const ev of freeScrollData) {
    const d = (ev.metadata as { depth?: number })?.depth
    if (d) freeScrollDist[`${d}%`] = (freeScrollDist[`${d}%`] ?? 0) + 1
  }

  const freeDistSampleQids = allFreeQids.slice(0, 5)
  const freeAnswerDistSample = freeDistSampleQids.map(qid => ({
    qid,
    dist: fqDistMap[qid] ?? [0, 0, 0, 0, 0],
  }))

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
    // 행동분석
    behavior: {
      paid: {
        question_funnel: questionFunnel,
        slow_questions: paidSlowQuestions,
        abandon_by_bucket: abandonByBucket,
        scroll_depth: scrollDist,
        answer_dist_sample: answerDistSample,
      },
      free: {
        question_funnel: freeQuestionFunnel,
        slow_questions: freeSlowQuestions,
        abandon_by_bucket: freeAbandonByBucket,
        scroll_depth: freeScrollDist,
        answer_dist_sample: freeAnswerDistSample,
      },
    },
  })
}
