// English version of paid test questions — 90 items
// HEXACO 24 sub-facets (48) + RIASEC direct (18) + Academic Aptitude (20) + Wellbeing (4)
// Likert: 1=Strongly Disagree  2=Disagree  3=Neutral  4=Agree  5=Strongly Agree

export type PaidSection = 'hexaco' | 'riasec' | 'aptitude' | 'wellbeing'

export interface PaidQuestion {
  id: string
  section: PaidSection
  facet?: SubFacet
  riasecType?: RiasecType
  aptitudeDim?: AptitudeDim
  text: string
  reverse: boolean
}

// ── HEXACO 24 sub-facets ──────────────────────────────────────────────
// H (Honesty-Humility): sincerity · fairness · greedAvoidance · modesty
// E (Emotionality):     fearfulness · anxiety · dependence · sentimentality
// X (Extraversion):     socialSelfEsteem · socialBoldness · sociability · liveliness
// A (Agreeableness):    forgivingness · gentleness · flexibility · patience
// C (Conscientiousness):organization · diligence · perfectionism · prudence
// O (Openness):         aestheticAppreciation · inquisitiveness · creativity · unconventionality

export type SubFacet =
  | 'sincerity' | 'fairness' | 'greedAvoidance' | 'modesty'
  | 'fearfulness' | 'anxiety' | 'dependence' | 'sentimentality'
  | 'socialSelfEsteem' | 'socialBoldness' | 'sociability' | 'liveliness'
  | 'forgivingness' | 'gentleness' | 'flexibility' | 'patience'
  | 'organization' | 'diligence' | 'perfectionism' | 'prudence'
  | 'aestheticAppreciation' | 'inquisitiveness' | 'creativity' | 'unconventionality'

export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
export type AptitudeDim = 'quantitative' | 'verbal' | 'spatial' | 'social' | 'applied' | 'business' | 'scientific' | 'humanistic' | 'artistic'

export const SUB_FACET_LABELS: Record<SubFacet, { label: string; parent: string }> = {
  sincerity:             { label: 'Sincerity',          parent: 'Honesty-Humility' },
  fairness:              { label: 'Fairness',            parent: 'Honesty-Humility' },
  greedAvoidance:        { label: 'Greed Avoidance',    parent: 'Honesty-Humility' },
  modesty:               { label: 'Modesty',             parent: 'Honesty-Humility' },
  fearfulness:           { label: 'Fearfulness',         parent: 'Emotionality' },
  anxiety:               { label: 'Anxiety',             parent: 'Emotionality' },
  dependence:            { label: 'Dependence',          parent: 'Emotionality' },
  sentimentality:        { label: 'Sentimentality',      parent: 'Emotionality' },
  socialSelfEsteem:      { label: 'Social Self-Esteem',  parent: 'Extraversion' },
  socialBoldness:        { label: 'Social Boldness',     parent: 'Extraversion' },
  sociability:           { label: 'Sociability',         parent: 'Extraversion' },
  liveliness:            { label: 'Liveliness',          parent: 'Extraversion' },
  forgivingness:         { label: 'Forgivingness',       parent: 'Agreeableness' },
  gentleness:            { label: 'Gentleness',          parent: 'Agreeableness' },
  flexibility:           { label: 'Flexibility',         parent: 'Agreeableness' },
  patience:              { label: 'Patience',            parent: 'Agreeableness' },
  organization:          { label: 'Organization',        parent: 'Conscientiousness' },
  diligence:             { label: 'Diligence',           parent: 'Conscientiousness' },
  perfectionism:         { label: 'Perfectionism',       parent: 'Conscientiousness' },
  prudence:              { label: 'Prudence',            parent: 'Conscientiousness' },
  aestheticAppreciation: { label: 'Aesthetic Appreciation', parent: 'Openness' },
  inquisitiveness:       { label: 'Inquisitiveness',     parent: 'Openness' },
  creativity:            { label: 'Creativity',          parent: 'Openness' },
  unconventionality:     { label: 'Unconventionality',   parent: 'Openness' },
}

