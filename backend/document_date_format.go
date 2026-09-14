package main

import "time"

func formatDocumentDate(value *time.Time) string {
	if value == nil {
		return ""
	}
	return value.Format("2.1.2006")
}
