# 信息学奥赛 AI 教练工作台框架（OI Coach Workspace）

这是一个**家长端（Mac mini 教研与诊断）与孩子端（Windows 刷题与辅导）双机协同**的信息学奥赛（C++）学习框架，基于 **方案 A（私有 Git 远程仓库 + Mac mini 常驻中枢）** 设计，原生适配 **DeepSeek Harness** 桌面工作台（同样兼容其他支持 `AGENTS.md` / Skills 的 Agent 工具）。

## 目录分工（防冲突设计）

| 目录 / 文件 | 主写端 | 作用 |
| :--- | :--- | :--- |
| `AGENTS.md` | 家长 | AI 教练核心铁律（苏格拉底启发、严禁直接给 AC 代码、反套话护栏） |
| `.dsh/skills/` | 家长 | 按场景触发的 5 个专项教学与诊断技能 |
| `courses/` | 家长 | 老师讲义原件（`raw/`）及提炼后的结构化笔记（`notes/`） |
| `training/` | 孩子 | 日常 C++ 练习代码（按平台/比赛建子目录）及自动拉取的 OJ 日志 |
| `mistakes/` | 孩子（AI 自动写） | 一题一档的结构化错题卡（按四维根因打标） |
| `profile/` | 双方协作 | 孩子档案、能力状态表、高频习惯/犯错库、家长周期诊断报告 |
| `scripts/` | 家长维护 | Windows/Mac 一键同步脚本、AtCoder 提交记录拉取脚本 |

## 方案 A 快速上线步骤

### 1. 创建私有远程仓库
在 **Gitee**（国内直连稳）或 **GitHub** 创建一个 **Private（私有）** 空仓库，例如 `oi-coach-workspace`。

### 2. Mac mini（家长端）首次关联推送
在本目录执行：
```bash
git remote add origin <你的私有仓库URL>
git branch -M main
git push -u origin main
```
日常更新完规则、讲义或看完周报后，执行 `./scripts/sync_mac.sh` 即可同步。

### 3. Windows（孩子端）首次配置
1. 安装 Git for Windows（安装时保持默认即可）与 DeepSeek Harness 桌面版。
2. 在合适路径克隆仓库：
   ```powershell
   git clone <你的私有仓库URL> oi-coach-workspace
   ```
3. 在 DeepSeek Harness 桌面版中将工作区（Workspace）指向 `oi-coach-workspace`。
4. 将 `scripts\sync_windows.bat` 创建快捷方式放到桌面，命名为 **“学习同步”**：
   - 每次开始学习前、结束后双击一次即可自动完成拉取与上传（零 Git 命令门槛）。
5. **重要提醒**：孩子写 C++ 请使用纯净编辑器（如不开启 AI 自动补全的 VS Code / CP Editor / Dev-C++），与 AI 工作台分离，保持考场手写代码手感。

### 4. Mac mini 后台定时任务（可选）
Mac mini 常年开机，可配置 `cron` 或 `launchd` 每晚自动执行：
1. `python3 scripts/fetch_atcoder.py --user <孩子AtCoderID>`（拉取 AtCoder 公开提交）
2. `python3 scripts/fetch_codeforces.py --handle <孩子CF用户名>`（拉取 Codeforces 公开提交与非 AC 高频标签）
3. `./scripts/sync_mac.sh "chore: nightly OJ sync"`（同步到远程仓库）

> 洛谷与机构内部 OJ 的训练代码放在 `training/luogu/` 与 `training/oj/`，孩子在工作台内复盘时由 `post-mortem` 技能自动归档到 `mistakes/`。
