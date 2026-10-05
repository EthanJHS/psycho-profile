import CompareView from '@/components/hexaco/CompareView'
import { compareMetadata } from '@/lib/compare-meta'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  return compareMetadata('en', (await searchParams).f)
}

export default function ComparePageEn() {
  return <CompareView lang="en" />
}
