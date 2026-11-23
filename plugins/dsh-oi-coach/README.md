# `dsh-oi-coach` — 麒麒 OI 学习台（DeepSeek Harness 原生工作台插件）

仿照 `dsh-invest-board` 零构建 ESM 架构实现的原生 DeepSeek Harness 桌面插件，为小学六年级 OI 选手（麒麒）与家长提供可视化学习控制台 + 物理只读防偷懒角色隔离：

## 核心能力
1. **原生侧边栏入口与三视图工作台**（`client.js`）：
   - **今日训练台**：实时 `21:15` 夜间疲劳护盾 + 新题快速投喂框（`没思路` / `WA` / `TLE` / `RE` / `AC复盘` 五键直达）+ 清洗去重后的近期待补题墙（每题一键拉起「思路搭桥 / 排错诊所 / 3 秒存秘籍」）；
   - **数学实验 & 错题本**：5 张内置纯手算「六年级数学微卡片」（即时判分 + 标准术语挂牌）+ 每周「隔月旧题冷启动重斩」队列 + `mistakes/` 通关秘籍墙；
   - **四平台成长档案**：Argon 3 大防作弊指标看板（近 30 天失控连交率、零 CE 底线、`21:15` 深夜提交警报）+ 四平台一键同步 + 档案弹窗直读。
2. **物理权限隔离角色（`cordis.patch.yml`）**：
   - `oi-coach`（麒麒 OI 教练）：`tool-fs` 物理只读（`write/edit/applyPatch: false`）、无 Shell 写权限，仅可通过受控工具 `save_mistake_card` 往 `mistakes/` 写入错题卡，彻底杜绝替改源码。
   - `oi-parent`（OI 家长教研官）：供家长端做四维诊断、周报生成与讲义入库。
3. **本机挂载方式**：
   - Mac mini 已通过 `link:` 挂载至 `~/.dsh/profiles/desktop/package.json` 与 `node_modules/dsh-oi-coach`，重启 DeepSeek Harness 桌面版即可在左侧栏看到「OI学习台」。
