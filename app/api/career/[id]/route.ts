import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 리포트 조회 — 익명 사용자는 assessments를 직접 읽을 수 없어 서버에서만 조회.
// 결제 연동 후에는 여기서 orders.status = 'paid' 여부를 확인한다.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
  const { data, error } = await sb.from('assessments')
    .select('stage, plan, scores, completed_at')
    .eq('id', id).eq('product', 'career').not('completed_at', 'is', null)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'db error' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } })
}
