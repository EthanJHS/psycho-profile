'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  scorePaidAnswers, PaidScoringOutput,
  HEXACO_FACTOR_LABELS, RIASEC_LABELS, APTITUDE_DIM_LABELS,
} from '@/lib/paid-scoring'
import { interpretPaidResult, PaidInterpretation } from '@/lib/paid-interpretation'
import {
  computeNarrative, computeWorkStyle, computeInvestmentProfile,
  computeCharacterStrengths, computeLeadershipStyle, computeBurnoutRisk,
  computeValuesProfile, computeLifeBalance,
  WorkStyle, InvestmentProfile, CharacterStrength, LeadershipProfile,
  BurnoutProfile, ValuesProfile, LifeBalanceProfile,
} from '@/lib/insights'
import { computeCareers, CareerScore } from '@/lib/careers'
import { FacetMap } from '@/lib/profiles'
import { SUB_FACET_LABELS, SubFacet } from '@/lib/paid-questions'
import Link from 'next/link'
import PatternIllustration from '@/components/PatternIllustration'
import { savePaidResult, initSession, initScrollDepthTracking } from '@/lib/analytics'

// ── 색상 팔레트 ──────────────────────────────────────────────────────────────
const FACTOR_COLORS: Record<string, string> = {
  H: '#a78bfa', E: '#60a5fa', X: '#34d399', A: '#f472b6', C: '#fbbf24', O: '#fb923c',
}
const RIASEC_COLORS: Record<string, string> = {
  R: '#94a3b8', I: '#818cf8', A: '#f472b6', S: '#34d399', E: '#fbbf24', C: '#60a5fa',
}

// 성격 강점 → 관련 하위 요인 매핑
const STRENGTH_SUBFACETS: Record<string, SubFacet[]> = {
  '지적 호기심':    ['inquisitiveness', 'creativity', 'aestheticAppreciation'],
  '성실함·완수력':  ['diligence', 'organization', 'prudence'],
  '사회적 용기':    ['socialBoldness', 'socialSelfEsteem', 'liveliness'],
  '진정성·정직함':  ['sincerity', 'fairness', 'greedAvoidance'],
  '공감·돌봄':     ['sentimentality', 'forgivingness', 'gentleness'],
  '분석적 사고':    ['inquisitiveness', 'unconventionality', 'creativity'],
  '겸손한 자기인식': ['modesty', 'sincerity'],
  '지속성·인내':    ['diligence', 'prudence', 'perfectionism'],
  '창의적 발상':    ['creativity', 'unconventionality', 'aestheticAppreciation'],
  '조화 조율':      ['patience', 'flexibility', 'gentleness'],
}

// ── 공통 컴포넌트 ────────────────────────────────────────────────────────────
function ScoreBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function AptitudeRatioBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold w-14 text-right shrink-0" style={{ color }}>{label}</span>
      <div className="flex-1 h-4 rounded-full" style={{ background: 'var(--surface2)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${value}%`, background: color, minWidth: value > 0 ? 28 : 0 }}
        >
          <span className="text-[10px] font-bold text-white">{value}%</span>
        </div>
      </div>
    </div>
  )
}

function AlignmentBadge({ level, note }: { level: 'high' | 'mid' | 'low'; note: string }) {
  const cfg = {
    high: { label: '높은 일치도', color: '#34d399', bg: '#34d39920' },
    mid:  { label: '부분 일치',  color: '#fbbf24', bg: '#fbbf2420' },
    low:  { label: '창의적 긴장', color: '#f472b6', bg: '#f472b620' },
  }[level]
  return (
    <div className="rounded-xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.color, color: '#fff' }}>
          {cfg.label}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>성격 × 직업 흥미</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{note}</p>
    </div>
  )
}

function SectionConclusion({ color, title, text }: { color: string; title: string; text: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <div className="text-xs font-bold mb-2" style={{ color }}>▸ {title}</div>
      <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.85 }}>{text}</p>
    </div>
  )
}

