'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { persistUtm } from '@/lib/analytics'

const INCLUDED = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    color: '#a78bfa',
    title: 'HEXACO 24 Subfacets',
    desc: 'Each of the 6 HEXACO factors is broken into 4 subfacets — sincerity, fairness, inquisitiveness, creativity, and 20 more — measured independently.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    color: '#34d399',
    title: 'Holland RIASEC (Direct Measurement)',
    desc: 'Unlike personality-inferred estimates, this directly measures your career interest profile across all 6 Holland types with dedicated items.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    color: '#f472b6',
    title: 'Academic Aptitude Profile',
    desc: '9 cognitive dimensions mapped to 7 academic tracks: STEM, Applied Sciences, Humanities, Social Sciences, Business, Arts, or Interdisciplinary.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    color: '#fbbf24',
    title: 'Work Style & Investment Profile',
    desc: 'How you make decisions, collaborate, and relate to money — backed by occupational psychology and behavioral finance research.',
  },
]

const STATS = [
  { value: '90', label: 'Questions' },
  { value: '24', label: 'Subfacets' },
  { value: '12', label: 'Report Sections' },
  { value: '~15', label: 'Minutes' },
]

const COMPARE = [
  { label: 'HEXACO 6 factors', free: true, paid: true },
  { label: 'Personality profile (192 types)', free: true, paid: true },
  { label: 'Holland RIASEC (estimated)', free: true, paid: false },
  { label: 'Holland RIASEC (direct measurement)', free: false, paid: true },
  { label: '24 subfacet breakdown', free: false, paid: true },
  { label: 'Academic aptitude (9 dimensions)', free: false, paid: true },
  { label: 'Work style deep analysis', free: false, paid: true },
  { label: 'Investment profile (US markets)', free: false, paid: true },
  { label: 'Leadership style & burnout risk', free: false, paid: true },
  { label: 'Character strengths top 5', free: false, paid: true },
  { label: 'Core values profile', free: false, paid: true },
]

const FAQ = [
  { q: 'How is this different from the free test?', a: 'The free test gives you HEXACO 6 factors and a personality profile type. This assessment breaks each factor into 4 subfacets (24 total), directly measures your Holland RIASEC career interests instead of estimating them, and adds academic aptitude, work style, investment profile, leadership, burnout risk, values, and life balance analysis.' },
  { q: 'How long does it take?', a: '90 questions on a 5-point scale. Most people finish in 12–18 minutes. The questions are behavioral self-ratings — no forced choices or scenarios, so you can move through them quickly.' },
  { q: 'Do I need to take the free test first?', a: 'No — this is a standalone assessment. Taking the free test first can be useful for comparison, but it is not required.' },
  { q: 'When do I see my results?', a: 'Immediately after finishing the last question. No waiting, no email required.' },
]

