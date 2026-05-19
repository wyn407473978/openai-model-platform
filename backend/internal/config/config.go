package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

var V *viper.Viper

func InitConfig() error {
	V = viper.New()
	V.SetConfigName("config")
	V.SetConfigType("yaml")
	V.AddConfigPath("./configs")
	V.AddConfigPath(".")

	// 环境变量
	V.AutomaticEnv()
	V.SetEnvPrefix("APP")
	V.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := V.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Debug: 打印读取的配置
	fmt.Printf("DEBUG config: server.address = %q\n", V.GetString("server.address"))
	fmt.Printf("DEBUG config keys: %v\n", V.AllKeys())

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
