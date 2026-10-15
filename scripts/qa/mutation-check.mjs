// 변이 테스트 — 채점·링크 코드를 일부러 망가뜨린 사본에서 정상 동작 회귀 오라클을 돌려, 오라클이 실패를 잡는지 확인한다.
// 원본 파일은 건드리지 않는다: 필요한 파일만 OS 임시 폴더에 복사해 거기서 변이·실행하고 지운다.
// "잡음"은 변이된 코드가 정상적으로 로드되고, 테스트 수가 원본과 같으며, 단언이 실제로 실패한 경우만 센다.
// (구문 오류·모듈 로드 실패로 프로세스가 죽은 것은 "로드 실패"로 따로 표시 — 잡은 것으로 치지 않음)
// 실행: npm run qa:mutation
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const FILES = [
  'lib/scoring-hexaco.ts', 'lib/questions-hexaco.ts', 'lib/en/questions-hexaco.ts',
  'lib/hexaco-encoding.ts', 'lib/compare.ts',
  'scripts/qa/scoring-oracle.ts', 'scripts/qa/ts-resolve.mjs',
]
const SCORING = 'lib/scoring-hexaco.ts'
const ENCODING = 'lib/hexaco-encoding.ts'
const COMPARE = 'lib/compare.ts'

// { name, file, edits: [[찾을 문자열, 바꿀 문자열], ...] } — 찾을 문자열은 대상 파일에 정확히 한 번 있어야 한다
const MUTANTS = [
  { name: '역문항 표시 하나 뒤집기 (H5)', file: SCORING, edits: [["{ id: 'H5', factor: 'H', reverse: true  }", "{ id: 'H5', factor: 'H', reverse: false }"]] },
  { name: '문항 요인 변경 (H8 → E)', file: SCORING, edits: [["{ id: 'H8', factor: 'H',", "{ id: 'H8', factor: 'E',"]] },
  { name: '역채점 공식 6-raw → 5-raw', file: SCORING, edits: [['q.reverse ? 6 - raw : raw', 'q.reverse ? 5 - raw : raw']] },
  { name: '요인 평균에서 문항 하나(O8) 제외', file: SCORING, edits: [['raw < 1 || raw > 5) continue', "raw < 1 || raw > 5 || q.id === 'O8') continue"]] },
  { name: '응답 범위 상한 5 → 6', file: SCORING, edits: [['raw > 5) continue', 'raw > 6) continue']] },
  { name: '누락 요인 기본값 3 → 2.5', file: SCORING, edits: [[': 3\n', ': 2.5\n']] },
  { name: '요인 점수 반올림 제거', file: SCORING, edits: [['raw[f] = Math.round(avg * 100) / 100', 'raw[f] = avg']] },
  { name: '높음 기준 3.5 → 3.4', file: SCORING, edits: [['HIGH_THRESHOLD = 3.5', 'HIGH_THRESHOLD = 3.4']] },
  { name: '낮음 기준 2.5 → 2.6', file: SCORING, edits: [['LOW_THRESHOLD = 2.5', 'LOW_THRESHOLD = 2.6']] },
  { name: '중립 요인 가중치 0.25 → 0.3', file: SCORING, edits: [['NEUTRAL_WEIGHT = 0.25', 'NEUTRAL_WEIGHT = 0.3']] },
  { name: '원형 목표점 거리 1.5 → 1.4', file: SCORING, edits: [['3 + 1.5 * Math.sign(req)', '3 + 1.4 * Math.sign(req)']] },
  { name: '원형 프로필 한 칸 변경 (수호자 C 1 → 0.5)', file: SCORING, edits: [["profile: { H:1,  E:0,  X:0,  A:1,  C:1,  O:0  }, note: '원칙", "profile: { H:1,  E:0,  X:0,  A:1,  C:0.5,O:0  }, note: '원칙"]] },
  { name: '원형 거리 정렬 방향 반전', file: SCORING, edits: [['.sort((a, b) => a.dist - b.dist ||', '.sort((a, b) => b.dist - a.dist ||']] },
  { name: '동점 시 조건 수 우선 규칙 제거', file: SCORING, edits: [[' || conditionCount(b.arch) - conditionCount(a.arch)', '']] },
  { name: '1순위 자리에 2순위 원형', file: SCORING, edits: [['primary: ranked[0].arch,', 'primary: ranked[1].arch,']] },
  {
    name: '결과 링크 인코딩 순서 변경 (인코딩·디코딩 함께 — 왕복은 통과, 옛 링크는 깨짐)', file: ENCODING, edits: [
      ['for (const q of QUESTIONS) {', 'for (const q of [...QUESTIONS].reverse()) {'],
      ['out[QUESTIONS[i].id] =', 'out[QUESTIONS[QUESTIONS.length - 1 - i].id] ='],
    ],
  },
  { name: '비교 코드 요인 순서 변경 (H↔E)', file: COMPARE, edits: [["COMPARE_FACTORS: HexacoFactor[] = ['H', 'E',", "COMPARE_FACTORS: HexacoFactor[] = ['E', 'H',"]] },
]

