@echo off
chcp 65001 > nul
title 旅行规划助手部署脚本

echo 🚀 旅行规划助手部署脚本
echo ==========================

:menu
echo.
echo 请选择部署方式：
echo 1. Docker 部署（推荐）
echo 2. 创建部署包
echo 3. 生成 Netlify 部署包
echo 4. 退出
echo.
set /p choice=请输入选项 (1-4): 

if "%choice%"=="1" goto docker_deploy
if "%choice%"=="2" goto create_package
if "%choice%"=="3" goto create_netlify_package
if "%choice%"=="4" goto exit
echo ❌ 无效选项，请重新选择
pause
goto menu

:docker_deploy
echo 🐳 开始 Docker 部署...

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    goto menu
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    goto menu
)

REM 构建和启动容器
echo 📦 构建 Docker 镜像...
docker-compose build

echo 🚀 启动服务...
docker-compose up -d

echo ✅ 部署完成！
echo 🌐 访问地址: http://localhost
echo 📊 查看日志: docker-compose logs -f
echo 🛑 停止服务: docker-compose down
pause
goto menu

:create_package
echo 📦 创建部署包...

REM 创建临时目录
set TEMP_DIR=travel-planner-deploy-%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TEMP_DIR=%TEMP_DIR: =0%
mkdir "%TEMP_DIR%"

REM 复制必要文件
copy index.html "%TEMP_DIR%\"
copy style.css "%TEMP_DIR%\"
copy script.js "%TEMP_DIR%\"
copy README.md "%TEMP_DIR%\"
copy deploy-guide.md "%TEMP_DIR%\"

REM 创建压缩包（使用 PowerShell）
powershell -Command "Compress-Archive -Path '%TEMP_DIR%' -DestinationPath '%TEMP_DIR%.zip' -Force"

REM 清理临时目录
rmdir /s /q "%TEMP_DIR%"

echo ✅ 部署包创建完成: %TEMP_DIR%.zip
echo 📤 您可以将此压缩包上传到服务器进行部署
pause
goto menu

:create_netlify_package
echo 🌐 创建 Netlify 部署包...

REM 创建临时目录
set NETLIFY_DIR=travel-planner-netlify-%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set NETLIFY_DIR=%NETLIFY_DIR: =0%
mkdir "%NETLIFY_DIR%"

REM 复制网站文件
copy index.html "%NETLIFY_DIR%\"
copy style.css "%NETLIFY_DIR%\"
copy script.js "%NETLIFY_DIR%\"
copy netlify.toml "%NETLIFY_DIR%\"

REM 创建压缩包
powershell -Command "Compress-Archive -Path '%NETLIFY_DIR%' -DestinationPath '%NETLIFY_DIR%.zip' -Force"

REM 清理临时目录
rmdir /s /q "%NETLIFY_DIR%"

echo ✅ Netlify 部署包创建完成: %NETLIFY_DIR%.zip
echo 📤 可以直接将此压缩包拖拽到 Netlify 进行部署
echo 🌐 或者访问 https://app.netlify.com/drop 进行部署
pause
goto menu

:exit
echo 👋 退出部署脚本
pause
exit
