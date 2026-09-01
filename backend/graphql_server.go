package main

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	ginCors "github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type GraphQLServer struct {
	config *AppConfig
	router *gin.Engine
	server *http.Server
}

func NewGraphQLServer(config *AppConfig, resolver *Resolver) *GraphQLServer {
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

	return &GraphQLServer{
		config: config,
		router: router,
		server: &http.Server{
			Addr:              ":" + config.Port,
			Handler:           router,
			ReadHeaderTimeout: 5 * time.Second,
		},
	}
}

func RegisterGraphQLServerLifecycle(lifecycle fx.Lifecycle, server *GraphQLServer) {
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
					slog.Error("GraphQL server stopped unexpectedly", "error", err)
				}
			}()
			slog.Info("GraphQL server listening", "url", "http://localhost:"+server.config.Port+"/graphql")
			return nil
		},
		OnStop: server.server.Shutdown,
	})
}
