// 영어판 22원형 문구 — 한국어판(lib/archetypes-hexaco.ts)과 같은 ID·같은 필드. name = 화면 표시 이름, nameEn = 카드용 대문자 표기
// 영문 이름 변경(2026-09-30): opportunist→Playmaker, warrior→Champion, hedonist→Free Spirit (한국어판 nameEn도 같이 변경)
// 원형 공통 문구 원칙은 한국어판과 같다 (2026-10-29): shortDesc는 "This archetype pictures someone who…"(3인칭), light·shadow에 you·능력 장담을 쓰지 않는다
import type { ArchetypeDetail } from '../archetypes-hexaco'

export const ARCHETYPE_DETAILS_EN: Record<string, ArchetypeDetail> = {

  guardian: {
    id: 'guardian', name: 'The Guardian', nameEn: 'THE GUARDIAN',
    tagline: 'The one who stays until what matters is safe',
    daily: '"If I don’t handle it myself, I can’t relax."',
    light: 'An anchor of trust who tries to hold others steady through principle and responsibility',
    shadow: 'Carrying every responsibility alone can be wearing, and holding on to familiar ways can slow down change',
    shortDesc: 'This archetype pictures someone who lives by keeping their word and respecting the norms that hold people together. At its center is the wish to carry out their part for the people and communities around them.',
    traits: ['Strong sense of duty', 'Consistent principles', 'Genuine care for others', 'Steady reliability'],
  },

  warrior: {
    id: 'warrior', name: 'The Champion', nameEn: 'THE CHAMPION',
    tagline: 'If it’s right, I’ll stand up for it — even alone',
    daily: '"If it’s wrong, someone has to say it."',
    light: 'An idealist who tries not to back down in the face of injustice',
    shadow: 'Focusing on who’s right and who’s wrong can turn potential allies into opponents',
    shortDesc: 'This archetype pictures someone who steps forward for what they believe is right. At its center is a reluctance to settle for easy compromises — and the task is keeping goals clear so that energy doesn’t go into draining battles.',
    traits: ['Sense of justice', 'Strong drive', 'Direct expression', 'High principles'],
  },

  visionary: {
    id: 'visionary', name: 'The Visionary', nameEn: 'THE VISIONARY',
    tagline: 'Designing today with ten years from now in mind',
    daily: '"If no one’s done it yet, I guess I’ll go first."',
    light: 'Someone who tries to build a better future on solid principles',
    shadow: 'Without a plan to carry it out, a vision can stay a statement',
    shortDesc: 'This archetype pictures someone who imagines how things could be better and wants to share that picture with others. Principle and openness to new ideas sit together here, and the task is turning the picture into an actual plan.',
    traits: ['Long-term perspective', 'Inspiring communication', 'Principled leadership', 'Intellectual curiosity'],
  },

  artisan: {
    id: 'artisan', name: 'The Artisan', nameEn: 'THE ARTISAN',
    tagline: 'No shortcuts. My way. All the way.',
    daily: '"‘Good enough’ isn’t in my vocabulary."',
    light: 'A quiet craftsperson who keeps working toward the finished piece',
    shadow: 'Holding tight to one’s own standards can make other approaches hard to accept, and collaboration can drift away',
    shortDesc: 'This archetype pictures someone who doesn’t easily bend their own standards and way of doing things. Caring more about the work than the people, they try to see quality through to the end — and sometimes clash with other approaches.',
    traits: ['Pursuit of craft', 'Independent judgment', 'Technical rigor', 'Respect for tradition'],
  },

  sentinel: {
    id: 'sentinel', name: 'The Sentinel', nameEn: 'THE SENTINEL',
    tagline: 'Rules exist for a reason. That’s the reason.',
    daily: '"No exceptions."',
    light: 'A watchkeeper who tries to hold to principle without being swayed by emotion',
    shadow: 'Leading with principle can mean missing the warmth someone needs',
    shortDesc: 'This archetype pictures someone who follows rules and procedures consistently and puts principle before feeling. At its center is a wish to stay steady — and putting the rule before the context can create friction.',
    traits: ['Principle-driven', 'Emotional restraint', 'Systematic approach', 'Consistent standards'],
  },

  conqueror: {
    id: 'conqueror', name: 'The Conqueror', nameEn: 'THE CONQUEROR',
    tagline: 'When there’s a goal, feelings are a luxury',
    daily: '"I only fight battles I can win."',
    light: 'Someone who tries to push forward with the plan without flinching',
    shadow: 'Rushing for results at the cost of fairness can shake the trust that’s been built',
    shortDesc: 'This archetype pictures someone who, once a goal is set, moves with calculation ahead of feeling. They try not to back down from competition — and the biggest risk can come from overlooking the feelings and values of the people alongside them.',
    traits: ['Strategic thinking', 'Emotional control', 'Strong execution', 'Drive to lead'],
  },

  opportunist: {
    id: 'opportunist', name: 'The Playmaker', nameEn: 'THE PLAYMAKER',
    tagline: 'Read the current first. Move first.',
    daily: '"This could actually work. Let’s just try it."',
    light: 'A scout who tries to read the current and move first',
    shadow: 'When direction shifts with every new opening, others can find it hard to predict',
    shortDesc: 'This archetype pictures someone who watches for change and tries to catch the possibilities inside it. Open and flexible — though when standards shift often, others can find it hard to know where they stand.',
    traits: ['Reading the room', 'Fast adaptation', 'Open exploration', 'Nimble action'],
  },

  strategist: {
    id: 'strategist', name: 'The Strategist', nameEn: 'THE STRATEGIST',
    tagline: 'Someone has to set up the board',
    daily: '"I was already three moves ahead."',
    light: 'A planner who tries to read the whole board and design one step ahead',
    shadow: 'Keeping intentions private for too long can make others feel distant',
    shortDesc: 'This archetype pictures someone who looks at the whole structure first and aims for big results with few moves. At its center is the urge to analyze and plan — and not revealing intentions can make relationships feel stiff.',
    traits: ['Structural thinking', 'Command of information', 'Long-range planning', 'Controlled execution'],
  },

  charmer: {
    id: 'charmer', name: 'The Charmer', nameEn: 'THE CHARMER',
    tagline: 'The room changes when you walk in',
    daily: '"Not many people dislike me. Honestly."',
    light: 'A presence that tries to bring energy into a room',
    shadow: 'Spending energy managing the mood can cost chances to share what one really feels',
    shortDesc: 'This archetype pictures someone who livens up the room and tries to move people. They tend to draw energy from others, and the task is using that energy to share something sincere rather than to get a calculated reaction.',
    traits: ['Strong presence', 'Emotional sensitivity', 'Social energy', 'Persuasiveness'],
  },

  companion: {
    id: 'companion', name: 'The Companion', nameEn: 'THE COMPANION',
    tagline: 'Just being there is enough',
    daily: '"Are you okay? What happened?"',
    light: 'Someone who tries to stay close and bring warmth',
    shadow: 'The deeper one goes into someone else’s feelings, the easier it is to put one’s own needs last',
    shortDesc: 'This archetype pictures someone who finds their truest self in relationships. At its center is the wish to accept people and stay by their side.',
    traits: ['Heartfelt empathy', 'Devoted relationships', 'Emotional sensitivity', 'Deep trustworthiness'],
  },

  empath: {
    id: 'empath', name: 'The Empath', nameEn: 'THE EMPATH',
    tagline: 'Feeling every small shift in emotion, deeply',
    daily: '"Why am I suddenly sad... oh, it’s the person next to me."',
    light: 'An inward resonator who takes in the world deeply through senses and feelings',
    shadow: 'Days with too much going on can be tiring, so time alone to recover matters',
    shortDesc: 'This archetype pictures someone who responds deeply to other people’s feelings and to beauty in the world. Time alone to sort through the inner world is how they come back to themselves.',
    traits: ['Deep sensitivity', 'Rich imagination', 'Inward energy', 'Artistic attunement'],
  },

  passionate: {
    id: 'passionate', name: 'The Passionate', nameEn: 'THE PASSIONATE',
    tagline: 'Emotion is my fuel',
    daily: '"If I’m mad, I’m mad. If I love it, I love it."',
    light: 'Someone who tries to live each moment with full emotional energy',
    shadow: 'Words said in the heat of the moment can linger in a relationship for a long time',
    shortDesc: 'This archetype pictures someone who shows emotions as they are rather than hiding them. That energy can liven up the people around them — but if feelings keep running ahead, relationships can start to crack.',
    traits: ['Vivid emotional expression', 'Instant reactions', 'High energy', 'Direct communication'],
  },

  fighter: {
    id: 'fighter', name: 'The Fighter', nameEn: 'THE FIGHTER',
    tagline: 'Goal first. Feelings later.',
    daily: '"It’s hard. I’m doing it anyway."',
    light: 'Someone who tries to step up to friction without backing down',
    shadow: 'Once everything becomes a competition, chances to work together can slip by',
    shortDesc: 'This archetype pictures someone who doesn’t back away from conflict or competition and steps forward. At its center is being less shaken by worry and holding one’s own ground — and pushing without consideration can wear out the people nearby.',
    traits: ['Goal-oriented', 'Emotional restraint', 'Focused execution', 'Competitive spirit'],
  },

  coordinator: {
    id: 'coordinator', name: 'The Coordinator', nameEn: 'THE COORDINATOR',
    tagline: 'Things work when people are in the right place',
    daily: '"If I don’t connect everyone, it all falls apart."',
    light: 'A connector who tries to link people and tasks so the whole thing runs',
    shadow: 'Trying to keep everyone aligned can mean losing track of one’s own direction',
    shortDesc: 'This archetype pictures someone who organizes and connects relationships and roles between people. Outgoing energy, a wish to accommodate, and a liking for structure come together here.',
    traits: ['Social coordination', 'Relationship building', 'Systematic thinking', 'Collaborative mindset'],
  },

  sage: {
    id: 'sage', name: 'The Sage', nameEn: 'THE SAGE',
    tagline: 'The more you know, the more you know you don’t',
    daily: '"Wait — to be more precise..."',
    light: 'Someone who tries to weave principle, knowledge, and inquiry together',
    shadow: 'The more certain one is of what one knows, the slower new perspectives may sink in',
    shortDesc: 'This archetype pictures someone who seeks truth and principle and tries to live them out. A wish to learn, diligence, and an open mind sit together here, sometimes leading to a wish to share what’s been learned.',
    traits: ['Intellectual inquiry', 'Principled living', 'Deep insight', 'Scholarly diligence'],
  },

  analyst: {
    id: 'analyst', name: 'The Analyst', nameEn: 'THE ANALYST',
    tagline: 'See the structure, and the answer appears',
    daily: '"What’s your source?"',
    light: 'An analyst who tries to break complexity down to find what’s essential',
    shadow: 'When critique becomes a habit, it’s easy to get stuck finding flaws instead of building alternatives',
    shortDesc: 'This archetype pictures someone who looks for the contradictions and gaps beneath the surface. They trust logic over emotion and try not to accept any claim without checking it.',
    traits: ['Critical analysis', 'Intellectual independence', 'Emotional restraint', 'Deconstruction'],
  },

  explorer: {
    id: 'explorer', name: 'The Explorer', nameEn: 'THE EXPLORER',
    tagline: 'The road not taken is the interesting one',
    daily: '"If nobody’s tried it, I’ll be the first."',
    light: 'An adventurer who heads into the unknown first',
    shadow: 'Always chasing the next new thing can leave little time to build depth in one place',
    shortDesc: 'This archetype pictures someone who gets excited by the unknown. They move toward new experiences and knowledge first — though finding it hard to stay in one place can get in the way of going deep.',
    traits: ['Adventurous exploration', 'Fearless challenge', 'Intellectual openness', 'Love of freedom'],
  },

  dreamer: {
    id: 'dreamer', name: 'The Dreamer', nameEn: 'THE DREAMER',
    tagline: 'The world in my head is sharper than the real one',
    daily: '"Huh? Sorry, I zoned out."',
    light: 'An imaginer who pictures possibilities beyond reality',
    shadow: 'The bigger the plans in one’s head, the later they may make it into the real world',
    shortDesc: 'This archetype pictures someone who carries a whole other world in their head. Their mind goes to imagining and thinking in new ways, and the task is building the structure and drive to turn that into action.',
    traits: ['Rich imagination', 'Creative thinking', 'Inward focus', 'Original perspective'],
  },

  cynic: {
    id: 'cynic', name: 'The Cynic', nameEn: 'THE CYNIC',
    tagline: 'Too many people are pretending to mean it',
    daily: '"There’s no way that’s real."',
    light: 'A clear-eyed realist who tries not to be fooled',
    shadow: 'When doubt becomes the default, even trustworthy people can end up kept at a distance',
    shortDesc: 'This archetype pictures someone who looks at hidden intent before the words on the surface. At its center is a reluctance to take things on trust — but closing the door even on people worth trusting can mean carrying things alone for a long time.',
    traits: ['Sharp skepticism', 'Hard to fool', 'Critical worldview', 'Independent distance'],
  },

  pragmatist: {
    id: 'pragmatist', name: 'The Pragmatist', nameEn: 'THE PRAGMATIST',
    tagline: 'Do what works. Drop what doesn’t, fast.',
    daily: '"Let’s leave feelings out of this."',
    light: 'A doer who tries to find the efficient path without getting swept up in emotion',
    shadow: 'Putting efficiency first can mean missing how the people one works with feel',
    shortDesc: 'This archetype pictures someone who trusts what actually works. Results over theory, efficiency over emotion — they try to find a usable way forward with whatever is at hand.',
    traits: ['Practical judgment', 'Results-focused', 'Emotional restraint', 'Efficiency-minded'],
  },

  realist: {
    id: 'realist', name: 'The Realist', nameEn: 'THE REALIST',
    tagline: 'See the world as it is',
    daily: '"Okay, ideals aside — realistically..."',
    light: 'Someone who weighs reality and counts the costs and benefits',
    shadow: 'Using gains and losses as the only measure can make relationships feel transactional',
    shortDesc: 'This archetype pictures someone who tries to see the world as it is. Real gains and stability come before romance or ideals, and their mind goes to managing resources and keeping risk low.',
    traits: ['Realistic judgment', 'Cost-benefit sense', 'Systematic execution', 'Risk management'],
  },

  hedonist: {
    id: 'hedonist', name: 'The Free Spirit', nameEn: 'THE FREE SPIRIT',
    tagline: 'This moment is everything',
    daily: '"Let’s grab something good to eat first, then think."',
    light: 'A free spirit who tries to enjoy the present moment to the fullest',
    shadow: 'Putting today’s fun first can mean the things put off all come back at once',
    shortDesc: 'This archetype pictures someone who puts present joy and sensory pleasure at the center of life. There’s a free, spontaneous energy here — but if long-term consequences keep getting pushed down the road, they can pile up.',
    traits: ['Pursuit of joy', 'Quick decisions', 'Sensory energy', 'Love of freedom'],
  },
}
