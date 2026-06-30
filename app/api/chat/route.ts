import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const runtime = 'nodejs'

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  profile: {
    profileLabel: string
    dominantTraits: string[]
    cognitiveStyle: string
    cogScore: number
    facets: Record<string, number>
    careers: { title: string; fit: number; reason: string }[]
    warnings: string[]
    growthDirection?: string
  }
  deepProfile?: {
    attachment?: { style: string; summary: string }
    leadership?: { style: string; summary: string }
    burnout?: { level: string; score: number; summary: string }
    values?: { primary: string; secondary: string; summary: string }
  }
}

function buildSystemPrompt(req: ChatRequest): string {
  const { profile, deepProfile } = req

  const facetLabels: Record<string, string> = {
    curiosity: '개방성·호기심',
    diligence: '성실성·지속력',
    boldness: '사회적 대담성',
    humility: '겸손·윤리 의식',
    anxiety: '감수성·정서적 민감도',
    patience: '공감력·원만성',
  }

  const facetLines = Object.entries(profile.facets)
    .map(([k, v]) => {
      const label = facetLabels[k] ?? k
      const pct = Math.round(((v - 1) / 4) * 100)
      return `  - ${label}: ${pct}%`
    })
    .join('\n')

  const careerLines = profile.careers
    .slice(0, 6)
    .map((c, i) => `  ${i + 1}. ${c.title} (${c.fit}%) — ${c.reason}`)
    .join('\n')

  const cogPct = Math.round(profile.cogScore * 100)

  let deepSection = ''
  if (deepProfile) {
    deepSection = `
[심층 분석 결과]
${deepProfile.attachment ? `- 애착 유형: ${deepProfile.attachment.style} — ${deepProfile.attachment.summary}` : ''}
${deepProfile.leadership ? `- 리더십 스타일: ${deepProfile.leadership.style} — ${deepProfile.leadership.summary}` : ''}
${deepProfile.burnout ? `- 번아웃 리스크: ${deepProfile.burnout.level} (${deepProfile.burnout.score}점) — ${deepProfile.burnout.summary}` : ''}
${deepProfile.values ? `- 핵심 가치관: ${deepProfile.values.primary} + ${deepProfile.values.secondary} — ${deepProfile.values.summary}` : ''}`.trim()
  }

  return `당신은 심리 분석 전문 상담사입니다. 아래는 이 사용자의 심리검사 결과입니다. 이 데이터를 바탕으로 사용자의 질문에 깊이 있고 개인화된 답변을 제공하세요.

[기본 프로파일]
- 유형: "${profile.profileLabel}"
- 핵심 특성: ${profile.dominantTraits.join(', ')}
- 사고 스타일: ${profile.cognitiveStyle}
- 인지 수준: ${cogPct}점

[HEXACO 성격 점수]
${facetLines}

[진로 적합도]
${careerLines}

[주의 패턴]
${profile.warnings.map(w => `  - ${w}`).join('\n')}

[성장 방향]
${profile.growthDirection ?? '없음'}

${deepSection}

[대화 지침]
- 반드시 이 검사 결과를 참조하여 구체적으로 답하세요. 일반론은 최소화하세요.
- 수치와 유형명을 자연스럽게 활용하되, 딱딱하지 않게 말하세요.
- 진단이 아닌 탐색적 대화 톤을 유지하세요. "~일 수 있습니다", "~처럼 보입니다" 형태.
- 공감 먼저, 분석 나중. 사용자가 감정적인 이야기를 꺼내면 먼저 수용하세요.
- 답변은 200자 내외로 간결하게. 필요할 때만 길게.
- 한국어로만 대화하세요.`
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest

    if (!body.messages || !body.profile) {
      return new Response(JSON.stringify({ error: 'messages and profile required' }), { status: 400 })
    }

    // 최근 20턴만 유지 (비용 제어)
    const messages = body.messages.slice(-20)

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: buildSystemPrompt(body),
      messages,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[chat API error]', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
