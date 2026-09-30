import type { MetadataRoute } from 'next'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-trait.com'

// 공개 페이지만 — /admin·/career(비공개)·/api·결과 페이지(개인 응답)는 넣지 않음
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/hexaco-test`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...Object.keys(ARCHETYPE_DETAILS).map(id => ({
      url: `${SITE_URL}/a/${id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
