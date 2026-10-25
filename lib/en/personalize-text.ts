// 결과 개인화 문구 — 영어 (고르는 로직은 lib/personalize-result.ts, 한국어판은 lib/personalize-text-ko.ts)
// 문구 원칙은 한국어판과 같다: 응답을 근거로 말하고("you leaned toward…"), 성향은 "tend to"로만, 행동·능력·효과를 보장하지 않는다.
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
      high: 'You answered high on items about speaking sincerely, following rules, and keeping greed and showing off in check. You tend to weigh fairness before gain.',
      mid: 'Your answers on items about speaking sincerely, following rules, and keeping greed and showing off in check came out mid-range overall.',
      low: 'You answered low on items about speaking sincerely, following rules, and keeping greed and showing off in check. You tend to put practical gain and your own share ahead of holding to a principle at a cost.',
    },
    E: {
      high: 'You answered high on items about fear, worry, wanting to lean on others, and sadness at parting. You tend to worry ahead under stress, lean on people close to you, and carry partings with you for a while.',
      mid: 'Your answers on items about fear, worry, wanting to lean on others, and sadness at parting came out mid-range overall.',
      low: 'You answered low on items about fear, worry, wanting to lean on others, and sadness at parting. You tend to be less shaken by worry and to handle hard things on your own.',
    },
    X: {
      high: 'You answered high on items about stepping up in front of people, joining in, and lifting the mood. You tend to draw energy from being around people.',
      mid: 'Your answers on items about stepping up in front of people, joining in, and lifting the mood came out mid-range overall.',
      low: 'You answered low on items about stepping up in front of people, joining in, and lifting the mood. You tend to feel more comfortable alone or with just a few people.',
    },
    A: {
      high: 'You answered high on items about forgiving, being lenient, giving way, and patience. When conflict comes up, you tend to accommodate and move on.',
      mid: 'Your answers on items about forgiving, being lenient, giving way, and patience came out mid-range overall.',
      low: 'You answered low on items about forgiving, being lenient, giving way, and patience. You tend to hold on to hurts rather than let them go easily, and to hold your own position rather than accommodate others.',
    },
    C: {
      high: 'You answered high on items about organization, seeing things through, careful checking, and deliberate decisions. You tend to follow through on what you start and check once more before you finish.',
      mid: 'Your answers on items about organization, seeing things through, careful checking, and deliberate decisions came out mid-range overall.',
      low: 'You answered low on items about organization, seeing things through, careful checking, and deliberate decisions. You tend to decide quickly in the moment rather than follow a set plan.',
    },
    O: {
      high: 'You answered high on items about art, curiosity, unusual approaches, and questioning convention. You tend to be drawn to new ideas and experiences, and to ask “why?” even about the usual way.',
      mid: 'Your answers on items about art, curiosity, unusual approaches, and questioning convention came out mid-range overall.',
      low: 'You answered low on items about art, curiosity, unusual approaches, and questioning convention. You tend to feel more comfortable with familiar, proven methods than with new ones.',
    },
  },

  factorModifier: {
    H: { high: 'Principled', low: 'Pragmatic' },
    E: { high: 'Sensitive', low: 'Undaunted' },
    X: { high: 'Outgoing', low: 'Reserved' },
    A: { high: 'Cooperative', low: 'Independent' },
    C: { high: 'Methodical', low: 'Flexible' },
    O: { high: 'Curious', low: 'Grounded' },
  },

  // "Why this archetype" — answers first, then the score; never "your score shaped you"
  factorRole: {
    H: {
      high: 'You leaned toward principle and fairness, so your Honesty-Humility came out high.',
      low: 'You leaned toward practical gain over principle, so your Honesty-Humility came out low.',
    },
    E: {
      high: 'You reported a lot of worry and leaning on people close to you when things are hard, so your Emotionality came out high.',
      low: 'You reported less worry and fear, so your Emotionality came out low.',
    },
    X: {
      high: 'You leaned toward stepping up and joining in with people, so your Extraversion came out high.',
      low: 'You answered low on stepping up and joining in with people, so your Extraversion came out low.',
    },
    A: {
      high: 'You leaned toward forgiving and accommodating others, so your Agreeableness came out high.',
      low: 'You leaned toward holding your ground over accommodating others, so your Agreeableness came out low.',
    },
    C: {
      high: 'You leaned toward keeping things organized and seeing them through, so your Conscientiousness came out high.',
      low: 'You leaned toward quick, in-the-moment decisions over planning, so your Conscientiousness came out low.',
    },
    O: {
      high: 'You reported strong curiosity and a habit of asking “why?” about the usual way, so your Openness came out high.',
      low: 'You leaned toward familiar, proven ways, so your Openness came out low.',
    },
  },

  traitDescriptions: {
    H: { high: 'Tends to weigh fairness before gain', low: 'Tends to weigh practical gain before principle' },
    E: { high: 'Tends to carry partings with close people for a while', low: 'Tends to be less shaken by worry or fear' },
    X: { high: 'Tends to get energy from being around people', low: 'Tends to feel more at ease with a few people than a crowd' },
    A: { high: 'Tends to give way when conflict comes up', low: 'Tends to hold to their own standards over accommodating others' },
    C: { high: 'Tends to see things through once started', low: 'Tends to follow the flow over the plan' },
    O: { high: 'Tends to ask “why?” even about the usual way', low: 'Tends to trust proven methods over new ones' },
  },

  growthTips: {
    H: {
      high: 'If principles matter a lot to you, expecting others to meet the same standard can cause friction. Before you judge, try explaining your standard first.',
      low: 'Before a big decision, ask yourself once: “Would I be okay if everyone knew how I did this?” It can help protect trust with the people you’ll be around for a long time.',
    },
    E: {
      high: 'Feeling things deeply can also tire you out quickly. When worry builds up, instead of trying to fix it right away, step back for a moment and write it down.',
      low: 'If worry doesn’t shake you much, try saying “that sounds really hard” before offering a solution when someone around you is struggling.',
    },
    X: {
      high: 'If you get your energy from people, deliberately set aside time to think on your own — and use it to take one more look at big decisions.',
      low: 'If time alone or with a few people feels comfortable, keep it — and build a small habit of reaching out first to the people who matter. It can help keep connections from fading.',
    },
    A: {
      high: 'If you tend to smooth things over, try saying once, “Here’s how that made me feel.” It can do more for a relationship over time than just holding it in.',
      low: 'Before pointing out a problem, acknowledge the other person’s intent in one sentence. The same message can come across less sharply.',
    },
    C: {
      high: 'Instead of waiting for the perfect plan, act on a “good enough” start. It can help keep your thoroughness from delaying the start.',
      low: 'If you tend to follow the flow, pick the single most important thing and write down its deadline. It can help you finish while keeping your spontaneity.',
    },
    O: {
      high: 'The more ideas you have, the more it matters to test one all the way through. Pick one new attempt and finish a small version of it.',
      low: 'If proven methods feel comfortable, try one unfamiliar approach in a small way once a month. It can widen your options.',
    },
  },

  comboTips: {
    'E_high+C_high': 'You leaned toward worrying a lot and toward seeing things through. When a worry comes up, turn it into an item on your to-do list — a way to use your thoroughness as a tool for handling anxiety.',
    'X_low+O_high': 'You answered low on stepping up in front of people and high on curiosity and unusual approaches. This week, share one idea you’ve explored on your own with just one person you trust. One person can be an easier first audience than a crowd.',
    'X_low+E_high': 'You answered low on joining in with people and high on items about worry. Being around people may tire you out, so when you make plans, block out time to recover alone the next day before anything else.',
    'C_high+O_high': 'You leaned toward seeing things through and toward being drawn to new things. Once a month, take one idea all the way to a small finished piece — a short post, a single draft.',
    'X_high+C_low': 'You leaned toward joining in with people and toward following the flow over a plan. When you start something, telling someone your deadline up front can help you finish.',
    'H_high+A_low': 'You leaned toward principle and toward holding your ground over accommodating others. Before you point out a problem, acknowledge the other person’s intent in one sentence — the same words can come across less sharply.',
    'A_high+E_high': 'You leaned toward accommodating others and toward worrying a lot. When something hurts, say it briefly — “this is how I felt” — before you bottle it up.',
    'O_high+C_low': 'You leaned toward being drawn to new things and toward following the flow over a plan. When you pick up something new, set a small time limit, like “try it for two weeks, then decide.”',
  },

  shadowNotes: {
    C: 'That said, you also leaned toward finishing what you take on even when you don’t feel like it, so your Conscientiousness came out high. That makes it all the more important to put recovery time on your calendar first.',
    O: 'That said, you leaned toward being open to new ways rather than sticking only to the old one, so your Openness came out high.',
    E: 'That said, you answered high on items about worry, wanting to lean on others, and sadness at parting, so your Emotionality came out high.',
    X: 'That said, you answered low on stepping up and joining in with people, so your Extraversion came out low. You may tend to keep a quiet pace that saves your energy.',
  },

  why: (defining, modifiers, name) => {
    const base = defining.length > 0
      ? `${defining.join(' ')} Overall, your answers came closest to ${mid(name)}.`
      : `None of the factors that define this archetype stood out clearly, but your overall balance is closest to ${mid(name)}.`
    const mod = modifiers.length > 0 ? ` Beyond that, ${lcFirst(modifiers.join(' '))}` : ''
    return base + mod
  },

  lowSignalTip: 'No factor stood out in your answers this time, so it’s hard to suggest a specific habit. Think of one thing that went well recently and one that was hard, and write down what you did in each. That record can be a starting point for finding what works for you.',

  secondaryWhy: (hits, name) => {
    if (!hits.length) return `${name} came out as your next-closest match — not because of one standout factor, but because your overall balance is similar.`
    const list = andList(hits.map(h => `${h.dir} ${h.label}`))
    return `Your ${list} ${hits.length > 1 ? 'overlap' : 'overlaps'} with ${mid(name)}, which is why it’s your next-closest archetype.`
  },
}
