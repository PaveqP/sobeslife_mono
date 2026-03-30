package handlers

import (
	"net/http"
	"reflect"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getTests(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	filters := utils.TestListFilters{
		Title:          c.Query("title"),
		Profession:     c.Query("profession"),
		Chapter:        c.Query("chapter"),
		Technology:     c.Query("technology"),
		ExpertiseLevel: c.Query("expertise_level"),
	}

	result, err := h.services.Tests.List(user_id, filters)
	if err != nil {
		logrus.Errorf("Failed fetch tests: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) getTestByID(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}

	test_id := c.Param("id")
	result, err := h.services.Tests.GetByID(user_id, test_id)
	if err != nil {
		logrus.Errorf("Failed fetch test by id: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) generateTest(c *gin.Context) {
	var testParameters utils.CreateTestRequest
	if err := c.BindJSON(&testParameters); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	result, err := h.services.Tests.Generate(testParameters)
	if err != nil {
		logrus.Errorf("Failed generate test: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	if reflect.DeepEqual(result, utils.TestResponse{}) {
		logrus.Info("Empty struct result")
		c.JSON(http.StatusOK, map[string]interface{}{"message": "No questions fot test with your params"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) startTest(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}
	test_id := c.Param("id")

	err = h.services.Tests.Start(user_id, test_id)
	if err != nil {
		logrus.Errorf("Failed start test: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, "OK")
}

func (h *Handler) checkTestAnswer(c *gin.Context) {
	test_id := c.Param("id")
	var answerParams utils.UserAnswerInTest
	if err := c.BindJSON(&answerParams); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	if answerParams.Answer == "" || answerParams.QuestionId == "" {
		logrus.Errorf("Request body is incorrect")
		c.AbortWithStatusJSON(http.StatusBadRequest, "Request body is incorrect")
		return
	}

	isCorrect, err := h.services.Questions.CheckAnswer(answerParams.QuestionId, answerParams.Answer)
	if err != nil {
		logrus.Errorf("Can`t validate users answer")
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	err = h.services.Tests.SetUsersAnswer(test_id, answerParams.QuestionId, answerParams.Answer, isCorrect)
	if err != nil {
		logrus.Errorf("Can`t set users answer")
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"your_answer": answerParams.Answer,
		"is_correct":  isCorrect,
	})
}

func (h *Handler) completeTest(c *gin.Context) {
	user_id, err := getUserId(c)
	if err != nil {
		return
	}
	test_id := c.Param("id")

	stats, err := h.services.Tests.Complete(user_id, test_id)
	if err != nil {
		logrus.Errorf("Failed complete test: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, stats)
}
