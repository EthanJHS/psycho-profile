-- HEXACO 검사 결과 컬럼 추가
-- 기존 무료 검사(Big Five 기반) 컬럼은 유지

ALTER TABLE test_sessions
  ADD COLUMN IF NOT EXISTS test_version      TEXT DEFAULT 'bigfive',
  ADD COLUMN IF NOT EXISTS hexaco_h          NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS hexaco_e          NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS hexaco_x          NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS hexaco_a          NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS hexaco_c          NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS hexaco_o          NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS archetype_primary      TEXT,
  ADD COLUMN IF NOT EXISTS archetype_secondary    TEXT,
  ADD COLUMN IF NOT EXISTS archetype_primary_dist NUMERIC(4,2);

-- 나중에 추가할 선택 컬럼 (현재 미사용)
-- ADD COLUMN IF NOT EXISTS gender       TEXT,       -- 'M' | 'F' | 'O'
-- ADD COLUMN IF NOT EXISTS birth_year   SMALLINT,
-- ADD COLUMN IF NOT EXISTS archetype_conf NUMERIC(4,2); -- 매칭 신뢰도 (1 - dist/max_dist)

COMMENT ON COLUMN test_sessions.test_version      IS 'bigfive(기존) | hexaco(신규)';
COMMENT ON COLUMN test_sessions.hexaco_h          IS 'H 요인 평균 (1–5)';
COMMENT ON COLUMN test_sessions.hexaco_e          IS 'E 요인 평균 (1–5)';
COMMENT ON COLUMN test_sessions.hexaco_x          IS 'X 요인 평균 (1–5)';
COMMENT ON COLUMN test_sessions.hexaco_a          IS 'A 요인 평균 (1–5)';
COMMENT ON COLUMN test_sessions.hexaco_c          IS 'C 요인 평균 (1–5)';
COMMENT ON COLUMN test_sessions.hexaco_o          IS 'O 요인 평균 (1–5)';
COMMENT ON COLUMN test_sessions.archetype_primary      IS '1순위 원형 id';
COMMENT ON COLUMN test_sessions.archetype_secondary    IS '2순위 원형 id';
COMMENT ON COLUMN test_sessions.archetype_primary_dist IS '1순위 원형 매칭 거리 (낮을수록 유사)';
