-- 2026-10-26 (Supabase 마이그레이션 이름: test_data_marker)
-- 테스트 기기 표시: 관리자 화면에서 "테스트 기기로 표시"를 켠 브라우저의 방문·무료 검사 기록을 통계에서 빼기 위한 칸.
-- 기본값 false라 기존 행과 일반 사용자 저장은 그대로다. 브라우저는 테스트 기기일 때만 is_test: true를 함께 보낸다(lib/analytics.ts).
-- 이벤트는 칸을 추가하지 않고 metadata.is_test로 표시한다.
-- 유료 쪽은 이미 구분된다: 관리자 테스트 주문은 orders.provider = 'admin'.
alter table public.sessions add column if not exists is_test boolean not null default false;
alter table public.test_sessions add column if not exists is_test boolean not null default false;
