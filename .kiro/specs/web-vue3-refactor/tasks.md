# Implementation Plan: Web Vue3 Refactor

## Overview

本实施计划将 KubeSwitch web 界面从 React 重构为 Vue 3 + Ant Design Vue。任务按照依赖关系组织，每个任务都是可独立完成的代码编写步骤。所有任务都引用了相应的需求条款，确保完整的需求追溯。

## Tasks

- [x] 1. 项目初始化和基础配置
  - 使用 Vite 创建 Vue 3 + TypeScript 项目
  - 安装依赖：Ant Design Vue、Vue Router、Pinia、Axios、fast-check
  - 配置 TypeScript（启用严格模式）、ESLint、Prettier
  - 设置项目目录结构（src/router, src/stores, src/views, src/components, src/api, src/types, src/utils）
  - 配置环境变量支持（.env.development, .env.production）
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 17.1, 17.2, 18.3_

- [ ] 2. 类型定义和工具函数
  - [x] 2.1 创建 TypeScript 类型定义
    - 在 src/types/ 中定义 User、Cluster、Permission、AuditLog 接口
    - 定义 API 响应类型（ApiResponse、PaginatedResponse）
    - 定义枚举类型（UserRole）
    - _Requirements: 9.1_
  
  - [x] 2.2 实现工具函数
    - 实现 Token 管理工具（getToken, setToken, removeToken）
    - 实现本地存储工具（封装 localStorage 操作）
    - 实现表单验证器（用户名、密码、集群名称等）
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 2.3 编写工具函数单元测试
    - 测试 Token 管理的各种场景
    - 测试表单验证器的边缘情况
    - _Requirements: 17.3_

- [ ] 3. HTTP 客户端和 API 层
  - [x] 3.1 配置 Axios 实例
    - 创建 Axios 实例，配置 baseURL 和 timeout
    - 实现请求拦截器（添加 JWT Token 到请求头）
    - 实现响应拦截器（处理 401、403、404、500 等错误）
    - _Requirements: 9.6, 9.7, 12.1, 12.2_
  
  - [x] 3.2 实现 API 接口函数
    - 实现认证 API（login, logout）
    - 实现集群 API（getClusters, createCluster, deleteCluster, getKubeconfig, importKubeconfig, getClusterPermissions, updateClusterPermissions）
    - 实现用户 API（getUsers, createUser, deleteUser, resetPassword, updateUserRole, getUserPermissions, updateUserPermissions）
    - 实现个人 API（getCurrentUser, updateMyPassword）
    - 实现审计 API（getAuditLogs）
    - _Requirements: 1.2, 1.5, 2.1, 2.3, 2.5, 3.1, 3.5, 4.1, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4, 6.2, 6.5, 7.3, 8.1_
  
  - [ ]* 3.3 编写 API 层单元测试
    - 使用 MSW 模拟 API 响应
    - 测试各种成功和失败场景
    - _Requirements: 17.3_

- [ ] 4. Pinia 状态管理
  - [x] 4.1 实现 AuthStore
    - 定义状态（token, user, isAuthenticated, isAdmin）
    - 实现 actions（login, logout, refreshUser, updatePassword）
    - 实现 getters（getToken, getCurrentUser, checkIsAdmin）
    - 配置状态持久化（使用 pinia-plugin-persistedstate）
    - _Requirements: 1.2, 1.3, 1.5, 1.6, 6.2, 14.1, 14.2_
  
  - [x] 4.2 实现 ClusterStore
    - 定义状态（clusters, loading, selectedCluster）
    - 实现 actions（fetchClusters, createCluster, deleteCluster, getKubeconfig, importKubeconfig, fetchClusterPermissions, updateClusterPermissions）
    - 实现 getters（getClusters, getClusterById）
    - _Requirements: 2.1, 2.3, 2.5, 2.6, 3.1, 3.5, 5.1, 5.2_
  
  - [x] 4.3 实现 UserStore
    - 定义状态（users, loading）
    - 实现 actions（fetchUsers, createUser, deleteUser, resetPassword, updateUserRole, fetchUserPermissions, updateUserPermissions）
    - 实现 getters（getUsers, getUserById）
    - _Requirements: 4.1, 4.3, 4.5, 5.3, 5.4, 6.5, 7.3, 7.4_
  
  - [x] 4.4 实现 AuditStore
    - 定义状态（logs, loading, pagination）
    - 实现 actions（fetchAuditLogs）
    - 实现 getters（getLogs）
    - _Requirements: 8.1, 8.3_
  
  - [ ]* 4.5 编写 Store 单元测试
    - 测试每个 store 的 actions 和 getters
    - 测试状态持久化
    - _Requirements: 17.3_
  
  - [ ]* 4.6 编写 Store 属性测试
    - **Property 8: 数据变更后列表刷新**
    - **Validates: Requirements 2.6, 5.5, 7.4**
    - **Property 32: API 响应缓存**
    - **Validates: Requirements 13.4**

