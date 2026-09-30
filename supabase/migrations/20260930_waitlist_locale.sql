-- 2026-09-30 적용 (Supabase 마이그레이션 이름: waitlist_locale)
-- 사전 알림 신청 언어 — 한국어(진로 리포트) / 영어(원형 심화 리포트) 대기자를 구분
alter table public.waitlist add column if not exists locale text not null default 'ko' check (locale in ('ko', 'en'));
