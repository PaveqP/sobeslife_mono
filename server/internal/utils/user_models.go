package utils

type User struct {
	ID             int            `json:"id" db:"id"`
	Nickname       string         `json:"nickname" db:"nickname"`
	Email          string         `json:"email" db:"email"`
	PasswordHash   string         `json:"password_hash" db:"password_hash"`
	PhoneNumber    string         `json:"phone_number" db:"phone_number"`
	DateOfBirth    string         `json:"date_of_birth" db:"date_of_birth"`
	ProfessionID   int            `json:"profession_id" db:"profession_id"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
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
