package main

import (
	"fmt"
	"net/http"
	"sobeslife-services/internal/server"
	"time"

	"github.com/sirupsen/logrus"
)

var ServerStartedTime time.Time

func main() {
	logrus.SetFormatter(new(logrus.JSONFormatter))
	server := new(server.Server)

	http.HandleFunc("/", BaseHandler)
	http.HandleFunc("/health", HealthHandler)
	ServerStartedTime = time.Now()
	logrus.Print("Server was started successfully!!")
	if err := server.Run("8080", nil); err != nil {
		logrus.Errorf("FATAL: server not started, %s", err)
	}
}

func BaseHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, `
            <h1>Welcome to Go Handlers</h1>
            <ul>
                <li><a href="/hello">Hello</a></li>
                <li><a href="/json">JSON Example</a></li>
            </ul>
        `)
}

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
				<h1>Server successfully running at</h1>
				<h2>http://localhost:8085</h2>
				<h2>server started on %s</h2>
				<h2>Good Luck!!</h2>
			</div>
        `, ServerStartedTime)
}
