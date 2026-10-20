@echo off
chcp 65001 >nul
title Aether Weblog - 本地预览
cd /d "%~dp0"

echo ============================================
echo   Aether Weblog  本地预览
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 没检测到 Node.js，请先安装 Node.js LTS：
  echo        https://nodejs.org/zh-cn
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 第一次运行，正在安装依赖（大约 1-2 分钟）...
  call npm install --registry=https://registry.npmmirror.com
  if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败，请把上面的报错发给我。
    pause
    exit /b 1
  )
)

echo.
echo 正在启动本地服务器，浏览器会自动打开 http://localhost:4000/aether-weblog-hexo/
echo 关掉这个窗口 = 停止预览。
echo.

rem 等 6 秒再开浏览器，避免服务器还没起来
start "" cmd /c "timeout /t 6 >nul & start http://localhost:4000/aether-weblog-hexo/"

call npm run server
pause
