# 信息学奥赛 AI 教练工作台（OI Coach Workspace）

这是一个**家长端（Mac mini 教研与诊断）与孩子端（Windows 刷题与代数建模辅导）双机协同**的信息学奥赛（C++）学习系统，基于 **方案 A（GitHub 私有仓库 + Mac mini 常驻中枢）** 构建，原生运行于 **DeepSeek Harness** 桌面版并支持官方 **Antigravity CLI（`agy`）** 专家外脑直连。

## 目录分工（双机零冲突隔离设计）

| 目录 / 文件 | 主写端 | 作用 |
| :--- | :--- | :--- |
| `GEMINI.md` / `.agents/` | 家长（Mac） | 家长端（Antigravity）架构师规则、研发质量门禁、Git 方案 A 与好吧 OJ 技能 |
| `docs/ARCHITECTURE.md` | 家长（Mac） | 总体架构蓝图、双端权限隔离说明与上线进度 |
| `AGENTS.md` / `.dsh/skills/` | 家长（Mac） | 孩子端核心铁律（「实战探索 + 数学搭桥 5 步法」、禁给 AC 代码、禁提前剧透）与 5 个专项技能 |
| `plugins/dsh-oi-coach/` | 家长（Mac） | DeepSeek Harness 原生工作台插件（4 独立空间 UI + 物理只读 Preset + `agy` 隔离外脑） |
| `courses/math_lab/` | 家长（Mac） | 6 课交互式「OI 读题与建模训练营」单文件实验网页与 A4 打印闯关单 |
| `courses/notes/` | 家长（Mac） | 任衍硕老师建模心法总纲（`00-*`）与 20 场讲义结构化笔记（未 AC 题带 `<details>` 防剧透折页；`raw/*.pdf` 不入 Git） |
| `training/chat_history/` | 双端独立新文件 | 教练室持久化历史对话（`YYYY-MM-DD-<id>.json`，一会话一文件，跨机无缝续聊） |
| `training/problem_cache/` | 家长同步脚本 | 未 AC 题的原题面与最新提交代码缓存（供教练室「看原题」与零工具直答注入） |
| `training/sync_logs/` | 家长同步脚本 | 四平台（信奥李拜天 / 洛谷 / 好吧 / AtCoder）提交记录与跨站去重时间线 |
| `mistakes/` | 孩子（受控落盘） | 一题一档的 3 行通关秘籍错题卡（`YYYY-MM-DD-<platform>-<slug>.md`） |
| `profile/` | 家长主维护 | 学生档案、高频失误库、能力状态矩阵、每周 10h 计划与周期诊断报告 |
| `scripts/` | 家长（Mac） | Mac/Windows 一键同步脚本、OJ 抓取与时间线合并脚本、`test_oi_coach.mjs` 自动化测试套件 |

## 日常使用与运维

### 1. 家长端（Mac mini）
- **开发与教研**：用 Antigravity 打开本仓库（自动加载 `GEMINI.md`），录入讲义、查看孩子同步上来的 `training/chat_history/` 与 `mistakes/`、生成阶段诊断。
- **本机敏感配置**：仅存于工作区根目录 `.env.local`（权限 `600`，已在 `.gitignore` 忽略）：
  - `HAOBA_USERNAME` / `HAOBA_PASSWORD`（好吧平台只读同步凭据）
  - `OILIBAITIAN_USERNAME` / `OILIBAITIAN_PASSWORD`（信奥李拜天 OJ 只读同步凭据）
  - `LUOGU_COOKIE`（可选，洛谷已登录会话 Cookie；Mac Chrome 已登录时可自动读取）
  - `OI_PARENT_PIN`（Mac 学习台切换 `oi-parent` 家长教研模式的口令）
- **后台定时四平台抓题**：`bash scripts/install_mac_oj_timer.sh` 安装 `launchd` 任务（每 2 小时自动执行 `scripts/auto_sync_ojs.py --git-push`，发现新刷题记录自动重建时间线、增量缓存题面并推送到云端）。
- **质量门禁与同步**：
  ```bash
  node scripts/test_oi_coach.mjs --skip-live-agy
  ./scripts/sync_mac.sh
  ```

### 2. 孩子端（Windows）
- **日常学习**：打开 DeepSeek Harness 桌面版 → 左侧栏进入「OI学习台」（Windows 下自动锁定孩子模式，物理隐藏家长工具与口令入口；**后台无感实时同步默认守护**：存秘籍卡 3 秒上云、对话停笔 45 秒自动备份、每 5 分钟拉取新讲义，顶栏 `☁️ 自动同步` 可随时查看状态或接收新升级提醒）：
  - **💬 教练室**：贴题或点待补题走「实战探索 + 数学搭桥 5 步法」，自动联动「📄 看原题」、「📚 对应讲义」与「🧑‍🏫 慢放拆解数学式」，聊完一键存秘籍卡；
  - **📋 题单**：挑近期待补题或隔月旧题冷启动重斩；
  - **🧮 建模练习**：做 6 课交互式建模实验、破冰基石 + 号家军 10 法 AI 快练（12 张卡）或 15 分钟手算微卡片；
  - **📚 错题与档案**：翻阅通关秘籍卡、《号家军建模与六年级搭桥总纲》与 20 场课堂讲义（支持一键点选题目开启「🧑‍🏫 慢放读懂数学推导」）。
- **手写代码分离**：C++ 代码使用不开启 AI 自动补全的纯净编辑器编写，保持考场真实手感。
