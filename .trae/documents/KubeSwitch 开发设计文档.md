# KubeSwitch 开发设计文档

本项目旨在开发一个 Kubeconfig 远程管理工具，包含服务端（Web 管理界面）和客户端 CLI。

## 1. 系统架构

* **服务端 (Server)**: 使用 Go 语言开发，提供 RESTful API。

  * **Web 框架**: Gin

  * **数据库**: SQLite (轻量级，方便部署) 或 PostgreSQL (生产环境)

  * **ORM**: GORM

* **前端 (Web UI)**: 使用 React 开发，作为服务端的静态资源嵌入或独立部署。

  * **UI 组件库**: Ant Design

  * **HTTP 客户端**: Axios

* **命令行工具 (CLI)**: 使用 Go 语言开发。

  * **CLI 框架**: Cobra

  * **交互式 UI**: Bubble Tea (用于光标选择)

  * **配置管理**: Viper

## 2. 功能模块设计

### 2.1 服务端 (Server)

#### 数据库设计

* **Users (用户表)**: `id`, `username`, `password_hash`, `role` (admin/user), `created_at`

* **Clusters (集群表)**: `id`, `name`, `kubeconfig_content` (加密存储), `description`, `created_at`

* **Permissions (权限表)**: `id`, `user_id`, `cluster_id` (多对多关系)

* **AuditLogs (审计日志表)**: `id`, `user_id`, `action` (Login, Logout, GetConfig, etc.), `target_resource`, `ip_address`, `timestamp`

#### API 接口

* **认证**:

  * `POST /api/login`: 用户登录，返回 JWT Token。

  * `POST /api/logout`: 登出 (记录审计)。

* **集群管理 (Admin)**:

  * `POST /api/clusters`: 上传 Kubeconfig 文件。

  * `DELETE /api/clusters/:id`: 删除集群配置。

  * `PUT /api/clusters/:id`: 修改信息。

* **用户与权限 (Admin)**:

  * `GET /api/users`: 用户列表。

  * `POST /api/users`: 新建用户。

  * `POST /api/users/:id/permissions`: 分配集群权限。

* **客户端操作**:

  * `GET /api/my/clusters`: 获取当前用户有权限的集群列表。

  * `GET /api/my/clusters/:id/kubeconfig`: 获取指定集群的 Kubeconfig 内容 (触发审计: GetConfig)。

* **审计 (Admin)**:

  * `GET /api/audit/logs`: 查看审计日志。

### 2.2 前端 (Web UI)

* **登录页**: 用户名/密码登录。

* **管理员仪表盘**:

  * **集群管理**: 上传 YAML，查看列表。

  * **用户管理**: 创建用户，通过多选框为用户分配集群权限。

  * **审计日志**: 表格展示用户的登录、下载配置等操作记录。

* **普通用户视图**: (可选) 仅查看自己有权限的集群列表。

### 2.3 客户端 (CLI)

#### 命令结构

* `ks init ` : 提示输入配置服务端地址`<url>`。

* `ks login`: 交互式输入用户名密码，获取 Token 并保存在本地 (`~/.kubeswitch/config.yaml`)。

* `ks logout`: 清除本地 Token。

* `ks select`:

  * 获取有权限的集群列表。

  * 使用 Bubble Tea 显示交互式列表，支持上下键选择。

  * 选中后，下载 Kubeconfig 到本地缓存目录 (例如 `~/.kube/ks-cache/cluster-name.yaml`)。

  * **Shell 集成**: 由于子进程无法直接修改父 Shell 的环境变量，建议提供以下两种方式：

    1. 输出 Shell 命令供 `eval` 执行: `eval $(ks select)`
    2. 生成 Shell Alias/Function 封装。

## 3. 开发计划

1. **初始化项目结构**: 创建 Monorepo 或分目录结构 (`/server`, `/web`, `/cli`)。
2. **服务端开发**:

   * 定义数据库模型 (GORM)。

   * 实现 JWT 认证中间件。

   * 实现集群上传与权限管理 API。

   * 实现审计日志记录。
3. **Web 前端开发**:

   * 搭建 React + Antd 框架。

   * 对接登录、用户管理、集群管理接口。
4. **CLI 开发**:

   * 实现配置读取与登录逻辑。

   * 集成 Bubble Tea 实现列表选择 UI。

   * 实现 Kubeconfig 下载与本地缓存逻辑。

   * 编写 Shell 集成脚本 (bash/zsh)。
5. **联调与测试**: 验证全流程，特别是权限控制和环境变量生效。

请确认以上设计文档，确认后我将开始搭建项目骨架。
