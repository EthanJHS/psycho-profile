'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DEEP_QUESTIONS } from '@/lib/deep-questions'

const LIKERT = [
  { label: '전혀 아니다', value: 1 },
  { label: '아니다', value: 2 },
  { label: '보통이다', value: 3 },
  { label: '그렇다', value: 4 },
  { label: '매우 그렇다', value: 5 },
]

const TOTAL = DEEP_QUESTIONS.length

// facet별로 Likert 응답을 모아 평균(역문항 처리)하여 0~1로 반환
function processDeepAnswers(raw: Record<string, number | string>): Record<string, number | string> {
  const facetSums: Record<string, { sum: number; count: number }> = {}
  const choiceAnswers: Record<string, string> = {}

  DEEP_QUESTIONS.forEach(q => {
    const val = raw[q.id]
    if (val === undefined) return

    if (q.type === 'likert') {
      const num = typeof val === 'number' ? val : Number(val)
      const score = q.reverse ? (6 - num) : num
      const normalized = (score - 1) / 4  // 0~1
      if (!facetSums[q.facet]) facetSums[q.facet] = { sum: 0, count: 0 }
      facetSums[q.facet].sum += normalized
      facetSums[q.facet].count++
    } else {
      choiceAnswers[q.facet] = String(val)
    }
  })

  const result: Record<string, number | string> = {}
  for (const [facet, { sum, count }] of Object.entries(facetSums)) {
    result[facet] = sum / count
  }
  for (const [facet, val] of Object.entries(choiceAnswers)) {
    result[facet] = val
  }
  return result
}

export default function DeepPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [rawAnswers, setRawAnswers] = useState<Record<string, number | string>>({})
  const [selected, setSelected] = useState<number | string | null>(null)
  const [animating, setAnimating] = useState(false)

  const q = DEEP_QUESTIONS[current]
  const isLast = current === TOTAL - 1
  const progress = Math.round((current / TOTAL) * 100)

  useEffect(() => {
    // 심층 분석 구매 여부 확인
    const tier = sessionStorage.getItem('result_tier')
    if (tier !== 'deep_purchased') {
      router.replace('/result')
    }
  }, [router])

  useEffect(() => {
    setSelected(rawAnswers[q.id] ?? null)
  }, [current, q.id, rawAnswers])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (animating) return
      if (q.type === 'likert' && ['1', '2', '3', '4', '5'].includes(e.key)) {
        setSelected(Number(e.key))
      }
      if (q.type === 'choice' && q.options && ['1', '2', '3', '4'].includes(e.key)) {
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

  function handleNext() {
    if (selected === null || animating) return
    const updated = { ...rawAnswers, [q.id]: selected }
    setRawAnswers(updated)
    setAnimating(true)

    setTimeout(() => {
      if (isLast) {
        const processed = processDeepAnswers(updated)
        sessionStorage.setItem('deep_answers', JSON.stringify(processed))
        sessionStorage.setItem('result_tier', 'deep')
        router.push('/result')
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
        setAnimating(false)
      }
    }, 260)
  }

  function handleBack() {
    if (current === 0 || animating) return
    setCurrent(c => c - 1)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--accent2)' }}>
            심층 분석
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {current + 1} / {TOTAL}
          </p>
        </div>

        {/* 진행 바 */}
        <div className="h-1 rounded-full mb-10 overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
          />
        </div>

        {/* 섹션 레이블 */}
        <p className="text-xs font-medium mb-3 text-center" style={{ color: 'var(--muted)' }}>
          {current < 6 ? '🔗 애착 패턴' :
           current < 10 ? '🔥 번아웃 지표' :
           current < 13 ? '💎 핵심 가치관' :
           current < 17 ? '🦁 리더십 스타일' :
           '⚖️ 삶의 균형'}
        </p>

        {/* 질문 카드 */}
        <div
          className={`glass rounded-2xl p-8 mb-8 transition-all duration-260 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          style={{ minHeight: 160 }}
        >
          <p className="text-lg font-medium leading-relaxed text-center" style={{ color: 'var(--text)' }}>
            {q.text}
          </p>
        </div>

        {/* 리커트 */}
        {q.type === 'likert' && (
          <div className="grid grid-cols-5 gap-2 mb-6">
            {LIKERT.map(opt => {
              const active = selected === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: active ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                    color: active ? '#fff' : 'var(--muted)',
                  }}
                >
                  <span className="text-lg font-bold">{opt.value}</span>
                  <span className="text-[10px] text-center leading-tight">{opt.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* 선택형 */}
        {q.type === 'choice' && q.options && (
          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => {
              const active = selected === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: active ? 'linear-gradient(135deg, rgba(124,77,204,0.18), rgba(155,114,232,0.12))' : 'var(--surface2)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    color: active ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: active ? 'var(--accent)' : 'var(--border)',
                      color: active ? '#fff' : 'var(--muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex items-center gap-3">
          {current > 0 && (
            <button
              onClick={handleBack}
              className="px-5 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              ←
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selected === null || animating}
            className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {isLast ? '분석 완료 →' : '다음 →'}
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
          키보드: 숫자 선택 · Enter 다음 · Backspace 이전
        </p>
      </div>
    </main>
  )
}
