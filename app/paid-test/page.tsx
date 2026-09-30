'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaidTestRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/paid') }, [router])
  return null
}
