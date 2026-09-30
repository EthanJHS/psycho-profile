// 영어판 22원형 문구 — 한국어판(lib/archetypes-hexaco.ts)과 같은 ID·같은 필드. name = 화면 표시 이름, nameEn = 카드용 대문자 표기
// 영문 이름 변경(2026-09-30): opportunist→Playmaker, warrior→Champion, hedonist→Free Spirit (한국어판 nameEn도 같이 변경)
import type { ArchetypeDetail } from '../archetypes-hexaco'

export const ARCHETYPE_DETAILS_EN: Record<string, ArchetypeDetail> = {

  guardian: {
    id: 'guardian', name: 'The Guardian', nameEn: 'THE GUARDIAN',
    tagline: 'The one who stays until what matters is safe',
    daily: '"If I don’t handle it myself, I can’t relax."',
    light: 'An anchor of trust who holds others steady through principle and responsibility',
    shadow: 'Carrying every responsibility alone can wear you down, and holding on to familiar ways can make you slow to change',
    shortDesc: 'You live by keeping your word and respecting the norms that hold people together. You shine brightest when you’re taking care of your people, and those around you feel safer simply because you’re there.',
    traits: ['Strong sense of duty', 'Consistent principles', 'Genuine care for others', 'Steady reliability'],
  },

  warrior: {
    id: 'warrior', name: 'The Champion', nameEn: 'THE CHAMPION',
    tagline: 'If it’s right, I’ll stand up for it — even alone',
    daily: '"If it’s wrong, someone has to say it."',
    light: 'An idealist who doesn’t back down in the face of injustice',
    shadow: 'When you’re focused on who’s right and who’s wrong, you can turn potential allies into opponents',
    shortDesc: 'You step forward for what you believe is right. You have the strength to refuse easy compromises — the key is keeping your goals clear so that strength doesn’t get spent on battles that drain you.',
    traits: ['Sense of justice', 'Strong drive', 'Direct expression', 'High principles'],
  },

  visionary: {
    id: 'visionary', name: 'The Visionary', nameEn: 'THE VISIONARY',
    tagline: 'Designing today with ten years from now in mind',
    daily: '"If no one’s done it yet, I guess I’ll go first."',
    light: 'A source of inspiration who builds big futures on solid principles',
    shadow: 'Without a plan to carry it out, a vision can stay a statement',
    shortDesc: 'You see a picture of a better world and bring people toward it. A vision grounded in honesty and openness is powerful — as long as you build the momentum to make it real.',
    traits: ['Long-term perspective', 'Inspiring communication', 'Principled leadership', 'Intellectual curiosity'],
  },

  artisan: {
    id: 'artisan', name: 'The Artisan', nameEn: 'THE ARTISAN',
    tagline: 'No shortcuts. My way. All the way.',
    daily: '"‘Good enough’ isn’t in my vocabulary."',
    light: 'A quiet master who keeps moving toward the finished, flawless piece',
    shadow: 'Holding tight to your own standards can make other approaches hard to accept, and collaboration can drift away',
    shortDesc: 'You have your own standards and your own way of doing things, and you don’t compromise on them. Your focus on the work over the people leads to real expertise — though it can also create friction.',
    traits: ['Pursuit of craft', 'Independent judgment', 'Technical rigor', 'Respect for tradition'],
  },

  sentinel: {
    id: 'sentinel', name: 'The Sentinel', nameEn: 'THE SENTINEL',
    tagline: 'Rules exist for a reason. That’s the reason.',
    daily: '"No exceptions."',
    light: 'A steady watchkeeper who holds the line without being swayed by emotion',
    shadow: 'Leading with principle can mean missing the warmth someone needs from you',
    shortDesc: 'You follow rules and procedures consistently, and principle comes before feeling. Your unshakable reliability is a strength, but sticking to the rule over the context can create friction.',
    traits: ['Principle-driven', 'Emotional restraint', 'Systematic approach', 'Consistent standards'],
  },

  conqueror: {
    id: 'conqueror', name: 'The Conqueror', nameEn: 'THE CONQUEROR',
    tagline: 'When there’s a goal, feelings are a luxury',
    daily: '"I only fight battles I can win."',
    light: 'An executor who pushes forward with the plan and doesn’t flinch',
    shadow: 'Rushing for results at the cost of fairness can shake the trust you’ve built',
    shortDesc: 'You move with a cool head and a clear plan, and you don’t back down from competition. You’re exceptional at hitting goals — your biggest risk comes when you overlook the feelings and values of the people beside you.',
    traits: ['Strategic thinking', 'Emotional control', 'Strong execution', 'Drive to lead'],
  },

  opportunist: {
    id: 'opportunist', name: 'The Playmaker', nameEn: 'THE PLAYMAKER',
    tagline: 'Read the current first. Move first.',
    daily: '"This could actually work. Let’s just try it."',
    light: 'A quick-witted scout who reads the moment and seizes it',
    shadow: 'When your direction shifts with every new opening, people can find you hard to predict',
    shortDesc: 'You pick up on change quickly and spot the possibilities inside it. You’re open and flexible — but without consistent principles, people can find it hard to know where you stand.',
    traits: ['Reading the room', 'Fast adaptation', 'Open exploration', 'Nimble action'],
  },

  strategist: {
    id: 'strategist', name: 'The Strategist', nameEn: 'THE STRATEGIST',
    tagline: 'Someone has to set up the board',
    daily: '"I was already three moves ahead."',
    light: 'A planner who reads the whole board and designs one step ahead',
    shadow: 'Keeping your intentions to yourself for too long can make people feel distant from you',
    shortDesc: 'You grasp the whole structure and aim for maximum results with minimum moves. Sharp analysis and planning are your strengths, but a habit of not revealing your intentions can make relationships feel stiff.',
    traits: ['Structural thinking', 'Command of information', 'Long-range planning', 'Controlled execution'],
  },

  charmer: {
    id: 'charmer', name: 'The Charmer', nameEn: 'THE CHARMER',
    tagline: 'The room changes when you walk in',
    daily: '"Not many people dislike me. Honestly."',
    light: 'A magnetic presence who draws every eye in the room',
    shadow: 'Spending your energy managing the mood can cost you chances to share what you really feel',
    shortDesc: 'You read people’s emotions and know how to draw out the reaction you want. You have natural charm and energy — and relationships last longer when you use that charm for sincerity rather than effect.',
    traits: ['Strong presence', 'Emotional sensitivity', 'Social energy', 'Persuasiveness'],
  },

  companion: {
    id: 'companion', name: 'The Companion', nameEn: 'THE COMPANION',
    tagline: 'Just being there is enough',
    daily: '"Are you okay? What happened?"',
    light: 'A sincere soul whose presence alone feels warm',
    shadow: 'The deeper you go into someone else’s feelings, the easier it is to put your own needs last',
    shortDesc: 'You find your truest self in your relationships. Because your wish to accept people fully and be there for them is genuine, people feel at ease around you.',
    traits: ['Heartfelt empathy', 'Devoted relationships', 'Emotional sensitivity', 'Deep trustworthiness'],
  },

  empath: {
    id: 'empath', name: 'The Empath', nameEn: 'THE EMPATH',
    tagline: 'Feeling every small shift in emotion, deeply',
    daily: '"Why am I suddenly sad... oh, it’s the person next to me."',
    light: 'An inward resonator who absorbs the world through senses and feelings',
    shadow: 'On days with too much going on, you tire easily — make time to recover on your own',
    shortDesc: 'You respond deeply to other people’s feelings and to the beauty in the world, with a rich imagination and sensitivity. You’re at your most creative and whole when you have time alone to sort through your inner world.',
    traits: ['Deep sensitivity', 'Rich imagination', 'Inward energy', 'Artistic attunement'],
  },

  passionate: {
    id: 'passionate', name: 'The Passionate', nameEn: 'THE PASSIONATE',
    tagline: 'Emotion is my fuel',
    daily: '"If I’m mad, I’m mad. If I love it, I love it."',
    light: 'An intense presence who makes every moment feel alive',
    shadow: 'Words said in the heat of the moment can linger in a relationship for a long time',
    shortDesc: 'You don’t hide or hold back your emotions — you express them as they are. That energy lifts and stirs the people around you, but if feelings keep running ahead of you, relationships can start to crack.',
    traits: ['Vivid emotional expression', 'Instant reactions', 'High energy', 'Direct communication'],
  },

  fighter: {
    id: 'fighter', name: 'The Fighter', nameEn: 'THE FIGHTER',
    tagline: 'Goal first. Feelings later.',
    daily: '"It’s hard. I’m doing it anyway."',
    light: 'A doer who charges toward the goal without wavering',
    shadow: 'Once everything becomes a competition, you can miss chances to work together',
    shortDesc: 'Once you have a goal, you set your feelings aside and push ahead. Coolness plus drive is a real strength — but drive without consideration can wear out the people around you.',
    traits: ['Goal-oriented', 'Emotional restraint', 'Focused execution', 'Competitive spirit'],
  },

  coordinator: {
    id: 'coordinator', name: 'The Coordinator', nameEn: 'THE COORDINATOR',
    tagline: 'Things work when people are in the right place',
    daily: '"If I don’t connect everyone, it all falls apart."',
    light: 'A social architect who connects people and systems so the whole thing runs',
    shadow: 'Trying to keep everyone aligned can make you lose track of your own direction',
    shortDesc: 'You’re skilled at organizing relationships and roles between people. Outgoing energy, warmth, and structure come together in you, so you often end up at the center of teams and communities.',
    traits: ['Social coordination', 'Relationship building', 'Systematic thinking', 'Collaborative mindset'],
  },

  sage: {
    id: 'sage', name: 'The Sage', nameEn: 'THE SAGE',
    tagline: 'The more you know, the more you know you don’t',
    daily: '"Wait — to be more precise..."',
    light: 'A source of deep wisdom where principle, knowledge, and inquiry meet',
    shadow: 'The more certain you are of what you know, the slower you may be to take in new perspectives',
    shortDesc: 'You seek truth and principle, and you try to live them out. Knowledge, diligence, and an open mind come together in you, and your strengths show most when you share what you’ve learned.',
    traits: ['Intellectual inquiry', 'Principled living', 'Deep insight', 'Scholarly diligence'],
  },

  analyst: {
    id: 'analyst', name: 'The Analyst', nameEn: 'THE ANALYST',
    tagline: 'See the structure, and the answer appears',
    daily: '"What’s your source?"',
    light: 'A dissector who breaks complexity down to reveal what’s essential',
    shadow: 'When critique becomes a habit, you can get stuck finding flaws instead of building alternatives',
    shortDesc: 'You see through the contradictions and flaws beneath the surface. You trust logic over emotion, and you don’t accept any claim without checking it.',
    traits: ['Critical analysis', 'Intellectual independence', 'Emotional restraint', 'Deconstruction'],
  },

  explorer: {
    id: 'explorer', name: 'The Explorer', nameEn: 'THE EXPLORER',
    tagline: 'The road not taken is the interesting one',
    daily: '"If nobody’s tried it, I’ll be the first."',
    light: 'A free adventurer who leaps into the unknown without fear',
    shadow: 'Always chasing the next new thing can leave little time to build depth in one place',
    shortDesc: 'You’re the kind of person who gets excited by the unknown. You move toward new experiences and knowledge without hesitation — though finding it hard to stay in one place can get in the way of going deep.',
    traits: ['Adventurous exploration', 'Fearless challenge', 'Intellectual openness', 'Love of freedom'],
  },

  dreamer: {
    id: 'dreamer', name: 'The Dreamer', nameEn: 'THE DREAMER',
    tagline: 'The world in my head is sharper than the real one',
    daily: '"Huh? Sorry, I zoned out."',
    light: 'A giant of imagination living in a world of possibilities beyond reality',
    shadow: 'The bigger the plans in your head, the later they may make it into the real world',
    shortDesc: 'There’s a whole other world inside you. A rich imagination and creative thinking are your strengths — pair them with the structure and drive to turn them into action.',
    traits: ['Rich imagination', 'Creative thinking', 'Inward focus', 'Original perspective'],
  },

  cynic: {
    id: 'cynic', name: 'The Cynic', nameEn: 'THE CYNIC',
    tagline: 'Too many people are pretending to mean it',
    daily: '"There’s no way that’s real."',
    light: 'A clear-eyed realist who sees through falseness and hypocrisy',
    shadow: 'When doubt becomes the default, you may keep even trustworthy people at a distance',
    shortDesc: 'You look at motives before words and at structure before appearances. That view is sharp — but if you close the door even on people worth trusting, you may end up carrying things alone for a long time.',
    traits: ['Sharp skepticism', 'Hard to fool', 'Critical worldview', 'Independent distance'],
  },

  pragmatist: {
    id: 'pragmatist', name: 'The Pragmatist', nameEn: 'THE PRAGMATIST',
    tagline: 'Do what works. Drop what doesn’t, fast.',
    daily: '"Let’s leave feelings out of this."',
    light: 'A capable doer who finds the efficient path without getting swept up in emotion',
    shadow: 'Putting efficiency first can mean missing how the people you work with feel',
    shortDesc: 'You trust only what works. Results over theory, efficiency over emotion — you quickly find the best way forward with whatever you’ve got.',
    traits: ['Practical judgment', 'Results-focused', 'Emotional restraint', 'Efficiency-minded'],
  },

  realist: {
    id: 'realist', name: 'The Realist', nameEn: 'THE REALIST',
    tagline: 'See the world as it is',
    daily: '"Okay, ideals aside — realistically..."',
    light: 'A strategist who reads reality precisely and weighs the costs and benefits',
    shadow: 'Using gains and losses as your only measure can make relationships feel transactional',
    shortDesc: 'You see the world as it is. You go for real gains and stability over romance or ideals, and you’re good at managing resources systematically and keeping risk low.',
    traits: ['Realistic judgment', 'Cost-benefit sense', 'Systematic execution', 'Risk management'],
  },

  hedonist: {
    id: 'hedonist', name: 'The Free Spirit', nameEn: 'THE FREE SPIRIT',
    tagline: 'This moment is everything',
    daily: '"Let’s grab something good to eat first, then think."',
    light: 'Someone who lives the present moment to the fullest, senses wide open',
    shadow: 'Putting today’s fun first can mean the things you put off all come back at once',
    shortDesc: 'You put present joy and sensory pleasure at the center of your life. Your spontaneous, free-flowing energy is magnetic — but if you keep pushing long-term consequences down the road, they can pile up.',
    traits: ['Pursuit of joy', 'Quick decisions', 'Sensory energy', 'Love of freedom'],
  },
}
