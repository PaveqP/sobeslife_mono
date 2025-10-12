package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type tokenClaims struct {
	jwt.StandardClaims
	UserId string `json:"user_id"`
}

type JWTHandlingService struct {
	config JWTConfig
}

func NewJWTHandlingService(config JWTConfig) *JWTHandlingService {
	return &JWTHandlingService{config}
}

func (hs *JWTHandlingService) GeneratedTokensPair(userId string) (*TokensPair, error) {
	accessToken, err := hs.generateAccessToken(userId)
	if err != nil {
		return nil, err
	}
	refreshToken, err := hs.generateRefreshToken(userId)
	if err != nil {
		return nil, err
	}

	return &TokensPair{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

func (hs *JWTHandlingService) VerifyAccessToken(accessToken string) (string, error) {
	return hs.verifyToken(accessToken, hs.config.AccessSigningKey)
}

func (hs *JWTHandlingService) VerifyRefreshToken(refreshToken string) (string, error) {
	return hs.verifyToken(refreshToken, hs.config.RefreshSigningKey)
}

func (hs *JWTHandlingService) RefreshTokens(refreshToken string) (*TokensPair, error) {
	userId, err := hs.VerifyRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}
	return hs.GeneratedTokensPair(userId)
}

func (hs *JWTHandlingService) generateAccessToken(userId string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(hs.config.AccessTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		userId,
	})

	return token.SignedString([]byte(hs.config.AccessSigningKey))
}

func (hs *JWTHandlingService) generateRefreshToken(userId string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(hs.config.RefreshTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		userId,
	})

	return token.SignedString([]byte(hs.config.RefreshSigningKey))
}

func (hs *JWTHandlingService) verifyToken(token string, signingKey string) (string, error) {
	parsedToken, err := jwt.ParseWithClaims(token, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(signingKey), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := parsedToken.Claims.(*tokenClaims); ok && parsedToken.Valid {
		return claims.UserId, nil
	}

	return "", errors.New("invalid token")
}
