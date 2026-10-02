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

type HTTPServer struct {
	config *AppConfig
	router *gin.Engine
	server *http.Server
}

func NewHTTPServer(
	config *AppConfig,
	authMiddleware *AuthMiddleware,
	resolver *Resolver,
	invoicePrintHandler *InvoicePrintHandler,
	invoiceXMLHandler *InvoiceXMLHandler,
	invoiceHalcomHandler *InvoiceHalcomHandler,
	priceQuotePrintHandler *PriceQuotePrintHandler,
	invoiceReportHandler *InvoiceReportHandler,
	invoiceReminderHandler *InvoiceReminderHandler,
	invoiceReminderEmailHandler *InvoiceReminderEmailHandler,
	invoiceEmailHandler *InvoiceEmailHandler,
	priceQuoteEmailHandler *PriceQuoteEmailHandler,
	accountingExportHandler *AccountingExportHandler,
	bankStatementImportHandler *BankStatementImportHandler,
	fileHandler *FileHandler,
) *HTTPServer {
	if config.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	graphqlHandler := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: resolver}))
	graphqlHandler.AroundFields(AuthorizeGraphQLField)
	playgroundHandler := playground.Handler("BIRO225 GraphQL", "/graphql")

	router := gin.New()
	router.Use(
		gin.Logger(),
		gin.Recovery(),
		ginCors.New(ginCors.Config{
			AllowOrigins: config.AllowedOrigins,
			AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
			AllowHeaders: []string{"Content-Type", "Authorization"},
		}),
	)
	router.GET("/health", func(context *gin.Context) {
		context.Status(http.StatusNoContent)
	})

	protected := router.Group("/")
	protected.Use(authMiddleware.Handle)
	protected.GET("/graphql", gin.WrapH(graphqlHandler))
	protected.POST("/graphql", gin.WrapH(graphqlHandler))

	storage := protected.Group("/")
	storage.Use(RequireAnyRole(adminRole, storageRole))
	storage.POST("/api/file", fileHandler.UploadImage)
	storage.GET("/api/file/:fileId", fileHandler.Display)

	admin := protected.Group("/")
	admin.Use(RequireAnyRole(adminRole))
	admin.GET("/", gin.WrapH(playgroundHandler))
	admin.GET("/api/invoices/:invoiceNumber/pdf", invoicePrintHandler.Handle)
	admin.GET("/api/invoices/:invoiceNumber/xml", invoiceXMLHandler.Handle)
	admin.GET("/api/invoices/:invoiceNumber/halcom", invoiceHalcomHandler.Handle)
	admin.GET("/api/price-quotes/:quoteNumber/pdf", priceQuotePrintHandler.Handle)
	admin.GET("/api/invoices/report/pdf", invoiceReportHandler.Handle)
	admin.GET("/api/invoices/reminders/pdf", invoiceReminderHandler.Handle)
	admin.POST("/api/invoices/reminders/email", invoiceReminderEmailHandler.Send)
	admin.POST("/api/invoices/:invoiceNumber/email", invoiceEmailHandler.Send)
	admin.POST("/api/price-quotes/:quoteNumber/email", priceQuoteEmailHandler.Send)
	admin.GET("/api/exports/accounting", accountingExportHandler.Handle)
	admin.POST("/api/exports/accounting/email", accountingExportHandler.Send)
	admin.POST("/api/bank-statements/import", bankStatementImportHandler.Handle)

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
				if err := server.server.ServeTLS(listener, server.config.TLSCertFile, server.config.TLSKeyFile); err != nil && !errors.Is(err, http.ErrServerClosed) {
					slog.Error("HTTPS server stopped unexpectedly", "error", err)
				}
			}()
			slog.Info("HTTPS server listening", "url", "https://localhost:"+server.config.Port)
			return nil
		},
		OnStop: server.server.Shutdown,
	})
}
