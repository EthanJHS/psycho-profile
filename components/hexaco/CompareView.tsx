'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { scoreHexaco, type HexacoFactor } from '@/lib/scoring-hexaco'
import { trackHexaco, isAdminSim } from '@/lib/analytics'
import { COMPARE_PENDING_KEY, compareProfiles, decodeCompareCode, encodeCompareCode, profileOf, type CompareProfile, type FactorDiff } from '@/lib/compare'
import { CONTENT, PATHS, STORAGE, type Lang } from '@/lib/i18n'

// 친구와 비교하기 — 한국어(/compare)·영어(/en/compare) 공용
// 링크(?f=코드)의 친구 점수와, 이 브라우저에 있는 내 검사 결과를 나란히 보여준다. 서버에는 아무것도 저장하지 않음
const GOLD = '#c8a030'
const GOLD_SOFT = 'rgba(200,160,48,0.28)'
const TEXT = '#efe6d2'
const MUTED = 'rgba(239,230,210,0.66)'
const FAINT = 'rgba(239,230,210,0.45)'
const SERIF = 'var(--font-serif), serif'
const BLUE = '#93a6cc'
const GOLD_BUTTON = 'linear-gradient(135deg, #a8781f 0%, #e2c064 50%, #a8781f 100%)'

type Lines = Record<HexacoFactor, { similar: string; meHigher: string; themHigher: string }>

const KO = {
  eyebrow: '원형 비교',
  invalidTitle: '비교 링크가 올바르지 않아요',
  invalidBody: '링크가 잘렸을 수 있어요. 친구에게 다시 받아 보거나, 먼저 내 원형을 찾아보세요.',
  takeTest: '내 원형 찾기 →',
  inviteEyebrow: '친구가 받은 원형',
  inviteTitle: (name: string) => `친구는 ${name}.\n나는 어떤 원형일까?`,
  inviteBody: '48개의 질문에 답하면 내 원형을 찾고, 친구와 얼마나 닮았는지 6가지 성격 요인으로 비교해 볼 수 있어요.',
  inviteCta: '검사하고 비교하기 →',
  inviteNote: '무료 · 약 8분 · 이미 검사했다면 저장해 둔 내 결과 링크를 이 탭에서 먼저 열어 주세요.',
  ownTitle: '내 비교 링크예요',
  ownBody: '이 링크를 친구에게 보내면, 친구가 검사한 뒤 두 사람의 결과를 나란히 볼 수 있어요.',
  me: '나',
  them: '친구',
  sameArchetype: '같은 원형이에요',
  similarity: '닮은 정도',
  similarityNote: '6가지 요인 점수 차이로 계산한 값이에요. 성향이 얼마나 비슷한지를 뜻하고, 잘 맞는지(궁합)를 뜻하지는 않아요.',
  closest: '가장 가까운 요인',
  farthest: '가장 먼 요인',
  gap: (g: number) => `차이 ${g.toFixed(1)}점`,
  byFactor: '요인별로 보면',
  scoreNote: '점수는 요인별 8문항의 평균(1~5)이에요. 높고 낮음은 우열이 아니라 방향의 차이예요.',
  sendBack: '내 비교 링크 보내기',
  copied: '비교 링크를 복사했습니다',
  shareTitle: (name: string) => `나는 ${name}. 너는?`,
  linkNote: '비교 링크에는 내 원형과 6요인 점수만 담겨요.',
  myReport: '내 결과 리포트 보기 →',
  lines: {
    H: { similar: '원칙과 실리 사이에서 균형을 잡는 방식이 비슷해요.', meHigher: '내가 원칙을 더 따지는 편이고, 친구는 상황에 맞춰 더 유연하게 움직여요.', themHigher: '친구가 원칙을 더 따지는 편이고, 나는 상황에 맞춰 더 유연하게 움직여요.' },
    E: { similar: '걱정이나 감정에 흔들리는 정도가 비슷해요.', meHigher: '내가 감정에 더 민감하고 친구는 더 담담해요. 내가 걱정을 꺼낼 때 친구는 해결책부터 말할 수 있어요.', themHigher: '친구가 감정에 더 민감하고 나는 더 담담해요. 친구가 걱정을 꺼낼 때는 해결책보다 공감을 먼저 건네 보세요.' },
    X: { similar: '사람을 만나며 쓰는 에너지가 비슷해요.', meHigher: '내가 더 나서는 편이고, 친구는 조용히 충전하는 시간이 더 필요해요.', themHigher: '친구가 더 나서는 편이고, 나는 조용히 충전하는 시간이 더 필요해요.' },
    A: { similar: '갈등을 다루는 방식이 비슷해요.', meHigher: '내가 더 맞춰 주는 편이고, 친구는 자기 기준을 더 분명하게 말해요.', themHigher: '친구가 더 맞춰 주는 편이고, 나는 내 기준을 더 분명하게 말해요.' },
    C: { similar: '계획과 마무리에 쓰는 힘이 비슷해요.', meHigher: '내가 더 계획적으로 움직이고, 친구는 흐름을 타는 편이에요. 약속은 내가 정리하면 편해요.', themHigher: '친구가 더 계획적으로 움직이고, 나는 흐름을 타는 편이에요. 약속은 친구가 정리하면 편해요.' },
    O: { similar: '새로운 것에 끌리는 정도가 비슷해요.', meHigher: '내가 새로운 시도에 더 끌리고, 친구는 검증된 방식을 더 믿어요.', themHigher: '친구가 새로운 시도에 더 끌리고, 나는 검증된 방식을 더 믿어요.' },
  } as Lines,
}

