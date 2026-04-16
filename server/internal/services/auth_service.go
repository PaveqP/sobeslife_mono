package services

import (
	"errors"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserProfileUpdateEmpty = errors.New("no fields provided for update")
	ErrNicknameEmpty          = errors.New("nickname must not be empty")
	ErrProfessionEmpty        = errors.New("profession must not be empty")
	ErrGradeEmpty             = errors.New("grade must not be empty")
	ErrInvalidGrade           = errors.New("invalid grade")
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

func (as *AuthService) GetProfile(userID string) (*utils.UserProfileResponse, error) {
	profile, err := as.r.Interviews.GetUserProfile(userID)
	if err != nil {
		return nil, err
	}
	if profile == nil {
		return nil, ErrUserNotFound
	}

	return buildUserProfileResponse(profile), nil
}

func (as *AuthService) UpdateProfile(userID string, request utils.UpdateUserProfileRequest) (*utils.UserProfileResponse, error) {
	params, err := as.buildUpdateProfileParams(request)
	if err != nil {
		return nil, err
	}

	updated, err := as.r.Authorization.UpdateUserProfile(userID, params)
	if err != nil {
		return nil, err
	}
	if !updated {
		return nil, ErrUserNotFound
	}

	return as.GetProfile(userID)
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

func (as *AuthService) buildUpdateProfileParams(request utils.UpdateUserProfileRequest) (utils.UpdateUserProfileParams, error) {
	params := utils.UpdateUserProfileParams{}

	if request.Nickname == nil && request.Profession == nil && request.Grade == nil {
		return params, ErrUserProfileUpdateEmpty
	}

	if request.Nickname != nil {
		nickname := strings.TrimSpace(*request.Nickname)
		if nickname == "" {
			return params, ErrNicknameEmpty
		}
		params.Nickname = &nickname
	}

	if request.Profession != nil {
		professionName := strings.TrimSpace(*request.Profession)
		if professionName == "" {
			return params, ErrProfessionEmpty
		}

		profession, err := as.r.Interviews.GetProfessionByName(professionName)
		if err != nil {
			return params, err
		}
		if profession == nil {
			return params, ErrProfessionNotFound
		}
		params.ProfessionID = &profession.ID
	}

	if request.Grade != nil {
		gradeValue := strings.ToLower(strings.TrimSpace(*request.Grade))
		if gradeValue == "" {
			return params, ErrGradeEmpty
		}

		validLevels, err := as.r.Authorization.ListExpertiseLevels()
		if err != nil {
			return params, err
		}

		grade := utils.ExpertiseLevel(gradeValue)
		if !containsExpertiseLevel(validLevels, grade) {
			return params, ErrInvalidGrade
		}
		params.Grade = &grade
	}

	return params, nil
}

func buildUserProfileResponse(profile *utils.InterviewUserProfile) *utils.UserProfileResponse {
	return &utils.UserProfileResponse{
		UserID:       profile.UserID,
		Nickname:     profile.Nickname,
		ProfessionID: profile.ProfessionID,
		Profession:   profile.Profession,
		Grade:        profile.ExpertiseLevel,
	}
}

func containsExpertiseLevel(levels []utils.ExpertiseLevel, target utils.ExpertiseLevel) bool {
	for _, level := range levels {
		if level == target {
			return true
		}
	}

	return false
}
