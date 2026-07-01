'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { scorePaidAnswers, PaidScoringOutput, HEXACO_FACTOR_LABELS, RIASEC_LABELS, APTITUDE_DIM_LABELS } from '@/lib/paid-scoring'
import { interpretPaidResult, PaidInterpretation } from '@/lib/paid-interpretation'
import {
  computeNarrative, computeWorkStyle, computeCharacterStrengths,
  computeLeadershipStyle, computeBurnoutRisk, computeValuesProfile,
  WorkStyle, CharacterStrength, LeadershipProfile, BurnoutProfile, ValuesProfile,
} from '@/lib/insights'
import { computeCareers, CareerScore } from '@/lib/careers'
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

export default function PrintPage() {
  const router = useRouter()
  const [data, setData] = useState<PaidScoringOutput | null>(null)
  const [interp, setInterp] = useState<PaidInterpretation | null>(null)
  const [narrative, setNarrative] = useState('')
  const [workStyle, setWorkStyle] = useState<WorkStyle | null>(null)
  const [charStrengths, setCharStrengths] = useState<CharacterStrength[]>([])
  const [leadership, setLeadership] = useState<LeadershipProfile | null>(null)
  const [burnout, setBurnout] = useState<BurnoutProfile | null>(null)
  const [values, setValues] = useState<ValuesProfile | null>(null)
  const [careers, setCareers] = useState<CareerScore[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('paid_answers')
    if (!raw) { router.push('/paid-test'); return }
    const answers = JSON.parse(raw)
    const scored = scorePaidAnswers(answers)
    setData(scored)

    const interpreted = interpretPaidResult(
      scored.hexaco, scored.subFacets, scored.riasec,
      scored.riasecTop3, scored.aptitude,
    )
    setInterp(interpreted)

    const fm: FacetMap = {
      curiosity: scored.hexaco.O,
      diligence: scored.hexaco.C,
      boldness:  scored.hexaco.X,
      patience:  scored.hexaco.A,
      anxiety:   scored.hexaco.E,
      humility:  scored.hexaco.H,
    }
    const estCog = Math.min(0.9, Math.max(0.35,
      (scored.hexaco.O - 1) / 4 * 0.55 +
      (scored.hexaco.C - 1) / 4 * 0.20 + 0.20
    ))

    setNarrative(computeNarrative(fm, estCog))
    setWorkStyle(computeWorkStyle(fm, estCog))
    setCharStrengths(computeCharacterStrengths(fm, estCog).slice(0, 7))
    setLeadership(computeLeadershipStyle(fm, estCog))
    setBurnout(computeBurnoutRisk(fm, {}))
    setValues(computeValuesProfile(fm))
    setCareers(computeCareers(fm, estCog))
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

  const s: Record<string, string | number> = {
    // 페이지 공통
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
      `}</style>

      {/* 모바일 안내 (인쇄 시 숨김) */}
      <div className="no-print" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '12px 16px', fontSize: 13, color: '#166534', textAlign: 'center' }}>
        📱 모바일: 하단 공유 버튼 → <strong>인쇄</strong> 선택 후 <strong>PDF로 저장</strong> &nbsp;|&nbsp;
        🖥️ PC: 자동으로 인쇄 창이 열립니다. <strong>대상: PDF로 저장</strong> 선택
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
              <p>82문항 · 15개 영역</p>
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

          {/* 하위 요인 */}
          <div style={{ marginTop: 14 }}>
            <h3 style={{ color: '#6b7280', marginBottom: 8 }}>24 하위 요인</h3>
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
        </div>

        {/* ── 성격 강점 ── */}
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

        {/* ── 진로 TOP 8 ── */}
        {careers.length > 0 && (
          <div className="section">
            <h2 style={{ color: '#2563eb' }}>진로 적합도 TOP 8</h2>
            <div className="grid2">
              {careers.slice(0, 8).map((c, i) => (
                <div key={c.title} className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', width: 20, flexShrink: 0, paddingTop: 1 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</span>
                      <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>{c.fit}%</span>
                    </div>
                    <Bar value={c.fit} max={100} color="#2563eb" />
                    <p className="hint">{c.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Holland RIASEC ── */}
        <div className="section">
          <h2 style={{ color: '#059669' }}>Holland RIASEC 직업흥미</h2>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: '#059669' }}>Holland Code: {interp.riasecProfile.hollandCode}</strong>
            {' '}— {interp.riasecProfile.title}
          </p>
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
          <p style={{ marginBottom: 10, fontWeight: 600 }}>{interp.aptitudeBreakdown.dominant}</p>
          <div className="grid2">
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
          <p style={{ marginTop: 8 }}>{interp.aptitudeBreakdown.portrait}</p>
        </div>

        {/* ── 업무 스타일 ── */}
        {workStyle && (
          <div className="section">
            <h2 style={{ color: '#2563eb' }}>업무 스타일</h2>
            <div className="grid2">
              {[
                { label: '의사결정', text: workStyle.decisionMaking },
                { label: '협업 스타일', text: workStyle.collaboration },
                { label: '최적 환경', text: workStyle.environment },
                { label: '소통 방식', text: workStyle.communication },
              ].map(item => (
                <div key={item.label} className="card">
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#2563eb', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#4b5563' }}>{item.text}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#059669', marginBottom: 4 }}>업무 강점</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {workStyle.strengths.map(s => <span key={s} className="tag" style={{ background: '#ecfdf5', color: '#065f46' }}>{s}</span>)}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: 4 }}>주의사항</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {workStyle.watchouts.map(w => <span key={w} className="tag" style={{ background: '#fef2f2', color: '#b91c1c' }}>{w}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* ── 리더십 + 번아웃 ── */}
        <div className="grid2 section">
          {leadership && (
            <div>
              <h2 style={{ color: '#4f46e5' }}>리더십 스타일</h2>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{leadership.icon} {leadership.style}</p>
              <p style={{ marginBottom: 8 }}>{leadership.summary}</p>
              <p style={{ fontWeight: 600, fontSize: 11, color: '#059669', marginBottom: 3 }}>핵심 강점</p>
              {leadership.strengths.map(s => <p key={s} className="hint" style={{ marginBottom: 2 }}>· {s}</p>)}
              <p style={{ fontWeight: 600, fontSize: 11, color: '#d97706', marginTop: 6, marginBottom: 3 }}>성장 과제</p>
              <p style={{ fontSize: 11, color: '#4b5563' }}>{leadership.growthEdge}</p>
            </div>
          )}
          {burnout && (
            <div>
              <h2 style={{ color: burnout.color }}>번아웃 리스크</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge" style={{ background: burnout.color + '22', color: burnout.color, fontSize: 13, padding: '4px 12px' }}>
                  {burnout.level}
                </span>
                <span style={{ fontSize: 12 }}>{burnout.score}점 / 100</span>
              </div>
              <p style={{ marginBottom: 8 }}>{burnout.summary}</p>
              <p style={{ fontWeight: 600, fontSize: 11, color: '#dc2626', marginBottom: 3 }}>위험 요인</p>
              {burnout.riskFactors.map(r => <p key={r} className="hint" style={{ marginBottom: 2 }}>· {r}</p>)}
              <p style={{ fontWeight: 600, fontSize: 11, color: '#059669', marginTop: 6, marginBottom: 3 }}>예방 전략</p>
              {burnout.prevention.slice(0, 2).map(p => <p key={p} className="hint" style={{ marginBottom: 2 }}>· {p}</p>)}
            </div>
          )}
        </div>

        {/* ── 가치관 ── */}
        {values && (
          <div className="section">
            <h2 style={{ color: '#7c3aed' }}>핵심 가치관</h2>
            <div className="grid2">
              <div className="card">
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{values.icon} 핵심 가치: {values.primary}</p>
                <p style={{ fontSize: 11, color: '#4b5563' }}>{values.inCareer}</p>
              </div>
              <div className="card">
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>보완 가치: {values.secondary}</p>
                <p style={{ fontSize: 11, color: '#4b5563' }}>{values.inRelationships}</p>
              </div>
            </div>
            <p style={{ marginTop: 8, fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>{values.tension}</p>
          </div>
        )}

        {/* ── 푸터 ── */}
        <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 10, color: '#9ca3af' }}>
            PsychoProfile 정밀 심층 분석 · psycho-profile-eta.vercel.app<br />
            본 결과는 심리측정 이론에 기반한 참고 자료이며 임상적 진단이나 법적 판단의 근거로 사용될 수 없습니다.
          </p>
        </div>

      </div>
    </>
  )
}
