CREATE TYPE interview_status AS ENUM ('in_progress', 'completed', 'summary_failed');

CREATE TYPE interview_message_role AS ENUM ('assistant', 'user');

CREATE TABLE interview_session (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    profession_id INT NOT NULL REFERENCES profession (id) ON DELETE RESTRICT,
    interview_level expertise_level NOT NULL,
    status interview_status NOT NULL DEFAULT 'in_progress',
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    profile_snapshot JSONB NOT NULL,
    prompt_version VARCHAR(100),
    llm_provider VARCHAR(100),
    llm_model VARCHAR(200),
    verdict_passed BOOLEAN,
    summary TEXT,
    strengths JSONB,
    weaknesses JSONB,
    recommendations JSONB,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (expires_at > started_at)
);

CREATE TABLE interview_message (
    id SERIAL PRIMARY KEY,
    interview_id INT NOT NULL REFERENCES interview_session (id) ON DELETE CASCADE,
    sequence_no INT NOT NULL CHECK (sequence_no > 0),
    role interview_message_role NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (interview_id, sequence_no)
);

CREATE INDEX idx_interview_session_user_started_at
    ON interview_session (user_id, started_at DESC);

CREATE INDEX idx_interview_session_status_expires_at
    ON interview_session (status, expires_at);

CREATE UNIQUE INDEX idx_interview_session_one_in_progress_per_user
    ON interview_session (user_id)
    WHERE status = 'in_progress';

CREATE INDEX idx_interview_message_interview_sequence
    ON interview_message (interview_id, sequence_no);
