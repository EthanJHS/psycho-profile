import type { Metadata } from 'next'
import { Gowun_Batang } from 'next/font/google'
import './globals.css'

// 원형 그림(유화·금박)과 어울리는 제목용 명조 — 한글은 subset 지정이 불가해 preload 끔
const serif = Gowun_Batang({ weight: ['400', '700'], subsets: ['latin'], preload: false, display: 'swap', variable: '--font-serif' })
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/SiteFooter'
import LangSetter from '@/components/LangSetter'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-trait.com'
const OG_IMAGE = `${SITE_URL}/og.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CORE TRAIT · 22가지 원형 성격검사',
    template: '%s | CORE TRAIT',
  },
  description: 'HEXACO 성격모델 48문항으로 22가지 원형 중 당신의 원형을 찾아드립니다. 무료 · 약 8분.',
  keywords: ['심리검사', 'HEXACO', '성격유형', '진로', 'MBTI 대안', '인지능력', '성격분석', '자기계발'],
  authors: [{ name: 'CoreTrait' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'CORE TRAIT',
    title: 'CORE TRAIT · 22가지 원형 성격검사',
    description: 'HEXACO 성격모델 48문항으로 22가지 원형 중 당신의 원형을 찾아드립니다. 무료 · 약 8분.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'CoreTrait' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CORE TRAIT · 22가지 원형 성격검사',
    description: 'HEXACO 성격모델 48문항으로 22가지 원형 중 당신의 원형을 찾아드립니다. 무료 · 약 8분.',
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`h-full ${serif.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        <LangSetter />
        <Navbar />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
