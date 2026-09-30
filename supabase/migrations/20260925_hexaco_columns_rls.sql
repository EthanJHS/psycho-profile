-- 2026-09-25 적용 (Supabase migration: hexaco_columns_waitlist_and_rls_hardening)
-- HEXACO 결과 칼럼·waitlist 추가, anon의 test_sessions/sessions 조회·수정 권한 제거.
-- 검사 완료 기록은 아래 두 RPC로만 가능 (자기 검사 ID로, 미완료 행 1개만).

alter table public.test_sessions
  add column if not exists test_version text,
  add column if not exists hexaco_answers jsonb,
  add column if not exists hexaco_h numeric(4,2),
  add column if not exists hexaco_e numeric(4,2),
  add column if not exists hexaco_x numeric(4,2),
  add column if not exists hexaco_a numeric(4,2),
  add column if not exists hexaco_c numeric(4,2),
  add column if not exists hexaco_o numeric(4,2),
  add column if not exists archetype_primary text,
  add column if not exists archetype_secondary text,
  add column if not exists archetype_primary_dist numeric(5,3);
create index if not exists idx_test_sessions_archetype on public.test_sessions(archetype_primary);

create table if not exists public.waitlist (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;

drop policy if exists "anon select own test_sessions" on public.test_sessions;
drop policy if exists "anon update test_sessions" on public.test_sessions;
drop policy if exists "anon select own sessions" on public.sessions;

create or replace function public.complete_hexaco_session(
  p_id uuid, p_version text, p_answers jsonb,
  p_h numeric, p_e numeric, p_x numeric, p_a numeric, p_c numeric, p_o numeric,
  p_primary text, p_secondary text, p_dist numeric
) returns void language sql security definer set search_path = '' as $$
  update public.test_sessions set
    test_version = p_version, hexaco_answers = p_answers,
    hexaco_h = p_h, hexaco_e = p_e, hexaco_x = p_x, hexaco_a = p_a, hexaco_c = p_c, hexaco_o = p_o,
    archetype_primary = p_primary, archetype_secondary = p_secondary, archetype_primary_dist = p_dist,
    completed_at = now()
  where id = p_id and completed_at is null;
$$;

create or replace function public.complete_legacy_session(
  p_id uuid, p_profile_id text, p_cog_score numeric,
  p_diligence numeric, p_curiosity numeric, p_anxiety numeric,
  p_boldness numeric, p_humility numeric, p_patience numeric,
  p_chronotype text, p_learning_style text, p_execution_style text
) returns void language sql security definer set search_path = '' as $$
  update public.test_sessions set
    profile_id = p_profile_id, cog_score = p_cog_score,
    facet_diligence = p_diligence, facet_curiosity = p_curiosity, facet_anxiety = p_anxiety,
    facet_boldness = p_boldness, facet_humility = p_humility, facet_patience = p_patience,
    chronotype = p_chronotype, learning_style = p_learning_style, execution_style = p_execution_style,
    completed_at = now()
  where id = p_id and completed_at is null;
$$;

revoke execute on function public.complete_hexaco_session from public;
revoke execute on function public.complete_legacy_session from public;
grant execute on function public.complete_hexaco_session to anon, authenticated;
grant execute on function public.complete_legacy_session to anon, authenticated;
