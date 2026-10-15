-- 2026-10-15 적용 (Supabase 마이그레이션 이름: orders_free_link)
-- 결제창이 새 창·탭에서 끝나도 이어갈 수 있게, 주문에 무료 결과 코드와 연구 동의 여부를 함께 저장
alter table public.orders
  add column if not exists free_code text,
  add column if not exists research_consent boolean not null default false;
