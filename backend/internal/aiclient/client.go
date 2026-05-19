package aiclient

import (
	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"

	"github.com/your-org/openai-model-platform/backend/internal/config"
)

var Client openai.Client

func InitOpenAIClient() {
	apiKey := config.GetString("openai.api_key")
	baseURL := config.GetString("openai.base_url")

	opts := []option.RequestOption{
		option.WithAPIKey(apiKey),
	}

	if baseURL != "" {
		opts = append(opts, option.WithBaseURL(baseURL))
	}

	Client = openai.NewClient(opts...)
}
