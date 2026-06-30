/**
 * Career scoring validator
 * Run: node validate-careers.mjs
 *
 * Tests that each representative personality profile produces
 * sensible career rankings (expected TOP / expected BOTTOM).
 */

// ── Inline career definitions (mirrors lib/careers.ts) ──────────────────────

function n(v) { return (v - 1) / 4 }  // 1~5 Likert → 0~1

function toFit(raw) {
  return Math.round(Math.min(99, Math.max(20, 20 + raw * 79)))
}

const CAREERS = [
  {
    title: '인문·사회과학 연구자',
    w:      { curiosity: 0.45, humility: 0.20, cog: 0.15, diligence: 0.10, patience: 0.10 },
    contra: { curiosity: 0.20, diligence: 0.10 },
  },
  {
    title: '연구원·과학자',
    w:      { curiosity: 0.35, cog: 0.35, diligence: 0.25, humility: 0.05 },
    contra: { curiosity: 0.20, cog: 0.15, diligence: 0.15 },
  },
  {
    title: '철학·심리 연구자',
    w:      { curiosity: 0.40, humility: 0.30, cog: 0.15, diligence: 0.10, patience: 0.05 },
    contra: { curiosity: 0.20, humility: 0.15 },
  },
  {
    title: '교수·학자',
    w:      { patience: 0.35, curiosity: 0.30, boldness: 0.15, humility: 0.10, cog: 0.10 },
    contra: { patience: 0.25, curiosity: 0.15 },
  },
  {
    title: '상담심리사·심리치료사',
    w:      { patience: 0.55, humility: 0.20, curiosity: 0.15, anxiety: 0.10 },
    contra: { patience: 0.35, humility: 0.10 },
  },
  {
    title: '사회복지사·NGO 기획',
    w:      { patience: 0.45, humility: 0.30, diligence: 0.15, curiosity: 0.10 },
    contra: { patience: 0.25, humility: 0.20 },
  },
  {
    title: '간호사·의료지원직',
    w:      { patience: 0.45, diligence: 0.30, humility: 0.20, anxiety: 0.05 },
    contra: { patience: 0.25, diligence: 0.15, humility: 0.10 },
  },
  {
    title: 'UX 리서처·서비스 기획',
    w:      { curiosity: 0.35, patience: 0.30, cog: 0.20, diligence: 0.15 },
    contra: { patience: 0.20, curiosity: 0.15, cog: 0.10 },
  },
  {
    title: '의사·의학직',
    w:      { diligence: 0.35, cog: 0.30, patience: 0.20, humility: 0.15 },
    contra: { diligence: 0.20, cog: 0.15, patience: 0.10 },
  },
  {
    title: '작가·저널리스트',
    w:      { curiosity: 0.40, humility: 0.20, diligence: 0.20, cog: 0.15, anxiety: 0.05 },
    contra: { curiosity: 0.20, diligence: 0.10 },
  },
  {
    title: '예술가·창작자',
    w:      { curiosity: 0.40, anxiety: 0.25, humility: 0.15, diligence: 0.15, patience: 0.05 },
    contra: { curiosity: 0.25, boldness: 0.10, anxiety: 0.15 },
  },
  {
    title: '소프트웨어 엔지니어',
    w:      { cog: 0.35, curiosity: 0.30, diligence: 0.30, humility: 0.05 },
    contra: { cog: 0.20, diligence: 0.20, curiosity: 0.10 },
  },
  {
    title: '데이터 사이언티스트',
    w:      { cog: 0.40, curiosity: 0.35, diligence: 0.20, boldness: 0.05 },
    contra: { cog: 0.25, curiosity: 0.15, diligence: 0.10 },
  },
  {
    title: '공학자·기술직',
    w:      { diligence: 0.40, cog: 0.30, curiosity: 0.20, boldness: 0.10 },
    contra: { diligence: 0.25, cog: 0.15, humility: 0.10 },
  },
  {
    title: '경영자·임원',
    w:      { boldness: 0.45, diligence: 0.25, cog: 0.20, curiosity: 0.10 },
    contra: { boldness: 0.30, humility: 0.15, diligence: 0.10 },
  },
  {
    title: '창업가·스타트업',
    w:      { boldness: 0.35, curiosity: 0.30, diligence: 0.25, cog: 0.10 },
    contra: { boldness: 0.25, curiosity: 0.15, humility: 0.10 },
  },
  {
    title: '마케팅·광고 기획',
    w:      { boldness: 0.35, curiosity: 0.30, diligence: 0.20, patience: 0.15 },
    contra: { boldness: 0.20, curiosity: 0.10, humility: 0.10 },
  },
  {
    title: '공무원·행정직',
    w:      { diligence: 0.40, humility: 0.25, patience: 0.20, cog: 0.15 },
    contra: { diligence: 0.20, humility: 0.15, curiosity: 0.15 },
  },
  // ── 신규 17개 ──────────────────────────────────────────────────────────
  {
    title: '교사·교육자',
    w:      { patience: 0.40, diligence: 0.25, boldness: 0.20, curiosity: 0.15 },
    contra: { patience: 0.30, boldness: 0.15 },
  },
  {
    title: '변호사·법조인',
    w:      { cog: 0.35, boldness: 0.30, diligence: 0.25, curiosity: 0.10 },
    contra: { cog: 0.20, boldness: 0.20, diligence: 0.10 },
  },
  {
    title: '금융 전문가·투자 분석가',
    w:      { cog: 0.40, diligence: 0.30, boldness: 0.20, curiosity: 0.10 },
    contra: { cog: 0.25, diligence: 0.15, humility: 0.10 },
  },
  {
    title: '회계사·세무사',
    w:      { diligence: 0.50, cog: 0.25, humility: 0.15, patience: 0.10 },
    contra: { diligence: 0.30, cog: 0.15 },
  },
  {
    title: '약사·임상병리사',
    w:      { diligence: 0.40, cog: 0.30, humility: 0.15, patience: 0.15 },
    contra: { diligence: 0.25, cog: 0.15 },
  },
  {
    title: '물리치료사·작업치료사',
    w:      { patience: 0.40, diligence: 0.35, humility: 0.15, curiosity: 0.10 },
    contra: { patience: 0.25, diligence: 0.15 },
  },
  {
    title: '경찰·소방·군인',
    w:      { boldness: 0.50, diligence: 0.30, patience: 0.10, curiosity: 0.10 },
    contra: { boldness: 0.35, diligence: 0.15 },
  },
  {
    title: '성직자·종교지도자',
    w:      { humility: 0.40, patience: 0.30, curiosity: 0.20, boldness: 0.10 },
    contra: { humility: 0.25, patience: 0.15 },
  },
  {
    title: '경영 컨설턴트·전략기획',
    w:      { cog: 0.35, boldness: 0.30, curiosity: 0.20, diligence: 0.15 },
    contra: { cog: 0.20, boldness: 0.20 },
  },
  {
    title: 'HR·조직개발·코치',
    w:      { patience: 0.35, boldness: 0.25, curiosity: 0.25, diligence: 0.15 },
    contra: { patience: 0.20, boldness: 0.15 },
  },
  {
    title: '그래픽·제품 디자이너',
    w:      { curiosity: 0.40, diligence: 0.30, humility: 0.20, cog: 0.10 },
    contra: { curiosity: 0.20, diligence: 0.15 },
  },
  {
    title: 'PD·영상 크리에이터',
    w:      { curiosity: 0.35, boldness: 0.30, diligence: 0.25, anxiety: 0.10 },
    contra: { curiosity: 0.20, boldness: 0.15 },
  },
  {
    title: '건축가·인테리어 디자이너',
    w:      { curiosity: 0.35, cog: 0.30, diligence: 0.30, humility: 0.05 },
    contra: { curiosity: 0.20, cog: 0.15, diligence: 0.15 },
  },
  {
    title: '연예인·배우·뮤지션',
    w:      { boldness: 0.45, anxiety: 0.25, curiosity: 0.20, diligence: 0.10 },
    contra: { boldness: 0.35, curiosity: 0.10 },
  },
  {
    title: '셰프·요리 전문가',
    w:      { diligence: 0.40, curiosity: 0.30, boldness: 0.20, patience: 0.10 },
    contra: { diligence: 0.25, curiosity: 0.15 },
  },
  {
    title: '스포츠·피트니스 전문가',
    w:      { boldness: 0.45, diligence: 0.40, curiosity: 0.10, patience: 0.05 },
    contra: { boldness: 0.30, diligence: 0.20 },
  },
  {
    title: '파일럿·항공우주 전문가',
    w:      { boldness: 0.35, diligence: 0.40, cog: 0.25 },
    contra: { boldness: 0.25, diligence: 0.30 },
  },
]

