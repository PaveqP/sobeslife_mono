package handlers

import (
	"sobeslife-services/internal/cache"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	services        *services.Service
	jwt             *utils.JWTService
	cacheService    *cache.CacheService
	serverStatus    string
	serverStartTime time.Time
}

func NewHandler(services *services.Service, jwt *utils.JWTService, cacheService *cache.CacheService, serverStatus string, serverStartTime time.Time) *Handler {
	return &Handler{services, jwt, cacheService, serverStatus, serverStartTime}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()

	router.GET("/health", h.HealthCheck)
	auth := router.Group("/auth")
	{
		// Google OAuth
		auth.GET("/google/url", h.googleUrl)
		auth.POST("/google/callback", h.googleCallback)
		// GitHub OAuth
		auth.GET("/github/url", h.githubUrl)
		auth.POST("/github/callback", h.githubCallback)
		// Email OTP
		auth.POST("/otp/send", h.otpSend)
		auth.POST("/otp/verify", h.otpVerify)
	}
	api := router.Group("/api", h.identifyUser)
	{
		professions := api.Group("/professions")
		{
			professions.GET("/", h.getAllProfessions)
			//professions.GET("/:id")
		}
		modules := api.Group("/modules")
		{
			modules.GET("/", h.getModulesByFilters)
			//modules.GET("/:id")
			//modules.GET("/profession/:id")
		}
		technology := api.Group("/technologies")
		{
			technology.GET("/", h.getTechnologiesByFilters)
			// technology.GET("/:id")
			// technology.GET("/module/:id")
		}
		users := api.Group("/users")
		{
			users.GET("/me", h.getCurrentUserProfile)
			users.PATCH("/me", h.updateCurrentUserProfile)
		}
		question := api.Group("/questions", h.metricsMiddleware)
		{
			question.GET("/", h.getQuestionsByFilters)
			question.POST("/:id/check", h.checkAnswer)
		}

		tests := api.Group("/tests")
		{
			tests.GET("/", h.getTests)
			tests.GET("/statistics", h.getTestsStatistics)
			tests.GET("/:id", h.getTestByID)
			tests.POST("/generate", h.generateTest)
			tests.POST("/:id/start", h.startTest)
			tests.POST("/:id/complete", h.completeTest)
			tests.POST("/:id/answer/check", h.checkTestAnswer)
		}

		interviews := api.Group("/interviews")
		{
			interviews.POST("/start", h.startInterview)
			interviews.POST("/:id/messages", h.sendInterviewAnswer)
			interviews.POST("/:id/complete", h.completeInterview)
			interviews.GET("/history", h.getInterviewHistory)
		}
	}

	// Admin routes — separate auth, separate user table
	adminAuth := router.Group("/admin/auth")
	{
		adminAuth.POST("/sign-up", h.adminSignUp)
		adminAuth.POST("/sign-in", h.adminSignIn)
	}
	adminApi := router.Group("/admin/api", h.identifyAdmin)
	{
		adminApi.GET("/stats", h.adminGetStats)
		adminApi.GET("/analytics", h.adminGetAnalytics)
		adminApi.GET("/admins", h.adminListAdmins)
		adminApi.DELETE("/admins/:id", h.adminDeleteAdmin)
		adminApi.GET("/users", h.adminGetUsers)
		adminApi.POST("/users", h.adminCreateUser)
		adminApi.PUT("/users/:id", h.adminUpdateUser)
		adminApi.DELETE("/users/:id", h.adminDeleteUser)
		adminApi.GET("/tests", h.adminGetTests)
		adminApi.POST("/tests", h.adminCreateTest)
		adminApi.DELETE("/tests/:id", h.adminDeleteTest)
		adminApi.GET("/tests/:id/questions", h.adminGetTestQuestions)
		adminApi.POST("/tests/:id/questions", h.adminAddQuestionToTest)
		adminApi.DELETE("/tests/:id/questions/:questionId", h.adminRemoveQuestionFromTest)
		adminApi.GET("/questions", h.adminGetQuestions)
		adminApi.POST("/questions", h.adminCreateQuestion)
		adminApi.PUT("/questions/:id", h.adminUpdateQuestion)
		adminApi.DELETE("/questions/:id", h.adminDeleteQuestion)
		adminApi.GET("/interviews", h.adminGetInterviews)
		adminApi.DELETE("/interviews/:id", h.adminDeleteInterview)
	}

	return router
}
