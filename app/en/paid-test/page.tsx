'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PAID_QUESTIONS_EN } from '@/lib/paid-questions-en'
import { initSession, trackPaidAnswer, sendAbandonBeacon } from '@/lib/analytics'
import { PaidAnswer } from '@/lib/paid-scoring-en'
import { encodePaidAnswers } from '@/lib/result-encoding'

const TOTAL = PAID_QUESTIONS_EN.length

function shuffleRange<T>(arr: T[], start: number, end: number): T[] {
  const out = [...arr]
  for (let i = end; i > start; i--) {
    const j = start + Math.floor(Math.random() * (i - start + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const SECTION_META = {
  hexaco: {
    label: 'Personality Profile',
    icon: '🧠',
    color: '#a78bfa',
    qRange: [0, 47] as [number, number],
    scaleLabels: ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'],
    intro: 'For each statement, indicate honestly how much it applies to you. There are no right or wrong answers — go with your first instinct.',
  },
  riasec: {
    label: 'Career Interests',
    icon: '🎯',
    color: '#34d399',
    qRange: [48, 65] as [number, number],
    scaleLabels: ['Not at all\ninterested', 'Not\nreally', 'Neutral', 'Interested', 'Very\ninterested'],
    intro: 'How much are you drawn to each activity or environment? Rate based on genuine interest — even if you have no direct experience with it.',
  },
  aptitude: {
    label: 'Academic Aptitude',
    icon: '📚',
    color: '#f472b6',
    qRange: [66, 85] as [number, number],
    scaleLabels: ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'],
    intro: 'These questions assess your cognitive style and self-perceived abilities. Rate how naturally each ability comes to you — not how much you enjoy it.',
  },
  wellbeing: {
    label: 'Wellbeing Check',
    icon: '💚',
    color: '#10b981',
    qRange: [86, 89] as [number, number],
    scaleLabels: ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'],
    intro: 'Answer honestly about how you\'ve been feeling recently. Think about the past month as your reference point.',
  },
} as const

type SectionKey = keyof typeof SECTION_META

const LIFE_QUESTIONS = [
  {
    id: 'life_satisfied',
    text: 'Which area of your life are you most satisfied with right now?',
    options: [
      { label: 'Work & career',          value: 'work' },
      { label: 'Relationships & belonging', value: 'relationships' },
      { label: 'Health & energy',        value: 'health' },
      { label: 'Personal growth & learning', value: 'growth' },
    ],
  },
  {
    id: 'life_lacking',
    text: 'Which area of your life feels most lacking right now?',
    options: [
      { label: 'Work & career',       value: 'work' },
      { label: 'Relationships',       value: 'relationships' },
      { label: 'Health & energy',     value: 'health' },
      { label: 'Financial stability', value: 'finance' },
    ],
  },
  {
    id: 'recovery_speed',
    text: 'When something difficult happens, how quickly do you typically bounce back?',
    options: [
      { label: 'Within a day — I recover fast',     value: 'fast' },
      { label: 'A few days',                         value: 'medium' },
      { label: 'A week or more',                     value: 'slow' },
      { label: 'I find it hard to fully recover',   value: 'very_slow' },
    ],
  },
]

function getSectionKey(idx: number): SectionKey {
  if (idx <= 47) return 'hexaco'
  if (idx <= 65) return 'riasec'
  if (idx <= 85) return 'aptitude'
  return 'wellbeing'
}

export default function PaidTestPageEN() {
  const router = useRouter()
  const [questions] = useState(() => {
    let arr = [...PAID_QUESTIONS_EN]
    arr = shuffleRange(arr, 0, 47)
    arr = shuffleRange(arr, 48, 65)
    arr = shuffleRange(arr, 66, 85)
    return arr
  })
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState<Record<string, number>>({})
  const [selected, setSelected]     = useState<number | null>(null)
  const [animating, setAnimating]   = useState(false)
  const [sectionIntro, setSectionIntro] = useState<SectionKey | null>('hexaco')
  const shownSections  = useRef<Set<string>>(new Set(['hexaco']))
  const advancingRef   = useRef(false)
  const [lifePhase, setLifePhase]   = useState<number | null>(null)
  const [lifeAnswers, setLifeAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    initSession().catch(() => {})
    if (!sessionStorage.getItem('pp_paid_en_start_ms')) {
      sessionStorage.setItem('pp_paid_en_start_ms', Date.now().toString())
    }
    sessionStorage.removeItem('pp_paid_en_saved')
    sessionStorage.setItem('pp_paid_en_q_start', Date.now().toString())

    const handleUnload = () => {
      const idx = parseInt(sessionStorage.getItem('pp_paid_en_current_idx') ?? '0')
      if (!sessionStorage.getItem('pp_paid_en_saved')) {
        sendAbandonBeacon(idx, TOTAL)
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  const q       = questions[current]
  const section = getSectionKey(current)
  const meta    = SECTION_META[section]
  const isLast  = current === TOTAL - 1

  const [sStart, sEnd] = meta.qRange
  const withinSection  = Math.max(0, current - sStart) + 1
  const sectionTotal   = sEnd - sStart + 1

  const advance = useCallback((val: number, currentIdx: number, currentAnswers: Record<string, number>) => {
    const newAnswers = { ...currentAnswers, [questions[currentIdx].id]: val }
    setAnswers(newAnswers)
    setAnimating(true)
    advancingRef.current = false

    const qStart = parseInt(sessionStorage.getItem('pp_paid_en_q_start') ?? '0')
    const timeMs = qStart ? Date.now() - qStart : null
    trackPaidAnswer(questions[currentIdx].id, currentIdx, val, timeMs)
    sessionStorage.setItem('pp_paid_en_q_start', Date.now().toString())
    sessionStorage.setItem('pp_paid_en_current_idx', String(currentIdx + 1))

    setTimeout(() => {
      setAnimating(false)
      setSelected(null)

      if (currentIdx === TOTAL - 1) {
        setLifePhase(0)
        return
      }

      const next = currentIdx + 1
      const nextQ = questions[next]
      const prevSection = getSectionKey(currentIdx)
      const nextSection = getSectionKey(next)

      setCurrent(next)
      setSelected(newAnswers[nextQ.id] ?? null)

      if (nextSection !== prevSection && !shownSections.current.has(nextSection)) {
        shownSections.current.add(nextSection)
        setSectionIntro(nextSection)
      }
    }, 180)
  }, [router])

  const handleSelect = useCallback((val: number) => {
    if (animating || sectionIntro || advancingRef.current) return
    setSelected(val)
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (isTouch) {
      advancingRef.current = true
      setTimeout(() => advance(val, current, answers), 300)
    }
  }, [animating, sectionIntro, advance, current, answers])

  const handleNext = useCallback(() => {
    if (selected === null || animating) return
    advance(selected, current, answers)
  }, [selected, animating, advance, current, answers])

  const handleBack = useCallback(() => {
    if (current === 0 || animating) return
    setAnimating(true)
    setTimeout(() => {
      const prev = current - 1
      setCurrent(prev)
      setSelected(answers[questions[prev].id] ?? null)
      setAnimating(false)
    }, 150)
  }, [current, animating, answers])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lifePhase !== null) return
      if (animating) return
      if (sectionIntro) {
        if (e.key === 'Enter' || e.key === ' ') setSectionIntro(null)
        return
      }
      if (['1','2','3','4','5'].includes(e.key)) handleSelect(Number(e.key))
      if (e.key === 'Enter' && selected !== null) handleNext()
      if (e.key === 'Backspace') handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lifePhase, animating, sectionIntro, selected, handleSelect, handleNext, handleBack])

  // ── Life balance questions ────────────────────────────────────
  if (lifePhase !== null) {
    const lq = LIFE_QUESTIONS[lifePhase]
    const isLastLife = lifePhase === LIFE_QUESTIONS.length - 1
    const currentLifeAnswer = lifeAnswers[lq.id] ?? null

    const handleLifeSelect = (value: string) => {
      const newLifeAnswers = { ...lifeAnswers, [lq.id]: value }
      setLifeAnswers(newLifeAnswers)

      setTimeout(() => {
        if (isLastLife) {
          const result: PaidAnswer[] = questions.map(pq => ({
            id: pq.id,
            score: answers[pq.id] ?? 3,
          }))
          localStorage.setItem('paid_answers_en', JSON.stringify(result))
          localStorage.setItem('paid_deep_answers_en', JSON.stringify(newLifeAnswers))
          sessionStorage.setItem('pp_paid_en_saved', '1')
          router.push('/en/paid-result?r=' + encodePaidAnswers(result))
        } else {
          setLifePhase(lifePhase + 1)
        }
      }, 180)
    }

    const totalSteps = TOTAL + LIFE_QUESTIONS.length
    const currentStep = TOTAL + lifePhase + 1
    const progress = (currentStep / totalSteps) * 100

    return (
      <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 32 }}>
        <div className="w-full max-w-xl pt-6 pb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold" style={{ color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {currentStep}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>/ {totalSteps}</span>
            </div>
            <span className="badge" style={{ borderColor: '#10b98155', color: '#10b981', background: '#10b98118', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>
              💚 Life Balance {lifePhase + 1}/{LIFE_QUESTIONS.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full w-full" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #10b981)' }} />
          </div>
        </div>

        <div className="w-full max-w-xl glass rounded-2xl p-6">
          <p className="text-[11px] font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--muted2)' }}>
            Choose the closest answer
          </p>
          <p className="text-base font-medium leading-relaxed mb-6" style={{ color: 'var(--text)', lineHeight: 1.85 }}>
            {lq.text}
          </p>
          <div className="flex flex-col gap-3">
            {lq.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleLifeSelect(opt.value)}
                className="w-full rounded-xl px-5 py-4 text-left text-sm font-medium transition-all duration-150"
                style={{
                  background: currentLifeAnswer === opt.value ? '#10b981' : 'var(--surface2)',
                  color: currentLifeAnswer === opt.value ? '#fff' : 'var(--text)',
                  border: currentLifeAnswer === opt.value ? 'none' : '1px solid var(--border)',
                  transform: currentLifeAnswer === opt.value ? 'translateY(-2px)' : 'none',
                  boxShadow: currentLifeAnswer === opt.value ? '0 4px 14px #10b98140' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ── Section intro card ────────────────────────────────────────
  if (sectionIntro) {
    const m = SECTION_META[sectionIntro]
    const partNum = sectionIntro === 'hexaco' ? 1 : sectionIntro === 'riasec' ? 2 : sectionIntro === 'aptitude' ? 3 : 4
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-md glass-hi rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">{m.icon}</div>
          <div className="text-xs font-bold mb-2" style={{ color: m.color, letterSpacing: '0.08em' }}>
            PART {partNum} / 4
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {m.label}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            {m.intro}
          </p>

          <div className="flex justify-between text-[11px] mb-6 px-1" style={{ color: 'var(--muted2)' }}>
            <span>1 = {m.scaleLabels[0].replace('\n', ' ')}</span>
            <span>3 = Neutral</span>
            <span>5 = {m.scaleLabels[4].replace('\n', ' ')}</span>
          </div>

          <button
            onClick={() => setSectionIntro(null)}
            className="btn-primary w-full"
            style={{ justifyContent: 'center', padding: '14px', background: `linear-gradient(135deg, ${m.color}cc, ${m.color})` }}
          >
            Start →
          </button>
          <p className="mt-3 text-xs" style={{ color: 'var(--muted2)' }}>Press Enter or Space to begin</p>
        </div>
      </main>
    )
  }

  const progress = ((current + 1) / (TOTAL + LIFE_QUESTIONS.length)) * 100

  const SECTION_COLORS: Record<SectionKey, string[]> = {
    hexaco:    ['#4b5563','#6b7280','#7c3aed','#8b5cf6','#a78bfa'],
    riasec:    ['#4b5563','#6b7280','#059669','#10b981','#34d399'],
    aptitude:  ['#4b5563','#6b7280','#be185d','#db2777','#f472b6'],
    wellbeing: ['#4b5563','#6b7280','#059669','#10b981','#34d399'],
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 32 }}>

      <div className="w-full max-w-xl pt-6 pb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold" style={{ color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {current + 1}
            </span>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>/ {TOTAL}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-violet" style={{ borderColor: meta.color + '55', color: meta.color, background: meta.color + '18' }}>
              {meta.icon} {meta.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{withinSection}/{sectionTotal}</span>
            <span className="text-xs font-bold" style={{ color: meta.color }}>{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full w-full" style={{ background: 'var(--surface2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, #7c3aed, ${meta.color})` }}
          />
        </div>
      </div>

      <div className={`w-full max-w-xl glass rounded-2xl p-6 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[11px] font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--muted2)' }}>
          {q.section === 'riasec' ? 'How drawn are you to this activity?' : 'Rate your agreement'}
        </p>
        <p className="text-base font-medium leading-relaxed mb-8" style={{ color: 'var(--text)', lineHeight: 1.85 }}>
          {q.text}
        </p>

        <div className="flex gap-2">
          {[1,2,3,4,5].map((val, i) => {
            const isSelected = selected === val
            return (
              <button
                key={val}
                onClick={() => handleSelect(val)}
                className="flex flex-col items-center gap-2 flex-1 group"
              >
                <div
                  className="w-full rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-150"
                  style={{
                    height: 64,
                    background: isSelected ? SECTION_COLORS[section][val - 1] : 'var(--surface2)',
                    color: isSelected ? '#fff' : 'var(--muted)',
                    border: isSelected ? 'none' : '1px solid var(--border)',
                    transform: isSelected ? 'translateY(-3px) scale(1.04)' : 'none',
                    boxShadow: isSelected ? `0 4px 14px ${meta.color}40` : 'none',
                  }}
                >
                  {val}
                </div>
                {(i === 0 || i === 4) && (
                  <span className="text-[10px] text-center leading-tight whitespace-pre-line" style={{ color: isSelected ? meta.color : 'var(--muted2)' }}>
                    {meta.scaleLabels[i]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-xs text-center hidden sm:block" style={{ color: 'var(--muted2)' }}>
          Keys 1–5 to select · Enter to advance
        </p>
        <p className="mt-4 text-xs text-center sm:hidden" style={{ color: 'var(--muted2)' }}>
          Tap to select — advances automatically
        </p>
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
            background: selected !== null ? `linear-gradient(135deg, #7c3aed, ${meta.color})` : 'var(--surface2)',
            borderColor: selected !== null ? undefined : 'var(--border)',
            boxShadow: 'none',
            justifyContent: 'center',
          }}
        >
          {isLast ? 'See Results →' : 'Next →'}
        </button>
      </div>

    </main>
  )
}
