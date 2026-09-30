// 결과 개인화 문구 — 영어 (고르는 로직은 lib/personalize-result.ts, 한국어판은 lib/personalize-text-ko.ts)
import type { PersonalizeText } from '../personalize-result'
import { ARCHETYPE_DETAILS_EN } from './archetypes-hexaco'

const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
// 원형 이름("The Sage")을 문장 중간에 쓸 때는 소문자 the
const mid = (name: string) => name.replace(/^The /, 'the ')
const andList = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`

export const PERSONALIZE_EN: PersonalizeText = {
  archetypeName: a => ARCHETYPE_DETAILS_EN[a.id]?.name ?? a.id,

  factorLabel: { H: 'Honesty-Humility', E: 'Emotionality', X: 'Extraversion', A: 'Agreeableness', C: 'Conscientiousness', O: 'Openness' },

  factorInterp: {
    H: {
      high: 'You stick to your principles and act without deception. Even when it would pay off, you won’t take an unfair route.',
      mid: 'You balance principle and practicality depending on the situation.',
      low: 'You tend to interpret rules flexibly when there’s a goal to reach.',
    },
    E: {
      high: 'You’re sensitive to shifts in emotion and feel anxious easily under stress. Your empathy runs strong.',
      mid: 'You adjust your emotions to the situation and reach out for support when you need it.',
      low: 'You’re emotionally steady and stay calm even under pressure.',
    },
    X: {
      high: 'You draw energy from being around people and enjoy leading conversations and activities.',
      mid: 'Depending on the situation, you choose between socializing and time on your own.',
      low: 'You’re most comfortable alone or with a few people, and you recharge quietly.',
    },
    A: {
      high: 'You avoid conflict, value cooperation, and put energy into keeping relationships intact.',
      mid: 'You read the situation and move flexibly between cooperating and standing your ground.',
      low: 'You state your views clearly and hold to your standards rather than bending to others’ expectations.',
    },
    C: {
      high: 'You make plans, carry them out systematically, and keep your commitments and deadlines.',
      mid: 'You balance structure and flexibility to fit the task at hand.',
      low: 'You act spontaneously and flexibly, going with the flow rather than over-planning.',
    },
    O: {
      high: 'You’re strongly curious about new ideas and experiences, and you question the usual way of doing things.',
      mid: 'You’re selectively curious, moving between the familiar and the new.',
      low: 'You prefer proven methods and stable surroundings, and you avoid change for its own sake.',
    },
  },

  factorModifier: {
    H: { high: 'Principled', low: 'Pragmatic' },
    E: { high: 'Sensitive', low: 'Unflappable' },
    X: { high: 'Outgoing', low: 'Reserved' },
    A: { high: 'Cooperative', low: 'Independent' },
    C: { high: 'Methodical', low: 'Flexible' },
    O: { high: 'Curious', low: 'Grounded' },
  },

  factorRole: {
    H: {
      high: 'Your high Honesty-Humility has given you a strong pull toward principle and responsibility.',
      low: 'Your low Honesty-Humility has shaped a practical, goal-focused way of judging things.',
    },
    E: {
      high: 'Your high Emotionality adds a strong sensitivity to how other people feel.',
      low: 'Your low Emotionality gives you a steadiness that doesn’t crack under pressure.',
    },
    X: {
      high: 'Your high Extraversion shows up as energy you share with the people around you.',
      low: 'Your low Extraversion shows up as a quiet, steady way of carrying out your role.',
    },
    A: {
      high: 'Your high Agreeableness strengthens your focus on keeping relationships and working together.',
      low: 'Your low Agreeableness makes clear standards and independent judgment matter to you.',
    },
    C: {
      high: 'Your high Conscientiousness has built a planned, responsible way of acting.',
      low: 'Your low Conscientiousness adds a spontaneous side that adapts to the moment.',
    },
    O: {
      high: 'Your high Openness adds a habit of questioning the usual way and looking for a better one.',
      low: 'Your low Openness makes you prefer proven methods and stable surroundings.',
    },
  },

  traitDescriptions: {
    H: { high: 'Would rather take a loss than break a principle', low: 'Looks at results over rules when there’s a goal' },
    E: { high: 'Easily resonates with other people’s feelings and pain', low: 'Stays unshaken, even in a crisis' },
    X: { high: 'Gets energy from being around people', low: 'Recharges with time alone' },
    A: { high: 'Chooses cooperation over conflict', low: 'Puts honest standards ahead of keeping the peace' },
    C: { high: 'Keeps promises and deadlines to the letter', low: 'Has the flexibility to follow the flow over the plan' },
    O: { high: 'Often asks “why?” about the usual way', low: 'Trusts proven methods over new ones' },
  },

  growthTips: {
    H: {
      high: 'Holding to your principles is a strength, but expecting others to meet the same standard can cause friction. Before you judge, try explaining your standard first.',
      low: 'You have a knack for getting results fast. Before a big decision, ask yourself once: “Would I be okay if everyone knew how I did this?” It protects trust over the long run.',
    },
    E: {
      high: 'Feeling things deeply can also tire you out quickly. When worry builds up, instead of trying to fix it right away, step back for a moment and write it down.',
      low: 'Staying calm under pressure is a real strength. When someone around you is struggling, try saying “that sounds really hard” before offering a solution.',
    },
    X: {
      high: 'Since you get your energy from people, deliberately setting aside time to think on your own will sharpen your decisions.',
      low: 'Honor the way you recharge alone — and build a small habit of reaching out first to the people who matter. It keeps connections from fading.',
    },
    A: {
      high: 'If you tend to smooth things over, try saying once, “Here’s how that made me feel.” It usually brings people closer, not further apart.',
      low: 'Your honest standards are a strength. Before pointing out a problem, acknowledge the other person’s intent in one sentence — the same message will land much better.',
    },
    C: {
      high: 'Instead of waiting for the perfect plan, act on a “good enough” start. Your thoroughness becomes momentum instead of a burden.',
      low: 'You have the flexibility to ride the flow. Pick the single most important thing and write down its deadline — you can keep your spontaneity and still finish.',
    },
    O: {
      high: 'The more ideas you have, the more it matters to test one all the way through. Pick one new attempt and finish a small version of it.',
      low: 'Trusting proven methods is a source of stability. Trying one unfamiliar approach, in a small way, once a month will widen your options.',
    },
  },

  comboTips: {
    'E_high+C_high': 'You worry a lot, yet you still take care of everything that needs doing. When a worry comes up, turn it into an item on your to-do list — your thoroughness becomes a tool for handling anxiety.',
    'X_low+O_high': 'You have a lot of ideas you’ve explored deeply on your own. This week, share one of them with just one person you trust. One person is an easier first audience than a crowd.',
    'X_low+E_high': 'Being around people drains a lot of your energy. When you make plans, block out time to recover alone the next day before anything else.',
    'C_high+O_high': 'You have what it takes to turn ideas into real work. Once a month, take one idea all the way to a small finished piece — a short post, a single draft.',
    'X_high+C_low': 'You have lots of energy for starting things, but finishing can get fuzzy. When you start something, tell someone your deadline up front — it makes finishing much easier.',
    'H_high+A_low': 'You have clear principles and you say what needs to be said. Before you point out a problem, acknowledge the other person’s intent in one sentence — the same words will land much better.',
    'A_high+E_high': 'You go along with others while quietly carrying a lot inside. When something hurts, say it briefly — “this is how I felt” — before you bottle it up.',
    'O_high+C_low': 'Your interests are wide and new things pull you in easily. When you pick up something new, set a small time limit, like “try it for two weeks, then decide.”',
  },

  shadowNotes: {
    C: 'That said, your Conscientiousness is also high, so you take care of what needs doing even on tired days. That makes it all the more important to put recovery time on your calendar first.',
    O: 'That said, your Openness is high, so you also have a strong drive to look for better ways rather than sticking to the old one.',
    E: 'That said, your Emotionality is high, so you pick up on other people’s feelings easily and respond to them.',
    X: 'That said, you have a strong introverted side, so you prefer to keep going quietly without burning through your energy.',
  },

  why: (defining, modifiers, name) => {
    const base = defining.length > 0
      ? defining.join(' ')
      : `None of your six factors is extreme, but your overall balance is closest to ${mid(name)}.`
    const mod = modifiers.length > 0 ? ` Beyond that, ${lcFirst(modifiers.join(' '))}` : ''
    return base + mod
  },

  secondaryWhy: (hits, name) => {
    if (!hits.length) return `${name} came out as your next-closest match — not because of one standout factor, but because your overall balance is similar.`
    const list = andList(hits.map(h => `${h.dir} ${h.label}`))
    return `Your ${list} ${hits.length > 1 ? 'overlap' : 'overlaps'} with ${mid(name)}, which is why it shows up as your secondary tendency.`
  },
}
