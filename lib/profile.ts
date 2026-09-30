'use client'

import { supabase } from './supabase'

// 기기 단위 가명 프로필 — 무료 검사와 이후 측정 모듈을 같은 사람의 것으로 잇는 무작위 번호.
// 이름·연락처와 연결되지 않으며, 브라우저 저장소를 지우면 새 번호가 만들어진다.
const KEY = 'ct_profile_id'
const SAVED = 'ct_profile_saved'

function storage(): Storage | null {
  try { return window.localStorage } catch { return null }
}

export function getProfileId(): string {
  const s = storage()
  let id = s?.getItem(KEY) ?? sessionStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    try { s?.setItem(KEY, id) } catch { /* 저장 불가 환경 — 세션에만 유지 */ }
    sessionStorage.setItem(KEY, id)
  }
  return id
}

let pending: Promise<string> | null = null
export function ensureProfile(): Promise<string> {
  if (pending) return pending
  pending = (async () => {
    const id = getProfileId()
    const s = storage()
    if (!supabase || s?.getItem(SAVED) === id) return id
    const { error } = await supabase.from('profiles').insert({ id })
    // 23505 = 이미 저장된 프로필
    if (!error || error.code === '23505') { try { s?.setItem(SAVED, id) } catch { /* 무시 */ } }
    return id
  })()
  return pending
}
