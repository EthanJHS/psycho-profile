'use client'

import { useState } from 'react'
import type { TestConsent } from '@/lib/consent'

const GOLD = '#c8a030'

export default function ConsentSheet({ onAgree }: { onAgree: (c: TestConsent) => void }) {
  const [required, setRequired] = useState(false)
  const [research, setResearch] = useState(false)

  return (
    <main className="page-top" style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '88px 16px 48px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>시작하기 전에</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 24, fontWeight: 700, color: '#efe6d2', marginBottom: 10 }}>
          응답은 이렇게 쓰여요
        </h1>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            '이름·연락처는 받지 않아요.',
            '저장되는 것: 문항 응답과 점수, 그리고 서비스 개선용 이용 기록(방문 경로, 기기 종류, 진행·중단 위치 같은 화면 이용 기록)',
            '보안을 위해 서버에 접속 기록(IP 주소 등)이 남아요.',
            '결과 제공과 이용 통계에 쓰고, 3년 뒤 파기해요. 요청하면 언제든 삭제해 드려요.',
          ].map(t => (
            <li key={t} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'rgba(239,230,210,0.7)', lineHeight: 1.6 }}>
              <span aria-hidden style={{ width: 5, height: 5, marginTop: 8, flexShrink: 0, transform: 'rotate(45deg)', background: GOLD }} />
              {t}
            </li>
          ))}
        </ul>

        <div style={{ border: '1px solid rgba(200,160,48,0.28)', borderRadius: 14, padding: '6px 16px', background: 'rgba(21,17,28,0.8)', marginBottom: 14 }}>
          <label htmlFor="consent-required" style={{ display: 'flex', gap: 12, padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid rgba(200,160,48,0.14)' }}>
            <input id="consent-required" type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: GOLD }} />
            <span style={{ fontSize: 14, color: '#efe6d2', lineHeight: 1.55 }}>
              <b style={{ color: GOLD }}>[필수]</b> 만 14세 이상이며, 검사 응답을 결과 제공과 이용 통계에 쓰는 데 동의합니다
            </span>
          </label>
          <label htmlFor="consent-research" style={{ display: 'flex', gap: 12, padding: '12px 0', cursor: 'pointer' }}>
            <input id="consent-research" type="checkbox" checked={research} onChange={e => setResearch(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: GOLD }} />
            <span style={{ fontSize: 14, color: '#efe6d2', lineHeight: 1.55 }}>
              <b style={{ color: 'rgba(239,230,210,0.6)' }}>[선택]</b> 누구인지 알 수 없도록 처리한 응답을 검사 개선과 연구에 쓰는 데 동의합니다
              <span style={{ display: 'block', fontSize: 12, color: 'rgba(239,230,210,0.45)', marginTop: 2 }}>동의하지 않아도 검사와 결과는 똑같이 이용할 수 있어요.</span>
            </span>
          </label>
        </div>

        <p style={{ display: 'flex', gap: 14, fontSize: 12.5, marginBottom: 20 }}>
          <a href="/privacy" target="_blank" rel="noopener" style={{ color: 'rgba(226,192,100,0.85)' }}>개인정보 처리방침 ↗</a>
          <a href="/terms" target="_blank" rel="noopener" style={{ color: 'rgba(226,192,100,0.85)' }}>이용약관 ↗</a>
        </p>

        <button
          onClick={() => onAgree({ research })}
          disabled={!required}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 800,
            cursor: required ? 'pointer' : 'not-allowed',
            background: required ? 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)' : 'rgba(255,255,255,0.06)',
            color: required ? '#1a1206' : 'rgba(255,255,255,0.3)',
          }}
        >
          동의하고 시작하기
        </button>
        {!required && (
          <p style={{ fontSize: 12, color: 'rgba(239,230,210,0.4)', textAlign: 'center', marginTop: 10 }}>필수 항목에 동의하면 시작할 수 있어요.</p>
        )}
        <p style={{ fontSize: 11.5, color: 'rgba(239,230,210,0.35)', lineHeight: 1.6, marginTop: 18 }}>
          만 14세 미만은 법정대리인의 동의가 필요해 지금은 이용할 수 없어요.
        </p>
      </div>
    </main>
  )
}
