import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CONTENT, PATHS, type Lang } from '@/lib/i18n'

// 공유용 원형 소개 — 한국어(/a/[id])·영어(/en/a/[id]) 공용. 공유한 사람의 점수는 담지 않고 원형 소개만 보여줌
const KO = {
  metaTitle: (name: string) => `나는 ${name} — 원형 성격검사`,
  eyebrow: '친구가 받은 원형',
  cta: '나는 어떤 원형일까? 검사하기 →',
  note: '무료 · 48문항 · 약 8분 · 22가지 원형',
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    metaTitle: (name: string) => `I got ${name} — Archetype Personality Test`,
    eyebrow: 'YOUR FRIEND’S ARCHETYPE',
    cta: 'What’s my archetype? Take the test →',
    note: 'Free · 48 questions · About 8 minutes · 22 archetypes',
  },
}

export const archetypeIds = () => Object.keys(CONTENT.ko.archetypes).map(id => ({ id }))

export function sharedArchetypeMetadata(lang: Lang, id: string): Metadata {
  const d = CONTENT[lang].archetypes[id]
  if (!d) return {}
  const title = T[lang].metaTitle(d.name)
  const image = `/archetypes/og/${id}.jpg`
  return {
    title,
    description: d.tagline,
    alternates: { canonical: PATHS[lang].share(id), languages: { ko: PATHS.ko.share(id), en: PATHS.en.share(id) } },
    openGraph: { title, description: d.tagline, locale: lang === 'en' ? 'en_US' : 'ko_KR', images: [{ url: image, width: 1200, height: 630, alt: d.name }] },
    twitter: { card: 'summary_large_image', title, description: d.tagline, images: [image] },
  }
}

export default function SharedArchetype({ lang, id }: { lang: Lang; id: string }) {
  const d = CONTENT[lang].archetypes[id]
  if (!d) notFound()
  const t = T[lang]

  return (
    <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '28px 16px 48px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.7)', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 16 }}>
          {t.eyebrow}
        </p>

        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,168,75,0.25)', marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/archetypes/w/${id}.webp`} alt={d.name} style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(8,6,14,0.95) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
            {lang === 'ko' && <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(200,168,75,0.6)', letterSpacing: '0.18em' }}>{d.nameEn}</p>}
            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '4px 0 8px' }}>{d.name}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{d.tagline}</p>
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 14 }}>{d.shortDesc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          {d.traits.map(tr => (
            <span key={tr} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, color: 'rgba(200,168,75,0.85)', border: '1px solid rgba(200,168,75,0.25)', background: 'rgba(200,168,75,0.06)' }}>{tr}</span>
          ))}
        </div>

        <Link href={`${PATHS[lang].test}?start=1`} style={{
          display: 'block', textAlign: 'center', padding: '16px', borderRadius: 14, textDecoration: 'none',
          background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206', fontSize: 15, fontWeight: 800,
          boxShadow: '0 0 40px rgba(200,160,48,0.35)',
        }}>
          {t.cta}
        </Link>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 10 }}>
          {t.note}
        </p>
      </div>
    </main>
  )
}
