package services

import (
	"context"
	"sobeslife-services/internal/llm"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

type Authorization interface {
	CreateUser(userParams utils.CreateUserQuery) (string, error)
	GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error)
	AuthByNumber(phoneNumber string, password string) (*utils.TokensPair, error)
	AuthByNickname(nickname string, password string) (*utils.TokensPair, error)
	AuthByEmail(email string, password string) (*utils.TokensPair, error)
	GetIsAdmin(userId string) (bool, error)
	GetProfile(userID string) (*utils.UserProfileResponse, error)
	UpdateProfile(userID string, request utils.UpdateUserProfileRequest) (*utils.UserProfileResponse, error)
	GenerateGoogleOauthRedirectURI(state string, codeChallenge string) string
	AuthByGoogleWithCode(code string, codeVerifier string) (*utils.TokensPair, error)
}

type Questions interface {
	GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error)
	CheckAnswer(question_id string, answer string) (bool, error)
}

type Tests interface {
	Generate(testParameters utils.CreateTestRequest) (utils.TestResponse, error)
	List(user_id string, filters utils.TestListFilters) ([]utils.TestListItem, error)
	GetByID(user_id string, test_id string) (*utils.TestDetailsResponse, error)
	GetStatistics(user_id string) (*utils.UserTestsStatisticsResponse, error)
	Start(user_id string, test_id string) error
	SetUsersAnswer(test_id string, question_id string, answer string, isCorrect bool) error
	Complete(user_id string, test_id string) (*utils.TestStatsResponse, error)
}

type Shared interface {
	GetAllProfessions() ([]utils.Profession, error)
	GetModulesByFilters(profession string) ([]utils.Chapter, error)
	GetTechnologiesByFilters(module string) ([]utils.Technology, error)
}

type Interviews interface {
	Start(ctx context.Context, userID string, request utils.StartInterviewRequest) (*utils.InterviewStartResponse, error)
	SendAnswer(ctx context.Context, userID string, interviewID string, request utils.SendInterviewAnswerRequest) (*utils.InterviewTurnResponse, error)
	Complete(ctx context.Context, userID string, interviewID string) (*utils.InterviewTurnResponse, error)
	History(ctx context.Context, userID string) ([]utils.InterviewHistoryItem, error)
}

type Service struct {
	Authorization
	Questions
	Tests
	Shared
	Interviews
}

func NewService(repo *repository.Repository, jwt *utils.JWTService, interviewLLM llm.InterviewClient) *Service {
	return &Service{
		Authorization: newAuthService(repo, jwt),
		Questions:     newQuestionService(repo),
		Tests:         newTestsService(repo),
		Shared:        newSharedService(repo),
		Interviews:    newInterviewsService(repo, interviewLLM),
	}
}
