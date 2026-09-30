import { Question } from '@/types'

export const SAMPLE_QUESTIONS_EN: Question[] = [

  // ══════════════════════════════════════════════════
  // SECTION 1 — Interface with the World (9 items)
  // boldness·curiosity·anxiety·diligence·patience·humility
  // ══════════════════════════════════════════════════

  {
    id: 'Q1',
    text: 'An old friend brings you to a party.\nYou don\'t know anyone there.\nAn hour later, you are:',
    type: 'choice',
    facet: 'extraversion',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'Deep in conversation with two or three new people', value: 'A' },
      { label: 'Comfortably part of your friend\'s conversation', value: 'B' },
      { label: 'Mingling a bit, but mostly observing the room', value: 'C' },
      { label: 'Honestly counting down until you can leave', value: 'D' },
    ],
  },

  {
    id: 'Q3',
    text: 'You have exactly five minutes to choose a book.\nWhat do you pick up?',
    type: 'choice',
    facet: 'openness',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'Something from a field you know nothing about', value: 'A' },
      { label: 'A deeper dive into a topic you already care about', value: 'B' },
      { label: 'The new release from an author you\'ve enjoyed before', value: 'C' },
    ],
  },

  {
    id: 'Q5',
    text: 'After making an important decision, you:',
    type: 'choice',
    facet: 'emotionality',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'Move on immediately — second-guessing is a waste of time', value: 'A' },
      { label: 'Occasionally revisit it, but don\'t lose sleep over it', value: 'B' },
      { label: 'Spend days replaying the alternatives in your head', value: 'C' },
    ],
  },

  {
    id: 'Q2',
    text: 'Something unexpected comes up over the weekend.\nYour first reaction is:',
    type: 'choice',
    facet: 'conscientiousness',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'Schedule it immediately and clear it from your mind', value: 'A' },
      { label: 'Think about it but not plan it right away', value: 'B' },
      { label: 'Let it be — it\'ll work itself out', value: 'C' },
    ],
  },

  {
    id: 'Q4',
    text: 'A close friend asks for honest feedback.\nYou know it will make them uncomfortable:',
    type: 'choice',
    facet: 'agreeableness',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'Say it — their growth matters more than their comfort', value: 'A' },
      { label: 'Say it, but soften it carefully', value: 'B' },
      { label: 'Look for the right moment and often end up not saying it', value: 'C' },
    ],
  },

  {
    id: 'Q7',
    text: 'Your work received strong praise.\nHow do you tell people around you?',
    type: 'choice',
    facet: 'honesty',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'I don\'t bring it up — if they ask, I\'ll mention it calmly', value: 'A' },
      { label: 'I share it happily with people close to me', value: 'B' },
      { label: 'I let people know — I earned it', value: 'C' },
    ],
  },

  {
    id: 'Q6',
    text: 'Days before an important presentation,\nyour state of mind is:',
    type: 'choice',
    facet: 'emotionality',
    domain: 'BIG5',
    section: 'world',
    options: [
      { label: 'Not really on my radar — I\'ll deal with it when it comes', value: 'A' },
      { label: 'A little nervous, but it actually helps me focus', value: 'B' },
      { label: 'I\'m losing sleep running through scenarios in my head', value: 'C' },
    ],
  },

  // ── Reverse items ────────────────────────────────────────────────
  {
    id: 'QR1',
    text: 'It\'s Saturday morning and you have no plans.\nWhat feels most natural?',
    type: 'choice',
    facet: 'extraversion',
    domain: 'BIG5',
    section: 'world',
    reverse: true,
    options: [
      { label: 'Stay in — read, watch something, recharge alone', value: 'A' },
      { label: 'Go out if someone reaches out, otherwise stay home', value: 'B' },
      { label: 'Text someone first and make plans', value: 'C' },
    ],
  },

  {
    id: 'QR2',
    text: 'There\'s a task you really don\'t want to do.\nDeadline is in three days. Today you:',
    type: 'choice',
    facet: 'conscientiousness',
    domain: 'BIG5',
    section: 'world',
    reverse: true,
    options: [
      { label: 'Put it off — you\'ll power through it when the mood hits', value: 'A' },
      { label: 'Do a bit, but don\'t force it', value: 'B' },
      { label: 'Get your share done regardless of how you feel', value: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════
  // SECTION 2 — The Architecture of Decisions (9 items)
  // ══════════════════════════════════════════════════

  {
    id: 'Q8',
    text: 'When starting a new project,\nthe louder voice in your head is:',
    type: 'choice',
    facet: 'regulatory_focus',
    domain: 'DRIVE',
    section: 'decision',
    options: [
      { label: '"What could this open up if it works?"', value: 'A' },
      { label: '"What do I need to watch out for to avoid failure?"', value: 'B' },
    ],
  },

  {
    id: 'Q10',
    text: 'When something goes wrong,\nthe first thought that surfaces is:',
    type: 'choice',
    facet: 'locus_of_control',
    domain: 'DRIVE',
    section: 'decision',
    options: [
      { label: '"What could I have done differently?"', value: 'A' },
      { label: '"The situation just wasn\'t in my favor"', value: 'B' },
      { label: 'Both hit me at the same time', value: 'C' },
    ],
  },

  {
    id: 'Q11',
    text: 'You\'re paired with someone who seems less skilled than you.\nYour honest first feeling is:',
    type: 'choice',
    facet: 'honesty',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: 'A sense that I\'ll have to carry more of the load', value: 'A' },
      { label: 'A feeling that I can be genuinely helpful here', value: 'B' },
      { label: 'A practical thought: let\'s just divide the work clearly', value: 'C' },
    ],
  },

  {
    id: 'Q13',
    text: 'If you could choose:',
    type: 'choice',
    facet: 'openness',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: 'A stable, predictable life', value: 'A' },
      { label: 'An uncertain life with intense experiences', value: 'B' },
      { label: 'A life that alternates between both', value: 'C' },
    ],
  },

  {
    id: 'Q12',
    text: 'Pressed for time between quality and speed:',
    type: 'choice',
    facet: 'conscientiousness',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: 'Hand it in on time even if it\'s not my best', value: 'A' },
      { label: 'Take the extra time and get it right', value: 'B' },
      { label: 'Depends on the situation', value: 'C' },
    ],
  },

  {
    id: 'Q15',
    text: 'When you get unexpected bad news,\nyour first reaction is:',
    type: 'choice',
    facet: 'emotionality',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: 'I tell myself it\'ll be fine and redirect quickly', value: 'A' },
      { label: 'I take a moment, then shift into problem-solving mode', value: 'B' },
      { label: 'Worst-case scenarios start lining up in my head', value: 'C' },
    ],
  },

  {
    id: 'Q14',
    text: 'In your life, what mainly defines "right"?',
    type: 'choice',
    facet: 'openness',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: 'Principles society has upheld for a long time', value: 'A' },
      { label: 'What I\'ve personally experienced and verified', value: 'B' },
      { label: 'What makes logical sense to me', value: 'C' },
    ],
  },

  // ── Reverse item ─────────────────────────────────────────────────
  {
    id: 'QR4',
    text: 'Everyone in the meeting agrees on a direction,\nbut you can clearly see it\'s wrong. You:',
    type: 'choice',
    facet: 'agreeableness',
    domain: 'BIG5',
    section: 'decision',
    reverse: true,
    options: [
      { label: 'Speak up even if it disrupts the mood', value: 'A' },
      { label: 'Quietly pull aside the right person after the meeting', value: 'B' },
      { label: 'Go along with the team — it\'s hard to change things anyway', value: 'C' },
    ],
  },

  {
    id: 'Q9',
    text: 'When planning a trip:',
    type: 'choice',
    facet: 'conscientiousness',
    domain: 'BIG5',
    section: 'decision',
    options: [
      { label: 'I need hotels, transport, and restaurants booked in advance', value: 'A' },
      { label: 'I set a rough framework and fill in the rest on the go', value: 'B' },
      { label: 'I just go — it always works out', value: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════
  // SECTION 3 — The Dynamics of Relationships (13 items)
  // ══════════════════════════════════════════════════

  {
    id: 'Q17',
    text: 'After a long social event, you feel:',
    type: 'choice',
    facet: 'extraversion',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Energized — I actually charged up', value: 'A' },
      { label: 'It was good, but now I need some time alone', value: 'B' },
      { label: 'Pretty drained — recovery takes a while', value: 'C' },
    ],
  },

  // ── Reverse item ─────────────────────────────────────────────────
  {
    id: 'QR5',
    text: 'Unexpected good news arrives out of nowhere.\nYour first reaction is:',
    type: 'choice',
    facet: 'emotionality',
    domain: 'BIG5',
    section: 'relation',
    reverse: true,
    options: [
      { label: 'Just happy — I take it and run with it', value: 'A' },
      { label: 'Happy, but I want to double-check the details first', value: 'B' },
      { label: 'Happy, but a little voice asks "what\'s the catch?"', value: 'C' },
    ],
  },

  {
    id: 'Q16',
    text: 'When there\'s a disagreement, you:',
    type: 'choice',
    facet: 'agreeableness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'State your position clearly and try to persuade', value: 'A' },
      { label: 'Look for common ground first', value: 'B' },
      { label: 'Step back — conflict itself makes you uncomfortable', value: 'C' },
    ],
  },

  // ── Reverse item ─────────────────────────────────────────────────
  {
    id: 'QR6',
    text: 'After a team project, your manager asks "who drove this result?"\nYou contributed the most. You say:',
    type: 'choice',
    facet: 'honesty',
    domain: 'BIG5',
    section: 'relation',
    reverse: true,
    options: [
      { label: '"I played the central role here"', value: 'A' },
      { label: '"It was a team effort, myself included"', value: 'B' },
      { label: '"The team made it happen — I just helped"', value: 'C' },
    ],
  },

  {
    id: 'Q19',
    text: 'Someone close to you is about to make a clearly bad choice.\nYou:',
    type: 'choice',
    facet: 'agreeableness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Say something without waiting to be asked', value: 'A' },
      { label: 'Speak only if they ask — it\'s their decision', value: 'B' },
      { label: 'Want to say something but hold back to protect the relationship', value: 'C' },
    ],
  },

  {
    id: 'Q22',
    text: 'In a group with no clear leader, you:',
    type: 'choice',
    facet: 'extraversion',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Naturally start suggesting a direction', value: 'A' },
      { label: 'Wait for someone else to step up', value: 'B' },
      { label: 'Step in if needed, but it\'s not your preference', value: 'C' },
    ],
  },

  {
    id: 'Q18',
    text: 'When you do something well, what you want more is:',
    type: 'choice',
    facet: 'honesty',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Others to notice and acknowledge it', value: 'A' },
      { label: 'The satisfaction of knowing it yourself', value: 'B' },
      { label: 'Honestly, both', value: 'C' },
    ],
  },

  {
    id: 'Q21',
    text: 'When you meet someone whose values are completely different from yours:',
    type: 'choice',
    facet: 'openness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'It makes the conversation more interesting', value: 'A' },
      { label: 'It\'s a bit uncomfortable, but I can listen', value: 'B' },
      { label: 'It\'s draining — I don\'t want to convince or be convinced', value: 'C' },
    ],
  },

  {
    id: 'Q23',
    text: 'You\'re sharing an elevator with a stranger for 30 seconds.\nYou:',
    type: 'choice',
    facet: 'extraversion',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Start a casual conversation naturally', value: 'A' },
      { label: 'Pick up if they start something, otherwise stay quiet', value: 'B' },
      { label: 'Check your phone or stand in silence', value: 'C' },
    ],
  },

  {
    id: 'Q24',
    text: 'In a team project, your idea wasn\'t chosen.\nYou:',
    type: 'choice',
    facet: 'honesty',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Respect the team\'s decision and give it your full effort', value: 'A' },
      { label: 'Try to understand why it wasn\'t selected', value: 'B' },
      { label: 'Keep pushing if you genuinely believe yours was better', value: 'C' },
    ],
  },

  // ── Reverse item ─────────────────────────────────────────────────
  {
    id: 'QR3',
    text: 'An app you use regularly has been completely redesigned.\nYou:',
    type: 'choice',
    facet: 'openness',
    domain: 'BIG5',
    section: 'relation',
    reverse: true,
    options: [
      { label: 'Wish it had stayed the same — why fix what wasn\'t broken?', value: 'A' },
      { label: 'Accept it — you\'ll get used to it', value: 'B' },
      { label: 'Start exploring what\'s different right away', value: 'C' },
    ],
  },

  {
    id: 'Q20',
    text: 'You\'ve just presented to a room full of strangers.\nThat night, you:',
    type: 'choice',
    facet: 'emotionality',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Barely think about it either way', value: 'A' },
      { label: 'Keep replaying the moments that didn\'t go well', value: 'B' },
      { label: 'Feel great if it went well, or carry it for days if it didn\'t', value: 'C' },
    ],
  },

  {
    id: 'Q25',
    text: 'Someone makes the same mistake for the third time.\nYour reaction:',
    type: 'choice',
    facet: 'agreeableness',
    domain: 'BIG5',
    section: 'relation',
    options: [
      { label: 'Walk them through it calmly once more', value: 'A' },
      { label: 'Frustrated inside, but you don\'t show it', value: 'B' },
      { label: 'Express your frustration honestly', value: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════
  // SECTION 4 — The Structure of Thought (Q26–Q31)
  // ══════════════════════════════════════════════════

  {
    id: 'Q26',
    text: 'Facing an important decision,\nwhat do you trust more?',
    type: 'choice',
    facet: 'cog_mode',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: 'Data and logical analysis', value: 'A' },
      { label: 'A strong gut feeling even if it\'s hard to explain', value: 'B' },
      { label: 'Analysis, but I let intuition make the final call', value: 'C' },
    ],
  },

  {
    id: 'Q27',
    text: 'You find evidence that a long-held belief is wrong.\nYou:',
    type: 'choice',
    facet: 'cog_flex',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: 'Change my mind immediately — the evidence is enough', value: 'A' },
      { label: 'Need more proof before I\'m convinced', value: 'B' },
      { label: 'Accept it mentally, but emotionally it takes longer', value: 'C' },
    ],
  },

  {
    id: 'Q28',
    text: 'When you hear a new idea,\nthe first thing you want to know is:',
    type: 'choice',
    facet: 'cog_abstract',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: '"How does it actually work in practice?"', value: 'A' },
      { label: '"What\'s the core principle behind it?"', value: 'B' },
      { label: '"Has anyone done something similar before?"', value: 'C' },
    ],
  },

  {
    id: 'Q29',
    text: 'When you face a genuinely complex problem with no clear answer:',
    type: 'choice',
    facet: 'cog_depth',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: 'You actually lean in — it feels like a puzzle worth solving', value: 'A' },
      { label: 'No clear answer means wasted energy', value: 'B' },
      { label: 'Think up to a point, then let it go', value: 'C' },
    ],
  },

  {
    id: 'Q30',
    text: 'Where does most of your energy flow?',
    type: 'choice',
    facet: 'time_orientation',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: 'Being fully present in the current moment', value: 'A' },
      { label: 'Planning and preparing for the future', value: 'B' },
      { label: 'Drawing lessons and patterns from the past', value: 'C' },
    ],
  },

  {
    id: 'Q31',
    text: 'When you\'re trying to understand a complex situation,\nyou more naturally:',
    type: 'choice',
    facet: 'cog_style',
    domain: 'MODE',
    section: 'cognition',
    options: [
      { label: 'Grasp the overall structure and patterns first', value: 'A' },
      { label: 'Build up from the individual details one by one', value: 'B' },
    ],
  },

  // ══════════════════════════════════════════════════
  // SECTION 5 — The Core (Q32–Q36)
  // ══════════════════════════════════════════════════

  {
    id: 'Q32',
    text: 'If you had to choose one thing you\'d never\ngive up until the very end:',
    type: 'choice',
    facet: 'core_value',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: 'Freedom — to live on my own terms', value: 'A' },
      { label: 'Security — to have nothing to lose', value: 'B' },
      { label: 'Achievement — to have built something meaningful', value: 'C' },
      { label: 'Connection — to deeply love and be loved', value: 'D' },
    ],
  },

  {
    id: 'Q33',
    text: 'Honestly — something you sometimes feel:',
    type: 'choice',
    facet: 'shadow',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: 'Others\' success triggers comparison before it triggers joy', value: 'A' },
      { label: 'When things don\'t go my way, there\'s an inexplicable frustration', value: 'B' },
      { label: 'Without recognition, my motivation visibly drops', value: 'C' },
      { label: 'Almost none of the above apply to me', value: 'D' },
    ],
  },

  {
    id: 'Q34',
    text: 'The situation you most want to avoid:',
    type: 'choice',
    facet: 'core_fear',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: 'Being seen as incompetent', value: 'A' },
      { label: 'Being left completely alone with no one around', value: 'B' },
      { label: 'Being trapped in a situation where I have no control', value: 'C' },
      { label: 'Being publicly shown to be wrong', value: 'D' },
    ],
  },

  {
    id: 'Q35',
    text: 'You feel most proud of yourself when:',
    type: 'choice',
    facet: 'self_concept',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: 'You solved a problem no one else could crack', value: 'A' },
      { label: 'You became genuinely needed by someone', value: 'B' },
      { label: 'You stayed true to a standard you set for yourself', value: 'C' },
      { label: 'You created something that had never existed before', value: 'D' },
    ],
  },

  {
    id: 'Q36',
    text: 'While taking this assessment, you:',
    type: 'choice',
    facet: 'meta_cog',
    domain: 'DRIVE',
    section: 'essence',
    options: [
      { label: 'Answered pretty much as you expected', value: 'A' },
      { label: 'Found more choices harder than you thought', value: 'B' },
      { label: 'Aren\'t quite sure how honest you really were', value: 'C' },
    ],
  },
]

