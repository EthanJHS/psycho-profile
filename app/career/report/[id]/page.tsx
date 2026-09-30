'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { buildCareerReport, type CareerReport } from '@/lib/career/report-content'
import ReportView, { GOLD_SOFT, MUTED, TEXT, FAINT } from '@/components/career/ReportView'
import type { CareerScores } from '@/lib/career/score'
import { rememberReport } from '@/lib/career/my-reports'
import type { LifeStage, Plan } from '@/lib/paid-v2/items'

type Stored = CareerScores & { archetype: { id: string; name: string }; freeResultCode?: string | null }

export default function CareerReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<CareerReport | null>(null)
  const [archetype, setArchetype] = useState<{ id: string; name: string } | null>(null)
  const [freeCode, setFreeCode] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href) }
    catch { window.prompt('아래 링크를 복사해 보관하세요', window.location.href); return }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    fetch(`/api/career/${id}`).then(r => (r.ok ? r.json() : Promise.reject(r.status))).then((d: { stage: LifeStage; plan: Plan; scores: Stored; completed_at: string }) => {
      // 링크로 연 리포트도 이 기기의 "내 리포트" 목록에 남김
      rememberReport({ id, stage: d.stage, plan: d.plan, at: d.completed_at })
      setArchetype(d.scores.archetype)
      setFreeCode(d.scores.freeResultCode ?? null)
      setReport(buildCareerReport(d.scores, d.scores.archetype.name))
      setState('ready')
    }).catch(() => setState('missing'))
  }, [id])

  if (state === 'loading') return <main style={{ minHeight: '100vh', background: '#0b0910', display: 'grid', placeItems: 'center', color: MUTED }}>리포트를 불러오는 중…</main>
  if (state === 'missing' || !report) {
    return (
      <main style={{ minHeight: '100vh', background: '#0b0910', display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center' }}>
        <div>
          <p style={{ color: TEXT, marginBottom: 12 }}>리포트를 찾을 수 없어요. 링크가 정확한지 확인해 주세요.</p>
          <Link href="/career" style={{ color: '#e2c064' }}>진로 리포트 처음으로 →</Link>
        </div>
      </main>
    )
  }

  return (
    <ReportView report={report} archetype={archetype} freeCode={freeCode}
      top={<>
        {/* 계정이 없어서 링크가 곧 열쇠 — 끝까지 읽기 전에 떠날 수 있으니 맨 위에서 먼저 알림 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', borderRadius: 12, border: `1px dashed ${GOLD_SOFT}`, marginBottom: 14 }}>
          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, flex: '1 1 220px' }}>이 기기의 <Link href="/career" style={{ color: '#e2c064' }}>내 리포트</Link>에 저장됐어요. 다른 기기에서 보려면 링크를 보관해 두세요.</p>
          <button onClick={copyLink} style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${GOLD_SOFT}`, background: 'transparent', color: '#e2c064', cursor: 'pointer', fontSize: 12.5, flexShrink: 0 }}>
            {copied ? '복사했어요' : '링크 복사'}
          </button>
        </div>
      </>}
      footer={<>
        <footer style={{ borderTop: `1px solid ${GOLD_SOFT}`, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <button onClick={copyLink} style={{
            padding: '12px 20px', borderRadius: 999, border: `1px solid ${GOLD_SOFT}`, background: 'transparent', color: '#e2c064', cursor: 'pointer', fontSize: 14,
          }}>{copied ? '리포트 링크를 복사했어요' : '이 리포트 링크 복사하기'}</button>
          <p style={{ fontSize: 12, color: FAINT, textAlign: 'center', lineHeight: 1.6 }}>
            이 링크로 언제든 리포트를 다시 볼 수 있어요. 내 점수가 담겨 있으니 본인만 보관하세요.<br />
            검사 번호 <span style={{ fontFamily: 'monospace' }}>{id.slice(0, 8)}</span> · 삭제 요청은 <Link href="/privacy" style={{ color: '#e2c064' }}>개인정보 처리방침</Link>의 연락처로
          </p>
        </footer>
      </>}
    />
  )
}
