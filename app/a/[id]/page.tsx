import SharedArchetype, { archetypeIds, sharedArchetypeMetadata } from '@/components/hexaco/SharedArchetype'

export const generateStaticParams = archetypeIds

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return sharedArchetypeMetadata('ko', (await params).id)
}

export default async function SharedArchetypePage({ params }: { params: Promise<{ id: string }> }) {
  return <SharedArchetype lang="ko" id={(await params).id} />
}
