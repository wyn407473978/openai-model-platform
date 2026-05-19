package service

import (
	"github.com/your-org/openai-model-platform/backend/internal/model"
	"github.com/your-org/openai-model-platform/backend/internal/repository"
)

type ImageGenLogService struct {
	repo *repository.ImageGenLogRepository
}

func NewImageGenLogService(repo *repository.ImageGenLogRepository) *ImageGenLogService {
	return &ImageGenLogService{repo: repo}
}

// ListLogsParams 查询参数
type ListLogsParams struct {
	Model     string
	Operation string
	Limit     int
	Offset    int
}

// CreateLog 创建日志
func (s *ImageGenLogService) CreateLog(log *model.ImageGenLog) error {
	return s.repo.Create(log)
}

// ListLogs 获取日志列表
func (s *ImageGenLogService) ListLogs(params ListLogsParams) ([]*model.ImageGenLog, int64, error) {
	if params.Limit <= 0 {
		params.Limit = 20
	}
	if params.Limit > 100 {
		params.Limit = 100
	}
	return s.repo.List(params.Limit, params.Offset, params.Model, params.Operation)
}

// GetLogByID 根据ID获取日志
func (s *ImageGenLogService) GetLogByID(id int64) (*model.ImageGenLog, error) {
	return s.repo.GetByID(id)
}
