-- 리포트 고정 (2026-10-24): 진로 리포트를 발급하는 순간의 완성 본문을 저장하고, 이후 덮어쓰지 못하게 막는다.
-- 열람은 저장본만 읽는다. 문구·규칙이 바뀌어도 이미 발급한 리포트는 그대로다.
-- 기존 데이터는 건드리지 않음 (새 칸 추가만). 고정 이전에 완료된 기록은 첫 열람 때 한 번 저장된다.

alter table public.assessments
  add column if not exists report jsonb,
  add column if not exists report_version text,
  add column if not exists report_built_at timestamptz;

comment on column public.assessments.report is '발급 당시의 완성 리포트 본문 (요약·장·블록). 한 번 저장되면 바뀌지 않음';
comment on column public.assessments.report_version is '본문을 만든 문장 엔진 버전 (lib/career/report-content.ts REPORT_VERSION)';
comment on column public.assessments.report_built_at is '본문을 저장한 시각 (발급일)';

-- 저장된 본문·버전·발급 시각과, 그 근거인 응답·점수를 덮어쓰지 못하게 함.
-- 서버(service_role)는 RLS를 우회하므로, 정책이 아니라 트리거로 막는다. 삭제(개인정보 삭제 요청)는 막지 않음.
create or replace function public.assessments_report_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.report is not null and (
       new.report is distinct from old.report
    or new.report_version is distinct from old.report_version
    or new.report_built_at is distinct from old.report_built_at
    or new.scores is distinct from old.scores
    or new.answers is distinct from old.answers
  ) then
    raise exception 'issued career report is immutable (assessment %)', old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists assessments_report_immutable on public.assessments;
create trigger assessments_report_immutable
  before update on public.assessments
  for each row execute function public.assessments_report_immutable();
