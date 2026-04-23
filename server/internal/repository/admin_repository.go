package repository

import (
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"

	"github.com/jmoiron/sqlx"
)

type AdminRepository struct {
	db *sqlx.DB
}

func newAdminRepository(db *sqlx.DB) *AdminRepository {
	return &AdminRepository{db}
}

func (r *AdminRepository) CreateAdmin(name string, login string, email string, passwordHash string) (int, error) {
	query := "INSERT INTO admin_users (name, login, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id"
	var id int
	if err := r.db.QueryRow(query, name, login, email, passwordHash).Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r *AdminRepository) GetAdminByLogin(login string) (*utils.AdminIdentity, error) {
	query := "SELECT id, password_hash FROM admin_users WHERE lower(login) = lower($1) LIMIT 1"
	var identity utils.AdminIdentity
	if err := r.db.Get(&identity, query, login); err != nil {
		return nil, err
	}
	return &identity, nil
}

func (r *AdminRepository) ListAdmins() ([]utils.AdminListAdminItem, error) {
	query := `SELECT id, name, login, email, created_at::text FROM admin_users ORDER BY id ASC`
	result := make([]utils.AdminListAdminItem, 0)
	if err := r.db.Select(&result, query); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AdminRepository) DeleteAdmin(id int) error {
	_, err := r.db.Exec("DELETE FROM admin_users WHERE id = $1", id)
	return err
}

func (r *AdminRepository) GetStats() (*utils.AdminStatsResponse, error) {
	stats := &utils.AdminStatsResponse{}

	type intQuery struct {
		dest  *int
		query string
	}
	queries := []intQuery{
		{&stats.TotalUsers, "SELECT COUNT(*) FROM users"},
		{&stats.TotalTests, "SELECT COUNT(*) FROM test"},
		{&stats.TotalInterviews, "SELECT COUNT(*) FROM interview_session"},
		{&stats.ActiveInterviews, "SELECT COUNT(*) FROM interview_session WHERE status = 'in_progress'"},
		{&stats.CompletedTestsToday, "SELECT COUNT(*) FROM user_test WHERE test_status = 'completed' AND DATE(completed_at) = CURRENT_DATE"},
		{&stats.InterviewsStartedToday, "SELECT COUNT(*) FROM interview_session WHERE DATE(started_at) = CURRENT_DATE"},
		{&stats.InterviewsCompletedToday, "SELECT COUNT(*) FROM interview_session WHERE status = 'completed' AND DATE(finished_at) = CURRENT_DATE"},
		{&stats.NewUsersToday, "SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE"},
	}

	for _, q := range queries {
		if err := r.db.QueryRow(q.query).Scan(q.dest); err != nil {
			// non-fatal: if column doesn't exist yet keep 0
		}
	}

	return stats, nil
}

