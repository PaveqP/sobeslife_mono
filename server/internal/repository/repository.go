package repository

import (
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
)

type Authorization interface {
	CreateUser(userParams utils.CreateUserQuery) (string, error)
	GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error)
	GetUserByPhoneNumber(phoneNumber string) (*utils.UserIdentity, error)
	GetIsAdmin(userId string) (bool, error)
}

type Questions interface {
	GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error)
	GetCorrectAnswer(question_id string) (string, error)
}

type Tests interface {
	Generate(testParameters utils.CreateTestRequest, questions []string) (utils.Test, error)
	List(user_id string, filters utils.TestListFilters) ([]utils.TestListItem, error)
	GetByID(user_id string, test_id string) (*utils.TestDetailsResponse, error)
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

type Repository struct {
	Authorization
	Questions
	Tests
	Shared
	Interviews
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Authorization: newAuthRepository(db),
		Questions:     newQuestionRepository(db),
		Tests:         newTestsRepository(db),
		Shared:        newSharedRepository(db),
		Interviews:    newInterviewsRepository(db),
	}
}
