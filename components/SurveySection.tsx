'use client'

import { useState } from 'react'

const SECTIONS = [
  '성격 프로파일 (HEXACO)',
  '성격 강점',
  '업무 스타일',
  '진로 적합도',
  '직업 흥미 (RIASEC)',
  '학문 적성',
  '투자 성향',
  '리더십',
  '번아웃 리스크',
  '가치관',
  '삶의 균형',
  '통합 분석',
]

interface Props {
  resultType: 'free' | 'paid'
}

export default function SurveySection({ resultType }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [opinion, setOpinion] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleSection(s: string) {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function handleSubmit() {
    if (rating === 0) { setError('별점을 선택해주세요.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, sections: selected, opinion, email, resultType }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('제출에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="glass rounded-2xl p-6 text-center space-y-2">
        <div className="text-3xl">🙏</div>
        <p className="font-semibold" style={{ color: 'var(--text)' }}>소중한 의견 감사합니다!</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {email ? '출시 알림을 보내드릴게요.' : '더 좋은 서비스를 만드는 데 활용할게요.'}
        </p>
      </section>
    )
  }

  return (
    <section className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>💬</span> 검사 후기
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          1분이면 충분해요. 더 좋은 서비스를 만드는 데 직접 반영됩니다.
        </p>
      </div>

      {/* 별점 */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
          결과가 나를 얼마나 잘 표현하나요?
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform hover:scale-110 active:scale-95"
              style={{ filter: n <= (hovered || rating) ? 'none' : 'grayscale(1) opacity(0.35)' }}
            >
              ⭐
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {['', '많이 다른 것 같아요', '조금 다른 것 같아요', '대체로 맞아요', '꽤 정확해요', '정말 정확해요!'][rating]}
          </p>
        )}
      </div>

      {/* 섹션 선택 */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
          가장 인상 깊었던 섹션은? <span className="font-normal text-xs" style={{ color: 'var(--muted)' }}>(복수 선택)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(resultType === 'paid' ? SECTIONS : SECTIONS.slice(0, 2)).map(s => (
            <button
              key={s}
              onClick={() => toggleSection(s)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background: selected.includes(s) ? 'rgba(124,77,204,0.25)' : 'var(--surface2)',
                border: `1px solid ${selected.includes(s) ? 'rgba(160,126,224,0.6)' : 'var(--border)'}`,
                color: selected.includes(s) ? '#d4b8f8' : 'var(--muted)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 의견 */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
          개선할 점이나 하고 싶은 말 <span className="font-normal text-xs" style={{ color: 'var(--muted)' }}>(선택)</span>
        </p>
        <textarea
          value={opinion}
          onChange={e => setOpinion(e.target.value)}
          placeholder="자유롭게 적어주세요"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* 이메일 */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
          출시 알림 받기 <span className="font-normal text-xs" style={{ color: 'var(--muted)' }}>(선택)</span>
        </p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-85 active:scale-95 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(124,77,204,0.4), rgba(160,126,224,0.25))',
          border: '1px solid rgba(160,126,224,0.55)',
          color: '#d4b8f8',
        }}
      >
        {submitting ? '제출 중...' : '후기 남기기'}
      </button>
    </section>
  )
}
