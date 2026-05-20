package model

import (
	"time"
)

// ImageGenLog 图片生成调用日志
type ImageGenLog struct {
	ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Model           string    `gorm:"column:model;type:varchar(64);not null;index" json:"model"`
	Operation       string    `gorm:"column:operation;type:varchar(32);not null;index" json:"operation"` // generate, edit, variation
	RequestPrompt   string    `gorm:"column:request_prompt;type:text" json:"request_prompt"`
	RequestParams   string    `gorm:"column:request_params;type:jsonb" json:"request_params"`   // JSON 存储完整请求参数
	ResponseData    string    `gorm:"column:response_data;type:jsonb" json:"response_data"`     // JSON 存储响应数据
	Status          string    `gorm:"column:status;type:varchar(32)" json:"status"`            // success, failed
	ErrorMessage    string    `gorm:"column:error_message;type:text" json:"error_message,omitempty"`
	DurationMs      int64     `gorm:"column:duration_ms;default:0" json:"duration_ms"`         // 调用耗时（毫秒）
	InputTokens     int64     `gorm:"column:input_tokens;default:0" json:"input_tokens"`       // 输入 tokens 数量
	OutputTokens    int64     `gorm:"column:output_tokens;default:0" json:"output_tokens"`     // 输出 tokens 数量
	TotalTokens     int64     `gorm:"column:total_tokens;default:0" json:"total_tokens"`       // 总 tokens 数量
	CreatedAt       time.Time `json:"created_at"`
}

// TableName 指定表名
func (ImageGenLog) TableName() string {
	return "image_gen_logs"
}
