'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SAMPLE_QUESTIONS, SECTION_TRANSITIONS } from '@/lib/questions'
import { Answer, SectionId } from '@/types'
import { initSession, startTestSession, saveAnswer, trackEvent } from '@/lib/analytics'

const TOTAL = SAMPLE_QUESTIONS.length

export default function TestPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answerMap, setAnswerMap] = useState<Record<number, Answer>>({})
  const [selected, setSelected] = useState<number | string | null>(null)
  const [animating, setAnimating] = useState(false)
  const [ready, setReady] = useState(false)
  const [sectionCard, setSectionCard] = useState<SectionId | null>(null)
  const testStarted = useRef(false)
  const shownSections = useRef<Set<string>>(new Set())

  const q = SAMPLE_QUESTIONS[current]
  const isLast = current === TOTAL - 1

  // 섹션 전환 감지
  const prevSection = current > 0 ? SAMPLE_QUESTIONS[current - 1].section : null
  const curSection = q.section

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
    if (testStarted.current) return
    testStarted.current = true
    async function init() {
      await initSession()
      await startTestSession()
      // 첫 섹션 전환 카드 표시
      const firstSection = SAMPLE_QUESTIONS[0].section
      if (firstSection) {
        shownSections.current.add(firstSection)
        setSectionCard(firstSection)
      }
      setReady(true)
    }
    init()
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

  async function handleNext() {
    if (selected === null || animating) return
    const answer: Answer = { questionId: q.id, value: selected }
    const newMap = { ...answerMap, [current]: answer }
    setAnswerMap(newMap)
    saveAnswer(answer).catch(() => {})
    setAnimating(true)

    setTimeout(async () => {
      setSelected(null)
      setAnimating(false)
      if (isLast) {
        const orderedAnswers = SAMPLE_QUESTIONS.map((_, i) => newMap[i]).filter(Boolean) as Answer[]
        sessionStorage.setItem('test_answers', JSON.stringify(orderedAnswers))
        await trackEvent('test_last_answer', { total: orderedAnswers.length })
        router.push('/result')
      } else {
        const next = current + 1
        const nextSection = SAMPLE_QUESTIONS[next].section
        setCurrent(next)
        setSelected(newMap[next]?.value ?? null)
        // 섹션이 바뀌고 아직 소개하지 않은 섹션이면 전환 카드 표시
        if (nextSection && SAMPLE_QUESTIONS[next - 1].section !== nextSection && !shownSections.current.has(nextSection)) {
          shownSections.current.add(nextSection)
          setSectionCard(nextSection)
        }
      }
    }, 180)
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>준비 중...</p>
      </main>
    )
  }

  // 섹션 전환 카드
  if (sectionCard) {
    const tr = SECTION_TRANSITIONS[sectionCard]
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
            시작하기 →
          </button>
          <p className="mt-3 text-xs" style={{ color: 'var(--muted2)' }}>Enter 키로도 시작할 수 있습니다</p>
        </div>
      </main>
    )
  }

  const progress = ((current + 1) / TOTAL) * 100
  const sectionLabel = curSection ? (SECTION_TRANSITIONS[curSection]?.title ?? curSection) : ''

  return (
    <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 32 }}>

      {/* 진행 바 */}
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

      {/* 문항 카드 */}
      <div
        className={`w-full max-w-xl glass rounded-2xl p-6 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="text-base font-medium leading-relaxed mb-6 whitespace-pre-line" style={{ color: 'var(--text)', lineHeight: 1.8 }}>{q.text}</p>

        {q.options && (
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <button
                key={String(opt.value)}
                onClick={() => setSelected(opt.value)}
                className={`option-btn${selected === opt.value ? ' selected' : ''}`}
              >
                <span className="text-xs mr-2.5 font-bold" style={{ color: 'var(--muted2)' }}>{idx + 1}</span>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {q.type === 'cognitive' && (
          <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>이 문항은 정답이 있습니다. 직관적으로 선택해 주세요.</p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="w-full max-w-xl mt-4 flex items-center gap-3">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ padding: '12px 20px', fontSize: '0.875rem' }}
        >
          ← 이전
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
          {isLast ? '결과 보기 →' : '다음 →'}
        </button>
      </div>

      <p className="mt-3 text-xs" style={{ color: 'var(--muted2)' }}>숫자키 1~{q.options?.length ?? 4}로 선택, Enter로 다음</p>

    </main>
  )
}
