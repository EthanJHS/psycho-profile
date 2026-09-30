'use client'

import { useEffect, useRef, useState } from 'react'

type DrawFn = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void

// ─── 원형별 Canvas 드로우 함수 ────────────────────────────────────────────
const DRAWS: Record<string, DrawFn> = {

  architect: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2
    // 배경 그라디언트
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7)
    bg.addColorStop(0, 'rgba(90,50,180,0.18)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    // 격자
    const spacing = 36, pulse = 0.5 + 0.5 * Math.sin(t * 0.6)
    ctx.strokeStyle = `rgba(124,77,204,${0.12 + pulse * 0.06})`
    ctx.lineWidth = 0.8
    for (let x = (t * 4) % spacing; x < w; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
    // 건물 구조
    const buildings = [[0.25, 0.55, 0.12, 0.45], [0.42, 0.35, 0.10, 0.65], [0.60, 0.45, 0.08, 0.55], [0.74, 0.25, 0.11, 0.75]]
    buildings.forEach(([rx, ry, rw, rh], i) => {
      const x = rx * w, top = ry * h, bw = rw * w, bh = rh * h
      const alpha = 0.15 + 0.1 * Math.sin(t * 0.4 + i)
      const grad = ctx.createLinearGradient(x, top, x, top + bh)
      grad.addColorStop(0, `rgba(196,181,253,${alpha + 0.15})`)
      grad.addColorStop(1, `rgba(124,77,204,${alpha})`)
      ctx.fillStyle = grad
      ctx.fillRect(x - bw / 2, top, bw, bh)
      ctx.strokeStyle = `rgba(196,181,253,${0.4 + 0.2 * Math.sin(t * 0.5 + i)})`
      ctx.lineWidth = 1.2
      ctx.strokeRect(x - bw / 2, top, bw, bh)
      // 창문 불빛
      const winAlpha = 0.6 + 0.4 * Math.sin(t * 1.2 + i * 2.1)
      ctx.fillStyle = `rgba(220,200,255,${winAlpha})`
      ctx.fillRect(x - 3, top + bh * 0.2, 6, 4)
      ctx.fillRect(x - 3, top + bh * 0.45, 6, 4)
    })
    // 지평선
    ctx.strokeStyle = `rgba(196,181,253,${0.6 + 0.2 * pulse})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, h * 0.8); ctx.lineTo(w, h * 0.8); ctx.stroke()
    // 측정 노드
    ctx.fillStyle = `rgba(220,200,255,${0.8 + 0.2 * pulse})`
    buildings.forEach(([rx]) => {
      ctx.beginPath(); ctx.arc(rx * w, h * 0.8, 3.5, 0, Math.PI * 2); ctx.fill()
    })
  },

  guardian: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.48
    // 배경 글로우
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6)
    bg.addColorStop(0, 'rgba(52,211,153,0.15)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 파동 원
    for (let i = 3; i >= 0; i--) {
      const phase = (t * 0.5 + i * 0.7) % (Math.PI * 2)
      const r = 40 + i * 28 + Math.sin(phase) * 6
      const alpha = 0.06 + 0.04 * Math.sin(t * 0.4 + i)
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(52,211,153,${alpha * 3})`; ctx.lineWidth = 1; ctx.stroke()
    }
    // 방패
    const sh = 110, sw = 80, sy = cy - sh * 0.52
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.7)
    ctx.beginPath()
    ctx.moveTo(cx, sy)
    ctx.bezierCurveTo(cx + sw * 0.6, sy, cx + sw * 0.6, sy + sh * 0.5, cx, sy + sh)
    ctx.bezierCurveTo(cx - sw * 0.6, sy + sh * 0.5, cx - sw * 0.6, sy, cx, sy)
    const shieldGrad = ctx.createLinearGradient(cx, sy, cx, sy + sh)
    shieldGrad.addColorStop(0, `rgba(52,211,153,${0.2 + pulse * 0.1})`)
    shieldGrad.addColorStop(1, `rgba(16,185,129,${0.08})`)
    ctx.fillStyle = shieldGrad; ctx.fill()
    ctx.strokeStyle = `rgba(52,211,153,${0.7 + pulse * 0.3})`; ctx.lineWidth = 2; ctx.stroke()
    // 십자
    ctx.strokeStyle = `rgba(110,231,183,${0.55 + pulse * 0.2})`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(cx, sy + 18); ctx.lineTo(cx, sy + sh - 20); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - 25, sy + sh * 0.38); ctx.lineTo(cx + 25, sy + sh * 0.38); ctx.stroke()
  },

  explorer: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.48
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.65)
    bg.addColorStop(0, 'rgba(251,191,36,0.15)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 나침반 원
    const r = 65, pulse = 0.5 + 0.5 * Math.sin(t * 0.5)
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(251,191,36,${0.35 + pulse * 0.15})`; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(251,191,36,0.2)`; ctx.lineWidth = 1; ctx.stroke()
    // 방위선
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      ctx.beginPath()
      ctx.moveTo(cx + r * 0.7 * Math.cos(angle), cy + r * 0.7 * Math.sin(angle))
      ctx.lineTo(cx + (r + 12) * Math.cos(angle), cy + (r + 12) * Math.sin(angle))
      ctx.strokeStyle = i % 2 === 0 ? `rgba(251,191,36,0.7)` : `rgba(251,191,36,0.3)`
      ctx.lineWidth = i % 2 === 0 ? 2 : 1; ctx.stroke()
    }
    // 회전 바늘
    const needleAngle = t * 0.3
    ctx.save(); ctx.translate(cx, cy)
    ctx.beginPath()
    ctx.moveTo(Math.cos(needleAngle) * r * 0.55, Math.sin(needleAngle) * r * 0.55)
    ctx.lineTo(Math.cos(needleAngle + Math.PI) * r * 0.35, Math.sin(needleAngle + Math.PI) * r * 0.35)
    ctx.strokeStyle = `rgba(251,191,36,0.9)`; ctx.lineWidth = 2.5; ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(Math.cos(needleAngle + Math.PI) * r * 0.35, Math.sin(needleAngle + Math.PI) * r * 0.35)
    ctx.lineTo(Math.cos(needleAngle) * r * 0.55, Math.sin(needleAngle) * r * 0.55)
    ctx.strokeStyle = `rgba(180,120,20,0.6)`; ctx.lineWidth = 2.5; ctx.stroke()
    ctx.restore()
    // 궤적 파티클
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + t * 0.15
      const dist = r * 1.2 + Math.sin(t * 0.8 + i) * 20
      const alpha = 0.3 + 0.4 * Math.sin(t * 0.6 + i * 0.5)
      ctx.beginPath(); ctx.arc(cx + dist * Math.cos(angle), cy + dist * Math.sin(angle), 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(251,191,36,${alpha})`; ctx.fill()
    }
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(251,191,36,0.9)`; ctx.fill()
  },

  prophet: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.42
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7)
    bg.addColorStop(0, 'rgba(192,132,252,0.2)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 별자리 점들
    const stars = [
      [0.5, 0.18], [0.35, 0.35], [0.65, 0.32], [0.28, 0.55], [0.72, 0.52],
      [0.45, 0.68], [0.58, 0.72], [0.20, 0.40], [0.80, 0.38],
    ]
    const connections = [[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[1,2],[5,6],[0,8],[0,7]]
    // 연결선
    connections.forEach(([a, b], i) => {
      const [ax, ay] = stars[a], [bx, by] = stars[b]
      const alpha = 0.15 + 0.1 * Math.sin(t * 0.4 + i * 0.5)
      ctx.beginPath()
      ctx.moveTo(ax * w, ay * h); ctx.lineTo(bx * w, by * h)
      ctx.strokeStyle = `rgba(192,132,252,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke()
    })
    // 별 점
    stars.forEach(([sx, sy], i) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.1)
      const r = 3 + pulse * 3
      // 글로우
      const glow = ctx.createRadialGradient(sx * w, sy * h, 0, sx * w, sy * h, r * 4)
      glow.addColorStop(0, `rgba(232,121,249,${0.4 * pulse})`)
      glow.addColorStop(1, 'rgba(232,121,249,0)')
      ctx.fillStyle = glow
      ctx.beginPath(); ctx.arc(sx * w, sy * h, r * 4, 0, Math.PI * 2); ctx.fill()
      // 점
      ctx.beginPath(); ctx.arc(sx * w, sy * h, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(232,121,249,${0.7 + 0.3 * pulse})`; ctx.fill()
    })
    // 메인 별 (중앙 상단)
    const ms = stars[0], mp = 0.5 + 0.5 * Math.sin(t * 1.0)
    const mpts = Array.from({length: 10}, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? 18 + mp * 4 : 8
      return [ms[0] * w + r * Math.cos(angle), ms[1] * h + r * Math.sin(angle)]
    })
    ctx.beginPath(); ctx.moveTo(mpts[0][0], mpts[0][1])
    mpts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.closePath()
    ctx.fillStyle = `rgba(232,121,249,${0.6 + mp * 0.3})`; ctx.fill()
    // 파동
    for (let i = 1; i <= 3; i++) {
      const r = 20 * i + 15 * Math.sin(t * 0.5)
      ctx.beginPath(); ctx.arc(ms[0] * w, ms[1] * h, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(192,132,252,${0.2 / i})`; ctx.lineWidth = 1; ctx.stroke()
    }
  },

  warrior: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.52
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.2)
    const bg = ctx.createRadialGradient(cx, h * 0.1, 0, cx, cy, h)
    bg.addColorStop(0, `rgba(248,113,113,${0.15 + pulse * 0.1})`)
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 중첩 삼각형
    const triangles = [
      { scale: 1.0, alpha: 0.5 }, { scale: 0.72, alpha: 0.35 }, { scale: 0.44, alpha: 0.2 }
    ]
    triangles.forEach(({ scale, alpha }, i) => {
      const tw = w * 0.5 * scale, th = h * 0.72 * scale
      const ty = cy - th * 0.55
      ctx.beginPath()
      ctx.moveTo(cx, ty)
      ctx.lineTo(cx + tw, ty + th)
      ctx.lineTo(cx - tw, ty + th)
      ctx.closePath()
      ctx.strokeStyle = `rgba(248,113,113,${alpha + 0.1 * Math.sin(t * 0.6 + i)})`
      ctx.lineWidth = 2 - i * 0.5; ctx.stroke()
      if (i === 0) {
        const triGrad = ctx.createLinearGradient(cx, ty, cx, ty + th)
        triGrad.addColorStop(0, `rgba(248,113,113,${0.15 + pulse * 0.08})`)
        triGrad.addColorStop(1, 'rgba(239,68,68,0.04)')
        ctx.fillStyle = triGrad; ctx.fill()
      }
    })
    // 중심 에너지 빔
    ctx.save()
    const beamGrad = ctx.createLinearGradient(cx, cy - h * 0.35, cx, cy)
    beamGrad.addColorStop(0, `rgba(252,165,165,${0.8 + pulse * 0.2})`)
    beamGrad.addColorStop(1, 'rgba(248,113,113,0)')
    ctx.strokeStyle = beamGrad; ctx.lineWidth = 2 + pulse * 2
    ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.35); ctx.lineTo(cx, cy + h * 0.28); ctx.stroke()
    ctx.restore()
    // 정점 글로우
    const apexY = cy - h * 0.35 * 1.0
    const glow = ctx.createRadialGradient(cx, apexY, 0, cx, apexY, 30)
    glow.addColorStop(0, `rgba(252,165,165,${0.7 + pulse * 0.3})`)
    glow.addColorStop(1, 'rgba(252,165,165,0)')
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, apexY, 30, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx, apexY, 5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,220,220,${0.9 + pulse * 0.1})`; ctx.fill()
  },

  seeker: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, flaskTop = h * 0.12, flaskH = h * 0.82
    const bg = ctx.createRadialGradient(cx, h * 0.7, 0, cx, h * 0.7, w * 0.6)
    bg.addColorStop(0, 'rgba(251,191,36,0.2)')
    bg.addColorStop(0.6, 'rgba(167,139,250,0.1)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 플라스크 형태
    const neckW = 22, bodyW = 90, neckH = flaskH * 0.32, bodyH = flaskH * 0.55
    const neckTop = flaskTop, bodyTop = flaskTop + neckH
    ctx.beginPath()
    ctx.moveTo(cx - neckW, neckTop)
    ctx.lineTo(cx - neckW, bodyTop)
    ctx.bezierCurveTo(cx - neckW - 30, bodyTop + 20, cx - bodyW, bodyTop + 30, cx - bodyW, bodyTop + bodyH * 0.5)
    ctx.bezierCurveTo(cx - bodyW, bodyTop + bodyH, cx + bodyW, bodyTop + bodyH, cx + bodyW, bodyTop + bodyH * 0.5)
    ctx.bezierCurveTo(cx + bodyW, bodyTop + 30, cx + neckW + 30, bodyTop + 20, cx + neckW, bodyTop)
    ctx.lineTo(cx + neckW, neckTop)
    ctx.strokeStyle = `rgba(251,191,36,0.6)`; ctx.lineWidth = 1.8; ctx.stroke()
    // 액체 레벨
    const liquidY = bodyTop + bodyH * 0.2
    const liquidGrad = ctx.createLinearGradient(cx, liquidY, cx, bodyTop + bodyH)
    liquidGrad.addColorStop(0, 'rgba(251,191,36,0.5)')
    liquidGrad.addColorStop(0.5, 'rgba(167,139,250,0.4)')
    liquidGrad.addColorStop(1, 'rgba(167,139,250,0.2)')
    ctx.fillStyle = liquidGrad
    ctx.beginPath()
    ctx.moveTo(cx - bodyW + 5, liquidY + 10)
    const waveAmp = 5, waveFreq = 0.06
    for (let x = cx - bodyW + 5; x <= cx + bodyW - 5; x += 2) {
      const waveY = liquidY + 10 + waveAmp * Math.sin(x * waveFreq + t * 2)
      ctx.lineTo(x, waveY)
    }
    ctx.lineTo(cx + bodyW - 5, bodyTop + bodyH - 5)
    ctx.lineTo(cx - bodyW + 5, bodyTop + bodyH - 5)
    ctx.closePath(); ctx.fill()
    // 거품 파티클
    for (let i = 0; i < 8; i++) {
      const bx = cx + (Math.sin(i * 1.7) * bodyW * 0.6)
      const by = bodyTop + bodyH - ((t * 40 + i * 25) % (bodyH * 0.75)) - 10
      if (by > liquidY) {
        const alpha = 0.4 + 0.3 * Math.sin(t * 2 + i)
        ctx.beginPath(); ctx.arc(bx, by, 4 + Math.sin(i) * 2, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(251,191,36,${alpha})`; ctx.lineWidth = 1; ctx.stroke()
      }
    }
    // 증기 파티클 (상단)
    for (let i = 0; i < 5; i++) {
      const sx = cx + Math.sin(t * 0.8 + i * 1.2) * neckW * 0.6
      const sy = neckTop - (t * 25 + i * 18) % 45
      const alpha = Math.max(0, 0.5 - ((neckTop - sy) / 45))
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(167,139,250,${alpha})`; ctx.fill()
    }
  },

  sovereign: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.45
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.6)
    // 방사형 글로우 배경
    const bg = ctx.createRadialGradient(cx, cy * 0.5, 0, cx, cy, w * 0.75)
    bg.addColorStop(0, `rgba(251,191,36,${0.25 + pulse * 0.1})`)
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 방사선
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + t * 0.1
      const len = (i % 2 === 0 ? 130 : 80) + Math.sin(t * 0.5 + i) * 10
      const alpha = (i % 2 === 0 ? 0.35 : 0.15) + 0.1 * Math.sin(t * 0.4 + i * 0.4)
      ctx.beginPath()
      ctx.moveTo(cx + 15 * Math.cos(angle), cy * 0.5 + 15 * Math.sin(angle))
      ctx.lineTo(cx + len * Math.cos(angle), cy * 0.5 + len * Math.sin(angle))
      ctx.strokeStyle = `rgba(251,191,36,${alpha})`; ctx.lineWidth = i % 2 === 0 ? 1.5 : 0.8; ctx.stroke()
    }
    // 왕관
    const crownY = cy * 0.35, crownW = 110, crownH = 55
    const points = [
      [cx - crownW / 2, crownY + crownH],
      [cx - crownW / 2, crownY + crownH * 0.35],
      [cx - crownW * 0.28, crownY + crownH * 0.7],
      [cx - crownW * 0.12, crownY],
      [cx, crownY + crownH * 0.4],
      [cx + crownW * 0.12, crownY],
      [cx + crownW * 0.28, crownY + crownH * 0.7],
      [cx + crownW / 2, crownY + crownH * 0.35],
      [cx + crownW / 2, crownY + crownH],
    ]
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1])
    points.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.closePath()
    const crownGrad = ctx.createLinearGradient(cx, crownY, cx, crownY + crownH)
    crownGrad.addColorStop(0, `rgba(251,191,36,${0.55 + pulse * 0.2})`)
    crownGrad.addColorStop(1, `rgba(245,158,11,${0.2})`)
    ctx.fillStyle = crownGrad; ctx.fill()
    ctx.strokeStyle = `rgba(251,191,36,${0.8 + pulse * 0.2})`; ctx.lineWidth = 2; ctx.stroke()
    // 보석
    const gems: [number, number][] = [[cx, crownY], [cx - crownW * 0.12, crownY], [cx + crownW * 0.12, crownY]]
    gems.forEach(([gx, gy]) => {
      ctx.beginPath(); ctx.arc(gx, gy, 4 + pulse * 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(254,240,138,${0.8 + pulse * 0.2})`; ctx.fill()
    })
  },

  sage: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, 'rgba(56,189,248,0.08)')
    bg.addColorStop(1, 'rgba(14,165,233,0.04)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 책 레이어
    const books = 5
    for (let i = 0; i < books; i++) {
      const y = h * 0.12 + i * (h * 0.14)
      const bw = w * (0.62 - i * 0.04)
      const bx = (w - bw) / 2
      const scanProgress = (t * 0.4 + i * 0.3) % 2
      const scanAlpha = scanProgress < 1 ? scanProgress : 2 - scanProgress
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.5 + i * 0.7)
      // 책 배경
      const bookGrad = ctx.createLinearGradient(bx, y, bx + bw, y)
      bookGrad.addColorStop(0, `rgba(56,189,248,${0.06 + i * 0.02})`)
      bookGrad.addColorStop(1, `rgba(56,189,248,${0.02})`)
      ctx.fillStyle = bookGrad
      ctx.beginPath(); ctx.roundRect(bx, y, bw, h * 0.1, 3); ctx.fill()
      // 테두리
      ctx.strokeStyle = `rgba(56,189,248,${0.3 + pulse * 0.1 - i * 0.04})`
      ctx.lineWidth = i === 0 ? 1.8 : 1; ctx.stroke()
      // 텍스트 라인
      const lineCount = 3
      for (let l = 0; l < lineCount; l++) {
        const lx = bx + 20, ly = y + h * 0.026 + l * (h * 0.026)
        const lw = bw * (0.4 + Math.random() * 0.35)
        ctx.fillStyle = `rgba(125,211,252,${0.25 + pulse * 0.05})`
        ctx.beginPath(); ctx.roundRect(lx, ly, lw, 3, 1.5); ctx.fill()
      }
      // 스캔 라인
      if (i === 0) {
        ctx.fillStyle = `rgba(125,211,252,${0.4 * scanAlpha})`
        ctx.fillRect(bx, y, bw * scanProgress % 1, h * 0.1)
      }
    }
    // 인사이트 원
    const iy = h * 0.82, pulse2 = 0.5 + 0.5 * Math.sin(t * 0.8)
    for (let i = 2; i >= 0; i--) {
      ctx.beginPath(); ctx.arc(w * 0.18, iy, 18 + i * 10, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(56,189,248,${0.15 - i * 0.04})`; ctx.lineWidth = 1; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(w * 0.18, iy, 18, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(56,189,248,${0.15 + pulse2 * 0.1})`; ctx.fill()
    ctx.strokeStyle = `rgba(125,211,252,0.6)`; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.strokeStyle = `rgba(125,211,252,0.35)`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(w * 0.18 + 18, iy); ctx.lineTo(w * 0.82, iy); ctx.stroke()
  },

  harmonizer: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const waves = [
      { color: '52,211,153', amp: 28, freq: 0.018, speed: 0.8, phase: 0 },
      { color: '167,139,250', amp: 22, freq: 0.022, speed: 1.0, phase: 1.2 },
      { color: '56,189,248', amp: 18, freq: 0.026, speed: 0.7, phase: 2.4 },
      { color: '52,211,153', amp: 12, freq: 0.030, speed: 1.2, phase: 0.6 },
      { color: '249,115,22', amp: 8, freq: 0.016, speed: 0.9, phase: 3.6 },
    ]
    // 배경 그라디언트
    const bg = ctx.createLinearGradient(0, 0, w, 0)
    bg.addColorStop(0, 'rgba(52,211,153,0.06)')
    bg.addColorStop(0.5, 'rgba(167,139,250,0.1)')
    bg.addColorStop(1, 'rgba(56,189,248,0.06)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 파동
    waves.forEach(({ color, amp, freq, speed, phase }, wi) => {
      const yBase = h * (0.25 + wi * 0.125)
      ctx.beginPath(); ctx.moveTo(0, yBase)
      for (let x = 0; x <= w; x += 2) {
        const y = yBase + amp * Math.sin(x * freq + t * speed + phase)
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${color},${0.55 - wi * 0.06})`
      ctx.lineWidth = 2.2 - wi * 0.28; ctx.stroke()
    })
    // 공명 원
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.7)
    for (let i = 3; i >= 1; i--) {
      ctx.beginPath(); ctx.arc(cx, h / 2, 18 * i + pulse * 5, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(167,139,250,${0.12 / i})`; ctx.lineWidth = 1; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(cx, h / 2, 10, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(167,139,250,${0.5 + pulse * 0.3})`; ctx.fill()
  },

  rebel: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.55
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5)
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7)
    bg.addColorStop(0, `rgba(249,115,22,${0.2 + pulse * 0.1})`)
    bg.addColorStop(0.5, 'rgba(239,68,68,0.08)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 파편 조각들
    const fragments = [
      { x: 0.18, y: 0.55, angle: -0.8, len: 80, w: 12 },
      { x: 0.35, y: 0.38, angle: 0.4, len: 65, w: 8 },
      { x: 0.50, y: 0.62, angle: -0.2, len: 90, w: 14 },
      { x: 0.65, y: 0.32, angle: 1.1, len: 55, w: 7 },
      { x: 0.78, y: 0.58, angle: -1.3, len: 70, w: 10 },
      { x: 0.28, y: 0.72, angle: 0.7, len: 50, w: 6 },
      { x: 0.62, y: 0.75, angle: -0.5, len: 60, w: 9 },
    ]
    fragments.forEach(({ x, y, angle, len, w: fw }, i) => {
      const drift = Math.sin(t * 0.4 + i * 0.9) * 4
      const fx = x * w + drift, fy = y * h + drift * 0.5
      const a = angle + Math.sin(t * 0.3 + i * 0.5) * 0.1
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(a)
      const fragGrad = ctx.createLinearGradient(-len / 2, 0, len / 2, 0)
      fragGrad.addColorStop(0, 'rgba(249,115,22,0)')
      fragGrad.addColorStop(0.3, `rgba(249,115,22,${0.5 + pulse * 0.2})`)
      fragGrad.addColorStop(0.7, `rgba(239,68,68,${0.4 + pulse * 0.15})`)
      fragGrad.addColorStop(1, 'rgba(239,68,68,0)')
      ctx.fillStyle = fragGrad
      ctx.beginPath(); ctx.roundRect(-len / 2, -fw / 2, len, fw, 2); ctx.fill()
      ctx.restore()
    })
    // 불꽃 파티클
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const r = 30 + Math.sin(t * 1.5 + i * 0.7) * 20
      const fx = cx + r * Math.cos(angle), fy = cy + r * Math.sin(angle) * 0.6
      const alpha = 0.3 + 0.5 * Math.sin(t * 2 + i * 0.5)
      ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${i % 2 === 0 ? '249,115,22' : '239,68,68'},${alpha})`; ctx.fill()
    }
    // 균열선
    const crackPts = [[cx - 80, cy - 30], [cx - 20, cy + 10], [cx + 40, cy - 20], [cx + 100, cy + 25]]
    ctx.beginPath(); ctx.moveTo(crackPts[0][0], crackPts[0][1])
    crackPts.forEach(([px, py]) => ctx.lineTo(px, py))
    ctx.strokeStyle = `rgba(254,215,170,${0.5 + pulse * 0.3})`; ctx.lineWidth = 2; ctx.stroke()
  },

  lover: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.46
    const heartbeat = 0.5 + 0.5 * Math.sin(t * 1.8)
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.65)
    bg.addColorStop(0, `rgba(244,114,182,${0.2 + heartbeat * 0.1})`)
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 파동 하트들
    for (let layer = 2; layer >= 0; layer--) {
      const scale = 1 + layer * 0.45 + heartbeat * 0.08
      const alpha = 0.12 - layer * 0.03
      ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale)
      ctx.beginPath()
      ctx.moveTo(0, -8)
      ctx.bezierCurveTo(-40, -55, -80, -10, -40, 30)
      ctx.bezierCurveTo(-20, 55, 0, 65, 0, 65)
      ctx.bezierCurveTo(0, 65, 20, 55, 40, 30)
      ctx.bezierCurveTo(80, -10, 40, -55, 0, -8)
      ctx.strokeStyle = `rgba(244,114,182,${alpha * 4})`; ctx.lineWidth = 1 / scale; ctx.stroke()
      ctx.restore()
    }
    // 메인 하트
    const s = 1 + heartbeat * 0.05
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s)
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.bezierCurveTo(-40, -55, -80, -10, -40, 30)
    ctx.bezierCurveTo(-20, 55, 0, 65, 0, 65)
    ctx.bezierCurveTo(0, 65, 20, 55, 40, 30)
    ctx.bezierCurveTo(80, -10, 40, -55, 0, -8)
    const hGrad = ctx.createLinearGradient(0, -55, 0, 65)
    hGrad.addColorStop(0, `rgba(251,113,133,${0.4 + heartbeat * 0.2})`)
    hGrad.addColorStop(1, `rgba(244,114,182,${0.2})`)
    ctx.fillStyle = hGrad; ctx.fill()
    ctx.strokeStyle = `rgba(251,113,133,${0.7 + heartbeat * 0.3})`; ctx.lineWidth = 2; ctx.stroke()
    ctx.restore()
    // 입자
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + t * 0.3
      const r = 80 + Math.sin(t * 0.8 + i) * 25
      const px = cx + r * Math.cos(angle), py = cy + r * Math.sin(angle) * 0.75
      const alpha = 0.2 + 0.5 * Math.sin(t * 1.0 + i * 0.8)
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(251,113,133,${alpha})`; ctx.fill()
    }
  },

  catalyst: (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.48
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.0)
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.65)
    bg.addColorStop(0, `rgba(250,204,21,${0.3 + pulse * 0.15})`)
    bg.addColorStop(0.4, 'rgba(249,115,22,0.1)')
    bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // 방사 전기선
    const rayCount = 14
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + t * 0.15
      const len = (i % 2 === 0 ? 120 : 85) + Math.sin(t * 2.5 + i) * 20
      const jitter = (Math.sin(t * 8 + i * 3.7) * 8)
      const mx = cx + len * 0.5 * Math.cos(angle) + jitter
      const my = cy + len * 0.5 * Math.sin(angle) + jitter * 0.5
      const ex = cx + len * Math.cos(angle)
      const ey = cy + len * Math.sin(angle)
      const alpha = (i % 2 === 0 ? 0.7 : 0.35) + pulse * 0.2
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(mx, my, ex, ey)
      ctx.strokeStyle = `rgba(250,204,21,${alpha})`
      ctx.lineWidth = i % 2 === 0 ? 1.8 : 0.9; ctx.stroke()
    }
    // 중심 코어
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35 + pulse * 10)
    coreGlow.addColorStop(0, `rgba(255,255,200,${0.9})`)
    coreGlow.addColorStop(0.3, `rgba(250,204,21,${0.7 + pulse * 0.2})`)
    coreGlow.addColorStop(1, 'rgba(249,115,22,0)')
    ctx.fillStyle = coreGlow
    ctx.beginPath(); ctx.arc(cx, cy, 35 + pulse * 10, 0, Math.PI * 2); ctx.fill()
    // 별 형태
    const starPts = 8, outerR = 16 + pulse * 5, innerR = 7
    ctx.beginPath()
    for (let i = 0; i < starPts * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (i / (starPts * 2)) * Math.PI * 2 - Math.PI / 2
      if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
    }
    ctx.closePath()
    ctx.fillStyle = `rgba(255,255,220,${0.9 + pulse * 0.1})`; ctx.fill()
    // 외곽 파티클
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + t * 0.4
      const r = 105 + Math.sin(t * 1.5 + i) * 20
      const alpha = 0.2 + 0.6 * Math.sin(t * 2.0 + i * 0.7)
      ctx.beginPath(); ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(250,204,21,${alpha})`; ctx.fill()
    }
  },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────
interface Props {
  archetypeId: string
  driveId?: string
  height?: number
}

export default function ArchetypeCanvas({ archetypeId, driveId, height = 150 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  // 이미지 파일 존재 여부 체크
  useEffect(() => {
    if (!archetypeId || !driveId) { setImgSrc(null); return }
    const src = `/archetypes/${archetypeId}_${driveId}.jpg`
    const img = new Image()
    img.onload = () => setImgSrc(src)
    img.onerror = () => setImgSrc(null)
    img.src = src
  }, [archetypeId, driveId])

  // Canvas 애니메이션
  useEffect(() => {
    if (imgSrc) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const draw = DRAWS[archetypeId]
    if (!draw) return

    const startTime = performance.now()
    const loop = (now: number) => {
      const t = (now - startTime) / 1000
      const w = canvas.width, h = canvas.height
      draw(ctx, t, w, h)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [archetypeId, imgSrc])

  if (imgSrc) {
    return (
      <div style={{ width: '100%', height, overflow: 'hidden', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to bottom, transparent, var(--surface))' }} />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height, overflow: 'hidden', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={height * 2}
        style={{ width: '100%', height: '100%' }}
      />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to bottom, transparent, var(--surface))' }} />
    </div>
  )
}
