'use client'

import { useState } from 'react'

interface BehaviorSection {
  question_funnel: { qid: string; index: number; reach: number }[]
  slow_questions: { qid: string; avg_ms: number; count: number }[]
  abandon_by_bucket: { label: string; count: number }[]
  scroll_depth: Record<string, number>
  answer_dist_sample: { qid: string; dist: number[] }[]
}

interface Stats {
  overview: {
    total_sessions: number
    total_test_sessions: number
    completed_sessions: number
    full_completes: number
    paid_completes: number
    completion_rate_14d: number
    upgrade_rate_14d: number
  }
  profile_distribution: { id: string; count: number }[]
  daily_funnel: Record<string, number | string>[]
  slow_questions: { qid: string; avg_ms: number; count: number }[]
  device_distribution: Record<string, number>
  recent_events: { event_type: string; created_at: string; metadata?: Record<string, unknown> }[]
  paid: {
    hexaco_avg: Record<string, number>
    pattern_distribution: { key: string; count: number }[]
    riasec_distribution: { code: string; count: number }[]
    aptitude_distribution: { profile: string; count: number }[]
    avg_completion_ms: number | null
    device_distribution: Record<string, number>
  }
  behavior: {
    paid: BehaviorSection
    free: BehaviorSection
  }
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

function BehaviorPanel({ data, isPaid }: { data: BehaviorSection; isPaid: boolean }) {
  const scrollLabel = isPaid ? '유료 결과 페이지' : '무료 결과 페이지'
  const accentColor = isPaid ? '#f472b6' : '#67e8f9'

  const funnelBucketSize = isPaid ? 10 : 9
  const funnelTotal = isPaid ? 82 : 42
  const funnelBuckets = Array.from({ length: Math.ceil(funnelTotal / funnelBucketSize) }, (_, b) => {
    const start = b * funnelBucketSize
    const end = Math.min(funnelTotal - 1, start + funnelBucketSize - 1)
    const slice = data.question_funnel.slice(start, end + 1)
    return {
      label: `Q${start + 1}–${end + 1}`,
      avg: slice.length ? Math.round(slice.reduce((s, q) => s + q.reach, 0) / slice.length) : 0,
    }
  })
  const maxBucket = Math.max(...funnelBuckets.map(b => b.avg), 1)
  const maxAb = Math.max(...data.abandon_by_bucket.map(b => b.count), 1)
  const max25 = data.scroll_depth['25%'] ?? 1

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 퍼널 */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-sm mb-1">문항별 도달 수 (퍼널)</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>급격히 줄어드는 구간 = 마찰 지점</p>
          {data.question_funnel.every(q => q.reach === 0) ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
          ) : (
            <div className="space-y-2">
              {funnelBuckets.map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{b.label}</span>
                    <span style={{ color: 'var(--text)' }}>{b.avg}명</span>
                  </div>
                  <MiniBar value={b.avg} max={maxBucket}
                    color={`hsl(${260 - Math.round(b.avg / maxBucket * 80)}, 70%, 65%)`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 이탈 + 스크롤 */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-1">이탈 구간 분포</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>검사 중 페이지를 닫은 시점</p>
            {data.abandon_by_bucket.every(b => b.count === 0) ? (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
            ) : (
              <div className="space-y-2">
                {data.abandon_by_bucket.map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span style={{ color: 'var(--muted)' }}>{b.label}</span>
                      <span style={{ color: '#f87171' }}>{b.count}명</span>
                    </div>
                    <MiniBar value={b.count} max={maxAb} color="#f87171" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-1">결과 페이지 읽기 깊이</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>스크롤 도달 비율 ({scrollLabel})</p>
            {Object.values(data.scroll_depth).every(v => v === 0) ? (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
            ) : (
              <div className="space-y-2">
                {(['25%', '50%', '75%', '100%'] as const).map((d, i) => {
                  const count = data.scroll_depth[d] ?? 0
                  const pct = max25 > 0 ? Math.round(count / max25 * 100) : 0
                  const colors = ['#34d399', '#67e8f9', '#a78bfa', '#f472b6']
                  return (
                    <div key={d}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: colors[i] }}>{d} 도달</span>
                        <span style={{ color: 'var(--text)' }}>{count}명
                          {i > 0 && <span style={{ color: 'var(--muted)', marginLeft: 4 }}>({pct}%)</span>}
                        </span>
                      </div>
                      <MiniBar value={count} max={Math.max(max25, 1)} color={colors[i]} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 느린 문항 TOP 10 */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-sm mb-1">응답 시간이 긴 문항 TOP 10</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>오래 고민하는 문항 = 문구 개선 또는 인지 부하 지점</p>
          {data.slow_questions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
          ) : (
            <table className="admin-table">
              <thead><tr><th>문항</th><th>평균 시간</th><th>응답 수</th></tr></thead>
              <tbody>
                {data.slow_questions.map(q => (
                  <tr key={q.qid}>
                    <td style={{ fontFamily: 'monospace', color: accentColor }}>{q.qid}</td>
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

        {/* 답변 분포 샘플 */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-sm mb-1">답변 분포 샘플 (섹션 대표 문항)</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>1~5 선택 비율 — 한 값에 쏠리면 문항 편향 의심</p>
          {data.answer_dist_sample.every(s => s.dist.every(v => v === 0)) ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
          ) : (
            <div className="space-y-4">
              {data.answer_dist_sample.map(({ qid, dist }) => {
                const total = dist.reduce((a, b) => a + b, 0) || 1
                return (
                  <div key={qid}>
                    <p className="text-xs font-mono mb-1" style={{ color: accentColor }}>{qid}</p>
                    <div className="flex gap-0.5 h-8 items-end">
                      {dist.map((cnt, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div style={{
                            width: '100%',
                            height: `${Math.round(cnt / total * 100)}%`,
                            minHeight: cnt > 0 ? 2 : 0,
                            background: `hsl(${260 + i * 30}, 70%, 65%)`,
                            borderRadius: 2,
                          }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {dist.map((cnt, i) => (
                        <div key={i} className="flex-1 text-center" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
                          {total > 1 ? `${Math.round(cnt / total * 100)}%` : '—'}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [behaviorTab, setBehaviorTab] = useState<'paid' | 'free'>('paid')

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

  const { overview, profile_distribution, daily_funnel, slow_questions, device_distribution, recent_events, paid, behavior } = stats
  const maxProfile = profile_distribution[0]?.count ?? 1
  const totalDevices = Object.values(device_distribution).reduce((a, b) => a + b, 0)

  const HEXACO_LABELS: Record<string, string> = { H: '겸손·윤리', E: '감수성', X: '대담성', A: '원만성', C: '성실성', O: '개방성' }
  const HEXACO_COLORS: Record<string, string> = { H: '#a78bfa', E: '#60a5fa', X: '#34d399', A: '#f472b6', C: '#fbbf24', O: '#fb923c' }
  const PATTERN_NAMES: Record<string, string> = {
    HO:'가치 기반 탐구자', HC:'신뢰할 수 있는 완벽주의자', HA:'공감적 도덕주의자',
    HX:'진정성 있는 설득자', HE:'섬세한 양심', OC:'지적 완벽주의자',
    OX:'창의적 혁신가', OA:'이상적 공감자', OE:'감수성 풍부한 탐구자',
    CX:'주도적 실행가', CA:'책임감 있는 조력자', CE:'꼼꼼한 공감자',
    XA:'사람 중심 리더', XE:'열정적 공감자', AE:'온화한 감수성인',
  }
  const maxPattern = paid?.pattern_distribution?.[0]?.count ?? 1
  const maxRiasec  = paid?.riasec_distribution?.[0]?.count ?? 1
  const maxApt     = paid?.aptitude_distribution?.[0]?.count ?? 1
  const paidTotal  = paid?.pattern_distribution?.reduce((a, b) => a + b.count, 0) ?? 0

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="총 방문 세션" value={overview.total_sessions.toLocaleString()} />
        <StatCard label="무료 검사 시작" value={overview.total_test_sessions.toLocaleString()} />
        <StatCard label="무료 검사 완료" value={overview.completed_sessions.toLocaleString()} />
        <StatCard label="유료 검사 완료" value={overview.paid_completes.toLocaleString()} color="#f472b6" />
        <StatCard
          label="무료 완료율 (14일)"
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
        <StatCard
          label="유료 평균 완료 시간"
          value={paid?.avg_completion_ms ? `${Math.round(paid.avg_completion_ms / 60000)}분` : '—'}
          sub="검사 시작→결과 화면"
        />
        <StatCard label="유료 누적 N" value={paidTotal.toLocaleString()} sub="포트폴리오 표기용" color="#a78bfa" />
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

      {/* ── 행동분석 ── */}
      {behavior && (
        <>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>유저 행동분석</h2>
            <div className="flex gap-2">
              {(['paid', 'free'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setBehaviorTab(tab)}
                  className="text-sm px-4 py-1.5 rounded-xl font-medium transition-all"
                  style={{
                    background: behaviorTab === tab ? 'linear-gradient(135deg,#7c3aed,var(--accent2))' : 'var(--surface2)',
                    color: behaviorTab === tab ? '#fff' : 'var(--muted)',
                    border: `1px solid ${behaviorTab === tab ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  {tab === 'paid' ? '유료 검사' : '무료 검사'}
                </button>
              ))}
            </div>
          </div>

          <BehaviorPanel data={behavior[behaviorTab]} isPaid={behaviorTab === 'paid'} />
        </>
      )}

      {/* ── 유료 검사 심층 분석 ── */}
      {paid && (
        <>
          <h2 className="text-lg font-bold mb-4 mt-2" style={{ color: 'var(--text)' }}>
            유료 검사 심층 분석
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted)' }}>포트폴리오 표기용 데이터</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            {/* HEXACO 요인별 평균 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-1 text-sm">HEXACO 요인별 평균 점수</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>1~5 척도 · 정규분포에 가까울수록 변별력 높음</p>
              <div className="space-y-3">
                {Object.entries(paid.hexaco_avg).map(([f, avg]) => (
                  <div key={f}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: HEXACO_COLORS[f] }}>{f} <span style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>{HEXACO_LABELS[f]}</span></span>
                      <span style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{avg.toFixed(2)}</span>
                    </div>
                    <MiniBar value={avg - 1} max={4} color={HEXACO_COLORS[f]} />
                  </div>
                ))}
              </div>
            </div>

            {/* 패턴 분포 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-1 text-sm">HEXACO 패턴 분포</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>15개 패턴이 고루 분포할수록 분류 타당성 높음</p>
              {paid.pattern_distribution.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
              ) : (
                <div className="space-y-2">
                  {paid.pattern_distribution.map(p => (
                    <div key={p.key}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>
                          <span className="font-mono font-bold" style={{ color: '#a78bfa' }}>{p.key}</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 6 }}>{PATTERN_NAMES[p.key] ?? ''}</span>
                        </span>
                        <span style={{ color: 'var(--text)' }}>{p.count}명 ({paidTotal > 0 ? Math.round(p.count / paidTotal * 100) : 0}%)</span>
                      </div>
                      <MiniBar value={p.count} max={maxPattern} color="#a78bfa" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIASEC + 적성 */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-1 text-sm">Holland Code 분포</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>RIASEC 상위 3자리 조합</p>
                {paid.riasec_distribution.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
                ) : (
                  <div className="space-y-2">
                    {paid.riasec_distribution.slice(0, 8).map(r => (
                      <div key={r.code}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-mono font-bold" style={{ color: '#67e8f9' }}>{r.code}</span>
                          <span style={{ color: 'var(--muted)' }}>{r.count}명</span>
                        </div>
                        <MiniBar value={r.count} max={maxRiasec} color="#67e8f9" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-1 text-sm">적성 프로파일 분포</h3>
                {paid.aptitude_distribution.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>데이터 없음</p>
                ) : (
                  <div className="space-y-2">
                    {paid.aptitude_distribution.map(a => (
                      <div key={a.profile}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span style={{ color: 'var(--text)' }}>{a.profile}</span>
                          <span style={{ color: 'var(--muted)' }}>{a.count}명 ({paidTotal > 0 ? Math.round(a.count / paidTotal * 100) : 0}%)</span>
                        </div>
                        <MiniBar value={a.count} max={maxApt} color="#fbbf24" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 푸터 */}
      <div className="text-center py-6">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>PsychoProfile Admin · 데이터는 실시간 Supabase 기준</p>
      </div>
    </main>
  )
}
