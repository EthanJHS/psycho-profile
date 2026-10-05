// 비교 링크의 미리보기 — 링크를 보낸 사람의 원형 이미지와 "나는 ○○. 너는?" 제목
import type { Metadata } from 'next'
import { decodeCompareCode } from './compare'
import { CONTENT, type Lang } from './i18n'

const TEXT = {
  ko: { title: (name: string) => `나는 ${name}. 너는? — 원형 비교`, fallback: '친구와 원형 비교하기', description: '검사하고 친구와 6가지 성격 요인을 나란히 비교해 보세요. 무료 · 약 8분.' },
  en: { title: (name: string) => `I got ${name}. What are you?`, fallback: 'Compare archetypes with a friend', description: 'Take the test and compare your six personality factors side by side. Free · About 8 minutes.' },
}

export function compareMetadata(lang: Lang, code: string | undefined): Metadata {
  const t = TEXT[lang]
  const profile = decodeCompareCode(code)
  const detail = profile ? CONTENT[lang].archetypes[profile.archetypeId] : null
  const title = detail ? t.title(detail.name) : t.fallback
  const images = detail ? [{ url: `/archetypes/og/${lang}/${profile!.archetypeId}.jpg`, width: 1200, height: 630, alt: detail.name }] : undefined
  return {
    title,
    description: t.description,
    robots: { index: false },   // 개인의 점수가 담긴 링크 — 검색에 노출하지 않음
    openGraph: { title, description: t.description, locale: lang === 'en' ? 'en_US' : 'ko_KR', ...(images ? { images } : {}) },
    twitter: { card: 'summary_large_image', title, description: t.description, ...(images ? { images: images.map(i => i.url) } : {}) },
  }
}
