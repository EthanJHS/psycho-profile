'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { scoreHexaco, HexacoResult, HexacoFactor } from '@/lib/scoring-hexaco'
import { personalizeResult, PersonalizedResult } from '@/lib/personalize-result'
import { CONTENT, PATHS, STORAGE, type Lang } from '@/lib/i18n'
import { COMPARE_PENDING_KEY, decodeCompareCode, encodeCompareCode } from '@/lib/compare'
import Link from 'next/link'
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

const KO = {
  flashShare: '공유 링크를 복사했습니다',
  flashNoLink: '결과 링크를 만들 수 없습니다',
  flashLink: '내 결과 링크를 복사했습니다 — 이 링크로 언제든 다시 볼 수 있어요',
  flashTestNo: '검사 번호를 복사했습니다',
  shareTitle: (name: string) => `나는 ${name}`,
  defaultTrait: '나만의 방식',
  // 한국어판은 CORE CAREER(진로 리포트) 미리보기
  teasers: (name: string, trait: string, shadow?: string) => [
    { rune: '⚔', title: '탐색 — 나에게 맞는 길', teaser: `${w(name, '은/는')} 성격에 흥미와 가치를 더하면, 가장 잘 맞는 직무와 계열 TOP 5가 달라집니다. 1순위는…` },
    { rune: '✦', title: '향상 — 지금 자리에서 더 잘', teaser: `${w(trait, '을/를')} 무기로 가진 당신에게 맞는 공부법·일하는 방식은 따로 있습니다. 가장 먼저 바꿀 것은…` },
    { rune: '♡', title: '관계 패턴', teaser: `가까워질수록 드러나는 ${name}의 관계 패턴이 있습니다. 가까운 사람일수록 당신은…` },
    { rune: '◎', title: '스트레스와 회복', teaser: shadow ? shadow.slice(0, 28) + '…' : `${name}의 그림자는 스트레스 상황에서 가장 선명하게 드러납니다.` },
  ],
  stickyLine: (name: string) => `⬡ ${name} 원형을 위한 진로 리포트 · 출시 예정`,
  stickyCta: '진로 리포트 출시 알림 받기',
  backToHero: '← 원형 이미지로 돌아가기',
  interpTitle: '원형 해석',
  dailyLabel: (name: string) => `${name}의 흔한 하루`,
  light: '빛의 면',
  shadow: '그림자의 면',
  whyTitle: '왜 이 원형인가요?',
  distinguishing: '나를 구분하는 특징',
  secondaryTitle: '부가 성향',
  factorsTitle: 'HEXACO 요인 프로파일',
  scoreNote: '점수는 요인별 8문항 응답의 평균(1~5)이에요. 3이 중간이고, 다른 사람과 비교한 순위(백분위)는 아니에요. HEXACO는 학술 연구에서 널리 쓰이는 성격 모델이고, 이 48문항과 22가지 원형은 CORE TRAIT가 그 모델을 바탕으로 직접 만든 것으로 아직 대규모 검증 전이에요. 결과는 나를 이해하는 참고 자료이며 진단이나 중요한 결정의 유일한 근거로 쓰지 말아 주세요.',
  tipTitle: '오늘의 실천 팁',
  feedbackTitle: '결과 평가',
  sealedEyebrow: 'CORE CAREER',
  sealedTitle: (name: string) => `${name} 원형을 위한 진로 리포트`,
  sealedDesc: <>지금 시기(고등학생·대학생·취준생·직장인)를 고르고 추가 질문 46~86개(약 7~12분)에 답하면 만들어지는 리포트예요.<br /><b style={{ color: 'rgba(226,192,100,0.9)' }}>아직 출시 전이라, 아래는 미리보기 예시예요.</b></>,
  notifyCta: '출시 알림 받기 →',
  preparingTitle: '진로 리포트는 출시 준비 중이에요',
  preparingBody: '열리면 가장 먼저 알려드릴게요. 아래 “내 결과 링크 복사”로 지금 결과를 저장해 두면, 출시 후 질문을 처음부터 다시 풀지 않고 이어갈 수 있어요.',
  share: '원형 공유하기',
  saveCard: '이미지로 저장 (스토리용)',
  compare: '친구와 비교하기',
  flashCompare: '비교 링크를 복사했습니다 — 친구에게 보내 보세요',
  compareNote: '비교 링크에는 내 원형과 6요인 점수만 담겨요. 친구가 검사하면 두 사람의 결과를 나란히 볼 수 있어요.',
  pendingCompare: '친구가 보낸 비교가 기다리고 있어요',
  pendingCompareCta: '비교 결과 보기 →',
  flashCardSaved: '카드 이미지를 저장했습니다',
  flashCardFail: '이미지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요',
  copyLink: '내 결과 링크 복사',
  shareNote: '원형 공유는 원형 소개만 보여줍니다. 내 결과 링크에는 내 점수가 담겨 있으니 본인만 보관하세요.',
  testNo: '검사 번호',
  deleteNote: (privacy: React.ReactNode) => <>저장된 내 응답의 삭제를 원하면 이 번호와 함께 {privacy}의 연락처로 요청해 주세요.</>,
  privacy: '개인정보 처리방침',
  retake: '다시 검사하기',
}

