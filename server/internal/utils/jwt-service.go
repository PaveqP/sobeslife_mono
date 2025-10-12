package utils

import (
	"time"
)

type JWTConfig struct {
	AccessTTL         time.Duration
	RefreshTTL        time.Duration
	AccessSigningKey  string
	RefreshSigningKey string
}

type TokensPair struct {
	AccessToken  string
	RefreshToken string
}

type TokenHandling interface {
	GeneratedTokensPair(userId string) (*TokensPair, error)
	VerifyAccessToken(accessToken string) (string, error)
	VerifyRefreshToken(refreshToken string) (string, error)
	RefreshTokens(refreshToken string) (*TokensPair, error)
}

type JWTService struct {
	TokenHandling
}

func NewJWTService(config JWTConfig) *JWTService {
	return &JWTService{
		TokenHandling: NewJWTHandlingService(config),
	}
}
