package services

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"net/url"
	"sobeslife-services/internal/cache"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"strings"
	"time"

)

var (
	ErrUserProfileUpdateEmpty  = errors.New("no fields provided for update")
	ErrNicknameEmpty           = errors.New("nickname must not be empty")
	ErrProfessionEmpty         = errors.New("profession must not be empty")
	ErrGradeEmpty              = errors.New("grade must not be empty")
	ErrInvalidGrade            = errors.New("invalid grade")
	ErrGoogleEmailNotVerified  = errors.New("google account email is not verified")
	ErrGoogleEmailMissing      = errors.New("google account email is missing")
	ErrGithubEmailMissing      = errors.New("github account email is missing or not verified")
	ErrOTPExpired              = errors.New("OTP code expired or not found")
	ErrOTPInvalid              = errors.New("invalid OTP code")
)

type AuthService struct {
	r     *repository.Repository
	hs    *utils.JWTService
	cache *cache.CacheService
	email EmailSender
}

func newAuthService(r *repository.Repository, hs *utils.JWTService, c *cache.CacheService) *AuthService {
	var sender EmailSender
	apiKey := strings.TrimSpace(utils.GetEnv("RESEND_API_KEY"))
	from := strings.TrimSpace(utils.GetEnv("RESEND_FROM_EMAIL"))
	if apiKey != "" && from != "" {
		sender = newResendEmailSender(apiKey, from)
	} else {
		sender = newLogEmailSender()
	}
	return &AuthService{r: r, hs: hs, cache: c, email: sender}
}

// SendOTP generates a 6-digit code, stores it in cache, and sends it by email.
func (as *AuthService) SendOTP(ctx context.Context, email string) error {
	email = normalizeEmail(email)
	if email == "" {
		return errors.New("email is required")
	}

	code, err := generateOTPCode()
	if err != nil {
		return err
	}

	if err := as.cache.SetOTP(ctx, email, code); err != nil {
		return fmt.Errorf("failed to store OTP: %w", err)
	}

	return as.email.SendOTPEmail(ctx, email, code)
}

// VerifyOTP validates the code and returns JWT tokens, creating the user if new.
func (as *AuthService) VerifyOTP(ctx context.Context, email, code string) (*utils.TokensPair, error) {
	email = normalizeEmail(email)

	stored, err := as.cache.GetOTP(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("failed to read OTP: %w", err)
	}
	if stored == "" {
		return nil, ErrOTPExpired
	}
	if stored != code {
		return nil, ErrOTPInvalid
	}

	_ = as.cache.DeleteOTP(ctx, email)

	userCredentials, err := as.r.Authorization.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}

	userID := ""
	if userCredentials != nil {
		userID = userCredentials.UserId
	} else {
		userID, err = as.r.Authorization.CreateOTPUser(email)
		if err != nil {
			return nil, err
		}
	}

	return as.hs.GeneratedTokensPair(userID, utils.AudienceWeb)
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

func generateOTPCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// --- Google OAuth ---

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
		userID, err = as.r.Authorization.CreateGoogleUser(email, deriveNicknameFromEmail(email), "")
		if err != nil {
			return nil, err
		}
	}

	return as.hs.GeneratedTokensPair(userID, utils.AudienceWeb)
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

// --- GitHub OAuth ---

func (as *AuthService) GenerateGithubOauthRedirectURI(state string) string {
	queryParams := url.Values{}
	queryParams.Add("client_id", utils.GetEnv("OAUTH_GITHUB_CLIENT_ID"))
	queryParams.Add("redirect_uri", getGithubRedirectURI())
	queryParams.Add("scope", "user:email")
	if state != "" {
		queryParams.Add("state", state)
	}
	return "https://github.com/login/oauth/authorize?" + queryParams.Encode()
}

func (as *AuthService) AuthByGithubWithCode(code string) (*utils.TokensPair, error) {
	accessToken, err := as.exchangeGithubCode(code)
	if err != nil {
		return nil, err
	}

	email, nickname, err := as.fetchGithubUserInfo(accessToken)
	if err != nil {
		return nil, err
	}

	if email == "" {
		return nil, ErrGithubEmailMissing
	}

	userCredentials, err := as.r.Authorization.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}

	userID := ""
	if userCredentials != nil {
		userID = userCredentials.UserId
	} else {
		userID, err = as.r.Authorization.CreateGithubUser(email, nickname)
		if err != nil {
			return nil, err
		}
	}

	return as.hs.GeneratedTokensPair(userID, utils.AudienceWeb)
}

