import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminAuthorized, ADMIN_CHALLENGE } from '@/lib/admin-auth'

export function proxy(request: NextRequest) {
  if (isAdminAuthorized(request.headers.get('authorization'))) return NextResponse.next()
  return new NextResponse('Authentication required', { status: 401, headers: ADMIN_CHALLENGE })
}

export const config = {
  // 관리자 화면·API, 그리고 품질 검토용 샘플 리포트만 잠금.
  // 진로 리포트(/career)는 공개 — 검사 시작은 서버에서 결제된 주문인지 확인한다 (/api/career/start)
  matcher: ['/admin/:path*', '/api/admin/:path*', '/career/samples', '/career/samples/:path*'],
}