// Hexagon subfacet visual
function SubfacetVisual() {
  const factors = [
    { label: 'H-H', color: '#a78bfa', subs: ['Sincerity', 'Fairness', 'Greed-Avoid.', 'Modesty'] },
    { label: 'E', color: '#60a5fa', subs: ['Fearfulness', 'Anxiety', 'Dependence', 'Sentimentality'] },
    { label: 'X', color: '#34d399', subs: ['Social Self-Esteem', 'Social Boldness', 'Sociability', 'Liveliness'] },
    { label: 'A', color: '#f472b6', subs: ['Forgiveness', 'Gentleness', 'Flexibility', 'Patience'] },
    { label: 'C', color: '#fbbf24', subs: ['Organization', 'Diligence', 'Perfectionism', 'Prudence'] },
    { label: 'O', color: '#fb923c', subs: ['Aesthetic App.', 'Inquisitiveness', 'Creativity', 'Unconventionality'] },
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-2xl mx-auto">
      {factors.map((f) => (
        <div key={f.label} className="rounded-xl p-3 flex flex-col gap-1.5"
          style={{ background: `${f.color}10`, border: `1px solid ${f.color}30` }}>
          <span className="text-xs font-bold" style={{ color: f.color }}>{f.label}</span>
          {f.subs.map(s => (
            <span key={s} className="text-[9px] leading-tight px-1.5 py-0.5 rounded-md"
              style={{ background: `${f.color}18`, color: f.color, opacity: 0.85 }}>
              {s}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function ENPaidLandingPage() {
  const router = useRouter()
  useEffect(() => { persistUtm() }, [])

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ paddingBottom: 80, overflowX: 'hidden' }}>

      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 700,
          background: 'radial-gradient(ellipse, rgba(129,140,248,0.1) 0%, transparent 62%)',
          filter: 'blur(1px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '-5%',
          width: 440, height: 440,
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', left: '-8%',
          width: 340, height: 340,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 65%)',
        }} />
      </div>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 pt-20 pb-16 text-center">

        <div
          className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-6 animate-fade-up opacity-0"
          style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)', letterSpacing: '0.06em', animationFillMode: 'forwards' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />
          HEXACO IN-DEPTH ASSESSMENT · ENGLISH
        </div>

        <h1
          className="text-4xl font-extrabold mb-5 leading-tight animate-fade-up opacity-0"
          style={{ color: 'var(--text)', letterSpacing: '-0.03em', animationFillMode: 'forwards', animationDelay: '0.05s' }}
        >
          The free test measured{' '}
          <span style={{ color: 'var(--muted)' }}>6 factors.</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            This one measures 24.
          </span>
        </h1>

        <p
          className="text-sm mb-8 leading-relaxed animate-fade-up opacity-0"
          style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.85, animationFillMode: 'forwards', animationDelay: '0.12s' }}
        >
          Inquisitiveness and aesthetic appreciation both live under "Openness" — but they describe completely different people.
          Sincerity and fairness both fall under "Honesty-Humility" — but they reflect different ethical patterns.
          Smaller units mean a more accurate picture.
        </p>

        <div
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold animate-fade-up opacity-0"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', animationFillMode: 'forwards', animationDelay: '0.18s' }}
        >
          <span>🧪</span>
          <span>Free during beta · Try it before official launch</span>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0"
          style={{ animationFillMode: 'forwards', animationDelay: '0.24s' }}
        >
          <button
            onClick={() => router.push('/en/paid-test')}
            className="btn-primary w-full sm:w-auto"
            style={{ fontSize: '1rem', padding: '14px 36px' }}
          >
            Start Assessment
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <Link href="/en/test" className="text-sm" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Try the free test first →
          </Link>
        </div>
      </section>

      {/* ── Stats row ───────────────────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 pb-12">
        <div className="grid grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center animate-fade-up opacity-0"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                animationFillMode: 'forwards',
                animationDelay: `${0.3 + i * 0.06}s`,
              }}
            >
              <div className="text-2xl font-extrabold mb-1" style={{ color: '#818cf8', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted2)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 24 Subfacets visual ──────────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 py-10">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#818cf8' }}>What gets measured</p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>6 factors → 24 subfacets</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Each factor splits into 4 independently scored dimensions</p>
        </div>
        <SubfacetVisual />
      </section>

      {/* ── What's included ─────────────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 py-10">
        <h2 className="text-xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>Everything in this report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INCLUDED.map((item, i) => (
            <div
              key={item.title}
              className="rounded-2xl p-5 animate-fade-up opacity-0"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${item.color}28`,
                animationFillMode: 'forwards',
                animationDelay: `${i * 0.07}s`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${item.color}18`, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold mb-1.5 text-sm" style={{ color: 'var(--text)' }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Free vs Paid comparison ─────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 py-10">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>Free vs. In-Depth</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-3 text-xs font-bold text-center py-3 px-4"
            style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
            <span className="text-left">Feature</span>
            <span>Free</span>
            <span style={{ color: '#818cf8' }}>In-Depth</span>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-3 items-center text-xs py-3 px-4"
              style={{
                borderTop: '1px solid var(--border)',
                color: 'var(--muted)',
                background: !row.free && row.paid ? 'rgba(129,140,248,0.03)' : undefined,
              }}
            >
              <span style={{ color: !row.free && row.paid ? 'var(--text)' : 'var(--muted)' }}>{row.label}</span>
              <span className="text-center text-base">{row.free ? <span style={{ color: '#34d399' }}>✓</span> : <span style={{ color: 'var(--muted2)', fontSize: 12 }}>—</span>}</span>
              <span className="text-center text-base">{row.paid ? <span style={{ color: '#818cf8' }}>✓</span> : <span style={{ color: 'var(--muted2)', fontSize: 12 }}>—</span>}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 py-10">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>FAQ</h2>
        <div className="space-y-3">
          {FAQ.map(item => (
            <div key={item.q} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="font-semibold mb-2 text-sm" style={{ color: 'var(--text)' }}>{item.q}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────── */}
      <section className="relative z-10 w-full max-w-2xl px-5 py-10 text-center">
        <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(124,58,237,0.1))', border: '1px solid rgba(129,140,248,0.3)' }}>
          <div className="text-3xl mb-4">🧠</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>90 questions. ~15 minutes.</h2>
          <p className="text-sm mb-2" style={{ color: '#818cf8', fontWeight: 600 }}>Free during beta.</p>
          <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>No account needed. Results are instant and stay in your browser.</p>
          <button
            onClick={() => router.push('/en/paid-test')}
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '14px 40px' }}
          >
            Start the Assessment →
          </button>
        </div>
      </section>

    </main>
  )
}
