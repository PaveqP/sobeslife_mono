package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sobeslife-services/internal/llm"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"strings"
	"time"

	"github.com/lib/pq"
)

var (
	ErrInterviewAlreadyActive   = errors.New("user already has active interview")
	ErrInterviewNotFound        = errors.New("interview not found")
	ErrInterviewAnswerEmpty     = errors.New("interview answer is empty")
	ErrInvalidInterviewLevel    = errors.New("invalid interview level")
	ErrInvalidInterviewDuration = errors.New("invalid interview duration")
	ErrProfessionNotFound       = errors.New("profession not found")
	ErrUserNotFound             = errors.New("user not found")
	ErrInterviewSummaryFailed   = errors.New("interview summarization failed")
)

type InterviewsService struct {
	r   *repository.Repository
	llm llm.InterviewClient
}

func newInterviewsService(r *repository.Repository, llm llm.InterviewClient) *InterviewsService {
	return &InterviewsService{r: r, llm: llm}
}

func (s *InterviewsService) Start(ctx context.Context, userID string, request utils.StartInterviewRequest) (*utils.InterviewStartResponse, error) {
	if err := validateStartInterviewRequest(request); err != nil {
		return nil, err
	}
	if s.llm == nil {
		return nil, fmt.Errorf("interview llm client is not configured")
	}

	activeInterview, err := s.r.Interviews.GetActiveByUser(userID)
	if err != nil {
		return nil, err
	}
	if activeInterview != nil {
		return nil, ErrInterviewAlreadyActive
	}

	profession, err := s.r.Interviews.GetProfessionByName(strings.TrimSpace(request.Profession))
	if err != nil {
		return nil, err
	}
	if profession == nil {
		return nil, ErrProfessionNotFound
	}

	userProfile, err := s.r.Interviews.GetUserProfile(userID)
	if err != nil {
		return nil, err
	}
	if userProfile == nil {
		return nil, ErrUserNotFound
	}

	profileSnapshot, err := buildInterviewProfileSnapshot(userProfile)
	if err != nil {
		return nil, err
	}
	candidateSpecialization := normalizeOptionalString(request.CandidateSpecialization)

	promptContext := utils.InterviewPromptContext{
		UserID:                  userProfile.UserID,
		ProfessionID:            profession.ID,
		Profession:              profession.Name,
		InterviewLevel:          request.InterviewLevel,
		DurationMinutes:         request.DurationMinutes,
		CandidateSpecialization: candidateSpecialization,
		ProfileSnapshot:         profileSnapshot,
	}

	plan, err := s.llm.GeneratePlan(ctx, promptContext)
	if err != nil {
		return nil, err
	}
	planPayload, err := marshalInterviewPlan(plan)
	if err != nil {
		return nil, err
	}
	firstQuestion, err := extractFirstQuestion(plan)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	startedAt := now.Format(StandardSQLTimeFormat)
	expiresAt := now.Add(time.Duration(request.DurationMinutes) * time.Minute).Format(StandardSQLTimeFormat)

	session, message, err := s.r.Interviews.CreateSessionWithMessage(userID, utils.CreateInterviewSessionParams{
		ProfessionID:            profession.ID,
		InterviewLevel:          request.InterviewLevel,
		DurationMinutes:         request.DurationMinutes,
		CandidateSpecialization: candidateSpecialization,
		ProfileSnapshot:         profileSnapshot,
		InterviewPlan:           planPayload,
		PromptVersion:           s.llm.PromptVersion(),
		LLMProvider:             s.llm.ProviderName(),
		LLMModel:                s.llm.ModelName(),
		StartedAt:               startedAt,
		ExpiresAt:               expiresAt,
		FirstQuestion:           firstQuestion,
	})
	if err != nil {
		var pgErr *pq.Error
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrInterviewAlreadyActive
		}
		return nil, err
	}

	return &utils.InterviewStartResponse{
		ID:                      session.ID,
		Status:                  session.Status,
		ProfessionID:            session.ProfessionID,
		Profession:              profession.Name,
		InterviewLevel:          session.InterviewLevel,
		DurationMinutes:         session.DurationMinutes,
		CandidateSpecialization: session.CandidateSpecialization,
		Plan:                    plan,
		StartedAt:               session.StartedAt,
		ExpiresAt:               session.ExpiresAt,
		FirstQuestion:           message.Content,
	}, nil
}

