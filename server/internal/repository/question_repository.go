package repository

import (
	"fmt"
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

type QuestionRepository struct {
	db *sqlx.DB
}

func newQuestionRepository(db *sqlx.DB) *QuestionRepository {
	return &QuestionRepository{db}
}

func (qr *QuestionRepository) GetAllQuestions() ([]utils.Question, error) {
	tableName := "question"
	query := fmt.Sprintf("SELECT * FROM %s", tableName)

	var result []utils.Question

	err := qr.db.Select(&result, query)
	if err != nil {
		logrus.Error("Extract data failed: ", err)
		return nil, err
	}

	return result, nil
}

func (qr *QuestionRepository) GetQuestionsByProfession(professionId string) ([]utils.Question, error) {
	tableName := "question"
	query := fmt.Sprintf("SELECT * FROM %s WHERE profession_id = $1", tableName)

	var result []utils.Question

	err := qr.db.Select(&result, query, professionId)
	if err != nil {
		logrus.Error("Extract data failed: ", err)
		return nil, err
	}

	return result, nil
}
func (qr *QuestionRepository) GetQuestionsByModule(moduleId string) ([]utils.Question, error) {
	tableName := "question"
	query := fmt.Sprintf("SELECT * FROM %s WHERE chapter_id = $1", tableName)

	var result []utils.Question

	err := qr.db.Select(&result, query, moduleId)
	if err != nil {
		logrus.Error("Extract data failed: ", err)
		return nil, err
	}

	return result, nil
}
func (qr *QuestionRepository) GetQuestionsByTechnology(technologyId string) ([]utils.Question, error) {
	tableName := "question"
	query := fmt.Sprintf("SELECT * FROM %s WHERE technology_id = $1", tableName)

	var result []utils.Question

	err := qr.db.Select(&result, query, technologyId)
	if err != nil {
		logrus.Error("Extract data failed: ", err)
		return nil, err
	}

	return result, nil
}
func (qr *QuestionRepository) GetQuestionsForTest(professionId string, moduleId string, technologyId string) ([]utils.Question, error) {
	tableName := "question"
	query := fmt.Sprintf("SELECT * FROM %s WHERE profession_id = $1 AND chapter_id = $2 AND technology_id = $3", tableName)

	var result []utils.Question

	err := qr.db.Select(&result, query, professionId, moduleId, technologyId)
	if err != nil {
		logrus.Error("Extract data failed: ", err)
		return nil, err
	}

	return result, nil
}
