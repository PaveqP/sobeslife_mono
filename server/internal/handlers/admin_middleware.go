package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const adminIdKey = "adminId"

func (h *Handler) identifyAdmin(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)
	if header == "" {
		logrus.Error("empty auth header for admin route")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "empty auth header")
		return
	}

	headerParts := strings.Split(header, " ")
	if len(headerParts) != correctHeaderLength {
		logrus.Error("invalid auth header for admin route")
		c.AbortWithStatusJSON(http.StatusUnauthorized, "invalid auth header")
		return
	}

	adminId, err := h.jwt.VerifyAdminAccessToken(headerParts[1])
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, err.Error())
		return
	}

	c.Set(adminIdKey, adminId)
	c.Next()
}
