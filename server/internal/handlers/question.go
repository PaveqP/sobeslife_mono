package handlers

import (
	"context"
	"net/http"
	"sobeslife-services/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getQuestionsByFilters(c *gin.Context) {
	filters := utils.QuestionFilters{
		Profession: c.Query("profession"),
		Module:     c.Query("module"),
		Technology: c.Query("technology"),
	}

	cachedResult, err := h.cacheService.GetQuestions(c.Request.Context(), filters)
	if err == nil && cachedResult != nil {
		c.JSON(http.StatusOK, cachedResult)
		return
	}

	result, err := h.services.GetQuestionsByFilters(filters)
	if err != nil {
		logrus.Errorf("Fetching questions failed: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := h.cacheService.SetQuestions(ctx, filters, result); err != nil {
			logrus.Warnf("Failed to cache questions: %s", err)
		}
	}()

	c.JSON(http.StatusOK, result)
}

func (h *Handler) checkAnswer(c *gin.Context) {
	question_id := c.Param("id")
	var answer utils.UsersAnswer
	if err := c.BindJSON(&answer); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	if answer.Answer == "" {
		logrus.Error("User`s answer is empty")
		c.AbortWithStatusJSON(http.StatusBadRequest, "User`s answer is empty")
		return
	}

	result, err := h.services.Questions.CheckAnswer(question_id, answer.Answer)
	if err != nil {
		logrus.Error("Failed check answer")
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"your_answer": answer.Answer,
		"is_correct":  result,
	})
}
