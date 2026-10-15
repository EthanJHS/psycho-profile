-- 2026-10-15 적용 (Supabase 마이그레이션 이름: orders_payapp)
-- 결제(페이앱) 연동: 주문 → 결제 알림으로 확정 → 주문 하나당 진로 검사 하나
alter table public.orders
  add column if not exists stage text,
  add column if not exists refund_ack_at timestamptz,          -- 결제 전 "리포트가 만들어지면 단순 변심 환불 불가" 확인 시각
  add column if not exists provider_state integer,             -- 페이앱 pay_state (1 요청, 4 완료, 8·32 요청취소, 9·64 승인취소, 10 대기, 70·71 부분취소)
  add column if not exists cancelled_at timestamptz,
  add column if not exists updated_at timestamptz;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending', 'waiting', 'paid', 'cancelled', 'refunded', 'partially_refunded'));
create unique index if not exists orders_provider_ref_key on public.orders (provider, provider_ref) where provider_ref is not null;
create unique index if not exists orders_assessment_id_key on public.orders (assessment_id) where assessment_id is not null;

alter table public.assessments
  add column if not exists order_id uuid references public.orders(id),
  add column if not exists first_viewed_at timestamptz;          -- 리포트 첫 열람 (환불 가능 여부 판단 근거)
create unique index if not exists assessments_order_id_key on public.assessments (order_id) where order_id is not null;
