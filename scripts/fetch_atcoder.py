#!/usr/bin/env python3
"""
零依赖拉取 AtCoder 公开提交记录（基于 Kenkoooo AtCoder Problems API）。
适用于在 Mac mini 后台手动或定时运行，将增量提交记录与近期汇总保存到
training/sync_logs/，供 AI 教练在周报诊断时读取。

用法：
    python3 scripts/fetch_atcoder.py --user <AtCoder用户名> [--days 14]
"""

import argparse
import gzip
import json
import time
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

API_BASE = "https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions"
REPO_ROOT = Path(__file__).resolve().parent.parent
SYNC_DIR = REPO_ROOT / "training" / "sync_logs"


def fetch_batch(user: str, from_second: int) -> list[dict]:
    url = f"{API_BASE}?user={user}&from_second={from_second}"
    req = urllib.request.Request(
        url,
        headers={
            "Accept-Encoding": "gzip",
            "User-Agent": "oi-coach-workspace-sync/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read()
        if resp.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
        return json.loads(raw.decode("utf-8"))


def load_existing(json_path: Path) -> list[dict]:
    if not json_path.exists():
        return []
    with json_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_summary(user: str, submissions: list[dict], days: int, md_path: Path) -> None:
    now_ts = int(time.time())
    cutoff = now_ts - days * 86400
    recent = [s for s in submissions if s.get("epoch_second", 0) >= cutoff]
    recent.sort(key=lambda x: x.get("epoch_second", 0), reverse=True)

    result_counts = Counter(s.get("result", "UNK") for s in recent)
    ac_problems = sorted({s["problem_id"] for s in recent if s.get("result") == "AC"})
    non_ac_only = sorted(
        {s["problem_id"] for s in recent if s.get("result") != "AC"} - set(ac_problems)
    )

    lines = [
        f"# AtCoder 提交记录自动汇总（`{user}`）",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **统计窗口**：最近 {days} 天",
        f"- **总提交数**：{len(recent)} 次（历史累计 {len(submissions)} 次）",
        f"- **结果分布**：" + (", ".join(f"`{k}`: {v}" for k, v in result_counts.most_common()) or "无"),
        f"- **窗口内 AC 题数**：{len(ac_problems)} 题",
        f"- **窗口内尝试过但未 AC 题数**：{len(non_ac_only)} 题",
        "",
    ]

    if non_ac_only:
        lines.append("## 近期未 AC 题目（重点关注）")
        for pid in non_ac_only:
            lines.append(f"- `{pid}`")
        lines.append("")

    lines.append("## 近期提交明细（最多显示 40 条）")
    lines.append("")
    lines.append("| 时间 | 比赛 | 题目 | 结果 | 语言 | 耗时(ms) |")
    lines.append("| :--- | :--- | :--- | :---: | :--- | ---: |")
    for s in recent[:40]:
        dt = datetime.fromtimestamp(s["epoch_second"], tz=timezone.utc).astimezone()
        lines.append(
            f"| {dt.strftime('%Y-%m-%d %H:%M')} "
            f"| `{s.get('contest_id', '')}` "
            f"| `{s.get('problem_id', '')}` "
            f"| `{s.get('result', '')}` "
            f"| {s.get('language', '')} "
            f"| {s.get('execution_time', '-')} |"
        )

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="增量拉取 AtCoder 公开提交记录")
    parser.add_argument("--user", required=True, help="AtCoder 用户名")
    parser.add_argument("--days", type=int, default=14, help="Markdown 汇总统计天数（默认 14 天）")
    args = parser.parse_args()

    SYNC_DIR.mkdir(parents=True, exist_ok=True)
    json_path = SYNC_DIR / f"atcoder_{args.user}.json"
    md_path = SYNC_DIR / f"atcoder_{args.user}_summary.md"

    existing = load_existing(json_path)
    by_id = {s["id"]: s for s in existing}
    from_second = max((s["epoch_second"] for s in existing), default=0)

    fetched_new = 0
    while True:
        try:
            batch = fetch_batch(args.user, from_second)
        except urllib.error.URLError as e:
            raise SystemExit(f"[错误] 网络请求失败: {e}") from e

        if not batch:
            break

        batch_new = 0
        for item in batch:
            if item["id"] not in by_id:
                by_id[item["id"]] = item
                batch_new += 1

        fetched_new += batch_new
        max_epoch = max(item["epoch_second"] for item in batch)
        if len(batch) < 500 or max_epoch < from_second:
            break
        from_second = max_epoch + 1
        time.sleep(1.1)  # 遵守 API 限速礼仪

    all_subs = sorted(by_id.values(), key=lambda x: x["epoch_second"])
    json_path.write_text(json.dumps(all_subs, ensure_ascii=False, indent=2), encoding="utf-8")
    save_summary(args.user, all_subs, args.days, md_path)

    print(f"✅ 同步完成：新增 {fetched_new} 条提交，总计 {len(all_subs)} 条。")
    print(f"📄 汇总已更新: {md_path}")


if __name__ == "__main__":
    main()