- [ ] 5. Vue Router 配置和导航守卫
  - [x] 5.1 配置路由
    - 定义所有路由（Login, Dashboard, ClusterList, UserList, AuditLog, Settings）
    - 配置路由元信息（requiresAuth, requiresAdmin, title）
    - 实现路由懒加载
    - _Requirements: 9.4, 13.3_
  
  - [x] 5.2 实现导航守卫
    - 实现全局前置守卫（检查认证状态和权限）
    - 未认证用户访问受保护路由时重定向到登录页
    - 非管理员用户访问管理员路由时重定向到 Dashboard
    - _Requirements: 1.1, 4.7, 8.4_
  
  - [ ]* 5.3 编写路由守卫单元测试
    - 测试各种认证和权限场景
    - _Requirements: 17.3_
  
  - [ ]* 5.4 编写路由守卫属性测试
    - **Property 1: 未认证访问重定向**
    - **Validates: Requirements 1.1**

- [ ] 6. Composables（组合式函数）
  - [x] 6.1 实现 useAuth composable
    - 封装认证相关逻辑（isAuthenticated, isAdmin, currentUser, login, logout）
    - 提供响应式的认证状态
    - _Requirements: 1.2, 1.5, 1.6_
  
  - [x] 6.2 实现 usePermission composable
    - 封装权限检查逻辑（canManageClusters, canManageUsers, canViewAudit）
    - 提供响应式的权限状态
    - _Requirements: 2.7, 4.7, 8.4_
  
  - [ ]* 6.3 编写 Composables 单元测试
    - 测试各种认证和权限场景
    - _Requirements: 17.3_

- [ ] 7. 布局组件
  - [x] 7.1 实现 AppLayout 组件
    - 创建主布局（侧边栏 + 顶部栏 + 内容区域）
    - 实现响应式布局（桌面、平板、移动）
    - _Requirements: 10.1, 11.1, 11.2, 11.3_
  
  - [x] 7.2 实现 Sidebar 组件
    - 创建侧边栏导航菜单
    - 根据用户角色显示/隐藏菜单项
    - 实现移动端汉堡菜单
    - _Requirements: 10.1, 2.7, 4.7, 8.4, 11.2_
  
  - [x] 7.3 实现 Header 组件
    - 创建顶部栏
    - 显示用户信息和登出按钮
    - _Requirements: 10.2_
  
  - [ ]* 7.4 编写布局组件单元测试
    - 测试响应式布局行为
    - 测试权限控制的菜单显示
    - _Requirements: 17.3_
  
  - [ ]* 7.5 编写布局组件属性测试
    - **Property 27: 响应式表格滚动**
    - **Validates: Requirements 11.4**
    - **Property 28: 响应式表单可用性**
    - **Validates: Requirements 11.5**

- [ ] 8. 通用组件
  - [ ] 8.1 实现 KubeconfigModal 组件
    - 创建 Kubeconfig 查看/复制/导出模态框
    - 实现复制到剪贴板功能
    - 实现文件下载功能
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 8.2 实现 PasswordModal 组件
    - 创建密码修改模态框
    - 实现表单验证
    - _Requirements: 6.1, 6.2_
  
  - [ ] 8.3 实现 ConfirmDialog 组件
    - 创建通用确认对话框
    - 支持自定义标题、内容和按钮
    - _Requirements: 2.4, 4.4_
  
  - [ ]* 8.4 编写通用组件单元测试
    - 测试各种交互场景
    - _Requirements: 17.3_
  
  - [ ]* 8.5 编写通用组件属性测试
    - **Property 10: Kubeconfig 复制操作**
    - **Validates: Requirements 3.2**
    - **Property 11: Kubeconfig 导出操作**
    - **Validates: Requirements 3.3**
    - **Property 30: 表单验证错误显示**
    - **Validates: Requirements 12.3**

- [ ] 9. 认证功能
  - [x] 9.1 实现 Login 页面
    - 创建登录表单（用户名、密码）
    - 实现表单验证
    - 处理登录成功和失败
    - 登录成功后重定向到 Dashboard
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [ ]* 9.2 编写登录页面单元测试
    - 测试表单验证
    - 测试登录流程
    - _Requirements: 17.3_
  
  - [ ]* 9.3 编写登录页面属性测试
    - **Property 2: 无效凭证错误处理**
    - **Validates: Requirements 1.4**
    - **Property 4: 认证请求包含 Token**
    - **Validates: Requirements 9.7**

