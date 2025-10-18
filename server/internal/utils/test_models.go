package utils

import "database/sql"

type Test struct {
	ID             int            `json:"id" db:"id"`
	Title          string         `json:"title" db:"title"`
	ProfessionID   int            `json:"profession_id" db:"profession_id"`
	ChapterID      int            `json:"chapter_id" db:"chapter_id"`
	TechnologyID   int            `json:"technology_id" db:"technology_id"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
}

type TestResponse struct {
	ID             int            `json:"id" db:"id"`
	Title          string         `json:"title" db:"title"`
	Profession     string         `json:"profession" db:"profession"`
	Chapter        string         `json:"chapter" db:"chapter"`
	Technology     string         `json:"technology" db:"technology"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
	Questions      []QuestionResponse
}

type TestCompleteResponse struct {
	ID             int            `json:"id" db:"id"`
	Title          string         `json:"title" db:"title"`
	Profession     string         `json:"profession" db:"profession"`
	Chapter        string         `json:"chapter" db:"chapter"`
	Technology     string         `json:"technology" db:"technology"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
	Questions      []QuestionResponse
}

type CreateTestRequest struct {
	Title          string         `json:"title" db:"title"`
	Profession     string         `json:"profession" db:"profession"`
	Chapter        string         `json:"chapter" db:"chapter"`
	Technology     string         `json:"technology" db:"technology"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
}

type Question struct {
	ID             int            `json:"id" db:"id"`
	Text           string         `json:"text" db:"text"`
	CorrectAnswer  string         `json:"correct_answer" db:"correct_answer"`
	ProfessionID   int            `json:"profession_id" db:"profession_id"`
	ChapterID      int            `json:"chapter_id" db:"chapter_id"`
	TechnologyID   sql.NullInt64  `json:"technology_id" db:"technology_id"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
}

type QuestionResponse struct {
	ID             string         `json:"id" db:"id"`
	Text           string         `json:"text" db:"text"`
	CorrectAnswer  string         `json:"correct_answer" db:"correct_answer"`
	Profession     string         `json:"profession" db:"profession"`
	Chapter        string         `json:"chapter" db:"chapter"`
	Technology     *string        `json:"technology" db:"technology"`
	ExpertiseLevel ExpertiseLevel `json:"expertise_level" db:"expertise_level"`
}

type QuestionFilters struct {
	Profession string
	Module     string
	Technology string
}

type QuestionTechnology struct {
	ID           int `json:"id" db:"id"`
	QuestionID   int `json:"question_id" db:"question_id"`
	TechnologyID int `json:"technology_id" db:"technology_id"`
}

type TestQuestion struct {
	ID         int `json:"id" db:"id"`
	TestID     int `json:"test_id" db:"test_id"`
	QuestionID int `json:"question_id" db:"question_id"`
}

type UsersAnswer struct {
	Answer string `json:"answer"`
}

type UserAnswerInTest struct {
	QuestionId string `json:"question_id"`
	Answer     string `json:"answer"`
}

type TestStatsResponse struct {
	TestStats
	Questions []TestQuestionStats
}

type TestStats struct {
	ID             int     `db:"id"`
	Title          string  `db:"title"`
	ExpertiseLevel string  `db:"expertise_level"`
	ProfessionName string  `db:"profession_name"`
	ChapterName    *string `db:"chapter_name"`
	TechnologyName *string `db:"technology_name"`
	TestStatus     *string `db:"test_status"`
	Score          *int    `db:"score"`
	StartedAt      string  `db:"started_at"`
	CompletedAt    string  `db:"completed_at"`
}

type TestQuestionStats struct {
	QuestionID    int     `db:"question_id" json:"question_id"`
	Text          string  `db:"text" json:"text"`
	IsCorrect     *bool   `db:"is_correct" json:"is_correct"`
	UserAnswer    *string `db:"user_answer" json:"user_answer"`
	CorrectAnswer string  `db:"correct_answer" json:"correct_answer"`
	Points        *int    `db:"points" json:"points"`
}
