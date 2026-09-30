import type { Metadata } from 'next'
import { PRIVACY_VERSION, PRIVACY_CONTACT, OPERATOR } from '@/lib/consent'

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: 'CORE TRAIT가 어떤 정보를 왜 수집하고 얼마나 보관하는지 안내합니다.',
}

const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.68)'
const LINE = 'rgba(200,160,48,0.22)'

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '22px 0', borderTop: `1px solid ${LINE}` }}>
      <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
        <span style={{ color: GOLD, marginRight: 8 }}>{n}.</span>{title}
      </h2>
      <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </section>
  )
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{head.map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: GOLD, fontWeight: 600, borderBottom: `1px solid ${LINE}` }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: '9px 10px', verticalAlign: 'top', borderBottom: '1px solid rgba(200,160,48,0.1)', color: j === 0 ? TEXT : MUTED }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 72px' }}>
      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>PRIVACY POLICY</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 10 }}>개인정보 처리방침</h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 24 }}>
          {OPERATOR}(이하 &lsquo;CORE TRAIT&rsquo;)는 이름·연락처 없이도 검사를 이용할 수 있도록 서비스를 만들고, 꼭 필요한 정보만 수집합니다.
          이 방침은 어떤 정보를 왜 수집하고 얼마나 보관하는지 설명합니다.
        </p>

        <Section n={1} title="수집하는 정보와 이용 목적">
          <Table
            head={['구분', '수집 항목', '이용 목적']}
            rows={[
              ['검사 응답 (필수)', '문항별 응답, 산출 점수와 원형, 검사 버전, 동의 여부와 시각', '검사 결과 제공, 이용 통계'],
              ['진로 리포트 응답 (선택)', '추가 검사를 이용한 경우: 시기·목적 선택, 흥미·가치·관계·스트레스 문항 응답, 학년·전공 계열·현재 직무 같은 배경 선택, 산출 점수', '진로 리포트 제공, 이용 통계'],
              ['방문·이용 기록 (자동)', '무작위로 만든 방문 번호와 프로필 번호, 기기 종류(모바일·PC 등), 유입 경로, 광고 캠페인 정보(UTM), 검사 시작·완료·버튼 클릭·스크롤·중단 위치 같은 이용 기록', '서비스 개선, 오류 확인, 이용 통계'],
              ['접속 기록 (자동)', 'IP 주소, 접속 시각, 브라우저 정보 (호스팅 서버 로그)', '보안, 부정 이용 방지'],
              ['사전 알림 신청 (선택)', '이메일 주소', '진로 리포트 출시 알림 발송'],
              ['만족도 평가 (선택)', '결과 만족도(1~5), 적은 경우 의견', '서비스 개선'],
            ]}
          />
          <p>이름, 전화번호, 주민등록번호, 결제 정보는 수집하지 않습니다.</p>
        </Section>

        <Section n={2} title="연구·검사 개선 목적 활용 (선택 동의)">
          <p>
            검사를 시작할 때 선택 항목에 동의한 경우에만, 누구인지 알 수 없도록 가명 처리한 검사 응답을 문항 품질 분석, 채점 방식 개선,
            성격·진로 연구에 활용합니다. 동의하지 않아도 검사와 결과는 똑같이 이용할 수 있고, 동의한 뒤에도 아래 연락처로 언제든 철회할 수 있습니다.
          </p>
        </Section>

        <Section n={3} title="보유 기간과 파기">
          <Table
            head={['정보', '보유 기간']}
            rows={[
              ['검사 응답, 방문·이용 기록', '수집일로부터 3년. 이후 지체 없이 파기합니다.'],
              ['사전 알림 이메일', '출시 알림을 보낸 뒤 지체 없이 파기합니다. 출시 전이라도 신청일로부터 2년이 지나면 파기합니다.'],
              ['만족도 평가', '제출일로부터 1년'],
              ['접속 기록', '호스팅 사업자의 로그 보관 정책에 따릅니다.'],
            ]}
          />
          <p>삭제를 요청하면 보유 기간과 관계없이 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제합니다.</p>
        </Section>

        <Section n={4} title="제3자 제공">
          <p>개인정보를 제3자에게 제공하거나 판매하지 않습니다. 법령에 따른 요청이 있는 경우는 예외입니다.</p>
        </Section>

        <Section n={5} title="처리 위탁과 국외 이전">
          <p>서비스 운영을 위해 아래 업체에 정보 처리를 맡기고 있습니다.</p>
          <Table
            head={['업체', '맡기는 업무', '처리 위치']}
            rows={[
              ['Supabase Inc.', '검사 응답·이용 기록·신청 정보 저장', '대한민국 (서울 리전)'],
              ['Vercel Inc.', '웹사이트 호스팅, 서버 기능 실행, 접속 기록 처리', '미국 등 (서비스 접속 시 네트워크로 전송)'],
            ]}
          />
          <p>
            Vercel Inc.(미국, privacy@vercel.com)로는 서비스를 이용하는 순간 접속 기록과 요청 처리에 필요한 정보(사전 알림 이메일 등)가
            네트워크를 통해 전송되며, 위탁 계약이 끝날 때까지 보관됩니다. 이전을 원하지 않으면 서비스 이용을 중단할 수 있습니다.
          </p>
        </Section>

        <Section n={6} title="브라우저 저장소 사용">
          <p>
            검사 진행 상황과 결과를 이어서 보여드리기 위해 브라우저의 세션 저장소를 사용합니다. 이 정보는 브라우저 탭을 닫으면 사라집니다.
          </p>
          <p>
            같은 기기에서 무료 검사 뒤에 추가 검사를 하면 결과를 이어서 보여드리기 위해, 무작위로 만든 프로필 번호를 브라우저에 저장합니다.
            이 번호는 이름·연락처와 연결되지 않으며, 브라우저의 사이트 데이터를 지우면 삭제됩니다.
          </p>
          <p>광고나 추적을 위한 쿠키는 사용하지 않습니다.</p>
        </Section>

        <Section n={7} title="이용자의 권리와 요청 방법">
          <p>
            저장된 내 검사 정보의 열람, 정정, 삭제, 처리 정지, 선택 동의 철회를 요청할 수 있습니다.
            결과 보고서 맨 아래에 있는 <b style={{ color: TEXT }}>검사 번호</b>를 적어 아래 연락처로 보내 주세요. 이름·연락처를 받지 않기 때문에 검사 번호로 본인의 기록을 찾습니다.
          </p>
          <p>사전 알림 신청 삭제는 신청한 이메일 주소로 요청해 주세요.</p>
        </Section>

        <Section n={8} title="만 14세 미만 아동">
          <p>법정대리인의 동의 절차를 갖추기 전까지 만 14세 미만의 검사 이용을 받지 않습니다. 검사 시작 전에 만 14세 이상인지 확인합니다.</p>
        </Section>

        <Section n={9} title="안전성 확보 조치">
          <p>모든 통신은 HTTPS로 암호화하며, 데이터베이스는 익명 사용자가 저장만 할 수 있고 조회·수정은 할 수 없도록 접근을 제한합니다. 관리자 화면은 비밀번호로 보호합니다.</p>
        </Section>

        <Section n={10} title="개인정보 보호책임자와 문의">
          <p>개인정보 보호책임자: {OPERATOR} 운영자<br />연락처: <a href={`mailto:${PRIVACY_CONTACT}`} style={{ color: '#e2c064' }}>{PRIVACY_CONTACT}</a></p>
          <p>
            개인정보 침해에 대한 신고나 상담은 개인정보침해신고센터(국번 없이 118, privacy.kisa.or.kr),
            개인정보분쟁조정위원회(1833-6972, kopico.go.kr)에도 할 수 있습니다.
          </p>
        </Section>

        <Section n={11} title="방침의 변경">
          <p>이 방침은 {PRIVACY_VERSION}부터 적용됩니다. 내용이 바뀌면 이 페이지에 공지하고, 검사 시작 시 새로 동의를 받습니다.</p>
        </Section>
      </article>
    </main>
  )
}
