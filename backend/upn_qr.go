package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/qrcode"
	"github.com/makiuchi-d/gozxing/qrcode/decoder"
	"golang.org/x/text/encoding/charmap"
)

const (
	upnRecipientName    = "DREVI d.o.o."
	upnRecipientAddress = "Ob železnici 16"
	upnRecipientPlace   = "1000 Ljubljana"
	upnRecipientIBAN    = "SI56040000278805004"
)

func generateUPNQRCode(invoice *Invoice, displayNumber string, amount float64) (string, error) {
	if amount <= 0 {
		return "", nil
	}
	if amount > 999999999.99 {
		return "", fmt.Errorf("invoice amount is too large for a UPN QR code")
	}

	model, reference := upnReference(stringValue(invoice.PaymentReference), displayNumber)
	fields := []string{
		"UPNQR", "", "", "", "",
		upnField(stringValue(invoice.CustomerName), 33),
		upnField(stringValue(invoice.CustomerAddress), 33),
		upnField(customerLocation(invoice.CustomerPostalCode, invoice.CustomerCity), 33),
		fmt.Sprintf("%011d", int64(math.Round(amount*100))),
		"", "", "OTHR",
		upnField("Plačilo računa "+displayNumber, 42),
		upnDueDate(invoice.DueDate),
		upnRecipientIBAN,
		model + reference,
		upnRecipientName,
		upnRecipientAddress,
		upnRecipientPlace,
	}
	payloadWithoutChecksum := strings.Join(fields, "\n") + "\n"
	checksum := utf8.RuneCountInString(payloadWithoutChecksum)
	payload := payloadWithoutChecksum + fmt.Sprintf("%03d\n", checksum)

	matrix, err := qrcode.NewQRCodeWriter().Encode(
		payload,
		gozxing.BarcodeFormat_QR_CODE,
		500,
		500,
		map[gozxing.EncodeHintType]interface{}{
			gozxing.EncodeHintType_CHARACTER_SET:    "ISO-8859-2",
			gozxing.EncodeHintType_ERROR_CORRECTION: decoder.ErrorCorrectionLevel_M,
			gozxing.EncodeHintType_QR_VERSION:       15,
			gozxing.EncodeHintType_MARGIN:           4,
		},
	)
	if err != nil {
		return "", fmt.Errorf("encode UPN QR code: %w", err)
	}

	qrImage := image.NewGray(image.Rect(0, 0, matrix.GetWidth(), matrix.GetHeight()))
	for y := 0; y < matrix.GetHeight(); y++ {
		for x := 0; x < matrix.GetWidth(); x++ {
			pixel := color.White
			if matrix.Get(x, y) {
				pixel = color.Black
			}
			qrImage.Set(x, y, pixel)
		}
	}
	var encoded bytes.Buffer
	if err := png.Encode(&encoded, qrImage); err != nil {
		return "", fmt.Errorf("render UPN QR code: %w", err)
	}
	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(encoded.Bytes()), nil
}

func upnField(value string, maximumLength int) string {
	value = strings.Join(strings.Fields(value), " ")
	runes := make([]rune, 0, maximumLength)
	for _, character := range value {
		if len(runes) == maximumLength {
			break
		}
		if _, supported := charmap.ISO8859_2.EncodeRune(character); supported {
			runes = append(runes, character)
		} else {
			runes = append(runes, '?')
		}
	}
	return string(runes)
}

func upnDueDate(value *time.Time) string {
	if value == nil {
		return ""
	}
	return value.Format("02.01.2006")
}

func upnReference(value string, displayNumber string) (string, string) {
	value = strings.ReplaceAll(value, "#ŠTEVILKA#", displayNumber)
	value = strings.ToUpper(strings.Join(strings.Fields(value), ""))
	model := "SI00"
	if len(value) >= 4 && strings.HasPrefix(value, "SI") {
		model, value = value[:4], value[4:]
	}
	if value == "" {
		value = strings.NewReplacer("/", "-", " ", "").Replace(displayNumber)
	}
	return upnField(model, 4), upnField(value, 22)
}
