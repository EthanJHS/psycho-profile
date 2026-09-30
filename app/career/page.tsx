'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LIFE_STAGES, GOALS, itemCount, type LifeStage, type Plan } from '@/lib/paid-v2/items'
import { isAvailable } from '@/lib/career/flow'
import { loadConsent, saveConsent } from '@/lib/consent'
import ConsentSheet from '@/components/ConsentSheet'
import { readFreeAnswers } from '@/lib/career/free-link'

const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.62)'
const SERIF = 'var(--font-serif), serif'
const PLANS: { id: Plan; label: string }[] = [{ id: 'find', label: '탐색' }, { id: 'do', label: '향상' }, { id: 'both', label: '묶음 (탐색 + 향상)' }]

function Option({ selected, disabled, onClick, title, desc, meta }: { selected: boolean; disabled?: boolean; onClick: () => void; title: string; desc?: string; meta?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-pressed={selected} style={{
      textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: disabled ? 'not-allowed' : 'pointer', width: '100%',
      border: `1px solid ${selected ? 'rgba(226,192,100,0.8)' : 'rgba(200,160,48,0.25)'}`,
      background: selected ? 'rgba(200,160,48,0.12)' : 'rgba(21,17,28,0.8)', opacity: disabled ? 0.45 : 1,
    }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</span>
        {meta && <span style={{ fontSize: 12, color: disabled ? MUTED : GOLD, flexShrink: 0 }}>{meta}</span>}
      </span>
      {desc && <span style={{ display: 'block', fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>{desc}</span>}
    </button>
  )
}

export default function CareerStartPage() {
  const router = useRouter()
  const [hasHexaco, setHasHexaco] = useState<boolean | null>(null)
  const [stage, setStage] = useState<LifeStage>('jobseeker')
  const [plan, setPlan] = useState<Plan>('find')
  const [askConsent, setAskConsent] = useState(false)

  useEffect(() => { setHasHexaco(!!readFreeAnswers()) }, [])

  const go = () => router.push(`/career/test?stage=${stage}&plan=${plan}`)
  const start = () => (loadConsent() ? go() : setAskConsent(true))

  if (askConsent) return <ConsentSheet onAgree={c => { saveConsent(c); go() }} />

  const ready = isAvailable(stage, plan)
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 64px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>CORE CAREER</p>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: TEXT, lineHeight: 1.35, marginBottom: 10 }}>
          이미 당신의 성격은 알고 있어요.<br />이번엔 흥미와 가치를 더할게요
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 26 }}>
          무료 원형 검사 결과에 추가 질문을 더해, 지금 시기에 맞는 진로 리포트를 만들어 드려요.
        </p>

        {hasHexaco === false ? (
          <div style={{ border: '1px solid rgba(200,160,48,0.3)', borderRadius: 14, padding: 18, background: 'rgba(21,17,28,0.8)' }}>
            <p style={{ fontSize: 14, color: TEXT, marginBottom: 6, lineHeight: 1.6 }}>먼저 무료 원형 검사(48문항)를 해 주세요. 그 결과를 바탕으로 리포트를 만들어요.</p>
            <p style={{ fontSize: 12.5, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>이미 검사를 했다면, 저장해 둔 &ldquo;내 결과 링크&rdquo;를 이 브라우저 탭에서 먼저 연 뒤 다시 들어오세요.</p>
            <Link href="/hexaco-test?start=1" style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 999, background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>무료 원형 검사 시작 →</Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 10 }}>지금 나는</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {LIFE_STAGES.map(s => <Option key={s.id} selected={stage === s.id} onClick={() => setStage(s.id)} title={s.label} />)}
            </div>

            <h2 style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 10 }}>알고 싶은 것</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {PLANS.map(p => (
                <Option key={p.id} selected={plan === p.id} onClick={() => setPlan(p.id)}
                  title={p.label}
                  desc={p.id === 'both' ? '맞는 길을 찾고, 지금 자리에서 더 잘하는 법까지' : GOALS[p.id].desc[stage]}
                  meta={isAvailable(stage, p.id) ? `추가 ${itemCount(stage, p.id)}문항` : '준비 중'} />
              ))}
            </div>

            <button onClick={start} disabled={!ready || !hasHexaco} style={{
              width: '100%', padding: 16, borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 800,
              cursor: ready ? 'pointer' : 'not-allowed',
              background: ready ? 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)' : 'rgba(255,255,255,0.06)',
              color: ready ? '#1a1206' : 'rgba(255,255,255,0.35)',
            }}>
              {ready ? `추가 질문 시작하기 (약 ${Math.ceil(itemCount(stage, plan) * 8 / 60)}분)` : '이 조합은 준비 중이에요'}
            </button>
            {plan === 'both' && (
              <p style={{ fontSize: 12, color: 'rgba(239,230,210,0.45)', marginTop: 10, textAlign: 'center', lineHeight: 1.6 }}>
                묶음은 질문이 많아요. 중간에 멈춰도 같은 탭에서 이어서 할 수 있어요.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
