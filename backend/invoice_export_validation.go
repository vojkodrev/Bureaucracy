package main

import (
	"fmt"
	"strings"
)

func validateInvoiceCustomerBankDetails(invoice *Invoice) error {
	if invoice == nil {
		return fmt.Errorf("invoice is required")
	}
	if strings.TrimSpace(trimmedString(invoice.CustomerIBAN)) == "" {
		return fmt.Errorf("customer IBAN is required for invoice export")
	}
	if strings.TrimSpace(trimmedString(invoice.CustomerBIC)) == "" {
		return fmt.Errorf("customer BIC is required for invoice export")
	}
	return nil
}
