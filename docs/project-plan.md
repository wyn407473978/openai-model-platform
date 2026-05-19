# AI 图片生成平台 - 项目计划书

> 本计划书聚焦于图片生成模型对接模块，包括模型参数管理、差异化配置和前端交互界面。

## 1. 项目目标

说明项目要解决什么问题，面向谁，最终交付什么。

- **项目名称**：AI 图片生成平台
- **一句话目标**：提供多模型图片生成能力，支持差异化参数配置和用户友好的操作界面
- **目标用户**：
  - AI 应用开发者（需要程序化调用图片生成能力）
  - 设计师/内容创作者（需要快速生成图片素材）
  - 普通用户（通过界面上传图片、编辑、生成变体）
- **核心价值**：
  - 统一封装多个 GPT Image 模型，降低接入复杂度
  - 通过数据库管理模型参数，支持灵活配置和扩展
  - 前端动态表单，根据模型自动展示可用参数
- **最终交付物**：
  - 模型参数管理后端 API
  - 图片生成/编辑/变体后端 API
  - 前端图片生成操作界面（支持模型选择、参数配置、文件上传）

## 2. 用户与场景

描述典型用户和关键使用场景。

| 用户类型 | 使用场景 | 主要目标 | 关键痛点 |
| --- | --- | --- | --- |
| 开发者 | 通过 API 调用图片生成 | 程序化生成图片、集成到自身产品 | 参数差异大、接口不统一 |
| 设计师 | 根据描述生成配图 | 快速获取素材、尝试不同风格 | 参数配置复杂、不直观 |
| 普通用户 | 上传图片并编辑 | 图片编辑、风格迁移、生成变体 | 不知道该选什么模型、什么参数 |

## 3. 功能范围

### 必须实现

**后端 - 模型管理**
- 模型列表查询 API（返回模型 ID、名称、是否启用）
- 模型参数配置管理 API（CRUD，支持按模型查询参数）

**后端 - 图片生成**
- `POST /api/v1/images/generate` - 文本生成图片
- `POST /api/v1/images/edit` - 图片编辑（支持 mask）
- `POST /api/v1/images/variation` - 图片变体生成
- 流式响应支持（可选，Phase 2）

**前端 - 图片生成页面**
- 模型选择下拉框（显示模型名称和描述）
- 动态参数表单（根据所选模型展示不同字段）
- Prompt 文本输入框
- 图片上传组件（支持拖拽，支持 1-16 张图片）
- 生成结果预览和下载

**数据库 - 模型参数配置**
- 存储每个模型的可用参数、枚举值、默认值、是否必填
- 支持参数分组（尺寸、质量、输出格式、背景等）

### 暂不实现

- 用户鉴权与权限管理（后续 Phase）
- 图片历史记录和相册功能
- 多人协作和团队管理
- 图片生成计费和配额管理
- 流式响应前端展示

### 后续可能实现

- 更多模型接入（Claude Image、DALL-E 3 等）
- 图片风格预设和模板管理
- WebSocket 实时推送生成进度
- 阿里云 OSS 直接存储生成的图片

## 4. 技术栈

沿用项目现有技术栈，聚焦于图片生成模块：

- **前端**：React 19+、TypeScript、Vite、pnpm、TanStack Query、Zustand、React Hook Form + Zod
- **UI 方案**：Ant Design 5.x（已用于项目中，后台管理界面统一风格）
- **后端**：Go、Gin、Gorm、PostgreSQL
- **AI SDK**：`github.com/openai/openai-go/v3`（已安装 v3.36.0）
- **数据库**：PostgreSQL（已有基础设施）
- **文件存储**：本地临时存储 + 阿里云 OSS（后续扩展）

## 5. 数据模型

### 核心实体

**1. ImageModel（图片模型）**
```
id              bigint PK
model_id        varchar(64)  UNIQUE  -- openai 模型标识，如 "gpt-image-2"
name            varchar(128)          -- 前端展示名称，如 "GPT Image 2"
description     text                  -- 模型描述
enabled         boolean DEFAULT true  -- 是否启用
sort_order      int DEFAULT 0         -- 排序
created_at      timestamptz
updated_at      timestamptz
```

