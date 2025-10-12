package utils

import (
	"flag"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Port string   `yaml:"port" env-default:"8080"`
	DB   DBConfig `yaml:"db"`
	JWT  JWTAppConfig
}

type JWTAppConfig struct {
	AccessTTL  string
	RefreshTTL string
}

type DBConfig struct {
	Host     string `yaml:"host"`
	Port     string `yaml:"port"`
	Username string `yaml:"username"`
	DBName   string `yaml:"dbname"`
	SSLMode  string `yaml:"sslmode"`
}

func MustLoadConfig() *Config {
	configPath := fetchConfigPath()
	if configPath == "" {
		panic("Empty config path")
	}

	return MustLoadPath(configPath)
}

func MustLoadPath(configPath string) *Config {
	viper.SetConfigFile(configPath)

	if err := viper.ReadInConfig(); err != nil {
		panic("failed to read config: " + err.Error())
	}

	var cfg Config

	if err := viper.Unmarshal(&cfg); err != nil {
		panic("failed to unmarshal config: " + err.Error())
	}

	return &cfg
}

func fetchConfigPath() string {
	var path string

	flag.StringVar(&path, "config", "", "path to config file")
	flag.Parse()
	if path == "" {
		path = os.Getenv("CONFIG_PATH")
	}

	return path
}

func GetEnv(key string) string {
	return os.Getenv(key)
}
