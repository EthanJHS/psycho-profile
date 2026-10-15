'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { LIFE_STAGES, GOALS, itemCount, type LifeStage, type Plan } from '@/lib/paid-v2/items'
import { loadConsent, saveConsent, OPERATOR } from '@/lib/consent'
import ConsentSheet from '@/components/ConsentSheet'
import { readFreeAnswers, freeResultCode } from '@/lib/career/free-link'
import { loadMyReports, loadMyOrders, type MyReport, type MyOrder } from '@/lib/career/my-reports'
import { PRICES, SELLABLE_STAGES, formatWon } from '@/lib/career/pricing'
import { ensureProfile } from '@/lib/profile'

const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.62)'
const FAINT = 'rgba(239,230,210,0.45)'
const SERIF = 'var(--font-serif), serif'
const GOLD_BUTTON = 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)'
const PAYAPP_SCRIPT = 'https://lite.payapp.kr/public/api/v2/payapp-lite.js'
const PLANS: { id: Plan; label: string }[] = [{ id: 'find', label: '탐색' }, { id: 'do', label: '향상' }, { id: 'both', label: '묶음 (탐색 + 향상)' }]
const STAGES = LIFE_STAGES.filter(s => SELLABLE_STAGES.includes(s.id))

// 리포트에 들어가는 것 (결제 전 고지)
const CONTENTS: Record<Plan, string[]> = {
  find: ['나의 흥미 지도와 중요한 조건', '잘 맞는 직무 TOP 5와 AI 시대 변화 전망', '결정이 어려운 이유와 다음 행동'],
  do: ['나의 공부·일하는 방식', '지금 시기에 맞춘 실행 전략', '강점을 쓰는 법과 주의할 신호'],
  both: ['탐색 리포트 전체', '향상 리포트 전체'],
}
const COMMON = ['관계에서의 나', '시기별 스트레스 반응과 회복', '성장 로드맵']

declare global {
  interface Window { PayApp?: { setDefault: (k: string, v: string) => void; setParam: (k: string, v: string) => void; payrequest: () => void } }
}

function loadPayApp(): Promise<NonNullable<Window['PayApp']>> {
  return new Promise((resolve, reject) => {
    if (window.PayApp) return resolve(window.PayApp)
    const s = document.createElement('script')
    s.src = PAYAPP_SCRIPT
    s.onload = () => (window.PayApp ? resolve(window.PayApp) : reject(new Error('payapp missing')))
    s.onerror = () => reject(new Error('payapp load failed'))
    document.head.appendChild(s)
  })
}

