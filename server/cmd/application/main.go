package main

import (
	"sobeslife-services/internal/handlers"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/server"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"
	"strconv"
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

	accessTTL, err := strconv.Atoi(cfg.JWT.AccessTTL)
	if err != nil {
		accessTTL = 12
	}

	refreshTTL, err := strconv.Atoi(cfg.JWT.RefreshTTL)
	if err != nil {
		refreshTTL = 24 * 7
	}

	jwt := utils.NewJWTService(utils.JWTConfig{
		AccessTTL:         time.Duration(accessTTL) * time.Hour,
		RefreshTTL:        time.Duration(refreshTTL) * time.Hour,
		AccessSigningKey:  utils.GetEnv("ACCESS_SIGNING_KEY"),
		RefreshSigningKey: utils.GetEnv("REFRESH_SIGNING_KEY"),
	})
	repository := repository.NewRepository(db)
	services := services.NewService(repository, jwt)
	handler := handlers.NewHandler(services, jwt, "started successfully", time.Now())

	server := new(server.Server)

	logrus.Print("Server was started successfully!!")

	if err := server.Run(cfg.Port, handler.InitRoutes()); err != nil {
		logrus.Errorf("FATAL: server not started, %s", err)
	}
}
