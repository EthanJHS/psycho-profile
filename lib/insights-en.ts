/**
 * English version: Work Style & Investment Profile
 *
 * Work style: HEXACO occupational psychology (Ashton & Lee 2007, De Vries et al. 2011)
 * Investment profile: behavioral finance (Durand et al. 2008, Mayfield et al. 2008,
 *                    Pak & Mahmood 2015) — US/global market framing
 *
 * ⚠ Investment section reflects personality-based tendencies only — not financial advice.
 */
import { FacetMap } from './profiles'
import type { SubFacetScores } from './paid-scoring'

function norm(v: number): number { return Math.min(Math.max((v - 1) / 4, 0), 1) }
function get(f: FacetMap, key: string): number {
  return norm((f as unknown as Record<string, number>)[key] ?? 3)
}

// ─── Narrative ────────────────────────────────────────────────

export function computeNarrativeEN(facets: FacetMap, cogScore: number): string {
  const cur = norm(facets.openness)
  const dil = norm(facets.conscientiousness)
  const bol = norm(facets.extraversion)
  const hum = norm(facets.honesty)
  const anx = norm(facets.emotionality)
  const pat = norm(facets.agreeableness)

  const sentences: string[] = []

  if (cur >= 0.72) {
    sentences.push('You\'re strongly drawn to new concepts and fields, gaining real energy from exploring beyond familiar territory.')
  } else if (cur >= 0.47) {
    sentences.push('You go deep when something interests you, though you need a compelling reason before venturing into completely unfamiliar territory.')
  } else {
    sentences.push('You perform at your best with proven methods and deep expertise — you find satisfaction in mastery rather than novelty.')
  }

  if (bol >= 0.65 && pat >= 0.58) {
    sentences.push('You\'re socially energized and naturally connect across relationships. You favor harmony over conflict, but can assert direction clearly when it matters.')
  } else if (bol >= 0.65 && pat < 0.42) {
    sentences.push('You\'re direct and action-oriented in social situations — you prefer cutting to conclusions and executing, and others tend to see you as a high-energy presence.')
  } else if (bol < 0.42 && pat >= 0.62) {
    sentences.push('You have quiet but deep empathy — you read people well and bring a sense of calm and reliability to relationships.')
  } else if (bol < 0.42) {
    sentences.push('You\'re most at ease alone or with a small circle of people you trust deeply. You value depth over breadth in relationships.')
  } else {
    sentences.push('You can flexibly shift between leading and supporting roles, adapting well to different relationship dynamics.')
  }

  if (dil >= 0.65 && anx >= 0.60) {
    sentences.push('You hold yourself to high standards and have a strong drive to meet them. This sensitivity to quality produces exceptional output, but can also lead to accumulated fatigue.')
  } else if (dil >= 0.65 && anx < 0.42) {
    sentences.push('You make steady, consistent progress toward goals without excessive stress — a well-balanced and sustainable work style.')
  } else if (dil < 0.42 && anx >= 0.60) {
    sentences.push('You\'re emotionally attuned and feel things deeply. This sensitivity is a source of creativity and empathy, but energy management is key.')
  } else if (dil < 0.42) {
    sentences.push('You produce bursts of intense focus when something genuinely interests you — you\'re motivated by novelty and meaning more than routine.')
  } else {
    sentences.push('You\'re able to commit diligently when needed while managing your energy reasonably well.')
  }

  if (hum >= 0.68) {
    sentences.push('Authenticity and fairness are core values for you. You feel instinctive resistance to self-promotion or using others instrumentally — and that integrity builds deep trust over time.')
  } else if (hum < 0.38) {
    sentences.push('You\'re confident in expressing your abilities and achievements, and have no hesitation putting yourself forward in competitive environments.')
  }

  if (cogScore >= 0.75) {
    sentences.push('You have a strong ability to quickly structure complex problems and identify patterns — you break down difficult concepts systematically rather than being overwhelmed by them.')
  } else if (cogScore >= 0.5) {
    sentences.push('You think logically and can reliably identify the core of a problem.')
  }

  const topFacetLabel = (() => {
    const ranked: [number, string][] = [
      [cur, 'intellectual curiosity'], [dil, 'disciplined follow-through'], [bol, 'social energy'],
      [hum, 'authenticity'], [anx, 'emotional sensitivity'], [pat, 'empathy'],
    ]
    ranked.sort((a, b) => b[0] - a[0])
    return ranked[0][1]
  })()
  sentences.push(`Overall, ${topFacetLabel} is your most defining trait — it shows up consistently in your choices, relationships, and work style. The scores below are not a single type but your own unique personality map.`)

  return sentences.join(' ')
}

// ─── Org Fit (English) ─────────────────────────────────────────

export interface OrgFitEN {
  type: 'Hierarchical' | 'Flat' | 'Flexible'
  score: number          // 0 (hierarchical) → 1 (flat)
  summary: string
  vertical: string       // how you perform in hierarchical orgs
  horizontal: string     // how you perform in flat orgs
}

export interface WorkStyleEN {
  decisionMaking: string
  collaboration: string
  environment: string
  focus: string
  communication: string
  strengths: string[]
  watchouts: string[]
  orgFit: OrgFitEN
}

