package lib

import (
	"fmt"
	"math"
)

func RoundCurrency(value float64) float64 {
	return math.Round(value*100) / 100
}

func CurrencyCents(value float64) int64 {
	return int64(math.Round(value * 100))
}

func DivideOrZero(value float64, divisor float64) float64 {
	if divisor == 0 {
		return 0
	}
	return value / divisor
}

func SlovenianAmountInWords(value float64) string {
	totalCents := CurrencyCents(value)
	negative := totalCents < 0
	if negative {
		totalCents = -totalCents
	}
	amountInWords := slovenianInteger(totalCents/100) + fmt.Sprintf(" %02d/100", totalCents%100)
	if negative {
		return "minus " + amountInWords
	}
	return amountInWords
}

func slovenianInteger(value int64) string {
	if value == 0 {
		return "nič"
	}
	if value < 0 {
		return "minus " + slovenianInteger(-value)
	}
	if value >= 1000 {
		thousands := value / 1000
		prefix := slovenianInteger(thousands) + " tisoč"
		if thousands == 1 {
			prefix = "tisoč"
		}
		if remainder := value % 1000; remainder != 0 {
			return prefix + " " + slovenianInteger(remainder)
		}
		return prefix
	}

	result := ""
	if value >= 100 {
		hundreds := []string{
			"", "sto", "dvesto", "tristo", "štiristo",
			"petsto", "šeststo", "sedemsto", "osemsto", "devetsto",
		}
		result = hundreds[value/100]
		value %= 100
	}
	if value == 0 {
		return result
	}
	if result != "" {
		result += " "
	}

	units := []string{
		"", "ena", "dva", "tri", "štiri", "pet", "šest", "sedem", "osem", "devet",
	}
	teens := []string{
		"deset", "enajst", "dvanajst", "trinajst", "štirinajst",
		"petnajst", "šestnajst", "sedemnajst", "osemnajst", "devetnajst",
	}
	tens := []string{
		"", "", "dvajset", "trideset", "štirideset",
		"petdeset", "šestdeset", "sedemdeset", "osemdeset", "devetdeset",
	}
	switch {
	case value < 10:
		result += units[value]
	case value < 20:
		result += teens[value-10]
	case value%10 == 0:
		result += tens[value/10]
	default:
		result += units[value%10] + "in" + tens[value/10]
	}
	return result
}
