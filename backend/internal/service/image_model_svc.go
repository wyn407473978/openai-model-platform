package service

import (
	"fmt"

	"github.com/your-org/openai-model-platform/backend/internal/model"
	"github.com/your-org/openai-model-platform/backend/internal/repository"
)

type ImageModelService struct {
	repo *repository.ImageModelRepository
}

func NewImageModelService(repo *repository.ImageModelRepository) *ImageModelService {
	return &ImageModelService{repo: repo}
}

// 创建模型
func (s *ImageModelService) CreateModel(m *model.ImageModel) error {
	// 检查 model_id 是否已存在
	existing, _ := s.repo.GetByModelID(m.ModelID)
	if existing != nil {
		return fmt.Errorf("model_id %s already exists", m.ModelID)
	}
	return s.repo.Create(m)
}

// 获取所有模型
func (s *ImageModelService) ListModels() ([]*model.ImageModel, error) {
	return s.repo.List()
}

// 获取启用的模型
func (s *ImageModelService) ListEnabledModels() ([]*model.ImageModel, error) {
	return s.repo.ListEnabled()
}

// 根据ID获取模型
func (s *ImageModelService) GetModelByID(id int64) (*model.ImageModel, error) {
	return s.repo.GetByID(id)
}

// 更新模型
func (s *ImageModelService) UpdateModel(m *model.ImageModel) error {
	return s.repo.Update(m)
}

// 删除模型
func (s *ImageModelService) DeleteModel(id int64) error {
	return s.repo.Delete(id)
}

// 获取模型的参数配置
func (s *ImageModelService) GetParametersByModelID(modelID string) ([]*model.ModelParameter, error) {
	// 先检查模型是否存在
	_, err := s.repo.GetByModelID(modelID)
	if err != nil {
		return nil, fmt.Errorf("model %s not found", modelID)
	}
	return s.repo.GetParametersByModelID(modelID)
}

// 创建参数配置
func (s *ImageModelService) CreateParameter(p *model.ModelParameter) error {
	// 检查模型是否存在
	_, err := s.repo.GetByModelID(p.ModelID)
	if err != nil {
		return fmt.Errorf("model %s not found", p.ModelID)
	}
	// 检查 param_key 是否已存在
	params, _ := s.repo.GetParametersByModelID(p.ModelID)
	for _, existing := range params {
		if existing.ParamKey == p.ParamKey {
			return fmt.Errorf("param_key %s already exists in model %s", p.ParamKey, p.ModelID)
		}
	}
	return s.repo.CreateParameter(p)
}

// 更新参数配置
func (s *ImageModelService) UpdateParameter(p *model.ModelParameter) error {
	return s.repo.UpdateParameter(p)
}

// 删除参数配置
func (s *ImageModelService) DeleteParameter(id int64) error {
	return s.repo.DeleteParameter(id)
}

// 创建枚举值
func (s *ImageModelService) CreateEnumValue(v *model.ParameterEnumValue) error {
	// 检查参数是否存在
	_, err := s.repo.GetParameterByID(v.ParameterID)
	if err != nil {
		return fmt.Errorf("parameter %d not found", v.ParameterID)
	}
	return s.repo.CreateEnumValue(v)
}

// 更新枚举值
func (s *ImageModelService) UpdateEnumValue(v *model.ParameterEnumValue) error {
	return s.repo.UpdateEnumValue(v)
}

// 删除枚举值
func (s *ImageModelService) DeleteEnumValue(id int64) error {
	return s.repo.DeleteEnumValue(id)
}

// 批量创建枚举值
func (s *ImageModelService) BatchCreateEnumValues(parameterID int64, values []*model.ParameterEnumValue) error {
	// 先删除旧的枚举值
	if err := s.repo.DeleteEnumValuesByParameterID(parameterID); err != nil {
		return err
	}
	for _, v := range values {
		v.ParameterID = parameterID
		if err := s.repo.CreateEnumValue(v); err != nil {
			return err
		}
	}
	return nil
}
