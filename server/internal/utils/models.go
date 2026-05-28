package utils

type ExpertiseLevel string

const (
	ExpertiseTrainee ExpertiseLevel = "trainee"
	ExpertiseJunior  ExpertiseLevel = "junior"
	ExpertiseMiddle  ExpertiseLevel = "middle"
	ExpertiseSenior  ExpertiseLevel = "senior"
)

type TestStatus string

const (
	TestAssigned   TestStatus = "assigned"
	TestInProgress TestStatus = "in_progress"
	TestCompleted  TestStatus = "completed"
	TestExpired    TestStatus = "expired"
	TestCancelled  TestStatus = "cancelled"
)

type InterviewStatus string

const (
	InterviewInProgress  InterviewStatus = "in_progress"
	InterviewCompleted   InterviewStatus = "completed"
	InterviewSummaryFail InterviewStatus = "summary_failed"
)

type InterviewMessageRole string

const (
	InterviewMessageAssistant InterviewMessageRole = "assistant"
	InterviewMessageUser      InterviewMessageRole = "user"
)

type Profession struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type Technology struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type Chapter struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type GoogleCodeCallback struct {
	Code         *string `json:"code"`
	CodeVerifier *string `json:"code_verifier"`
	RedirectURI  *string `json:"redirect_uri"`
}

type UserIdentity struct {
	UserId         string `json:"user_id" db:"id"`
	HashedPassword string `json:"password" db:"password_hash"`
}

type GoogleErrorResponse struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

type GoogleTokenResponse struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token,omitempty"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
	IDToken      string `json:"id_token"`
}

type GoogleUserInfoResponse struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
}

// OTP auth
type OTPSendRequest struct {
	Email string `json:"email" binding:"required"`
}

type OTPVerifyRequest struct {
	Email string `json:"email" binding:"required"`
	Code  string `json:"code" binding:"required"`
}

// GitHub OAuth
type GithubCodeCallback struct {
	Code        string  `json:"code"`
	State       string  `json:"state"`
	RedirectURI *string `json:"redirect_uri"`
}

type GithubUserEmail struct {
	Email    string `json:"email"`
	Primary  bool   `json:"primary"`
	Verified bool   `json:"verified"`
}

type GithubUserInfoResponse struct {
	ID    int    `json:"id"`
	Login string `json:"login"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
