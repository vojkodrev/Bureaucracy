package lib

import "math"

func RoundCurrency(value float64) float64 {
	return math.Round(value*100) / 100
}

func CurrencyCents(value float64) int64 {
	return int64(math.Round(value * 100))
}
