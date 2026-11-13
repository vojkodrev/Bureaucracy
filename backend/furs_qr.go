package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math/big"
	"strings"
	"time"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/qrcode"
	"github.com/makiuchi-d/gozxing/qrcode/decoder"
)

func generateFURSTaxQRCode(zoi string, taxNumber string, issuedAt *time.Time) (string, error) {
	payload, err := fursTaxQRPayload(zoi, taxNumber, issuedAt)
	if err != nil {
		return "", err
	}
	matrix, err := qrcode.NewQRCodeWriter().Encode(
		payload,
		gozxing.BarcodeFormat_QR_CODE,
		200,
		200,
		map[gozxing.EncodeHintType]interface{}{
			gozxing.EncodeHintType_ERROR_CORRECTION: decoder.ErrorCorrectionLevel_M,
			gozxing.EncodeHintType_QR_VERSION:       2,
			gozxing.EncodeHintType_MARGIN:           4,
		},
	)
	if err != nil {
		return "", fmt.Errorf("encode FURS QR code: %w", err)
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
		return "", fmt.Errorf("render FURS QR code: %w", err)
	}
	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(encoded.Bytes()), nil
}

func fursTaxQRPayload(zoi string, taxNumber string, issuedAt *time.Time) (string, error) {
	zoi = strings.TrimSpace(zoi)
	zoiNumber, valid := new(big.Int).SetString(zoi, 16)
	if !valid || len(zoi) != 32 {
		return "", fmt.Errorf("ZOI must contain 32 hexadecimal characters")
	}
	taxNumber = strings.TrimSpace(taxNumber)
	if !fursTaxNumberPattern.MatchString(taxNumber) {
		return "", fmt.Errorf("FURS tax number must contain 8 digits")
	}
	if issuedAt == nil {
		return "", fmt.Errorf("FURS confirmation timestamp is required")
	}

	decimalZOI := zoiNumber.String()
	payload := strings.Repeat("0", 39-len(decimalZOI)) + decimalZOI + taxNumber + issuedAt.Format("060102150405")
	checksum := 0
	for _, digit := range payload {
		checksum += int(digit - '0')
	}
	return payload + fmt.Sprintf("%d", checksum%10), nil
}
