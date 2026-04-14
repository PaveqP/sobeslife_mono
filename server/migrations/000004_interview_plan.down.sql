ALTER TABLE interview_session
    DROP COLUMN IF EXISTS interview_plan,
    DROP COLUMN IF EXISTS candidate_specialization;
