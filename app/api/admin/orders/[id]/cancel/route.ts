import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, ADMIN_CHALLENGE } from '@/lib/admin-auth'
import { serviceClient, UUID } from '@/lib/career/server'
import { cancelPayment } from '@/lib/payapp'

// 관리자 환불 — 페이앱 결제 취소 API 호출. 최종 상태는 페이앱 알림(pay_state 9·64)으로도 다시 반영됨
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: ADMIN_CHALLENGE })
  }
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  let memo = '고객 요청 환불'
  try { const b = await req.json(); if (typeof b?.memo === 'string' && b.memo.trim()) memo = b.memo.trim() } catch { /* 기본 사유 */ }

  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })
  const { data: order } = await sb.from('orders').select('status, provider, provider_ref').eq('id', id).maybeSingle()
  if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (order.status !== 'paid') return NextResponse.json({ error: `결제 완료 상태가 아닙니다 (${order.status})` }, { status: 409 })

  if (order.provider === 'payapp') {
    if (!order.provider_ref) return NextResponse.json({ error: '페이앱 결제 번호가 없습니다' }, { status: 409 })
    const r = await cancelPayment(order.provider_ref, memo)
    if (!r.ok) return NextResponse.json({ error: r.message }, { status: 502 })
  }
  const now = new Date().toISOString()
  await sb.from('orders').update({ status: order.provider === 'payapp' ? 'refunded' : 'cancelled', cancelled_at: now, updated_at: now }).eq('id', id)
  return NextResponse.json({ ok: true })
}
