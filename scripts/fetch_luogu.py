#!/usr/bin/env python3
"""
只读增量同步 洛谷（Luogu，https://www.luogu.com.cn/）学生提交记录。
安全与合规约定（严格遵守系统准则）：
  - 绝不绕过或自动识别任何图形验证码（CAPTCHA）；
  - 仅读取 .env.local 中的 LUOGU_COOKIE（如 `_uid=1346216; __client_id=...`）或本机 Chrome 已登录的洛谷会话 Cookie；
  - 若会话未登录或已过期，输出友好状态提示并安全退出（不阻断其他三平台定时同步）。

用法：
    python3 scripts/fetch_luogu.py [--uid 1346216] [--user qiq2015] [--max-pages 5]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

REPO_ROOT = Path(__file__).resolve().parent.parent
SYNC_DIR = REPO_ROOT / "training" / "sync_logs"

DIFF_MAP = {
    0: ("grey", "暂无评定"),
    1: ("red-1", "入门(红)"),
    2: ("orange-2", "普及-(橙)"),
    3: ("gold-3", "普及(黄)"),
    4: ("green-3", "普及+/提高-(绿)"),
    5: ("blue-4", "提高(蓝)"),
    6: ("purple-5", "提高+/省选-(紫)"),
    7: ("black-6", "NOI/CTSC(黑)"),
}

LUOGU_STATUS = {
    0: "Waiting",
    1: "Judging",
    2: "CE",
    3: "OLE",
    4: "MLE",
    5: "TLE",
    6: "WA",
    7: "RE",
    12: "AC",
    14: "Unaccepted",
    21: "UKE",
}


def parse_env_value(raw: str) -> str:
    val = raw.strip()
    if len(val) >= 2 and ((val[0] == '"' and val[-1] == '"') or (val[0] == "'" and val[-1] == "'")):
        return val[1:-1]
    if " #" in val:
        val = val.split(" #", 1)[0].strip()
    return val


def load_env_local() -> dict[str, str]:
    env_vars = dict(os.environ)
    env_file = REPO_ROOT / ".env.local"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            key = k.strip()
            if key.startswith("export "):
                key = key[7:].strip()
            if key:
                env_vars.setdefault(key, parse_env_value(v))
    return env_vars


def read_luogu_chrome_cookie(profile: str = "Default") -> str:
    if sys.platform != "darwin":
        return ""
    db = Path.home() / "Library/Application Support/Google/Chrome" / profile / "Cookies"
    if not db.exists():
        return ""
    try:
        from Crypto.Cipher import AES  # type: ignore
        from Crypto.Util.Padding import unpad  # type: ignore
    except Exception:
        return ""
    try:
        password = (
            subprocess.check_output(
                ["security", "find-generic-password", "-w", "-s", "Chrome Safe Storage"],
                stderr=subprocess.DEVNULL,
                timeout=10,
            )
            .decode()
            .strip()
        )
    except Exception:
        return ""

    with tempfile.NamedTemporaryFile(prefix="luogu-cookies-", suffix=".db", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        shutil.copyfile(db, tmp_path)
        con = sqlite3.connect(tmp_path)
        rows = con.execute(
            "select host_key, name, value, encrypted_value from cookies where host_key like '%luogu.com.cn'"
        ).fetchall()
    finally:
        tmp_path.unlink(missing_ok=True)

    pairs: list[str] = []
    for host, name, value, encrypted_value in rows:
        if name not in {"_uid", "__client_id", "C3VK"}:
            continue
        if value:
            val = value
        elif encrypted_value.startswith((b"v10", b"v11")):
            key = hashlib.pbkdf2_hmac("sha1", password.encode(), b"saltysalt", 1003, 16)
            plain = unpad(AES.new(key, AES.MODE_CBC, b" " * 16).decrypt(encrypted_value[3:]), 16)
            host_hash = hashlib.sha256(host.encode()).digest()
            if plain.startswith(host_hash):
                plain = plain[len(host_hash) :]
            val = plain.decode("utf-8", "ignore")
        else:
            val = encrypted_value.decode("utf-8", "ignore")
        if val:
            pairs.append(f"{name}={val}")
    return "; ".join(pairs)


def resolve_luogu_cookie(cli_cookie: str | None = None) -> str:
    if cli_cookie:
        return cli_cookie.strip()
    env_vars = load_env_local()
    c = env_vars.get("LUOGU_COOKIE", "").strip()
    if c:
        return c
    return read_luogu_chrome_cookie()


def rebuild_summary(user: str, uid: int, records: list[dict], md_path: Path) -> None:
    verdicts = Counter(str(r.get("status") or "Unaccepted") for r in records)
    by_pid: dict[str, list[dict]] = {}
    for r in records:
        prob = r.get("problem") or {}
        pid = str(prob.get("pid") or "")
        if pid:
            by_pid.setdefault(pid, []).append(r)

    ac_probs: dict[str, dict] = {}
    unsolved_rows: list[tuple[str, str, str, str, int, int]] = []
    for pid, recs in by_pid.items():
        has_ac = any(x.get("status") == "AC" for x in recs)
        pinfo = recs[0].get("problem") or {}
        if has_ac:
            ac_probs[pid] = pinfo
        else:
            latest_ts = max(str(x.get("submitTime") or "") for x in recs)[:16].replace("T", " ")
            best_sc = max((int(x.get("score") or 0) for x in recs), default=0)
            unsolved_rows.append(
                (
                    latest_ts,
                    pid,
                    str(pinfo.get("title") or pid),
                    str(pinfo.get("difficultyLabel") or "未知"),
                    len(recs),
                    best_sc,
                )
            )

    diff_cnt = Counter(str(p.get("difficultyLabel") or "未知") for p in ac_probs.values())
    unsolved_rows.sort(key=lambda x: x[0], reverse=True)
    all_ts = sorted(str(r.get("submitTime") or "") for r in records if r.get("submitTime"))
    span = f"`{all_ts[0][:16].replace('T', ' ')}` 至 `{all_ts[-1][:16].replace('T', ' ')}`" if all_ts else "无"

    lines = [
        f"# 洛谷（Luogu）全量提交汇总（`{user}` / UID `{uid}`）",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **主页链接**：https://www.luogu.com.cn/user/{uid}",
        f"- **全量提交数**：**{len(records)}** 条（时间跨度：{span}）",
        f"- **尝试 / 通过**：尝试独立题 **{len(by_pid)}** 道，已 AC **{len(ac_probs)}** 道，未 AC **{len(unsolved_rows)}** 道",
        "- **结果分布**：" + ", ".join(f"`{k}`: {v}" for k, v in verdicts.most_common()),
        "",
        "## 一、已通过题目难度分布",
        "",
        "| 难度 | 已过题数 |",
        "| :--- | ---: |",
    ]
    for label in ("入门(红)", "普及-(橙)", "普及(黄)", "普及+/提高-(绿)", "提高(蓝)", "提高+/省选-(紫)", "NOI/CTSC(黑)"):
        if diff_cnt.get(label):
            lines.append(f"| {label} | {diff_cnt[label]} |")

    lines.extend(
        [
            "",
            f"## 二、尝试过但尚未 AC 题目（共 {len(unsolved_rows)} 题，按最近尝试时间倒序）",
            "",
            "| 最近尝试时间 | 题号 | 题目 | 难度 | 尝试次数 | 最高分 |",
            "| :--- | :--- | :--- | :--- | :---: | ---: |",
        ]
    )
    for ts, pid, title, dlabel, cnt, bsc in unsolved_rows:
        lines.append(f"| {ts} | `{pid}` | {title} | {dlabel} | {cnt} | {bsc} |")

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="增量同步洛谷提交记录（需有效已登录会话 Cookie）")
    parser.add_argument("--uid", type=int, default=1346216)
    parser.add_argument("--user", default="qiq2015")
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument("--cookie", default="")
    args = parser.parse_args()

    rec_path = SYNC_DIR / f"luogu_{args.user}_records.json"
    md_path = SYNC_DIR / f"luogu_{args.user}_summary.md"
    existing: list[dict] = json.loads(rec_path.read_text(encoding="utf-8")) if rec_path.exists() else []
    by_id: dict[str, dict] = {str(r.get("id")): r for r in existing if r.get("id")}

    cookie = resolve_luogu_cookie(args.cookie)
    if not cookie or "_uid=" not in cookie:
        print("ℹ️ [Luogu] 未检测到已登录 Cookie（可在 Mac Chrome 登录洛谷或在 .env.local 配置 LUOGU_COOKIE），本次跳过增量抓取，保留现有基线。")
        return 0

    opener = urllib.request.build_opener()
    added = 0
    for page in range(1, args.max_pages + 1):
        url = f"https://www.luogu.com.cn/record/list?user={args.uid}&page={page}&_contentOnly=1"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "x-luogu-type": "content-only",
                "x-lentille-request": "content-only",
                "Referer": f"https://www.luogu.com.cn/user/{args.uid}",
                "Cookie": cookie,
            },
        )
        try:
            with opener.open(req, timeout=20) as resp:
                raw_text = resp.read().decode("utf-8", "ignore")
        except Exception as exc:
            print(f"ℹ️ [Luogu] 请求返回异常（可能登录态已过期：{exc}），本次跳过。")
            return 0

        try:
            payload = json.loads(raw_text)
        except Exception:
            print("ℹ️ [Luogu] 登录会话已过期或需要重新登录浏览器，本次安全跳过（不触碰验证码）。")
            return 0

        if payload.get("code") not in (None, 200) or payload.get("currentTemplate") == "AuthLogin":
            print("ℹ️ [Luogu] 登录会话已过期或未授权，本次安全跳过，保留现有记录。")
            return 0

        records_obj = ((payload.get("currentData") or payload.get("data") or {}).get("records") or {})
        items = records_obj.get("result") or []
        if not items:
            if page == 1:
                print("ℹ️ [Luogu] 未返回提交列表（可能需要刷新浏览器洛谷登录态），保留现有记录。")
                return 0
            break

        hit_known = False
        for it in items:
            rid = str(it.get("id") or "")
            if not rid:
                continue
            if rid in by_id:
                hit_known = True
                continue
            ep = int(it.get("submitTime") or 0)
            dt = datetime.fromtimestamp(ep, tz=timezone.utc).astimezone() if ep else datetime.now().astimezone()
            st_code = int(it.get("status") if it.get("status") is not None else 14)
            st_str = LUOGU_STATUS.get(st_code, "Unaccepted")
            prob = it.get("problem") or {}
            d_num = int(prob.get("difficulty") or 0)
            d_key, d_label = DIFF_MAP.get(d_num, ("grey", "未知"))
            tm_ms = it.get("time")
            mem_kb = it.get("memory")
            by_id[rid] = {
                "id": rid,
                "submitTime": dt.isoformat(timespec="seconds"),
                "rawSubmitTime": dt.strftime("%m-%d %H:%M:%S"),
                "status": "AC" if st_str == "AC" else ("CE" if st_str == "CE" else ("UKE" if st_str == "UKE" else "Unaccepted")),
                "rawStatus": st_str,
                "score": it.get("score"),
                "time": f"{tm_ms}ms" if tm_ms is not None else "-",
                "memory": f"{round(mem_kb / 1024, 2)}MB" if isinstance(mem_kb, (int, float)) else "-",
                "language": str(it.get("sourceCodeLanguage") or "C++"),
                "problem": {
                    "difficulty": d_key,
                    "pid": str(prob.get("pid") or ""),
                    "title": str(prob.get("title") or ""),
                    "type": str(prob.get("type") or "P"),
                    "difficultyLabel": d_label,
                },
            }
            added += 1

        if hit_known or len(items) < 20:
            break
        time.sleep(0.25)

    if added == 0 and rec_path.exists() and md_path.exists():
        print(f"ℹ️ [Luogu] 无新增提交（累计 {len(by_id)} 条）。")
        return 0

    merged = sorted(by_id.values(), key=lambda x: str(x.get("submitTime") or ""), reverse=True)
    SYNC_DIR.mkdir(parents=True, exist_ok=True)
    rec_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    rebuild_summary(args.user, args.uid, merged, md_path)
    print(f"✅ [Luogu] 增量同步完成：新增 {added} 条，累计 {len(merged)} 条！")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
