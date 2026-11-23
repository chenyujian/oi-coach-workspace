@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 孩子端（Windows）一键同步脚本
REM 建议右键此文件 -> 发送到桌面快捷方式，命名为“学习同步”
REM 非交互调用（例如由 dsh-oi-coach 插件触发）可传入 --no-pause 或设置 OI_NO_PAUSE=1

set NO_PAUSE=%OI_NO_PAUSE%
if /i "%~1"=="--no-pause" set NO_PAUSE=1

cd /d "%~dp0\.."
echo ==========================================
echo   信息学奥赛工作台 - 一键同步
echo ==========================================
echo 工作区路径: %cd%
echo.

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [提示] 还未连接远程仓库，请联系家长先完成仓库绑定。
    if not "%NO_PAUSE%"=="1" pause
    exit /b 1
)

REM 获取当前时间戳
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set D=%%a-%%b-%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set T=%%a:%%b

REM 1. 检查并保存本次本地练习改动
git status --porcelain > "%TEMP%\oi_git_status.tmp"
for %%A in ("%TEMP%\oi_git_status.tmp") do set SIZE=%%~zA
del "%TEMP%\oi_git_status.tmp" >nul 2>&1

if !SIZE! GTR 0 (
    echo [1/3] 检测到新的练习代码或笔记，正在保存...
    git add -A
    git commit -m "study(win): auto sync %D% %T%"
) else (
    echo [1/3] 本地没有新的未保存改动。
)

REM 2. 拉取家长端最新配置、讲义与规则
echo [2/3] 正在拉取最新学习配置与讲义...
git pull --rebase
if errorlevel 1 (
    echo.
    echo [注意] 同步时遇到文件冲突或网络异常！
    echo 请不要手动强行覆盖，截图发给爸爸处理即可。
    if not "%NO_PAUSE%"=="1" pause
    exit /b 1
)

REM 3. 上传本次练习记录
echo [3/3] 正在上传学习进度到云端...
git push
if errorlevel 1 (
    echo.
    echo [注意] 上传失败，请检查网络连接或账号凭据后重试。
    if not "%NO_PAUSE%"=="1" pause
    exit /b 1
)

echo.
echo ==========================================
echo   同步完成！现在可以开始学习或关闭窗口。
echo ==========================================
if not "%NO_PAUSE%"=="1" pause
