package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	_ "github.com/your-org/openai-model-platform/backend/docs"
	"github.com/your-org/openai-model-platform/backend/internal/aiclient"
	"github.com/your-org/openai-model-platform/backend/internal/config"
	"github.com/your-org/openai-model-platform/backend/internal/handler"
	"github.com/your-org/openai-model-platform/backend/internal/middleware"
	"github.com/your-org/openai-model-platform/backend/internal/repository"
	"github.com/your-org/openai-model-platform/backend/internal/service"
	"github.com/your-org/openai-model-platform/backend/pkg/utils"
)

// @title OpenAI Model Platform API
// @version 1.0
// @description AI Model Platform Backend API
// @host localhost:8080
// @BasePath /
func main() {
	// 加载配置
	if err := config.InitConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化日志
	logger := utils.InitLogger()
	defer logger.Sync()

	// 初始化数据库
	db, err := repository.InitDB()
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// 初始化 OpenAI Client
	aiclient.InitOpenAIClient()

	// 初始化路由
	r := gin.Default()

	// 初始化中间件
	middleware.InitMiddleware(r, db)

	// 初始化依赖
	repo := repository.NewRepository(db)
	imageModelRepo := repository.NewImageModelRepository(db)
	imageGenLogRepo := repository.NewImageGenLogRepository(db)
	svc := service.NewService(repo)
	imageModelSvc := service.NewImageModelService(imageModelRepo)
	imageGenLogSvc := service.NewImageGenLogService(imageGenLogRepo)
	h := handler.NewHandler(svc)
	imageModelHandler := handler.NewImageModelHandler(imageModelSvc)
	imageGenHandler := handler.NewImageGenHandler(imageGenLogSvc)

	// 自动迁移数据库表
	if err := repository.AutoMigrateImageModel(db); err != nil {
		logger.Fatal("Failed to migrate image model tables", zap.Error(err))
	}
	if err := repository.AutoMigrateImageGenLog(db); err != nil {
		logger.Fatal("Failed to migrate image gen log tables", zap.Error(err))
	}

	// 注册路由
	h.RegisterRoutes(r)

	// 注册图片模型路由
	api := r.Group("/api/v1")
	imageModelHandler.RegisterRoutes(api)

	// 注册图片生成路由
	imageGenHandler.RegisterRoutes(api)

	// 启动服务
	addr := config.GetString("server.address")
	fmt.Printf("DEBUG main: addr = %q\n", addr)
	logger.Info("Starting server", zap.String("address", addr))
	fmt.Printf("DEBUG main: about to run on %s\n", addr)
	if err := r.Run(addr); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}
