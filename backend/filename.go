package main

import (
	"path/filepath"
	"strings"
)

func safeFilenamePart(value string, fallback string) string {
	value = strings.Map(func(character rune) rune {
		if character < 32 || character == 127 {
			return -1
		}
		if strings.ContainsRune(`<>:"/\|?*`, character) {
			return '-'
		}
		return character
	}, value)
	value = strings.Trim(value, " .")
	if value == "" {
		return fallback
	}
	return value
}

func safeUploadFilename(value string) string {
	value = filepath.Base(strings.ReplaceAll(value, "\\", "/"))
	return safeFilenamePart(value, "attachment")
}
