/**
 * PsychoProfile 검사 타당도 시뮬레이션
 * 실행: node scripts/validate.mjs [N]  (기본 N=1000)
 *
 * 측정 항목:
 *  1. 프로파일 분포 균등성 (엔트로피 / 지니계수)
 *  2. 점수 민감도 — 답 1개 변경 시 결과 변화율
 *  3. 패싯별 문항 내적 일관성 근사 (Cronbach's α proxy)
 *
 * 문항 구조 (questions.ts 기준):
 *  Section 1 — world    : Q1~Q7
 *  Section 2 — decision : Q8~Q15  (Q8=regulatory, Q10=locus → archetype만 사용)
 *  Section 3 — relation : Q16~Q25
 *  Section 4 — cognition: Q26~Q31
 *  Section 5 — essence  : Q32~Q36 (Q32~Q35=drive, Q36=meta)
 */

// ── 패싯 문항 구조 ──────────────────────────────────────────────────
const QUESTIONS = [
  // Section 1
  { id:'Q1',  facet:'boldness',  opts:['A','B','C','D'], scores:{A:5,B:3.5,C:2.2,D:1} },
  { id:'Q2',  facet:'diligence', opts:['A','B','C'],     scores:{A:5,B:3,C:1} },
  { id:'Q3',  facet:'curiosity', opts:['A','B','C'],     scores:{A:5,B:3.2,C:1.5} },
  { id:'Q4',  facet:'patience',  opts:['A','B','C'],     scores:{A:2,B:3.5,C:4.8} },
  { id:'Q5',  facet:'anxiety',   opts:['A','B','C'],     scores:{A:1,B:2.5,C:4.8} },
  { id:'Q6',  facet:'anxiety',   opts:['A','B','C'],     scores:{A:1,B:2.5,C:5} },
  { id:'Q7',  facet:'humility',  opts:['A','B','C'],     scores:{A:5,B:3.5,C:1.5} },
  // Section 2 (Q8=regulatory, Q10=locus → archetype only, not in FACET_MAP)
  { id:'Q9',  facet:'diligence', opts:['A','B','C'],     scores:{A:4.5,B:3,C:1} },
  { id:'Q11', facet:'humility',  opts:['A','B','C'],     scores:{A:2,B:4.8,C:3.2} },
  { id:'Q12', facet:'diligence', opts:['A','B','C'],     scores:{A:2.5,B:4.8,C:3} },
  { id:'Q13', facet:'curiosity', opts:['A','B','C'],     scores:{A:1.5,B:5,C:3} },
  { id:'Q14', facet:'curiosity', opts:['A','B','C'],     scores:{A:1,B:4.5,C:3.5} },
  { id:'Q15', facet:'anxiety',   opts:['A','B','C'],     scores:{A:1,B:2.5,C:5} },
  // Section 3
  { id:'Q16', facet:'patience',  opts:['A','B','C'],     scores:{A:1.5,B:3.5,C:4.8} },
  { id:'Q17', facet:'boldness',  opts:['A','B','C'],     scores:{A:5,B:3,C:1} },
  { id:'Q18', facet:'humility',  opts:['A','B','C'],     scores:{A:1.5,B:5,C:3} },
  { id:'Q19', facet:'patience',  opts:['A','B','C'],     scores:{A:1.5,B:3.5,C:4.8} },
  { id:'Q20', facet:'anxiety',   opts:['A','B','C'],     scores:{A:1,B:5,C:3} },
  { id:'Q21', facet:'curiosity', opts:['A','B','C'],     scores:{A:4.5,B:2.5,C:1} },
  { id:'Q22', facet:'boldness',  opts:['A','B','C'],     scores:{A:5,B:1.5,C:3} },
  { id:'Q23', facet:'boldness',  opts:['A','B','C'],     scores:{A:5,B:3,C:1} },
  { id:'Q24', facet:'humility',  opts:['A','B','C'],     scores:{A:5,B:3.5,C:1.5} },
  { id:'Q25', facet:'patience',  opts:['A','B','C'],     scores:{A:4.5,B:3,C:1.5} },
]

const FACETS = ['curiosity','diligence','boldness','patience','anxiety','humility']

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function randomAnswers() {
  const a = {}
  for (const q of QUESTIONS) a[q.id] = randChoice(q.opts)
  // 특수 문항
  a['Q8']  = randChoice(['A','B'])        // regulatory_focus (binary)
  a['Q10'] = randChoice(['A','B','C'])    // locus_of_control (ternary)
  // cognition (Q26~Q31)
  for (let i = 26; i <= 30; i++) a[`Q${i}`] = randChoice(['A','B','C'])
  a['Q31'] = randChoice(['A','B'])        // cog_style (binary)
  // essence / drive (Q32~Q36)
  a['Q32'] = randChoice(['A','B','C','D'])
  a['Q33'] = randChoice(['A','B','C','D'])
  a['Q34'] = randChoice(['A','B','C','D'])
  a['Q35'] = randChoice(['A','B','C','D'])
  a['Q36'] = randChoice(['A','B','C'])    // meta_cog (not used in drive)
  return a
}

