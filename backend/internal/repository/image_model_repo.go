package repository

import (
	"github.com/your-org/openai-model-platform/backend/internal/model"
	"gorm.io/gorm"
)

// ImageModelRepository 图片模型仓库
type ImageModelRepository struct {
	db *gorm.DB
}

func NewImageModelRepository(db *gorm.DB) *ImageModelRepository {
	return &ImageModelRepository{db: db}
}

// Create 创建模型
func (r *ImageModelRepository) Create(m *model.ImageModel) error {
	return r.db.Create(m).Error
}

// GetByID 根据ID获取
func (r *ImageModelRepository) GetByID(id int64) (*model.ImageModel, error) {
	var m model.ImageModel
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

// GetByModelID 根据ModelID获取
func (r *ImageModelRepository) GetByModelID(modelID string) (*model.ImageModel, error) {
	var m model.ImageModel
	if err := r.db.Where("model_id = ?", modelID).First(&m).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

// List 获取所有模型
func (r *ImageModelRepository) List() ([]*model.ImageModel, error) {
	var models []*model.ImageModel
	if err := r.db.Order("sort_order ASC, id ASC").Find(&models).Error; err != nil {
		return nil, err
	}
	return models, nil
}

// ListEnabled 获取启用的模型
func (r *ImageModelRepository) ListEnabled() ([]*model.ImageModel, error) {
	var models []*model.ImageModel
	if err := r.db.Where("enabled = ?", true).Order("sort_order ASC, id ASC").Find(&models).Error; err != nil {
		return nil, err
	}
	return models, nil
}

// Update 更新模型
func (r *ImageModelRepository) Update(m *model.ImageModel) error {
	return r.db.Save(m).Error
}

// Delete 删除模型
func (r *ImageModelRepository) Delete(id int64) error {
	return r.db.Delete(&model.ImageModel{}, id).Error
}

// GetParametersByModelID 获取模型的参数配置
func (r *ImageModelRepository) GetParametersByModelID(modelID string) ([]*model.ModelParameter, error) {
	var params []*model.ModelParameter
	if err := r.db.Where("model_id = ?", modelID).
		Preload("EnumValues", func(db *gorm.DB) *gorm.DB {
			return db.Order("enum_order ASC")
		}).
		Order("param_order ASC").
		Find(&params).Error; err != nil {
		return nil, err
	}
	return params, nil
}

// CreateParameter 创建参数配置
func (r *ImageModelRepository) CreateParameter(p *model.ModelParameter) error {
	return r.db.Create(p).Error
}

// UpdateParameter 更新参数配置
func (r *ImageModelRepository) UpdateParameter(p *model.ModelParameter) error {
	return r.db.Save(p).Error
}

// DeleteParameter 删除参数配置
func (r *ImageModelRepository) DeleteParameter(id int64) error {
	return r.db.Delete(&model.ModelParameter{}, id).Error
}

// GetParameterByID 获取参数配置
func (r *ImageModelRepository) GetParameterByID(id int64) (*model.ModelParameter, error) {
	var p model.ModelParameter
	if err := r.db.Preload("EnumValues").First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

// CreateEnumValue 创建枚举值
func (r *ImageModelRepository) CreateEnumValue(v *model.ParameterEnumValue) error {
	return r.db.Create(v).Error
}

// UpdateEnumValue 更新枚举值
func (r *ImageModelRepository) UpdateEnumValue(v *model.ParameterEnumValue) error {
	return r.db.Save(v).Error
}

// DeleteEnumValue 删除枚举值
func (r *ImageModelRepository) DeleteEnumValue(id int64) error {
	return r.db.Delete(&model.ParameterEnumValue{}, id).Error
}

// DeleteEnumValuesByParameterID 删除参数的所有枚举值
func (r *ImageModelRepository) DeleteEnumValuesByParameterID(parameterID int64) error {
	return r.db.Delete(&model.ParameterEnumValue{}, "parameter_id = ?", parameterID).Error
}

// AutoMigrateImageModel 自动迁移图片模型表
func AutoMigrateImageModel(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.ImageModel{},
		&model.ModelParameter{},
		&model.ParameterEnumValue{},
	)
}
