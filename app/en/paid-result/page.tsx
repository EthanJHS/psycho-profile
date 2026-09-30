'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
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
  computeValuesProfileEN, computeLifeBalanceEN,
  WorkStyleEN, InvestmentProfileEN, CharacterStrengthEN,
  LeadershipProfileEN, BurnoutProfileEN, ValuesProfileEN, LifeBalanceEN,
} from '@/lib/insights-en'
import { computeCareersEN, CareerScoreEN } from '@/lib/careers-en'
import { FacetMap } from '@/lib/profiles'
import { SubFacet, SUB_FACET_LABELS } from '@/lib/paid-questions-en'
import RadarChart from '@/components/RadarChart'
import Link from 'next/link'

// ── Color palettes ────────────────────────────────────────────────────────────
const FACTOR_COLORS: Record<string, string> = {
  H: '#a78bfa', E: '#60a5fa', X: '#34d399', A: '#f472b6', C: '#fbbf24', O: '#fb923c',
}
const RIASEC_COLORS: Record<string, string> = {
  R: '#94a3b8', I: '#818cf8', A: '#f472b6', S: '#34d399', E: '#fbbf24', C: '#60a5fa',
}
const APTITUDE_COLORS: Record<AptitudeDim, string> = {
  quantitative: '#818cf8', verbal: '#f472b6', spatial: '#34d399',
  social: '#60a5fa', applied: '#fb923c', business: '#fbbf24',
  scientific: '#a78bfa', humanistic: '#4ade80', artistic: '#f87171',
}

// ── Shared components ─────────────────────────────────────────────────────────
function ScoreBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function SectionHeader({ part, title, subtitle, color }: { part: string; title: string; subtitle?: string; color: string }) {
  return (
    <div className="mb-8">
      <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color }}>{part}</div>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{title}</h2>
      {subtitle && <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>}
    </div>
  )
}

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={{ background: 'var(--surface)', ...style }}>
      {children}
    </div>
  )
}

