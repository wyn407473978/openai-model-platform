package handler

import (
	"bytes"
	"context"
	"encoding/base64"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/openai/openai-go/v3"

	"github.com/your-org/openai-model-platform/backend/internal/aiclient"
)

type ImageGenHandler struct{}

func NewImageGenHandler() *ImageGenHandler {
	return &ImageGenHandler{}
}

func (h *ImageGenHandler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.POST("/images/generate", h.GenerateImage)
	rg.POST("/images/edit", h.EditImage)
	rg.POST("/images/variation", h.CreateVariation)
}

// ImageGenerateRequest 文本生成图片请求
type ImageGenerateRequest struct {
	Model          string `json:"model" binding:"required"`
	Prompt         string `json:"prompt" binding:"required"`
	N              *int64 `json:"n"`
	Size           string `json:"size"`
	Quality        string `json:"quality"`
	OutputFormat   string `json:"output_format"`
	Background     string `json:"background"`
	Moderation     string `json:"moderation"`
	ResponseFormat string `json:"response_format"`
}

// ImageEditRequest 图片编辑请求
type ImageEditRequest struct {
	Model          string   `json:"model" binding:"required"`
	Prompt         string   `json:"prompt" binding:"required"`
	Images         []string `json:"images" binding:"required"` // base64 encoded images
	Mask           string   `json:"mask"`                     // optional base64 encoded mask
	N              *int64   `json:"n"`
	Size           string   `json:"size"`
	Quality        string   `json:"quality"`
	OutputFormat   string   `json:"output_format"`
	Background     string   `json:"background"`
	InputFidelity  string   `json:"input_fidelity"`
	ResponseFormat string   `json:"response_format"`
}

// ImageVariationRequest 图片变体请求
type ImageVariationRequest struct {
	Model string `json:"model"`
	N     *int64 `json:"n"`
	Size  string `json:"size"`
	Image string `json:"image" binding:"required"` // base64 encoded image
}

// ImageResponse 图片响应
type ImageResponse struct {
	Image string `json:"image"`  // base64 encoded image or URL
	URL   string `json:"url,omitempty"`
	Index int    `json:"index"`
}

// GenerateImage 文本生成图片
func (h *ImageGenHandler) GenerateImage(c *gin.Context) {
	var req ImageGenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 120*time.Second)
	defer cancel()

	params := openai.ImageGenerateParams{
		Prompt: req.Prompt,
		Model:  openai.ImageModel(req.Model),
	}

	if req.N != nil {
		params.N = openai.Int(*req.N)
	}

	switch req.Size {
	case "1024x1024":
		params.Size = openai.ImageGenerateParamsSize1024x1024
	case "1024x1536":
		params.Size = openai.ImageGenerateParamsSize1024x1536
	case "1536x1024":
		params.Size = openai.ImageGenerateParamsSize1536x1024
	case "auto":
		params.Size = openai.ImageGenerateParamsSizeAuto
	}

	switch req.Quality {
	case "low":
		params.Quality = openai.ImageGenerateParamsQualityLow
	case "medium":
		params.Quality = openai.ImageGenerateParamsQualityMedium
	case "high":
		params.Quality = openai.ImageGenerateParamsQualityHigh
	case "auto":
		params.Quality = openai.ImageGenerateParamsQualityAuto
	}

	switch req.OutputFormat {
	case "png":
		params.OutputFormat = openai.ImageGenerateParamsOutputFormatPNG
	case "jpeg":
		params.OutputFormat = openai.ImageGenerateParamsOutputFormatJPEG
	case "webp":
		params.OutputFormat = openai.ImageGenerateParamsOutputFormatWebP
	}

	switch req.Background {
	case "transparent":
		params.Background = openai.ImageGenerateParamsBackgroundTransparent
	case "opaque":
		params.Background = openai.ImageGenerateParamsBackgroundOpaque
	case "auto":
		params.Background = openai.ImageGenerateParamsBackgroundAuto
	}

	switch req.Moderation {
	case "low":
		params.Moderation = openai.ImageGenerateParamsModerationLow
	case "auto":
		params.Moderation = openai.ImageGenerateParamsModerationAuto
	}

	switch req.ResponseFormat {
	case "url":
		params.ResponseFormat = openai.ImageGenerateParamsResponseFormatURL
	case "b64_json":
		params.ResponseFormat = openai.ImageGenerateParamsResponseFormatB64JSON
	}

	resp, err := aiclient.Client.Images.Generate(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	images := make([]ImageResponse, len(resp.Data))
	for i, img := range resp.Data {
		images[i] = ImageResponse{
			Index: i,
		}
		if img.B64JSON != "" {
			images[i].Image = img.B64JSON
		}
		if img.URL != "" {
			images[i].URL = img.URL
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    images,
		"created": resp.Created,
	})
}

