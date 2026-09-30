'use client'

import { useEffect, useState } from 'react'
import type { Lang } from '@/lib/i18n'

const GOLD = '#c8a030'

const KO = {
  labels: ['별로예요', '아쉬워요', '보통이에요', '좋아요', '아주 좋아요'],
  aria: (v: number, label: string) => `${v}점, ${label}`,
  failed: '저장하지 못했어요. 잠시 후 다시 눌러 주세요.',
  thanks: '의견 고마워요. 검사를 다듬는 데 그대로 반영할게요.',
  question: '이 결과, 얼마나 만족스러우셨나요?',
  liked: '어떤 점이 좋았나요?',
  missed: '어떤 점이 아쉬웠나요?',
  optional: '(선택)',
  placeholder: '이름·연락처 같은 개인정보는 적지 말아 주세요',
  send: '의견 보내기',
  skip: '이대로 마치기',
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    labels: ['Poor', 'Meh', 'Okay', 'Good', 'Great'],
    aria: (v: number, label: string) => `${v} out of 5, ${label}`,
    failed: 'We couldn’t save that. Please try again in a moment.',
    thanks: 'Thanks for the feedback — it goes straight into improving the test.',
    question: 'How satisfied are you with this result?',
    liked: 'What did you like?',
    missed: 'What felt off?',
    optional: '(optional)',
    placeholder: 'Please don’t include your name or contact details',
    send: 'Send feedback',
    skip: 'Done',
  },
}

// 결과 만족도 — 관리자 관문 지표(평균 4.0)의 데이터. 별점은 누르는 즉시 저장, 의견은 선택
export default function ResultFeedback({ testId, lang = 'ko' }: { testId: string; lang?: Lang }) {
  const t = T[lang]
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
    if (!res?.ok) { setError(t.failed); return false }
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
    return <p style={{ fontSize: 14, color: 'rgba(239,230,210,0.7)', textAlign: 'center' }}>{t.thanks}</p>
  }

  return (
    <div>
      <p id="feedback-q" style={{ fontSize: 15, fontWeight: 700, color: '#efe6d2', marginBottom: 12 }}>{t.question}</p>
      <div role="radiogroup" aria-labelledby="feedback-q" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
        {t.labels.map((label, i) => {
          const v = i + 1
          const on = rating === v
          return (
            <button key={v} role="radio" aria-checked={on} aria-label={t.aria(v, label)} onClick={() => rate(v)} style={{
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
            {rating >= 4 ? t.liked : t.missed} <span style={{ color: 'rgba(239,230,210,0.45)' }}>{t.optional}</span>
          </label>
          <textarea id="feedback-opinion" value={opinion} onChange={e => setOpinion(e.target.value)} maxLength={500} rows={3}
            placeholder={t.placeholder}
            style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: '1px solid rgba(200,160,48,0.25)', background: 'rgba(0,0,0,0.25)', color: '#efe6d2', fontSize: 14, lineHeight: 1.6, resize: 'vertical' }} />
          <button onClick={submitOpinion} style={{
            marginTop: 8, width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${GOLD}`, background: 'transparent', color: '#e2c064', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>{opinion.trim() ? t.send : t.skip}</button>
        </div>
      )}
      {error && <p role="alert" style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  )
}
