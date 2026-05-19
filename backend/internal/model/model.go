package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        int64          `gorm:"primaryKey;autoIncrement" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// User 用户模型
type User struct {
	BaseModel
	Username  string         `gorm:"uniqueIndex;size:64;not null" json:"username"`
	Email     string         `gorm:"uniqueIndex;size:128;not null" json:"email"`
	Password  string         `gorm:"size:256;not null" json:"-"`
	Nickname  string         `gorm:"size:64" json:"nickname"`
	Avatar    string         `gorm:"size:512" json:"avatar"`
	Status    int            `gorm:"default:1" json:"status"` // 1: 正常 0: 禁用
	Role      string         `gorm:"size:32;default:user" json:"role"`
	Extra     pq.StringArray `gorm:"type:text[]" json:"extra,omitempty"`
}

// Model 模型配置
type Model struct {
	BaseModel
	Name        string `gorm:"size:128;not null" json:"name"`
	Provider    string `gorm:"size:64;not null" json:"provider"` // openai, anthropic, etc.
	ModelID     string `gorm:"size:128;not null" json:"model_id"`
	Description string `gorm:"size:1024" json:"description"`
	InputPrice  float64 `gorm:"type:decimal(10,6)" json:"input_price"`  // 每1000 token价格
	OutputPrice float64 `gorm:"type:decimal(10,6)" json:"output_price"` // 每1000 token价格
	MaxTokens   int    `json:"max_tokens"`
	Enabled     bool   `gorm:"default:true" json:"enabled"`
}
