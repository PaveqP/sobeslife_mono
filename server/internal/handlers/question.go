package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getAllQuestions(c *gin.Context) {
	result, err := h.services.GetAllQuestions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) getQuestionsByProfession(c *gin.Context) {
	professionId := c.Param("id")
	if professionId == "" {
		logrus.Error("professionId is empty")
		c.AbortWithStatusJSON(http.StatusBadRequest, "invalid id parameter")
	}

	result, err := h.services.GetQuestionsByProfession(professionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) getQuestionsByModule(c *gin.Context) {
	moduleId := c.Param("id")
	if moduleId == "" {
		logrus.Error("moduleId is empty")
		c.AbortWithStatusJSON(http.StatusBadRequest, "invalid id parameter")
	}

	result, err := h.services.GetQuestionsByModule(moduleId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) getQuestionsByTechnology(c *gin.Context) {
	technologyId := c.Param("id")
	if technologyId == "" {
		logrus.Error("technologyId is empty")
		c.AbortWithStatusJSON(http.StatusBadRequest, "invalid id parameter")
	}

	result, err := h.services.GetQuestionsByTechnology(technologyId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, result)
}

// func (h *Handler) getQuestionsForTest(c *gin.Context) {
// 	result, err := h.services.GetQuestionsForTest()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, err)
// 	}

// 	c.JSON(http.StatusOK, result)
// }
