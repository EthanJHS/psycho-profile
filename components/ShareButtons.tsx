'use client'

import { useState, useEffect } from 'react'

interface Props {
  profileLabel: string
  profileId?: string
  pdfPath?: string
  resultParam?: string
}

export default function ShareButtons({ profileLabel, pdfPath, resultParam }: Props) {
  const [copied, setCopied] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [showMobilePdfGuide, setShowMobilePdfGuide] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))
    setCanShare(!!navigator.share)
  }, [])

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-trait.com'
  const siteUrl = resultParam ? `${siteBase}/paid-result?r=${resultParam}` : siteBase
  const shareText = `나의 심리 프로파일은 "${profileLabel}" 🔮\n192개 유형 중 나에게 딱 맞는 분석을 받아봐. 너도 해봐 →`

  async function shareOrCopy() {
    if (canShare) {
      try {
        await navigator.share({ title: `나의 심리 프로파일: ${profileLabel}`, text: shareText, url: siteUrl })
        return
      } catch { /* 사용자 취소 등 무시 */ }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${siteUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('아래 텍스트를 복사하세요:', `${shareText} ${siteUrl}`)
    }
  }

  function savePDF() {
    if (isMobile) {
      setShowMobilePdfGuide(true)
      return
    }
    if (pdfPath) {
      window.open(pdfPath, '_blank')
      return
    }
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 200)
  }

  return (
    <>
      <div className="glass rounded-2xl p-6 print:hidden">
        <h2 className="font-semibold mb-1 flex items-center gap-2"><span>📤</span> 결과 공유 / 저장</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>친구에게 공유하거나 PDF로 저장하세요</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={shareOrCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {canShare ? (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>공유하기</>
            ) : copied ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>복사됨!</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>링크 복사</>
            )}
          </button>
        </div>

        <div className="my-4" style={{ borderTop: '1px solid var(--border)' }} />

        <button
          onClick={savePDF}
          disabled={printing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-85 active:scale-95 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(124,77,204,0.2), rgba(160,126,224,0.12))',
            border: '1px solid rgba(160,126,224,0.4)',
            color: 'var(--accent2)',
          }}
        >
          {printing ? (
            <><div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--accent2)', borderTopColor: 'transparent' }} />준비 중...</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>PDF로 저장</>
          )}
        </button>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          {isMobile ? '모바일 PDF 저장 안내를 확인하세요' : '인쇄 창에서 "PDF로 저장" 선택'}
        </p>
      </div>

      {showMobilePdfGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowMobilePdfGuide(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl p-6 space-y-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-base">📄 모바일 PDF 저장 방법</h3>
            <div className="space-y-3">
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface2)' }}>
                <p className="text-sm font-semibold" style={{ color: '#60a5fa' }}>🍎 iPhone / iPad</p>
                <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                  1. 아래 <strong>"결과 페이지 열기"</strong> 버튼 탭<br/>
                  2. Safari 하단 <strong>공유 버튼(□↑)</strong> 탭<br/>
                  3. <strong>"프린트"</strong> 선택 → 미리보기 화면에서 <strong>두 손가락으로 확대</strong><br/>
                  4. PDF가 열리면 상단 공유 버튼으로 저장
                </p>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface2)' }}>
                <p className="text-sm font-semibold" style={{ color: '#34d399' }}>🤖 Android</p>
                <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
                  1. 아래 <strong>"결과 페이지 열기"</strong> 버튼 탭<br/>
                  2. Chrome 우상단 <strong>메뉴(⋮)</strong> → <strong>"공유"</strong> 또는 <strong>"인쇄"</strong><br/>
                  3. 프린터 선택에서 <strong>"PDF로 저장"</strong> 선택
                </p>
              </div>
            </div>
            {pdfPath && (
              <button
                onClick={() => { window.open(pdfPath, '_blank'); setShowMobilePdfGuide(false) }}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                결과 페이지 열기 →
              </button>
            )}
            <button
              onClick={() => setShowMobilePdfGuide(false)}
              className="w-full py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}
