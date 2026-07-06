'use client'

import { useState } from 'react'
import Script from 'next/script'

interface Props {
  profileLabel: string
  profileId: string
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share: {
        sendDefault: (opts: object) => void
      }
    }
  }
}

export default function ShareButtons({ profileLabel, profileId: _profileId }: Props) {
  const [copied, setCopied] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [kakaoReady, setKakaoReady] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://psycho-profile-eta.vercel.app'
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ''
  const shareText = `나의 심리 프로파일은 "${profileLabel}" 🔮\n192개 유형 중 나에게 딱 맞는 분석을 받아봐. 너도 해봐 →`

  function onKakaoLoad() {
    if (kakaoKey && window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey)
    }
    setKakaoReady(true)
  }

  function shareKakao() {
    // SDK 방식 (앱 키 있을 때): 카카오톡 링크 메시지 전송
    if (kakaoKey && window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `나의 심리 프로파일: "${profileLabel}"`,
          description: '192개 유형 중 나에게 딱 맞는 성격 분석 — 너도 받아봐!',
          imageUrl: `${siteUrl}/og-image.png`,
          link: { mobileWebUrl: siteUrl, webUrl: siteUrl },
        },
        buttons: [{ title: '나도 검사하기', link: { mobileWebUrl: siteUrl, webUrl: siteUrl } }],
      })
      return
    }

    // 모바일 네이티브 공유 시트 (iOS/Android — KakaoTalk 포함됨)
    if (navigator.share) {
      navigator.share({ title: `나의 심리 프로파일: ${profileLabel}`, text: shareText, url: siteUrl }).catch(() => {})
      return
    }

    // 데스크톱 폴백: 링크 복사 후 안내
    navigator.clipboard.writeText(`${shareText}\n${siteUrl}`).catch(() => {})
    alert('링크가 복사됐습니다. 카카오톡에 붙여넣기 하세요!')
  }

  function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`
    window.open(url, '_blank', 'noopener,width=600,height=400')
  }

  function shareThreads() {
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shareText} ${siteUrl}`)}`
    window.open(url, '_blank', 'noopener,width=600,height=500')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${siteUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('아래 텍스트를 복사하세요:', `${shareText} ${siteUrl}`)
    }
  }

  function savePDF() {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 200)
  }

  return (
    <>
      {/* Kakao SDK — 키 있을 때만 로드 */}
      {kakaoKey && (
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          onLoad={onKakaoLoad}
        />
      )}

      <div className="glass rounded-2xl p-6 print:hidden">
        <h2 className="font-semibold mb-1 flex items-center gap-2"><span>📤</span> 결과 공유 / 저장</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>친구에게 공유하거나 PDF로 저장하세요</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={shareKakao}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95"
            style={{ background: '#fee500', color: '#181600' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.573 5.093 3.961 6.565L5 21l4.459-2.375C10.259 18.858 11.116 19 12 19c5.523 0 10-3.477 10-8S17.523 3 12 3z"/>
            </svg>
            카카오 공유
          </button>

          <button
            onClick={shareTwitter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95"
            style={{ background: '#0f0f0f', border: '1px solid #333', color: '#e8e8f0' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </button>

          <button
            onClick={shareThreads}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95"
            style={{ background: '#1a1a1a', border: '1px solid #444', color: '#e8e8f0' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.474 12.01v-.017c.03-3.579.782-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.361-.887h-.081c-.772 0-1.92.212-2.646 1.22l-1.688-1.17c.943-1.372 2.407-2.139 4.112-2.153h.115c3.443.03 5.51 2.114 5.746 5.796l.002.056c.032.566.003 1.124-.086 1.672l.255.154c1.226.738 2.028 1.747 2.519 2.875.894 2.047.868 5.09-1.608 7.504-1.93 1.891-4.365 2.738-7.5 2.762Z"/>
            </svg>
            Threads
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-85 active:scale-95"
            style={{
              background: copied ? 'rgba(52,211,153,0.15)' : 'var(--surface2)',
              border: `1px solid ${copied ? '#34d39960' : 'var(--border)'}`,
              color: copied ? '#34d399' : 'var(--text)',
            }}
          >
            {copied ? (
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
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)', opacity: 0.6 }}>인쇄 창에서 "PDF로 저장" 선택</p>
      </div>
    </>
  )
}
