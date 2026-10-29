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
		if err := encoder.EncodeToken(token); err != nil {
			return err
		}
	}
}
