package furs

import (
	"bytes"
	_ "embed"
	"encoding/xml"
	"fmt"
	"io"
	"strings"
	"sync"
	"testing/fstest"

	"github.com/cB-Sigma/xsd"
)

const (
	fursNamespace         = "http://www.fu.gov.si/"
	xmlSignatureNamespace = "http://www.w3.org/2000/09/xmldsig#"
)

//go:embed FiscalVerification.wsdl
var fiscalVerificationWSDL []byte

var (
	fiscalSchema     *xsd.Schema
	fiscalSchemaErr  error
	fiscalSchemaOnce sync.Once
)

// ValidateSOAPInvoice validates the final InvoiceRequest contained in a SOAP
// envelope against the FURS and XML Signature schemas embedded in the WSDL.
func ValidateSOAPInvoice(payload []byte) error {
	request, err := invoiceRequestFromSOAP(payload)
	if err != nil {
		return err
	}
	schema, err := loadFiscalSchema()
	if err != nil {
		return err
	}
	if err := schema.Validate(request); err != nil {
		return fmt.Errorf("validate final FURS InvoiceRequest against WSDL schema: %w", err)
	}
	return nil
}

func loadFiscalSchema() (*xsd.Schema, error) {
	fiscalSchemaOnce.Do(func() {
		schemas, err := embeddedSchemas(fiscalVerificationWSDL)
		if err != nil {
			fiscalSchemaErr = err
			return
		}
		fursSchema := schemas[0]
		openingTagEnd := bytes.IndexByte(fursSchema, '>')
		if openingTagEnd < 0 {
			fiscalSchemaErr = fmt.Errorf("load FURS WSDL schema: invalid schema element")
			return
		}
		importSignatureSchema := []byte(`<import namespace="` + xmlSignatureNamespace + `" schemaLocation="xmldsig.xsd"/>`)
		fursSchema = append(append(append([]byte{}, fursSchema[:openingTagEnd+1]...), importSignatureSchema...), fursSchema[openingTagEnd+1:]...)
		files := fstest.MapFS{
			"furs.xsd":    {Data: fursSchema},
			"xmldsig.xsd": {Data: schemas[1]},
		}
		fiscalSchema, fiscalSchemaErr = xsd.Load(files, "furs.xsd")
		if fiscalSchemaErr != nil {
			fiscalSchemaErr = fmt.Errorf("load schemas embedded in FURS WSDL: %w", fiscalSchemaErr)
		}
	})
	return fiscalSchema, fiscalSchemaErr
}

func embeddedSchemas(wsdl []byte) ([][]byte, error) {
	remaining := wsdl
	schemas := make([][]byte, 0, 2)
	for len(schemas) < 2 {
		start := bytes.Index(remaining, []byte("<schema"))
		if start < 0 {
			break
		}
		end := bytes.Index(remaining[start:], []byte("</schema>"))
		if end < 0 {
			return nil, fmt.Errorf("load FURS WSDL schema: unterminated schema element")
		}
		end += start + len("</schema>")
		schemas = append(schemas, append([]byte{}, remaining[start:end]...))
		remaining = remaining[end:]
	}
	if len(schemas) != 2 {
		return nil, fmt.Errorf("load FURS WSDL schema: expected 2 embedded schemas, found %d", len(schemas))
	}
	return schemas, nil
}

func invoiceRequestFromSOAP(payload []byte) ([]byte, error) {
	decoder := xml.NewDecoder(bytes.NewReader(payload))
	var output bytes.Buffer
	encoder := xml.NewEncoder(&output)
	depth := 0
	found := false
	for {
		token, err := decoder.Token()
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, fmt.Errorf("parse final FURS SOAP request: %w", err)
		}
		switch value := token.(type) {
		case xml.StartElement:
			if !found && value.Name.Space == fursNamespace && value.Name.Local == "InvoiceRequest" {
				found = true
				depth = 1
			} else if depth > 0 {
				depth++
			}
			if depth > 0 {
				value.Attr = withoutNamespaceDeclarations(value.Attr)
				if err := encoder.EncodeToken(value); err != nil {
					return nil, fmt.Errorf("copy final FURS InvoiceRequest: %w", err)
				}
			}
		case xml.EndElement:
			if depth > 0 {
				if err := encoder.EncodeToken(value); err != nil {
					return nil, fmt.Errorf("copy final FURS InvoiceRequest: %w", err)
				}
				depth--
				if depth == 0 {
					if err := encoder.Flush(); err != nil {
						return nil, fmt.Errorf("copy final FURS InvoiceRequest: %w", err)
					}
					return output.Bytes(), nil
				}
			}
		default:
			if depth > 0 {
				if err := encoder.EncodeToken(token); err != nil {
					return nil, fmt.Errorf("copy final FURS InvoiceRequest: %w", err)
				}
			}
		}
	}
	return nil, fmt.Errorf("final FURS SOAP request does not contain InvoiceRequest")
}

func withoutNamespaceDeclarations(attributes []xml.Attr) []xml.Attr {
	filtered := attributes[:0]
	for _, attribute := range attributes {
		if attribute.Name.Local == "xmlns" || attribute.Name.Space == "xmlns" || strings.Contains(attribute.Name.Space, "2000/xmlns") {
			continue
		}
		filtered = append(filtered, attribute)
	}
	return filtered
}
