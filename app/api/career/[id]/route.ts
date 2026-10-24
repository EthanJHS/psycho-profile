import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, UUID } from '@/lib/career/server'
import { buildCareerReport, REPORT_VERSION } from '@/lib/career/report-content'
import type { CareerScores } from '@/lib/career/score'

// 리포트 조회 — 익명 사용자는 assessments를 직접 읽을 수 없어 서버에서만 조회.
// 검사 기록은 결제가 확정된 주문으로만 만들어지므로(/api/career/start), 완료된 검사 = 결제된 리포트
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const { data, error } = await sb.from('assessments')
    .select('stage, plan, scores, completed_at, first_viewed_at, report, report_version, report_built_at')
    .eq('id', id).eq('product', 'career').not('completed_at', 'is', null)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'db error' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // 첫 열람 시각 — 환불 가능 여부를 판단하는 근거
  if (!data.first_viewed_at) {
    await sb.from('assessments').update({ first_viewed_at: new Date().toISOString() }).eq('id', id).is('first_viewed_at', null)
  }
  // 리포트 고정 이전에 완료된 기록 — 지금 내용으로 한 번만 저장하고 이후로는 그대로 ("보관을 시작한 시점"이 report_built_at)
  if (!data.report && data.scores) {
    const now = new Date().toISOString()
    const scores = data.scores as CareerScores & { archetype: { name: string } }
    const built = buildCareerReport(scores, scores.archetype.name)
    const { data: saved } = await sb.from('assessments')
      .update({ report: built, report_version: REPORT_VERSION, report_built_at: now })
      .eq('id', id).is('report', null).select('report, report_version, report_built_at').maybeSingle()
    if (saved) Object.assign(data, saved)
    else {
      // 동시에 다른 요청이 먼저 저장했으면 그 저장본을 씀
      const { data: again } = await sb.from('assessments').select('report, report_version, report_built_at').eq('id', id).maybeSingle()
      if (again) Object.assign(data, again)
    }
  }
  const { first_viewed_at: _, ...rest } = data
  return NextResponse.json(rest, { headers: { 'Cache-Control': 'private, no-store' } })
}