export function computeWorkStyleEN(facets: FacetMap, cogScore: number, sf?: SubFacetScores): WorkStyleEN {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  // Decision Making
  let decisionMaking: string
  if (cur >= 0.6 && cogScore >= 0.55) {
    decisionMaking = 'Research-driven — you gather and analyze information before deciding. You distrust gut instinct alone and want to understand the underlying logic. The tradeoff is speed; setting a deliberate decision deadline helps.'
  } else if (bol >= 0.65 && dil < 0.55) {
    decisionMaking = 'Intuition-led and fast — you read situations quickly and act decisively. This is a strength in fast-moving environments, though it can lead to skipping important details. Build in a brief "stress-test" step before finalizing.'
  } else if (dil >= 0.65 && anx >= 0.55) {
    decisionMaking = 'Thorough and risk-aware — you consider implications carefully and are cautious about unintended consequences. This produces high-quality outcomes, but watch for analysis paralysis when the stakes feel high.'
  } else if (hum >= 0.65) {
    decisionMaking = 'Consensus-oriented — you seek multiple perspectives and aim for outcomes that feel fair to everyone involved. You\'re less likely to bulldoze, and people trust your process.'
  } else {
    decisionMaking = 'Balanced — you weigh information against intuition situationally, adjusting your approach to what the context demands.'
  }

  // Collaboration
  let collaboration: string
  if (bol >= 0.65 && pat < 0.45) {
    collaboration = 'You take initiative and drive the team toward results. You\'re comfortable stepping up as the point person. Be mindful of pacing with more deliberate teammates.'
  } else if (pat >= 0.65 && bol < 0.45) {
    collaboration = 'You\'re a stabilizing force in teams — supportive, patient, and attuned to group dynamics. You create psychological safety. You may need to advocate more actively for your own ideas.'
  } else if (hum >= 0.65 && pat >= 0.55) {
    collaboration = 'You collaborate with genuine fairness and listen well. People feel heard around you. You\'re effective in cross-functional environments where trust matters.'
  } else if (cur >= 0.65) {
    collaboration = 'You bring energy and new angles to the table. Your intellectual contributions are valued, though you may need to anchor abstract ideas more concretely for execution-focused teammates.'
  } else {
    collaboration = 'You can flexibly shift between leading and supporting roles depending on what the team needs at any given moment.'
  }

  // Environment
  let environment: string
  if (anx >= 0.65) {
    environment = 'Psychological safety is important to you — you need clear expectations, adequate preparation time, and a culture where mistakes are treated as learning opportunities rather than failures.'
  } else if (cur >= 0.65 && bol >= 0.55) {
    environment = 'You thrive with creative autonomy and meaningful challenges. Flat, idea-driven environments — startups, research teams, product studios — bring out your best work.'
  } else if (dil >= 0.65 && anx < 0.5) {
    environment = 'You\'re effective in structured, goal-oriented environments with clear deliverables and accountability. You don\'t need hand-holding, just clear direction and space to execute.'
  } else {
    environment = 'You adapt to a range of environments. Over time, prioritizing settings that align with your strongest traits will compound your output significantly.'
  }

  // Focus
  let focus: string
  if (dil >= 0.65 && anx >= 0.55) {
    focus = 'Deep, high-quality work is your default. You work well independently on complex tasks, but be intentional about breaks — your drive to finish can override recovery signals.'
  } else if (cur >= 0.65 && dil < 0.5) {
    focus = 'You enter flow states on problems that genuinely engage you. Routine work drains you quickly. Batching similar tasks and front-loading creative work to your peak hours helps sustain output.'
  } else if (bol >= 0.65) {
    focus = 'You tend toward fast execution and parallel threads. Multi-project environments suit you, though depth on any single item may require intentional blocking of time.'
  } else {
    focus = 'You\'re able to sustain focused work with reasonable consistency, especially when the purpose and scope are well defined.'
  }

  // Communication
  let communication: string
  if (bol >= 0.65 && hum < 0.5) {
    communication = 'Direct and assertive — you say what you think and expect the same in return. Diplomatic packaging of feedback helps with people who need more cushioning.'
  } else if (pat >= 0.65 && bol < 0.45) {
    communication = 'Warm and careful — you listen deeply and communicate with consideration. This is a genuine strength; pairing it with directness when needed will sharpen your impact.'
  } else if (cur >= 0.65) {
    communication = 'You communicate with precision and depth, and enjoy exploring ideas verbally. You can lose more action-oriented people if you stay in analysis mode too long.'
  } else if (hum >= 0.65) {
    communication = 'Honest and straightforward, with a visible commitment to fairness. People trust what you say because you don\'t oversell.'
  } else {
    communication = 'Adaptable — you modulate tone and style depending on the audience and context.'
  }

  // Strengths
  const strengths: string[] = []
  if (cur >= 0.6 && cogScore >= 0.5) strengths.push('Connecting dots across domains — you naturally synthesize information others keep siloed')
  if (dil >= 0.6) strengths.push('Delivering on commitments reliably, even when the work gets tedious')
  if (bol >= 0.6) strengths.push('Moving people and projects forward with initiative and social confidence')
  if (hum >= 0.6) strengths.push('Building trust through consistent authenticity and ethical consistency')
  if (pat >= 0.6) strengths.push('Maintaining composure and empathy in high-tension situations')
  if (anx >= 0.65) strengths.push('Catching risks and edge cases that others overlook')
  if (strengths.length < 3) strengths.push('Adapting quickly to new roles, tools, or team dynamics')
  if (strengths.length < 3) strengths.push('Staying effective under conditions of ambiguity')

  // Watchouts
  const watchouts: string[] = []
  if (anx >= 0.65) watchouts.push('Overthinking under uncertainty — practice separating "reversible" from "irreversible" decisions; apply more scrutiny only to the latter')
  if (bol >= 0.7 && dil < 0.5) watchouts.push('Underinvesting in follow-through — strong starters can leave value on the table if execution discipline isn\'t consciously built in')
  if (cur >= 0.7 && pat < 0.5) watchouts.push('Attention fragmentation — high curiosity can scatter energy; time-boxing exploration helps protect deep work time')
  if (pat >= 0.7 && bol < 0.4) watchouts.push('Under-advocating for your own ideas — strong listeners can be underestimated if they don\'t speak up proactively')
  if (watchouts.length === 0) watchouts.push('Resistance to change — leaning too heavily on what\'s worked before can slow adaptation in fast-moving contexts')
  if (watchouts.length === 1) watchouts.push('Difficulty delegating — the desire to maintain quality can prevent effective leverage of team capacity')

  // Org Fit
  const orgScore =
    cur * 0.30 +
    bol * 0.25 +
    (1 - dil * 0.5) * 0.20 +
    (1 - hum) * 0.15 +
    (1 - anx * 0.5) * 0.10

  let orgType: OrgFitEN['type']
  let orgSummary: string
  let orgVertical: string
  let orgHorizontal: string

  if (orgScore >= 0.62) {
    orgType = 'Flat'
    orgSummary = 'You do your best work in environments with high autonomy, direct access to decision-makers, and flat communication norms. Bureaucracy and excessive process slow you down and breed frustration. Startups, research labs, and agile product teams are natural fits.'
    orgVertical = 'You can operate in structured orgs, but rigid hierarchies will feel limiting over time. You\'ll naturally gravitate toward pockets of autonomy within them.'
    orgHorizontal = 'You\'re a natural contributor in flat orgs — you take initiative, wear multiple hats, and don\'t need permission to move. In highly ambiguous setups, building your own structure proactively is key.'
  } else if (orgScore <= 0.38) {
    orgType = 'Hierarchical'
    orgSummary = 'Clear structure, defined roles, and explicit expectations bring out your best. You build credibility and expertise steadily within established systems. Excessively fluid or ambiguous environments create more friction than growth for you.'
    orgVertical = 'You\'re effective in hierarchical settings — you absorb best practices from senior colleagues, execute with precision, and naturally raise the bar for standards.'
    orgHorizontal = 'Flat orgs can work, but you\'ll want to establish your own clear goals and success metrics early to stay oriented and avoid energy waste.'
  } else {
    orgType = 'Flexible'
    orgSummary = 'You adapt reasonably well to both flat and hierarchical structures. You\'re not strongly pulled in either direction, which gives you flexibility — but long-term, you\'ll likely find one environment more energizing than the other.'
    orgVertical = 'You\'re comfortable with hierarchy when it\'s functional and not overly rigid.'
    orgHorizontal = 'You can operate in flat environments and may enjoy the autonomy, provided there\'s enough clarity around goals and accountability.'
  }

  return {
    decisionMaking, collaboration, environment, focus, communication,
    strengths: strengths.slice(0, 3),
    watchouts: watchouts.slice(0, 2),
    orgFit: { type: orgType, score: orgScore, summary: orgSummary, vertical: orgVertical, horizontal: orgHorizontal },
  }
}

