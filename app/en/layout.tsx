import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-trait.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CoreTrait · Personality Assessment',
    template: '%s | CoreTrait',
  },
  description: 'HEXACO-based personality assessment with 24 subfacets, Holland RIASEC career interests, academic aptitude, work style, and investment profile. Free during beta.',
  keywords: ['personality test', 'HEXACO', 'Big Five', 'personality assessment', 'career interests', 'RIASEC', 'aptitude test', 'work style'],
  authors: [{ name: 'CoreTrait' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${SITE_URL}/en`,
    siteName: 'CoreTrait',
    title: 'CoreTrait · Personality Assessment',
    description: 'HEXACO-based personality assessment with 24 subfacets, Holland RIASEC career interests, and work style analysis.',
  },
  robots: { index: true, follow: true },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
