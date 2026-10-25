// 유료 리포트 회귀 검사 — 리포트 조립(lib/career/report-content.ts)의 현재 동작을 고정한다. DB·네트워크 없음.
// 실행: node --no-warnings --import ./scripts/qa/ts-transpile.mjs scripts/qa/report-golden.ts
// 골든 갱신(문구를 의도적으로 바꾸고 REPORT_VERSION을 올린 뒤에만): QA_UPDATE_GOLDEN=1 을 붙여 실행
//
// 왜 필요한가 (2026-10-24 리포트 무결성 감사)
// - 발급된 리포트는 DB에 저장본으로 고정된다(report·report_version). 문구를 바꾸면 REPORT_VERSION을 올려야
//   "어느 버전 문장으로 발급됐는지"가 맞게 남는다 → 문장이 바뀌었는데 버전이 그대로면 실패
// - 1.5단계 수정에서 취준생 "서류" 장이 한 줄 삭제로 통째로 빠졌는데 tsc·채점 오라클은 통과했다 → 장 구조·모순 사례를 직접 단언
// - 묻기만 하고 리포트에 쓰지 않는 문항이 새로 생기지 않게 → 문항 하나만 바꿔 리포트가 달라지는지 확인
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { QUESTIONS, scoreHexaco } from '../../lib/scoring-hexaco'
import { personalizeResult, isLowSignal } from '../../lib/personalize-result'
import { PERSONALIZE_KO } from '../../lib/personalize-text-ko'
import { PERSONALIZE_EN } from '../../lib/en/personalize-text'
import { encodeHexacoAnswers } from '../../lib/hexaco-encoding'
import { buildScreens } from '../../lib/career/flow'
import { computeScores } from '../../lib/career/compute'
import { sanitizeAnswers } from '../../lib/career/server'
import { buildCareerReport, REPORT_VERSION, type Block, type CareerReport } from '../../lib/career/report-content'
import { VALUE_CARDS, INTEREST_ITEMS } from '../../lib/paid-v2/items'

type Stage = 'high' | 'college' | 'jobseeker' | 'worker'
type Plan = 'find' | 'do' | 'both'
type Ans = Record<string, unknown>
const STAGES: Stage[] = ['high', 'college', 'jobseeker', 'worker']
const PLANS: Plan[] = ['find', 'do', 'both']
const ROOT = new URL('../../', import.meta.url)
const GOLDEN = new URL('./report-golden.json', import.meta.url)

function seeded(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 }
}
const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)]

// 화면 구성에서 문항·선택지를 읽음 (문항이 바뀌어도 테스트 코드는 그대로)
type Key = { key: string; values: unknown[] }
function keysFor(stage: Stage, plan: Plan): Key[] {
  const ks: Key[] = []
  for (const s of buildScreens(stage, plan)) {
    if (s.kind === 'scale') ks.push({ key: s.id, values: s.scale.map((_: string, i: number) => i + 1) })
    else if (s.kind === 'cards') for (const v of VALUE_CARDS) ks.push({ key: `${s.keyPrefix}${v.id}`, values: [1, 2, 3, 4, 5] })
    else ks.push({ key: s.item.id, values: [...s.item.options.map((o: string) => (s.item.maxSelect ? [o] : o)), ...(s.item.optional ? [undefined] : [])] })
  }
  return ks
}
// 기준 응답: 척도·카드 3, 선택형 첫 선택지
const baseAnswers = (stage: Stage, plan: Plan): Ans => Object.fromEntries(keysFor(stage, plan).map(k => [k.key, k.values.find(v => v !== undefined && v !== 1 && v !== 2) ?? k.values[0]]))
const randomAnswers = (stage: Stage, plan: Plan, r: () => number): Ans => Object.fromEntries(keysFor(stage, plan).map(k => [k.key, pick(r, k.values.filter(v => v !== undefined))]))
const freeAll = (v: number) => encodeHexacoAnswers(Object.fromEntries(QUESTIONS.map(q => [q.id, v]))) as string
const freeRandom = (r: () => number) => encodeHexacoAnswers(Object.fromEntries(QUESTIONS.map(q => [q.id, 1 + Math.floor(r() * 5)]))) as string

