package repository

import (
	"github.com/your-org/openai-model-platform/backend/internal/model"
)

func (r *Repository) CreateModel(m *model.Model) error {
	return r.db.Create(m).Error
}

func (r *Repository) GetModelByID(id int64) (*model.Model, error) {
	var m model.Model
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *Repository) UpdateModel(m *model.Model) error {
	return r.db.Save(m).Error
}

func (r *Repository) DeleteModel(id int64) error {
	return r.db.Delete(&model.Model{}, id).Error
}

func (r *Repository) ListModels(enabledOnly bool) ([]*model.Model, error) {
	var models []*model.Model
	query := r.db
	if enabledOnly {
		query = query.Where("enabled = ?", true)
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}
	return models, nil
}
