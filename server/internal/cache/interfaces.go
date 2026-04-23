package cache

import (
	"context"
	"sobeslife-services/internal/utils"
)

type QuestionCache interface {
	GetQuestions(ctx context.Context, filters utils.QuestionFilters) ([]utils.QuestionResponse, error)
	SetQuestions(ctx context.Context, filters utils.QuestionFilters, questions []utils.QuestionResponse) error
	InvalidateCache(ctx context.Context, filters utils.QuestionFilters) error
}

type OTPCache interface {
	SetOTP(ctx context.Context, email, code string) error
	GetOTP(ctx context.Context, email string) (string, error)
	DeleteOTP(ctx context.Context, email string) error
}