// ── 패싯 점수 계산 ───────────────────────────────────────────────────
function computeFacets(answers) {
  const sums = {}
  for (const f of FACETS) sums[f] = []
  for (const q of QUESTIONS) {
    const v = answers[q.id]
    if (!v) continue
    const s = q.scores[v]
    if (s !== undefined) sums[q.facet].push(s)
  }
  const result = {}
  for (const f of FACETS) {
    const vals = sums[f]
    result[f] = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 3
  }
  return result
}

// ── 원형 결정 ────────────────────────────────────────────────────────
function computeArchetype(facets, reg, loc) {
  const n = v => (v-1)/4
  const O=n(facets.curiosity), C=n(facets.diligence), E=n(facets.boldness)
  const A=n(facets.patience),  N=n(facets.anxiety),   H=n(facets.humility)

  const s = {
    architect:  O*2+C*2.5-E*0.5-N*0.5,
    guardian:   A*2.5+C*1.5-N*1.5-O*0.3,
    explorer:   O*2.5+E*2-C*1,
    prophet:    O*1.5+N*2.5-E*1,
    warrior:    C*2+E*2.5-A*1,
    alchemist:  O*2+A*2-Math.abs(N-0.5)*1,
    sovereign:  E*2.5+C*1.5-H*2,
    sage:       O*2+H*2.5-E*1,
    harmonizer: A*3-Math.abs(E-0.5)*2-N*0.5,
    rebel:      (1-H)*2.5+O*1-A*0.5,
    lover:      A*2+N*1.5-C*0.5,
    catalyst:   E*2.5+O*1-C*0.5,
  }
  if (reg==='A') { s.explorer+=0.4; s.catalyst+=0.4; s.warrior+=0.2 }
  else           { s.guardian+=0.4; s.sage+=0.3; s.architect+=0.3 }
  if (loc==='A') { s.warrior+=0.3; s.architect+=0.2 }
  else if(loc==='B') { s.harmonizer+=0.3; s.lover+=0.2 }
  return Object.entries(s).sort((a,b)=>b[1]-a[1])[0][0]
}

function computeMode(a) {
  let an=0,in_=0,pr=0,ig=0
  if(a.Q26==='A')an+=2; else if(a.Q26==='B')in_+=2; else ig+=2
  if(a.Q27==='A')an+=1.5; else if(a.Q27==='B')ig+=1; else in_+=2
  if(a.Q28==='A')pr+=2.5; else if(a.Q28==='B')an+=1.5; else ig+=2
  if(a.Q29==='A')ig+=2; else if(a.Q29==='B')pr+=3; else { an+=1; in_+=1 }
  if(a.Q30==='A')in_+=2; else if(a.Q30==='B')an+=1.5; else ig+=2
  if(a.Q31==='A')in_+=2; else an+=1.5
  return Object.entries({analytical:an,intuitive:in_,pragmatic:pr,integrative:ig}).sort((a,b)=>b[1]-a[1])[0][0]
}

function computeDrive(a) {
  let ac=0,co=0,au=0,se=0
  if(a.Q32==='A')au+=3; else if(a.Q32==='B')se+=3; else if(a.Q32==='C')ac+=3; else co+=3
  if(a.Q33==='A')ac+=1; else if(a.Q33==='B')au+=1; else if(a.Q33==='C')co+=1; else se+=1
  if(a.Q34==='A')ac+=2; else if(a.Q34==='B')co+=2; else if(a.Q34==='C')au+=2; else se+=2
  if(a.Q35==='A')ac+=2; else if(a.Q35==='B')co+=2; else if(a.Q35==='C')se+=2; else au+=2
  return Object.entries({achievement:ac,connection:co,autonomy:au,security:se}).sort((a,b)=>b[1]-a[1])[0][0]
}

function getProfile(answers) {
  const facets = computeFacets(answers)
  const arch = computeArchetype(facets, answers.Q8??'A', answers.Q10??'C')
  const mode = computeMode(answers)
  const drive = computeDrive(answers)
  return `${arch}__${mode}__${drive}`
}

// ── 분석 실행 ────────────────────────────────────────────────────────
const N = parseInt(process.argv[2] ?? '1000')
console.log(`\n🔬 PsychoProfile 타당도 시뮬레이션  (N=${N})\n${'─'.repeat(52)}`)

const dist = {}
const allProfiles = []
for (let i=0; i<N; i++) {
  const a = randomAnswers()
  const p = getProfile(a)
  dist[p] = (dist[p]??0)+1
  allProfiles.push({a, p})
}

