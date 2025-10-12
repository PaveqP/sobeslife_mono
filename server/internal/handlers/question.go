package handlers

import (
	"net/http"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getQuestionsByFilters(c *gin.Context) {
	filters := utils.QuestionFilters{
		Profession: c.Query("profession"),
		Module:     c.Query("module"),
		Technology: c.Query("technology"),
	}

	result, err := h.services.GetQuestionsByFilters(filters)
	if err != nil {
		logrus.Errorf("Fetching questions failed: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, result)
}
