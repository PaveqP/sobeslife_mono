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
		auth.POST("/sign-up", h.signUp)
		auth.POST("/sign-in", h.signIn)
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
		question := api.Group("/questions", h.metricsMiddleware)
		{
			question.GET("/", h.getQuestionsByFilters)
			question.POST("/:id/check", h.checkAnswer)
		}

		tests := api.Group("/tests")
		{
			tests.GET("/", h.getTests)
			tests.GET("/:id", h.getTestByID)
			tests.POST("/generate", h.generateTest)
			tests.POST("/:id/start", h.startTest)
			tests.POST("/:id/complete", h.completeTest)
			tests.POST("/:id/answer/check", h.checkTestAnswer)
			// tests.GET("/:id/statistics")
		}

		interviews := api.Group("/interviews")
		{
			interviews.POST("/start", h.startInterview)
			interviews.POST("/:id/messages", h.sendInterviewAnswer)
			interviews.POST("/:id/complete", h.completeInterview)
			interviews.GET("/history", h.getInterviewHistory)
		}
	}

	return router
}
