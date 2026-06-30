'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ProfileData {
  profileLabel: string
  dominantTraits: string[]
  cognitiveStyle: string
  cogScore: number
  facets: Record<string, number>
  careers: { title: string; fit: number; reason: string }[]
  warnings: string[]
  growthDirection?: string
}

interface DeepProfileData {
  attachment?: { style: string; summary: string }
  leadership?: { style: string; summary: string }
  burnout?: { level: string; score: number; summary: string }
  values?: { primary: string; secondary: string; summary: string }
}

const MAX_TURNS = 10

const STARTER_QUESTIONS = [
  '제 진로 1순위가 저와 잘 맞는 이유가 뭔가요?',
  '제 성격에서 가장 주의해야 할 점은 무엇인가요?',
  '저와 잘 맞는 직장 환경이 어떤 곳인가요?',
  '제 성격으로 번아웃이 올 수 있는 상황은?',
]

export default function ResultChat({
  profile,
  deepProfile,
}: {
  profile: ProfileData
  deepProfile?: DeepProfileData
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `안녕하세요! 검사 결과를 바탕으로 질문에 답해드릴게요. "${profile.profileLabel}" 유형에 대해 더 궁금한 게 있으신가요?`,
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [turnsLeft, setTurnsLeft] = useState(MAX_TURNS)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || streaming || turnsLeft <= 0) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setTurnsLeft(t => t - 1)

    // 빈 어시스턴트 메시지 먼저 추가
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(1), // 초기 인사말 제외
          profile,
          deepProfile,
        }),
      })

      if (!res.ok || !res.body) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '죄송합니다, 잠시 오류가 발생했습니다. 다시 시도해주세요.',
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isDepleted = turnsLeft <= 0

  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ borderColor: 'rgba(124,77,204,0.3)' }}>
      {/* 헤더 */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(124,77,204,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            🧠
          </div>
          <div>
            <p className="text-sm font-semibold">AI 심리 상담</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>검사 결과 기반 개인 맞춤 상담</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: turnsLeft <= 3 ? '#f87171' : 'var(--muted)' }}>
            {turnsLeft}/{MAX_TURNS}회 남음
          </p>
        </div>
      </div>

      {/* 스타터 질문 (대화 시작 전) */}
      {messages.length === 1 && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>이런 것도 물어볼 수 있어요</p>
          <div className="flex flex-wrap gap-2">
            {STARTER_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{ background: 'rgba(124,77,204,0.12)', color: 'var(--accent2)', border: '1px solid rgba(124,77,204,0.25)' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="px-5 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 420 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                🧠
              </div>
            )}
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={msg.role === 'user'
                ? { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', borderBottomRightRadius: 4 }
                : { background: 'var(--surface2)', color: 'var(--text)', borderBottomLeftRadius: 4 }
              }
            >
              {msg.content || (streaming && i === messages.length - 1
                ? <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted)', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted)', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--muted)', animationDelay: '300ms' }} />
                  </span>
                : ''
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 pb-4">
        {isDepleted ? (
          <div className="text-center py-4 rounded-xl text-sm" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
            사용 가능한 질문 횟수를 모두 사용했습니다.
          </div>
        ) : (
          <div className="flex items-end gap-2 rounded-xl px-4 py-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="궁금한 점을 자유롭게 물어보세요..."
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed disabled:opacity-50"
              style={{ color: 'var(--text)', maxHeight: 120, minHeight: 24 }}
              onInput={e => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-xs text-center mt-2" style={{ color: 'var(--muted)', opacity: 0.5 }}>
          Enter 전송 · Shift+Enter 줄바꿈
        </p>
      </div>
    </div>
  )
}