// EditImage 图片编辑
func (h *ImageGenHandler) EditImage(c *gin.Context) {
	var req ImageEditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.Images) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "at least one image is required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 120*time.Second)
	defer cancel()

	// Decode base64 images
	readers := make([]io.Reader, len(req.Images))
	for i, imgStr := range req.Images {
		data, err := base64.StdEncoding.DecodeString(imgStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 image at index " + string(rune(i))})
			return
		}
		readers[i] = bytes.NewReader(data)
	}

	params := openai.ImageEditParams{
		Prompt: req.Prompt,
		Model:  openai.ImageModel(req.Model),
		Image: openai.ImageEditParamsImageUnion{
			OfFileArray: readers,
		},
	}

	if req.Mask != "" {
		maskData, err := base64.StdEncoding.DecodeString(req.Mask)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 mask"})
			return
		}
		params.Mask = bytes.NewReader(maskData)
	}

	if req.N != nil {
		params.N = openai.Int(*req.N)
	}

	switch req.Size {
	case "1024x1024":
		params.Size = openai.ImageEditParamsSize1024x1024
	case "1024x1536":
		params.Size = openai.ImageEditParamsSize1024x1536
	case "1536x1024":
		params.Size = openai.ImageEditParamsSize1536x1024
	case "auto":
		params.Size = openai.ImageEditParamsSizeAuto
	}

	switch req.Quality {
	case "low":
		params.Quality = openai.ImageEditParamsQualityLow
	case "medium":
		params.Quality = openai.ImageEditParamsQualityMedium
	case "high":
		params.Quality = openai.ImageEditParamsQualityHigh
	case "auto":
		params.Quality = openai.ImageEditParamsQualityAuto
	}

	switch req.OutputFormat {
	case "png":
		params.OutputFormat = openai.ImageEditParamsOutputFormatPNG
	case "jpeg":
		params.OutputFormat = openai.ImageEditParamsOutputFormatJPEG
	case "webp":
		params.OutputFormat = openai.ImageEditParamsOutputFormatWebP
	}

	switch req.Background {
	case "transparent":
		params.Background = openai.ImageEditParamsBackgroundTransparent
	case "opaque":
		params.Background = openai.ImageEditParamsBackgroundOpaque
	case "auto":
		params.Background = openai.ImageEditParamsBackgroundAuto
	}

	switch req.InputFidelity {
	case "high":
		params.InputFidelity = openai.ImageEditParamsInputFidelityHigh
	case "low":
		params.InputFidelity = openai.ImageEditParamsInputFidelityLow
	}

	resp, err := aiclient.Client.Images.Edit(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	images := make([]ImageResponse, len(resp.Data))
	for i, img := range resp.Data {
		images[i] = ImageResponse{
			Index: i,
		}
		if img.B64JSON != "" {
			images[i].Image = img.B64JSON
		}
		if img.URL != "" {
			images[i].URL = img.URL
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    images,
		"created": resp.Created,
	})
}

// CreateVariation 图片变体
func (h *ImageGenHandler) CreateVariation(c *gin.Context) {
	var req ImageVariationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 120*time.Second)
	defer cancel()

	// Decode base64 image
	imageData, err := base64.StdEncoding.DecodeString(req.Image)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 image"})
		return
	}

	params := openai.ImageNewVariationParams{
		Image: bytes.NewReader(imageData),
	}

	if req.Model != "" {
		params.Model = openai.ImageModel(req.Model)
	}

	if req.N != nil {
		params.N = openai.Int(*req.N)
	}

	switch req.Size {
	case "256x256":
		params.Size = openai.ImageNewVariationParamsSize256x256
	case "512x512":
		params.Size = openai.ImageNewVariationParamsSize512x512
	case "1024x1024":
		params.Size = openai.ImageNewVariationParamsSize1024x1024
	}

	resp, err := aiclient.Client.Images.NewVariation(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	images := make([]ImageResponse, len(resp.Data))
	for i, img := range resp.Data {
		images[i] = ImageResponse{
			Index: i,
		}
		if img.B64JSON != "" {
			images[i].Image = img.B64JSON
		}
		if img.URL != "" {
			images[i].URL = img.URL
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    images,
		"created": resp.Created,
	})
}
