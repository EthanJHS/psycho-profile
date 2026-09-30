import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let email: unknown
  try { ({ email } = await req.json()) } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
  // 이미 신청한 이메일도 성공으로 처리 (중복 여부를 노출하지 않음)
  const { error } = await sb.from('waitlist').upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email', ignoreDuplicates: true })
  if (error) {
    console.error('waitlist insert failed', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
