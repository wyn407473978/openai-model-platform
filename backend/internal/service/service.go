package service

import (
	"github.com/your-org/openai-model-platform/backend/internal/model"
	"github.com/your-org/openai-model-platform/backend/internal/repository"
)

type Service struct {
	repo *repository.Repository
}

func NewService(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

// User 相关服务

func (s *Service) CreateUser(user *model.User) error {
	return s.repo.CreateUser(user)
}

func (s *Service) GetUserByID(id int64) (*model.User, error) {
	return s.repo.GetUserByID(id)
}

func (s *Service) GetUserByEmail(email string) (*model.User, error) {
	return s.repo.GetUserByEmail(email)
}

func (s *Service) UpdateUser(user *model.User) error {
	return s.repo.UpdateUser(user)
}

func (s *Service) DeleteUser(id int64) error {
	return s.repo.DeleteUser(id)
}

func (s *Service) ListUsers(page, pageSize int) ([]*model.User, int64, error) {
	return s.repo.ListUsers(page, pageSize)
}

// Model 相关服务

func (s *Service) CreateModel(m *model.Model) error {
	return s.repo.CreateModel(m)
}

func (s *Service) GetModelByID(id int64) (*model.Model, error) {
	return s.repo.GetModelByID(id)
}

func (s *Service) UpdateModel(m *model.Model) error {
	return s.repo.UpdateModel(m)
}

func (s *Service) DeleteModel(id int64) error {
	return s.repo.DeleteModel(id)
}

func (s *Service) ListModels(enabledOnly bool) ([]*model.Model, error) {
	return s.repo.ListModels(enabledOnly)
}
