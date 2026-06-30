'use client'

interface Axis {
  label: string
  value: number   // 0~100
  sublabel?: string
}

interface Props {
  axes: Axis[]
  size?: number
}

export default function RadarChart({ axes, size = 280 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.34    // 데이터 최대 반경
  const labelR = size * 0.47  // 레이블 반경

  const N = axes.length
  // k번째 축의 각도 (위쪽=0에서 시계 방향)
  function angle(k: number) {
    return (k * 2 * Math.PI) / N - Math.PI / 2
  }
  function pt(k: number, radius: number) {
    const a = angle(k)
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
  }

  // 배경 그리드 (25 / 50 / 75 / 100%)
  const grids = [0.25, 0.5, 0.75, 1.0]

  function polygonPoints(radiusFraction: number) {
    return axes
      .map((_, k) => {
        const p = pt(k, r * radiusFraction)
        return `${p.x},${p.y}`
      })
      .join(' ')
  }

  // 데이터 폴리곤
  const dataPoints = axes
    .map((a, k) => {
      const p = pt(k, r * (a.value / 100))
      return `${p.x},${p.y}`
    })
    .join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* 그리드 다각형 */}
      {grids.map((f, i) => (
        <polygon
          key={i}
          points={polygonPoints(f)}
          fill="none"
          stroke="rgba(160,126,224,0.15)"
          strokeWidth={i === grids.length - 1 ? 1.2 : 0.8}
        />
      ))}

      {/* 축 선 */}
      {axes.map((_, k) => {
        const end = pt(k, r)
        return (
          <line
            key={k}
            x1={cx} y1={cy}
            x2={end.x} y2={end.y}
            stroke="rgba(160,126,224,0.20)"
            strokeWidth={0.8}
          />
        )
      })}

      {/* 데이터 폴리곤 — 채우기 */}
      <polygon
        points={dataPoints}
        fill="rgba(160,126,224,0.18)"
        stroke="none"
      />
      {/* 데이터 폴리곤 — 테두리 */}
      <polygon
        points={dataPoints}
        fill="none"
        stroke="rgba(201,168,248,0.85)"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* 데이터 점 */}
      {axes.map((a, k) => {
        const p = pt(k, r * (a.value / 100))
        return (
          <circle
            key={k}
            cx={p.x} cy={p.y}
            r={3.5}
            fill="#c9a8f8"
            stroke="rgba(16,13,20,0.6)"
            strokeWidth={1.2}
          />
        )
      })}

      {/* 레이블 */}
      {axes.map((a, k) => {
        const lp = pt(k, labelR)
        const a_ = angle(k)

        // 텍스트 앵커 결정
        let anchor: 'middle' | 'start' | 'end'
        if (Math.abs(Math.cos(a_)) < 0.15) anchor = 'middle'
        else if (Math.cos(a_) > 0) anchor = 'start'
        else anchor = 'end'

        // 수직 정렬
        let dy = '0.35em'
        if (Math.sin(a_) < -0.7) dy = '-0.2em'
        else if (Math.sin(a_) > 0.7) dy = '1em'

        return (
          <g key={k}>
            <text
              x={lp.x} y={lp.y}
              textAnchor={anchor}
              dy={dy}
              fontSize={size * 0.048}
              fontWeight="600"
              fill="rgba(237,232,245,0.92)"
            >
              {a.label}
            </text>
            <text
              x={lp.x} y={lp.y}
              textAnchor={anchor}
              dy={parseFloat(dy) + 1.3 + 'em'}
              fontSize={size * 0.040}
              fill="rgba(160,126,224,0.95)"
              fontWeight="700"
            >
              {a.value}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
