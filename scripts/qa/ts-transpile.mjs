// 리포트 검사용 로더 — 확장자 없는 상대 경로를 .ts로 찾고, .ts는 저장소의 typescript로 트랜스파일한다.
// Node 기본 타입 제거는 `import { 타입 }`(type 키워드 없는 타입 import)를 지우지 못해 lib/personalize-result.ts 등에서 멈추기 때문.
// 채점 오라클은 기존 ts-resolve.mjs를 그대로 쓴다 (이 로더는 report-golden.ts 전용).
// 사용: node --import ./scripts/qa/ts-transpile.mjs <스크립트.ts>
import { registerHooks, createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ts = createRequire(import.meta.url)('typescript')

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (relative && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context) } catch { /* .ts가 없으면 원래 경로로 */ }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && url.endsWith('.ts') && !url.includes('node_modules')) {
      const fileName = fileURLToPath(url)
      const { outputText } = ts.transpileModule(readFileSync(fileName, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, fileName,
      })
      return { format: 'module', source: outputText, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
