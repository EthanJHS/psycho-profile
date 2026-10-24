// 리포트 검사 변이 테스트 — 리포트 코드를 일부러 망가뜨린 임시 사본에서 report-golden.ts가 실패를 잡는지 확인한다.
// 원본 파일은 건드리지 않는다: 필요한 폴더만 OS 임시 폴더에 복사(node_modules는 연결만)해 거기서 변이·실행하고 지운다.
// "잡음"은 변이 사본이 정상적으로 로드되고 테스트 수가 원본과 같으며, 기대한 테스트가 실제로 실패한 경우만 센다.
// 실행: node scripts/qa/report-mutation.mjs
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const COPY = ['lib', 'app/api/career', 'app/career/report', 'components/career', 'supabase/migrations', 'scripts/qa']
const RC = 'lib/career/report-content.ts'

// 찾을 문자열에는 줄바꿈을 넣지 않는다 (파일이 CRLF·LF 어느 쪽이어도 맞도록)
// { name, file, edits: [[찾을 문자열, 바꿀 문자열]], expect: 실패해야 하는 테스트 이름 일부 }
const MUTANTS = [
  { name: '취준생 서류 장 빠짐 (1.5단계 회귀 재현)', file: RC, edits: [["chapters.push({ title: '서류: 나를 보여주는 법', blocks: doc })", '']], expect: 'L-1' },
  { name: '문구만 바꾸고 REPORT_VERSION 그대로', file: RC, edits: [['혼자 버티기 어렵다면 전문가와 이야기해 보는 것도 좋은 방법이에요', '혼자 버티기 어렵다면 전문가와 상의해 보세요']], expect: 'REPORT_VERSION' },
  { name: '문구 변경 없이 REPORT_VERSION만 올림', file: RC, edits: [["REPORT_VERSION = 'report-2026-10-24'", "REPORT_VERSION = 'report-2026-10-25'"]], expect: 'REPORT_VERSION' },
  { name: '직장인 "본인은 안 맞다고 느낌" 진단 제거 (L-3 회귀)', file: RC, edits: [["if (hi(d.misfit)) return 'feltMisfit'", '']], expect: 'L-3' },
  { name: '강점 인식(WS12) 응답을 리포트에서 안 씀', file: RC, edits: [['if (lo(st.strengthClarity))', 'if (false && lo(st.strengthClarity))']], expect: '물어본 문항' },
  { name: '화면이 form 블록을 못 그림', file: 'components/career/ReportView.tsx', edits: [["case 'form':", "case 'form-old':"]], expect: '화면이 그릴 수 있는 블록' },
  { name: '열람할 때마다 다시 조립 (저장본 무시)', file: 'app/api/career/[id]/route.ts', edits: [['if (!data.report && data.scores)', 'if (data.scores)']], expect: '발급 리포트 고정' },
]

function run(dir) {
  const r = spawnSync(process.execPath, ['--no-warnings', '--import', './scripts/qa/ts-transpile.mjs', 'scripts/qa/report-golden.ts'], { cwd: dir, encoding: 'utf8' })
  const num = re => { const m = r.stdout.match(re); return m ? Number(m[1]) : null }
  const failed = [...r.stdout.matchAll(/^✖ (.+?)(?: \(\d|$)/gm)].map(m => m[1])
  return { exit: r.status, tests: num(/^ℹ tests (\d+)/m), failed }
}

const dir = mkdtempSync(join(tmpdir(), 'ct-report-mutation-'))
try {
  for (const p of COPY) cpSync(join(ROOT, p), join(dir, p), { recursive: true })
  symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'junction')
  const base = run(dir)
  if (base.exit !== 0 || !base.tests) {
    console.error(`원본 상태에서 report-golden.ts가 통과하지 않음 (테스트 ${base.tests ?? '?'}개, 실패: ${base.failed.join(', ') || '?'}) — 변이 테스트를 할 수 없음`)
    process.exitCode = 1
  } else {
    let killed = 0
    for (const m of MUTANTS) {
      const path = join(dir, m.file)
      const orig = readFileSync(path, 'utf8')
      let src = orig
      const bad = m.edits.find(([from]) => src.split(from).length - 1 !== 1)
      if (bad) { console.log(`⚠ 건너뜀   ${m.name} — 대상 문자열이 ${m.file}에 정확히 한 번 있지 않음 (코드가 바뀌었으면 변이 목록 갱신)`); continue }
      for (const [from, to] of m.edits) src = src.replace(from, to)
      writeFileSync(path, src)
      const r = run(dir)
      writeFileSync(path, orig)
      if (r.tests !== base.tests) console.log(`⚠ 로드 실패 ${m.name} — 테스트 ${r.tests ?? 0}개만 실행됨 (원본 ${base.tests}개)`)
      else if (r.exit !== 0 && r.failed.some(f => f.includes(m.expect))) { killed++; console.log(`✔ 잡음     ${m.name} (실패: ${r.failed.join(' / ')})`) }
      else console.log(`✖ 놓침     ${m.name}${r.failed.length ? ` (다른 테스트만 실패: ${r.failed.join(' / ')})` : ''}`)
    }
    console.log(`\n변이 ${MUTANTS.length}개 중 ${killed}개를 리포트 검사가 잡음 (원본 테스트 ${base.tests}개 기준)`)
    if (killed < MUTANTS.length) process.exitCode = 1
  }
} finally {
  rmSync(dir, { recursive: true, force: true })
}
