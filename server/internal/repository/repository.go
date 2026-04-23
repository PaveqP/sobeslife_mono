package repository

import (
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
)

type Authorization interface {
	CreateGoogleUser(email string, nickname string, passwordHash string) (string, error)
	CreateGithubUser(email string, nickname string) (string, error)
	CreateOTPUser(email string) (string, error)
	GetUserByEmail(email string) (*utils.UserIdentity, error)
	UpdateUserProfile(userID string, params utils.UpdateUserProfileParams) (bool, error)
	ListExpertiseLevels() ([]utils.ExpertiseLevel, error)
}

type Questions interface {
	GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error)
	GetCorrectAnswer(question_id string) (string, error)
	GetWrongAnswers(excludeID int, professionID int, chapterID int, limit int) ([]string, error)
}

type Tests interface {
	Generate(testParameters utils.CreateTestRequest, questions []string) (utils.Test, error)
	List(user_id string, filters utils.TestListFilters) ([]utils.TestListItem, error)
	GetByID(user_id string, test_id string) (*utils.TestDetailsResponse, error)
	GetStatistics(user_id string) (*utils.UserTestsStatisticsResponse, error)
	SetUsersAnswer(test_id string, question_id string, answer string, isCorrect bool) error
	Start(user_id string, test_id string, currentTime string, testStatus utils.TestStatus) error
	Complete(user_id string, test_id string, currentTime string, testStatus utils.TestStatus) (*utils.TestStatsResponse, error)
}

type Shared interface {
	GetAllProfessions() ([]utils.Profession, error)
	GetModulesByFilters(profession string) ([]utils.Chapter, error)
	GetTechnologiesByFilters(module string) ([]utils.Technology, error)
}

type Interviews interface {
	GetActiveByUser(userID string) (*utils.InterviewSession, error)
	GetByID(userID string, interviewID string) (*utils.InterviewSession, error)
	ListExpiredByUser(userID string, currentTime string) ([]utils.InterviewSession, error)
	ListHistory(userID string) ([]utils.InterviewHistoryItem, error)
	GetUserProfile(userID string) (*utils.InterviewUserProfile, error)
	GetProfessionByID(professionID int) (*utils.InterviewProfession, error)
	GetProfessionByName(name string) (*utils.InterviewProfession, error)
	ListMessages(interviewID int) ([]utils.InterviewMessage, error)
	CreateSessionWithMessage(userID string, params utils.CreateInterviewSessionParams) (*utils.InterviewSession, *utils.InterviewMessage, error)
	CreateUserMessage(interviewID int, userAnswer string) (*utils.InterviewMessage, error)
	CreateTurnMessages(interviewID int, userAnswer string, assistantQuestion string) (*utils.InterviewMessage, *utils.InterviewMessage, error)
	FinalizeInterview(interviewID int, params utils.InterviewFinalizeParams) (*utils.InterviewSession, error)
}

type Admin interface {
	CreateAdmin(name string, login string, email string, passwordHash string) (int, error)
	GetAdminByLogin(login string) (*utils.AdminIdentity, error)
	ListAdmins() ([]utils.AdminListAdminItem, error)
	DeleteAdmin(id int) error
	GetStats() (*utils.AdminStatsResponse, error)
	ListWebUsers() ([]utils.AdminUserListItem, error)
	CreateWebUser(req utils.AdminCreateWebUserRequest) (*utils.AdminUserListItem, error)
	UpdateWebUser(id int, req utils.AdminUpdateWebUserRequest) (*utils.AdminUserListItem, error)
	DeleteWebUser(userID int) error
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

type Repository struct {
	Authorization
	Questions
	Tests
	Shared
	Interviews
	Admin
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Authorization: newAuthRepository(db),
		Questions:     newQuestionRepository(db),
		Tests:         newTestsRepository(db),
		Shared:        newSharedRepository(db),
		Interviews:    newInterviewsRepository(db),
		Admin:         newAdminRepository(db),
	}
}
