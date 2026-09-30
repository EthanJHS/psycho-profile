-- 2026-09-30 적용 (Supabase 마이그레이션 이름: server_side_career_and_hexaco_feedback)

-- 진로 검사: 생성·채점을 서버(service role)로 옮김 → 익명 쓰기 경로 제거
drop policy if exists anon_insert on public.assessments;
drop function if exists public.complete_assessment(uuid, jsonb, jsonb);

-- 구버전(42문항·영문·구 유료) 검사: 페이지 삭제 → 더 이상 쓰지 않는 익명 쓰기 경로 제거 (기존 데이터는 보관)
drop function if exists public.complete_legacy_session(uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, text, text, text);
drop policy if exists "anon insert test_answers" on public.test_answers;
drop policy if exists "anon insert paid_answers" on public.paid_answers;
drop policy if exists "anon insert paid_results" on public.paid_results;

-- 만족도 설문: 무료 검사 1회당 1건, 서버 API로만 저장
alter table public.survey_responses
  add column if not exists test_session_id uuid references public.test_sessions(id) on delete set null,
  add column if not exists archetype text,
  add column if not exists test_version text,
  add column if not exists updated_at timestamptz;
alter table public.survey_responses add constraint survey_responses_test_session_id_key unique (test_session_id);
drop policy if exists "allow insert" on public.survey_responses;
