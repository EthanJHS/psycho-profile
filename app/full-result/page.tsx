'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ShareButtons from '@/components/ShareButtons'
import RadarChart from '@/components/RadarChart'
import { scoreFullAnswers, FullScoringOutput } from '@/lib/full-scoring'
import { completeTestSession, trackResultView } from '@/lib/analytics'
import { Answer } from '@/types'
import { FacetMap } from '@/lib/profiles'
import { computeNarrative, computeWorkStyle, computeInvestmentProfile } from '@/lib/insights'

// ── 패싯 메타 (결과 해석용) ──────────────────────────────────────
const HEXACO_META: Record<string, { label: string; high: string; mid: string; low: string }> = {
  H: {
    label: '정직·겸손',
    high: '진정성과 공정함을 핵심 가치로 삼으며, 자신을 과장하거나 타인을 이용하는 방식에 강한 거부감을 느낍니다. 이 진정성이 장기적으로 깊은 신뢰를 만드는 토대입니다.',
    mid: '필요할 때는 자신을 드러낼 수 있지만, 지나친 자기 홍보나 기회주의적 행동은 불편하게 여깁니다.',
    low: '자신의 능력과 성취를 자신감 있게 드러내며, 경쟁 환경에서 자신을 적극적으로 포지셔닝하는 데 거리낌이 없습니다.',
  },
  E: {
    label: '감수성·정서',
    high: '감정 변화에 민감하고 깊이 느낍니다. 타인의 정서를 빠르게 읽는 강점이 있지만, 감정 소진에 취약할 수 있습니다.',
    mid: '상황에 따라 감정 기복이 있지만 대체로 균형을 유지합니다. 공감 능력과 감정 안정 사이를 유연하게 오갑니다.',
    low: '감정적으로 안정되어 있으며 스트레스 상황에서도 침착함을 유지합니다. 논리적 판단이 감정보다 앞서는 경향이 있습니다.',
  },
  X: {
    label: '외향성·사교성',
    high: '사람들 사이에서 에너지를 얻고, 낯선 상황에서도 자연스럽게 자신을 표현합니다. 주목받는 환경이 동기 부여가 됩니다.',
    mid: '신뢰하는 사람들과는 표현이 자유롭지만, 완전히 낯선 환경에서는 준비 시간이 필요합니다.',
    low: '혼자 또는 소수의 깊은 관계에서 최고의 성과를 냅니다. 사교 에너지보다 내부 사고 에너지가 더 풍부합니다.',
  },
  A: {
    label: '원만성·공감력',
    high: '다른 의견도 끝까지 듣고 이해하려 합니다. 갈등보다 조화를 선택하는 경향이 강하며, 협력 환경에서 탁월한 성과를 냅니다.',
    mid: '일반적으로 원만하지만, 가치관 차이가 클 때는 직접적으로 표현하기도 합니다.',
    low: '직접적이고 솔직한 소통 방식을 선호합니다. 효율을 위해 갈등을 감수하는 결단력이 강점입니다.',
  },
  C: {
    label: '성실성·조직력',
    high: '시작한 일을 끝까지 마무리하는 강한 완수 성향을 가집니다. 자기 통제력이 높고 체계적 실행이 자연스럽습니다.',
    mid: '중요한 일에는 집중하지만, 흥미가 낮은 과제에서는 지속력이 흔들릴 수 있습니다.',
    low: '루틴보다 변화를 선호하며, 한 가지에 오래 집중하기보다 새로운 자극을 찾습니다. 창의적 유연성이 강점입니다.',
  },
  O: {
    label: '개방성·호기심',
    high: '새로운 아이디어와 분야에 강하게 끌리며 탐구 자체에서 에너지를 얻습니다. 익숙한 것보다 낯선 것에서 성장합니다.',
    mid: '관심 분야 내에서 깊이 탐구하지만, 낯선 영역 진입에는 선택적입니다.',
    low: '안정적이고 검증된 방식을 선호합니다. 빠른 적응보다 깊은 숙련을 추구합니다.',
  },
}

function domainLevel(score: number): 'high' | 'mid' | 'low' {
  if (score >= 3.8) return 'high'
  if (score >= 2.8) return 'mid'
  return 'low'
}

function ScoreBar({ value, max = 5, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color ?? 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
      />
    </div>
  )
}

const COG_LEVEL_COLOR: Record<string, string> = {
  high: '#c9a8f8',
  mid_high: '#a07ee0',
  mid: '#9a8cbd',
  mid_low: '#6b7280',
  low: '#6b7280',
}

