'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PaidLandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {}
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full">
        <div
          className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', letterSpacing: '0.06em' }}
        >
          COMING SOON
        </div>
        <h1 className="text-3xl font-extrabold mb-4 leading-tight" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
          심층 정밀 검사<br />
          <span style={{ color: '#a78bfa' }}>출시 준비 중입니다</span>
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
          HEXACO 24 하위 요인 · Holland RIASEC 직접 측정 · 번아웃 취약 패턴 분석을 포함한
          90문항 심층 검사를 준비하고 있습니다.
        </p>

        {submitted ? (
          <div
            className="rounded-xl px-6 py-5 text-sm font-medium"
            style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.25)', color: '#2dd4bf' }}
          >
            등록 완료 — 오픈 시 알림을 보내드립니다
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              required
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ justifyContent: 'center', padding: '14px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '처리 중...' : '오픈 알림 신청하기'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            href="/test"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent2)', textDecoration: 'none' }}
          >
            무료 검사 먼저 해보기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
