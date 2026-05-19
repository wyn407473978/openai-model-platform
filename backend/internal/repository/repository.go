package repository

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/your-org/openai-model-platform/backend/internal/config"
)

func InitDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai",
		config.GetString("database.host"),
		config.GetString("database.username"),
		config.GetString("database.password"),
		config.GetString("database.name"),
		config.GetInt("database.port"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// 连接池配置
	sqlDB.SetMaxIdleConns(config.GetInt("database.max_idle_conns"))
	sqlDB.SetMaxOpenConns(config.GetInt("database.max_open_conns"))

	return db, nil
}

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}
