package handlers

import (
	"errors"
	"net/http"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (h *Handler) adminSignUp(c *gin.Context) {
	var req utils.AdminCreateRequest
	if err := c.BindJSON(&req); err != nil {
		logrus.Errorf("adminSignUp: bad request: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	result, err := h.services.AdminServiceInterface.CreateAdmin(req)
	if err != nil {
		logrus.Errorf("adminSignUp: %s", err)
		if errors.Is(err, services.ErrAdminEmailTaken) {
			c.AbortWithStatusJSON(http.StatusConflict, gin.H{"message": err.Error()})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) adminSignIn(c *gin.Context) {
	var req utils.AdminSignInRequest
	if err := c.BindJSON(&req); err != nil {
		logrus.Errorf("adminSignIn: bad request: %s", err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	result, err := h.services.AdminServiceInterface.SignIn(req)
	if err != nil {
		logrus.Errorf("adminSignIn: %s", err)
		switch {
		case errors.Is(err, services.ErrAdminNotFound),
			errors.Is(err, services.ErrAdminInvalidCredentials):
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid email or password"})
		default:
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) adminGetStats(c *gin.Context) {
	stats, err := h.services.AdminServiceInterface.GetStats()
	if err != nil {
		logrus.Errorf("adminGetStats: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ── Admin management ──────────────────────────────────────────────────────────

func (h *Handler) adminListAdmins(c *gin.Context) {
	admins, err := h.services.AdminServiceInterface.ListAdmins()
	if err != nil {
		logrus.Errorf("adminListAdmins: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, admins)
}

func (h *Handler) adminDeleteAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid admin id"})
		return
	}
	if err := h.services.AdminServiceInterface.DeleteAdmin(id); err != nil {
		logrus.Errorf("adminDeleteAdmin: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── User management ───────────────────────────────────────────────────────────

func (h *Handler) adminGetUsers(c *gin.Context) {
	users, err := h.services.AdminServiceInterface.ListWebUsers()
	if err != nil {
		logrus.Errorf("adminGetUsers: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) adminCreateUser(c *gin.Context) {
	var req utils.AdminCreateWebUserRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	user, err := h.services.AdminServiceInterface.CreateWebUser(req)
	if err != nil {
		logrus.Errorf("adminCreateUser: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, user)
}

func (h *Handler) adminUpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}
	var req utils.AdminUpdateWebUserRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	user, err := h.services.AdminServiceInterface.UpdateWebUser(id, req)
	if err != nil {
		logrus.Errorf("adminUpdateUser: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *Handler) adminDeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}
	if err := h.services.AdminServiceInterface.DeleteWebUser(id); err != nil {
		logrus.Errorf("adminDeleteUser: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

func (h *Handler) adminGetTests(c *gin.Context) {
	tests, err := h.services.AdminServiceInterface.ListAdminTests()
	if err != nil {
		logrus.Errorf("adminGetTests: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tests)
}

func (h *Handler) adminCreateTest(c *gin.Context) {
	var req utils.AdminCreateTestRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	test, err := h.services.AdminServiceInterface.CreateAdminTest(req)
	if err != nil {
		logrus.Errorf("adminCreateTest: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, test)
}

func (h *Handler) adminDeleteTest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid test id"})
		return
	}
	if err := h.services.AdminServiceInterface.DeleteAdminTest(id); err != nil {
		logrus.Errorf("adminDeleteTest: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) adminGetTestQuestions(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid test id"})
		return
	}
	questions, err := h.services.AdminServiceInterface.ListTestQuestions(id)
	if err != nil {
		logrus.Errorf("adminGetTestQuestions: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}

func (h *Handler) adminAddQuestionToTest(c *gin.Context) {
	testID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid test id"})
		return
	}
	var req utils.AdminAddQuestionToTestRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	if err := h.services.AdminServiceInterface.AddQuestionToTest(testID, req.QuestionID); err != nil {
		logrus.Errorf("adminAddQuestionToTest: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusCreated)
}

func (h *Handler) adminRemoveQuestionFromTest(c *gin.Context) {
	testID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid test id"})
		return
	}
	questionID, err := strconv.Atoi(c.Param("questionId"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid question id"})
		return
	}
	if err := h.services.AdminServiceInterface.RemoveQuestionFromTest(testID, questionID); err != nil {
		logrus.Errorf("adminRemoveQuestionFromTest: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── Questions CRUD ────────────────────────────────────────────────────────────

func (h *Handler) adminGetQuestions(c *gin.Context) {
	filters := utils.AdminQuestionFilters{
		Profession:     c.Query("profession"),
		Chapter:        c.Query("chapter"),
		Technology:     c.Query("technology"),
		ExpertiseLevel: c.Query("expertise_level"),
	}
	questions, err := h.services.AdminServiceInterface.ListQuestions(filters)
	if err != nil {
		logrus.Errorf("adminGetQuestions: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}

func (h *Handler) adminCreateQuestion(c *gin.Context) {
	var req utils.AdminCreateQuestionRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	question, err := h.services.AdminServiceInterface.CreateQuestion(req)
	if err != nil {
		logrus.Errorf("adminCreateQuestion: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, question)
}

func (h *Handler) adminUpdateQuestion(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid question id"})
		return
	}
	var req utils.AdminUpdateQuestionRequest
	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	question, err := h.services.AdminServiceInterface.UpdateQuestion(id, req)
	if err != nil {
		logrus.Errorf("adminUpdateQuestion: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, question)
}

func (h *Handler) adminDeleteQuestion(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid question id"})
		return
	}
	if err := h.services.AdminServiceInterface.DeleteQuestion(id); err != nil {
		logrus.Errorf("adminDeleteQuestion: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── Interviews ────────────────────────────────────────────────────────────────

func (h *Handler) adminGetInterviews(c *gin.Context) {
	interviews, err := h.services.AdminServiceInterface.ListInterviews()
	if err != nil {
		logrus.Errorf("adminGetInterviews: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, interviews)
}

func (h *Handler) adminDeleteInterview(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid interview id"})
		return
	}
	if err := h.services.AdminServiceInterface.DeleteInterview(id); err != nil {
		logrus.Errorf("adminDeleteInterview: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── Analytics ─────────────────────────────────────────────────────────────────

func (h *Handler) adminGetAnalytics(c *gin.Context) {
	data, err := h.services.AdminServiceInterface.GetAnalytics()
	if err != nil {
		logrus.Errorf("adminGetAnalytics: %s", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, data)
}
