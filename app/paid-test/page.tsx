'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PAID_QUESTIONS } from '@/lib/paid-questions'
import { trackPaidAnswer, sendAbandonBeacon } from '@/lib/analytics'
import { PaidAnswer } from '@/lib/paid-scoring'

const TOTAL = PAID_QUESTIONS.length

const SECTION_META = {
  hexaco: {
    label: '성격 프로파일',
    icon: '🧠',
    color: '#a78bfa',
    qRange: [0, 47] as [number, number],    // index 기준
    scaleLabels: ['전혀\n아니다', '아니다', '보통\n이다', '그렇다', '매우\n그렇다'],
    intro: '각 문장에 당신이 평소 얼마나 해당하는지 솔직하게 응답해 주세요. 정답은 없으며, 첫 번째 느낌을 따라 선택하세요.',
  },
  riasec: {
    label: '직업 흥미',
    icon: '🎯',
    color: '#34d399',
    qRange: [48, 65] as [number, number],
    scaleLabels: ['전혀\n아니다', '별로', '보통', '좋다', '매우\n좋다'],
    intro: '각 활동이나 환경에 얼마나 끌리나요? 실제 경험이 없어도 관심과 흥미를 기준으로 선택하세요.',
  },
  aptitude: {
    label: '학문 적성',
    icon: '📚',
    color: '#f472b6',
    qRange: [66, 73] as [number, number],
    scaleLabels: ['전혀\n아니다', '아니다', '보통\n이다', '그렇다', '매우\n그렇다'],
    intro: '학문·사고 스타일에 대한 성향을 응답해 주세요. 현재 실력이 아니라 관심과 적성을 기준으로 선택하세요.',
  },
} as const

type SectionKey = keyof typeof SECTION_META

function getSectionKey(idx: number): SectionKey {
  if (idx <= 47) return 'hexaco'
  if (idx <= 65) return 'riasec'
  return 'aptitude'
}


