package services

import (
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

func NewService(repo *repository.Repository, jwt *utils.JWTService) *Service {
	return &Service{
		Authorization: newAuthService(repo, jwt),
		Questions:     newQuestionService(repo),
		Tests:         newTestsService(repo),
		Shared:        newSharedService(repo),
	}
}