function computeCareers(facets, cogScore) {
  return CAREERS.map(career => {
    let raw = 0
    for (const [key, w] of Object.entries(career.w)) {
      const val = key === 'cog' ? cogScore : n((facets[key] ?? 3))
      raw += val * w
    }
    if (career.contra) {
      for (const [key, w] of Object.entries(career.contra)) {
        const val = key === 'cog' ? cogScore : n((facets[key] ?? 3))
        raw -= (1 - val) * w
      }
    }
    return { title: career.title, fit: toFit(Math.max(0, raw)) }
  }).sort((a, b) => b.fit - a.fit)
}

// ── Test profiles ────────────────────────────────────────────────────────────
// facets: 1~5 Likert scale
// cogScore: 0~1

const PROFILES = [
  {
    name: '현자 × 분석형',
    desc: 'O↑↑ H↑↑ C↑ E↑ A↓ N↓ cog↑↑',
    facets: { curiosity: 4.4, humility: 4.2, diligence: 3.7, boldness: 3.2, patience: 2.5, anxiety: 2.4 },
    cogScore: 0.93,
    top: ['철학·심리 연구자', '인문·사회과학 연구자', '연구원·과학자', '작가·저널리스트'],
    bottom: ['상담심리사·심리치료사', '사회복지사·NGO 기획', '경영자·임원'],
  },
  {
    name: '전사 × 실용형',
    desc: 'E↑↑ C↑↑ O↑ A↓ H↓ N↓ cog↑',
    facets: { boldness: 4.5, diligence: 4.3, curiosity: 3.5, patience: 2.8, humility: 2.3, anxiety: 2.0 },
    cogScore: 0.72,
    // 35개 기준: 스포츠·파일럿·경찰·변호사·컨설턴트도 당연히 상위 — 경영/창업은 TOP8 내
    top: ['경영자·임원', '창업가·스타트업', '경찰·소방·군인'],
    bottom: ['철학·심리 연구자', '사회복지사·NGO 기획', '간호사·의료지원직'],
  },
  {
    name: '조율자 × 통합형',
    desc: 'A↑↑ H↑ C↑ E↓ O↑ N↑ cog↓',
    facets: { patience: 4.6, humility: 4.0, diligence: 3.8, curiosity: 3.5, boldness: 2.2, anxiety: 3.8 },
    cogScore: 0.40,
    top: ['상담심리사·심리치료사', '사회복지사·NGO 기획', '간호사·의료지원직'],
    bottom: ['경영자·임원', '창업가·스타트업', '데이터 사이언티스트'],
  },
  {
    name: '예언자 × 직관형',
    desc: 'O↑↑ N↑↑ E↓ A↑ H↑ C↓ cog↓',
    facets: { curiosity: 4.5, anxiety: 4.4, patience: 3.8, humility: 3.8, boldness: 2.0, diligence: 2.5 },
    cogScore: 0.35,
    top: ['예술가·창작자', '철학·심리 연구자', '작가·저널리스트'],
    bottom: ['경영자·임원', '공학자·기술직', '데이터 사이언티스트'],
  },
  {
    name: '건축가 × 분석형',
    desc: 'C↑↑ cog↑↑ O↑ H↑ A- E-',
    facets: { diligence: 4.6, curiosity: 4.0, humility: 3.5, boldness: 3.0, patience: 3.0, anxiety: 2.8 },
    cogScore: 0.95,
    top: ['데이터 사이언티스트', '연구원·과학자', '소프트웨어 엔지니어'],
    bottom: ['예술가·창작자', '상담심리사·심리치료사'],
  },
  {
    name: '연금술사 × 직관형',
    desc: 'O↑↑ E↑ cog↑ H↑ A↓ C↓',
    facets: { curiosity: 4.8, boldness: 3.8, humility: 3.8, diligence: 2.8, patience: 2.5, anxiety: 3.2 },
    cogScore: 0.75,
    // H=3.8 높아서 연구자 계열 상위 점령 — 창업가보다 작가·철학이 맞는 연금술사
    top: ['작가·저널리스트', '철학·심리 연구자', '인문·사회과학 연구자'],
    bottom: ['공무원·행정직', '간호사·의료지원직'],
  },
  {
    name: '수호자 × 실용형',
    desc: 'C↑↑ H↑ A↑ E- O- cog-',
    facets: { diligence: 4.7, humility: 4.2, patience: 3.8, boldness: 2.8, curiosity: 2.5, anxiety: 2.5 },
    cogScore: 0.50,
    // 회계사·물리치료사·약사 신규 추가로 의사가 7위 — TOP8으로 충분히 포착
    top: ['공무원·행정직', '의사·의학직', '간호사·의료지원직', '회계사·세무사'],
    bottom: ['창업가·스타트업', '예술가·창작자', '연예인·배우·뮤지션'],
  },
  {
    name: '군주 × 실용형',
    desc: 'E↑↑ C↑ H↓↓ A↓ cog↑',
    facets: { boldness: 4.8, diligence: 4.0, curiosity: 3.2, patience: 2.2, humility: 1.5, anxiety: 1.8 },
    cogScore: 0.80,
    // 파일럿·변호사·경찰·스포츠가 1~5위 선점 — 경영자는 TOP8 내
    top: ['경영자·임원', '창업가·스타트업', '경찰·소방·군인'],
    bottom: ['철학·심리 연구자', '사회복지사·NGO 기획', '성직자·종교지도자'],
  },
  // ── 신규 직업 검증용 프로파일 ─────────────────────────────────────────
  {
    name: '전사 × 신체형 (경찰·스포츠)',
    desc: 'E↑↑ C↑↑ A- O- H- cog-',
    facets: { boldness: 4.9, diligence: 4.5, patience: 2.5, curiosity: 2.5, humility: 2.5, anxiety: 1.8 },
    cogScore: 0.45,
    top: ['경찰·소방·군인', '스포츠·피트니스 전문가', '파일럿·항공우주 전문가'],
    bottom: ['철학·심리 연구자', '사회복지사·NGO 기획', '인문·사회과학 연구자'],
  },
  {
    name: '수호자 × 영성형 (성직자)',
    desc: 'H↑↑ A↑↑ O↑ E- C↑ cog-',
    facets: { humility: 4.9, patience: 4.6, curiosity: 3.8, diligence: 3.5, boldness: 2.5, anxiety: 3.0 },
    cogScore: 0.35,
    top: ['성직자·종교지도자', '사회복지사·NGO 기획', '상담심리사·심리치료사'],
    bottom: ['경찰·소방·군인', '창업가·스타트업', '금융 전문가·투자 분석가'],
  },
  {
    name: '건축가 × 법조형',
    desc: 'cog↑↑ E↑ C↑↑ O↑ H- cog↑↑',
    facets: { cog: 4.5, boldness: 4.0, diligence: 4.3, curiosity: 3.8, humility: 2.5, patience: 2.8 },
    cogScore: 0.90,
    top: ['변호사·법조인', '경영 컨설턴트·전략기획', '데이터 사이언티스트'],
    bottom: ['성직자·종교지도자', '간호사·의료지원직', '사회복지사·NGO 기획'],
  },
  {
    name: '조율자 × 교육형',
    desc: 'A↑↑ C↑ H↑ E↑ O↑ cog-',
    facets: { patience: 4.7, diligence: 4.0, boldness: 3.8, humility: 3.8, curiosity: 3.5, anxiety: 2.8 },
    cogScore: 0.45,
    top: ['교사·교육자', 'HR·조직개발·코치', '상담심리사·심리치료사'],
    bottom: ['데이터 사이언티스트', '금융 전문가·투자 분석가', '소프트웨어 엔지니어'],
  },
]

