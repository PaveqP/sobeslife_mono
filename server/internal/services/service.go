package services

import (
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

type Authorization interface {
	CreateUser(nickname string, email string, phoneNumber string, password string) (int, error)
	GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error)
}

type Questions interface {
	GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error)
}

type Tests interface {
	Generate(testParameters utils.CreateTestRequest) (utils.TestResponse, error)
}

type Shared interface {
	GetAllProfessions() ([]utils.Profession, error)
	GetModulesByFilters(profession string) ([]utils.Chapter, error)
	GetTechnologiesByFilters(module string) ([]utils.Technology, error)
}

type Service struct {
	Authorization
	Questions
	Tests
	Shared
}

func NewService(repo *repository.Repository) *Service {
	return &Service{
		Authorization: newAuthService(repo),
		Questions:     newQuestionService(repo),
		Tests:         newTestsService(repo),
		Shared:        newSharedService(repo),
	}
}
