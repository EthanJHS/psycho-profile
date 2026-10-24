This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## QA

코드를 고친 뒤에는 아래 세 명령을 차례로 실행합니다. (Node 24 이상, 추가 패키지 없음, DB·네트워크 접근 없음)
`npx tsc --noEmit`과 `npm run qa`는 종료 코드 0이어야 합니다. `npm run lint`는 2026-10-24 기준 기존 오류 19개 때문에 실패하므로, 고친 파일에 새 오류가 없는지 확인합니다.

```bash
npm run lint
npx tsc --noEmit
npm run qa
```

`npm run qa`는 두 단계를 순서대로 실행하고, 앞 단계가 실패하면 거기서 멈춘 채 실패를 반환합니다.

1. `npm run qa:oracle` — 채점 오라클. `scripts/qa/scoring-oracle.ts`(문항 구조·채점·원형 판정·링크 코드의 현재 동작 고정)와 `scripts/qa/known-defects.ts`(고쳐야 할 현재 동작 기록)
2. `npm run qa:mutation` — 변이 테스트. 채점·링크 코드를 일부러 망가뜨린 임시 사본에서 오라클이 실패를 잡는지 확인 (원본 파일은 건드리지 않음)

오라클 정답값은 "현재 동작" 기록입니다. 테스트를 통과시키려고 고치지 않습니다. 자세한 규칙은 `CLAUDE.md`를 봅니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
