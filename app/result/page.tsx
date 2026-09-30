'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { scoreAnswers, ScoringOutput } from '@/lib/scoring'
import { completeTestSession, trackResultView, trackUpgradeClick, initScrollDepthTracking } from '@/lib/analytics'
import { Answer } from '@/types'
import ShareButtons from '@/components/ShareButtons'
import SurveySection from '@/components/SurveySection'
import ScientificDisclaimer from '@/components/ScientificDisclaimer'
import { computeNarrative, computeRiasec } from '@/lib/insights'
import { FacetMap } from '@/lib/profiles'
import RadarChart from '@/components/RadarChart'
import ArchetypeCanvas from '@/components/ArchetypeCanvas'

// ─── 원형별 SVG 아트 (레거시 — ArchetypeCanvas로 교체됨) ────────────
function ArchetypeArt({ id }: { id: string }) {
  const arts: Record<string, React.ReactNode> = {
    architect: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c4dcc" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.15"/>
          </linearGradient>
        </defs>
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <line key={`h${i}`} x1="0" y1={22*i+2} x2="400" y2={22*i+2} stroke="#7c4dcc" strokeOpacity="0.18" strokeWidth="0.8"/>
        ))}
        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <line key={`v${i}`} x1={33*i+2} y1="0" x2={33*i+2} y2="200" stroke="#7c4dcc" strokeOpacity="0.18" strokeWidth="0.8"/>
        ))}
        <rect x="60" y="40" width="280" height="120" fill="none" stroke="#a78bfa" strokeOpacity="0.5" strokeWidth="1.5"/>
        <rect x="100" y="70" width="80" height="90" fill="url(#ag1)" stroke="#a78bfa" strokeOpacity="0.7" strokeWidth="1.2"/>
        <rect x="220" y="50" width="60" height="110" fill="url(#ag1)" stroke="#a78bfa" strokeOpacity="0.7" strokeWidth="1.2"/>
        <line x1="60" y1="160" x2="340" y2="160" stroke="#c4b5fd" strokeOpacity="0.8" strokeWidth="2"/>
        <line x1="120" y1="40" x2="120" y2="160" stroke="#c4b5fd" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3"/>
        <line x1="240" y1="40" x2="240" y2="160" stroke="#c4b5fd" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3"/>
        <circle cx="120" cy="70" r="3" fill="#c4b5fd" fillOpacity="0.9"/>
        <circle cx="240" cy="50" r="3" fill="#c4b5fd" fillOpacity="0.9"/>
        <circle cx="280" cy="160" r="3" fill="#c4b5fd" fillOpacity="0.9"/>
      </svg>
    ),
    guardian: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="gg1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#34d399" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="100" rx="140" ry="90" fill="url(#gg1)"/>
        {[0,1,2,3].map(i => (
          <ellipse key={i} cx="200" cy="100" rx={140-i*28} ry={90-i*18} fill="none" stroke="#34d399" strokeOpacity={0.15+i*0.08} strokeWidth="1"/>
        ))}
        <path d="M200 20 L270 55 L270 115 Q270 155 200 180 Q130 155 130 115 L130 55 Z" fill="none" stroke="#34d399" strokeOpacity="0.7" strokeWidth="2"/>
        <path d="M200 45 L248 70 L248 115 Q248 142 200 158 Q152 142 152 115 L152 70 Z" fill="#34d399" fillOpacity="0.12" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1.2"/>
        <line x1="200" y1="70" x2="200" y2="145" stroke="#34d399" strokeOpacity="0.6" strokeWidth="1.5"/>
        <line x1="175" y1="100" x2="225" y2="100" stroke="#34d399" strokeOpacity="0.6" strokeWidth="1.5"/>
      </svg>
    ),
    explorer: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="eg1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.05"/>
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        <circle cx="200" cy="100" r="80" fill="none" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1.5"/>
        <circle cx="200" cy="100" r="80" fill="url(#eg1)"/>
        {[0,30,60,90,120,150].map(deg => {
          const rad = (deg * Math.PI) / 180
          return <line key={deg} x1="200" y1="100" x2={200+80*Math.cos(rad)} y2={100+80*Math.sin(rad)} stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="0.8"/>
        })}
        <line x1="200" y1="20" x2="200" y2="180" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1"/>
        <line x1="120" y1="100" x2="280" y2="100" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1"/>
        <polygon points="200,30 206,48 200,44 194,48" fill="#fbbf24" fillOpacity="0.9"/>
        <circle cx="200" cy="100" r="5" fill="#fbbf24" fillOpacity="0.8"/>
        <path d="M140 130 Q170 80 200 100 Q230 120 280 70" fill="none" stroke="#fbbf24" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="280" cy="70" r="4" fill="#fbbf24" fillOpacity="0.9"/>
      </svg>
    ),
    prophet: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="pg1" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="80" rx="120" ry="80" fill="url(#pg1)"/>
        {[40,60,80,100,120,140,160].map((r,i) => (
          <circle key={i} cx="200" cy="80" r={r} fill="none" stroke="#c084fc" strokeOpacity={Math.max(0.05,0.3-i*0.04)} strokeWidth="0.8"/>
        ))}
        <polygon points="200,15 207,38 230,38 213,52 220,75 200,62 180,75 187,52 170,38 193,38" fill="#c084fc" fillOpacity="0.8" stroke="#e879f9" strokeWidth="1"/>
        {[0,45,90,135,180,225,270,315].map(deg => {
          const rad = deg*Math.PI/180
          return <line key={deg} x1={200+60*Math.cos(rad)} y1={80+60*Math.sin(rad)} x2={200+130*Math.cos(rad)} y2={80+130*Math.sin(rad)} stroke="#c084fc" strokeOpacity="0.2" strokeWidth="0.7"/>
        })}
        <path d="M80 160 Q140 130 200 150 Q260 170 320 140" fill="none" stroke="#c084fc" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="6 4"/>
      </svg>
    ),
    warrior: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="wg1" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        <polygon points="200,10 390,190 10,190" fill="url(#wg1)" stroke="#f87171" strokeOpacity="0.4" strokeWidth="1.5"/>
        <polygon points="200,40 350,170 50,170" fill="none" stroke="#f87171" strokeOpacity="0.25" strokeWidth="1"/>
        <polygon points="200,70 310,160 90,160" fill="none" stroke="#f87171" strokeOpacity="0.15" strokeWidth="0.8"/>
        <line x1="200" y1="10" x2="200" y2="185" stroke="#f87171" strokeOpacity="0.5" strokeWidth="1.5"/>
        <line x1="125" y1="100" x2="275" y2="100" stroke="#f87171" strokeOpacity="0.35" strokeWidth="1"/>
        <circle cx="200" cy="10" r="5" fill="#f87171" fillOpacity="0.9"/>
        <line x1="200" y1="15" x2="200" y2="40" stroke="#fca5a5" strokeOpacity="0.7" strokeWidth="2"/>
      </svg>
    ),
    seeker: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="alg1" cx="50%" cy="70%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3"/>
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="140" rx="80" ry="50" fill="url(#alg1)"/>
        <path d="M170 80 L155 140 Q155 175 200 175 Q245 175 245 140 L230 80 Z" fill="none" stroke="#fbbf24" strokeOpacity="0.6" strokeWidth="1.5"/>
        <path d="M162 110 L238 110" stroke="#fbbf24" strokeOpacity="0.3" strokeWidth="1"/>
        <rect x="175" y="50" width="50" height="30" rx="3" fill="none" stroke="#a78bfa" strokeOpacity="0.6" strokeWidth="1.5"/>
        <circle cx="180" cy="150" r="6" fill="#fbbf24" fillOpacity="0.7"/>
        <circle cx="210" cy="158" r="4" fill="#fbbf24" fillOpacity="0.5"/>
        <circle cx="225" cy="145" r="5" fill="#a78bfa" fillOpacity="0.6"/>
        {[0,1,2].map(i => (
          <path key={i} d={`M${195+i*5} 80 Q${185+i*8} 70 ${190+i*6} 60`} fill="none" stroke="#fbbf24" strokeOpacity={0.5-i*0.1} strokeWidth="1.2"/>
        ))}
      </svg>
    ),
    sovereign: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="sg1" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="60" rx="150" ry="70" fill="url(#sg1)"/>
        {[50,70,90,110,130].map((r,i) => (
          <circle key={i} cx="200" cy="100" r={r} fill="none" stroke="#fbbf24" strokeOpacity={0.1+i*0.05} strokeWidth="0.8"/>
        ))}
        <path d="M155 75 L165 45 L180 65 L200 30 L220 65 L235 45 L245 75 L155 75Z" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" strokeOpacity="0.8" strokeWidth="1.5"/>
        <rect x="160" y="75" width="80" height="12" fill="#fbbf24" fillOpacity="0.4" stroke="#fbbf24" strokeOpacity="0.6" strokeWidth="1"/>
        <rect x="155" y="145" width="90" height="15" rx="2" fill="none" stroke="#fbbf24" strokeOpacity="0.5" strokeWidth="1.2"/>
        <line x1="200" y1="87" x2="200" y2="145" stroke="#fbbf24" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="5 3"/>
      </svg>
    ),
    sage: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sag1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={60+i*5} y={30+i*28} width={280-i*10} height={22} rx="2" fill={i===0?"#38bdf8":undefined} fillOpacity={i===0?0.2:0} stroke="#38bdf8" strokeOpacity={0.5-i*0.07} strokeWidth={i===0?1.5:1}/>
        ))}
        <circle cx="90" cy="165" r="18" fill="none" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5"/>
        <circle cx="90" cy="165" r="10" fill="#38bdf8" fillOpacity="0.2"/>
        <line x1="108" y1="165" x2="340" y2="165" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1"/>
        <line x1="108" y1="158" x2="280" y2="158" stroke="#38bdf8" strokeOpacity="0.2" strokeWidth="0.8"/>
        <circle cx="200" cy="41" r="3" fill="#38bdf8" fillOpacity="0.8"/>
      </svg>
    ),
    harmonizer: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="hg1" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.1"/>
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="200" fill="url(#hg1)"/>
        {[0,1,2,3,4].map(i => {
          const amp = 30-i*4, freq = 0.02+i*0.003, phase = i*0.8
          const pts = Array.from({length:80},(_,x)=>`${x*5},${100+amp*Math.sin(x*freq*Math.PI+phase)}`).join(' ')
          return <polyline key={i} points={pts} fill="none" stroke={['#34d399','#a78bfa','#38bdf8','#34d399','#a78bfa'][i]} strokeOpacity={0.5-i*0.05} strokeWidth={2-i*0.2}/>
        })}
        <circle cx="200" cy="100" r="20" fill="none" stroke="#a78bfa" strokeOpacity="0.6" strokeWidth="1.5"/>
        <circle cx="200" cy="100" r="5" fill="#a78bfa" fillOpacity="0.7"/>
      </svg>
    ),
    rebel: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="rg1" cx="50%" cy="60%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="120" rx="160" ry="70" fill="url(#rg1)"/>
        <path d="M60 160 L100 80 L140 130 L170 60 L200 110 L230 40 L260 100 L300 50 L340 120" fill="none" stroke="#f97316" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {[[100,80],[140,130],[170,60],[200,110],[230,40],[260,100],[300,50]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#f97316" fillOpacity="0.7"/>
        ))}
        <path d="M150 180 L185 100 L200 140 L215 80 L250 180" fill="#f97316" fillOpacity="0.08" stroke="none"/>
        <line x1="40" y1="170" x2="360" y2="170" stroke="#f97316" strokeOpacity="0.25" strokeWidth="1"/>
      </svg>
    ),
    lover: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="lg1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="100" rx="150" ry="90" fill="url(#lg1)"/>
        {[0,1,2].map(i => (
          <path key={i} d={`M200 ${75+i*8} C${170-i*10} ${45+i*8} ${130-i*10} ${75+i*8} ${130-i*10} ${100+i*8} C${130-i*10} ${130+i*8} ${200} ${155+i*8} ${200} ${155+i*8} C${200} ${155+i*8} ${270+i*10} ${130+i*8} ${270+i*10} ${100+i*8} C${270+i*10} ${75+i*8} ${230+i*10} ${45+i*8} ${200} ${75+i*8}Z`}
            fill="none" stroke="#f472b6" strokeOpacity={0.55-i*0.15} strokeWidth={2-i*0.4}/>
        ))}
        <path d="M200 85 C185 65 155 75 155 95 C155 120 200 148 200 148 C200 148 245 120 245 95 C245 75 215 65 200 85Z" fill="#f472b6" fillOpacity="0.2" stroke="#f472b6" strokeOpacity="0.6" strokeWidth="1.5"/>
      </svg>
    ),
    catalyst: (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="cg1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.5"/>
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="100" rx="100" ry="80" fill="url(#cg1)"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i) => {
          const rad = deg*Math.PI/180
          const r1 = i%2===0 ? 30 : 20, r2 = i%2===0 ? 150 : 130
          return <line key={deg} x1={200+r1*Math.cos(rad)} y1={100+r1*Math.sin(rad)} x2={200+r2*Math.cos(rad)} y2={100+r2*Math.sin(rad)} stroke={i%2===0?"#facc15":"#f97316"} strokeOpacity={i%2===0?0.7:0.35} strokeWidth={i%2===0?1.8:0.8}/>
        })}
        <circle cx="200" cy="100" r="25" fill="#facc15" fillOpacity="0.25" stroke="#facc15" strokeOpacity="0.8" strokeWidth="2"/>
        <circle cx="200" cy="100" r="10" fill="#facc15" fillOpacity="0.6"/>
        <path d="M200 75 L207 93 L225 93 L211 104 L216 122 L200 112 L184 122 L189 104 L175 93 L193 93Z" fill="#facc15" fillOpacity="0.9"/>
      </svg>
    ),
  }
  return (
    <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {arts[id] ?? null}
      </div>
    </div>
  )
}

