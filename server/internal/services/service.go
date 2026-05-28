package services

import (
	"context"
	"sobeslife-services/internal/cache"
	"sobeslife-services/internal/llm"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

type Authorization interface {
	GetProfile(userID string) (*utils.UserProfileResponse, error)
	UpdateProfile(userID string, request utils.UpdateUserProfileRequest) (*utils.UserProfileResponse, error)
	// Google OAuth
	GenerateGoogleOauthRedirectURI(state string, codeChallenge string, redirectURI string) (string, error)
	AuthByGoogleWithCode(code string, codeVerifier string, redirectURI string) (*utils.TokensPair, error)
	// GitHub OAuth
	GenerateGithubOauthRedirectURI(state string, redirectURI string) (string, error)
	AuthByGithubWithCode(code string, redirectURI string) (*utils.TokensPair, error)
	// Email OTP
	SendOTP(ctx context.Context, email string) error
	VerifyOTP(ctx context.Context, email, code string) (*utils.TokensPair, error)
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

type AdminServiceInterface interface {
	CreateAdmin(req utils.AdminCreateRequest) (*utils.AdminTokenResponse, error)
	SignIn(req utils.AdminSignInRequest) (*utils.AdminTokenResponse, error)
	GetStats() (*utils.AdminStatsResponse, error)
	ListAdmins() ([]utils.AdminListAdminItem, error)
	DeleteAdmin(id int) error
	ListWebUsers() ([]utils.AdminUserListItem, error)
	CreateWebUser(req utils.AdminCreateWebUserRequest) (*utils.AdminUserListItem, error)
	UpdateWebUser(id int, req utils.AdminUpdateWebUserRequest) (*utils.AdminUserListItem, error)
	DeleteWebUser(id int) error
	ListInterviews() ([]utils.AdminInterviewListItem, error)
	DeleteInterview(id int) error
	GetAnalytics() (*utils.AdminAnalyticsResponse, error)
	ListAdminTests() ([]utils.TestListItem, error)
	CreateAdminTest(req utils.AdminCreateTestRequest) (*utils.TestListItem, error)
	DeleteAdminTest(id int) error
	ListTestQuestions(testID int) ([]utils.AdminTestQuestionItem, error)
	AddQuestionToTest(testID, questionID int) error
	RemoveQuestionFromTest(testID, questionID int) error
	ListQuestions(filters utils.AdminQuestionFilters) ([]utils.AdminQuestionListItem, error)
	CreateQuestion(req utils.AdminCreateQuestionRequest) (*utils.AdminQuestionListItem, error)
	UpdateQuestion(id int, req utils.AdminUpdateQuestionRequest) (*utils.AdminQuestionListItem, error)
	DeleteQuestion(id int) error
}

type Service struct {
	Authorization
	Questions
	Tests
	Shared
	Interviews
	AdminServiceInterface
}

func NewService(repo *repository.Repository, jwt *utils.JWTService, interviewLLM llm.InterviewClient, c *cache.CacheService) *Service {
	return &Service{
		Authorization:         newAuthService(repo, jwt, c),
		Questions:             newQuestionService(repo),
		Tests:                 newTestsService(repo),
		Shared:                newSharedService(repo),
		Interviews:            newInterviewsService(repo, interviewLLM),
		AdminServiceInterface: newAdminService(repo.Admin, jwt),
	}
}
