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

	"github.com/99designs/gqlgen/graphql"
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
	creditNotePrintHandler *CreditNotePrintHandler,
	invoiceXMLHandler *InvoiceXMLHandler,
	invoiceHalcomHandler *InvoiceHalcomHandler,
	invoiceTaxConfirmationHandler *InvoiceTaxConfirmationHandler,
	priceQuotePrintHandler *PriceQuotePrintHandler,
	deliveryNotePrintHandler *DeliveryNotePrintHandler,
	invoiceReportHandler *InvoiceReportHandler,
	invoiceReminderHandler *InvoiceReminderHandler,
	invoiceReminderEmailHandler *InvoiceReminderEmailHandler,
	invoiceEmailHandler *InvoiceEmailHandler,
	creditNoteEmailHandler *CreditNoteEmailHandler,
	priceQuoteEmailHandler *PriceQuoteEmailHandler,
	accountingExportHandler *AccountingExportHandler,
	bankStatementImportHandler *BankStatementImportHandler,
	bankStatementReportHandler *BankStatementReportHandler,
	purchasePredictionReportHandler *PurchasePredictionReportHandler,
	fileHandler *FileHandler,
) *HTTPServer {
	if config.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	graphqlHandler := handler.NewDefaultServer(NewExecutableSchema(Config{Resolvers: resolver}))
	graphqlHandler.AroundOperations(recordGraphQLFields)
	graphqlHandler.AroundFields(AuthorizeGraphQLField)
	playgroundHandler := playground.Handler("BIRO225 GraphQL", "/graphql")

	router := gin.New()
	router.Use(
		gin.LoggerWithFormatter(formatRequestLog),
		gin.Recovery(),
		ginCors.New(ginCors.Config{
			AllowOrigins:  config.AllowedOrigins,
			AllowMethods:  []string{http.MethodGet, http.MethodPost, http.MethodOptions},
			AllowHeaders:  []string{"Content-Type", "Authorization"},
			CustomSchemas: []string{"chrome-extension://"},
		}),
	)
	router.GET("/health", func(context *gin.Context) {
		context.Status(http.StatusNoContent)
	})

	protected := router.Group("/")
	protected.Use(authMiddleware.Handle)
	protected.GET("/graphql", serveGraphQL(graphqlHandler))
	protected.POST("/graphql", serveGraphQL(graphqlHandler))

	storage := protected.Group("/")
	storage.Use(RequireAnyRole(adminRole, storageRole))
	storage.POST("/api/file", fileHandler.UploadImage)
	storage.GET("/api/file/:fileId", fileHandler.Display)
	storage.GET("/api/purchase-predictions/report/pdf", purchasePredictionReportHandler.Handle)

	admin := protected.Group("/")
	admin.Use(RequireAnyRole(adminRole))
	admin.GET("/", gin.WrapH(playgroundHandler))
	admin.GET("/api/invoices/:invoiceNumber/pdf", invoicePrintHandler.Handle)
	admin.GET("/api/credit-notes/:creditNoteNumber/pdf", creditNotePrintHandler.Handle)
	admin.POST("/api/credit-notes/:creditNoteNumber/email", creditNoteEmailHandler.Send)
	admin.GET("/api/invoices/:invoiceNumber/xml", invoiceXMLHandler.Handle)
	admin.GET("/api/invoices/:invoiceNumber/halcom", invoiceHalcomHandler.Handle)
	admin.POST("/api/invoices/:invoiceNumber/tax-confirmation", invoiceTaxConfirmationHandler.Handle)
	admin.GET("/api/price-quotes/:quoteNumber/pdf", priceQuotePrintHandler.Handle)
	admin.GET("/api/delivery-notes/:deliveryNoteNumber/pdf", deliveryNotePrintHandler.Handle)
	admin.GET("/api/invoices/report/pdf", invoiceReportHandler.Handle)
	admin.GET("/api/invoices/reminders/pdf", invoiceReminderHandler.Handle)
	admin.POST("/api/invoices/reminders/email", invoiceReminderEmailHandler.Send)
	admin.POST("/api/invoices/:invoiceNumber/email", invoiceEmailHandler.Send)
	admin.POST("/api/price-quotes/:quoteNumber/email", priceQuoteEmailHandler.Send)
	admin.GET("/api/exports/accounting", accountingExportHandler.Handle)
	admin.POST("/api/exports/accounting/email", accountingExportHandler.Send)
	admin.POST("/api/bank-statements/import", bankStatementImportHandler.Handle)
	admin.GET("/api/bank-statements/report/pdf", bankStatementReportHandler.Handle)

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

type graphqlLogKey struct{}

func serveGraphQL(handler http.Handler) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), graphqlLogKey{}, c)
		handler.ServeHTTP(c.Writer, c.Request.WithContext(ctx))
	}
}

func recordGraphQLFields(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	if c, ok := ctx.Value(graphqlLogKey{}).(*gin.Context); ok {
		operation := graphql.GetOperationContext(ctx)
		fields := graphql.CollectFields(operation, operation.Operation.SelectionSet, nil)
		names := make([]string, 0, len(fields))
		for _, field := range fields {
			names = append(names, field.Name)
		}
		c.Set(graphqlLogKey{}, strings.Join(names, ","))
	}
	return next(ctx)
}

func formatRequestLog(param gin.LogFormatterParams) string {
	var statusColor, methodColor, latencyColor, resetColor string
	if param.IsOutputColor() {
		statusColor = param.StatusCodeColor()
		methodColor = param.MethodColor()
		latencyColor = param.LatencyColor()
		resetColor = param.ResetColor()
	}
	latency := param.Latency
	switch {
	case latency > time.Minute:
		latency = latency.Truncate(10 * time.Second)
	case latency > time.Second:
		latency = latency.Truncate(10 * time.Millisecond)
	case latency > time.Millisecond:
		latency = latency.Truncate(10 * time.Microsecond)
	}
	var suffix string
	if fields, _ := param.Keys[graphqlLogKey{}].(string); fields != "" {
		suffix = " graphql=" + fields
	}
	return fmt.Sprintf("[GIN] %s |%s %3d %s|%s %8v %s| %15s |%s %-7s %s %#v%s\n%s",
		param.TimeStamp.Format("2006/01/02 - 15:04:05"),
		statusColor, param.StatusCode, resetColor,
		latencyColor, latency, resetColor,
		param.ClientIP,
		methodColor, param.Method, resetColor,
		param.Path, suffix, param.ErrorMessage,
	)
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
