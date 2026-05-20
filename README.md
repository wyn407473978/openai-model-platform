# AI 图片生成平台

支持多模型图片生成的平台，提供文本生成图片、图片编辑、图片变体等功能。通过数据库管理模型参数，前端动态渲染参数表单。

## 技术栈

**后端**

- Go + Gin + Gorm + PostgreSQL
- OpenAI Go SDK (`github.com/openai/openai-go/v3`)

**前端**

- React 18 + TypeScript + Vite + pnpm
- Ant Design 5.x
- TanStack Query + React Hook Form + Zod + Zustand

## 项目结构

```
.
├── backend/                  # Go 后端服务
│   ├── cmd/server/         # 入口
│   ├── internal/
│   │   ├── config/        # 配置
│   │   ├── handler/       # HTTP handlers
│   │   ├── middleware/     # 中间件
│   │   ├── model/          # 数据模型
│   │   ├── repository/     # 数据库操作
│   │   └── service/        # 业务逻辑
│   ├── pkg/utils/          # 工具包
│   ├── configs/            # 配置文件
│   └── scripts/             # 脚本
│
├── front/                   # React 前端
│   └── src/
│       ├── api/            # API 调用
│       ├── components/     # 组件
│       ├── hooks/          # 自定义 hooks
│       ├── pages/          # 页面
│       ├── stores/          # Zustand 状态
│       └── types/          # TypeScript 类型
│
└── docs/
    └── project-plan.md    # 项目计划书
```

## 快速开始

### 前置条件

- Go 1.21+
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### 后端

```bash
cd backend

# 安装依赖
go mod tidy

# 复制配置
cp configs/config.yaml.example configs/config.yaml
# 编辑 configs/config.yaml，填写数据库和 OpenAI API Key

# 运行开发服务器
go run cmd/server/main.go

# 构建
go build -o server cmd/server/main.go
```

### 前端

```bash
cd front

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env
# 编辑 .env，填写 VITE_API_BASE_URL

# 运行开发服务器
pnpm dev

# 构建
pnpm build
```

## 主要功能

- **多模型支持**：GPT Image 2、DALL-E 2 等
- **模型参数管理**：通过数据库配置各模型的可用参数
- **动态表单**：根据所选模型自动展示对应参数
- **图片生成**：文本生成图片
- **图片编辑**：支持 mask 编辑
- **图片变体**：生成图片变体

## API 接口

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `GET /api/v1/models` | GET | 获取启用的模型列表 |
| `GET /api/v1/models/:model_id/parameters` | GET | 获取模型参数配置 |
| `POST /api/v1/images/generate` | POST | 文本生成图片 |
| `POST /api/v1/images/edit` | POST | 图片编辑 |
| `POST /api/v1/images/variation` | POST | 图片变体 |
| `GET /api/v1/admin/models` | GET | 管理后台 - 模型列表 |
| `POST /api/v1/admin/models` | POST | 管理后台 - 创建模型 |
| `PUT /api/v1/admin/models/:id` | PUT | 管理后台 - 更新模型 |
| `DELETE /api/v1/admin/models/:id` | DELETE | 管理后台 - 删除模型 |

详细接口文档见 `docs/project-plan.md`。

## 页面

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 图片生成 | `/images/generate` | 文本生成图片 |
| 图片编辑 | `/images/edit` | 上传图片并编辑 |
| 模型管理 | `/admin/models` | 后台管理模型和参数 |

## 配置说明

### 后端配置 (`backend/configs/config.yaml`)

```yaml
server:
  address: :8080

database:
  host: localhost
  port: 5432
  username: postgres
  password: postgres
  name: openai_platform

openai:
  api_key: your-api-key-here
```

### 前端环境变量 (`front/.env`)

```
VITE_API_BASE_URL=http://localhost:8080
```
