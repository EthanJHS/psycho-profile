import { timingSafeEqual } from 'node:crypto'

// ADMIN_PASSWORD 미설정 시 항상 거부 (fail closed)
export function isAdminAuthorized(authHeader: string | null): boolean {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password || !authHeader?.startsWith('Basic ')) return false
  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
  const given = Buffer.from(decoded.slice(decoded.indexOf(':') + 1))
  const expected = Buffer.from(password)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export const ADMIN_CHALLENGE = { 'WWW-Authenticate': 'Basic realm="CoreTrait Admin", charset="UTF-8"' }
