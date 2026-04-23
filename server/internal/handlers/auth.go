package handlers

import (
	"net/http"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// --- OTP ---

func (h *Handler) otpSend(c *gin.Context) {
	var req utils.OTPSendRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "email is required"})
		return
	}

	if err := h.services.Authorization.SendOTP(c.Request.Context(), req.Email); err != nil {
		logrus.Errorf("Failed to send OTP: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to send code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "code sent"})
}

func (h *Handler) otpVerify(c *gin.Context) {
	var req utils.OTPVerifyRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	tokens, err := h.services.Authorization.VerifyOTP(c.Request.Context(), req.Email, req.Code)
	if err != nil {
		switch err {
		case services.ErrOTPExpired:
			c.AbortWithStatusJSON(http.StatusGone, gin.H{"error": "code expired"})
		case services.ErrOTPInvalid:
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid code"})
		default:
			logrus.Errorf("OTP verify error: %s", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "verification failed"})
		}
		return
	}

	c.JSON(http.StatusOK, tokens)
}

// --- Google OAuth ---

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

// --- GitHub OAuth ---

func (h *Handler) githubUrl(c *gin.Context) {
	response := h.services.Authorization.GenerateGithubOauthRedirectURI(c.Query("state"))
	c.JSON(http.StatusOK, response)
}

func (h *Handler) githubCallback(c *gin.Context) {
	var req utils.GithubCodeCallback
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if strings.TrimSpace(req.Code) == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	resp, err := h.services.Authorization.AuthByGithubWithCode(strings.TrimSpace(req.Code))
	if err != nil {
		logrus.Errorf("GitHub auth error: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
