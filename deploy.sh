#!/bin/bash

# 旅行规划助手一键部署脚本
echo "🚀 旅行规划助手部署脚本"
echo "=========================="

# 函数：显示菜单
show_menu() {
    echo ""
    echo "请选择部署方式："
    echo "1. Docker 部署（推荐）"
    echo "2. Nginx 部署"
    echo "3. 创建部署包"
    echo "4. 生成 Netlify 部署包"
    echo "5. 退出"
    echo ""
    read -p "请输入选项 (1-5): " choice
}

# 函数：Docker 部署
docker_deploy() {
    echo "🐳 开始 Docker 部署..."
    
    # 检查 Docker 是否安装
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        echo "安装指南: https://docs.docker.com/get-docker/"
        return 1
    fi
    
    # 检查 Docker Compose 是否安装
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        return 1
    fi
    
    # 构建和启动容器
    echo "📦 构建 Docker 镜像..."
    docker-compose build
    
    echo "🚀 启动服务..."
    docker-compose up -d
    
    echo "✅ 部署完成！"
    echo "🌐 访问地址: http://localhost"
    echo "📊 查看日志: docker-compose logs -f"
    echo "🛑 停止服务: docker-compose down"
}

# 函数：Nginx 部署
nginx_deploy() {
    echo "🌐 开始 Nginx 部署..."
    
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        echo "❌ 请使用 sudo 运行此脚本进行 Nginx 部署"
        return 1
    fi
    
    # 检查 Nginx 是否安装
    if ! command -v nginx &> /dev/null; then
        echo "📦 安装 Nginx..."
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y nginx
        elif command -v yum &> /dev/null; then
            yum install -y nginx
        else
            echo "❌ 无法自动安装 Nginx，请手动安装"
            return 1
        fi
    fi
    
    # 创建网站目录
    echo "📁 创建网站目录..."
    mkdir -p /var/www/travel-planner
    
    # 复制文件
    echo "📋 复制网站文件..."
    cp -r index.html style.css script.js /var/www/travel-planner/
    
    # 设置权限
    chown -R www-data:www-data /var/www/travel-planner
    
    # 创建 Nginx 配置
    echo "⚙️  配置 Nginx..."
    cat > /etc/nginx/sites-available/travel-planner << 'EOF'
server {
    listen 80;
    server_name localhost;
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
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/travel-planner /etc/nginx/sites-enabled/
    
    # 测试配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    echo "✅ Nginx 部署完成！"
    echo "🌐 访问地址: http://localhost"
}

# 函数：创建部署包
create_package() {
    echo "📦 创建部署包..."
    
    # 创建临时目录
    TEMP_DIR="travel-planner-deploy-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$TEMP_DIR"
    
    # 复制必要文件
    cp index.html style.css script.js "$TEMP_DIR/"
    cp README.md "$TEMP_DIR/"
    cp deploy-guide.md "$TEMP_DIR/"
    
    # 创建压缩包
    tar -czf "${TEMP_DIR}.tar.gz" "$TEMP_DIR"
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
    
    echo "✅ 部署包创建完成: ${TEMP_DIR}.tar.gz"
    echo "📤 您可以将此压缩包上传到服务器进行部署"
}

# 函数：生成 Netlify 部署包
create_netlify_package() {
    echo "🌐 创建 Netlify 部署包..."
    
    # 创建临时目录
    NETLIFY_DIR="travel-planner-netlify-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$NETLIFY_DIR"
    
    # 复制网站文件
    cp index.html style.css script.js "$NETLIFY_DIR/"
    cp netlify.toml "$NETLIFY_DIR/"
    
    # 创建压缩包
    zip -r "${NETLIFY_DIR}.zip" "$NETLIFY_DIR"
    
    # 清理临时目录
    rm -rf "$NETLIFY_DIR"
    
    echo "✅ Netlify 部署包创建完成: ${NETLIFY_DIR}.zip"
    echo "📤 可以直接将此压缩包拖拽到 Netlify 进行部署"
    echo "🌐 或者访问 https://app.netlify.com/drop 进行部署"
}

# 主程序
main() {
    while true; do
        show_menu
        
        case $choice in
            1)
                docker_deploy
                ;;
            2)
                nginx_deploy
                ;;
            3)
                create_package
                ;;
            4)
                create_netlify_package
                ;;
            5)
                echo "👋 退出部署脚本"
                exit 0
                ;;
            *)
                echo "❌ 无效选项，请重新选择"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# 运行主程序
main 
