package utils

import "database/sql"

type Test struct {
	ID             int            `json:"id" db:"id"`
	Title          string         `json:"title" db:"title"`
	ProfessionID   int            `json:"profession_id" db:"profession_id"`
	TechnologyID   int            `json:"technology_id" db:"technology_id"`
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
