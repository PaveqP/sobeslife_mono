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

func (r *AuthRepository) CreateUser(userParams utils.CreateUserQuery) (string, error) {
	query := "INSERT INTO users (nickname, email, phone_number, password_hash, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id"
	row := r.db.QueryRow(query, userParams.Nickname, userParams.Email, userParams.PhoneNumber, userParams.Password, false)
	var userId string
	if err := row.Scan(&userId); err != nil {
		return "", err
	}
	return userId, nil
}

func (r *AuthRepository) CreateGoogleUser(email string, nickname string, passwordHash string) (string, error) {
	query := "INSERT INTO users (nickname, email, phone_number, password_hash, is_admin) VALUES ($1, $2, NULL, $3, $4) RETURNING id"
	row := r.db.QueryRow(query, nickname, email, passwordHash, false)
	var userId string
	if err := row.Scan(&userId); err != nil {
		return "", err
	}
	return userId, nil
}

func (r *AuthRepository) GetUserByEmail(email string) (*utils.UserIdentity, error) {
	query := "SELECT id, password_hash FROM users WHERE lower(email) = lower($1) LIMIT 2"

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

func (r *AuthRepository) GetUserByPhoneNumber(phoneNumber string) (*utils.UserIdentity, error) {
	query := "SELECT id, password_hash FROM users WHERE phone_number = $1"
	var userCredentials utils.UserIdentity
	err := r.db.Get(&userCredentials, query, phoneNumber)
	if err != nil {
		return nil, err
	}
	return &userCredentials, nil
}

func (r *AuthRepository) GetIsAdmin(userId string) (bool, error) {
	query := "SELECT is_admin FROM users WHERE id = $1"
	var isAdmin bool
	err := r.db.Get(&isAdmin, query, userId)
	if err != nil {
		return false, err
	}
	return isAdmin, nil
}

func (r *AuthRepository) UpdateUserProfile(userID string, params utils.UpdateUserProfileParams) (bool, error) {
	fields := make([]string, 0, 3)
	args := make([]interface{}, 0, 4)

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
	if len(fields) == 0 {
		return false, nil
	}

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

func (r *AuthRepository) GetUser(nickname string, email string, phoneNumber string, password string) (utils.User, error) {
	user := utils.User{
		ID:             1,
		Nickname:       "sfdfs",
		Email:          "vfdvfdvdf",
		PasswordHash:   "vfdbdfbfd",
		PhoneNumber:    "45423523",
		DateOfBirth:    "svfsdbsd",
		ProfessionID:   1,
		ExpertiseLevel: "junior",
	}
	return user, nil
}
