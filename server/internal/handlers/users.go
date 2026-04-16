package handlers

import (
	"errors"
	"net/http"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) getCurrentUserProfile(c *gin.Context) {
	userID, err := getUserId(c)
	if err != nil {
		return
	}

	result, err := h.services.Authorization.GetProfile(userID)
	if err != nil {
		logrus.Errorf("Failed fetch user profile: %s", err)
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			c.AbortWithStatusJSON(http.StatusNotFound, map[string]string{"message": err.Error()})
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) updateCurrentUserProfile(c *gin.Context) {
	userID, err := getUserId(c)
	if err != nil {
		return
	}

	var request utils.UpdateUserProfileRequest
	if err := c.BindJSON(&request); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	result, err := h.services.Authorization.UpdateProfile(userID, request)
	if err != nil {
		logrus.Errorf("Failed update user profile: %s", err)
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			c.AbortWithStatusJSON(http.StatusNotFound, map[string]string{"message": err.Error()})
		case errors.Is(err, services.ErrUserProfileUpdateEmpty),
			errors.Is(err, services.ErrNicknameEmpty),
			errors.Is(err, services.ErrProfessionEmpty),
			errors.Is(err, services.ErrGradeEmpty),
			errors.Is(err, services.ErrProfessionNotFound),
			errors.Is(err, services.ErrInvalidGrade):
			c.AbortWithStatusJSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}
