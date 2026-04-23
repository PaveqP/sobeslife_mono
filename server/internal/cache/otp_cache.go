package cache

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

const (
	otpKeyPrefix = "otp:"
	otpTTL       = 10 * time.Minute
)

type redisOTPCache struct {
	client *redis.Client
}

func newOTPCache(client *redis.Client) *redisOTPCache {
	return &redisOTPCache{client: client}
}

func (c *redisOTPCache) SetOTP(ctx context.Context, email, code string) error {
	return c.client.Set(ctx, otpKeyPrefix+email, code, otpTTL).Err()
}

func (c *redisOTPCache) GetOTP(ctx context.Context, email string) (string, error) {
	code, err := c.client.Get(ctx, otpKeyPrefix+email).Result()
	if err == redis.Nil {
		return "", nil
	}
	return code, err
}

func (c *redisOTPCache) DeleteOTP(ctx context.Context, email string) error {
	return c.client.Del(ctx, otpKeyPrefix+email).Err()
}
