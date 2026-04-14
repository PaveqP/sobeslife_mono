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
	isAdminKey          = "isAdmin"
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

	userId, err := h.jwt.VerifyAccessToken(headerParts[1])
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, err)
		return
	}

	isAdmin, err := h.services.GetIsAdmin(userId)
	if err != nil {
		logrus.Error("Cant identify user status")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "Cant identify user status")
		return
	}

	c.Set(userIdKey, userId)
	c.Set(isAdminKey, isAdmin)
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
