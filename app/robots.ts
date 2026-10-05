import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-trait.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 관리자·비공개 유료 리포트·API, 그리고 개인 응답·점수가 담긴 결과·비교 페이지
      disallow: ['/admin', '/career', '/api/', '/hexaco-result', '/en/result', '/compare', '/en/compare'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
