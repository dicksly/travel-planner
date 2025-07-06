FROM nginx:alpine

# 复制网站文件到 nginx 默认目录
COPY . /usr/share/nginx/html/

# 创建自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 