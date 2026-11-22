---
name: git-setup-plan-a
description: 家长在 Mac mini（Antigravity）上配置方案 A 的 Git 远程仓库（Gitee/GitHub 私有库）、验证 SSH/HTTPS 凭据、首次推送、生成 Windows 孩子端克隆步骤以及配置 Mac mini 后台定时同步时使用。
---

# 方案 A：Git 双机协同上线与运维指南（家长端技能）

当家长要求“配置 Git”“按方案 A 连远程”“绑定 Gitee/GitHub”“设置自动同步”或排查同步冲突时，按以下步骤协助执行。

## 第 1 步：检查本地 Git 与远程状态
在项目根目录运行只读检查：
- `git status`
- `git remote -v`
- `git branch -a`
- 检查本机是否已有 SSH 公钥（`ls -la ~/.ssh`）以及 `gh`（GitHub CLI）或 Git 凭据助手状态。

## 第 2 步：引导绑定私有远程仓库（Gitee 或 GitHub）
1. 询问家长希望托管在 **Gitee（国内直连稳定）** 还是 **GitHub**，以及是否已建好 **Private（私有）** 空仓库。
2. 如已拿到仓库 URL（HTTPS 或 SSH），执行：
   ```bash
   git remote add origin <仓库URL>
   git branch -M main
   git push -u origin main
   ```
3. 如果推送时遇到认证问题：
   - **HTTPS**：引导生成个人访问令牌（Personal Access Token）并让 macOS Keychain 自动保存；
   - **SSH**：如无密钥则协助生成 `ed25519` 密钥，把公钥内容展示给家长添加到 Gitee/GitHub 设置，再用 `ssh -T git@gitee.com` 或 `ssh -T git@github.com` 验通。

## 第 3 步：输出孩子 Windows 端实操步骤
推送成功后，给家长一份可直接照着做的 Windows 配置清单：
1. 安装 Git for Windows（使用默认选项，内置 Git Credential Manager 自动记住密码/Token）。
2. 执行 `git clone <仓库URL> oi-coach-workspace`（建议放在不含中文和空格的路径，例如 `D:\OI\oi-coach-workspace`）。
3. 为孩子端设置本地 Git 身份（避免提交报错）：
   ```powershell
   cd D:\OI\oi-coach-workspace
   git config user.name "student-win"
   git config user.email "student@local"
   ```
4. 将 `scripts\sync_windows.bat` 右键发送到桌面快捷方式，改名为“学习同步”，双击测试一次拉取与推送。

## 第 4 步：可选配置 Mac mini 后台定时任务（launchd）
如果家长希望 Mac mini 每晚自动抓取 AtCoder / Codeforces 并同步到远程：
1. 确认 `profile/student_profile.md` 或家长提供的 AtCoder ID / Codeforces Handle。
2. 先手动测试 `python3 scripts/fetch_atcoder.py --user <ID>` 或 `python3 scripts/fetch_codeforces.py --handle <Handle>`。
3. 在 `scripts/` 下生成每日同步包装脚本，并按需提供 macOS `launchd` plist 配置（`~/Library/LaunchAgents/`）与加载命令。
