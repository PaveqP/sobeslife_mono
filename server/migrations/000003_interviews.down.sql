DROP INDEX IF EXISTS idx_interview_message_interview_sequence;
DROP INDEX IF EXISTS idx_interview_session_one_in_progress_per_user;
DROP INDEX IF EXISTS idx_interview_session_status_expires_at;
DROP INDEX IF EXISTS idx_interview_session_user_started_at;

DROP TABLE IF EXISTS interview_message;
DROP TABLE IF EXISTS interview_session;

DROP TYPE IF EXISTS interview_message_role;
DROP TYPE IF EXISTS interview_status;
