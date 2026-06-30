'use client'

import type { ReactElement } from 'react'

// 각 HEXACO 2요인 패턴별 미니멀 SVG 일러스트
// viewBox 120×120 · 스트로크 중심 · 다크 테마 대응

interface PatternIllustrationProps {
  patternKey: string   // 예: 'HO', 'OC', 'XA' …
  size?: number
}

// 요인별 컬러 팔레트
const COLORS = {
  H: '#a78bfa',  // violet
  O: '#67e8f9',  // cyan
  C: '#fbbf24',  // amber
  X: '#f472b6',  // pink
  A: '#34d399',  // emerald
  E: '#818cf8',  // indigo
}

// 패턴별 SVG paths / shapes 정의
const PATTERNS: Record<string, ReactElement> = {

  // ── HO · 가치 기반 탐구자 · 나침반 ───────────────────────────
  HO: (
    <g>
      <circle cx="60" cy="60" r="44" stroke={COLORS.H} strokeWidth="1.2" fill="none" opacity="0.4"/>
      <circle cx="60" cy="60" r="30" stroke={COLORS.O} strokeWidth="1" fill="none" opacity="0.3"/>
      {/* 나침반 4방향 */}
      <polygon points="60,16 64,56 60,60 56,56" fill={COLORS.H} opacity="0.9"/>
      <polygon points="60,104 56,64 60,60 64,64" fill={COLORS.O} opacity="0.7"/>
      <polygon points="16,60 56,64 60,60 56,56" fill={COLORS.H} opacity="0.5"/>
      <polygon points="104,60 64,56 60,60 64,64" fill={COLORS.O} opacity="0.5"/>
      <circle cx="60" cy="60" r="5" fill={COLORS.H}/>
      <circle cx="60" cy="60" r="2" fill="white" opacity="0.8"/>
      {/* 각도 눈금 */}
      {[45,135,225,315].map(a => (
        <line key={a}
          x1={60 + 38 * Math.cos(a * Math.PI / 180)}
          y1={60 + 38 * Math.sin(a * Math.PI / 180)}
          x2={60 + 44 * Math.cos(a * Math.PI / 180)}
          y2={60 + 44 * Math.sin(a * Math.PI / 180)}
          stroke={COLORS.O} strokeWidth="1.5" opacity="0.6"
        />
      ))}
    </g>
  ),

  // ── HC · 신뢰할 수 있는 완벽주의자 · 크리스털 ───────────────
  HC: (
    <g>
      {/* 외부 다이아몬드 */}
      <polygon points="60,10 100,55 60,110 20,55" stroke={COLORS.H} strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* 내부 다이아몬드 */}
      <polygon points="60,28 85,55 60,90 35,55" stroke={COLORS.C} strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* 중심 작은 다이아몬드 */}
      <polygon points="60,44 72,55 60,74 48,55" fill={COLORS.H} opacity="0.8"/>
      {/* 패싯 라인 */}
      <line x1="60" y1="10" x2="60" y2="28" stroke={COLORS.C} strokeWidth="1" opacity="0.5"/>
      <line x1="100" y1="55" x2="85" y2="55" stroke={COLORS.C} strokeWidth="1" opacity="0.5"/>
      <line x1="60" y1="110" x2="60" y2="90" stroke={COLORS.C} strokeWidth="1" opacity="0.5"/>
      <line x1="20" y1="55" x2="35" y2="55" stroke={COLORS.C} strokeWidth="1" opacity="0.5"/>
      <circle cx="60" cy="55" r="3" fill={COLORS.C}/>
    </g>
  ),

  // ── HA · 공감적 도덕주의자 · 저울+하트 ──────────────────────
  HA: (
    <g>
      {/* 저울 기둥 */}
      <line x1="60" y1="20" x2="60" y2="95" stroke={COLORS.H} strokeWidth="2" opacity="0.7"/>
      {/* 저울 가로대 */}
      <line x1="25" y1="42" x2="95" y2="42" stroke={COLORS.H} strokeWidth="1.5" opacity="0.7"/>
      {/* 왼쪽 저울접시 */}
      <path d="M15,55 Q25,70 35,55" stroke={COLORS.A} strokeWidth="1.5" fill="none"/>
      <ellipse cx="25" cy="55" rx="11" ry="3" fill={COLORS.A} opacity="0.2"/>
      {/* 오른쪽 저울접시 - 살짝 기울어짐 */}
      <path d="M85,58 Q95,73 105,58" stroke={COLORS.A} strokeWidth="1.5" fill="none"/>
      <ellipse cx="95" cy="58" rx="11" ry="3" fill={COLORS.A} opacity="0.2"/>
      {/* 실 */}
      <line x1="25" y1="42" x2="25" y2="55" stroke={COLORS.H} strokeWidth="1" opacity="0.5"/>
      <line x1="95" y1="42" x2="95" y2="58" stroke={COLORS.H} strokeWidth="1" opacity="0.5"/>
      {/* 하트 */}
      <path d="M53,80 C53,76 47,72 47,68 C47,64 53,64 56,67 C59,64 65,64 65,68 C65,72 59,76 59,80 Z"
        fill={COLORS.A} opacity="0.85"/>
      {/* 받침 */}
      <path d="M50,96 Q60,92 70,96" stroke={COLORS.H} strokeWidth="1.5" fill="none" opacity="0.6"/>
    </g>
  ),

  // ── HX · 진정성 있는 설득자 · 횃불 ──────────────────────────
  HX: (
    <g>
      {/* 불꽃 */}
      <path d="M60,15 C55,28 45,32 48,45 C50,55 55,58 60,58 C65,58 70,55 72,45 C75,32 65,28 60,15 Z"
        fill={COLORS.X} opacity="0.85"/>
      <path d="M60,25 C57,33 52,36 54,44 C56,51 59,53 60,53 C61,53 64,51 66,44 C68,36 63,33 60,25 Z"
        fill={COLORS.H} opacity="0.7"/>
      {/* 횃불 손잡이 */}
      <rect x="55" y="58" width="10" height="40" rx="3" fill={COLORS.H} opacity="0.6"/>
      <rect x="52" y="92" width="16" height="4" rx="2" fill={COLORS.H} opacity="0.4"/>
      {/* 광선 */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a}
          x1={60 + 30 * Math.cos((a - 90) * Math.PI / 180)}
          y1={36 + 22 * Math.sin((a - 90) * Math.PI / 180)}
          x2={60 + 42 * Math.cos((a - 90) * Math.PI / 180)}
          y2={36 + 30 * Math.sin((a - 90) * Math.PI / 180)}
          stroke={COLORS.X} strokeWidth="1" opacity="0.35"
        />
      ))}
    </g>
  ),

  // ── HE · 섬세한 양심 · 깃털 ──────────────────────────────────
  HE: (
    <g>
      {/* 깃털 척추 */}
      <path d="M60,10 C58,35 55,65 50,100" stroke={COLORS.H} strokeWidth="1.5" fill="none"/>
      {/* 깃털 살 — 오른쪽 */}
      {[15,22,30,38,46,54,62,70,78,86].map((y, i) => (
        <path key={`r${i}`}
          d={`M${58 - i * 0.3},${y} C${68 + i},${y - 4} ${72 + i},${y + 2} ${66 + i * 0.8},${y + 6}`}
          stroke={COLORS.E} strokeWidth="1" fill="none" opacity={0.8 - i * 0.05}
        />
      ))}
      {/* 깃털 살 — 왼쪽 */}
      {[20,28,36,44,52,60,68,76,84].map((y, i) => (
        <path key={`l${i}`}
          d={`M${57 - i * 0.3},${y} C${47 - i},${y - 4} ${43 - i},${y + 2} ${49 - i * 0.8},${y + 6}`}
          stroke={COLORS.H} strokeWidth="1" fill="none" opacity={0.7 - i * 0.05}
        />
      ))}
      {/* 이슬방울 */}
      <ellipse cx="50" cy="100" rx="4" ry="5.5" fill={COLORS.E} opacity="0.8"/>
      <ellipse cx="49" cy="98" rx="1.5" ry="2" fill="white" opacity="0.5"/>
    </g>
  ),

  // ── OC · 지적 완벽주의자 · 피보나치 나선 ─────────────────────
  OC: (
    <g>
      {/* 격자 */}
      <line x1="10" y1="60" x2="110" y2="60" stroke={COLORS.C} strokeWidth="0.5" opacity="0.2"/>
      <line x1="60" y1="10" x2="60" y2="110" stroke={COLORS.C} strokeWidth="0.5" opacity="0.2"/>
      {/* 황금나선 근사 */}
      <path d="M60,60 Q60,35 82,35 Q104,35 104,60 Q104,92 72,92 Q30,92 30,52 Q30,12 78,12"
        stroke={COLORS.O} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M60,60 Q60,47 72,47 Q84,47 84,60 Q84,74 68,74 Q44,74 44,55"
        stroke={COLORS.C} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 사각형 */}
      <rect x="60" y="35" width="25" height="25" stroke={COLORS.O} strokeWidth="0.8" fill="none" opacity="0.4"/>
      <rect x="35" y="35" width="25" height="25" stroke={COLORS.C} strokeWidth="0.8" fill="none" opacity="0.3"/>
      <rect x="35" y="60" width="25" height="32" stroke={COLORS.O} strokeWidth="0.8" fill="none" opacity="0.2"/>
      {/* 중심점 */}
      <circle cx="60" cy="60" r="4" fill={COLORS.C}/>
      <circle cx="60" cy="60" r="2" fill={COLORS.O}/>
    </g>
  ),

  // ── OX · 창의적 혁신가 · 번개 ────────────────────────────────
  OX: (
    <g>
      {/* 외부 원 */}
      <circle cx="60" cy="60" r="46" stroke={COLORS.O} strokeWidth="1.2" fill="none" opacity="0.3"
        strokeDasharray="4 3"/>
      {/* 번개 */}
      <path d="M68,12 L42,58 L58,58 L52,108 L82,52 L65,52 Z"
        fill={COLORS.X} opacity="0.9" stroke={COLORS.O} strokeWidth="0.5"/>
      {/* 빛 번짐 */}
      {[0,72,144,216,288].map(a => (
        <line key={a}
          x1={60 + 20 * Math.cos(a * Math.PI / 180)}
          y1={60 + 20 * Math.sin(a * Math.PI / 180)}
          x2={60 + 36 * Math.cos(a * Math.PI / 180)}
          y2={60 + 36 * Math.sin(a * Math.PI / 180)}
          stroke={COLORS.O} strokeWidth="1.5" opacity="0.25"
        />
      ))}
    </g>
  ),

  // ── OA · 이상적 공감자 · 구름+별 ─────────────────────────────
  OA: (
    <g>
      {/* 구름 */}
      <path d="M22,72 Q18,56 30,50 Q30,36 44,38 Q50,26 64,30 Q78,22 84,36 Q96,36 96,50 Q106,56 100,68 Q100,80 88,78 L32,78 Q22,80 22,72 Z"
        stroke={COLORS.O} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M30,68 Q26,55 36,50 Q38,40 50,42 Q56,33 68,36 Q80,30 84,42 Q93,42 93,52 Q100,57 96,66 Q96,74 86,73 L38,73 Q30,74 30,68 Z"
        fill={COLORS.O} opacity="0.08"/>
      {/* 별 */}
      <path d="M60,35 L62.5,42 L70,42 L64,47 L66.5,54 L60,50 L53.5,54 L56,47 L50,42 L57.5,42 Z"
        fill={COLORS.A} opacity="0.9"/>
      {/* 작은 별 */}
      <path d="M82,44 L83,47 L86,47 L84,49 L85,52 L82,50 L79,52 L80,49 L78,47 L81,47 Z"
        fill={COLORS.O} opacity="0.6"/>
      <path d="M36,50 L37,53 L40,53 L38,55 L39,58 L36,56 L33,58 L34,55 L32,53 L35,53 Z"
        fill={COLORS.O} opacity="0.5"/>
      {/* 빗방울 */}
      <ellipse cx="44" cy="88" rx="3" ry="4" fill={COLORS.A} opacity="0.5"/>
      <ellipse cx="60" cy="92" rx="3" ry="4" fill={COLORS.A} opacity="0.4"/>
      <ellipse cx="76" cy="87" rx="3" ry="4" fill={COLORS.A} opacity="0.5"/>
    </g>
  ),

  // ── OE · 감수성 풍부한 탐구자 · 파동 스펙트럼 ───────────────
  OE: (
    <g>
      {/* 스펙트럼 파동 - 여러 레이어 */}
      <path d="M10,40 C25,25 35,55 50,40 C65,25 75,55 90,40 C100,30 108,38 110,40"
        stroke={COLORS.O} strokeWidth="2" fill="none" opacity="0.8"/>
      <path d="M10,55 C25,40 35,70 50,55 C65,40 75,70 90,55 C100,45 108,53 110,55"
        stroke={COLORS.E} strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M10,70 C25,55 35,85 50,70 C65,55 75,85 90,70 C100,60 108,68 110,70"
        stroke={COLORS.O} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M10,82 C25,70 35,94 50,82 C65,70 75,94 90,82 C100,74 108,80 110,82"
        stroke={COLORS.E} strokeWidth="1" fill="none" opacity="0.35"/>
      {/* 돋보기 */}
      <circle cx="82" cy="35" r="16" stroke={COLORS.O} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <line x1="93" y1="47" x2="105" y2="58" stroke={COLORS.O} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <circle cx="82" cy="35" r="10" stroke={COLORS.E} strokeWidth="0.8" fill={COLORS.E} fillOpacity="0.06"/>
    </g>
  ),

  // ── CX · 주도적 실행가 · 상승 화살표 ────────────────────────
  CX: (
    <g>
      {/* 메인 화살표 */}
      <path d="M30,85 L60,20 L90,85" stroke={COLORS.C} strokeWidth="2.5" fill="none"
        strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M45,62 L60,20 L75,62" fill={COLORS.C} opacity="0.2"/>
      {/* 화살촉 */}
      <polygon points="60,15 50,32 70,32" fill={COLORS.X} opacity="0.9"/>
      {/* 속도선 */}
      <line x1="18" y1="68" x2="38" y2="68" stroke={COLORS.C} strokeWidth="1.2" opacity="0.35"/>
      <line x1="14" y1="78" x2="34" y2="78" stroke={COLORS.C} strokeWidth="1.2" opacity="0.25"/>
      <line x1="82" y1="68" x2="102" y2="68" stroke={COLORS.C} strokeWidth="1.2" opacity="0.35"/>
      <line x1="86" y1="78" x2="106" y2="78" stroke={COLORS.C} strokeWidth="1.2" opacity="0.25"/>
      {/* 목표 원 */}
      <circle cx="60" cy="98" r="10" stroke={COLORS.X} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <circle cx="60" cy="98" r="5" fill={COLORS.X} opacity="0.3"/>
    </g>
  ),

  // ── CA · 책임감 있는 조력자 · 방패+새싹 ─────────────────────
  CA: (
    <g>
      {/* 방패 */}
      <path d="M60,12 L96,28 L96,62 Q96,88 60,108 Q24,88 24,62 L24,28 Z"
        stroke={COLORS.C} strokeWidth="1.5" fill={COLORS.C} fillOpacity="0.06"/>
      <path d="M60,20 L88,34 L88,62 Q88,82 60,98 Q32,82 32,62 L32,34 Z"
        stroke={COLORS.A} strokeWidth="1" fill="none" opacity="0.4"/>
      {/* 새싹 */}
      <line x1="60" y1="80" x2="60" y2="45" stroke={COLORS.A} strokeWidth="2" strokeLinecap="round"/>
      <path d="M60,65 Q48,58 46,46 Q58,44 60,56" fill={COLORS.A} opacity="0.8"/>
      <path d="M60,58 Q72,50 74,38 Q62,36 60,48" fill={COLORS.A} opacity="0.6"/>
      {/* 잎 끝 하이라이트 */}
      <circle cx="60" cy="45" r="3" fill={COLORS.A}/>
    </g>
  ),

  // ── CE · 꼼꼼한 공감자 · 눈+디테일 ─────────────────────────
  CE: (
    <g>
      {/* 눈 아웃라인 */}
      <path d="M10,60 Q60,20 110,60 Q60,100 10,60 Z"
        stroke={COLORS.C} strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* 홍채 */}
      <circle cx="60" cy="60" r="22" stroke={COLORS.E} strokeWidth="1.2" fill={COLORS.E} fillOpacity="0.07"/>
      {/* 동공 */}
      <circle cx="60" cy="60" r="13" fill={COLORS.C} opacity="0.85"/>
      <circle cx="60" cy="60" r="8" fill="#0a0a14"/>
      {/* 하이라이트 */}
      <circle cx="55" cy="55" r="3" fill="white" opacity="0.5"/>
      <circle cx="66" cy="63" r="1.5" fill="white" opacity="0.3"/>
      {/* 속눈썹/디테일 */}
      {[-60,-30,0,30,60].map((a, i) => (
        <line key={i}
          x1={60 + 22 * Math.cos(a * Math.PI / 180)}
          y1={60 + 22 * Math.sin(a * Math.PI / 180)}
          x2={60 + 30 * Math.cos(a * Math.PI / 180)}
          y2={60 + 30 * Math.sin(a * Math.PI / 180)}
          stroke={COLORS.C} strokeWidth="1.2" opacity="0.5"
        />
      ))}
      {/* 주변 점 */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <circle key={a}
          cx={60 + 44 * Math.cos(a * Math.PI / 180)}
          cy={60 + 44 * Math.sin(a * Math.PI / 180)}
          r="1.5" fill={COLORS.E} opacity="0.4"
        />
      ))}
    </g>
  ),

  // ── XA · 사람 중심 리더 · 태양 ───────────────────────────────
  XA: (
    <g>
      {/* 외부 광선 */}
      {Array.from({ length: 12 }, (_, i) => i * 30).map(a => (
        <line key={a}
          x1={60 + 36 * Math.cos(a * Math.PI / 180)}
          y1={60 + 36 * Math.sin(a * Math.PI / 180)}
          x2={60 + 48 * Math.cos(a * Math.PI / 180)}
          y2={60 + 48 * Math.sin(a * Math.PI / 180)}
          stroke={COLORS.X} strokeWidth={a % 60 === 0 ? 2 : 1.2}
          opacity={a % 60 === 0 ? 0.8 : 0.4}
        />
      ))}
      {/* 중간 링 */}
      <circle cx="60" cy="60" r="34" stroke={COLORS.X} strokeWidth="1" fill="none" opacity="0.2"/>
      {/* 본체 */}
      <circle cx="60" cy="60" r="26" fill={COLORS.X} opacity="0.15" stroke={COLORS.X} strokeWidth="1.5"/>
      {/* 내부 십자 */}
      <circle cx="60" cy="60" r="16" fill={COLORS.A} opacity="0.8"/>
      {/* 사람 실루엣 */}
      <circle cx="60" cy="52" r="5" fill="white" opacity="0.7"/>
      <path d="M51,70 Q60,62 69,70 Q68,78 60,80 Q52,78 51,70 Z" fill="white" opacity="0.7"/>
    </g>
  ),

  // ── XE · 열정적 공감자 · 이중 불꽃 ──────────────────────────
  XE: (
    <g>
      {/* 큰 불꽃 (왼쪽) */}
      <path d="M48,100 C40,85 28,78 32,60 C34,50 40,46 42,55 C36,42 44,28 50,18 C48,32 58,36 56,48 C60,36 68,30 66,18 C72,30 72,48 68,58 C74,46 80,46 76,60 C80,75 68,85 60,100 Z"
        fill={COLORS.X} opacity="0.8"/>
      {/* 내부 작은 불꽃 (오른쪽) */}
      <path d="M74,95 C70,84 62,78 64,65 C65,57 70,54 71,61 C68,51 74,42 78,33 C77,44 84,47 82,56 C86,47 90,50 88,62 C91,72 84,83 78,95 Z"
        fill={COLORS.E} opacity="0.75"/>
      {/* 하이라이트 */}
      <path d="M50,80 C47,72 42,68 44,58 C47,64 52,66 50,73 Z"
        fill="white" opacity="0.2"/>
      <path d="M76,78 C74,71 70,67 71,59 C74,64 77,66 76,72 Z"
        fill="white" opacity="0.15"/>
    </g>
  ),

  // ── AE · 온화한 감수성인 · 연잎+파동 ────────────────────────
  AE: (
    <g>
      {/* 연잎 */}
      <path d="M60,28 C46,28 28,40 28,58 C28,74 42,84 60,84 C78,84 92,74 92,58 C92,40 74,28 60,28 Z"
        stroke={COLORS.A} strokeWidth="1.5" fill={COLORS.A} fillOpacity="0.1"/>
      {/* 잎맥 */}
      <line x1="60" y1="28" x2="60" y2="84" stroke={COLORS.A} strokeWidth="1" opacity="0.5"/>
      <path d="M60,45 Q45,50 35,58" stroke={COLORS.A} strokeWidth="0.8" fill="none" opacity="0.4"/>
      <path d="M60,45 Q75,50 85,58" stroke={COLORS.A} strokeWidth="0.8" fill="none" opacity="0.4"/>
      <path d="M60,62 Q46,67 38,74" stroke={COLORS.A} strokeWidth="0.8" fill="none" opacity="0.35"/>
      <path d="M60,62 Q74,67 82,74" stroke={COLORS.A} strokeWidth="0.8" fill="none" opacity="0.35"/>
      {/* 수면 파동 */}
      <path d="M16,94 C28,88 40,100 52,94 C64,88 76,100 88,94 C96,90 106,94 108,94"
        stroke={COLORS.E} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M10,104 C24,98 38,110 52,104 C66,98 80,110 94,104 C100,101 108,103 112,104"
        stroke={COLORS.E} strokeWidth="1" fill="none" opacity="0.4"/>
      {/* 이슬 */}
      <ellipse cx="60" cy="55" rx="6" ry="8" fill={COLORS.E} opacity="0.5"/>
      <ellipse cx="58" cy="52" rx="2" ry="3" fill="white" opacity="0.4"/>
    </g>
  ),
}

const DEFAULT_PATTERN = (
  <g>
    <circle cx="60" cy="60" r="44" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <circle cx="60" cy="60" r="28" stroke="#67e8f9" strokeWidth="1" fill="none" opacity="0.3"/>
    <circle cx="60" cy="60" r="12" fill="#a78bfa" opacity="0.6"/>
    {[0, 60, 120, 180, 240, 300].map(a => (
      <line key={a}
        x1={60 + 28 * Math.cos(a * Math.PI / 180)}
        y1={60 + 28 * Math.sin(a * Math.PI / 180)}
        x2={60 + 44 * Math.cos(a * Math.PI / 180)}
        y2={60 + 44 * Math.sin(a * Math.PI / 180)}
        stroke="#a78bfa" strokeWidth="1.2" opacity="0.4"
      />
    ))}
  </g>
)

export default function PatternIllustration({ patternKey, size = 120 }: PatternIllustrationProps) {
  const content = PATTERNS[patternKey] ?? DEFAULT_PATTERN

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {content}
    </svg>
  )
}
