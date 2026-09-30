'use client'

import { useEffect, useState } from 'react'

const GOLD = '#c8a030'
const LABELS = ['별로예요', '아쉬워요', '보통이에요', '좋아요', '아주 좋아요']

// 결과 만족도 — 관리자 관문 지표(평균 4.0)의 데이터. 별점은 누르는 즉시 저장, 의견은 선택
export default function ResultFeedback({ testId }: { testId: string }) {
  const doneKey = `ct_feedback_${testId}`
  const [rating, setRating] = useState(0)
  const [opinion, setOpinion] = useState('')
  const [stage, setStage] = useState<'rate' | 'opinion' | 'done'>('rate')
  const [error, setError] = useState('')

  useEffect(() => {
    try { if (localStorage.getItem(doneKey)) setStage('done') } catch { /* 저장 공간 없음 */ }
  }, [doneKey])

  async function send(r: number, text?: string) {
    setError('')
    const res = await fetch('/api/survey', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: r, testSessionId: testId, ...(text != null ? { opinion: text } : {}) }),
    }).catch(() => null)
    if (!res?.ok) { setError('저장하지 못했어요. 잠시 후 다시 눌러 주세요.'); return false }
    return true
  }

  async function rate(r: number) {
    setRating(r)
    if (await send(r)) setStage('opinion')
  }

  async function submitOpinion() {
    if (opinion.trim() && !(await send(rating, opinion))) return
    try { localStorage.setItem(doneKey, '1') } catch { /* 저장 공간 없음 */ }
    setStage('done')
  }

  if (stage === 'done') {
    return <p style={{ fontSize: 14, color: 'rgba(239,230,210,0.7)', textAlign: 'center' }}>의견 고마워요. 검사를 다듬는 데 그대로 반영할게요.</p>
  }

  return (
    <div>
      <p id="feedback-q" style={{ fontSize: 15, fontWeight: 700, color: '#efe6d2', marginBottom: 12 }}>이 결과, 얼마나 만족스러우셨나요?</p>
      <div role="radiogroup" aria-labelledby="feedback-q" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
        {LABELS.map((label, i) => {
          const v = i + 1
          const on = rating === v
          return (
            <button key={v} role="radio" aria-checked={on} aria-label={`${v}점, ${label}`} onClick={() => rate(v)} style={{
              padding: '10px 2px', borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              border: `1px solid ${on ? 'rgba(226,192,100,0.85)' : 'rgba(200,160,48,0.25)'}`,
              background: on ? 'rgba(200,160,48,0.16)' : 'rgba(255,255,255,0.02)',
            }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: on ? '#e2c064' : 'rgba(239,230,210,0.8)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
              <span style={{ fontSize: 11, color: 'rgba(239,230,210,0.55)', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
            </button>
          )
        })}
      </div>

      {stage === 'opinion' && (
        <div style={{ marginTop: 14 }}>
          <label htmlFor="feedback-opinion" style={{ display: 'block', fontSize: 13, color: 'rgba(239,230,210,0.7)', marginBottom: 6 }}>
            {rating >= 4 ? '어떤 점이 좋았나요?' : '어떤 점이 아쉬웠나요?'} <span style={{ color: 'rgba(239,230,210,0.45)' }}>(선택)</span>
          </label>
          <textarea id="feedback-opinion" value={opinion} onChange={e => setOpinion(e.target.value)} maxLength={500} rows={3}
            placeholder="이름·연락처 같은 개인정보는 적지 말아 주세요"
            style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: '1px solid rgba(200,160,48,0.25)', background: 'rgba(0,0,0,0.25)', color: '#efe6d2', fontSize: 14, lineHeight: 1.6, resize: 'vertical' }} />
          <button onClick={submitOpinion} style={{
            marginTop: 8, width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${GOLD}`, background: 'transparent', color: '#e2c064', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>{opinion.trim() ? '의견 보내기' : '이대로 마치기'}</button>
        </div>
      )}
      {error && <p role="alert" style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  )
}
