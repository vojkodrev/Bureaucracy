package main

import (
	"context"
	"net/http"

	"github.com/99designs/gqlgen/graphql"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const (
	adminRole   = "bureaucracy-admin"
	storageRole = "bureaucracy-storage"
)

var storageGraphQLFields = map[string]struct{}{
	"businessYear": {}, "businessYears": {}, "currentBusinessYear": {},
	"goodsReceipt": {}, "goodsReceiptStorages": {}, "latestInventoryItemPhotos": {},
	"inventoryItem": {}, "product": {}, "searchGoodsReceipts": {},
	"searchInventoryItems": {}, "inventoryItemGoodsReceiptCounts": {}, "searchProducts": {},
	"searchPurchasePredictions": {}, "taxCodes": {},
	"saveGoodsReceipt": {}, "saveInventoryItem": {},
}

var productPricingFields = map[string]struct{}{
	"grossPrice": {}, "netPrice": {}, "taxCode": {}, "taxRate": {},
}

func claimsFromContext(ctx context.Context) (*tokenClaims, bool) {
	claims, ok := ctx.Value(tokenClaimsContextKey{}).(*tokenClaims)
	return claims, ok
}

func hasRole(ctx context.Context, role string) bool {
	claims, ok := claimsFromContext(ctx)
	if !ok {
		return false
	}
	for _, assignedRole := range claims.RealmAccess.Roles {
		if assignedRole == role {
			return true
		}
	}
	return false
}

func RequireAnyRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, role := range roles {
			if hasRole(c.Request.Context(), role) {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
	}
}

func AuthorizeGraphQLField(ctx context.Context, next graphql.Resolver) (any, error) {
	field := graphql.GetFieldContext(ctx)
	if field == nil {
		return next(ctx)
	}
	if hasRole(ctx, adminRole) {
		return next(ctx)
	}
	if field.Object == "Product" {
		if _, pricingField := productPricingFields[field.Field.Name]; pricingField {
			return nil, forbiddenGraphQLError(ctx)
		}
		return next(ctx)
	}
	if field.Object != "Query" && field.Object != "Mutation" {
		return next(ctx)
	}
	if hasRole(ctx, storageRole) {
		if _, allowed := storageGraphQLFields[field.Field.Name]; allowed {
			if field.Field.Name == "searchProducts" {
				if sortBy, ok := field.Args["sortBy"].(string); ok {
					if _, pricingSort := productPricingFields[sortBy]; pricingSort {
						return nil, forbiddenGraphQLError(ctx)
					}
				}
			}
			return next(ctx)
		}
	}
	return nil, forbiddenGraphQLError(ctx)
}

func forbiddenGraphQLError(ctx context.Context) *gqlerror.Error {
	return &gqlerror.Error{
		Path:    graphql.GetPath(ctx),
		Message: "forbidden",
		Extensions: map[string]any{
			"code": "FORBIDDEN",
		},
	}
}
