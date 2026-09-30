import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 무료 검사 결과 만족도 — 완료된 검사 1회당 1건 (별점을 바꾸거나 의견을 덧붙이면 같은 행을 갱신)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  const { rating, opinion, testSessionId } = body
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid rating' }, { status: 400 })
  }
  if (typeof testSessionId !== 'string' || !UUID.test(testSessionId)) {
    return NextResponse.json({ error: 'invalid test' }, { status: 400 })
  }
  if (opinion != null && (typeof opinion !== 'string' || opinion.length > 500)) {
    return NextResponse.json({ error: 'invalid opinion' }, { status: 400 })
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 500 })
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)

  // 실제로 끝난 검사에만 받음 — 원형·문항 버전도 클라이언트가 아닌 검사 기록에서 가져옴
  const { data: test } = await sb.from('test_sessions')
    .select('archetype_primary, test_version').eq('id', testSessionId).not('completed_at', 'is', null).maybeSingle()
  if (!test) return NextResponse.json({ error: 'test not found' }, { status: 404 })

  const { error } = await sb.from('survey_responses').upsert({
    test_session_id: testSessionId,
    rating,
    ...(typeof opinion === 'string' ? { opinion: opinion.trim() || null } : {}),
    result_type: 'hexaco',
    archetype: test.archetype_primary,
    test_version: test.test_version,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'test_session_id' })
  if (error) {
    console.error('survey upsert failed', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
