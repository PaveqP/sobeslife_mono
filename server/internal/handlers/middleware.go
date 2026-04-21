package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const (
	authorizationHeader = "Authorization"
	correctHeaderLength = 2
	userIdKey           = "userId"
)

func (h *Handler) identifyUser(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)

	if header == "" {
		logrus.Error("empty auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "empty auth header")
		return
	}

	headerParts := strings.Split(header, " ")
	if len(headerParts) != correctHeaderLength {
		logrus.Error("invalid auth header")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "invalid auth header")
		return
	}

	userId, err := h.jwt.VerifyWebAccessToken(headerParts[1])
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, err)
		return
	}

	// Не вызываем GetIsAdmin на каждый запрос: флаг нигде в хендлерах не используется,
	// а лишний SELECT давал 401 при любой ошибке БД / рассинхроне id.
	c.Set(userIdKey, userId)
	c.Next()
}

func getUserId(c *gin.Context) (string, error) {
	userId, ok := c.Get(userIdKey)

	if !ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, "user id not found")
		return "", errors.New("user id not found")
	}

	return userId.(string), nil
}
