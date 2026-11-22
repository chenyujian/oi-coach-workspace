#!/usr/bin/env python3
"""
零依赖拉取 Codeforces 公开提交记录（基于 Codeforces 官方 API）。
适用于在 Mac mini 后台手动或定时运行，将提交记录与近期汇总保存到
training/sync_logs/，供 AI 教练在周报诊断时读取。

用法：
    python3 scripts/fetch_codeforces.py --handle <Codeforces用户名> [--count 200] [--days 14]
"""

import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

API_BASE = "https://codeforces.com/api/user.status"
REPO_ROOT = Path(__file__).resolve().parent.parent
SYNC_DIR = REPO_ROOT / "training" / "sync_logs"


def fetch_submissions(handle: str, count: int) -> list[dict]:
    query = urllib.parse.urlencode({"handle": handle, "from": 1, "count": count})
    url = f"{API_BASE}?{query}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "oi-coach-workspace-sync/1.0"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if data.get("status") != "OK":
        raise RuntimeError(f"Codeforces API 返回异常: {data.get('comment', data)}")
    return data.get("result", [])


def load_existing(json_path: Path) -> list[dict]:
    if not json_path.exists():
        return []
    with json_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def problem_key(sub: dict) -> str:
    prob = sub.get("problem", {})
    cid = prob.get("contestId", "")
    idx = prob.get("index", "")
    name = prob.get("name", "")
    return f"{cid}{idx} ({name})" if cid else name


def save_summary(handle: str, submissions: list[dict], days: int, md_path: Path) -> None:
    now_ts = int(time.time())
    cutoff = now_ts - days * 86400
    recent = [s for s in submissions if s.get("creationTimeSeconds", 0) >= cutoff]
    recent.sort(key=lambda x: x.get("creationTimeSeconds", 0), reverse=True)

    verdicts = Counter(s.get("verdict", "UNKNOWN") for s in recent)
    ac_set = {problem_key(s) for s in recent if s.get("verdict") == "OK"}
    non_ac_only = sorted({problem_key(s) for s in recent if s.get("verdict") != "OK"} - ac_set)

    tag_counter: Counter[str] = Counter()
    for s in recent:
        if s.get("verdict") != "OK":
            for t in s.get("problem", {}).get("tags", []):
                tag_counter[t] += 1

    lines = [
        f"# Codeforces 提交记录自动汇总（`{handle}`）",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **统计窗口**：最近 {days} 天",
        f"- **总提交数**：{len(recent)} 次（本地累计保存 {len(submissions)} 次）",
        f"- **结果分布**：" + (", ".join(f"`{k}`: {v}" for k, v in verdicts.most_common()) or "无"),
        f"- **窗口内 AC 题数**：{len(ac_set)} 题",
        f"- **窗口内尝试过但未 AC 题数**：{len(non_ac_only)} 题",
    ]
    if tag_counter:
        top_tags = ", ".join(f"`{t}`({c})" for t, c in tag_counter.most_common(6))
        lines.append(f"- **非 AC 提交高频标签**：{top_tags}")
    lines.append("")

    if non_ac_only:
        lines.append("## 近期未 AC 题目（重点关注）")
        for p in non_ac_only:
            lines.append(f"- {p}")
        lines.append("")

    lines.append("## 近期提交明细（最多显示 40 条）")
    lines.append("")
    lines.append("| 时间 | 题目 | 难度分 | 结果 | 语言 | 标签 |")
    lines.append("| :--- | :--- | :---: | :---: | :--- | :--- |")
    for s in recent[:40]:
        dt = datetime.fromtimestamp(s["creationTimeSeconds"], tz=timezone.utc).astimezone()
        prob = s.get("problem", {})
        rating = prob.get("rating", "-")
        tags = ", ".join(prob.get("tags", [])[:3])
        lines.append(
            f"| {dt.strftime('%Y-%m-%d %H:%M')} "
            f"| {problem_key(s)} "
            f"| {rating} "
            f"| `{s.get('verdict', '')}` "
            f"| {s.get('programmingLanguage', '')} "
            f"| {tags} |"
        )

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="增量拉取 Codeforces 公开提交记录")
    parser.add_argument("--handle", required=True, help="Codeforces 用户名（handle）")
    parser.add_argument("--count", type=int, default=200, help="单次拉取最近提交条数（默认 200）")
    parser.add_argument("--days", type=int, default=14, help="Markdown 汇总统计天数（默认 14 天）")
    args = parser.parse_args()

    SYNC_DIR.mkdir(parents=True, exist_ok=True)
    json_path = SYNC_DIR / f"codeforces_{args.handle}.json"
    md_path = SYNC_DIR / f"codeforces_{args.handle}_summary.md"

    existing = load_existing(json_path)
    by_id = {s["id"]: s for s in existing}

    try:
        latest = fetch_submissions(args.handle, args.count)
    except (urllib.error.URLError, RuntimeError) as e:
        raise SystemExit(f"[错误] 拉取失败: {e}") from e

    fetched_new = 0
    for item in latest:
        if item["id"] not in by_id:
            by_id[item["id"]] = item
            fetched_new += 1

    all_subs = sorted(by_id.values(), key=lambda x: x.get("creationTimeSeconds", 0))
    json_path.write_text(json.dumps(all_subs, ensure_ascii=False, indent=2), encoding="utf-8")
    save_summary(args.handle, all_subs, args.days, md_path)

    print(f"✅ 同步完成：新增 {fetched_new} 条提交，总计 {len(all_subs)} 条。")
    print(f"📄 汇总已更新: {md_path}")


if __name__ == "__main__":
    main()