function Option({ selected, onClick, title, desc, meta }: { selected: boolean; onClick: () => void; title: string; desc?: string; meta?: string }) {
  return (
    <button onClick={onClick} aria-pressed={selected} style={{
      textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: 'pointer', width: '100%',
      border: `1px solid ${selected ? 'rgba(226,192,100,0.8)' : 'rgba(200,160,48,0.25)'}`,
      background: selected ? 'rgba(200,160,48,0.12)' : 'rgba(21,17,28,0.8)',
    }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</span>
        {meta && <span style={{ fontSize: 12.5, color: GOLD, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{meta}</span>}
      </span>
      {desc && <span style={{ display: 'block', fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>{desc}</span>}
    </button>
  )
}

const label = (stage: LifeStage, plan: Plan) => `${LIFE_STAGES.find(s => s.id === stage)?.label ?? stage} · ${PLANS.find(p => p.id === plan)?.label.split(' ')[0] ?? plan}`

export default function CareerStartPage() {
  const router = useRouter()
  const [hasHexaco, setHasHexaco] = useState<boolean | null>(null)
  const [stage, setStage] = useState<LifeStage>('jobseeker')
  const [plan, setPlan] = useState<Plan>('find')
  const [refundAck, setRefundAck] = useState(false)
  const [askConsent, setAskConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payingOrder, setPayingOrder] = useState<string | null>(null)
  const [mine, setMine] = useState<MyReport[]>([])
  const [orders, setOrders] = useState<MyOrder[]>([])
  const polling = useRef(false)

  useEffect(() => { setHasHexaco(!!readFreeAnswers()); setMine(loadMyReports()); setOrders(loadMyOrders()) }, [])

  // 결제창을 연 뒤 — 이 화면에서도 결제 확정을 확인해 주문 화면으로 이어줌 (결제창이 새 창에서 끝나는 경우 대비)
  useEffect(() => {
    if (!payingOrder || polling.current) return
    polling.current = true
    let stop = false
    const tick = async (n: number) => {
      if (stop || n > 150) return
      try {
        const res = await fetch(`/api/orders/${payingOrder}`, { cache: 'no-store' })
        if (res.ok && ((await res.json()) as { status: string }).status === 'paid') { router.push(`/career/order/${payingOrder}`); return }
      } catch { /* 다시 시도 */ }
      setTimeout(() => tick(n + 1), 2000)
    }
    tick(0)
    return () => { stop = true; polling.current = false }
  }, [payingOrder, router])

  async function buy() {
    setError('')
    const free = readFreeAnswers()
    const code = free ? freeResultCode(free) : null
    if (!code) { setHasHexaco(false); return }
    const consent = loadConsent()
    if (!consent) { setAskConsent(true); return }
    // 결제창(새 창)은 버튼을 누른 순간 열어 둬야 팝업 차단에 걸리지 않음 — 페이앱은 같은 이름의 창에 결제 폼을 보냄
    const win = window.open('', 'PayAppWindow', 'width=480,height=760,resizable=1,scrollbars=yes')
    setBusy(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, plan, refundAck, freeCode: code, research: consent.research, profileId: await ensureProfile() }),
      })
      if (res.status === 503) throw new Error('결제 준비 중이에요. 잠시 후 다시 시도해 주세요.')
      if (!res.ok) throw new Error('주문을 만들지 못했어요. 잠시 후 다시 시도해 주세요.')
      const o = (await res.json()) as { id: string; price: number; goodname: string; userid: string }
      const PayApp = await loadPayApp()
      const origin = window.location.origin
      PayApp.setDefault('userid', o.userid)
      PayApp.setDefault('shopname', 'CORE TRAIT')
      PayApp.setParam('goodname', o.goodname)
      PayApp.setParam('price', String(o.price))
      PayApp.setParam('var1', o.id)
      PayApp.setParam('feedbackurl', `${origin}/api/payapp/feedback`)
      PayApp.setParam('returnurl', `${origin}/career/order/${o.id}`)
      PayApp.setParam('skip_cstpage', 'y')
      PayApp.setParam('smsuse', 'n')
      setPayingOrder(o.id)
      PayApp.payrequest()
    } catch (e) {
      win?.close()
      setError(e instanceof Error && e.message.includes('요') ? e.message : '결제창을 열지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  // 동의 버튼을 누른 그 클릭 안에서 바로 결제를 이어가야 결제창(새 창)이 팝업 차단에 걸리지 않음
  if (askConsent) return <ConsentSheet onAgree={c => { saveConsent(c); setAskConsent(false); buy() }} />

  const price = PRICES[plan]
  const minutes = Math.ceil(itemCount(stage, plan) * 8 / 60)
  const canBuy = !!hasHexaco && refundAck && !busy

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

        {orders.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 8 }}>결제한 리포트 이어가기</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {orders.map(o => (
                <li key={o.id}>
                  <Link href={`/career/order/${o.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(226,192,100,0.55)', background: 'rgba(200,160,48,0.1)', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14, color: TEXT }}>{label(o.stage, o.plan)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e2c064' }}>이어서 하기 →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasHexaco === false ? (
          <div style={{ border: '1px solid rgba(200,160,48,0.3)', borderRadius: 14, padding: 18, background: 'rgba(21,17,28,0.8)' }}>
            <p style={{ fontSize: 14, color: TEXT, marginBottom: 6, lineHeight: 1.6 }}>먼저 무료 원형 검사(48문항)를 해 주세요. 그 결과를 바탕으로 리포트를 만들어요.</p>
            <p style={{ fontSize: 12.5, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>이미 검사를 했다면, 저장해 둔 &ldquo;내 결과 링크&rdquo;를 이 브라우저 탭에서 먼저 연 뒤 다시 들어오세요.</p>
            <Link href="/hexaco-test?start=1" style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 999, background: GOLD_BUTTON, color: '#1a1206', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>무료 원형 검사 시작 →</Link>
          </div>
        ) : payingOrder ? (
          <div role="status" style={{ border: '1px solid rgba(226,192,100,0.45)', borderRadius: 14, padding: 18, background: 'rgba(200,160,48,0.08)' }}>
            <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 6 }}>결제창에서 결제를 마쳐 주세요</p>
            <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.7, marginBottom: 12 }}>결제가 확인되면 자동으로 다음 단계로 넘어가요. 결제창이 보이지 않으면 팝업 차단을 확인해 주세요.</p>
            <p style={{ display: 'flex', gap: 16, fontSize: 13.5 }}>
              <Link href={`/career/order/${payingOrder}`} style={{ color: '#e2c064' }}>결제를 마쳤어요 →</Link>
              <button onClick={() => setPayingOrder(null)} style={{ background: 'none', border: 'none', padding: 0, color: FAINT, cursor: 'pointer', fontSize: 13.5, textDecoration: 'underline' }}>다시 고르기</button>
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 10 }}>지금 나는</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
              {STAGES.map(s => <Option key={s.id} selected={stage === s.id} onClick={() => setStage(s.id)} title={s.label} />)}
            </div>

            <h2 style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 10 }}>알고 싶은 것</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {PLANS.map(p => (
                <Option key={p.id} selected={plan === p.id} onClick={() => setPlan(p.id)}
                  title={p.label}
                  desc={p.id === 'both' ? '맞는 길을 찾고, 지금 자리에서 더 잘하는 법까지' : GOALS[p.id].desc[stage]}
                  meta={formatWon(PRICES[p.id])} />
              ))}
            </div>

            {/* 결제 전 고지: 제공 내용·소요 시간·환불 조건 */}
            <div style={{ borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(200,160,48,0.25)', background: 'rgba(21,17,28,0.8)', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 8 }}>리포트에 들어가는 것</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: MUTED, lineHeight: 1.75 }}>
                {[...CONTENTS[plan], ...COMMON].map(c => <li key={c}>{c}</li>)}
              </ul>
              <p style={{ fontSize: 12.5, color: FAINT, marginTop: 8 }}>결제 후 추가 질문 {itemCount(stage, plan)}개 (약 {minutes}분)에 답하면 바로 만들어져요. 리포트는 링크로 언제든 다시 볼 수 있어요.</p>
            </div>

            <div style={{ borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(248,180,120,0.35)', background: 'rgba(248,180,120,0.06)', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>
                <b>환불 안내</b> · 추가 질문에 답하기 전이라면 결제일로부터 7일 이내 전액 환불돼요.
                <b> 추가 질문을 마쳐 리포트가 만들어진 뒤에는 디지털 콘텐츠 특성상 단순 변심으로 환불할 수 없어요.</b>{' '}
                <Link href="/refund" target="_blank" style={{ color: '#e2c064' }}>환불 정책 전체 보기 ↗</Link>
              </p>
              <label htmlFor="refund-ack" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 10, cursor: 'pointer' }}>
                <input id="refund-ack" type="checkbox" checked={refundAck} onChange={e => setRefundAck(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: GOLD }} />
                <span style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.6 }}>[필수] 위 환불 조건과 <Link href="/terms" target="_blank" style={{ color: '#e2c064' }}>이용약관</Link>을 확인했고 결제에 동의합니다</span>
              </label>
            </div>

            <button onClick={buy} disabled={!canBuy} style={{
              width: '100%', padding: 16, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 800,
              cursor: canBuy ? 'pointer' : 'not-allowed',
              background: canBuy ? GOLD_BUTTON : 'rgba(255,255,255,0.06)', color: canBuy ? '#1a1206' : 'rgba(255,255,255,0.35)',
            }}>
              {busy ? '결제창을 여는 중…' : `${formatWon(price)} 결제하기`}
            </button>
            {!refundAck && <p style={{ fontSize: 12, color: FAINT, textAlign: 'center', marginTop: 8 }}>환불 조건에 동의하면 결제할 수 있어요.</p>}
            {error && <p role="alert" style={{ fontSize: 13, color: '#f87171', textAlign: 'center', marginTop: 10 }}>{error}</p>}
            <p style={{ fontSize: 11.5, color: FAINT, lineHeight: 1.7, marginTop: 14 }}>
              판매: {OPERATOR} · 문의 core-trait@naver.com · 결제대행: 페이앱(주식회사 유디아이디). 결제 정보는 결제대행사가 처리하며 CORE TRAIT는 카드 번호 등 결제 수단 정보를 받지 않아요.
            </p>
          </>
        )}

        {mine.length > 0 && (
          <section style={{ marginTop: 36, paddingTop: 22, borderTop: '1px solid rgba(200,160,48,0.2)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: 4 }}>내 리포트</h2>
            <p style={{ fontSize: 12, color: FAINT, marginBottom: 12 }}>이 기기에서 만들거나 열어 본 리포트예요.</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mine.map(r => (
                <li key={r.id}>
                  <Link href={`/career/report/${r.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(200,160,48,0.25)', background: 'rgba(21,17,28,0.8)', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14, color: TEXT }}>{label(r.stage, r.plan)}</span>
                    <span style={{ fontSize: 12.5, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(r.at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
