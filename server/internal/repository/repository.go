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
	GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error)
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
