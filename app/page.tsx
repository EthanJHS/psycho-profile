import HomeView from '@/components/home/HomeView'

// 메인만 언어 대응 주소를 알림 (하위 페이지에 상속되면 모두 메인의 중복으로 보임)
export const metadata = { alternates: { canonical: '/', languages: { ko: '/', en: '/en' } } }

export default function HomePage() {
  return <HomeView lang="ko" />
}
