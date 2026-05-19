package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/your-org/openai-model-platform/backend/internal/model"
	"github.com/your-org/openai-model-platform/backend/internal/service"
)

type ImageModelHandler struct {
	svc *service.ImageModelService
}

func NewImageModelHandler(svc *service.ImageModelService) *ImageModelHandler {
	return &ImageModelHandler{svc: svc}
}

func (h *ImageModelHandler) RegisterRoutes(rg *gin.RouterGroup) {
	// 公开接口 - 使用 /image-models 避免与用户模型冲突
	rg.GET("/image-models", h.ListModels)
	rg.GET("/image-models/:model_id/parameters", h.GetModelParameters)

	// 管理员接口
	// 模型 CRUD
	rg.GET("/admin/image-models", h.ListAllModels)
	rg.POST("/admin/image-models", h.CreateModel)
	rg.GET("/admin/image-models/:id", h.GetModel)
	rg.PUT("/admin/image-models/:id", h.UpdateModel)
	rg.DELETE("/admin/image-models/:id", h.DeleteModel)

	// 参数管理 - 使用不同前缀避免路由冲突
	rg.POST("/admin/model-params", h.CreateParameter)
	rg.PUT("/admin/model-params/:param_id", h.UpdateParameter)
	rg.DELETE("/admin/model-params/:param_id", h.DeleteParameter)

	// 枚举值管理
	rg.POST("/admin/model-params/:param_id/enum-values", h.CreateEnumValue)
	rg.PUT("/admin/enum-values/:enum_id", h.UpdateEnumValue)
	rg.DELETE("/admin/enum-values/:enum_id", h.DeleteEnumValue)
}

// ListModels 获取启用的模型列表（公开）
func (h *ImageModelHandler) ListModels(c *gin.Context) {
	models, err := h.svc.ListEnabledModels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": models})
}

// ListAllModels 获取所有模型（管理员）
func (h *ImageModelHandler) ListAllModels(c *gin.Context) {
	models, err := h.svc.ListModels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": models})
}

// CreateModel 创建模型
func (h *ImageModelHandler) CreateModel(c *gin.Context) {
	var req model.ImageModel
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.CreateModel(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req})
}

// GetModel 获取单个模型
func (h *ImageModelHandler) GetModel(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	m, err := h.svc.GetModelByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": m})
}

// UpdateModel 更新模型
func (h *ImageModelHandler) UpdateModel(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req model.ImageModel
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.ID = id

	if err := h.svc.UpdateModel(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": req})
}

// DeleteModel 删除模型
func (h *ImageModelHandler) DeleteModel(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.svc.DeleteModel(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// GetModelParameters 获取模型的参数配置
func (h *ImageModelHandler) GetModelParameters(c *gin.Context) {
	modelID := c.Param("model_id")
	params, err := h.svc.GetParametersByModelID(modelID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": params})
}

// CreateParameter 创建参数配置
func (h *ImageModelHandler) CreateParameter(c *gin.Context) {
	modelID := c.Param("model_id")
	var req model.ModelParameter
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.ModelID = modelID

	if err := h.svc.CreateParameter(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req})
}

// UpdateParameter 更新参数配置
func (h *ImageModelHandler) UpdateParameter(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req model.ModelParameter
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.ID = id

	if err := h.svc.UpdateParameter(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": req})
}

// DeleteParameter 删除参数配置
func (h *ImageModelHandler) DeleteParameter(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.svc.DeleteParameter(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// CreateEnumValue 创建枚举值
func (h *ImageModelHandler) CreateEnumValue(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req model.ParameterEnumValue
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.ParameterID = id

	if err := h.svc.CreateEnumValue(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req})
}

// UpdateEnumValue 更新枚举值
func (h *ImageModelHandler) UpdateEnumValue(c *gin.Context) {
	enumID, _ := strconv.ParseInt(c.Param("enum_id"), 10, 64)
	var req model.ParameterEnumValue
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.ID = enumID

	if err := h.svc.UpdateEnumValue(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": req})
}

// DeleteEnumValue 删除枚举值
func (h *ImageModelHandler) DeleteEnumValue(c *gin.Context) {
	enumID, _ := strconv.ParseInt(c.Param("enum_id"), 10, 64)
	if err := h.svc.DeleteEnumValue(enumID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
