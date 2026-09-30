import HomeView from '@/components/home/HomeView'

export const metadata = { alternates: { canonical: '/en', languages: { ko: '/', en: '/en' } } }

export default function HomePageEn() {
  return <HomeView lang="en" />
}
