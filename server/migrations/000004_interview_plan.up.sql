ALTER TABLE interview_session
    ADD COLUMN candidate_specialization TEXT,
    ADD COLUMN interview_plan JSONB NOT NULL DEFAULT '{}'::jsonb;
