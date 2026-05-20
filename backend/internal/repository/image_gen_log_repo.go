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

// GetDistinctModels 获取去重的模型列表
func (r *ImageGenLogRepository) GetDistinctModels() ([]string, error) {
	var models []string
	if err := r.db.Model(new(model.ImageGenLog)).
		Distinct("model").
		Order("model ASC").
		Pluck("model", &models).Error; err != nil {
		return nil, err
	}
	return models, nil
}

// Stats 统计数据结构
type Stats struct {
	TotalCalls     int64   `json:"total_calls"`
	TodayCalls     int64   `json:"today_calls"`
	SuccessRate    float64 `json:"success_rate"`
	ActiveModels   int64   `json:"active_models"`
	TotalTokens    int64   `json:"total_tokens"`
	TodayTokens    int64   `json:"today_tokens"`
}

// GetStats 获取统计数据
func (r *ImageGenLogRepository) GetStats() (*Stats, error) {
	stats := &Stats{}

	// 总调用量
	r.db.Model(new(model.ImageGenLog)).Count(&stats.TotalCalls)

	// 今日调用量
	r.db.Model(new(model.ImageGenLog)).
		Where("created_at >= CURRENT_DATE").
		Count(&stats.TodayCalls)

	// 活跃模型数
	r.db.Model(new(model.ImageGenLog)).
		Where("created_at >= CURRENT_DATE").
		Distinct("model").
		Pluck("model", &[]string{}). // just to get distinct count
		Count(&stats.ActiveModels)

	// 总 tokens
	r.db.Model(new(model.ImageGenLog)).
		Where("status = 'success'").
		Select("COALESCE(SUM(total_tokens), 0)").
		Scan(&stats.TotalTokens)

	// 今日 tokens
	r.db.Model(new(model.ImageGenLog)).
		Where("created_at >= CURRENT_DATE").
		Where("status = 'success'").
		Select("COALESCE(SUM(total_tokens), 0)").
		Scan(&stats.TodayTokens)

	// 计算成功率
	var successCount, totalCount int64
	r.db.Model(new(model.ImageGenLog)).Count(&totalCount)
	r.db.Model(new(model.ImageGenLog)).Where("status = 'success'").Count(&successCount)
	if totalCount > 0 {
		stats.SuccessRate = float64(successCount) / float64(totalCount) * 100
	}

	return stats, nil
}

// AutoMigrateImageGenLog 自动迁移图片生成日志表
func AutoMigrateImageGenLog(db *gorm.DB) error {
	return db.AutoMigrate(&model.ImageGenLog{})
}