const counts = Object.values(dist).sort((a,b)=>b-a)
const K = counts.length
const entropy = -counts.reduce((s,c)=>{const p=c/N; return s+p*Math.log(p)},0)
const uniformity = (entropy/Math.log(192)*100).toFixed(1)
const topProfile = Object.entries(dist).sort((a,b)=>b[1]-a[1])[0]
const bottomProfile = Object.entries(dist).sort((a,b)=>a[1]-b[1])[0]
const expected = N/192

console.log(`\n📊 1. 프로파일 분포 균등성`)
console.log(`   활성 프로파일 수        : ${K} / 192 (${(K/192*100).toFixed(0)}% 커버)`)
console.log(`   분포 균등성 (엔트로피)  : ${uniformity}%  (100%=완전 균등)`)
console.log(`   가장 많이 나온 유형     : ${topProfile[0]}  (${topProfile[1]}회, ${(topProfile[1]/N*100).toFixed(1)}%)`)
console.log(`   가장 적게 나온 유형     : ${bottomProfile[0]}  (${bottomProfile[1]}회, ${(bottomProfile[1]/N*100).toFixed(1)}%)`)
console.log(`   기대값 대비 최대 편차   : ${((topProfile[1]-expected)/expected*100).toFixed(0)}%`)

// 2. 점수 민감도
let changedCount = 0
const SENSITIVITY_N = Math.min(N, 500)
for (let i=0; i<SENSITIVITY_N; i++) {
  const orig = allProfiles[i]
  const flipQ = QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)]
  const altOpts = flipQ.opts.filter(o=>o!==orig.a[flipQ.id])
  if (!altOpts.length) continue
  const modA = {...orig.a, [flipQ.id]: randChoice(altOpts)}
  if (getProfile(modA) !== orig.p) changedCount++
}
const sensitivity = (changedCount/SENSITIVITY_N*100).toFixed(1)
const stability = (100-parseFloat(sensitivity)).toFixed(1)

console.log(`\n🎯 2. 점수 민감도 (안정성)`)
console.log(`   임의 문항 1개 변경 시 결과 변화율: ${sensitivity}%`)
console.log(`   결과 안정성                      : ${stability}%`)
const stabilityLabel = parseFloat(stability)>=75 ? '✅ 양호' : parseFloat(stability)>=60 ? '⚠️  보통' : '❌ 낮음'
console.log(`   평가                             : ${stabilityLabel}`)

// 3. 패싯별 내적 일관성
console.log(`\n🧠 3. 패싯별 문항 수 & 내적 일관성 근사`)
const alphaValues = []
for (const facet of FACETS) {
  const qs = QUESTIONS.filter(q=>q.facet===facet)
  if (qs.length<2) { console.log(`   ${facet.padEnd(12)}: ${qs.length}개 — 내적 일관성 계산 불가`); continue }
  const scores = allProfiles.slice(0,100).map(({a})=>qs.map(q=>q.scores[a[q.id]]??3))
  const means = qs.map((_,j)=>scores.reduce((s,r)=>s+r[j],0)/scores.length)
  const stds  = qs.map((_,j)=>Math.sqrt(scores.reduce((s,r)=>s+(r[j]-means[j])**2,0)/scores.length)||0.01)
  let cs=0,cc=0
  for(let j=0;j<qs.length;j++) for(let k=j+1;k<qs.length;k++){
    const cov=scores.reduce((s,r)=>s+(r[j]-means[j])*(r[k]-means[k]),0)/scores.length
    cs+=cov/(stds[j]*stds[k]); cc++
  }
  const r=cs/cc
  const alpha=(qs.length*r)/(1+(qs.length-1)*r)
  alphaValues.push(alpha)
  const alphaLabel = alpha>=0.7 ? '✅ 양호' : alpha>=0.5 ? '⚠️  보통' : '❌ 낮음'
  console.log(`   ${facet.padEnd(12)}: ${qs.length}개 문항  α≈${alpha.toFixed(3)}  ${alphaLabel}`)
}

// 4. 종합 권고
const avgAlpha = alphaValues.reduce((a,b)=>a+b,0)/alphaValues.length
console.log(`\n📋 4. 종합 권고`)
console.log(`   평균 내적 일관성 (α) : ${avgAlpha.toFixed(3)}`)
console.log(`   커버된 프로파일 수   : ${K}/192`)
console.log(`   분포 균등성          : ${uniformity}%`)
console.log(`   결과 안정성          : ${stability}%`)
console.log()
if (avgAlpha < 0.6) console.log('   ⚠️  패싯별 문항을 4개 이상으로 늘리면 α 개선 가능')
if (K < 100)        console.log('   ⚠️  일부 프로파일 가중치 재검토 필요 — 편중 발생')
if (parseFloat(stability) < 65) console.log('   ⚠️  가중치 평활화(softmax) 적용 검토')
console.log(`\n${'─'.repeat(52)}\n`)
