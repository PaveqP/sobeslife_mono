package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
)

type QuestionCacheService struct {
	client     *redis.Client
	expiration time.Duration
}

func NewQuestionCacheService(client *redis.Client, expiration time.Duration) *QuestionCacheService {
	return &QuestionCacheService{
		client:     client,
		expiration: expiration,
	}
}

func (qc *QuestionCacheService) GetQuestions(ctx context.Context, filters utils.QuestionFilters) ([]utils.QuestionResponse, error) {
	key := qc.generateCacheKey(filters)

	data, err := qc.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get questions data from cache: %w", err)
	}

	var questions []utils.QuestionResponse
	if err := json.Unmarshal(data, &questions); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached data: %w", err)
	}

	return questions, nil
}

func (qc *QuestionCacheService) SetQuestions(ctx context.Context, filters utils.QuestionFilters, questions []utils.QuestionResponse) error {
	key := qc.generateCacheKey(filters)

	data, err := json.Marshal(questions)
	if err != nil {
		return fmt.Errorf("failed to marshal questions: %w", err)
	}

	if err := qc.client.Set(ctx, key, data, qc.expiration).Err(); err != nil {
		return fmt.Errorf("failed to set cache: %w", err)
	}

	return nil
}

func (qc *QuestionCacheService) InvalidateCache(ctx context.Context, filters utils.QuestionFilters) error {
	key := qc.generateCacheKey(filters)
	return qc.client.Del(ctx, key).Err()
}

func (qc *QuestionCacheService) GetCacheStats(ctx context.Context) (map[string]string, error) {
	keys := qc.client.Keys(ctx, "questions:*").Val()

	stats := make(map[string]string)
	for _, key := range keys {
		ttl := qc.client.TTL(ctx, key).Val()
		stats[key] = ttl.String()
	}

	return stats, nil
}

func (qc *QuestionCacheService) generateCacheKey(filters utils.QuestionFilters) string {
	parts := []string{"questions"}

	if filters.Profession != "" {
		parts = append(parts, "profession", qc.normalizeKey(filters.Profession))
	}
	if filters.Module != "" {
		parts = append(parts, "module", qc.normalizeKey(filters.Module))
	}
	if filters.Technology != "" {
		parts = append(parts, "technology", qc.normalizeKey(filters.Technology))
	}

	if len(parts) == 1 {
		parts = append(parts, "allQuestions")
	}

	return strings.Join(parts, ":")
}

func (qc *QuestionCacheService) normalizeKey(key string) string {
	keyWords := strings.Split(key, " ")
	if len(keyWords) > 1 {
		for i, word := range keyWords {
			keyWords[i] = strings.ToUpper(string(word[0])) + word[1:]
		}
	}
	return strings.Join(keyWords, "")
}