// ─── Investment Profile (English — US/global market framing) ───────────────

export interface InvestmentProfileEN {
  riskLabel: string       // e.g. 'Aggressive Growth'
  riskColor: string
  riskRationale: string
  horizon: string
  style: string
  suitable: string[]      // personality-matched approaches with US market examples
  avoid: string[]
  behavioralBias: string
  principle: string
}

export function computeInvestmentProfileEN(facets: FacetMap, cogScore: number): InvestmentProfileEN {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  // ── Risk tolerance score (research-based weights) ──
  // Durand et al. (2008): extraversion & openness are the primary predictors of risk tolerance
  // Pak & Mahmood (2015): neuroticism (anxiety) has a strong negative correlation with risk tolerance
  const riskScore =
    bol * 0.35 +
    (1 - anx) * 0.30 +
    cur * 0.20 +
    dil * 0.15

  let riskLabel: string
  let riskColor: string
  let riskRationale: string

  if (riskScore >= 0.62) {
    riskLabel = 'Aggressive Growth'
    riskColor = '#ef4444'
    riskRationale = `Your high boldness (${Math.round(bol * 100)}%) and emotional stability (${Math.round((1 - anx) * 100)}%) give you strong psychological tolerance for market volatility. When positions move against you, you\'re more likely to reassess strategically than panic-sell — a genuine edge most retail investors lack.`
  } else if (riskScore >= 0.42) {
    riskLabel = 'Balanced Growth'
    riskColor = '#f59e0b'
    riskRationale = 'Your risk tolerance sits in the middle range. You want exposure to growth opportunities, but excessive volatility generates real psychological discomfort. A portfolio that balances equities with stabilizing assets reduces the emotional friction that leads to poor timing decisions.'
  } else {
    riskLabel = 'Capital Preservation'
    riskColor = '#34d399'
    riskRationale = 'You have a strong aversion to potential losses — more than the average person. This isn\'t a weakness; it\'s honest self-knowledge. A portfolio built around stable cash flows and downside protection is one you\'ll actually stick to, which matters far more than the theoretical optimal allocation.'
  }

  // ── Investment horizon ──
  const horizon = (dil >= 0.55 && anx < 0.65)
    ? 'Long-term (5+ years) — your discipline and low impulsivity make you well-suited to ride out volatility and let compounding work. The S&P 500\'s 10-year rolling return has never been negative historically; this is your structural edge.'
    : anx >= 0.65
    ? 'Medium-term (3–5 years) — to reduce psychological exposure to short-term swings, keep 1–2 years of near-term cash needs out of the market entirely. This prevents forced selling at the worst times.'
    : 'Short-to-medium term (1–5 years) — set explicit time horizons per goal (emergency fund, home purchase, retirement) and manage each bucket separately.'

  // ── Core style ──
  let style: string
  if (cur >= 0.65 && cogScore >= 0.55 && dil >= 0.5) {
    style = 'Research-driven — you enjoy the process of analyzing companies, sectors, and macro trends. A concentrated portfolio of well-understood positions suits your temperament. Tools like SEC filings, earnings calls, and sector ETFs (e.g., QQQ, XLK) fit your workflow.'
  } else if (dil >= 0.65 && cur < 0.5) {
    style = 'Systematic automation — you want a rule-based system that removes emotional decision points entirely. Automated monthly contributions to low-cost index funds (e.g., VTI, VXUS) let your conscientiousness compound without requiring constant active attention.'
  } else if (hum >= 0.6 && pat >= 0.55) {
    style = 'Passive indexing — you\'re comfortable letting the market do the work. A simple three-fund portfolio (US total market + international + bonds) outperforms most active strategies over a 20-year horizon with minimal time investment.'
  } else if (bol >= 0.65 && cur >= 0.55) {
    style = 'Opportunity-driven — you\'re quick to identify and act on market dislocations. This is a real skill, but overconfidence is the main risk. A written investment thesis for each position, revisited quarterly, keeps discipline intact.'
  } else {
    style = 'Diversified core — spreading across asset classes (US equities, international, bonds, and alternatives) without trying to time any of them. This approach keeps cognitive load low while participating in broad market growth.'
  }

  // ── Suitable approaches (US/global market specific) ──
  const suitable: string[] = []
  if (dil >= 0.55) suitable.push('Automated DCA into index funds (e.g., VTI, FSKAX) — removes emotion, builds discipline through consistency')
  if (cur >= 0.6 && cogScore >= 0.5) suitable.push('Individual stock research in sectors you genuinely understand — quality over quantity; 8–15 positions maximum')
  if (riskScore >= 0.55) suitable.push('Broad equity ETFs: S&P 500 (VOO/SPY), Nasdaq-100 (QQQ), or total market (VTI) — low-cost exposure to US growth')
  if (riskScore >= 0.55) suitable.push('International diversification: VXUS or VEA for developed markets, VWO for emerging markets')
  if (riskScore < 0.5) suitable.push('Bond allocation: BND (US total bond) or BNDW (global) to dampen volatility without sacrificing all growth')
  if (pat >= 0.6) suitable.push('Dividend growth stocks or SCHD ETF — steady cash flow reinforces patience and reduces the urge to trade')
  if (hum >= 0.55) suitable.push('ESG / values-aligned investing: ESGU, SUSL, or Vanguard ESG funds — aligns portfolio with your ethical framework')
  if (suitable.length < 3) suitable.push('Factor ETFs (e.g., MTUM for momentum, QUAL for quality) — rules-based, research-backed alternatives to pure market-cap indexing')

  // ── Avoid ──
  const avoid: string[] = []
  if (anx >= 0.6) avoid.push('Checking daily returns — short-term noise amplifies anxiety and triggers loss-aversion selling. Set a calendar reminder to review quarterly, not daily.')
  if (bol >= 0.7 && dil < 0.55) avoid.push('Meme stocks, options, and leveraged ETFs (e.g., TQQQ) — the combination of high boldness and lower discipline is the classic recipe for overtrading and drawdown.')
  if (cur >= 0.7 && pat < 0.5) avoid.push('Trend-chasing (AI stocks, crypto cycles, thematic ETFs at peak hype) — novelty-seeking leads to buying narratives, not fundamentals. Require a written thesis before entering any new theme.')
  if (pat >= 0.7 && bol < 0.4) avoid.push('FOMO buying from social media or group chats — your high empathy makes you susceptible to social contagion in investing. Ask: "Would I still buy this if I found it alone?"')
  if (avoid.length === 0) avoid.push('Timing the market — the average investor underperforms the index by 1–2% annually due to poor entry/exit timing. Time in the market beats timing the market.')
  if (avoid.length === 1) avoid.push('Position concentration above 20% in any single stock — even high-conviction bets should be sized to survive being completely wrong.')

  // ── Behavioral bias ──
  let behavioralBias: string
  if (anx >= 0.65) {
    behavioralBias = 'Loss aversion (Kahneman & Tversky): losses feel roughly twice as painful as equivalent gains feel good. This drives premature selling at market bottoms. Countermeasure: set a written drawdown policy in advance ("I will not sell unless X drops below Y% AND my original thesis has changed"). Automate contributions so selling requires active override.'
  } else if (bol >= 0.7) {
    behavioralBias = 'Overconfidence bias: you may overestimate the precision of your forecasts and underestimate tail risks. Research shows high-boldness investors trade more frequently and underperform low-turnover investors net of costs. Countermeasure: write down your thesis and expected return before buying; review it 6 months later honestly.'
  } else if (cur >= 0.7) {
    behavioralBias = 'Novelty bias: new technologies, sectors, and narratives generate disproportionate attention and capital. Countermeasure: the "80/20 rule" — keep 80% in your boring core (index funds) and limit the "exploration" allocation to 20% maximum. New ideas earn their way into the 80% only after 12+ months of demonstrated behavior.'
  } else if (pat >= 0.7) {
    behavioralBias = 'Herding bias: high agreeableness makes you more susceptible to social proof in investing — acting on tips from friends, podcasts, or Reddit. Countermeasure: before acting on any social recommendation, find three independent sources confirming the thesis. If you can\'t, don\'t invest.'
  } else {
    behavioralBias = 'Status quo bias: defaulting to inaction even when rebalancing is clearly warranted. This quietly erodes expected returns over time. Countermeasure: schedule a fixed annual rebalancing date (e.g., January 2nd) in your calendar, with a simple rule — bring each asset class back to target allocation regardless of market conditions.'
  }

  // ── Core principle ──
  const principles: string[] = []
  if (dil >= 0.6) principles.push('Consistency beats brilliance. Automated monthly contributions to a low-cost index fund, held for 20 years, outperforms most active strategies — not because of the picks, but because of the discipline.')
  if (hum >= 0.6) principles.push('You don\'t need to beat the market. Matching the S&P 500 return puts you ahead of roughly 85% of actively managed funds over a 20-year period — humility about what you can predict is itself an edge.')
  if (anx >= 0.6) principles.push('"Never invest in anything you don\'t fully understand." — Buffett. When you\'re uncertain, hold cash. Capital preservation in bad environments is what allows compounding in good ones.')
  if (cur >= 0.65) principles.push('Knowledge is risk management. Before any position: write down what would have to be true for this investment to fail. If you can\'t write it, you don\'t understand it well enough yet.')
  if (principles.length === 0) principles.push('Diversify, minimize costs, maximize time. These three variables explain the majority of long-run portfolio outcomes — everything else is noise.')
  const principle = principles[0]

  return {
    riskLabel,
    riskColor,
    riskRationale,
    horizon,
    style,
    suitable: suitable.slice(0, 4),
    avoid: avoid.slice(0, 3),
    behavioralBias,
    principle,
  }
}

