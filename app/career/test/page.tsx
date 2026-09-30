'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { buildScreens, isAnswered, isAvailable, type Screen } from '@/lib/career/flow'
import type { Answers } from '@/lib/career/score'
import { readFreeAnswers, freeResultCode } from '@/lib/career/free-link'
import { rememberReport } from '@/lib/career/my-reports'
import { VALUE_CARDS, LIFE_STAGES, type LifeStage, type Plan } from '@/lib/paid-v2/items'
import { ensureProfile } from '@/lib/profile'
import { loadConsent } from '@/lib/consent'

const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.62)'
const SERIF = 'var(--font-serif), serif'
const KEY = 'ct_career_progress'

interface Progress { stage: LifeStage; plan: Plan; assessmentId: string; answers: Answers; idx: number; freeCode: string | null }

// 검사 기록은 서버에서 생성 (익명 사용자는 assessments에 직접 쓸 수 없음)
async function createAssessment(stage: LifeStage, plan: Plan): Promise<string | null> {
  try {
    const res = await fetch('/api/career/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage, plan, profileId: await ensureProfile(),
        hexacoSessionId: sessionStorage.getItem('pp_test_session_id'),
        research: loadConsent()?.research === true,
      }),
    })
    return res.ok ? ((await res.json()) as { id: string }).id : null
  } catch { return null }
}

export default function CareerTestPage() {
  return <Suspense fallback={null}><CareerTest /></Suspense>
}