function report(stage: Stage, plan: Plan, answers: Ans, free: string) {
  const clean = sanitizeAnswers(stage, plan, Object.fromEntries(Object.entries(answers).filter(([, v]) => v !== undefined)))
  assert.ok(clean, `${stage}/${plan} 응답이 서버 검증을 통과하지 못함`)
  const s = computeScores(stage, plan, clean, free)
  assert.ok(s, `${stage}/${plan} 무료 결과 코드 해독 실패`)
  // DB에 저장됐다 다시 읽는 것과 같게 JSON 왕복
  const stored = JSON.parse(JSON.stringify(s))
  return { s: stored, rep: buildCareerReport(stored, stored.archetype.name) }
}
// 블록 종류마다 필드가 달라서, 글자가 들어 있는 필드를 이름으로 모은다
type Loose = Record<string, unknown>
const strs = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strs) : [])
const blockText = (b: Block): string[] => {
  const o = b as unknown as Loose
  const items = Array.isArray(o.items) ? (o.items as unknown[]).flatMap(x => (typeof x === 'string' ? [x] : ['when', 'what', 'label', 'name', 'desc', 'why', 'caution'].flatMap(k => strs((x as Loose)[k])))) : []
  return [...strs(o.title), ...strs(o.text), ...strs(o.note), ...strs(o.fields), ...items]
}
const plain = (rep: CareerReport): string => [rep.summary, ...rep.chapters.flatMap(c => [c.title, c.sub ?? '', ...c.blocks.flatMap(blockText)])].join('\n')
const textOnly = (rep: CareerReport) => JSON.stringify({ ...rep, chapters: rep.chapters.map(c => ({ ...c, blocks: c.blocks.filter(b => b.type !== 'bars') })) })

// 골든·안정성에 쓰는 가상 인물: 조합마다 기준 응답 1 + 흥미 일자응답 1(탐색) + 무작위 8 — 시드 고정
function personas(stage: Stage, plan: Plan) {
  const r = seeded(STAGES.indexOf(stage) * 10 + PLANS.indexOf(plan) + 20261024)
  const list: { answers: Ans; free: string }[] = [{ answers: baseAnswers(stage, plan), free: freeAll(3) }]
  if (plan !== 'do') list.push({ answers: { ...baseAnswers(stage, plan), ...Object.fromEntries(INTEREST_ITEMS.map(i => [i.id, 4])) }, free: freeAll(4) })
  for (let i = 0; i < 8; i++) list.push({ answers: randomAnswers(stage, plan, r), free: freeRandom(r) })
  return list
}

// ── 1. 안정성 ───────────────────────────────────────────────────────────────
test('12조합 가상 인물 리포트: 오류 없이 만들어지고, undefined·NaN 문자열이 없고, 화면이 그릴 수 있는 블록만 씀', () => {
  // components/career/ReportView.tsx가 처리하는 블록 종류 (case '...')
  const view = readFileSync(new URL('components/career/ReportView.tsx', ROOT), 'utf8')
  const rendered = new Set([...view.matchAll(/case '([a-z]+)'/g)].map(m => m[1]))
  for (const stage of STAGES) for (const plan of PLANS) for (const p of personas(stage, plan)) {
    const { rep } = report(stage, plan, p.answers, p.free)
    assert.ok(rep.chapters.length > 0, `${stage}/${plan} 장 없음`)
    assert.doesNotMatch(plain(rep), /undefined|NaN/, `${stage}/${plan} 깨진 문자열`)
    for (const c of rep.chapters) for (const b of c.blocks) assert.ok(rendered.has(b.type), `${stage}/${plan} "${c.title}"의 블록 ${b.type}을 ReportView가 그리지 않음`)
  }
})

