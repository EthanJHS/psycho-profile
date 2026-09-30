// English career titles and metadata, using the same scoring logic as careers.ts
import { computeCareers, CareerScore } from './careers'
import { FacetMap } from './profiles'

export interface CareerScoreEN extends Omit<CareerScore, 'title' | 'subRoles' | 'detail' | 'growthNote' | 'reason' | 'contraReason'> {
  title: string
  subRoles: string[]
  detail: string
  growthNote: string
  reason: string
  contraReason: string
}

// Maps Korean title → English metadata
const EN_CAREER_META: Record<string, {
  title: string
  subRoles: string[]
  detail: string
  growthNote: string
  contraReason: string
  descFn: () => string
}> = {
  '인문·사회과학 연구자': {
    title: 'Humanities & Social Science Researcher',
    subRoles: ['Sociologist', 'Policy Analyst', 'Cultural Anthropologist', 'Historian'],
    detail: 'The capacity to hold complex, open-ended questions for extended periods of time — synthesizing literature and building new conceptual frameworks — is exactly what academic research demands.',
    growthNote: 'Developing the ability to communicate your research findings to non-specialist audiences significantly expands your real-world impact.',
    contraReason: 'If you prefer practical results over open-ended inquiry, or find it difficult to stay with one topic for a long time, the slow, iterative nature of research can feel draining.',
    descFn: () => 'This profile is naturally drawn to analytical inquiry that connects concepts and human behavior.',
  },
  '연구원·과학자': {
    title: 'Scientist / Research Professional',
    subRoles: ['Basic Science Researcher', 'Applied Research Engineer', 'Bioinformatics Researcher', 'R&D Planner'],
    detail: 'The iterative cycle of hypothesizing and testing aligns with this profile\'s persistence and analytical depth. You maintain direction even in high-uncertainty research environments.',
    growthNote: 'Develop publication and presentation skills early — being able to communicate findings externally accelerates your reputation and influence as a researcher.',
    contraReason: 'If you don\'t enjoy systematic, repetitive verification processes, the accumulation of experimental failures in a research environment will create significant stress.',
    descFn: () => 'This profile excels at sustained, precise investigation — combining analytical depth with the persistence to iterate.',
  },
  '철학·심리 연구자': {
    title: 'Philosophy & Psychology Researcher',
    subRoles: ['Philosophy Faculty', 'Clinical Psychology Researcher', 'Cognitive Scientist', 'Ethics Consultant'],
    detail: 'In disciplines that engage foundational questions about human existence and meaning, intellectual humility and relentless curiosity combine to produce the most distinctive insights.',
    growthNote: 'Bridging abstract thinking to concrete, applicable directions increases the real-world contribution of your academic work.',
    contraReason: 'If you prefer quick conclusions over sustained open-ended inquiry, or tend to assert your views strongly, the constant self-questioning that philosophy and psychology demand will feel uncomfortable.',
    descFn: () => 'This profile combines curiosity and intellectual humility in a way that\'s well-matched to deep inquiry into human nature.',
  },
  '교수·학자': {
    title: 'Professor / Academic',
    subRoles: ['University Professor', 'Senior Research Fellow', 'Curriculum Developer', 'Academic Author'],
    detail: 'When the ability to explore ideas and the patience to transmit them to others are both high, academic environments become an ideal stage.',
    growthNote: 'Academic recognition can take a long time. Distribute your sense of achievement across intermediate goals — writing, speaking, mentoring.',
    contraReason: 'Without sustained patience for explaining the same material to different students, and ongoing intellectual passion, the long timescales of academic careers lead to rapid burnout.',
    descFn: () => 'This profile thrives in environments that reward both deep exploration and the transmission of knowledge to others.',
  },
  '상담심리사·심리치료사': {
    title: 'Counselor / Psychotherapist',
    subRoles: ['Clinical Psychologist', 'Adolescent Counselor', 'Corporate EAP Counselor', 'Life Coach'],
    detail: 'The ability to receive another person\'s inner world without judgment and explore it alongside them is the core of counseling. High empathy combined with strong emotional boundaries prevents long-term burnout.',
    growthNote: 'Watch for vicarious trauma. Regular supervision and self-care routines are non-negotiable for a sustainable career in this field.',
    contraReason: 'If your capacity for sustained non-judgmental empathy is low, carrying the weight of clients\' pain each session will lead to rapid burnout.',
    descFn: () => 'This profile\'s empathy and patience are the core assets for understanding others deeply and facilitating meaningful change.',
  },
  '사회복지사·NGO 기획': {
    title: 'Social Worker / NGO Program Manager',
    subRoles: ['Case Manager', 'International Development Planner', 'Social Enterprise Manager', 'Policy Advocate'],
    detail: 'This role involves accepting the complex situations of vulnerable populations without judgment and designing structural support.',
    growthNote: 'Emotional labor is high in this field. Clearly recognizing your own limits and setting boundaries is what makes long-term work sustainable.',
    contraReason: 'This role, which requires patiently supporting people\'s lives within slow change and structural constraints, frequently clashes with preferences for efficiency and measurable results.',
    descFn: () => 'This profile finds genuine meaning in people-centered roles that create structural support for others.',
  },
  '간호사·의료지원직': {
    title: 'Nurse / Healthcare Support Professional',
    subRoles: ['Clinical Nurse', 'Nurse Practitioner', 'Medical Coordinator', 'Hospice Care Specialist'],
    detail: 'This role simultaneously monitors patients\' physical and psychological states while providing systematic care.',
    growthNote: 'Developing a clear "switch-off" routine after work is essential to prevent emotional exhaustion.',
    contraReason: 'Repeatedly investing time and emotional energy in each patient requires both high empathy and high conscientiousness — without both, burnout and errors accumulate quickly.',
    descFn: () => 'This profile\'s combination of care and discipline maps well onto systematic, compassionate healthcare environments.',
  },
  'UX 리서처·서비스 기획': {
    title: 'UX Researcher / Product Strategist',
    subRoles: ['UX Researcher', 'Product Manager', 'Service Designer', 'Customer Experience Strategist'],
    detail: 'This role identifies the deep motivations behind user behavior and translates them into product and service improvements.',
    growthNote: 'Develop presentation skills to communicate research findings persuasively to stakeholders — this is often the limiting factor in product influence.',
    contraReason: 'Without the empathy and curiosity to listen deeply and analyze context, you\'ll respond only to surface-level requests rather than underlying needs.',
    descFn: () => 'This profile\'s combination of curiosity and interpersonal attunement is well-suited to research that translates people into products.',
  },
  '의사·의학직': {
    title: 'Physician / Medical Professional',
    subRoles: ['General Practitioner', 'Specialist Physician', 'Surgeon', 'Medical Researcher'],
    detail: 'This role demands sustained high accuracy, the ability to handle uncertainty under pressure, and — for patient-facing roles — the capacity to communicate clearly across the emotional gap.',
    growthNote: 'Maintaining patient communication quality during high workload periods is a genuine skill to develop deliberately — not just a soft default.',
    contraReason: 'If either analytical precision or human-centered patience is low, the dual demands of medical practice create compounding stress.',
    descFn: () => 'This profile\'s analytical depth and precision make it well-suited to high-stakes environments where both accuracy and judgment matter.',
  },
  '작가·저널리스트': {
    title: 'Writer / Journalist',
    subRoles: ['Novelist', 'Investigative Journalist', 'Content Creator', 'Scriptwriter'],
    detail: 'Writing demands two things that don\'t often coexist: broad curiosity (for material) and sustained diligence (for execution). When both are present, the output is distinctive.',
    growthNote: 'Build a public body of work early, even imperfectly. Visibility compounds — waiting for perfect conditions is the most common career-limiting move in creative fields.',
    contraReason: 'Translating ideas into polished, standalone writing requires both the curiosity to generate material and the patience to execute it repeatedly. If either is low, output quality degrades.',
    descFn: () => 'This profile combines intellectual curiosity with the expressive capacity to give ideas a voice others will want to read.',
  },
  '예술가·창작자': {
    title: 'Artist / Creative',
    subRoles: ['Visual Artist', 'Musician', 'Illustrator', 'Independent Creative'],
    detail: 'Creative careers reward distinctive perspective and intrinsic motivation. This profile\'s high openness and aesthetic sensitivity are genuine assets — but so is the willingness to build sustainable systems around creative practice.',
    growthNote: 'The business side of creative work (portfolio, pricing, audience-building) is a skill set as learnable as the craft itself. Develop it alongside the creative work, not after.',
    contraReason: 'Creative careers are non-linear and income-volatile. Without intrinsic drive strong enough to sustain practice through long feedback-absent periods, the structural challenges become overwhelming.',
    descFn: () => 'This profile\'s openness and aesthetic sensitivity are the natural fuel for sustained creative expression.',
  },
  '소프트웨어 엔지니어': {
    title: 'Software Engineer',
    subRoles: ['Backend Engineer', 'Frontend Engineer', 'Full-Stack Developer', 'DevOps / Platform Engineer'],
    detail: 'Engineering rewards both systematic thinking (architecture, debugging) and sustained execution (shipping, maintaining). This profile\'s analytical strength and diligence combine well here.',
    growthNote: 'Technical depth is necessary but not sufficient. Communication across the product-engineering boundary — translating technical constraints into product language and vice versa — is what accelerates senior-level influence.',
    contraReason: 'Without both the analytical capacity to hold complexity and the patience for incremental debugging cycles, software work quickly becomes frustrating rather than satisfying.',
    descFn: () => 'This profile\'s analytical depth and systematic follow-through map directly onto the core demands of software engineering.',
  },
  '데이터 사이언티스트': {
    title: 'Data Scientist',
    subRoles: ['ML Engineer', 'Data Analyst', 'AI Researcher', 'Quantitative Analyst'],
    detail: 'Data science sits at the intersection of statistical reasoning, domain knowledge, and communication — all three need to be present for the work to generate real value.',
    growthNote: 'The gap between "the model works" and "this changed a decision" is a communication and framing problem, not a technical one. Close that gap deliberately.',
    contraReason: 'If either quantitative reasoning or the patience for ambiguous, iterative analysis is low, data science work becomes a grind that rarely produces satisfying outputs.',
    descFn: () => 'This profile\'s quantitative reasoning and curiosity are well-matched to the iterative, evidence-driven work of data science.',
  },
  '공학자·기술직': {
    title: 'Engineer / Technical Specialist',
    subRoles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Process Engineer'],
    detail: 'Engineering disciplines reward spatial reasoning, precision under constraint, and the ability to iterate systematically toward a working solution.',
    growthNote: 'Technical expertise becomes more valuable when paired with project management and cross-functional communication skills. Develop both in parallel.',
    contraReason: 'Without strong applied reasoning and the patience for systematic problem-solving within constraints, engineering work feels restrictive rather than creatively challenging.',
    descFn: () => 'This profile\'s systems thinking and applied reasoning are well-suited to engineering environments that reward precision and iteration.',
  },
  '경영자·임원': {
    title: 'Executive / Senior Manager',
    subRoles: ['CEO', 'COO', 'Division Head', 'General Manager'],
    detail: 'Executive roles demand the ability to set direction, make decisions under uncertainty, and maintain alignment across diverse stakeholders — while managing your own energy over long time horizons.',
    growthNote: 'The transition from expert to executive is fundamentally about leverage: your value comes from the quality of decisions and the people you develop, not from personal output.',
    contraReason: 'Without the boldness to make calls that others will be judged by, or the patience to build alignment rather than just issuing directives, executive roles create organizational drag rather than momentum.',
    descFn: () => 'This profile\'s combination of strategic thinking and social confidence makes it effective in senior roles that require both direction and alignment.',
  },
  '창업가·스타트업': {
    title: 'Entrepreneur / Startup Founder',
    subRoles: ['Tech Founder', 'Social Entrepreneur', 'Early-Stage Startup Operator', 'Product-Led Growth Lead'],
    detail: 'Startups compress uncertainty, speed, and resource constraints into a single environment. This profile\'s curiosity and boldness are starting assets — the test is whether diligence and resilience hold up across the long arc.',
    growthNote: 'Most startup failure isn\'t ideation failure — it\'s execution failure or timing failure. Develop the capacity to learn from feedback fast and kill bad ideas early, not just generate new ones.',
    contraReason: 'Without a high tolerance for prolonged uncertainty and the diligence to execute through low-resource, low-feedback periods, founding a company leads to burnout rather than growth.',
    descFn: () => 'This profile\'s boldness and curiosity are well-matched to the dynamic, high-uncertainty environment of early-stage entrepreneurship.',
  },
  '마케팅·광고 기획': {
    title: 'Marketing / Advertising Strategist',
    subRoles: ['Brand Strategist', 'Digital Marketing Manager', 'Growth Marketer', 'Creative Director'],
    detail: 'Effective marketing requires both creative instinct (what will resonate) and analytical rigor (what is actually working). The profiles that last are the ones that can do both.',
    growthNote: 'Attribution is increasingly the competitive edge in marketing. Understanding the data well enough to tell a compelling story from it — not just to run reports — is what separates good from great.',
    contraReason: 'Marketing roles at scale require both creative originality and the patience to test, measure, and iterate. If either is low, you\'ll either produce unmeasured creativity or measured mediocrity.',
    descFn: () => 'This profile\'s creativity and social attunement are well-suited to environments where understanding people leads to effective persuasion.',
  },
  '공무원·행정직': {
    title: 'Civil Servant / Public Administrator',
    subRoles: ['Policy Officer', 'Government Analyst', 'Public Program Manager', 'Regulatory Affairs Specialist'],
    detail: 'Public administration rewards sustained diligence, procedural integrity, and the ability to work effectively within institutional constraints — over long time horizons.',
    growthNote: 'The constraint that makes public service stable (institutional structure) is also what limits agility. Developing the skill to create real change within structural limits is the core career challenge in this field.',
    contraReason: 'If you\'re strongly drawn to rapid iteration and visible individual impact, the pace and structural constraints of public administration can feel stifling rather than stable.',
    descFn: () => 'This profile\'s conscientiousness and procedural reliability are well-matched to environments that reward institutional integrity over speed.',
  },
  '교사·교육자': {
    title: 'Teacher / Educator',
    subRoles: ['K-12 Teacher', 'Curriculum Developer', 'Corporate Trainer', 'Special Education Specialist'],
    detail: 'Teaching is one of the few careers where the impact compounds across decades through the people you develop. This profile\'s patience and curiosity are core assets here.',
    growthNote: 'The best teachers are relentless learners themselves. Staying current in both content domain and pedagogical practice is what separates energizing from depleting teaching over a long career.',
    contraReason: 'Without high patience for repeated explanation and genuine enjoyment of the process of facilitating others\' understanding, teaching quickly becomes draining.',
    descFn: () => 'This profile\'s patience and interpersonal warmth make it a natural fit for the sustained, relationship-centered work of teaching.',
  },
  '변호사·법조인': {
    title: 'Lawyer / Legal Professional',
    subRoles: ['Attorney', 'Public Defender', 'Corporate Counsel', 'Legal Researcher'],
    detail: 'Law rewards analytical precision, the ability to construct arguments that hold under adversarial challenge, and — in client-facing roles — the interpersonal skills to be trusted with high-stakes decisions.',
    growthNote: 'Technical legal skill is the table stakes. The lawyers who gain outsized influence combine legal depth with business acumen and the ability to explain complex risk clearly to non-lawyers.',
    contraReason: 'Without both strong analytical reasoning and the diligence to work through large volumes of complex material under deadline pressure, legal practice generates sustained stress rather than satisfaction.',
    descFn: () => 'This profile\'s analytical rigor and precision are well-suited to the argumentation and judgment demands of legal work.',
  },
  '금융 전문가·투자 분석가': {
    title: 'Finance Professional / Investment Analyst',
    subRoles: ['Equity Analyst', 'Portfolio Manager', 'Investment Banker', 'Venture Capitalist'],
    detail: 'Finance rewards the ability to form a view in the presence of incomplete information, hold it under social pressure, and update it when evidence changes — three things that are harder to develop than most technical skills.',
    growthNote: 'Building a documented track record of decisions and their outcomes — even in personal accounts — is the fastest way to develop genuine judgment in investment contexts.',
    contraReason: 'If analytical depth or emotional stability under uncertainty is low, financial decision-making under market pressure will consistently produce poor results.',
    descFn: () => 'This profile\'s quantitative reasoning and intellectual confidence are well-suited to environments where independent judgment under uncertainty drives outcomes.',
  },
  '회계사·세무사': {
    title: 'Accountant / Tax Professional',
    subRoles: ['CPA', 'Tax Advisor', 'Internal Auditor', 'Financial Controller'],
    detail: 'Accounting rewards precision, systematic process execution, and the ability to find and communicate implications in financial data that others miss.',
    growthNote: 'As AI handles more routine compliance work, the highest-value accounting roles will require the ability to provide strategic interpretation of financial data. Build that skill now.',
    contraReason: 'Without strong detail orientation and comfort with procedural, rule-bound work, accounting environments feel constrictive rather than stable.',
    descFn: () => 'This profile\'s diligence and precision align well with environments where accuracy and systematic execution are the core value-drivers.',
  },
  '약사·임상병리사': {
    title: 'Pharmacist / Clinical Laboratory Professional',
    subRoles: ['Community Pharmacist', 'Hospital Pharmacist', 'Clinical Lab Scientist', 'Pharmaceutical Researcher'],
    detail: 'These roles combine precise technical execution with patient communication (pharmacists) or systematic analytical work (lab professionals) — both reward accuracy and diligence consistently.',
    growthNote: 'Staying current with pharmacological and diagnostic developments is a career-long obligation in this field, not a phase. Building systematic learning habits early pays off across decades.',
    contraReason: 'Without sustained attention to detail and comfort with procedural precision in high-stakes settings, errors accumulate in ways that have direct patient consequences.',
    descFn: () => 'This profile\'s precision and conscientiousness are well-suited to the accuracy-critical demands of clinical and pharmaceutical work.',
  },
  '물리치료사·작업치료사': {
    title: 'Physical / Occupational Therapist',
    subRoles: ['Physical Therapist', 'Occupational Therapist', 'Sports Rehabilitation Specialist', 'Pediatric Therapist'],
    detail: 'Rehabilitation therapy rewards patience with slow, non-linear progress, genuine investment in each patient\'s recovery, and the ability to adapt protocols to individual needs.',
    growthNote: 'Specialization in a specific population or condition (pediatrics, sports rehab, neuro) typically accelerates both professional satisfaction and compensation in this field.',
    contraReason: 'Without high empathy and patience for incremental, sometimes non-linear progress in patient recovery, the daily rhythms of rehabilitation therapy feel like diminishing returns rather than meaningful work.',
    descFn: () => 'This profile\'s patience and interpersonal attunement are well-matched to the relationship-intensive, gradual-progress nature of rehabilitation therapy.',
  },
  '경찰·소방·군인': {
    title: 'Law Enforcement / Firefighter / Military',
    subRoles: ['Police Officer', 'Firefighter', 'Military Officer', 'Emergency Medical Technician'],
    detail: 'These roles require the ability to make high-stakes decisions under acute time pressure, maintain composure in dangerous environments, and work within strict hierarchical structures.',
    growthNote: 'The psychological demands of public safety careers — witnessing trauma, maintaining vigilance — require deliberate investment in mental health resources and peer support systems.',
    contraReason: 'Without high tolerance for physical risk, strict hierarchical structure, and the emotional weight of repeated exposure to crisis situations, these roles are not sustainable.',
    descFn: () => 'This profile\'s boldness and composure under pressure are the core requirements for effective performance in high-stakes public safety roles.',
  },
  '성직자·종교지도자': {
    title: 'Clergy / Religious Leader',
    subRoles: ['Pastor / Priest', 'Rabbi / Imam', 'Spiritual Director', 'Chaplain'],
    detail: 'Religious leadership roles demand a rare combination: deep personal conviction, genuine empathy for people across life stages, and the humility to serve rather than lead for status.',
    growthNote: 'The boundaries between pastoral care and personal friendship require ongoing, deliberate management. Clear role definition protects both the leader and the community.',
    contraReason: 'These roles are among the most demanding in terms of sustained emotional availability and ethical consistency. Without genuine calling and strong boundaries, the demands become unsustainable.',
    descFn: () => 'This profile\'s humility and interpersonal depth make it well-suited to roles that require sustained, genuine service to community.',
  },
  '경영 컨설턴트·전략기획': {
    title: 'Management Consultant / Strategy',
    subRoles: ['Strategy Consultant', 'Corporate Strategy Manager', 'Operations Consultant', 'Business Analyst'],
    detail: 'Consulting rewards the ability to enter unfamiliar contexts quickly, form and defend recommendations under scrutiny, and communicate complex analyses to senior decision-makers.',
    growthNote: 'The consulting path compresses learning rapidly in the early years, then diverges sharply: some people find the variety energizing indefinitely; others find the lack of ownership depleting. Know which you are before year five.',
    contraReason: 'Without both analytical sharpness and the social boldness to present under pressure to senior stakeholders, consulting environments generate anxiety rather than growth.',
    descFn: () => 'This profile\'s analytical depth and adaptability make it effective in environments that demand rapid orientation and structured persuasion.',
  },
  'HR·조직개발·코치': {
    title: 'HR / Organizational Development / Coach',
    subRoles: ['HR Business Partner', 'Talent Development Lead', 'Executive Coach', 'Organizational Psychologist'],
    detail: 'HR and OD roles occupy a unique position: they require the analytical orientation of a business function and the interpersonal depth of a people-centered one — both at the same time.',
    growthNote: 'The credibility of HR and coaching professionals comes from demonstrated business impact, not just interpersonal skill. Building your ability to tie people programs to measurable business outcomes is the career-defining move.',
    contraReason: 'Without genuine interest in people\'s development and the patience to influence without direct authority, HR roles feel like bureaucratic overhead rather than meaningful work.',
    descFn: () => 'This profile\'s empathy and organizational awareness make it well-suited to roles that develop people and shape how organizations function.',
  },
  '그래픽·제품 디자이너': {
    title: 'Graphic / Product Designer',
    subRoles: ['Brand Designer', 'UI Designer', 'Industrial Designer', 'Motion Designer'],
    detail: 'Design careers reward aesthetic sensitivity, the ability to think through a problem visually, and the discipline to translate creative instinct into reproducible, communicable solutions.',
    growthNote: 'The most impactful designers develop strong opinion about why design decisions matter (not just what looks good) — and the vocabulary to defend those decisions in cross-functional rooms.',
    contraReason: 'Without both aesthetic sensitivity and the discipline to iterate through feedback toward functional solutions, design work produces beautiful things that don\'t solve problems — or functional things that no one wants to use.',
    descFn: () => 'This profile\'s aesthetic sensitivity and creative originality are natural assets in environments that reward visual problem-solving.',
  },
  'PD·영상 크리에이터': {
    title: 'Film / Video Producer & Creator',
    subRoles: ['TV Producer', 'Documentary Filmmaker', 'YouTube Creator', 'Video Director'],
    detail: 'Production and video creation demand a combination of creative vision, logistical execution, and — for audience-building work — the ability to read what resonates and adapt.',
    growthNote: 'Distribution is as important as production quality. Building the skills to grow and maintain an audience is a separate skill set from production — develop both.',
    contraReason: 'Without both creative originality and the organizational diligence to manage complex production logistics, video work consistently misses its potential.',
    descFn: () => 'This profile\'s creativity and aesthetic attunement are well-suited to the vision-led, iterative work of production and video creation.',
  },
  '건축가·인테리어 디자이너': {
    title: 'Architect / Interior Designer',
    subRoles: ['Building Architect', 'Landscape Architect', 'Interior Designer', 'Urban Planner'],
    detail: 'Architecture and design reward the simultaneous mastery of aesthetic, technical, and human factors — the ability to see how a space should feel before it exists, and the systems thinking to make it buildable.',
    growthNote: 'Client communication is the hidden constraint in design careers. The ability to translate between what clients want and what the design can deliver — honestly and creatively — is what separates sustained practices from struggling ones.',
    contraReason: 'Without both spatial reasoning and the patience for long project timelines with significant regulatory constraints, the gap between creative vision and delivered reality becomes a source of sustained frustration.',
    descFn: () => 'This profile\'s spatial reasoning and aesthetic sensitivity are well-suited to the multi-constraint problem-solving that architecture and design demand.',
  },
  '연예인·배우·뮤지션': {
    title: 'Performer / Actor / Musician',
    subRoles: ['Actor', 'Musician', 'Stage Performer', 'Voice Artist'],
    detail: 'Performance careers require intrinsic creative drive, high tolerance for public evaluation, and the resilience to sustain practice through long periods without external validation.',
    growthNote: 'The business of performance (self-promotion, contracts, audience-building) is as career-critical as the craft. Develop both without apology.',
    contraReason: 'Performance careers are non-linear, income-volatile, and heavily dependent on public reception. Without strong intrinsic motivation and high rejection tolerance, the structural realities are unsustainable.',
    descFn: () => 'This profile\'s expressiveness and boldness are natural assets in performance environments that reward authentic, distinctive presence.',
  },
  '셰프·요리 전문가': {
    title: 'Chef / Culinary Professional',
    subRoles: ['Head Chef', 'Pastry Chef', 'Food Developer', 'Culinary Educator'],
    detail: 'Professional kitchens are among the most demanding work environments: high precision, high pace, high heat, and immediate consequence for quality failures.',
    growthNote: 'The path from skilled cook to independent chef requires both culinary mastery and business acumen (costing, staffing, sourcing). The second skill set is usually what limits the first.',
    contraReason: 'Without both physical resilience and the perfectionism to maintain quality standards under intense time pressure, professional kitchen environments are exhausting rather than energizing.',
    descFn: () => 'This profile\'s aesthetic sensitivity and diligence are well-matched to the craft-intensive demands of professional culinary work.',
  },
  '스포츠·피트니스 전문가': {
    title: 'Sports / Fitness Professional',
    subRoles: ['Personal Trainer', 'Athletic Coach', 'Sports Therapist', 'Performance Analyst'],
    detail: 'Sports and fitness careers reward both physical expertise and the interpersonal skill to motivate people through challenging processes — often when they would rather stop.',
    growthNote: 'Evidence-based programming (understanding the research behind training protocols) is the differentiator that separates the most trusted coaches from general practitioners.',
    contraReason: 'Without genuine enthusiasm for physical performance and the patience to work with clients at different ability levels and motivational states, coaching work becomes a grind.',
    descFn: () => 'This profile\'s energy and interpersonal attunement are well-suited to coaching environments that require both expertise and sustained motivational engagement.',
  },
  '파일럿·항공우주 전문가': {
    title: 'Pilot / Aerospace Professional',
    subRoles: ['Commercial Airline Pilot', 'Military Pilot', 'Aerospace Engineer', 'Air Traffic Controller'],
    detail: 'Aviation careers reward systematic thinking under pressure, extreme attention to procedural detail, and composure when standard plans fail.',
    growthNote: 'The decision-making frameworks developed in aviation (checklists, crew resource management, risk assessment protocols) are highly transferable leadership skills — many pilots find them valuable well beyond the cockpit.',
    contraReason: 'Without both high procedural discipline and genuine composure under time pressure and consequential uncertainty, the psychological load of aviation careers becomes unsustainable.',
    descFn: () => 'This profile\'s analytical composure and procedural precision are well-matched to the high-stakes, systems-heavy demands of aviation and aerospace.',
  },
}

export function computeCareersEN(facets: FacetMap, cogScore: number): CareerScoreEN[] {
  const koResults = computeCareers(facets, cogScore)
  return koResults.map(ko => {
    const en = EN_CAREER_META[ko.title]
    if (!en) return { ...ko }
    return {
      ...ko,
      title: en.title,
      subRoles: en.subRoles,
      detail: en.detail,
      growthNote: en.growthNote,
      reason: en.descFn(),
      contraReason: en.contraReason,
    }
  })
}