- [ ] 10. 集群管理功能
  - [x] 10.1 实现 ClusterList 页面
    - 创建集群列表表格
    - 实现集群创建表单（仅管理员）
    - 实现集群删除功能（仅管理员）
    - 实现 Kubeconfig 查看/复制/导出功能
    - 实现 Kubeconfig 导入功能（仅管理员）
    - 根据用户角色显示/隐藏操作按钮
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 10.2 实现 ClusterPermissions 组件
    - 创建集群权限管理界面
    - 显示有权访问该集群的用户列表
    - 实现添加/删除用户权限功能
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ]* 10.3 编写集群管理单元测试
    - 测试各种操作场景
    - 测试权限控制
    - _Requirements: 17.3_
  
  - [ ]* 10.4 编写集群管理属性测试
    - **Property 5: 集群列表数据显示**
    - **Validates: Requirements 2.1**
    - **Property 6: 集群创建操作**
    - **Validates: Requirements 2.3**
    - **Property 7: 集群删除操作**
    - **Validates: Requirements 2.5**
    - **Property 9: Kubeconfig 查看操作**
    - **Validates: Requirements 3.1**
    - **Property 12: Kubeconfig 导入操作**
    - **Validates: Requirements 3.5**
    - **Property 13: Kubeconfig 操作错误处理**
    - **Validates: Requirements 3.6**

- [ ] 11. Checkpoint - 验证核心功能
  - 确保登录、登出、集群列表功能正常工作
  - 确保所有测试通过
  - 如有问题，请向用户询问

- [ ] 12. 用户管理功能
  - [x] 12.1 实现 UserList 页面
    - 创建用户列表表格（显示用户名、角色）
    - 实现用户创建表单（仅管理员）
    - 实现用户删除功能（仅管理员，不能删除管理员）
    - 实现密码重置功能（仅管理员）
    - 实现角色修改功能（仅管理员）
    - 根据用户角色显示/隐藏功能
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 12.2 实现 UserPermissions 组件
    - 创建用户权限管理界面
    - 显示用户可访问的集群列表
    - 实现添加/删除集群权限功能
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ]* 12.3 编写用户管理单元测试
    - 测试各种操作场景
    - 测试权限控制
    - _Requirements: 17.3_
  
  - [ ]* 12.4 编写用户管理属性测试
    - **Property 14: 用户列表数据显示**
    - **Validates: Requirements 4.1, 7.1**
    - **Property 15: 用户创建操作**
    - **Validates: Requirements 4.3**
    - **Property 16: 非管理员用户删除**
    - **Validates: Requirements 4.5**
    - **Property 17: 管理员用户删除保护**
    - **Validates: Requirements 4.6**
    - **Property 22: 管理员密码重置**
    - **Validates: Requirements 6.5**
    - **Property 23: 用户角色修改**
    - **Validates: Requirements 7.3**

- [ ] 13. 权限管理功能
  - [ ]* 13.1 编写权限管理属性测试
    - **Property 18: 权限列表查询**
    - **Validates: Requirements 5.1, 5.3**
    - **Property 19: 权限授予操作**
    - **Validates: Requirements 5.2, 5.4**

- [ ] 14. 个人设置功能
  - [ ] 14.1 实现 Settings 页面
    - 创建个人设置页面
    - 显示当前用户信息
    - 实现密码修改功能
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 14.2 编写个人设置单元测试
    - 测试密码修改流程
    - _Requirements: 17.3_
  
  - [ ]* 14.3 编写个人设置属性测试
    - **Property 20: 用户密码修改**
    - **Validates: Requirements 6.2**
    - **Property 21: 密码错误处理**
    - **Validates: Requirements 6.4**

- [ ] 15. 审计日志功能
  - [x] 15.1 实现 AuditLog 页面
    - 创建审计日志列表表格（显示时间、用户、操作类型、详情）
    - 实现分页功能
    - 仅管理员可访问
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 15.2 编写审计日志单元测试
    - 测试数据显示和分页
    - _Requirements: 17.3_
  
  - [ ]* 15.3 编写审计日志属性测试
    - **Property 24: 审计日志数据显示**
    - **Validates: Requirements 8.1, 8.2**
    - **Property 25: 审计日志分页**
    - **Validates: Requirements 8.3**

- [ ] 16. 错误处理和用户反馈
  - [ ] 16.1 实现全局错误处理
    - 配置 Vue 全局错误处理器
    - 实现 Axios 错误拦截器（处理各种 HTTP 错误）
    - 实现 401 错误自动登出和重定向
    - _Requirements: 1.7, 12.1, 12.2, 12.4_
  
  - [ ] 16.2 实现用户反馈机制
    - 为所有操作添加成功提示
    - 为所有错误添加错误消息
    - 为长时间操作添加加载状态
    - _Requirements: 10.6_
  
  - [ ]* 16.3 编写错误处理属性测试
    - **Property 3: 401 错误全局处理**
    - **Validates: Requirements 1.7, 12.5**
    - **Property 26: 操作反馈机制**
    - **Validates: Requirements 10.6**
    - **Property 29: API 错误消息显示**
    - **Validates: Requirements 12.1**
    - **Property 31: 全局错误处理**
    - **Validates: Requirements 12.4**

