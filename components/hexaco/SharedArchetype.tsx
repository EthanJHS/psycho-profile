import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CONTENT, PATHS, type Lang } from '@/lib/i18n'
import { definingFactors, similarArchetypes } from '@/lib/archetype-page'
import { w } from '@/lib/career/report-content'

// 원형 소개 페이지 — 한국어(/a/[id])·영어(/en/a/[id]) 공용.
// 공유 링크의 도착지이자 검색으로 들어오는 입구. 공유한 사람의 점수는 담지 않고 원형 소개만 보여줌
const GOLD = '#c8a030'
const GOLD_SOFT = 'rgba(200,168,75,0.25)'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.68)'
const FAINT = 'rgba(239,230,210,0.45)'
const SERIF = 'var(--font-serif), serif'

// 영어: 원형 이름("The Sage")을 문장 중간에 쓸 때는 소문자 the
const mid = (name: string) => name.replace(/^The /, 'the ')

const KO = {
  // 검색 결과에 보이는 제목 / 공유 미리보기에 보이는 제목
  seoTitle: (name: string) => `${name} 원형 — 특징·강점·그림자`,
  shareTitle: (name: string) => `나는 ${name} — 원형 성격검사`,
  description: (name: string, tagline: string) => `${tagline}. ${name} 원형의 성격 요인, 강점과 그림자, 닮은 원형과의 차이를 확인하고 내 원형을 찾아보세요.`,
  eyebrow: '22가지 원형 중 하나',
  cta: '나는 어떤 원형일까? 검사하기 →',
  note: '무료 · 48문항 · 약 8분 · 22가지 원형',
  dailyTitle: (name: string) => `${name}의 흔한 하루`,
  lightShadowTitle: '빛과 그림자',
  light: '빛의 면',
  shadow: '그림자의 면',
  factorsTitle: (name: string) => `${name} 원형을 만드는 성격 요인`,
  factorsIntro: 'HEXACO 6요인 가운데 아래 요인이 이 방향으로 나타날 때 이 원형에 가까워져요.',
  level: (dir: 'high' | 'low', strong: boolean): string => (dir === 'high' ? (strong ? '높음' : '조금 높음') : (strong ? '낮음' : '조금 낮음')),
  tipsTitle: '성장 팁',
  similarTitle: '닮은 원형과의 차이',
  similarIntro: '성격 요인의 조합이 가까워서 함께 나오기 쉬운 원형이에요.',
  differs: (other: string, self: string, factor: string, higher: boolean) => `${w(other, '은/는')} ${self}보다 ${factor}이 더 ${higher ? '높아요' : '낮아요'}.`,
  howTitle: '원형은 어떻게 정해지나요?',
  howBody: '48개의 질문으로 정직·겸손, 정서성, 외향성, 원만성, 성실성, 개방성 여섯 요인을 재고, 그 조합이 22가지 원형 가운데 어느 것에 가장 가까운지 계산해요. 같은 원형이라도 사람마다 점수는 달라서, 결과에서는 원형과 함께 나만의 차이도 알려드려요.',
  allTitle: '다른 원형도 궁금하다면',
  allLink: '22가지 원형 모두 보기 →',
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    seoTitle: (name: string) => `${name} Personality Archetype — Traits, Strengths & Shadow`,
    shareTitle: (name: string) => `I got ${name} — Archetype Personality Test`,
    description: (name: string, tagline: string) => `${tagline}. Explore the personality factors, strengths, and shadow side of ${mid(name)}, see how it differs from similar archetypes, and find your own.`,
    eyebrow: 'ONE OF THE 22 ARCHETYPES',
    cta: 'What’s my archetype? Take the test →',
    note: 'Free · 48 questions · About 8 minutes · 22 archetypes',
    dailyTitle: (name: string) => `A typical day for ${mid(name)}`,
    lightShadowTitle: 'Light and shadow',
    light: 'Light side',
    shadow: 'Shadow side',
    factorsTitle: (name: string) => `The personality factors behind ${mid(name)}`,
    factorsIntro: 'Of the six HEXACO factors, these are the ones that point toward this archetype.',
    level: (dir: 'high' | 'low', strong: boolean) => (dir === 'high' ? (strong ? 'High' : 'Somewhat high') : (strong ? 'Low' : 'Somewhat low')),
    tipsTitle: 'Growth tips',
    similarTitle: 'How it differs from similar archetypes',
    similarIntro: 'These archetypes have a close mix of personality factors, so they often show up together.',
    differs: (other: string, self: string, factor: string, higher: boolean) => `${other} is ${higher ? 'higher' : 'lower'} in ${factor} than ${mid(self)}.`,
    howTitle: 'How is an archetype decided?',
    howBody: 'Forty-eight questions measure six factors — Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, and Openness — and we calculate which of the 22 archetypes your combination is closest to. Two people with the same archetype still have different scores, so your result also shows what sets you apart.',
    allTitle: 'Curious about the others?',
    allLink: 'See all 22 archetypes →',
  },
}

export const archetypeIds = () => Object.keys(CONTENT.ko.archetypes).map(id => ({ id }))

