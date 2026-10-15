import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, UUID } from '@/lib/career/server'

// 주문 상태 조회 — 결제 후 돌아온 화면이 결제 확정을 기다릴 때 사용. 주문 번호(무작위 UUID)를 아는 사람만 조회 가능
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  const { data, error } = await sb.from('orders')
    .select('status, stage, plan, amount, assessment_id, paid_at, created_at, free_code, research_consent')
    .eq('id', id).eq('product', 'career').maybeSingle()
  if (error) return NextResponse.json({ error: 'db error' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // 리포트까지 만들어졌으면 리포트로 바로 보낼 수 있게 완료 여부도 알려줌
  let completed = false
  if (data.assessment_id) {
    const { data: a } = await sb.from('assessments').select('completed_at').eq('id', data.assessment_id).maybeSingle()
    completed = !!a?.completed_at
  }
  return NextResponse.json({ ...data, completed }, { headers: { 'Cache-Control': 'private, no-store' } })
}
