package main

// Shared email request handling for generated documents.

import (
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	maxEmailRequestSize = 20 << 20
	maxAttachmentSize   = 5 << 20
	maxAttachments      = 5
)

var allowedAttachmentTypes = map[string]bool{
	"application/pdf": true, "image/jpeg": true, "image/png": true, "image/webp": true,
	"text/plain": true, "text/csv": true, "application/msword": true,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	"application/vnd.ms-excel": true,
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
}

type documentEmailRequest struct {
	recipient, bcc, subject, message string
	attachments                      []EmailAttachment
}

func parseDocumentEmailRequest(context *gin.Context) (*documentEmailRequest, bool) {
	context.Request.Body = http.MaxBytesReader(context.Writer, context.Request.Body, maxEmailRequestSize)
	if err := context.Request.ParseMultipartForm(maxEmailRequestSize); err != nil {
		context.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "email request must be at most 20 MiB"})
		return nil, false
	}
	request := &documentEmailRequest{
		recipient: strings.TrimSpace(context.PostForm("recipient")), bcc: strings.TrimSpace(context.PostForm("bcc")),
		subject: strings.TrimSpace(context.PostForm("subject")), message: strings.TrimSpace(context.PostForm("message")),
	}
	if err := validateEmailFields(request.recipient, request.subject, request.message); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return nil, false
	}
	if err := validateOptionalEmailAddress(request.bcc, "BCC"); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return nil, false
	}
	files := context.Request.MultipartForm.File["attachments"]
	if len(files) > maxAttachments {
		context.JSON(http.StatusBadRequest, gin.H{"error": "at most 5 additional attachments are allowed"})
		return nil, false
	}
	for _, header := range files {
		filename := safeUploadFilename(header.Filename)
		if header.Size > maxAttachmentSize {
			context.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("attachment %q must be at most 5 MiB", filename)})
			return nil, false
		}
		contentType := strings.ToLower(strings.TrimSpace(strings.Split(header.Header.Get("Content-Type"), ";")[0]))
		if !allowedAttachmentTypes[contentType] {
			context.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("attachment %q has an unsupported file type", filename)})
			return nil, false
		}
		file, err := header.Open()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": "could not read an attachment"})
			return nil, false
		}
		data, readErr := io.ReadAll(io.LimitReader(file, maxAttachmentSize+1))
		_ = file.Close()
		if readErr != nil || len(data) > maxAttachmentSize {
			context.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("attachment %q must be at most 5 MiB", filename)})
			return nil, false
		}
		request.attachments = append(request.attachments, EmailAttachment{Filename: filename, ContentType: contentType, Data: data})
	}
	return request, true
}

func sendDocumentEmail(context *gin.Context, sender EmailSender, request *documentEmailRequest, pdfFilename string, pdf []byte, storedRecipient string) {
	attachments := append([]EmailAttachment{{Filename: pdfFilename, ContentType: "application/pdf", Data: pdf}}, request.attachments...)
	if err := sender.Send(context.Request.Context(), EmailMessage{To: request.recipient, BCC: request.bcc, Subject: request.subject, Body: request.message, Attachments: attachments}); err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"error": "the email could not be delivered; check the mail configuration and try again"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"sent": true, "recipientDiffers": emailRecipientsDiffer(storedRecipient, request.recipient)})
}

func validateEmailFields(recipient, subject, message string) error {
	if recipient == "" {
		return fmt.Errorf("recipient is required")
	}
	if hasHeaderInjection(recipient) || hasHeaderInjection(subject) {
		return fmt.Errorf("email fields contain invalid characters")
	}
	address, err := mail.ParseAddress(recipient)
	if err != nil || !strings.EqualFold(address.Address, recipient) {
		return fmt.Errorf("recipient must be a valid email address")
	}
	if subject == "" {
		return fmt.Errorf("subject is required")
	}
	if len([]rune(subject)) > 200 {
		return fmt.Errorf("subject must be at most 200 characters")
	}
	if message == "" {
		return fmt.Errorf("message is required")
	}
	if len([]rune(message)) > 10000 {
		return fmt.Errorf("message must be at most 10000 characters")
	}
	return nil
}

func validateOptionalEmailAddress(value, field string) error {
	if value == "" {
		return nil
	}
	if hasHeaderInjection(value) {
		return fmt.Errorf("%s contains invalid characters", field)
	}
	address, err := mail.ParseAddress(value)
	if err != nil || !strings.EqualFold(address.Address, value) {
		return fmt.Errorf("%s must be a valid email address", field)
	}
	return nil
}

func emailRecipientsDiffer(stored, entered string) bool {
	stored = strings.TrimSpace(stored)
	return stored != "" && !strings.EqualFold(stored, strings.TrimSpace(entered))
}
