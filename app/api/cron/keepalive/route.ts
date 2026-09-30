import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase 무료 플랜은 일정 기간 요청이 없으면 프로젝트를 일시정지함 → Vercel Cron이 하루 한 번 가볍게 조회
// Vercel은 CRON_SECRET이 설정돼 있으면 Authorization: Bearer <CRON_SECRET> 헤더를 붙여 호출함
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
  const { count, error } = await sb.from('test_sessions').select('id', { count: 'exact', head: true })
  if (error) {
    console.error('keepalive query failed', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 })
  }
  return NextResponse.json({ ok: true, test_sessions: count, at: new Date().toISOString() })
}
