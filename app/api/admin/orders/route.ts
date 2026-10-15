import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, ADMIN_CHALLENGE } from '@/lib/admin-auth'
import { serviceClient, isStage, isPlan } from '@/lib/career/server'

// 관리자 테스트 주문 — 결제 없이 "결제 완료" 주문을 만들어 진로 검사·리포트 흐름을 검토할 때 사용 (금액 0, provider 'admin')
// 고등학생 버전처럼 판매하지 않는 조합도 검토용으로는 만들 수 있음
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: ADMIN_CHALLENGE })
  }
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  const { stage, plan } = body
  if (!isStage(stage) || !isPlan(plan)) return NextResponse.json({ error: 'invalid product' }, { status: 400 })
  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })
  const now = new Date().toISOString()
  const { data, error } = await sb.from('orders')
    .insert({ product: 'career', stage, plan, amount: 0, status: 'paid', provider: 'admin', paid_at: now, updated_at: now })
    .select('id').single()
  if (error || !data) return NextResponse.json({ error: 'db error' }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
