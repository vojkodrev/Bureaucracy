package lib

import "math"

func RoundCurrency(value float64) float64 {
	return math.Round(value*100) / 100
}
