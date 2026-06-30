'use client'

import { useState } from 'react'

interface Props {
  profileLabel: string
}

export default function ScientificDisclaimer({ profileLabel }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden print:hidden" style={{ border: '1px solid rgba(160,126,224,0.2)', background: 'rgba(124,77,204,0.06)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🔬</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>이 검사의 과학적 위상에 대하여</span>
        </div>
        <span className="text-xs transition-transform" style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(160,126,224,0.15)' }}>
          <div className="pt-4">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.9 }}>
              <strong style={{ color: 'var(--text)' }}>"{profileLabel}"</strong>는 검증된 심리학 이론을 기반으로 설계된 <strong style={{ color: 'var(--text)' }}>탐색형 자기이해 도구</strong>입니다.
              임상 진단 도구나 IQ 검사가 아닙니다.
            </p>
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface2)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent2)' }}>이론적 기반</p>
            <ul className="space-y-1.5">
              {[
                'Big Five 성격 모델 (NEO-PI-R, Costa & McCrae 1992)',
                '조절 초점 이론 (Regulatory Focus Theory, Higgins 1997)',
                '통제 소재 이론 (Locus of Control, Rotter 1954)',
                '슈워츠 기본 가치 모델 (Basic Values, Schwartz 1992)',
                'HEXACO 겸손-정직 차원 (Ashton & Lee 2009)',
              ].map(t => (
                <li key={t} className="text-xs flex gap-2" style={{ color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--accent2)', flexShrink: 0 }}>·</span>{t}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>강점</p>
              <ul className="space-y-1">
                {[
                  '검증된 이론 기반 문항',
                  '강제선택으로 편향 감소',
                  '3레이어 조합으로 세분화',
                ].map(s => <li key={s} className="text-xs" style={{ color: 'var(--muted)' }}>· {s}</li>)}
              </ul>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#fb923c' }}>현재 한계</p>
              <ul className="space-y-1">
                {[
                  '대규모 표준화 미완료',
                  '패싯당 문항 수 제한',
                  '수렴타당도 연구 진행 중',
                ].map(s => <li key={s} className="text-xs" style={{ color: 'var(--muted)' }}>· {s}</li>)}
              </ul>
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', opacity: 0.7 }}>
            이 결과는 자기 탐색과 대화의 출발점으로 활용하시길 권장합니다.
            임상적 판단이나 채용, 진단 목적으로 사용하지 마세요.
            더 나은 정밀도를 위해 검사를 지속적으로 개선하고 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}
