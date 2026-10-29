package lib

import "strings"

func OptionalLikePattern(value *string) string {
	if value == nil || strings.TrimSpace(*value) == "" {
		return ""
	}

	return "%" + EscapeLike(strings.TrimSpace(*value)) + "%"
}

func WordsLikePattern(value *string) string {
	if value == nil {
		return ""
	}

	words := strings.Fields(*value)
	if len(words) == 0 {
		return ""
	}
	for index := range words {
		words[index] = EscapeLike(words[index])
	}
	return "%" + strings.Join(words, "%") + "%"
}

func EscapeLike(value string) string {
	replacer := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`, `[`, `\[`)
	return replacer.Replace(value)
}
