package main

import "go.uber.org/fx"

// CoreProviders contains constructors shared by the application. Add new
// services here as the backend grows.
func CoreProviders() fx.Option {
	return fx.Options(
		fx.Provide(NewAppConfig),
		fx.Provide(NewDatabase),
		fx.Provide(NewInvoiceRepository),
		fx.Provide(NewResolver),
		fx.Provide(NewGraphQLServer),
		fx.Provide(NewApplication),
	)
}

// CoreInvocations wires lifecycle hooks and other application entry points.
func CoreInvocations() fx.Option {
	return fx.Options(
		fx.Invoke(RegisterDatabaseLifecycle),
		fx.Invoke(RegisterApplicationLifecycle),
		fx.Invoke(RegisterGraphQLServerLifecycle),
	)
}

func NewIOC(options ...fx.Option) *fx.App {
	baseOptions := []fx.Option{
		CoreProviders(),
		CoreInvocations(),
	}

	return fx.New(append(baseOptions, options...)...)
}
