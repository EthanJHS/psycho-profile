'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { decodeHexacoAnswers } from '@/lib/hexaco-encoding'
import { loadConsent, saveConsent } from '@/lib/consent'
import { rememberOrder, forgetOrder } from '@/lib/career/my-reports'
import { formatWon } from '@/lib/career/pricing'
import { LIFE_STAGES, type LifeStage, type Plan } from '@/lib/paid-v2/items'
import { PRIVACY_CONTACT } from '@/lib/consent'

// 결제 후 돌아오는 화면 — 결제 확정(페이앱 알림)을 기다렸다가 추가 질문으로 이어준다.
// 결제창이 새 창·탭에서 끝나도 이어갈 수 있게, 주문에 저장된 무료 결과 코드로 이 탭의 검사 결과를 복원
const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.66)'
const FAINT = 'rgba(239,230,210,0.45)'
const SERIF = 'var(--font-serif), serif'
const GOLD_BUTTON = 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)'
const PLAN_LABEL: Record<Plan, string> = { find: '탐색', do: '향상', both: '탐색+향상 묶음' }

interface Order {
  status: 'pending' | 'waiting' | 'paid' | 'cancelled' | 'refunded' | 'partially_refunded'
  stage: LifeStage; plan: Plan; amount: number
  assessment_id: string | null; completed: boolean
  free_code: string | null; research_consent: boolean; created_at: string
}

