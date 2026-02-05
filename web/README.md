# KubeSwitch Web 前端

基于 Vue 3 + Ant Design Vue 的 Kubernetes 集群管理系统前端应用。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **UI 库**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **测试**: Vitest + Vue Test Utils

## 功能特性

### 用户认证
- 用户登录/登出
- JWT Token 认证
- 基于角色的访问控制（Admin/User）

### 集群管理
- 查看集群列表
- 创建/删除集群（管理员）
- Kubeconfig 管理：
  - 查看 Kubeconfig
  - 复制到剪贴板
  - 导出为文件
  - 导入 Kubeconfig（管理员）
- 集群权限管理（管理员）

### 用户管理（仅管理员）
- 创建用户
- 删除用户（非管理员用户）
- 重置用户密码
- 修改用户角色
- 用户权限管理（分配集群访问权限）

### 个人设置
- 修改当前用户密码

### 审计日志（仅管理员）
- 查看系统操作日志
- 分页显示

## 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 生成测试覆盖率报告
npm run test:coverage
```

## 项目结构

```
src/
├── api/              # API 接口封装
│   ├── client.ts     # Axios 实例配置
│   ├── auth.ts       # 认证 API
│   ├── clusters.ts   # 集群 API
│   ├── users.ts      # 用户 API
│   └── audit.ts      # 审计 API
├── components/       # 组件
│   ├── layout/       # 布局组件
│   └── common/       # 通用组件
├── composables/      # 组合式函数
│   ├── useAuth.ts    # 认证逻辑
│   └── usePermission.ts # 权限检查
├── router/           # 路由配置
│   ├── index.ts      # 路由定义
│   └── guards.ts     # 导航守卫
├── stores/           # Pinia 状态管理
│   ├── auth.ts       # 认证状态
│   ├── cluster.ts    # 集群状态
│   ├── user.ts       # 用户状态
│   └── audit.ts      # 审计日志状态
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── Login.vue     # 登录页
│   ├── Dashboard.vue # 仪表板
│   ├── clusters/     # 集群管理页面
│   ├── users/        # 用户管理页面
│   └── audit/        # 审计日志页面
├── App.vue           # 根组件
└── main.ts           # 应用入口
```

## 环境变量

### 开发环境 (.env.development)

```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 生产环境 (.env.production)

```
VITE_API_BASE_URL=/api
```

## API 配置

后端 API 默认地址为 `http://localhost:8080/api`。

如需修改，请编辑 `.env.development` 或 `.env.production` 文件。

## 默认账户

请联系系统管理员获取登录凭证。

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT
