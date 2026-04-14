package utils

import (
	"flag"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Port  string       `yaml:"port" mapstructure:"port" env-default:"8080"`
	DB    DBConfig     `yaml:"db" mapstructure:"db"`
	JWT   JWTAppConfig `yaml:"jwt" mapstructure:"jwt"`
	Redis RedisConfig  `yaml:"redis" mapstructure:"redis"`
	LLM   LLMConfig    `yaml:"llm" mapstructure:"llm"`
}

type JWTAppConfig struct {
	AccessTTL  string `yaml:"accessTTL" mapstructure:"accessTTL"`
	RefreshTTL string `yaml:"refreshTTL" mapstructure:"refreshTTL"`
}

type RedisConfig struct {
	Addr              string `yaml:"addr" mapstructure:"addr"`
	Password          string `yaml:"password" mapstructure:"password"`
	DB                int    `yaml:"db" mapstructure:"db"`
	ExpirationMinutes int    `yaml:"expirationMinutes" mapstructure:"expirationMinutes"`
}

type DBConfig struct {
	Host     string `yaml:"host" mapstructure:"host"`
	Port     string `yaml:"port" mapstructure:"port"`
	Username string `yaml:"username" mapstructure:"username"`
	DBName   string `yaml:"dbname" mapstructure:"dbname"`
	SSLMode  string `yaml:"sslmode" mapstructure:"sslmode"`
}

type LLMConfig struct {
	BaseURL        string `yaml:"baseUrl" mapstructure:"baseUrl"`
	Model          string `yaml:"model" mapstructure:"model"`
	TimeoutSeconds int    `yaml:"timeoutSeconds" mapstructure:"timeoutSeconds"`
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
