package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"mime/quotedprintable"
	"net"
	"net/mail"
	"net/smtp"
	"path/filepath"
	"strings"
	"time"
)

type EmailAttachment struct {
	Filename    string
	ContentType string
	Data        []byte
}

type EmailMessage struct {
	To          string
	BCC         string
	Subject     string
	Body        string
	Attachments []EmailAttachment
}

type EmailSender interface {
	Send(context.Context, EmailMessage) error
}

type SMTPEmailService struct{ config *AppConfig }

func NewEmailSender(config *AppConfig) EmailSender { return &SMTPEmailService{config: config} }

func (service *SMTPEmailService) Send(ctx context.Context, message EmailMessage) error {
	if service.config.SMTPHost == "" || service.config.SMTPFromAddress == "" {
		return fmt.Errorf("email delivery is not configured")
	}
	data, err := buildMIMEMessage(service.config.SMTPFromAddress, message)
	if err != nil {
		return err
	}
	address := net.JoinHostPort(service.config.SMTPHost, service.config.SMTPPort)
	dialer := net.Dialer{Timeout: 15 * time.Second}
	var connection net.Conn
	if service.config.SMTPSecurity == "tls" {
		connection, err = tls.DialWithDialer(&dialer, "tcp", address, &tls.Config{ServerName: service.config.SMTPHost, MinVersion: tls.VersionTLS12})
	} else {
		connection, err = dialer.DialContext(ctx, "tcp", address)
	}
	if err != nil {
		return fmt.Errorf("connect to mail server: %w", err)
	}
	defer connection.Close()
	client, err := smtp.NewClient(connection, service.config.SMTPHost)
	if err != nil {
		return fmt.Errorf("start mail session: %w", err)
	}
	defer client.Close()
	if service.config.SMTPSecurity == "starttls" {
		if err := client.StartTLS(&tls.Config{ServerName: service.config.SMTPHost, MinVersion: tls.VersionTLS12}); err != nil {
			return fmt.Errorf("secure mail session: %w", err)
		}
	} else if service.config.SMTPSecurity != "none" && service.config.SMTPSecurity != "tls" {
		return fmt.Errorf("invalid SMTP security mode")
	}
	if service.config.SMTPUsername != "" {
		if err := client.Auth(smtp.PlainAuth("", service.config.SMTPUsername, service.config.SMTPPassword, service.config.SMTPHost)); err != nil {
			return fmt.Errorf("authenticate with mail server: %w", err)
		}
	}
	from, _ := mail.ParseAddress(service.config.SMTPFromAddress)
	to, _ := mail.ParseAddress(message.To)
	var bcc *mail.Address
	if message.BCC != "" {
		bcc, _ = mail.ParseAddress(message.BCC)
	}
	if err := client.Mail(from.Address); err != nil {
		return fmt.Errorf("set email sender: %w", err)
	}
	if err := client.Rcpt(to.Address); err != nil {
		return fmt.Errorf("set email recipient: %w", err)
	}
	if bcc != nil {
		if err := client.Rcpt(bcc.Address); err != nil {
			return fmt.Errorf("set blind-copy recipient: %w", err)
		}
	}
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("start email delivery: %w", err)
	}
	if _, err = w.Write(data); err != nil {
		return fmt.Errorf("write email: %w", err)
	}
	if err = w.Close(); err != nil {
		return fmt.Errorf("finish email delivery: %w", err)
	}
	if err = client.Quit(); err != nil {
		return fmt.Errorf("finish mail session: %w", err)
	}
	return nil
}

func buildMIMEMessage(from string, message EmailMessage) ([]byte, error) {
	if hasHeaderInjection(from) || hasHeaderInjection(message.To) || hasHeaderInjection(message.Subject) {
		return nil, fmt.Errorf("email headers contain invalid characters")
	}
	fromAddress, err := mail.ParseAddress(from)
	if err != nil {
		return nil, fmt.Errorf("invalid sender address")
	}
	toAddress, err := mail.ParseAddress(message.To)
	if err != nil {
		return nil, fmt.Errorf("invalid recipient address")
	}
	var output bytes.Buffer
	mixed := multipart.NewWriter(&output)
	fmt.Fprintf(&output, "From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=%q\r\n\r\n", fromAddress.String(), toAddress.String(), mime.QEncoding.Encode("UTF-8", message.Subject), mixed.Boundary())
	bodyHeader := make(map[string][]string)
	bodyHeader["Content-Type"] = []string{"text/plain; charset=UTF-8"}
	bodyHeader["Content-Transfer-Encoding"] = []string{"quoted-printable"}
	part, err := mixed.CreatePart(bodyHeader)
	if err != nil {
		return nil, err
	}
	quoted := quotedprintable.NewWriter(part)
	_, err = quoted.Write([]byte(message.Body))
	if err == nil {
		err = quoted.Close()
	}
	if err != nil {
		return nil, err
	}
	for _, attachment := range message.Attachments {
		filename := filepath.Base(strings.ReplaceAll(strings.ReplaceAll(attachment.Filename, "\r", ""), "\n", ""))
		header := make(map[string][]string)
		header["Content-Type"] = []string{attachment.ContentType}
		header["Content-Disposition"] = []string{mime.FormatMediaType("attachment", map[string]string{"filename": filename})}
		header["Content-Transfer-Encoding"] = []string{"base64"}
		part, err := mixed.CreatePart(header)
		if err != nil {
			return nil, err
		}
		encoder := base64.NewEncoder(base64.StdEncoding, &lineWriter{writer: part})
		if _, err = encoder.Write(attachment.Data); err == nil {
			err = encoder.Close()
		}
		if err != nil {
			return nil, err
		}
	}
	if err := mixed.Close(); err != nil {
		return nil, err
	}
	return output.Bytes(), nil
}

type lineWriter struct {
	writer io.Writer
	column int
}

func (writer *lineWriter) Write(data []byte) (int, error) {
	written := 0
	for _, value := range data {
		if writer.column == 76 {
			if _, err := writer.writer.Write([]byte("\r\n")); err != nil {
				return written, err
			}
			writer.column = 0
		}
		if _, err := writer.writer.Write([]byte{value}); err != nil {
			return written, err
		}
		writer.column++
		written++
	}
	return written, nil
}

func hasHeaderInjection(value string) bool { return strings.ContainsAny(value, "\r\n") }
