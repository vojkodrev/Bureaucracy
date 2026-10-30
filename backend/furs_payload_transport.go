package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"

	"bureaucracy/backend/furs"
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
	if err := furs.ValidateSOAPInvoice(payload); err != nil {
		return nil, err
	}
	request.Body = io.NopCloser(bytes.NewReader(payload))
	request.ContentLength = int64(len(payload))
	requestID, err := transport.requests.Create(request.Context(), FURSSOAPRequest{
		BusinessYearID: transport.businessYearID,
		InvoiceID:      transport.invoiceID,
		InvoiceNumber:  transport.invoiceNumber,
		RequestURL:     request.URL.String(),
		SOAPAction:     strings.Trim(request.Header.Get("SOAPAction"), `"`),
		Payload:        string(payload),
	})
	if err != nil {
		return nil, err
	}
	response, err := transport.base.RoundTrip(request)
	if err != nil {
		return nil, err
	}
	responsePayload, err := io.ReadAll(response.Body)
	if err != nil {
		_ = response.Body.Close()
		return nil, fmt.Errorf("read FURS SOAP response: %w", err)
	}
	_ = response.Body.Close()
	response.Body = io.NopCloser(bytes.NewReader(responsePayload))
	response.ContentLength = int64(len(responsePayload))
	if err := transport.requests.SaveResponse(request.Context(), requestID, response.StatusCode, string(responsePayload)); err != nil {
		_ = response.Body.Close()
		return nil, err
	}
	return response, nil
}
