package repository

import (
	"database/sql"
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
)

type InterviewsRepository struct {
	db *sqlx.DB
}

func newInterviewsRepository(db *sqlx.DB) *InterviewsRepository {
	return &InterviewsRepository{db}
}

func (r *InterviewsRepository) GetActiveByUser(userID string) (*utils.InterviewSession, error) {
	return r.getSessionByQuery(`SELECT
		id,
		user_id,
		profession_id,
		interview_level,
		status,
		duration_minutes,
		candidate_specialization,
		profile_snapshot,
		interview_plan,
		prompt_version,
		llm_provider,
		llm_model,
		verdict_passed,
		summary,
		strengths,
		weaknesses,
		recommendations,
		started_at,
		expires_at,
		finished_at,
		created_at,
		updated_at
	FROM interview_session
	WHERE user_id = $1 AND status = $2
	ORDER BY started_at DESC
	LIMIT 1`, userID, utils.InterviewInProgress)
}

func (r *InterviewsRepository) GetByID(userID string, interviewID string) (*utils.InterviewSession, error) {
	return r.getSessionByQuery(`SELECT
		id,
		user_id,
		profession_id,
		interview_level,
		status,
		duration_minutes,
		candidate_specialization,
		profile_snapshot,
		interview_plan,
		prompt_version,
		llm_provider,
		llm_model,
		verdict_passed,
		summary,
		strengths,
		weaknesses,
		recommendations,
		started_at,
		expires_at,
		finished_at,
		created_at,
		updated_at
	FROM interview_session
	WHERE id = $1 AND user_id = $2
	LIMIT 1`, interviewID, userID)
}

func (r *InterviewsRepository) ListExpiredByUser(userID string, currentTime string) ([]utils.InterviewSession, error) {
	query := `SELECT
		id,
		user_id,
		profession_id,
		interview_level,
		status,
		duration_minutes,
		candidate_specialization,
		profile_snapshot,
		interview_plan,
		prompt_version,
		llm_provider,
		llm_model,
		verdict_passed,
		summary,
		strengths,
		weaknesses,
		recommendations,
		started_at,
		expires_at,
		finished_at,
		created_at,
		updated_at
	FROM interview_session
	WHERE user_id = $1 AND status = $2 AND expires_at <= $3
	ORDER BY expires_at ASC`

	var interviews []utils.InterviewSession
	if err := r.db.Select(&interviews, query, userID, utils.InterviewInProgress, currentTime); err != nil {
		return nil, err
	}

	return interviews, nil
}

