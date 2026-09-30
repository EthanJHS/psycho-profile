import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminAuthorized, ADMIN_CHALLENGE } from '@/lib/admin-auth'

export function proxy(request: NextRequest) {
  if (isAdminAuthorized(request.headers.get('authorization'))) return NextResponse.next()
  return new NextResponse('Authentication required', { status: 401, headers: ADMIN_CHALLENGE })
}

export const config = {
  // /career는 결제 연동 전까지 관리자만 미리보기 (공개 시 이 두 줄 제거)
  matcher: ['/admin/:path*', '/api/admin/:path*', '/career/:path*', '/api/career/:path*'],
}