function CareerTest() {
  const router = useRouter()
  const params = useSearchParams()
  const stage = params.get('stage') as LifeStage
  const plan = params.get('plan') as Plan
  const screens = useMemo(() => (stage && plan ? buildScreens(stage, plan) : []), [stage, plan])
  const [answers, setAnswers] = useState<Answers>({})
  const [idx, setIdx] = useState(0)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [freeCode, setFreeCode] = useState<string | null>(null)
  const advancing = useRef(false)

  // 시작: 조건 확인 → 이어하기 또는 새 검사 기록 생성
  useEffect(() => {
    if (!LIFE_STAGES.some(s => s.id === stage) || !isAvailable(stage, plan)) { router.replace('/career'); return }
    const free = readFreeAnswers()
    if (!free) { router.replace('/career'); return }
    const freeCode = freeResultCode(free)
    const consent = loadConsent()
    if (!consent) { router.replace('/career'); return }
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Progress | null
      // 같은 시기·목적이고, 그 사이 무료 결과가 바뀌지 않았을 때만 이어하기
      if (saved && saved.stage === stage && saved.plan === plan && saved.freeCode === freeCode) {
        setAnswers(saved.answers); setIdx(saved.idx); setAssessmentId(saved.assessmentId); setFreeCode(saved.freeCode)
        return
      }
    } catch { /* 새로 시작 */ }
    setFreeCode(freeCode)
    createAssessment(stage, plan).then(id => { if (id) setAssessmentId(id) })
  }, [stage, plan, router])

  useEffect(() => {
    if (!assessmentId) return
    sessionStorage.setItem(KEY, JSON.stringify({ stage, plan, assessmentId, answers, idx, freeCode } satisfies Progress))
  }, [stage, plan, assessmentId, answers, idx, freeCode])

  const screen: Screen | undefined = screens[idx]
  const total = screens.length

  const finish = useCallback(async (final: Answers) => {
    setBusy(true); setError('')
    try {
      const hexAnswers = readFreeAnswers()
      if (!hexAnswers) { router.replace('/career'); return }
      // 시작할 때 기록 생성에 실패했으면 여기서 다시 시도
      const id = assessmentId ?? await createAssessment(stage, plan)
      if (!id) throw new Error('no assessment')
      setAssessmentId(id)
      // 점수는 서버가 응답과 무료 결과 코드로 다시 계산 (무료 결과와의 연결 고리이기도 함)
      const res = await fetch(`/api/career/${id}/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: final, freeCode: freeResultCode(hexAnswers) }),
      })
      if (!res.ok) throw new Error(String(res.status))
      rememberReport({ id, stage, plan, at: new Date().toISOString() })
      sessionStorage.removeItem(KEY)
      router.push(`/career/report/${id}`)
    } catch {
      setBusy(false)
      setError('결과를 저장하지 못했어요. 네트워크를 확인하고 다시 눌러 주세요.')
    }
  }, [assessmentId, stage, plan, router])

  const next = useCallback((a: Answers) => {
    if (idx >= total - 1) { finish(a); return }
    setIdx(i => i + 1)
  }, [idx, total, finish])

  function answerScale(id: string, v: number) {
    if (advancing.current) return
    const a = { ...answers, [id]: v }
    setAnswers(a)
    advancing.current = true
    setTimeout(() => { advancing.current = false; next(a) }, 260)
  }

  if (!screen) return null
  const pct = Math.round((idx / total) * 100)

  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '84px 16px 48px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>{screen.section}</span>
          <span style={{ fontSize: 12, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {total}</span>
        </div>
        <div aria-hidden style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.07)', marginBottom: 22 }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #a8781f, #e2c064)', transition: 'width .3s' }} />
        </div>

        {screen.kind === 'scale' && (
          <div key={screen.id}>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>{screen.prompt}</p>
            <p id={`q-${screen.id}`} style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, lineHeight: 1.5, marginBottom: 20 }}>{screen.text}</p>
            <div role="radiogroup" aria-labelledby={`q-${screen.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {screen.scale.map((label, i) => {
                const v = i + 1
                const on = answers[screen.id] === v
                return (
                  <button key={v} role="radio" aria-checked={on} onClick={() => answerScale(screen.id, v)} style={{
                    display: 'flex', gap: 12, alignItems: 'center', padding: '13px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${on ? 'rgba(226,192,100,0.8)' : 'rgba(255,255,255,0.08)'}`,
                    background: on ? 'rgba(200,160,48,0.16)' : 'rgba(255,255,255,0.03)', color: TEXT, fontSize: 14.5,
                  }}>
                    <span style={{ fontSize: 12, color: on ? GOLD : 'rgba(255,255,255,0.3)', width: 12 }}>{v}</span>{label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {screen.kind === 'choice' && (() => {
          const it = screen.item
          const multi = !!it.maxSelect
          const cur = answers[it.id]
          const selected: string[] = Array.isArray(cur) ? cur : typeof cur === 'string' ? [cur] : []
          const toggle = (o: string) => {
            if (!multi) { const a = { ...answers, [it.id]: o }; setAnswers(a); setTimeout(() => next(a), 220); return }
            setAnswers(prev => {
              const cur = Array.isArray(prev[it.id]) ? (prev[it.id] as string[]) : []
              const nextSel = cur.includes(o) ? cur.filter(x => x !== o) : cur.length < it.maxSelect! ? [...cur, o] : cur
              return { ...prev, [it.id]: nextSel }
            })
          }
          return (
            <div key={it.id}>
              <p id={`q-${it.id}`} style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, lineHeight: 1.5, marginBottom: 6 }}>{it.text}</p>
              <p style={{ fontSize: 12.5, color: MUTED, marginBottom: 16 }}>{multi ? `최대 ${it.maxSelect}개까지 고를 수 있어요` : '하나를 골라 주세요'}{it.optional ? ' · 건너뛰어도 돼요' : ''}</p>
              <div role={multi ? 'group' : 'radiogroup'} aria-labelledby={`q-${it.id}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {it.options.map(o => {
                  const on = selected.includes(o)
                  return (
                    <button key={o} role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={() => toggle(o)} style={{
                      padding: '10px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 14,
                      border: `1px solid ${on ? 'rgba(226,192,100,0.8)' : 'rgba(255,255,255,0.12)'}`,
                      background: on ? 'rgba(200,160,48,0.16)' : 'rgba(255,255,255,0.03)', color: TEXT,
                    }}>{o}</button>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {screen.kind === 'cards' && (
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT, lineHeight: 1.5, marginBottom: 6 }}>{screen.prompt}</p>
            <p style={{ fontSize: 12.5, color: MUTED, marginBottom: 16 }}>카드마다 1~5 중 하나를 골라 주세요. 5는 &ldquo;{screen.scale[4]}&rdquo;예요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VALUE_CARDS.map(v => {
                const key = `${screen.keyPrefix}${v.id}`
                return (
                  <div key={key} role="radiogroup" aria-label={`${v.id}: ${v.def}`} style={{ border: '1px solid rgba(200,160,48,0.22)', borderRadius: 12, padding: '10px 12px', background: 'rgba(21,17,28,0.8)' }}>
                    <p style={{ fontSize: 14, color: TEXT, marginBottom: 8 }}><b style={{ fontFamily: SERIF }}>{v.id}</b> <span style={{ color: MUTED, fontSize: 13 }}>{v.def}</span></p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                      {[1, 2, 3, 4, 5].map(n => {
                        const on = answers[key] === n
                        return (
                          <button key={n} role="radio" aria-checked={on} aria-label={`${n}: ${screen.scale[n - 1]}`} onClick={() => setAnswers(prev => ({ ...prev, [key]: n }))} style={{
                            padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontVariantNumeric: 'tabular-nums',
                            border: `1px solid ${on ? 'rgba(226,192,100,0.8)' : 'rgba(255,255,255,0.1)'}`,
                            background: on ? 'rgba(200,160,48,0.2)' : 'transparent', color: on ? TEXT : MUTED,
                          }}>{n}</button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: 11.5, color: 'rgba(239,230,210,0.4)', marginTop: 10 }}>{screen.scale.map((s, i) => `${i + 1} ${s}`).join(' · ')}</p>
          </div>
        )}

        {error && <p role="alert" style={{ color: '#f87171', fontSize: 13, marginTop: 16 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0 || busy} style={{
            padding: '12px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: MUTED, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1, fontSize: 14,
          }}>← 이전</button>
          {(screen.kind !== 'scale' && !(screen.kind === 'choice' && !screen.item.maxSelect)) || error ? (
            <button onClick={() => next(answers)} disabled={!isAnswered(screen, answers) || busy} style={{
              flex: 1, padding: 12, borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 800,
              cursor: isAnswered(screen, answers) ? 'pointer' : 'not-allowed',
              background: isAnswered(screen, answers) ? 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)' : 'rgba(255,255,255,0.06)',
              color: isAnswered(screen, answers) ? '#1a1206' : 'rgba(255,255,255,0.3)',
            }}>{busy ? '리포트 만드는 중…' : idx === total - 1 ? '리포트 보기 →' : '다음 →'}</button>
          ) : null}
        </div>
      </div>
    </main>
  )
}
