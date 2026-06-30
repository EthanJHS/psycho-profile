import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://psycho-profile.vercel.app'
const OG_IMAGE = `${SITE_URL}/og.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PsychoProfile — 나를 가장 정확하게 분석하는 심리검사',
    template: '%s | PsychoProfile',
  },
  description: 'HEXACO·TCI·인지 스타일 통합 분석. 28개 세분화 프로파일로 성격, 진로, 공부법, 생활 패턴까지 한 번에 알아보세요.',
  keywords: ['심리검사', 'HEXACO', '성격유형', '진로', 'MBTI 대안', '인지능력', '성격분석', '자기계발'],
  authors: [{ name: 'PsychoProfile' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'PsychoProfile',
    title: 'PsychoProfile — 나를 가장 정확하게 분석하는 심리검사',
    description: 'HEXACO·TCI·인지 스타일 통합 분석. 28개 세분화 프로파일로 성격, 진로, 공부법, 생활 패턴까지.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'PsychoProfile' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PsychoProfile — 나를 가장 정확하게 분석하는 심리검사',
    description: 'HEXACO·TCI·인지 스타일 통합 분석. 28개 세분화 프로파일로 성격, 진로, 공부법, 생활 패턴까지.',
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
