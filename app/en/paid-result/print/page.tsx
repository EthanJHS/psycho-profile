'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { decodePaidAnswers } from '@/lib/result-encoding'
import {
  scorePaidAnswersEN, PaidScoringOutputEN,
  HEXACO_FACTOR_LABELS_EN, RIASEC_LABELS_EN, APTITUDE_DIM_LABELS_EN,
  buildFacetMapFromSubFacetsEN, APTITUDE_PROFILE_META,
  HexacoFactor, RiasecType, AptitudeDim,
} from '@/lib/paid-scoring-en'
import {
  computeNarrativeEN, computeWorkStyleEN, computeInvestmentProfileEN,
  computeCharacterStrengthsEN, computeLeadershipStyleEN, computeBurnoutRiskEN,
  computeValuesProfileEN,
  WorkStyleEN, InvestmentProfileEN,
} from '@/lib/insights-en'
import { computeCareersEN } from '@/lib/careers-en'
import { FacetMap } from '@/lib/profiles'
import { SubFacet, SUB_FACET_LABELS } from '@/lib/paid-questions-en'

const HX_COLORS: Record<string, string> = {
  H: '#7c3aed', E: '#2563eb', X: '#059669', A: '#db2777', C: '#d97706', O: '#ea580c',
}
const RIASEC_COLORS: Record<string, string> = {
  R: '#64748b', I: '#4f46e5', A: '#db2777', S: '#059669', E: '#d97706', C: '#2563eb',
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ height: 7, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
  )
}

function PrintContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [scored, setScored]         = useState<PaidScoringOutputEN | null>(null)
  const [facets, setFacets]         = useState<FacetMap | null>(null)
  const [narrative, setNarrative]   = useState('')
  const [workStyle, setWorkStyle]   = useState<WorkStyleEN | null>(null)
  const [investment, setInvestment] = useState<InvestmentProfileEN | null>(null)
  const [careers, setCareers]       = useState<ReturnType<typeof computeCareersEN>>([])
  const [ready, setReady]           = useState(false)

  useEffect(() => {
    const r = searchParams.get('r')
    let answers = r ? decodePaidAnswers(r) : null
    if (!answers) {
      const raw = localStorage.getItem('paid_answers_en')
      if (!raw) { router.push('/en/paid-test'); return }
      try { answers = JSON.parse(raw) } catch { router.push('/en/paid-test'); return }
    }
    if (!answers || answers.length === 0) { router.push('/en/paid-test'); return }

    let deepAnswers: Record<string, string | number> | undefined
    const deepRaw = localStorage.getItem('paid_deep_answers_en')
    if (deepRaw) { try { deepAnswers = JSON.parse(deepRaw) } catch { /* noop */ } }

    const s = scorePaidAnswersEN(answers)
    const fm = buildFacetMapFromSubFacetsEN(s.subFacets, s.hexaco)
    const estCog = (
      (s.subFacets.inquisitiveness ?? 3) * 0.35 +
      (s.subFacets.creativity ?? 3) * 0.20 +
      s.hexaco.C * 0.20 + 3 * 0.20
    ) / 5

    setScored(s)
    setFacets(fm)
    setNarrative(computeNarrativeEN(fm, estCog))
    setWorkStyle(computeWorkStyleEN(fm, estCog, s.subFacets))
    setInvestment(computeInvestmentProfileEN(fm, estCog))
    setCareers(computeCareersEN(fm, estCog).slice(0, 6))
    setReady(true)
  }, [router, searchParams])

  useEffect(() => {
    if (ready) setTimeout(() => window.print(), 700)
  }, [ready])

  if (!scored || !facets) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#6b7280' }}>Generating report…</p>
      </main>
    )
  }

  const FACTORS = ['H', 'E', 'X', 'A', 'C', 'O'] as HexacoFactor[]
  const aptMeta = APTITUDE_PROFILE_META[scored.aptitudeProfile]

  // Inline radar SVG
  const size = 240, cx = 120, cy = 120, rr = 82, labelR = 110
  const N = 6
  const vals = FACTORS.map(f => Math.round(((scored.hexaco[f] - 1) / 4) * 100))
  function angle(k: number) { return (k * 2 * Math.PI) / N - Math.PI / 2 }
  function pt(k: number, radius: number) { const a = angle(k); return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) } }
  function polyPts(f: number) { return FACTORS.map((_, k) => { const p = pt(k, rr * f); return `${p.x},${p.y}` }).join(' ') }
  const dataPts = FACTORS.map((_, k) => { const p = pt(k, rr * (vals[k] / 100)); return `${p.x},${p.y}` }).join(' ')

  const subfacetMap: Record<HexacoFactor, SubFacet[]> = {
    H: ['sincerity','fairness','greedAvoidance','modesty'],
    E: ['fearfulness','anxiety','dependence','sentimentality'],
    X: ['socialSelfEsteem','socialBoldness','sociability','liveliness'],
    A: ['forgivingness','gentleness','flexibility','patience'],
    C: ['organization','diligence','perfectionism','prudence'],
    O: ['aestheticAppreciation','inquisitiveness','creativity','unconventionality'],
  }

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 14mm 12mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          nav, header { display: none !important; }
          .section { page-break-inside: avoid; break-inside: avoid; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; background: #fff; }
        h1 { font-size: 20px; font-weight: 800; }
        h2 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        h3 { font-size: 12px; font-weight: 600; margin-bottom: 5px; }
        p  { font-size: 11px; line-height: 1.7; color: #4b5563; }
        .section { margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid #e5e7eb; }
        .row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .label { font-size: 10px; color: #6b7280; width: 140px; flex-shrink: 0; }
        .value { font-size: 11px; font-weight: 600; width: 32px; text-align: right; flex-shrink: 0; }
        .tag { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 4px; margin: 2px; background: #f3f4f6; color: #374151; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .card { background: #f9fafb; border-radius: 6px; padding: 9px 11px; }
        .muted { color: #9ca3af; font-size: 10px; }
        .accent-block { background: #f5f3ff; border-left: 3px solid #7c3aed; border-radius: 4px; padding: 7px 10px; margin-top: 8px; }
        .accent-block p { font-size: 11px; color: #4b5563; }
      `}</style>

      {/* Mobile tip */}
      <div className="no-print" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 16px', fontSize: 13, color: '#166534', textAlign: 'center' }}>
        📱 Mobile: Share → Print → Save as PDF &nbsp;|&nbsp; 🖥️ Desktop: Print dialog opens automatically. Choose "Save as PDF".
      </div>

      {/* Cover */}
      <div style={{ background: '#0f0d14', padding: '36px 24px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.12em', marginBottom: 8 }}>CORETRAIT · IN-DEPTH PERSONALITY REPORT</p>
        <h1 style={{ color: '#f5f3ff', letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.3 }}>
          {aptMeta.icon} {aptMeta.label} Profile
        </h1>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
          HEXACO 24 Subfacets · Holland RIASEC · Academic Aptitude · Work Style · Investment Profile · Character · Leadership · Burnout · Values · Careers
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {(['H','E','X','A','C','O'] as HexacoFactor[]).map(f => (
            <span key={f} style={{ background: '#1e1b2e', color: HX_COLORS[f], fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: `1px solid ${HX_COLORS[f]}44` }}>
              {HEXACO_FACTOR_LABELS_EN[f]}: {scored.hexaco[f].toFixed(2)}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>

        {/* 1. Radar + Narrative */}
        <div className="section">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
                {[0.25,0.5,0.75,1.0].map((f, i) => (
                  <polygon key={i} points={polyPts(f)} fill="none" stroke="rgba(160,126,224,0.15)" strokeWidth={i === 3 ? 1.2 : 0.7} />
                ))}
                {FACTORS.map((_, k) => { const end = pt(k, rr); return <line key={k} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(160,126,224,0.2)" strokeWidth={0.8} /> })}
                <polygon points={dataPts} fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth={1.8} />
                {FACTORS.map((f, k) => {
                  const p = pt(k, rr * (vals[k] / 100))
                  return <circle key={f} cx={p.x} cy={p.y} r={3} fill={HX_COLORS[f]} />
                })}
                {FACTORS.map((f, k) => {
                  const p = pt(k, labelR)
                  return (
                    <text key={f} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: 8, fill: HX_COLORS[f], fontWeight: 700 }}>
                      {f}
                    </text>
                  )
                })}
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#7c3aed', marginBottom: 8 }}>Personality Overview</h2>
              <p style={{ marginBottom: 12 }}>{narrative}</p>
              <div className="accent-block">
                <p style={{ fontWeight: 600, color: '#5b21b6', marginBottom: 2 }}>Academic Profile</p>
                <p><strong>{aptMeta.label}</strong> — {aptMeta.description}</p>
                <p style={{ marginTop: 4 }}>Example fields: {aptMeta.exampleFields.join(' · ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. HEXACO Subfacets */}
        <div className="section">
          <h2>HEXACO 24 Subfacets</h2>
          <div className="grid2">
            {FACTORS.map(f => (
              <div key={f} className="card">
                <h3 style={{ color: HX_COLORS[f] }}>{HEXACO_FACTOR_LABELS_EN[f]} <span style={{ fontWeight: 400, color: '#9ca3af' }}>{scored.hexaco[f].toFixed(2)}</span></h3>
                {subfacetMap[f].map(sf => (
                  <div key={sf} className="row">
                    <span className="label">{SUB_FACET_LABELS[sf].label}</span>
                    <Bar value={scored.subFacets[sf] ?? 3} max={5} color={HX_COLORS[f]} />
                    <span className="value" style={{ color: HX_COLORS[f] }}>{(scored.subFacets[sf] ?? 3).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 3. RIASEC */}
        <div className="section">
          <h2>Holland RIASEC Career Interests</h2>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              {(['R','I','A','S','E','C'] as RiasecType[]).map(r => (
                <div key={r} className="row">
                  <span className="label" style={{ color: RIASEC_COLORS[r], fontWeight: scored.riasecTop3.includes(r) ? 700 : 400 }}>
                    {RIASEC_LABELS_EN[r].label} {scored.riasecTop3[0] === r ? '★' : scored.riasecTop3[1] === r ? '☆' : ''}
                  </span>
                  <Bar value={scored.riasec[r]} max={15} color={RIASEC_COLORS[r]} />
                  <span className="value" style={{ color: RIASEC_COLORS[r] }}>{scored.riasec[r]}</span>
                </div>
              ))}
            </div>
            <div style={{ width: 160 }}>
              <h3>Top 3 Types</h3>
              {scored.riasecTop3.map((r, i) => (
                <div key={r} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: RIASEC_COLORS[r] }}>#{i+1} {RIASEC_LABELS_EN[r].label}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.5 }}>{RIASEC_LABELS_EN[r].desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Aptitude */}
        <div className="section">
          <h2>Academic Aptitude (9 Dimensions)</h2>
          <div className="grid2">
            {(Object.keys(APTITUDE_DIM_LABELS_EN) as AptitudeDim[]).map(dim => (
              <div key={dim} className="row">
                <span className="label">{APTITUDE_DIM_LABELS_EN[dim]}</span>
                <Bar value={scored.aptitude[dim]} max={5} color="#818cf8" />
                <span className="value" style={{ color: '#818cf8' }}>{scored.aptitude[dim].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Work Style */}
        {workStyle && (
          <div className="section">
            <h2>Work Style</h2>
            <div className="grid2" style={{ marginBottom: 10 }}>
              {[
                { l: 'Decision Making', v: workStyle.decisionMaking },
                { l: 'Collaboration', v: workStyle.collaboration },
                { l: 'Environment', v: workStyle.environment },
                { l: 'Focus Style', v: workStyle.focus },
                { l: 'Communication', v: workStyle.communication },
                { l: 'Org Fit', v: workStyle.orgFit.type },
              ].map(item => (
                <div key={item.l} className="card">
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.l}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1f2937' }}>{item.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#059669' }}>Strengths</h3>
                {workStyle.strengths.map(s => <p key={s} style={{ marginBottom: 2 }}>✓ {s}</p>)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#d97706' }}>Watch Out For</h3>
                {workStyle.watchouts.map(w => <p key={w} style={{ marginBottom: 2 }}>! {w}</p>)}
              </div>
            </div>
          </div>
        )}

        {/* 6. Investment */}
        {investment && (
          <div className="section">
            <h2>Investment Profile</h2>
            <div className="grid2">
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: investment.riskColor }}>{investment.riskLabel}</span>
                </div>
                <p style={{ marginBottom: 6 }}>{investment.riskRationale}</p>
                <p className="muted">{investment.horizon}</p>
              </div>
              <div>
                <h3 style={{ color: '#059669' }}>Suitable</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {investment.suitable.map(s => <span key={s} className="tag" style={{ background: '#f0fdf4', color: '#166534' }}>{s}</span>)}
                </div>
                <h3 style={{ color: '#dc2626' }}>Approach with Caution</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {investment.avoid.map(a => <span key={a} className="tag" style={{ background: '#fef2f2', color: '#dc2626' }}>{a}</span>)}
                </div>
              </div>
            </div>
            <div className="accent-block" style={{ marginTop: 10, borderColor: '#d97706', background: '#fffbeb' }}>
              <p style={{ fontWeight: 600, color: '#92400e', marginBottom: 2 }}>Behavioral Bias to Watch</p>
              <p>{investment.behavioralBias}</p>
            </div>
          </div>
        )}

        {/* 7. Careers */}
        {careers.length > 0 && (
          <div className="section">
            <h2>Top Career Matches</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {careers.map((c, i) => (
                <div key={c.title} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: i < 2 ? '#4f46e5' : '#e5e7eb', color: i < 2 ? '#fff' : '#374151', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1f2937' }}>{c.title}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#4f46e5' }}>{c.fit}%</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {c.subRoles.slice(0, 2).map(r => <span key={r} className="tag">{r}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 12 }}>
          <p className="muted">Generated by CoreTrait · coretrait.com · HEXACO personality model · Holland RIASEC career theory</p>
          <p className="muted" style={{ marginTop: 3 }}>This report is for self-understanding only and does not constitute clinical diagnosis or professional advice.</p>
        </div>
      </div>
    </>
  )
}

export default function ENPrintPage() {
  return (
    <Suspense fallback={
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#6b7280' }}>Generating report…</p>
      </main>
    }>
      <PrintContent />
    </Suspense>
  )
}
