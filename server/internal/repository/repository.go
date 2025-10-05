package repository

import (
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
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

type Repository struct {
	Authorization
	Questions
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Authorization: newAuthRepository(db),
		Questions:     newQuestionRepository(db),
	}
}