func (s *InterviewsService) SendAnswer(ctx context.Context, userID string, interviewID string, request utils.SendInterviewAnswerRequest) (*utils.InterviewTurnResponse, error) {
	if strings.TrimSpace(request.Answer) == "" {
		return nil, ErrInterviewAnswerEmpty
	}

	session, err := s.r.Interviews.GetByID(userID, interviewID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, ErrInterviewNotFound
	}

	if session.Status == utils.InterviewCompleted {
		return buildInterviewTurnFromSession(session), nil
	}

	now := time.Now()
	expired, err := isInterviewExpired(session, now)
	if err != nil {
		return nil, err
	}
	if expired {
		return s.finalizeInterview(ctx, session)
	}

	profession, err := s.r.Interviews.GetProfessionByID(session.ProfessionID)
	if err != nil {
		return nil, err
	}
	if profession == nil {
		return nil, ErrProfessionNotFound
	}

	messages, err := s.r.Interviews.ListMessages(session.ID)
	if err != nil {
		return nil, err
	}

	transcript := buildTranscript(messages)
	transcript = append(transcript, utils.InterviewTranscriptItem{
		Role:    utils.InterviewMessageUser,
		Content: strings.TrimSpace(request.Answer),
	})

	promptContext := utils.InterviewPromptContext{
		UserID:                  session.UserID,
		ProfessionID:            session.ProfessionID,
		Profession:              profession.Name,
		InterviewLevel:          session.InterviewLevel,
		DurationMinutes:         session.DurationMinutes,
		CandidateSpecialization: session.CandidateSpecialization,
		ProfileSnapshot:         session.ProfileSnapshot,
		InterviewPlan:           session.InterviewPlan,
	}

	nextQuestion, err := s.llm.GenerateNextQuestion(ctx, promptContext, transcript)
	if err != nil {
		return nil, err
	}
	if nextQuestion.Action == utils.InterviewNextActionCompleteInterview {
		if _, err := s.r.Interviews.CreateUserMessage(session.ID, strings.TrimSpace(request.Answer)); err != nil {
			return nil, err
		}
		return s.finalizeInterview(ctx, session)
	}

	_, assistantMessage, err := s.r.Interviews.CreateTurnMessages(session.ID, strings.TrimSpace(request.Answer), nextQuestion.NextQuestion)
	if err != nil {
		return nil, err
	}

	return &utils.InterviewTurnResponse{
		InterviewID: session.ID,
		Status:      utils.InterviewInProgress,
		ExpiresAt:   session.ExpiresAt,
		Message: &utils.InterviewMessageItem{
			SequenceNo: assistantMessage.SequenceNo,
			Role:       assistantMessage.Role,
			Content:    assistantMessage.Content,
			CreatedAt:  assistantMessage.CreatedAt,
		},
	}, nil
}

func (s *InterviewsService) History(ctx context.Context, userID string) ([]utils.InterviewHistoryItem, error) {
	expiredInterviews, err := s.r.Interviews.ListExpiredByUser(userID, time.Now().Format(StandardSQLTimeFormat))
	if err != nil {
		return nil, err
	}

	for i := range expiredInterviews {
		if _, err := s.finalizeInterview(ctx, &expiredInterviews[i]); err != nil {
			return nil, err
		}
	}

	return s.r.Interviews.ListHistory(userID)
}

func (s *InterviewsService) Complete(ctx context.Context, userID string, interviewID string) (*utils.InterviewTurnResponse, error) {
	session, err := s.r.Interviews.GetByID(userID, interviewID)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, ErrInterviewNotFound
	}

	if session.Status == utils.InterviewCompleted {
		return buildInterviewTurnFromSession(session), nil
	}

	return s.finalizeInterview(ctx, session)
}

func validateStartInterviewRequest(request utils.StartInterviewRequest) error {
	if strings.TrimSpace(request.Profession) == "" {
		return ErrProfessionNotFound
	}
	if request.DurationMinutes <= 0 {
		return ErrInvalidInterviewDuration
	}

	switch request.InterviewLevel {
	case utils.ExpertiseJunior, utils.ExpertiseMiddle, utils.ExpertiseSenior:
		return nil
	default:
		return ErrInvalidInterviewLevel
	}
}

func buildInterviewProfileSnapshot(profile *utils.InterviewUserProfile) (utils.JSONB, error) {
	snapshot := utils.InterviewProfileSnapshot{
		UserID:         profile.UserID,
		Nickname:       profile.Nickname,
		ProfessionID:   profile.ProfessionID,
		Profession:     profile.Profession,
		ExpertiseLevel: profile.ExpertiseLevel,
	}

	raw, err := json.Marshal(snapshot)
	if err != nil {
		return nil, err
	}

	return utils.JSONB(raw), nil
}

