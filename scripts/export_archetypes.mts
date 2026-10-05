// 공유 이미지 생성용 — 원형 문구(한국어·영어)를 JSON으로 내보냄. 사용법은 generate_share_images.py 참고
import { writeFileSync } from 'node:fs'
import { ARCHETYPE_DETAILS } from '../lib/archetypes-hexaco'
import { ARCHETYPE_DETAILS_EN } from '../lib/en/archetypes-hexaco'

const out = Object.keys(ARCHETYPE_DETAILS).map(id => ({ id, ko: ARCHETYPE_DETAILS[id], en: ARCHETYPE_DETAILS_EN[id] }))
writeFileSync(process.argv[2], JSON.stringify(out, null, 1), 'utf8')
console.log(`${out.length} archetypes -> ${process.argv[2]}`)
