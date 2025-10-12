package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getAllProfessions(c *gin.Context) {
	result, err := h.services.Shared.GetAllProfessions()
	if err != nil {
		logrus.Errorf("Fetching professions failed: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, result)
}
