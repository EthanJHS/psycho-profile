'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { HexacoQuestion } from '@/lib/questions-hexaco'
import { initSession, startTestSession, sendAbandonBeacon, ADMIN_SIM_KEY } from '@/lib/analytics'
import { loadConsent, saveConsent, type TestConsent } from '@/lib/consent'
import { CONTENT, HEXACO_VERSION_BY_LANG, PATHS, STORAGE, type Lang } from '@/lib/i18n'
import ConsentSheet from '@/components/ConsentSheet'

// 무료 검사 화면 — 한국어(/hexaco-test)·영어(/en/test) 공용. 문항·문구·저장 키만 언어별
const TOTAL = CONTENT.ko.questions.length

interface SavedProgress { tsid: string; order: string[]; answers: Record<string, number>; current: number }

function loadProgress(lang: Lang): { order: HexacoQuestion[]; answers: Record<string, number>; current: number } | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE[lang].progress) ?? 'null') as SavedProgress | null
    if (!saved || saved.tsid !== sessionStorage.getItem('pp_test_session_id')) return null
    const byId = new Map(CONTENT[lang].questions.map(q => [q.id, q]))
    const order = saved.order.map(id => byId.get(id))
    if (order.length !== TOTAL || order.some(q => !q)) return null
    return { order: order as HexacoQuestion[], answers: saved.answers, current: Math.min(saved.current, TOTAL - 1) }
  } catch { return null }
}

const KO = {
  milestones: { 24: '절반 왔어요. 지금 페이스 그대로 가면 됩니다.', 40: '거의 다 왔어요. 8문항 남았습니다.' } as Record<number, string>,
  timeLeft: (mins: number) => `남은 시간 약 ${mins}분 (예상)`,
  headline: <>당신 안에 잠든<br />원형이 깨어납니다</>,
  sub: <>당신의 성격에는 가장 선명하게 드러나는<br />하나의 원형이 있습니다.<br />48개의 질문이 당신 안에서 반복되는<br />성격 패턴의 윤곽을 드러냅니다.</>,
  more: '+12가지',
  meta: [{ value: `${TOTAL}문항`, label: '질문' }, { value: '약 8분', label: '소요 시간' }, { value: '22가지', label: '원형' }],
  guide: ['너무 오래 고민하지 말고, 평소의 나와 가장 가까운 답을 골라주세요.', '사회적으로 바람직한 답이 아닌, 실제 당신의 모습을 선택하세요.', '결과는 당신의 우열을 가리지 않습니다.'],
  cta: '원형 깨우기 →',
  ctaNote: '무료 · 로그인 불필요 · 약 8분',
  answeredAll: (n: number) => `${n}문항을 모두 답했어요`,
  reviewBody: <>바꾸고 싶은 답이 있다면 돌아가서 고칠 수 있어요.<br />괜찮다면 결과를 확인해 보세요.</>,
  seeResult: '결과 보기 →',
  reviewLast: '← 마지막 문항부터 다시 보기',
  reviewHint: '이전 문항으로는 "← 이전" 버튼으로 계속 돌아갈 수 있어요.',
  preparing: '준비 중...',
  firstHint: '평소의 나와 가장 가까운 답을 고르세요. 정답은 없고, 선택하면 바로 다음으로 넘어갑니다.',
  resumed: '풀던 곳부터 이어서 진행합니다.',
  restart: '처음부터',
  situation: '상황',
  back: '← 이전',
  finish: '완료 →',
  next: '다음 →',
  keysDesktop: '선택하면 자동으로 넘어갑니다 · 숫자키 1~5로도 선택 · ← 이전은 Backspace',
  keysMobile: '선택하면 자동으로 다음 문항으로 이동합니다',
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    milestones: { 24: 'Halfway there. Keep the same pace.', 40: 'Almost done — just 8 to go.' },
    timeLeft: (mins: number) => `About ${mins} min left`,
    headline: <>The archetype asleep<br />inside you is waking up</>,
    sub: <>Your personality has one archetype<br />that shows through most clearly.<br />48 questions trace the outline<br />of the patterns you repeat.</>,
    more: '+12 more',
    meta: [{ value: `${TOTAL}`, label: 'Questions' }, { value: '~8 min', label: 'Time' }, { value: '22', label: 'Archetypes' }],
    guide: ['Don’t overthink it — pick the answer closest to how you usually are.', 'Choose what’s actually true for you, not what sounds best.', 'No archetype is better or worse than another.'],
    cta: 'Wake your archetype →',
    ctaNote: 'Free · No sign-up · About 8 minutes',
    answeredAll: (n: number) => `You’ve answered all ${n} questions`,
    reviewBody: <>If you want to change an answer, you can go back and fix it.<br />Otherwise, go ahead and see your result.</>,
    seeResult: 'See my result →',
    reviewLast: '← Review from the last question',
    reviewHint: 'You can keep going back with the “← Back” button.',
    preparing: 'Getting ready...',
    firstHint: 'Pick the answer closest to how you usually are. There are no right answers, and you’ll move on as soon as you choose.',
    resumed: 'Picking up where you left off.',
    restart: 'Start over',
    situation: 'Situation',
    back: '← Back',
    finish: 'Finish →',
    next: 'Next →',
    keysDesktop: 'Moves on automatically · Keys 1–5 also work · Backspace to go back',
    keysMobile: 'You’ll move to the next question as soon as you choose',
  },
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ARCHETYPE_PREVIEWS = [
  { id: 'guardian', color: '#b45309' },
  { id: 'strategist', color: '#6b7280' },
  { id: 'visionary', color: '#3b82f6' },
  { id: 'charmer', color: '#db7093' },
  { id: 'dreamer', color: '#a78bfa' },
  { id: 'conqueror', color: '#10b981' },
  { id: 'cynic', color: '#c8a030' },
  { id: 'passionate', color: '#ef4444' },
  { id: 'explorer', color: '#14b8a6' },
  { id: 'sage', color: '#e5e7eb' },
]