// ─── Character Strengths (English) ────────────────────────────────────

export interface CharacterStrengthEN {
  name: string
  icon: string
  desc: string
  howItShows: string
  shadow: string
}

export function computeCharacterStrengthsEN(facets: FacetMap, cogScore: number): CharacterStrengthEN[] {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  const pool: (CharacterStrengthEN & { score: number })[] = [
    {
      name: 'Intellectual Curiosity', icon: '🔭', score: cur * 0.7 + cogScore * 0.3,
      desc: 'You find genuine pleasure in exploring ideas across domains — the act of learning itself energizes you.',
      howItShows: 'You ask "why" and "how" in conversations others have moved past. You connect concepts across fields and often arrive at insights others miss.',
      shadow: 'Deep exploration can delay execution. Watch for analysis paralysis — the need to fully understand before starting. Set a deliberate cut-off point for research before acting.',
    },
    {
      name: 'Follow-Through', icon: '🎯', score: dil * 0.8 + (1 - anx) * 0.2,
      desc: 'You complete what you start. People trust you with important tasks because your commitments are reliable.',
      howItShows: 'You meet deadlines you set yourself. In teams, you are the person others know they can hand something to and it will get done.',
      shadow: 'High standards can shade into perfectionism. You may unconsciously hold others to the same bar without realizing the pressure it creates. Calibrate "good enough" explicitly.',
    },
    {
      name: 'Social Boldness', icon: '🦁', score: bol * 0.75 + (1 - anx) * 0.25,
      desc: 'You can assert yourself in unfamiliar social situations — you speak when others stay quiet.',
      howItShows: 'You start conversations at new events and say uncomfortable truths when they matter. You take up space without apology.',
      shadow: 'Directness without attunement can land as bluntness. Check whether the other person is ready to hear what you are about to say — it changes the reception significantly.',
    },
    {
      name: 'Authenticity', icon: '💎', score: hum * 0.85 + pat * 0.15,
      desc: 'You do not perform versions of yourself for approval. This is one of the rarest and most durable social assets.',
      howItShows: 'You choose uncomfortable truths over comfortable flattery. Over time, this creates unusually deep trust.',
      shadow: 'Strong authenticity can make you acutely sensitive to inauthenticity in others — and interpret strategic behavior as dishonesty. Not every tactical move is a values violation.',
    },
    {
      name: 'Empathy & Care', icon: '🌿', score: pat * 0.6 + anx * 0.4,
      desc: 'You notice what others feel before they say it. People feel genuinely seen around you.',
      howItShows: 'You pick up on emotional undercurrents in rooms and conversations. You are the person others come to when they need to feel understood.',
      shadow: 'High empathy without strong boundaries leads to compassion fatigue — absorbing others distress until you are depleted. Supporting without absorbing is a learnable skill.',
    },
    {
      name: 'Analytical Thinking', icon: '🧠', score: cogScore * 0.7 + cur * 0.3,
      desc: 'You quickly see structure in complexity. What overwhelms others, you break into tractable pieces.',
      howItShows: 'You spot patterns others miss and explain complex situations simply. People bring you problems when they are stuck.',
      shadow: 'Heavy analytical framing can crowd out emotional context — leading to technically correct but interpersonally tone-deaf responses. Sometimes people need to feel heard before they need a solution.',
    },
    {
      name: 'Humble Self-Awareness', icon: '🌱', score: hum * 0.7 + (1 - bol) * 0.3,
      desc: 'You have an accurate mental model of your own strengths and limits — and stay open to updating it.',
      howItShows: 'You accept feedback without defensiveness and correct course quickly. People trust your self-assessments because they are not inflated.',
      shadow: 'Excessive self-doubt can hold you back from claiming competences you actually have. Being uncertain and trusting your judgment are not in conflict.',
    },
    {
      name: 'Persistence', icon: '⛰️', score: dil * 0.5 + (1 - anx) * 0.3 + pat * 0.2,
      desc: 'You stay the course when results are slow — an edge in any domain that rewards compounding over time.',
      howItShows: 'Long-horizon projects are where you outperform. Others see you as reliable through setbacks.',
      shadow: 'Persistence can become sunk-cost attachment. The key question is not "have I invested enough?" but "is this direction still right?" — check periodically.',
    },
    {
      name: 'Creative Originality', icon: '✨', score: cur * 0.7 + bol * 0.3,
      desc: 'You generate ideas others do not see — you find unexpected angles on familiar problems.',
      howItShows: 'In brainstorming, you offer the turn no one else took. You pull concepts from unrelated fields to solve problems in new ways.',
      shadow: 'Idea generation without execution creates a backlog of unfinished concepts. Pairing with someone strong in follow-through produces far better outcomes than working alone.',
    },
    {
      name: 'Conflict Resolution', icon: '🤝', score: pat * 0.6 + hum * 0.2 + (1 - bol) * 0.2,
      desc: 'You can find the third option when everyone else sees only two — you turn either/or into both/and.',
      howItShows: 'In tense disagreements, you de-escalate and reframe. You help teams stay psychologically safe enough to do good work.',
      shadow: 'Excessive conflict avoidance means over-compromising your own position. Resolution is when everyone gains something, not when you absorb all the friction.',
    },
  ]

  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(({ score: _s, ...rest }) => rest)
}

