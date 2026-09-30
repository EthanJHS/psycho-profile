'use client'

import { useState } from 'react'
import type { TestConsent } from '@/lib/consent'
import { PATHS, type Lang } from '@/lib/i18n'

const GOLD = '#c8a030'

// 영어판 이용 연령은 16세 이상 — EU GDPR의 아동 동의 연령(국가별 13~16세) 중 가장 높은 기준에 맞춤
const KO = {
  eyebrow: '시작하기 전에',
  title: '응답은 이렇게 쓰여요',
  points: [
    '이름·연락처는 받지 않아요.',
    '저장되는 것: 문항 응답과 점수, 그리고 서비스 개선용 이용 기록(방문 경로, 기기 종류, 진행·중단 위치 같은 화면 이용 기록)',
    '보안을 위해 서버에 접속 기록(IP 주소 등)이 남아요.',
    '결과 제공과 이용 통계에 쓰고, 3년 뒤 파기해요. 요청하면 언제든 삭제해 드려요.',
  ],
  required: '[필수]',
  requiredText: '만 14세 이상이며, 검사 응답을 결과 제공과 이용 통계에 쓰는 데 동의합니다',
  optional: '[선택]',
  optionalText: '누구인지 알 수 없도록 처리한 응답을 검사 개선과 연구에 쓰는 데 동의합니다',
  optionalNote: '동의하지 않아도 검사와 결과는 똑같이 이용할 수 있어요.',
  privacy: '개인정보 처리방침 ↗',
  terms: '이용약관 ↗',
  cta: '동의하고 시작하기',
  needRequired: '필수 항목에 동의하면 시작할 수 있어요.',
  age: '만 14세 미만은 법정대리인의 동의가 필요해 지금은 이용할 수 없어요.',
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    eyebrow: 'BEFORE YOU START',
    title: 'How your answers are used',
    points: [
      'We don’t ask for your name, email, or any contact details.',
      'What we store: your answers and scores, plus usage data to improve the service (how you arrived, device type, and where you paused or stopped).',
      'For security, our servers keep access logs (such as IP addresses).',
      'We use this to give you your result and to understand usage, and delete it after 3 years. You can ask us to delete it at any time.',
    ],
    required: '[Required]',
    requiredText: 'I am 16 or older, and I agree to my answers being used to provide my result and for usage statistics.',
    optional: '[Optional]',
    optionalText: 'I agree to my de-identified answers being used to improve the test and for research.',
    optionalNote: 'You’ll get the same test and result either way.',
    privacy: 'Privacy Policy ↗',
    terms: 'Terms of Use ↗',
    cta: 'Agree and start',
    needRequired: 'Please agree to the required item to start.',
    age: 'This test is only available to people aged 16 and over.',
  },
}

export default function ConsentSheet({ onAgree, lang = 'ko' }: { onAgree: (c: TestConsent) => void; lang?: Lang }) {
  const [required, setRequired] = useState(false)
  const [research, setResearch] = useState(false)
  const t = T[lang]

  return (
    <main className="page-top" style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '88px 16px 48px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>{t.eyebrow}</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 24, fontWeight: 700, color: '#efe6d2', marginBottom: 10 }}>
          {t.title}
        </h1>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {t.points.map(p => (
            <li key={p} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'rgba(239,230,210,0.7)', lineHeight: 1.6 }}>
              <span aria-hidden style={{ width: 5, height: 5, marginTop: 8, flexShrink: 0, transform: 'rotate(45deg)', background: GOLD }} />
              {p}
            </li>
          ))}
        </ul>

        <div style={{ border: '1px solid rgba(200,160,48,0.28)', borderRadius: 14, padding: '6px 16px', background: 'rgba(21,17,28,0.8)', marginBottom: 14 }}>
          <label htmlFor="consent-required" style={{ display: 'flex', gap: 12, padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid rgba(200,160,48,0.14)' }}>
            <input id="consent-required" type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: GOLD }} />
            <span style={{ fontSize: 14, color: '#efe6d2', lineHeight: 1.55 }}>
              <b style={{ color: GOLD }}>{t.required}</b> {t.requiredText}
            </span>
          </label>
          <label htmlFor="consent-research" style={{ display: 'flex', gap: 12, padding: '12px 0', cursor: 'pointer' }}>
            <input id="consent-research" type="checkbox" checked={research} onChange={e => setResearch(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: GOLD }} />
            <span style={{ fontSize: 14, color: '#efe6d2', lineHeight: 1.55 }}>
              <b style={{ color: 'rgba(239,230,210,0.6)' }}>{t.optional}</b> {t.optionalText}
              <span style={{ display: 'block', fontSize: 12, color: 'rgba(239,230,210,0.45)', marginTop: 2 }}>{t.optionalNote}</span>
            </span>
          </label>
        </div>

        <p style={{ display: 'flex', gap: 14, fontSize: 12.5, marginBottom: 20 }}>
          <a href={PATHS[lang].privacy} target="_blank" rel="noopener" style={{ color: 'rgba(226,192,100,0.85)' }}>{t.privacy}</a>
          <a href={PATHS[lang].terms} target="_blank" rel="noopener" style={{ color: 'rgba(226,192,100,0.85)' }}>{t.terms}</a>
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
          {t.cta}
        </button>
        {!required && (
          <p style={{ fontSize: 12, color: 'rgba(239,230,210,0.4)', textAlign: 'center', marginTop: 10 }}>{t.needRequired}</p>
        )}
        <p style={{ fontSize: 11.5, color: 'rgba(239,230,210,0.35)', lineHeight: 1.6, marginTop: 18 }}>
          {t.age}
        </p>
      </div>
    </main>
  )
}
