package main

import (
	"sobeslife-services/internal/handlers"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/server"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"
	"time"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic("Loading dotenv failed")
	}
	logrus.SetFormatter(new(logrus.JSONFormatter))
	cfg := utils.MustLoadConfig()

	db, err := repository.NewPostgresDB(repository.Config{
		Host:     cfg.DB.Host,
		Port:     cfg.DB.Port,
		Username: cfg.DB.Username,
		Password: utils.GetEnv("DB_PASSWORD"),
		DBName:   cfg.DB.DBName,
		SSLMode:  cfg.DB.SSLMode,
	})

	if err != nil {
		logrus.Fatalf("Can`t initialize postgres DB: %s", err)
		panic("Can`t initialize postgres DB")
	}

	repository := repository.NewRepository(db)
	services := services.NewService(repository)
	handler := handlers.NewHandler(services, "started successfully", time.Now())

	server := new(server.Server)

	logrus.Print("Server was started successfully!!")

	if err := server.Run(cfg.Port, handler.InitRoutes()); err != nil {
		logrus.Errorf("FATAL: server not started, %s", err)
	}
}