type Phase = 'intro' | 'consent' | 'test'

export default function TestFlow({ lang }: { lang: Lang }) {
  const t = T[lang]
  const { questions: QUESTIONS, likert: LIKERT_OPTIONS, archetypes } = CONTENT[lang]
  const PROGRESS_KEY = STORAGE[lang].progress
  const COMPLETED_KEY = STORAGE[lang].completed
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [answerMap, setAnswerMap] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [ready, setReady] = useState(false)
  const [resumed, setResumed] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [fromHome, setFromHome] = useState(false)
  const mounted = useRef(false)
  const advancingRef = useRef(false)

  // 문항 순서는 검사 1회 동안 고정 (이어하기 시 저장된 순서 복원)
  const [shuffledQuestions, setShuffledQuestions] = useState<HexacoQuestion[]>(() => shuffle([...QUESTIONS]))

  const q = shuffledQuestions[current]
  const isLast = current === TOTAL - 1
  const progress = ((current + 1) / TOTAL) * 100
  const remaining = TOTAL - current

  useEffect(() => {
    if (phase !== 'test') return
    function onKey(e: KeyboardEvent) {
      if (animating) return
      // 포커스된 선택지·버튼은 Enter/Space를 브라우저 기본 동작(클릭)으로 처리
      const active = document.activeElement
      if (active instanceof HTMLButtonElement && (e.key === 'Enter' || e.key === ' ')) return
      if (['1', '2', '3', '4', '5'].includes(e.key)) handleSelect(Number(e.key))
      if (e.key === 'Enter' && selected !== null) handleNext()
      if (e.key === 'Backspace' && current > 0) handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current, selected, animating])

  useEffect(() => {
    if (phase !== 'test') return
    const handleUnload = () => {
      if (!sessionStorage.getItem(COMPLETED_KEY)) {
        sendAbandonBeacon(current, TOTAL, 'free')
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current])

  // 검사 시작: 이때 처음으로 test_start를 기록 (소개 화면만 보고 나간 방문은 제외)
  // 동의 없이는 시작하지 않음 — 이번 탭에서 이미 동의했다면 그 동의를 그대로 사용
  const begin = useCallback(async (given?: TestConsent) => {
    const consent = given ?? loadConsent(lang)
    if (!consent) { setPhase('consent'); return }
    if (given) saveConsent(given, lang)
    setPhase('test')
    sessionStorage.removeItem(COMPLETED_KEY)
    sessionStorage.removeItem(PROGRESS_KEY)
    await startTestSession(HEXACO_VERSION_BY_LANG[lang], consent)
    setReady(true)
  }, [lang, COMPLETED_KEY, PROGRESS_KEY])

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    sessionStorage.removeItem(ADMIN_SIM_KEY)
    // 영어판은 EU 기준에 맞춰 동의 전에는 방문 기록을 남기지 않음 (동의 후 startTestSession에서 기록)
    if (lang === 'ko') initSession().catch(() => {})
    const saved = loadProgress(lang)
    if (saved) {
      setShuffledQuestions(saved.order)
      setAnswerMap(saved.answers)
      setCurrent(saved.current)
      setSelected(saved.answers[saved.order[saved.current].id] ?? null)
      setResumed(saved.current > 0)
      setPhase('test')
      setReady(true)
    } else if (new URLSearchParams(window.location.search).get('start') === '1') {
      setFromHome(true)
      begin()
    }
  }, [begin, lang])

  // 답할 때마다 진행 상황 저장 → 새로고침·뒤로가기 후에도 이어서 진행
  useEffect(() => {
    if (phase !== 'test' || !ready) return
    const tsid = sessionStorage.getItem('pp_test_session_id')
    if (!tsid || sessionStorage.getItem(COMPLETED_KEY)) return
    const data: SavedProgress = { tsid, order: shuffledQuestions.map(q => q.id), answers: answerMap, current }
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
  }, [phase, ready, shuffledQuestions, answerMap, current, PROGRESS_KEY, COMPLETED_KEY])

  function restart() {
    setShuffledQuestions(shuffle([...QUESTIONS]))
    setAnswerMap({})
    setCurrent(0)
    setSelected(null)
    setResumed(false)
    setReady(false)
    begin()
  }

  function handleBack() {
    if (current === 0 || animating) return
    setAnimating(true)
    setTimeout(() => {
      const prev = current - 1
      setCurrent(prev)
      setSelected(answerMap[shuffledQuestions[prev].id] ?? null)
      setAnimating(false)
    }, 150)
  }

  const advance = useCallback(async (val: number | null, cur: number, map: Record<string, number>) => {
    advancingRef.current = false
    if (val === null) return
    const qId = shuffledQuestions[cur].id
    const newMap = { ...map, [qId]: val }
    setAnswerMap(newMap)
    setResumed(false)
    setAnimating(true)
    setTimeout(async () => {
      setSelected(null)
      setAnimating(false)
      if (cur === TOTAL - 1) {
        // 마지막 문항 뒤 바로 제출하지 않고 확인 단계 — 답을 되돌아볼 기회
        setReviewing(true)
      } else {
        const next = cur + 1
        setCurrent(next)
        setSelected(newMap[shuffledQuestions[next].id] ?? null)
      }
    }, 180)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, shuffledQuestions])

  async function handleNext() {
    if (selected === null || animating || advancingRef.current) return
    await advance(selected, current, answerMap)
  }

  // 선택 즉시 선택 상태를 보여준 뒤 자동으로 다음 문항 (터치·마우스·키보드 공통)
  const handleSelect = useCallback((val: number) => {
    if (animating || advancingRef.current) return
    setSelected(val)
    advancingRef.current = true
    setTimeout(() => advance(val, current, answerMap), 280)
  }, [animating, advance, current, answerMap])

  // ── 인트로 ────────────────────────────────────────────────────────────────────
  if (phase === 'consent') {
    return <ConsentSheet lang={lang} onAgree={c => begin(c)} />
  }

  if (phase === 'intro') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5" style={{ paddingBottom: 64, paddingTop: 48 }}>
        <div className="w-full max-w-md">

          {/* 아이콘 */}
          <div className="flex justify-center mb-6">
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,160,48,0.3), rgba(200,160,48,0.05))',
              border: '1px solid rgba(200,160,48,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>✦</div>
          </div>

          {/* 헤드라인 */}
          <p className="text-center text-xs font-bold mb-3" style={{ color: 'rgba(200,160,48,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            CORE TRAIT
          </p>
          <h1 className="text-center font-extrabold mb-4" style={{
            fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            {t.headline}
          </h1>

          {/* 서브 카피 */}
          <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
            {t.sub}
          </p>

          {/* 원형 미리보기 */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ARCHETYPE_PREVIEWS.map(({ id, color }) => (
              <span key={id} style={{
                fontSize: 12.5, fontWeight: 600,
                padding: '4px 12px', borderRadius: 99,
                background: 'rgba(255,255,255,0.04)',
                color: color,
                border: `1px solid ${color}33`,
              }}>
                {archetypes[id].name.replace(/^The /, '')}
              </span>
            ))}
            <span style={{
              fontSize: 12.5, fontWeight: 600,
              padding: '4px 12px', borderRadius: 99,
              background: 'rgba(200,160,48,0.1)',
              color: 'rgba(200,160,48,0.8)',
              border: '1px solid rgba(200,160,48,0.25)',
            }}>{t.more}</span>
          </div>

          {/* 메타 */}
          <div className="flex justify-center gap-8 mb-8">
            {t.meta.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,160,48,0.3), transparent)', marginBottom: 24 }} />

          {/* 안내 */}
          <div className="mb-8 space-y-3">
            {t.guide.map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span style={{ color: 'rgba(200,160,48,0.6)', fontSize: 13.5, marginTop: 2, flexShrink: 0 }}>✦</span>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => begin()}
            style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)',
              color: '#1a1206', fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
              boxShadow: '0 0 40px rgba(200,160,48,0.35)',
            }}
          >
            {t.cta}
          </button>

          <p className="text-center mt-4" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)' }}>
            {t.ctaNote}
          </p>
        </div>
      </main>
    )
  }

  // ── 제출 전 확인 ────────────────────────────────────────────────────────────
  if (reviewing) {
    const answered = Object.keys(answerMap).length
    const submit = () => {
      sessionStorage.setItem(STORAGE[lang].answers, JSON.stringify(answerMap))
      sessionStorage.setItem(COMPLETED_KEY, '1')
      sessionStorage.removeItem(PROGRESS_KEY)
      router.push(PATHS[lang].result)
    }
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="w-full max-w-md" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#c8a030', letterSpacing: '0.2em', marginBottom: 10 }}>ALL DONE</p>
          <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 26, fontWeight: 700, color: '#efe6d2', marginBottom: 10 }}>
            {t.answeredAll(answered)}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(239,230,210,0.7)', lineHeight: 1.7, marginBottom: 28 }}>
            {t.reviewBody}
          </p>
          <button onClick={submit} style={{
            width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 800,
            background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206', marginBottom: 10,
          }}>{t.seeResult}</button>
          <button onClick={() => { setReviewing(false); setSelected(answerMap[shuffledQuestions[TOTAL - 1].id] ?? null) }} style={{
            width: '100%', padding: 14, borderRadius: 14, cursor: 'pointer', fontSize: 14.5,
            background: 'transparent', border: '1px solid rgba(200,160,48,0.3)', color: 'rgba(239,230,210,0.8)',
          }}>{t.reviewLast}</button>
          <p style={{ fontSize: 13, color: 'rgba(239,230,210,0.5)', marginTop: 14 }}>{t.reviewHint}</p>
        </div>
      </main>
    )
  }

  // ── 로딩 ──────────────────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(200,160,48,0.2)',
          borderTopColor: '#c8a030',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{t.preparing}</p>
      </main>
    )
  }

  const [context, statement] = q.text.includes('\n')
    ? q.text.split('\n')
    : [null, q.text]

  // ── 문항 화면 ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 40 }}>

      {/* 진행 바 */}
      <div className="w-full max-w-lg pt-5 pb-4">
        <div className="flex justify-between items-center mb-2.5">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{current + 1}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>/ {TOTAL}</span>
          </div>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>{t.timeLeft(Math.ceil(remaining * 10 / 60))}</span>
        </div>
        <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #a8781f, #e2c064)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 8px rgba(200,160,48,0.5)',
          }} />
        </div>
      </div>

      {/* 안내·이어하기·격려 (한 번에 하나만) */}
      {(() => {
        const note = resumed && current > 0
          ? null
          : t.milestones[current] ?? (current === 0 && fromHome ? t.firstHint : null)
        if (resumed && current > 0) {
          return (
            <div role="status" className="w-full max-w-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(200,160,48,0.08)', border: '1px solid rgba(200,160,48,0.2)' }}>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)' }}>{t.resumed}</p>
              <button onClick={restart} style={{ fontSize: 13.5, color: 'rgba(226,192,100,0.9)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}>{t.restart}</button>
            </div>
          )
        }
        return note ? (
          <p role="status" className="w-full max-w-lg" style={{ fontSize: 13.5, color: 'rgba(200,168,75,0.8)', marginBottom: 10, textAlign: 'center' }}>{note}</p>
        ) : null
      })()}

      {/* 문항 카드 */}
      <div
        className="w-full max-w-lg"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '28px 24px 24px',
          opacity: animating ? 0 : 1,
          transition: 'opacity 0.18s ease',
        }}
      >
        {/* 시나리오 상황 */}
        {context && (
          <div style={{
            background: 'rgba(200,160,48,0.07)',
            border: '1px solid rgba(200,160,48,0.15)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.66)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{t.situation}</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{context}</p>
          </div>
        )}

        {/* 진술 */}
        <p id="question-statement" style={{
          fontSize: 16, fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.85,
          marginBottom: 24,
          letterSpacing: '-0.01em',
        }}>
          {statement}
        </p>

        {/* Likert 선택지 */}
        <div role="radiogroup" aria-labelledby="question-statement" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LIKERT_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value
            return (
              <button
                key={opt.value}
                role="radio"
                aria-checked={isSelected}
                data-option="true"
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderRadius: 12,
                  border: isSelected
                    ? '1px solid rgba(200,160,48,0.6)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: isSelected
                    ? 'rgba(200,160,48,0.18)'
                    : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: isSelected ? '0 0 16px rgba(200,160,48,0.2)' : 'none',
                }}
              >
                <span style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: isSelected ? 'rgba(200,160,48,0.9)' : 'rgba(255,255,255,0.5)',
                  minWidth: 14,
                  flexShrink: 0,
                }}>{opt.value}</span>
                <span style={{
                  fontSize: 14,
                  color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
                  fontWeight: isSelected ? 600 : 400,
                }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="w-full max-w-lg mt-4 flex gap-3">
        <button
          onClick={handleBack}
          disabled={current === 0}
          style={{
            padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.66)',
            fontSize: 14, cursor: current === 0 ? 'not-allowed' : 'pointer',
            opacity: current === 0 ? 0.3 : 1, flexShrink: 0,
          }}
        >
          {t.back}
        </button>
        <button
          onClick={handleNext}
          disabled={selected === null}
          style={{
            flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none',
            background: selected !== null
              ? 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)'
              : 'rgba(255,255,255,0.05)',
            color: selected !== null ? '#1a1206' : 'rgba(255,255,255,0.25)',
            fontSize: 14, fontWeight: 700, cursor: selected === null ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selected !== null ? '0 0 20px rgba(200,160,48,0.3)' : 'none',
          }}
        >
          {isLast ? t.finish : t.next}
        </button>
      </div>

      <p className="mt-3 text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {t.keysDesktop}
      </p>
      <p className="mt-3 text-xs sm:hidden" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {t.keysMobile}
      </p>

    </main>
  )
}
