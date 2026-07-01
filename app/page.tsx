'use client'

import Link from 'next/link'
import HeroIllustration from '@/components/HeroIllustration'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: 'HEXACO 기반 6요인 측정',
    desc: 'Big Five가 놓친 겸손성·정직 차원까지 포함한 HEXACO 모델로 성격을 더 정확하게 읽습니다. 리커트 자가보고가 아닌 시나리오형 문항으로 사회적 바람직성 편향을 최소화합니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: '192개 세분화 프로파일',
    desc: '원형(12) × 사고방식(4) × 핵심동력(4)의 3-레이어 조합. "INTJ" 한 칸에 욱여넣는 게 아니라 당신만의 고유한 심리 지도를 그립니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: 'Holland RIASEC 직업흥미 추정',
    desc: '성격 패싯에서 탐구형·예술형·진취형 등 직업흥미 유형을 교차 추정합니다. 성격과 흥미가 같은 방향을 가리킬 때, 직업 추천의 신뢰도가 높아집니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: '응답 일관성 자동 검증',
    desc: '역방향 문항과의 비교로 응답의 일관성을 자동 산출합니다. 결과를 신뢰할 수 있는지를 결과지에서 직접 확인할 수 있는 심리검사는 드뭅니다.',
  },
]

const PROFILES_PREVIEW = [
  { label: '전략적 완벽주의자', delay: 0 },
  { label: '탐구형 혁신가', delay: 0.2 },
  { label: '조용한 천재', delay: 0.4 },
  { label: '카리스마 리더', delay: 0.1 },
  { label: '공감형 조력자', delay: 0.3 },
  { label: '분석형 연구자', delay: 0.5 },
  { label: '민감형 완벽주의자', delay: 0.6 },
  { label: '독립형 장인', delay: 0.25 },
]

const STEPS = [
  { n: '01', title: '42문항 응답', sub: '약 10분 · 시나리오형 강제선택 — 사회적 바람직성 편향 최소화' },
  { n: '02', title: '3-레이어 분석', sub: '원형 × 사고방식 × 핵심동력으로 192개 프로파일 매칭' },
  { n: '03', title: '즉시 리포트', sub: '성격·진로·RIASEC·인지·강점·업무 스타일 한 번에 확인' },
]