// 영어 문구는 한국어와 같은 키를 가져야 함 (빠지면 타입 오류)
const T: Record<Lang, typeof KO> = {
  ko: KO,
  en: {
    eyebrow: 'ARCHETYPE COMPARISON',
    invalidTitle: 'This comparison link doesn’t look right',
    invalidBody: 'The link may have been cut off. Ask your friend to send it again, or find your own archetype first.',
    takeTest: 'Find my archetype →',
    inviteEyebrow: 'YOUR FRIEND’S ARCHETYPE',
    inviteTitle: (name: string) => `Your friend got ${name}.\nWhat are you?`,
    inviteBody: 'Answer 48 questions to find your archetype, then see how alike the two of you are across six personality factors.',
    inviteCta: 'Take the test and compare →',
    inviteNote: 'Free · About 8 minutes · Already took it? Open your saved result link in this tab first.',
    ownTitle: 'This is your own comparison link',
    ownBody: 'Send it to a friend. Once they take the test, you’ll both see your results side by side.',
    me: 'You',
    them: 'Friend',
    sameArchetype: 'You share the same archetype',
    similarity: 'How alike you are',
    similarityNote: 'Calculated from the differences in your six factor scores. It shows how similar your tendencies are — not how compatible you are.',
    closest: 'Closest factor',
    farthest: 'Furthest apart',
    gap: (g: number) => `${g.toFixed(1)} points apart`,
    byFactor: 'Factor by factor',
    scoreNote: 'Each score is the average (1–5) of 8 questions. Higher or lower isn’t better or worse — just a different direction.',
    sendBack: 'Send my comparison link',
    copied: 'Comparison link copied',
    shareTitle: (name: string) => `I got ${name}. What are you?`,
    linkNote: 'Your comparison link includes only your archetype and six factor scores.',
    myReport: 'See my full result →',
    lines: {
      H: { similar: 'You balance principle and practicality in similar ways.', meHigher: 'You’re the one who holds to principle; your friend adapts more freely to the situation.', themHigher: 'Your friend holds to principle; you adapt more freely to the situation.' },
      E: { similar: 'You’re moved by worry and emotion to a similar degree.', meHigher: 'You feel things more sharply and your friend stays calmer. When you bring up a worry, they may jump straight to solutions.', themHigher: 'Your friend feels things more sharply and you stay calmer. When they bring up a worry, try empathy before solutions.' },
      X: { similar: 'You spend social energy in similar ways.', meHigher: 'You’re the one who steps forward; your friend needs more quiet time to recharge.', themHigher: 'Your friend steps forward; you need more quiet time to recharge.' },
      A: { similar: 'You handle conflict in similar ways.', meHigher: 'You tend to accommodate; your friend states their standards more plainly.', themHigher: 'Your friend tends to accommodate; you state your standards more plainly.' },
      C: { similar: 'You put similar effort into planning and finishing.', meHigher: 'You’re the planner and your friend goes with the flow. Plans go smoother when you organize them.', themHigher: 'Your friend is the planner and you go with the flow. Plans go smoother when they organize them.' },
      O: { similar: 'You’re drawn to new things to a similar degree.', meHigher: 'You’re more drawn to trying new things; your friend trusts what’s proven.', themHigher: 'Your friend is more drawn to trying new things; you trust what’s proven.' },
    },
  },
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100svh', background: '#0b0910', padding: '92px 16px 64px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>{children}</div>
    </main>
  )
}

