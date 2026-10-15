import type { Metadata } from 'next'
import Link from 'next/link'
import { OPERATOR, PRIVACY_CONTACT } from '@/lib/consent'
import { PRICES, formatWon } from '@/lib/career/pricing'

export const metadata: Metadata = {
  title: '환불 정책',
  description: 'CORE CAREER 진로 리포트의 환불 기준과 요청 방법',
}

const REFUND_VERSION = '2026-10-15'
const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.68)'
const LINE = 'rgba(200,160,48,0.22)'

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '20px 0', borderTop: `1px solid ${LINE}` }}>
      <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        <span style={{ color: GOLD, marginRight: 8 }}>{n}.</span>{title}
      </h2>
      <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </section>
  )
}

export default function RefundPage() {
  const mail = <a href={`mailto:${PRIVACY_CONTACT}`} style={{ color: '#e2c064' }}>{PRIVACY_CONTACT}</a>
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 72px' }}>
      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>REFUND POLICY</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 10 }}>환불 정책</h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 24 }}>
          CORE CAREER 진로 리포트(탐색 {formatWon(PRICES.find)} · 향상 {formatWon(PRICES.do)} · 묶음 {formatWon(PRICES.both)})의 환불 기준입니다.
          진로 리포트는 결제 후 추가 질문에 답하면 바로 만들어지는 디지털 콘텐츠예요. 무료 원형 검사와 결제 화면의 안내로 내용을 미리 확인할 수 있어요.
        </p>

        <Section n={1} title="전액 환불">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>결제 후 <b style={{ color: TEXT }}>추가 질문에 답하기 전</b>이라면, 결제일로부터 7일 이내 전액 환불해 드려요.</li>
            <li>결제는 됐는데 <b style={{ color: TEXT }}>리포트가 만들어지지 않거나 열리지 않는 경우</b>, 기간과 관계없이 전액 환불해 드려요.</li>
            <li>리포트 내용이 <b style={{ color: TEXT }}>결제 전 안내와 현저히 다른 경우</b>, 그 사실을 안 날부터 3개월 이내(늦어도 결제일부터 30일 이내) 전액 환불해 드려요.</li>
          </ul>
        </Section>

        <Section n={2} title="환불이 제한되는 경우">
          <p>추가 질문을 마쳐 <b style={{ color: TEXT }}>리포트가 만들어진 뒤</b>에는 디지털 콘텐츠의 제공이 시작된 것이므로, 단순 변심으로는 환불할 수 없어요(전자상거래법 제17조 제2항 제5호).
            이 내용은 결제 버튼 바로 위에 표시하고, 결제 전에 확인을 받아요.</p>
        </Section>

        <Section n={3} title="묶음 상품">
          <p>탐색+향상 묶음은 한 번의 추가 질문으로 두 리포트가 함께 만들어져요. 따라서 추가 질문을 시작하기 전에는 전액 환불, 리포트가 만들어진 뒤에는 1·2번 기준을 따라요.</p>
        </Section>

        <Section n={4} title="미성년자">
          <p>진로 리포트는 대학생·취업 준비생·직장인용으로 판매해요. 만 19세 미만이 법정대리인의 동의 없이 결제한 경우, 본인 또는 법정대리인이 결제를 취소할 수 있어요.</p>
        </Section>

        <Section n={5} title="요청 방법과 처리 기간">
          <p>주문 번호(결제 후 화면 아래에 표시) 또는 결제 일시·금액을 적어 {mail}로 보내 주세요.</p>
          <p>환불이 확정되면 3영업일 안에 결제 수단으로 취소해 드려요. 카드사·결제대행사 사정에 따라 실제 반영까지 시간이 더 걸릴 수 있어요.</p>
        </Section>

        <Section n={6} title="판매자 정보">
          <p>판매자: {OPERATOR}<br />문의: {mail}<br />결제대행: 페이앱(주식회사 유디아이디)</p>
          <p>이용 조건은 <Link href="/terms" style={{ color: '#e2c064' }}>이용약관</Link>, 개인정보 처리는 <Link href="/privacy" style={{ color: '#e2c064' }}>개인정보 처리방침</Link>을 따릅니다.</p>
        </Section>

        <p style={{ fontSize: 13, color: MUTED, borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>이 정책은 {REFUND_VERSION}부터 적용됩니다.</p>
      </article>
    </main>
  )
}