const FREE_ITEMS = ['42문항 (약 10분)', '192개 프로파일 중 매칭', 'HEXACO 6요인 레이더 차트', 'Holland RIASEC 직업흥미 추정', '성격 경향 서술형 분석', '응답 일관성 자동 검증', '진로 적합도 상위 2개 미리보기']
const FULL_ITEMS = ['진로 TOP 6 전체 (이유·세부역할 포함)', '나와 맞지 않는 직업 분석', '성격 강점 TOP 5 (VIA 기반)', '업무 스타일 상세 분석', '행동재무 기반 투자 성향', '리더십 스타일 · 번아웃 리스크']

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col page-top" style={{ overflowX: 'hidden' }}>

      {/* ── 배경 그라디언트 오브 ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 700,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.11) 0%, transparent 62%)',
          filter: 'blur(1px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-5%',
          width: 480, height: 480,
          background: 'radial-gradient(ellipse, rgba(45,212,191,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '-8%',
          width: 360, height: 360,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 65%)',
        }} />
      </div>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28">
        <div className="max-w-3xl mx-auto">

          {/* 뱃지 */}
          <div
            className="badge badge-violet mx-auto mb-8 animate-fade-up opacity-0"
            style={{ animationFillMode: 'forwards' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block', flexShrink: 0 }} />
            과학 기반 심리 분석
          </div>

          {/* 히어로 일러스트 */}
          <div className="flex justify-center mb-8 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.05s' }}>
            <HeroIllustration size={220} />
          </div>

          {/* 헤드라인 */}
          <h1
            className="heading-xl mb-6 animate-fade-up opacity-0 delay-100"
            style={{ animationFillMode: 'forwards', color: 'var(--text)' }}
          >
            <span className="gradient-text">당신을 가장</span>
            <br />
            <span className="gradient-text">정확하게 읽는</span>
            <br />
            <span>심리 분석</span>
          </h1>

          <p
            className="text-lg animate-fade-up opacity-0 delay-200"
            style={{
              color: 'var(--muted)',
              lineHeight: 1.85,
              maxWidth: 520,
              margin: '0 auto 40px',
              animationFillMode: 'forwards',
            }}
          >
            HEXACO 기반 성격 측정과 Holland 직업흥미를 교차해<br />
            192개 세분화 프로파일로 성격, 진로, 업무 방식까지.
          </p>

          {/* CTA 버튼 */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up opacity-0 delay-300"
            style={{ animationFillMode: 'forwards' }}
          >
            <Link href="/test" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              무료로 시작하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#how"
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '14px 28px', textDecoration: 'none' }}
            >
              어떻게 다른가요?
            </a>
          </div>

          <p
            className="mt-5 text-sm animate-fade-up opacity-0 delay-400"
            style={{ color: 'var(--muted2)', animationFillMode: 'forwards' }}
          >
            약 10분 · 완전 무료 · 회원가입 불필요
          </p>
        </div>

        {/* 프로파일 태그 플로팅 */}
        <div
          className="relative z-10 mt-16 flex flex-wrap justify-center gap-2 max-w-lg mx-auto animate-fade-up opacity-0 delay-500"
          style={{ animationFillMode: 'forwards' }}
        >
          {PROFILES_PREVIEW.map((p) => (
            <span
              key={p.label}
              className="text-xs px-3.5 py-1.5 rounded-full"
              style={{
                background: 'rgba(26,23,42,0.9)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                animation: `float ${3.4 + p.delay * 0.8}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.label}
            </span>
          ))}
          <span
            className="text-xs px-3.5 py-1.5 rounded-full"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.28)',
              color: 'var(--accent2)',
            }}
          >
            +184개 더
          </span>
        </div>
      </section>

      {/* ══════════════════════════════
          숫자 스탯
      ══════════════════════════════ */}
      <section
        className="relative z-10 py-10 px-6"
        style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(17,16,24,0.6)' }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '192', l: '세분화 프로파일' },
            { v: '42', l: '시나리오형 문항' },
            { v: '6축', l: 'HEXACO 레이더' },
            { v: '3층', l: '레이어 심리 모델' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-3xl font-extrabold gradient-text tracking-tight">{s.v}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          특징 — Why Different
      ══════════════════════════════ */}
      <section id="how" className="relative z-10 py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-violet mx-auto mb-4">Why Different</div>
            <h2 className="heading-lg mb-4" style={{ color: 'var(--text)' }}>단순 유형 분류가 아닙니다</h2>
            <p style={{ color: 'var(--muted)' }}>MBTI와 근본적으로 다른 과학적 접근법</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass glass-hover rounded-2xl p-7 animate-fade-up opacity-0"
                style={{
                  animationFillMode: 'forwards',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent2)' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          진행 방식
      ══════════════════════════════ */}
      <section
        className="relative z-10 py-24 px-6"
        style={{ background: 'rgba(17,16,24,0.5)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge badge-teal mx-auto mb-4">How It Works</div>
            <h2 className="heading-lg" style={{ color: 'var(--text)' }}>어떻게 진행되나요?</h2>
          </div>

          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="glass rounded-2xl p-5 flex items-center gap-5 animate-fade-up opacity-0"
                style={{ animationFillMode: 'forwards', animationDelay: `${i * 0.1}s` }}
              >
                <span
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--accent2)', letterSpacing: '-0.02em' }}
                >
                  {s.n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text)' }}>{s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          가격 비교
      ══════════════════════════════ */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-violet mx-auto mb-4">Pricing</div>
            <h2 className="heading-lg" style={{ color: 'var(--text)' }}>무료 샘플 vs 풀버전</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* 무료 */}
            <div className="glass rounded-2xl p-7 flex flex-col">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>무료 샘플</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold gradient-text">0원</span>
              </div>
              <ul className="space-y-2.5 text-sm flex-1 mb-7" style={{ color: 'var(--muted)' }}>
                {FREE_ITEMS.map(t => (
                  <li key={t} className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/test"
                className="btn-secondary w-full text-center"
                style={{ textDecoration: 'none', justifyContent: 'center' }}
              >
                무료로 시작
              </Link>
            </div>

            {/* 풀버전 */}
            <div
              className="rounded-2xl p-7 relative overflow-hidden flex flex-col glow-accent"
              style={{
                background: 'linear-gradient(145deg, rgba(124,58,237,0.18), rgba(139,92,246,0.06) 60%, rgba(26,23,42,0.85))',
                border: '1px solid rgba(139,92,246,0.35)',
              }}
            >
              {/* 추천 뱃지 */}
              <div
                className="absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
              >
                추천
              </div>

              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent3)' }}>풀버전 리포트</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold gradient-text">9,900원</span>
              </div>
              <ul className="space-y-2.5 text-sm flex-1 mb-7" style={{ color: 'var(--text2)' }}>
                {FULL_ITEMS.map(t => (
                  <li key={t} className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/paid"
                className="btn-primary w-full text-center"
                style={{ textDecoration: 'none', justifyContent: 'center', background: 'linear-gradient(135deg, #be185d, #7c3aed)' }}
              >
                정밀 검사 시작하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          최종 CTA
      ══════════════════════════════ */}
      <section
        className="relative z-10 py-28 px-6 text-center"
        style={{ background: 'rgba(17,16,24,0.5)', borderTop: '1px solid var(--border)' }}
      >
        {/* CTA 글로우 */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.13) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="badge badge-rose mx-auto mb-6">지금 바로 시작</div>
          <h2 className="heading-lg mb-5" style={{ color: 'var(--text)' }}>
            10분이면<br />충분합니다
          </h2>
          <p className="mb-10 text-base" style={{ color: 'var(--muted)', lineHeight: 1.85 }}>
            당신이 몰랐던 성격의 패턴,<br />강점과 맹점을 지금 발견하세요.
          </p>
          <Link
            href="/test"
            className="btn-primary animate-pulse-ring"
            style={{ fontSize: '1.05rem', padding: '15px 40px', display: 'inline-flex' }}
          >
            무료 테스트 시작
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-5 text-sm" style={{ color: 'var(--muted2)' }}>신용카드 불필요 · 즉시 결과</p>
        </div>
      </section>

    </main>
  )
}