// ─── 점수 모순 카드 ──────────────────────────────────────────────────
type FacetKey = 'openness' | 'conscientiousness' | 'extraversion' | 'honesty' | 'emotionality' | 'agreeableness'

interface Paradox { trigger: string; body: string; question: string }

function computeParadox(fm: Record<FacetKey, number>, drive?: string, archetype?: string): Paradox | null {
  const pct = (v: number) => Math.round(((v - 1) / 4) * 100)
  const O = pct(fm.openness), C = pct(fm.conscientiousness), X = pct(fm.extraversion)
  const H = pct(fm.honesty), E = pct(fm.emotionality), A = pct(fm.agreeableness)

  // 조합 우선순위 — 가장 극단적인 모순부터
  if (O >= 70 && A <= 35)
    return { trigger: `개방성 ${O}% · 원만성 ${A}%`, body: '새로운 아이디어엔 누구보다 열렬하게 반응하지만, 그 아이디어를 가져온 사람은 금방 무시합니다.', question: '당신의 열정이 관계를 어떻게 소진시키는지 알고 있나요?' }
  if (C >= 70 && E >= 65)
    return { trigger: `성실성 ${C}% · 정서성 ${E}%`, body: '완벽을 향해 달리면서, 결과가 나오기도 전에 이미 불안에 잠식됩니다.', question: '기준이 높을수록 더 불안해지는 이유는 무엇일까요?' }
  if (A <= 30 && C >= 65)
    return { trigger: `원만성 ${A}% · 성실성 ${C}%`, body: '높은 기준을 가진 당신이 타인의 낮은 기준을 용납하지 못해, 조용히 관계를 소진시킵니다.', question: '당신 주변 사람들이 지쳐가는 걸 알아채고 있나요?' }
  if (drive === 'connection' && E >= 65)
    return { trigger: `핵심 동력: 연결 · 정서성 ${E}%`, body: '연결을 가장 원하는 사람이, 상처받을까봐 가장 먼저 문을 닫아버립니다.', question: '가장 원하는 것을 스스로 막고 있지는 않나요?' }
  if (drive === 'achievement' && A <= 40)
    return { trigger: `핵심 동력: 성취 · 원만성 ${A}%`, body: '목표를 향해 달리는 사이, 당신 곁에 있던 사람들이 조용히 떠납니다.', question: '정상에 도달했을 때 옆에 누가 있을까요?' }
  if (O >= 70 && C <= 40)
    return { trigger: `개방성 ${O}% · 성실성 ${C}%`, body: '아이디어는 끝없이 솟아나지만, 완성된 것은 손에 꼽습니다.', question: '당신의 아이디어가 서랍 속에서 잠드는 이유는 무엇인가요?' }
  if (X >= 65 && H <= 40)
    return { trigger: `외향성 ${X}% · 정직-겸손 ${H}%`, body: '사람들을 자연스럽게 끌어당기지만, 정작 진심은 좀처럼 드러내지 않습니다.', question: '당신을 아는 사람 중 진짜 당신을 아는 사람은 몇 명인가요?' }
  if (A >= 70 && X <= 35)
    return { trigger: `원만성 ${A}% · 외향성 ${X}%`, body: '모든 사람을 배려하면서, 정작 자신의 필요는 끝까지 말하지 못합니다.', question: '당신을 배려해주는 사람은 당신의 필요를 알고 있나요?' }
  if (archetype === 'rebel' && H >= 60)
    return { trigger: `원형: 반항아 · 정직-겸손 ${H}%`, body: '규칙을 거부하면서도, 자신만의 엄격한 기준 안에 스스로를 가두고 있습니다.', question: '당신의 반항은 진짜 자유를 향하고 있나요?' }
  // 기본 fallback
  if (E >= 65 && C >= 65)
    return { trigger: `성실성 ${C}% · 정서성 ${E}%`, body: '가장 열심히 하는 사람이 가장 쉽게 무너집니다.', question: '지금 당신의 에너지는 어디서 오고 있나요?' }
  return null
}

