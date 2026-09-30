import type { MetadataRoute } from 'next'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'
import { PATHS } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-trait.com'

// 공개 페이지만 — /admin·/career(비공개)·/api·결과 페이지(개인 응답)는 넣지 않음
// 한국어·영어 짝이 있는 페이지는 서로를 언어 대응 주소로 알림 (hreflang)
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pair = (ko: string, en: string, changeFrequency: 'weekly' | 'monthly' | 'yearly', priority: number): MetadataRoute.Sitemap => {
    const alternates = { languages: { ko: `${SITE_URL}${ko}`, en: `${SITE_URL}${en}` } }
    return [
      { url: `${SITE_URL}${ko}`, lastModified: now, changeFrequency, priority, alternates },
      { url: `${SITE_URL}${en}`, lastModified: now, changeFrequency, priority, alternates },
    ]
  }
  return [
    ...pair(PATHS.ko.home, PATHS.en.home, 'weekly', 1),
    ...pair(PATHS.ko.test, PATHS.en.test, 'monthly', 0.9),
    ...Object.keys(ARCHETYPE_DETAILS).flatMap(id => pair(PATHS.ko.share(id), PATHS.en.share(id), 'monthly', 0.7)),
    { url: `${SITE_URL}${PATHS.ko.privacy}`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}${PATHS.ko.terms}`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}${PATHS.en.privacy}`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}${PATHS.en.terms}`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
