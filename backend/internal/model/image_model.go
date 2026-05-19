package model

import (
	"time"

	"gorm.io/gorm"
)

// ImageModel 图片模型
type ImageModel struct {
	ID          int64          `gorm:"primaryKey;autoIncrement" json:"id"`
	ModelID     string         `gorm:"column:model_id;type:varchar(64);uniqueIndex;not null" json:"model_id"`
	Name        string         `gorm:"type:varchar(128);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Enabled     bool           `gorm:"default:true" json:"enabled"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Parameters []ModelParameter `gorm:"foreignKey:ModelID;references:ModelID" json:"parameters,omitempty"`
}

// TableName 指定表名
func (ImageModel) TableName() string {
	return "image_models"
}

// ModelParameter 模型参数配置
type ModelParameter struct {
	ID           int64           `gorm:"primaryKey;autoIncrement" json:"id"`
	ModelID      string          `gorm:"column:model_id;type:varchar(64);not null;uniqueIndex:idx_model_param_key" json:"model_id"`
	ParamKey     string          `gorm:"column:param_key;type:varchar(64);not null;uniqueIndex:idx_model_param_key" json:"param_key"`
	ParamLabel   string          `gorm:"column:param_label;type:varchar(128);not null" json:"param_label"`
	ParamType    string          `gorm:"column:param_type;type:varchar(32);not null" json:"param_type"` // enum, number, string, boolean
	IsRequired   bool            `gorm:"default:false" json:"is_required"`
	DefaultValue string          `gorm:"column:default_value;type:text" json:"default_value"`
	ParamOrder   int             `gorm:"default:0" json:"param_order"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	DeletedAt    gorm.DeletedAt  `gorm:"index" json:"-"`
	Model        *ImageModel     `gorm:"foreignKey:ModelID;references:ModelID" json:"-"`
	EnumValues   []ParameterEnumValue `gorm:"foreignKey:ParameterID" json:"enum_values,omitempty"`
}

// TableName 指定表名
func (ModelParameter) TableName() string {
	return "model_parameters"
}

// ParameterEnumValue 枚举值选项
type ParameterEnumValue struct {
	ID          int64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ParameterID int64    `gorm:"column:parameter_id;not null;index" json:"parameter_id"`
	EnumValue   string   `gorm:"column:enum_value;type:varchar(64);not null" json:"enum_value"`
	EnumLabel   string   `gorm:"column:enum_label;type:varchar(128);not null" json:"enum_label"`
	IsDefault   bool     `gorm:"default:false" json:"is_default"`
	EnumOrder   int      `gorm:"default:0" json:"enum_order"`
}

// TableName 指定表名
func (ParameterEnumValue) TableName() string {
	return "parameter_enum_values"
}
