@echo off
chcp 65001 >nul
title Aether Weblog - 新建文章
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   没有找到 Node.js，先装 Node LTS 再双击这个脚本。
  echo.
  pause
  exit /b 1
)

node "tools\new-post.js"

echo.
echo ============================================
echo   按任意键关闭这个窗口
echo ============================================
pause >nul
