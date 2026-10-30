package furs

import (
	"encoding/xml"
	"io"
	"strings"
)

type RawXML []byte

func (value RawXML) MarshalXML(encoder *xml.Encoder, _ xml.StartElement) error {
	decoder := xml.NewDecoder(strings.NewReader(string(value)))
	for {
		token, err := decoder.Token()
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}
		switch value := token.(type) {
		case xml.StartElement:
			value.Name = prefixedName(value.Name)
			attributes := value.Attr[:0]
			for _, attribute := range value.Attr {
				if attribute.Name.Local == "xmlns" || attribute.Name.Space == "xmlns" || attribute.Name.Space == "http://www.w3.org/2000/xmlns/" {
					continue
				}
				attributes = append(attributes, attribute)
			}
			value.Attr = attributes
			if value.Name.Local == "fu:InvoiceRequest" {
				value.Attr = append(value.Attr,
					xml.Attr{Name: xml.Name{Local: "xmlns:fu"}, Value: fursNamespace},
					xml.Attr{Name: xml.Name{Local: "xmlns:ds"}, Value: xmlSignatureNamespace},
				)
			}
			token = value
		case xml.EndElement:
			value.Name = prefixedName(value.Name)
			token = value
		}
		if err := encoder.EncodeToken(token); err != nil {
			return err
		}
	}
}

func prefixedName(name xml.Name) xml.Name {
	switch name.Space {
	case fursNamespace:
		return xml.Name{Local: "fu:" + name.Local}
	case xmlSignatureNamespace:
		return xml.Name{Local: "ds:" + name.Local}
	default:
		return name
	}
}
