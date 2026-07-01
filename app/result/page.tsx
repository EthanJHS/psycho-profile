'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { scoreAnswers, ScoringOutput } from '@/lib/scoring'
import { completeTestSession, trackResultView, trackUpgradeClick, initScrollDepthTracking } from '@/lib/analytics'
import { Answer } from '@/types'
import ShareButtons from '@/components/ShareButtons'
import ScientificDisclaimer from '@/components/ScientificDisclaimer'
import {
  computeWorkStyle, computeInvestmentProfile, computeNarrative,
  computeCharacterStrengths, computeLeadershipStyle,
  computeBurnoutRisk, computeValuesProfile, computeLifeBalance, computeRiasec,
} from '@/lib/insights'
import { FacetMap } from '@/lib/profiles'
import RadarChart from '@/components/RadarChart'
import ResultChat from '@/components/ResultChat'

type Tier = 'free' | 'basic' | 'deep' | 'ai'

// ─── 3-레이어 메타 ───────────────────────────────────────────────────
const ARCHETYPE_META: Record<string, { icon: string; label: string }> = {
  architect:   { icon: '🏛️', label: '건축가' },
  guardian:    { icon: '🛡️', label: '수호자' },
  explorer:    { icon: '🧭', label: '탐험가' },
  prophet:     { icon: '🔮', label: '예언자' },
  warrior:     { icon: '⚔️', label: '전사' },
  alchemist:   { icon: '⚗️', label: '연금술사' },
  sovereign:   { icon: '👑', label: '군주' },
  sage:        { icon: '📚', label: '현자' },
  harmonizer:  { icon: '🌀', label: '조율자' },
  rebel:       { icon: '🔥', label: '반항아' },
  lover:       { icon: '💜', label: '연인' },
  catalyst:    { icon: '⚡', label: '촉매자' },
}

const MODE_META: Record<string, { label: string; desc: string; color: string }> = {
  analytical:  { label: '분석형', desc: '데이터와 논리로 판단하며 검증된 결론을 신뢰합니다', color: '#60a5fa' },
  intuitive:   { label: '직관형', desc: '패턴과 감각으로 빠르게 통찰에 도달합니다', color: '#c084fc' },
  pragmatic:   { label: '실용형', desc: '"작동하는가"가 "아름다운가"보다 항상 먼저입니다', color: '#34d399' },
  integrative: { label: '통합형', desc: '다양한 관점을 하나로 엮어 더 큰 그림을 구성합니다', color: '#f59e0b' },
}

const DRIVE_META: Record<string, { label: string; motivation: string; color: string }> = {
  achievement: { label: '성취 동력', motivation: '탁월함을 증명하고 목표를 달성할 때 가장 살아있음을 느낀다', color: '#f87171' },
  connection:  { label: '관계 동력', motivation: '깊은 유대와 의미 있는 관계에서 삶의 핵심 에너지를 얻는다', color: '#fb923c' },
  autonomy:    { label: '자율 동력', motivation: '자신의 방식대로 결정하고 행동할 때 최고의 역량을 발휘한다', color: '#a78bfa' },
  security:    { label: '안정 동력', motivation: '예측 가능하고 안전한 환경에서 깊은 역량을 꽃피운다', color: '#38bdf8' },
}

