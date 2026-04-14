package handlers

import (
	"errors"
	"net/http"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) startInterview(c *gin.Context) {
	userID, err := getUserId(c)
	if err != nil {
		return
	}

	var request utils.StartInterviewRequest
	if err := c.BindJSON(&request); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	result, err := h.services.Interviews.Start(c.Request.Context(), userID, request)
	if err != nil {
		logrus.Errorf("Failed start interview: %s", err)
		switch {
		case errors.Is(err, services.ErrInterviewAlreadyActive):
			c.AbortWithStatusJSON(http.StatusConflict, map[string]string{"message": err.Error()})
		case errors.Is(err, services.ErrInvalidInterviewLevel),
			errors.Is(err, services.ErrInvalidInterviewDuration),
			errors.Is(err, services.ErrProfessionNotFound),
			errors.Is(err, services.ErrUserNotFound):
			c.AbortWithStatusJSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) sendInterviewAnswer(c *gin.Context) {
	userID, err := getUserId(c)
	if err != nil {
		return
	}

	interviewID := c.Param("id")

	var request utils.SendInterviewAnswerRequest
	if err := c.BindJSON(&request); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	result, err := h.services.Interviews.SendAnswer(c.Request.Context(), userID, interviewID, request)
	if err != nil {
		logrus.Errorf("Failed send interview answer: %s", err)
		switch {
		case errors.Is(err, services.ErrInterviewNotFound):
			c.AbortWithStatusJSON(http.StatusNotFound, map[string]string{"message": err.Error()})
		case errors.Is(err, services.ErrInterviewAnswerEmpty):
			c.AbortWithStatusJSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
		case errors.Is(err, services.ErrInterviewSummaryFailed):
			c.AbortWithStatusJSON(http.StatusBadGateway, map[string]string{"message": err.Error()})
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) getInterviewHistory(c *gin.Context) {
	userID, err := getUserId(c)
	if err != nil {
		return
	}

	result, err := h.services.Interviews.History(c.Request.Context(), userID)
	if err != nil {
		logrus.Errorf("Failed fetch interview history: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) completeInterview(c *gin.Context) {
	userID, err := getUserId(c)
	if err != nil {
		return
	}

	interviewID := c.Param("id")

	result, err := h.services.Interviews.Complete(c.Request.Context(), userID, interviewID)
	if err != nil {
		logrus.Errorf("Failed complete interview: %s", err)
		switch {
		case errors.Is(err, services.ErrInterviewNotFound):
			c.AbortWithStatusJSON(http.StatusNotFound, map[string]string{"message": err.Error()})
		case errors.Is(err, services.ErrInterviewSummaryFailed):
			c.AbortWithStatusJSON(http.StatusBadGateway, map[string]string{"message": err.Error()})
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}
