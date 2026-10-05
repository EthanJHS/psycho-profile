import CompareView from '@/components/hexaco/CompareView'
import { compareMetadata } from '@/lib/compare-meta'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  return compareMetadata('ko', (await searchParams).f)
}

export default function ComparePage() {
  return <CompareView lang="ko" />
}
