package main

import (
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	Environment                 string
	Name                        string
	Port                        string
	AllowedOrigin               string
	MSSQLHost                   string
	MSSQLPort                   string
	MSSQLDatabase               string
	MSSQLUsername               string
	MSSQLPassword               string
	MSSQLEncrypt                string
	MSSQLTrustServerCertificate string
}

func NewAppConfig() *AppConfig {
	_ = godotenv.Load()

	return &AppConfig{
		Environment:                 envOrDefault("APP_ENV", "development"),
		Name:                        envOrDefault("APP_NAME", "bureaucracy-backend"),
		Port:                        envOrDefault("PORT", "8080"),
		AllowedOrigin:               envOrDefault("CORS_ALLOWED_ORIGIN", "http://localhost:5173"),
		MSSQLHost:                   envOrDefault("MSSQL_HOST", "localhost"),
		MSSQLPort:                   envOrDefault("MSSQL_PORT", "1433"),
		MSSQLDatabase:               envOrDefault("MSSQL_DATABASE", "master"),
		MSSQLUsername:               os.Getenv("MSSQL_USERNAME"),
		MSSQLPassword:               os.Getenv("MSSQL_PASSWORD"),
		MSSQLEncrypt:                envOrDefault("MSSQL_ENCRYPT", "true"),
		MSSQLTrustServerCertificate: envOrDefault("MSSQL_TRUST_SERVER_CERTIFICATE", "false"),
	}
}

func (config *AppConfig) MSSQLConnectionString() string {
	query := url.Values{}
	query.Set("database", config.MSSQLDatabase)
	query.Set("encrypt", config.MSSQLEncrypt)
	query.Set("TrustServerCertificate", config.MSSQLTrustServerCertificate)

	host := config.MSSQLHost
	if server, _, found := strings.Cut(host, `\`); found && config.MSSQLPort != "" {
		host = server
	}
	if config.MSSQLPort != "" {
		host = fmt.Sprintf("%s:%s", host, config.MSSQLPort)
	}

	return (&url.URL{
		Scheme:   "sqlserver",
		User:     url.UserPassword(config.MSSQLUsername, config.MSSQLPassword),
		Host:     host,
		RawQuery: query.Encode(),
	}).String()
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