**2. ModelParameter（模型参数配置）**
```
id              bigint PK
model_id        varchar(64) FK        -- 关联 ImageModel.model_id
param_key       varchar(64)           -- 参数名，如 "size", "quality", "background"
param_label     varchar(128)          -- 前端展示标签，如 "图片尺寸"
param_type      varchar(32)           -- 类型：enum | number | string | boolean
is_required     boolean DEFAULT false
default_value   text                  -- JSON 存储默认值
param_order     int DEFAULT 0         -- 表单排序
created_at      timestamptz
updated_at      timestamptz
```

**3. ParameterEnumValue（枚举值选项）**
```
id              bigint PK
parameter_id    bigint FK             -- 关联 ModelParameter.id
enum_value      varchar(64)          -- 枚举值，如 "1024x1024"
enum_label      varchar(128)          -- 前端展示，如 "1024×1024 (正方形)"
is_default      boolean DEFAULT false
enum_order      int DEFAULT 0
```

### 核心关系

```
ImageModel 1───* ModelParameter
ModelParameter 1───* ParameterEnumValue
```

### 关键字段与约束

- `ImageModel.model_id` 唯一约束，避免重复接入同一模型
- `ModelParameter.param_key` 在同一模型下唯一
- `ParameterEnumValue` 的 `is_default` 同一参数下只能有一个为 true
- 枚举值使用 JSON 存储，保留扩展性（如后续支持动态范围）

## 6. 页面与接口

### 页面

| 页面 | 路径 | 核心功能 |
| --- | --- | --- |
| 图片生成 | `/images/generate` | 文本生成图片界面 |
| 图片编辑 | `/images/edit` | 上传图片 + 编辑 |
| 模型管理 | `/admin/models` | 后台管理模型和参数配置 |

### 接口

**模型管理 API**

| 接口 | 方法 | 说明 | 权限 |
| --- | --- | --- | --- |
| `GET /api/v1/admin/models` | GET | 获取所有模型列表 | 管理员 |
| `GET /api/v1/models` | GET | 获取启用的模型列表（公开） | 公开 |
| `GET /api/v1/models/:model_id/parameters` | GET | 获取模型的参数配置 | 公开 |
| `POST /api/v1/admin/models` | POST | 创建模型 | 管理员 |
| `PUT /api/v1/admin/models/:id` | PUT | 更新模型 | 管理员 |
| `DELETE /api/v1/admin/models/:id` | DELETE | 删除模型 | 管理员 |
| `POST /api/v1/admin/models/:model_id/parameters` | POST | 创建参数配置 | 管理员 |
| `PUT /api/v1/admin/models/:model_id/parameters/:id` | PUT | 更新参数配置 | 管理员 |
| `DELETE /api/v1/admin/models/:model_id/parameters/:id` | DELETE | 删除参数配置 | 管理员 |

**图片生成 API**

| 接口 | 方法 | 说明 | 权限 |
| --- | --- | --- | --- |
| `POST /api/v1/images/generate` | POST | 文本生成图片 | 登录用户 |
| `POST /api/v1/images/edit` | POST | 图片编辑 | 登录用户 |
| `POST /api/v1/images/variation` | POST | 图片变体 | 登录用户 |

**图片生成请求体示例**

```json
// 文本生成
{
  "model": "gpt-image-2",
  "prompt": "一只在草地上奔跑的柯基犬",
  "n": 1,
  "size": "1024x1024",
  "quality": "auto",
  "output_format": "png",
  "background": "auto"
}

// 图片编辑
{
  "model": "gpt-image-1",
  "prompt": "把这只狗变成橙色",
  "images": ["base64编码的图片"],
  "mask": "base64编码的mask(可选)",
  "size": "1024x1024",
  "quality": "high"
}

// 图片变体
{
  "model": "dall-e-2",
  "image": "base64编码的图片",
  "n": 4,
  "size": "256x256"
}
```

### 权限

- 公开访问：`GET /api/v1/models`（获取启用的模型列表）
- 登录后访问：图片生成/编辑/变体 API
- 管理员访问：模型和参数配置的增删改查

