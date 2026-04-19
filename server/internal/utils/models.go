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

type CreateUserQuery struct {
	Nickname    string `json:"nickname" db:"nickname"`
	Email       string `json:"email" db:"email"`
	PhoneNumber string `json:"phone_number" db:"phone_number"`
	Password    string `json:"password" db:"password"`
}

type AuthRequest struct {
	Nickname    *string `json:"nickname" db:"nickname"`
	Email       *string `json:"email" db:"email"`
	PhoneNumber *string `json:"phone_number" db:"phone_number"`
	Password    string  `json:"password" db:"password"`
}

type GoogleCodeCallback struct {
	Code         *string `json:"code"`
	CodeVerifier *string `json:"code_verifier"`
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
