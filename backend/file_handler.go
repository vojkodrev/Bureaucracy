package main

import (
	"bytes"
	"database/sql"
	"errors"
	"fmt"
	"image"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/deepteams/webp"
	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	maxImageUploadSize = 20 << 20
	maxImagePixels     = 40_000_000
	maxImageDimension  = 1920
)

type FileHandler struct{ database *sql.DB }

func NewFileHandler(database *sql.DB) *FileHandler {
	return &FileHandler{database: database}
}

func (handler *FileHandler) UploadImage(context *gin.Context) {
	context.Request.Body = http.MaxBytesReader(context.Writer, context.Request.Body, maxImageUploadSize)
	file, header, err := context.Request.FormFile("file")
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "An image file of at most 20 MB is required"})
		return
	}
	defer file.Close()
	upload, err := io.ReadAll(file)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Could not read image"})
		return
	}
	encoded, width, height, err := prepareImage(upload)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fileID := uuid.New()
	originalFilename := filepath.Base(strings.TrimSpace(header.Filename))
	if originalFilename == "." || originalFilename == "" {
		originalFilename = "image"
	}
	if len([]rune(originalFilename)) > 255 {
		originalFilename = string([]rune(originalFilename)[:255])
	}
	_, err = handler.database.ExecContext(context.Request.Context(), `
		INSERT INTO [Bureaucracy].[dbo].[file_storage]
		(id,original_filename,content_type,byte_size,file_data)
		VALUES (@id,@originalFilename,@contentType,@byteSize,@fileData)`,
		sql.Named("id", fileID), sql.Named("originalFilename", originalFilename),
		sql.Named("contentType", "image/webp"), sql.Named("byteSize", len(encoded)),
		sql.Named("fileData", encoded))
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Could not store file"})
		return
	}
	context.JSON(http.StatusCreated, gin.H{"fileId": fileID.String(), "contentType": "image/webp", "width": width, "height": height})
}

func (handler *FileHandler) Display(context *gin.Context) {
	fileID, err := uuid.Parse(context.Param("fileId"))
	if err != nil {
		context.Status(http.StatusBadRequest)
		return
	}
	var contentType string
	var data []byte
	err = handler.database.QueryRowContext(context.Request.Context(), `
		SELECT content_type,file_data FROM [Bureaucracy].[dbo].[file_storage]
		WHERE id=@id`, sql.Named("id", fileID)).Scan(&contentType, &data)
	if errors.Is(err, sql.ErrNoRows) {
		context.Status(http.StatusNotFound)
		return
	}
	if err != nil {
		context.Status(http.StatusInternalServerError)
		return
	}
	context.Data(http.StatusOK, contentType, data)
}

func prepareImage(upload []byte) ([]byte, int, int, error) {
	configuration, _, err := image.DecodeConfig(bytes.NewReader(upload))
	if err != nil || configuration.Width < 1 || configuration.Height < 1 {
		return nil, 0, 0, fmt.Errorf("the uploaded file is not a supported image")
	}
	if int64(configuration.Width)*int64(configuration.Height) > maxImagePixels {
		return nil, 0, 0, fmt.Errorf("the uploaded image is too large")
	}
	photo, err := imaging.Decode(bytes.NewReader(upload), imaging.AutoOrientation(true))
	if err != nil {
		return nil, 0, 0, fmt.Errorf("could not decode the uploaded image")
	}
	bounds := photo.Bounds()
	if bounds.Dx() > maxImageDimension || bounds.Dy() > maxImageDimension {
		photo = imaging.Fit(photo, maxImageDimension, maxImageDimension, imaging.Lanczos)
	}
	bounds = photo.Bounds()
	var encoded bytes.Buffer
	if err := webp.Encode(&encoded, photo, &webp.EncoderOptions{
		Quality: 82, Method: 4, Preset: webp.PresetPhoto, UseSharpYUV: true,
	}); err != nil {
		return nil, 0, 0, fmt.Errorf("could not encode the uploaded image")
	}
	return encoded.Bytes(), bounds.Dx(), bounds.Dy(), nil
}