function Card({ id, name, label, tagline }: { id: string; name: string; label: string; tagline?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, letterSpacing: '0.14em', marginBottom: 8 }}>{label}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/archetypes/t/${id}.webp`} alt={name} style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', borderRadius: 12, border: `1px solid ${GOLD_SOFT}`, display: 'block' }} />
      <p style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: TEXT, marginTop: 10, lineHeight: 1.3 }}>{name}</p>
      {tagline && <p style={{ fontSize: 12, color: FAINT, marginTop: 4, lineHeight: 1.5 }}>{tagline}</p>}
    </div>
  )
}

const GoldCta = ({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) => (
  <Link href={href} onClick={onClick} style={{ display: 'block', textAlign: 'center', padding: 16, borderRadius: 14, textDecoration: 'none', background: GOLD_BUTTON, color: '#1a1206', fontSize: 15, fontWeight: 800 }}>{children}</Link>
)

export default function CompareView({ lang }: { lang: Lang }) {
  return <Suspense fallback={null}><CompareInner lang={lang} /></Suspense>
}

function CompareInner({ lang }: { lang: Lang }) {
  const t = T[lang]
  const { archetypes, personalize } = CONTENT[lang]
  const paths = PATHS[lang]
  const code = useSearchParams().get('f')
  const theirs = useMemo(() => decodeCompareCode(code), [code])
  const [mine, setMine] = useState<{ profile: CompareProfile; code: string | null } | null | undefined>(undefined)
  const [toast, setToast] = useState('')

  // 이 브라우저에 있는 내 검사 결과 (없으면 초대 화면)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE[lang].answers)
      if (!raw) { setMine(null); return }
      const r = scoreHexaco(JSON.parse(raw) as Record<string, number>)
      setMine({ profile: profileOf(r), code: encodeCompareCode(r) })
    } catch { setMine(null) }
  }, [lang])

  const isOwn = !!mine && !!code && mine.code === code
  const cmp = useMemo(() => (mine && theirs && !isOwn ? compareProfiles(mine.profile, theirs) : null), [mine, theirs, isOwn])

  useEffect(() => {
    if (!cmp || isAdminSim()) return
    sessionStorage.removeItem(COMPARE_PENDING_KEY)
    trackHexaco('hexaco_compare_view', { same_archetype: cmp.sameArchetype, similarity: cmp.similarity }).catch(() => {})
  }, [cmp])

  async function sendMyLink() {
    if (!mine?.code) return
    const url = `${window.location.origin}${paths.compare}?f=${mine.code}`
    const name = archetypes[mine.profile.archetypeId]?.name ?? ''
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: t.shareTitle(name), text: t.shareTitle(name), url }) } catch { /* 사용자가 공유 창을 닫음 */ }
      return
    }
    try { await navigator.clipboard.writeText(url) } catch { window.prompt(t.sendBack, url); return }
    setToast(t.copied); setTimeout(() => setToast(''), 2200)
  }

  if (!theirs) {
    return (
      <Shell>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 10 }}>{t.eyebrow}</p>
        <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{t.invalidTitle}</h1>
        <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.75, marginBottom: 24 }}>{t.invalidBody}</p>
        <GoldCta href={`${paths.test}?start=1`}>{t.takeTest}</GoldCta>
      </Shell>
    )
  }
  if (mine === undefined) return <Shell>{null}</Shell>

  const theirDetail = archetypes[theirs.archetypeId]
  const theirName = theirDetail?.name ?? theirs.archetypeId

  // 내 링크를 내가 연 경우
  if (isOwn) {
    return (
      <Shell>
        {toast && <Toast>{toast}</Toast>}
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', marginBottom: 10 }}>{t.eyebrow}</p>
        <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{t.ownTitle}</h1>
        <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.75, marginBottom: 22 }}>{t.ownBody}</p>
        <button onClick={sendMyLink} style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', background: GOLD_BUTTON, color: '#1a1206', fontSize: 15, fontWeight: 800 }}>{t.sendBack}</button>
        <p style={{ fontSize: 12, color: FAINT, textAlign: 'center', marginTop: 10 }}>{t.linkNote}</p>
      </Shell>
    )
  }

  // 아직 검사 전 — 친구의 원형을 보여주고 검사로 안내 (돌아오면 비교가 이어지도록 코드를 기억)
  if (!mine || !cmp) {
    return (
      <Shell>
        <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', textAlign: 'center', marginBottom: 14 }}>{t.inviteEyebrow}</p>
        <div style={{ maxWidth: 240, margin: '0 auto 20px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/archetypes/w/${theirs.archetypeId}.webp`} alt={theirName} style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', objectPosition: 'center top', borderRadius: 16, border: `1px solid ${GOLD_SOFT}`, display: 'block' }} />
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 700, color: TEXT, lineHeight: 1.4, textAlign: 'center', whiteSpace: 'pre-line', marginBottom: 10 }}>{t.inviteTitle(theirName)}</h1>
        {theirDetail?.tagline && <p style={{ fontSize: 14, color: '#e2c064', fontStyle: 'italic', textAlign: 'center', marginBottom: 14 }}>&ldquo;{theirDetail.tagline}&rdquo;</p>}
        <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.75, textAlign: 'center', marginBottom: 24 }}>{t.inviteBody}</p>
        <GoldCta href={`${paths.test}?start=1`} onClick={() => { try { sessionStorage.setItem(COMPARE_PENDING_KEY, code!) } catch { /* 저장 불가 — 링크를 다시 열면 됨 */ } }}>{t.inviteCta}</GoldCta>
        <p style={{ fontSize: 12, color: FAINT, textAlign: 'center', lineHeight: 1.6, marginTop: 12 }}>{t.inviteNote}</p>
      </Shell>
    )
  }

  const myDetail = archetypes[mine.profile.archetypeId]
  const label = (f: HexacoFactor) => personalize.factorLabel[f]
  const Highlight = ({ title, d }: { title: string; d: FactorDiff }) => (
    <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 12, border: `1px solid ${GOLD_SOFT}`, background: 'rgba(21,17,28,0.8)' }}>
      <p style={{ fontSize: 11.5, color: FAINT, marginBottom: 4 }}>{title}</p>
      <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: TEXT }}>{label(d.factor)}</p>
      <p style={{ fontSize: 12, color: MUTED, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{t.gap(d.gap)}</p>
    </div>
  )

  return (
    <Shell>
      {toast && <Toast>{toast}</Toast>}
      <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.2em', textAlign: 'center', marginBottom: 16 }}>{t.eyebrow}</p>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
        <Card id={mine.profile.archetypeId} name={myDetail?.name ?? mine.profile.archetypeId} label={t.me} tagline={myDetail?.tagline} />
        <Card id={theirs.archetypeId} name={theirName} label={t.them} tagline={theirDetail?.tagline} />
      </div>

      <div style={{ textAlign: 'center', padding: '18px 16px', borderRadius: 16, border: '1px solid rgba(226,192,100,0.45)', background: 'rgba(200,160,48,0.08)', marginBottom: 12 }}>
        {cmp.sameArchetype && <p style={{ fontSize: 13, fontWeight: 700, color: '#e2c064', marginBottom: 6 }}>{t.sameArchetype}</p>}
        <p style={{ fontSize: 12.5, color: MUTED }}>{t.similarity}</p>
        <p style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 700, color: TEXT, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{cmp.similarity}<span style={{ fontSize: 20, color: '#e2c064' }}>%</span></p>
        <p style={{ fontSize: 12, color: FAINT, lineHeight: 1.6, marginTop: 6 }}>{t.similarityNote}</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
        <Highlight title={t.closest} d={cmp.closest} />
        <Highlight title={t.farthest} d={cmp.farthest} />
      </div>

      <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{t.byFactor}</h2>
      <p style={{ display: 'flex', gap: 16, fontSize: 12, color: MUTED, marginBottom: 14 }}>
        <span><i aria-hidden style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: '#e2c064', marginRight: 6 }} />{t.me}</span>
        <span><i aria-hidden style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: BLUE, marginRight: 6 }} />{t.them}</span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 14 }}>
        {cmp.factors.map(d => (
          <div key={d.factor}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>{label(d.factor)}</span>
              <span style={{ fontSize: 12.5, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                <b style={{ color: '#e2c064', fontWeight: 600 }}>{d.mine.toFixed(1)}</b> · <b style={{ color: BLUE, fontWeight: 600 }}>{d.theirs.toFixed(1)}</b>
              </span>
            </div>
            {/* 같은 눈금(1~5) 위에 두 사람의 위치를 점으로 표시 */}
            <div style={{ position: 'relative', height: 14 }} role="img" aria-label={`${label(d.factor)}: ${t.me} ${d.mine.toFixed(1)}, ${t.them} ${d.theirs.toFixed(1)}`}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', top: 6, height: 2, background: 'rgba(226,192,100,0.35)', left: `${(Math.min(d.mine, d.theirs) - 1) / 4 * 100}%`, width: `${d.gap / 4 * 100}%` }} />
              <span style={{ position: 'absolute', top: 1, width: 12, height: 12, borderRadius: 99, background: BLUE, border: '2px solid #0b0910', left: `calc(${(d.theirs - 1) / 4 * 100}% - 6px)` }} />
              <span style={{ position: 'absolute', top: 1, width: 12, height: 12, borderRadius: 99, background: '#e2c064', border: '2px solid #0b0910', left: `calc(${(d.mine - 1) / 4 * 100}% - 6px)` }} />
            </div>
            <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, marginTop: 8 }}>{t.lines[d.factor][d.relation]}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: FAINT, lineHeight: 1.6, paddingTop: 12, borderTop: `1px solid ${GOLD_SOFT}`, marginBottom: 24 }}>{t.scoreNote}</p>

      <button onClick={sendMyLink} style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', background: GOLD_BUTTON, color: '#1a1206', fontSize: 15, fontWeight: 800 }}>{t.sendBack}</button>
      <p style={{ fontSize: 12, color: FAINT, textAlign: 'center', marginTop: 10 }}>{t.linkNote}</p>
      <p style={{ textAlign: 'center', marginTop: 18 }}><Link href={paths.report} style={{ fontSize: 14, color: '#e2c064' }}>{t.myReport}</Link></p>
    </Shell>
  )
}

function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" style={{
      position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      maxWidth: 'calc(100% - 32px)', padding: '10px 16px', borderRadius: 12, fontSize: 14.5, textAlign: 'center',
      background: 'rgba(20,16,30,0.96)', border: '1px solid rgba(200,168,75,0.35)', color: '#fff',
    }}>{children}</div>
  )
}
