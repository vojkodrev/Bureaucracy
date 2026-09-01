package main

import (
	"context"
	"log/slog"

	"go.uber.org/fx"
)

type Application struct {
	config *Config
}

func NewApplication(config *Config) *Application {
	return &Application{config: config}
}

func RegisterApplicationLifecycle(lifecycle fx.Lifecycle, application *Application) {
	lifecycle.Append(fx.Hook{
		OnStart: application.Start,
		OnStop:  application.Stop,
	})
}

func (application *Application) Start(_ context.Context) error {
	slog.Info("application started",
		"name", application.config.Name,
		"environment", application.config.Environment,
	)
	return nil
}

func (application *Application) Stop(_ context.Context) error {
	slog.Info("application stopped", "name", application.config.Name)
	return nil
}
