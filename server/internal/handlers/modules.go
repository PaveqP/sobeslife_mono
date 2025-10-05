package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getModulesByFilters(c *gin.Context) {
	profession := c.Query("profession")

	result, err := h.services.Shared.GetModulesByFilters(profession)
	if err != nil {
		logrus.Errorf("Fetching modules failed: %s", err)
		c.JSON(http.StatusInternalServerError, err)
	}
	c.JSON(http.StatusOK, result)
}
