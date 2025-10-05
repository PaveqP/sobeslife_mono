package handlers

import (
	"sobeslife-services/internal/services"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	services        *services.Service
	serverStatus    string
	serverStartTime time.Time
}

func NewHandler(services *services.Service, serverStatus string, serverStartTime time.Time) *Handler {
	return &Handler{services, serverStatus, serverStartTime}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()

	router.GET("/health", h.HealthCheck)
	// auth := router.Group("/auth")
	// {
	// 	auth.POST("/sign-in")
	// 	auth.POST("/sign-up")
	// }
	api := router.Group("/api")
	{
		// professions := api.Group("/professions")
		// {
		// 	professions.GET("/")
		// 	professions.GET("/:id")
		// }
		// modules := api.Group("/modules")
		// {
		// 	modules.GET("/")
		// 	modules.GET("/profession/:id")
		// 	modules.GET("/:id")
		// }
		// technology := api.Group("/technology")
		// {
		// 	technology.GET("/")
		// 	technology.GET("/module/:id")
		// 	technology.GET("/:id")
		// }
		question := api.Group("/questions")
		{
			question.GET("/", h.getQuestionsByFilters)
			//question.GET("/:id")
		}
	}

	return router
}
