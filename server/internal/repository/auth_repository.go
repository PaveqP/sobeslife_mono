package repository

import (
	"sobeslife-services/internal/utils"

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
