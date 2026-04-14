ALTER TABLE IF EXISTS interview_session
    ADD COLUMN IF NOT EXISTS candidate_specialization TEXT;

ALTER TABLE IF EXISTS interview_session
    ADD COLUMN IF NOT EXISTS interview_plan JSONB NOT NULL DEFAULT '{}'::jsonb;