func (r *AdminRepository) ListWebUsers() ([]utils.AdminUserListItem, error) {
	query := `
		SELECT u.id, u.nickname, u.email,
			p.name AS profession, u.expertise_level::text,
			COALESCE(u.created_at::text, NOW()::text) AS created_at
		FROM users u
		LEFT JOIN profession p ON p.id = u.profession_id
		ORDER BY u.id DESC
	`
	result := make([]utils.AdminUserListItem, 0)
	if err := r.db.Select(&result, query); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AdminRepository) CreateWebUser(req utils.AdminCreateWebUserRequest) (*utils.AdminUserListItem, error) {
	var professionID *int
	if req.Profession != nil && *req.Profession != "" {
		var pid int
		if err := r.db.QueryRow("SELECT id FROM profession WHERE lower(name) = lower($1) LIMIT 1", *req.Profession).Scan(&pid); err == nil {
			professionID = &pid
		}
	}

	var id int
	err := r.db.QueryRow(`
		INSERT INTO users (email, nickname, profession_id, expertise_level)
		VALUES ($1, $2, $3, $4::expertise_level)
		RETURNING id`,
		req.Email, req.Nickname, professionID,
		expertiseLevelOrNil(req.ExpertiseLevel),
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	return r.getWebUserByID(id)
}

func (r *AdminRepository) UpdateWebUser(id int, req utils.AdminUpdateWebUserRequest) (*utils.AdminUserListItem, error) {
	sets := []string{}
	args := []interface{}{}
	idx := 1

	if req.Nickname != nil {
		sets = append(sets, fmt.Sprintf("nickname = $%d", idx))
		args = append(args, req.Nickname)
		idx++
	}
	if req.Email != nil {
		sets = append(sets, fmt.Sprintf("email = $%d", idx))
		args = append(args, req.Email)
		idx++
	}
	if req.Profession != nil {
		if *req.Profession == "" {
			sets = append(sets, fmt.Sprintf("profession_id = $%d", idx))
			args = append(args, nil)
			idx++
		} else {
			var pid int
			if err := r.db.QueryRow("SELECT id FROM profession WHERE lower(name) = lower($1) LIMIT 1", *req.Profession).Scan(&pid); err == nil {
				sets = append(sets, fmt.Sprintf("profession_id = $%d", idx))
				args = append(args, pid)
				idx++
			}
		}
	}
	if req.ExpertiseLevel != nil {
		sets = append(sets, fmt.Sprintf("expertise_level = $%d::expertise_level", idx))
		args = append(args, expertiseLevelOrNil(req.ExpertiseLevel))
		idx++
	}

	if len(sets) == 0 {
		return r.getWebUserByID(id)
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d", strings.Join(sets, ", "), idx)
	if _, err := r.db.Exec(query, args...); err != nil {
		return nil, err
	}

	return r.getWebUserByID(id)
}

func (r *AdminRepository) getWebUserByID(id int) (*utils.AdminUserListItem, error) {
	query := `
		SELECT u.id, u.nickname, u.email,
			p.name AS profession, u.expertise_level::text,
			COALESCE(u.created_at::text, NOW()::text) AS created_at
		FROM users u
		LEFT JOIN profession p ON p.id = u.profession_id
		WHERE u.id = $1
	`
	var item utils.AdminUserListItem
	if err := r.db.Get(&item, query, id); err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *AdminRepository) DeleteWebUser(userID int) error {
	_, err := r.db.Exec("DELETE FROM users WHERE id = $1", userID)
	return err
}

func (r *AdminRepository) ListInterviews() ([]utils.AdminInterviewListItem, error) {
	query := `
		SELECT s.id, s.user_id, u.email AS user_email,
			p.name AS profession, s.interview_level::text,
			s.status::text, s.duration_minutes,
			s.verdict_passed, s.started_at::text, s.finished_at::text
		FROM interview_session s
		JOIN users u ON u.id = s.user_id
		JOIN profession p ON p.id = s.profession_id
		ORDER BY s.started_at DESC
		LIMIT 500
	`
	result := make([]utils.AdminInterviewListItem, 0)
	if err := r.db.Select(&result, query); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AdminRepository) DeleteInterview(id int) error {
	_, err := r.db.Exec("DELETE FROM interview_session WHERE id = $1", id)
	return err
}

func (r *AdminRepository) GetAnalytics() (*utils.AdminAnalyticsResponse, error) {
	a := &utils.AdminAnalyticsResponse{
		DailyInterviews:        make([]utils.DailyCount, 0),
		DailyTestCompletes:     make([]utils.DailyCount, 0),
		DailyNewUsers:          make([]utils.DailyCount, 0),
		InterviewsByProfession: make([]utils.ProfessionCount, 0),
		InterviewsByLevel:      make([]utils.LevelCount, 0),
		TestsByLevel:           make([]utils.LevelCount, 0),
		PassRateByProfession:   make([]utils.ProfessionPassRate, 0),
	}

	// Scalar counts
	scalars := []struct {
		dest  *int
		query string
	}{
		{&a.TotalUsers, "SELECT COUNT(*) FROM users"},
		{&a.TotalTests, "SELECT COUNT(*) FROM test"},
		{&a.TotalInterviews, "SELECT COUNT(*) FROM interview_session"},
		{&a.PassedInterviews, "SELECT COUNT(*) FROM interview_session WHERE verdict_passed = true"},
		{&a.FailedInterviews, "SELECT COUNT(*) FROM interview_session WHERE verdict_passed = false"},
		{&a.CompletedTests, "SELECT COUNT(*) FROM user_test WHERE test_status = 'completed'"},
		{&a.InterviewsStartedToday, "SELECT COUNT(*) FROM interview_session WHERE DATE(started_at) = CURRENT_DATE"},
		{&a.InterviewsCompletedToday, "SELECT COUNT(*) FROM interview_session WHERE status = 'completed' AND DATE(finished_at) = CURRENT_DATE"},
		{&a.TestsCompletedToday, "SELECT COUNT(*) FROM user_test WHERE test_status = 'completed' AND DATE(completed_at) = CURRENT_DATE"},
		{&a.NewUsersToday, "SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE"},
	}
	for _, s := range scalars {
		_ = r.db.QueryRow(s.query).Scan(s.dest)
	}

	if a.PassedInterviews+a.FailedInterviews > 0 {
		a.OverallPassRate = float64(a.PassedInterviews) / float64(a.PassedInterviews+a.FailedInterviews) * 100
	}

	// Daily interviews last 14 days
	_ = r.db.Select(&a.DailyInterviews, `
		SELECT TO_CHAR(d, 'MM-DD') AS date, COALESCE(cnt, 0) AS count
		FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day') d
		LEFT JOIN (
			SELECT DATE(started_at) AS day, COUNT(*) AS cnt
			FROM interview_session
			WHERE started_at >= CURRENT_DATE - INTERVAL '13 days'
			GROUP BY day
		) t ON t.day = d
		ORDER BY d ASC
	`)

	// Daily test completes last 14 days
	_ = r.db.Select(&a.DailyTestCompletes, `
		SELECT TO_CHAR(d, 'MM-DD') AS date, COALESCE(cnt, 0) AS count
		FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day') d
		LEFT JOIN (
			SELECT DATE(completed_at) AS day, COUNT(*) AS cnt
			FROM user_test
			WHERE test_status = 'completed' AND completed_at >= CURRENT_DATE - INTERVAL '13 days'
			GROUP BY day
		) t ON t.day = d
		ORDER BY d ASC
	`)

	// Daily new users last 14 days
	_ = r.db.Select(&a.DailyNewUsers, `
		SELECT TO_CHAR(d, 'MM-DD') AS date, COALESCE(cnt, 0) AS count
		FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day') d
		LEFT JOIN (
			SELECT DATE(created_at) AS day, COUNT(*) AS cnt
			FROM users
			WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
			GROUP BY day
		) t ON t.day = d
		ORDER BY d ASC
	`)

	// Interviews by profession (top 10)
	_ = r.db.Select(&a.InterviewsByProfession, `
		SELECT p.name AS profession, COUNT(*) AS count
		FROM interview_session s
		JOIN profession p ON p.id = s.profession_id
		GROUP BY p.name
		ORDER BY count DESC
		LIMIT 10
	`)

	// Interviews by level
	_ = r.db.Select(&a.InterviewsByLevel, `
		SELECT interview_level::text AS level, COUNT(*) AS count
		FROM interview_session
		GROUP BY interview_level
		ORDER BY count DESC
	`)

	// Tests by level
	_ = r.db.Select(&a.TestsByLevel, `
		SELECT t.expertise_level::text AS level, COUNT(DISTINCT ut.id) AS count
		FROM user_test ut
		JOIN test t ON t.id = ut.test_id
		WHERE ut.test_status = 'completed'
		GROUP BY t.expertise_level
		ORDER BY count DESC
	`)

	// Pass rate by profession (top 10)
	_ = r.db.Select(&a.PassRateByProfession, `
		SELECT p.name AS profession,
			COUNT(*) AS total,
			COUNT(*) FILTER (WHERE s.verdict_passed = true) AS passed,
			ROUND(
				100.0 * COUNT(*) FILTER (WHERE s.verdict_passed = true) / NULLIF(COUNT(*) FILTER (WHERE s.verdict_passed IS NOT NULL), 0),
			2) AS pass_rate
		FROM interview_session s
		JOIN profession p ON p.id = s.profession_id
		WHERE s.status = 'completed'
		GROUP BY p.name
		HAVING COUNT(*) >= 1
		ORDER BY total DESC
		LIMIT 10
	`)

	return a, nil
}

// ── Tests (admin-specific, no user_id dependency) ────────────────────────────

func (r *AdminRepository) ListAdminTests() ([]utils.TestListItem, error) {
	query := `
		SELECT
			t.id,
			t.title,
			p.name AS profession,
			c.name AS chapter,
			te.name AS technology,
			t.expertise_level,
			COUNT(tq.id)::int AS question_count,
			NULL::text AS status,
			NULL::int AS score
		FROM test t
		JOIN profession p ON p.id = t.profession_id
		LEFT JOIN chapter c ON c.id = t.chapter_id
		LEFT JOIN technology te ON te.id = t.technology_id
		LEFT JOIN test_question tq ON tq.test_id = t.id
		GROUP BY t.id, p.name, c.name, te.name
		ORDER BY t.id ASC
	`
	result := make([]utils.TestListItem, 0)
	if err := r.db.Select(&result, query); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AdminRepository) CreateAdminTest(req utils.AdminCreateTestRequest) (*utils.TestListItem, error) {
	var professionID, chapterID int
	if err := r.db.QueryRow("SELECT id FROM profession WHERE lower(name) = lower($1) LIMIT 1", req.Profession).Scan(&professionID); err != nil {
		return nil, fmt.Errorf("profession not found: %w", err)
	}
	if err := r.db.QueryRow("SELECT id FROM chapter WHERE lower(name) = lower($1) LIMIT 1", req.Chapter).Scan(&chapterID); err != nil {
		return nil, fmt.Errorf("chapter not found: %w", err)
	}

	var technologyID *int
	if req.Technology != nil && *req.Technology != "" {
		var tid int
		if err := r.db.QueryRow("SELECT id FROM technology WHERE lower(name) = lower($1) LIMIT 1", *req.Technology).Scan(&tid); err == nil {
			technologyID = &tid
		}
	}

	var id int
	err := r.db.QueryRow(
		"INSERT INTO test (title, profession_id, chapter_id, technology_id, expertise_level) VALUES ($1, $2, $3, $4, $5::expertise_level) RETURNING id",
		req.Title, professionID, chapterID, technologyID, req.ExpertiseLevel,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	var item utils.TestListItem
	err = r.db.Get(&item, `
		SELECT t.id, t.title, p.name AS profession, c.name AS chapter,
			te.name AS technology, t.expertise_level, 0 AS question_count,
			NULL::text AS status, NULL::int AS score
		FROM test t
		JOIN profession p ON p.id = t.profession_id
		LEFT JOIN chapter c ON c.id = t.chapter_id
		LEFT JOIN technology te ON te.id = t.technology_id
		WHERE t.id = $1`, id)
	return &item, err
}

func (r *AdminRepository) DeleteAdminTest(id int) error {
	_, err := r.db.Exec("DELETE FROM test WHERE id = $1", id)
	return err
}

func (r *AdminRepository) ListTestQuestions(testID int) ([]utils.AdminTestQuestionItem, error) {
	query := `
		SELECT tq.id AS test_question_id, tq.question_id,
			q.text, q.correct_answer, q.question_type, q.expertise_level::text
		FROM test_question tq
		JOIN question q ON q.id = tq.question_id
		WHERE tq.test_id = $1
		ORDER BY tq.id ASC
	`
	result := make([]utils.AdminTestQuestionItem, 0)
	if err := r.db.Select(&result, query, testID); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AdminRepository) AddQuestionToTest(testID, questionID int) error {
	_, err := r.db.Exec("INSERT INTO test_question (test_id, question_id) VALUES ($1, $2)", testID, questionID)
	return err
}

func (r *AdminRepository) RemoveQuestionFromTest(testID, questionID int) error {
	_, err := r.db.Exec("DELETE FROM test_question WHERE test_id = $1 AND question_id = $2", testID, questionID)
	return err
}

// ── Questions CRUD ────────────────────────────────────────────────────────────

func (r *AdminRepository) ListQuestions(filters utils.AdminQuestionFilters) ([]utils.AdminQuestionListItem, error) {
	query := `
		SELECT q.id, q.text, q.correct_answer, q.question_type,
			p.name AS profession, c.name AS chapter,
			t.name AS technology, q.expertise_level::text
		FROM question q
		JOIN profession p ON p.id = q.profession_id
		JOIN chapter c ON c.id = q.chapter_id
		LEFT JOIN technology t ON t.id = q.technology_id
	`
	conds := []string{}
	args := []interface{}{}
	idx := 1
	if filters.Profession != "" {
		conds = append(conds, fmt.Sprintf("p.name ILIKE $%d", idx))
		args = append(args, "%"+filters.Profession+"%")
		idx++
	}
	if filters.Chapter != "" {
		conds = append(conds, fmt.Sprintf("c.name ILIKE $%d", idx))
		args = append(args, "%"+filters.Chapter+"%")
		idx++
	}
	if filters.Technology != "" {
		conds = append(conds, fmt.Sprintf("t.name ILIKE $%d", idx))
		args = append(args, "%"+filters.Technology+"%")
		idx++
	}
	if filters.ExpertiseLevel != "" {
		conds = append(conds, fmt.Sprintf("q.expertise_level::text = $%d", idx))
		args = append(args, filters.ExpertiseLevel)
		idx++
	}
	if len(conds) > 0 {
		query += " WHERE " + strings.Join(conds, " AND ")
	}
	query += " ORDER BY q.id DESC LIMIT 500"

	result := make([]utils.AdminQuestionListItem, 0)
	if err := r.db.Select(&result, query, args...); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AdminRepository) CreateQuestion(req utils.AdminCreateQuestionRequest) (*utils.AdminQuestionListItem, error) {
	var professionID, chapterID int
	if err := r.db.QueryRow("SELECT id FROM profession WHERE lower(name) = lower($1) LIMIT 1", req.Profession).Scan(&professionID); err != nil {
		return nil, fmt.Errorf("profession not found: %w", err)
	}
	if err := r.db.QueryRow("SELECT id FROM chapter WHERE lower(name) = lower($1) LIMIT 1", req.Chapter).Scan(&chapterID); err != nil {
		return nil, fmt.Errorf("chapter not found: %w", err)
	}
	var technologyID *int
	if req.Technology != nil && *req.Technology != "" {
		var tid int
		if err := r.db.QueryRow("SELECT id FROM technology WHERE lower(name) = lower($1) LIMIT 1", *req.Technology).Scan(&tid); err == nil {
			technologyID = &tid
		}
	}

	questionType := req.QuestionType
	if questionType == "" {
		questionType = "open"
	}

	var id int
	err := r.db.QueryRow(
		"INSERT INTO question (text, correct_answer, question_type, profession_id, chapter_id, technology_id, expertise_level) VALUES ($1, $2, $3, $4, $5, $6, $7::expertise_level) RETURNING id",
		req.Text, req.CorrectAnswer, questionType, professionID, chapterID, technologyID, req.ExpertiseLevel,
	).Scan(&id)
	if err != nil {
		return nil, err
	}
	return r.getQuestionByID(id)
}

func (r *AdminRepository) UpdateQuestion(id int, req utils.AdminUpdateQuestionRequest) (*utils.AdminQuestionListItem, error) {
	sets := []string{}
	args := []interface{}{}
	idx := 1

	if req.Text != nil {
		sets = append(sets, fmt.Sprintf("text = $%d", idx)); args = append(args, req.Text); idx++
	}
	if req.CorrectAnswer != nil {
		sets = append(sets, fmt.Sprintf("correct_answer = $%d", idx)); args = append(args, req.CorrectAnswer); idx++
	}
	if req.QuestionType != nil && *req.QuestionType != "" {
		sets = append(sets, fmt.Sprintf("question_type = $%d", idx)); args = append(args, req.QuestionType); idx++
	}
	if req.Profession != nil && *req.Profession != "" {
		var pid int
		if err := r.db.QueryRow("SELECT id FROM profession WHERE lower(name) = lower($1) LIMIT 1", *req.Profession).Scan(&pid); err == nil {
			sets = append(sets, fmt.Sprintf("profession_id = $%d", idx)); args = append(args, pid); idx++
		}
	}
	if req.Chapter != nil && *req.Chapter != "" {
		var cid int
		if err := r.db.QueryRow("SELECT id FROM chapter WHERE lower(name) = lower($1) LIMIT 1", *req.Chapter).Scan(&cid); err == nil {
			sets = append(sets, fmt.Sprintf("chapter_id = $%d", idx)); args = append(args, cid); idx++
		}
	}
	if req.ExpertiseLevel != nil && *req.ExpertiseLevel != "" {
		sets = append(sets, fmt.Sprintf("expertise_level = $%d::expertise_level", idx)); args = append(args, req.ExpertiseLevel); idx++
	}

	if len(sets) > 0 {
		args = append(args, id)
		query := fmt.Sprintf("UPDATE question SET %s WHERE id = $%d", strings.Join(sets, ", "), idx)
		if _, err := r.db.Exec(query, args...); err != nil {
			return nil, err
		}
	}
	return r.getQuestionByID(id)
}

func (r *AdminRepository) DeleteQuestion(id int) error {
	_, err := r.db.Exec("DELETE FROM question WHERE id = $1", id)
	return err
}

func (r *AdminRepository) getQuestionByID(id int) (*utils.AdminQuestionListItem, error) {
	var item utils.AdminQuestionListItem
	err := r.db.Get(&item, `
		SELECT q.id, q.text, q.correct_answer, q.question_type,
			p.name AS profession, c.name AS chapter,
			t.name AS technology, q.expertise_level::text
		FROM question q
		JOIN profession p ON p.id = q.profession_id
		JOIN chapter c ON c.id = q.chapter_id
		LEFT JOIN technology t ON t.id = q.technology_id
		WHERE q.id = $1`, id)
	return &item, err
}

func expertiseLevelOrNil(s *string) interface{} {
	if s == nil || *s == "" {
		return nil
	}
	return *s
}
