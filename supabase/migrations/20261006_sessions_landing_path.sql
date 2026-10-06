-- 2026-10-06 적용 (Supabase 마이그레이션 이름: sessions_landing_path)
-- 방문이 처음 도착한 페이지 — 광고·공유 링크가 어디로 들어와 얼마나 검사로 이어지는지 보기 위해
alter table public.sessions add column if not exists landing_path text;
