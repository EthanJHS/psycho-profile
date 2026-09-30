'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { scoreAnswersEN, ScoringOutput } from '@/lib/scoring'
import { Answer } from '@/types'
import { FacetMap } from '@/lib/profiles'
import RadarChart from '@/components/RadarChart'
import { computeNarrativeFreeEN, computeRiasecFreeEN } from '@/lib/insights-free-en'
import { computeCareersEN } from '@/lib/careers-en'

// ─── English metadata ──────────────────────────────────────────────────────

const ARCHETYPE_META_EN: Record<string, {
  icon: string; label: string; light: string; shadow: string; shortDesc: string
}> = {
  architect:  { icon: '🏛️', label: 'The Architect',
    light: 'A master of systematic thinking who creates order from chaos',
    shadow: 'When perfectionism blocks execution — designing endlessly without shipping',
    shortDesc: 'Strategic intellect that excels at designing and optimising complex systems' },
  guardian:   { icon: '🛡️', label: 'The Guardian',
    light: 'A dependable protector who values stability and consistency above all',
    shadow: 'May resist necessary change, even when the old way stops working',
    shortDesc: 'A steady, principled presence that holds things together under pressure' },
  explorer:   { icon: '🧭', label: 'The Explorer',
    light: 'An adventurous pioneer who thrives in uncharted territory',
    shadow: 'The excitement of starting may outpace the discipline of finishing',
    shortDesc: 'A curiosity-driven trailblazer who finds energy in the unknown' },
  prophet:    { icon: '🔮', label: 'The Prophet',
    light: 'A visionary who sees patterns and possibilities others miss',
    shadow: 'Risk of chasing ideals while losing touch with present reality',
    shortDesc: 'A future-oriented thinker whose insight can reframe how people see the world' },
  warrior:    { icon: '⚔️', label: 'The Warrior',
    light: 'A results-driven executor who fights hard for what matters',
    shadow: 'Intensity can exhaust collaborators and blur the line between drive and aggression',
    shortDesc: 'A high-agency doer who commits fully and delivers under pressure' },
  seeker:  { icon: '⚗️', label: 'The Alchemist',
    light: 'A transformative thinker who turns raw complexity into insight',
    shadow: 'May over-engineer simple things, losing the solution in the process',
    shortDesc: 'A synthesiser who finds surprising connections across disparate domains' },
  sovereign:  { icon: '👑', label: 'The Sovereign',
    light: 'A natural leader who builds systems and inspires others to follow',
    shadow: 'May slip toward control at the expense of genuine collaboration',
    shortDesc: 'A builder of institutions and cultures, drawn to lasting influence' },
  sage:       { icon: '📚', label: 'The Sage',
    light: 'A deep knowledge-seeker who values wisdom, depth, and rigour',
    shadow: 'May prioritise knowing over doing, and reflection over action',
    shortDesc: 'A devoted scholar who brings intellectual depth to everything they touch' },
  harmonizer: { icon: '🌀', label: 'The Harmonizer',
    light: 'A connector and mediator who creates psychological safety for others',
    shadow: 'May avoid necessary conflict, letting problems fester for the sake of peace',
    shortDesc: 'An empathetic bridge-builder who holds groups together with quiet skill' },
  rebel:      { icon: '🔥', label: 'The Rebel',
    light: 'A boundary-breaker who challenges convention with purpose and energy',
    shadow: 'Perpetual disruption can exhaust those who need stability to thrive',
    shortDesc: 'A bold nonconformist who pushes systems toward necessary change' },
  lover:      { icon: '💜', label: 'The Lover',
    light: 'An empathetic connector who thrives in deep, meaningful bonds',
    shadow: 'May lose a sense of self when absorbed entirely in others\' needs',
    shortDesc: 'A relationship-centred soul who brings warmth and depth to every connection' },
  catalyst:   { icon: '⚡', label: 'The Catalyst',
    light: 'An activating force who sparks movement and energy in others',
    shadow: 'May start more than they finish, leaving projects half-realised',
    shortDesc: 'A dynamic initiator who ignites momentum wherever they go' },
}

