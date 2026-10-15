// CORE CAREER 판매 조건 — 가격은 여기서만 정한다 (주문 생성·결제 확인 모두 서버가 이 값을 씀)
import { LIFE_STAGES, type LifeStage, type Plan } from '../paid-v2/items'

export const PRICES: Record<Plan, number> = { find: 9900, do: 9900, both: 14900 }

// 고등학생 버전은 미성년자 결제 문제로 출시에서 제외 (리포트·샘플 코드는 유지)
export const SELLABLE_STAGES: LifeStage[] = ['college', 'jobseeker', 'worker']
export const isSellable = (stage: LifeStage) => SELLABLE_STAGES.includes(stage)

const PLAN_LABEL: Record<Plan, string> = { find: '탐색', do: '향상', both: '탐색+향상 묶음' }
const stageLabel = (stage: LifeStage) => LIFE_STAGES.find(s => s.id === stage)?.label ?? stage

// 결제창·영수증에 보이는 상품명
export const goodName = (stage: LifeStage, plan: Plan) => `CORE CAREER 진로 리포트 (${stageLabel(stage)} · ${PLAN_LABEL[plan]})`

export const formatWon = (n: number) => `${n.toLocaleString('ko-KR')}원`
