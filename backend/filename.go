package main

import (
	"path"
	"path/filepath"
	"regexp"
	"strings"
)

var windowsAbsolutePathPattern = regexp.MustCompile(`^[A-Za-z]:[\\/]`)

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

// joinPlatformPath joins a configured folder and filename according to the
// syntax of the configured path, rather than the OS running the backend. This
// matters when SQL Server is hosted on a different operating system.
func joinPlatformPath(folder, filename string) string {
	folder = normalizePlatformPath(folder)
	if windowsAbsolutePathPattern.MatchString(folder) || strings.HasPrefix(folder, `\\`) {
		return strings.TrimRight(folder, `\/`) + `\` + filename
	}
	return path.Join(folder, filename)
}

func normalizePlatformPath(value string) string {
	value = strings.TrimSpace(value)
	if !windowsAbsolutePathPattern.MatchString(value) && !strings.HasPrefix(value, `\\`) {
		return value
	}

	prefix := ""
	if strings.HasPrefix(value, `\\`) {
		prefix = `\\`
		value = strings.TrimLeft(value, `\`)
	}
	for strings.Contains(value, `\\`) {
		value = strings.ReplaceAll(value, `\\`, `\`)
	}
	return prefix + value
}
