'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { PATHS, type Lang } from '@/lib/i18n'

type Status = 'idle' | 'sending' | 'done' | 'error'

const KO = {
  badEmail: '이메일 형식을 확인해 주세요. 예: name@example.com',
  failed: '신청이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.',
  doneTitle: '사전 알림 신청 완료',
  doneBody: (email: string) => `진로 리포트가 열리면 ${email}로 가장 먼저 알려드릴게요.`,
  label: '출시 알림 받을 이메일',
  sending: '신청 중…',
  submit: '알림 신청',
  help: '이메일은 진로 리포트 출시 알림에만 쓰고, 알림을 보낸 뒤 삭제합니다.',
  privacy: '개인정보 처리방침',
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    badEmail: 'Please check your email address. Example: name@example.com',
    failed: 'We couldn’t save your sign-up. Please try again in a moment.',
    doneTitle: 'You’re on the list',
    doneBody: (email: string) => `We’ll email ${email} as soon as the full report is ready.`,
    label: 'Email for the launch notice',
    sending: 'Signing up…',
    submit: 'Notify me',
    help: 'We’ll use your email only to tell you when the full report launches, then delete it.',
    privacy: 'Privacy Policy',
  },
}

export default function WaitlistForm({ source, archetypeId, lang = 'ko' }: { source: 'home' | 'report'; archetypeId?: string; lang?: Lang }) {
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error'); setMessage(t.badEmail)
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale: lang }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      trackEvent('waitlist_signup', { source, archetype_primary: archetypeId ?? null }).catch(() => {})
    } catch {
      setStatus('error'); setMessage(t.failed)
    }
  }

  if (status === 'done') {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '14px', borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>{t.doneTitle}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{t.doneBody(email)}</p>
      </div>
    )
  }

  const inputId = `waitlist-email-${source}`
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={inputId} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
        {t.label}
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
          {status === 'sending' ? t.sending : t.submit}
        </button>
      </div>
      <p id={`${inputId}-help`} role={status === 'error' ? 'alert' : undefined} style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5, color: status === 'error' ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
        {status === 'error' ? message : <>{t.help} <a href={PATHS[lang].privacy} target="_blank" rel="noopener" style={{ color: 'rgba(226,192,100,0.8)' }}>{t.privacy}</a></>}
      </p>
    </form>
  )
}
