-- 유료 검사 결과 저장 테이블
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS paid_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- HEXACO 6요인 평균 점수 (1~5)
  hexaco_h        NUMERIC(4,3),  -- 겸손·윤리
  hexaco_e        NUMERIC(4,3),  -- 감수성
  hexaco_x        NUMERIC(4,3),  -- 사회적 대담성
  hexaco_a        NUMERIC(4,3),  -- 원만성
  hexaco_c        NUMERIC(4,3),  -- 성실성
  hexaco_o        NUMERIC(4,3),  -- 개방성

  -- RIASEC 상위 3 Holland Code (예: "IAE")
  riasec_top3     CHAR(3),

  -- 학문 적성 프로파일 (이과형/공학형/문과형/경상형/예술형/복합형)
  aptitude_profile TEXT,

  -- 24 하위 요인 전체 (JSONB)
  subfacets       JSONB
);

-- 집계용 인덱스
CREATE INDEX IF NOT EXISTS idx_paid_results_session ON paid_results(session_id);
CREATE INDEX IF NOT EXISTS idx_paid_results_riasec  ON paid_results(riasec_top3);
CREATE INDEX IF NOT EXISTS idx_paid_results_apt     ON paid_results(aptitude_profile);

-- RLS: 본인 세션만 읽기 (서비스 키는 전체 읽기)
ALTER TABLE paid_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON paid_results
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "service_all" ON paid_results
  FOR ALL TO service_role USING (true);
