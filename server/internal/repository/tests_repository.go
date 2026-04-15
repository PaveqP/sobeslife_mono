package repository

import (
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"

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

func (tr *TestsRepository) List(user_id string, filters utils.TestListFilters) ([]utils.TestListItem, error) {
	baseQuery := `SELECT 
		t.id,
		t.title,
		p.name AS profession,
		c.name AS chapter,
		te.name AS technology,
		t.expertise_level,
		COUNT(tq.id)::int AS question_count,
		ut.test_status AS status,
		ut.score
	FROM test t
	JOIN profession p ON p.id = t.profession_id
	LEFT JOIN chapter c ON c.id = t.chapter_id
	LEFT JOIN technology te ON te.id = t.technology_id
	LEFT JOIN test_question tq ON tq.test_id = t.id
	LEFT JOIN LATERAL (
		SELECT test_status, score
		FROM user_test
		WHERE user_id = $1 AND test_id = t.id
		ORDER BY COALESCE(completed_at, started_at) DESC NULLS LAST, id DESC
		LIMIT 1
	) ut ON true`

	whereClause, params := tr.buildTestsWhereClause(filters, 2)
	query := baseQuery + whereClause + `
	GROUP BY t.id, p.name, c.name, te.name, ut.test_status, ut.score
	ORDER BY t.id ASC`

	args := append([]interface{}{user_id}, params...)
	var result []utils.TestListItem
	if err := tr.db.Select(&result, query, args...); err != nil {
		return nil, err
	}

	return result, nil
}

func (tr *TestsRepository) GetByID(user_id string, test_id string) (*utils.TestDetailsResponse, error) {
	getTestQuery := `SELECT 
		t.id,
		t.title,
		p.name AS profession,
		c.name AS chapter,
		te.name AS technology,
		t.expertise_level,
		ut.test_status AS status
	FROM test t
	JOIN profession p ON p.id = t.profession_id
	LEFT JOIN chapter c ON c.id = t.chapter_id
	LEFT JOIN technology te ON te.id = t.technology_id
	LEFT JOIN LATERAL (
		SELECT test_status
		FROM user_test
		WHERE user_id = $2 AND test_id = t.id
		ORDER BY COALESCE(completed_at, started_at) DESC NULLS LAST, id DESC
		LIMIT 1
	) ut ON true
	WHERE t.id = $1`

	getQuestionsQuery := `SELECT 
		q.id,
		q.text,
		tq.answer AS user_answer,
		tq.is_correct
	FROM test_question tq
	JOIN question q ON q.id = tq.question_id
	WHERE tq.test_id = $1
	ORDER BY tq.id`

	var testDetails utils.TestDetailsResponse
	if err := tr.db.Get(&testDetails, getTestQuery, test_id, user_id); err != nil {
		return nil, err
	}

	var questions []utils.TestQuestionDetails
	if err := tr.db.Select(&questions, getQuestionsQuery, test_id); err != nil {
		return nil, err
	}

	testDetails.Questions = questions

	return &testDetails, nil
}

func (tr *TestsRepository) GetStatistics(user_id string) (*utils.UserTestsStatisticsResponse, error) {
	query := `WITH completed_tests AS (
		SELECT DISTINCT ON (ut.test_id)
			ut.test_id
		FROM user_test ut
		WHERE ut.user_id = $1
			AND ut.test_status = 'completed'
		ORDER BY ut.test_id, ut.completed_at DESC NULLS LAST, ut.id DESC
	),
	answer_stats AS (
		SELECT
			COUNT(*)::int AS total_questions_count,
			COUNT(*) FILTER (WHERE tq.is_correct = true)::int AS correct_answers_count,
			COUNT(*) FILTER (WHERE tq.is_correct = false)::int AS incorrect_answers_count
		FROM completed_tests ct
		JOIN test_question tq ON tq.test_id = ct.test_id
	),
	topic_stats AS (
		SELECT
			c.name AS topic,
			COUNT(*)::int AS total_questions_count,
			COUNT(*) FILTER (WHERE tq.is_correct = false)::int AS error_count
		FROM completed_tests ct
		JOIN test_question tq ON tq.test_id = ct.test_id
		JOIN question q ON q.id = tq.question_id
		JOIN chapter c ON c.id = q.chapter_id
		GROUP BY c.name
	)
	SELECT
		(SELECT COUNT(*)::int FROM completed_tests) AS completed_tests_count,
		COALESCE((SELECT correct_answers_count FROM answer_stats), 0) AS correct_answers_count,
		COALESCE((SELECT incorrect_answers_count FROM answer_stats), 0) AS incorrect_answers_count,
		(SELECT topic FROM topic_stats ORDER BY error_count DESC, total_questions_count DESC, topic ASC LIMIT 1) AS most_error_topic,
		(SELECT topic FROM topic_stats ORDER BY error_count ASC, total_questions_count DESC, topic ASC LIMIT 1) AS least_error_topic,
		COALESCE(
			ROUND(
				CASE
					WHEN COALESCE((SELECT total_questions_count FROM answer_stats), 0) = 0 THEN 0
					ELSE (
						(SELECT correct_answers_count FROM answer_stats)::numeric
						/ (SELECT total_questions_count FROM answer_stats)::numeric
					) * 100
				END,
				2
			),
			0
		)::float8 AS correct_answers_percent`

	var result utils.UserTestsStatisticsResponse
	if err := tr.db.Get(&result, query, user_id); err != nil {
		return nil, err
	}

	return &result, nil
}

func (tr *TestsRepository) Start(user_id string, test_id string, currentTime string, testStatus utils.TestStatus) error {
	updateQuery := `
		UPDATE user_test
		SET test_status = $1,
			started_at = COALESCE(started_at, $2),
			completed_at = NULL
		WHERE user_id = $3 AND test_id = $4
	`
	result, err := tr.db.Exec(updateQuery, testStatus, currentTime, user_id, test_id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected > 0 {
		return nil
	}

	insertQuery := "INSERT INTO user_test (user_id, test_id, test_status, started_at) VALUES ($1, $2, $3, $4)"
	_, err = tr.db.Exec(insertQuery, user_id, test_id, testStatus, currentTime)
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

func (tr *TestsRepository) buildTestsWhereClause(filters utils.TestListFilters, startParamCount int) (string, []interface{}) {
	conditions := []string{}
	params := []interface{}{}
	paramCount := startParamCount - 1

	if filters.Title != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("t.title ILIKE $%d", paramCount))
		params = append(params, "%"+filters.Title+"%")
	}

	if filters.Profession != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("p.name = $%d", paramCount))
		params = append(params, filters.Profession)
	}

	if filters.Chapter != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("c.name = $%d", paramCount))
		params = append(params, filters.Chapter)
	}

	if filters.Technology != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("te.name = $%d", paramCount))
		params = append(params, filters.Technology)
	}

	if filters.ExpertiseLevel != "" {
		paramCount++
		conditions = append(conditions, fmt.Sprintf("t.expertise_level = $%d", paramCount))
		params = append(params, filters.ExpertiseLevel)
	}

	if len(conditions) == 0 {
		return "", params
	}

	return " WHERE " + strings.Join(conditions, " AND "), params
}
