package middleware

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func InitMiddleware(r *gin.Engine, db *gorm.DB) {
	// CORS 中间件
	r.Use(CORS())

	// 日志中间件
	r.Use(Logger())

	// 错误处理中间件
	r.Use(ErrorHandler())
}

// CORS 跨域资源共享
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, X-Requested-With")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// Logger 请求日志
func Logger() gin.HandlerFunc {
	return gin.Logger()
}

// ErrorHandler 错误处理
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				c.JSON(500, gin.H{
					"error": "Internal server error",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
