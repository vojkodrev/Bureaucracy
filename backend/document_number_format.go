package main

import (
	"fmt"
	"strings"
)

func formatMoneyAmount(value float64) string {
	return strings.Replace(fmt.Sprintf("%.2f", value), ".", ",", 1)
}

func formatQuantity(value float64) string {
	if value == float64(int64(value)) {
		return fmt.Sprintf("%d", int64(value))
	}
	return strings.TrimRight(strings.TrimRight(strings.Replace(fmt.Sprintf("%.3f", value), ".", ",", 1), "0"), ",")
}

func formatPercentage(value float64) string {
	return formatQuantity(value) + " %"
}