test('같은 저장 점수로 두 번 만들면 같은 리포트 (결정성)', () => {
  for (const stage of STAGES) for (const plan of PLANS) for (const p of personas(stage, plan).slice(0, 3)) {
    const a = report(stage, plan, p.answers, p.free).rep
    const b = report(stage, plan, p.answers, p.free).rep
    assert.deepEqual(a, b, `${stage}/${plan}`)
  }
})

// ── 2. 문장 엔진 버전 ↔ 골든 ─────────────────────────────────────────────────
test('리포트 문장이 바뀌면 REPORT_VERSION도 바뀌어야 함 (골든 해시)', () => {
  const hashes: Record<string, string> = {}
  for (const stage of STAGES) for (const plan of PLANS) {
    const h = createHash('sha256')
    for (const p of personas(stage, plan)) h.update(JSON.stringify(report(stage, plan, p.answers, p.free).rep))
    hashes[`${stage}/${plan}`] = h.digest('hex').slice(0, 16)
  }
  if (process.env.QA_UPDATE_GOLDEN === '1') {
    writeFileSync(GOLDEN, JSON.stringify({ reportVersion: REPORT_VERSION, note: '리포트 문장 골든 해시 — scripts/qa/report-golden.ts. 문구를 바꿨으면 REPORT_VERSION을 올린 뒤 QA_UPDATE_GOLDEN=1로 갱신', hashes }, null, 2) + '\n')
    console.log(`골든 갱신: ${REPORT_VERSION}`)
    return
  }
  assert.ok(existsSync(GOLDEN), 'scripts/qa/report-golden.json 없음 — QA_UPDATE_GOLDEN=1로 처음 한 번 만든다')
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf8')) as { reportVersion: string; hashes: Record<string, string> }
  const changed = Object.keys(hashes).filter(k => hashes[k] !== golden.hashes[k])
  if (golden.reportVersion === REPORT_VERSION) {
    assert.deepEqual(changed, [], `리포트 문장이 바뀌었는데 REPORT_VERSION(${REPORT_VERSION})이 그대로예요. lib/career/report-content.ts의 REPORT_VERSION을 올린 뒤 QA_UPDATE_GOLDEN=1로 골든을 갱신하세요. 바뀐 조합: ${changed.join(', ')}`)
  } else {
    assert.fail(`REPORT_VERSION이 ${golden.reportVersion} → ${REPORT_VERSION}로 바뀌었어요. 의도한 변경이면 QA_UPDATE_GOLDEN=1로 골든을 갱신하세요. (문장이 바뀐 조합: ${changed.join(', ') || '없음 — 문장 변화 없이 버전만 올렸는지 확인'})`)
  }
})

// ── 3. 리포트 고정 구조 (정적 확인) ─────────────────────────────────────────
test('발급 리포트 고정: 완료 시 본문·버전 저장, 열람은 저장본 우선, DB 트리거 존재', () => {
  const src = (p: string) => readFileSync(new URL(p, ROOT), 'utf8')
  const complete = src('app/api/career/[id]/complete/route.ts')
  assert.match(complete, /report_version:\s*REPORT_VERSION/, '완료 시 report_version 저장')
  assert.match(complete, /buildCareerReport\(/, '완료 시 본문 생성')
  const get = src('app/api/career/[id]/route.ts')
  assert.match(get, /select\([^)]*report[^)]*\)/, '조회 시 저장본(report) 읽기')
  assert.match(get, /if \(!data\.report/, '저장본이 없을 때만 다시 조립')
  assert.match(src('app/career/report/[id]/page.tsx'), /d\.report \?\?/, '화면은 저장본 우선')
  assert.match(src('supabase/migrations/20261024_assessments_report_snapshot.sql'), /create trigger assessments_report_immutable/, '덮어쓰기 방지 트리거')
})