const MODE_META_EN: Record<string, { label: string; desc: string; color: string }> = {
  analytical:  { label: 'Analytical',  color: '#60a5fa',
    desc: 'Trusts data and logic, and relies on verified conclusions' },
  intuitive:   { label: 'Intuitive',   color: '#c084fc',
    desc: 'Reaches insight quickly through pattern recognition and gut sense' },
  pragmatic:   { label: 'Pragmatic',   color: '#34d399',
    desc: '"Does it work?" always comes before "is it elegant?"' },
  integrative: { label: 'Integrative', color: '#f59e0b',
    desc: 'Synthesises multiple perspectives into a larger, coherent picture' },
}

const DRIVE_META_EN: Record<string, { label: string; motivation: string; color: string }> = {
  achievement: { label: 'Achievement Drive', color: '#f87171',
    motivation: 'Feels most alive when proving excellence and reaching meaningful goals' },
  connection:  { label: 'Connection Drive',  color: '#fb923c',
    motivation: 'Draws core energy from deep bonds and meaningful relationships' },
  autonomy:    { label: 'Autonomy Drive',    color: '#a78bfa',
    motivation: 'Performs best when making decisions and acting on their own terms' },
  security:    { label: 'Security Drive',    color: '#38bdf8',
    motivation: 'Brings out deepest capability in predictable, stable environments' },
}

