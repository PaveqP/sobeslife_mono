package repository

import (
	"database/sql"
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"

	"github.com/jmoiron/sqlx"
)

type AuthRepository struct {
	db *sqlx.DB
}

func newAuthRepository(db *sqlx.DB) *AuthRepository {
	return &AuthRepository{db}
}

func (r *AuthRepository) CreateGoogleUser(email string, nickname string, _ string) (string, error) {
	query := "INSERT INTO users (nickname, email) VALUES ($1, $2) RETURNING id"
	row := r.db.QueryRow(query, nickname, email)
	var userId string
	if err := row.Scan(&userId); err != nil {
		return "", err
	}
	return userId, nil
}

func (r *AuthRepository) CreateGithubUser(email string, nickname string) (string, error) {
	query := "INSERT INTO users (nickname, email) VALUES ($1, $2) RETURNING id"
	row := r.db.QueryRow(query, nickname, email)
	var userId string
	if err := row.Scan(&userId); err != nil {
		return "", err
	}
	return userId, nil
}

func (r *AuthRepository) CreateOTPUser(email string) (string, error) {
	query := "INSERT INTO users (email) VALUES ($1) RETURNING id"
	row := r.db.QueryRow(query, email)
	var userId string
	if err := row.Scan(&userId); err != nil {
		return "", err
	}
	return userId, nil
}

func (r *AuthRepository) GetUserByEmail(email string) (*utils.UserIdentity, error) {
	query := "SELECT id, '' AS password_hash FROM users WHERE lower(email) = lower($1) LIMIT 2"

	var users []utils.UserIdentity
	if err := r.db.Select(&users, query, email); err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return nil, nil
	}
	if len(users) > 1 {
		return nil, fmt.Errorf("multiple users found with email %s", email)
	}

	return &users[0], nil
}

func (r *AuthRepository) UpdateUserProfile(userID string, params utils.UpdateUserProfileParams) (bool, error) {
	fields := make([]string, 0, 10)
	args := make([]interface{}, 0, 11)

	if params.Nickname != nil {
		args = append(args, *params.Nickname)
		fields = append(fields, fmt.Sprintf("nickname = $%d", len(args)))
	}
	if params.ProfessionID != nil {
		args = append(args, *params.ProfessionID)
		fields = append(fields, fmt.Sprintf("profession_id = $%d", len(args)))
	}
	if params.Grade != nil {
		args = append(args, *params.Grade)
		fields = append(fields, fmt.Sprintf("expertise_level = $%d", len(args)))
	}
	if params.FirstName != nil {
		args = append(args, *params.FirstName)
		fields = append(fields, fmt.Sprintf("first_name = $%d", len(args)))
	}
	if params.LastName != nil {
		args = append(args, *params.LastName)
		fields = append(fields, fmt.Sprintf("last_name = $%d", len(args)))
	}
	if params.YearsExperience != nil {
		args = append(args, *params.YearsExperience)
		fields = append(fields, fmt.Sprintf("years_experience = $%d", len(args)))
	}
	if params.GithubURL != nil {
		args = append(args, *params.GithubURL)
		fields = append(fields, fmt.Sprintf("github_url = $%d", len(args)))
	}
	if params.LinkedinURL != nil {
		args = append(args, *params.LinkedinURL)
		fields = append(fields, fmt.Sprintf("linkedin_url = $%d", len(args)))
	}
	if params.About != nil {
		args = append(args, *params.About)
		fields = append(fields, fmt.Sprintf("about = $%d", len(args)))
	}

	if len(fields) == 0 {
		return false, nil
	}

	fields = append(fields, "profile_completed = true")

	args = append(args, userID)
	query := fmt.Sprintf(
		"UPDATE users SET %s WHERE id = $%d RETURNING id",
		strings.Join(fields, ", "),
		len(args),
	)

	var updatedUserID int
	if err := r.db.Get(&updatedUserID, query, args...); err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (r *AuthRepository) ListExpertiseLevels() ([]utils.ExpertiseLevel, error) {
	query := "SELECT unnest(enum_range(NULL::expertise_level))::text"

	var rawLevels []string
	if err := r.db.Select(&rawLevels, query); err != nil {
		return nil, err
	}

	levels := make([]utils.ExpertiseLevel, 0, len(rawLevels))
	for _, level := range rawLevels {
		levels = append(levels, utils.ExpertiseLevel(level))
	}

	return levels, nil
}