function SectionHeader({ icon, badge, badgeColor, title }: { icon: string; badge: string; badgeColor: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: badgeColor }}>{badge}</div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
      </div>
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function PaidResultPage() {
  const router = useRouter()
  const [data,      setData]      = useState<PaidScoringOutput | null>(null)
  const [interp,    setInterp]    = useState<PaidInterpretation | null>(null)
  const [narrative, setNarrative] = useState<string>('')
  const [workStyle, setWorkStyle] = useState<WorkStyle | null>(null)
  const [investment, setInvestment] = useState<InvestmentProfile | null>(null)
  const [charStrengths, setCharStrengths] = useState<CharacterStrength[]>([])
  const [leadership, setLeadership] = useState<LeadershipProfile | null>(null)
  const [burnout,   setBurnout]   = useState<BurnoutProfile | null>(null)
  const [values,    setValues]    = useState<ValuesProfile | null>(null)
  const [lifeBalance, setLifeBalance] = useState<LifeBalanceProfile | null>(null)
  const [careers,   setCareers]   = useState<CareerScore[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('paid_answers')
    if (!raw) { router.push('/paid-test'); return }
    const answers = JSON.parse(raw)
    const scored  = scorePaidAnswers(answers)
    setData(scored)

    const interpreted = interpretPaidResult(
      scored.hexaco, scored.subFacets, scored.riasec,
      scored.riasecTop3, scored.aptitude,
    )
    setInterp(interpreted)

    // HEXACO → FacetMap 변환 (H=겸손·윤리, E=감수성, X=대담성, A=원만성, C=성실성, O=개방성)
    const fm: FacetMap = {
      curiosity: scored.hexaco.O,
      diligence: scored.hexaco.C,
      boldness:  scored.hexaco.X,
      patience:  scored.hexaco.A,
      anxiety:   scored.hexaco.E,
      humility:  scored.hexaco.H,
    }

    // 인지 점수 추정 (개방성 + 성실성 기반)
    const estCog = Math.min(0.9, Math.max(0.35,
      (scored.hexaco.O - 1) / 4 * 0.55 +
      (scored.hexaco.C - 1) / 4 * 0.20 +
      0.20
    ))

    setNarrative(computeNarrative(fm, estCog))
    setWorkStyle(computeWorkStyle(fm, estCog))
    setInvestment(computeInvestmentProfile(fm, estCog))
    setCharStrengths(computeCharacterStrengths(fm, estCog).slice(0, 7))
    setLeadership(computeLeadershipStyle(fm, estCog, undefined))
    setBurnout(computeBurnoutRisk(fm, {}, undefined))
    setValues(computeValuesProfile(fm, undefined))
    setLifeBalance(computeLifeBalance(fm, {}, undefined))
    setCareers(computeCareers(fm, estCog))

    // 스크롤 깊이 추적 시작
    initScrollDepthTracking()

    // 결과 저장 (이미 저장됐으면 skip)
    if (!sessionStorage.getItem('pp_paid_saved')) {
      initSession().then(() =>
        savePaidResult(
          scored.hexaco,
          scored.subFacets,
          scored.riasec,
          scored.riasecTop3,
          scored.aptitude,
          scored.aptitudeProfile,
          interpreted.patternKey,
        )
      ).then(() => sessionStorage.setItem('pp_paid_saved', '1'))
    }
  }, [router])

  if (!data || !interp) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full animate-spin mx-auto" style={{ border: '2px solid var(--border)', borderTopColor: '#a78bfa' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>74개 응답을 정밀 분석하는 중...</p>
        </div>
      </main>
    )
  }

  const { hexaco, riasec, riasecTop3, aptitude, subFacets } = data
  const hexacoSorted = (Object.entries(hexaco) as [string, number][]).sort((a, b) => b[1] - a[1])
  const riasecSorted = (Object.entries(riasec) as [string, number][]).sort((a, b) => b[1] - a[1])
  const topCareers   = careers.slice(0, 8)
  const worstCareers = [...careers].sort((a, b) => a.fit - b.fit).slice(0, 3)

  return (
    <main className="min-h-screen px-5 py-10" style={{ paddingBottom: 60 }}>
      <div className="w-full max-w-2xl mx-auto space-y-10">

        {/* ═══════════════════════════════════════════════════════
            헤더
        ═══════════════════════════════════════════════════════ */}
        <div className="text-center space-y-4">
          {/* 패턴 일러스트 */}
          <div className="flex justify-center mb-2">
            <PatternIllustration patternKey={interp.patternKey ?? ''} size={110} />
          </div>
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#a78bfa' }}>
            정밀 심층 심리 분석 보고서
          </div>
          <h1 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}>
            {interp.headline}
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
            HEXACO 24 하위 요인 · Holland RIASEC 직접 측정 · 학문 적성 · 성격 강점 · 업무 스타일 · 리더십 · 번아웃 · 가치관 · 삶의 균형을
            한 번에 통합한 과학적 심리 초상화입니다.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--muted2)' }}>
            <span className="px-2 py-0.5 rounded-full" style={{ background: '#a78bfa18', color: '#a78bfa' }}>82문항</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: '#34d39918', color: '#34d399' }}>15개 영역 분석</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: '#fbbf2418', color: '#fbbf24' }}>무료 검사 전 항목 포함</span>
          </div>

          {/* 무료 검사와의 차이 안내 */}
          <div className="mt-2 rounded-xl px-4 py-3 text-left text-xs leading-relaxed space-y-1"
            style={{ background: '#ffffff08', border: '1px solid #ffffff12', color: 'var(--muted)' }}>
            <p className="font-semibold" style={{ color: 'var(--muted)' }}>무료 검사 결과와 일부 다를 수 있습니다</p>
            <p>무료 검사의 RIASEC은 HEXACO 패턴에서 <em>추정</em>한 값이고, 이 결과는 18문항으로 <em>직접 측정</em>한 값입니다. 같은 사람이어도 측정 방식이 달라지면 순위가 바뀔 수 있으며, 그 경우 직접 측정 결과가 더 신뢰할 수 있습니다.</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            파트 0: 성격 서사 (무료 검사 "당신은 이러한 경향이 있습니다" 업그레이드)
        ═══════════════════════════════════════════════════════ */}
        {narrative && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon="📖" badge="파트 0 · 성격 서사" badgeColor="#c084fc" title="당신에 대한 종합적 서술" />

            <div className="rounded-xl p-5" style={{ background: '#c084fc18', border: '1px solid #c084fc30' }}>
              <div className="text-xs font-bold mb-3" style={{ color: '#c084fc' }}>
                HEXACO 24 하위 요인 기반 성격 전체상
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.9 }}>{narrative}</p>
            </div>

            {/* 패턴 초상화 (유료 전용 — 무료 검사에는 없는 HEXACO 패턴 기반 서술) */}
            <div className="rounded-xl p-5" style={{ background: '#7c3aed18', border: '1px solid #7c3aed30' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs font-bold" style={{ color: '#a78bfa' }}>HEXACO 패턴 초상화</div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#a78bfa', color: '#fff' }}>
                  24 하위 요인 분석
                </span>
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{interp.hexacoPattern.title}</h3>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.9 }}>{interp.hexacoPattern.portrait}</p>
            </div>

            <SectionConclusion
              color="#c084fc"
              title="서사 영역 결론"
              text={`위 두 서술은 각각 6요인 기반 '전체상'과 24 하위 요인 기반 '패턴 초상화'입니다. 무료 검사는 전체상만 제공하지만, 정밀 검사는 그 안의 세부 역학까지 분해합니다. "${interp.hexacoPattern.title}"이라는 패턴 명칭 하나에 담긴 구체적 의미가 아래 각 섹션에서 펼쳐집니다.`}
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 1: HEXACO 성격 패턴 (기존 — 하위 요인 24개 포함)
        ═══════════════════════════════════════════════════════ */}
        <section className="glass rounded-2xl p-6 space-y-6">
          <SectionHeader icon="🧠" badge="파트 1 · 성격 프로파일" badgeColor="#a78bfa" title="HEXACO 성격 패턴 — 24 하위 요인 분석" />

          <div>
            <div className="text-xs font-bold mb-3" style={{ color: 'var(--muted2)' }}>HEXACO 6요인 점수 (1~5)</div>
            <div className="space-y-3">
              {hexacoSorted.map(([f, v]) => (
                <ScoreBar key={f} value={v} max={5} color={FACTOR_COLORS[f]} label={HEXACO_FACTOR_LABELS[f as keyof typeof HEXACO_FACTOR_LABELS]} />
              ))}
            </div>
          </div>

          {/* 24 하위 요인 그리드 */}
          <div>
            <div className="text-xs font-bold mb-3" style={{ color: 'var(--muted2)' }}>24 하위 요인 상세 (무료 검사에는 없는 분석)</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(subFacets) as [SubFacet, number][]).sort((a, b) => b[1] - a[1]).map(([sf, v]) => {
                const meta = SUB_FACET_LABELS[sf]
                const pct  = Math.round(((v - 1) / 4) * 100)
                const high = v >= 3.67
                const low  = v <= 2.34
                const color = high ? '#34d399' : low ? '#f87171' : '#6b7280'
                return (
                  <div key={sf} className="rounded-lg p-2.5" style={{ background: 'var(--surface2)', border: `1px solid ${color}28` }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-semibold truncate" style={{ color: 'var(--text)', maxWidth: '70%' }}>{meta.label}</span>
                      <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="text-[9px] mt-1" style={{ color: 'var(--muted2)' }}>{meta.parent}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 강점 하위 요인 */}
          <div>
            <div className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#34d399' }}>
              ▲ 두드러진 강점 하위 요인
            </div>
            <div className="space-y-3">
              {interp.hexacoPattern.topFacets.map((f, i) => (
                <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: 'var(--surface2)' }}>
                  <div className="rounded-lg px-2 py-1 text-xs font-bold shrink-0" style={{ background: '#34d39920', color: '#34d399' }}>
                    {f.score.toFixed(2)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{f.label}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.65 }}>{f.insight}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주의 영역 하위 요인 */}
          <div>
            <div className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#f472b6' }}>
              ▼ 주의할 영역
            </div>
            <div className="space-y-3">
              {interp.hexacoPattern.lowFacets.map((f, i) => (
                <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: 'var(--surface2)' }}>
                  <div className="rounded-lg px-2 py-1 text-xs font-bold shrink-0" style={{ background: '#f472b620', color: '#f472b6' }}>
                    {f.score.toFixed(2)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{f.label}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.65 }}>{f.insight}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 교차 패턴 인사이트 */}
          {interp.hexacoPattern.crossInsights.length > 0 && (
            <div>
              <div className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#fb923c' }}>
                ⚡ 교차 패턴 인사이트
                <span className="text-[9px] font-normal px-1.5 py-0.5 rounded-full" style={{ background: '#fb923c20', color: '#fb923c' }}>
                  무료 검사에서 볼 수 없는 분석
                </span>
              </div>
              <div className="space-y-3">
                {interp.hexacoPattern.crossInsights.map((ins, i) => {
                  const typeStyle = {
                    strength: { bg: '#34d39915', border: '#34d39940', tag: '#34d399', tagBg: '#34d39925', label: '강점 조합' },
                    tension:  { bg: '#f8717115', border: '#f8717140', tag: '#f87171', tagBg: '#f8717125', label: '주의 신호' },
                    rare:     { bg: '#818cf815', border: '#818cf840', tag: '#818cf8', tagBg: '#818cf825', label: '희귀 조합' },
                  }[ins.type]
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: typeStyle.tagBg, color: typeStyle.tag }}>
                          {ins.tag}
                        </code>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: typeStyle.tagBg, color: typeStyle.tag }}>
                          {typeStyle.label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{ins.title}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{ins.body}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <SectionConclusion
            color="#a78bfa"
            title="성격 프로파일 영역 결론"
            text={`주의할 맹점: ${interp.hexacoPattern.shadow} 무료 검사는 6개 요인만 보여주지만, 이 분석은 24 하위 요인까지 분해해 어느 요소가 점수를 끌어올리거나 낮추는지 정확히 짚어냅니다. 이 세밀함이 진로와 관계에서의 예측력을 높입니다.`}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════
            파트 1.5: 상황별 행동 예측
        ═══════════════════════════════════════════════════════ */}
        <section className="glass rounded-2xl p-6 space-y-6">
          <SectionHeader icon="🎭" badge="파트 1.5 · 상황별 예측 — 무료 검사에 없는 분석" badgeColor="#fbbf24" title="당신은 이 상황에서 이렇게 행동합니다" />

          <div className="space-y-4">
            {interp.situationalPredictions.map((pred, i) => {
              const colors = ['#fbbf24', '#f87171', '#60a5fa']
              const bgs    = ['#fbbf2412', '#f8717112', '#60a5fa12']
              const bds    = ['#fbbf2430', '#f8717130', '#60a5fa30']
              const c = colors[i], bg = bgs[i], bd = bds[i]
              return (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${bd}` }}>
                  <div className="flex items-center gap-2 px-4 py-3" style={{ background: bg }}>
                    <span className="text-base">{pred.icon}</span>
                    <span className="text-xs font-bold" style={{ color: c }}>{pred.context}</span>
                    <span className="text-sm font-semibold ml-1" style={{ color: 'var(--text)' }}>{pred.headline}</span>
                  </div>
                  <div className="px-4 py-4 space-y-3" style={{ background: 'var(--surface)' }}>
                    {pred.behaviors.map((b, j) => (
                      <div key={j} className="flex gap-2.5">
                        <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: c }}>›</span>
                        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{b}</p>
                      </div>
                    ))}
                    <div className="flex gap-2.5 mt-1 pt-3" style={{ borderTop: `1px solid ${bd}` }}>
                      <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: '#f87171' }}>!</span>
                      <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                        <strong style={{ color: '#f87171' }}>주의: </strong>{pred.watchout}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            파트 2: 성격 강점 TOP 7 (무료 TOP 5 → 유료 TOP 7 + 하위 요인 근거)
        ═══════════════════════════════════════════════════════ */}
        {charStrengths.length > 0 && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon="💎" badge="파트 2 · 성격 강점" badgeColor="#34d399" title="성격 강점 TOP 7 — 24 하위 요인 근거 포함" />

            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              VIA(Values in Action) 기반 강점 산출. 무료 검사는 TOP 5까지, 이 분석은 TOP 7을 제공하며 각 강점을 뒷받침하는 HEXACO 24 하위 요인 점수를 함께 표시합니다.
            </p>

            <div className="space-y-4">
              {charStrengths.map((s, i) => {
                const sfKeys = STRENGTH_SUBFACETS[s.name] ?? []
                const sfData = sfKeys
                  .map(sf => ({ label: SUB_FACET_LABELS[sf]?.label ?? sf, score: subFacets[sf] ?? 3 }))
                  .filter(d => d.score >= 2)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)

                return (
                  <div key={s.name} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{s.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{s.name}</span>
                          {i === 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(251,191,36,0.2)', color: '#f59e0b' }}>
                              핵심 강점
                            </span>
                          )}
                          {i < 3 && i > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: '#34d39918', color: '#34d399' }}>
                              TOP {i + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.desc}</p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{s.howItShows}</p>

                    {sfData.length > 0 && (
                      <div className="rounded-lg p-3" style={{ background: '#34d39910', border: '1px solid #34d39925' }}>
                        <div className="text-[10px] font-bold mb-2" style={{ color: '#34d399' }}>
                          이 강점을 뒷받침하는 HEXACO 하위 요인
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sfData.map(sf => (
                            <div key={sf.label} className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                              style={{ background: 'var(--surface2)', border: '1px solid #34d39930' }}>
                              <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>{sf.label}</span>
                              <span className="text-[10px]" style={{ color: 'var(--muted2)' }}>{sf.score.toFixed(1)}/5</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <SectionConclusion
              color="#34d399"
              title="성격 강점 영역 결론"
              text="강점은 상황에 따라 그림자도 있습니다. TOP 1 강점이 과도하게 발휘될 때 어떤 문제가 생기는지 인식하는 것이 성숙의 핵심입니다. 위에 나열된 강점들이 서로 상호작용하는 방식을 아래 교차 패턴 인사이트와 함께 읽으면 더 입체적으로 이해할 수 있습니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 3: 업무 스타일 (무료 기본 분석 항목 — 유료에서 결론 강화)
        ═══════════════════════════════════════════════════════ */}
        {workStyle && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon="🏢" badge="파트 3 · 업무 스타일" badgeColor="#60a5fa" title="업무 스타일 심층 분석" />

            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              HEXACO 직업심리학 연구(Ashton & Lee 2007) 기반 — 82문항 정밀 점수를 반영한 업무 방식 분석입니다.
            </p>

            <div className="space-y-5">
              {[
                { icon: '🧭', label: '의사결정', text: workStyle.decisionMaking },
                { icon: '🤝', label: '협업 스타일', text: workStyle.collaboration },
                { icon: '🏢', label: '최적 환경', text: workStyle.environment },
                { icon: '🎯', label: '집중·몰입', text: workStyle.focus },
                { icon: '💬', label: '소통 방식', text: workStyle.communication },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: '#60a5fa' }}>
                    <span>{item.icon}</span>{item.label}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>✓ 업무 강점</p>
                <ul className="space-y-2">
                  {workStyle.strengths.map(s => (
                    <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>⚠ 주의사항</p>
                <ul className="space-y-2">
                  {workStyle.watchouts.map(w => (
                    <li key={w} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#f59e0b', flexShrink: 0 }}>·</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <SectionConclusion
              color="#60a5fa"
              title="업무 스타일 영역 결론"
              text="업무 스타일은 바꾸는 것이 아니라 활용하는 것입니다. 위에 나온 최적 환경이 현재 직장과 얼마나 일치하는지 확인하세요. 불일치가 클수록 에너지 소모가 크고 성과도 낮아집니다. 환경을 바꾸거나 현재 환경 안에서 자신의 방식을 허용하는 범위를 넓히는 것이 핵심 전략입니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 4: 진로 적합도 TOP 8 (무료 TOP 6 → 유료 TOP 8)
        ═══════════════════════════════════════════════════════ */}
        {topCareers.length > 0 && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon="🎯" badge="파트 4 · 진로 적합도" badgeColor="#fb923c" title="진로 적합도 TOP 8 — HEXACO × RIASEC 통합 분석" />

            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              무료 검사는 성격 추정치로 6개 직업을 보여줍니다. 이 분석은 82문항 정밀 점수로 8개 직업을 제시하며,
              Holland 코드 <strong style={{ color: 'var(--text)' }}>{interp.riasecProfile.hollandCode}</strong>({interp.riasecProfile.title})와의 정합성을 함께 반영합니다.
            </p>

            <div className="space-y-4">
              {topCareers.map((c, i) => (
                <div key={c.title} className="glass rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: i < 3 ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'var(--surface2)',
                        color: i < 3 ? '#fff' : 'var(--muted)',
                      }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm">{c.title}</span>
                        <span className="font-bold text-sm ml-2" style={{ color: c.fit >= 90 ? '#fb923c' : '#f97316' }}>{c.fit}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${c.fit}%`, background: 'linear-gradient(90deg, #fb923c, #f97316)' }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>{c.reason}</p>
                  {c.detail && <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)', opacity: 0.8 }}>{c.detail}</p>}
                  {c.subRoles && c.subRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.subRoles.slice(0, 4).map(role => (
                        <span key={role} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#fb923c18', color: '#fb923c', border: '1px solid #fb923c30' }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                  {c.growthNote && (
                    <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--muted)', opacity: 0.75 }}>↗ {c.growthNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 맞지 않는 직업 */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(107,114,128,0.06)', border: '1px solid rgba(107,114,128,0.18)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>나와 맞지 않는 직업</p>
              <div className="space-y-3">
                {worstCareers.map(c => (
                  <div key={c.title}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: '#9ca3af' }}>{c.title}</span>
                      <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>{c.fit}%</span>
                    </div>
                    <div className="h-1 rounded-full mb-1.5" style={{ background: 'rgba(107,114,128,0.15)' }}>
                      <div className="h-full rounded-full" style={{ width: `${c.fit}%`, background: 'rgba(107,114,128,0.35)' }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{c.contraReason}</p>
                  </div>
                ))}
              </div>
            </div>

            <SectionConclusion
              color="#fb923c"
              title="진로 영역 결론"
              text={`Holland 코드 ${interp.riasecProfile.hollandCode}(${interp.riasecProfile.title})과 위 진로 추천을 함께 보세요. 두 결과가 겹치는 직업이 가장 강력한 후보입니다. 진로는 적합도 점수가 높은 것만이 아니라, 당신이 실제로 의미를 느끼는 일과의 교차점에서 찾아야 합니다.`}
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 5: Holland RIASEC 직업흥미 (직접 측정)
        ═══════════════════════════════════════════════════════ */}
        <section className="glass rounded-2xl p-6 space-y-6">
          <SectionHeader icon="🧭" badge="파트 5 · 직업 흥미 — 18문항 직접 측정" badgeColor="#34d399" title="Holland 직업 흥미 유형 분석" />

          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            무료 검사는 성격 점수에서 RIASEC을 <em>추정</em>합니다. 이 분석은 18개 전용 문항으로 <strong style={{ color: 'var(--text)' }}>직접 측정</strong>합니다.
          </p>

          <div className="rounded-xl p-5" style={{ background: '#34d39918', border: '1px solid #34d39930' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl font-extrabold tracking-widest" style={{ color: '#34d399', letterSpacing: '0.1em' }}>
                {interp.riasecProfile.hollandCode}
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: '#34d399' }}>Holland Code</div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{interp.riasecProfile.title}</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{interp.riasecProfile.portrait}</p>
          </div>

          <div>
            <div className="text-xs font-bold mb-3" style={{ color: 'var(--muted2)' }}>6유형 점수 (3~15)</div>
            <div className="space-y-3">
              {riasecSorted.map(([r, v]) => {
                const info = RIASEC_LABELS[r as keyof typeof RIASEC_LABELS]
                const isTop = riasecTop3.includes(r as any)
                return (
                  <div key={r}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: RIASEC_COLORS[r] }}>{info.label}</span>
                        {isTop && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: RIASEC_COLORS[r] + '25', color: RIASEC_COLORS[r] }}>
                            TOP
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold" style={{ color: RIASEC_COLORS[r] }}>{v}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded-full" style={{ width: `${((v - 3) / 12) * 100}%`, background: RIASEC_COLORS[r] }} />
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted2)' }}>{info.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold mb-2" style={{ color: '#34d399' }}>✓ 잘 맞는 환경</div>
              <div className="space-y-1.5">
                {interp.riasecProfile.fitEnvironments.map((e, i) => (
                  <div key={i} className="text-xs rounded-lg px-3 py-2" style={{ background: '#34d39915', color: 'var(--muted)' }}>{e}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold mb-2" style={{ color: '#f87171' }}>✗ 맞지 않는 환경</div>
              <div className="space-y-1.5">
                {interp.riasecProfile.misfitEnvironments.map((e, i) => (
                  <div key={i} className="text-xs rounded-lg px-3 py-2" style={{ background: '#f8717115', color: 'var(--muted)' }}>{e}</div>
                ))}
              </div>
            </div>
          </div>

          <SectionConclusion
            color="#34d399"
            title="직업 흥미 영역 결론"
            text={`Holland 코드 ${interp.riasecProfile.hollandCode}(${interp.riasecProfile.title})은 당신이 어떤 환경에서 자연스럽게 에너지를 얻는지를 보여줍니다. 잘 맞는 환경에서는 일 자체가 보상이 되고, 맞지 않는 환경에서는 능력이 아무리 뛰어나도 지속하기 어렵습니다. 직업 선택뿐 아니라 현재 직장 안에서의 역할 설계에도 이 코드를 활용하세요.`}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════
            파트 6: 학문 적성
        ═══════════════════════════════════════════════════════ */}
        <section className="glass rounded-2xl p-6 space-y-6">
          <SectionHeader icon="📚" badge="파트 6 · 학문 적성 — 무료 검사에 없는 분석" badgeColor="#f472b6" title="학문 계열 적성 분석" />

          <div className="rounded-xl p-5 space-y-4" style={{ background: '#f472b618', border: '1px solid #f472b630' }}>
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: '#f472b6' }}>지배 계열</div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>{interp.aptitudeBreakdown.dominant}</div>
            </div>
            <div className="space-y-3">
              <AptitudeRatioBar label="이과" value={interp.aptitudeBreakdown.stem}        color="#818cf8" />
              <AptitudeRatioBar label="공학" value={interp.aptitudeBreakdown.engineering} color="#34d399" />
              <AptitudeRatioBar label="문과" value={interp.aptitudeBreakdown.liberal}     color="#fbbf24" />
              <AptitudeRatioBar label="경상" value={interp.aptitudeBreakdown.business}    color="#f472b6" />
            </div>
            <p className="text-xs" style={{ color: 'var(--muted2)' }}>
              * 비율은 8개 적성 차원의 계열별 가중합을 정규화한 값입니다
            </p>
          </div>

          <div>
            <div className="text-xs font-bold mb-3" style={{ color: 'var(--muted2)' }}>8개 적성 차원 점수 (1~5)</div>
            <div className="space-y-3">
              {(Object.entries(aptitude) as [string, number][]).map(([dim, v]) => (
                <ScoreBar key={dim} value={v} max={5} color="#f472b6" label={APTITUDE_DIM_LABELS[dim as keyof typeof APTITUDE_DIM_LABELS]} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold mb-3" style={{ color: '#f472b6' }}>추천 전공 분야</div>
            <div className="flex flex-wrap gap-2">
              {interp.aptitudeBreakdown.recommended.map((r, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#f472b618', color: '#f472b6', border: '1px solid #f472b630' }}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          {interp.aptitudeBreakdown.fusionPath && (
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'linear-gradient(135deg, #818cf818, #34d39918)', border: '1px solid #818cf840' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#818cf8', color: '#fff' }}>
                    융합 경로 추천
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted2)' }}>상위 두 계열의 차이가 크지 않습니다</span>
                </div>
                <h4 className="text-base font-bold mt-2" style={{ color: 'var(--text)' }}>
                  {interp.aptitudeBreakdown.fusionPath.label}
                </h4>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.85 }}>
                {interp.aptitudeBreakdown.fusionPath.description}
              </p>
              <div>
                <div className="text-xs font-bold mb-2" style={{ color: '#818cf8' }}>융합 추천 전공</div>
                <div className="flex flex-wrap gap-2">
                  {interp.aptitudeBreakdown.fusionPath.majors.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#818cf818', color: '#818cf8', border: '1px solid #818cf840' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold mb-2" style={{ color: '#34d399' }}>대표 직업·역할</div>
                <div className="flex flex-wrap gap-2">
                  {interp.aptitudeBreakdown.fusionPath.careers.map((c, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#34d39915', color: '#34d399', border: '1px solid #34d39930' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <SectionConclusion
            color="#f472b6"
            title="학문 적성 영역 결론"
            text={`${interp.aptitudeBreakdown.portrait} ${interp.aptitudeBreakdown.fusionPath ? `특히 ${interp.aptitudeBreakdown.fusionPath.label}의 관점에서, 단일 계열보다 두 계열이 교차하는 융합 분야에서 더 독창적인 강점을 발휘할 가능성이 높습니다.` : '계열 비율 분포를 통해 본인의 지적 스타일에 가장 자연스럽게 맞는 방향을 우선 고려하시기 바랍니다.'}`}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════
            파트 7: 투자 성향 (무료 기본 분석 항목)
        ═══════════════════════════════════════════════════════ */}
        {investment && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon="📊" badge="파트 7 · 투자 성향" badgeColor="#fbbf24" title="투자 성향 분석" />

            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              행동재무학 연구 기반 성격-투자행동 분석입니다. 금융 조언이 아닌 성향 참고 자료입니다.
            </p>

            <div className="rounded-xl p-5" style={{ background: `${investment.riskColor}12`, border: `1px solid ${investment.riskColor}30` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: `${investment.riskColor}18`, border: `1px solid ${investment.riskColor}44` }}>
                  <span className="text-xs font-medium" style={{ color: investment.riskColor }}>성향</span>
                  <span className="text-xs font-bold text-center leading-tight mt-0.5" style={{ color: investment.riskColor }}>
                    {investment.riskLabel}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{investment.riskRationale}</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: '📅 권장 투자 기간', text: investment.horizon },
                { label: '📊 핵심 투자 스타일', text: investment.style },
                { label: '🧠 행동 편향 주의', text: investment.behavioralBias },
                { label: '💡 이 유형의 핵심 원칙', text: investment.principle },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#fbbf24' }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>✓ 성격에 맞는 투자</p>
                <ul className="space-y-2">
                  {investment.suitable.map(s => (
                    <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>✗ 피해야 할 것</p>
                <ul className="space-y-2">
                  {investment.avoid.map(a => (
                    <li key={a} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#f87171', flexShrink: 0 }}>·</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <SectionConclusion
              color="#fbbf24"
              title="투자 성향 영역 결론"
              text="투자 성향은 바꿀 수 없지만 인식할 수는 있습니다. 위에 나온 행동 편향을 알고 있는 것만으로도 충동적 결정을 피하는 데 도움이 됩니다. 당신의 성격에 맞는 투자 방식이 가장 지속 가능한 부의 축적 방법입니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 8: 리더십 스타일 (무료 심층 분석 항목)
        ═══════════════════════════════════════════════════════ */}
        {leadership && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon={leadership.icon} badge="파트 8 · 리더십 스타일" badgeColor="#818cf8" title="리더십 스타일 프로파일" />

            <p className="font-bold text-lg">{leadership.style}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{leadership.summary}</p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#34d399' }}>핵심 강점</p>
                <ul className="space-y-1.5">
                  {leadership.strengths.map(s => (
                    <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#34d399' }}>·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#f59e0b' }}>사각지대</p>
                <ul className="space-y-1.5">
                  {leadership.blindspots.map(b => (
                    <li key={b} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#f59e0b' }}>·</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#818cf8' }}>최적 환경</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{leadership.bestEnvironment}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#818cf8' }}>다음 성장 단계</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{leadership.growthEdge}</p>
              </div>
            </div>

            <SectionConclusion
              color="#818cf8"
              title="리더십 영역 결론"
              text="리더십 스타일은 공식적인 리더 역할에만 해당되지 않습니다. 프로젝트를 이끌거나 팀원을 돕거나 의견을 내는 모든 순간에 나타납니다. 위에 나온 사각지대를 인식하는 것이 리더십의 첫 번째 성장 단계입니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 9: 번아웃 리스크 (무료 심층 분석 항목)
        ═══════════════════════════════════════════════════════ */}
        {burnout && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon="🔥" badge="파트 9 · 번아웃 리스크" badgeColor={burnout.color} title="번아웃 리스크 분석" />

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                style={{ background: `${burnout.color}20`, border: `2px solid ${burnout.color}60` }}>
                <span className="text-xs" style={{ color: burnout.color }}>리스크</span>
                <span className="text-lg font-bold" style={{ color: burnout.color }}>{burnout.level}</span>
                <span className="text-xs" style={{ color: burnout.color }}>{burnout.score}점</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{burnout.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>위험 요인</p>
                <ul className="space-y-1.5">
                  {burnout.riskFactors.map(r => (
                    <li key={r} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#f87171' }}>·</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>보호 요인</p>
                <ul className="space-y-1.5">
                  {burnout.protectiveFactors.map(p => (
                    <li key={p} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#34d399' }}>·</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: burnout.color }}>예방 전략</p>
              <ul className="space-y-2">
                {burnout.prevention.map((p, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: burnout.color, flexShrink: 0 }}>{i + 1}.</span>{p}
                  </li>
                ))}
              </ul>
            </div>

            <SectionConclusion
              color={burnout.color}
              title="번아웃 영역 결론"
              text="번아웃은 갑자기 오지 않습니다. 위에 나온 위험 요인 중 하나라도 지금 진행 중이라면, 예방보다 회복이 훨씬 어렵고 오래 걸립니다. 예방 전략을 이번 주 안에 하나 실천하는 것이 가장 효과적입니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 10: 핵심 가치관 (무료 심층 분석 항목)
        ═══════════════════════════════════════════════════════ */}
        {values && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <SectionHeader icon={values.icon} badge="파트 10 · 핵심 가치관" badgeColor="#a78bfa" title="핵심 가치관 프로파일" />

            <div className="flex items-center gap-3 mb-1">
              <span className="font-bold">{values.primary}</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>+</span>
              <span className="font-semibold" style={{ color: '#a78bfa' }}>{values.secondary}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.summary}</p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>커리어에서의 의미</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.inCareer}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>관계에서의 의미</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.inRelationships}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(124,77,204,0.10)', border: '1px solid rgba(124,77,204,0.25)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>⚡ 가치 충돌 인사이트</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.tension}</p>
              </div>
            </div>

            <SectionConclusion
              color="#a78bfa"
              title="가치관 영역 결론"
              text="가치관은 삶의 방향키입니다. 현재의 커리어, 관계, 일상이 위에 나온 핵심 가치와 얼마나 일치하는지 점검해보세요. 불일치가 클수록 의미 없음과 번아웃이 동시에 찾아올 수 있습니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 11: 삶의 균형 (무료 심층 분석 항목)
        ═══════════════════════════════════════════════════════ */}
        {lifeBalance && (
          <section className="glass rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <SectionHeader icon="⚖️" badge="파트 11 · 삶의 균형" badgeColor={lifeBalance.overallBalance === '양호' ? '#34d399' : lifeBalance.overallBalance === '보통' ? '#f59e0b' : '#f87171'} title="삶의 균형 분석" />
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: lifeBalance.overallBalance === '양호' ? '#34d39920' : lifeBalance.overallBalance === '보통' ? '#f59e0b20' : '#f8717120',
                  color: lifeBalance.overallBalance === '양호' ? '#34d399' : lifeBalance.overallBalance === '보통' ? '#f59e0b' : '#f87171',
                }}>
                {lifeBalance.overallBalance}
              </span>
            </div>

            <div className="space-y-4">
              {lifeBalance.domains.map(d => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text)' }}>
                      <span>{d.icon}</span>{d.name}
                    </span>
                    <span style={{ color: d.score >= 65 ? '#34d399' : d.score >= 45 ? '#f59e0b' : '#f87171' }}>{d.score}점</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.score >= 65 ? '#34d399' : d.score >= 45 ? '#f59e0b' : '#f87171' }} />
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{d.insight}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>종합 권고</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{lifeBalance.recommendation}</p>
            </div>

            <SectionConclusion
              color="#a78bfa"
              title="삶의 균형 영역 결론"
              text="위 영역별 점수는 당신의 성격 패턴에 기반한 추정치입니다. 현재 점수가 낮은 영역이 실제로 부족하게 느껴진다면, 성격이 그 방향을 예측하고 있는 것입니다. 가장 낮은 영역 하나에 집중해 작은 변화를 시작하는 것이 전체 균형을 회복하는 가장 빠른 경로입니다."
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 11.5: HEXACO × RIASEC × 적성 교차 종합 분석
        ═══════════════════════════════════════════════════════ */}
        {interp.crossDomainSynthesis && (
        <section className="rounded-2xl p-6 space-y-6" style={{ background: 'linear-gradient(135deg, #06402222, #06404422)', border: '1px solid #10b98140' }}>
          <SectionHeader icon="⚡" badge="통합 교차 분석 · 성격 × 흥미 × 적성" badgeColor="#10b981" title="3축 융합 심층 분석" />

          {/* 통합 아키타입 */}
          <div className="rounded-xl p-5 text-center" style={{ background: 'var(--surface)', border: '1px solid #10b98130' }}>
            <div className="text-xs font-bold mb-1" style={{ color: '#6ee7b7' }}>당신의 통합 아키타입</div>
            <div className="text-2xl font-black mb-2" style={{ color: '#10b981' }}>{interp.crossDomainSynthesis.archetype}</div>
            <div className="text-xs" style={{ color: 'var(--muted2)' }}>{interp.crossDomainSynthesis.title}</div>
          </div>

          {/* 핵심 강점 서사 */}
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold mb-3" style={{ color: '#10b981' }}>성격 × 흥미 × 적성이 만드는 시너지</div>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.9 }}>{interp.crossDomainSynthesis.coreStrengthNarrative}</p>
          </div>

          {/* 경력 경로 */}
          <div className="space-y-4">
            <div className="text-xs font-bold" style={{ color: '#10b981' }}>최적 경력 경로 (3축 통합 근거)</div>
            {interp.crossDomainSynthesis.careerPathways.map((path, i) => (
              <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: '#10b98120', color: '#10b981' }}>경로 {i + 1}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{path.label}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}><span className="font-semibold" style={{ color: '#6ee7b7' }}>왜 맞는가: </span>{path.why}</p>
                <ul className="space-y-1">
                  {path.concrete.map((item, j) => item && (
                    <li key={j} className="text-xs flex gap-2" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}>▸</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg p-3" style={{ background: '#10b98110', border: '1px solid #10b98130' }}>
                  <span className="text-xs font-bold" style={{ color: '#10b981' }}>지금 당장 할 첫 행동: </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{path.firstStep}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 개발 역량 */}
          <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold mb-1" style={{ color: '#fbbf24' }}>지금 개발해야 할 구체적 역량</div>
            {interp.crossDomainSynthesis.developmentFoci.map((item, i) => (
              <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                <span style={{ color: '#fbbf24', flexShrink: 0 }}>◆</span><span>{item}</span>
              </div>
            ))}
          </div>

          {/* 경고 신호 */}
          <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold mb-1" style={{ color: '#f87171' }}>경계해야 할 패턴</div>
            {interp.crossDomainSynthesis.warningSignals.map((item, i) => (
              <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>⚠</span><span>{item}</span>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            파트 12: 통합 결론
        ═══════════════════════════════════════════════════════ */}
        <section className="rounded-2xl p-6 space-y-6" style={{ background: 'linear-gradient(135deg, #7c3aed22, #0891b222)', border: '1px solid #7c3aed40' }}>
          <SectionHeader icon="🔮" badge="통합 결론 · 당신의 심리적 초상화" badgeColor="#a78bfa" title="15개 영역 통합 분석 결론" />

          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold mb-3" style={{ color: '#a78bfa' }}>핵심 정체성</div>
            {interp.synthesis.coreIdentity.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm mb-4 last:mb-0" style={{ color: 'var(--muted)', lineHeight: 1.9 }}>
                {para}
              </p>
            ))}
          </div>

          <AlignmentBadge level={interp.synthesis.alignment} note={interp.synthesis.alignmentNote} />

          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold mb-2" style={{ color: '#34d399' }}>커리어 방향성</div>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.85 }}>{interp.synthesis.careerCompass}</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold mb-2" style={{ color: '#fbbf24' }}>성장 과제 — 당신의 맹점</div>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.85 }}>{interp.synthesis.growthEdge}</p>
          </div>

          <div className="text-center py-4">
            <p className="text-sm font-semibold italic" style={{ color: '#a78bfa' }}>
              &ldquo;{interp.hexacoPattern.title}이자 {interp.riasecProfile.title}인 당신은,<br />
              {interp.aptitudeBreakdown.dominant}에서 자신의 지적 열망을 가장 잘 실현할 수 있습니다.&rdquo;
            </p>
          </div>
        </section>

        {/* ── 정식 출시 예정 안내 ── */}
        <div className="rounded-2xl p-6 text-center space-y-3"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="text-xs font-bold tracking-widest" style={{ color: '#fbbf24' }}>🧪 베타 체험 중</div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            지금은 무료로 체험하실 수 있습니다
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            정식 출시 후에는 9,900원에 제공될 예정입니다.<br />
            피드백을 남겨주시면 출시 알림을 드릴게요.
          </p>
          <a
            href="https://forms.gle/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center"
            style={{ padding: '13px', background: 'linear-gradient(135deg,#92400e,#b45309)', boxShadow: 'none' }}
          >
            피드백 남기고 출시 알림 받기 →
          </a>
        </div>

        {/* ── 하단 액션 ── */}
        <div className="space-y-3">
          <button
            onClick={() => window.print()}
            className="btn-secondary w-full"
            style={{ justifyContent: 'center', padding: '13px' }}
          >
            결과 저장 (인쇄 / PDF)
          </button>
          <Link href="/" className="btn-secondary w-full flex items-center justify-center" style={{ padding: '13px' }}>
            홈으로 돌아가기
          </Link>
        </div>

        <p className="text-center text-xs pb-6" style={{ color: 'var(--muted2)', lineHeight: 1.7 }}>
          본 검사 결과는 심리측정 이론에 기반한 참고 자료이며, 임상적 진단이나 법적 판단의 근거로 사용될 수 없습니다.
        </p>

      </div>
    </main>
  )
}
