'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import WaitlistForm from '@/components/WaitlistForm'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'
import { ARCHETYPES } from '@/lib/scoring-hexaco'

// 원형 그림(검은 바탕 · 금박 · 촛불빛 유화)에서 뽑은 팔레트
const INK = '#0b0910'
const GOLD = '#c8a030'
const GOLD_SOFT = 'rgba(200,160,48,0.28)'
const PARCHMENT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.58)'
const FAINT = 'rgba(239,230,210,0.38)'
const SERIF = 'var(--font-serif), "Nanum Myeongjo", "Noto Serif KR", serif'
const GOLD_BUTTON = 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)'

// 히어로에서 순서대로 펼쳐 보일 원형 (색감이 서로 다른 것끼리 묶음)
const HERO_DECK = [
  ['guardian', 'dreamer', 'strategist'],
  ['sage', 'charmer', 'warrior'],
  ['explorer', 'empath', 'conqueror'],
  ['visionary', 'artisan', 'cynic'],
]

function Ornament({ width = 72 }: { width?: number }) {
  return (
    <div aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <span style={{ height: 1, width, background: `linear-gradient(to right, transparent, ${GOLD_SOFT})` }} />
      <span style={{ width: 6, height: 6, transform: 'rotate(45deg)', border: `1px solid ${GOLD}`, opacity: 0.7 }} />
      <span style={{ height: 1, width, background: `linear-gradient(to left, transparent, ${GOLD_SOFT})` }} />
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.22em', marginBottom: 10 }}>{children}</p>
}

function GoldLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="gold-cta" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '16px 34px', borderRadius: 999, background: GOLD_BUTTON, color: '#1a1206',
      fontSize: 15, fontWeight: 800, letterSpacing: '0.02em', textDecoration: 'none',
      boxShadow: '0 8px 32px rgba(200,160,48,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',
    }}>{children}</Link>
  )
}

