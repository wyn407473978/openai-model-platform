package aiclient

import (
	"net/http"
	"net/url"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"

	"github.com/your-org/openai-model-platform/backend/internal/config"
)

var Client openai.Client

func InitOpenAIClient() {
	apiKey := config.GetString("openai.api_key")
	proxyURL := config.GetString("openai.proxy")

	opts := []option.RequestOption{
		option.WithAPIKey(apiKey),
	}

	// 配置代理
	if proxyURL != "" {
		proxy, err := url.Parse(proxyURL)
		if err == nil {
			transport := &http.Transport{Proxy: http.ProxyURL(proxy)}
			httpClient := &http.Client{Transport: transport}
			opts = append(opts, option.WithHTTPClient(httpClient))
		}
	}

	Client = openai.NewClient(opts...)
}
