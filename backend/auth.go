package main

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type tokenHeader struct {
	Algorithm string `json:"alg"`
	KeyID     string `json:"kid"`
}

type tokenClaims struct {
	Issuer          string          `json:"iss"`
	Audience        json.RawMessage `json:"aud"`
	AuthorizedParty string          `json:"azp"`
	ExpiresAt       int64           `json:"exp"`
	NotBefore       int64           `json:"nbf"`
	RealmAccess     struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
}

type tokenClaimsContextKey struct{}

type jwkSet struct {
	Keys []struct {
		KeyID     string `json:"kid"`
		KeyType   string `json:"kty"`
		Use       string `json:"use"`
		Algorithm string `json:"alg"`
		Modulus   string `json:"n"`
		Exponent  string `json:"e"`
	} `json:"keys"`
}

type keyCache struct {
	mu      sync.RWMutex
	keys    map[string]*rsa.PublicKey
	expires time.Time
}

func NewAuthMiddleware(config *AppConfig) gin.HandlerFunc {
	issuer := config.KeycloakURL + "/realms/" + config.KeycloakRealm
	cache := &keyCache{}
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		token, found := strings.CutPrefix(header, "Bearer ")
		if !found || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}

		claims, err := validateAccessToken(c.Request.Context(), token, issuer, config.KeycloakClientID, cache)
		if err != nil {
			c.Header("WWW-Authenticate", `Bearer realm="`+config.KeycloakRealm+`"`)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid bearer token"})
			return
		}
		c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), tokenClaimsContextKey{}, claims))
		c.Next()
	}
}

func validateAccessToken(ctx context.Context, token, issuer, clientID string, cache *keyCache) (*tokenClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("malformed JWT")
	}
	var header tokenHeader
	if err := decodeJWTPart(parts[0], &header); err != nil {
		return nil, err
	}
	if header.Algorithm != "RS256" || header.KeyID == "" {
		return nil, errors.New("unsupported JWT header")
	}
	var claims tokenClaims
	if err := decodeJWTPart(parts[1], &claims); err != nil {
		return nil, err
	}
	now := time.Now().Unix()
	if claims.Issuer != issuer || claims.ExpiresAt <= now || (claims.NotBefore != 0 && claims.NotBefore > now+30) {
		return nil, errors.New("invalid token claims")
	}
	if claims.AuthorizedParty != clientID && !audienceContains(claims.Audience, clientID) {
		return nil, errors.New("token was issued to another client")
	}
	key, err := cache.get(ctx, issuer+"/protocol/openid-connect/certs", header.KeyID)
	if err != nil {
		return nil, err
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, err
	}
	digest := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	if err := rsa.VerifyPKCS1v15(key, crypto.SHA256, digest[:], signature); err != nil {
		return nil, err
	}
	return &claims, nil
}

func decodeJWTPart(part string, destination any) error {
	decoded, err := base64.RawURLEncoding.DecodeString(part)
	if err != nil {
		return err
	}
	return json.Unmarshal(decoded, destination)
}

func audienceContains(raw json.RawMessage, expected string) bool {
	var one string
	if json.Unmarshal(raw, &one) == nil {
		return one == expected
	}
	var many []string
	if json.Unmarshal(raw, &many) != nil {
		return false
	}
	for _, audience := range many {
		if audience == expected {
			return true
		}
	}
	return false
}

func (cache *keyCache) get(ctx context.Context, url, keyID string) (*rsa.PublicKey, error) {
	cache.mu.RLock()
	key, fresh := cache.keys[keyID], time.Now().Before(cache.expires)
	cache.mu.RUnlock()
	if key != nil && fresh {
		return key, nil
	}
	if err := cache.refresh(ctx, url); err != nil {
		return nil, err
	}
	cache.mu.RLock()
	defer cache.mu.RUnlock()
	key = cache.keys[keyID]
	if key == nil {
		return nil, errors.New("signing key not found")
	}
	return key, nil
}

func (cache *keyCache) refresh(ctx context.Context, url string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	client := &http.Client{Timeout: 5 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS request failed: %s", response.Status)
	}
	var set jwkSet
	if err := json.NewDecoder(response.Body).Decode(&set); err != nil {
		return err
	}
	keys := make(map[string]*rsa.PublicKey)
	for _, item := range set.Keys {
		if item.KeyType != "RSA" || item.Use != "sig" || item.Algorithm != "RS256" {
			continue
		}
		n, nErr := base64.RawURLEncoding.DecodeString(item.Modulus)
		e, eErr := base64.RawURLEncoding.DecodeString(item.Exponent)
		if nErr != nil || eErr != nil || len(e) == 0 {
			continue
		}
		exponent := 0
		for _, value := range e {
			exponent = exponent<<8 + int(value)
		}
		keys[item.KeyID] = &rsa.PublicKey{N: new(big.Int).SetBytes(n), E: exponent}
	}
	cache.mu.Lock()
	cache.keys, cache.expires = keys, time.Now().Add(15*time.Minute)
	cache.mu.Unlock()
	return nil
}
