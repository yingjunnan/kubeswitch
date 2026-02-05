# 部署指南

## Docker 部署

### 1. 构建 Docker 镜像

```bash
docker build -t kubeswitch-web:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name kubeswitch-web \
  -p 80:80 \
  -e VITE_API_BASE_URL=http://your-api-server:8080/api \
  kubeswitch-web:latest
```

## Nginx 部署

### 1. 构建生产版本

```bash
npm run build
```

### 2. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/kubeswitch-web/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. 部署文件

```bash
# 复制构建产物到 Nginx 目录
sudo cp -r dist/* /var/www/kubeswitch-web/

# 重启 Nginx
sudo systemctl restart nginx
```

## 环境变量配置

### 开发环境

编辑 `.env.development`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 生产环境

编辑 `.env.production`:

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

或在构建时指定：

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api npm run build
```

## 性能优化建议

### 1. 启用 HTTP/2

在 Nginx 配置中启用 HTTP/2：

```nginx
listen 443 ssl http2;
```

### 2. 启用 Brotli 压缩

安装 Nginx Brotli 模块并配置：

```nginx
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 3. CDN 加速

将静态资源上传到 CDN，并在构建时配置 CDN 地址：

```typescript
// vite.config.ts
export default defineConfig({
  base: 'https://cdn.your-domain.com/',
  // ...
})
```

## 监控和日志

### 1. 访问日志

Nginx 访问日志位置：`/var/log/nginx/access.log`

### 2. 错误日志

Nginx 错误日志位置：`/var/log/nginx/error.log`

### 3. 应用监控

建议集成以下监控工具：

- Sentry（错误追踪）
- Google Analytics（用户行为分析）
- Prometheus + Grafana（性能监控）

## 安全建议

### 1. HTTPS

强制使用 HTTPS：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ...其他配置
}
```

### 2. 安全头

添加安全响应头：

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 3. 限流

防止 DDoS 攻击：

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

location / {
    limit_req zone=one burst=20;
    # ...
}
```

## 故障排查

### 1. 白屏问题

- 检查浏览器控制台是否有 JavaScript 错误
- 检查 API 地址配置是否正确
- 检查 Nginx 配置中的 `try_files` 是否正确

### 2. API 请求失败

- 检查 CORS 配置
- 检查 API 服务是否正常运行
- 检查网络连接和防火墙设置

### 3. 路由 404

- 确保 Nginx 配置了 SPA 路由支持
- 检查 `try_files` 配置

## 回滚策略

### 1. 保留旧版本

```bash
# 备份当前版本
sudo cp -r /var/www/kubeswitch-web /var/www/kubeswitch-web.backup

# 部署新版本
sudo cp -r dist/* /var/www/kubeswitch-web/
```

### 2. 快速回滚

```bash
# 恢复旧版本
sudo rm -rf /var/www/kubeswitch-web
sudo mv /var/www/kubeswitch-web.backup /var/www/kubeswitch-web
sudo systemctl restart nginx
```

## 联系支持

如有问题，请联系技术支持团队。
