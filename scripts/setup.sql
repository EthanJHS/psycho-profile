-- PsychoProfile · Supabase 전체 스키마
-- Supabase SQL Editor에서 한 번만 실행

-- ── 1. 방문 세션 ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device      TEXT,           -- 'mobile' | 'tablet' | 'desktop'
  referrer    TEXT,
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT
);

-- ── 2. 이벤트 로그 ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id      TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  test_session_id TEXT,
  event_type      TEXT NOT NULL,  -- test_start | test_complete | result_view | upgrade_click | paid_test_complete
  metadata        JSONB
);

CREATE INDEX IF NOT EXISTS idx_events_type       ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session    ON events(session_id);

-- ── 3. 무료 검사 세션 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_sessions (
  id              TEXT PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  session_id      TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  is_sample       BOOLEAN DEFAULT TRUE,   -- true = 무료, false = 풀버전
  profile_id      TEXT,
  cog_score       NUMERIC(5,4),
  -- HEXACO 주요 패싯 (무료 검사)
  facet_diligence NUMERIC(4,3),
  facet_curiosity NUMERIC(4,3),
  facet_anxiety   NUMERIC(4,3),
  facet_boldness  NUMERIC(4,3),
  facet_humility  NUMERIC(4,3),
  facet_patience  NUMERIC(4,3),
  -- 생활 패턴
  chronotype      TEXT,
  learning_style  TEXT,
  execution_style TEXT
);

CREATE INDEX IF NOT EXISTS idx_test_sessions_completed ON test_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_test_sessions_profile   ON test_sessions(profile_id);

-- ── 4. 문항별 응답 (무료 검사) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_answers (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  test_session_id TEXT REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  answer_value    TEXT,
  time_spent_ms   INTEGER
);

CREATE INDEX IF NOT EXISTS idx_answers_session  ON test_answers(test_session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON test_answers(question_id);

-- ── 5. 유료 검사 결과 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paid_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id       TEXT,
  device           TEXT,
  completion_ms    INTEGER,          -- 검사 소요 시간(ms)

  -- HEXACO 6요인 (1~5)
  hexaco_h         NUMERIC(4,3),
  hexaco_e         NUMERIC(4,3),
  hexaco_x         NUMERIC(4,3),
  hexaco_a         NUMERIC(4,3),
  hexaco_c         NUMERIC(4,3),
  hexaco_o         NUMERIC(4,3),

  -- RIASEC 6유형 원점수 (3~15)
  riasec_r         NUMERIC(4,1),
  riasec_i         NUMERIC(4,1),
  riasec_a         NUMERIC(4,1),
  riasec_s         NUMERIC(4,1),
  riasec_e         NUMERIC(4,1),
  riasec_c         NUMERIC(4,1),
  riasec_top3      CHAR(3),          -- 상위 3 Holland Code (예: "IAE")

  -- 학문 적성
  aptitude_profile TEXT,             -- 이과형/공학형/문과형/경상형/예술형/복합형
  aptitude_scores  JSONB,            -- 8차원 원점수

  -- HEXACO 패턴 키 (예: "HO", "OC")
  pattern_key      CHAR(2),

  -- 24 하위 요인 전체
  subfacets        JSONB
);

CREATE INDEX IF NOT EXISTS idx_paid_session    ON paid_results(session_id);
CREATE INDEX IF NOT EXISTS idx_paid_riasec     ON paid_results(riasec_top3);
CREATE INDEX IF NOT EXISTS idx_paid_aptitude   ON paid_results(aptitude_profile);
CREATE INDEX IF NOT EXISTS idx_paid_pattern    ON paid_results(pattern_key);
CREATE INDEX IF NOT EXISTS idx_paid_created_at ON paid_results(created_at DESC);

-- ── 6. RLS 정책 ────────────────────────────────────────────────────────
ALTER TABLE sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_results  ENABLE ROW LEVEL SECURITY;

-- 익명 사용자: 삽입만 허용
CREATE POLICY "anon_insert_sessions"      ON sessions      FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_events"        ON events        FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_test_sessions" ON test_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_test_sessions" ON test_sessions FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_insert_test_answers"  ON test_answers  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_paid_results"  ON paid_results  FOR INSERT TO anon WITH CHECK (true);

-- 서비스 역할(어드민): 전체 권한
CREATE POLICY "service_all_sessions"      ON sessions      FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_events"        ON events        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_test_sessions" ON test_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_test_answers"  ON test_answers  FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_paid_results"  ON paid_results  FOR ALL TO service_role USING (true);
