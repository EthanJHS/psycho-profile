'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const INCLUDED = [
  { icon: '🧠', title: 'HEXACO 24 하위 요인 측정', desc: '6개 요인을 각 4개 하위 요인으로 분해. 진실성·공정성·탐구심·미적 감수성·완벽주의 등 24개 축을 개별 측정합니다.' },
  { icon: '🎯', title: 'Holland RIASEC 직접 측정', desc: 'HEXACO에서 추정하는 무료 검사와 달리, 직업흥미를 6유형(현실·탐구·예술·사회·진취·관습) 항목으로 직접 측정합니다.' },
  { icon: '📚', title: '학문 적성 분류', desc: '수리·언어·공간·사회·응용·경영·과학·인문 8개 차원으로 문과/이과/공학/경상/예술/복합 유형을 분류합니다.' },
  { icon: '📊', title: '82문항 Likert 척도', desc: '빠르게 직관적으로 응답하는 5점 척도 방식. 역문항이 포함되어 응답 일관성을 내부적으로 검증합니다.' },
]

const COMPARE = [
  { label: 'HEXACO 6요인', free: true, paid: true },
  { label: '3-레이어 프로파일 (192종)', free: true, paid: true },
  { label: 'Holland RIASEC (추정)', free: true, paid: false },
  { label: 'Holland RIASEC (직접 측정)', free: false, paid: true },
  { label: '24 하위 요인 분석', free: false, paid: true },
  { label: '학문 적성 8차원', free: false, paid: true },
  { label: '하위 요인별 텍스트 해석', free: false, paid: true },
  { label: 'Holland Code 상위 3 조합', free: false, paid: true },
]

const FAQ = [
  { q: '무료 검사와 무엇이 다른가요?', a: '무료 검사는 HEXACO 6요인과 192가지 프로파일을 제공합니다. 정밀 검사는 그 6요인을 각 4개의 하위 요인으로 분해하고 (24개), Holland RIASEC을 추정이 아닌 직접 측정하며, 학문·직업 적성 분류까지 추가됩니다.' },
  { q: '소요 시간은 얼마나 되나요?', a: '82문항이지만 5점 척도라 빠르게 응답할 수 있습니다. 대부분 10~15분 내에 완료합니다.' },
  { q: '결과는 언제 볼 수 있나요?', a: '응답 완료 즉시 결과 페이지가 열립니다. 별도 대기 시간 없습니다.' },
  { q: '무료 검사를 먼저 해야 하나요?', a: '아니요, 정밀 검사는 독립적으로 사용할 수 있습니다. 무료 검사 결과가 있으면 비교해 보기 좋지만 필수는 아닙니다.' },
]

export default function PaidLandingPage() {
  const router = useRouter()

  function handleStart() {
    // TODO: 실제 결제 연동 전까지 직접 검사로 이동
    router.push('/paid-test')
  }

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ paddingBottom: 80 }}>

      {/* 히어로 */}
      <section className="w-full max-w-2xl px-5 pt-16 pb-10 text-center">
        <div className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-5"
          style={{ background: 'rgba(244,114,182,0.15)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.3)', letterSpacing: '0.06em' }}>
          HEXACO 정밀 심층 검사
        </div>
        <h1 className="text-3xl font-extrabold mb-4 leading-tight" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
          무료 검사가 6개 요인을 봤다면,<br />
          <span style={{ color: '#f472b6' }}>정밀 검사는 24개 하위 요인</span>을 봅니다.
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
          탐구심과 미적 감수성은 같은 '개방성'이지만 전혀 다른 사람을 가리킵니다.
          진실성과 공정성은 같은 '겸손성'이지만 다른 윤리 패턴을 드러냅니다.
          더 작은 단위로 쪼갤수록, 당신을 더 정확하게 봅니다.
        </p>
        {/* 베타 안내 배너 */}
        <div className="mt-2 mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
          <span>🧪</span>
          <span>현재 무료 체험 기간 · 정식 출시 전 미리 경험해보세요</span>
        </div>

        <button
          onClick={handleStart}
          className="btn-primary text-base"
          style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #be185d, #7c3aed)', fontSize: '1rem', borderRadius: '14px' }}
        >
          무료로 체험하기 →
        </button>
        <p className="mt-3 text-xs" style={{ color: 'var(--muted2)' }}>82문항 · 약 15분 · 즉시 결과 · 체험 기간 무료</p>

        {/* 가격 */}
        <div className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass">
          <div className="text-left">
            <div className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>정식 출시 예정가</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>9,900원</span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>1회</span>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: '#fbbf2420', color: '#fbbf24' }}>
            지금 무료
          </span>
        </div>
      </section>

      {/* 포함 항목 */}
      <section className="w-full max-w-2xl px-5 mb-10">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>포함 항목</h2>
        <div className="space-y-3">
          {INCLUDED.map(item => (
            <div key={item.title} className="glass rounded-2xl p-4 flex gap-4 items-start">
              <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{item.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 무료 vs 유료 비교표 */}
      <section className="w-full max-w-2xl px-5 mb-10">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>무료 검사와 비교</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-bold py-3 px-4" style={{ background: 'var(--surface2)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <span>항목</span>
            <span className="text-center">무료 검사</span>
            <span className="text-center" style={{ color: '#f472b6' }}>정밀 검사</span>
          </div>
          {COMPARE.map((row, i) => (
            <div key={row.label} className="grid grid-cols-3 text-sm py-3 px-4 items-center"
              style={{ borderBottom: i < COMPARE.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--text)' }}>{row.label}</span>
              <span className="text-center text-lg">{row.free ? '✓' : <span style={{ color: 'var(--border)' }}>—</span>}</span>
              <span className="text-center text-lg">{row.paid ? <span style={{ color: '#f472b6' }}>✓</span> : <span style={{ color: 'var(--border)' }}>—</span>}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-2xl px-5 mb-10">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>자주 묻는 질문</h2>
        <div className="space-y-3">
          {FAQ.map(item => (
            <div key={item.q} className="glass rounded-2xl p-4">
              <p className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>Q. {item.q}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 CTA 고정 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div>
            <div className="text-xs" style={{ color: '#fbbf24' }}>지금 무료 체험</div>
            <div className="text-xs line-through" style={{ color: 'var(--muted)' }}>9,900원</div>
          </div>
          <button
            onClick={handleStart}
            className="btn-primary flex-1"
            style={{ padding: '14px', background: 'linear-gradient(135deg, #be185d, #7c3aed)', justifyContent: 'center', fontSize: '0.9rem' }}
          >
            무료로 체험하기 →
          </button>
        </div>
      </div>

      {/* 홈 링크 */}
      <div className="text-center">
        <Link href="/" className="text-xs underline" style={{ color: 'var(--muted2)' }}>
          무료 검사 먼저 해보기
        </Link>
      </div>

    </main>
  )
}