// ── Main result page ──────────────────────────────────────────────────────────
function PaidResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [scored, setScored]           = useState<PaidScoringOutputEN | null>(null)
  const [narrative, setNarrative]     = useState<string>('')
  const [workStyle, setWorkStyle]     = useState<WorkStyleEN | null>(null)
  const [investment, setInvestment]   = useState<InvestmentProfileEN | null>(null)
  const [charStrengths, setCharStrengths] = useState<CharacterStrengthEN[]>([])
  const [leadership, setLeadership]   = useState<LeadershipProfileEN | null>(null)
  const [burnout, setBurnout]         = useState<BurnoutProfileEN | null>(null)
  const [values, setValues]           = useState<ValuesProfileEN | null>(null)
  const [lifeBalance, setLifeBalance] = useState<LifeBalanceEN | null>(null)
  const [careers, setCareers]         = useState<CareerScoreEN[]>([])
  const [facets, setFacets]           = useState<FacetMap | null>(null)
  const [activeSection, setActiveSection] = useState<number>(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const r = searchParams.get('r')
    let answers = r ? decodePaidAnswers(r) : null
    if (!answers) {
      const raw = localStorage.getItem('paid_answers_en')
      if (raw) {
        try { answers = JSON.parse(raw) } catch { /* noop */ }
      }
    }
    if (!answers || answers.length === 0) {
      router.push('/en/paid-test')
      return
    }

    let deepAnswers: Record<string, string | number> | undefined
    const deepRaw = localStorage.getItem('paid_deep_answers_en')
    if (deepRaw) {
      try { deepAnswers = JSON.parse(deepRaw) } catch { /* noop */ }
    }

    const s = scorePaidAnswersEN(answers)
    const facetMap = buildFacetMapFromSubFacetsEN(s.subFacets, s.hexaco)
    const estCog = (
      (s.subFacets.inquisitiveness ?? 3) * 0.35 +
      (s.subFacets.creativity ?? 3) * 0.20 +
      s.hexaco.C * 0.20 +
      3 * 0.20
    ) / 5

    setScored(s)
    setFacets(facetMap)
    setNarrative(computeNarrativeEN(facetMap, estCog))
    setWorkStyle(computeWorkStyleEN(facetMap, estCog, s.subFacets))
    setInvestment(computeInvestmentProfileEN(facetMap, estCog))
    setCharStrengths(computeCharacterStrengthsEN(facetMap, estCog))
    setLeadership(computeLeadershipStyleEN(facetMap, estCog))
    setBurnout(computeBurnoutRiskEN(facetMap, deepAnswers))
    setValues(computeValuesProfileEN(facetMap, deepAnswers))
    setLifeBalance(computeLifeBalanceEN(facetMap, deepAnswers))
    setCareers(computeCareersEN(facetMap, estCog).slice(0, 6))
  }, [router, searchParams])

  // IntersectionObserver for active nav section
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const idx = parseInt(id.replace('section-', ''), 10)
            if (!isNaN(idx)) setActiveSection(idx)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    const sections = document.querySelectorAll('[id^="section-"]')
    sections.forEach(s => observerRef.current?.observe(s))
    return () => observerRef.current?.disconnect()
  }, [scored])

  if (!scored || !facets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--accent)' }} />
          <p style={{ color: 'var(--muted)' }}>Loading your results…</p>
        </div>
      </div>
    )
  }

  const SECTIONS = [
    'Overview', 'HEXACO', 'Career Interests', 'Academic Aptitude',
    'Work Style', 'Investment', 'Character', 'Leadership', 'Burnout', 'Values', 'Life Balance', 'Careers',
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      {/* Nav */}
      <div className="sticky top-16 z-10 -mx-4 px-4 py-2 mb-8 overflow-x-auto" style={{ background: 'var(--bg)' }}>
        <div className="flex gap-2 min-w-max">
          {SECTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveSection(i)
                document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                background: activeSection === i ? 'var(--accent)' : 'var(--surface)',
                color: activeSection === i ? '#fff' : 'var(--muted)',
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* ── SECTION 0 · Overview ──────────────────────────────────────────── */}
      <section id="section-0" className="mb-16">
        <SectionHeader part="Overview" title="Your Personality at a Glance" color="#a78bfa" />
        <Card className="mb-4">
          <p className="text-base leading-relaxed" style={{ color: 'var(--fg)' }}>{narrative}</p>
        </Card>

        {/* HEXACO radar */}
        <Card>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--muted)' }}>HEXACO FACTOR SCORES</h3>
          <div className="flex justify-center">
            <RadarChart
              axes={(['H','E','X','A','C','O'] as HexacoFactor[]).map(f => ({
                label: HEXACO_FACTOR_LABELS_EN[f],
                value: Math.round((scored.hexaco[f] / 5) * 100),
              }))}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(['H','E','X','A','C','O'] as HexacoFactor[]).map(f => (
              <ScoreBar key={f} label={HEXACO_FACTOR_LABELS_EN[f]} value={scored.hexaco[f]} max={5} color={FACTOR_COLORS[f]} />
            ))}
          </div>
        </Card>
      </section>

      {/* ── SECTION 1 · HEXACO Subfacets ────────────────────────────────── */}
      <section id="section-1" className="mb-16">
        <SectionHeader part="Part 1 · Personality" title="24 Personality Subfacets" subtitle="Each HEXACO factor is measured across 4 subfacets." color="#a78bfa" />
        {(['H','E','X','A','C','O'] as HexacoFactor[]).map(factor => {
          const sfKeys = Object.entries({ sincerity:'H', fairness:'H', greedAvoidance:'H', modesty:'H', fearfulness:'E', anxiety:'E', dependence:'E', sentimentality:'E', socialSelfEsteem:'X', socialBoldness:'X', sociability:'X', liveliness:'X', forgivingness:'A', gentleness:'A', flexibility:'A', patience:'A', organization:'C', diligence:'C', perfectionism:'C', prudence:'C', aestheticAppreciation:'O', inquisitiveness:'O', creativity:'O', unconventionality:'O' } as Record<SubFacet, HexacoFactor>)
            .filter(([, f]) => f === factor).map(([sf]) => sf as SubFacet)
          return (
            <Card key={factor} className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: FACTOR_COLORS[factor] }} />
                <span className="font-bold" style={{ color: 'var(--fg)' }}>{HEXACO_FACTOR_LABELS_EN[factor]}</span>
                <span className="ml-auto text-sm font-bold" style={{ color: FACTOR_COLORS[factor] }}>{scored.hexaco[factor].toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                {sfKeys.map(sf => (
                  <ScoreBar key={sf} label={SUB_FACET_LABELS[sf].label} value={scored.subFacets[sf] ?? 3} max={5} color={FACTOR_COLORS[factor]} />
                ))}
              </div>
            </Card>
          )
        })}
      </section>

      {/* ── SECTION 2 · RIASEC ───────────────────────────────────────────── */}
      <section id="section-2" className="mb-16">
        <SectionHeader part="Part 2 · Career Interests" title="Holland RIASEC Profile" subtitle="Directly measured across 18 behavioral items." color="#818cf8" />

        <Card className="mb-4">
          <div className="flex justify-center mb-4">
            <RadarChart
              axes={(['R','I','A','S','E','C'] as RiasecType[]).map(r => ({
                label: RIASEC_LABELS_EN[r].label,
                value: Math.round((scored.riasec[r] / 15) * 100),
              }))}
            />
          </div>
          <div className="space-y-2">
            {(['R','I','A','S','E','C'] as RiasecType[]).map(r => (
              <ScoreBar key={r} label={RIASEC_LABELS_EN[r].label} value={scored.riasec[r]} max={15} color={RIASEC_COLORS[r]} />
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {scored.riasecTop3.map((r, i) => (
            <Card key={r}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: RIASEC_COLORS[r] }}>
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold" style={{ color: 'var(--fg)' }}>{RIASEC_LABELS_EN[r].label}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{RIASEC_LABELS_EN[r].desc}</div>
                </div>
                <div className="ml-auto text-lg font-bold" style={{ color: RIASEC_COLORS[r] }}>{scored.riasec[r]}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── SECTION 3 · Academic Aptitude ────────────────────────────────── */}
      <section id="section-3" className="mb-16">
        <SectionHeader part="Part 3 · Academic Aptitude" title="Cognitive Profile" subtitle="9 aptitude dimensions measured across 20 behavioral items." color="#34d399" />

        {(() => {
          const meta = APTITUDE_PROFILE_META[scored.aptitudeProfile]
          return (
            <Card className="mb-6" style={{ borderLeft: `4px solid #34d399` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{meta.icon}</span>
                <div>
                  <div className="text-xs font-bold tracking-wide uppercase mb-0.5" style={{ color: '#34d399' }}>Academic Profile</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{meta.label}</div>
                </div>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--fg)' }}>{meta.description}</p>
              <div className="flex flex-wrap gap-2">
                {meta.exampleFields.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>{f}</span>
                ))}
              </div>
            </Card>
          )
        })()}

        <Card>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--muted)' }}>DIMENSION BREAKDOWN</h3>
          <div className="space-y-3">
            {(Object.keys(APTITUDE_DIM_LABELS_EN) as AptitudeDim[]).map(dim => (
              <ScoreBar key={dim} label={APTITUDE_DIM_LABELS_EN[dim]} value={scored.aptitude[dim]} max={5} color={APTITUDE_COLORS[dim]} />
            ))}
          </div>
        </Card>
      </section>

      {/* ── SECTION 4 · Work Style ───────────────────────────────────────── */}
      {workStyle && (
        <section id="section-4" className="mb-16">
          <SectionHeader part="Part 4 · Work Style" title="How You Work Best" color="#f472b6" />

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Decision Making', value: workStyle.decisionMaking },
              { label: 'Collaboration', value: workStyle.collaboration },
              { label: 'Environment', value: workStyle.environment },
              { label: 'Focus Style', value: workStyle.focus },
              { label: 'Communication', value: workStyle.communication },
            ].map(item => (
              <Card key={item.label} className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>{item.label}</div>
                <div className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{item.value}</div>
              </Card>
            ))}
          </div>

          <Card className="mb-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#34d399' }}>Organizational Fit</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#34d399' }}>{workStyle.orgFit.type}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{workStyle.orgFit.summary}</p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#34d399' }}>Strengths at Work</h3>
              <ul className="space-y-1">
                {workStyle.strengths.map(s => (
                  <li key={s} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg)' }}>
                    <span className="mt-0.5" style={{ color: '#34d399' }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#f59e0b' }}>Watch Out For</h3>
              <ul className="space-y-1">
                {workStyle.watchouts.map(w => (
                  <li key={w} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg)' }}>
                    <span className="mt-0.5" style={{ color: '#f59e0b' }}>!</span>{w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      )}

      {/* ── SECTION 5 · Investment Profile ───────────────────────────────── */}
      {investment && (
        <section id="section-5" className="mb-16">
          <SectionHeader part="Part 5 · Investment Profile" title="Your Investor Personality" subtitle="Based on behavioral finance research. Not financial advice." color="#fbbf24" />

          <Card className="mb-4" style={{ borderLeft: `4px solid ${investment.riskColor}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold" style={{ color: investment.riskColor }}>{investment.riskLabel}</span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Risk Profile</span>
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--fg)' }}>{investment.riskRationale}</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{investment.horizon}</p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#34d399' }}>Suitable for Your Profile</h3>
              <div className="flex flex-wrap gap-2">
                {investment.suitable.map(s => (
                  <span key={s} className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>{s}</span>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#f87171' }}>Approach with Caution</h3>
              <div className="flex flex-wrap gap-2">
                {investment.avoid.map(a => (
                  <span key={a} className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>{a}</span>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mb-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: '#fbbf24' }}>Behavioral Bias to Watch</h3>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{investment.behavioralBias}</p>
          </Card>

          <Card style={{ borderLeft: '4px solid #818cf8' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#818cf8' }}>Your Core Investment Principle</h3>
            <p className="text-sm italic" style={{ color: 'var(--fg)' }}>{investment.principle}</p>
          </Card>
        </section>
      )}

      {/* ── SECTION 6 · Character Strengths ──────────────────────────────── */}
      {charStrengths.length > 0 && (
        <section id="section-6" className="mb-16">
          <SectionHeader part="Part 6 · Character" title="Your Top Strengths" subtitle="Ranked by expression strength from your HEXACO profile." color="#fb923c" />
          <div className="space-y-4">
            {charStrengths.slice(0, 5).map((cs, i) => (
              <Card key={cs.name}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{cs.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: 'var(--fg)' }}>{cs.name}</span>
                      {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>Signature</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--fg)' }}>{cs.desc}</p>
                <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}><span className="font-semibold">How it shows:</span> {cs.howItShows}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}><span className="font-semibold">Shadow side:</span> {cs.shadow}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 7 · Leadership ───────────────────────────────────────── */}
      {leadership && (
        <section id="section-7" className="mb-16">
          <SectionHeader part="Part 7 · Leadership" title="Your Leadership Style" color="#4ade80" />
          <Card className="mb-4" style={{ borderLeft: '4px solid #4ade80' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{leadership.icon}</span>
              <span className="text-xl font-bold" style={{ color: 'var(--fg)' }}>{leadership.style}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{leadership.summary}</p>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#4ade80' }}>Natural Strengths</h3>
              <ul className="space-y-1">
                {leadership.strengths.map(s => (
                  <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--fg)' }}><span style={{ color: '#4ade80' }}>•</span>{s}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#f59e0b' }}>Blind Spots</h3>
              <ul className="space-y-1">
                {leadership.blindspots.map(b => (
                  <li key={b} className="text-sm flex gap-2" style={{ color: 'var(--fg)' }}><span style={{ color: '#f59e0b' }}>•</span>{b}</li>
                ))}
              </ul>
            </Card>
          </div>
          <Card>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#818cf8' }}>Best Environment</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--fg)' }}>{leadership.bestEnvironment}</p>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#fb923c' }}>Growth Edge</h3>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{leadership.growthEdge}</p>
          </Card>
        </section>
      )}

      {/* ── SECTION 8 · Burnout Risk ─────────────────────────────────────── */}
      {burnout && (
        <section id="section-8" className="mb-16">
          <SectionHeader part="Part 8 · Burnout Risk" title="Energy & Resilience" color="#60a5fa" />
          <Card className="mb-4" style={{ borderLeft: `4px solid ${burnout.color}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold" style={{ color: burnout.color }}>{burnout.level} Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${burnout.score}%`, background: burnout.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: burnout.color }}>{burnout.score}%</span>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{burnout.summary}</p>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#f87171' }}>Risk Factors</h3>
              <ul className="space-y-2">
                {burnout.riskFactors.map(r => (
                  <li key={r} className="text-xs flex gap-2" style={{ color: 'var(--fg)' }}><span className="mt-0.5 shrink-0" style={{ color: '#f87171' }}>▲</span>{r}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#34d399' }}>Protective Factors</h3>
              <ul className="space-y-2">
                {burnout.protectiveFactors.map(p => (
                  <li key={p} className="text-xs flex gap-2" style={{ color: 'var(--fg)' }}><span className="mt-0.5 shrink-0" style={{ color: '#34d399' }}>✓</span>{p}</li>
                ))}
              </ul>
            </Card>
          </div>
          <Card>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#60a5fa' }}>Prevention Actions</h3>
            <ul className="space-y-2">
              {burnout.prevention.map((p, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--fg)' }}><span className="font-bold shrink-0" style={{ color: '#60a5fa' }}>{i + 1}.</span>{p}</li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* ── SECTION 9 · Values ───────────────────────────────────────────── */}
      {values && (
        <section id="section-9" className="mb-16">
          <SectionHeader part="Part 9 · Values" title="What Drives You" color="#a78bfa" />
          <Card className="mb-4" style={{ borderLeft: '4px solid #a78bfa' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{values.icon}</span>
              <div>
                <div className="font-bold text-lg" style={{ color: 'var(--fg)' }}>{values.primary}</div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>+ {values.secondary}</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{values.summary}</p>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#a78bfa' }}>In Your Career</h3>
              <p className="text-sm" style={{ color: 'var(--fg)' }}>{values.inCareer}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#f472b6' }}>In Relationships</h3>
              <p className="text-sm" style={{ color: 'var(--fg)' }}>{values.inRelationships}</p>
            </Card>
          </div>
          <Card>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#fbbf24' }}>Values Tension</h3>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{values.tension}</p>
          </Card>
        </section>
      )}

      {/* ── SECTION 10 · Life Balance ─────────────────────────────────────── */}
      {lifeBalance && (
        <section id="section-10" className="mb-16">
          <SectionHeader part="Part 10 · Life Balance" title="Domains of Life" color="#34d399" />
          <div className="space-y-3 mb-6">
            {lifeBalance.domains.map(domain => (
              <Card key={domain.name}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{domain.icon}</span>
                  <span className="font-semibold" style={{ color: 'var(--fg)' }}>{domain.name}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded-full" style={{ width: `${domain.score}%`, background: '#34d399' }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#34d399' }}>{domain.score}%</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{domain.insight}</p>
              </Card>
            ))}
          </div>
          <Card style={{ borderLeft: '4px solid #34d399' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#34d399' }}>Key Recommendation</h3>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{lifeBalance.recommendation}</p>
          </Card>
        </section>
      )}

      {/* ── SECTION 11 · Careers ──────────────────────────────────────────── */}
      {careers.length > 0 && (
        <section id="section-11" className="mb-16">
          <SectionHeader part="Part 11 · Career Fit" title="Top Career Matches" subtitle="Ranked by personality-fit score. Based on HEXACO + RIASEC profile." color="#818cf8" />
          <div className="space-y-4">
            {careers.map((c, i) => (
              <Card key={c.title}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: i === 0 ? '#818cf8' : i === 1 ? '#a78bfa' : 'var(--surface2)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold" style={{ color: 'var(--fg)' }}>{c.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>
                        {c.fit}% fit
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                        {RIASEC_LABELS_EN[c.riasecPrimary]?.label ?? c.riasecPrimary}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--fg)' }}>{c.detail}</p>
                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}><span className="font-semibold">Growth edge:</span> {c.growthNote}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.subRoles.map(r => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>{r}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="text-center pt-8 border-t" style={{ borderColor: 'var(--surface)' }}>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          Results based on HEXACO personality model and Holland RIASEC theory.
          This assessment is for self-understanding only — not clinical diagnosis.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/en/paid-result/print" className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>🖨️ Save as PDF</Link>
          <Link href="/en/paid-test" className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Retake Test →</Link>
          <Link href="/" className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>← Korean Version</Link>
        </div>
      </div>
    </div>
  )
}

export default function ENPaidResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
      </div>
    }>
      <PaidResultContent />
    </Suspense>
  )
}