export const SECTION_TRANSITIONS_EN: Record<string, {
  title: string
  description: string
  icon: string
  theory: string
}> = {
  world: {
    title: 'Interface with the World',
    description: 'We explore how you experience the world around you — where your energy, curiosity, and sense of stability come from.',
    icon: '🌐',
    theory: 'Theoretical basis: Big Five Personality Model (NEO-PI-R) — Extraversion, Conscientiousness, Openness, Agreeableness, Neuroticism',
  },
  decision: {
    title: 'The Architecture of Decisions',
    description: 'How does your mind work at the moment of choice? We uncover the deep patterns behind how you set goals and take action.',
    icon: '⚡',
    theory: 'Theoretical basis: Regulatory Focus Theory (Higgins 1997) × Locus of Control (Rotter 1954)',
  },
  relation: {
    title: 'The Dynamics of Relationships',
    description: 'How you connect with others, navigate conflict, and find your place in a group.',
    icon: '🤝',
    theory: 'Theoretical basis: Agreeableness × HEXACO Honesty-Humility dimension × Attachment theory',
  },
  cognition: {
    title: 'The Structure of Thought',
    description: 'How you process information and solve problems. Analytical vs. intuitive, concrete vs. abstract — your cognitive signature.',
    icon: '🧠',
    theory: 'Theoretical basis: Construal Level Theory (Trope & Liberman 2010) × Need for Cognition Scale (NCS)',
  },
  essence: {
    title: 'The Core',
    description: 'Five final questions. Answer as honestly as you can. There are no right answers here — only your truth.',
    icon: '✨',
    theory: 'Theoretical basis: Schwartz Basic Values Model (1992) × Jungian psychology × Metacognition',
  },
}
