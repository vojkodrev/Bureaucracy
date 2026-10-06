package main

import (
	"context"
	"embed"
	"encoding/csv"
	"fmt"
	"io"
	"io/fs"
	"log/slog"
	"strings"

	"github.com/robfig/cron/v3"
	"go.uber.org/fx"
)

const cronJobsConfigPath = "cron_jobs.csv"

//go:embed cron_jobs.csv
var cronJobsConfig embed.FS

type CronJobHandler interface {
	Name() string
	Handle(context.Context) error
}

type CronJobConfig struct {
	Schedule string
	JobName  string
}

type CronServer struct {
	scheduler *cron.Cron
	cancel    context.CancelFunc
	jobCount  int
}

func NewCronServer(databaseBackupHandler *DatabaseBackupJobHandler) (*CronServer, error) {
	jobs, err := loadCronJobConfig(cronJobsConfig)
	if err != nil {
		return nil, err
	}

	handlers := map[string]CronJobHandler{
		databaseBackupHandler.Name(): databaseBackupHandler,
	}
	jobContext, cancel := context.WithCancel(context.Background())
	scheduler := cron.New(cron.WithChain(
		cron.SkipIfStillRunning(cron.DefaultLogger),
		cron.Recover(cron.DefaultLogger),
	))
	for _, job := range jobs {
		handler, exists := handlers[job.JobName]
		if !exists {
			cancel()
			return nil, fmt.Errorf("cron job %q has no registered handler", job.JobName)
		}
		jobName := job.JobName
		if _, err := scheduler.AddFunc(job.Schedule, func() {
			slog.Info("cron job started", "job", jobName)
			if err := handler.Handle(jobContext); err != nil {
				slog.Error("cron job failed", "job", jobName, "error", err)
				return
			}
			slog.Info("cron job completed", "job", jobName)
		}); err != nil {
			cancel()
			return nil, fmt.Errorf("schedule cron job %q: %w", job.JobName, err)
		}
	}

	return &CronServer{scheduler: scheduler, cancel: cancel, jobCount: len(jobs)}, nil
}

func RegisterCronServerLifecycle(lifecycle fx.Lifecycle, server *CronServer) {
	lifecycle.Append(fx.Hook{
		OnStart: func(context.Context) error {
			server.scheduler.Start()
			slog.Info("cron server started", "jobs", server.jobCount)
			return nil
		},
		OnStop: func(ctx context.Context) error {
			server.cancel()
			stopped := server.scheduler.Stop()
			select {
			case <-stopped.Done():
				slog.Info("cron server stopped")
				return nil
			case <-ctx.Done():
				return ctx.Err()
			}
		},
	})
}

func loadCronJobConfig(files fs.FS) ([]CronJobConfig, error) {
	file, err := files.Open(cronJobsConfigPath)
	if err != nil {
		return nil, fmt.Errorf("open cron jobs config: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("read cron jobs header: %w", err)
	}
	if len(header) != 2 || header[0] != "cron_schedule" || header[1] != "job_name" {
		return nil, fmt.Errorf("cron jobs config must contain cron_schedule and job_name columns")
	}

	var jobs []CronJobConfig
	for rowNumber := 2; ; rowNumber++ {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("read cron jobs row %d: %w", rowNumber, err)
		}
		if len(record) != 2 {
			return nil, fmt.Errorf("cron jobs row %d must contain exactly two columns", rowNumber)
		}
		schedule := strings.TrimSpace(record[0])
		jobName := strings.TrimSpace(record[1])
		if schedule == "" || jobName == "" {
			return nil, fmt.Errorf("cron jobs row %d contains an empty value", rowNumber)
		}
		jobs = append(jobs, CronJobConfig{Schedule: schedule, JobName: jobName})
	}
	return jobs, nil
}