export const PAID_QUESTIONS_EN: PaidQuestion[] = [

  // ════════════════════════════════════════════════════════════════
  // HEXACO — H: Honesty-Humility (8 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ1', section: 'hexaco', facet: 'sincerity', reverse: false,
    text: 'I never try to make myself look better than I actually am.' },
  { id: 'PQ2', section: 'hexaco', facet: 'sincerity', reverse: true,
    text: 'A little exaggeration or flattery is acceptable when it helps me get what I want.' },

  { id: 'PQ3', section: 'hexaco', facet: 'fairness', reverse: false,
    text: 'I would not bend the rules to gain an advantage, even if it would benefit me.' },
  { id: 'PQ4', section: 'hexaco', facet: 'fairness', reverse: true,
    text: 'If I knew I wouldn\'t get caught, I would be willing to use unfair means to get more for myself.' },

  { id: 'PQ5', section: 'hexaco', facet: 'greedAvoidance', reverse: false,
    text: 'I prefer a simple, modest lifestyle over a glamorous or extravagant one.' },
  { id: 'PQ6', section: 'hexaco', facet: 'greedAvoidance', reverse: true,
    text: 'I strongly desire to live a life of wealth and luxury.' },

  { id: 'PQ7', section: 'hexaco', facet: 'modesty', reverse: false,
    text: 'I don\'t feel the need for others to see me as special or exceptional.' },
  { id: 'PQ8', section: 'hexaco', facet: 'modesty', reverse: true,
    text: 'I enjoy it when people admire my accomplishments and abilities.' },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — E: Emotionality (8 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ9', section: 'hexaco', facet: 'fearfulness', reverse: false,
    text: 'I tend to avoid situations that I expect to be physically dangerous.' },
  { id: 'PQ10', section: 'hexaco', facet: 'fearfulness', reverse: true,
    text: 'I enjoy thrilling and risky activities.' },

  { id: 'PQ11', section: 'hexaco', facet: 'anxiety', reverse: false,
    text: 'I often worry that things will turn out badly.' },
  { id: 'PQ12', section: 'hexaco', facet: 'anxiety', reverse: true,
    text: 'I find it easy to stay optimistic that most things will work out fine.' },

  { id: 'PQ13', section: 'hexaco', facet: 'dependence', reverse: false,
    text: 'When I\'m going through a hard time, I really need someone to offer emotional support.' },
  { id: 'PQ14', section: 'hexaco', facet: 'dependence', reverse: true,
    text: 'Even in emotionally difficult situations, I can usually get through it on my own.' },

  { id: 'PQ15', section: 'hexaco', facet: 'sentimentality', reverse: false,
    text: 'I feel deep empathy for others\' struggles, and their pain genuinely moves me.' },
  { id: 'PQ16', section: 'hexaco', facet: 'sentimentality', reverse: true,
    text: 'When I hear about others\' emotional difficulties, I don\'t tend to be affected much.' },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — X: Extraversion (8 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ17', section: 'hexaco', facet: 'socialSelfEsteem', reverse: false,
    text: 'I feel confident when I\'m around other people.' },
  { id: 'PQ18', section: 'hexaco', facet: 'socialSelfEsteem', reverse: true,
    text: 'I often worry about how I come across to strangers.' },

  { id: 'PQ19', section: 'hexaco', facet: 'socialBoldness', reverse: false,
    text: 'I feel comfortable speaking in front of an audience or sharing my views publicly.' },
  { id: 'PQ20', section: 'hexaco', facet: 'socialBoldness', reverse: true,
    text: 'I find it hard to initiate a conversation with someone I don\'t know.' },

  { id: 'PQ21', section: 'hexaco', facet: 'sociability', reverse: false,
    text: 'I feel energized at parties and social gatherings.' },
  { id: 'PQ22', section: 'hexaco', facet: 'sociability', reverse: true,
    text: 'I strongly prefer spending time alone over socializing with others.' },

  { id: 'PQ23', section: 'hexaco', facet: 'liveliness', reverse: false,
    text: 'I tend to be energetic and enthusiastic most of the time.' },
  { id: 'PQ24', section: 'hexaco', facet: 'liveliness', reverse: true,
    text: 'I often feel sluggish or low in energy.' },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — A: Agreeableness (8 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ25', section: 'hexaco', facet: 'forgivingness', reverse: false,
    text: 'I\'m usually quick to forgive someone who has hurt me.' },
  { id: 'PQ26', section: 'hexaco', facet: 'forgivingness', reverse: true,
    text: 'I believe people who have wronged me should face appropriate consequences.' },

  { id: 'PQ27', section: 'hexaco', facet: 'gentleness', reverse: false,
    text: 'I try to understand rather than criticize others for their mistakes or flaws.' },
  { id: 'PQ28', section: 'hexaco', facet: 'gentleness', reverse: true,
    text: 'I\'m not shy about directly voicing criticism or dissatisfaction when people behave wrongly.' },

  { id: 'PQ29', section: 'hexaco', facet: 'flexibility', reverse: false,
    text: 'When I disagree with someone, I actively try to see things from their perspective.' },
  { id: 'PQ30', section: 'hexaco', facet: 'flexibility', reverse: true,
    text: 'When I believe I\'m right, I hold my position firmly and don\'t change my mind easily.' },

  { id: 'PQ31', section: 'hexaco', facet: 'patience', reverse: false,
    text: 'Even when things don\'t go as planned or I face obstacles, I stay calm and composed.' },
  { id: 'PQ32', section: 'hexaco', facet: 'patience', reverse: true,
    text: 'I get frustrated or irritated easily when things take too long or don\'t go smoothly.' },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — C: Conscientiousness (8 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ33', section: 'hexaco', facet: 'organization', reverse: false,
    text: 'I enjoy organizing and categorizing my tasks and belongings systematically.' },
  { id: 'PQ34', section: 'hexaco', facet: 'organization', reverse: true,
    text: 'I don\'t mind having a somewhat cluttered or disorganized environment.' },

  { id: 'PQ35', section: 'hexaco', facet: 'diligence', reverse: false,
    text: 'I follow through on tasks to the end without giving up, even when they get tedious.' },
  { id: 'PQ36', section: 'hexaco', facet: 'diligence', reverse: true,
    text: 'When a task feels boring, I tend to move on to something else before finishing.' },

  { id: 'PQ37', section: 'hexaco', facet: 'perfectionism', reverse: false,
    text: 'I carefully review and refine my work to make sure there are no mistakes.' },
  { id: 'PQ38', section: 'hexaco', facet: 'perfectionism', reverse: true,
    text: 'If something is good enough, I don\'t feel the need to make it perfect.' },

  { id: 'PQ39', section: 'hexaco', facet: 'prudence', reverse: false,
    text: 'Before making important decisions, I think carefully about the likely consequences.' },
  { id: 'PQ40', section: 'hexaco', facet: 'prudence', reverse: true,
    text: 'I sometimes act on impulse and regret it later.' },

  // ════════════════════════════════════════════════════════════════
  // HEXACO — O: Openness to Experience (8 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ41', section: 'hexaco', facet: 'aestheticAppreciation', reverse: false,
    text: 'I experience deep beauty and emotion in art, music, and literature.' },
  { id: 'PQ42', section: 'hexaco', facet: 'aestheticAppreciation', reverse: true,
    text: 'I care more about the practical value of things than their aesthetic qualities.' },

  { id: 'PQ43', section: 'hexaco', facet: 'inquisitiveness', reverse: false,
    text: 'I enjoy diving deep into complex theories and ideas to truly understand them.' },
  { id: 'PQ44', section: 'hexaco', facet: 'inquisitiveness', reverse: true,
    text: 'I prefer practical, immediately useful information over deep intellectual exploration.' },

  { id: 'PQ45', section: 'hexaco', facet: 'creativity', reverse: false,
    text: 'I have a talent for seeing ordinary things in new and creative ways.' },
  { id: 'PQ46', section: 'hexaco', facet: 'creativity', reverse: true,
    text: 'I feel more comfortable following proven methods than coming up with original ideas.' },

  { id: 'PQ47', section: 'hexaco', facet: 'unconventionality', reverse: false,
    text: 'I naturally question social norms and widely accepted assumptions.' },
  { id: 'PQ48', section: 'hexaco', facet: 'unconventionality', reverse: true,
    text: 'I generally trust traditional, established approaches over novel or unconventional ones.' },

  // ════════════════════════════════════════════════════════════════
  // RIASEC — Holland Vocational Interest (18 items, 3 per type)
  // Scale: 1=Not interested at all ~ 5=Highly interested
  // ════════════════════════════════════════════════════════════════

  // R: Realistic — hands-on, mechanical, physical
  { id: 'PQ49', section: 'riasec', riasecType: 'R', reverse: false,
    text: 'I enjoy working with machinery, tools, or equipment — fixing or building things by hand.' },
  { id: 'PQ50', section: 'riasec', riasecType: 'R', reverse: false,
    text: 'I\'m drawn to outdoor, physical work where I produce tangible results.' },
  { id: 'PQ51', section: 'riasec', riasecType: 'R', reverse: false,
    text: 'I\'d enjoy working in fields like construction, manufacturing, or agriculture.' },

  // I: Investigative — analysis, research, theory
  { id: 'PQ52', section: 'riasec', riasecType: 'I', reverse: false,
    text: 'I enjoy digging deep into complex problems to uncover their root causes.' },
  { id: 'PQ53', section: 'riasec', riasecType: 'I', reverse: false,
    text: 'I\'m drawn to solitary intellectual work — forming hypotheses and finding theoretical connections.' },
  { id: 'PQ54', section: 'riasec', riasecType: 'I', reverse: false,
    text: 'Discovering the underlying principles behind complex phenomena is genuinely exciting to me.' },

  // A: Artistic — creativity, expression, freedom
  { id: 'PQ55', section: 'riasec', riasecType: 'A', reverse: false,
    text: 'I love expressing myself through creative activities like writing, visual art, or music.' },
  { id: 'PQ56', section: 'riasec', riasecType: 'A', reverse: false,
    text: 'I prefer environments where I can work freely in my own way rather than follow strict rules.' },
  { id: 'PQ57', section: 'riasec', riasecType: 'A', reverse: false,
    text: 'I\'m drawn to design, performance, or content creation that requires aesthetic sense and originality.' },

  // S: Social — teaching, helping, cooperation
  { id: 'PQ58', section: 'riasec', riasecType: 'S', reverse: false,
    text: 'I find meaning in teaching or helping others grow and improve.' },
  { id: 'PQ59', section: 'riasec', riasecType: 'S', reverse: false,
    text: 'I enjoy roles like counseling or coaching where I help people solve problems.' },
  { id: 'PQ60', section: 'riasec', riasecType: 'S', reverse: false,
    text: 'I feel a strong sense of fulfillment when I support or educate others.' },

  // E: Enterprising — persuasion, leadership, competition
  { id: 'PQ61', section: 'riasec', riasecType: 'E', reverse: false,
    text: 'I enjoy taking on leadership roles where I persuade and motivate others.' },
  { id: 'PQ62', section: 'riasec', riasecType: 'E', reverse: false,
    text: 'Competing toward ambitious goals in a fast-paced environment energizes me.' },
  { id: 'PQ63', section: 'riasec', riasecType: 'E', reverse: false,
    text: 'I\'m strongly drawn to turning business ideas into reality.' },

  // C: Conventional — procedures, accuracy, data
  { id: 'PQ64', section: 'riasec', riasecType: 'C', reverse: false,
    text: 'I thrive in structured work environments with clear procedures and rules.' },
  { id: 'PQ65', section: 'riasec', riasecType: 'C', reverse: false,
    text: 'I find satisfaction in carefully reviewing data or documents to catch errors.' },
  { id: 'PQ66', section: 'riasec', riasecType: 'C', reverse: false,
    text: 'I\'m well-suited to processing documents or data accurately according to established standards.' },

  // ════════════════════════════════════════════════════════════════
  // Academic Aptitude (20 items)
  // Measures self-assessed cognitive ability, NOT interest or preference
  // Minimal overlap with RIASEC (RIASEC = activity preference; aptitude = capacity)
  // 4 reverse-scored items per 8 dimensions to control acquiescence bias
  // Maps to: STEM · Humanities · Social Sciences · Business · Arts · Interdisciplinary
  // ════════════════════════════════════════════════════════════════

  // Quantitative reasoning (item 1 — forward)
  { id: 'PQ67', section: 'aptitude', aptitudeDim: 'quantitative', reverse: false,
    text: 'When faced with equations or logical reasoning problems, I tend to understand and solve them faster than most people.' },

  // Verbal / reading comprehension (item 1 — reverse)
  { id: 'PQ68', section: 'aptitude', aptitudeDim: 'verbal', reverse: true,
    text: 'I find it difficult to read long, complex passages and identify their central argument.' },

  // Spatial visualization (item 1 — forward)
  { id: 'PQ69', section: 'aptitude', aptitudeDim: 'spatial', reverse: false,
    text: 'When I look at a diagram or 3D object, I can easily visualize how it would look rotated or rearranged.' },

  // Social / interpersonal understanding (item 1 — reverse)
  { id: 'PQ70', section: 'aptitude', aptitudeDim: 'social', reverse: true,
    text: 'I find it hard to figure out what other people want or what kind of situation they\'re in.' },

  // Applied / systems thinking (item 1 — forward)
  { id: 'PQ71', section: 'aptitude', aptitudeDim: 'applied', reverse: false,
    text: 'When someone explains how a machine or piece of software works, I quickly grasp the principle and can apply it.' },

  // Business / financial reasoning (item 1 — reverse)
  { id: 'PQ72', section: 'aptitude', aptitudeDim: 'business', reverse: true,
    text: 'Financial statements, P&L structures, and market analysis feel unfamiliar and difficult to me.' },

  // Scientific reasoning (item 1 — forward)
  { id: 'PQ73', section: 'aptitude', aptitudeDim: 'scientific', reverse: false,
    text: 'When I look at experimental results or data, I can logically trace the cause-and-effect relationships.' },

  // Humanistic interpretation (item 1 — reverse)
  { id: 'PQ74', section: 'aptitude', aptitudeDim: 'humanistic', reverse: true,
    text: 'Interpreting the motivations of historical figures or literary characters in their cultural context feels difficult to me.' },

  // Quantitative (item 2 — reverse)
  { id: 'PQ75', section: 'aptitude', aptitudeDim: 'quantitative', reverse: true,
    text: 'When I see complex formulas or statistical notation, I feel lost about where to begin.' },

  // Verbal (item 2 — forward)
  { id: 'PQ76', section: 'aptitude', aptitudeDim: 'verbal', reverse: false,
    text: 'I\'m good at identifying the main claim and supporting evidence in dense or lengthy texts.' },

  // Spatial (item 2 — reverse)
  { id: 'PQ77', section: 'aptitude', aptitudeDim: 'spatial', reverse: true,
    text: 'Assembly instructions or floor plans don\'t translate easily into a clear mental image for me.' },

  // Social (item 2 — forward)
  { id: 'PQ78', section: 'aptitude', aptitudeDim: 'social', reverse: false,
    text: 'Even in a first conversation, I can usually read someone\'s personality and underlying intentions fairly quickly.' },

  // Applied (item 2 — reverse)
  { id: 'PQ79', section: 'aptitude', aptitudeDim: 'applied', reverse: true,
    text: 'When a device or system malfunctions, I find it hard to diagnose and fix the issue on my own.' },

  // Business (item 2 — forward)
  { id: 'PQ80', section: 'aptitude', aptitudeDim: 'business', reverse: false,
    text: 'When reviewing revenue structures or cost breakdowns, I can usually spot where the problem is and how to improve it.' },

  // Scientific (item 2 — reverse)
  { id: 'PQ81', section: 'aptitude', aptitudeDim: 'scientific', reverse: true,
    text: 'Understanding research methodology — experimental design, variable control — feels overwhelming to me.' },

  // Humanistic (item 2 — forward)
  { id: 'PQ82', section: 'aptitude', aptitudeDim: 'humanistic', reverse: false,
    text: 'I readily understand how the same historical event or text can be interpreted differently across cultures and time periods.' },

  // Artistic expression (item 1 — forward)
  { id: 'PQ83', section: 'aptitude', aptitudeDim: 'artistic', reverse: false,
    text: 'Expressing ideas or emotions through writing, visual art, music, or design comes naturally to me.' },

  // Aesthetic perception (item 2 — reverse)
  { id: 'PQ84', section: 'aptitude', aptitudeDim: 'artistic', reverse: true,
    text: 'I find it hard to notice or articulate the aesthetic qualities of an object — its color, form, tone, or atmosphere.' },

  // Original expression drive (item 3 — forward)
  { id: 'PQ85', section: 'aptitude', aptitudeDim: 'artistic', reverse: false,
    text: 'When given a topic or assignment, I naturally feel the urge to approach it in an original way rather than following convention.' },

  // Aesthetic judgment (item 4 — reverse)
  { id: 'PQ86', section: 'aptitude', aptitudeDim: 'artistic', reverse: true,
    text: 'When I encounter music, visual art, film, or design, I struggle to assess its artistic quality or merit.' },

  // ════════════════════════════════════════════════════════════════
  // Wellbeing — Burnout indicators (4 items)
  // ════════════════════════════════════════════════════════════════

  { id: 'PQ87', section: 'wellbeing', facet: 'burnout_detachment' as never, reverse: false,
    text: 'Even after work, I have difficulty truly switching off and stopping thoughts about tasks or responsibilities.' },
  { id: 'PQ88', section: 'wellbeing', facet: 'burnout_meaning' as never, reverse: false,
    text: 'I\'ve been feeling less sense of purpose or fulfillment in my work lately compared to before.' },
  { id: 'PQ89', section: 'wellbeing', facet: 'burnout_exhaustion' as never, reverse: false,
    text: 'I frequently feel emotionally and physically drained by the end of the day.' },
  { id: 'PQ90', section: 'wellbeing', facet: 'burnout_recovery' as never, reverse: false,
    text: 'Even after resting, I often don\'t feel properly recovered and ready for the next day.' },
]

// Section utilities
export const HEXACO_QUESTIONS_EN  = PAID_QUESTIONS_EN.filter(q => q.section === 'hexaco')
export const RIASEC_QUESTIONS_EN  = PAID_QUESTIONS_EN.filter(q => q.section === 'riasec')
export const APTITUDE_QUESTIONS_EN = PAID_QUESTIONS_EN.filter(q => q.section === 'aptitude')
