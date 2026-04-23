package utils

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type JSONB []byte

func (j JSONB) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}

	if !json.Valid(j) {
		return nil, fmt.Errorf("invalid JSONB value")
	}

	return j, nil
}

func (j *JSONB) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		*j = nil
		return nil
	}

	if !json.Valid(data) {
		return fmt.Errorf("invalid JSONB payload")
	}

	*j = append((*j)[:0], data...)
	return nil
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	switch v := value.(type) {
	case []byte:
		*j = append((*j)[:0], v...)
		return nil
	case string:
		*j = append((*j)[:0], v...)
		return nil
	default:
		return fmt.Errorf("unsupported JSONB type: %T", value)
	}
}

func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}

	if !json.Valid(j) {
		return nil, fmt.Errorf("invalid JSONB value")
	}

	return []byte(j), nil
}

type InterviewSession struct {
	ID                      int             `json:"id" db:"id"`
	UserID                  int             `json:"user_id" db:"user_id"`
	ProfessionID            int             `json:"profession_id" db:"profession_id"`
	InterviewLevel          ExpertiseLevel  `json:"interview_level" db:"interview_level"`
	Status                  InterviewStatus `json:"status" db:"status"`
	DurationMinutes         int             `json:"duration_minutes" db:"duration_minutes"`
	CandidateSpecialization *string         `json:"candidate_specialization" db:"candidate_specialization"`
	ProfileSnapshot         JSONB           `json:"profile_snapshot" db:"profile_snapshot"`
	InterviewPlan           JSONB           `json:"interview_plan" db:"interview_plan"`
	PromptVersion           *string         `json:"prompt_version" db:"prompt_version"`
	LLMProvider             *string         `json:"llm_provider" db:"llm_provider"`
	LLMModel                *string         `json:"llm_model" db:"llm_model"`
	VerdictPassed           *bool           `json:"verdict_passed" db:"verdict_passed"`
	Summary                 *string         `json:"summary" db:"summary"`
	Strengths               JSONB           `json:"strengths" db:"strengths"`
	Weaknesses              JSONB           `json:"weaknesses" db:"weaknesses"`
	Recommendations         JSONB           `json:"recommendations" db:"recommendations"`
	StartedAt               string          `json:"started_at" db:"started_at"`
	ExpiresAt               string          `json:"expires_at" db:"expires_at"`
	FinishedAt              *string         `json:"finished_at" db:"finished_at"`
	CreatedAt               string          `json:"created_at" db:"created_at"`
	UpdatedAt               string          `json:"updated_at" db:"updated_at"`
}

type InterviewMessage struct {
	ID          int                  `json:"id" db:"id"`
	InterviewID int                  `json:"interview_id" db:"interview_id"`
	SequenceNo  int                  `json:"sequence_no" db:"sequence_no"`
	Role        InterviewMessageRole `json:"role" db:"role"`
	Content     string               `json:"content" db:"content"`
	CreatedAt   string               `json:"created_at" db:"created_at"`
}

type InterviewTranscriptItem struct {
	Role    InterviewMessageRole `json:"role"`
	Content string               `json:"content"`
}

type StartInterviewRequest struct {
	Profession              string         `json:"profession"`
	InterviewLevel          ExpertiseLevel `json:"interview_level"`
	DurationMinutes         int            `json:"duration_minutes"`
	CandidateSpecialization string         `json:"candidate_specialization"`
}

type InterviewUserProfile struct {
	UserID           int             `json:"user_id" db:"user_id"`
	Nickname         *string         `json:"nickname" db:"nickname"`
	FirstName        *string         `json:"first_name" db:"first_name"`
	LastName         *string         `json:"last_name" db:"last_name"`
	ProfessionID     *int            `json:"profession_id" db:"profession_id"`
	Profession       *string         `json:"profession" db:"profession"`
	ExpertiseLevel   *ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
	YearsExperience  *int            `json:"years_experience" db:"years_experience"`
	GithubURL        *string         `json:"github_url" db:"github_url"`
	LinkedinURL      *string         `json:"linkedin_url" db:"linkedin_url"`
	About            *string         `json:"about" db:"about"`
	ProfileCompleted bool            `json:"profile_completed" db:"profile_completed"`
}

type InterviewProfileSnapshot struct {
	UserID         int             `json:"user_id"`
	Nickname       *string         `json:"nickname,omitempty"`
	ProfessionID   *int            `json:"profession_id,omitempty"`
	Profession     *string         `json:"profession,omitempty"`
	ExpertiseLevel *ExpertiseLevel `json:"expertise_level,omitempty"`
}