// ── 히어로: 타로처럼 펼친 원형 카드 3장, 몇 초마다 다른 원형으로 교체 ──
function HeroDeck() {
  const [hand, setHand] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setHand(h => (h + 1) % HERO_DECK.length), 4200)
    return () => clearInterval(t)
  }, [])
  const cards = HERO_DECK[hand]
  const pose = [
    { rotate: -11, x: -58, y: 14, z: 1 },
    { rotate: 0, x: 0, y: 0, z: 3 },
    { rotate: 11, x: 58, y: 14, z: 2 },
  ]
  return (
    <div aria-hidden style={{ position: 'relative', height: 250, width: '100%', maxWidth: 320, margin: '0 auto 30px' }}>
      <div style={{ position: 'absolute', left: '50%', top: '42%', width: 260, height: 260, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(226,192,100,0.22) 0%, transparent 65%)', filter: 'blur(6px)' }} />
      {cards.map((id, i) => (
        <div key={i} className="hero-card" style={{
          position: 'absolute', left: '50%', top: 0, width: 132, aspectRatio: '3 / 4.4',
          marginLeft: -66, borderRadius: 12, overflow: 'hidden', zIndex: pose[i].z,
          transform: `translate(${pose[i].x}px, ${pose[i].y}px) rotate(${pose[i].rotate}deg)`,
          border: `1px solid ${i === 1 ? 'rgba(226,192,100,0.7)' : GOLD_SOFT}`,
          boxShadow: '0 18px 40px rgba(0,0,0,0.6)', background: '#140f18',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={id} src={`/archetypes/t/${id}.webp`} alt="" className="hero-card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', filter: i === 1 ? 'none' : 'brightness(0.6)' }} />
          <div style={{ position: 'absolute', inset: 5, border: '1px solid rgba(226,192,100,0.25)', borderRadius: 8, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 6px 8px', textAlign: 'center', background: 'linear-gradient(transparent, rgba(8,6,12,0.92))' }}>
            <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: PARCHMENT }}>{ARCHETYPE_DETAILS[id]?.name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── CORE CAREER 소개: 시기를 고르면 탐색·향상 리포트가 무엇을 담는지 보여줌 ──
const CAREER_STAGES = [
  { id: 'high', label: '고등학생', find: '나에게 맞는 계열·학과 TOP 5와 결정이 어려운 이유', do: '나에게 맞는 공부법, 시험 불안과 수행평가 전략' },
  { id: 'college', label: '대학생', find: '전공 이후 잘 맞는 직무 TOP 5, 전공 전환 고민 정리', do: '학업 전략, 팀 프로젝트와 발표에서의 나' },
  { id: 'jobseeker', label: '취준생', find: '지원할 직무 TOP 5와 직무별 AI 변화 전망', do: '자기소개서에 쓸 강점 문장, 면접과 불합격 회복' },
  { id: 'worker', label: '직장인', find: '지금 직장 진단(바꿀까, 조정할까)과 맞는 직무', do: '지금 자리에서의 성과, 잡 크래프팅, 번아웃 신호' },
] as const

function CareerSection() {
  const [stage, setStage] = useState<(typeof CAREER_STAGES)[number]['id']>('jobseeker')
  const cur = CAREER_STAGES.find(s => s.id === stage)!
  return (
    <section aria-labelledby="career-title" style={{ padding: '56px 16px', borderTop: `1px solid ${GOLD_SOFT}` }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Eyebrow>CORE CAREER · 출시 예정</Eyebrow>
          <h2 id="career-title" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: PARCHMENT, marginBottom: 8, lineHeight: 1.4 }}>지금 시기에 맞춘<br />진로 리포트</h2>
          <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.7 }}>
            무료 원형 검사로 성격은 이미 알고 있어요.<br />흥미·가치 질문을 더해 지금 나에게 필요한 답을 드려요.
          </p>
        </div>

        <div role="tablist" aria-label="시기 선택" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
          {CAREER_STAGES.map(s => (
            <button key={s.id} role="tab" aria-selected={stage === s.id} onClick={() => setStage(s.id)} style={{
              padding: '10px 0', borderRadius: 999, fontSize: 13.5, cursor: 'pointer', fontWeight: stage === s.id ? 800 : 500,
              border: `1px solid ${stage === s.id ? 'transparent' : GOLD_SOFT}`,
              background: stage === s.id ? GOLD_BUTTON : 'transparent', color: stage === s.id ? '#1a1206' : MUTED,
            }}>{s.label}</button>
          ))}
        </div>

        <div role="tabpanel" style={{ border: `1px solid ${GOLD_SOFT}`, borderRadius: 16, padding: '6px 18px', background: 'linear-gradient(160deg, rgba(60,40,12,0.35), rgba(20,15,24,0.6))' }}>
          {[
            ['탐색', '나에게 맞는 길 찾기', cur.find],
            ['향상', '지금 자리에서 더 잘하기', cur.do],
          ].map(([t, k, d], i) => (
            <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: i === 0 ? '1px solid rgba(200,160,48,0.14)' : 'none' }}>
              <span aria-hidden style={{ width: 8, height: 8, marginTop: 8, transform: 'rotate(45deg)', background: GOLD, opacity: 0.75, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 700, color: PARCHMENT }}>{t} <span style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 400, color: FAINT, marginLeft: 4 }}>{k}</span></p>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.6 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: FAINT, lineHeight: 1.6, margin: '10px 2px 0' }}>
          모든 리포트에 관계 패턴, 시기별 스트레스 반응, 성장 로드맵이 함께 들어가요. 탐색과 향상을 묶어서 받을 수도 있어요.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '18px 2px 14px' }}>
          <p style={{ fontSize: 13, color: MUTED }}>출시가 <span style={{ fontSize: 12, color: FAINT }}>· 묶음은 할인가로 준비 중</span></p>
          <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: PARCHMENT }}>9,900원</p>
        </div>
        <WaitlistForm source="home" />
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: INK, color: PARCHMENT, overflowX: 'hidden' }}>
      <style>{`
        .gold-cta { transition: transform .2s ease, box-shadow .2s ease; }
        .gold-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 40px rgba(200,160,48,0.35), inset 0 1px 0 rgba(255,255,255,0.35); }
        .hero-card { transition: transform .6s cubic-bezier(.2,.8,.2,1); }
        .hero-card-img { animation: cardIn .7s ease both; }
        @keyframes cardIn { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: none; } }
        .codex { scrollbar-width: none; scroll-snap-type: x mandatory; }
        .codex::-webkit-scrollbar { display: none; }
        .codex-card { transition: transform .25s ease, border-color .25s ease; }
        .codex-card:hover, .codex-card:focus-visible { transform: translateY(-4px); border-color: rgba(226,192,100,0.6) !important; }
        @media (prefers-reduced-motion: reduce) { .hero-card, .hero-card-img, .codex-card, .gold-cta { transition: none; animation: none; } }
      `}</style>

      {/* ── 히어로 ── */}
      <section style={{ position: 'relative', padding: '104px 16px 56px', textAlign: 'center' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 55% at 50% 30%, rgba(120,70,20,0.18), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <HeroDeck />
          <Eyebrow>CORE TRAIT · 원형 성격검사</Eyebrow>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.9rem, 7.5vw, 2.7rem)', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em', color: PARCHMENT, textWrap: 'balance', marginBottom: 16 }}>
            당신 안에 잠든<br /><span style={{ color: '#e2c064' }}>원형이 깨어납니다</span>
          </h1>
          <Ornament />
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.85, margin: '16px 0 28px' }}>
            성격에는 가장 선명하게 드러나는 하나의 원형이 있습니다.<br />
            48개의 질문으로 22가지 원형 중 당신의 것을 찾아보세요.
          </p>
          <GoldLink href="/hexaco-test?start=1">원형 깨우기 →</GoldLink>
          <p style={{ marginTop: 14, fontSize: 12, color: FAINT }}>무료 · 로그인 없음 · 약 8분</p>
        </div>
      </section>

      {/* ── 원형 도감 ── */}
      <section aria-labelledby="codex-title" style={{ padding: '48px 0 56px', borderTop: `1px solid ${GOLD_SOFT}`, background: 'linear-gradient(to bottom, rgba(40,26,10,0.25), transparent)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px', textAlign: 'center', marginBottom: 22 }}>
          <Eyebrow>ARCHETYPE CODEX</Eyebrow>
          <h2 id="codex-title" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: PARCHMENT, marginBottom: 8 }}>22가지 원형 도감</h2>
          <p style={{ fontSize: 13, color: FAINT }}>옆으로 넘겨 보세요. 카드를 누르면 원형 소개를 볼 수 있어요.</p>
        </div>
        <div className="codex" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '6px 16px 14px' }}>
          {ARCHETYPES.map(a => {
            const d = ARCHETYPE_DETAILS[a.id]
            return (
              <Link key={a.id} href={`/a/${a.id}`} className="codex-card" style={{
                flex: '0 0 148px', scrollSnapAlign: 'start', textDecoration: 'none', color: PARCHMENT,
                borderRadius: 12, overflow: 'hidden', border: `1px solid ${GOLD_SOFT}`, background: '#140f18',
              }}>
                <div style={{ position: 'relative', aspectRatio: '3 / 4' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/archetypes/t/${a.id}.webp`} alt={`${d?.name} 원형 그림`} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, rgba(8,6,12,0.95))' }} />
                  <div style={{ position: 'absolute', left: 10, right: 10, bottom: 8 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.14em' }}>{d?.nameEn.replace('THE ', '')}</p>
                    <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700 }}>{d?.name}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, padding: '9px 10px 11px', minHeight: 52 }}>{d?.tagline}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── 검사 방식 (실제 진행 순서) ── */}
      <section style={{ padding: '56px 16px', borderTop: `1px solid ${GOLD_SOFT}` }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: PARCHMENT, lineHeight: 1.4, textWrap: 'balance' }}>
              학술 모델로 측정하고,<br />원형으로 읽어드립니다
            </h2>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { t: '48개의 질문에 답합니다', d: '평소의 나와 가장 가까운 답을 고르면 됩니다. 정답은 없고, 약 8분이면 끝나요.' },
              { t: 'HEXACO 6요인을 측정합니다', d: '정직·겸손, 정서성, 외향성, 원만성, 성실성, 개방성. 학술 연구에서 널리 쓰이는 성격 모델이에요.' },
              { t: '22가지 중 당신의 원형을 찾습니다', d: '6요인의 조합이 가장 가까운 원형과, 같은 원형 안에서도 당신만 다른 점을 함께 알려드려요.' },
              { t: '원하면 진로 리포트로 이어갑니다', d: '이미 측정한 성격에 흥미·가치 질문을 더해, 지금 시기에 맞는 진로 리포트를 만들어요.' },
            ].map((s, i) => (
              <li key={s.t} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 14, alignItems: 'start' }}>
                <span style={{ fontFamily: SERIF, fontSize: 22, color: GOLD, lineHeight: 1.2, textAlign: 'center' }}>{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][i]}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: PARCHMENT, marginBottom: 4 }}>{s.t}</p>
                  <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.75 }}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CORE CAREER: 시기별 진로 리포트 ── */}
      <CareerSection />

      {/* ── 마무리 CTA ── */}
      <section style={{ padding: '64px 16px 72px', textAlign: 'center', borderTop: `1px solid ${GOLD_SOFT}`, background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(120,70,20,0.2), transparent 70%)' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <Ornament width={48} />
          <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: PARCHMENT, lineHeight: 1.4, margin: '18px 0 12px' }}>
            당신의 원형은<br />무엇일까요
          </h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 26 }}>몰랐던 성격의 패턴과 강점, 맹점을 발견해 보세요.</p>
          <GoldLink href="/hexaco-test?start=1">무료로 원형 찾기 →</GoldLink>
          <p style={{ marginTop: 14, fontSize: 12, color: FAINT }}>결과는 바로 확인할 수 있어요</p>
        </div>
      </section>
    </main>
  )
}
