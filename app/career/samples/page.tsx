'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { PERSONAS, samplePersonaScores } from '@/lib/career/samples'
import { buildCareerReport } from '@/lib/career/report-content'
import { LIFE_STAGES } from '@/lib/paid-v2/items'
import ReportView, { GOLD, GOLD_SOFT, MUTED, TEXT } from '@/components/career/ReportView'

const PLAN_LABEL = { find: '탐색', do: '향상', both: '묶음' } as const

// 관리자 전용 (proxy의 /career 잠금) — 가상 인물로 만든 샘플 리포트를 읽고 품질을 검토하는 곳
export default function SamplesPage() {
  return <Suspense fallback={null}><Samples /></Suspense>
}

function Samples() {
  const pid = useSearchParams().get('p')
  const persona = PERSONAS.find(p => p.id === pid)
  const view = useMemo(() => {
    if (!persona) return null
    const scores = samplePersonaScores(persona)
    return scores ? { scores, report: buildCareerReport(scores, scores.archetype.name) } : null
  }, [persona])

  if (persona && view) {
    return (
      <ReportView report={view.report} archetype={view.scores.archetype} freeCode={view.scores.freeResultCode}
        top={
          <div style={{ padding: '10px 14px', borderRadius: 12, border: '1px dashed rgba(248,113,113,0.5)', marginBottom: 14, fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
            <b style={{ color: '#f87171' }}>샘플</b> · 가상 인물: {persona.who}{' '}
            <Link href="/career/samples" style={{ color: '#e2c064' }}>목록으로</Link>
          </div>
        } />
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 64px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>CORE CAREER · 품질 검토</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 24, fontWeight: 700, color: TEXT, marginBottom: 8 }}>샘플 리포트</h1>
        <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.7, marginBottom: 22 }}>
          가상 인물의 응답으로 실제와 같은 채점·리포트 코드를 돌린 결과예요. 저장되지 않아요.
          &ldquo;이 사람이 9,900원을 냈다면 만족할까?&rdquo;를 기준으로 읽어 보세요.
        </p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PERSONAS.map(p => (
            <li key={p.id}>
              <Link href={`/career/samples?p=${p.id}`} style={{ display: 'block', padding: '14px 16px', borderRadius: 12, border: `1px solid ${GOLD_SOFT}`, background: 'rgba(21,17,28,0.8)', textDecoration: 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{LIFE_STAGES.find(s => s.id === p.stage)?.label} · {PLAN_LABEL[p.plan]}</span>
                <span style={{ display: 'block', fontSize: 14.5, color: TEXT, marginTop: 3 }}>{p.who}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
