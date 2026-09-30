'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { decodePaidAnswers } from '@/lib/result-encoding'
import { scorePaidAnswers, PaidScoringOutput, HEXACO_FACTOR_LABELS, RIASEC_LABELS, APTITUDE_DIM_LABELS, buildFacetMapFromSubFacets } from '@/lib/paid-scoring'
import { interpretPaidResult, PaidInterpretation } from '@/lib/paid-interpretation'
import {
  computeNarrative, computeWorkStyle, computeCharacterStrengths,
  computeLeadershipStyle, computeBurnoutRisk, computeValuesProfile, computeLifeBalance,
  computeInvestmentProfile,
  WorkStyle, CharacterStrength, LeadershipProfile, BurnoutProfile, ValuesProfile, LifeBalanceProfile,
  InvestmentProfile,
} from '@/lib/insights'
import { computeCareers, CareerScore } from '@/lib/careers'
import { computeTripleConflict, TripleConflict } from '@/lib/paid-interpretation'
import { FacetMap } from '@/lib/profiles'
import { SUB_FACET_LABELS, SubFacet } from '@/lib/paid-questions'

const HEXACO_COLORS: Record<string, string> = {
  H: '#7c3aed', E: '#2563eb', X: '#059669', A: '#db2777', C: '#d97706', O: '#ea580c',
}
const RIASEC_COLORS: Record<string, string> = {
  R: '#64748b', I: '#4f46e5', A: '#db2777', S: '#059669', E: '#d97706', C: '#2563eb',
}
const STRENGTH_SUBFACETS: Record<string, SubFacet[]> = {
  '지적 호기심':    ['inquisitiveness', 'creativity', 'aestheticAppreciation'],
  '성실함·완수력':  ['diligence', 'organization', 'prudence'],
  '사회적 용기':    ['socialBoldness', 'socialSelfEsteem', 'liveliness'],
  '진정성·정직함':  ['sincerity', 'fairness', 'greedAvoidance'],
  '공감·돌봄':     ['sentimentality', 'forgivingness', 'gentleness'],
  '분석적 사고':    ['inquisitiveness', 'unconventionality', 'creativity'],
  '겸손한 자기인식': ['modesty', 'sincerity'],
  '지속성·인내':    ['diligence', 'prudence', 'perfectionism'],
  '창의적 발상':    ['creativity', 'unconventionality', 'aestheticAppreciation'],
  '조화 조율':      ['patience', 'flexibility', 'gentleness'],
}

function Bar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
  )
}

function PrintPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<PaidScoringOutput | null>(null)
  const [interp, setInterp] = useState<PaidInterpretation | null>(null)
  const [narrative, setNarrative] = useState('')
  const [workStyle, setWorkStyle] = useState<WorkStyle | null>(null)
  const [charStrengths, setCharStrengths] = useState<CharacterStrength[]>([])
  const [leadership, setLeadership] = useState<LeadershipProfile | null>(null)
  const [burnout, setBurnout] = useState<BurnoutProfile | null>(null)
  const [values, setValues] = useState<ValuesProfile | null>(null)
  const [careers, setCareers] = useState<CareerScore[]>([])
  const [lifeBalance, setLifeBalance] = useState<LifeBalanceProfile | null>(null)
  const [tripleConflict, setTripleConflict] = useState<TripleConflict | null>(null)
  const [investment, setInvestment] = useState<InvestmentProfile | null>(null)

  useEffect(() => {
    const r = searchParams.get('r')
    let answers
    if (r) {
      answers = decodePaidAnswers(r)
    } else {
      const raw = localStorage.getItem('paid_answers')
      if (!raw) { router.push('/paid-test'); return }
      answers = JSON.parse(raw)
    }
    if (!answers || answers.length === 0) { router.push('/paid-test'); return }
    const scored = scorePaidAnswers(answers)
    setData(scored)

    const interpreted = interpretPaidResult(
      scored.hexaco, scored.subFacets, scored.riasec,
      scored.riasecTop3, scored.aptitude,
    )
    setInterp(interpreted)

    const fm: FacetMap = buildFacetMapFromSubFacets(scored.subFacets, scored.hexaco)
    const estCog = Math.min(0.9, Math.max(0.35,
      (scored.subFacets.inquisitiveness - 1) / 4 * 0.35 +
      (scored.subFacets.creativity - 1) / 4 * 0.20 +
      (scored.hexaco.C - 1) / 4 * 0.20 + 0.20
    ))

    setNarrative(computeNarrative(fm, estCog))
    setWorkStyle(computeWorkStyle(fm, estCog, scored.subFacets))
    setCharStrengths(computeCharacterStrengths(fm, estCog).slice(0, 7))
    setLeadership(computeLeadershipStyle(fm, estCog))
    setBurnout(computeBurnoutRisk(fm, {}, undefined))
    setValues(computeValuesProfile(fm))
    setLifeBalance(computeLifeBalance(fm, {}, undefined))
    setInvestment(computeInvestmentProfile(fm, estCog))
    const computedCareers = computeCareers(fm, estCog)
    setCareers(computedCareers)

    const top5Riasec = computedCareers.slice(0, 5).map(c => c.riasecPrimary)
    const riasecCount: Record<string, number> = {}
    for (const r of top5Riasec) riasecCount[r] = (riasecCount[r] ?? 0) + 1
    const personalityRiasec = (Object.entries(riasecCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'I') as Parameters<typeof computeTripleConflict>[0]
    const interpreted2 = interpretPaidResult(scored.hexaco, scored.subFacets, scored.riasec, scored.riasecTop3, scored.aptitude)
    setTripleConflict(computeTripleConflict(personalityRiasec, scored.riasecTop3[0], interpreted2.aptitudeBreakdown.dominant))
  }, [router])

  useEffect(() => {
    if (data && interp) {
      setTimeout(() => window.print(), 600)
    }
  }, [data, interp])

  if (!data || !interp) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#6b7280' }}>리포트 생성 중...</p>
      </main>
    )
  }

  const riasecSorted = Object.entries(data.riasec).sort(([, a], [, b]) => b - a) as [string, number][]
  const aptSorted = Object.entries(data.aptitude).sort(([, a], [, b]) => b - a) as [string, number][]
  const topCareers = careers.slice(0, 8)
  const worstCareers = [...careers].sort((a, b) => a.fit - b.fit).slice(0, 3)

  const s: Record<string, string | number> = {
    fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    color: '#1f2937',
    background: '#ffffff',
  }

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 15mm 12mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          nav { display: none !important; }
          header { display: none !important; }
          .section { page-break-inside: avoid; break-inside: avoid; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; color: #1f2937; background: #fff; }
        h1 { font-size: 22px; font-weight: 800; }
        h2 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
        h3 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        p  { font-size: 12px; line-height: 1.7; color: #4b5563; }
        .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
        .section { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
        .row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
        .label { font-size: 11px; color: #6b7280; width: 90px; flex-shrink: 0; }
        .value { font-size: 12px; font-weight: 600; width: 36px; text-align: right; flex-shrink: 0; }
        .tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 4px; margin: 2px; background: #f3f4f6; color: #374151; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .card { background: #f9fafb; border-radius: 8px; padding: 10px 12px; }
        .muted { color: #9ca3af; font-size: 10px; }
        .hint { font-size: 10px; color: #9ca3af; margin-top: 4px; }
        .conclusion { background: #f5f3ff; border-left: 3px solid #7c3aed; border-radius: 6px; padding: 8px 12px; margin-top: 10px; }
        .conclusion p { font-size: 11px; color: #4b5563; line-height: 1.75; }
      `}</style>

      {/* 모바일 안내 */}
      <div className="no-print" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '12px 16px', fontSize: 13, color: '#166534', textAlign: 'center' }}>
        📱 모바일: 하단 공유 버튼 → <strong>인쇄</strong> 선택 후 <strong>PDF로 저장</strong> &nbsp;|&nbsp;
        🖥️ PC: 자동으로 인쇄 창이 열립니다. <strong>대상: PDF로 저장</strong> 선택
      </div>

      {/* ── 커버 히어로 (레이더 차트) ── */}
      <div style={{ background: '#0f0d14', padding: '40px 20px 32px', textAlign: 'center', marginBottom: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.12em', marginBottom: 10 }}>정밀 심층 심리 분석 보고서</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f5f3ff', letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.3 }}>{interp.headline}</h1>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>HEXACO 24 하위 요인 · Holland RIASEC 직접 측정 · 학문 적성 · 성격 강점 · 업무 스타일</p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>· 리더십 · 번아웃 · 가치관 · 삶의 균형을 한 번에 통합한 과학적 심리 초상화입니다.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ background: '#1e1b2e', color: '#a78bfa', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid #4c1d95' }}>90문항</span>
          <span style={{ background: '#1e1b2e', color: '#34d399', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid #065f46' }}>15개 영역 분석</span>
          <span style={{ background: '#1e1b2e', color: '#60a5fa', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid #1e3a5f' }}>무료 검사 전 항목 포함</span>
        </div>
        {/* 레이더 차트 */}
        {(() => {
          const factors = ['O', 'C', 'X', 'A', 'E', 'H'] as const
          const factorNames: Record<string, string> = { H: '겸손성', E: '감수성', X: '대담성', A: '원만성', C: '성실성', O: '개방성' }
          const size = 260, cx = 130, cy = 130, r = 88, labelR = 118
          const N = 6
          const vals = factors.map(f => Math.round(((data.hexaco[f as keyof typeof data.hexaco] - 1) / 4) * 100))
          function angle(k: number) { return (k * 2 * Math.PI) / N - Math.PI / 2 }
          function pt(k: number, radius: number) { const a = angle(k); return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) } }
          const grids = [0.25, 0.5, 0.75, 1.0]
          function polyPts(f: number) { return factors.map((_, k) => { const p = pt(k, r * f); return `${p.x},${p.y}` }).join(' ') }
          const dataPts = factors.map((_, k) => { const p = pt(k, r * (vals[k] / 100)); return `${p.x},${p.y}` }).join(' ')
          return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
              {grids.map((f, i) => <polygon key={i} points={polyPts(f)} fill="none" stroke="rgba(160,126,224,0.15)" strokeWidth={i === 3 ? 1.2 : 0.7} />)}
              {factors.map((_, k) => { const end = pt(k, r); return <line key={k} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(160,126,224,0.20)" strokeWidth={0.8} /> })}
              <polygon points={dataPts} fill="rgba(160,126,224,0.18)" stroke="none" />
              <polygon points={dataPts} fill="none" stroke="rgba(201,168,248,0.85)" strokeWidth={1.8} strokeLinejoin="round" />
              {factors.map((_, k) => { const p = pt(k, r * (vals[k] / 100)); return <circle key={k} cx={p.x} cy={p.y} r={3.5} fill="#c9a8f8" stroke="rgba(16,13,20,0.6)" strokeWidth={1.2} /> })}
              {factors.map((f, k) => {
                const lp = pt(k, labelR)
                const a_ = angle(k)
                const anchor = Math.abs(Math.cos(a_)) < 0.15 ? 'middle' : Math.cos(a_) > 0 ? 'start' : 'end'
                const dy = Math.sin(a_) < -0.7 ? '-0.2em' : Math.sin(a_) > 0.7 ? '1em' : '0.35em'
                return (
                  <g key={k}>
                    <text x={lp.x} y={lp.y} textAnchor={anchor} dy={dy} fontSize={12.5} fontWeight="600" fill="rgba(237,232,245,0.92)">{factorNames[f]}</text>
                    <text x={lp.x} y={lp.y} textAnchor={anchor} dy={parseFloat(dy) + 1.3 + 'em'} fontSize={10.5} fill="rgba(160,126,224,0.95)" fontWeight="700">{vals[k]}%</text>
                  </g>
                )
              })}
            </svg>
          )
        })()}
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px', ...s }}>

        {/* ── 헤더 ── */}
        <div className="section" style={{ borderBottom: '2px solid #7c3aed', paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', marginBottom: 6 }}>
                HEXACO 정밀 심층 분석 보고서
              </p>
              <h1 style={{ color: '#1f2937', letterSpacing: '-0.03em', marginBottom: 6 }}>{interp.headline}</h1>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{interp.hexacoPattern.title} · Holland {interp.riasecProfile.hollandCode}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 10, color: '#9ca3af', flexShrink: 0, marginLeft: 16 }}>
              <p>90문항 · 15개 영역</p>
              <p style={{ marginTop: 4 }}>{new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          {narrative && (
            <p style={{ marginTop: 12, fontSize: 12, color: '#4b5563', lineHeight: 1.8, background: '#f5f3ff', padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid #7c3aed' }}>
              {narrative}
            </p>
          )}
        </div>

        {/* ── HEXACO 6요인 ── */}
        <div className="section">
          <h2 style={{ color: '#7c3aed' }}>HEXACO 6요인 점수</h2>
          <div className="grid2">
            {Object.entries(data.hexaco).map(([f, v]) => {
              const info = HEXACO_FACTOR_LABELS[f as keyof typeof HEXACO_FACTOR_LABELS]
              return (
                <div key={f} className="row" style={{ marginBottom: 10 }}>
                  <span className="label" style={{ color: HEXACO_COLORS[f], fontWeight: 600 }}>
                    {f} {info ?? f}
                  </span>
                  <Bar value={v} color={HEXACO_COLORS[f]} />
                  <span className="value" style={{ color: HEXACO_COLORS[f] }}>{v.toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          {/* HEXACO 패턴 초상화 */}
          <div style={{ marginTop: 14, background: '#f5f3ff', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #7c3aed' }}>
            <p style={{ fontWeight: 700, fontSize: 12, color: '#7c3aed', marginBottom: 4 }}>HEXACO 패턴 초상화 — {interp.hexacoPattern.title}</p>
            <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.8 }}>{interp.hexacoPattern.portrait}</p>
          </div>

          {/* 24 하위요인 */}
          <div style={{ marginTop: 14 }}>
            <h3 style={{ color: '#6b7280', marginBottom: 8 }}>24 하위요인</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(data.subFacets)
                .sort(([, a], [, b]) => b - a)
                .map(([sf, score]) => {
                  const label = SUB_FACET_LABELS[sf as SubFacet]?.label ?? sf
                  const isHigh = score >= 3.8
                  const isLow = score <= 2.2
                  return (
                    <span key={sf} className="tag" style={{
                      background: isHigh ? '#ede9fe' : isLow ? '#fee2e2' : '#f3f4f6',
                      color: isHigh ? '#5b21b6' : isLow ? '#b91c1c' : '#374151',
                    }}>
                      {label} {score.toFixed(1)}
                    </span>
                  )
                })}
            </div>
          </div>

          {/* 강점 하위요인 */}
          {interp.hexacoPattern.topFacets.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#059669', marginBottom: 6 }}>▲ 두드러진 강점 하위요인</p>
              {interp.hexacoPattern.topFacets.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, background: '#f0fdf4', borderRadius: 6, padding: '6px 10px' }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: '#059669', width: 36, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 11, color: '#1f2937' }}>{f.label}</span>
                    <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{f.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 주의 영역 */}
          {interp.hexacoPattern.lowFacets.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: 6 }}>▼ 주의할 영역</p>
              {interp.hexacoPattern.lowFacets.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, background: '#fff1f2', borderRadius: 6, padding: '6px 10px' }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', width: 36, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 11, color: '#1f2937' }}>{f.label}</span>
                    <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{f.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 교차 패턴 인사이트 */}
          {interp.hexacoPattern.crossInsights.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#d97706', marginBottom: 6 }}>⚡ 교차 패턴 인사이트</p>
              {interp.hexacoPattern.crossInsights.map((ins, i) => {
                const colors = { strength: '#059669', tension: '#dc2626', rare: '#7c3aed' }
                const labels = { strength: '강점 조합', tension: '주의 신호', rare: '희귀 조합' }
                const c = colors[ins.type] ?? '#6b7280'
                return (
                  <div key={i} style={{ marginBottom: 6, background: '#f9fafb', borderRadius: 6, padding: '8px 10px', borderLeft: `3px solid ${c}` }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: c, background: `${c}20`, padding: '1px 6px', borderRadius: 10 }}>{labels[ins.type]}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#1f2937' }}>{ins.title}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.7 }}>{ins.body}</p>
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* ── 성격 강점 TOP 7 ── */}
        {charStrengths.length > 0 && (
          <div className="section">
            <h2 style={{ color: '#059669' }}>성격 강점 TOP 7</h2>
            <div className="grid2">
              {charStrengths.map((s, i) => {
                const sfKeys = STRENGTH_SUBFACETS[s.name] ?? []
                const sfData = sfKeys
                  .map(sf => ({ label: SUB_FACET_LABELS[sf]?.label ?? sf, score: data.subFacets[sf] ?? 3 }))
                  .filter(d => d.score >= 2).sort((a, b) => b.score - a.score).slice(0, 2)
                return (
                  <div key={s.name} className="card" style={{ borderLeft: `3px solid ${i === 0 ? '#d97706' : '#059669'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span>{s.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                      {i === 0 && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>핵심</span>}
                    </div>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{s.desc}</p>
                    {s.howItShows && (
                      <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 5, lineHeight: 1.7 }}>{s.howItShows}</p>
                    )}
                    {sfData.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {sfData.map(d => (
                          <span key={d.label} className="tag" style={{ background: '#ecfdf5', color: '#065f46', fontSize: 10 }}>
                            {d.label} {d.score.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 상황별 행동 예측 ── */}
        {interp.situationalPredictions.length > 0 && (
          <div className="section">
            <h2 style={{ color: '#d97706' }}>상황별 행동 예측</h2>
            <div className="grid3">
              {interp.situationalPredictions.map((pred, i) => {
                const colors = ['#d97706', '#dc2626', '#2563eb']
                const c = colors[i] ?? '#6b7280'
                return (
                  <div key={i} className="card" style={{ borderLeft: `3px solid ${c}` }}>
                    <p style={{ fontWeight: 700, fontSize: 11, color: c, marginBottom: 3 }}>{pred.icon} {pred.context}</p>
                    <p style={{ fontWeight: 600, fontSize: 11, marginBottom: 5 }}>{pred.headline}</p>
                    {pred.behaviors.map((b, j) => (
                      <p key={j} className="hint" style={{ marginBottom: 3 }}>· {b}</p>
                    ))}
                    <p className="hint" style={{ marginTop: 5, color: '#dc2626' }}>⚠ {pred.watchout}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 진로 TOP 8 ── */}
        {careers.length > 0 && (
          <div className="section">
            <h2 style={{ color: '#2563eb' }}>진로 적합도 TOP 8</h2>
            <div className="grid2">
              {topCareers.map((c, i) => (
                <div key={c.title} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>#{i + 1} {c.title}</span>
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>{c.fit}%</span>
                  </div>
                  <Bar value={c.fit} max={100} color="#2563eb" />
                  <p className="hint" style={{ marginTop: 4 }}>{c.reason}</p>
                  {c.detail && <p style={{ fontSize: 10, color: '#4b5563', marginTop: 3, lineHeight: 1.65 }}>{c.detail}</p>}
                  {c.subRoles && c.subRoles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                      {c.subRoles.slice(0, 3).map(role => (
                        <span key={role} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: '#dbeafe', color: '#1e40af' }}>{role}</span>
                      ))}
                    </div>
                  )}
                  {c.growthNote && (
                    <p style={{ fontSize: 9, color: '#6b7280', marginTop: 3 }}>↗ {c.growthNote}</p>
                  )}
                </div>
              ))}
            </div>

            {/* 맞지 않는 직업 */}
            {worstCareers.length > 0 && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', marginBottom: 6 }}>나와 맞지 않는 직업</p>
                <div className="grid3">
                  {worstCareers.map(c => (
                    <div key={c.title}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.title}</span>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{c.fit}%</span>
                      </div>
                      <Bar value={c.fit} max={100} color="#d1d5db" />
                      {c.contraReason && <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 3 }}>{c.contraReason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Holland RIASEC ── */}
        <div className="section">
          <h2 style={{ color: '#059669' }}>Holland RIASEC 직업흥미</h2>
          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: '#059669' }}>Holland Code: {interp.riasecProfile.hollandCode}</strong>
            {' '}— {interp.riasecProfile.title}
          </p>
          {interp.riasecProfile.portrait && (
            <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.75, marginBottom: 10 }}>{interp.riasecProfile.portrait}</p>
          )}
          <div className="grid2" style={{ marginBottom: 12 }}>
            {riasecSorted.map(([r, v]) => {
              const info = RIASEC_LABELS[r as keyof typeof RIASEC_LABELS]
              const isTop = data.riasecTop3.includes(r as never)
              return (
                <div key={r} className="row">
                  <span className="label" style={{ color: RIASEC_COLORS[r], fontWeight: isTop ? 700 : 400 }}>
                    {info?.label ?? r} {isTop && '★'}
                  </span>
                  <Bar value={v - 3} max={12} color={RIASEC_COLORS[r]} />
                  <span className="value" style={{ color: RIASEC_COLORS[r] }}>{v}</span>
                </div>
              )
            })}
          </div>
          <div className="grid2">
            <div>
              <p style={{ fontWeight: 600, fontSize: 11, color: '#059669', marginBottom: 4 }}>✓ 잘 맞는 환경</p>
              {interp.riasecProfile.fitEnvironments.map((e, i) => (
                <p key={i} className="hint" style={{ marginBottom: 3 }}>· {e}</p>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 11, color: '#dc2626', marginBottom: 4 }}>✗ 맞지 않는 환경</p>
              {interp.riasecProfile.misfitEnvironments.map((e, i) => (
                <p key={i} className="hint" style={{ marginBottom: 3 }}>· {e}</p>
              ))}
            </div>
          </div>
        </div>

        {/* ── 학문 적성 ── */}
        <div className="section">
          <h2 style={{ color: '#db2777' }}>학문 적성 분석</h2>
          <div className="grid2" style={{ marginBottom: 10 }}>
            <div>
              <p style={{ fontWeight: 700, marginBottom: 6 }}>{interp.aptitudeBreakdown.dominant}</p>
              {[
                { label: '이과', value: interp.aptitudeBreakdown.stem, color: '#818cf8' },
                { label: '공학', value: interp.aptitudeBreakdown.engineering, color: '#34d399' },
                { label: '문과', value: interp.aptitudeBreakdown.liberal, color: '#fbbf24' },
                { label: '경상', value: interp.aptitudeBreakdown.business, color: '#f472b6' },
                { label: '예술', value: interp.aptitudeBreakdown.art, color: '#fb923c' },
              ].map(({ label, value, color }) => (
                <div key={label} className="row" style={{ marginBottom: 6 }}>
                  <span className="label" style={{ color, fontWeight: 600, width: 36 }}>{label}</span>
                  <Bar value={value} max={100} color={color} />
                  <span className="value" style={{ color }}>{value}%</span>
                </div>
              ))}
              <p className="muted" style={{ marginTop: 4 }}>* 계열별 비율 (정규화 값)</p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#db2777', marginBottom: 4 }}>추천 전공</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {interp.aptitudeBreakdown.recommended.map((r, i) => (
                  <span key={i} className="tag" style={{ background: '#fce7f3', color: '#9d174d' }}>{r}</span>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.75, marginBottom: 10 }}>{interp.aptitudeBreakdown.portrait}</p>

          {/* 세부 적성 8차원 */}
          <div className="grid2" style={{ marginBottom: 10 }}>
            {aptSorted.map(([dim, v]) => {
              const info = APTITUDE_DIM_LABELS[dim as keyof typeof APTITUDE_DIM_LABELS]
              return (
                <div key={dim} className="row">
                  <span className="label">{info ?? dim}</span>
                  <Bar value={v} color="#db2777" />
                  <span className="value" style={{ color: '#db2777' }}>{v.toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          {/* 3계열 융합 경로 */}
          {interp.aptitudeBreakdown.fusionPath3 && (
            <div style={{ background: 'linear-gradient(135deg, #ede9fe22, #ecfdf522)', border: '1px solid #a78bfa40', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className="badge" style={{ background: 'linear-gradient(90deg,#a78bfa,#34d399)', color: '#fff' }}>3계열 융합형</span>
                <span className="muted">상위 세 계열이 고르게 분포된 희소한 프로필</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{interp.aptitudeBreakdown.fusionPath3.label}</p>
              <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 6 }}>{interp.aptitudeBreakdown.fusionPath3.description}</p>
              <div className="grid2">
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#a78bfa', marginBottom: 3 }}>융합 추천 전공</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {interp.aptitudeBreakdown.fusionPath3.majors.map((m, i) => (
                      <span key={i} className="tag" style={{ background: '#ede9fe', color: '#5b21b6' }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#059669', marginBottom: 3 }}>대표 직업·역할</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {interp.aptitudeBreakdown.fusionPath3.careers.map((c, i) => (
                      <span key={i} className="tag" style={{ background: '#ecfdf5', color: '#065f46' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2계열 융합 경로 */}
          {interp.aptitudeBreakdown.fusionPath && (
            <div style={{ background: '#f0f9ff', border: '1px solid #818cf840', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className="badge" style={{ background: '#818cf8', color: '#fff' }}>
                  {interp.aptitudeBreakdown.fusionPath3 ? '핵심 2계열 융합' : '융합 경로 추천'}
                </span>
                <span className="muted">상위 두 계열의 교차점</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{interp.aptitudeBreakdown.fusionPath.label}</p>
              <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 6 }}>{interp.aptitudeBreakdown.fusionPath.description}</p>
              <div className="grid2">
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#818cf8', marginBottom: 3 }}>추천 전공</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {interp.aptitudeBreakdown.fusionPath.majors.map((m, i) => (
                      <span key={i} className="tag" style={{ background: '#ede9fe', color: '#5b21b6' }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#34d399', marginBottom: 3 }}>대표 직업·역할</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {interp.aptitudeBreakdown.fusionPath.careers.map((c, i) => (
                      <span key={i} className="tag" style={{ background: '#ecfdf5', color: '#065f46' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3축 융합 심층 분석 ── */}
        {interp.crossDomainSynthesis && (
          <div className="section" style={{ background: '#f0fdf4', borderRadius: 8, padding: '14px 16px', border: '1px solid #10b98130', borderBottom: '1px solid #10b98130' }}>
            <h2 style={{ color: '#10b981', marginBottom: 10 }}>3축 융합 심층 분석 · 성격 × 흥미 × 적성</h2>
            <div style={{ textAlign: 'center', padding: '10px 0', marginBottom: 10, background: '#fff', borderRadius: 8, border: '1px solid #10b98120' }}>
              <p style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 700, marginBottom: 2 }}>통합 아키타입</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#10b981', marginBottom: 2 }}>{interp.crossDomainSynthesis.archetype}</p>
              <p style={{ fontSize: 10, color: '#6b7280' }}>{interp.crossDomainSynthesis.title}</p>
            </div>
            <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 10, lineHeight: 1.8 }}>
              <strong style={{ color: '#10b981' }}>성격 × 흥미 × 적성 시너지: </strong>
              {interp.crossDomainSynthesis.coreStrengthNarrative}
            </p>
            <div style={{ marginTop: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#d97706', marginBottom: 4 }}>지금 개발해야 할 역량</p>
              {interp.crossDomainSynthesis.developmentFoci.map((item, i) => (
                <p key={i} className="hint" style={{ marginBottom: 2 }}>◆ {item}</p>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: 4 }}>경계해야 할 패턴</p>
              {interp.crossDomainSynthesis.warningSignals.map((item, i) => (
                <p key={i} className="hint" style={{ marginBottom: 2 }}>⚠ {item}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── 업무 스타일 ── */}
        {workStyle && (
          <div className="section">
            <h2 style={{ color: '#2563eb' }}>업무 스타일</h2>
            <div className="grid2" style={{ marginBottom: 10 }}>
              {[
                { label: '의사결정', text: workStyle.decisionMaking },
                { label: '협업 스타일', text: workStyle.collaboration },
                { label: '최적 환경', text: workStyle.environment },
                { label: '집중·몰입', text: workStyle.focus },
                { label: '소통 방식', text: workStyle.communication },
              ].filter(item => item.text).map(item => (
                <div key={item.label} className="card">
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#2563eb', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#4b5563' }}>{item.text}</p>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#059669', marginBottom: 4 }}>업무 강점</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {workStyle.strengths.map(s => <span key={s} className="tag" style={{ background: '#ecfdf5', color: '#065f46' }}>{s}</span>)}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: 4 }}>주의사항</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {workStyle.watchouts.map(w => <span key={w} className="tag" style={{ background: '#fef2f2', color: '#b91c1c' }}>{w}</span>)}
              </div>
            </div>
            {/* 조직 구조 적합도 */}
            {workStyle.orgFit && (
            <div style={{ padding: '10px 12px', background: '#f5f3ff', borderRadius: 8, borderLeft: '3px solid #7c3aed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: '#7c3aed' }}>조직 구조 적합도</p>
                <span className="badge" style={{ background: workStyle.orgFit.type === '수평형' ? '#ede9fe' : workStyle.orgFit.type === '수직형' ? '#fce7f3' : '#f0fdf4', color: workStyle.orgFit.type === '수평형' ? '#5b21b6' : workStyle.orgFit.type === '수직형' ? '#9d174d' : '#166534', fontSize: 11 }}>
                  {workStyle.orgFit.type}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 8 }}>{workStyle.orgFit.summary}</p>
              <div className="grid2">
                <div className="card">
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', marginBottom: 3 }}>수직 조직에서</p>
                  <p style={{ fontSize: 11, color: '#4b5563' }}>{workStyle.orgFit.vertical}</p>
                </div>
                <div className="card">
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', marginBottom: 3 }}>수평 조직에서</p>
                  <p style={{ fontSize: 11, color: '#4b5563' }}>{workStyle.orgFit.horizontal}</p>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* ── 세 나침반 충돌 분석 ── */}
        {tripleConflict && (
          <div className="section">
            <h2 style={{ color: '#7c3aed' }}>세 나침반 충돌 분석</h2>
            <div className="grid3" style={{ marginBottom: 12 }}>
              {[
                { label: '성격 나침반', code: tripleConflict.personalityRiasec, color: '#7c3aed' },
                { label: '흥미 나침반', code: tripleConflict.interestRiasec, color: '#059669' },
                { label: '적성 나침반', code: tripleConflict.aptitudeDominant, color: '#2563eb' },
              ].map(({ label, code, color }) => (
                <div key={label} className="card" style={{ textAlign: 'center', border: `1px solid ${color}30` }}>
                  <p style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 900, color }}>{code}</p>
                </div>
              ))}
            </div>
            <p style={{ marginBottom: 8, fontWeight: 600, color: tripleConflict.aligned ? '#059669' : '#d97706' }}>
              {tripleConflict.aligned ? '✓ 세 방향 일치' : '⚡ 방향 불일치'}
            </p>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.8, marginBottom: 8 }}>{tripleConflict.narrative}</p>
            {tripleConflict.bridgeRoles.length > 0 && (
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, marginBottom: 4 }}>두 성향을 동시에 살리는 역할</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {tripleConflict.bridgeRoles.map(r => (
                    <span key={r} className="tag" style={{ background: '#ede9fe', color: '#5b21b6' }}>{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 리더십 ── */}
        {leadership && (
          <div className="section">
            <h2 style={{ color: '#4f46e5' }}>리더십 스타일</h2>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{leadership.icon} {leadership.style}</p>
            <p style={{ marginBottom: 8 }}>{leadership.summary}</p>
            <div className="grid2" style={{ marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, color: '#059669', marginBottom: 3 }}>핵심 강점</p>
                {leadership.strengths.map(s => <p key={s} className="hint" style={{ marginBottom: 2 }}>· {s}</p>)}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, color: '#d97706', marginBottom: 3 }}>사각지대</p>
                {leadership.blindspots?.map(b => <p key={b} className="hint" style={{ marginBottom: 2 }}>· {b}</p>)}
              </div>
            </div>
            {leadership.bestEnvironment && (
              <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}><strong style={{ color: '#4f46e5' }}>최적 환경: </strong>{leadership.bestEnvironment}</p>
            )}
            <p style={{ fontSize: 11, color: '#4b5563' }}><strong style={{ color: '#d97706' }}>성장 과제: </strong>{leadership.growthEdge}</p>
          </div>
        )}

        {/* ── 번아웃 리스크 ── */}
        {burnout && (
          <div className="section">
            <h2 style={{ color: burnout.color }}>번아웃 리스크</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge" style={{ background: burnout.color + '22', color: burnout.color, fontSize: 13, padding: '4px 12px' }}>
                {burnout.level}
              </span>
              <span style={{ fontSize: 12 }}>{burnout.score}점 / 100</span>
            </div>
            <p style={{ marginBottom: 8 }}>{burnout.summary}</p>
            <div className="grid2" style={{ marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, color: '#dc2626', marginBottom: 3 }}>위험 요인</p>
                {burnout.riskFactors.map(r => <p key={r} className="hint" style={{ marginBottom: 2 }}>· {r}</p>)}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, color: '#059669', marginBottom: 3 }}>보호 요인</p>
                {burnout.protectiveFactors.map(p => <p key={p} className="hint" style={{ marginBottom: 2 }}>· {p}</p>)}
              </div>
            </div>
            <p style={{ fontWeight: 600, fontSize: 11, color: burnout.color, marginBottom: 3 }}>예방 전략</p>
            {burnout.prevention.map((p, i) => <p key={i} className="hint" style={{ marginBottom: 2 }}>{i + 1}. {p}</p>)}
          </div>
        )}

        {/* ── 가치관 ── */}
        {values && (
          <div className="section">
            <h2 style={{ color: '#7c3aed' }}>핵심 가치관</h2>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{values.icon} {values.primary}</span>
              <span style={{ fontSize: 12, color: '#9ca3af', margin: '0 6px' }}>+</span>
              <span style={{ fontWeight: 600 }}>{values.secondary}</span>
            </div>
            {values.summary && <p style={{ marginBottom: 8 }}>{values.summary}</p>}
            <div className="grid2" style={{ marginBottom: 8 }}>
              <div className="card">
                <p style={{ fontWeight: 700, fontSize: 11, color: '#7c3aed', marginBottom: 4 }}>커리어에서의 의미</p>
                <p style={{ fontSize: 11, color: '#4b5563' }}>{values.inCareer}</p>
              </div>
              <div className="card">
                <p style={{ fontWeight: 700, fontSize: 11, color: '#7c3aed', marginBottom: 4 }}>관계에서의 의미</p>
                <p style={{ fontSize: 11, color: '#4b5563' }}>{values.inRelationships}</p>
              </div>
            </div>
            {values.tension && (
              <p style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', borderLeft: '2px solid #a78bfa', paddingLeft: 8 }}>⚡ {values.tension}</p>
            )}
          </div>
        )}

        {/* ── 삶의 균형 ── */}
        {lifeBalance && (
          <div className="section">
            <h2 style={{ color: '#059669' }}>삶의 균형 분석</h2>
            <p style={{ marginBottom: 10 }}>
              전반적 균형:{' '}
              <strong style={{ color: lifeBalance.overallBalance === '양호' ? '#059669' : lifeBalance.overallBalance === '보통' ? '#d97706' : '#dc2626' }}>
                {lifeBalance.overallBalance}
              </strong>
              {' '}— {lifeBalance.recommendation}
            </p>
            <div className="grid3">
              {lifeBalance.domains.map(d => (
                <div key={d.name} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 12 }}>{d.icon} {d.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: d.score >= 65 ? '#059669' : d.score >= 48 ? '#d97706' : '#dc2626' }}>{d.score}</span>
                  </div>
                  <Bar value={d.score} max={100} color={d.score >= 65 ? '#059669' : d.score >= 48 ? '#d97706' : '#dc2626'} />
                  <p className="hint" style={{ marginTop: 5 }}>{d.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 투자 성향 ── */}
        {investment && (
          <div className="section">
            <h2 style={{ color: '#d97706' }}>투자 성향 분석</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge" style={{ background: investment.riskColor + '22', color: investment.riskColor, fontSize: 13, padding: '4px 12px' }}>
                {investment.riskLabel}
              </span>
            </div>
            <p style={{ marginBottom: 8, fontSize: 11, color: '#4b5563' }}>{investment.riskRationale}</p>
            <div className="grid2" style={{ marginBottom: 8 }}>
              <div className="card">
                <p style={{ fontWeight: 700, fontSize: 11, color: '#d97706', marginBottom: 4 }}>권장 기간</p>
                <p style={{ fontSize: 11, color: '#4b5563' }}>{investment.horizon}</p>
              </div>
              <div className="card">
                <p style={{ fontWeight: 700, fontSize: 11, color: '#d97706', marginBottom: 4 }}>핵심 스타일</p>
                <p style={{ fontSize: 11, color: '#4b5563' }}>{investment.style}</p>
              </div>
            </div>
            <div className="grid2" style={{ marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 11, color: '#059669', marginBottom: 4 }}>성격에 맞는 접근</p>
                {investment.suitable.map(s => <p key={s} className="hint" style={{ marginBottom: 3 }}>· {s}</p>)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: 4 }}>피해야 할 행동</p>
                {investment.avoid.map(a => <p key={a} className="hint" style={{ marginBottom: 3 }}>· {a}</p>)}
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}><strong>행동 편향:</strong> {investment.behavioralBias}</p>
            <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 10 }}><strong>핵심 원칙:</strong> {investment.principle}</p>
            <p style={{ fontSize: 9, color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
              ※ 본 투자 성향 분석은 HEXACO 성격 요인에 기반한 행동 경향성 참고 정보이며, 금융 투자 조언이나 자산 운용 권고가 아닙니다. 실제 투자 결정 시 공인 재무 설계사 또는 금융 전문가와 상담하시기 바랍니다.
            </p>
          </div>
        )}

        {/* ── 통합 결론 ── */}
        <div className="section" style={{ background: 'linear-gradient(135deg, #f5f3ff, #f0fdf4)', borderRadius: 8, padding: '16px', border: '1px solid #a78bfa30' }}>
          <h2 style={{ color: '#7c3aed', marginBottom: 12 }}>15개 영역 통합 결론</h2>

          {interp.synthesis?.coreIdentity && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#7c3aed', marginBottom: 6 }}>핵심 정체성</p>
              {interp.synthesis.coreIdentity.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.85, marginBottom: 8 }}>{para}</p>
              ))}
            </div>
          )}

          {tripleConflict && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#2563eb', marginBottom: 4 }}>커리어 방향성</p>
              <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.75 }}>
                {topCareers[0] && `성격 기반 1순위 "${topCareers[0].title}"(${topCareers[0].fit}%) + Holland ${interp.riasecProfile.hollandCode} + 적성 ${interp.aptitudeBreakdown.dominant}.`}
                {tripleConflict.aligned
                  ? ' 세 나침반이 일치합니다 — 이 방향에 자원을 집중하세요.'
                  : ` 세 나침반이 불일치합니다. 교차점 역할: ${tripleConflict.bridgeRoles.slice(0, 2).join(', ')}가 해결책입니다.`}
                {values && ` 핵심 가치 "${values.primary}"가 충족되는 방향인지 검증하세요.`}
              </p>
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 11, color: '#d97706', marginBottom: 4 }}>성장 과제 — 맹점</p>
            <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.75 }}>
              {interp.hexacoPattern.shadow}
              {interp.hexacoPattern.lowFacets[0] && ` 가장 낮은 요인 "${interp.hexacoPattern.lowFacets[0].label}"(${interp.hexacoPattern.lowFacets[0].score.toFixed(1)}/5) 개선이 가장 큰 성장 레버입니다.`}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '12px', background: '#fff', borderRadius: 8, border: '1px solid #a78bfa30' }}>
            <p style={{ fontSize: 12, fontWeight: 600, fontStyle: 'italic', color: '#7c3aed', lineHeight: 1.8 }}>
              &ldquo;{interp.hexacoPattern.title}이자 {interp.riasecProfile.title}인 당신은,{' '}
              {interp.aptitudeBreakdown.dominant}에서 지적 열망을 가장 잘 실현할 수 있습니다.&rdquo;
            </p>
          </div>
        </div>

        {/* ── 푸터 ── */}
        <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 10, color: '#9ca3af' }}>
            CoreTrait · 대표유형 심리검사 · core-trait.com<br />
            본 결과는 심리측정 이론에 기반한 참고 자료이며 임상적 진단이나 법적 판단의 근거로 사용될 수 없습니다.
          </p>
        </div>

      </div>
    </>
  )
}

export default function PrintPageWrapper() {
  return (
    <Suspense fallback={null}>
      <PrintPage />
    </Suspense>
  )
}
