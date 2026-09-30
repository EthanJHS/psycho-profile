import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { rating?: number; sections?: string[]; opinion?: string; email?: string; resultType?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }
  const { rating, sections, opinion, email, resultType } = body

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid rating' }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.from('survey_responses').insert({
    rating,
    sections: sections ?? [],
    opinion: opinion || null,
    email: email || null,
    result_type: resultType ?? 'free',
  })

  if (error) {
    console.error('survey insert error', error)
    return NextResponse.json({ error: 'db error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