const FACET_META_EN: Record<string, {
  label: string; subFacets: string[]; subFacetNote: string; high: string; mid: string; low: string
}> = {
  openness: {
    label: 'Openness',
    subFacets: ['Intellectual exploration', 'Aesthetic sensitivity', 'Creative imagination', 'Unconventional thinking'],
    subFacetNote: 'This is an integrated estimate across 4 subfacets. Someone high in intellectual exploration but low in aesthetic sensitivity represents a distinct "logical explorer" pattern.',
    high: 'You are strongly drawn to new ideas and fields, and find motivation in exploration itself. Unknown territory feels interesting rather than threatening, and you frequently ask "why?" in conversation. You tend to grow fastest in unfamiliar environments.',
    mid: 'You go deep within areas that interest you but are selective about entering new domains. You prefer expanding existing interests over completely fresh directions, with a clear sense of where your curiosity is headed.',
    low: 'You prefer proven approaches and deep expertise in known domains. You build trust in established methods rather than new ideas, and find satisfaction in mastery rather than novelty.',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    subFacets: ['Organisation', 'Completion drive', 'Perfectionism', 'Careful planning'],
    subFacetNote: 'This is an integrated estimate across 4 subfacets. A "practical planner" type — high on organisation but low on perfectionism — can exist within this range.',
    high: 'You have a strong drive to see things through to the end, sustaining effort through your own motivation without needing external pressure. You maintain a consistent pace toward long-term goals, prefer systematic planning, and are sensitive to deadlines and commitments.',
    mid: 'You bring high focus to work that matters to you, but your persistence may waver on tasks that don\'t hold your interest. Output quality can vary depending on what\'s motivating you.',
    low: 'You prefer change over routine and tend to seek new stimulation rather than sustained focus on one thing. You work best in flexible, spontaneous environments rather than rigid schedules.',
  },
  extraversion: {
    label: 'Extraversion',
    subFacets: ['Social confidence', 'Comfort with public speaking', 'Social initiative', 'Liveliness & energy'],
    subFacetNote: 'This is an integrated estimate across 4 subfacets. A "selective extrovert" — assertive one-on-one but uncomfortable in front of large groups — can exist within this range.',
    high: 'You express yourself naturally even in front of strangers, use attention as an energy source, and are naturally drawn to roles that involve leading a group. Even long events tend to leave you energised rather than depleted.',
    mid: 'You express yourself freely with people you trust, but need some preparation and warm-up in unfamiliar situations. You are neither fully introverted nor extroverted — you shift fluidly depending on context.',
    low: 'You are introverted and prefer a few deep relationships over a wide social network. You do your best work alone or in small, trusted groups, and need recovery time after extended social events. Quiet focus is your strength.',
  },
  honesty: {
    label: 'Honesty-Humility',
    subFacets: ['Sincerity & authenticity', 'Fairness', 'Greed avoidance', 'Modesty'],
    subFacetNote: 'A dimension unique to the HEXACO model, synthesising moral consistency and self-restraint. This is an integrated estimate across 4 subfacets.',
    high: 'You feel uncomfortable with self-promotion and hold fairness and authenticity as core values. You tend to uphold ethical standards on your own, without external oversight — a quality that builds deep trust over time.',
    mid: 'You can put yourself forward when necessary, but avoid excessive self-promotion. You adjust how much you express yourself depending on what the context calls for.',
    low: 'You express yourself with confidence, value recognition, and find it natural to assert your contributions and compete for what you want.',
  },
  emotionality: {
    label: 'Emotionality',
    subFacets: ['Risk sensitivity', 'Anxiety & worry tendency', 'Emotional dependence', 'Resonance with others\' emotions'],
    subFacetNote: 'This is the Emotionality dimension in HEXACO. A higher score is not negative — it is closely linked to empathy and emotional attunement.',
    high: 'You are emotionally sensitive and feel things deeply. Your strong capacity to read others\' emotions is a genuine strength, as is your ability to detect early warning signs. Under stress, however, rumination can be prolonged — having intentional recovery strategies in place helps.',
    mid: 'Your emotions shift with context, but you generally maintain balance. You feel things and then redirect into action, and naturally seek support from others when needed.',
    low: 'You are emotionally stable and maintain composure under pressure. You don\'t tend to be rattled by risk or uncertainty, which gives you a clear-headed edge in high-stakes situations.',
  },
  agreeableness: {
    label: 'Agreeableness',
    subFacets: ['Forgiveness & generosity', 'Gentleness', 'Flexibility & compromise', 'Anger management'],
    subFacetNote: 'This is the Agreeableness dimension in HEXACO, reflecting in particular the tendency to suppress anger and extend tolerance.',
    high: 'You listen to opposing views until the end and try to understand them. You strongly favour harmony over conflict, and calm relatively quickly even when frustrated. You naturally create environments where others feel psychologically safe.',
    mid: 'You are generally easy to work with, but will speak directly when the values gap is significant. You can shift flexibly between collaboration and assertion depending on what the situation needs.',
    low: 'You prefer direct, clear communication. You respond quickly to inefficiency or unfairness, and value unambiguous exchanges. You tend to be conclusion-oriented rather than process-oriented in negotiations.',
  },
}

const COG_LABELS_EN = [
  { min: 0.8, label: 'Very High', color: '#a78bfa' },
  { min: 0.6, label: 'High',      color: '#7c6ef0' },
  { min: 0.4, label: 'Moderate',  color: '#6b7280' },
  { min: 0,   label: 'Lower',     color: '#9ca3af' },
]
function cogLabelEN(c: number) { return COG_LABELS_EN.find(l => c >= l.min) ?? COG_LABELS_EN[COG_LABELS_EN.length - 1] }

function facetLevel(s: number): 'high' | 'mid' | 'low' { return s >= 3.67 ? 'high' : s >= 2.34 ? 'mid' : 'low' }
function facetPct(s: number): number { return Math.round(((s - 1) / 4) * 100) }

