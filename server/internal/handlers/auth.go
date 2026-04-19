package handlers

import (
	"net/http"
	"sobeslife-services/internal/utils"
	"strings"

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
		return
	}
	if authParams.Email != nil {
		response, err := h.services.Authorization.AuthByEmail(*authParams.Email, authParams.Password)
		if err != nil {
			logrus.Errorf("Can`t authenticate user by email: %s", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, response)
		return
	}
	if authParams.Nickname != nil {
		response, err := h.services.Authorization.AuthByNickname(*authParams.Nickname, authParams.Password)
		if err != nil {
			logrus.Errorf("Can`t authenticate user by nickname: %s", err)
			c.AbortWithStatusJSON(http.StatusBadRequest, err.Error())
			return
		}
		c.JSON(http.StatusOK, response)
		return
	}
}

func (h *Handler) googleUrl(c *gin.Context) {
	response := h.services.Authorization.GenerateGoogleOauthRedirectURI(c.Query("state"), c.Query("code_challenge"))
	c.JSON(http.StatusOK, response)
}

func (h *Handler) googleCallback(c *gin.Context) {
	var code utils.GoogleCodeCallback
	if err := c.BindJSON(&code); err != nil {
		logrus.Errorf("Can`t read code in request body: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	if code.Code == nil || strings.TrimSpace(*code.Code) == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, "code is required")
		return
	}

	codeVerifier := ""
	if code.CodeVerifier != nil {
		codeVerifier = strings.TrimSpace(*code.CodeVerifier)
	}

	resp, err := h.services.Authorization.AuthByGoogleWithCode(strings.TrimSpace(*code.Code), codeVerifier)

	if err != nil {
		logrus.Errorf("Error: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}
