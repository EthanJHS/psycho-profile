'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ARCHETYPE_DETAILS } from '@/lib/archetypes-hexaco'
import { ARCHETYPES } from '@/lib/scoring-hexaco'
import { HEXACO_QUESTIONS } from '@/lib/questions-hexaco'
import { ADMIN_SIM_KEY } from '@/lib/analytics'

// ── 타입 ─────────────────────────────────────────────────────────────────────
type Factor = 'H' | 'E' | 'X' | 'A' | 'C' | 'O'
interface GateItem { key: string; label: string; value: number | null; target: number; unit: string; basis: string; met: boolean }
interface Stats {
  health?: { db_ok: boolean; last_saved_at: string | null }
  gate:{ items: GateItem[]; sample: number; minSample: number }
  career: { stage: string; plan: string; started: number; completed: number }[]
  overview: {
    visits_14d: number
    started_total: number
    completed_total: number
    completion_rate_14d: number
    by_version: Record<string, number>
    waitlist: number
  }
  result_funnel: {
    completed: number; result_view: number; report_click: number; report_view: number
    unlock_click: number; unlock_by_source: Record<string, number>
  }
  scroll_depth: Record<string, number>
  daily: { day: string; started: number; completed: number; report_view: number; unlock_click: number }[]
  abandon_by_bucket: { label: string; count: number }[]
  archetype_distribution: { id: string; count: number; pct: number; expected_pct: number }[]
  factor_means: Record<Factor, { mean: number; sd: number } | null>
  item_stats: { id: string; factor: Factor; reverse: boolean; n: number; mean: number | null; sd: number | null; dist: number[]; item_total_r: number | null }[]
  reliability: Record<Factor, { alpha: number | null; n: number }>
  device_distribution: Record<string, number>
  survey: { count: number; avg_rating: number | null; rating_dist: number[]; recent_opinions: { rating: number; opinion: string; created_at: string }[] }
  recent_events: { event_type: string; created_at: string; metadata?: Record<string, unknown> }[]
}

const FACTOR_NAMES: Record<Factor, string> = { H: '정직·겸손', E: '정서성', X: '외향성', A: '원만성', C: '성실성', O: '개방성' }
const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }
const muted = 'rgba(255,255,255,0.35)'
function Empty({ text = '데이터 없음' }: { text?: string }) {
  return <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{text}</p>
}
function CardTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{sub}</p>}
    </>
  )
}

// ── 유틸 ─────────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color = '#7c3aed' }: { value: number; max: number; color?: string }) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function StatCard({ label, value, sub, color = '#a78bfa' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(200,168,75,0.3))' }} />
        <span style={{ fontSize: 9, color: 'rgba(200,168,75,0.5)' }}>✦</span>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(200,168,75,0.3))' }} />
      </div>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{sub}</p>}
    </div>
  )
}