// ─── 원형별 그림자(Shadow) 카피 ─────────────────────────────────────
const ARCHETYPE_SHADOW: Record<string, { headline: string; body: string }> = {
  architect:   { headline: '완벽주의의 감옥', body: '끝없이 계획을 다듬다 정작 실행하지 못하는 분석 마비. 당신의 설계도는 왜 서랍 안에만 머무를까요?' },
  guardian:    { headline: '희생 소진', body: '다른 사람을 지키는 데 익숙한 당신이 정작 자신을 잃어버리는 번아웃 패턴. 경계를 잃기 전에 확인하세요.' },
  explorer:    { headline: '뿌리 없는 방랑', body: '새로움을 쫓다 한 곳에 깊이 머무르지 못하는 불안. 탐험이 도피가 되는 순간을 짚어드립니다.' },
  prophet:     { headline: '고립된 선지자', body: '세상이 이해하지 못한다는 감각에 갇히는 외로움. 직관이 자기만의 세계로 퇴각하는 패턴.' },
  warrior:     { headline: '통제 불능의 불꽃', body: '목표를 향해 달리다 주변을 소진시키는 패턴. 전투력이 관계를 무너뜨리기 전에 확인하세요.' },
  seeker:      { headline: '끝없는 탐색의 늪', body: '결론에 닿지 못하고 영원히 가능성만 탐색하는 마비. 변환의 에너지가 실행으로 이어지지 못하는 이유.' },
  sovereign:   { headline: '고독한 왕좌', body: '통제를 놓지 못해 결국 혼자가 되어가는 고립. 영향력이 커질수록 깊어지는 외로움의 패턴.' },
  sage:        { headline: '생각의 감옥', body: '완벽한 이해를 추구하다 세상 밖으로 지혜를 꺼내지 못하는 분석 마비. 지식이 행동을 막는 순간.' },
  harmonizer:  { headline: '나를 지운 조화', body: '갈등을 피하려다 진짜 자신의 욕구를 잃어버리는 패턴. 모두를 맞추다 정작 당신은 어디에 있나요?' },
  rebel:       { headline: '반항의 덫', body: '거스르는 것이 목적이 되어 진짜 자유를 놓치는 아이러니. 반항이 또 다른 구속이 되는 패턴.' },
  lover:       { headline: '집착의 불꽃', body: '연결을 갈망하다 상실에 취약해지고 경계를 잃는 패턴. 사랑이 소유가 되는 순간을 짚어드립니다.' },
  catalyst:    { headline: '에너지 소진', body: '모든 것에 불을 붙이다 정작 자신이 타버리는 번아웃. 변화를 만드는 사람이 변화에 무너지는 이유.' },
}

