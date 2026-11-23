#!/usr/bin/env python3
"""
抓取并缓存近期未 AC 黄金题的「原题题面 + 麒麒最新提交 .cpp 代码」到 training/problem_cache/。
供 DeepSeek Harness「麒麒 OI 学习台」直连 Antigravity 教练时自动注入上下文，
让教练零工具调用即可直接看到原题面、数据范围与孩子写的真实代码。
"""

from __future__ import annotations

import html
import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
CACHE_DIR = WORKSPACE / "training" / "problem_cache"
sys.path.insert(0, str(WORKSPACE / "scripts"))


def detect_proxy() -> str:
    for k in ("HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"):
        if os.environ.get(k):
            return os.environ[k]
    if sys.platform == "darwin":
        try:
            out = subprocess.check_output(["scutil", "--proxy"], text=True, timeout=3)
            m_en = re.search(r"^\s*HTTPSEnable\s*:\s*1\b", out, re.M)
            m_host = re.search(r"^\s*HTTPSProxy\s*:\s*(\S+)", out, re.M)
            m_port = re.search(r"^\s*HTTPSPort\s*:\s*(\d+)", out, re.M)
            if m_en and m_host and m_port:
                return f"http://{m_host.group(1)}:{m_port.group(1)}"
        except Exception:
            pass
    return ""


