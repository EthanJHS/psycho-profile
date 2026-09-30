'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SAMPLE_QUESTIONS_EN, SECTION_TRANSITIONS_EN } from '@/lib/questions-en'
import { Answer, SectionId } from '@/types'
import { initSession, startTestSession, saveAnswer, trackEvent, sendAbandonBeacon } from '@/lib/analytics'

const TOTAL = SAMPLE_QUESTIONS_EN.length

function shuffleSections<T extends { section?: string | null }>(arr: T[]): T[] {
  const out = [...arr]
  let i = 0
  while (i < out.length) {
    const sec = out[i].section
    let j = i + 1
    while (j < out.length && out[j].section === sec) j++
    for (let k = j - 1; k > i; k--) {
      const r = i + Math.floor(Math.random() * (k - i + 1));
      [out[k], out[r]] = [out[r], out[k]]
    }
    i = j
  }
  return out
}

export default function ENTestPage() {
  const router = useRouter()
  const [questions] = useState(() => shuffleSections([...SAMPLE_QUESTIONS_EN]))
  const [current, setCurrent] = useState(0)
  const [answerMap, setAnswerMap] = useState<Record<number, Answer>>({})
  const [selected, setSelected] = useState<number | string | null>(null)
  const [animating, setAnimating] = useState(false)
  const [ready, setReady] = useState(false)
  const [sectionCard, setSectionCard] = useState<SectionId | null>(null)
  const testStarted = useRef(false)
  const shownSections = useRef<Set<string>>(new Set())
  const advancingRef = useRef(false)

  const q = questions[current]
  const isLast = current === TOTAL - 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (animating) return
      if (sectionCard) {
        if (e.key === 'Enter' || e.key === ' ') setSectionCard(null)
        return
      }
      if (q.options && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1
        if (q.options[idx]) setSelected(q.options[idx].value)
      }
      if (e.key === 'Enter' && selected !== null) handleNext()
      if (e.key === 'Backspace' && current > 0) handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, selected, animating, sectionCard])

  useEffect(() => {
    sessionStorage.setItem('pp_en_free_current_idx', '0')
    const handleUnload = () => {
      const idx = parseInt(sessionStorage.getItem('pp_en_free_current_idx') ?? '0')
      if (!sessionStorage.getItem('pp_en_free_completed')) {
        sendAbandonBeacon(idx, TOTAL)
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  useEffect(() => {
    if (testStarted.current) return
    testStarted.current = true
    async function init() {
      await initSession()
      await startTestSession()
      const firstSection = questions[0].section
      if (firstSection) {
        shownSections.current.add(firstSection)
        setSectionCard(firstSection)
      }
      setReady(true)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleBack() {
    if (current === 0 || animating) return
    setAnimating(true)
    setTimeout(() => {
      const prev = current - 1
      setCurrent(prev)
      setSelected(answerMap[prev]?.value ?? null)
      setAnimating(false)
    }, 150)
  }

  const advance = useCallback(async (val: number | string | null, cur: number, map: Record<number, Answer>) => {
    advancingRef.current = false
    if (val === null) return
    const qAtCur = questions[cur]
    const answer: Answer = { questionId: qAtCur.id, value: val }
    const newMap = { ...map, [cur]: answer }
    setAnswerMap(newMap)
    saveAnswer(answer).catch(() => {})
    setAnimating(true)

    setTimeout(async () => {
      setSelected(null)
      setAnimating(false)
      const isLastQ = cur === TOTAL - 1
      if (isLastQ) {
        const orderedAnswers = questions.map((_, i) => newMap[i]).filter(Boolean) as Answer[]
        sessionStorage.setItem('en_test_answers', JSON.stringify(orderedAnswers))
        sessionStorage.setItem('pp_en_free_completed', '1')
        await trackEvent('en_test_last_answer', { total: orderedAnswers.length })
        router.push('/en/result')
      } else {
        const next = cur + 1
        sessionStorage.setItem('pp_en_free_current_idx', String(next))
        const nextSection = questions[next].section
        setCurrent(next)
        setSelected(newMap[next]?.value ?? null)
        if (nextSection && questions[next - 1].section !== nextSection && !shownSections.current.has(nextSection)) {
          shownSections.current.add(nextSection)
          setSectionCard(nextSection)
        }
      }
    }, 180)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, router])

  async function handleNext() {
    if (selected === null || animating || advancingRef.current) return
    await advance(selected, current, answerMap)
  }

  const handleSelect = useCallback((val: number | string) => {
    if (animating || sectionCard || advancingRef.current) return
    setSelected(val)
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (isTouch) {
      advancingRef.current = true
      setTimeout(() => advance(val, current, answerMap), 300)
    }
  }, [animating, sectionCard, advance, current, answerMap])

  if (!ready) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Getting ready...</p>
      </main>
    )
  }

  if (sectionCard) {
    const tr = SECTION_TRANSITIONS_EN[sectionCard]
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-md glass-hi rounded-2xl p-8 text-center">
          <div className="text-4xl mb-5">{tr.icon}</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>{tr.title}</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{tr.description}</p>
          <p className="text-xs mb-7 px-4 py-3 rounded-xl text-left leading-relaxed" style={{ background: 'rgba(139,92,246,0.10)', color: 'var(--accent3)', border: '1px solid rgba(139,92,246,0.18)' }}>
            {tr.theory}
          </p>
          <button
            onClick={() => setSectionCard(null)}
            className="btn-primary w-full"
            style={{ justifyContent: 'center', padding: '14px' }}
          >
            Start →
          </button>
          <p className="mt-3 text-xs" style={{ color: 'var(--muted2)' }}>Press Enter or Space to begin</p>
        </div>
      </main>
    )
  }

  const progress = ((current + 1) / TOTAL) * 100
  const sectionLabel = q.section ? (SECTION_TRANSITIONS_EN[q.section]?.title ?? q.section) : ''

  return (
    <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 32 }}>

      <div className="w-full max-w-xl pt-6 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold" style={{ color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>{current + 1}</span>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>/ {TOTAL}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-violet">{sectionLabel}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--accent2)' }}>{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full w-full" style={{ background: 'var(--surface2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, var(--accent2))' }}
          />
        </div>
      </div>

      <div className={`w-full max-w-xl glass rounded-2xl p-6 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-base font-medium leading-relaxed mb-6 whitespace-pre-line" style={{ color: 'var(--text)', lineHeight: 1.8 }}>{q.text}</p>

        {q.options && (
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <button
                key={String(opt.value)}
                onClick={() => handleSelect(opt.value)}
                className={`option-btn${selected === opt.value ? ' selected' : ''}`}
                style={{ minHeight: 64, fontSize: '1.125rem' }}
              >
                <span className="text-xs mr-2.5 font-bold" style={{ color: 'var(--muted2)' }}>{idx + 1}</span>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-xl mt-4 flex items-center gap-3">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ padding: '12px 20px', fontSize: '0.875rem' }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            padding: '12px 20px',
            background: selected !== null ? 'linear-gradient(135deg, #7c3aed, var(--accent2))' : 'var(--surface2)',
            borderColor: selected !== null ? undefined : 'var(--border)',
            boxShadow: 'none',
          }}
        >
          {isLast ? 'See Results →' : 'Next →'}
        </button>
      </div>

      <p className="mt-3 text-xs hidden sm:block" style={{ color: 'var(--muted2)' }}>Keys 1–{q.options?.length ?? 4} to select · Enter to advance</p>
      <p className="mt-3 text-xs sm:hidden" style={{ color: 'var(--muted2)' }}>Tap to select — advances automatically</p>

    </main>
  )
}
