'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function WaitlistForm({ source, archetypeId }: { source: 'home' | 'report'; archetypeId?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error'); setMessage('이메일 형식을 확인해 주세요. 예: name@example.com')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      trackEvent('waitlist_signup', { source, archetype_primary: archetypeId ?? null }).catch(() => {})
    } catch {
      setStatus('error'); setMessage('신청이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  if (status === 'done') {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '14px', borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>사전 알림 신청 완료</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>진로 리포트가 열리면 {email}로 가장 먼저 알려드릴게요.</p>
      </div>
    )
  }

  const inputId = `waitlist-email-${source}`
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={inputId} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
        출시 알림 받을 이메일
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
          aria-invalid={status === 'error'}
          aria-describedby={`${inputId}-help`}
          style={{
            flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 12, fontSize: 14, color: '#fff',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${status === 'error' ? 'rgba(248,113,113,0.6)' : 'rgba(200,168,75,0.3)'}`,
            outlineColor: '#c8a030',
          }}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            flexShrink: 0, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #92680a, #c8a030)', color: '#1a1000', fontSize: 14, fontWeight: 800,
            opacity: status === 'sending' ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? '신청 중…' : '알림 신청'}
        </button>
      </div>
      <p id={`${inputId}-help`} role={status === 'error' ? 'alert' : undefined} style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5, color: status === 'error' ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
        {status === 'error' ? message : <>이메일은 진로 리포트 출시 알림에만 쓰고, 알림을 보낸 뒤 삭제합니다. <a href="/privacy" target="_blank" rel="noopener" style={{ color: 'rgba(226,192,100,0.8)' }}>개인정보 처리방침</a></>}
      </p>
    </form>
  )
}