// ── 1. 원형 미리보기 그리드 ───────────────────────────────────────────────────
function ArchetypePreviewGrid() {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  const COLORS: Record<string, string> = {
    guardian: '#b45309', warrior: '#dc2626', visionary: '#3b82f6', artisan: '#d97706',
    sentinel: '#60a5fa', conqueror: '#10b981', opportunist: '#f59e0b', strategist: '#9ca3af',
    charmer: '#f472b6', companion: '#fbbf24', empath: '#2dd4bf', passionate: '#ef4444',
    fighter: '#6b7280', coordinator: '#f59e0b', sage: '#e5e7eb', analyst: '#67e8f9',
    explorer: '#14b8a6', dreamer: '#a78bfa', cynic: '#7c3aed', pragmatist: '#94a3b8',
    realist: '#ca8a04', hedonist: '#be185d',
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="원형별 결과 미리보기" sub="카드 클릭 → 해당 원형의 결과 페이지로 이동" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
        {ARCHETYPES.map(a => {
          const detail = ARCHETYPE_DETAILS[a.id]
          const color = COLORS[a.id] ?? '#a78bfa'
          const err = imgErrors.has(a.id)
          return (
            <button
              key={a.id}
              onClick={() => router.push('/hexaco-result?preview=' + a.id)}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative', borderRadius: 10, overflow: 'hidden',
                aspectRatio: '3/4', cursor: 'pointer', border: `1px solid ${hovered === a.id ? color + '55' : color + '18'}`,
                background: 'rgba(10,8,18,0.9)', transition: 'all 0.15s',
                transform: hovered === a.id ? 'scale(1.04)' : 'scale(1)',
                boxShadow: hovered === a.id ? `0 0 14px ${color}30` : 'none',
              }}
            >
              {!err ? (
                <img src={`/archetypes/t/${a.id}.webp`} alt={a.name} onError={() => setImgErrors(p => new Set([...p, a.id]))}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.7)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}11` }}>
                  <span style={{ fontSize: 18, color, opacity: 0.4 }}>✦</span>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.88))', padding: '12px 5px 5px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{a.name}</p>
                {detail?.nameEn && <p style={{ fontSize: 7, color, opacity: 0.8, marginTop: 1, letterSpacing: '0.04em' }}>{detail.nameEn.replace('THE ', '')}</p>}
              </div>
            </button>
          )
        })}
      </div>
      {hovered && ARCHETYPE_DETAILS[hovered] && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>
            {ARCHETYPE_DETAILS[hovered].name} · {ARCHETYPE_DETAILS[hovered].nameEn}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>"{ARCHETYPE_DETAILS[hovered].tagline}"</p>
        </div>
      )}
    </section>
  )
}

// ── 2. 빠른 시뮬레이션 런처 ───────────────────────────────────────────────────
// 각 원형의 profile 기반으로 더미 answers 생성
function makeAnswersForArchetype(archetypeId: string): Record<string, number> {
  const arch = ARCHETYPES.find(a => a.id === archetypeId)
  if (!arch) return {}

  const profile = arch.profile
  // 요인별 목표 점수 (direction 1→4.5, -1→1.5, 0→3.0, 0.5→3.8)
  const target: Record<string, number> = {
    H: profile.H === 1 ? 4.5 : profile.H === -1 ? 1.5 : 3.0,
    E: profile.E === 1 ? 4.5 : profile.E === -1 ? 1.5 : 3.0,
    X: profile.X === 1 ? 4.5 : profile.X === -1 ? 1.5 : 3.0,
    A: profile.A === 1 ? 4.5 : profile.A === -1 ? 1.5 : 3.0,
    C: profile.C === 1 ? 4.5 : profile.C === -1 ? 1.5 : 3.0,
    O: profile.O === 1 ? 4.5 : profile.O === -1 ? 1.5 : 3.0,
  }
  // 각 문항을 목표 점수에 가까운 값으로 설정
  const answers: Record<string, number> = {}
  for (const q of HEXACO_QUESTIONS) {
    const factor = q.id[0] as string // H1→H, E1→E 등
    const t = target[factor] ?? 3.0
    answers[q.id] = Math.max(1, Math.min(5, Math.round(t)))
  }
  return answers
}

function SimulationLauncher() {
  const router = useRouter()

  // 대표 원형 12개만 (나머지는 그리드에서)
  const PICKS = ['guardian', 'warrior', 'visionary', 'conqueror', 'strategist', 'charmer',
                 'empath', 'sage', 'analyst', 'explorer', 'cynic', 'hedonist']

  function launch(id: string) {
    const answers = makeAnswersForArchetype(id)
    sessionStorage.setItem(ADMIN_SIM_KEY, '1')
    sessionStorage.setItem('hexaco_answers', JSON.stringify(answers))
    sessionStorage.setItem('pp_hexaco_completed', '1')
    router.push('/hexaco-result')
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="HEXACO 검사 시뮬레이션" sub="더미 응답으로 실제 채점 로직을 거쳐 결과 페이지로 이동 — DB에는 저장되지 않음" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
        {PICKS.map(id => {
          const arch = ARCHETYPES.find(a => a.id === id)
          const detail = ARCHETYPE_DETAILS[id]
          if (!arch) return null
          return (
            <button key={id} onClick={() => launch(id)} style={{
              textAlign: 'left', padding: '12px 14px', borderRadius: 12,
              background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)')}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{arch.name}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
                {(Object.entries(arch.profile) as [string, number][])
                  .filter(([, v]) => v !== 0)
                  .map(([k, v]) => `${k}${v > 0 ? '↑' : '↓'}`)
                  .join(' ')}
              </p>
              {detail?.tagline && (
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4, lineHeight: 1.4, fontStyle: 'italic' }}>
                  "{detail.tagline.slice(0, 24)}..."
                </p>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ── 3. 주요 지표 ─────────────────────────────────────────────────────────────
// ── 관문 지표: 유료 결제·CORE CAREER 공개로 넘어갈 조건 ──
function GateSection({ gate }: { gate: Stats['gate'] }) {
  const enough = gate.sample >= gate.minSample
  const metCount = gate.items.filter(g => g.met).length
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader
        title="관문 지표 (14일)"
        sub={enough
          ? `${gate.items.length}개 중 ${metCount}개 달성 — 모두 달성하면 결제 연동과 CORE CAREER 공개를 진행하세요`
          : `검사 완료 ${gate.sample}명 · 판단하려면 최소 ${gate.minSample}명이 필요해요. 그 전의 수치는 참고만 하세요`}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
        {gate.items.map(g => {
          const color = g.value == null ? muted : g.met ? '#34d399' : '#f59e0b'
          return (
            <div key={g.key} style={{ ...card, borderColor: g.value == null ? 'rgba(255,255,255,0.07)' : g.met ? 'rgba(52,211,153,0.35)' : 'rgba(245,158,11,0.3)' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{g.label}</p>
              <p style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {g.value == null ? '—' : `${g.value}${g.unit}`}
              </p>
              <p style={{ fontSize: 10.5, color: muted, marginTop: 6 }}>
                목표 {g.target}{g.unit} 이상 · {g.value == null ? '데이터 없음' : g.met ? '달성' : '미달'}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{g.basis}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const STAGE_KO: Record<string, string> = { high: '고등학생', college: '대학생', jobseeker: '취준생', worker: '직장인' }
const PLAN_KO: Record<string, string> = { find: '탐색', do: '향상', both: '묶음' }
function CareerSection({ rows }: { rows: Stats['career'] }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="CORE CAREER (전체 기간)" sub="시기×목적 조합별 추가 검사 시작·완료 — 어떤 버전을 많이 고르는지" />
      <div style={{ ...card, overflowX: 'auto' }}>
        {rows.length === 0 ? <Empty text="아직 추가 검사 기록이 없어요 (결제 연동 전이라 관리자 미리보기만 가능)" /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 360 }}>
            <thead><tr>{['시기', '목적', '시작', '완료', '완료율'].map(h => <th key={h} style={{ textAlign: 'left', padding: '5px 6px', color: muted, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.stage + r.plan}>
                  <td style={{ padding: '6px', color: '#fff' }}>{STAGE_KO[r.stage] ?? r.stage}</td>
                  <td style={{ padding: '6px', color: '#e2c064' }}>{PLAN_KO[r.plan] ?? r.plan}</td>
                  <td style={{ padding: '6px', fontVariantNumeric: 'tabular-nums' }}>{r.started}</td>
                  <td style={{ padding: '6px', fontVariantNumeric: 'tabular-nums' }}>{r.completed}</td>
                  <td style={{ padding: '6px', fontVariantNumeric: 'tabular-nums' }}>{r.started ? Math.round(r.completed / r.started * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function OverviewSection({ stats }: { stats: Stats }) {
  const o = stats.overview
  const versions = Object.entries(o.by_version).map(([v, n]) => `${v} ${n}`).join(' · ')
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="주요 지표" sub="HEXACO 검사 기준 (구버전 /test 제외)" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        <StatCard label="방문 (14일)" value={o.visits_14d.toLocaleString()} />
        <StatCard label="검사 시작 (누적)" value={o.started_total.toLocaleString()} color="#818cf8" />
        <StatCard label="검사 완료 (누적)" value={o.completed_total.toLocaleString()} color="#34d399" sub={versions || undefined} />
        <StatCard
          label="완료율 (14일)"
          value={`${o.completion_rate_14d}%`}
          sub="시작 → 완료"
          color={o.completion_rate_14d >= 60 ? '#34d399' : '#f59e0b'}
        />
        <StatCard label="사전 알림 신청" value={o.waitlist.toLocaleString()} color="#c8a030" />
      </div>
    </section>
  )
}

// ── 4. 결과 화면 퍼널 ─────────────────────────────────────────────────────────
function ResultFunnelSection({ stats }: { stats: Stats }) {
  const f = stats.result_funnel
  const steps = [
    { label: '검사 완료', value: f.completed, color: '#34d399' },
    { label: '원형 결과 확인', value: f.result_view, color: '#67e8f9' },
    { label: '보고서 버튼 클릭', value: f.report_click, color: '#818cf8' },
    { label: '보고서 조회', value: f.report_view, color: '#a78bfa' },
    { label: '진로 리포트 관심 클릭', value: f.unlock_click, color: '#c8a030' },
  ]
  const base = Math.max(f.completed, f.result_view, 1)
  const scrollBase = stats.scroll_depth['25%'] || 1
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="결과 화면 퍼널 (14일)" sub="검사 1회당 단계별 1번만 집계 — 진로 리포트 관심 클릭 = 유료 관심도" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        <div style={card}>
          <CardTitle title="단계별 도달" sub="% = 검사 완료 대비" />
          {f.completed === 0 && f.result_view === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      {s.value}명 <span style={{ color: muted }}>({Math.round(s.value / base * 100)}%)</span>
                    </span>
                  </div>
                  <MiniBar value={s.value} max={base} color={s.color} />
                </div>
              ))}
              {f.unlock_click > 0 && (
                <p style={{ fontSize: 10, color: muted, marginTop: 4 }}>
                  클릭 위치: 하단 고정 버튼 {f.unlock_by_source.sticky ?? 0} · 챕터 버튼 {f.unlock_by_source.chapter ?? 0}
                </p>
              )}
            </div>
          )}
        </div>
        <div style={card}>
          <CardTitle title="보고서 읽기 깊이" sub="보고서 페이지를 어디까지 스크롤했나" />
          {Object.values(stats.scroll_depth).every(v => v === 0) ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['25%', '50%', '75%', '100%'] as const).map((d, i) => {
                const count = stats.scroll_depth[d] ?? 0
                const colors = ['#34d399', '#67e8f9', '#a78bfa', '#f472b6']
                return (
                  <div key={d}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: colors[i] }}>{d} 도달</span>
                      <span style={{ fontSize: 10, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                        {count}명 {i > 0 && <span style={{ color: muted }}>({Math.round(count / scrollBase * 100)}%)</span>}
                      </span>
                    </div>
                    <MiniBar value={count} max={scrollBase} color={colors[i]} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── 5. 원형 분포 (실제 vs 기대) ──────────────────────────────────────────────
const ARCHETYPE_COLORS: Record<string, string> = {
  guardian: '#b45309', warrior: '#dc2626', visionary: '#3b82f6', artisan: '#d97706',
  sentinel: '#60a5fa', conqueror: '#10b981', opportunist: '#f59e0b', strategist: '#9ca3af',
  charmer: '#f472b6', companion: '#fbbf24', empath: '#2dd4bf', passionate: '#ef4444',
  fighter: '#6b7280', coordinator: '#f59e0b', sage: '#e5e7eb', analyst: '#67e8f9',
  explorer: '#14b8a6', dreamer: '#a78bfa', cynic: '#7c3aed', pragmatist: '#94a3b8',
  realist: '#ca8a04', hedonist: '#be185d',
}

function ArchetypeDistribution({ dist }: { dist: Stats['archetype_distribution'] }) {
  const total = dist.reduce((s, a) => s + a.count, 0)
  const maxPct = Math.max(...dist.map(a => Math.max(a.pct, a.expected_pct)), 1)
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader
        title="원형 분포"
        sub={`hexaco-v2 완료 ${total}명 · 막대 = 실제, 금색 선 = 무작위 응답 기준 기대 비율. 표본이 30명 미만이면 차이를 해석하지 마세요`}
      />
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {dist.map(a => {
          const detail = ARCHETYPE_DETAILS[a.id]
          const color = ARCHETYPE_COLORS[a.id] ?? '#a78bfa'
          const gap = a.pct - a.expected_pct
          const flag = total >= 30 && Math.abs(gap) >= 5
          return (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 44px 92px', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{detail?.name ?? a.id}</p>
              <div style={{ position: 'relative', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: `${a.pct / maxPct * 100}%`, height: '100%', borderRadius: 99, background: color }} />
                <div title={`기대 ${a.expected_pct}%`} style={{ position: 'absolute', top: -3, bottom: -3, left: `${a.expected_pct / maxPct * 100}%`, width: 2, background: '#c8a030' }} />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{a.count}명</p>
              <p style={{ fontSize: 11, color: flag ? '#f59e0b' : color, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {a.pct}% <span style={{ color: muted }}>/ {a.expected_pct}%</span>
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── 6. 문항 품질 ─────────────────────────────────────────────────────────────
function alphaColor(a: number | null) {
  if (a == null) return muted
  return a >= 0.7 ? '#34d399' : a >= 0.6 ? '#f59e0b' : '#f87171'
}

function ItemQualitySection({ stats }: { stats: Stats }) {
  const [open, setOpen] = useState<Factor | null>(null)
  const factors = Object.keys(FACTOR_NAMES) as Factor[]
  const textOf = (id: string) => HEXACO_QUESTIONS.find(q => q.id === id)?.text.replace('\n', ' ') ?? ''
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader
        title="문항 품질"
        sub="hexaco-v2 · 연구 활용에 동의한 응답만 · 신뢰도(α) 0.7↑ 양호, 0.6 미만 점검 · 문항-총점 상관 0.2 미만이면 요인과 따로 노는 문항"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 12 }}>
        {factors.map(f => {
          const rel = stats.reliability[f]
          const fm = stats.factor_means[f]
          return (
            <button key={f} onClick={() => setOpen(open === f ? null : f)} style={{
              ...card, textAlign: 'left', cursor: 'pointer',
              borderColor: open === f ? 'rgba(200,168,75,0.5)' : 'rgba(255,255,255,0.07)',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{f} · {FACTOR_NAMES[f]}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: alphaColor(rel.alpha), lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {rel.alpha == null ? '—' : `α ${rel.alpha.toFixed(2)}`}
              </p>
              <p style={{ fontSize: 10, color: muted, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                {rel.alpha == null ? `응답 ${rel.n}명 (10명부터 계산)` : `n=${rel.n}`}
                {fm && ` · 평균 ${fm.mean.toFixed(2)} (SD ${fm.sd.toFixed(2)})`}
              </p>
            </button>
          )
        })}
      </div>
      {open && (
        <div style={{ ...card, overflowX: 'auto' }}>
          <CardTitle title={`${open} · ${FACTOR_NAMES[open]} 문항`} sub="분포 = 1~5 응답 비율 · [역] = 역채점 문항" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 560 }}>
            <thead>
              <tr>
                {['문항', '내용', '평균', 'SD', '분포 (1→5)', '문항-총점 r'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '4px 6px', color: muted, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.item_stats.filter(q => q.factor === open).map(q => {
                const total = q.dist.reduce((a, b) => a + b, 0) || 1
                const weak = q.item_total_r != null && q.item_total_r < 0.2
                return (
                  <tr key={q.id}>
                    <td style={{ padding: '6px', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {q.id}{q.reverse && <span style={{ color: muted, fontWeight: 400 }}> [역]</span>}
                    </td>
                    <td style={{ padding: '6px', color: 'rgba(255,255,255,0.6)', maxWidth: 280 }}>{textOf(q.id)}</td>
                    <td style={{ padding: '6px', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{q.mean?.toFixed(2) ?? '—'}</td>
                    <td style={{ padding: '6px', color: q.sd != null && q.sd < 0.7 ? '#f59e0b' : '#fff', fontVariantNumeric: 'tabular-nums' }}>{q.sd?.toFixed(2) ?? '—'}</td>
                    <td style={{ padding: '6px' }}>
                      <div style={{ display: 'flex', height: 8, width: 110, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                        {q.dist.map((c, i) => (
                          <div key={i} title={`${i + 1}: ${c}명`} style={{ width: `${c / total * 100}%`, background: ['#f87171', '#fb923c', '#9ca3af', '#67e8f9', '#34d399'][i] }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '6px', color: weak ? '#f87171' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      {q.item_total_r?.toFixed(2) ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ── 7. 일별 흐름 · 이탈 · 디바이스 ──────────────────────────────────────────
function ActivitySection({ stats }: { stats: Stats }) {
  const maxAb = Math.max(...stats.abandon_by_bucket.map(b => b.count), 1)
  const devices = stats.device_distribution
  const devTotal = Object.values(devices).reduce((a, b) => a + b, 0)
  const devMax = Math.max(...Object.values(devices), 1)
  const deviceColors: Record<string, string> = { mobile: '#f472b6', desktop: '#67e8f9', tablet: '#fbbf24' }
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="일별 흐름 · 이탈 · 디바이스" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        <div style={card}>
          <CardTitle title="최근 7일" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['날짜', '시작', '완료', '보고서', '관심 클릭'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '4px 6px', color: muted, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.daily.map(r => (
                  <tr key={r.day}>
                    <td style={{ padding: '5px 6px', color: muted }}>{r.day.slice(5)}</td>
                    <td style={{ padding: '5px 6px', color: '#818cf8', fontVariantNumeric: 'tabular-nums' }}>{r.started}</td>
                    <td style={{ padding: '5px 6px', color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{r.completed}</td>
                    <td style={{ padding: '5px 6px', color: '#a78bfa', fontVariantNumeric: 'tabular-nums' }}>{r.report_view}</td>
                    <td style={{ padding: '5px 6px', color: '#c8a030', fontVariantNumeric: 'tabular-nums' }}>{r.unlock_click}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={card}>
          <CardTitle title="이탈 구간 (14일)" sub="검사 중 페이지를 닫은 문항 위치" />
          {!stats.abandon_by_bucket.some(b => b.count > 0) ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats.abandon_by_bucket.map(b => (
                <div key={b.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{b.label}</span>
                    <span style={{ fontSize: 10, color: '#f87171', fontVariantNumeric: 'tabular-nums' }}>{b.count}명</span>
                  </div>
                  <MiniBar value={b.count} max={maxAb} color="#f87171" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <CardTitle title="디바이스 (14일 방문)" />
          {devTotal === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(devices).map(([d, count]) => (
                <div key={d}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: deviceColors[d] ?? '#a78bfa', textTransform: 'capitalize' }}>{d}</span>
                    <span style={{ fontSize: 11, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      {count}명 <span style={{ color: muted }}>({Math.round(count / devTotal * 100)}%)</span>
                    </span>
                  </div>
                  <MiniBar value={count} max={devMax} color={deviceColors[d] ?? '#a78bfa'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── 8. 설문 ──────────────────────────────────────────────────────────────────
function SurveySection({ survey }: { survey: Stats['survey'] }) {
  const max = Math.max(...survey.rating_dist, 1)
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="만족도 설문" sub={`응답 ${survey.count}건${survey.avg_rating != null ? ` · 평균 ${survey.avg_rating.toFixed(2)}점` : ''}`} />
      {survey.count === 0 ? <div style={card}><Empty /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          <div style={card}>
            <CardTitle title="별점 분포" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[5, 4, 3, 2, 1].map(r => (
                <div key={r} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 36px', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#c8a030' }}>{r}점</span>
                  <MiniBar value={survey.rating_dist[r - 1]} max={max} color="#c8a030" />
                  <span style={{ fontSize: 11, color: '#fff', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{survey.rating_dist[r - 1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={card}>
            <CardTitle title="최근 의견" />
            {survey.recent_opinions.length === 0 ? <Empty text="작성된 의견 없음" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {survey.recent_opinions.map((o, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 10, color: muted, marginBottom: 2 }}>
                      {'★'.repeat(o.rating)} · {new Date(o.created_at).toLocaleDateString('ko-KR')}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{o.opinion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

// ── 9. 최근 이벤트 ────────────────────────────────────────────────────────────
const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  test_start: { label: '검사 시작', color: '#818cf8' },
  hexaco_complete: { label: '검사 완료', color: '#34d399' },
  hexaco_result_view: { label: '원형 확인', color: '#67e8f9' },
  hexaco_report_click: { label: '보고서 클릭', color: '#818cf8' },
  hexaco_report_view: { label: '보고서 조회', color: '#a78bfa' },
  hexaco_unlock_click: { label: '진로 리포트 관심 클릭', color: '#c8a030' },
  free_test_abandon: { label: '검사 이탈', color: '#f87171' },
  result_scroll_depth: { label: '스크롤', color: '#6b7280' },
}

function RecentEvents({ events }: { events: Stats['recent_events'] }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader title="최근 이벤트" sub="최신 20건" />
      <div style={card}>
        {events.length === 0 ? <Empty /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map((ev, i) => {
              const meta = EVENT_LABELS[ev.event_type] ?? { label: ev.event_type, color: '#6b7280' }
              const archetype = ev.metadata?.archetype_primary
              const extra = ev.event_type === 'free_test_abandon' ? `Q${Number(ev.metadata?.question_index ?? 0) + 1}에서 이탈`
                : ev.event_type === 'result_scroll_depth' ? `${String(ev.metadata?.page ?? '')} ${String(ev.metadata?.depth ?? '')}%`
                : ev.event_type === 'hexaco_unlock_click' ? String(ev.metadata?.source ?? '')
                : null
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, flexShrink: 0,
                    background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30`,
                  }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    {new Date(ev.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {archetype != null && (
                    <span style={{ fontSize: 10, color: '#a78bfa' }}>{ARCHETYPE_DETAILS[String(archetype)]?.name ?? String(archetype)}</span>
                  )}
                  {extra && <span style={{ fontSize: 10, color: muted }}>{extra}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// Supabase 무료 플랜은 일시정지되면 저장이 조용히 실패함 → 마지막 기록 시각으로 이상 여부 표시
function HealthBanner({ health }: { health: NonNullable<Stats['health']> }) {
  const last = health.last_saved_at ? new Date(health.last_saved_at) : null
  const hours = last ? (Date.now() - last.getTime()) / 3600000 : Infinity
  const ago = !last ? '기록 없음'
    : hours < 1 ? `${Math.max(1, Math.round(hours * 60))}분 전`
    : hours < 48 ? `${Math.round(hours)}시간 전`
    : `${Math.round(hours / 24)}일 전`
  const warn = !health.db_ok || hours > 24
  const color = warn ? '#f87171' : '#4ade80'
  return (
    <div role={warn ? 'alert' : undefined} style={{
      display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 16px', borderRadius: 12, marginBottom: 24,
      background: `${color}10`, border: `1px solid ${color}40`,
    }}>
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: color, marginTop: 5, flexShrink: 0 }} />
      <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
        <b style={{ color }}>{!health.db_ok ? 'DB 조회 실패' : warn ? '24시간 넘게 새 기록 없음' : '저장 정상'}</b>
        <span style={{ color: muted }}> · 마지막 저장 {ago}{last && ` (${last.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`}</span>
        {warn && (
          <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.55)' }}>
            방문이 없었을 수도 있지만, Supabase 프로젝트가 일시정지됐는지 대시보드에서 확인해 보세요.
          </p>
        )}
      </div>
    </div>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 한국어판·영어판 통계는 섞지 않고 따로 봄
  const [lang, setLang] = useState<'ko' | 'en'>('ko')

  useEffect(() => {
    setLoading(true); setError(''); setStats(null)
    fetch(`/api/admin/stats?lang=${lang}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setStats)
      .catch(() => setError('통계 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [lang])

  return (
    <main style={{ minHeight: '100vh', maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(200,168,75,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>ADMIN · CORE TRAIT</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>대시보드</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>HEXACO 원형 검사 · 실시간 Supabase 기준 · {lang === 'ko' ? '한국어판' : '영어판'} (방문·기기 수는 두 언어 합계)</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div role="tablist" aria-label="통계 언어" style={{ display: 'flex', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            {([['ko', '한국어판'], ['en', '영어판']] as const).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={lang === k} onClick={() => setLang(k)} style={{
                padding: '8px 14px', fontSize: 12, border: 'none', cursor: 'pointer',
                background: lang === k ? 'rgba(200,160,48,0.2)' : 'transparent', color: lang === k ? '#e2c064' : 'rgba(255,255,255,0.5)',
              }}>{label}</button>
            ))}
          </div>
          <a href="/career" style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(200,160,48,0.4)', color: '#e2c064', fontSize: 12, textDecoration: 'none' }}>
            진로 리포트 미리보기 →
          </a>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}
          >
            새로고침
          </button>
        </div>
      </div>

      {/* 원형 미리보기 그리드 (항상 표시) */}
      <ArchetypePreviewGrid />

      {/* 시뮬레이션 런처 (항상 표시) */}
      <SimulationLauncher />

      {/* 통계 섹션 */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(200,168,75,0.2)', borderTopColor: 'rgba(200,168,75,0.6)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 12 }}>통계 불러오는 중...</span>
        </div>
      )}
      {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 20 }}>{error}</p>}

      {stats && (
        <>
          {stats.health && <HealthBanner health={stats.health} />}
          <GateSection gate={stats.gate} />
          <OverviewSection stats={stats} />
          {lang === 'ko' && <CareerSection rows={stats.career ?? []} />}
          <ResultFunnelSection stats={stats} />
          <ArchetypeDistribution dist={stats.archetype_distribution} />
          <ItemQualitySection stats={stats} />
          <ActivitySection stats={stats} />
          <SurveySection survey={stats.survey} />
          <RecentEvents events={stats.recent_events ?? []} />
        </>
      )}

    </main>
  )
}
