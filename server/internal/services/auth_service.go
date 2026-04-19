package services

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserProfileUpdateEmpty  = errors.New("no fields provided for update")
	ErrNicknameEmpty           = errors.New("nickname must not be empty")
	ErrProfessionEmpty         = errors.New("profession must not be empty")
	ErrGradeEmpty              = errors.New("grade must not be empty")
	ErrInvalidGrade            = errors.New("invalid grade")
	ErrGoogleEmailNotVerified  = errors.New("google account email is not verified")
	ErrGoogleEmailMissing      = errors.New("google account email is missing")
	ErrNicknameAuthUnsupported = errors.New("nickname authentication is not supported")
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
	return nil, ErrNicknameAuthUnsupported
}
func (as *AuthService) AuthByEmail(email string, password string) (*utils.TokensPair, error) {
	userCredentials, err := as.r.Authorization.GetUserByEmail(normalizeEmail(email))
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

func (as *AuthService) GenerateGoogleOauthRedirectURI(state string, codeChallenge string) string {
	baseURL := "https://accounts.google.com/o/oauth2/v2/auth"

	queryParams := url.Values{}
	queryParams.Add("client_id", utils.GetEnv("OAUTH_GOOGLE_CLIENT_ID"))
	queryParams.Add("redirect_uri", getGoogleRedirectURI())
	queryParams.Add("response_type", "code")
	queryParams.Add("scope", "openid email")
	queryParams.Add("prompt", "select_account")
	if state != "" {
		queryParams.Add("state", state)
	}
	if codeChallenge != "" {
		queryParams.Add("code_challenge", codeChallenge)
		queryParams.Add("code_challenge_method", "S256")
	}

	return baseURL + "?" + queryParams.Encode()
}

func (as *AuthService) AuthByGoogleWithCode(code string, codeVerifier string) (*utils.TokensPair, error) {
	tokenResp, err := as.exchangeGoogleCode(code, codeVerifier)
	if err != nil {
		return nil, err
	}

	userInfo, err := as.fetchGoogleUserInfo(tokenResp.AccessToken)
	if err != nil {
		return nil, err
	}

	email := normalizeEmail(userInfo.Email)
	if email == "" {
		return nil, ErrGoogleEmailMissing
	}
	if !userInfo.EmailVerified {
		return nil, ErrGoogleEmailNotVerified
	}

	userCredentials, err := as.r.Authorization.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}

	userID := ""
	if userCredentials != nil {
		userID = userCredentials.UserId
	} else {
		passwordSecret, err := generateRandomSecret(32)
		if err != nil {
			return nil, err
		}

		passwordHash, err := generatePasswordHash(passwordSecret)
		if err != nil {
			return nil, err
		}

		userID, err = as.r.Authorization.CreateGoogleUser(email, deriveNicknameFromEmail(email), passwordHash)
		if err != nil {
			return nil, err
		}
	}

	return as.hs.GeneratedTokensPair(userID)
}

func (as *AuthService) exchangeGoogleCode(code string, codeVerifier string) (*utils.GoogleTokenResponse, error) {
	data := url.Values{}
	data.Set("client_id", utils.GetEnv("OAUTH_GOOGLE_CLIENT_ID"))
	data.Set("client_secret", utils.GetEnv("OAUTH_GOOGLE_CLIENT_SECRET"))
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", getGoogleRedirectURI())
	data.Set("code", code)
	if codeVerifier != "" {
		data.Set("code_verifier", codeVerifier)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("https://oauth2.googleapis.com/token", "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)

		var googleErr utils.GoogleErrorResponse
		if err := json.Unmarshal(bodyBytes, &googleErr); err == nil && googleErr.Error != "" {
			return nil, fmt.Errorf(
				"google token exchange failed: status %d, error=%s, description=%s",
				resp.StatusCode,
				googleErr.Error,
				googleErr.ErrorDescription,
			)
		}

		return nil, fmt.Errorf(
			"google token exchange failed: status %d, body=%s",
			resp.StatusCode,
			string(bodyBytes),
		)
	}

	var tokenResp utils.GoogleTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func (as *AuthService) fetchGoogleUserInfo(accessToken string) (*utils.GoogleUserInfoResponse, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest(http.MethodGet, "https://openidconnect.googleapis.com/v1/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("google userinfo failed: status %d, body=%s", resp.StatusCode, string(bodyBytes))
	}

	var userInfo utils.GoogleUserInfoResponse
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
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

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func getGoogleRedirectURI() string {
	redirectURI := strings.TrimSpace(utils.GetEnv("OAUTH_GOOGLE_REDIRECT_URI"))
	if redirectURI == "" {
		return "http://localhost:5173/auth/google"
	}
	return redirectURI
}

func generateRandomSecret(byteLength int) (string, error) {
	bytes := make([]byte, byteLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}

func deriveNicknameFromEmail(email string) string {
	localPart := strings.TrimSpace(strings.Split(email, "@")[0])
	if localPart == "" {
		return "google-user"
	}
	if len(localPart) > 100 {
		return localPart[:100]
	}
	return localPart
}