export function sharedArchetypeMetadata(lang: Lang, id: string): Metadata {
  const d = CONTENT[lang].archetypes[id]
  if (!d) return {}
  const t = T[lang]
  const description = t.description(d.name, d.tagline)
  // 이름·한 줄 문구가 들어간 언어별 미리보기 이미지 (scripts/generate_share_images.py로 생성)
  const image = `/archetypes/og/${lang}/${id}.jpg`
  return {
    title: t.seoTitle(d.name),
    description,
    alternates: { canonical: PATHS[lang].share(id), languages: { ko: PATHS.ko.share(id), en: PATHS.en.share(id) } },
    openGraph: { title: t.shareTitle(d.name), description: d.tagline, locale: lang === 'en' ? 'en_US' : 'ko_KR', images: [{ url: image, width: 1200, height: 630, alt: d.name }] },
    twitter: { card: 'summary_large_image', title: t.shareTitle(d.name), description: d.tagline, images: [image] },
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '26px 0', borderTop: `1px solid ${GOLD_SOFT}` }}>
      <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT, lineHeight: 1.4, marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  )
}

export default function SharedArchetype({ lang, id }: { lang: Lang; id: string }) {
  const { archetypes, personalize } = CONTENT[lang]
  const d = archetypes[id]
  if (!d) notFound()
  const t = T[lang]
  const paths = PATHS[lang]
  const factors = definingFactors(id)
  const similar = similarArchetypes(id)
  // 가장 뚜렷한 요인 두 개의 팁
  const tips = factors.slice(0, 2).map(f => personalize.growthTips[f.factor][f.dir])

  const Cta = () => (
    <>
      <Link href={`${paths.test}?start=1`} style={{
        display: 'block', textAlign: 'center', padding: '16px', borderRadius: 14, textDecoration: 'none',
        background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206', fontSize: 15, fontWeight: 800,
        boxShadow: '0 0 40px rgba(200,160,48,0.35)',
      }}>
        {t.cta}
      </Link>
      <p style={{ fontSize: 11.5, color: FAINT, textAlign: 'center', marginTop: 10 }}>{t.note}</p>
    </>
  )

  return (
    <main style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '88px 16px 56px' }}>
      <article style={{ width: '100%', maxWidth: 440 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.7)', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 16 }}>
          {t.eyebrow}
        </p>

        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${GOLD_SOFT}`, marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/archetypes/w/${id}.webp`} alt={d.name} style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(8,6,14,0.95) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
            {lang === 'ko' && <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(200,168,75,0.6)', letterSpacing: '0.18em' }}>{d.nameEn}</p>}
            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '4px 0 8px' }}>{d.name}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{d.tagline}</p>
          </div>
        </div>

        <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.8, marginBottom: 14 }}>{d.shortDesc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 26 }}>
          {d.traits.map(tr => (
            <span key={tr} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, color: 'rgba(200,168,75,0.85)', border: `1px solid ${GOLD_SOFT}`, background: 'rgba(200,168,75,0.06)' }}>{tr}</span>
          ))}
        </div>

        <div style={{ marginBottom: 30 }}><Cta /></div>

        <Section title={t.dailyTitle(d.name)}>
          <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.7, fontStyle: 'italic' }}>{d.daily}</p>
        </Section>

        <Section title={t.lightShadowTitle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ borderRadius: 12, padding: '12px 14px', background: 'rgba(200,168,75,0.07)', border: `1px solid ${GOLD_SOFT}` }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 5 }}>{t.light}</h3>
              <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.7 }}>{d.light}</p>
            </div>
            <div style={{ borderRadius: 12, padding: '12px 14px', background: 'rgba(147,166,204,0.07)', border: '1px solid rgba(147,166,204,0.25)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#93a6cc', letterSpacing: '0.08em', marginBottom: 5 }}>{t.shadow}</h3>
              <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.7 }}>{d.shadow}</p>
            </div>
          </div>
        </Section>

        {factors.length > 0 && (
          <Section title={t.factorsTitle(d.name)}>
            <p style={{ fontSize: 13.5, color: FAINT, lineHeight: 1.65, marginBottom: 14 }}>{t.factorsIntro}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {factors.map(f => (
                <li key={f.factor}>
                  <p style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{personalize.factorLabel[f.factor]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: f.dir === 'high' ? '#e2c064' : '#93a6cc' }}>{t.level(f.dir, f.strong)}</span>
                  </p>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, marginTop: 2 }}>{personalize.traitDescriptions[f.factor][f.dir]}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {tips.length > 0 && (
          <Section title={t.tipsTitle}>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tips.map(tip => <li key={tip} style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.75 }}>{tip}</li>)}
            </ul>
          </Section>
        )}

        <Section title={t.similarTitle}>
          <p style={{ fontSize: 13.5, color: FAINT, lineHeight: 1.65, marginBottom: 14 }}>{t.similarIntro}</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {similar.map(s => {
              const o = archetypes[s.id]
              return (
                <li key={s.id}>
                  <Link href={paths.share(s.id)} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'center', textDecoration: 'none', padding: 8, borderRadius: 12, border: `1px solid ${GOLD_SOFT}`, background: 'rgba(21,17,28,0.8)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/archetypes/t/${s.id}.webp`} alt="" loading="lazy" style={{ width: 64, aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', borderRadius: 8, display: 'block' }} />
                    <span>
                      <span style={{ display: 'block', fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT }}>{o.name}</span>
                      <span style={{ display: 'block', fontSize: 13.5, color: MUTED, lineHeight: 1.6, marginTop: 3 }}>{t.differs(o.name, d.name, personalize.factorLabel[s.factor], s.otherHigher)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Section>

        <Section title={t.howTitle}>
          <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.8 }}>{t.howBody}</p>
        </Section>

        <section style={{ padding: '26px 0 0', borderTop: `1px solid ${GOLD_SOFT}` }}>
          <Cta />
          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: FAINT }}>
            {t.allTitle} <Link href={`${paths.home}#codex-title`} style={{ color: '#e2c064' }}>{t.allLink}</Link>
          </p>
        </section>
      </article>
    </main>
  )
}
