package main

import (
	"errors"
	"os"
	"sobeslife-services/internal/cache"
	"sobeslife-services/internal/handlers"
	"sobeslife-services/internal/llm"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/server"
	"sobeslife-services/internal/services"
	"sobeslife-services/internal/utils"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

func main() {
	// Local dev: .env in cwd. Docker: variables come from compose env_file — file may be absent in /app.
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		panic("Loading dotenv failed: " + err.Error())
	}
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
		ForceColors:   true,
		PadLevelText:  true,
	})
	cfg := utils.MustLoadConfig()

	redisClient := cache.NewRedisClient(cache.RedisConfig{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	cacheService := cache.NewCacheService(redisClient, time.Duration(cfg.Redis.ExpirationMinutes)*time.Minute)

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
	interviewLLM := llm.NewPolzaInterviewClient(cfg.LLM)
	services := services.NewService(repository, jwt, interviewLLM)
	handler := handlers.NewHandler(services, jwt, cacheService, "started successfully", time.Now())

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: false,
		Debug:            false,
	})

	corsHandler := c.Handler(handler.InitRoutes())

	server := new(server.Server)

	logrus.Print("Server was started successfully!!")

	if err := server.Run(cfg.Port, corsHandler); err != nil {
		logrus.Errorf("FATAL: server not started, %s", err)
	}
}
