'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { langFromPath } from '@/lib/i18n'

// 루트 레이아웃은 하나라 <html lang>이 "ko"로 고정 → 영어 경로에서는 화면 낭독기·번역기용으로 바꿔 줌
export default function LangSetter() {
  const pathname = usePathname()
  useEffect(() => {
    document.documentElement.lang = langFromPath(pathname)
  }, [pathname])
  return null
}