func (as *AuthService) exchangeGithubCode(code string) (string, error) {
	data := url.Values{}
	data.Set("client_id", utils.GetEnv("OAUTH_GITHUB_CLIENT_ID"))
	data.Set("client_secret", utils.GetEnv("OAUTH_GITHUB_CLIENT_SECRET"))
	data.Set("redirect_uri", getGithubRedirectURI())
	data.Set("code", code)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(http.MethodPost, "https://github.com/login/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	if result.Error != "" {
		return "", fmt.Errorf("github token exchange failed: %s", result.Error)
	}
	return result.AccessToken, nil
}

func (as *AuthService) fetchGithubUserInfo(accessToken string) (email, nickname string, err error) {
	client := &http.Client{Timeout: 10 * time.Second}

	// Try primary email from /user/emails first (handles private emails)
	emailsReq, err := http.NewRequest(http.MethodGet, "https://api.github.com/user/emails", nil)
	if err != nil {
		return "", "", err
	}
	emailsReq.Header.Set("Authorization", "Bearer "+accessToken)
	emailsReq.Header.Set("Accept", "application/vnd.github+json")

	emailsResp, err := client.Do(emailsReq)
	if err != nil {
		return "", "", err
	}
	defer emailsResp.Body.Close()

	var emails []utils.GithubUserEmail
	if emailsResp.StatusCode == http.StatusOK {
		_ = json.NewDecoder(emailsResp.Body).Decode(&emails)
		for _, e := range emails {
			if e.Primary && e.Verified {
				email = normalizeEmail(e.Email)
				break
			}
		}
	}

	// Fallback: get user profile for nickname
	userReq, err := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return email, "", err
	}
	userReq.Header.Set("Authorization", "Bearer "+accessToken)
	userReq.Header.Set("Accept", "application/vnd.github+json")

	userResp, err := client.Do(userReq)
	if err != nil {
		return email, "", err
	}
	defer userResp.Body.Close()

	var userInfo utils.GithubUserInfoResponse
	if userResp.StatusCode == http.StatusOK {
		_ = json.NewDecoder(userResp.Body).Decode(&userInfo)
		nickname = userInfo.Login
		if email == "" && userInfo.Email != "" {
			email = normalizeEmail(userInfo.Email)
		}
	}

	return email, nickname, nil
}

// --- Profile helpers ---

func (as *AuthService) buildUpdateProfileParams(request utils.UpdateUserProfileRequest) (utils.UpdateUserProfileParams, error) {
	params := utils.UpdateUserProfileParams{}

	hasAnyField := request.Nickname != nil || request.Profession != nil || request.Grade != nil ||
		request.FirstName != nil || request.LastName != nil || request.YearsExperience != nil ||
		request.GithubURL != nil || request.LinkedinURL != nil || request.About != nil

	if !hasAnyField {
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

	if request.FirstName != nil {
		v := strings.TrimSpace(*request.FirstName)
		params.FirstName = &v
	}
	if request.LastName != nil {
		v := strings.TrimSpace(*request.LastName)
		params.LastName = &v
	}
	if request.YearsExperience != nil {
		params.YearsExperience = request.YearsExperience
	}
	if request.GithubURL != nil {
		v := strings.TrimSpace(*request.GithubURL)
		params.GithubURL = &v
	}
	if request.LinkedinURL != nil {
		v := strings.TrimSpace(*request.LinkedinURL)
		params.LinkedinURL = &v
	}
	if request.About != nil {
		v := strings.TrimSpace(*request.About)
		params.About = &v
	}

	return params, nil
}

func buildUserProfileResponse(profile *utils.InterviewUserProfile) *utils.UserProfileResponse {
	return &utils.UserProfileResponse{
		UserID:           profile.UserID,
		Nickname:         profile.Nickname,
		FirstName:        profile.FirstName,
		LastName:         profile.LastName,
		ProfessionID:     profile.ProfessionID,
		Profession:       profile.Profession,
		Grade:            profile.ExpertiseLevel,
		YearsExperience:  profile.YearsExperience,
		GithubURL:        profile.GithubURL,
		LinkedinURL:      profile.LinkedinURL,
		About:            profile.About,
		ProfileCompleted: profile.ProfileCompleted,
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

func getGithubRedirectURI() string {
	redirectURI := strings.TrimSpace(utils.GetEnv("OAUTH_GITHUB_REDIRECT_URI"))
	if redirectURI == "" {
		return "http://localhost:5173/auth/github"
	}
	return redirectURI
}

func deriveNicknameFromEmail(email string) string {
	localPart := strings.TrimSpace(strings.Split(email, "@")[0])
	if localPart == "" {
		return "user"
	}
	if len(localPart) > 100 {
		return localPart[:100]
	}
	return localPart
}
