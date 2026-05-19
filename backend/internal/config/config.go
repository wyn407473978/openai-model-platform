package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

var V *viper.Viper

func InitConfig() error {
	V = viper.New()
	V.SetConfigName("config")
	V.SetConfigType("yaml")
	V.AddConfigPath("./configs")
	V.AddConfigPath(".")

	// 环境变量 - 不设置前缀，直接读取
	V.AutomaticEnv()

	if err := V.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Debug: 打印读取的配置
	fmt.Printf("DEBUG config: server.address = %q\n", V.GetString("server.address"))
	fmt.Printf("DEBUG config keys: %v\n", V.AllKeys())
	fmt.Printf("DEBUG openai.api_key = %q\n", V.GetString("openai.api_key"))
	fmt.Printf("DEBUG openai.proxy = %q\n", V.GetString("openai.proxy"))

	// 手动读取关键环境变量
	if apiKey := os.Getenv("OPENAI_API_KEY"); apiKey != "" {
		V.Set("openai.api_key", apiKey)
	}
	if proxy := os.Getenv("HTTPS_PROXY"); proxy != "" {
		V.Set("openai.proxy", proxy)
	}

	return nil
}

func GetString(key string) string {
	return V.GetString(key)
}

func GetInt(key string) int {
	return V.GetInt(key)
}

func GetBool(key string) bool {
	return V.GetBool(key)
}
