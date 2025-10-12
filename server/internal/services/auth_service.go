package services

import (
	"errors"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	r  *repository.Repository
	hs *utils.JWTService
}

func newAuthService(r *repository.Repository, hs *utils.JWTService) *AuthService {
	return &AuthService{r, hs}
}

func (as *AuthService) CreateUser(userParams utils.CreateUserQuery) (string, error) {
	hashedPassword, err := generatePasswordHash(userParams.Password)
	if err != nil {
		return "", err
	}
	userParams.Password = hashedPassword
	return as.r.Authorization.CreateUser(userParams)
}

func (as *AuthService) AuthByNumber(phoneNumber string, password string) (*utils.TokensPair, error) {
	userCredentials, err := as.r.Authorization.GetUserByPhoneNumber(phoneNumber)
	if err != nil {
		return nil, err
	}
	if userCredentials == nil {
		return nil, errors.New("user credentials is empty")
	}
	if !verifyPassword(password, userCredentials.HashedPassword) {
		return nil, errors.New("incorrect password")
	}

	tokens, err := as.hs.GeneratedTokensPair(userCredentials.UserId)
	if err != nil {
		return nil, err
	}
	return tokens, nil
}
func (as *AuthService) AuthByNickname(nickname string, password string) (*utils.TokensPair, error) {
	return nil, nil
}
func (as *AuthService) AuthByEmail(email string, password string) (*utils.TokensPair, error) {
	return nil, nil
}

func (as *AuthService) GetIsAdmin(userId string) (bool, error) {
	isAdmin, err := as.r.Authorization.GetIsAdmin(userId)
	if err != nil {
		return false, err
	}
	return isAdmin, nil
}

func (as *AuthService) GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error) {
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

func generatePasswordHash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func verifyPassword(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
