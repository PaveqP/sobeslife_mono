package cache

import (
	"time"

	"github.com/go-redis/redis/v8"
)

type CacheService struct {
	QuestionCache
}

func NewCacheService(client *redis.Client, expiration time.Duration) *CacheService {
	return &CacheService{QuestionCache: NewQuestionCacheService(client, expiration)}
}
