import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'

// 공유용 원형 소개 페이지 — 공유한 사람의 점수는 담지 않고 원형 소개만 보여줌
export function generateStaticParams() {
  return Object.keys(ARCHETYPE_DETAILS).map(id => ({ id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const d = ARCHETYPE_DETAILS[id]
  if (!d) return {}
  const title = `나는 ${d.name} — 원형 성격검사`
  return {
    title,
    description: d.tagline,
    openGraph: { title, description: d.tagline, images: [{ url: `/archetypes/og/${id}.jpg`, width: 1200, height: 630, alt: d.name }] },
    twitter: { card: 'summary_large_image', title, description: d.tagline, images: [`/archetypes/og/${id}.jpg`] },
  }
}

export default async function SharedArchetypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = ARCHETYPE_DETAILS[id]
  if (!d) notFound()

  return (
    <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '28px 16px 48px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.7)', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 16 }}>
          친구가 받은 원형
        </p>

        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,168,75,0.25)', marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/archetypes/w/${id}.webp`} alt={d.name} style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(8,6,14,0.95) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(200,168,75,0.6)', letterSpacing: '0.18em' }}>{d.nameEn}</p>
            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '4px 0 8px' }}>{d.name}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{d.tagline}</p>
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 14 }}>{d.shortDesc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          {d.traits.map(t => (
            <span key={t} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, color: 'rgba(200,168,75,0.85)', border: '1px solid rgba(200,168,75,0.25)', background: 'rgba(200,168,75,0.06)' }}>{t}</span>
          ))}
        </div>

        <Link href="/hexaco-test?start=1" style={{
          display: 'block', textAlign: 'center', padding: '16px', borderRadius: 14, textDecoration: 'none',
          background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206', fontSize: 15, fontWeight: 800,
          boxShadow: '0 0 40px rgba(200,160,48,0.35)',
        }}>
          나는 어떤 원형일까? 검사하기 →
        </Link>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 10 }}>
          무료 · 48문항 · 약 8분 · 22가지 원형
        </p>
      </div>
    </main>
  )
}
