# OI AI 教练工作台 — 总体架构与方案 A 实施蓝图

本文档记录本项目的核心架构决策、双端协同机制、DeepSeek Harness 适配方案与上线进度，供家长端新对话快速对齐上下文。

---

## 一、 总体目标与硬件分工

构建一个**教研（家长）与学习（孩子）分离、数据云端同步、具备长期记忆的 C++ 信息学奥赛 AI 辅导与诊断平台**：

- **家长端（Mac mini，常年开机）**：
  - 使用 **Antigravity** 打开本工作区（自动加载 `GEMINI.md` 进入**架构师/教研运维模式**）。
  - 负责：维护教学规则（`AGENTS.md`）、教学技能（`.dsh/skills/`）、DSH 插件包（`plugins/dsh-oi-coach/`）、Git 方案 A 运维、录入老师讲义（`courses/`）、后台定时拉取公开 OJ 提交记录、生成多维弱点诊断报告（`profile/reports/`）。
- **孩子端（Windows 电脑）**：
  - **写代码**：使用纯净 C++ 编辑器（不开启 AI 自动补全的 VS Code / CP Editor / Dev-C++），代码保存在 `training/`，保持考场手写手感。
  - **AI 教练辅导**：使用 **DeepSeek Harness 桌面版** 打开本工作区（自动加载 `AGENTS.md` + `.dsh/skills/`，不加载 `GEMINI.md`），严格执行苏格拉底式五级启发、最小 Hack 反例排错、2 分钟复盘归档。
- **日常刷题平台**：AtCoder、Codeforces、洛谷、机构内部 OJ。

---

## 二、 为什么同一份仓库能实现“双端不同人格与权限”？

| 客户端 | 使用者 | 自动加载的规则入口 | 生效角色 |
| :--- | :--- | :--- | :--- |
| **Antigravity**（Mac mini） | 家长 | `GEMINI.md`（优先于/覆盖孩子端限制）+ `.agents/skills/` | 架构师、开发者、Git 运维、教研诊断助手 |
| **DeepSeek Harness**（Windows） | 孩子 | `AGENTS.md` + `.dsh/skills/`（及可选 `plugins/dsh-oi-coach/`） | 严格受限的 OI 教练（绝不直接给 AC 代码、不可改规则与技能） |

---

## 三、 远程协同架构：方案 A（私有云 Git + Mac mini 常驻中枢）

### 核心链路
```text
[家长 Mac mini] <---> [私有云 Git 仓库 (Gitee / GitHub Private)] <---> [孩子 Windows]
  (Antigravity +                                                         (DeepSeek Harness +
   后台定时脚本)                                                           桌面一键同步脚本)
```

### 防冲突目录所有权约定
- **家长主写 / 孩子只读**：`GEMINI.md`、`AGENTS.md`、`docs/`、`.agents/`、`.dsh/skills/`、`plugins/`、`courses/`、`scripts/`、`profile/reports/`
- **孩子端（AI）主写 / 家长只读**：`training/`、`mistakes/`（强制一题一文件：`YYYY-MM-DD-<platform>-<id>.md`）
- **增量共享**：`profile/habits_and_bugs.md`、`profile/skill_matrix.md`、`profile/student_profile.md`

---

## 四、 DeepSeek Harness 工作区与插件体系说明

本项目同时支持两种 DeepSeek Harness 接入层次，按需渐进演进：
1. **Workspace 级即用层（当前已就绪）**：
   - DeepSeek Harness 桌面版选中本仓库作为 Workspace 后，原生发现 `AGENTS.md` 与 `.dsh/skills/*/SKILL.md`，零额外安装即可运行 5 套核心教学与复盘技能。
2. **标准 DSH 插件包层（`plugins/dsh-oi-coach/`，骨架已预置）**：
   - 当需要更深度的 Harness 运行时控制（例如工具权限沙箱拦截、自动在启动/退出时触发 Git 同步钩子、自定义 UI 面板或 Cordis 服务注入、MCP 数据源挂载）时，在 `plugins/dsh-oi-coach/` 下基于 `package.json`（`dsh.bundle`）+ `cordis.patch.yml` 扩展为标准 DeepSeek Harness 插件。

---

## 五、 方案 A 上线进度 Checklist

- [x] 本地工作区目录骨架搭建（`AGENTS.md`、5 个 `.dsh/skills/`、`profile/`、`mistakes/`、`training/`、`courses/`）
- [x] 跨平台配置（`.gitignore`、`.gitattributes`、Mac/Windows 同步脚本、AtCoder/Codeforces 抓取脚本）
- [x] 双端规则隔离（`GEMINI.md` 家长端架构师模式 vs `AGENTS.md` 孩子端严格教练模式）与 DSH 插件骨架
- [x] 本地 Git 仓库初始化（`main` 分支）
- [x] 已在 GitHub 创建私有远程仓库（`git@github.com:chenyujian/oi-coach-workspace.git`），并在 Mac mini 上绑定 `origin` 完成首次 `git push`
- [ ] **待完成**：在孩子 Windows 电脑完成 `git clone`、桌面放置“学习同步”快捷方式，并用 DeepSeek Harness 桌面版实测一轮对话
- [ ] **待完成**：（可选）在 `profile/student_profile.md` 填入平台账号，并在 Mac mini 上配置 `launchd` / `cron` 定时拉取 AtCoder / Codeforces 并自动同步
- [ ] **待完成**：（按需）基于实际体验完善 `plugins/dsh-oi-coach/` 插件功能（如自动同步钩子、权限护栏或面板）
