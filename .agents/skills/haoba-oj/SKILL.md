---
name: haoba-oj
description: 在家长端（Mac mini）同步好吧平台（https://haoba.vip/，Hydro 架构）的课程、26秋PJ模拟赛、作业提交记录，或拉取单题历史 .cpp 提交版本做四维错题归因时使用。
---

# 好吧平台 OJ 数据同步与错题分析技能（haoba-oj）

本技能仅限**家长端（Mac mini）只读分析**使用：拉取好吧平台（`https://haoba.vip/`，主域 `/d/cpptrain/` 及历史域 `/d/Cpp2023/`）的课程进度、模拟赛成绩、提交记录与逐版 `.cpp` 代码，辅助定位麒麒的数学建模与调试习惯问题。

> [!CAUTION]
> **安全与只读铁律**
> 1. 严禁向 `haoba.vip` 提交代码、修改账号设置或发帖，仅做只读抓取。
> 2. 账号密码**只允许保存在工作区根目录的 `.env.local`**（已在 `.gitignore` 中忽略，权限 `600`），**绝不允许**把明文密码写入任何脚本、Markdown 笔记、Skill 或 Git 提交中。
> 3. 如果某次登录遇到人机校验/验证码，脚本会自动停止，此时改由家长在浏览器中手动登录，绝不绕过验证。

## 前置凭据配置（仅需一次）

在工作区根目录确认存在 `.env.local`（不要纳入 Git）：

```bash
HAOBA_USERNAME=<用户名>
HAOBA_PASSWORD=<密码>
```

## 场景一：全量同步课程、模拟赛与提交记录

在工作区根目录执行（零第三方依赖，系统 `python3` 即可运行）：

```bash
python3 scripts/fetch_haoba.py sync --domains cpptrain,Cpp2023 --days 60
```

产出文件（自动写入 `training/sync_logs/`）：
- `haoba_uid957_summary.md`：家长和 AI 教练优先阅读的结构化汇总（近 25 场模拟赛/作业完成度、未满分题、近期未交题、高频摩擦标签、近 30 条提交明细）。
- `haoba_uid957_activities.json`：全部课程/作业/比赛明细与逐题得分。
- `haoba_uid957_records.json`：全量去重提交记录。

## 场景二：拉取单道题的题面与全部历史 `.cpp` 版本做深度复盘

当家长给出某道好吧题目链接（务必保留 `?tid=...` 参数以便关联对应模拟赛/课程记录）时运行：

```bash
python3 scripts/fetch_haoba.py problem "https://haoba.vip/d/cpptrain/p/5310?tid=6afabb40e725d44e22f640df"
```

产出目录：`training/oj/haoba-<pid>/`
- `problem.md`：题面与约束
- `records.json`：按时间顺序排列的分数与状态轨迹（如 `39 WA -> 52 WA -> 100 AC`）
- `submissions/*.cpp`：每一次提交的源码快照

## 复盘分析清单（结合麒麒六年级画像）

读完 `problem.md`、`records.json` 与 `submissions/*.cpp` 后，按以下顺序提炼结论：
1. **分数与思路演进轨迹**：对比相邻两版代码的精确 Diff，看清孩子是“数学建模卡住”“边界漏判”“复杂度没算清”还是“改容器漏改联动处”。
2. **四维打标**：严格归类到 `math` / `algorithm` / `coding` / `habit`，并对照 `profile/habits_and_bugs.md` 检查是否命中历史老毛病（如连交盲改、未估复杂度）。
3. **沉淀入库**：如有典型教学价值，按 `mistakes/TEMPLATE.md` 在 `mistakes/` 下生成独立错题卡，并增量更新 `profile/habits_and_bugs.md` 与 `profile/skill_matrix.md`。
