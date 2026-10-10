package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

type PurchasePredictorRunner struct {
	directory       string
	python          string
	loadEnvOverride string
	slot            chan struct{}
}

func NewPurchasePredictorRunner(config *AppConfig) *PurchasePredictorRunner {
	python := config.PurchasePredictorPython
	if python == "" {
		python = filepath.Join(".venv", "bin", "python")
		if runtime.GOOS == "windows" {
			python = filepath.Join(".venv", "Scripts", "python.exe")
		}
	}
	if !filepath.IsAbs(python) {
		python = filepath.Join(config.PurchasePredictorDirectory, python)
	}

	return &PurchasePredictorRunner{
		directory:       config.PurchasePredictorDirectory,
		python:          python,
		loadEnvOverride: "PURCHASE_PREDICTOR_LOAD_DOTENV_OVERRIDE=true",
		slot:            make(chan struct{}, 1),
	}
}

func (runner *PurchasePredictorRunner) Run(ctx context.Context, command string) error {
	select {
	case runner.slot <- struct{}{}:
		defer func() { <-runner.slot }()
	case <-ctx.Done():
		return ctx.Err()
	}

	python, err := filepath.Abs(runner.python)
	if err != nil {
		return fmt.Errorf("resolve purchase predictor Python path: %w", err)
	}
	directory, err := filepath.Abs(runner.directory)
	if err != nil {
		return fmt.Errorf("resolve purchase predictor directory: %w", err)
	}
	if _, err := os.Stat(python); err != nil {
		return fmt.Errorf("access purchase predictor Python executable %q: %w", python, err)
	}

	process := exec.CommandContext(ctx, python, "main.py", command)
	process.Dir = directory
	process.Env = append(os.Environ(), runner.loadEnvOverride)
	process.Stdout = os.Stdout
	process.Stderr = os.Stderr
	if err := process.Run(); err != nil {
		return fmt.Errorf("run purchase predictor %s: %w", command, err)
	}
	return nil
}
