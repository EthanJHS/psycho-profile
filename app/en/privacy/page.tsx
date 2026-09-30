import type { Metadata } from 'next'
import { PRIVACY_VERSION_EN, PRIVACY_CONTACT } from '@/lib/consent'

// 영어판 개인정보 처리방침 — EU·영국 GDPR과 미국 이용자를 기준으로 작성 (법률 검토 전 초안)
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What CORE TRAIT collects, why, and how long we keep it.',
}

const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.68)'
const LINE = 'rgba(200,160,48,0.22)'
const OPERATOR_EN = 'CORE TRAIT (independently operated)'

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
      <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 13 }}>
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

export default function PrivacyPageEn() {
  const mail = <a href={`mailto:${PRIVACY_CONTACT}`} style={{ color: '#e2c064' }}>{PRIVACY_CONTACT}</a>
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 72px' }}>
      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>PRIVACY POLICY</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 24 }}>
          {OPERATOR_EN} (&ldquo;CORE TRAIT&rdquo;, &ldquo;we&rdquo;) built this test so you can take it without giving us your name or contact details, and we collect only what we need.
          This policy explains what we collect, why, and how long we keep it. For the purposes of data protection law, CORE TRAIT is the controller of your data.
        </p>

        <Section n={1} title="What we collect and why">
          <Table
            head={['Category', 'Data', 'Purpose', 'Legal basis (GDPR)']}
            rows={[
              ['Test answers (required)', 'Your answer to each question, your scores and archetype, test version, and when you consented', 'To give you your result; usage statistics', 'Your consent (Art. 6(1)(a))'],
              ['Usage data (after you consent)', 'A randomly generated visit ID and profile ID, device type (mobile/desktop), how you arrived (referrer, campaign tags), and actions such as starting or finishing the test, button clicks, scrolling, and where you stopped', 'To improve the service and fix problems; usage statistics', 'Your consent (Art. 6(1)(a))'],
              ['Server logs (automatic)', 'IP address, time of access, browser information (hosting provider logs)', 'Security and abuse prevention', 'Legitimate interests (Art. 6(1)(f))'],
              ['Launch notice (optional)', 'Your email address', 'To tell you when the full report launches', 'Your consent (Art. 6(1)(a))'],
              ['Result rating (optional)', 'Your satisfaction rating (1–5) and any comment you write', 'To improve the service', 'Your consent (Art. 6(1)(a))'],
            ]}
          />
          <p>We don’t collect your name, phone number, government ID, or payment information. We don’t record usage data about your visit until you agree at the start of the test.</p>
        </Section>

        <Section n={2} title="Research and test improvement (optional)">
          <p>
            Only if you tick the optional box when starting the test, we use your answers in de-identified form to analyze question quality,
            improve scoring, and for personality research. You’ll get the same test and result either way, and you can withdraw this consent at any time using the contact below.
          </p>
        </Section>

        <Section n={3} title="How long we keep it">
          <Table
            head={['Data', 'Retention']}
            rows={[
              ['Test answers and usage data', '3 years from collection, then deleted'],
              ['Launch notice email', 'Deleted once we send the launch notice, or 2 years after you sign up, whichever comes first'],
              ['Result rating', '1 year from submission'],
              ['Server logs', 'According to our hosting provider’s log retention policy'],
            ]}
          />
          <p>If you ask us to delete your data, we’ll do so without undue delay regardless of these periods.</p>
        </Section>

        <Section n={4} title="Sharing">
          <p>We don’t sell your personal information, and we don’t share it with third parties for advertising. We only disclose it where required by law.</p>
        </Section>

        <Section n={5} title="Service providers and international transfers">
          <p>We use the following providers to run the service:</p>
          <Table
            head={['Provider', 'What they do', 'Location']}
            rows={[
              ['Supabase Inc.', 'Stores test answers, usage data, and sign-ups', 'Republic of Korea (Seoul region)'],
              ['Vercel Inc.', 'Website hosting, server functions, access logs', 'United States and other regions'],
            ]}
          />
          <p>
            If you’re in the EU, UK, or another country, your data is transferred to the Republic of Korea and the United States.
            The European Commission has recognized the Republic of Korea as providing an adequate level of data protection.
            Transfers to the United States rely on appropriate safeguards offered by the provider, such as Standard Contractual Clauses.
          </p>
        </Section>

        <Section n={6} title="Browser storage and cookies">
          <p>
            We use your browser’s session storage to keep your test progress and result while the tab is open; it’s cleared when you close the tab.
            After you consent, we also store a random profile ID in your browser so a later test on the same device can be linked to your earlier result.
            This ID isn’t linked to your name or contact details, and it’s removed if you clear your browser’s site data.
          </p>
          <p>We don’t use advertising or tracking cookies.</p>
        </Section>

        <Section n={7} title="Your rights">
          <p>
            Depending on where you live, you have the right to access, correct, delete, or receive a copy of your data, to restrict or object to its processing,
            and to withdraw consent at any time (this doesn’t affect processing that happened before you withdrew).
            Because we don’t collect your name or contact details, we find your records using the <b style={{ color: TEXT }}>Test ID</b> shown at the bottom of your result report — please include it when you contact us at {mail}.
          </p>
          <p>To remove a launch-notice sign-up, email us from the address you signed up with.</p>
          <p>If you’re in the EU or UK, you can also lodge a complaint with your local data protection authority.</p>
          <p>If you’re a California resident: we don’t sell or share personal information as defined by the CCPA/CPRA, and you can exercise the rights above using the same contact.</p>
        </Section>

        <Section n={8} title="Age requirement">
          <p>The test is only for people aged 16 and over, and we ask you to confirm this before you start. We don’t knowingly collect data from children; if you believe a child has used the test, contact us and we’ll delete the data.</p>
        </Section>

        <Section n={9} title="Security">
          <p>All traffic is encrypted with HTTPS. Our database only allows anonymous visitors to add records, not to read or change them, and the admin area is password-protected.</p>
        </Section>

        <Section n={10} title="Contact">
          <p>{OPERATOR_EN}<br />Email: {mail}</p>
        </Section>

        <Section n={11} title="Changes to this policy">
          <p>This policy is effective as of version {PRIVACY_VERSION_EN}. If we change it, we’ll post the update on this page and ask for your consent again when you start a new test.</p>
        </Section>
      </article>
    </main>
  )
}
