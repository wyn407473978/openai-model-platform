package oss

import (
	"bytes"
	"fmt"
	"sync"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"

	"github.com/your-org/openai-model-platform/backend/internal/config"
)

var (
	clientPtr  *oss.Client
	bucket     *oss.Bucket
	once       sync.Once
	initErr    error
)

// InitOSS 初始化 OSS 客户端（单例模式）
func InitOSS() error {
	once.Do(func() {
		endpoint := config.GetString("oss.endpoint")
		accessKeyID := config.GetString("oss.access_key_id")
		accessKeySecret := config.GetString("oss.access_key_secret")
		bucketName := config.GetString("oss.bucket")

		if endpoint == "" || accessKeyID == "" || accessKeySecret == "" || bucketName == "" {
			initErr = fmt.Errorf("OSS configuration is incomplete: endpoint=%s, accessKeyID=%s, bucket=%s",
				endpoint, accessKeyID, bucketName)
			return
		}

		// 创建 OSS 客户端
		var err error
		clientPtr, err = oss.New(endpoint, accessKeyID, accessKeySecret)
		if err != nil {
			initErr = fmt.Errorf("failed to create OSS client: %w", err)
			return
		}

		// 获取 Bucket
		bucket, err = clientPtr.Bucket(bucketName)
		if err != nil {
			initErr = fmt.Errorf("failed to get OSS bucket: %w", err)
			return
		}
	})

	return initErr
}

// GetBucket 获取 OSS Bucket 实例
func GetBucket() (*oss.Bucket, error) {
	if initErr != nil {
		return nil, initErr
	}
	if bucket == nil {
		return nil, fmt.Errorf("OSS not initialized")
	}
	return bucket, nil
}

// UploadImage 上传图片到 OSS
// objectKey: OSS 上的对象路径，如 "images/2024/01/abc.png"
// data: 图片数据
// contentType: 内容类型，如 "image/png"
func UploadImage(objectKey string, data []byte, contentType string) (string, error) {
	bucket, err := GetBucket()
	if err != nil {
		return "", err
	}

	// 上传图片 - 使用 bytes.NewReader 将 []byte 转换为 io.Reader
	err = bucket.PutObject(objectKey, bytes.NewReader(data), oss.ContentType(contentType))
	if err != nil {
		return "", fmt.Errorf("failed to upload image to OSS: %w", err)
	}

	// 生成访问 URL
	// 格式: https://{bucket}.{endpoint}/{objectKey}
	endpoint := config.GetString("oss.endpoint")
	bucketName := config.GetString("oss.bucket")
	url := fmt.Sprintf("https://%s.%s/%s", bucketName, endpoint, objectKey)

	return url, nil
}

// IsEnabled 检查 OSS 是否已配置
func IsEnabled() bool {
	return initErr == nil && bucket != nil
}
