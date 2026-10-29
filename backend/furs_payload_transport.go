package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type FURSPayloadTransport struct {
	base           http.RoundTripper
	requests       *FURSSOAPRequestRepository
	businessYearID int
	invoiceID      int
	invoiceNumber  string
}

func (transport *FURSPayloadTransport) RoundTrip(request *http.Request) (*http.Response, error) {
	payload, err := io.ReadAll(request.Body)
	if err != nil {
		return nil, fmt.Errorf("read FURS SOAP payload: %w", err)
	}
	_ = request.Body.Close()
	request.Body = io.NopCloser(bytes.NewReader(payload))
	request.ContentLength = int64(len(payload))
	if err := transport.requests.Save(request.Context(), FURSSOAPRequest{
		BusinessYearID: transport.businessYearID,
		InvoiceID:      transport.invoiceID,
		InvoiceNumber:  transport.invoiceNumber,
		RequestURL:     request.URL.String(),
		SOAPAction:     strings.Trim(request.Header.Get("SOAPAction"), `"`),
		Payload:        string(payload),
	}); err != nil {
		return nil, err
	}
	return transport.base.RoundTrip(request)
}
