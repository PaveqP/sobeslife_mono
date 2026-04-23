package utils

type User struct {
	ID             int            `json:"id" db:"id"`
	Nickname       string         `json:"nickname" db:"nickname"`
	Email          string         `json:"email" db:"email"`
	DateOfBirth    string         `json:"date_of_birth" db:"date_of_birth"`
	ProfessionID   int            `json:"profession_id" db:"profession_id"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
}

type UserProfileResponse struct {
	UserID           int             `json:"user_id"`
	Nickname         *string         `json:"nickname,omitempty"`
	FirstName        *string         `json:"first_name,omitempty"`
	LastName         *string         `json:"last_name,omitempty"`
	ProfessionID     *int            `json:"profession_id,omitempty"`
	Profession       *string         `json:"profession,omitempty"`
	Grade            *ExpertiseLevel `json:"grade,omitempty"`
	YearsExperience  *int            `json:"years_experience,omitempty"`
	GithubURL        *string         `json:"github_url,omitempty"`
	LinkedinURL      *string         `json:"linkedin_url,omitempty"`
	About            *string         `json:"about,omitempty"`
	ProfileCompleted bool            `json:"profile_completed"`
}

type UpdateUserProfileRequest struct {
	Profession      *string `json:"profession"`
	Grade           *string `json:"grade"`
	Nickname        *string `json:"nickname"`
	FirstName       *string `json:"first_name"`
	LastName        *string `json:"last_name"`
	YearsExperience *int    `json:"years_experience"`
	GithubURL       *string `json:"github_url"`
	LinkedinURL     *string `json:"linkedin_url"`
	About           *string `json:"about"`
}

type UpdateUserProfileParams struct {
	ProfessionID    *int
	Grade           *ExpertiseLevel
	Nickname        *string
	FirstName       *string
	LastName        *string
	YearsExperience *int
	GithubURL       *string
	LinkedinURL     *string
	About           *string
}

type UserTest struct {
	ID          int        `json:"id" db:"id"`
	UserID      int        `json:"user_id" db:"user_id"`
	TestID      int        `json:"test_id" db:"test_id"`
	Status      TestStatus `json:"test_status" db:"test_status"`
	Score       int        `json:"score" db:"score"`
	StartedAt   string     `json:"started_at" db:"started_at"`
	CompletedAt string     `json:"completed_at" db:"completed_at"`
}