// 영어: 원형 이름("The Sage")을 문장 중간에 쓸 때는 소문자 the, 이름만 쓸 때는 The를 뗌
const mid = (name: string) => name.replace(/^The /, 'the ')
const bare = (name: string) => name.replace(/^The /, '')
// 미리보기 문장은 단어 중간에서 자르지 않음
const clip = (text: string, max: number) => (text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max)) + '…')

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    flashShare: 'Share link copied',
    flashNoLink: 'Couldn’t create your result link',
    flashLink: 'Your result link is copied — use it to come back anytime',
    flashTestNo: 'Test ID copied',
    shareTitle: (name: string) => `I got ${name}. What are you?`,
    defaultTrait: 'your own way of doing things',
    // 영어판은 진로 리포트(한국 입시·취업 맥락) 대신 원형 심화 리포트 출시 알림
    teasers: (name: string, trait: string, shadow?: string) => [
      { rune: '♡', title: 'Relationships', teaser: `There’s a pattern ${mid(name)} shows only as people get closer. With the people you’re closest to, you tend to…` },
      { rune: '◎', title: 'Stress and recovery', teaser: shadow ? clip(shadow, 60) : `${name}’s shadow shows most clearly under stress.` },
      { rune: '⚔', title: 'Strengths at work', teaser: `With ${trait.toLowerCase()} as your edge, there’s a way of working that fits you best. The first thing to change is…` },
      { rune: '✦', title: 'Your growth path', teaser: `Every archetype has a next step. For ${mid(name)}, it starts with…` },
    ],
    stickyLine: (name: string) => `⬡ Your full ${bare(name)} report · Coming soon`,
    stickyCta: 'Get notified at launch',
    backToHero: '← Back to your archetype card',
    interpTitle: 'Your archetype',
    dailyLabel: (name: string) => `A typical day for ${mid(name)}`,
    light: 'Light side',
    shadow: 'Shadow side',
    whyTitle: 'Why this archetype?',
    distinguishing: 'What sets you apart',
    secondaryTitle: 'Secondary tendency',
    factorsTitle: 'HEXACO factor profile',
    scoreNote: 'Each score is the average (1–5) of your answers to that factor’s 8 questions. 3 is the midpoint — it isn’t a ranking against other people (percentile). HEXACO is a personality model widely used in academic research; these 48 questions and 22 archetypes were created by CORE TRAIT based on that model and haven’t been validated at scale yet. Use your result as a way to understand yourself, not as a diagnosis or the only basis for an important decision.',
    tipTitle: 'Try this today',
    feedbackTitle: 'Rate your result',
    sealedEyebrow: 'FULL REPORT',
    sealedTitle: (name: string) => `Your full ${bare(name)} report`,
    sealedDesc: <>A deeper report on your relationships, stress, strengths, and growth.<br /><b style={{ color: 'rgba(226,192,100,0.9)' }}>It isn’t out yet — below is a preview.</b></>,
    notifyCta: 'Get notified at launch →',
    preparingTitle: 'The full report is on its way',
    preparingBody: 'We’ll let you know as soon as it’s ready. Save your result with “Copy my result link” below so you won’t need to retake the test.',
    share: 'Share my archetype',
    saveCard: 'Save as image (for Stories)',
    compare: 'Compare with a friend',
    flashCompare: 'Comparison link copied — send it to a friend',
    compareNote: 'The comparison link includes only your archetype and six factor scores. Once your friend takes the test, you’ll see both results side by side.',
    pendingCompare: 'Your friend’s comparison is waiting',
    pendingCompareCta: 'See the comparison →',
    flashCardSaved: 'Card image saved',
    flashCardFail: 'Couldn’t load the image. Please try again in a moment',
    copyLink: 'Copy my result link',
    shareNote: 'Sharing shows only your archetype’s description. Your result link includes your scores, so keep it to yourself.',
    testNo: 'Test ID',
    deleteNote: (privacy: React.ReactNode) => <>To have your saved answers deleted, send us this ID using the contact in our {privacy}.</>,
    privacy: 'Privacy Policy',
    retake: 'Take the test again',
  },
}

