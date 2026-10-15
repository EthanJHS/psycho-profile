// Node로 lib/*.ts를 직접 실행할 때 확장자 없는 상대 경로('./scoring-hexaco')를 .ts 파일로 찾아주는 로더.
// 앱 코드는 Next 번들러 규칙(확장자 생략)을 그대로 두고, QA 스크립트 실행에만 쓴다.
// 사용: node --import ./scripts/qa/ts-resolve.mjs <스크립트.ts>  (Node 24 이상)
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (relative && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context) } catch { /* .ts가 없으면 원래 경로로 */ }
    }
    return nextResolve(specifier, context)
  },
})
