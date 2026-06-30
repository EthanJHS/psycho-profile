'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()
  if (path.startsWith('/admin')) return null

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-[64px]"
      style={{
        background: 'rgba(9,8,15,0.82)',
        backdropFilter: 'blur(18px) saturate(1.6)',
        borderBottom: '1px solid rgba(42,37,64,0.7)',
      }}
    >
      {/* 로고 */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group"
        style={{ textDecoration: 'none' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
        >
          P
        </div>
        <span
          className="font-bold text-base tracking-tight gradient-text"
        >
          PsychoProfile
        </span>
      </Link>

      {/* 오른쪽 액션 */}
      <nav className="flex items-center gap-3">
        <Link
          href="/test"
          className="hidden sm:block text-sm font-medium transition-colors"
          style={{ color: 'var(--muted)', textDecoration: 'none' }}
        >
          무료 테스트
        </Link>
        <Link href="/test" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          시작하기
        </Link>
      </nav>
    </header>
  )
}
