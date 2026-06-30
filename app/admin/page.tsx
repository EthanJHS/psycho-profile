'use client'

import { useState } from 'react'

interface Stats {
  overview: {
    total_sessions: number
    total_test_sessions: number
    completed_sessions: number
    full_completes: number
    completion_rate_14d: number
    upgrade_rate_14d: number
  }
  profile_distribution: { id: string; count: number }[]
  daily_funnel: Record<string, number | string>[]
  slow_questions: { qid: string; avg_ms: number; count: number }[]
  device_distribution: Record<string, number>
  recent_events: { event_type: string; created_at: string; metadata?: Record<string, unknown> }[]
}

const PROFILE_LABELS: Record<string, string> = {
  strategic_perfectionist: '전략적 완벽주의자',
  high_performer_burnout: '고성과-번아웃 위험형',
  innovative_explorer: '탐구형 혁신가',
  quiet_genius: '조용한 천재',
  pragmatic_expert: '실용형 전문가',
  charismatic_leader: '카리스마 리더',
  empathic_helper: '공감형 조력자',
  principled_guardian: '원칙형 수호자',
  creative_dreamer: '창의적 몽상가',
  analytical_researcher: '분석형 연구자',
  passionate_changemaker: '열정형 변화 주도자',
  introverted_specialist: '내향적 전문직',
  sensitive_perfectionist: '민감형 완벽주의자',
  social_energizer: '사교형 에너자이저',
  stability_seeker: '안정 추구형',
  independent_artisan: '독립형 장인',
  anxious_drifter: '동기불안형',
  cooperative_mediator: '협력형 중재자',
  realistic_executor: '현실형 실행가',
  philosophical_thinker: '탐구형 철학자',
  balanced_achiever: '균형형 성취자',
  ambitious_striver: '야망형 도전자',
  sensitive_introvert: '민감형 내향인',
  logical_skeptic: '논리적 회의주의자',
  empathic_achiever: '공감형 성취자',
  structured_innovator: '구조적 혁신가',
  default_explorer: '탐색형 성장인',
}

const EVENT_COLORS: Record<string, string> = {
  test_start: '#7c6ef0',
  test_complete: '#a78bfa',
  full_test_complete: '#e879f9',
  result_view: '#34d399',
  upgrade_click: '#f59e0b',
  purchase: '#ef4444',
}

function MiniBar({ value, max, color = 'var(--accent)' }: { value: number; max: number; color?: string }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'var(--surface2)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.round((value / max) * 100)}%`, height: '100%', background: color, borderRadius: 9999, transition: 'width 0.8s ease' }} />
    </div>
  )
}

