package services

import (
	"errors"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"strconv"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrAdminLoginTaken         = errors.New("admin with this login already exists")
	ErrAdminNotFound           = errors.New("admin not found")
	ErrAdminInvalidCredentials = errors.New("invalid login or password")
)

type AdminService struct {
	repo repository.Admin
	jwt  *utils.JWTService
}

func newAdminService(repo repository.Admin, jwt *utils.JWTService) *AdminService {
	return &AdminService{repo: repo, jwt: jwt}
}

func (s *AdminService) CreateAdmin(req utils.AdminCreateRequest) (*utils.AdminTokenResponse, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	id, err := s.repo.CreateAdmin(req.Name, req.Login, req.Email, string(hash))
	if err != nil {
		return nil, ErrAdminLoginTaken
	}

	tokens, err := s.jwt.GeneratedTokensPair(strconv.Itoa(id), utils.AudienceAdmin)
	if err != nil {
		return nil, err
	}

	return &utils.AdminTokenResponse{AccessToken: tokens.AccessToken}, nil
}

func (s *AdminService) SignIn(req utils.AdminSignInRequest) (*utils.AdminTokenResponse, error) {
	identity, err := s.repo.GetAdminByLogin(req.Login)
	if err != nil || identity == nil {
		return nil, ErrAdminNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(identity.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrAdminInvalidCredentials
	}

	tokens, err := s.jwt.GeneratedTokensPair(strconv.Itoa(identity.ID), utils.AudienceAdmin)
	if err != nil {
		return nil, err
	}

	return &utils.AdminTokenResponse{AccessToken: tokens.AccessToken}, nil
}

func (s *AdminService) GetStats() (*utils.AdminStatsResponse, error) {
	return s.repo.GetStats()
}

func (s *AdminService) ListAdmins() ([]utils.AdminListAdminItem, error) {
	return s.repo.ListAdmins()
}

func (s *AdminService) DeleteAdmin(id int) error {
	return s.repo.DeleteAdmin(id)
}

func (s *AdminService) ListWebUsers() ([]utils.AdminUserListItem, error) {
	return s.repo.ListWebUsers()
}

func (s *AdminService) CreateWebUser(req utils.AdminCreateWebUserRequest) (*utils.AdminUserListItem, error) {
	return s.repo.CreateWebUser(req)
}

func (s *AdminService) UpdateWebUser(id int, req utils.AdminUpdateWebUserRequest) (*utils.AdminUserListItem, error) {
	return s.repo.UpdateWebUser(id, req)
}

func (s *AdminService) DeleteWebUser(id int) error {
	return s.repo.DeleteWebUser(id)
}

func (s *AdminService) ListInterviews() ([]utils.AdminInterviewListItem, error) {
	return s.repo.ListInterviews()
}

func (s *AdminService) DeleteInterview(id int) error {
	return s.repo.DeleteInterview(id)
}

func (s *AdminService) GetAnalytics() (*utils.AdminAnalyticsResponse, error) {
	return s.repo.GetAnalytics()
}

func (s *AdminService) ListAdminTests() ([]utils.TestListItem, error) {
	return s.repo.ListAdminTests()
}

func (s *AdminService) CreateAdminTest(req utils.AdminCreateTestRequest) (*utils.TestListItem, error) {
	return s.repo.CreateAdminTest(req)
}

func (s *AdminService) DeleteAdminTest(id int) error {
	return s.repo.DeleteAdminTest(id)
}

func (s *AdminService) ListTestQuestions(testID int) ([]utils.AdminTestQuestionItem, error) {
	return s.repo.ListTestQuestions(testID)
}

func (s *AdminService) AddQuestionToTest(testID, questionID int) error {
	return s.repo.AddQuestionToTest(testID, questionID)
}

func (s *AdminService) RemoveQuestionFromTest(testID, questionID int) error {
	return s.repo.RemoveQuestionFromTest(testID, questionID)
}

func (s *AdminService) ListQuestions(filters utils.AdminQuestionFilters) ([]utils.AdminQuestionListItem, error) {
	return s.repo.ListQuestions(filters)
}

func (s *AdminService) CreateQuestion(req utils.AdminCreateQuestionRequest) (*utils.AdminQuestionListItem, error) {
	return s.repo.CreateQuestion(req)
}

func (s *AdminService) UpdateQuestion(id int, req utils.AdminUpdateQuestionRequest) (*utils.AdminQuestionListItem, error) {
	return s.repo.UpdateQuestion(id, req)
}

func (s *AdminService) DeleteQuestion(id int) error {
	return s.repo.DeleteQuestion(id)
}