// ── 4. 감사에서 찾은 모순이 다시 생기지 않음 (2026-10-24 L-1~L-5, V-1) ──────────
const t = (stage: Stage, plan: Plan, over: Ans, free = freeAll(3)) => plain(report(stage, plan, { ...baseAnswers(stage, plan), ...over }, free).rep)
const titles = (stage: Stage, plan: Plan) => report(stage, plan, baseAnswers(stage, plan), freeAll(4)).rep.chapters.map(c => c.title)

test('L-1 취준생 향상·묶음: "서류" 장이 있고 면접 장보다 앞', () => {
  for (const plan of ['do', 'both'] as Plan[]) {
    const ts = titles('jobseeker', plan)
    const doc = ts.findIndex(x => x.startsWith('서류')), iv = ts.findIndex(x => x.startsWith('면접'))
    assert.ok(doc >= 0, `jobseeker/${plan} 서류 장 없음: ${ts.join(' | ')}`)
    assert.ok(iv < 0 || doc < iv, `jobseeker/${plan} 서류 장이 면접 장 뒤`)
  }
})

test('L-2 흥미 18문항을 전부 4·5점으로 답하면 "끌리는 유형 없음"으로 쓰지 않음', () => {
  for (const v of [4, 5]) {
    const txt = t('jobseeker', 'find', Object.fromEntries(INTEREST_ITEMS.map(i => [i.id, v])))
    assert.doesNotMatch(txt, /올라온 활동 유형(이|은) (아직 )?없|끌린다고 답한 활동 유형이 없|이상으로 뚜렷하게 답한 활동 유형이 아직 없/, `흥미 전부 ${v}점`)
  }
})

test('L-3 직장인: "지금 직무가 맞지 않는다" 5점이면 "크게 어긋나 있지 않다"로 진단하지 않음 (지금 직무 순위가 높아도)', () => {
  const txt = t('worker', 'find', { WF1: 5, currentJob: '백엔드 개발자', II1: 5, II2: 5, II3: 5 })
  assert.ok(!txt.includes('지금 자리가 크게 어긋나 있지는 않아요'))
})

test('L-4 직장인: 지금 직무가 "기타"(점수 없음)면 직무-흥미 적합을 단정하지 않음', () => {
  assert.ok(!t('worker', 'find', { currentJob: '기타' }).includes('흥미·가치와 크게 부딪히지 않아요'))
})

test('L-5 직장인 묶음: 초점이 "회복 먼저"면 같은 리포트에 전환 준비 행동이 없음', () => {
  const txt = t('worker', 'both', { WD1: 5, WD2: 5, WF1: 5, WF2: 3, currentJob: '재무·회계', IA1: 5, IA2: 5, IA3: 5, IC1: 1, IC2: 1, IC3: 1 })
  assert.ok(txt.includes('회복 먼저'), '이 입력은 회복 초점이어야 함 (전제 확인)')
  assert.doesNotMatch(txt, /사이드 프로젝트나 사내 겸직|추천 직무 중 지금 경력과 가장 가까운/)
})

test('V-1 중간 점수(외향성·원만성 3.0)를 성향으로 단정하지 않음', () => {
  assert.ok(!t('jobseeker', 'do', {}).includes('차분한 인상을 주는 편'), '취준생 면접')
  assert.ok(!t('worker', 'do', { track: '팀을 이끄는 관리자' }).includes('소모가 클 수 있어요'), '직장인 관리자 트랙')
})

// 주간 제품 검토 2026-10-25 Q02: 추천을 보류했으면 지원 직무군 안내에서 순위를 말하지 않음
test('추천 보류인 취준생 묶음: 지원 직무군 안내에 "N위"·"상위 5개" 같은 순위 문장이 없음', () => {
  for (const v of [3, 5]) {
    const rep = report('jobseeker', 'both', { ...baseAnswers('jobseeker', 'both'), ...Object.fromEntries(INTEREST_ITEMS.map(i => [i.id, v])), targetGroup: ['개발'] }, freeAll(3)).rep
    assert.ok(rep.chapters.some(c => c.title.includes('보류')), `흥미 전부 ${v}점: 추천 보류여야 함 (전제 확인)`)
    const boxes = rep.chapters.flatMap(c => c.blocks).filter(b => b.type === 'callout' && (b.title ?? '').startsWith('지원하려는 직무군'))
    for (const b of boxes) assert.doesNotMatch(blockText(b).join(' '), /\d+위|상위 5개/, `흥미 전부 ${v}점: 직무군 안내`)
  }
})

