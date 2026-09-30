'use client'

import Link from 'next/link'
import type { Block, CareerReport } from '@/lib/career/report-content'

// 진로 리포트 본문 — 실제 리포트와 품질 검토용 샘플이 같은 화면을 씀
export const GOLD = '#c8a030'
export const GOLD_SOFT = 'rgba(200,160,48,0.25)'
export const TEXT = '#efe6d2'
export const MUTED = 'rgba(239,230,210,0.66)'
export const FAINT = 'rgba(239,230,210,0.42)'
const SERIF = 'var(--font-serif), serif'
const NUMERALS = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ']

function Box({ tone, children }: { tone: 'gold' | 'plain' | 'warn'; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 14, padding: '14px 16px',
      border: `1px solid ${tone === 'warn' ? 'rgba(248,113,113,0.35)' : tone === 'gold' ? 'rgba(226,192,100,0.45)' : GOLD_SOFT}`,
      background: tone === 'warn' ? 'rgba(248,113,113,0.06)' : tone === 'gold' ? 'rgba(200,160,48,0.08)' : 'rgba(21,17,28,0.8)',
    }}>{children}</div>
  )
}
const H3 = ({ children }: { children: React.ReactNode }) => <h3 style={{ fontSize: 14, fontWeight: 700, color: GOLD, letterSpacing: '0.04em', marginBottom: 8 }}>{children}</h3>

function RenderBlock({ b }: { b: Block }) {
  switch (b.type) {
    case 'text': return <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.85 }}>{b.text}</p>
    case 'note': return <p style={{ fontSize: 12, color: FAINT, lineHeight: 1.6 }}>{b.text}</p>
    case 'callout': return (
      <Box tone={b.tone}>
        {b.title && <p style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{b.title}</p>}
        <p style={{ fontSize: 14.5, color: b.tone === 'plain' ? MUTED : TEXT, lineHeight: 1.8 }}>{b.text}</p>
      </Box>
    )
    case 'bars': {
      const max = 5
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {b.items.map(it => (
            <div key={it.label} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 34px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: it.strong ? TEXT : MUTED, fontWeight: it.strong ? 700 : 400 }}>{it.label}</span>
              <span style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                <span style={{ display: 'block', height: '100%', width: `${Math.min(100, (it.value / max) * 100)}%`, borderRadius: 99, background: it.strong ? 'linear-gradient(90deg, #a8781f, #e2c064)' : 'rgba(226,192,100,0.35)' }} />
              </span>
              <span style={{ fontSize: 12, color: FAINT, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{it.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul'
      return (
        <div>
          {b.title && <H3>{b.title}</H3>}
          <Tag style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: TEXT, lineHeight: 1.85 }}>{b.items.map(x => <li key={x}>{x}</li>)}</Tag>
        </div>
      )
    }
    case 'tags': return (
      <div>
        {b.title && <H3>{b.title}</H3>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {b.items.map(x => <span key={x} style={{ fontSize: 13, padding: '6px 12px', borderRadius: 999, border: `1px solid ${GOLD_SOFT}`, color: TEXT }}>{x}</span>)}
        </div>
      </div>
    )
    case 'steps': return (
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {b.items.map((s, i) => (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{s.when}</span>
            <span style={{ fontSize: 14, color: TEXT, lineHeight: 1.7 }}>{s.what}</span>
          </li>
        ))}
      </ol>
    )
    case 'picks': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {b.items.map(pk => (
          <Box key={pk.name} tone={pk.rank === 1 ? 'gold' : 'plain'}>
            <p style={{ fontSize: 12, color: FAINT, marginBottom: 2 }}>{pk.rank}위 · {pk.meta}{pk.badge && <span style={{ color: GOLD, marginLeft: 6 }}>{pk.badge}</span>}</p>
            <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{pk.name}</p>
            <p style={{ fontSize: 13.5, color: MUTED, marginBottom: 10 }}>{pk.desc}</p>
            {pk.why.length > 0 && <ul style={{ margin: '0 0 10px', paddingLeft: 18, fontSize: 13.5, color: TEXT, lineHeight: 1.75 }}>{pk.why.map(x => <li key={x}>{x}</li>)}</ul>}
            {pk.caution.map(c => <p key={c} style={{ fontSize: 13, color: '#f0b27a', marginBottom: 6, lineHeight: 1.6 }}><b>주의</b> · {c}</p>)}
            {pk.extra && (
              <div style={{ borderTop: '1px solid rgba(200,160,48,0.15)', paddingTop: 10, marginTop: 6, display: 'grid', gap: 4 }}>
                {pk.extra.map(e => <p key={e.label} style={{ fontSize: 12.5, color: MUTED }}><b style={{ color: e.strong ? GOLD : FAINT, fontWeight: 600 }}>{e.label}</b> · {e.text}</p>)}
              </div>
            )}
          </Box>
        ))}
      </div>
    )
  }
}

export default function ReportView({ report, archetype, freeCode, top, footer }: {
  report: CareerReport
  archetype: { id: string; name: string } | null
  freeCode: string | null
  top?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '88px 16px 72px' }}>
      <article style={{ maxWidth: 640, margin: '0 auto' }}>
        <header style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {archetype && <img src={`/archetypes/t/${archetype.id}.webp`} alt={`${archetype.name} 원형`} style={{ width: 96, aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', borderRadius: 10, border: `1px solid ${GOLD_SOFT}` }} />}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.14em', marginBottom: 6 }}>{report.label}</p>
            <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>{report.title}</h1>
          </div>
        </header>
        {top}
        <Box tone="gold"><p style={{ fontSize: 15, color: TEXT, lineHeight: 1.8 }}>{report.summary}</p></Box>
        {freeCode && archetype && (
          <p style={{ fontSize: 12.5, color: FAINT, marginTop: 10 }}>
            이 리포트는 무료 원형 검사 결과({archetype.name})에 이어서 만들어졌어요.{' '}
            <Link href={`/hexaco-result/report?r=${freeCode}`} style={{ color: '#e2c064' }}>원형 결과 다시 보기 →</Link>
          </p>
        )}

        {report.chapters.map((ch, i) => (
          <section key={ch.title} style={{ padding: '30px 0', borderTop: `1px solid ${GOLD_SOFT}`, marginTop: i === 0 ? 24 : 0 }}>
            <p style={{ fontFamily: SERIF, fontSize: 13, color: GOLD, marginBottom: 4 }}>{NUMERALS[i] ?? i + 1}</p>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: ch.sub ? 6 : 16 }}>{ch.title}</h2>
            {ch.sub && <p style={{ fontSize: 13.5, color: MUTED, marginBottom: 16, lineHeight: 1.7 }}>{ch.sub}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ch.blocks.map((b, j) => <RenderBlock key={j} b={b} />)}
            </div>
          </section>
        ))}

        {footer}
      </article>
    </main>
  )
}
