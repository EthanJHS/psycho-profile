import { FacetMap } from './profiles'

function norm(v: number): number { return Math.min(Math.max((v - 1) / 4, 0), 1) }

export function computeNarrativeFreeEN(facets: FacetMap, cogScore: number): string {
  const cur = norm(facets.openness)
  const dil = norm(facets.conscientiousness)
  const bol = norm(facets.extraversion)
  const hum = norm(facets.honesty)
  const anx = norm(facets.emotionality)
  const pat = norm(facets.agreeableness)

  const sentences: string[] = []

  // ── Openness & Curiosity ──
  if (cur >= 0.72) {
    sentences.push('You are strongly drawn to new concepts and fields, and gain a great deal of energy from exploring beyond what you already know.')
  } else if (cur >= 0.47) {
    sentences.push('You go deep within areas that interest you, but need a good reason to venture into completely unfamiliar territory.')
  } else {
    sentences.push('You perform best with proven approaches and deep expertise in known domains, and find satisfaction in mastery rather than novelty.')
  }

  // ── Social energy & Agreeableness ──
  if (bol >= 0.65 && pat >= 0.58) {
    sentences.push('You draw energy from people and maintain relationships with ease. You favour harmony over conflict, but can provide clear direction when the moment calls for it.')
  } else if (bol >= 0.65 && pat < 0.42) {
    sentences.push('You are direct and assertive in social settings, prefer reaching conclusions quickly, and are often perceived as a high-energy presence.')
  } else if (bol < 0.42 && pat >= 0.62) {
    sentences.push('You have a quiet but deep capacity for empathy. You read others\' emotions and needs well, and bring a calming, grounding quality to relationships.')
  } else if (bol < 0.42) {
    sentences.push('You are most at ease alone or with a small circle of trusted people. You value a few deep connections over a wide social network.')
  } else {
    sentences.push('You can shift flexibly between leading and supporting depending on what the situation needs, and adapt well across different relationship contexts.')
  }

  // ── Conscientiousness & Anxiety ──
  if (dil >= 0.65 && anx >= 0.60) {
    sentences.push('You hold yourself to high standards and have a strong drive to meet them. This sensitivity to quality produces outstanding work, though it can also accumulate fatigue over time.')
  } else if (dil >= 0.65 && anx < 0.42) {
    sentences.push('You move steadily toward your goals without excessive stress — a well-balanced execution style that is both consistent and sustainable.')
  } else if (dil < 0.42 && anx >= 0.60) {
    sentences.push('You are emotionally sensitive, with a rich inner life. This sensitivity is a source of creativity and empathy, though managing your energy deliberately matters.')
  } else if (dil < 0.42) {
    sentences.push('You prefer variety and new stimulation over routine, and tend to work best when something captures your genuine interest rather than obligation.')
  } else if (anx < 0.38) {
    sentences.push('You are emotionally steady, maintain composure under pressure, and can make clear-headed judgments even in uncertain or high-stakes situations.')
  } else {
    sentences.push('You maintain a reasonable balance between ambition and self-care, engaging fully when work matters to you without burning out on things that don\'t.')
  }

  // ── Honesty-Humility ──
  if (hum >= 0.65) {
    sentences.push('You are uncomfortable with self-promotion and hold fairness and authenticity as core values. You tend to uphold ethical standards on your own even when no one is watching — a quality that builds deep trust over time.')
  } else if (hum < 0.38) {
    sentences.push('You express yourself confidently, value recognition, and find it natural to assert your contributions and compete for what you want.')
  }

  return sentences.join(' ')
}

export interface RiasecScoreEN {
  code: string
  scores: { type: string; label: string; score: number; desc: string; color: string }[]
  topType: string
  topLabel: string
  summary: string
}

export function computeRiasecFreeEN(facets: FacetMap): RiasecScoreEN {
  const cur = norm(facets.openness)
  const dil = norm(facets.conscientiousness)
  const bol = norm(facets.extraversion)
  const hum = norm(facets.honesty)
  const anx = norm(facets.emotionality)
  const pat = norm(facets.agreeableness)

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

  const raw = {
    R: clamp01(dil * 0.40 + (1 - cur) * 0.35 + (1 - bol) * 0.25),
    I: clamp01(cur * 0.50 + dil * 0.30 + (1 - bol) * 0.20),
    A: clamp01(cur * 0.40 + anx * 0.30 + (1 - dil) * 0.30),
    S: clamp01(pat * 0.40 + bol * 0.30 + hum * 0.30),
    E: clamp01(bol * 0.40 + (1 - pat) * 0.25 + (1 - hum) * 0.35),
    C: clamp01(dil * 0.45 + (1 - cur) * 0.35 + (1 - bol) * 0.20),
  }

  const entries = Object.entries(raw) as [string, number][]
  const vals = entries.map(e => e[1])
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const range = maxV - minV || 0.01

  const scaled: Record<string, number> = {}
  for (const [k, v] of entries) {
    scaled[k] = Math.round(30 + ((v - minV) / range) * 65)
  }

  const META: Record<string, { label: string; desc: string; color: string }> = {
    R: { label: 'Realistic',      color: '#6b7280',
         desc: 'Prefers hands-on, practical work with tools, machines, or the natural world.' },
    I: { label: 'Investigative',  color: '#6366f1',
         desc: 'Drawn to analyzing data, ideas, and intellectual problems.' },
    A: { label: 'Artistic',       color: '#ec4899',
         desc: 'Enjoys creative expression and implementing ideas in unconventional ways.' },
    S: { label: 'Social',         color: '#10b981',
         desc: 'Finds meaning in helping, teaching, and caring for others.' },
    E: { label: 'Enterprising',   color: '#f59e0b',
         desc: 'Thrives in dynamic environments that involve persuading and leading toward goals.' },
    C: { label: 'Conventional',   color: '#38bdf8',
         desc: 'Finds stability in organizing data, following procedures, and systematic work.' },
  }

  const scores = Object.entries(scaled)
    .map(([type, score]) => ({ type, score, ...META[type] }))
    .sort((a, b) => b.score - a.score)

  const top2 = scores.slice(0, 2)
  const code = top2.map(s => s.type).join('')
  const topType = scores[0].type
  const topLabel = scores[0].label

  const SUMMARY: Record<string, string> = {
    I: 'Your strongest type is Investigative — you thrive on intellectual exploration and analysis. Research, science, and data-rich environments tend to be highly satisfying.',
    A: 'Your Artistic orientation stands out. You are drawn to creative expression and originality, and work best in open environments without a single right answer.',
    S: 'You are a Social type, gaining energy from connecting with and helping others. Teaching, counseling, and collaborative roles tend to suit you well.',
    E: 'You lean Enterprising — goal-driven and assertive. You perform well in environments where persuasion and leadership are central.',
    C: 'You have a strong Conventional streak, valuing accuracy and order. Clear procedures and data-based work provide a natural sense of stability.',
    R: 'You are a Realistic type — practical and concrete. You find satisfaction in environments where you can work directly with your hands or apply skills tangibly.',
  }

  return { code, scores, topType, topLabel, summary: SUMMARY[topType] ?? '' }
}