const FACET_META: Record<string, {
  label: string
  subFacets: string[]
  subFacetNote: string
  high: string
  mid: string
  low: string
}> = {
  curiosity: {
    label: '개방성·호기심',
    subFacets: ['지적 탐구', '미적 감수성', '창의적 상상력', '비관습적 사고'],
    subFacetNote: '4개 하위 축의 통합 추정치입니다. 예: 지적 탐구는 높지만 미적 감수성은 낮은 "논리 탐구형"이 존재할 수 있습니다.',
    high: '새로운 아이디어와 분야에 강하게 끌리며, 탐구 자체에서 동기를 얻습니다. 모르는 것을 만났을 때 불편하기보다 흥미롭게 느끼며, 대화에서 "왜?"를 자주 묻습니다. 익숙한 것보다 낯선 것에서 더 빠르게 성장하는 유형입니다.',
    mid: '관심 분야 내에서는 깊이 탐구하지만, 낯선 영역 진입에는 선택적입니다. 완전히 새로운 것보다 기존 관심사의 확장을 선호하며, 탐구의 방향성이 뚜렷한 편입니다.',
    low: '안정적이고 검증된 방식을 선호합니다. 새로운 아이디어보다 실증된 방법에서 신뢰를 얻으며, 빠른 적응보다 한 분야의 깊은 숙련을 추구하는 경향이 있습니다.',
  },
  diligence: {
    label: '성실성·지속력',
    subFacets: ['체계성', '완수 의지', '완벽주의', '신중한 계획'],
    subFacetNote: '4개 하위 축의 통합 추정치입니다. 예: 체계성은 높지만 완벽주의가 낮은 "실용적 계획가"형이 존재합니다.',
    high: '시작한 일을 끝까지 마무리하는 강한 완수 성향을 가집니다. 외부 압박 없이도 자체 동기로 지속하며, 장기 목표를 향해 일관된 속도를 유지합니다. 체계적 계획을 선호하고 마감과 약속에 민감합니다.',
    mid: '중요하거나 의미 있는 일에는 높은 집중력을 발휘하지만, 흥미가 낮은 과제에서는 지속력이 흔들릴 수 있습니다. 동기 부여 요인에 따라 성과 편차가 생길 수 있습니다.',
    low: '루틴보다 변화를 선호하며, 한 가지에 오래 집중하기보다 새로운 자극을 찾습니다. 유연하고 즉흥적인 환경에서 더 잘 작동하며, 엄격한 일정보다 흐름에 따른 작업을 선호합니다.',
  },
  boldness: {
    label: '사회적 대담성',
    subFacets: ['사회적 자신감', '공적 발언 편안함', '사교적 주도성', '활력·생동감'],
    subFacetNote: '4개 하위 축의 통합 추정치입니다. 예: 소규모에서는 주도적이지만 대중 앞 발언은 불편한 "선택적 외향형"이 존재합니다.',
    high: '낯선 사람 앞에서도 자신을 자연스럽게 표현합니다. 주목받는 상황을 에너지원으로 활용하며, 그룹을 이끄는 역할에 자연스럽게 끌립니다. 긴 모임 후에도 오히려 활력이 충전되는 경향이 있습니다.',
    mid: '신뢰하는 사람들 앞에서는 표현이 자유롭지만, 낯선 상황에서는 준비와 워밍업이 필요합니다. 완전한 내향도 외향도 아닌, 상황에 따라 유연하게 전환하는 유형입니다.',
    low: '내향적이며 소수의 깊은 관계를 선호합니다. 혼자 또는 소규모 환경에서 최고의 성과를 내며, 긴 사교 자리 후에는 혼자만의 회복 시간이 필요합니다. 조용한 집중력이 강점입니다.',
  },
  humility: {
    label: '겸손·윤리 의식',
    subFacets: ['진정성·진실함', '공정성', '물질적 탐욕 회피', '과시 억제'],
    subFacetNote: 'HEXACO 모델 고유 차원으로, 도덕적 일관성과 자기 절제를 종합합니다. 4개 하위 축의 통합 추정치입니다.',
    high: '과시나 자기 홍보에 불편함을 느끼며, 공정함과 진정성을 핵심 가치로 삼습니다. 규칙이 없어도 윤리적 기준을 스스로 지키는 경향이 강하며, 이 진정성이 장기적으로 신뢰를 쌓는 기반이 됩니다.',
    mid: '필요할 때는 자신을 드러낼 수 있지만, 과도한 자기 홍보는 지양합니다. 상황의 맥락에 따라 자기 표현 수위를 조절하는 유연함이 있습니다.',
    low: '자신감 있게 자신을 표현하며, 경쟁과 인정을 중요하게 여깁니다. 자기 주장이 분명하고 성과를 드러내는 것을 자연스럽게 받아들입니다.',
  },
  anxiety: {
    label: '감수성·정서적 민감도',
    subFacets: ['위험 민감성', '불안·걱정 경향', '감정적 의존성', '타인 감정 공명'],
    subFacetNote: 'HEXACO의 감성(Emotionality) 차원입니다. 높은 점수가 나쁜 것이 아니며, 공감 능력과 깊은 연관이 있습니다.',
    high: '감정 변화에 민감하고 깊이 느낍니다. 타인의 감정을 잘 읽는 공감 능력이 강점이며, 위험 신호를 조기에 감지하는 데도 유리합니다. 다만 스트레스 상황에서 반추(rumination)가 길어질 수 있어 의도적인 전환 전략이 도움이 됩니다.',
    mid: '상황에 따라 감정 기복이 있지만, 대체로 균형을 유지합니다. 감정을 느끼지만 행동으로 빠르게 전환하는 편이며, 필요시 타인의 감정 지원을 자연스럽게 구합니다.',
    low: '감정적으로 안정되어 있으며, 스트레스 상황에서도 침착함을 유지합니다. 위험이나 불확실성 앞에서 크게 동요하지 않으며, 압박 상황에서 냉정한 판단을 내리는 데 유리합니다.',
  },
  patience: {
    label: '공감력·원만성',
    subFacets: ['용서·관대함', '온화한 태도', '유연성·타협력', '분노 조절'],
    subFacetNote: 'HEXACO의 원만성(Agreeableness) 차원으로, 특히 분노 억제와 관용의 성향을 반영합니다.',
    high: '다른 의견도 끝까지 듣고 이해하려 합니다. 갈등보다 조화를 선택하는 경향이 강하며, 화나는 상황에서도 비교적 빠르게 진정합니다. 심리적 안전감이 높은 팀 환경을 자연스럽게 만들어냅니다.',
    mid: '일반적으로 원만하지만, 가치관 차이가 클 때는 직접적으로 표현합니다. 상황에 따라 협력과 주장 사이에서 유연하게 전환할 수 있습니다.',
    low: '직접적이고 솔직한 소통 방식을 선호합니다. 비효율적인 과정이나 불합리한 상황에 빠르게 반응하며, 명확한 의사소통을 중요하게 여깁니다. 협상보다 결론 지향적인 방식을 선호하는 경향이 있습니다.',
  },
}

function facetLevel(s: number): 'high' | 'mid' | 'low' { return s >= 3.67 ? 'high' : s >= 2.34 ? 'mid' : 'low' }
function facetPct(s: number): number { return Math.round(((s - 1) / 4) * 100) }

const COG_LABELS = [
  { min: 0.8, label: '매우 높음', color: '#a78bfa' },
  { min: 0.6, label: '높음', color: '#7c6ef0' },
  { min: 0.4, label: '보통', color: '#6b7280' },
  { min: 0, label: '낮음', color: '#9ca3af' },
]
function cogLabel(c: number) { return COG_LABELS.find(l => c >= l.min) ?? COG_LABELS[COG_LABELS.length - 1] }

