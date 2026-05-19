package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/your-org/openai-model-platform/backend/internal/service"
)

type Handler struct {
	svc *service.Service
}

func NewHandler(svc *service.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		// 健康检查
		api.GET("/health", h.HealthCheck)

		// 用户相关
		users := api.Group("/users")
		{
			users.POST("", h.CreateUser)
			users.GET("", h.ListUsers)
			users.GET("/:id", h.GetUser)
			users.PUT("/:id", h.UpdateUser)
			users.DELETE("/:id", h.DeleteUser)
		}

		// 模型相关
		models := api.Group("/models")
		{
			models.POST("", h.CreateModel)
			models.GET("", h.ListModels)
			models.GET("/:id", h.GetModel)
			models.PUT("/:id", h.UpdateModel)
			models.DELETE("/:id", h.DeleteModel)
		}
	}
}

// HealthCheck 健康检查
// @Summary 健康检查
// @Description 检查服务是否正常运行
// @Tags health
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/v1/health [get]
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// CreateUser 创建用户
func (h *Handler) CreateUser(c *gin.Context) {
	// TODO: 实现创建用户
	c.JSON(http.StatusOK, gin.H{"message": "TODO"})
}

// GetUser 获取用户
func (h *Handler) GetUser(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	user, err := h.svc.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// ListUsers 列出用户
func (h *Handler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	users, total, err := h.svc.ListUsers(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": users, "total": total})
}

// UpdateUser 更新用户
func (h *Handler) UpdateUser(c *gin.Context) {
	// TODO: 实现更新用户
	c.JSON(http.StatusOK, gin.H{"message": "TODO"})
}

// DeleteUser 删除用户
func (h *Handler) DeleteUser(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.svc.DeleteUser(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// CreateModel 创建模型
func (h *Handler) CreateModel(c *gin.Context) {
	// TODO: 实现创建模型
	c.JSON(http.StatusOK, gin.H{"message": "TODO"})
}

// GetModel 获取模型
func (h *Handler) GetModel(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	m, err := h.svc.GetModelByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}
	c.JSON(http.StatusOK, m)
}

// ListModels 列出模型
func (h *Handler) ListModels(c *gin.Context) {
	models, err := h.svc.ListModels(false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": models})
}

// UpdateModel 更新模型
func (h *Handler) UpdateModel(c *gin.Context) {
	// TODO: 实现更新模型
	c.JSON(http.StatusOK, gin.H{"message": "TODO"})
}

// DeleteModel 删除模型
func (h *Handler) DeleteModel(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.svc.DeleteModel(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