## 7. 开发阶段

### Phase 1 - 基础框架和数据模型

**目标**：完成数据库表设计、模型管理 API、基础前端框架

**范围**：
- [ ] 数据库迁移：`image_models`、`model_parameters`、`parameter_enum_values` 三张表
- [ ] GORM Model 定义和关联关系
- [ ] Repository 层：模型的 CRUD
- [ ] Service 层：业务逻辑
- [ ] Handler 层：管理员 API
- [ ] 前端：`/admin/models` 页面，表格展示模型列表
- [ ] 前端：Ant Design Form 动态渲染模型参数配置

**验收标准**：
- [ ] 数据库表创建成功，关联关系正确
- [ ] 管理员可以新增/编辑/删除模型
- [ ] 管理员可以为模型配置参数和枚举值
- [ ] 前端动态表单根据配置渲染正确

**不包含**：
- 图片生成 API
- 用户侧前端界面
- 鉴权相关

---

### Phase 2 - 图片生成 API 和 SDK 集成

**目标**：完成图片生成/编辑/变体 API，集成 openai-go/v3

**范围**：
- [ ] OpenAI Client 初始化配置（API Key 管理）
- [ ] `POST /api/v1/images/generate` 实现
- [ ] `POST /api/v1/images/edit` 实现（支持单图、多图、mask）
- [ ] `POST /api/v1/images/variation` 实现
- [ ] 请求参数校验（基于数据库中的参数配置）
- [ ] 响应格式化（统一返回格式）
- [ ] 错误处理（模型不支持的参数、限流等）

**验收标准**：
- [ ] 三个 API 均可正确调用 OpenAI 接口
- [ ] 不同模型传递正确的参数（GPT Image 2 不传 transparent）
- [ ] 文件上传正确处理（base64 编码）
- [ ] API 响应格式统一

**不包含**：
- 流式响应
- OSS 存储

---

### Phase 3 - 用户侧前端界面

**目标**：完成普通用户使用的图片生成界面

**范围**：
- [ ] `GET /api/v1/models` 前端调用，展示模型选择下拉框
- [ ] `GET /api/v1/models/:model_id/parameters` 动态渲染参数表单
- [ ] Ant Design 组件集成：Select、Radio.Group、Input.Number、Upload
- [ ] Prompt 输入框（支持多行文本）
- [ ] 图片上传组件（支持拖拽、1-16 张、PNG/JPG/WEBP）
- [ ] 生成结果预览（base64 渲染）
- [ ] 图片下载功能
- [ ] 简单的历史记录（不持久化，内存存储）

**验收标准**：
- [ ] 用户选择不同模型时，参数表单动态变化
- [ ] GPT Image 2 不展示 transparent 背景选项
- [ ] 支持上传 1-16 张图片
- [ ] 生成结果正确预览和下载

**不包含**：
- 用户登录/鉴权（可先用 Mock）
- 计费和配额
- WebSocket 进度推送

---

### Phase 4 - 优化和扩展（可选）

**范围**：
- [ ] 流式响应前端展示（Server-Sent Events）
- [ ] 生成结果上传 OSS 并返回 URL
- [ ] 用户历史记录持久化
- [ ] 更多模型接入（Claude Image 等）

## 8. Agent Teams 策略

**默认是否启用 Agent Teams**：是

本模块涉及前端、后端、数据库，适合多 Agent 并行开发。

**适合启用的场景**：
- Phase 1 和 Phase 2 可以并行（后端 + 数据库）
- Phase 3 前端独立开发

**不启用的场景**：
- 小范围 Bug 修复
- 单一文件修改

**推荐团队组合**：
- Lead Agent（统筹）
- Go Backend Agent（后端 API + SDK 集成）
- Frontend Agent（前端界面）
- Database Agent（数据模型评审）

**推荐串行顺序**：
```
Lead -> Database Agent（数据模型设计）-> Backend + Frontend 并行 -> Lead 验收
```