// ─── Leadership (English) ──────────────────────────────────────────────

export interface LeadershipProfileEN {
  style: string
  icon: string
  summary: string
  strengths: string[]
  blindspots: string[]
  bestEnvironment: string
  growthEdge: string
}

export function computeLeadershipStyleEN(facets: FacetMap, cogScore: number): LeadershipProfileEN {
  const cur = get(facets, 'curiosity')
  const dil = get(facets, 'diligence')
  const bol = get(facets, 'boldness')
  const hum = get(facets, 'humility')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')

  const isDirective   = bol >= 0.65 && pat < 0.5
  const isCoach       = pat >= 0.65 && hum >= 0.58
  const isFacilitator = pat >= 0.58 && bol >= 0.45 && bol < 0.65
  const isExpert      = dil >= 0.65 && cogScore >= 0.6 && bol < 0.5

  if (isDirective) {
    return {
      style: 'Visionary Director', icon: '🚀',
      summary: 'You set direction clearly and move fast. In ambiguous situations, you make the call, align the team, and execute — your clarity creates momentum.',
      strengths: ['Rapid orientation in uncertain environments', 'Communicating a clear destination that others can orient around', 'Decisive action under pressure'],
      blindspots: ['Speed of decision can outpace team buy-in', 'Task clarity sometimes crowds out emotional attunement with the team'],
      bestEnvironment: 'Early-stage startups, crisis response, time-sensitive projects with a single clear goal',
      growthEdge: 'Before finalizing a decision, make a habit of asking one team member: "What is the angle I am not seeing?" The 60-second investment raises decision quality and team commitment.',
    }
  } else if (isCoach) {
    return {
      style: 'Coaching Leader', icon: '🌱',
      summary: 'You grow people. You ask better questions than you give answers, and the people who have worked with you tend to credit you for significant development.',
      strengths: ['Rapid identification of each person growth edge', 'Creating psychological safety that lets people take risks', 'Building sustained trust over time'],
      blindspots: ['Coaching approach is slower than the situation sometimes requires', 'Team members who need clear direction may find coaching frustrating in urgent contexts'],
      bestEnvironment: 'Talent-development-focused organizations, teams that need a long growth arc, environments where autonomy is a core value',
      growthEdge: 'Know when to switch modes. Ask yourself: "Does this situation need growth or does it need execution right now?" Both are valid — the skill is recognizing which.',
    }
  } else if (isFacilitator) {
    return {
      style: 'Facilitative Leader', icon: '🌐',
      summary: 'You create the conditions for the team to do its best thinking. You are less interested in your answer being right and more interested in the team finding the best answer.',
      strengths: ['Fair, inclusive process that surfaces diverse perspectives', 'Removing friction that blocks collaboration', 'Sustainable team engagement over time'],
      blindspots: ['Consensus-seeking can slow decisions when speed matters', 'Your own views may stay underweighted because you are busy holding the space for others'],
      bestEnvironment: 'Cross-functional teams with diverse expertise, innovation environments, settings where long-term collaboration quality matters',
      growthEdge: 'Name your view. Facilitation does not require hiding your perspective — sharing it with appropriate conviction actually models the behavior you want to cultivate in others.',
    }
  } else if (isExpert) {
    return {
      style: 'Expert Leader', icon: '🔬',
      summary: 'You lead through mastery. Your depth earns respect, and your high standards lift the quality of everything the team produces.',
      strengths: ['Trustworthiness rooted in genuine depth of knowledge', 'Meticulous attention to detail that prevents compounding errors', 'Building replicable, high-standard processes'],
      blindspots: ['Deep expertise focus can lead to missing the broader strategic picture', 'High standards can create unintended pressure on teammates who have different baselines'],
      bestEnvironment: 'Technical, research, or quality-driven environments where depth is a competitive advantage',
      growthEdge: 'The next level of expert leadership is teaching. The question shifts from "how do I do this well?" to "how do I get the whole team to this level?" That requires a different skill set than expertise itself.',
    }
  } else {
    return {
      style: 'Integrative Leader', icon: '🤝',
      summary: 'You hold multiple perspectives simultaneously and find paths forward that do not require anyone to fully lose. In complex multi-stakeholder situations, you are invaluable.',
      strengths: ['Synthesizing divergent viewpoints into coherent direction', 'Reading team energy and morale accurately', 'Resolving conflict constructively without losers'],
      blindspots: ['Integrating too many perspectives can delay decisions past the point of usefulness', 'Risk of compromising a clearly right position to avoid conflict'],
      bestEnvironment: 'Multi-stakeholder projects, established organizations with diverse functions, environments where coalition-building drives outcomes',
      growthEdge: 'Some decisions cannot be integrated — they require someone to choose. Develop the muscle for uncomfortable decisions — the ones where someone will be disappointed. Avoiding them too long is itself a leadership failure.',
    }
  }
}

