'use client'

// 홈페이지 히어로 추상 일러스트
// 뇌/마음/네트워크 테마 · 미니멀 SVG · 다크 테마

export default function HeroIllustration({ size = 280 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* ── 배경 링 ─────────────────────────────────────── */}
      <circle cx="140" cy="140" r="120" stroke="#a78bfa" strokeWidth="0.6" fill="none" opacity="0.12" strokeDasharray="6 4"/>
      <circle cx="140" cy="140" r="96" stroke="#67e8f9" strokeWidth="0.6" fill="none" opacity="0.1" strokeDasharray="3 5"/>

      {/* ── 육각형 격자 (배경) ───────────────────────────── */}
      {[
        [140,100], [172,118], [172,154], [140,172], [108,154], [108,118]
      ].map(([x, y], i) => (
        <circle key={`node-${i}`} cx={x} cy={y} r="3.5"
          fill={['#a78bfa','#67e8f9','#fbbf24','#f472b6','#34d399','#818cf8'][i]}
          opacity="0.75"
        />
      ))}
      {/* 격자 연결선 */}
      {[
        [140,100,172,118], [172,118,172,154], [172,154,140,172],
        [140,172,108,154], [108,154,108,118], [108,118,140,100],
        [140,100,140,172], [172,118,108,154], [108,118,172,154],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={`hex-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#a78bfa" strokeWidth="0.8" opacity="0.2"/>
      ))}

      {/* ── 중심 뇌 실루엣 (추상) ───────────────────────── */}
      {/* 좌반구 */}
      <path d="M140,85 C122,82 104,90 96,106 C88,122 90,138 98,150 C104,158 112,162 120,164 C124,165 128,165 132,164 L132,114 Z"
        fill="#a78bfa" opacity="0.18" stroke="#a78bfa" strokeWidth="1.2"/>
      {/* 우반구 */}
      <path d="M140,85 C158,82 176,90 184,106 C192,122 190,138 182,150 C176,158 168,162 160,164 C156,165 152,165 148,164 L148,114 Z"
        fill="#67e8f9" opacity="0.14" stroke="#67e8f9" strokeWidth="1.2"/>
      {/* 중심선 */}
      <line x1="140" y1="85" x2="140" y2="168" stroke="#ffffff" strokeWidth="0.8" opacity="0.2"/>
      {/* 뇌 주름 — 좌 */}
      <path d="M112,108 Q106,118 110,128" stroke="#a78bfa" strokeWidth="1.2" fill="none" opacity="0.4"/>
      <path d="M104,122 Q100,132 106,142" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.3"/>
      <path d="M118,102 Q112,112 116,120" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.35"/>
      {/* 뇌 주름 — 우 */}
      <path d="M168,108 Q174,118 170,128" stroke="#67e8f9" strokeWidth="1.2" fill="none" opacity="0.4"/>
      <path d="M176,122 Q180,132 174,142" stroke="#67e8f9" strokeWidth="1" fill="none" opacity="0.3"/>
      <path d="M162,102 Q168,112 164,120" stroke="#67e8f9" strokeWidth="1" fill="none" opacity="0.35"/>

      {/* ── 외부 노드 (6 HEXACO 요인) ───────────────────── */}
      {/* H - 겸손·윤리 */}
      <circle cx="140" cy="44" r="10" fill="#a78bfa" opacity="0.85"/>
      <text x="140" y="48" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" opacity="0.9">H</text>
      <line x1="140" y1="54" x2="140" y2="85" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>

      {/* O - 개방성 */}
      <circle cx="218" cy="88" r="10" fill="#67e8f9" opacity="0.8"/>
      <text x="218" y="92" textAnchor="middle" fill="#0a0a2e" fontSize="9" fontWeight="bold">O</text>
      <line x1="209" y1="93" x2="184" y2="108" stroke="#67e8f9" strokeWidth="1.2" opacity="0.45"/>

      {/* C - 성실성 */}
      <circle cx="218" cy="192" r="10" fill="#fbbf24" opacity="0.85"/>
      <text x="218" y="196" textAnchor="middle" fill="#0a0a2e" fontSize="9" fontWeight="bold">C</text>
      <line x1="209" y1="187" x2="182" y2="152" stroke="#fbbf24" strokeWidth="1.2" opacity="0.45"/>

      {/* X - 대담성 */}
      <circle cx="140" cy="232" r="10" fill="#f472b6" opacity="0.85"/>
      <text x="140" y="236" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">X</text>
      <line x1="140" y1="222" x2="140" y2="192" stroke="#f472b6" strokeWidth="1.2" opacity="0.5" strokeDasharray="3 2"/>

      {/* A - 원만성 */}
      <circle cx="62" cy="192" r="10" fill="#34d399" opacity="0.85"/>
      <text x="62" y="196" textAnchor="middle" fill="#0a0a2e" fontSize="9" fontWeight="bold">A</text>
      <line x1="71" y1="187" x2="98" y2="152" stroke="#34d399" strokeWidth="1.2" opacity="0.45"/>

      {/* E - 감수성 */}
      <circle cx="62" cy="88" r="10" fill="#818cf8" opacity="0.85"/>
      <text x="62" y="92" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">E</text>
      <line x1="71" y1="93" x2="96" y2="108" stroke="#818cf8" strokeWidth="1.2" opacity="0.45"/>

      {/* ── 중심 광원 ────────────────────────────────────── */}
      <circle cx="140" cy="128" r="18" fill="url(#glow)" opacity="0.5"/>
      <circle cx="140" cy="128" r="8" fill="white" opacity="0.85"/>
      <circle cx="138" cy="125" r="3" fill="white" opacity="0.5"/>

      {/* 방사 펄스 */}
      <circle cx="140" cy="128" r="22" stroke="white" strokeWidth="0.8" fill="none" opacity="0.2"/>
      <circle cx="140" cy="128" r="32" stroke="white" strokeWidth="0.5" fill="none" opacity="0.1"/>

      {/* ── 부유하는 점 (장식) ──────────────────────────── */}
      {[
        [80, 58, '#a78bfa'], [200, 62, '#67e8f9'],
        [52, 148, '#34d399'], [228, 148, '#fbbf24'],
        [88, 220, '#f472b6'], [192, 220, '#818cf8'],
      ].map(([x, y, c], i) => (
        <circle key={`dot-${i}`} cx={x as number} cy={y as number} r="2.5"
          fill={c as string} opacity="0.55"/>
      ))}

      {/* 그라데이션 정의 */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  )
}
