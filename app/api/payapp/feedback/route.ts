import { NextRequest } from 'next/server'
import { serviceClient, UUID } from '@/lib/career/server'
import { verifyFeedback, statusFromPayState } from '@/lib/payapp'

// 페이앱 결제 알림 (feedbackurl) — 결제 완료·취소 등 상태가 바뀔 때마다 호출되고, 같은 알림이 여러 번 올 수 있음
// 응답 본문이 정확히 "SUCCESS"여야 페이앱이 재전송을 멈춘다
const text = (body: string, status = 200) => new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

export async function POST(req: NextRequest) {
  const form = new URLSearchParams(await req.text())
  if (!verifyFeedback(form)) {
    console.warn('payapp feedback rejected: credentials mismatch')
    return text('FAIL', 403)
  }

  const orderId = form.get('var1') ?? ''
  const state = Number(form.get('pay_state'))
  const price = Number(form.get('price'))
  const mulNo = form.get('mul_no') ?? ''
  if (!UUID.test(orderId) || !mulNo) return text('FAIL', 400)

  const sb = serviceClient()
  if (!sb) return text('FAIL', 503)
  const { data: order, error } = await sb.from('orders').select('id, amount, status, provider_ref').eq('id', orderId).maybeSingle()
  if (error) return text('FAIL', 500)
  if (!order) return text('FAIL', 404)
  // 주문 금액과 결제 금액이 다르면 확정하지 않음 (결제창 금액 조작 방지)
  if (state === 4 && price !== order.amount) {
    console.error('payapp feedback amount mismatch', { orderId, price, amount: order.amount })
    return text('FAIL', 400)
  }
  // 다른 결제 건이 이미 이 주문에 연결돼 있으면 무시
  if (order.provider_ref && order.provider_ref !== mulNo) return text('SUCCESS')

  const next = statusFromPayState(state)
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { provider_ref: mulNo, provider_state: state, updated_at: now }
  if (next === 'paid') {
    // 이미 환불된 주문이 늦게 도착한 "완료" 알림으로 되살아나지 않게
    if (order.status === 'pending' || order.status === 'waiting') Object.assign(patch, { status: 'paid', paid_at: now })
  } else if (next === 'waiting') {
    if (order.status === 'pending') patch.status = 'waiting'
  } else if (next) {
    Object.assign(patch, { status: next, cancelled_at: now })
  }

  const { error: upErr } = await sb.from('orders').update(patch).eq('id', orderId)
  if (upErr) {
    console.error('order update failed', upErr)
    return text('FAIL', 500)
  }
  return text('SUCCESS')
}
