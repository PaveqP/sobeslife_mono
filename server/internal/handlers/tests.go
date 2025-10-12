package handlers

import (
	"net/http"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

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

	c.JSON(http.StatusOK, result)
}