**推荐并行顺序**：
```
Backend Agent（Phase 1: Repository/Service/Handler）
Frontend Agent（Phase 1: Admin 页面）
```

**文件所有权约束**：
- Backend Agent：后端所有 Go 文件
- Frontend Agent：前端所有 React/TS 文件
- 共同维护：数据库迁移文件

**最终验收要求**：
- 所有 API 接口通过手动测试
- 前端页面在浏览器中验证可用性
- 代码符合项目规范（无 lint 错误）

## 9. 验收标准

**功能验收**：
- [ ] 数据库三张表创建正确，关联关系无误
- [ ] 管理员可以增删改查模型和参数
- [ ] 文本生成、图片编辑、图片变体三个 API 均返回正确结果
- [ ] 前端模型选择后，参数表单正确动态切换
- [ ] 文件上传支持 1-16 张图片

**体验验收**：
- [ ] 参数表单布局整齐，说明文字清晰
- [ ] 模型下拉框显示模型名称而非 ID
- [ ] 生成中的 Loading 状态明确
- [ ] 生成结果可放大预览

**性能验收**：
- [ ] API 响应时间 < 5s（不含 OpenAI 实际生成时间）
- [ ] 前端页面首屏加载 < 2s

**安全验收**：
- [ ] API Key 不硬编码，通过环境变量或配置中心注入
- [ ] 用户输入的 Prompt 正确转义
- [ ] 文件上传限制大小和类型（防止恶意文件）

**工程验收**：
- [ ] 后端代码无编译错误
- [ ] 前端 `pnpm build` 成功
- [ ] 数据库迁移脚本可重复执行

## 10. 约束与偏好

**优先级**：
1. Phase 1 - 数据模型和 Admin 页面
2. Phase 2 - 图片生成 API
3. Phase 3 - 用户侧前端界面

**不希望引入的依赖**：
- 暂不引入 WebSocket 库（流式响应 Phase 4 再做）
- 暂不引入对象存储 SDK（先用本地存储）

**UI 风格**：
- 沿用 Ant Design 5.x 风格
- 保持后台管理界面一致性

**语言与文案**：
- 前端文案中文优先
- 后端错误信息中英双语

**数据与隐私要求**：
- 用户上传的图片仅在请求期间存储，不持久化
- Prompt 内容不记录日志

**成本限制**：
- OpenAI API 调用成本由用户自行管理
- 平台不抽成（Phase 4 考虑计费）

**维护偏好**：
- 模型参数配置通过数据库管理，便于后续新增模型
- 不硬编码模型参数枚举值

## 11. 风险与注意事项

**安全风险**：
- API Key 泄漏 → 通过环境变量管理，不提交到 Git
- 恶意 Prompt 注入 → 后端增加 Prompt 长度限制和特殊字符过滤

**数据风险**：
- 用户上传大文件导致内存溢出 → 限制单文件大小 10MB，总请求大小 50MB

**权限风险**：
- 非管理员访问管理 API → 后端增加角色校验中间件

**迁移风险**：
- 暂无数据库迁移需求（Phase 1 全新创建表）

**并发风险**：
- 同一用户短时间内多次请求 → 前端增加防抖处理

**第三方服务风险**：
- OpenAI API 限流 → 后端增加重试机制（指数退避）
- OpenAI API 不可用 → 返回友好错误信息，不暴露内部细节

**未确认问题**：
- GPT Image 2 的 arbitrary resolution 具体限制数值？（需要实测确认）
- 是否需要支持中文 Prompt？（OpenAI 对多语言支持良好，暂不限制）
- 图片生成结果是否需要持久化存储？（Phase 3 暂用内存，Phase 4 考虑 OSS）

## 12. 当前决策记录

| 日期 | 决策 | 原因 | 影响 |
| --- | --- | --- | --- |
| 2026-05-19 | 使用 openai-go/v3 而非 go-openai | 前者支持 GPT Image 2 | 无 |
| 2026-05-19 | 模型参数通过数据库管理而非硬编码 | 便于扩展和配置 | 无 |
| 2026-05-19 | Phase 1-3 分阶段开发 | 降低复杂度，每阶段可验收 | 无 |
