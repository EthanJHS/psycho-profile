export type QuestionType = 'choice' | 'cognitive' | 'likert'

export type SectionId = 'world' | 'decision' | 'relation' | 'cognition' | 'essence'

export type ArchetypeId =
  | 'architect' | 'guardian' | 'explorer' | 'prophet'
  | 'warrior' | 'alchemist' | 'sovereign' | 'sage'
  | 'harmonizer' | 'rebel' | 'lover' | 'catalyst'

export type ModeId = 'analytical' | 'intuitive' | 'pragmatic' | 'integrative'

export type DriveId = 'achievement' | 'connection' | 'autonomy' | 'security'

export interface Question {
  id: string
  text: string
  type: QuestionType
  facet: string
  domain: string
  section?: SectionId
  reverse?: boolean
  options?: { label: string; value: string | number }[]
  correctAnswer?: string | number
}

export interface Answer {
  questionId: string
  value: number | string
}

export interface FacetScore {
  [facet: string]: number
}

export interface TestResult {
  profileId: string
  profileLabel: string
  dominantTraits: string[]
  careers: {
    title: string
    fit: number
    reason: string
    contraReason?: string
    detail?: string
    growthNote?: string
    subRoles?: string[]
  }[]
  studyMethods: string[]
  warnings: string[]
  lifestyle: string
  weeklyRoutine: string[]
  cognitiveStyle: string
  relationshipStyle?: string
  growthDirection?: string
  shortDesc?: string
  teaser?: string
  archetype?: ArchetypeId
  mode?: ModeId
  drive?: DriveId
  light?: string
  shadow?: string
}
