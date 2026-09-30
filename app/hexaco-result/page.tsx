'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { scoreHexaco, HexacoResult } from '@/lib/scoring-hexaco'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'
import { saveHexacoResult, trackHexaco } from '@/lib/analytics'
import { decodeHexacoAnswers } from '@/lib/hexaco-encoding'

// ── 각성 로딩 화면 ────────────────────────────────────────────────────────────
function AwakeningScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 2400
    let raf: number
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setPct(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPhase(1)
        setTimeout(onDone, 600)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  const MESSAGES = [
    { from: 0,  text: '응답 패턴을 분석하는 중...' },
    { from: 30, text: '원형과의 거리를 계산하는 중...' },
    { from: 60, text: '당신의 원형이 깨어나고 있습니다...' },
    { from: 90, text: '각인이 완성됩니다...' },
  ]
  const msg = [...MESSAGES].reverse().find(m => pct >= m.from)?.text ?? ''

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#080610',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 1 ? 0 : 1,
      transition: phase === 1 ? 'opacity 0.5s ease' : undefined,
    }}>
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, height: 400, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%)',
        filter: 'blur(2px)',
      }} />
      <div style={{ fontSize: 48, color: 'rgba(200,168,75,0.25)', marginBottom: 32, animation: 'spin 8s linear infinite' }}>⬡</div>
      <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 20, fontVariantNumeric: 'tabular-nums' }}>
        {pct}<span style={{ fontSize: 28, color: 'rgba(200,168,75,0.6)', marginLeft: 4 }}>%</span>
      </div>
      <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: 24 }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #c8a030)', transition: 'width 0.05s linear', boxShadow: '0 0 8px rgba(200,168,75,0.4)' }} />
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', minHeight: 20 }}>{msg}</p>
    </div>
  )
}

// ── 풀스크린 히어로 ──────────────────────────────────────────────────────────
function ArchetypeHero({ id, name, nameEn, tagline, onCta }: {
  id: string; name: string; nameEn?: string; tagline?: string; onCta: () => void
}) {
  const [visible, setVisible] = useState(true)
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100svh', overflow: 'hidden' }}>
      {visible && (
        <img
          src={`/archetypes/w/${id}.webp`}
          alt={name}
          onError={() => setVisible(false)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,6,14,0.35) 0%, transparent 30%, transparent 50%, rgba(8,6,14,0.96) 90%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,6,14,0.5) 0%, transparent 20%)' }} />

      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(200,168,75,0.8)', textTransform: 'uppercase' }}>당신의 원형</p>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 6 }}>{name}</p>
        {nameEn && (
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.2em', marginBottom: 14 }}>{nameEn}</p>
        )}
        {tagline && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', lineHeight: 1.55, marginBottom: 28 }}>"{tagline}"</p>
        )}
        <button
          onClick={onCta}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
            boxShadow: '0 0 40px rgba(139,92,246,0.45)',
          }}
        >
          원형에 대해 자세히 알아보기 →
        </button>
      </div>
    </div>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function HexacoResultPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(200,168,75,0.2)', borderTopColor: 'rgba(200,168,75,0.7)', animation: 'spin 0.8s linear infinite' }} />
      </main>
    }>
      <HexacoResultInner />
    </Suspense>
  )
}

function HexacoResultInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewId = searchParams.get('preview')
  const restoreCode = searchParams.get('r')
  const [result, setResult] = useState<HexacoResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [awakening, setAwakening] = useState(!previewId && !restoreCode)

  useEffect(() => {
    if (previewId && ARCHETYPE_DETAILS[previewId]) {
      const detail = ARCHETYPE_DETAILS[previewId]
      const mockResult: HexacoResult = {
        primary: { id: previewId, name: detail.name, profile: { H:0,E:0,X:0,A:0,C:0,O:0 }, note: detail.tagline ?? '' },
        secondary: { id: 'sage', name: '현자', profile: { H:0,E:0,X:0,A:0,C:0,O:0 }, note: '' },
        primaryDistance: 0, secondaryDistance: 0,
        scores: { raw: { H:3.5,E:3.0,X:3.2,A:3.4,C:3.6,O:3.8 }, direction: { H:1,E:0,X:0,A:1,C:1,O:1 } },
      }
      setResult(mockResult)
      return
    }
    // 결과 링크(?r=)로 들어오면 복원만 하고 DB 저장·집계는 하지 않음
    const restored = restoreCode ? decodeHexacoAnswers(restoreCode) : null
    if (restoreCode && !restored) { router.replace('/hexaco-test'); return }
    if (restored) {
      sessionStorage.setItem('hexaco_answers', JSON.stringify(restored))
      setResult(scoreHexaco(restored))
      return
    }
    const raw = sessionStorage.getItem('hexaco_answers')
    if (!raw) { router.replace('/hexaco-test'); return }
    try {
      const answers = JSON.parse(raw) as Record<string, number>
      const r = scoreHexaco(answers)
      setResult(r)
      if (!saved) {
        setSaved(true)
        saveHexacoResult(r.scores.raw, r.primary.id, r.secondary.id, r.primaryDistance, answers)
          .then(() => trackHexaco('hexaco_result_view', { archetype_primary: r.primary.id }))
          .catch(() => {})
      }
    } catch {
      router.replace('/hexaco-test')
    }
  }, [router, saved, previewId, restoreCode])

  if (!result) {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(200,168,75,0.2)', borderTopColor: 'rgba(200,168,75,0.7)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 12, color: 'rgba(200,168,75,0.4)', letterSpacing: '0.1em' }}>READING THE TOME...</p>
      </main>
    )
  }

  const { primary } = result
  const detail = ARCHETYPE_DETAILS[primary.id]
  const previewSuffix = previewId ? `?preview=${previewId}` : restoreCode ? `?r=${restoreCode}` : ''

  function goToReport() {
    if (!previewId && !restoreCode) trackHexaco('hexaco_report_click', { archetype_primary: primary.id }).catch(() => {})
    router.push('/hexaco-result/report' + previewSuffix)
  }

  return (
    <>
      {awakening && <AwakeningScreen onDone={() => setAwakening(false)} />}
      <main>
        <ArchetypeHero
          id={primary.id}
          name={primary.name}
          nameEn={detail?.nameEn}
          tagline={detail?.tagline}
          onCta={goToReport}
        />
      </main>
    </>
  )
}
