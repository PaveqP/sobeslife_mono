package handlers

import (
	"net/http"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *Handler) getQuestionsByFilters(c *gin.Context) {
	filters := utils.QuestionFilters{
		Profession: c.Query("profession"),
		Module:     c.Query("module"),
		Technology: c.Query("technology"),
	}

	result, err := h.services.GetQuestionsByFilters(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, result)
}
