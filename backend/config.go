package main

import "os"

type Config struct {
	Environment string
	Name        string
}

func NewConfig() *Config {
	return &Config{
		Environment: envOrDefault("APP_ENV", "development"),
		Name:        envOrDefault("APP_NAME", "bureaucracy-backend"),
	}
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
