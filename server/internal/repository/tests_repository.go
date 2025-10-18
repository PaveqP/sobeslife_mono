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
	defer trx.Rollback()

	var professionId, chapterId, technologyId string

	getProfessionIdQuery := "SELECT id FROM profession WHERE name = $1"
	getChapterIdQuery := "SELECT id FROM chapter WHERE name = $1"
	getTechnologyIdQuery := "SELECT id FROM technology WHERE name = $1"

	err = trx.QueryRow(getProfessionIdQuery, testParameters.Profession).Scan(&professionId)
	if err != nil {
		return utils.Test{}, err
	}

	err = trx.QueryRow(getChapterIdQuery, testParameters.Chapter).Scan(&chapterId)
	if err != nil {
		return utils.Test{}, err
	}

	err = trx.QueryRow(getTechnologyIdQuery, testParameters.Technology).Scan(&technologyId)
	if err != nil {
		return utils.Test{}, err
	}

	insertTestQuery := "INSERT INTO test (title, profession_id, chapter_id, technology_id, expertise_level) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, profession_id, chapter_id, technology_id, expertise_level"
	var test utils.Test
	err = trx.QueryRow(insertTestQuery, testParameters.Title, professionId, chapterId, technologyId, testParameters.ExpertiseLevel).Scan(
		&test.ID,
		&test.Title,
		&test.ProfessionID,
		&test.ChapterID,
		&test.TechnologyID,
		&test.ExpertiseLevel,
	)
	if err != nil {
		return utils.Test{}, err
	}

	insertTestQuestionQuery := "INSERT INTO test_question (test_id, question_id) VALUES ($1, $2)"
	for _, questionID := range questions {
		_, err := trx.Exec(insertTestQuestionQuery, test.ID, questionID)
		if err != nil {
			return utils.Test{}, err
		}
	}

	if err := trx.Commit(); err != nil {
		return utils.Test{}, err
	}

	return test, nil
}

func (tr *TestsRepository) Start(user_id string, test_id string, currentTime string, testStatus utils.TestStatus) error {
	query := "INSERT INTO user_test (user_id, test_id, test_status, started_at) VALUES ($1, $2, $3, $4)"
	_, err := tr.db.Exec(query, user_id, test_id, testStatus, currentTime)
	if err != nil {
		return err
	}

	return nil
}

func (tr *TestsRepository) SetUsersAnswer(test_id string, question_id string, answer string, isCorrect bool) error {
	query := "UPDATE test_question SET answer = $1, is_correct = $2, points = $3 WHERE test_id = $4 AND question_id = $5"
	var points int
	if isCorrect {
		points = 1
	} else {
		points = 0
	}
	result, err := tr.db.Exec(query, answer, isCorrect, points, test_id, question_id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no rows updated - test_id %s or question_id %s not found", test_id, question_id)
	}

	return nil
}

func (tr *TestsRepository) Complete(user_id string, test_id string, currentTime string, testStatus utils.TestStatus) (*utils.TestStatsResponse, error) {
	getPointsQuery := "SELECT COALESCE(SUM(points), 0) FROM test_question WHERE test_id = $1"
	var points int
	if err := tr.db.Get(&points, getPointsQuery, test_id); err != nil {
		return nil, err
	}
	updateQuery := `
        UPDATE user_test 
        SET test_status = $1, score = $2, completed_at = $3 
        WHERE user_id = $4 AND test_id = $5
    `
	_, err := tr.db.Exec(updateQuery, testStatus, points, currentTime, user_id, test_id)
	if err != nil {
		return nil, err
	}

	getTestStatsQuery := `SELECT 
		t.id, 
		t.title, 
		t.expertise_level,
		p.name as profession_name,
		c.name as chapter_name,
		te.name as technology_name,
		ut.test_status,
		ut.score,
		ut.started_at,
		ut.completed_at
		FROM test t 
		JOIN profession p ON p.id = t.profession_id 
		LEFT JOIN chapter c ON c.id = t.chapter_id 
		LEFT JOIN technology te ON te.id = t.technology_id 
		LEFT JOIN user_test ut ON ut.test_id = t.id AND ut.user_id = $2
	WHERE t.id = $1`

	getTestStatsQuestionsQuery := `SELECT 
    q.id as question_id,
    q.text,
    tq.is_correct,
    tq.answer as user_answer,
    q.correct_answer,
    tq.points
	FROM test_question tq
	JOIN question q ON tq.question_id = q.id
	WHERE tq.test_id = $1
	ORDER BY tq.id
	`

	var testStats utils.TestStats
	var testQuestionStats []utils.TestQuestionStats

	err = tr.db.Get(&testStats, getTestStatsQuery, test_id, user_id)
	if err != nil {
		return nil, err
	}
	err = tr.db.Select(&testQuestionStats, getTestStatsQuestionsQuery, test_id)
	if err != nil {
		return nil, err
	}

	return &utils.TestStatsResponse{
		TestStats: testStats,
		Questions: testQuestionStats,
	}, nil
}