// ─── Burnout Risk (English) ───────────────────────────────────────────

export interface BurnoutProfileEN {
  level: 'Low' | 'Moderate' | 'Elevated' | 'High'
  color: string
  score: number
  summary: string
  riskFactors: string[]
  protectiveFactors: string[]
  prevention: string[]
}

export function computeBurnoutRiskEN(facets: FacetMap, deepAnswers?: Record<string, string | number>): BurnoutProfileEN {
  const dil = get(facets, 'diligence')
  const anx = get(facets, 'anxiety')
  const pat = get(facets, 'patience')
  const bol = get(facets, 'boldness')

  let deepScore = 0
  if (deepAnswers) {
    const d = (k: string) => {
      const v = deepAnswers[k]
      return typeof v === 'number' ? norm(v) : 0.5
    }
    deepScore = (d('burnout_detachment') + d('burnout_meaning') + d('burnout_exhaustion') + d('burnout_recovery')) / 4
  }

  const perfectionistRisk = dil * 0.5 + anx * 0.5
  const interpersonalRisk = (1 - pat) * 0.5 + bol * 0.2 + anx * 0.3
  const facetScore = perfectionistRisk * 0.5 + interpersonalRisk * 0.3
  const totalScore = deepAnswers ? deepScore * 0.6 + facetScore * 0.4 : facetScore
  const pct = Math.round(totalScore * 100)

  const riskFactors: string[] = []
  if (dil >= 0.68) riskFactors.push('High conscientiousness — you tend to expand your workload internally. Without deliberate limits, this compounds into overload.')
  if (anx >= 0.60) riskFactors.push('High emotional sensitivity — negative feedback and environmental changes hit harder and drain energy faster.')
  if (dil >= 0.55 && anx >= 0.50) riskFactors.push('High standards combined with anxiety — the combination makes it hard to feel "done." You may struggle to stop even when the work is complete.')
  if (bol <= 0.35 && dil >= 0.55) riskFactors.push('Low assertiveness plus high diligence — difficulty saying no means requests accumulate beyond sustainable capacity.')
  if (deepAnswers?.burnout_meaning && Number(deepAnswers.burnout_meaning) >= 4) riskFactors.push('Declining sense of meaning at work — a primary early warning signal for burnout.')
  if (deepAnswers?.burnout_detachment && Number(deepAnswers.burnout_detachment) >= 4) riskFactors.push('Difficulty switching off after work — psychological boundary erosion.')
  if (riskFactors.length === 0) riskFactors.push('No major burnout risk factors detected in your current personality pattern.')

  const protectiveFactors: string[] = []
  if (dil < 0.5) protectiveFactors.push('Lower perfectionism — you can recognize "good enough" and stop there.')
  if (anx < 0.45) protectiveFactors.push('Emotional stability buffers stress accumulation effectively.')
  if (pat >= 0.6) protectiveFactors.push('High empathy builds positive relationship energy that counteracts depletion.')
  if (bol >= 0.6) protectiveFactors.push('Assertiveness makes it easier to protect your time and set limits.')
  if (protectiveFactors.length === 0) protectiveFactors.push('Focus on deliberately building protective habits — even small, consistent actions compound quickly.')

  const prevention = [
    pct >= 60
      ? 'Schedule at least one full "off" block per week — no screens, no email, no task-orientation. Non-negotiable.'
      : 'Document the routines that are keeping your energy stable right now. Explicit systems outlast willpower.',
    dil >= 0.65
      ? 'Define "done" before starting high-stakes tasks. Without a pre-set completion criterion, high conscientiousness means you will keep going past optimal.'
      : 'When setting ambitious goals, build in an energy budget alongside the task plan. Output without recovery math does not compound — it depletes.',
    anx >= 0.6
      ? 'Regular physical exercise is the most evidence-backed intervention for your burnout risk profile. Aim for 3x/week — it directly regulates the anxiety response.'
      : 'When stress accumulates, externalize it first (write it down, tell someone) before trying to solve it. The act of naming reduces the cognitive load significantly.',
  ]

  const level: BurnoutProfileEN['level'] =
    pct >= 65 ? 'High' : pct >= 45 ? 'Elevated' : pct >= 25 ? 'Moderate' : 'Low'
  const color = level === 'High' ? '#f87171' : level === 'Elevated' ? '#f59e0b' : level === 'Moderate' ? '#60a5fa' : '#34d399'

  const summaryMap: Record<string, string> = {
    'High':     'Multiple active burnout signals detected. Recovery actions and environment changes warrant serious, immediate attention.',
    'Elevated': 'Not at a critical threshold yet, but a risk pattern is present. Starting preventive action now is significantly cheaper than recovering from burnout.',
    'Moderate': 'Generally manageable, but consciously strengthening your protective factors will make your current pace more sustainable.',
    'Low':      'Your current approach to energy management is working. Document what is sustaining this — it will not stay automatic under pressure.',
  }

  return { level, color, score: pct, summary: summaryMap[level], riskFactors, protectiveFactors, prevention }
}