const FACTORS: HexacoFactor[] = ['H', 'E', 'X', 'A', 'C', 'O']

// 결과 리포트 — 한국어(/hexaco-result/report)·영어(/en/result/report) 공용
export default function ReportBody({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(200,168,75,0.2)', borderTopColor: 'rgba(200,168,75,0.7)', animation: 'spin 0.8s linear infinite' }} />
      </main>
    }>
      <HexacoReportInner lang={lang} />
    </Suspense>
  )
}

function HexacoReportInner({ lang }: { lang: Lang }) {
  const t = T[lang]
  const { archetypes: ARCHETYPE_DETAILS, personalize: texts } = CONTENT[lang]
  const paths = PATHS[lang]
  const answersKey = STORAGE[lang].answers
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewId = searchParams.get('preview')
  const [result, setResult] = useState<HexacoResult | null>(null)
  const [personalized, setPersonalized] = useState<PersonalizedResult | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [chaptersVisible, setChaptersVisible] = useState(false)
  const [toast, setToast] = useState('')
  const [testId, setTestId] = useState<string | null>(null)
  const [pendingCompare, setPendingCompare] = useState<string | null>(null)
  const restoreCode = searchParams.get('r')

  // 친구의 비교 링크로 들어와 검사를 마친 경우 — 비교 화면으로 돌아갈 길을 맨 위에 안내
  useEffect(() => {
    if (previewId) return
    try {
      const code = sessionStorage.getItem(COMPARE_PENDING_KEY)
      if (decodeCompareCode(code)) setPendingCompare(code)
    } catch { /* 저장 공간 없음 */ }
  }, [previewId])

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
        secondary: { id: 'sage', name: ARCHETYPE_DETAILS.sage.name, profile: { H:0,E:0,X:0,A:0,C:0,O:0 }, note: '' },
        primaryDistance: 0, secondaryDistance: 0,
        scores: { raw: { H:3.5,E:3.0,X:3.2,A:3.4,C:3.6,O:3.8 }, direction: { H:1,E:0,X:0,A:1,C:1,O:1 } },
      }
      setResult(mockResult)
      setPersonalized(personalizeResult(mockResult, texts))
      return
    }
    // 결과 링크(?r=)로 들어오면 링크에 담긴 응답으로 복원 (DB 저장·집계 없음)
    const restored = restoreCode ? decodeHexacoAnswers(restoreCode) : null
    if (restoreCode && !restored) { router.replace(paths.test); return }
    const raw = restored ? JSON.stringify(restored) : sessionStorage.getItem(answersKey)
    if (!raw) { router.replace(paths.test); return }
    try {
      const answers = JSON.parse(raw) as Record<string, number>
      if (restored) sessionStorage.setItem(answersKey, raw)
      const r = scoreHexaco(answers)
      setResult(r)
      setPersonalized(personalizeResult(r, texts))
      if (!restored) trackHexaco('hexaco_report_view', { archetype_primary: r.primary.id }).catch(() => {})
    } catch {
      router.replace(paths.test)
    }
  }, [router, previewId, restoreCode, ARCHETYPE_DETAILS, texts, paths, answersKey])

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
    const url = `${window.location.origin}${paths.share(id)}`
    if (navigator.share) {
      try { await navigator.share({ title: t.shareTitle(name), text: tagline ?? name, url }) } catch { /* 사용자가 공유 창을 닫음 */ }
    } else {
      await navigator.clipboard?.writeText(url)
      flash(t.flashShare)
    }
  }

  // 스토리용 세로 카드 — 휴대폰에서는 공유 창(사진 저장·인스타 등), PC에서는 파일로 내려받기
  async function saveCard(id: string, name: string) {
    if (!previewId) trackHexaco('hexaco_card_save', { archetype_primary: id }).catch(() => {})
    try {
      const res = await fetch(`/archetypes/story/${lang}/${id}.jpg`)
      if (!res.ok) throw new Error(String(res.status))
      const blob = await res.blob()
      const file = new File([blob], `core-trait-${id}.jpg`, { type: 'image/jpeg' })
      const touch = window.matchMedia('(pointer: coarse)').matches
      if (touch && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: t.shareTitle(name) }) } catch { /* 사용자가 공유 창을 닫음 */ }
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = file.name
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      flash(t.flashCardSaved)
    } catch {
      flash(t.flashCardFail)
    }
  }

  // 친구와 비교하기 — 원형과 6요인 점수만 담은 링크 (응답 전체는 넣지 않음)
  async function shareCompareLink(name: string) {
    const code = result ? encodeCompareCode(result) : null
    if (!code) { flash(t.flashNoLink); return }
    if (!previewId) trackHexaco('hexaco_compare_create', { archetype_primary: result!.primary.id }).catch(() => {})
    const url = `${window.location.origin}${paths.compare}?f=${code}`
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: t.shareTitle(name), text: t.shareTitle(name), url }) } catch { /* 사용자가 공유 창을 닫음 */ }
      return
    }
    try { await navigator.clipboard.writeText(url) } catch { window.prompt(t.compare, url); return }
    flash(t.flashCompare)
  }

  async function copyMyResultLink() {
    const raw = sessionStorage.getItem(answersKey)
    const code = raw ? encodeHexacoAnswers(JSON.parse(raw)) : null
    if (!code) { flash(t.flashNoLink); return }
    await navigator.clipboard?.writeText(`${window.location.origin}${paths.report}?r=${code}`)
    flash(t.flashLink)
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
  const factors = FACTORS
  const primaryDetail = ARCHETYPE_DETAILS[primary.id]
  const secondaryDetail = ARCHETYPE_DETAILS[secondary.id]
  // 화면에 보이는 이름은 언어별 콘텐츠에서 (채점 모듈의 이름은 한국어)
  const primaryName = primaryDetail?.name ?? primary.name
  const secondaryName = secondaryDetail?.name ?? secondary.name
  const previewSuffix = previewId ? `?preview=${previewId}` : ''

  // 리포트 맛보기 — 원형 맞춤 첫 줄만 공개, 나머지 blur (한국어: 진로 리포트, 영어: 원형 심화 리포트)
  const CHAPTER_TEASERS = t.teasers(primaryName, primaryDetail?.traits?.[0] ?? t.defaultTrait, primaryDetail?.shadow)

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
          {t.stickyLine(primaryName)}
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
          {t.stickyCta}
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
          onClick={() => router.push(paths.result + (previewSuffix || (restoreCode ? `?r=${restoreCode}` : '')))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,168,75,0.6)', fontSize: 13.5, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {t.backToHero}
        </button>

        {pendingCompare && (
          <Link href={`${paths.compare}?f=${pendingCompare}`} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, marginBottom: 16, textDecoration: 'none',
            background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(226,192,100,0.55)',
          }}>
            <span style={{ fontSize: 14, color: '#efe6d2' }}>{t.pendingCompare}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#e2c064', flexShrink: 0 }}>{t.pendingCompareCta}</span>
          </Link>
        )}

        {/* 카드 이미지 + 텍스트 */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,168,75,0.2)', marginBottom: 20 }}>
          <div style={{ height: 220, overflow: 'hidden' }}>
            <img
              src={`/archetypes/w/${primary.id}.webp`}
              alt={primaryName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,6,14,0.2) 0%, transparent 40%, rgba(8,6,14,0.92) 100%)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>ARCHETYPE REPORT</p>
            {personalized?.subLabel && (
              <p style={{ fontSize: 12.5, color: 'rgba(200,168,75,0.6)', marginBottom: 2, fontStyle: 'italic' }}>{personalized.subLabel}</p>
            )}
            <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 3 }}>{primaryName}</p>
            {lang === 'ko' && primaryDetail?.nameEn && (
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,168,75,0.5)', letterSpacing: '0.18em' }}>{primaryDetail.nameEn}</p>
            )}
          </div>
        </div>

        <GoldDivider style={{ marginBottom: 20 }} />
      </div>

      {/* 보고서 본문 */}
      <div className="w-full px-4" style={{ maxWidth: 480 }}>

        {/* 원형 해석 */}
        <Tome label={t.interpTitle} accent="violet">
          {primaryDetail?.daily && (
            <div style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 5 }}>{t.dailyLabel(primaryName)}</p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontStyle: 'italic' }}>{primaryDetail.daily}</p>
            </div>
          )}
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 14 }}>
            {primaryDetail?.shortDesc ?? primary.note}
          </p>
          {primaryDetail?.light && (
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(167,139,250,0.7)', letterSpacing: '0.1em', marginBottom: 5 }}>{t.light}</p>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{primaryDetail.light}</p>
            </div>
          )}
          {primaryDetail?.shadow && (
            <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(239,68,68,0.6)', letterSpacing: '0.1em', marginBottom: 5 }}>{t.shadow}</p>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.74)', lineHeight: 1.65 }}>{primaryDetail.shadow}</p>
              {personalized?.shadowNote && (
                <p style={{ fontSize: 12.5, color: 'rgba(200,168,75,0.55)', lineHeight: 1.6, marginTop: 8, fontStyle: 'italic', borderTop: '1px solid rgba(239,68,68,0.12)', paddingTop: 8 }}>{personalized.shadowNote}</p>
              )}
            </div>
          )}
        </Tome>

        {/* 왜 이 원형인가 + 구분하는 특징 */}
        {personalized && (
          <Tome label={t.whyTitle} accent="gold">
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 14 }}>
              {personalized.whyText}
            </p>
            {personalized.distinguishingTraits.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,168,75,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>{t.distinguishing}</p>
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
        <Tome label={t.secondaryTitle} accent="gold">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{secondaryName}</p>
            {lang === 'ko' && secondaryDetail?.nameEn && (
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
        <Tome label={t.factorsTitle} accent="gold">
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
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.86)', fontWeight: 600 }}>{texts.factorLabel[f]}</span>
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
            {t.scoreNote}
          </p>
        </Tome>

        {/* 실천 팁 */}
        {personalized?.practicalTip && (
          <Tome label={t.tipTitle} accent="gold">
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}>
              {personalized.practicalTip}
            </p>
          </Tome>
        )}

        {/* 만족도 — 이 기기에서 실제로 끝낸 검사일 때만 (미리보기·결과 링크·관리자 시뮬레이션 제외) */}
        {testId && !previewId && !isAdminSim() && (
          <Tome label={t.feedbackTitle} accent="gold">
            <ResultFeedback testId={testId} lang={lang} />
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
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,168,75,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>⬡ &nbsp; {t.sealedEyebrow}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{t.sealedTitle(primaryName)}</p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.66)', marginTop: 4, lineHeight: 1.6 }}>
              {t.sealedDesc}
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
                {t.notifyCta}
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>{t.preparingTitle}</p>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 12 }}>
                  {t.preparingBody}
                </p>
                <WaitlistForm source="report" archetypeId={primary.id} lang={lang} />
              </div>
            )}
          </div>
        </div>

        {/* 공유 + 결과 링크 + 다시하기 */}
        {!previewId && (
          <>
            <button
              onClick={() => shareCompareLink(primaryName)}
              style={{ width: '100%', padding: '15px', borderRadius: 12, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206', fontSize: 15.5, fontWeight: 800 }}
            >
              {t.compare}
            </button>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '8px 2px 14px', textAlign: 'center' }}>{t.compareNote}</p>
          </>
        )}
        <button
          onClick={() => saveCard(primary.id, primaryName)}
          style={{ width: '100%', padding: '14px', borderRadius: 12, cursor: 'pointer', marginBottom: 10, background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.45)', color: '#e2c064', fontSize: 15, fontWeight: 700 }}
        >
          {t.saveCard}
        </button>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => shareArchetype(primary.id, primaryName, primaryDetail?.tagline)}
            style={{ flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,168,75,0.2)', color: 'rgba(200,168,75,0.8)', fontSize: 15, fontWeight: 600 }}
          >
            {t.share}
          </button>
          {!previewId && (
            <button
              onClick={copyMyResultLink}
              style={{ flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,168,75,0.2)', color: 'rgba(200,168,75,0.8)', fontSize: 15, fontWeight: 600 }}
            >
              {t.copyLink}
            </button>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 14, textAlign: 'center' }}>
          {t.shareNote}
        </p>
        {testId && (
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 14, lineHeight: 1.6 }}>
            {t.testNo} <button
              onClick={async () => { await navigator.clipboard?.writeText(testId); flash(t.flashTestNo) }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(226,192,100,0.8)', fontFamily: 'monospace', fontSize: 12.5, textDecoration: 'underline' }}
            >{testId.slice(0, 8)}</button>
            <br />{t.deleteNote(<a href={paths.privacy} style={{ color: 'rgba(226,192,100,0.8)' }}>{t.privacy}</a>)}
          </p>
        )}
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => {
              sessionStorage.removeItem(answersKey)
              sessionStorage.removeItem(STORAGE[lang].completed)
              router.push(paths.test + '?start=1')
            }}
            style={{ flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.66)', fontSize: 15, fontWeight: 600 }}
          >
            {t.retake}
          </button>
        </div>

      </div>
    </main>
    </>
  )
}
