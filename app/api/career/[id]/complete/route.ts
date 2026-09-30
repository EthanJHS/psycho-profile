import { NextRequest, NextResponse } from 'next/server'
import { serviceClient, sanitizeAnswers, isStage, isPlan, UUID } from '@/lib/career/server'
import { computeScores } from '@/lib/career/compute'

// 진로 검사 완료 — 응답만 받아 서버에서 채점 (시기·목적은 기록 생성 때 저장한 값을 사용)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const sb = serviceClient()
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  const { data: row, error: readErr } = await sb.from('assessments')
    .select('stage, plan, completed_at').eq('id', id).eq('product', 'career').maybeSingle()
  if (readErr) return NextResponse.json({ error: 'db error' }, { status: 500 })
  if (!row || !isStage(row.stage) || !isPlan(row.plan)) return NextResponse.json({ error: 'not found' }, { status: 404 })
  // 이미 완료된 검사 — 네트워크 재시도 등으로 두 번 눌린 경우 그대로 성공 처리 (덮어쓰지 않음)
  if (row.completed_at) return NextResponse.json({ ok: true, already: true })

  const answers = sanitizeAnswers(row.stage, row.plan, body.answers)
  if (!answers) return NextResponse.json({ error: 'invalid answers' }, { status: 400 })
  const scores = typeof body.freeCode === 'string' ? computeScores(row.stage, row.plan, answers, body.freeCode) : null
  if (!scores) return NextResponse.json({ error: 'invalid free result' }, { status: 400 })

  const { error } = await sb.from('assessments')
    .update({ answers, scores, completed_at: new Date().toISOString() })
    .eq('id', id).is('completed_at', null)
  if (error) {
    console.error('assessment complete failed', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
