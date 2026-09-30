import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, isStage, isPlan, UUID } from '@/lib/career/server'
import { ITEM_BANK_VERSION } from '@/lib/career/flow'
import { PRIVACY_VERSION } from '@/lib/consent'

// 진로 검사 기록 생성 — 익명 사용자는 assessments에 직접 쓸 수 없음.
// 결제 연동 후에는 여기서 결제 완료된 주문인지 확인하고 주문과 연결한다.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  const { stage, plan, profileId, hexacoSessionId, research } = body
  if (!isStage(stage) || !isPlan(plan)) return NextResponse.json({ error: 'invalid stage/plan' }, { status: 400 })

  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const id = crypto.randomUUID()
  const row = {
    id, product: 'career', stage, plan, item_version: ITEM_BANK_VERSION,
    consent_version: PRIVACY_VERSION, research_consent: research === true,
    profile_id: typeof profileId === 'string' && UUID.test(profileId) ? profileId : null,
    hexaco_session_id: typeof hexacoSessionId === 'string' && UUID.test(hexacoSessionId) ? hexacoSessionId : null,
  }
  let { error } = await sb.from('assessments').insert(row)
  // 참조 대상(프로필·무료 검사 기록)이 저장되지 않은 경우엔 연결 없이라도 기록
  if (error?.code === '23503') ({ error } = await sb.from('assessments').insert({ ...row, profile_id: null, hexaco_session_id: null }))
  if (error) {
    console.error('assessment insert failed', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }
  return NextResponse.json({ id })
}
