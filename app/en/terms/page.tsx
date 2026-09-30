import type { Metadata } from 'next'
import Link from 'next/link'
import { PRIVACY_CONTACT } from '@/lib/consent'

// 영어판 이용약관 (법률 검토 전 초안)
export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for CORE TRAIT',
}

const TERMS_VERSION = '2026-09-30'
const GOLD = '#c8a030'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.68)'
const LINE = 'rgba(200,160,48,0.22)'

function Article({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '20px 0', borderTop: `1px solid ${LINE}` }}>
      <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        <span style={{ color: GOLD, marginRight: 8 }}>{n}.</span>{title}
      </h2>
      <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </section>
  )
}

export default function TermsPageEn() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0910', padding: '96px 16px 72px' }}>
      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 8 }}>TERMS OF USE</p>
        <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 24 }}>Terms of Use</h1>

        <Article n={1} title="About these terms">
          <p>These terms govern your use of CORE TRAIT (core-trait.com, the &ldquo;service&rdquo;), operated by CORE TRAIT (independently operated, &ldquo;we&rdquo;). By using the service, you agree to these terms.</p>
        </Article>

        <Article n={2} title="The service">
          <p>The service provides a personality test and its result (your archetype, personality factor scores, and interpretation). If we offer paid features such as an in-depth report, we’ll tell you the price, what’s included, and the refund terms before you pay.</p>
        </Article>

        <Article n={3} title="What your result is — and isn’t">
          <p>Your result is meant to help you understand yourself. It is not a medical or psychological diagnosis and does not replace professional advice or treatment.</p>
          <p>Don’t use test results as the sole basis for decisions that significantly affect other people, such as hiring, admissions, or evaluations.</p>
        </Article>

        <Article n={4} title="Acceptable use">
          <p>You agree not to:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>submit answers repeatedly by automated means or place excessive load on the service;</li>
            <li>copy, distribute, or commercially use our questions, interpretations, or images without permission;</li>
            <li>publish someone else’s result link without their consent;</li>
            <li>attempt to access restricted areas such as the admin pages.</li>
          </ul>
        </Article>

        <Article n={5} title="Age">
          <p>You must be at least 16 years old to use the service.</p>
        </Article>

        <Article n={6} title="Intellectual property">
          <p>The questions, the archetype system and names, interpretation text, and archetype illustrations belong to us. You may keep your own result and share it using the sharing features.</p>
        </Article>

        <Article n={7} title="Changes and interruptions">
          <p>We may change the service or how the test works in order to improve it. If we need to discontinue the service, we’ll try to announce it on the site in advance.</p>
        </Article>

        <Article n={8} title="Limitation of liability">
          <p>The service is provided &ldquo;as is.&rdquo; To the extent permitted by law, we’re not responsible for interruptions caused by events beyond our control, or for the outcomes of decisions you make based on your result, except in cases of our intent or gross negligence. Nothing in these terms limits rights you have under mandatory consumer protection laws in your country.</p>
        </Article>

        <Article n={9} title="Privacy">
          <p>How we handle your data is described in our <Link href="/en/privacy" style={{ color: '#e2c064' }}>Privacy Policy</Link>.</p>
        </Article>

        <Article n={10} title="Changes to these terms">
          <p>If we change these terms, we’ll post the new version and its effective date on the site at least 7 days in advance (30 days for changes that are unfavorable to you).</p>
        </Article>

        <Article n={11} title="Contact and disputes">
          <p>If you have a question or a dispute, please contact us first at <a href={`mailto:${PRIVACY_CONTACT}`} style={{ color: '#e2c064' }}>{PRIVACY_CONTACT}</a>. These terms are governed by the laws of the Republic of Korea, without prejudice to mandatory consumer protections that apply where you live.</p>
        </Article>

        <p style={{ fontSize: 13, color: MUTED, borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>Effective as of {TERMS_VERSION}.</p>
      </article>
    </main>
  )
}
