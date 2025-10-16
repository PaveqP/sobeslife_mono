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
