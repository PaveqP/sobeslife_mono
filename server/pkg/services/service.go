package services

import (
	"sobeslife-services/internal/utils"
	"sobeslife-services/pkg/repository"
)

type Authorization interface {
	CreateUser(nickname string, email string, phoneNumber string, password string) (int, error)
	GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error)
}

type Service struct {
	Authorization
}

func NewService(repo *repository.Repository) *Service {
	return &Service{
		Authorization: newAuthService(repo),
	}
}