function LockOverlay({ tier, targetTier, onUnlock }: { tier: Tier; targetTier: 'basic' | 'deep'; onUnlock: (t: Tier) => void }) {
  const isLocked = (targetTier === 'basic' && tier === 'free') || (targetTier === 'deep' && tier !== 'deep')
  if (!isLocked) return null

  const isDeep = targetTier === 'deep'

  return (
    <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-10"
      style={{ background: 'rgba(9,8,15,0.86)', backdropFilter: 'blur(8px)' }}>
      <div className="text-center px-6">
        <div className="text-2xl mb-2">{isDeep ? '🔬' : '🔍'}</div>
        <p className="font-semibold mb-1">{isDeep ? '심층 분석 전용' : '기본 분석 전용'}</p>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          {isDeep
            ? '심층 분석(8,900원)에서 20개 추가 질문 후 확인'
            : '기본 분석(4,900원) 이상에서 확인 가능'}
        </p>
        <button
          onClick={() => {
            trackUpgradeClick(targetTier).catch(() => {})
            // 목 결제: sessionStorage 업데이트 후 새로고침
            if (isDeep) {
              sessionStorage.setItem('result_tier', 'deep_purchased')
              window.location.href = '/deep'
            } else {
              sessionStorage.setItem('result_tier', 'basic')
              window.location.reload()
            }
          }}
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
          style={{ background: isDeep ? 'linear-gradient(135deg, #7c4dcc, #9b72e8)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {isDeep ? '심층 분석 시작 (8,900원)' : '기본 분석 잠금 해제 (4,900원)'}
        </button>
        {isDeep && tier === 'free' && (
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            또는 기본 분석(4,900원)을 먼저 구매하세요
          </p>
        )}
      </div>
    </div>
  )
}

function ScoreBar({ value, color = 'linear-gradient(90deg, #7c3aed, var(--accent2))' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export default function ResultPage() {
  const router = useRouter()
  const [output, setOutput] = useState<ScoringOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<Tier>('free')
  const [deepAnswers, setDeepAnswers] = useState<Record<string, string | number> | undefined>(undefined)
  const [revealStep, setRevealStep] = useState(0) // 0=hidden 1=archetype 2=mode 3=drive 4=full

  useEffect(() => {
    const raw = sessionStorage.getItem('test_answers')
    if (!raw) { setLoading(false); return }

    const savedTier = sessionStorage.getItem('result_tier')
    if (savedTier === 'ai') setTier('ai')
    else if (savedTier === 'deep') setTier('deep')
    else if (savedTier === 'basic') setTier('basic')

    const deepRaw = sessionStorage.getItem('deep_answers')
    if (deepRaw) {
      try { setDeepAnswers(JSON.parse(deepRaw)) } catch { /* ignore */ }
    }

    let answers: Answer[]
    try { answers = JSON.parse(raw) } catch { setLoading(false); return }
    const scored = scoreAnswers(answers)
    completeTestSession(scored.result, scored.facets, scored.cogScore, scored.life).catch(() => {})
    trackResultView(scored.result.profileId).catch(() => {})
    initScrollDepthTracking('free-result')

    setTimeout(() => {
      setOutput(scored)
      setLoading(false)
      // 순차 리빌 — 각 레이어를 600ms 간격으로 공개
      setTimeout(() => setRevealStep(1), 400)
      setTimeout(() => setRevealStep(2), 1100)
      setTimeout(() => setRevealStep(3), 1800)
      setTimeout(() => setRevealStep(4), 2500)
    }, 1400)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <div className="text-center">
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>심리 프로파일 분석 중</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>192개 프로파일과 대조하는 중...</p>
        </div>
      </main>
    )
  }

  if (!output) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>테스트 결과를 찾을 수 없습니다.</p>
        <Link href="/test" className="btn-ghost text-sm" style={{ textDecoration: 'none' }}>테스트 다시 시작</Link>
      </main>
    )
  }

  const { result, facets, cogScore, life, consistencyScore } = output
  const lifeMap = life as Record<string, string>

  const fm: FacetMap = {
    curiosity: facets['curiosity'] ?? 3,
    diligence: facets['diligence'] ?? 3,
    anxiety: facets['anxiety'] ?? 3,
    boldness: facets['boldness'] ?? 3,
    humility: facets['humility'] ?? 3,
    patience: facets['patience'] ?? 3,
  }

  const narrative = computeNarrative(fm, cogScore)
  const workStyle = computeWorkStyle(fm, cogScore)
  const investment = computeInvestmentProfile(fm, cogScore)
  const charStrengths = computeCharacterStrengths(fm, cogScore).slice(0, 5)
  const leadership = computeLeadershipStyle(fm, cogScore, deepAnswers)
  const burnout = computeBurnoutRisk(fm, lifeMap, deepAnswers)
  const values = computeValuesProfile(fm, deepAnswers)
  const lifeBalance = computeLifeBalance(fm, lifeMap, deepAnswers)
  const riasec = computeRiasec(fm)

  const cog = cogLabel(cogScore)
  const sortedFacets = Object.entries(facets).filter(([k]) => FACET_META[k]).sort((a, b) => b[1] - a[1])

  const isFeedbackMode = process.env.NEXT_PUBLIC_FEEDBACK_MODE === 'true'

  const effectiveTier: Tier = isFeedbackMode ? 'deep' : tier
  const isBasic = effectiveTier === 'basic' || effectiveTier === 'deep' || effectiveTier === 'ai'
  const isDeep = effectiveTier === 'deep' || effectiveTier === 'ai'
  const isAI = !isFeedbackMode && effectiveTier === 'ai'

  return (
    <main className="min-h-screen px-4 py-12 flex flex-col items-center page-top">
      <div className="w-full max-w-2xl space-y-5">

        {/* ═══════════════════════════════
            무료 구간 — 항상 표시
        ═══════════════════════════════ */}

        {/* 핵심 요약 헤더 */}
        <div className="text-center pt-8 pb-4 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(160,126,224,0.10) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--accent2)' }}>분석 완료</p>
            <div className="flex justify-center mb-6">
              <RadarChart
                size={280}
                axes={[
                  { label: '개방성', value: facetPct(fm.curiosity) },
                  { label: '성실성', value: facetPct(fm.diligence) },
                  { label: '대담성', value: facetPct(fm.boldness) },
                  { label: '겸손성', value: facetPct(fm.humility) },
                  { label: '감수성', value: facetPct(fm.anxiety) },
                  { label: '공감력', value: facetPct(fm.patience) },
                ]}
              />
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>당신의 Big Five × 사고 방식 × 핵심 동력이 아래에 공개됩니다</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {result.dominantTraits.map(t => (
                <span key={t} className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(160,126,224,0.15)', color: 'var(--accent2)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 3-레이어 순차 공개 ═══ */}
        {result.archetype && (
          <div className="space-y-3">
            {/* 레이어 1: 원형 */}
            <div
              className="rounded-2xl overflow-hidden transition-all duration-700"
              style={{
                opacity: revealStep >= 1 ? 1 : 0,
                transform: revealStep >= 1 ? 'translateY(0)' : 'translateY(16px)',
                border: '1px solid rgba(160,126,224,0.35)',
                background: 'linear-gradient(135deg, rgba(124,77,204,0.12) 0%, rgba(160,126,224,0.06) 100%)',
              }}
            >
              <div className="px-5 py-4">
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--accent2)', opacity: 0.7 }}>Layer 1 · 원형 (Archetype)</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{ARCHETYPE_META[result.archetype]?.icon}</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{ARCHETYPE_META[result.archetype]?.label}</span>
                </div>
                {result.light && (
                  <p className="text-sm leading-relaxed mb-2" style={{ color: '#c4b5fd' }}>
                    ✦ {result.light}
                  </p>
                )}
                {result.shadow && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    ◈ {result.shadow}
                  </p>
                )}
              </div>
            </div>

            {/* 레이어 2: 인지 모드 */}
            {result.mode && (() => {
              const m = MODE_META[result.mode]
              return (
                <div
                  className="rounded-2xl px-5 py-4 transition-all duration-700"
                  style={{
                    opacity: revealStep >= 2 ? 1 : 0,
                    transform: revealStep >= 2 ? 'translateY(0)' : 'translateY(16px)',
                    border: `1px solid ${m.color}40`,
                    background: `${m.color}0d`,
                  }}
                >
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: m.color, opacity: 0.8 }}>Layer 2 · 사고 방식 (Mode)</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <span className="text-xl font-bold" style={{ color: m.color }}>{m.label}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{m.desc}</p>
                </div>
              )
            })()}

            {/* 레이어 3: 핵심 동력 */}
            {result.drive && (() => {
              const d = DRIVE_META[result.drive]
              return (
                <div
                  className="rounded-2xl px-5 py-4 transition-all duration-700"
                  style={{
                    opacity: revealStep >= 3 ? 1 : 0,
                    transform: revealStep >= 3 ? 'translateY(0)' : 'translateY(16px)',
                    border: `1px solid ${d.color}40`,
                    background: `${d.color}0d`,
                  }}
                >
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: d.color, opacity: 0.8 }}>Layer 3 · 핵심 동력 (Drive)</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xl font-bold" style={{ color: d.color }}>{d.label}</span>
                  </div>
                  <p className="text-sm italic" style={{ color: 'var(--muted)' }}>"{d.motivation}"</p>
                </div>
              )
            })()}

            {/* 최종 합성 배너 */}
            <div
              className="rounded-2xl px-5 py-5 text-center transition-all duration-700"
              style={{
                opacity: revealStep >= 4 ? 1 : 0,
                transform: revealStep >= 4 ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
                background: 'linear-gradient(135deg, rgba(124,77,204,0.18), rgba(201,168,248,0.08))',
                border: '1px solid rgba(160,126,224,0.45)',
              }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--accent2)', opacity: 0.6 }}>
                {result.archetype && ARCHETYPE_META[result.archetype]?.label}
                {result.mode && ` × ${MODE_META[result.mode]?.label}`}
                {result.drive && ` × ${DRIVE_META[result.drive]?.label}`}
              </p>
              <p className="text-xl font-bold gradient-text">"{result.profileLabel}"</p>
              {result.shortDesc && (
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{result.shortDesc}</p>
              )}
            </div>
          </div>
        )}

        {/* 내러티브 */}
        <div className="glass rounded-2xl p-6" style={{ borderColor: 'rgba(160,126,224,0.25)' }}>
          <p className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: 'var(--accent2)' }}>당신은 이러한 경향이 있습니다</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.85 }}>{narrative}</p>
        </div>

        {/* HEXACO 6 패싯 바 */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm">핵심 성격 6차원</h2>
            {(() => {
              const cs = consistencyScore ?? 0
              const isGood = cs <= 1.2
              const isMid  = cs <= 2.5
              const label  = isGood ? '응답 일관성 높음' : isMid ? '응답 일관성 보통' : '응답 비일관 의심'
              const color  = isGood ? '#34d399' : isMid ? '#f59e0b' : '#f87171'
              const icon   = isGood ? '✓' : isMid ? '△' : '!'
              return (
                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                  <span>{icon}</span>{label}
                </span>
              )
            })()}
          </div>
          <div className="space-y-5">
            {sortedFacets.map(([key, score], idx) => {
              const meta = FACET_META[key]
              if (!meta) return null
              const level = facetLevel(score)
              const pct = facetPct(score)
              const levelColor = level === 'high' ? '#a78bfa' : level === 'low' ? '#9ca3af' : '#6b7280'
              const isLast = idx === sortedFacets.length - 1
              return (
                <div key={key} className="pb-2" style={isLast ? {} : { borderBottom: '1px solid var(--border)' }}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{meta.label}</span>
                    <span style={{ color: levelColor }}>{pct}%</span>
                  </div>
                  <ScoreBar value={pct} color={`linear-gradient(90deg, ${levelColor}88, ${levelColor})`} />
                  {/* 하위 요인 칩 */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meta.subFacets.map(sf => (
                      <span key={sf} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${levelColor}14`, color: levelColor, border: `1px solid ${levelColor}30` }}>
                        {sf}
                      </span>
                    ))}
                  </div>
                  {/* 수준별 설명 */}
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>{meta[level]}</p>
                  {/* 하위 요인 주석 */}
                  <p className="text-xs mt-1.5 leading-relaxed italic" style={{ color: 'var(--muted)', opacity: 0.6 }}>* {meta.subFacetNote}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 인지 수준 */}
        <div className="glass rounded-2xl p-5 flex items-center gap-5">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center" style={{ background: `${cog.color}22` }}>
            <span className="text-xs font-semibold" style={{ color: cog.color }}>인지</span>
            <span className="text-base font-bold" style={{ color: cog.color }}>{cog.label}</span>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">사고 스타일</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.cognitiveStyle}</p>
          </div>
        </div>

        {/* Holland RIASEC 직업흥미 추정 */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <span>🧭</span> 직업흥미 유형
              <span className="text-xs font-normal px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(107,114,128,0.15)', color: 'var(--muted)' }}>추정</span>
            </h2>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Holland RIASEC</span>
          </div>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {riasec.summary}
          </p>
          <div className="space-y-2 mb-4">
            {riasec.scores.map(s => (
              <div key={s.type}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold" style={{ color: s.color }}>{s.type}</span>
                    <span style={{ color: 'var(--text)' }}>{s.label}</span>
                  </span>
                  <span style={{ color: s.color }}>{s.score}%</span>
                </div>
                <ScoreBar value={s.score} color={s.color} />
              </div>
            ))}
          </div>
          <p className="text-xs italic leading-relaxed" style={{ color: 'var(--muted)', opacity: 0.6 }}>
            * 성격 패싯에서 추정한 간접 측정값입니다. 유료 검사에서는 18문항으로 직접 측정합니다.
          </p>
        </div>

        {/* 진로 TOP 2 미리보기 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><span>🎯</span> 진로 적합도 (상위 2개 미리보기)</h2>
          <div className="space-y-4">
            {result.careers.slice(0, 2).map(c => (
              <div key={c.title} className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold">{c.title}</span>
                  <span className="font-bold" style={{ color: c.fit >= 90 ? '#c9a8f8' : 'var(--accent2)' }}>{c.fit}%</span>
                </div>
                <ScoreBar value={c.fit} color="linear-gradient(90deg, var(--accent), var(--accent2))" />
                <p className="text-xs mt-2 leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>{c.reason}</p>
                {c.subRoles && c.subRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.subRoles.slice(0, 3).map(role => (
                      <span key={role} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(160,126,224,0.10)', color: 'var(--accent2)', border: '1px solid rgba(160,126,224,0.20)' }}>
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!isBasic && (
              <div className="relative">
                <div className="opacity-20 pointer-events-none space-y-3">
                  {[0, 1, 2].map(i => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1"><span className="blur-sm">██████████</span><span className="blur-sm">██%</span></div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium px-3 py-1 rounded-full glass" style={{ color: 'var(--accent2)' }}>
                    +{result.careers.length - 2}개 — 기본 분석에서 확인
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 업그레이드 CTA (무료 유저) */}
        {!isBasic && (
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,110,240,0.12), rgba(232,121,249,0.06))', border: '1px solid rgba(124,110,240,0.3)' }}>
            <h2 className="font-semibold mb-2">🔍 더 깊이 알고 싶다면</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{result.teaser}</p>
            <ul className="space-y-1.5 text-sm mb-5" style={{ color: 'var(--muted)' }}>
              {['진로 TOP 6 (세부 이유·하위 직군)', '성격 강점 TOP 5 (VIA 기반)', '업무 스타일 심층 분석', '투자 성향 프로파일', '인지능력 상세 해석'].map(item => (
                <li key={item} className="flex items-center gap-2"><span style={{ color: 'var(--accent2)' }}>✓</span>{item}</li>
              ))}
            </ul>
            <button
              onClick={() => {
                trackUpgradeClick('basic_cta').catch(() => {})
                sessionStorage.setItem('result_tier', 'basic')
                window.location.reload()
              }}
              className="block w-full py-3.5 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c6ef0, #a78bfa)' }}
            >
              기본 분석 잠금 해제 (4,900원) →
            </button>
            <button
              onClick={() => {
                trackUpgradeClick('deep_cta').catch(() => {})
                sessionStorage.setItem('result_tier', 'deep_purchased')
                window.location.href = '/deep'
              }}
              className="block w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all mt-2"
              style={{ background: 'rgba(124,77,204,0.15)', color: 'var(--accent2)', border: '1px solid rgba(124,110,240,0.3)' }}
            >
              심층 분석도 함께 (8,900원 — 20개 추가 질문)
            </button>
          </div>
        )}

        {/* ═══════════════════════════════
            기본 분석 구간
        ═══════════════════════════════ */}

        {isBasic && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,77,204,0.2)', color: 'var(--accent2)' }}>기본 분석</span>
              </div>
              <h2 className="text-xl font-bold">진로 적합도 TOP 6</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>당신의 성격·인지 점수와 각 직군의 성공 패턴을 대조한 결과입니다.</p>
            </div>

            {/* 진로 TOP 6 */}
            <div className="space-y-4">
              {result.careers.slice(0, 6).map((c, i) => (
                <div key={c.title} className="glass rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: i < 3 ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)', color: i < 3 ? '#fff' : 'var(--muted)' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{c.title}</span>
                        <span className="font-bold text-sm ml-2" style={{ color: c.fit >= 90 ? '#c9a8f8' : 'var(--accent2)' }}>{c.fit}%</span>
                      </div>
                      <ScoreBar value={c.fit} color="linear-gradient(90deg, var(--accent), var(--accent2))" />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>{c.reason}</p>
                  {c.detail && <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)', opacity: 0.8 }}>{c.detail}</p>}
                  {c.subRoles && c.subRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.subRoles.map(role => (
                        <span key={role} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(160,126,224,0.10)', color: 'var(--accent2)', border: '1px solid rgba(160,126,224,0.20)' }}>
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

            {/* 적합하지 않은 직업 */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(107,114,128,0.06)', border: '1px solid rgba(107,114,128,0.18)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>나와 맞지 않는 직업</p>
              <div className="space-y-3">
                {result.careers.slice(-3).reverse().map((c) => (
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

            {/* 성격 강점 TOP 5 */}
            <div className="pt-4 pb-1">
              <h2 className="text-xl font-bold mb-1">성격 강점 TOP 5</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>VIA(Values in Action) 기반 — 당신의 점수에서 가장 두드러지는 강점들입니다.</p>
            </div>
            <div className="space-y-3">
              {charStrengths.map((s, i) => (
                <div key={s.name} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{s.name}</span>
                        {i === 0 && <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(251,191,36,0.2)', color: '#f59e0b' }}>핵심 강점</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{s.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{s.howItShows}</p>
                </div>
              ))}
            </div>

            {/* 업무 스타일 */}
            <div className="pt-4 pb-1">
              <h2 className="text-xl font-bold mb-1">업무 스타일 분석</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>HEXACO 직업심리 연구 기반 — 이 성격 유형에서 성과가 높게 나타나는 업무 환경과 방식입니다.</p>
            </div>
            <div className="glass rounded-2xl p-6 space-y-5">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="text-xs font-semibold mb-3" style={{ color: '#34d399' }}>✓ 업무 강점</p>
                <ul className="space-y-2">
                  {workStyle.strengths.map(s => (
                    <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-xs font-semibold mb-3" style={{ color: '#f59e0b' }}>⚠ 주의사항</p>
                <ul className="space-y-2">
                  {workStyle.watchouts.map(w => (
                    <li key={w} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: '#f59e0b', flexShrink: 0 }}>·</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 인지 상세 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><span>🧠</span> 인지 능력 상세</h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${cog.color}22`, border: `1px solid ${cog.color}44` }}>
                  <span className="text-xs" style={{ color: cog.color }}>수준</span>
                  <span className="text-lg font-bold" style={{ color: cog.color }}>{cog.label}</span>
                  <span className="text-xs" style={{ color: cog.color }}>{Math.round(cogScore * 100)}점</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{result.cognitiveStyle}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {cogScore >= 0.8 ? '상위 10%에 해당하는 인지 수행 수준입니다. 복잡한 문제 해결과 빠른 학습에서 강점이 나타납니다.'
                     : cogScore >= 0.6 ? '평균 이상의 인지 처리 능력을 보이며, 논리적 분석과 패턴 인식에서 안정적 수행을 보입니다.'
                     : cogScore >= 0.4 ? '전형적인 인지 수행 범위에 있습니다. 충분한 집중과 연습으로 높은 수행이 가능합니다.'
                     : '비언어적, 경험 기반 지식에서 강점이 나타날 수 있습니다. 지필 형태의 인지 테스트가 실제 능력을 온전히 반영하지 않을 수 있습니다.'}
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)', opacity: 0.6 }}>* 이 결과는 5개 문항 기반으로 참고용입니다. IQ 측정이 아닙니다.</p>
            </div>

            {/* 투자 성향 */}
            <div className="pt-4 pb-1">
              <h2 className="text-xl font-bold mb-1">투자 성향 분석</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>행동재무학 연구 기반 성격-투자행동 분석입니다. 금융 조언이 아닌 성향 참고 자료입니다.</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${investment.riskColor}18`, border: `1px solid ${investment.riskColor}44` }}>
                  <span className="text-xs font-medium" style={{ color: investment.riskColor }}>성향</span>
                  <span className="text-xs font-bold text-center leading-tight mt-0.5" style={{ color: investment.riskColor }}>{investment.riskLabel.replace('·', '\n')}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{investment.riskRationale}</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: '📅 권장 투자 기간', text: investment.horizon },
                  { label: '📊 핵심 투자 스타일', text: investment.style },
                  { label: '🧠 행동 편향 주의', text: investment.behavioralBias },
                  { label: '💡 이 유형의 핵심 원칙', text: investment.principle },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>{item.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="text-xs font-semibold mb-3" style={{ color: '#34d399' }}>✓ 성격에 맞는 투자</p>
                <ul className="space-y-2">
                  {investment.suitable.map(s => (
                    <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#34d399', flexShrink: 0 }}>·</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-xs font-semibold mb-3" style={{ color: '#f87171' }}>✗ 피해야 할 것</p>
                <ul className="space-y-2">
                  {investment.avoid.map(a => (
                    <li key={a} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#f87171', flexShrink: 0 }}>·</span>{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 심층 분석 CTA */}
            {!isDeep && (
              <div className="rounded-2xl p-6 relative overflow-hidden mt-4"
                style={{ background: 'linear-gradient(135deg, rgba(124,77,204,0.15), rgba(155,114,232,0.08))', border: '1px solid rgba(124,77,204,0.35)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔬</span>
                  <h2 className="font-semibold">심층 분석으로 더 알아보기</h2>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>20개 추가 질문(약 5분)으로 아래 4가지 심층 프로파일을 추가로 받아보세요.</p>
                <ul className="space-y-1.5 text-sm mb-5" style={{ color: 'var(--muted)' }}>
                  {['애착 유형 분석 (안정/불안/회피/혼란형)', '리더십 스타일 프로파일', '번아웃 리스크 측정 + 예방 전략', '핵심 가치관 프로파일', '삶의 균형 레이더'].map(item => (
                    <li key={item} className="flex items-center gap-2"><span style={{ color: 'var(--accent2)' }}>✓</span>{item}</li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    trackUpgradeClick('deep_from_basic').catch(() => {})
                    sessionStorage.setItem('result_tier', 'deep_purchased')
                    window.location.href = '/deep'
                  }}
                  className="block w-full py-3.5 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c4dcc, #9b72e8)' }}
                >
                  심층 분석 시작 (8,900원) →
                </button>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════
            심층 분석 구간
        ═══════════════════════════════ */}

        {isDeep && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,77,204,0.2)', color: 'var(--accent2)' }}>심층 분석</span>
              </div>
              <h2 className="text-xl font-bold">심층 심리 프로파일</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>20개 추가 질문과 기본 점수를 통합한 심층 분석 결과입니다.</p>
            </div>

            {/* 리더십 스타일 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><span>{leadership.icon}</span> 리더십 스타일</h2>
              <p className="font-bold text-lg mb-3">{leadership.style}</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>{leadership.summary}</p>
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#34d399' }}>핵심 강점</p>
                  <ul className="space-y-1">
                    {leadership.strengths.map(s => (
                      <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#34d399' }}>·</span>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>사각지대</p>
                  <ul className="space-y-1">
                    {leadership.blindspots.map(b => (
                      <li key={b} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#f59e0b' }}>·</span>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>최적 환경</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{leadership.bestEnvironment}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>다음 성장 단계</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{leadership.growthEdge}</p>
                </div>
              </div>
            </div>

            {/* 번아웃 리스크 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><span>🔥</span> 번아웃 리스크</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: `${burnout.color}20`, border: `2px solid ${burnout.color}60` }}>
                  <span className="text-xs" style={{ color: burnout.color }}>리스크</span>
                  <span className="text-lg font-bold" style={{ color: burnout.color }}>{burnout.level}</span>
                  <span className="text-xs" style={{ color: burnout.color }}>{burnout.score}점</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{burnout.summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>위험 요인</p>
                  <ul className="space-y-1.5">
                    {burnout.riskFactors.map(r => (
                      <li key={r} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#f87171' }}>·</span>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>보호 요인</p>
                  <ul className="space-y-1.5">
                    {burnout.protectiveFactors.map(p => (
                      <li key={p} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: '#34d399' }}>·</span>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent2)' }}>예방 전략</p>
                <ul className="space-y-2">
                  {burnout.prevention.map((p, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--muted)' }}><span style={{ color: 'var(--accent2)', flexShrink: 0 }}>{i + 1}.</span>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 핵심 가치관 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><span>{values.icon}</span> 핵심 가치관 프로파일</h2>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold">{values.primary}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>+</span>
                <span className="font-semibold" style={{ color: 'var(--accent2)' }}>{values.secondary}</span>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>{values.summary}</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>커리어에서의 의미</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.inCareer}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>관계에서의 의미</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.inRelationships}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(124,77,204,0.10)', border: '1px solid rgba(124,77,204,0.25)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>⚡ 가치 충돌 인사이트</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{values.tension}</p>
                </div>
              </div>
            </div>

            {/* 삶의 균형 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span>⚖️</span> 삶의 균형 분석
                <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{
                  background: lifeBalance.overallBalance === '양호' ? '#34d39920' : lifeBalance.overallBalance === '보통' ? '#f59e0b20' : '#f8717120',
                  color: lifeBalance.overallBalance === '양호' ? '#34d399' : lifeBalance.overallBalance === '보통' ? '#f59e0b' : '#f87171',
                }}>{lifeBalance.overallBalance}</span>
              </h2>
              <div className="space-y-4 mb-4">
                {lifeBalance.domains.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text)' }}><span>{d.icon}</span>{d.name}</span>
                      <span style={{ color: d.score >= 65 ? '#34d399' : d.score >= 45 ? '#f59e0b' : '#f87171' }}>{d.score}점</span>
                    </div>
                    <ScoreBar value={d.score} color={d.score >= 65 ? '#34d399' : d.score >= 45 ? '#f59e0b' : '#f87171'} />
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{d.insight}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent2)' }}>종합 권고</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{lifeBalance.recommendation}</p>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════
            AI 상담 구간
        ═══════════════════════════════ */}

        {/* AI 상담 CTA — 기본 분석 이상 구매자에게 노출 (피드백 모드에서는 숨김) */}
        {!isFeedbackMode && isBasic && !isAI && (
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(124,77,204,0.10))', border: '1px solid rgba(52,211,153,0.3)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🤖</span>
              <h2 className="font-semibold">AI와 결과 대화하기</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>NEW</span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              내 검사 결과를 이미 아는 AI에게 질문하세요. "이 진로가 나한테 왜 맞아?", "내 성격에서 가장 조심해야 할 게 뭐야?" 같은 것들을요.
            </p>
            <ul className="space-y-1.5 text-sm mb-5" style={{ color: 'var(--muted)' }}>
              {['내 점수 기반 개인화 답변 (일반론 X)', '10회 자유 질문', '진로·관계·성장 무엇이든 가능'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span style={{ color: '#34d399' }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                trackUpgradeClick('ai_chat').catch(() => {})
                sessionStorage.setItem('result_tier', 'ai')
                window.location.reload()
              }}
              className="block w-full py-3.5 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}
            >
              AI 상담 시작 (+3,000원) →
            </button>
          </div>
        )}

        {/* AI 채팅 UI (피드백 모드에서는 숨김) */}
        {!isFeedbackMode && isAI && (
          <>
            <div className="pt-2 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>AI 상담</span>
              </div>
              <h2 className="text-xl font-bold">AI 심리 상담</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>검사 결과를 바탕으로 궁금한 것을 자유롭게 물어보세요.</p>
            </div>
            <ResultChat
              profile={{
                profileLabel: result.profileLabel,
                dominantTraits: result.dominantTraits,
                cognitiveStyle: result.cognitiveStyle,
                cogScore,
                facets,
                careers: result.careers,
                warnings: result.warnings,
                growthDirection: result.growthDirection,
              }}
              deepProfile={deepAnswers ? {
                leadership: { style: leadership.style, summary: leadership.summary },
                burnout: { level: burnout.level, score: burnout.score, summary: burnout.summary },
                values: { primary: values.primary, secondary: values.secondary, summary: values.summary },
              } : undefined}
            />
          </>
        )}

        {/* 유료 정밀 검사 CTA */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.10), rgba(124,58,237,0.10))', border: '1px solid rgba(244,114,182,0.30)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔬</span>
            <h2 className="font-semibold">HEXACO 24 하위 요인 정밀 분석</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: 'rgba(244,114,182,0.20)', color: '#f472b6' }}>PRO</span>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            무료 검사가 6개 요인을 측정했다면, 정밀 검사는 24개 하위 요인까지 분해합니다. Holland RIASEC 직접 측정 + 문·이과·공학·경상 학문 적성 분석도 포함합니다.
          </p>
          <ul className="space-y-1.5 text-sm mb-5" style={{ color: 'var(--muted)' }}>
            {[
              'HEXACO 24 하위 요인 상세 (겸손·진실성·공정성·탐구심·창의성 등)',
              'Holland RIASEC 직접 측정 — 직업흥미 6유형 정확한 프로파일',
              '문과·이과·공학·경상 학문 적성 분류',
              '82문항 · 약 15분',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span style={{ color: '#f472b6' }}>✓</span>{item}
              </li>
            ))}
          </ul>
          <a
            href="/paid"
            onClick={() => trackUpgradeClick('paid_test_cta').catch(() => {})}
            className="block w-full py-3.5 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #be185d, #7c3aed)' }}
          >
            정밀 심층 검사 시작 (9,900원) →
          </a>
        </div>

        {/* 설문 링크 */}
        <div className="rounded-2xl p-5 text-center space-y-2"
          style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>검사 후기를 남겨주세요</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>피드백은 서비스 개선에 직접 반영됩니다.</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfkiZOUy56PQ4gC_V7OjT7hP4NclDGFGOVnjIyVax7SfUwvKg/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-80"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}
          >
            피드백 남기기 →
          </a>
        </div>

        {/* 과학적 면책 문구 */}
        <ScientificDisclaimer profileLabel={result.profileLabel} />

        {/* 공유 + 홈 */}
        <ShareButtons profileLabel={result.profileLabel} profileId={result.profileId} />
        <div className="text-center pb-8">
          <Link href="/" className="text-sm underline" style={{ color: 'var(--muted)' }}>홈으로</Link>
        </div>

      </div>
    </main>
  )
}
