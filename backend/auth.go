package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jwx-go/jwkfetch/v4"
	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v4/jwk"
	"github.com/lestrrat-go/jwx/v4/jwt"
	"go.uber.org/fx"
)

type realmAccess struct {
	Roles []string `json:"roles"`
}

type tokenClaims struct {
	RealmAccess realmAccess
}

type tokenClaimsContextKey struct{}

type AuthMiddleware struct {
	issuer   string
	realm    string
	clientID string
	keys     jwk.Set
}

func NewAuthMiddleware(lifecycle fx.Lifecycle, config *AppConfig) (*AuthMiddleware, error) {
	issuer := config.KeycloakURL + "/realms/" + config.KeycloakRealm
	jwksURL := issuer + "/protocol/openid-connect/certs"
	httpClient, err := keycloakHTTPClient(config.KeycloakCACertFile)
	if err != nil {
		return nil, err
	}
	httpClient = jwkfetch.WrapHTTPClientDefaults(httpClient)
	cache, err := jwkfetch.NewCache(
		context.Background(),
		httprc.NewClient(),
		jwkfetch.WithHTTPClient(httpClient),
		jwkfetch.WithMaxBodySize(1<<20),
	)
	if err != nil {
		return nil, err
	}

	if err := cache.Register(context.Background(), jwksURL, jwkfetch.WithConstantInterval(15*time.Minute), jwkfetch.WithWaitReady(false)); err != nil {
		_ = cache.Shutdown(context.Background())
		return nil, err
	}
	if err := waitForKeycloakKeys(context.Background(), cache, jwksURL, 2*time.Second); err != nil {
		_ = cache.Shutdown(context.Background())
		return nil, err
	}
	keys, err := cache.CachedSet(jwksURL)
	if err != nil {
		_ = cache.Shutdown(context.Background())
		return nil, err
	}

	lifecycle.Append(fx.Hook{OnStop: cache.Shutdown})
	return &AuthMiddleware{
		issuer:   issuer,
		realm:    config.KeycloakRealm,
		clientID: config.KeycloakClientID,
		keys:     keys,
	}, nil
}

func waitForKeycloakKeys(ctx context.Context, cache *jwkfetch.Cache, jwksURL string, retryInterval time.Duration) error {
	for {
		attemptContext, cancel := context.WithTimeout(ctx, 5*time.Second)
		_, err := cache.Refresh(attemptContext, jwksURL)
		cancel()
		if err == nil {
			return nil
		}
		log.Printf("Waiting for Keycloak signing keys; retrying in %s: %v", retryInterval, err)
		timer := time.NewTimer(retryInterval)
		select {
		case <-ctx.Done():
			timer.Stop()
			return ctx.Err()
		case <-timer.C:
		}
	}
}

func keycloakHTTPClient(caCertFile string) (*http.Client, error) {
	caCertificate, err := os.ReadFile(caCertFile)
	if err != nil {
		return nil, fmt.Errorf("read Keycloak CA certificate: %w", err)
	}

	rootCAs, err := x509.SystemCertPool()
	if err != nil || rootCAs == nil {
		rootCAs = x509.NewCertPool()
	}
	if !rootCAs.AppendCertsFromPEM(caCertificate) {
		return nil, errors.New("Keycloak CA certificate does not contain a valid PEM certificate")
	}

	return &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{TLSClientConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
			RootCAs:    rootCAs,
		}},
	}, nil
}

func (middleware *AuthMiddleware) Handle(c *gin.Context) {
	header := c.GetHeader("Authorization")
	rawToken, found := strings.CutPrefix(header, "Bearer ")
	if !found || rawToken == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
		return
	}

	claims, err := validateAccessToken(c.Request.Context(), rawToken, middleware.issuer, middleware.clientID, middleware.keys)
	if err != nil {
		c.Header("WWW-Authenticate", `Bearer realm="`+middleware.realm+`"`)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid bearer token"})
		return
	}
	c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), tokenClaimsContextKey{}, claims))
	c.Next()
}

func validateAccessToken(ctx context.Context, rawToken, issuer, clientID string, keys jwk.Set) (*tokenClaims, error) {
	parsed, err := jwt.Parse(
		[]byte(rawToken),
		jwt.WithKeySet(keys),
		jwt.WithIssuer(issuer),
		jwt.WithRequiredClaim(jwt.ExpirationKey),
		jwt.WithRequiredClaim("typ"),
		jwt.WithClaimValue("typ", "Bearer"),
		jwt.WithTypedClaim("realm_access", realmAccess{}),
		jwt.WithAcceptableSkew(30*time.Second),
		jwt.WithContext(ctx),
	)
	if err != nil {
		return nil, err
	}

	authorizedParty, _ := jwt.Get[string](parsed, "azp")
	audiences, _ := parsed.Audience()
	if authorizedParty != clientID && !slices.Contains(audiences, clientID) {
		return nil, errors.New("token was issued to another client")
	}

	access, err := jwt.Get[realmAccess](parsed, "realm_access")
	if err != nil {
		return nil, err
	}
	return &tokenClaims{RealmAccess: access}, nil
}