// ─── Values Profile (English) ──────────────────────────────────────────

export interface ValuesProfileEN {
  primary: string
  secondary: string
  icon: string
  summary: string
  inCareer: string
  inRelationships: string
  tension: string
}

export function computeValuesProfileEN(facets: FacetMap, deepAnswers?: Record<string, string | number>): ValuesProfileEN {
  const cur = get(facets, 'curiosity')
  const hum = get(facets, 'humility')
  const pat = get(facets, 'patience')
  const bol = get(facets, 'boldness')
  const dil = get(facets, 'diligence')

  const workVal = deepAnswers?.value_work as string | undefined
  const lifeVal = deepAnswers?.value_life as string | undefined
  const growthVal = deepAnswers?.value_growth as string | undefined

  const primary = workVal ?? (
    cur >= 0.65 ? 'growth' :
    dil >= 0.65 ? 'meaning' :
    bol >= 0.65 ? 'achievement' :
    hum >= 0.65 ? 'meaning' :
    pat >= 0.65 ? 'relationships' : 'autonomy'
  )
  const secondary = growthVal ?? lifeVal ?? (
    primary === 'growth' ? 'autonomy' :
    primary === 'meaning' ? 'growth' :
    primary === 'achievement' ? 'security' : 'meaning'
  )

  const meta: Record<string, { label: string; icon: string; career: string; rel: string }> = {
    security:      { label: 'Security',          icon: '🏛️', career: 'Predictable income and employment stability matter more to you than upside. You optimize for continuity over variance.', rel: 'You seek reliable, consistent bonds over exciting but volatile ones. Trustworthiness is non-negotiable.' },
    meaning:       { label: 'Meaning',           icon: '🌟', career: '"Why does this work matter?" comes before compensation. You will take less pay for work that aligns with something bigger.', rel: 'Depth is the currency. Surface-level interaction drains you; genuine connection energizes.' },
    autonomy:      { label: 'Autonomy',          icon: '🦅', career: 'Micromanagement is incompatible with your best work. You need latitude to approach problems in your own way.', rel: 'Mutual independence is a prerequisite. You thrive in relationships where space is built in, not negotiated.' },
    growth:        { label: 'Growth',            icon: '📈', career: 'Learning environment over compensation right now. Stagnation is a faster path to disengagement than bad management.', rel: 'You want relationships that stretch you — partners and friends who challenge your thinking.' },
    achievement:   { label: 'Achievement',       icon: '🏆', career: 'Recognition and measurable results matter. Performance cultures energize you more than process-heavy environments.', rel: 'You want people in your corner who genuinely celebrate your wins — not those who minimize them.' },
    relationships: { label: 'Relationships',     icon: '🫂', career: 'Who you work with matters as much as what you work on. A bad team is a non-starter regardless of other conditions.', rel: 'Connection is the core of life meaning for you. Deep, warm bonds are the metric by which you measure satisfaction.' },
    freedom:       { label: 'Freedom',           icon: '🌈', career: 'Variety, flexibility, and unstructured exploration are not perks — they are requirements for your best output.', rel: 'You want relationships that allow for range and novelty, not obligation-shaped sameness.' },
    stability:     { label: 'Stability',         icon: '⚓', career: 'Clear roles, defined scope, and low ambiguity. Sudden changes are energy drains, not opportunities.', rel: 'Longevity and reliability in a small circle of deep relationships over a wide, shallow network.' },
    career:        { label: 'Career',            icon: '💼', career: 'Professional development and upward trajectory are a central life axis — not just one consideration among many.', rel: 'You need partners and friends who understand that your ambition is part of who you are, not separate from it.' },
    health:        { label: 'Vitality',          icon: '💚', career: 'You will not trade physical wellbeing for output indefinitely. Sustainable pace is a hard constraint, not a preference.', rel: 'Shared health values and lifestyle compatibility matter more than most people realize upfront.' },
    finance:       { label: 'Financial Freedom', icon: '💰', career: 'Economic security is foundational — it enables everything else. You build the floor first.', rel: 'Aligned financial values with a partner are among the highest predictors of long-run relationship quality.' },
  }

  const pm = meta[primary] ?? meta['meaning']
  const sm = meta[secondary] ?? meta['growth']

  const tension =
    (primary === 'autonomy' && secondary === 'relationships')
      ? '"Autonomy" and "connection" can pull in opposite directions — closeness can feel like a constraint. Understanding this pattern proactively helps you design relationships that give you both.'
    : (primary === 'achievement' && secondary === 'health')
      ? '"Achievement" and "vitality" have a classic short-term trade-off. The research is unambiguous: the people who sustain high performance longest are the ones who protect recovery as fiercely as output.'
    : (primary === 'meaning' && secondary === 'security')
      ? '"Meaning" and "security" can be in tension when meaningful work pays less. Finding a career path that offers both — or sequencing security then meaning — is a worthy long-term design problem.'
    : (primary === 'growth' && secondary === 'stability')
      ? '"Growth" hunger and "stability" needs create a productive tension: you want to stretch, but you need a base. Establish the floor first, then take the leap — the sequence matters.'
    : `${pm.label} and ${sm.label} are largely complementary. You experience the highest satisfaction when both are present simultaneously.`

  return {
    primary: pm.label, secondary: sm.label, icon: pm.icon,
    summary: `Your core value is ${pm.label}, complemented by ${sm.label}. This pairing shows up consistently in how you make important decisions.`,
    inCareer: pm.career, inRelationships: pm.rel, tension,
  }
}

