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
}

type Tests interface {
	Generate(testParameters utils.CreateTestRequest, questions []string) (utils.Test, error)
}

type Shared interface {
	GetAllProfessions() ([]utils.Profession, error)
	GetModulesByFilters(profession string) ([]utils.Chapter, error)
	GetTechnologiesByFilters(module string) ([]utils.Technology, error)
}

type Repository struct {
	Authorization
	Questions
	Tests
	Shared
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Authorization: newAuthRepository(db),
		Questions:     newQuestionRepository(db),
		Tests:         newTestsRepository(db),
		Shared:        newSharedRepository(db),
	}
}