export default function FullResultPage() {
  const [output, setOutput] = useState<FullScoringOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState('응답 분석 중...')

  useEffect(() => {
    const raw = sessionStorage.getItem('full_answers')
    if (!raw) { setLoading(false); return }

    const msgs = [
      '응답 분석 중...', '28개 프로파일 대조 중...',
      '패싯 점수 계산 중...', '인지 스타일 분류 중...', '리포트 생성 중...',
    ]
    let i = 0
    const iv = setInterval(() => { i++; if (i < msgs.length) setLoadingMsg(msgs[i]) }, 560)

    const answers: Answer[] = JSON.parse(raw)
    const scored = scoreFullAnswers(answers)

    completeTestSession(scored.result, scored.facets, scored.cogScore, scored.life).catch(() => {})
    trackResultView(scored.result.profileId).catch(() => {})

    setTimeout(() => { clearInterval(iv); setOutput(scored); setLoading(false) }, 2800)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-lg font-semibold gradient-text">{loadingMsg}</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>100문항 심층 분석 처리 중</p>
      </main>
    )
  }

  if (!output) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>결과를 찾을 수 없습니다.</p>
        <Link href="/full" className="text-sm underline" style={{ color: 'var(--accent2)' }}>풀 테스트 시작</Link>
      </main>
    )
  }

  const { result, facets, cogScore } = output

  const facetMap: FacetMap = {
    curiosity:  facets['curiosity']  ?? 3,
    diligence:  facets['diligence']  ?? 3,
    anxiety:    facets['anxiety']    ?? 3,
    boldness:   facets['boldness']   ?? 3,
    humility:   facets['humility']   ?? 3,
    patience:   facets['patience']   ?? 3,
  }

  const narrative   = computeNarrative(facetMap, cogScore)
  const workStyle   = computeWorkStyle(facetMap, cogScore)
  const investment  = computeInvestmentProfile(facetMap, cogScore)

  const hexSummary = result.hexacoSummary
  const radarAxes = [
    { label: '정직·겸손', value: Math.round(((hexSummary.H.score - 1) / 4) * 100) },
    { label: '성실성',    value: Math.round(((hexSummary.C.score - 1) / 4) * 100) },
    { label: '외향성',    value: Math.round(((hexSummary.X.score - 1) / 4) * 100) },
    { label: '원만성',    value: Math.round(((hexSummary.A.score - 1) / 4) * 100) },
    { label: '감수성',    value: Math.round(((hexSummary.E.score - 1) / 4) * 100) },
    { label: '개방성',    value: Math.round(((hexSummary.O.score - 1) / 4) * 100) },
  ]

  const cog = result.cogBreakdown

  return (
    <main className="min-h-screen px-5 flex flex-col items-center page-top" style={{ paddingBottom: 48 }}>
      <div className="w-full max-w-2xl space-y-5">

        {/* ── 헤더: 레이더 차트 + 프로파일 닉네임 ── */}
        <div className="text-center pt-8 pb-4 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(160,126,224,0.10) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>심층 분석 완료</p>

            <div className="flex justify-center mb-6">
              <RadarChart size={280} axes={radarAxes} />
            </div>

            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>이 점수 조합에 가장 가까운 유형</p>
            <h1 className="text-3xl font-bold mb-1">
              <span className="gradient-text">"{result.profileLabel}"</span>
            </h1>
            <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>편의상 붙인 이름입니다 — 위 레이더 차트가 진짜 당신입니다</p>

            <div className="flex flex-wrap gap-2 justify-center">
              {result.dominantTraits.map(t => (
                <span key={t} className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(160,126,224,0.14)', color: 'var(--accent2)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── 당신은 이러한 경향이 있습니다 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid rgba(160,126,224,0.22)' }}>
          <p className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: 'var(--accent2)' }}>당신은 이러한 경향이 있습니다</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.9 }}>{narrative}</p>
        </div>

        {/* ── SECTION 1: HEXACO 6개 도메인 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-5">성격 프로파일 — HEXACO 6개 도메인</h2>
          <div className="space-y-5">
            {(['H','E','X','A','C','O'] as const).map(key => {
              const val = hexSummary[key]
              const meta = HEXACO_META[key]
              const level = domainLevel(val.score)
              const levelLabel = level === 'high' ? '높음' : level === 'low' ? '낮음' : '보통'
              const levelColor = level === 'high' ? '#c9a8f8' : level === 'low' ? '#9a8cbd' : '#6b7280'
              return (
                <div key={key}>
                  <div className="flex justify-between items-baseline text-sm mb-2">
                    <span className="font-medium">{meta.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${levelColor}22`, color: levelColor }}>
                      {levelLabel} · {val.score.toFixed(1)}
                    </span>
                  </div>
                  <ScoreBar value={val.score} max={5} />
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>{meta[level]}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 2: 인지 스타일 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-4">인지 스타일 분석</h2>
          <div className="flex items-center gap-4 mb-4 p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${COG_LEVEL_COLOR[cog.level]}18`, border: `1px solid ${COG_LEVEL_COLOR[cog.level]}44` }}>
              <span className="text-xs font-medium" style={{ color: COG_LEVEL_COLOR[cog.level] }}>인지</span>
              <span className="text-xs font-bold text-center leading-tight mt-0.5" style={{ color: COG_LEVEL_COLOR[cog.level] }}>{cog.label.split(' ')[0]}</span>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">{cog.label}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.cognitiveStyle}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'fluid', label: '유동 추론', desc: '패턴·논리 추론 능력' },
              { key: 'verbal', label: '언어 이해', desc: '언어 유추·의미 파악' },
              { key: 'memory', label: '작업 기억', desc: '정보 유지·처리 능력' },
              { key: 'spatial', label: '공간 추론', desc: '시각적 구조 파악' },
            ].map(({ key, label, desc }) => {
              const score = cog[key as keyof typeof cog] as number
              const pct = Math.round(score * 100)
              return (
                <div key={key} className="p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold">{label}</span>
                    <span style={{ color: 'var(--accent2)' }}>{pct}%</span>
                  </div>
                  <ScoreBar value={score} max={1} />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>{desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 3: 진로 적합도 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-1">진로 적합도 TOP 6</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>HEXACO 패싯 점수 기반 동적 산출 · 성격-직무 적합 연구 기반</p>
          <div className="space-y-5">
            {result.careers.map((c, i) => {
              const fitColor = c.fit >= 90 ? '#c9a8f8' : c.fit >= 80 ? '#a07ee0' : 'var(--muted)'
              return (
                <div key={c.title} className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  {/* 헤더 */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(160,126,224,0.15)', color: 'var(--accent2)' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-semibold text-sm truncate">{c.title}</span>
                        <span className="font-bold text-sm flex-shrink-0" style={{ color: fitColor }}>{c.fit}%</span>
                      </div>
                      <div className="mt-1.5">
                        <ScoreBar value={c.fit} max={100} color={c.fit >= 90 ? 'linear-gradient(90deg, #a07ee0, #c9a8f8)' : undefined} />
                      </div>
                    </div>
                  </div>

                  {/* 적합 이유 */}
                  <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text)', opacity: 0.85 }}>{c.reason}</p>

                  {/* 상세 설명 */}
                  {c.detail && (
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{c.detail}</p>
                  )}

                  {/* 세부 직종 태그 */}
                  {c.subRoles && c.subRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.subRoles.map(role => (
                        <span key={role} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(160,126,224,0.10)', color: 'var(--accent2)', border: '1px solid rgba(160,126,224,0.22)' }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 성장 포인트 */}
                  {c.growthNote && (
                    <div className="flex items-start gap-2 pt-2" style={{ borderTop: '1px solid rgba(63,48,88,0.5)' }}>
                      <span className="text-xs flex-shrink-0" style={{ color: '#f59e0b' }}>↗</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{c.growthNote}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 4: 추천 업무 방식 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-1">추천 업무 방식</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>HEXACO 직업심리학 연구 기반 (Ashton & Lee 2007, De Vries et al. 2011)</p>
          <div className="space-y-4">
            {[
              { icon: '🧭', label: '의사결정', text: workStyle.decisionMaking },
              { icon: '🤝', label: '협업 스타일', text: workStyle.collaboration },
              { icon: '🏢', label: '최적 환경', text: workStyle.environment },
              { icon: '🎯', label: '집중·몰입', text: workStyle.focus },
              { icon: '💬', label: '소통 방식', text: workStyle.communication },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--accent2)' }}>
                  <span>{item.icon}</span>{item.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>✓ 업무 강점</p>
              <ul className="space-y-1.5">
                {workStyle.strengths.map(s => (
                  <li key={s} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: '#34d399', flexShrink: 0 }}>·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>⚠ 주의사항</p>
              <ul className="space-y-1.5">
                {workStyle.watchouts.map(w => (
                  <li key={w} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}>·</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: 투자 성향 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-1">투자 성향 분석</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>행동재무학 연구 기반 성격-투자행동 분석 · 금융 조언이 아닌 성향 참고 자료</p>
          <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${investment.riskColor}16`, border: `1px solid ${investment.riskColor}44` }}>
              <span className="text-xs font-medium" style={{ color: investment.riskColor }}>성향</span>
              <span className="text-xs font-bold text-center leading-tight mt-0.5" style={{ color: investment.riskColor }}>{investment.riskLabel}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{investment.riskRationale}</p>
          </div>
          <div className="space-y-4">
            {[
              { label: '📅 권장 투자 기간', text: investment.horizon },
              { label: '📊 핵심 투자 스타일', text: investment.style },
              { label: '🧠 행동 편향 주의', text: investment.behavioralBias },
              { label: '💡 핵심 원칙', text: investment.principle },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>{item.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>✓ 성격에 맞는 투자</p>
              <ul className="space-y-1.5">
                {investment.suitable.map(s => (
                  <li key={s} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: '#34d399', flexShrink: 0 }}>·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>✗ 피해야 할 것</p>
              <ul className="space-y-1.5">
                {investment.avoid.map(a => (
                  <li key={a} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: '#f87171', flexShrink: 0 }}>·</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── SECTION 6: 학습 설계 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-5">맞춤 학습 설계</h2>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--accent2)' }}>추천 학습 방법론</p>
              <ul className="space-y-2">
                {result.studyMethods.map((m, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: 'var(--accent2)' }}>0{i + 1}</span>{m}
                  </li>
                ))}
              </ul>
            </div>
            {[
              { label: '최적 학습 환경', text: result.studyEnvironment },
              { label: '최적 학습 스케줄', text: result.studySchedule },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent2)' }}>{item.label}</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: 생활 패턴 설계 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-5">생활 패턴 설계</h2>
          <div className="space-y-4">
            {[
              { label: '🌙 수면 권장', text: result.sleepRecommendation },
              { label: '🏃 운동 권장', text: result.exerciseRecommendation },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent2)' }}>{item.label}</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.text}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--accent2)' }}>📅 주간 루틴 설계</p>
              <ul className="space-y-2">
                {result.weeklyRoutine.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--accent2)', flexShrink: 0 }}>·</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── SECTION 8: 동기·기질 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-4">동기 및 기질 프로파일</h2>
          {[
            { label: '⚡ 동기 유형', text: result.motivationProfile },
            { label: '🧬 기질 프로파일 (TCI)', text: result.temperamentProfile },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl mb-3" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent2)' }}>{item.label}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* ── SECTION 9: 스트레스 반응 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-4">스트레스 반응 분석</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent2)' }}>회복력 & 민감도</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.stressProfile}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: '#f59e0b' }}>주요 스트레스 유발 요인</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.stressTrigger}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent2)' }}>대처 패턴 & 해소 전략</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.stressCoping}</p>
            </div>
          </div>
        </div>

        {/* ── SECTION 10: 대인관계 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-4">대인관계 패턴</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{result.relationshipStyle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#34d399' }}>관계 강점</p>
              <ul className="space-y-2">
                {result.relationshipStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#f59e0b' }}>관계 도전 요소</p>
              <ul className="space-y-2">
                {result.relationshipChallenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── SECTION 11: 주의 패턴 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-4">주의 패턴 & 리스크</h2>
          <ul className="space-y-3">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', color: 'var(--muted)' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>!</span>{w}
              </li>
            ))}
          </ul>
        </div>

        {/* ── SECTION 12: 성장 로드맵 ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-base mb-4">성장 로드맵</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{result.growthDirection}</p>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--accent2)' }}>지금 당장 시작할 우선순위</p>
          <div className="space-y-2">
            {result.growthPriorities.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
                <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(160,126,224,0.18)', color: 'var(--accent2)' }}>
                  {i + 1}
                </span>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 공유 ── */}
        <ShareButtons profileLabel={result.profileLabel} profileId={result.profileId} />

        {/* ── PDF 저장 + 홈 ── */}
        <div className="text-center pb-6 space-y-4">
          <button
            onClick={() => window.print()}
            className="px-8 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            PDF로 저장
          </button>
          <div>
            <Link href="/" className="text-sm underline" style={{ color: 'var(--muted)' }}>홈으로</Link>
          </div>
        </div>

      </div>
    </main>
  )
}
