package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) metricsMiddleware(c *gin.Context) {
	start := time.Now()

	c.Next()

	duration := time.Since(start)
	path := c.Request.URL.Path
	method := c.Request.Method

	logrus.WithFields(logrus.Fields{
		"method":   method,
		"path":     path,
		"duration": duration.Milliseconds(),
		"status":   c.Writer.Status(),
	}).Info("Request processed")
}
