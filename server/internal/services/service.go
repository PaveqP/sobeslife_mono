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
	GetAllQuestions() ([]utils.Question, error)
	GetQuestionsByProfession(professionId string) ([]utils.Question, error)
	GetQuestionsByModule(moduleId string) ([]utils.Question, error)
	GetQuestionsByTechnology(technologyId string) ([]utils.Question, error)
	GetQuestionsForTest(professionId string, moduleId string, technologyId string) ([]utils.Question, error)
}

type Service struct {
	Authorization
	Questions
}

func NewService(repo *repository.Repository) *Service {
	return &Service{
		Authorization: newAuthService(repo),
		Questions:     newQuestionService(repo),
	}
}
