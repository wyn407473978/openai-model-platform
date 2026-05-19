package repository

import (
	"github.com/your-org/openai-model-platform/backend/internal/model"
	"gorm.io/gorm"
)

// ImageGenLogRepository 图片生成日志仓库
type ImageGenLogRepository struct {
	db *gorm.DB
}

func NewImageGenLogRepository(db *gorm.DB) *ImageGenLogRepository {
	return &ImageGenLogRepository{db: db}
}

// Create 创建日志
func (r *ImageGenLogRepository) Create(log *model.ImageGenLog) error {
	return r.db.Create(log).Error
}

// GetByID 根据ID获取
func (r *ImageGenLogRepository) GetByID(id int64) (*model.ImageGenLog, error) {
	var log model.ImageGenLog
	if err := r.db.First(&log, id).Error; err != nil {
		return nil, err
	}
	return &log, nil
}

// List 获取日志列表（支持分页和过滤）
func (r *ImageGenLogRepository) List(limit, offset int, modelFilter, operation string) ([]*model.ImageGenLog, int64, error) {
	var logs []*model.ImageGenLog
	var total int64

	query := r.db.Model(new(model.ImageGenLog))

	if modelFilter != "" {
		query = query.Where("model = ?", modelFilter)
	}
	if operation != "" {
		query = query.Where("operation = ?", operation)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取列表
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// AutoMigrateImageGenLog 自动迁移图片生成日志表
func AutoMigrateImageGenLog(db *gorm.DB) error {
	return db.AutoMigrate(&model.ImageGenLog{})
}
