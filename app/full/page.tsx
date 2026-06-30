'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_QUESTIONS } from '@/lib/full-scoring'
import { Answer } from '@/types'
import { initSession, startTestSession, saveAnswer, trackEvent } from '@/lib/analytics'

const LIKERT = [
  { label: '전혀 아니다', value: 1 },
  { label: '아니다', value: 2 },
  { label: '보통이다', value: 3 },
  { label: '그렇다', value: 4 },
  { label: '매우 그렇다', value: 5 },
]

const TOTAL = ALL_QUESTIONS.length
const SECTION_ORDER = ['H','E','X','A','C','O','TCI','COG','MOT','STR','LIFE']

export default function FullTestPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answerMap, setAnswerMap] = useState<Record<number, Answer>>({})
  const [selected, setSelected] = useState<number | string | null>(null)
  const [animating, setAnimating] = useState(false)
  const [ready, setReady] = useState(false)
  const initiated = useRef(false)

  const q = ALL_QUESTIONS[current]
  const isLast = current === TOTAL - 1
  const isCog = q.type === 'cognitive'
  const pct = Math.round(((current + 1) / TOTAL) * 100)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (animating) return
      if (q.type === 'likert' && ['1','2','3','4','5'].includes(e.key)) setSelected(Number(e.key))
      if (q.type !== 'likert' && q.options && ['1','2','3','4'].includes(e.key)) {
        const idx = Number(e.key) - 1
        if (q.options[idx]) setSelected(q.options[idx].value)
      }
      if (e.key === 'Enter' && selected !== null) handleNext()
      if (e.key === 'Backspace' && current > 0) handleBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, selected, animating])

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    async function init() {
      await initSession()
      await startTestSession()
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
        const orderedAnswers = ALL_QUESTIONS.map((_, i) => newMap[i]).filter(Boolean) as Answer[]
        sessionStorage.setItem('full_answers', JSON.stringify(orderedAnswers))
        await trackEvent('full_test_complete', { total: orderedAnswers.length })
        router.push('/full-result')
      } else {
        const next = current + 1
        setCurrent(next)
        setSelected(newMap[next]?.value ?? null)
      }
    }, 180)
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 32 }}>

      {/* 진행 바 */}
      <div className="w-full max-w-xl pt-6 pb-5">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold" style={{ color: 'var(--text)', lineHeight: 1 }}>{current + 1}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>/ {TOTAL}문항</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(160,126,224,0.12)', color: 'var(--accent2)' }}>
            {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full w-full" style={{ background: 'var(--surface2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
          />
        </div>
        {/* 섹션 점 */}
        <div className="flex justify-between mt-2.5 px-0.5">
          {SECTION_ORDER.map((s, i) => {
            const sectionStart = ALL_QUESTIONS.findIndex(qq => qq.domain === s)
            const nextStart = i < SECTION_ORDER.length - 1
              ? ALL_QUESTIONS.findIndex(qq => qq.domain === SECTION_ORDER[i + 1])
              : TOTAL
            const done = sectionStart >= 0 && current >= nextStart
            const active = sectionStart >= 0 && current >= sectionStart && current < nextStart
            return (
              <div
                key={s}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active ? 20 : 6,
                  height: 6,
                  background: done ? 'var(--accent2)' : active ? 'var(--accent)' : 'var(--border)',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* 문항 카드 */}
      <div
        className={`w-full max-w-xl rounded-2xl p-7 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-lg font-medium leading-relaxed mb-7 whitespace-pre-line" style={{ color: 'var(--text)' }}>{q.text}</p>

        {q.type === 'likert' && (
          <div className="space-y-2.5">
            {LIKERT.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="w-full text-left px-5 py-4 rounded-xl transition-all font-medium"
                style={{
                  background: selected === opt.value
                    ? 'linear-gradient(135deg, rgba(160,126,224,0.28), rgba(201,168,248,0.14))'
                    : 'var(--surface2)',
                  border: selected === opt.value
                    ? '1px solid rgba(160,126,224,0.55)'
                    : '1px solid var(--border)',
                  color: selected === opt.value ? 'var(--accent2)' : 'var(--text)',
                  boxShadow: selected === opt.value ? '0 0 0 3px rgba(160,126,224,0.08)' : 'none',
                }}
              >{opt.label}</button>
            ))}
          </div>
        )}

        {(q.type === 'cognitive' || q.type === 'choice') && q.options && (
          <div className="space-y-2.5">
            {q.options.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setSelected(opt.value)}
                className="w-full text-left px-5 py-4 rounded-xl transition-all font-medium"
                style={{
                  background: selected === opt.value
                    ? 'linear-gradient(135deg, rgba(160,126,224,0.28), rgba(201,168,248,0.14))'
                    : 'var(--surface2)',
                  border: selected === opt.value
                    ? '1px solid rgba(160,126,224,0.55)'
                    : '1px solid var(--border)',
                  color: selected === opt.value ? 'var(--accent2)' : 'var(--text)',
                  boxShadow: selected === opt.value ? '0 0 0 3px rgba(160,126,224,0.08)' : 'none',
                }}
              >{opt.label}</button>
            ))}
          </div>
        )}

        {isCog && (
          <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>이 문항은 정답이 있습니다. 직관적으로 선택해 주세요.</p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="w-full max-w-xl mt-4 flex items-center gap-3">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="px-5 py-3.5 rounded-xl font-medium transition-all text-sm disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: selected !== null ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)', border: selected !== null ? 'none' : '1px solid var(--border)' }}
        >
          {isLast ? '분석 시작 →' : '다음 →'}
        </button>
      </div>

    </main>
  )
}
