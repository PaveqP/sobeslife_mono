package repository

import (
	"fmt"
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
)

type TestsRepository struct {
	db *sqlx.DB
}

func newTestsRepository(db *sqlx.DB) *TestsRepository {
	return &TestsRepository{db}
}

func (tr *TestsRepository) Generate(testParameters utils.CreateTestRequest, questions []string) (utils.Test, error) {
	trx, err := tr.db.DB.Begin()
	if err != nil {
		return utils.Test{}, err
	}

	var professionId, chapterId, technologyId string

	getProfessionIdQuery := "SELECT id FROM profession WHERE name = $1"
	getChapterIdQuery := "SELECT id FROM chapter WHERE name = $1"
	getTechnologyIdQuery := "SELECT id FROM technology WHERE name = $1"

	if err := tr.db.Get(&professionId, getProfessionIdQuery, testParameters.Profession); err != nil {
		trx.Rollback()
		return utils.Test{}, err
	}
	if err := tr.db.Get(&chapterId, getChapterIdQuery, testParameters.Chapter); err != nil {
		trx.Rollback()
		return utils.Test{}, err
	}
	if err := tr.db.Get(&technologyId, getTechnologyIdQuery, testParameters.Technology); err != nil {
		trx.Rollback()
		return utils.Test{}, err
	}

	insertTestQuery := fmt.Sprintf("INSERT INTO %s (title, profession_id, chapter_id, technology_id, expertise_level) VALUES ($1, $2, $3, $4, $5) RETURNING *", "test")
	var test utils.Test
	row := trx.QueryRow(insertTestQuery, testParameters.Title, professionId, chapterId, technologyId, testParameters.ExpertiseLevel)
	if err := row.Scan(&test.ID,
		&test.Title,
		&test.ProfessionID,
		&test.ChapterID,
		&test.TechnologyID,
		&test.ExpertiseLevel,
	); err != nil {
		trx.Rollback()
		return utils.Test{}, err
	}

	insertTestQuestionQuery := fmt.Sprintf("INSERT INTO %s (test_id, question_id) VALUES ($1, $2)", "test_question")
	for _, value := range questions {
		_, err := trx.Exec(insertTestQuestionQuery, test.ID, value)
		if err != nil {
			trx.Rollback()
			return utils.Test{}, err
		}
	}

	return test, trx.Commit()
}
