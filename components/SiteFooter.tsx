'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OPERATOR, PRIVACY_CONTACT } from '@/lib/consent'
import { langFromPath, PATHS } from '@/lib/i18n'

const T = {
  ko: { operator: OPERATOR, terms: '이용약관', privacy: '개인정보 처리방침' },
  en: { operator: 'CORE TRAIT (independently operated)', terms: 'Terms of Use', privacy: 'Privacy Policy' },
}

export default function SiteFooter() {
  const path = usePathname()
  if (path.startsWith('/admin') || path.startsWith('/hexaco-test') || path.startsWith('/en/test')) return null
  const lang = langFromPath(path)
  const t = T[lang]
  return (
    <footer style={{ background: '#0b0910', borderTop: '1px solid rgba(200,160,48,0.18)', padding: '22px 16px 28px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '6px 16px', alignItems: 'center', fontSize: 12, color: 'rgba(239,230,210,0.45)' }}>
        <span>{t.operator}</span>
        <Link href={PATHS[lang].terms} style={{ color: 'rgba(239,230,210,0.6)', textDecoration: 'none' }}>{t.terms}</Link>
        <Link href={PATHS[lang].privacy} style={{ color: 'rgba(239,230,210,0.75)', fontWeight: 600, textDecoration: 'none' }}>{t.privacy}</Link>
        <a href={`mailto:${PRIVACY_CONTACT}`} style={{ color: 'rgba(239,230,210,0.55)', textDecoration: 'none' }}>{PRIVACY_CONTACT}</a>
      </div>
    </footer>
  )
}
