package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	ginCors "github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type HTTPServer struct {
	config *AppConfig
	router *gin.Engine
	server *http.Server
}

func NewHTTPServer(config *AppConfig, resolver *Resolver, printGenerator *InvoicePrintGenerator) *HTTPServer {
	if config.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	graphqlHandler := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: resolver}))
	playgroundHandler := playground.Handler("BIRO225 GraphQL", "/graphql")

	router := gin.New()
	router.Use(
		gin.Logger(),
		gin.Recovery(),
		ginCors.New(ginCors.Config{
			AllowOrigins: []string{config.AllowedOrigin},
			AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
			AllowHeaders: []string{"Content-Type"},
		}),
	)
	router.GET("/graphql", gin.WrapH(graphqlHandler))
	router.POST("/graphql", gin.WrapH(graphqlHandler))
	router.GET("/", gin.WrapH(playgroundHandler))
	router.GET("/health", func(context *gin.Context) {
		context.Status(http.StatusNoContent)
	})
	router.GET("/api/invoices/:invoiceNumber/pdf", func(context *gin.Context) {
		invoiceNumber := strings.TrimSpace(context.Param("invoiceNumber"))
		pdf, err := printGenerator.Generate(context.Request.Context(), invoiceNumber)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		filename := strings.NewReplacer("\"", "", "\r", "", "\n", "").Replace(invoiceNumber)
		context.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		context.Header("Pragma", "no-cache")
		context.Header("Expires", "0")
		context.Header("Content-Disposition", fmt.Sprintf(`inline; filename="invoice-%s.pdf"`, filename))
		context.Data(http.StatusOK, "application/pdf", pdf)
	})

	return &HTTPServer{
		config: config,
		router: router,
		server: &http.Server{
			Addr:              ":" + config.Port,
			Handler:           router,
			ReadHeaderTimeout: 5 * time.Second,
		},
	}
}

func RegisterHTTPServerLifecycle(lifecycle fx.Lifecycle, server *HTTPServer) {
	var listener net.Listener
	lifecycle.Append(fx.Hook{
		OnStart: func(_ context.Context) error {
			var err error
			listener, err = net.Listen("tcp", server.server.Addr)
			if err != nil {
				return err
			}

			go func() {
				if err := server.server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
					slog.Error("HTTP server stopped unexpectedly", "error", err)
				}
			}()
			slog.Info("HTTP server listening", "url", "http://localhost:"+server.config.Port)
			return nil
		},
		OnStop: server.server.Shutdown,
	})
}
