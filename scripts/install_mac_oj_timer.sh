#!/usr/bin/env bash
set -euo pipefail

# 在家长端 Mac mini 上安装/刷新「四平台 OJ 后台定时抓取」launchd 服务（默认每 2 小时静默执行一次）
# 用法：./scripts/install_mac_oj_timer.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${REPO_ROOT}/.dsh/logs"
PLIST_PATH="${HOME}/Library/LaunchAgents/com.oicoach.oj-autosync.plist"

mkdir -p "${LOG_DIR}" "${HOME}/Library/LaunchAgents"

cat > "${PLIST_PATH}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.oicoach.oj-autosync</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>${REPO_ROOT}/scripts/auto_sync_ojs.py</string>
    <string>--git-push</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${REPO_ROOT}</string>
  <key>StartInterval</key>
  <integer>7200</integer>
  <key>RunAtLoad</key>
  <false/>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/oj-autosync.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/oj-autosync.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>PYTHONIOENCODING</key>
    <string>utf-8</string>
    <key>PYTHONUTF8</key>
    <string>1</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/com.oicoach.oj-autosync" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "${PLIST_PATH}"

echo "✅ 已安装并启动 Mac mini 四平台定时抓题服务：com.oicoach.oj-autosync（每 2 小时静默同步一次）"
echo "   Plist: ${PLIST_PATH}"
echo "   Logs:  ${LOG_DIR}/oj-autosync.log"
