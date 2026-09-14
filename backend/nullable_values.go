package main

import "strings"

func trimmedString(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}

func float64OrZero(value *float64) float64 {
	if value == nil {
		return 0
	}
	return *value
}
