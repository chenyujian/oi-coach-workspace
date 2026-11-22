#!/usr/bin/env bash
set -euo pipefail

# 家长端（Mac mini）一键同步脚本
# 用法：./scripts/sync_mac.sh ["可选提交说明"]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

COMMIT_MSG="${1:-parent(mac): sync $(date '+%Y-%m-%d %H:%M')}"

echo "==> 当前工作区: ${REPO_ROOT}"

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "[提示] 尚未绑定远程仓库 origin。"
  echo "请先执行: git remote add origin <你的私有仓库URL> && git push -u origin main"
  exit 1
fi

# 1. 先提交本地改动，避免 rebase 丢失工作区内容
if [[ -n "$(git status --porcelain)" ]]; then
  echo "==> 检测到本地改动，正在提交..."
  git add -A
  git commit -m "${COMMIT_MSG}"
else
  echo "==> 本地无新改动。"
fi

# 2. 拉取远程最新进度（如孩子端刚推送的新错题/代码）
echo "==> 正在拉取远程仓库最新内容..."
if ! git pull --rebase origin "$(git rev-parse --abbrev-ref HEAD)"; then
  echo "[错误] 拉取时发生合并冲突，请手动处理后再推送（或执行 git rebase --abort 回退）。"
  exit 1
fi

# 3. 推送到远程仓库
echo "==> 正在推送到远程仓库..."
git push origin "$(git rev-parse --abbrev-ref HEAD)"

echo "✅ Mac mini 同步完成！"
