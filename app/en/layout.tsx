import type { Metadata } from 'next'

// 영어판 공통 메타데이터 — 루트 레이아웃(한국어)의 값을 덮어씀
const TITLE = 'CORE TRAIT · 22 Archetype Personality Test'
const DESCRIPTION = 'Answer 48 questions based on the HEXACO personality model and find your archetype among 22. Free · About 8 minutes.'
const OG_IMAGE = '/og-en.png'

export const metadata: Metadata = {
  // absolute: 루트 레이아웃의 제목 틀('%s | CORE TRAIT')이 한 번 더 붙지 않게
  title: { absolute: TITLE, template: '%s | CORE TRAIT' },
  description: DESCRIPTION,
  keywords: ['personality test', 'HEXACO', 'archetype', 'personality type', 'MBTI alternative', 'free personality quiz'],
  openGraph: {
    type: 'website', locale: 'en_US', url: '/en', siteName: 'CORE TRAIT',
    title: TITLE, description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'CORE TRAIT' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return children
}
