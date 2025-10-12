package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getTechnologiesByFilters(c *gin.Context) {
	module := c.Query("module")

	result, err := h.services.Shared.GetTechnologiesByFilters(module)
	if err != nil {
		logrus.Errorf("Fetching technologies failed: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, result)
}
