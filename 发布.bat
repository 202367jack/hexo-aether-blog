@echo off
chcp 65001 >nul
title Aether Weblog - 发布
cd /d "%~dp0"

echo ============================================
echo   Aether Weblog  发布到 GitHub Pages
echo ============================================
echo.

git rev-parse --git-dir >nul 2>nul
if errorlevel 1 (
  echo [错误] 这个目录不是 git 仓库。
  pause
  exit /b 1
)

echo 正在检查改动 ...
echo.

git add -A
git diff --cached --quiet
if not errorlevel 1 goto nocommit

set "MSG="
set /p "MSG=这次改了什么（直接回车 = 更新内容）："
if "%MSG%"=="" set "MSG=更新内容"
git commit -m "%MSG%"
if errorlevel 1 (
  echo [错误] 提交失败，把上面的报错发给我。
  pause
  exit /b 1
)
goto push

:nocommit
echo 没有新的改动，直接同步。

:push
echo.
echo 正在推送到 GitHub ...
git push -u origin main
if errorlevel 1 (
  echo.
  echo [错误] 推送失败。常见原因：
  echo   1. 仓库 202367jack/aether-weblog-hexo 还没建（去 https://github.com/new 建一个 public 空仓库）
  echo   2. 本机 SSH key 没加到 GitHub 账号
  echo.
  pause
  exit /b 1
)

echo.
echo 推送成功。GitHub Actions 大约 1-2 分钟后完成构建。
echo 打开看看：https://202367jack.github.io/aether-weblog-hexo/
echo.
timeout /t 3 >nul
start "" https://github.com/202367jack/aether-weblog-hexo/actions
pause