// 주간 제품 검토 2026-10-25: 여섯 요인이 모두 중간인 무료 결과는 능력·모집단 비교 표현을 쓰지 않음
test('무료 결과 — 여섯 요인 모두 중간(lowSignal)이면 요인 한 줄 해석에 "평균·균형 있게·유연하게·조율" 같은 표현이 없음', () => {
  const r = scoreHexaco(Object.fromEntries(QUESTIONS.map(q => [q.id, 3])))
  assert.ok(isLowSignal(r), '전부 3점은 lowSignal (전제 확인)')
  const ko = Object.values(personalizeResult(r, PERSONALIZE_KO).factorLines).join(' ')
  assert.doesNotMatch(ko, /평균|균형 있게|유연하게|조율/, '한국어')
  const en = Object.values(personalizeResult(r, PERSONALIZE_EN).factorLines).join(' ')
  assert.doesNotMatch(en, /average|balanced|flexib|adapt/i, '영어')
})

// ── 5. 물어본 문항은 리포트에 영향 ───────────────────────────────────────────
// "영향" = 막대 숫자가 아니라 문장이 달라지는 것 (감사의 "실질적 영향" 기준)
// 2026-10-24 기준 영향 0으로 확인된 문항 — 줄이는 것이 목표. 새 문항이 여기 없이 영향 0이면 실패
const KNOWN_UNUSED = new Set([
  'high/find:grade', 'high/do:grade', 'high/both:grade',
  'college/find:major', 'college/find:year', 'college/do:major', 'college/do:year', 'college/both:major', 'college/both:year',
  'jobseeker/find:major', 'jobseeker/find:prepPeriod', 'jobseeker/find:orgType', 'jobseeker/do:major', 'jobseeker/do:prepPeriod',
  'jobseeker/both:major', 'jobseeker/both:prepPeriod', 'jobseeker/both:orgType',
  'worker/find:years', 'worker/find:WF4', 'worker/do:currentJob', 'worker/do:years', 'worker/both:years', 'worker/both:WF4',
])
test('물어본 문항은 리포트 문장에 영향 — 알려진 미사용 문항 목록 밖에서 새로 생기면 실패', () => {
  const unused: string[] = []
  for (const stage of STAGES) for (const plan of PLANS) {
    const ks = keysFor(stage, plan)
    const r = seeded(STAGES.indexOf(stage) * 10 + PLANS.indexOf(plan) + 100)
    const effect: Record<string, boolean> = {}
    for (let b = 0; b < 40; b++) {
      const base = randomAnswers(stage, plan, r), free = freeRandom(r)
      const baseJson = textOnly(report(stage, plan, base, free).rep)
      for (const k of ks) {
        if (effect[k.key]) continue
        for (const v of k.values) {
          if (JSON.stringify(v) === JSON.stringify(base[k.key])) continue
          if (textOnly(report(stage, plan, { ...base, [k.key]: v }, free).rep) !== baseJson) { effect[k.key] = true; break }
        }
      }
    }
    for (const k of ks) if (!effect[k.key]) unused.push(`${stage}/${plan}:${k.key}`)
  }
  const fresh = unused.filter(x => !KNOWN_UNUSED.has(x))
  const nowUsed = [...KNOWN_UNUSED].filter(x => !unused.includes(x))
  if (nowUsed.length) console.log(`참고: 이제 리포트에 쓰이는 문항 (KNOWN_UNUSED에서 빼도 됨): ${nowUsed.join(', ')}`)
  assert.deepEqual(fresh, [], `묻지만 리포트에 영향이 없는 문항이 새로 생김: ${fresh.join(', ')}`)
})