function ScoreBar({ value, color = 'linear-gradient(90deg, #7c3aed, var(--accent2))' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export default function ENResultPage() {
  const [output, setOutput] = useState<ScoringOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealStep, setRevealStep] = useState(0)

  useEffect(() => {
    const raw = sessionStorage.getItem('en_test_answers')
    if (!raw) { setLoading(false); return }
    let answers: Answer[]
    try { answers = JSON.parse(raw) } catch { setLoading(false); return }
    const scored = scoreAnswersEN(answers)
    setTimeout(() => {
      setOutput(scored)
      setLoading(false)
      setTimeout(() => setRevealStep(1), 400)
      setTimeout(() => setRevealStep(2), 1100)
      setTimeout(() => setRevealStep(3), 1800)
      setTimeout(() => setRevealStep(4), 2500)
    }, 1400)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <div className="text-center">
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Analysing your psychological profile</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Matching against 192 profiles...</p>
        </div>
      </main>
    )
  }

  if (!output) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>No result found.</p>
        <Link href="/en/test" className="btn-ghost text-sm" style={{ textDecoration: 'none' }}>Retake the test</Link>
      </main>
    )
  }

  const { result, facets, cogScore } = output

  const fm: FacetMap = {
    openness:          facets['openness']          ?? 3,
    conscientiousness: facets['conscientiousness'] ?? 3,
    emotionality:      facets['emotionality']      ?? 3,
    extraversion:      facets['extraversion']      ?? 3,
    honesty:           facets['honesty']           ?? 3,
    agreeableness:     facets['agreeableness']     ?? 3,
  }

  const narrative = computeNarrativeFreeEN(fm, cogScore)
  const riasec    = computeRiasecFreeEN(fm)
  const careersEN = computeCareersEN(fm, cogScore)
  const cog       = cogLabelEN(cogScore)
  const sortedFacets = Object.entries(facets).filter(([k]) => FACET_META_EN[k]).sort((a, b) => b[1] - a[1])

  const archetypeEN = result.archetype ? ARCHETYPE_META_EN[result.archetype] : null
  const modeEN      = result.mode      ? MODE_META_EN[result.mode]            : null
  const driveEN     = result.drive     ? DRIVE_META_EN[result.drive]          : null
  const profileLabel = [archetypeEN?.label, modeEN?.label, driveEN?.label].filter(Boolean).join(' × ')

  return (
    <main className="min-h-screen px-4 py-12 flex flex-col items-center page-top">
      <div className="w-full max-w-2xl space-y-5">

        {/* ── Header ── */}
        <div className="text-center pt-8 pb-4 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(160,126,224,0.10) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>Analysis Complete</p>
            <div className="flex justify-center mb-6">
              <RadarChart
                size={280}
                axes={[
                  { label: 'Openness',          value: facetPct(fm.openness) },
                  { label: 'Conscientiousness', value: facetPct(fm.conscientiousness) },
                  { label: 'Extraversion',      value: facetPct(fm.extraversion) },
                  { label: 'Honesty-Humility',  value: facetPct(fm.honesty) },
                  { label: 'Emotionality',      value: facetPct(fm.emotionality) },
                  { label: 'Agreeableness',     value: facetPct(fm.agreeableness) },
                ]}
              />
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Your Big Five × Cognitive Mode × Core Drive are revealed below</p>
            {(result.dominantTraitsEN ?? result.dominantTraits) && (
              <div className="flex flex-wrap gap-2 justify-center">
                {(result.dominantTraitsEN ?? result.dominantTraits).map((t: string) => (
                  <span key={t} className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(160,126,224,0.15)', color: 'var(--accent2)' }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 3-Layer reveal ── */}
        {archetypeEN && (
          <div className="space-y-3">
            {/* Layer 1: Archetype */}
            <div
              className="rounded-2xl overflow-hidden transition-all duration-700"
              style={{
                opacity: revealStep >= 1 ? 1 : 0,
                transform: revealStep >= 1 ? 'translateY(0)' : 'translateY(16px)',
                border: '1px solid rgba(160,126,224,0.35)',
                background: 'linear-gradient(135deg, rgba(124,77,204,0.12) 0%, rgba(160,126,224,0.06) 100%)',
              }}
            >
              <div className="px-5 py-4">
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--accent2)', opacity: 0.7 }}>Layer 1 · Archetype</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{archetypeEN.icon}</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{archetypeEN.label}</span>
                </div>
                <p className="text-sm leading-relaxed mb-2" style={{ color: '#c4b5fd' }}>✦ {archetypeEN.light}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>◈ {archetypeEN.shadow}</p>
              </div>
            </div>

            {/* Layer 2: Cognitive Mode */}
            {modeEN && (
              <div
                className="rounded-2xl px-5 py-4 transition-all duration-700"
                style={{
                  opacity: revealStep >= 2 ? 1 : 0,
                  transform: revealStep >= 2 ? 'translateY(0)' : 'translateY(16px)',
                  border: `1px solid ${modeEN.color}40`,
                  background: `${modeEN.color}0d`,
                }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: modeEN.color, opacity: 0.8 }}>Layer 2 · Cognitive Mode</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: modeEN.color }} />
                  <span className="text-xl font-bold" style={{ color: modeEN.color }}>{modeEN.label}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{modeEN.desc}</p>
              </div>
            )}

            {/* Layer 3: Core Drive */}
            {driveEN && (
              <div
                className="rounded-2xl px-5 py-4 transition-all duration-700"
                style={{
                  opacity: revealStep >= 3 ? 1 : 0,
                  transform: revealStep >= 3 ? 'translateY(0)' : 'translateY(16px)',
                  border: `1px solid ${driveEN.color}40`,
                  background: `${driveEN.color}0d`,
                }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: driveEN.color, opacity: 0.8 }}>Layer 3 · Core Drive</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: driveEN.color }} />
                  <span className="text-xl font-bold" style={{ color: driveEN.color }}>{driveEN.label}</span>
                </div>
                <p className="text-sm italic" style={{ color: 'var(--muted)' }}>"{driveEN.motivation}"</p>
              </div>
            )}

            {/* Final synthesis banner */}
            <div
              className="rounded-2xl px-5 py-5 text-center transition-all duration-700"
              style={{
                opacity: revealStep >= 4 ? 1 : 0,
                transform: revealStep >= 4 ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
                background: 'linear-gradient(135deg, rgba(124,77,204,0.18), rgba(201,168,248,0.08))',
                border: '1px solid rgba(160,126,224,0.45)',
              }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--accent2)', opacity: 0.6 }}>
                {profileLabel}
              </p>
              <p className="text-xl font-bold gradient-text">"{archetypeEN.shortDesc}"</p>
            </div>
          </div>
        )}

        {/* ── Narrative ── */}
        <div className="glass rounded-2xl p-6" style={{ borderColor: 'rgba(160,126,224,0.25)' }}>
          <p className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: 'var(--accent2)' }}>Your tendencies</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.85 }}>{narrative}</p>
        </div>

        {/* ── HEXACO 6 Facets ── */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-sm mb-5">6 Core Personality Dimensions</h2>
          <div className="space-y-5">
            {sortedFacets.map(([key, score], idx) => {
              const meta = FACET_META_EN[key]
              if (!meta) return null
              const level = facetLevel(score)
              const pct   = facetPct(score)
              const levelColor = level === 'high' ? '#a78bfa' : level === 'low' ? '#9ca3af' : '#6b7280'
              const isLastItem = idx === sortedFacets.length - 1
              return (
                <div key={key} className="pb-2" style={isLastItem ? {} : { borderBottom: '1px solid var(--border)' }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{meta.label}</span>
                    <span style={{ color: levelColor }}>{pct}%</span>
                  </div>
                  <ScoreBar value={pct} color={`linear-gradient(90deg, ${levelColor}88, ${levelColor})`} />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meta.subFacets.map(sf => (
                      <span key={sf} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${levelColor}14`, color: levelColor, border: `1px solid ${levelColor}30` }}>
                        {sf}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>{meta[level]}</p>
                  <p className="text-xs mt-1.5 leading-relaxed italic" style={{ color: 'var(--muted)', opacity: 0.6 }}>* {meta.subFacetNote}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Cognitive level ── */}
        <div className="glass rounded-2xl p-5 flex items-center gap-5">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center" style={{ background: `${cog.color}22` }}>
            <span className="text-xs font-semibold" style={{ color: cog.color }}>Cog.</span>
            <span className="text-base font-bold" style={{ color: cog.color }}>{cog.label}</span>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Cognitive Style</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.cognitiveStyleEN ?? result.cognitiveStyle}</p>
          </div>
        </div>

        {/* ── Holland RIASEC ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <span>🧭</span> Career Interest Profile
              <span className="text-xs font-normal px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(107,114,128,0.15)', color: 'var(--muted)' }}>estimated</span>
            </h2>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Holland RIASEC</span>
          </div>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>{riasec.summary}</p>
          <div className="space-y-2 mb-4">
            {riasec.scores.map(s => (
              <div key={s.type}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold" style={{ color: s.color }}>{s.type}</span>
                    <span style={{ color: 'var(--text)' }}>{s.label}</span>
                  </span>
                  <span style={{ color: s.color }}>{s.score}%</span>
                </div>
                <ScoreBar value={s.score} color={s.color} />
              </div>
            ))}
          </div>
          <p className="text-xs italic leading-relaxed" style={{ color: 'var(--muted)', opacity: 0.6 }}>
            * This is an indirect estimate derived from personality facets. The in-depth assessment measures RIASEC directly with 18 dedicated items.
          </p>
        </div>

        {/* ── Career Top 2 ── */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><span>🎯</span> Career Fit (Top 2 Preview)</h2>
          <div className="space-y-4">
            {careersEN.slice(0, 2).map((c) => (
                <div key={c.title} className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold">{c.title}</span>
                    <span className="font-bold" style={{ color: c.fit >= 90 ? '#c9a8f8' : 'var(--accent2)' }}>{c.fit}%</span>
                  </div>
                  <ScoreBar value={c.fit} color="linear-gradient(90deg, var(--accent), var(--accent2))" />
                  {c.detail && (
                    <p className="text-xs mt-2 leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>{c.detail}</p>
                  )}
                  {c.subRoles && c.subRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.subRoles.slice(0, 3).map((role: string) => (
                        <span key={role} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(160,126,224,0.10)', color: 'var(--accent2)', border: '1px solid rgba(160,126,224,0.20)' }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* ── In-depth CTA ── */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.10), rgba(124,58,237,0.10))', border: '1px solid rgba(129,140,248,0.30)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔬</span>
            <h2 className="font-semibold">Go deeper with the In-Depth Assessment</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            This test measured 6 factors. The in-depth version breaks each one into 4 subfacets (24 total), directly measures Holland RIASEC with 18 dedicated items, and adds academic aptitude, work style, investment profile, leadership, burnout risk, and values analysis.
          </p>
          <ul className="space-y-1.5 text-sm mb-5" style={{ color: 'var(--muted)' }}>
            {[
              'HEXACO 24 subfacets (sincerity, fairness, inquisitiveness, creativity…)',
              'Holland RIASEC direct measurement — 18 dedicated items',
              'Academic aptitude across STEM / Humanities / Business / Arts',
              '90 items · ~15 minutes · free during beta',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span style={{ color: '#818cf8' }}>✓</span>{item}
              </li>
            ))}
          </ul>
          <Link
            href="/en/paid-test"
            className="block w-full py-3.5 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', textDecoration: 'none' }}
          >
            Start the In-Depth Assessment →
          </Link>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pb-8 space-y-3">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            This profile is based on self-report and reflects tendencies, not fixed traits. Results may shift over time and context.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/en/test" className="text-sm underline" style={{ color: 'var(--muted)' }}>Retake</Link>
            <Link href="/en/paid" className="text-sm underline" style={{ color: 'var(--muted)' }}>In-Depth</Link>
            <Link href="/" className="text-sm underline" style={{ color: 'var(--muted)' }}>Korean version</Link>
          </div>
        </div>

      </div>
    </main>
  )
}