func (s *InterviewsService) finalizeInterview(ctx context.Context, session *utils.InterviewSession) (*utils.InterviewTurnResponse, error) {
	if session.Status == utils.InterviewCompleted || session.Status == utils.InterviewSummaryFail {
		return buildInterviewTurnFromSession(session), nil
	}

	profession, err := s.r.Interviews.GetProfessionByID(session.ProfessionID)
	if err != nil {
		return nil, err
	}
	if profession == nil {
		return nil, ErrProfessionNotFound
	}

	messages, err := s.r.Interviews.ListMessages(session.ID)
	if err != nil {
		return nil, err
	}

	transcript := buildTranscript(messages)
	promptContext := utils.InterviewPromptContext{
		UserID:                  session.UserID,
		ProfessionID:            session.ProfessionID,
		Profession:              profession.Name,
		InterviewLevel:          session.InterviewLevel,
		DurationMinutes:         session.DurationMinutes,
		CandidateSpecialization: session.CandidateSpecialization,
		ProfileSnapshot:         session.ProfileSnapshot,
		InterviewPlan:           session.InterviewPlan,
	}

	finishedAt := time.Now().Format(StandardSQLTimeFormat)

	summaryPayload, err := s.llm.SummarizeInterview(ctx, promptContext, transcript)
	if err != nil {
		_, finalizeErr := s.r.Interviews.FinalizeInterview(session.ID, utils.InterviewFinalizeParams{
			Status:     utils.InterviewSummaryFail,
			FinishedAt: finishedAt,
		})
		if finalizeErr != nil {
			return nil, finalizeErr
		}
		return nil, fmt.Errorf("%w: %v", ErrInterviewSummaryFailed, err)
	}

	strengths, err := marshalStringSlice(summaryPayload.Strengths)
	if err != nil {
		return nil, err
	}
	weaknesses, err := marshalStringSlice(summaryPayload.Weaknesses)
	if err != nil {
		return nil, err
	}
	recommendations, err := marshalStringSlice(summaryPayload.Recommendations)
	if err != nil {
		return nil, err
	}

	completedSession, err := s.r.Interviews.FinalizeInterview(session.ID, utils.InterviewFinalizeParams{
		Status:          utils.InterviewCompleted,
		VerdictPassed:   &summaryPayload.VerdictPassed,
		Summary:         &summaryPayload.Summary,
		Strengths:       strengths,
		Weaknesses:      weaknesses,
		Recommendations: recommendations,
		FinishedAt:      finishedAt,
	})
	if err != nil {
		return nil, err
	}

	return buildInterviewTurnFromSession(completedSession), nil
}

func buildTranscript(messages []utils.InterviewMessage) []utils.InterviewTranscriptItem {
	transcript := make([]utils.InterviewTranscriptItem, 0, len(messages))
	for _, message := range messages {
		transcript = append(transcript, utils.InterviewTranscriptItem{
			Role:    message.Role,
			Content: message.Content,
		})
	}
	return transcript
}

func buildInterviewTurnFromSession(session *utils.InterviewSession) *utils.InterviewTurnResponse {
	return &utils.InterviewTurnResponse{
		InterviewID:     session.ID,
		Status:          session.Status,
		ExpiresAt:       session.ExpiresAt,
		VerdictPassed:   session.VerdictPassed,
		Summary:         session.Summary,
		Strengths:       session.Strengths,
		Weaknesses:      session.Weaknesses,
		Recommendations: session.Recommendations,
		FinishedAt:      session.FinishedAt,
	}
}

func marshalStringSlice(items []string) (utils.JSONB, error) {
	raw, err := json.Marshal(items)
	if err != nil {
		return nil, err
	}
	return utils.JSONB(raw), nil
}

func marshalInterviewPlan(plan *utils.InterviewPlan) (utils.JSONB, error) {
	raw, err := json.Marshal(plan)
	if err != nil {
		return nil, err
	}
	return utils.JSONB(raw), nil
}

func extractFirstQuestion(plan *utils.InterviewPlan) (string, error) {
	if plan == nil || len(plan.Steps) == 0 {
		return "", fmt.Errorf("interview plan does not contain steps")
	}

	firstQuestion := strings.TrimSpace(plan.Steps[0].MainQuestion)
	if firstQuestion == "" {
		return "", fmt.Errorf("interview plan does not contain the first question")
	}

	return firstQuestion, nil
}

func normalizeOptionalString(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}

	return &trimmed
}

func isInterviewExpired(session *utils.InterviewSession, now time.Time) (bool, error) {
	expiresAt, err := parseSQLTime(session.ExpiresAt)
	if err != nil {
		return false, err
	}
	return !now.Before(expiresAt), nil
}

func parseSQLTime(value string) (time.Time, error) {
	layouts := []string{
		StandardSQLTimeFormat,
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02T15:04:05",
	}

	for _, layout := range layouts {
		parsed, err := time.Parse(layout, value)
		if err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("unsupported time format: %s", value)
}