// ─── Life Balance (English) ────────────────────────────────────────────

export interface LifeBalanceEN {
  domains: { name: string; score: number; icon: string; insight: string }[]
  lowestDomain: string
  recommendation: string
}

export function computeLifeBalanceEN(facets: FacetMap, deepAnswers?: Record<string, string | number>): LifeBalanceEN {
  const dil = get(facets, 'diligence')
  const pat = get(facets, 'patience')
  const anx = get(facets, 'anxiety')
  const bol = get(facets, 'boldness')
  const cur = get(facets, 'curiosity')

  const d = (k: string, fallback: number) => {
    const v = deepAnswers?.[k]
    return typeof v === 'number' ? norm(v) : fallback
  }

  const domains = [
    {
      name: 'Career & Purpose', icon: '💼',
      score: Math.round((d('life_career', dil * 0.7 + cur * 0.3)) * 100),
      insight: dil >= 0.6 ? 'Your drive and follow-through are clear assets in this domain. Make sure the direction is as strong as the execution.' : 'There may be untapped energy here. Clarifying what "career success" means to you personally — not just professionally — often unblocks this.',
    },
    {
      name: 'Relationships', icon: '🤝',
      score: Math.round((d('life_relationships', pat * 0.6 + (1 - anx) * 0.4)) * 100),
      insight: pat >= 0.6 ? 'Your empathy and patience give you the raw material for strong relationships. The constraint is usually time and priorities, not capability.' : 'Relationships that require consistent emotional attunement can feel draining if you are already stretched. Being deliberate about where you invest relational energy helps.',
    },
    {
      name: 'Health & Energy', icon: '💚',
      score: Math.round((d('life_health', (1 - anx) * 0.5 + (1 - dil * 0.3) * 0.5)) * 100),
      insight: anx >= 0.6 ? 'Anxiety activates the body chronically, which erodes energy over time. Physical routines (exercise, sleep) are unusually high-leverage interventions for your profile.' : 'Stable energy is often taken for granted until it disappears. The habits keeping this strong are worth identifying and protecting explicitly.',
    },
    {
      name: 'Learning & Growth', icon: '📚',
      score: Math.round((d('life_growth', cur * 0.7 + dil * 0.3)) * 100),
      insight: cur >= 0.6 ? 'Intellectual curiosity is a genuine asset here — you are likely to pursue growth naturally. The question is whether the direction matches your long-term goals.' : 'Lower curiosity does not mean lower growth capacity. Structured learning (books, courses, mentors) often works better than open exploration for this profile.',
    },
    {
      name: 'Rest & Recovery', icon: '🌙',
      score: Math.round((d('life_rest', (1 - dil * 0.4) * 0.6 + (1 - anx) * 0.4)) * 100),
      insight: dil >= 0.65 ? 'High conscientiousness often crowds out rest because rest does not feel productive. It is — recovery is when consolidation and creative insight happen.' : 'You have reasonable capacity for rest. Making recovery intentional (scheduling it, protecting it) is usually more effective than hoping it happens naturally.',
    },
    {
      name: 'Social Connection', icon: '🌐',
      score: Math.round((d('life_social', bol * 0.5 + pat * 0.5)) * 100),
      insight: bol >= 0.6 ? 'Your social initiative makes this domain easier for you than for many. The quality of connection matters more than the quantity at this stage.' : 'Lower social boldness can make initiating connection feel effortful. A small number of close, reciprocal relationships often generates more wellbeing than a large network of loose ties.',
    },
  ]

  const sorted = [...domains].sort((a, b) => a.score - b.score)
  const lowestDomain = sorted[0].name

  const recommendation = sorted[0].score < 40
    ? `${lowestDomain} is a genuine gap right now. Before optimizing other areas, a targeted intervention here — even one deliberate weekly action — is likely to raise your overall wellbeing more than improvements in your stronger domains.`
    : sorted[0].score < 60
    ? `${lowestDomain} has room to grow. Small, consistent actions in this area compound quickly — what is the one thing you could do this week that would move the needle by 10%?`
    : 'Your life balance is relatively strong across domains. The next level is not just maintaining this but designing specifically for long-term sustainability — which systems and habits are doing the heavy lifting, and how do you protect them?'

  return { domains, lowestDomain, recommendation }
}