function runOracle(dir) {
  const r = spawnSync(process.execPath, ['--no-warnings', '--import', './scripts/qa/ts-resolve.mjs', 'scripts/qa/scoring-oracle.ts'], { cwd: dir, encoding: 'utf8' })
  const num = re => { const m = r.stdout.match(re); return m ? Number(m[1]) : null }
  return { exit: r.status, tests: num(/^ℹ tests (\d+)/m), failed: num(/^ℹ fail (\d+)/m) }
}

const dir = mkdtempSync(join(tmpdir(), 'ct-mutation-'))
try {
  for (const f of FILES) {
    mkdirSync(dirname(join(dir, f)), { recursive: true })
    copyFileSync(join(ROOT, f), join(dir, f))
  }
  const originals = Object.fromEntries([SCORING, ENCODING, COMPARE].map(f => [f, readFileSync(join(ROOT, f), 'utf8')]))

  const baseline = runOracle(dir)
  if (baseline.exit !== 0 || !baseline.tests) {
    console.error(`원본 상태에서 오라클이 통과하지 않음 (테스트 ${baseline.tests ?? '?'}개, 실패 ${baseline.failed ?? '?'}개) — 변이 테스트를 할 수 없음`)
    process.exitCode = 1
  } else {
    let killed = 0
    for (const m of MUTANTS) {
      let src = originals[m.file]
      const bad = m.edits.find(([from]) => src.split(from).length - 1 !== 1)
      if (bad) {
        console.log(`⚠ 건너뜀   ${m.name} — 대상 문자열이 ${m.file}에 정확히 한 번 있지 않음 (코드가 바뀌었으면 변이 목록 갱신 필요)`)
        continue
      }
      for (const [from, to] of m.edits) src = src.replace(from, to)
      writeFileSync(join(dir, m.file), src)
      const r = runOracle(dir)
      writeFileSync(join(dir, m.file), originals[m.file])

      if (r.tests !== baseline.tests) {
        console.log(`⚠ 로드 실패 ${m.name} — 테스트 ${r.tests ?? 0}개만 실행됨 (원본 ${baseline.tests}개). 변이가 코드를 깨뜨렸을 뿐 단언으로 잡은 것이 아님`)
      } else if (r.exit !== 0 && r.failed > 0) {
        killed++
        console.log(`✔ 잡음     ${m.name} (실패 테스트 ${r.failed}개)`)
      } else {
        console.log(`✖ 놓침     ${m.name}`)
      }
    }
    console.log(`\n변이 ${MUTANTS.length}개 중 ${killed}개를 오라클 단언이 잡음 (원본 테스트 ${baseline.tests}개 기준)`)
    if (killed < MUTANTS.length) process.exitCode = 1
  }
} finally {
  rmSync(dir, { recursive: true, force: true })
}
