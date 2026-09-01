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
	"go.uber.org/fx"
)

type GraphQLServer struct {
	config *AppConfig
	server *http.Server
}

func NewGraphQLServer(config *AppConfig, resolver *Resolver) *GraphQLServer {
	graphqlHandler := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: resolver}))

	mux := http.NewServeMux()
	mux.Handle("/graphql", cors(config.AllowedOrigin, graphqlHandler))
	mux.Handle("/", playground.Handler("BIRO225 GraphQL", "/graphql"))
	mux.HandleFunc("/health", func(response http.ResponseWriter, _ *http.Request) {
		response.WriteHeader(http.StatusNoContent)
	})

	return &GraphQLServer{
		config: config,
		server: &http.Server{
			Addr:              ":" + config.Port,
			Handler:           mux,
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

func cors(allowedOrigin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		response.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		response.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		response.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if request.Method == http.MethodOptions {
			response.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(response, request)
	})
}
