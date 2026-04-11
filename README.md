# Jeepay UI

Jeepay 前端项目，包括运营平台、商户系统、聚合码收银台。

三个子项目均采用 **Vue 3** + **Vite** 构建，UI 框架使用 Ant Design Vue（管理端/商户端）。

## 服务端项目

- GitHub：<https://github.com/jeequan/jeepay>
- Gitee：<https://gitee.com/jeequan/jeepay>
- GitCode：<https://gitcode.com/jeequantech/jeepay>

## 目录结构

```
jeepay-ui
├── jeepay-ui-cashier   -- 聚合码收银台（Vue 3 + Vite）
├── jeepay-ui-manager   -- 运营平台（Vue 3 + Vite + Ant Design Vue 4）
├── jeepay-ui-merchant  -- 商户系统（Vue 3 + Vite + Ant Design Vue 4）
├── Dockerfile          -- Docker 统一构建（通过 PLATFORM 参数区分）
├── default.conf.template -- Nginx 配置模板
└── .dockerignore
```

## 技术栈

| 组件 | 版本 |
|------|------|
| Vue | 3.2+ |
| Vue Router | 4.x |
| Vite | 4.x（cashier）/ 2.x（manager/merchant） |
| Ant Design Vue | 4.2（manager/merchant） |
| Node.js | >= 16 |

## 快速开始

### 环境要求

- Node.js >= 16（推荐 18+）
- npm >= 7

### 安装与运行

以运营平台为例（其他子项目操作相同）：

```bash
# 进入子项目目录
cd jeepay-ui-manager

# 安装依赖
npm install

# 修改开发环境后端地址
# 编辑 .env.development 中的 VITE_API_BASE_URL

# 本地开发
npm run dev

# 生产构建
npm run build
# 产物输出到 dist/ 目录
```

### 各子项目命令对照

| 操作 | 命令 |
|------|------|
| 本地开发 | `npm run dev` |
| 生产构建 | `npm run build` |
| 预览构建产物 | `npm run serve` |

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_BASE_URL` | 前端资源部署根路径 | `/` 或 `/cashier/` |
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:9216` |

- 开发环境：修改 `.env.development`
- 生产环境：修改 `.env`

## Docker 部署

UI 项目通过统一的 `Dockerfile` 构建，使用 `PLATFORM` 参数区分子项目。

### 单独构建

```bash
# 构建收银台
docker build . --build-arg PLATFORM=cashier -t jeepay-ui-cashier:latest

# 构建运营平台
docker build . --build-arg PLATFORM=manager -t jeepay-ui-manager:latest

# 构建商户系统
docker build . --build-arg PLATFORM=merchant -t jeepay-ui-merchant:latest
```

### 单独运行

```bash
docker run -d -p 9226:80 -e BACKEND_HOST=172.20.0.21:9216 jeepay-ui-cashier:latest
docker run -d -p 9227:80 -e BACKEND_HOST=172.20.0.22:9217 jeepay-ui-manager:latest
docker run -d -p 9228:80 -e BACKEND_HOST=172.20.0.23:9218 jeepay-ui-merchant:latest
```

### 配合 Docker Compose

推荐在 `jeepay` 服务端项目中使用 `docker compose up -d --build` 一键启动全部服务（包含前后端 + 中间件），详见 [jeepay README](https://github.com/jeequan/jeepay)。

### 默认端口

| 服务 | 端口 |
|------|------|
| 收银台 UI | `9226` |
| 运营平台 UI | `9227` |
| 商户系统 UI | `9228` |

## 注意事项

- Docker 构建时，`.dockerignore` 会排除 `node_modules`、`.git`、`dist` 目录以加速构建
- Nginx 配置通过环境变量 `BACKEND_HOST` 动态设置后端代理地址
- 如部署在非根路径下，需修改 `.env` 中的 `VITE_BASE_URL`
