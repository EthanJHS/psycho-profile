import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, isStage, isPlan, UUID } from '@/lib/career/server'
import { ITEM_BANK_VERSION } from '@/lib/career/flow'
import { PRIVACY_VERSION } from '@/lib/consent'

// 진로 검사 기록 생성 — 결제가 확정된 주문만, 주문 하나당 검사 하나.
// 시기·목적은 브라우저가 보낸 값이 아니라 주문에 저장된 값을 쓴다
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  const { orderId, profileId, hexacoSessionId, research } = body
  if (typeof orderId !== 'string' || !UUID.test(orderId)) return NextResponse.json({ error: 'order required' }, { status: 402 })

  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const { data: order, error: oErr } = await sb.from('orders').select('status, stage, plan, assessment_id').eq('id', orderId).eq('product', 'career').maybeSingle()
  if (oErr) return NextResponse.json({ error: 'db error' }, { status: 500 })
  if (!order || order.status !== 'paid' || !isStage(order.stage) || !isPlan(order.plan)) return NextResponse.json({ error: 'not paid' }, { status: 402 })
  const product = { stage: order.stage, plan: order.plan }

  // 이미 이 주문으로 시작한 검사가 있으면 그것을 이어서
  const existing = async () => {
    const { data } = await sb.from('assessments').select('id, completed_at').eq('order_id', orderId).maybeSingle()
    return data ? NextResponse.json({ id: data.id, ...product, completed: !!data.completed_at }) : null
  }
  if (order.assessment_id) {
    const found = await existing()
    if (found) return found
  }

  const id = crypto.randomUUID()
  const row = {
    id, order_id: orderId, product: 'career', ...product, item_version: ITEM_BANK_VERSION,
    consent_version: PRIVACY_VERSION, research_consent: research === true,
    profile_id: typeof profileId === 'string' && UUID.test(profileId) ? profileId : null,
    hexaco_session_id: typeof hexacoSessionId === 'string' && UUID.test(hexacoSessionId) ? hexacoSessionId : null,
  }
  let { error } = await sb.from('assessments').insert(row)
  // 참조 대상(프로필·무료 검사 기록)이 저장되지 않은 경우엔 연결 없이라도 기록
  if (error?.code === '23503') ({ error } = await sb.from('assessments').insert({ ...row, profile_id: null, hexaco_session_id: null }))
  // 23505: 같은 주문으로 동시에 두 번 시작한 경우 — 먼저 만들어진 검사를 씀
  if (error?.code === '23505') {
    const found = await existing()
    if (found) return found
  }
  if (error) {
    console.error('assessment insert failed', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }
  await sb.from('orders').update({ assessment_id: id, updated_at: new Date().toISOString() }).eq('id', orderId)
  return NextResponse.json({ id, ...product, completed: false })
}
