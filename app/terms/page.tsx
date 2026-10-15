import type { Metadata } from 'next'
import Link from 'next/link'
import { OPERATOR, PRIVACY_CONTACT } from '@/lib/consent'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'CORE TRAIT 서비스 이용약관',
}

const TERMS_VERSION = '2026-10-15'
const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.68)'
const LINE = 'rgba(200,160,48,0.22)'

function Article({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '20px 0', borderTop: `1px solid ${LINE}` }}>
      <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        <span style={{ color: GOLD, marginRight: 6 }}>제{n}조</span>{title}
      </h2>
      <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 72px' }}>
      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>TERMS OF SERVICE</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 24 }}>이용약관</h1>

        <Article n={1} title="목적">
          <p>이 약관은 {OPERATOR}(이하 &lsquo;운영자&rsquo;)가 제공하는 CORE TRAIT 서비스(core-trait.com, 이하 &lsquo;서비스&rsquo;)의 이용 조건과 절차, 운영자와 이용자의 권리·의무를 정합니다.</p>
        </Article>

        <Article n={2} title="서비스의 내용">
          <p>서비스는 성격 검사와 그 결과(원형, 성격 요인 점수, 해석 문구)를 제공합니다. 추가 검사와 심층 리포트 같은 유료 서비스를 제공하는 경우, 가격과 제공 내용, 환불 조건을 결제 전에 따로 안내합니다.</p>
        </Article>

        <Article n={3} title="유료 서비스와 결제">
          <p>CORE CAREER 진로 리포트는 유료 서비스입니다. 가격, 제공 내용, 추가 질문 수와 소요 시간, 환불 조건은 결제 화면에 표시하며, 이용자는 결제 전에 환불 조건을 확인하고 동의해야 합니다.</p>
          <p>결제는 결제대행사 페이앱(주식회사 유디아이디)을 통해 이루어지며, 결제가 확인되면 추가 질문을 시작할 수 있습니다. 한 번의 결제로 하나의 리포트(묶음은 탐색·향상 리포트 각각 하나)가 만들어집니다.</p>
          <p>리포트는 결제한 이용자에게 제공되는 링크로 열람합니다. 링크를 잃어버린 경우 주문 번호와 함께 문의하면 확인 후 다시 안내합니다.</p>
          <p>환불은 <Link href="/refund" style={{ color: '#e2c064' }}>환불 정책</Link>을 따릅니다. 추가 질문을 마쳐 리포트가 만들어진 뒤에는 디지털 콘텐츠의 특성상 단순 변심에 의한 청약철회가 제한됩니다.</p>
        </Article>

        <Article n={4} title="검사 결과의 성격">
          <p>검사 결과는 스스로를 이해하는 데 참고하기 위한 자료입니다. 의학적·심리학적 진단이나 치료를 대신하지 않습니다.</p>
          <p>검사 결과를 채용, 입학, 평가처럼 다른 사람에게 중요한 영향을 주는 결정의 유일한 근거로 사용해서는 안 됩니다.</p>
          <p>진로·직무 추천은 응답을 바탕으로 한 가능성의 제시이며, 특정 결과(합격, 취업, 성과 등)를 보장하지 않습니다.</p>
        </Article>

        <Article n={5} title="이용자의 의무">
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>자동화된 방법으로 검사에 반복 응답하거나 서비스에 과도한 부하를 주는 행위</li>
            <li>서비스의 문항, 해석 문구, 이미지를 허락 없이 복제·배포하거나 상업적으로 이용하는 행위</li>
            <li>다른 사람의 검사 결과 링크를 본인 동의 없이 공개하는 행위</li>
            <li>관리자 화면 등 허용되지 않은 영역에 접근을 시도하는 행위</li>
          </ul>
        </Article>

        <Article n={6} title="이용 연령">
          <p>만 14세 미만은 서비스를 이용할 수 없습니다. 유료 서비스는 대학생·취업 준비생·직장인을 대상으로 하며, 만 19세 미만이 법정대리인의 동의 없이 결제한 경우 본인 또는 법정대리인이 취소할 수 있습니다.</p>
        </Article>

        <Article n={7} title="지식재산권">
          <p>서비스의 문항, 원형 체계와 이름, 해석 문구, 원형 그림 등 서비스가 만든 콘텐츠의 권리는 운영자에게 있습니다. 이용자는 자신의 결과를 개인적으로 보관하고 공유 기능으로 공유할 수 있습니다.</p>
        </Article>

        <Article n={8} title="서비스의 변경과 중단">
          <p>운영자는 서비스의 내용이나 검사 방식을 개선을 위해 바꿀 수 있습니다. 서비스를 중단해야 하는 경우 가능한 한 미리 사이트에 알립니다. 유료 서비스의 변경·중단에 따른 환불은 유료 서비스 안내에서 정한 기준을 따릅니다.</p>
        </Article>

        <Article n={9} title="책임의 제한">
          <p>운영자는 천재지변, 통신 장애 등 운영자가 통제할 수 없는 사유로 서비스를 제공하지 못한 경우 책임을 지지 않습니다. 이용자가 검사 결과를 근거로 내린 결정의 결과에 대해서는, 운영자에게 고의나 중대한 과실이 없는 한 책임을 지지 않습니다.</p>
        </Article>

        <Article n={10} title="개인정보 보호">
          <p>개인정보의 수집·이용·보관은 <Link href="/privacy" style={{ color: '#e2c064' }}>개인정보 처리방침</Link>을 따릅니다.</p>
        </Article>

        <Article n={11} title="약관의 변경">
          <p>약관을 바꾸는 경우 적용일과 바뀌는 내용을 적용일 7일 전부터 사이트에 알립니다. 이용자에게 불리한 변경은 30일 전부터 알립니다.</p>
        </Article>

        <Article n={12} title="분쟁 해결">
          <p>서비스 이용과 관련한 문의나 분쟁은 먼저 <a href={`mailto:${PRIVACY_CONTACT}`} style={{ color: '#e2c064' }}>{PRIVACY_CONTACT}</a>로 연락해 주세요. 해결되지 않는 분쟁은 대한민국 법을 따르며, 관할 법원은 민사소송법에 따릅니다.</p>
        </Article>

        <p style={{ fontSize: 13, color: MUTED, borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>이 약관은 {TERMS_VERSION}부터 적용됩니다.</p>
      </article>
    </main>
  )
}