type InterviewProfession struct {
	ID   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type SendInterviewAnswerRequest struct {
	Answer string `json:"answer"`
}

type InterviewHistoryFilters struct {
	ProfessionID   *int             `json:"profession_id"`
	Status         *InterviewStatus `json:"status"`
	InterviewLevel *ExpertiseLevel  `json:"interview_level"`
}

type InterviewHistoryItem struct {
	ID                      int             `json:"id" db:"id"`
	ProfessionID            int             `json:"profession_id" db:"profession_id"`
	Profession              string          `json:"profession" db:"profession"`
	InterviewLevel          ExpertiseLevel  `json:"interview_level" db:"interview_level"`
	Status                  InterviewStatus `json:"status" db:"status"`
	DurationMinutes         int             `json:"duration_minutes" db:"duration_minutes"`
	CandidateSpecialization *string         `json:"candidate_specialization" db:"candidate_specialization"`
	VerdictPassed           *bool           `json:"verdict_passed" db:"verdict_passed"`
	Summary                 *string         `json:"summary" db:"summary"`
	Strengths               JSONB           `json:"strengths" db:"strengths"`
	Weaknesses              JSONB           `json:"weaknesses" db:"weaknesses"`
	Recommendations         JSONB           `json:"recommendations" db:"recommendations"`
	StartedAt               string          `json:"started_at" db:"started_at"`
	ExpiresAt               string          `json:"expires_at" db:"expires_at"`
	FinishedAt              *string         `json:"finished_at" db:"finished_at"`
}

type InterviewStartResponse struct {
	ID                      int             `json:"id"`
	Status                  InterviewStatus `json:"status"`
	ProfessionID            int             `json:"profession_id"`
	Profession              string          `json:"profession"`
	InterviewLevel          ExpertiseLevel  `json:"interview_level"`
	DurationMinutes         int             `json:"duration_minutes"`
	CandidateSpecialization *string         `json:"candidate_specialization,omitempty"`
	Plan                    *InterviewPlan  `json:"plan,omitempty"`
	StartedAt               string          `json:"started_at"`
	ExpiresAt               string          `json:"expires_at"`
	FirstQuestion           string          `json:"first_question"`
}

type InterviewMessageResponse struct {
	InterviewID int                  `json:"interview_id"`
	Status      InterviewStatus      `json:"status"`
	Message     InterviewMessageItem `json:"message"`
}

type InterviewTurnResponse struct {
	InterviewID     int                   `json:"interview_id"`
	Status          InterviewStatus       `json:"status"`
	ExpiresAt       string                `json:"expires_at,omitempty"`
	Message         *InterviewMessageItem `json:"message,omitempty"`
	VerdictPassed   *bool                 `json:"verdict_passed,omitempty"`
	Summary         *string               `json:"summary,omitempty"`
	Strengths       JSONB                 `json:"strengths,omitempty"`
	Weaknesses      JSONB                 `json:"weaknesses,omitempty"`
	Recommendations JSONB                 `json:"recommendations,omitempty"`
	FinishedAt      *string               `json:"finished_at,omitempty"`
}

type InterviewMessageItem struct {
	SequenceNo int                  `json:"sequence_no"`
	Role       InterviewMessageRole `json:"role"`
	Content    string               `json:"content"`
	CreatedAt  string               `json:"created_at"`
}

type InterviewSummaryResponse struct {
	ID              int             `json:"id"`
	Status          InterviewStatus `json:"status"`
	VerdictPassed   *bool           `json:"verdict_passed"`
	Summary         *string         `json:"summary"`
	Strengths       JSONB           `json:"strengths"`
	Weaknesses      JSONB           `json:"weaknesses"`
	Recommendations JSONB           `json:"recommendations"`
	FinishedAt      *string         `json:"finished_at"`
}

type InterviewSummaryPayload struct {
	VerdictPassed   bool     `json:"verdict_passed"`
	Summary         string   `json:"summary"`
	Strengths       []string `json:"strengths"`
	Weaknesses      []string `json:"weaknesses"`
	Recommendations []string `json:"recommendations"`
}

const (
	InterviewNextActionAskQuestion       = "ask_question"
	InterviewNextActionCompleteInterview = "complete_interview"
)

type InterviewPlan struct {
	Overview              string              `json:"overview"`
	EstimatedTotalMinutes int                 `json:"estimated_total_minutes"`
	PlannedCodingTasks    int                 `json:"planned_coding_tasks"`
	Steps                 []InterviewPlanStep `json:"steps"`
}

type InterviewNextQuestionLLMOutput struct {
	Action         string `json:"action"`
	NextQuestion   string `json:"next_question,omitempty"`
	PlanStepNumber int    `json:"plan_step_number,omitempty"`
}

type InterviewPlanStep struct {
	StepNumber           int      `json:"step_number"`
	Type                 string   `json:"type"`
	Title                string   `json:"title"`
	Topic                string   `json:"topic"`
	Goal                 string   `json:"goal"`
	Difficulty           string   `json:"difficulty"`
	EstimatedMinutes     int      `json:"estimated_minutes"`
	MainQuestion         string   `json:"main_question"`
	FollowUpTopics       []string `json:"follow_up_topics"`
	MaxFollowUpQuestions int      `json:"max_follow_up_questions"`
}

type InterviewPromptContext struct {
	UserID                  int            `json:"user_id"`
	ProfessionID            int            `json:"profession_id"`
	Profession              string         `json:"profession"`
	InterviewLevel          ExpertiseLevel `json:"interview_level"`
	DurationMinutes         int            `json:"duration_minutes"`
	CandidateSpecialization *string        `json:"candidate_specialization,omitempty"`
	ProfileSnapshot         JSONB          `json:"profile_snapshot"`
	InterviewPlan           JSONB          `json:"interview_plan,omitempty"`
}

type CreateInterviewSessionParams struct {
	ProfessionID            int
	InterviewLevel          ExpertiseLevel
	DurationMinutes         int
	CandidateSpecialization *string
	ProfileSnapshot         JSONB
	InterviewPlan           JSONB
	PromptVersion           string
	LLMProvider             string
	LLMModel                string
	StartedAt               string
	ExpiresAt               string
	FirstQuestion           string
}

type InterviewFinalizeParams struct {
	Status          InterviewStatus
	VerdictPassed   *bool
	Summary         *string
	Strengths       JSONB
	Weaknesses      JSONB
	Recommendations JSONB
	FinishedAt      string
}
