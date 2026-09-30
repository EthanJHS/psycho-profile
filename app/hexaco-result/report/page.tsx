'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { scoreHexaco, HexacoResult, HexacoFactor } from '@/lib/scoring-hexaco'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'
import { personalizeResult, PersonalizedResult } from '@/lib/personalize-result'
import { trackHexaco, initScrollDepthTracking, isAdminSim } from '@/lib/analytics'
import ResultFeedback from '@/components/ResultFeedback'
import { encodeHexacoAnswers, decodeHexacoAnswers } from '@/lib/hexaco-encoding'
import WaitlistForm from '@/components/WaitlistForm'
import { w } from '@/lib/career/report-content'

function GoldDivider({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(200,168,75,0.35))' }} />
      <span style={{ fontSize: 12, color: 'rgba(200,168,75,0.5)' }}>✦</span>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(200,168,75,0.35))' }} />
    </div>
  )
}

function Tome({ label, children, accent = 'violet' }: { label: string; children: React.ReactNode; accent?: 'violet' | 'gold' | 'red' }) {
  const colors = {
    violet: { border: 'rgba(139,92,246,0.25)', label: 'rgba(167,139,250,0.7)', bg: 'rgba(139,92,246,0.04)' },
    gold:   { border: 'rgba(200,168,75,0.2)',  label: 'rgba(200,168,75,0.65)',  bg: 'rgba(200,168,75,0.03)' },
    red:    { border: 'rgba(239,68,68,0.2)',   label: 'rgba(239,68,68,0.6)',    bg: 'rgba(239,68,68,0.04)' },
  }[accent]
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.border}`, background: colors.bg, marginBottom: 12 }}>
      <div style={{ padding: '9px 18px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 8, color: colors.label }}>✦</span>
        <p style={{ fontSize: 12, fontWeight: 700, color: colors.label, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</p>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>{children}</div>
    </div>
  )
}

const FACTOR_LABELS: Record<HexacoFactor, string> = {
  H: '정직·겸손', E: '정서성', X: '외향성', A: '원만성', C: '성실성', O: '개방성',
}

export default function HexacoReportPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(200,168,75,0.2)', borderTopColor: 'rgba(200,168,75,0.7)', animation: 'spin 0.8s linear infinite' }} />
      </main>
    }>
      <HexacoReportInner />
    </Suspense>
  )
}

function HexacoReportInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewId = searchParams.get('preview')
  const [result, setResult] = useState<HexacoResult | null>(null)
  const [personalized, setPersonalized] = useState<PersonalizedResult | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [chaptersVisible, setChaptersVisible] = useState(false)
  const [toast, setToast] = useState('')
  const [testId, setTestId] = useState<string | null>(null)
  const restoreCode = searchParams.get('r')

  // 개인정보 열람·삭제 요청용 검사 번호 (이 기기에서 직접 본 검사일 때만)
  useEffect(() => {
    if (previewId || restoreCode) return
    setTestId(sessionStorage.getItem('pp_test_session_id'))
  }, [previewId, restoreCode])

  useEffect(() => {
    if (previewId && ARCHETYPE_DETAILS[previewId]) {
      const detail = ARCHETYPE_DETAILS[previewId]
      const mockResult: HexacoResult = {
        primary: { id: previewId, name: detail.name, profile: { H:0,E:0,X:0,A:0,C:0,O:0 }, note: detail.tagline ?? '' },
        secondary: { id: 'sage', name: '현자', profile: { H:0,E:0,X:0,A:0,C:0,O:0 }, note: '' },
        primaryDistance: 0, secondaryDistance: 0,
        scores: { raw: { H:3.5,E:3.0,X:3.2,A:3.4,C:3.6,O:3.8 }, direction: { H:1,E:0,X:0,A:1,C:1,O:1 } },
      }
      setResult(mockResult)
      setPersonalized(personalizeResult(mockResult))
      return
    }
    // 결과 링크(?r=)로 들어오면 링크에 담긴 응답으로 복원 (DB 저장·집계 없음)
    const restored = restoreCode ? decodeHexacoAnswers(restoreCode) : null
    if (restoreCode && !restored) { router.replace('/hexaco-test'); return }
    const raw = restored ? JSON.stringify(restored) : sessionStorage.getItem('hexaco_answers')
    if (!raw) { router.replace('/hexaco-test'); return }
    try {
      const answers = JSON.parse(raw) as Record<string, number>
      if (restored) sessionStorage.setItem('hexaco_answers', raw)
      const r = scoreHexaco(answers)
      setResult(r)
      setPersonalized(personalizeResult(r))
      if (!restored) trackHexaco('hexaco_report_view', { archetype_primary: r.primary.id }).catch(() => {})
    } catch {
      router.replace('/hexaco-test')
    }
  }, [router, previewId, restoreCode])

  // 봉인 챕터가 화면에 보이면 하단 고정 버튼을 숨김 (같은 버튼 중복 노출 방지)
  useEffect(() => {
    const el = document.getElementById('sealed-chapters')
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setChaptersVisible(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [result])

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function shareArchetype(id: string, name: string, tagline?: string) {
    if (!previewId) trackHexaco('hexaco_share', { archetype_primary: id }).catch(() => {})
    const url = `${window.location.origin}/a/${id}`
    if (navigator.share) {
      try { await navigator.share({ title: `나는 ${name}`, text: tagline ?? name, url }) } catch { /* 사용자가 공유 창을 닫음 */ }
    } else {
      await navigator.clipboard?.writeText(url)
      flash('공유 링크를 복사했습니다')
    }
  }

  async function copyMyResultLink() {
    const raw = sessionStorage.getItem('hexaco_answers')
    const code = raw ? encodeHexacoAnswers(JSON.parse(raw)) : null
    if (!code) { flash('결과 링크를 만들 수 없습니다'); return }
    await navigator.clipboard?.writeText(`${window.location.origin}/hexaco-result/report?r=${code}`)
    flash('내 결과 링크를 복사했습니다 — 이 링크로 언제든 다시 볼 수 있어요')
  }

  useEffect(() => {
    if (previewId || isAdminSim()) return
    return initScrollDepthTracking('hexaco-report')
  }, [previewId])

  function onUnlockClick(source: 'sticky' | 'chapter') {
    if (!previewId && result) trackHexaco('hexaco_unlock_click', { source, archetype_primary: result.primary.id }).catch(() => {})
  }

  if (!result) {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(200,168,75,0.2)', borderTopColor: 'rgba(200,168,75,0.7)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13.5, color: 'rgba(200,168,75,0.4)', letterSpacing: '0.1em' }}>READING THE TOME...</p>
      </main>
    )
  }

  const { primary, secondary, scores } = result
  const factors = Object.keys(FACTOR_LABELS) as HexacoFactor[]
  const primaryDetail = ARCHETYPE_DETAILS[primary.id]
  const secondaryDetail = ARCHETYPE_DETAILS[secondary.id]
  const previewSuffix = previewId ? `?preview=${previewId}` : ''

  // 진로 리포트 맛보기 — 원형 맞춤 첫 줄만 공개, 나머지 blur
  const trait = primaryDetail?.traits?.[0] ?? '나만의 방식'
  const CHAPTER_TEASERS = [
    {
      rune: '⚔', title: '탐색 — 나에게 맞는 길',
      teaser: `${w(primary.name, '은/는')} 성격에 흥미와 가치를 더하면, 가장 잘 맞는 직무와 계열 TOP 5가 달라집니다. 1순위는…`,
    },
    {
      rune: '✦', title: '향상 — 지금 자리에서 더 잘',
      teaser: `${w(trait, '을/를')} 무기로 가진 당신에게 맞는 공부법·일하는 방식은 따로 있습니다. 가장 먼저 바꿀 것은…`,
    },
    {
      rune: '♡', title: '관계 패턴',
      teaser: `가까워질수록 드러나는 ${primary.name}의 관계 패턴이 있습니다. 가까운 사람일수록 당신은…`,
    },
    {
      rune: '◎', title: '스트레스와 회복',
      teaser: primaryDetail?.shadow ? primaryDetail.shadow.slice(0, 28) + '…' : `${primary.name}의 그림자는 스트레스 상황에서 가장 선명하게 드러납니다.`,
    },
  ]

  return (
    <>
      {/* Sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '12px 20px 20px',
        background: 'linear-gradient(to top, rgba(8,6,14,0.98) 60%, transparent)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        transform: chaptersVisible ? 'translateY(110%)' : 'none',
        transition: 'transform 0.25s ease',
      }} aria-hidden={chaptersVisible}>
        <p style={{ fontSize: 12.5, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.05em' }}>
          ⬡ {primary.name} 원형을 위한 진로 리포트 · 출시 예정
        </p>
        <button
          tabIndex={chaptersVisible ? -1 : 0}
          onClick={() => {
            onUnlockClick('sticky')
            setUnlocking(true)
            document.getElementById('sealed-chapters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          style={{
            width: '100%', maxWidth: 380, padding: '15px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #92680a, #c8a030, #92680a)',
            color: '#1a1000', fontSize: 15, fontWeight: 900, letterSpacing: '0.03em',
            boxShadow: '0 0 40px rgba(200,168,75,0.3)',
          }}
        >
          진로 리포트 출시 알림 받기
        </button>
      </div>

      {toast && (
        <div role="status" style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
          maxWidth: 'calc(100% - 32px)', padding: '10px 16px', borderRadius: 12, fontSize: 15, textAlign: 'center',
          background: 'rgba(20,16,30,0.96)', border: '1px solid rgba(200,168,75,0.35)', color: '#fff',
        }}>{toast}</div>
      )}

    <main className="min-h-screen flex flex-col items-center" style={{ paddingBottom: 120 }}>

      {/* 헤더 카드 */}
      <div style={{ width: '100%', maxWidth: 480, padding: '28px 20px 0' }}>
        <button
          onClick={() => router.push('/hexaco-result' + (previewSuffix || (restoreCode ? `?r=${restoreCode}` : '')))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,168,75,0.6)', fontSize: 13.5, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← 원형 이미지로 돌아가기
        </button>

        {/* 카드 이미지 + 텍스트 */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,168,75,0.2)', marginBottom: 20 }}>
          <div style={{ height: 220, overflow: 'hidden' }}>
            <img
              src={`/archetypes/w/${primary.id}.webp`}
              alt={primary.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,6,14,0.2) 0%, transparent 40%, rgba(8,6,14,0.92) 100%)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>ARCHETYPE REPORT</p>
            {personalized?.subLabel && (
              <p style={{ fontSize: 12.5, color: 'rgba(200,168,75,0.6)', marginBottom: 2, fontStyle: 'italic' }}>{personalized.subLabel}</p>
            )}
            <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 3 }}>{primary.name}</p>
            {primaryDetail?.nameEn && (
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,168,75,0.5)', letterSpacing: '0.18em' }}>{primaryDetail.nameEn}</p>
            )}
          </div>
        </div>

        <GoldDivider style={{ marginBottom: 20 }} />
      </div>

      {/* 보고서 본문 */}
      <div className="w-full px-4" style={{ maxWidth: 480 }}>

        {/* 원형 해석 */}
        <Tome label="원형 해석" accent="violet">
          {primaryDetail?.daily && (
            <div style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 5 }}>{primary.name}의 흔한 하루</p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontStyle: 'italic' }}>{primaryDetail.daily}</p>
            </div>
          )}
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 14 }}>
            {primaryDetail?.shortDesc ?? primary.note}
          </p>
          {primaryDetail?.light && (
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(167,139,250,0.7)', letterSpacing: '0.1em', marginBottom: 5 }}>빛의 면</p>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{primaryDetail.light}</p>
            </div>
          )}
          {primaryDetail?.shadow && (
            <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(239,68,68,0.6)', letterSpacing: '0.1em', marginBottom: 5 }}>그림자의 면</p>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.74)', lineHeight: 1.65 }}>{primaryDetail.shadow}</p>
              {personalized?.shadowNote && (
                <p style={{ fontSize: 12.5, color: 'rgba(200,168,75,0.55)', lineHeight: 1.6, marginTop: 8, fontStyle: 'italic', borderTop: '1px solid rgba(239,68,68,0.12)', paddingTop: 8 }}>{personalized.shadowNote}</p>
              )}
            </div>
          )}
        </Tome>

        {/* 왜 이 원형인가 + 구분하는 특징 */}
        {personalized && (
          <Tome label="왜 이 원형인가요?" accent="gold">
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 14 }}>
              {personalized.whyText}
            </p>
            {personalized.distinguishingTraits.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>나를 구분하는 특징</p>
                {personalized.distinguishingTraits.map((trait, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(200,168,75,0.5)', marginTop: 2, flexShrink: 0 }}>⬡</span>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{trait}</p>
                  </div>
                ))}
              </div>
            )}
          </Tome>
        )}

        {/* 부가 성향 */}
        <Tome label="부가 성향" accent="gold">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{secondary.name}</p>
            {secondaryDetail?.nameEn && (
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.12em' }}>{secondaryDetail.nameEn}</p>
            )}
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.74)', lineHeight: 1.75 }}>
            {secondaryDetail?.shortDesc ?? secondary.note}
          </p>
          {personalized?.secondaryWhy && (
            <p style={{ fontSize: 13.5, color: 'rgba(226,192,100,0.85)', lineHeight: 1.65, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(200,168,75,0.15)' }}>
              {personalized.secondaryWhy}
            </p>
          )}
        </Tome>

        {/* HEXACO 요인 */}
        <Tome label="HEXACO 요인 프로파일" accent="gold">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {factors.map(f => {
              const raw = scores.raw[f]
              const dir = scores.direction[f]
              const pct = ((raw - 1) / 4) * 100
              // 낮은 점수는 결점이 아니라 방향의 차이 — 빨간색 대신 은청색
              const barColor = dir === 1
                ? 'linear-gradient(90deg, #a8781f, #e2c064)'
                : dir === -1 ? 'linear-gradient(90deg, #5d6f94, #93a6cc)'
                : 'rgba(160,160,180,0.45)'
              return (
                <div key={f}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.86)', fontWeight: 600 }}>{FACTOR_LABELS[f]}</span>
                    <span style={{ fontSize: 13.5, color: 'rgba(226,192,100,0.9)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{raw.toFixed(1)}<span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}> / 5</span></span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: barColor, transition: 'width 0.7s ease' }} />
                  </div>
                  {personalized?.factorLines[f] && (
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.74)', lineHeight: 1.6, marginTop: 5 }}>{personalized.factorLines[f]}</p>
                  )}
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(200,168,75,0.15)' }}>
            점수는 요인별 8문항 응답의 평균(1~5)이에요. 3이 중간이고, 다른 사람과 비교한 순위(백분위)는 아니에요.
            HEXACO는 학술 연구에서 널리 쓰이는 성격 모델이고, 이 48문항과 22가지 원형은 CORE TRAIT가 그 모델을 바탕으로 직접 만든 것으로 아직 대규모 검증 전이에요.
            결과는 나를 이해하는 참고 자료이며 진단이나 중요한 결정의 유일한 근거로 쓰지 말아 주세요.
          </p>
        </Tome>

        {/* 실천 팁 */}
        {personalized?.practicalTip && (
          <Tome label="오늘의 실천 팁" accent="gold">
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}>
              {personalized.practicalTip}
            </p>
          </Tome>
        )}

        {/* 만족도 — 이 기기에서 실제로 끝낸 검사일 때만 (미리보기·결과 링크·관리자 시뮬레이션 제외) */}
        {testId && !previewId && !isAdminSim() && (
          <Tome label="결과 평가" accent="gold">
            <ResultFeedback testId={testId} />
          </Tome>
        )}

        {/* 봉인된 챕터 — 티저 */}
        <div id="sealed-chapters" style={{ scrollMarginTop: 16,
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(200,168,75,0.25)',
          background: 'rgba(8,6,14,0.97)',
          marginBottom: 16,
          boxShadow: '0 0 40px rgba(200,168,75,0.07)',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(200,168,75,0.15)',
            background: 'linear-gradient(to bottom, rgba(200,168,75,0.07), transparent)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,168,75,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>⬡ &nbsp; CORE CAREER</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{primary.name} 원형을 위한 진로 리포트</p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.66)', marginTop: 4, lineHeight: 1.6 }}>
              지금 시기(고등학생·대학생·취준생·직장인)를 고르고 추가 질문 46~86개(약 7~12분)에 답하면 만들어지는 리포트예요.<br /><b style={{ color: 'rgba(226,192,100,0.9)' }}>아직 출시 전이라, 아래는 미리보기 예시예요.</b>
            </p>
          </div>

          <div style={{ padding: '14px 18px 18px' }}>
            {CHAPTER_TEASERS.map((item, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(200,168,75,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                {/* 챕터 헤더 — 공개 */}
                <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, color: 'rgba(200,168,75,0.6)', flexShrink: 0 }}>{item.rune}</span>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{item.title}</p>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(200,168,75,0.4)' }}>⬡</span>
                </div>
                {/* 티저 첫 줄 — 살짝 보임 */}
                <div style={{ padding: '6px 14px', position: 'relative' }}>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.74)', lineHeight: 1.65, marginBottom: 2 }}>
                    {item.teaser}
                  </p>
                  {/* 하단 fade-out blur */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'linear-gradient(transparent, rgba(8,6,14,0.92))' }} />
                </div>
                {/* blur 처리된 나머지 내용 */}
                <div style={{ padding: '0 14px 12px', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                    {'█'.repeat(18)} {'█'.repeat(12)}<br />{'█'.repeat(22)} {'█'.repeat(8)}
                  </p>
                </div>
              </div>
            ))}

            <GoldDivider style={{ marginTop: 14, marginBottom: 14 }} />

            {!unlocking ? (
              <button
                onClick={() => { setUnlocking(true); onUnlockClick('chapter') }}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #92680a, #c8a030, #92680a)',
                  color: '#1a1000', fontSize: 14, fontWeight: 800, letterSpacing: '0.03em',
                  boxShadow: '0 0 30px rgba(200,168,75,0.3)',
                }}
              >
                출시 알림 받기 →
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>진로 리포트는 출시 준비 중이에요</p>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 12 }}>
                  열리면 가장 먼저 알려드릴게요. 아래 &ldquo;내 결과 링크 복사&rdquo;로 지금 결과를 저장해 두면, 출시 후 질문을 처음부터 다시 풀지 않고 이어갈 수 있어요.
                </p>
                <WaitlistForm source="report" archetypeId={primary.id} />
              </div>
            )}
          </div>
        </div>

        {/* 공유 + 결과 링크 + 다시하기 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => shareArchetype(primary.id, primary.name, primaryDetail?.tagline)}
            style={{ flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,168,75,0.2)', color: 'rgba(200,168,75,0.8)', fontSize: 15, fontWeight: 600 }}
          >
            원형 공유하기
          </button>
          {!previewId && (
            <button
              onClick={copyMyResultLink}
              style={{ flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,168,75,0.2)', color: 'rgba(200,168,75,0.8)', fontSize: 15, fontWeight: 600 }}
            >
              내 결과 링크 복사
            </button>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 14, textAlign: 'center' }}>
          원형 공유는 원형 소개만 보여줍니다. 내 결과 링크에는 내 점수가 담겨 있으니 본인만 보관하세요.
        </p>
        {testId && (
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 14, lineHeight: 1.6 }}>
            검사 번호 <button
              onClick={async () => { await navigator.clipboard?.writeText(testId); flash('검사 번호를 복사했습니다') }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(226,192,100,0.8)', fontFamily: 'monospace', fontSize: 12.5, textDecoration: 'underline' }}
            >{testId.slice(0, 8)}</button>
            <br />저장된 내 응답의 삭제를 원하면 이 번호와 함께 <a href="/privacy" style={{ color: 'rgba(226,192,100,0.8)' }}>개인정보 처리방침</a>의 연락처로 요청해 주세요.
          </p>
        )}
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('hexaco_answers')
              sessionStorage.removeItem('pp_hexaco_completed')
              router.push('/hexaco-test?start=1')
            }}
            style={{ flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.66)', fontSize: 15, fontWeight: 600 }}
          >
            다시 검사하기
          </button>
        </div>

      </div>
    </main>
    </>
  )
}
