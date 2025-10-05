package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) HealthCheck(c *gin.Context) {
	html := fmt.Sprintf(`
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
				<h1>Server successfully running at</h1>
				<h2>http://localhost:8080</h2>
				<h2>server started on %s</h2>
				<h2>Good Luck!!</h2>
			</div>
        `, h.serverStartTime)

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}