export default function PaidTestPage() {
  const router = useRouter()
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState<Record<string, number>>({})
  const [selected, setSelected]     = useState<number | null>(null)
  const [animating, setAnimating]   = useState(false)
  const [sectionIntro, setSectionIntro] = useState<SectionKey | null>('hexaco')
  const shownSections  = useRef<Set<string>>(new Set(['hexaco']))

  // 시작 시간 기록 + 이탈 추적
  useEffect(() => {
    if (!sessionStorage.getItem('pp_paid_start_ms')) {
      sessionStorage.setItem('pp_paid_start_ms', Date.now().toString())
    }
    sessionStorage.removeItem('pp_paid_saved')
    sessionStorage.setItem('pp_paid_q_start', Date.now().toString())

    const handleUnload = () => {
      const idx = parseInt(sessionStorage.getItem('pp_paid_current_idx') ?? '0')
      if (!sessionStorage.getItem('pp_paid_saved')) {
        sendAbandonBeacon(idx, TOTAL)
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  const q       = PAID_QUESTIONS[current]
  const section = getSectionKey(current)
  const meta    = SECTION_META[section]
  const isLast  = current === TOTAL - 1

  // 섹션 내 진행 (0-based)
  const [sStart, sEnd] = meta.qRange
  const withinSection  = Math.max(0, current - sStart) + 1
  const sectionTotal   = sEnd - sStart + 1

  // ── 다음 문항 이동 ─────────────────────────────────────────────
  const advance = useCallback((val: number, currentIdx: number, currentAnswers: Record<string, number>) => {
    const newAnswers = { ...currentAnswers, [PAID_QUESTIONS[currentIdx].id]: val }
    setAnswers(newAnswers)
    setAnimating(true)

    // 문항별 소요 시간 측정 + 응답 추적
    const qStart = parseInt(sessionStorage.getItem('pp_paid_q_start') ?? '0')
    const timeMs = qStart ? Date.now() - qStart : null
    trackPaidAnswer(PAID_QUESTIONS[currentIdx].id, currentIdx, val, timeMs)
    sessionStorage.setItem('pp_paid_q_start', Date.now().toString())
    sessionStorage.setItem('pp_paid_current_idx', String(currentIdx + 1))

    setTimeout(() => {
      setAnimating(false)
      setSelected(null)

      if (currentIdx === TOTAL - 1) {
        const result: PaidAnswer[] = PAID_QUESTIONS.map(pq => ({
          id: pq.id,
          score: newAnswers[pq.id] ?? 3,
        }))
        localStorage.setItem('paid_answers', JSON.stringify(result))
        router.push('/paid-result')
        return
      }

      const next = currentIdx + 1
      const nextQ = PAID_QUESTIONS[next]
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

  // ── 선택 (자동 진행 없음 — 수동으로 다음 클릭) ────────────────
  const handleSelect = useCallback((val: number) => {
    if (animating || sectionIntro) return
    setSelected(val)
  }, [animating, sectionIntro])

  // ── 다음 ──────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (selected === null || animating) return
    advance(selected, current, answers)
  }, [selected, animating, advance, current, answers])

  // ── 이전 ──────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (current === 0 || animating) return
    setAnimating(true)
    setTimeout(() => {
      const prev = current - 1
      setCurrent(prev)
      setSelected(answers[PAID_QUESTIONS[prev].id] ?? null)
      setAnimating(false)
    }, 150)
  }, [current, animating, answers])

  // ── 키보드 ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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
  }, [animating, sectionIntro, selected, handleSelect, handleNext, handleBack])

  // ── 섹션 인트로 카드 ──────────────────────────────────────────
  if (sectionIntro) {
    const m = SECTION_META[sectionIntro]
    const partNum = sectionIntro === 'hexaco' ? 1 : sectionIntro === 'riasec' ? 2 : 3
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-md glass-hi rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">{m.icon}</div>
          <div className="text-xs font-bold mb-2" style={{ color: m.color, letterSpacing: '0.08em' }}>
            파트 {partNum} / 3
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {m.label}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            {m.intro}
          </p>

          {/* 척도 안내 — 텍스트만 */}
          <div className="flex justify-between text-[11px] mb-6 px-1" style={{ color: 'var(--muted2)' }}>
            <span>1 = {m.scaleLabels[0].replace('\n', ' ')}</span>
            <span>3 = 보통</span>
            <span>5 = {m.scaleLabels[4].replace('\n', ' ')}</span>
          </div>

          <button
            onClick={() => setSectionIntro(null)}
            className="btn-primary w-full"
            style={{ justifyContent: 'center', padding: '14px', background: `linear-gradient(135deg, ${m.color}cc, ${m.color})` }}
          >
            시작 →
          </button>
          <p className="mt-3 text-xs" style={{ color: 'var(--muted2)' }}>Enter 또는 스페이스로 시작</p>
        </div>
      </main>
    )
  }

  const progress = ((current + 1) / TOTAL) * 100

  // Likert 버튼 색상: 낮을수록 차갑고 어둡게, 높을수록 섹션 accent 색으로
  const SECTION_COLORS: Record<SectionKey, string[]> = {
    hexaco:   ['#4b5563','#6b7280','#7c3aed','#8b5cf6','#a78bfa'],
    riasec:   ['#4b5563','#6b7280','#059669','#10b981','#34d399'],
    aptitude: ['#4b5563','#6b7280','#be185d','#db2777','#f472b6'],
  }
  function btnColor(val: number): string {
    return SECTION_COLORS[section][val - 1]
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-5 page-top" style={{ paddingBottom: 32 }}>

      {/* 전체 진행 바 */}
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

      {/* 문항 카드 */}
      <div className={`w-full max-w-xl glass rounded-2xl p-6 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[11px] font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--muted2)' }}>
          {q.section === 'hexaco' ? '동의 정도를 선택하세요' : q.section === 'riasec' ? '이 활동에 얼마나 끌리나요?' : '동의 정도를 선택하세요'}
        </p>
        <p className="text-base font-medium leading-relaxed mb-8" style={{ color: 'var(--text)', lineHeight: 1.85 }}>
          {q.text}
        </p>

        {/* Likert 5점 버튼 */}
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
                  className="w-full rounded-xl flex items-center justify-center font-bold text-base transition-all duration-150"
                  style={{
                    height: 52,
                    background: isSelected ? btnColor(val) : 'var(--surface2)',
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

        <p className="mt-4 text-xs text-center" style={{ color: 'var(--muted2)' }}>
          숫자키 1~5 · Enter로 다음 이동
        </p>
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
            background: selected !== null ? `linear-gradient(135deg, #7c3aed, ${meta.color})` : 'var(--surface2)',
            borderColor: selected !== null ? undefined : 'var(--border)',
            boxShadow: 'none',
            justifyContent: 'center',
          }}
        >
          {isLast ? '결과 보기 →' : '다음 →'}
        </button>
      </div>

    </main>
  )
}
