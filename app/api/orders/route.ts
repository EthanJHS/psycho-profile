import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, isStage, isPlan, UUID } from '@/lib/career/server'
import { PRICES, isSellable, goodName } from '@/lib/career/pricing'
import { payappConfig } from '@/lib/payapp'
import { decodeHexacoAnswers } from '@/lib/hexaco-encoding'

// 주문 생성 — 금액·상품명은 서버가 정한다. 결제 완료는 페이앱 알림(/api/payapp/feedback)으로만 확정
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  const { stage, plan, profileId, refundAck, freeCode, research } = body
  if (!isStage(stage) || !isPlan(plan) || !isSellable(stage)) return NextResponse.json({ error: 'invalid product' }, { status: 400 })
  if (refundAck !== true) return NextResponse.json({ error: 'refund terms not acknowledged' }, { status: 400 })
  // 리포트는 무료 검사 결과 위에 만들어지므로 결과 코드가 있어야 결제 가능
  if (typeof freeCode !== 'string' || !decodeHexacoAnswers(freeCode)) return NextResponse.json({ error: 'free result required' }, { status: 400 })

  const cfg = payappConfig()
  const sb = serviceClient()
  if (!cfg || !sb) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  const row = {
    product: 'career', stage, plan, amount: PRICES[plan], status: 'pending',
    provider: 'payapp', refund_ack_at: new Date().toISOString(),
    free_code: freeCode, research_consent: research === true,
    profile_id: typeof profileId === 'string' && UUID.test(profileId) ? profileId : null,
  }
  let { data, error } = await sb.from('orders').insert(row).select('id').single()
  // 프로필 기록이 저장되지 않은 경우엔 연결 없이라도 주문 생성
  if (error?.code === '23503') ({ data, error } = await sb.from('orders').insert({ ...row, profile_id: null }).select('id').single())
  if (error || !data) {
    console.error('order insert failed', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }
  // 판매자 아이디는 결제창을 띄우는 데 필요한 공개 값 (연동 KEY·VALUE는 서버에만)
  return NextResponse.json({ id: data.id, price: PRICES[plan], goodname: goodName(stage, plan), userid: cfg.userid })
}
