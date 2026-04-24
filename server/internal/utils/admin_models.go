package utils

type AdminUser struct {
	ID           int    `json:"id" db:"id"`
	Name         string `json:"name" db:"name"`
	Login        string `json:"login" db:"login"`
	Email        string `json:"email" db:"email"`
	PasswordHash string `json:"password_hash" db:"password_hash"`
	CreatedAt    string `json:"created_at" db:"created_at"`
}

type AdminCreateRequest struct {
	Name     string `json:"name" binding:"required"`
	Login    string `json:"login" binding:"required"`
	Email    string `json:"email"`
	Password string `json:"password" binding:"required"`
}

type AdminSignInRequest struct {
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AdminIdentity struct {
	ID           int    `db:"id"`
	PasswordHash string `db:"password_hash"`
}

type AdminTokenResponse struct {
	AccessToken string `json:"accessToken"`
}

type AdminListAdminItem struct {
	ID        int    `json:"id" db:"id"`
	Name      string `json:"name" db:"name"`
	Login     string `json:"login" db:"login"`
	Email     string `json:"email" db:"email"`
	CreatedAt string `json:"created_at" db:"created_at"`
}

type AdminUserListItem struct {
	ID               int     `json:"id" db:"id"`
	Nickname         *string `json:"nickname" db:"nickname"`
	FirstName        *string `json:"first_name" db:"first_name"`
	LastName         *string `json:"last_name" db:"last_name"`
	Email            string  `json:"email" db:"email"`
	Profession       *string `json:"profession" db:"profession"`
	ExpertiseLevel   *string `json:"expertise_level" db:"expertise_level"`
	YearsExperience  *int    `json:"years_experience" db:"years_experience"`
	GithubURL        *string `json:"github_url" db:"github_url"`
	LinkedinURL      *string `json:"linkedin_url" db:"linkedin_url"`
	About            *string `json:"about" db:"about"`
	ProfileCompleted bool    `json:"profile_completed" db:"profile_completed"`
	CreatedAt        string  `json:"created_at" db:"created_at"`
}

type AdminCreateWebUserRequest struct {
	Email          string  `json:"email" binding:"required"`
	Nickname       *string `json:"nickname"`
	Profession     *string `json:"profession"`
	ExpertiseLevel *string `json:"expertise_level"`
}

type AdminUpdateWebUserRequest struct {
	Nickname       *string `json:"nickname"`
	Email          *string `json:"email"`
	Profession     *string `json:"profession"`
	ExpertiseLevel *string `json:"expertise_level"`
}

type AdminStatsResponse struct {
	TotalUsers               int `json:"total_users"`
	TotalTests               int `json:"total_tests"`
	TotalInterviews          int `json:"total_interviews"`
	ActiveInterviews         int `json:"active_interviews"`
	CompletedTestsToday      int `json:"completed_tests_today"`
	NewUsersToday            int `json:"new_users_today"`
	InterviewsStartedToday   int `json:"interviews_started_today"`
	InterviewsCompletedToday int `json:"interviews_completed_today"`
}

type AdminInterviewListItem struct {
	ID             int     `json:"id" db:"id"`
	UserID         int     `json:"user_id" db:"user_id"`
	UserEmail      string  `json:"user_email" db:"user_email"`
	Profession     string  `json:"profession" db:"profession"`
	InterviewLevel string  `json:"interview_level" db:"interview_level"`
	Status         string  `json:"status" db:"status"`
	DurationMins   int     `json:"duration_minutes" db:"duration_minutes"`
	VerdictPassed  *bool   `json:"verdict_passed" db:"verdict_passed"`
	StartedAt      string  `json:"started_at" db:"started_at"`
	FinishedAt     *string `json:"finished_at" db:"finished_at"`
}

// Test & Question management

type AdminCreateTestRequest struct {
	Title          string  `json:"title" binding:"required"`
	Profession     string  `json:"profession" binding:"required"`
	Chapter        string  `json:"chapter" binding:"required"`
	Technology     *string `json:"technology"`
	ExpertiseLevel string  `json:"expertise_level" binding:"required"`
}

type AdminTestQuestionItem struct {
	TestQuestionID int    `json:"test_question_id" db:"test_question_id"`
	QuestionID     int    `json:"question_id" db:"question_id"`
	Text           string `json:"text" db:"text"`
	CorrectAnswer  string `json:"correct_answer" db:"correct_answer"`
	QuestionType   string `json:"question_type" db:"question_type"`
	ExpertiseLevel string `json:"expertise_level" db:"expertise_level"`
}

type AdminAddQuestionToTestRequest struct {
	QuestionID int `json:"question_id" binding:"required"`
}

type AdminQuestionListItem struct {
	ID             int     `json:"id" db:"id"`
	Text           string  `json:"text" db:"text"`
	CorrectAnswer  string  `json:"correct_answer" db:"correct_answer"`
	QuestionType   string  `json:"question_type" db:"question_type"`
	Profession     string  `json:"profession" db:"profession"`
	Chapter        string  `json:"chapter" db:"chapter"`
	Technology     *string `json:"technology" db:"technology"`
	ExpertiseLevel string  `json:"expertise_level" db:"expertise_level"`
}

type AdminQuestionFilters struct {
	Profession     string
	Chapter        string
	Technology     string
	ExpertiseLevel string
}

type AdminCreateQuestionRequest struct {
	Text           string  `json:"text" binding:"required"`
	CorrectAnswer  string  `json:"correct_answer" binding:"required"`
	QuestionType   string  `json:"question_type"`
	Profession     string  `json:"profession" binding:"required"`
	Chapter        string  `json:"chapter" binding:"required"`
	Technology     *string `json:"technology"`
	ExpertiseLevel string  `json:"expertise_level" binding:"required"`
}

type AdminUpdateQuestionRequest struct {
	Text           *string `json:"text"`
	CorrectAnswer  *string `json:"correct_answer"`
	QuestionType   *string `json:"question_type"`
	Profession     *string `json:"profession"`
	Chapter        *string `json:"chapter"`
	Technology     *string `json:"technology"`
	ExpertiseLevel *string `json:"expertise_level"`
}

// Analytics types

type DailyCount struct {
	Date  string `json:"date" db:"date"`
	Count int    `json:"count" db:"count"`
}

type ProfessionCount struct {
	Profession string `json:"profession" db:"profession"`
	Count      int    `json:"count" db:"count"`
}

type LevelCount struct {
	Level string `json:"level" db:"level"`
	Count int    `json:"count" db:"count"`
}

type ProfessionPassRate struct {
	Profession string  `json:"profession" db:"profession"`
	Total      int     `json:"total" db:"total"`
	Passed     int     `json:"passed" db:"passed"`
	PassRate   float64 `json:"pass_rate" db:"pass_rate"`
}

type AdminAnalyticsResponse struct {
	TotalUsers       int `json:"total_users"`
	TotalTests       int `json:"total_tests"`
	TotalInterviews  int `json:"total_interviews"`
	PassedInterviews int `json:"passed_interviews"`
	FailedInterviews int `json:"failed_interviews"`
	CompletedTests   int `json:"completed_tests"`

	NewUsersToday            int `json:"new_users_today"`
	InterviewsStartedToday   int `json:"interviews_started_today"`
	InterviewsCompletedToday int `json:"interviews_completed_today"`
	TestsCompletedToday      int `json:"tests_completed_today"`

	OverallPassRate float64 `json:"overall_pass_rate"`

	DailyInterviews    []DailyCount `json:"daily_interviews"`
	DailyTestCompletes []DailyCount `json:"daily_test_completes"`
	DailyNewUsers      []DailyCount `json:"daily_new_users"`

	InterviewsByProfession []ProfessionCount    `json:"interviews_by_profession"`
	InterviewsByLevel      []LevelCount         `json:"interviews_by_level"`
	TestsByLevel           []LevelCount         `json:"tests_by_level"`
	PassRateByProfession   []ProfessionPassRate `json:"pass_rate_by_profession"`
}
