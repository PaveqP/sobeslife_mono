package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// Audience в JWT (claim aud) — разделяет сессии веб-пользователя и админ-панели при одних и тех же числовых id.
const (
	AudienceWeb   = "web"
	AudienceAdmin = "admin"
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

func (hs *JWTHandlingService) GeneratedTokensPair(userId string, audience string) (*TokensPair, error) {
	if audience != AudienceWeb && audience != AudienceAdmin {
		return nil, errors.New("invalid jwt audience")
	}
	accessToken, err := hs.generateAccessToken(userId, audience)
	if err != nil {
		return nil, err
	}
	refreshToken, err := hs.generateRefreshToken(userId, audience)
	if err != nil {
		return nil, err
	}

	return &TokensPair{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

func (hs *JWTHandlingService) VerifyWebAccessToken(accessToken string) (string, error) {
	claims, err := hs.parseAccessClaims(accessToken)
	if err != nil {
		return "", err
	}
	if claims.Audience != AudienceWeb {
		return "", errors.New("invalid token audience: expected web session")
	}
	return claims.UserId, nil
}

func (hs *JWTHandlingService) VerifyAdminAccessToken(accessToken string) (string, error) {
	claims, err := hs.parseAccessClaims(accessToken)
	if err != nil {
		return "", err
	}
	if claims.Audience != AudienceAdmin {
		return "", errors.New("invalid token audience: expected admin session")
	}
	return claims.UserId, nil
}

func (hs *JWTHandlingService) RefreshTokens(refreshToken string) (*TokensPair, error) {
	claims, err := hs.parseRefreshClaims(refreshToken)
	if err != nil {
		return nil, err
	}
	aud := claims.Audience
	if aud != AudienceWeb && aud != AudienceAdmin {
		return nil, errors.New("invalid refresh token audience")
	}
	return hs.GeneratedTokensPair(claims.UserId, aud)
}

func (hs *JWTHandlingService) generateAccessToken(userId string, audience string) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: now.Add(hs.config.AccessTTL).Unix(),
			IssuedAt:  now.Unix(),
			Audience:  audience,
		},
		userId,
	})

	return token.SignedString([]byte(hs.config.AccessSigningKey))
}

func (hs *JWTHandlingService) generateRefreshToken(userId string, audience string) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: now.Add(hs.config.RefreshTTL).Unix(),
			IssuedAt:  now.Unix(),
			Audience:  audience,
		},
		userId,
	})

	return token.SignedString([]byte(hs.config.RefreshSigningKey))
}

func (hs *JWTHandlingService) parseAccessClaims(token string) (*tokenClaims, error) {
	parsedToken, err := jwt.ParseWithClaims(token, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(hs.config.AccessSigningKey), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := parsedToken.Claims.(*tokenClaims)
	if !ok || !parsedToken.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func (hs *JWTHandlingService) parseRefreshClaims(token string) (*tokenClaims, error) {
	parsedToken, err := jwt.ParseWithClaims(token, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(hs.config.RefreshSigningKey), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := parsedToken.Claims.(*tokenClaims)
	if !ok || !parsedToken.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
