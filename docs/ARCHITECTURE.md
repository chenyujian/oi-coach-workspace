# OI AI 教练工作台 — 总体架构与方案 A 实施蓝图

本文档记录本项目的核心架构决策、双端权限隔离机制、数据流与上线状态，供家长端新对话快速对齐全局上下文。

---

## 一、 总体目标与双端分工

构建一个**教研（家长）与学习（孩子）分离、双机云端同步、具备长期记忆与物理防偷懒护栏的 C++ 信息学奥赛 AI 代数建模辅导平台**：

- **家长端（Mac mini，常驻中枢）**：
  - 使用 **Antigravity** 打开本工作区（自动加载 `GEMINI.md` 进入架构师/教研模式）+ **DeepSeek Harness** 实测验收。
  - 负责：维护教学规则（`AGENTS.md`）、5 个专项技能（`.dsh/skills/`）、原生插件（`plugins/dsh-oi-coach/`）、讲义精炼入库（`courses/notes/`）、四平台提交同步与时间线重建、阶段性四维诊断报告（`profile/reports/`）。
- **孩子端（Windows 电脑）**：
  - **AI 建模辅导**：使用 **DeepSeek Harness 桌面版**（挂载 `dsh-oi-coach` 插件 + 可选本机 `agy` CLI 专家外脑），严格执行与任衍硕老师课堂同频的「任氏建模 5 步锁步」（不给 AC 代码、不提前剧透解法、不设作息时间打断）。
  - **手写代码**：使用不开启 AI 自动补全的纯净 C++ 编辑器，保持考场手写手感。
- **四大日常训练平台**：信奥李拜天 OJ（UID `79`）、洛谷（`qiq2015`）、好吧平台（UID `957`）、AtCoder（`chenyanxu`）。

---

## 二、 三层双端人格与物理权限隔离

| 层次 | 家长端（macOS） | 孩子端（Windows） | 隔离实现机制 |
| :--- | :--- | :--- | :--- |
| **1. IDE 规则层** | Antigravity 加载 `GEMINI.md`（架构师权限） | DeepSeek Harness 仅加载 `AGENTS.md` + `.dsh/skills/` | 客户端入口文件分离 |
| **2. DSH Preset 层** | 同时可见 `oi-coach` 与 `oi-parent` | 物理禁用 `preset-oi-parent`（`disabled: !!js process.platform !== 'darwin'`），`oi-coach` 文件系统物理只读且禁 `bash` | `cordis.patch.yml` 硬件级权限锁 |
| **3. `agy` 外脑直连层** | 输入 `.env.local` 中的 `OI_PARENT_PIN` 可开启家长教研模式 | 强制锁死 `coach` 模式，运行于仓外隔离目录 `os.tmpdir()/oi-coach-child-isolated`（绝不加载 `GEMINI.md`），且拦截读取/篡改任何 `parent` 历史记录（`403`） | `plugins/dsh-oi-coach/index.js` 服务端硬锁 |

---

## 三、 数据流与双机防冲突设计

```text
[四平台 OJ] ──(scripts/fetch_*.py)──> training/sync_logs/*.json
                                            │
                            (scripts/build_timeline.py)
                                            ▼
                     profile/activity_timeline.md & solved_timeline.md
                                            │
                       (scripts/cache_problem_context.py --incremental)
                                            ▼
                         training/problem_cache/<plat>_<pid>.json
                                            │
[家长 Mac mini] <─── GitHub Private (origin/main) ───> [孩子 Windows · OI学习台]
```

### 防冲突文件粒度约定
- **独立单文件落盘（零合并冲突）**：
  - 教练室历史对话：`training/chat_history/YYYY-MM-DD-<id>.json`
  - 错题通关秘籍卡：`mistakes/YYYY-MM-DD-<platform>-<slug>.md`
  - 课程讲义笔记：`courses/notes/YYYY-MM-DD-<topic>.md`（原始大体积 `courses/raw/*.pdf` 已在 `.gitignore` 忽略）
- **本机私有凭据（绝不入 Git）**：`.env.local`（`600` 权限，存 `HAOBA_USERNAME` / `HAOBA_PASSWORD` / `OI_PARENT_PIN`）。

---

## 四、 上线进度与演进状态

- [x] 本地工作区骨架、`AGENTS.md`（任氏建模 5 步锁步）与 5 个 `.dsh/skills/`
- [x] GitHub 私有远程仓库绑定（`git@github.com:chenyujian/oi-coach-workspace.git`）与 Mac/Windows 同步脚本
- [x] 四平台全量基线拉取、跨站同题去重时间线（`build_timeline.py`）与未过题题面增量缓存（`cache_problem_context.py`）
- [x] 6 课交互式「OI 读题与建模训练营」（`courses/math_lab/index.html`）
- [x] 任衍硕老师建模心法总纲（`00-ren-teacher-modeling-playbook.md`）+ 全部 20 场普及模拟赛与 ABC 讲义结构化入库（共 21 份 `courses/notes/*.md`）
- [x] 原生 `dsh-oi-coach` 四空间插件（全屏教练室 + 对应讲义联动 + 历史对话续聊 + 一键存秘籍卡 + 任氏十大建模抓手快练 + Windows 全兼容）
- [x] 16 项端到端自动化门禁测试（`scripts/test_oi_coach.mjs`）与 `GEMINI.md` 研发质量门禁
- [ ] **待推进**：在孩子 Windows 电脑实装验收，并按需补充“3~7 天无提示盲重做”打卡状态与洛谷增量抓取脚本
