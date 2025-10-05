package repository

import (
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"

	"github.com/jmoiron/sqlx"
)

type QuestionRepository struct {
	db *sqlx.DB
}

func newQuestionRepository(db *sqlx.DB) *QuestionRepository {
	return &QuestionRepository{db}
}

func (qr *QuestionRepository) GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error) {
	table_name := "question"
	baseQuery := fmt.Sprintf(`SELECT 
	q.text, q.correct_answer, q.expertise_level, p.name as profession, c.name as chapter, t.name as technology FROM %s q 
	JOIN profession p ON q.profession_id = p.id 
	JOIN chapter c ON q.chapter_id = c.id 
	LEFT JOIN technology t 
	ON q.technology_id = t.id`, table_name)
	whereClause, params := qr.buildWhereClause(filters)
	query := baseQuery + whereClause

	var result []utils.QuestionResponse
	err := qr.db.Select(&result, query, params...)

	return result, err
}

func (qr *QuestionRepository) buildWhereClause(filters utils.QuestionFilters) (string, []interface{}) {
	conditions := []string{}
	params := []interface{}{}
	paramCount := 0

	if filters.Profession != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("p.name = $%d", paramCount))
		params = append(params, filters.Profession)
	}

	if filters.Module != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("c.name = $%d", paramCount))
		params = append(params, filters.Module)
	}

	if filters.Technology != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("t.name = $%d", paramCount))
		params = append(params, filters.Technology)
	}

	if len(conditions) > 0 {
		return " WHERE " + strings.Join(conditions, " AND "), params
	}

	return "", params
}
