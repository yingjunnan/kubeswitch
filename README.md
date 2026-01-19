# 🚀 KubeSwitch

**Remote Kubeconfig Management Tool**

KubeSwitch 是一个用于集中管理 Kubernetes 集群访问凭证（Kubeconfig）的工具。它允许管理员在服务端统一管理集群和用户权限，用户则可以通过 CLI 工具方便地拉取并切换集群上下文。

---

## 🏗️ Architecture

该项目由三个主要部分组成：

*   🐹 **Server**: 基于 Go (Gin + GORM + SQLite) 的 REST API 服务端。
*   ⚛️ **Web UI**: 基于 React (Vite + Ant Design) 的管理后台。
*   💻 **CLI**: 基于 Go (Cobra + Bubble Tea) 的命令行客户端。

---

## 🛠️ Development Guide (开发指导)

### 📋 Prerequisites
*   Go 1.20+
*   Node.js 18+
*   npm / yarn

### 1. Backend (Server)

服务端负责存储用户、集群信息以及审计日志。

```bash
cd server
# 安装依赖
go mod tidy
# 启动服务 (默认监听 :8080)
go run main.go
```
> 🔑 **默认管理员**: `admin` / `admin123`

### 2. Frontend (Web UI)

Web 界面用于管理员上传 Kubeconfig、创建用户和分配权限。

```bash
cd web
# 安装依赖
npm install
# 启动开发服务器
npm run dev
```
访问: `http://localhost:5173`

### 3. CLI Client

客户端用于开发者日常登录和切换集群。

```bash
cd cli
# 安装依赖
go mod tidy
# 编译二进制文件
go build -o ks main.go
# 运行测试
./ks --help
```

---

## 📦 Deployment Guide (部署指导)

### ☁️ Server Deployment

建议将服务端编译为二进制文件运行，或者构建 Docker 镜像。

```bash
# 编译
cd server
go build -o kubeswitch-server main.go

# 运行
export JWT_SECRET="your-secure-secret"
./kubeswitch-server
```

### 🌐 Web UI Deployment

前端应构建为静态资源，并由 Nginx 或 Go Server 托管。

```bash
cd web
npm run build
# 构建产物位于 dist/ 目录
```

### 🖥️ CLI Distribution

将编译好的 `ks` 二进制文件分发给用户。

```bash
cd cli
go build -o ks main.go
# 用户可以将 ks 移动到 PATH 路径下
sudo mv ks /usr/local/bin/
```

---

## 💻 Usage (使用指南)

### ⚙️ Initialization

用户首次使用需要配置服务端地址：

```bash
ks init
# 按提示输入 Server URL (默认为 http://localhost:8080)
```

### 🔐 Login

```bash
ks login
# 输入用户名和密码
```

### ☸️ Select Cluster

```bash
ks select
```
这将打开一个交互式列表，通过上下键选择集群。选中后，配置文件会自动下载到 `~/.kube/ks-cache/`。

---

## 🐚 Shell Integration (Important!)

为了让选择的集群配置立即在当前 Shell 中生效（自动设置 `KUBECONFIG` 环境变量），**强烈建议**在你的 Shell 配置文件（`.bashrc` 或 `.zshrc`）中添加以下函数：

```bash
# KubeSwitch Shell Integration
function kss() {
  local config_path
  # 调用 ks select 并获取输出的路径
  config_path=$(ks select)
  
  # 如果选择了文件，则导出环境变量
  if [ -n "$config_path" ]; then
    export KUBECONFIG="$config_path"
    # 这里不需要 echo，因为 ks select 的 stderr 已经输出了友好的提示
  fi
}
```

**使用方法**:
直接在终端输入 `kss` 即可享受丝滑的集群切换体验！✨
