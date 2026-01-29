# KubeSwitch - Kubeconfig 管理功能

## 新增功能

在集群管理页面中，每个集群现在都有一组彩色按钮，提供以下kubeconfig操作：

### 1. 查看 (View) - 蓝色按钮
- 在弹窗中查看完整的kubeconfig内容
- 只读模式，防止意外修改
- 提供复制到剪贴板的快捷按钮

### 2. 复制 (Copy) - 绿色按钮
- 一键将kubeconfig内容复制到系统剪贴板
- 方便快速使用kubectl命令

### 3. 导出 (Export) - 蓝色按钮
- 将kubeconfig导出为YAML文件
- 文件名格式：`{集群名称}-kubeconfig.yaml`
- 支持本地保存和分享

### 4. 导入 (Import) - 橙色按钮（仅管理员）
- 管理员可以更新现有集群的kubeconfig
- 支持粘贴新的kubeconfig内容
- 自动记录审计日志

### 5. 添加集群时的文件上传功能
- 支持拖拽上传kubeconfig文件
- 支持 .yaml、.yml、.txt 格式
- 文件大小限制：10MB以内
- 上传后自动填充到文本框中

## 界面改进

- **直观的按钮布局**：不再使用下拉菜单，所有操作直接显示为彩色按钮
- **颜色编码**：
  - 蓝色：查看操作
  - 绿色：复制操作  
  - 蓝色：导出操作
  - 橙色：导入操作（仅管理员可见）
- **文件上传区域**：添加集群时提供拖拽上传功能

## 权限控制

- **普通用户**：可以查看、复制、导出有权限访问的集群的kubeconfig
- **管理员**：除了普通用户权限外，还可以导入/更新任何集群的kubeconfig

## 技术实现

### 后端 API
- `GET /api/clusters/:id/config` - 获取集群kubeconfig
- `POST /api/clusters/:id/import` - 导入新的kubeconfig（仅管理员）

### 前端组件
- 使用Ant Design的Button组件提供直观操作
- Upload.Dragger组件用于文件上传
- Modal组件用于查看和导入kubeconfig
- 支持文件下载和剪贴板操作

## 安全特性

- 所有操作都需要用户认证
- 权限检查确保用户只能访问授权的集群
- 审计日志记录所有kubeconfig相关操作
- 导入功能仅限管理员使用
- 文件上传验证：类型检查和大小限制

## 使用方法

### 查看/复制/导出kubeconfig
1. 登录KubeSwitch管理界面
2. 进入集群管理页面
3. 在目标集群行直接点击对应的彩色按钮：
   - **View**（蓝色）：查看kubeconfig内容
   - **Copy**（绿色）：复制到剪贴板
   - **Export**（蓝色）：下载为文件
   - **Import**（橙色，仅管理员可见）：更新kubeconfig

### 添加集群时上传kubeconfig
1. 点击"Add Cluster"按钮
2. 填写集群名称和描述
3. 选择以下方式之一添加kubeconfig：
   - 直接在文本框中粘贴内容
   - 拖拽kubeconfig文件到上传区域
   - 点击上传区域选择文件

## 注意事项

- kubeconfig内容包含敏感信息，请妥善保管
- 导出的文件应存储在安全位置
- 导入新kubeconfig前请确保内容正确，避免集群连接问题
- 上传文件时请确保格式正确（YAML格式）