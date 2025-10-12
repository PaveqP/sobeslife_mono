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

type UserIdentity struct {
	UserId         string `json:"user_id" db:"id"`
	HashedPassword string `json:"password" db:"password_hash"`
}
