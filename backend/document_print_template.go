package main

import (
	_ "embed"
	"html/template"
)

type documentPrintHeader struct {
	Customer invoicePrintCustomer
	Logo     template.URL
}

//go:embed print/shared/document-header.html
var documentHeaderHTMLTemplate string

//go:embed print/shared/document-header.css
var documentHeaderCSSTemplate string