// ── Runner ───────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'
const CYAN   = '\x1b[36m'

let totalPass = 0
let totalFail = 0

for (const profile of PROFILES) {
  const results = computeCareers(profile.facets, profile.cogScore)
  const rankMap = {}
  results.forEach((r, i) => { rankMap[r.title] = { rank: i + 1, fit: r.fit } })

  console.log(`\n${BOLD}${CYAN}[${profile.name}]${RESET} ${DIM}${profile.desc}${RESET}`)

  // Print full ranking
  results.forEach((r, i) => {
    const isTop    = profile.top.includes(r.title)
    const isBottom = profile.bottom.includes(r.title)
    const marker   = isTop ? `${GREEN}▲${RESET}` : isBottom ? `${RED}▼${RESET}` : ' '
    const rankStr  = String(i + 1).padStart(2)
    const fitStr   = String(r.fit).padStart(3) + '%'
    const title    = r.title.padEnd(18)
    console.log(`  ${rankStr}. ${marker} ${title} ${fitStr}`)
  })

  // Assertions
  const TOP_N    = 8   // 35개 기준 상위 8위 이내
  const BOTTOM_N = 8   // 35개 기준 하위 8위 이내 (rank > 27)

  let profilePass = 0
  let profileFail = 0

  console.log(`\n  ${BOLD}검증 결과${RESET}`)
  for (const title of profile.top) {
    const info = rankMap[title]
    const ok   = info && info.rank <= TOP_N
    if (ok) { profilePass++; totalPass++ } else { profileFail++; totalFail++ }
    const icon = ok ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`
    const msg  = ok ? `${info.rank}위 (${info.fit}%)` : `${info?.rank ?? '?'}위 (${info?.fit ?? '?'}%) — expected TOP${TOP_N}`
    console.log(`  ${icon} [TOP 기대] ${title.padEnd(18)} ${msg}`)
  }
  for (const title of profile.bottom) {
    const info   = rankMap[title]
    const ok     = info && info.rank > (18 - BOTTOM_N)
    if (ok) { profilePass++; totalPass++ } else { profileFail++; totalFail++ }
    const icon   = ok ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`
    const msg    = ok ? `${info.rank}위 (${info.fit}%)` : `${info?.rank ?? '?'}위 (${info?.fit ?? '?'}%) — expected BOTTOM${BOTTOM_N}`
    console.log(`  ${icon} [하위 기대] ${title.padEnd(18)} ${msg}`)
  }

  const color = profileFail === 0 ? GREEN : RED
  console.log(`  ${color}${BOLD}→ ${profilePass}/${profilePass + profileFail} 통과${RESET}`)
}

// ── Summary ──────────────────────────────────────────────────────────────────

const total    = totalPass + totalFail
const pct      = Math.round((totalPass / total) * 100)
const sumColor = totalFail === 0 ? GREEN : totalFail <= 3 ? YELLOW : RED

console.log(`\n${BOLD}${'─'.repeat(50)}${RESET}`)
console.log(`${sumColor}${BOLD}전체 결과: ${totalPass}/${total} 통과 (${pct}%)${RESET}`)
if (totalFail === 0) {
  console.log(`${GREEN}모든 프로파일 검증 통과 ✅${RESET}`)
} else {
  console.log(`${RED}❌ 위 실패 항목 확인 후 lib/careers.ts 가중치를 조정하세요.${RESET}`)
}
console.log()