def strip_html(raw: str) -> str:
    s = re.sub(r"<script[\s\S]*?</script>", "", raw, flags=re.I)
    s = re.sub(r"<style[\s\S]*?</style>", "", s, flags=re.I)
    s = re.sub(r"<(br|p|div|li|h[1-6]|pre|tr)\b[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def save_cache(key: str, payload: dict) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    out_path = CACHE_DIR / f"{key}.json"
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def cache_atcoder_problems(pids: list[str]) -> int:
    proxy = detect_proxy()
    handlers = [urllib.request.ProxyHandler({"http": proxy, "https": proxy})] if proxy else []
    opener = urllib.request.build_opener(*handlers)
    opener.addheaders = [("User-Agent", "Mozilla/5.0")]

    # Load local submission metadata for trajectories
    subs_by_pid: dict[str, list[dict]] = {}
    atc_path = WORKSPACE / "training" / "sync_logs" / "atcoder_chenyanxu.json"
    if atc_path.exists():
        raw = json.loads(atc_path.read_text(encoding="utf-8"))
        subs = raw.get("submissions", raw) if isinstance(raw, dict) else raw
        for s in subs:
            subs_by_pid.setdefault(s.get("problem_id", ""), []).append(s)

    ok = 0
    for pid in pids:
        contest = pid.split("_")[0]
        url = f"https://atcoder.jp/contests/{contest}/tasks/{pid}"
        try:
            page = opener.open(url, timeout=15).read().decode("utf-8", "ignore")
            m_title = re.search(r"<title>(.*?)</title>", page, re.S)
            title = html.unescape(m_title.group(1)).strip() if m_title else pid
            m_en = re.search(r'<span class="lang-en">([\s\S]*?)</span>\s*</span>', page)
            if not m_en:
                m_en = re.search(r'<div id="task-statement">([\s\S]*?)</div>\s*</div>', page)
            statement = strip_html(m_en.group(1)) if m_en else ""
            # Trim after Sample Output 2 to keep prompt compact
            if len(statement) > 3600:
                statement = statement[:3600] + "\n...(truncated)"

            psubs = sorted(subs_by_pid.get(pid, []), key=lambda x: x.get("epoch_second", 0))
            traj = "→".join(str(x.get("result", "?")) for x in psubs[-8:])
            payload = {
                "platform": "AtCoder",
                "pid": pid,
                "title": f"{pid} {title}",
                "url": url,
                "statement": statement,
                "attempts": len(psubs),
                "trajectory": traj,
                "latest_code": "",
                "note": "AtCoder 提交源码需登录后查看，题面与数据范围已自动拉取缓存。",
            }
            save_cache(f"atcoder_{pid}", payload)
            print(f"[AtCoder] cached {pid} ({title}) stmt={len(statement)} chars")
            ok += 1
        except Exception as e:
            print(f"[AtCoder] WARN {pid}: {e}")
    return ok


def cache_haoba_problems(pids: list[str]) -> int:
    try:
        import fetch_haoba as fh
    except Exception as e:
        print(f"[Haoba] import skipped: {e}")
        return 0

    try:
        username, password = fh.load_credentials()
        client = fh.HaobaClient(delay=0.1)
        client.login(username, password)
    except Exception as e:
        print(f"[Haoba] login skipped: {e}")
        return 0

    # Load existing records & activities to find tid + latest record id per pid
    recs_path = WORKSPACE / "training" / "sync_logs" / "haoba_uid957_records.json"
    acts_path = WORKSPACE / "training" / "sync_logs" / "haoba_uid957_activities.json"
    tid_by_pid: dict[str, str] = {}
    if acts_path.exists():
        for act in json.loads(acts_path.read_text(encoding="utf-8")):
            tid = str(act.get("docId") or act.get("_id") or "")
            for p in act.get("pids") or []:
                tid_by_pid.setdefault(str(p), tid)
    recs_by_pid: dict[str, list[dict]] = {}
    if recs_path.exists():
        for r in json.loads(recs_path.read_text(encoding="utf-8")):
            pid_s = str(r.get("pid", ""))
            recs_by_pid.setdefault(pid_s, []).append(r)
            if r.get("contest") and pid_s not in tid_by_pid:
                tid_by_pid[pid_s] = str(r.get("contest"))

    ok = 0
    for pid in pids:
        try:
            tid = tid_by_pid.get(str(pid), "")
            q_tid = f"?tid={tid}" if tid else ""
            pdata = client.get_json(f"/d/cpptrain/p/{pid}{q_tid}")
            pdoc = pdata.get("pdoc") or {}
            title = str(pdoc.get("title") or pid)
            content = str(pdoc.get("content") or "")
            if content.startswith("{"):
                try:
                    cobj = json.loads(content)
                    content = cobj.get("zh") or cobj.get("en") or next(iter(cobj.values()), content)
                except Exception:
                    pass
            if len(content) > 3600:
                content = content[:3600] + "\n...(truncated)"

            precs = sorted(recs_by_pid.get(str(pid), []), key=lambda x: str(x.get("judgeAt") or ""))
            latest_code = ""
            latest_verdict = ""
            latest_score = None
            traj = "→".join(fh.status_name(x.get("status")) for x in precs[-8:])
            if precs:
                last = precs[-1]
                rid = last.get("_id")
                rec_tid = str(last.get("contest") or tid or "")
                rec_q = f"?tid={rec_tid}" if rec_tid else ""
                latest_verdict = fh.status_name(last.get("status"))
                latest_score = last.get("score")
                if rid:
                    try:
                        rdata = client.get_json(f"/d/cpptrain/record/{rid}{rec_q}")
                        rdoc = rdata.get("rdoc") or {}
                        latest_code = str(rdoc.get("code") or "")[:3500]
                    except Exception:
                        pass

            payload = {
                "platform": "好吧(cpptrain)",
                "pid": str(pid),
                "title": f"{pid} {title}",
                "url": f"https://haoba.vip/d/cpptrain/p/{pid}{q_tid}",
                "statement": content,
                "attempts": len(precs),
                "best_score": max((x.get("score") or 0 for x in precs), default=0),
                "trajectory": traj,
                "latest_verdict": latest_verdict,
                "latest_score": latest_score,
                "latest_code": latest_code,
            }
            save_cache(f"haoba_{pid}", payload)
            print(f"[Haoba] cached {pid} ({title}) stmt={len(content)} chars code={len(latest_code)} chars")
            ok += 1
        except Exception as e:
            print(f"[Haoba] WARN {pid}: {e}")
    return ok


def cache_oilibaitian_problems(pids: list[str]) -> int:
    try:
        import fetch_oilibaitian as fo
        cookie = fo.chrome_cookie_header("Default")
        client = fo.HydroClient(cookie, delay=0.1)
    except Exception as e:
        print(f"[Oilibaitian] skipped (needs homebrew python3 with pycryptodome): {e}")
        return 0

    recs_path = WORKSPACE / "training" / "sync_logs" / "oilibaitian_uid79_records.json"
    recs_by_pid: dict[str, list[dict]] = {}
    if recs_path.exists():
        for r in json.loads(recs_path.read_text(encoding="utf-8")):
            recs_by_pid.setdefault(str(r.get("pid", "")), []).append(r)

    ok = 0
    for pid in pids:
        try:
            pdata = client.get_json(f"/p/{pid}")
            pdoc = pdata.get("pdoc") or {}
            title = str(pdoc.get("title") or pid)
            content = str(pdoc.get("content") or "")
            if content.startswith("{"):
                try:
                    cobj = json.loads(content)
                    content = cobj.get("zh") or cobj.get("en") or next(iter(cobj.values()), content)
                except Exception:
                    pass
            if len(content) > 3600:
                content = content[:3600] + "\n...(truncated)"

            precs = sorted(recs_by_pid.get(str(pid), []), key=lambda x: str(x.get("judgeAt") or ""))
            latest_code = ""
            latest_verdict = ""
            latest_score = None
            traj = "→".join(fo.status_name(x.get("status")) for x in precs[-8:])
            if precs:
                last = precs[-1]
                rid = last.get("_id")
                latest_verdict = fo.status_name(last.get("status"))
                latest_score = last.get("score")
                if rid:
                    try:
                        rdata = client.get_json(f"/record/{rid}")
                        rdoc = rdata.get("rdoc") or {}
                        latest_code = str(rdoc.get("code") or "")[:3500]
                    except Exception:
                        pass

            payload = {
                "platform": "信奥李拜天",
                "pid": str(pid),
                "title": f"{pid} {title}",
                "url": f"https://www.oilibaitian.cn/p/{pid}",
                "statement": content,
                "attempts": len(precs),
                "best_score": max((x.get("score") or 0 for x in precs), default=0),
                "trajectory": traj,
                "latest_verdict": latest_verdict,
                "latest_score": latest_score,
                "latest_code": latest_code,
            }
            save_cache(f"oilibaitian_{pid}", payload)
            print(f"[Oilibaitian] cached {pid} ({title}) stmt={len(content)} chars code={len(latest_code)} chars")
            ok += 1
        except Exception as e:
            print(f"[Oilibaitian] WARN {pid}: {e}")
    return ok


def main() -> int:
    atc_pids = ["abc485_c", "abc483_d"]
    haoba_pids = ["5313", "5314", "5315", "5277", "5250", "5236", "5220", "5219", "5113", "4998", "5027"]
    oli_pids = ["1505", "1243", "673", "2200", "803", "2667"]

    total = 0
    total += cache_atcoder_problems(atc_pids)
    total += cache_haoba_problems(haoba_pids)
    total += cache_oilibaitian_problems(oli_pids)
    print(f"\nDONE: cached {total} problem contexts into {CACHE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
