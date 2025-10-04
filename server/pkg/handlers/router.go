package handlers

import "github.com/gin-gonic/gin"

type Handler struct {
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()

	router.GET("/health")
	auth := router.Group("/auth")
	{
		auth.POST("/sign-in")
		auth.POST("/sign-up")
	}
	api := router.Group("/api")
	{
		tests := api.Group("/tests")
		{
			tests.POST("/")
			tests.GET("/")
			tests.GET("/:id")
			tests.GET("/:profession_id/:technology_id")
		}
	}

	return router
}
