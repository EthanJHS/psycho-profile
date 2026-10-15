import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, UUID } from '@/lib/career/server'

// 리포트 조회 — 익명 사용자는 assessments를 직접 읽을 수 없어 서버에서만 조회.
// 검사 기록은 결제가 확정된 주문으로만 만들어지므로(/api/career/start), 완료된 검사 = 결제된 리포트
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const { data, error } = await sb.from('assessments')
    .select('stage, plan, scores, completed_at, first_viewed_at')
    .eq('id', id).eq('product', 'career').not('completed_at', 'is', null)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'db error' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // 첫 열람 시각 — 환불 가능 여부를 판단하는 근거
  if (!data.first_viewed_at) {
    await sb.from('assessments').update({ first_viewed_at: new Date().toISOString() }).eq('id', id).is('first_viewed_at', null)
  }
  const { first_viewed_at: _, ...report } = data
  return NextResponse.json(report, { headers: { 'Cache-Control': 'private, no-store' } })
}
