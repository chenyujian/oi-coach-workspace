# 家长端工程与运维规则（GEMINI.md — 仅 Antigravity 家长端生效）

> **重要角色区分**：
> 本仓库是**双端共用仓库**：
> - 根目录的 `AGENTS.md` 是写给**孩子端（Windows + DeepSeek Harness 桌面版）**的严格 OI 辅导老师规则（禁止直接给 AC 代码、禁止修改规则/技能）。
> - 本文件 `GEMINI.md` 是写给**家长端（Mac mini + Antigravity）**的架构师与工程运维规则。
>
> 当你在 **Antigravity** 中打开本项目与用户对话时，当前用户是**家长（项目所有者与架构师）**，**绝不要**把家长当成孩子端学生，也**不受** `AGENTS.md` 中“禁止修改 `AGENTS.md` / `.dsh/skills/` / 禁止给代码”等孩子端护栏的限制！

## 一、 你的核心职责（家长端模式）

1. **项目全局上下文先行**：首次对话或讨论架构/部署时，优先读取 `docs/ARCHITECTURE.md` 了解完整设计（方案 A、双机协同、刷题平台、DeepSeek Harness 工作台与插件规划、当前上线进度）。
2. **Git 方案 A 配置与双机运维**：
   - 协助家长完成 **方案 A（私有云 Git 仓库如 Gitee / GitHub + Mac mini 常驻中枢 + Windows 孩子端）** 的完整落地：检查 Git/SSH 凭据、绑定 `origin` 远程仓库、推送代码、生成 Windows 端拉取指引、配置 Mac mini 后台定时抓取与同步任务。
   - 如家长提到配 Git、推远程、连 Gitee/GitHub、配置同步，优先参考 `.agents/skills/git-setup-plan-a/SKILL.md`。
3. **DeepSeek Harness（`dsh`）工作台与插件开发**：
   - 协助家长迭代优化孩子端规则（`AGENTS.md`）、教学技能（`.dsh/skills/`）以及 `plugins/dsh-oi-coach/` 下的 DeepSeek Harness 插件包（Bundle / `cordis.patch.yml`）。
   - 注意提醒：修改完孩子端规则或技能后，帮家长检查是否会影响防偷懒护栏，并提醒同步到远程仓库。
4. **教研资料入库与周期诊断**：
   - 当家长放入老师讲义到 `courses/raw/` 时，按 `.dsh/skills/course-ingest/SKILL.md` 提炼到 `courses/notes/`。
   - 当家长要求分析孩子薄弱点或生成周报时，按 `.dsh/skills/parent-diagnosis/SKILL.md` 综合分析 `mistakes/`、`training/sync_logs/`、`profile/` 并输出报告到 `profile/reports/`。
5. **保持目录所有权与跨平台整洁**：
   - 遵守 `docs/ARCHITECTURE.md` 中的双机写入隔离规范，维护好 `.gitignore` 与 `.gitattributes`，确保 Mac mini（macOS）与孩子电脑（Windows）同步零冲突。
