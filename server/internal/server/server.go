package server

import (
	"context"
	"net/http"
	"time"
)

type Server struct {
	server *http.Server
}

func (s *Server) Run(port string, handler http.Handler) error {
	s.server = &http.Server{
		Addr:           ":" + port,
		Handler:        handler,
		MaxHeaderBytes: 1 << 20,
		// Деплой за nginx: 10s часто рвёт соединение при холодной БД/Redis → 502 у клиента.
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
	}

	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}
