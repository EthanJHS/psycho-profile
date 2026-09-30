'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { langFromPath, PATHS } from '@/lib/i18n'

const T = {
  ko: { freeTest: '무료 테스트', start: '시작하기', switchLabel: 'EN', switchHref: '/en', switchAria: 'English version' },
  en: { freeTest: 'Free test', start: 'Start', switchLabel: '한국어', switchHref: '/', switchAria: '한국어 버전' },
}

export default function Navbar() {
  const path = usePathname()
  if (path.startsWith('/admin')) return null
  const lang = langFromPath(path)
  const t = T[lang]
  const testHref = `${PATHS[lang].test}?start=1`

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-[64px]"
      style={{
        background: 'rgba(9,8,15,0.82)',
        backdropFilter: 'blur(18px) saturate(1.6)',
        borderBottom: '1px solid rgba(200,160,48,0.18)',
      }}
    >
      {/* 로고 */}
      <Link href={PATHS[lang].home} className="flex items-center gap-2.5 group" style={{ textDecoration: 'none' }}>
        <span aria-hidden style={{ width: 11, height: 11, transform: 'rotate(45deg)', border: '1.5px solid #c8a030', boxShadow: '0 0 10px rgba(200,160,48,0.35)' }} />
        <span style={{ fontFamily: 'var(--font-serif), serif', fontWeight: 700, fontSize: 16, letterSpacing: '0.12em', color: '#efe6d2' }}>
          CORE TRAIT
        </span>
      </Link>

      {/* 오른쪽 액션 */}
      <nav className="flex items-center gap-3">
        <Link href={t.switchHref} aria-label={t.switchAria} hrefLang={lang === 'ko' ? 'en' : 'ko'} style={{
          fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 999, textDecoration: 'none',
          color: 'rgba(239,230,210,0.7)', border: '1px solid rgba(200,160,48,0.25)',
        }}>
          {t.switchLabel}
        </Link>
        <Link href={testHref} className="hidden sm:block text-sm font-medium transition-colors" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          {t.freeTest}
        </Link>
        <Link href={testHref} style={{
          padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800, borderRadius: 999, textDecoration: 'none',
          background: 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)', color: '#1a1206',
        }}>
          {t.start}
        </Link>
      </nav>
    </header>
  )
}