function StatCard({ label, value, sub, color = 'var(--accent2)' }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchStats(password: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-password': password },
      })
      if (!res.ok) { setError('비밀번호가 틀렸습니다.'); return }
      const data = await res.json()
      setStats(data)
      setAuthed(true)
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 로그인
  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-10 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2">어드민</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>PsychoProfile 관리자 대시보드</p>
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats(pw)}
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          {error && <p className="text-sm mb-3" style={{ color: '#f87171' }}>{error}</p>}
          <button
            onClick={() => fetchStats(pw)}
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? '확인 중...' : '접속'}
          </button>
        </div>
      </main>
    )
  }

  if (!stats) return null

  const { overview, profile_distribution, daily_funnel, slow_questions, device_distribution, recent_events } = stats
  const maxProfile = profile_distribution[0]?.count ?? 1
  const totalDevices = Object.values(device_distribution).reduce((a, b) => a + b, 0)

  return (
    <main className="min-h-screen px-6 py-10" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold gradient-text">대시보드</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>PsychoProfile 어드민</p>
        </div>
        <button
          onClick={() => fetchStats(pw)}
          className="btn-secondary text-sm px-4 py-2"
        >
          새로고침
        </button>
      </div>

      {/* ── 개요 지표 ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="총 방문 세션" value={overview.total_sessions.toLocaleString()} />
        <StatCard label="테스트 시작" value={overview.total_test_sessions.toLocaleString()} />
        <StatCard label="샘플 완료" value={overview.completed_sessions.toLocaleString()} />
        <StatCard label="풀버전 완료" value={overview.full_completes.toLocaleString()} color="#e879f9" />
        <StatCard
          label="완료율 (14일)"
          value={`${overview.completion_rate_14d}%`}
          sub="시작→완료"
          color={overview.completion_rate_14d >= 60 ? '#34d399' : '#f59e0b'}
        />
        <StatCard
          label="업그레이드 클릭률 (14일)"
          value={`${overview.upgrade_rate_14d}%`}
          sub="완료→업그레이드 클릭"
          color={overview.upgrade_rate_14d >= 20 ? '#34d399' : '#f59e0b'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* ── 퍼널 (일별) ── */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">퍼널 현황 (최근 7일)</h2>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>시작</th>
                  <th>완료</th>
                  <th>결과뷰</th>
                  <th>업그레이드</th>
                </tr>
              </thead>
              <tbody>
                {daily_funnel.length === 0 ? (
                  <tr><td colSpan={5} style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>데이터 없음</td></tr>
                ) : daily_funnel.map((row, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--muted)' }}>{String(row.day)}</td>
                    <td style={{ color: '#7c6ef0' }}>{Number(row.test_start ?? 0)}</td>
                    <td style={{ color: '#a78bfa' }}>{Number(row.test_complete ?? 0)}</td>
                    <td style={{ color: '#34d399' }}>{Number(row.result_view ?? 0)}</td>
                    <td style={{ color: '#f59e0b' }}>{Number(row.upgrade_click ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 프로파일 분포 ── */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">프로파일 분포</h2>
          {profile_distribution.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>아직 완료된 테스트 없음</p>
          ) : (
            <div className="space-y-3">
              {profile_distribution.slice(0, 10).map(p => (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{PROFILE_LABELS[p.id] ?? p.id}</span>
                    <span style={{ color: 'var(--accent2)' }}>{p.count}명</span>
                  </div>
                  <MiniBar value={p.count} max={maxProfile} color="linear-gradient(90deg,#7c6ef0,#a78bfa)" />
                </div>
              ))}
              {profile_distribution.length > 10 && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>+{profile_distribution.length - 10}개 더</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* ── 느린 문항 (이탈 위험) ── */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-1">응답 시간이 긴 문항 TOP 10</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>이탈 가능성 높은 문항 — 문구 개선 후보</p>
          {slow_questions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>문항 ID</th>
                  <th>평균(ms)</th>
                  <th>응답수</th>
                </tr>
              </thead>
              <tbody>
                {slow_questions.map(q => (
                  <tr key={q.qid}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent2)' }}>{q.qid}</td>
                    <td style={{ color: q.avg_ms > 15000 ? '#f87171' : q.avg_ms > 8000 ? '#f59e0b' : 'var(--text)' }}>
                      {(q.avg_ms / 1000).toFixed(1)}s
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{q.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── 디바이스 + 최근 이벤트 ── */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4">디바이스 분포</h2>
            {totalDevices === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(device_distribution).map(([device, count]) => (
                  <div key={device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{device}</span>
                      <span style={{ color: 'var(--accent2)' }}>
                        {count}명 ({Math.round((count / totalDevices) * 100)}%)
                      </span>
                    </div>
                    <MiniBar value={count} max={totalDevices} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4">최근 이벤트</h2>
            <div className="space-y-2">
              {recent_events.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
              ) : recent_events.slice(0, 8).map((ev, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{
                      background: `${EVENT_COLORS[ev.event_type] ?? '#6b7280'}22`,
                      color: EVENT_COLORS[ev.event_type] ?? 'var(--muted)',
                    }}
                  >
                    {ev.event_type}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    {new Date(ev.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="text-center py-6">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>PsychoProfile Admin · 데이터는 실시간 Supabase 기준</p>
      </div>
    </main>
  )
}
