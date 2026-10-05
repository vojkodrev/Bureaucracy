package main

import (
	"bytes"
	"database/sql"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	maxImageUploadSize = 20 << 20
	maxImagePixels     = 40_000_000
	maxImageDimension  = 2560
	targetImageSize    = 770 << 10
	minJPEGQuality     = 82
	maxJPEGQuality     = 95
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
		sql.Named("contentType", "image/jpeg"), sql.Named("byteSize", len(encoded)),
		sql.Named("fileData", encoded))
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Could not store file"})
		return
	}
	context.JSON(http.StatusCreated, gin.H{"fileId": fileID.String(), "contentType": "image/jpeg", "width": width, "height": height})
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
	// Limit storage size while retaining enough detail for text in photos.
	bounds := photo.Bounds()
	if bounds.Dx() > maxImageDimension || bounds.Dy() > maxImageDimension {
		photo = imaging.Fit(photo, maxImageDimension, maxImageDimension, imaging.Lanczos)
		bounds = photo.Bounds()
	}
	encoded, err := encodeJPEGNearTarget(photo, targetImageSize)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("could not encode the uploaded image")
	}
	return encoded, bounds.Dx(), bounds.Dy(), nil
}

// encodeJPEGNearTarget keeps the highest JPEG quality that fits the target.
// Quality never drops below minJPEGQuality so small document text remains
// readable, even when that means the result is larger than the target.
func encodeJPEGNearTarget(photo image.Image, targetSize int) ([]byte, error) {
	var best []byte
	low, high := minJPEGQuality, maxJPEGQuality
	for low <= high {
		quality := (low + high) / 2
		var encoded bytes.Buffer
		if err := jpeg.Encode(&encoded, photo, &jpeg.Options{Quality: quality}); err != nil {
			return nil, err
		}
		data := encoded.Bytes()
		if len(data) <= targetSize {
			best = append(best[:0], data...)
			low = quality + 1
		} else {
			high = quality - 1
		}
	}
	if best != nil {
		return best, nil
	}

	var encoded bytes.Buffer
	if err := jpeg.Encode(&encoded, photo, &jpeg.Options{Quality: minJPEGQuality}); err != nil {
		return nil, err
	}
	return encoded.Bytes(), nil
}
