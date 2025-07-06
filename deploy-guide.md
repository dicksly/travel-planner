# 旅行规划助手部署指南

## 🚀 方案一：免费静态网站托管（推荐）

### 1. Netlify 部署（最简单）

#### 步骤：
1. 注册 [Netlify](https://netlify.com) 账户
2. 登录后点击 "New site from Git"
3. 选择 "Deploy manually"
4. 将项目文件夹拖拽到部署区域
5. 等待部署完成，获得免费域名

#### 特点：
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 自动部署
- ✅ 自定义域名支持

### 2. Vercel 部署

#### 步骤：
1. 注册 [Vercel](https://vercel.com) 账户
2. 安装 Vercel CLI：`npm i -g vercel`
3. 在项目目录运行：`vercel`
4. 按提示完成部署

#### 特点：
- ✅ 完全免费
- ✅ 极速部署
- ✅ 自动HTTPS
- ✅ 全球边缘网络

### 3. GitHub Pages 部署

#### 步骤：
1. 将代码推送到 GitHub 仓库
2. 进入仓库设置页面
3. 找到 "Pages" 选项
4. 选择部署分支
5. 等待部署完成

#### 特点：
- ✅ 完全免费
- ✅ 与GitHub集成
- ✅ 自动部署
- ✅ 自定义域名

---

## 🖥️ 方案二：传统Web服务器部署

### 1. Nginx 部署

#### 安装 Nginx：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 配置 Nginx：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/travel-planner;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 设置缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 部署步骤：
```bash
# 1. 创建网站目录
sudo mkdir -p /var/www/travel-planner

# 2. 复制文件到服务器
sudo cp -r * /var/www/travel-planner/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/travel-planner

# 4. 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/travel-planner

# 5. 启用站点
sudo ln -s /etc/nginx/sites-available/travel-planner /etc/nginx/sites-enabled/

# 6. 测试配置
sudo nginx -t

# 7. 重启 Nginx
sudo systemctl restart nginx
```

### 2. Apache 部署

#### 安装 Apache：
```bash
# Ubuntu/Debian
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd
```

#### 配置 Apache：
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/travel-planner
    
    <Directory /var/www/travel-planner>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # 启用压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>
</VirtualHost>
```

---

## ☁️ 方案三：云服务提供商部署

### 1. 阿里云 OSS 静态网站托管

#### 步骤：
1. 登录阿里云控制台
2. 创建 OSS 存储桶
3. 开启静态网站托管功能
4. 上传网站文件
5. 配置默认首页为 `index.html`
6. 配置自定义域名（可选）

#### 成本：
- 存储费用：约 ¥0.12/GB/月
- 流量费用：约 ¥0.50/GB

### 2. 腾讯云 COS 静态网站托管

#### 步骤：
1. 登录腾讯云控制台
2. 创建 COS 存储桶
3. 开启静态网站功能
4. 上传项目文件
5. 配置访问权限
6. 获取访问链接

### 3. 华为云 OBS 静态网站托管

#### 步骤：
1. 创建 OBS 桶
2. 配置桶策略为公共读
3. 开启静态网站托管
4. 上传网站文件
5. 配置默认首页

---

## 🔧 Docker 部署（高级）

### 创建 Dockerfile：
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 构建和运行：
```bash
# 构建镜像
docker build -t travel-planner .

# 运行容器
docker run -d -p 80:80 travel-planner
```

### Docker Compose 部署：
```yaml
version: '3.8'
services:
  travel-planner:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

---

## 🌐 域名和HTTPS配置

### 1. 域名配置
- 购买域名（阿里云、腾讯云、GoDaddy等）
- 配置DNS解析到服务器IP
- 等待DNS生效（通常1-24小时）

### 2. HTTPS配置（Let's Encrypt）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 性能优化建议

### 1. 文件压缩
```bash
# 使用 gzip 压缩文件
gzip -9 *.html *.css *.js
```

### 2. 图片优化
- 使用 WebP 格式
- 压缩图片大小
- 使用 CDN 加速

### 3. 缓存策略
- HTML文件：不缓存或短时间缓存
- CSS/JS文件：长时间缓存
- 图片文件：长时间缓存

---

## 🛠️ 监控和维护

### 1. 服务器监控
- 使用 Nginx 访问日志
- 监控服务器资源使用
- 设置报警机制

### 2. 网站性能监控
- Google PageSpeed Insights
- GTmetrix
- Pingdom

### 3. 备份策略
- 定期备份网站文件
- 配置自动备份脚本
- 测试备份恢复流程

---

## 💡 推荐方案选择

| 需求 | 推荐方案 | 特点 |
|------|----------|------|
| 个人学习/测试 | Netlify/Vercel | 免费、简单、快速 |
| 小型项目 | GitHub Pages | 免费、与代码仓库集成 |
| 企业项目 | 阿里云OSS + CDN | 稳定、可控、成本低 |
| 高并发应用 | 云服务器 + Nginx | 高性能、可扩展 |
| 技术团队 | Docker + K8s | 容器化、易维护 |

选择部署方案时，请根据您的具体需求、技术水平和预算来决定。 