func (r *InterviewsRepository) GetUserProfile(userID string) (*utils.InterviewUserProfile, error) {
	query := `SELECT
		u.id AS user_id,
		u.nickname,
		u.profession_id,
		p.name AS profession,
		u.expertise_level
	FROM users u
	LEFT JOIN profession p ON p.id = u.profession_id
	WHERE u.id = $1`

	var profile utils.InterviewUserProfile
	err := r.db.Get(&profile, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &profile, nil
}

func (r *InterviewsRepository) GetProfessionByID(professionID int) (*utils.InterviewProfession, error) {
	query := `SELECT id, name FROM profession WHERE id = $1`

	var profession utils.InterviewProfession
	err := r.db.Get(&profession, query, professionID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &profession, nil
}

func (r *InterviewsRepository) GetProfessionByName(name string) (*utils.InterviewProfession, error) {
	query := `SELECT id, name FROM profession WHERE name = $1`

	var profession utils.InterviewProfession
	err := r.db.Get(&profession, query, name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &profession, nil
}

func (r *InterviewsRepository) ListMessages(interviewID int) ([]utils.InterviewMessage, error) {
	query := `SELECT
		id,
		interview_id,
		sequence_no,
		role,
		content,
		created_at
	FROM interview_message
	WHERE interview_id = $1
	ORDER BY sequence_no ASC`

	var messages []utils.InterviewMessage
	if err := r.db.Select(&messages, query, interviewID); err != nil {
		return nil, err
	}

	return messages, nil
}

func (r *InterviewsRepository) CreateSessionWithMessage(userID string, params utils.CreateInterviewSessionParams) (*utils.InterviewSession, *utils.InterviewMessage, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return nil, nil, err
	}
	defer tx.Rollback()

	insertSessionQuery := `INSERT INTO interview_session (
		user_id,
		profession_id,
		interview_level,
		status,
		duration_minutes,
		candidate_specialization,
		profile_snapshot,
		interview_plan,
		prompt_version,
		llm_provider,
		llm_model,
		started_at,
		expires_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	RETURNING
		id,
		user_id,
		profession_id,
		interview_level,
		status,
		duration_minutes,
		candidate_specialization,
		profile_snapshot,
		interview_plan,
		prompt_version,
		llm_provider,
		llm_model,
		verdict_passed,
		summary,
		strengths,
		weaknesses,
		recommendations,
		started_at,
		expires_at,
		finished_at,
		created_at,
		updated_at`

	var session utils.InterviewSession
	err = tx.QueryRowx(
		insertSessionQuery,
		userID,
		params.ProfessionID,
		params.InterviewLevel,
		utils.InterviewInProgress,
		params.DurationMinutes,
		params.CandidateSpecialization,
		params.ProfileSnapshot,
		params.InterviewPlan,
		params.PromptVersion,
		params.LLMProvider,
		params.LLMModel,
		params.StartedAt,
		params.ExpiresAt,
	).StructScan(&session)
	if err != nil {
		return nil, nil, err
	}

	insertMessageQuery := `INSERT INTO interview_message (
		interview_id,
		sequence_no,
		role,
		content
	) VALUES ($1, $2, $3, $4)
	RETURNING id, interview_id, sequence_no, role, content, created_at`

	var message utils.InterviewMessage
	err = tx.QueryRowx(
		insertMessageQuery,
		session.ID,
		1,
		utils.InterviewMessageAssistant,
		params.FirstQuestion,
	).StructScan(&message)
	if err != nil {
		return nil, nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, nil, err
	}

	return &session, &message, nil
}

func (r *InterviewsRepository) CreateTurnMessages(interviewID int, userAnswer string, assistantQuestion string) (*utils.InterviewMessage, *utils.InterviewMessage, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return nil, nil, err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`SELECT id FROM interview_session WHERE id = $1 FOR UPDATE`, interviewID); err != nil {
		return nil, nil, err
	}

	var nextSequence int
	if err := tx.Get(&nextSequence, `SELECT COALESCE(MAX(sequence_no), 0) + 1 FROM interview_message WHERE interview_id = $1`, interviewID); err != nil {
		return nil, nil, err
	}

	insertMessageQuery := `INSERT INTO interview_message (
		interview_id,
		sequence_no,
		role,
		content
	) VALUES ($1, $2, $3, $4)
	RETURNING id, interview_id, sequence_no, role, content, created_at`

	var userMessage utils.InterviewMessage
	if err := tx.QueryRowx(
		insertMessageQuery,
		interviewID,
		nextSequence,
		utils.InterviewMessageUser,
		userAnswer,
	).StructScan(&userMessage); err != nil {
		return nil, nil, err
	}

	var assistantMessage utils.InterviewMessage
	if err := tx.QueryRowx(
		insertMessageQuery,
		interviewID,
		nextSequence+1,
		utils.InterviewMessageAssistant,
		assistantQuestion,
	).StructScan(&assistantMessage); err != nil {
		return nil, nil, err
	}

	if _, err := tx.Exec(`UPDATE interview_session SET updated_at = NOW() WHERE id = $1`, interviewID); err != nil {
		return nil, nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, nil, err
	}

	return &userMessage, &assistantMessage, nil
}

func (r *InterviewsRepository) CreateUserMessage(interviewID int, userAnswer string) (*utils.InterviewMessage, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`SELECT id FROM interview_session WHERE id = $1 FOR UPDATE`, interviewID); err != nil {
		return nil, err
	}

	var nextSequence int
	if err := tx.Get(&nextSequence, `SELECT COALESCE(MAX(sequence_no), 0) + 1 FROM interview_message WHERE interview_id = $1`, interviewID); err != nil {
		return nil, err
	}

	insertMessageQuery := `INSERT INTO interview_message (
		interview_id,
		sequence_no,
		role,
		content
	) VALUES ($1, $2, $3, $4)
	RETURNING id, interview_id, sequence_no, role, content, created_at`

	var userMessage utils.InterviewMessage
	if err := tx.QueryRowx(
		insertMessageQuery,
		interviewID,
		nextSequence,
		utils.InterviewMessageUser,
		userAnswer,
	).StructScan(&userMessage); err != nil {
		return nil, err
	}

	if _, err := tx.Exec(`UPDATE interview_session SET updated_at = NOW() WHERE id = $1`, interviewID); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &userMessage, nil
}

func (r *InterviewsRepository) FinalizeInterview(interviewID int, params utils.InterviewFinalizeParams) (*utils.InterviewSession, error) {
	query := `UPDATE interview_session
	SET
		status = $2,
		verdict_passed = $3,
		summary = $4,
		strengths = $5,
		weaknesses = $6,
		recommendations = $7,
		finished_at = $8,
		updated_at = NOW()
	WHERE id = $1
	RETURNING
		id,
		user_id,
		profession_id,
		interview_level,
		status,
		duration_minutes,
		candidate_specialization,
		profile_snapshot,
		interview_plan,
		prompt_version,
		llm_provider,
		llm_model,
		verdict_passed,
		summary,
		strengths,
		weaknesses,
		recommendations,
		started_at,
		expires_at,
		finished_at,
		created_at,
		updated_at`

	var session utils.InterviewSession
	if err := r.db.QueryRowx(
		query,
		interviewID,
		params.Status,
		params.VerdictPassed,
		params.Summary,
		params.Strengths,
		params.Weaknesses,
		params.Recommendations,
		params.FinishedAt,
	).StructScan(&session); err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *InterviewsRepository) ListHistory(userID string) ([]utils.InterviewHistoryItem, error) {
	query := `SELECT
		s.id,
		s.profession_id,
		p.name AS profession,
		s.interview_level,
		s.status,
		s.duration_minutes,
		s.candidate_specialization,
		s.verdict_passed,
		s.summary,
		s.strengths,
		s.weaknesses,
		s.recommendations,
		s.started_at,
		s.expires_at,
		s.finished_at
	FROM interview_session s
	JOIN profession p ON p.id = s.profession_id
	WHERE s.user_id = $1
	ORDER BY s.started_at DESC, s.id DESC`

	var history []utils.InterviewHistoryItem
	if err := r.db.Select(&history, query, userID); err != nil {
		return nil, err
	}

	return history, nil
}

func (r *InterviewsRepository) getSessionByQuery(query string, args ...interface{}) (*utils.InterviewSession, error) {
	var interview utils.InterviewSession
	err := r.db.Get(&interview, query, args...)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &interview, nil
}
