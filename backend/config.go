package main

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	Environment                  string
	Name                         string
	Port                         string
	AllowedOrigins               []string
	MSSQLHost                    string
	MSSQLPort                    string
	MSSQLDatabase                string
	MSSQLUsername                string
	MSSQLPassword                string
	MSSQLEncrypt                 string
	MSSQLTrustServerCertificate  string
	MSSQLBackupFolder            string
	CronEnabled                  bool
	PurchasePredictorDirectory   string
	PurchasePredictorPython      string
	PurchasePredictionRunsToKeep int
	SMTPHost                     string
	SMTPPort                     string
	SMTPUsername                 string
	SMTPPassword                 string
	SMTPFromAddress              string
	SMTPSecurity                 string
	KeycloakURL                  string
	KeycloakRealm                string
	KeycloakClientID             string
	KeycloakCACertFile           string
	TLSCertFile                  string
	TLSKeyFile                   string
	FURSURL                      string
	FURSCertificateFile          string
	FURSCertificatePassword      string
	FURSTaxNumber                string
	FURSOperatorTaxNumber        string
	FURSBusinessPremiseID        string
	FURSElectronicDeviceID       string
}

func NewAppConfig() *AppConfig {
	_ = godotenv.Load()

	return &AppConfig{
		Environment:                  envOrDefault("APP_ENV", "development"),
		Name:                         envOrDefault("APP_NAME", "bureaucracy-backend"),
		Port:                         envOrDefault("PORT", "8080"),
		AllowedOrigins:               strings.Split(envOrDefault("CORS_ALLOWED_ORIGIN", "https://localhost:5173,https://localhost:4173,https://drevi-pc:4173"), ","),
		MSSQLHost:                    envOrDefault("MSSQL_HOST", "localhost"),
		MSSQLPort:                    envOrDefault("MSSQL_PORT", "1433"),
		MSSQLDatabase:                envOrDefault("MSSQL_DATABASE", "master"),
		MSSQLUsername:                os.Getenv("MSSQL_USERNAME"),
		MSSQLPassword:                os.Getenv("MSSQL_PASSWORD"),
		MSSQLEncrypt:                 envOrDefault("MSSQL_ENCRYPT", "true"),
		MSSQLTrustServerCertificate:  envOrDefault("MSSQL_TRUST_SERVER_CERTIFICATE", "false"),
		MSSQLBackupFolder:            strings.TrimSpace(os.Getenv("MSSQL_BACKUP_FOLDER")),
		CronEnabled:                  strings.EqualFold(strings.TrimSpace(envOrDefault("CRON_ENABLED", "false")), "true"),
		PurchasePredictorDirectory:   strings.TrimSpace(envOrDefault("PURCHASE_PREDICTOR_DIRECTORY", "../purchase_predictor")),
		PurchasePredictorPython:      strings.TrimSpace(os.Getenv("PURCHASE_PREDICTOR_PYTHON")),
		PurchasePredictionRunsToKeep: positiveIntEnvOrDefault("PURCHASE_PREDICTION_RUNS_TO_KEEP", 3),
		SMTPHost:                     os.Getenv("SMTP_HOST"),
		SMTPPort:                     envOrDefault("SMTP_PORT", "587"),
		SMTPUsername:                 os.Getenv("SMTP_USERNAME"),
		SMTPPassword:                 os.Getenv("SMTP_PASSWORD"),
		SMTPFromAddress:              os.Getenv("SMTP_FROM_ADDRESS"),
		SMTPSecurity:                 strings.ToLower(envOrDefault("SMTP_SECURITY", "starttls")),
		KeycloakURL:                  strings.TrimRight(envOrDefault("KEYCLOAK_URL", "https://localhost:8180"), "/"),
		KeycloakRealm:                envOrDefault("KEYCLOAK_REALM", "bureaucracy"),
		KeycloakClientID:             envOrDefault("KEYCLOAK_CLIENT_ID", "bureaucracy-frontend"),
		KeycloakCACertFile:           envOrDefault("KEYCLOAK_CA_CERT_FILE", "../certs/local-https/bureaucracy-ca.crt"),
		TLSCertFile:                  envOrDefault("TLS_CERT_FILE", "../certs/local-https/bureaucracy.crt"),
		TLSKeyFile:                   envOrDefault("TLS_KEY_FILE", "../certs/local-https/bureaucracy.key"),
		FURSURL:                      strings.TrimRight(strings.TrimSpace(os.Getenv("FURS_URL")), "/"),
		FURSCertificateFile:          strings.TrimSpace(os.Getenv("FURS_CERTIFICATE_FILE")),
		FURSCertificatePassword:      os.Getenv("FURS_CERTIFICATE_PASSWORD"),
		FURSTaxNumber:                strings.TrimSpace(os.Getenv("FURS_TAX_NUMBER")),
		FURSOperatorTaxNumber:        strings.TrimSpace(os.Getenv("FURS_OPERATOR_TAX_NUMBER")),
		FURSBusinessPremiseID:        strings.TrimSpace(os.Getenv("FURS_BUSINESS_PREMISE_ID")),
		FURSElectronicDeviceID:       strings.TrimSpace(os.Getenv("FURS_ELECTRONIC_DEVICE_ID")),
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

func positiveIntEnvOrDefault(key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key)))
	if err != nil || value < 1 {
		return fallback
	}

	return value
}
