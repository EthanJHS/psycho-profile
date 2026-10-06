'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { captureLanding, initSession } from '@/lib/analytics'
import { langFromPath } from '@/lib/i18n'

// 사이트에 들어온 순간의 광고 정보(UTM)와 도착 페이지를 기억하고, 방문을 기록한다.
// 한국어판은 도착 즉시 기록. 영어판은 EU 기준에 맞춰 검사 시작 때 동의한 뒤에만 기록(값은 메모리에만 보관).
// 관리자·비공개 진로 리포트 화면은 집계하지 않음
export default function VisitTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/career')) return
    captureLanding()
    if (langFromPath(pathname) === 'ko') initSession().catch(() => {})
  }, [pathname])
  return null
}
