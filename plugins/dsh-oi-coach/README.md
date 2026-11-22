# `dsh-oi-coach` — DeepSeek Harness 插件骨架

本目录用于承接从“工作区级 Skills（`.dsh/skills/`）”向“标准 DeepSeek Harness 插件包（`dsh.bundle`）”的演进。

## 为什么现在先用 `.dsh/skills/` + 预留本插件骨架？

1. **零门槛立即可用**：DeepSeek Harness 桌面版打开仓库根目录后，已能直接加载 `AGENTS.md` 与 `.dsh/skills/` 的全部教学技能，无需编译或安装插件即可开始辅导。
2. **随时升级运行时能力**：当后续需要以下**超越纯 Prompt/Skill 的底层能力**时，可直接在本目录实现 `index.js` 并通过 `cordis.patch.yml` 挂载到 DSH Profile（`~/.dsh/profiles/<name>/`）：
   - **硬性文件写权限拦截**：在工具层直接拒绝修改 `AGENTS.md`、`.dsh/skills/` 和 `training/**/*.cpp`，比纯提示词护栏更彻底；
   - **会话生命周期自动 Git 同步**：打开工作台自动 `git pull`，结束会话自动 `git commit && git push`，连双击脚本都省掉；
   - **自定义侧边栏/数据工具**：直接把 `profile/habits_and_bugs.md`、OJ 抓取器或对拍运行器封装为原生插件工具。
