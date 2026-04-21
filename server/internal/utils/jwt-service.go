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
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// TokenHandling — access-токены разделены по audience (web vs admin).
type TokenHandling interface {
	GeneratedTokensPair(userId string, audience string) (*TokensPair, error)
	VerifyWebAccessToken(accessToken string) (string, error)
	VerifyAdminAccessToken(accessToken string) (string, error)
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
