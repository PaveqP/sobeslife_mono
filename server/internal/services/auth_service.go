package services

import (
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

type AuthService struct {
	r *repository.Repository
}

func newAuthService(r *repository.Repository) *AuthService {
	return &AuthService{r}
}

func (r *AuthService) CreateUser(nickname string, email string, phoneNumber string, password string) (int, error) {
	return 1, nil
}

func (r *AuthService) GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error) {
	user := utils.User{
		ID:             1,
		Nickname:       "sfdfs",
		Email:          "vfdvfdvdf",
		PasswordHash:   "vfdbdfbfd",
		PhoneNumber:    "45423523",
		DateOfBirth:    "svfsdbsd",
		ProfessionID:   1,
		ExpertiseLevel: "junior",
	}
	return user, nil
}
