// 서버 전용 — 페이앱 연동 (https://www.payapp.kr/dev_center/dev_center01.html)
// 환경변수: PAYAPP_USERID(판매자 아이디), PAYAPP_LINKKEY(연동 KEY), PAYAPP_LINKVAL(연동 VALUE) — 판매자 관리 사이트 > 설정
import { timingSafeEqual } from 'node:crypto'

export const PAYAPP_SCRIPT = 'https://lite.payapp.kr/public/api/v2/payapp-lite.js'
const API = 'https://api.payapp.kr/oapi/apiLoad.html'

export function payappConfig() {
  const userid = process.env.PAYAPP_USERID?.trim()
  const linkkey = process.env.PAYAPP_LINKKEY?.trim()
  const linkval = process.env.PAYAPP_LINKVAL?.trim()
  return userid && linkkey && linkval ? { userid, linkkey, linkval } : null
}

const same = (a: string | null | undefined, b: string) => {
  if (!a) return false
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

// 결제 알림이 진짜 페이앱에서 온 것인지 — 판매자 아이디·연동 KEY·연동 VALUE가 모두 일치해야 함
export function verifyFeedback(form: URLSearchParams): boolean {
  const cfg = payappConfig()
  if (!cfg) return false
  return same(form.get('userid'), cfg.userid) && same(form.get('linkkey'), cfg.linkkey) && same(form.get('linkval'), cfg.linkval)
}

// pay_state → 주문 상태
export function statusFromPayState(state: number): 'paid' | 'waiting' | 'cancelled' | 'refunded' | 'partially_refunded' | null {
  if (state === 4) return 'paid'
  if (state === 10) return 'waiting'
  if (state === 8 || state === 32) return 'cancelled'
  if (state === 9 || state === 64) return 'refunded'
  if (state === 70 || state === 71) return 'partially_refunded'
  return null   // 1(요청) 등은 상태 변화 없음
}

// 결제 취소(환불) — 관리자 화면에서만 호출
export async function cancelPayment(mulNo: string, memo: string): Promise<{ ok: boolean; message: string }> {
  const cfg = payappConfig()
  if (!cfg) return { ok: false, message: 'PAYAPP 환경변수가 설정되지 않았습니다' }
  const body = new URLSearchParams({ cmd: 'paycancel', userid: cfg.userid, linkkey: cfg.linkkey, mul_no: mulNo, cancelmemo: memo.slice(0, 100) })
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body })
  const out = new URLSearchParams(await res.text())
  return out.get('state') === '1' ? { ok: true, message: '취소 요청 완료' } : { ok: false, message: out.get('errorMessage') || `HTTP ${res.status}` }
}