const POLL_MS = 2000
const POLL_LIMIT = 90   // 약 3분

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [missing, setMissing] = useState(false)
  const [tries, setTries] = useState(0)
  const [noFree, setNoFree] = useState(false)

  useEffect(() => {
    let stop = false
    let n = 0
    async function poll() {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' })
        if (res.status === 404) { setMissing(true); return }
        if (res.ok) {
          const o = (await res.json()) as Order
          if (stop) return
          setOrder(o)
          if (o.status === 'paid') {
            // 이 탭에 무료 결과·동의가 없으면 주문에 저장된 값으로 복원
            if (!sessionStorage.getItem('hexaco_answers') && o.free_code) {
              const a = decodeHexacoAnswers(o.free_code)
              if (a) sessionStorage.setItem('hexaco_answers', JSON.stringify(a))
            }
            if (!loadConsent()) saveConsent({ research: o.research_consent })
            setNoFree(!sessionStorage.getItem('hexaco_answers'))
            if (o.completed) forgetOrder(id)
            else rememberOrder({ id, stage: o.stage, plan: o.plan, at: o.created_at })
            return
          }
          if (o.status !== 'pending' && o.status !== 'waiting') return
        }
      } catch { /* 네트워크 오류 — 다시 시도 */ }
      n += 1
      setTries(n)
      if (!stop && n < POLL_LIMIT) setTimeout(poll, POLL_MS)
    }
    poll()
    return () => { stop = true }
  }, [id])

  const shell = (children: React.ReactNode) => (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 64px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 10 }}>CORE CAREER · 주문</p>
        {children}
        <p style={{ fontSize: 12, color: FAINT, lineHeight: 1.7, marginTop: 28, paddingTop: 16, borderTop: '1px solid rgba(200,160,48,0.18)' }}>
          주문 번호 <span style={{ fontFamily: 'monospace' }}>{id.slice(0, 8)}</span> · 결제·환불 문의는 이 번호와 함께 {PRIVACY_CONTACT}로 보내 주세요.
        </p>
      </div>
    </main>
  )
  const h1 = (t: string) => <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: TEXT, lineHeight: 1.4, marginBottom: 10 }}>{t}</h1>
  const body = (t: React.ReactNode) => <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.75, marginBottom: 22 }}>{t}</p>
  const back = <Link href="/career" style={{ color: '#e2c064', fontSize: 14 }}>진로 리포트 처음으로 →</Link>

  if (missing) return shell(<>{h1('주문을 찾을 수 없어요')}{body('주소가 정확한지 확인해 주세요.')}{back}</>)
  if (!order) return shell(<>{h1('주문을 확인하는 중…')}</>)

  const product = `${LIFE_STAGES.find(s => s.id === order.stage)?.label ?? order.stage} · ${PLAN_LABEL[order.plan]}`

  if (order.status === 'paid') {
    if (order.completed && order.assessment_id) {
      return shell(<>
        {h1('이미 만들어진 리포트예요')}
        {body(`${product} 리포트가 완성돼 있어요.`)}
        <Link href={`/career/report/${order.assessment_id}`} style={{ display: 'block', textAlign: 'center', padding: 16, borderRadius: 14, background: GOLD_BUTTON, color: '#1a1206', fontWeight: 800, textDecoration: 'none' }}>리포트 보기 →</Link>
      </>)
    }
    // 무료 결과가 이 탭에도, 주문에도 없음 (관리자 테스트 주문 등) — 검사 화면과 왕복하지 않게 먼저 안내
    if (noFree) {
      return shell(<>
        {h1('무료 원형 검사 결과가 필요해요')}
        {body('진로 리포트는 무료 원형 검사 결과 위에 만들어져요. 같은 브라우저 탭에서 무료 검사를 마치거나 저장해 둔 내 결과 링크를 연 뒤, 이 주소를 다시 열어 주세요.')}
        <Link href="/hexaco-test?start=1" style={{ color: '#e2c064', fontSize: 14 }}>무료 원형 검사 하기 →</Link>
      </>)
    }
    return shell(<>
      {h1(order.assessment_id ? '이어서 답해 주세요' : '결제가 확인됐어요')}
      {body(<>{product}{order.amount > 0 && <> · {formatWon(order.amount)}</>}<br />이제 추가 질문에 답하면 리포트가 만들어져요.</>)}
      <Link href={`/career/test?stage=${order.stage}&plan=${order.plan}&order=${id}`} style={{ display: 'block', textAlign: 'center', padding: 16, borderRadius: 14, background: GOLD_BUTTON, color: '#1a1206', fontWeight: 800, textDecoration: 'none' }}>
        추가 질문 {order.assessment_id ? '이어서 하기' : '시작하기'} →
      </Link>
      <p style={{ fontSize: 12.5, color: FAINT, lineHeight: 1.7, marginTop: 12 }}>
        지금 하지 않아도 괜찮아요. 이 기기의 <Link href="/career" style={{ color: '#e2c064' }}>진로 리포트</Link> 화면에서 언제든 이어갈 수 있고, 다른 기기라면 이 화면 주소를 열면 돼요.
      </p>
    </>)
  }

  if (order.status === 'waiting') {
    return shell(<>{h1('입금을 기다리고 있어요')}{body('입금이 확인되면 이 화면에서 바로 이어갈 수 있어요. 이 화면 주소를 저장해 두세요.')}</>)
  }
  if (order.status === 'cancelled' || order.status === 'refunded' || order.status === 'partially_refunded') {
    return shell(<>{h1(order.status === 'cancelled' ? '결제가 취소됐어요' : '환불된 주문이에요')}{body('다시 구매하려면 진로 리포트 화면에서 시작해 주세요.')}{back}</>)
  }

  // pending — 결제 알림을 기다리는 중
  const slow = tries >= POLL_LIMIT
  return shell(<>
    {h1(slow ? '결제 확인이 늦어지고 있어요' : '결제를 확인하고 있어요…')}
    {body(slow
      ? '결제를 마쳤다면 잠시 후 이 화면을 새로고침해 주세요. 결제하지 않았다면 진로 리포트 화면에서 다시 시작하면 돼요.'
      : '결제창에서 결제를 마치면 몇 초 안에 자동으로 넘어가요. 이 화면을 닫지 말아 주세요.')}
    {slow && back}
  </>)
}