- [ ] 17. Checkpoint - 验证所有功能
  - 确保所有页面和功能正常工作
  - 确保所有测试通过
  - 如有问题，请向用户询问

- [ ] 18. 国际化支持
  - [ ] 18.1 配置 Vue I18n
    - 安装和配置 Vue I18n
    - 创建语言文件（zh-CN.json, en-US.json）
    - 提取所有界面文本到语言文件
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [ ] 18.2 实现语言切换功能
    - 在设置页面添加语言选择器
    - 实现语言切换逻辑
    - 持久化语言选择
    - _Requirements: 16.4, 16.5_
  
  - [ ]* 18.3 编写国际化属性测试
    - **Property 39: 文本国际化**
    - **Validates: Requirements 16.2**
    - **Property 40: 语言切换响应**
    - **Validates: Requirements 16.5**

- [ ] 19. 可访问性改进
  - [ ] 19.1 添加 ARIA 标签
    - 为所有交互元素添加适当的 ARIA 标签
    - 为所有图像和图标添加 alt 文本
    - 确保表单字段有明确的标签
    - _Requirements: 15.1, 15.4, 15.5_
  
  - [ ] 19.2 实现键盘导航
    - 确保所有交互元素支持键盘操作
    - 实现焦点管理
    - _Requirements: 15.2_
  
  - [ ]* 19.3 编写可访问性属性测试
    - **Property 35: ARIA 标签完整性**
    - **Validates: Requirements 15.1**
    - **Property 36: 键盘导航支持**
    - **Validates: Requirements 15.2**
    - **Property 37: 图像替代文本**
    - **Validates: Requirements 15.4**
    - **Property 38: 表单标签关联**
    - **Validates: Requirements 15.5**

- [ ] 20. 安全加固
  - [ ] 20.1 实现安全措施
    - 实现输入验证和清理
    - 确保敏感信息不在 URL 或日志中暴露
    - 配置 CSP（Content Security Policy）
    - _Requirements: 14.3, 14.5_
  
  - [ ]* 20.2 编写安全属性测试
    - **Property 33: 用户输入验证**
    - **Validates: Requirements 14.3**
    - **Property 34: 敏感信息保护**
    - **Validates: Requirements 14.5**

- [ ] 21. 性能优化
  - [ ] 21.1 实现性能优化
    - 配置路由懒加载
    - 实现 API 响应缓存
    - 为长列表实现虚拟滚动（如果需要）
    - 优化图片和资源加载
    - _Requirements: 13.3, 13.4, 13.5_

- [ ] 22. 构建和部署配置
  - [ ] 22.1 配置生产构建
    - 配置 Vite 生产构建选项
    - 启用代码压缩和 Tree Shaking
    - 配置 source maps 生成
    - _Requirements: 18.1, 18.2, 18.4_
  
  - [ ] 22.2 创建 Docker 配置
    - 创建 Dockerfile
    - 创建 .dockerignore
    - 创建 docker-compose.yml（可选）
    - _Requirements: 18.5_

- [ ] 23. 最终测试和验证
  - [ ] 23.1 运行所有测试
    - 运行单元测试
    - 运行属性测试
    - 生成测试覆盖率报告
    - 确保覆盖率达到 80% 以上
    - _Requirements: 17.3, 17.4_
  
  - [ ] 23.2 手动测试
    - 测试所有功能页面
    - 测试不同角色的权限控制
    - 测试响应式布局
    - 测试错误处理
    - 测试可访问性

- [ ] 24. 文档和交付
  - [ ] 24.1 编写文档
    - 更新 README.md（项目介绍、安装、运行、构建）
    - 编写开发文档（架构、目录结构、开发指南）
    - 编写部署文档（环境变量、Docker 部署）
  
  - [ ] 24.2 代码审查和清理
    - 移除未使用的代码和依赖
    - 确保代码符合 ESLint 规则
    - 确保代码格式一致

## Notes

- 标记为 `*` 的任务是可选的测试任务，可以根据项目时间和资源决定是否实施
- 每个任务都引用了相应的需求条款，确保完整的需求追溯
- Checkpoint 任务用于在关键阶段验证功能，确保增量开发的质量
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代
- 所有属性测试都标注了对应的设计文档属性编号和验证的需求条款
