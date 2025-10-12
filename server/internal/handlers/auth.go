package handlers

import (
	"net/http"
	"sobeslife-services/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) signUp(c *gin.Context) {
	var userParams utils.CreateUserQuery
	if err := c.BindJSON(&userParams); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	result, err := h.services.Authorization.CreateUser(userParams)
	if err != nil {
		logrus.Errorf("Failed to create user: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) signIn(c *gin.Context) {
	var authParams utils.AuthRequest
	if err := c.BindJSON(&authParams); err != nil {
		logrus.Errorf("Can`t read request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}
	if authParams.Email == nil && authParams.Nickname == nil && authParams.PhoneNumber == nil {
		logrus.Error("No one identifier provided")
		c.AbortWithStatusJSON(http.StatusBadRequest, "Provide users email, nickname or phone number for authorization. No one identifier provided")
		return
	}
	if authParams.PhoneNumber != nil {
		response, err := h.services.Authorization.AuthByNumber(*authParams.PhoneNumber, authParams.Password)
		if err != nil {
			logrus.Errorf("Can`t authenticate user: %s", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, response)
	}
	if authParams.Nickname != nil {
		h.services.Authorization.AuthByNickname(*authParams.Nickname, authParams.Password)
	}
	if authParams.Email != nil {
		h.services.Authorization.AuthByEmail(*authParams.Email, authParams.Password)
	}
}
