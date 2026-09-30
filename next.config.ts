import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

// 동의 절차 없이 응답을 저장하던 구버전 검사·영문 페이지 — 현재 검사로 연결 (307: 되돌릴 수 있게 임시 리다이렉트)
const LEGACY_PATHS = ['/test', '/result', '/deep', '/paid', '/paid-test', '/paid-result', '/paid-result/print']
// 예전 영문 유료 페이지 — 새 영어판 검사로 연결 (/en, /en/test, /en/result는 새 영어판이 그대로 씀)
const LEGACY_PATHS_EN = ['/en/paid', '/en/paid-test', '/en/paid-result', '/en/paid-result/print']

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...LEGACY_PATHS.map(source => ({ source, destination: '/hexaco-test', permanent: false })),
      ...LEGACY_PATHS_EN.map(source => ({ source, destination: '/en/test', permanent: false })),
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