// ─── 3-레이어 메타 ───────────────────────────────────────────────────
const ARCHETYPE_META: Record<string, { icon: string; label: string }> = {
  architect:   { icon: '🏛️', label: '건축가' },
  guardian:    { icon: '🛡️', label: '수호자' },
  explorer:    { icon: '🧭', label: '탐험가' },
  prophet:     { icon: '🔮', label: '예언자' },
  warrior:     { icon: '⚔️', label: '전사' },
  seeker:   { icon: '⚗️', label: '탐구자' },
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
  openness: {
    label: '개방성',
    subFacets: ['지적 탐구', '미적 감수성', '창의적 상상력', '비관습적 사고'],
    subFacetNote: '4개 하위 축의 통합 추정치입니다. 예: 지적 탐구는 높지만 미적 감수성은 낮은 "논리 탐구형"이 존재할 수 있습니다.',
    high: '새로운 아이디어와 분야에 강하게 끌리며, 탐구 자체에서 동기를 얻습니다. 모르는 것을 만났을 때 불편하기보다 흥미롭게 느끼며, 대화에서 "왜?"를 자주 묻습니다. 익숙한 것보다 낯선 것에서 더 빠르게 성장하는 유형입니다.',
    mid: '관심 분야 내에서는 깊이 탐구하지만, 낯선 영역 진입에는 선택적입니다. 완전히 새로운 것보다 기존 관심사의 확장을 선호하며, 탐구의 방향성이 뚜렷한 편입니다.',
    low: '안정적이고 검증된 방식을 선호합니다. 새로운 아이디어보다 실증된 방법에서 신뢰를 얻으며, 빠른 적응보다 한 분야의 깊은 숙련을 추구하는 경향이 있습니다.',
  },
  conscientiousness: {
    label: '성실성',
    subFacets: ['체계성', '완수 의지', '완벽주의', '신중한 계획'],
    subFacetNote: '4개 하위 축의 통합 추정치입니다. 예: 체계성은 높지만 완벽주의가 낮은 "실용적 계획가"형이 존재합니다.',
    high: '시작한 일을 끝까지 마무리하는 강한 완수 성향을 가집니다. 외부 압박 없이도 자체 동기로 지속하며, 장기 목표를 향해 일관된 속도를 유지합니다. 체계적 계획을 선호하고 마감과 약속에 민감합니다.',
    mid: '중요하거나 의미 있는 일에는 높은 집중력을 발휘하지만, 흥미가 낮은 과제에서는 지속력이 흔들릴 수 있습니다. 동기 부여 요인에 따라 성과 편차가 생길 수 있습니다.',
    low: '루틴보다 변화를 선호하며, 한 가지에 오래 집중하기보다 새로운 자극을 찾습니다. 유연하고 즉흥적인 환경에서 더 잘 작동하며, 엄격한 일정보다 흐름에 따른 작업을 선호합니다.',
  },
  extraversion: {
    label: '외향성',
    subFacets: ['사회적 자신감', '공적 발언 편안함', '사교적 주도성', '활력·생동감'],
    subFacetNote: '4개 하위 축의 통합 추정치입니다. 예: 소규모에서는 주도적이지만 대중 앞 발언은 불편한 "선택적 외향형"이 존재합니다.',
    high: '낯선 사람 앞에서도 자신을 자연스럽게 표현합니다. 주목받는 상황을 에너지원으로 활용하며, 그룹을 이끄는 역할에 자연스럽게 끌립니다. 긴 모임 후에도 오히려 활력이 충전되는 경향이 있습니다.',
    mid: '신뢰하는 사람들 앞에서는 표현이 자유롭지만, 낯선 상황에서는 준비와 워밍업이 필요합니다. 완전한 내향도 외향도 아닌, 상황에 따라 유연하게 전환하는 유형입니다.',
    low: '내향적이며 소수의 깊은 관계를 선호합니다. 혼자 또는 소규모 환경에서 최고의 성과를 내며, 긴 사교 자리 후에는 혼자만의 회복 시간이 필요합니다. 조용한 집중력이 강점입니다.',
  },
  honesty: {
    label: '정직-겸손',
    subFacets: ['진정성·진실함', '공정성', '물질적 탐욕 회피', '과시 억제'],
    subFacetNote: 'HEXACO 모델 고유 차원으로, 도덕적 일관성과 자기 절제를 종합합니다. 4개 하위 축의 통합 추정치입니다.',
    high: '과시나 자기 홍보에 불편함을 느끼며, 공정함과 진정성을 핵심 가치로 삼습니다. 규칙이 없어도 윤리적 기준을 스스로 지키는 경향이 강하며, 이 진정성이 장기적으로 신뢰를 쌓는 기반이 됩니다.',
    mid: '필요할 때는 자신을 드러낼 수 있지만, 과도한 자기 홍보는 지양합니다. 상황의 맥락에 따라 자기 표현 수위를 조절하는 유연함이 있습니다.',
    low: '자신감 있게 자신을 표현하며, 경쟁과 인정을 중요하게 여깁니다. 자기 주장이 분명하고 성과를 드러내는 것을 자연스럽게 받아들입니다.',
  },
  emotionality: {
    label: '정서성',
    subFacets: ['위험 민감성', '불안·걱정 경향', '감정적 의존성', '타인 감정 공명'],
    subFacetNote: 'HEXACO의 감성(Emotionality) 차원입니다. 높은 점수가 나쁜 것이 아니며, 공감 능력과 깊은 연관이 있습니다.',
    high: '감정 변화에 민감하고 깊이 느낍니다. 타인의 감정을 잘 읽는 공감 능력이 강점이며, 위험 신호를 조기에 감지하는 데도 유리합니다. 다만 스트레스 상황에서 반추(rumination)가 길어질 수 있어 의도적인 전환 전략이 도움이 됩니다.',
    mid: '상황에 따라 감정 기복이 있지만, 대체로 균형을 유지합니다. 감정을 느끼지만 행동으로 빠르게 전환하는 편이며, 필요시 타인의 감정 지원을 자연스럽게 구합니다.',
    low: '감정적으로 안정되어 있으며, 스트레스 상황에서도 침착함을 유지합니다. 위험이나 불확실성 앞에서 크게 동요하지 않으며, 압박 상황에서 냉정한 판단을 내리는 데 유리합니다.',
  },
  agreeableness: {
    label: '원만성',
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
  const [revealStep, setRevealStep] = useState(0)
  const [showSurvey, setShowSurvey] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('test_answers')
    if (!raw) { setLoading(false); return }

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
      setTimeout(() => setRevealStep(2), 1000)
      setTimeout(() => setRevealStep(3), 1600)
      // 설문 팝업 — 6초 후, 세션당 1회만
      if (!sessionStorage.getItem('pp_survey_shown')) {
        setTimeout(() => setShowSurvey(true), 6000)
      }
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

  const { result, facets, cogScore, life } = output
  const lifeMap = life as Record<string, string>

  const fm: FacetMap = {
    openness:          facets['openness']          ?? 3,
    conscientiousness: facets['conscientiousness'] ?? 3,
    emotionality:      facets['emotionality']      ?? 3,
    extraversion:      facets['extraversion']      ?? 3,
    honesty:           facets['honesty']           ?? 3,
    agreeableness:     facets['agreeableness']     ?? 3,
  }

  const narrative = computeNarrative(fm, cogScore)
  const riasec = computeRiasec(fm)

  const cog = cogLabel(cogScore)
  const sortedFacets = Object.entries(facets).filter(([k]) => FACET_META[k]).sort((a, b) => b[1] - a[1])

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
                  { label: '개방성',    value: facetPct(fm.openness) },
                  { label: '성실성',    value: facetPct(fm.conscientiousness) },
                  { label: '외향성',    value: facetPct(fm.extraversion) },
                  { label: '정직-겸손', value: facetPct(fm.honesty) },
                  { label: '정서성',    value: facetPct(fm.emotionality) },
                  { label: '원만성',    value: facetPct(fm.agreeableness) },
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

        {/* ═══ 프로필 공개 ═══ */}
        {result.archetype && (
          <div className="space-y-3">

            {/* ① 히어로: 프로필명 */}
            <div
              className="rounded-2xl px-6 py-6 text-center transition-all duration-700"
              style={{
                opacity: revealStep >= 1 ? 1 : 0,
                transform: revealStep >= 1 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
                background: 'linear-gradient(135deg, rgba(124,77,204,0.18), rgba(201,168,248,0.08))',
                border: '1px solid rgba(160,126,224,0.45)',
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">{ARCHETYPE_META[result.archetype]?.icon}</span>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent2)', opacity: 0.65 }}>
                  {ARCHETYPE_META[result.archetype]?.label}
                  {result.mode && ` · ${MODE_META[result.mode]?.label}`}
                  {result.drive && ` · ${DRIVE_META[result.drive]?.label}`}
                </span>
              </div>
              <p className="text-2xl font-bold gradient-text mb-2">"{result.profileLabel}"</p>
              {result.shortDesc && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{result.shortDesc}</p>
              )}
            </div>

            {/* ② 원형 이미지 + 공유 유도 */}
            <div
              className="rounded-2xl overflow-hidden transition-all duration-700"
              style={{
                opacity: revealStep >= 2 ? 1 : 0,
                transform: revealStep >= 2 ? 'translateY(0)' : 'translateY(16px)',
                border: '1px solid rgba(160,126,224,0.2)',
                background: 'rgba(17,16,24,0.6)',
              }}
            >
              <img
                src={`/archetypes/${result.archetype}.jpg`}
                alt={ARCHETYPE_META[result.archetype]?.label ?? result.archetype}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              {/* 공유 유도 — 이미지 하단 */}
              <div className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(160,126,224,0.12)' }}>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  나는 <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>{ARCHETYPE_META[result.archetype]?.label}</span> 유형
                </p>
                <button
                  onClick={async () => {
                    const arcId = result.archetype ?? ''
                    const label = ARCHETYPE_META[arcId]?.label ?? arcId
                    const text = `나의 심리 원형은 "${result.profileLabel}" 🔮\n192가지 유형 중 나에게 딱 맞는 분석 → https://core-trait.com`
                    if (navigator.share) {
                      await navigator.share({ title: `나의 심리 원형: ${label}`, text }).catch(() => {})
                    } else {
                      await navigator.clipboard.writeText(text).catch(() => {})
                      alert('링크가 복사됐어요!')
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{ background: 'rgba(160,126,224,0.18)', color: 'var(--accent2)', border: '1px solid rgba(160,126,224,0.3)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  친구에게 공유
                </button>
              </div>
            </div>

            {/* ④ 빛/그림자 플립 카드 (메인) */}
            {(result.light || result.shadow) && (
              <div
                className="rounded-2xl overflow-hidden transition-all duration-700"
                style={{
                  opacity: revealStep >= 2 ? 1 : 0,
                  transform: revealStep >= 2 ? 'translateY(0)' : 'translateY(16px)',
                  border: cardFlipped ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(160,126,224,0.3)',
                  transition: 'opacity 0.7s, transform 0.7s, border-color 0.4s',
                }}
              >
                {/* Canvas 아트 배너 */}
                <ArchetypeCanvas archetypeId={result.archetype ?? ''} driveId={result.drive} height={160} />
                <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCardFlipped(false)}
                      className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                      style={{
                        background: !cardFlipped ? 'rgba(196,181,253,0.18)' : 'transparent',
                        color: !cardFlipped ? '#c4b5fd' : 'var(--muted)',
                        border: !cardFlipped ? '1px solid rgba(196,181,253,0.35)' : '1px solid rgba(107,114,128,0.2)',
                      }}
                    >
                      ✦ 빛
                    </button>
                    <button
                      onClick={() => setCardFlipped(true)}
                      className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                      style={{
                        background: cardFlipped ? 'rgba(107,114,128,0.18)' : 'transparent',
                        color: cardFlipped ? '#9ca3af' : 'var(--muted)',
                        border: cardFlipped ? '1px solid rgba(107,114,128,0.35)' : '1px solid rgba(107,114,128,0.2)',
                        opacity: cardFlipped ? 1 : 0.55,
                      }}
                    >
                      ◈ 그림자
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)', opacity: 0.4 }}>탭해서 전환</span>
                </div>
                <div
                  onClick={() => setCardFlipped(f => !f)}
                  style={{ perspective: '1200px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div
                    style={{
                      display: 'grid',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.55s cubic-bezier(0.45, 0, 0.55, 1)',
                      transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* 앞면 — 빛 */}
                    <div
                      style={{
                        gridArea: '1/1',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        padding: '20px 20px 24px',
                      }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: '#c4b5fd', lineHeight: 1.9 }}>
                        {result.light}
                      </p>
                    </div>
                    {/* 뒷면 — 그림자 */}
                    <div
                      style={{
                        gridArea: '1/1',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        padding: '20px 20px 24px',
                      }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.9 }}>
                        {result.shadow}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ⑤ 사고방식 + 핵심 동력 — 나란히 */}
            <div
              className="grid gap-3 transition-all duration-700"
              style={{
                gridTemplateColumns: '1fr 1fr',
                opacity: revealStep >= 3 ? 1 : 0,
                transform: revealStep >= 3 ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              {result.mode && (() => {
                const m = MODE_META[result.mode]
                return (
                  <div
                    className="rounded-2xl px-4 py-4"
                    style={{ border: `1px solid ${m.color}35`, background: `${m.color}0a` }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: m.color, opacity: 0.75 }}>사고 방식</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                      <span className="text-sm font-bold" style={{ color: m.color }}>{m.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
                  </div>
                )
              })()}
              {result.drive && (() => {
                const d = DRIVE_META[result.drive]
                return (
                  <div
                    className="rounded-2xl px-4 py-4"
                    style={{ border: `1px solid ${d.color}35`, background: `${d.color}0a` }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: d.color, opacity: 0.75 }}>핵심 동력</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-sm font-bold" style={{ color: d.color }}>{d.label}</span>
                    </div>
                    <p className="text-xs italic" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>"{d.motivation}"</p>
                  </div>
                )
              })()}
            </div>

          </div>
        )}

        {/* 내러티브 */}
        <div className="glass rounded-2xl p-6" style={{ borderColor: 'rgba(160,126,224,0.25)' }}>
          <p className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: 'var(--accent2)' }}>당신은 이러한 경향이 있습니다</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', lineHeight: 1.85 }}>{narrative}</p>
        </div>

        {/* ── 모순 카드 ── */}
        {(() => {
          const paradox = computeParadox(
            fm as Record<FacetKey, number>,
            result.drive ?? undefined,
            result.archetype ?? undefined,
          )
          if (!paradox) return null
          return (
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.07), rgba(17,16,24,0.8))',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#f87171', letterSpacing: '0.08em' }}>
                당신의 모순
              </p>
              <p className="text-xs mb-3 font-medium" style={{ color: 'rgba(248,113,113,0.6)' }}>{paradox.trigger}</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text)', lineHeight: 1.85 }}>
                {paradox.body}
              </p>
              <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                → {paradox.question}
              </p>
            </div>
          )
        })()}

        {/* ── 블러 페이월 — 실제 데이터 보여주다 잠금 ── */}
        <div className="relative" style={{ isolation: 'isolate' }}>
          {/* 실제 콘텐츠 (블러 처리) */}
          <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
            {/* HEXACO */}
            <div className="glass rounded-2xl p-6 mb-3">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-sm">핵심 성격 6차원</h2>
              </div>
              <div className="space-y-4">
                {sortedFacets.slice(0, 3).map(([key, score]) => {
                  const meta = FACET_META[key]
                  if (!meta) return null
                  const level = facetLevel(score)
                  const pct = facetPct(score)
                  const levelColor = level === 'high' ? '#a78bfa' : level === 'low' ? '#9ca3af' : '#6b7280'
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium" style={{ color: 'var(--text)' }}>{meta.label}</span>
                        <span style={{ color: levelColor }}>{pct}%</span>
                      </div>
                      <ScoreBar value={pct} color={`linear-gradient(90deg, ${levelColor}88, ${levelColor})`} />
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{meta[level].slice(0, 60)}...</p>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* 진로 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm"><span>🎯</span> 진로 적합도 TOP 6</h2>
              <div className="space-y-3">
                {result.careers.slice(0, 3).map(c => (
                  <div key={c.title} className="rounded-xl p-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{c.title}</span>
                      <span className="font-bold" style={{ color: 'var(--accent2)' }}>{c.fit}%</span>
                    </div>
                    <ScoreBar value={c.fit} color="linear-gradient(90deg, var(--accent), var(--accent2))" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 그라디언트 페이드 + 잠금 오버레이 */}
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6"
            style={{
              top: '30%',
              background: 'linear-gradient(to bottom, transparent 0%, var(--bg, #0d0b14) 55%)',
            }}
          >
            <div
              className="rounded-2xl p-6 text-center w-full"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(17,16,24,0.92))',
                border: '1px solid rgba(167,139,250,0.35)',
                boxShadow: '0 8px 40px rgba(124,58,237,0.2)',
              }}
            >
              {(() => {
                const arcId = result.archetype ?? ''
                const shadow = ARCHETYPE_SHADOW[arcId]
                return shadow ? (
                  <>
                    <div className="text-xl mb-2">⚠️</div>
                    <p className="font-bold mb-1.5" style={{ color: 'var(--text)', fontSize: '1rem' }}>
                      {ARCHETYPE_META[arcId]?.label}의 치명적 약점 — {shadow.headline}
                    </p>
                    <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted)', lineHeight: 1.75 }}>
                      {shadow.body}
                    </p>
                    <p className="text-xs mb-4" style={{ color: 'rgba(167,139,250,0.7)', lineHeight: 1.6 }}>
                      HEXACO 6요인 상세 · 진로 TOP 6 · Holland RIASEC · 번아웃 리스크
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xl mb-2">🔒</div>
                    <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>나머지 결과를 잠금 해제하세요</p>
                    <p className="text-xs mb-4" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                      HEXACO 6요인 상세 · 진로 TOP 6 전체 · Holland RIASEC<br />인지 스타일 · 번아웃 리스크 분석
                    </p>
                  </>
                )
              })()}
              <a
                href="/paid"
                onClick={() => trackUpgradeClick('result_paywall_cta').catch(() => {})}
                className="block w-full py-3 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #be185d, #7c3aed)', textDecoration: 'none', fontSize: '0.95rem' }}
              >
                심층 분석 출시 알림 받기 →
              </a>
              <p className="text-xs mt-3" style={{ color: 'var(--muted)', opacity: 0.6 }}>
                HEXACO 24 하위 요인 · 번아웃 리스크 · 진로 TOP 6 · 출시 예정
              </p>
            </div>
          </div>
        </div>

        {/* EN 버전 CTA */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.25)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🌐</span>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Available in English</p>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                The in-depth version is available in English — with US market investment profile, Western academic aptitude (STEM / Humanities / Business), and full work style analysis.
              </p>
              <a
                href="/en/paid"
                className="inline-block text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
              >
                Try the English version →
              </a>
            </div>
          </div>
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

        {/* 설문 */}
        <SurveySection resultType="free" />

        {/* 과학적 면책 문구 */}
        <ScientificDisclaimer profileLabel={result.profileLabel} />

        {/* 공유 + 홈 */}
        <ShareButtons
          profileLabel={result.profileLabel}
          profileId={result.profileId}
        />
        <div className="text-center pb-8">
          <Link href="/" className="text-sm underline" style={{ color: 'var(--muted)' }}>홈으로</Link>
        </div>

      </div>

      {/* 설문 자동 팝업 */}
      {showSurvey && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setShowSurvey(false); sessionStorage.setItem('pp_survey_shown', '1') }}
        >
          <div
            className="w-full max-w-md mb-6 mx-4 rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--surface)', border: '1px solid rgba(167,139,250,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold" style={{ color: 'var(--text)' }}>잠깐, 후기 한 줄만 남겨주세요 🙏</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  1분이면 충분해요. 서비스 개선에 직접 반영됩니다.
                </p>
              </div>
              <button
                onClick={() => { setShowSurvey(false); sessionStorage.setItem('pp_survey_shown', '1') }}
                className="text-lg shrink-0"
                style={{ color: 'var(--muted)', lineHeight: 1 }}
              >✕</button>
            </div>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfkiZOUy56PQ4gC_V7OjT7hP4NclDGFGOVnjIyVax7SfUwvKg/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center"
              style={{ padding: '13px', textDecoration: 'none' }}
              onClick={() => { setShowSurvey(false); sessionStorage.setItem('pp_survey_shown', '1') }}
            >
              설문 참여하기 →
            </a>
            <button
              onClick={() => { setShowSurvey(false); sessionStorage.setItem('pp_survey_shown', '1') }}
              className="w-full text-sm text-center"
              style={{ color: 'var(--muted)' }}
            >
              나중에 할게요
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
