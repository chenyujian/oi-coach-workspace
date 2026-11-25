#!/usr/bin/env python3
"""
抓取并缓存近期未 AC 黄金题的「原题题面 + 麒麒最新提交 .cpp 代码」到 training/problem_cache/。
供 DeepSeek Harness「麒麒 OI 学习台」直连 Antigravity 教练时自动注入上下文，
让教练零工具调用即可直接看到原题面、数据范围与孩子写的真实代码。
"""

from __future__ import annotations

import argparse
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

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


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
    if out_path.exists():
        try:
            prev = json.loads(out_path.read_text(encoding="utf-8"))
            if not str(payload.get("statement") or "").strip() and str(prev.get("statement") or "").strip():
                payload = {**payload, "statement": prev["statement"]}
            if not str(payload.get("latest_code") or "").strip() and str(prev.get("latest_code") or "").strip():
                payload = {**payload, "latest_code": prev["latest_code"]}
            for keep_k in ("title_zh", "statement_zh", "vocab"):
                if not payload.get(keep_k) and prev.get(keep_k):
                    payload = {**payload, keep_k: prev[keep_k]}
        except Exception:
            pass
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

    # Load existing records & activities to find domain + tid + latest record id per pid
    recs_path = WORKSPACE / "training" / "sync_logs" / "haoba_uid957_records.json"
    acts_path = WORKSPACE / "training" / "sync_logs" / "haoba_uid957_activities.json"
    tid_by_pid: dict[str, str] = {}
    dom_by_pid: dict[str, str] = {}
    if acts_path.exists():
        for act in json.loads(acts_path.read_text(encoding="utf-8")):
            tid = str(act.get("tid") or act.get("docId") or act.get("_id") or "")
            dom = str(act.get("domain") or "cpptrain")
            for p in act.get("problems") or act.get("pids") or []:
                pid_s = str(p.get("pid") if isinstance(p, dict) else p)
                if not pid_s:
                    continue
                if tid:
                    tid_by_pid.setdefault(pid_s, tid)
                if dom:
                    dom_by_pid.setdefault(pid_s, dom)
    recs_by_pid: dict[str, list[dict]] = {}
    if recs_path.exists():
        for r in json.loads(recs_path.read_text(encoding="utf-8")):
            pid_s = str(r.get("pid", ""))
            recs_by_pid.setdefault(pid_s, []).append(r)
            if r.get("contest") and pid_s not in tid_by_pid:
                tid_by_pid[pid_s] = str(r.get("contest"))
            if r.get("_domain") and pid_s not in dom_by_pid:
                dom_by_pid[pid_s] = str(r.get("_domain"))

    ok = 0
    for pid in pids:
        try:
            pid_s = str(pid)
            dom = dom_by_pid.get(pid_s, "cpptrain") or "cpptrain"
            tid = tid_by_pid.get(pid_s, "")
            q_tid = f"?tid={tid}" if tid and tid != "000000000000000000000000" else ""
            pdata = client.get_json(f"/d/{dom}/p/{pid_s}{q_tid}")
            pdoc = pdata.get("pdoc") or {}
            title = str(pdoc.get("title") or pid_s)
            content = str(pdoc.get("content") or "")
            if content.startswith("{"):
                try:
                    cobj = json.loads(content)
                    content = cobj.get("zh") or cobj.get("en") or next(iter(cobj.values()), content)
                except Exception:
                    pass
            if len(content) > 3600:
                content = content[:3600] + "\n...(truncated)"

            precs = sorted(recs_by_pid.get(pid_s, []), key=lambda x: str(x.get("judgeAt") or ""))
            latest_code = ""
            latest_verdict = ""
            latest_score = None
            traj = "→".join(fh.status_name(x.get("status")) for x in precs[-8:])
            if precs:
                last = precs[-1]
                rid = last.get("_id")
                rec_dom = str(last.get("_domain") or dom)
                rec_tid = str(last.get("contest") or tid or "")
                rec_q = f"?tid={rec_tid}" if rec_tid and rec_tid != "000000000000000000000000" else ""
                latest_verdict = fh.status_name(last.get("status"))
                latest_score = last.get("score")
                if rid:
                    try:
                        rdata = client.get_json(f"/d/{rec_dom}/record/{rid}{rec_q}")
                        rdoc = rdata.get("rdoc") or {}
                        latest_code = str(rdoc.get("code") or "")[:3500]
                    except Exception:
                        pass

            payload = {
                "platform": f"好吧({dom})",
                "pid": pid_s,
                "title": f"{pid_s} {title}",
                "url": f"https://haoba.vip/d/{dom}/p/{pid_s}{q_tid}",
                "statement": content,
                "attempts": len(precs),
                "best_score": max((x.get("score") or 0 for x in precs), default=0),
                "trajectory": traj,
                "latest_verdict": latest_verdict,
                "latest_score": latest_score,
                "latest_code": latest_code,
            }
            save_cache(f"haoba_{pid_s}", payload)
            print(f"[Haoba] cached {pid_s} ({title}) dom={dom} stmt={len(content)} chars code={len(latest_code)} chars")
            ok += 1
        except Exception as e:
            print(f"[Haoba] WARN {pid}: {e}")
    return ok


GESP8_OILI_PROG_PIDS = (
    "786", "787", "788", "789", "790", "791", "792", "793", "794", "795",
    "796", "797", "798", "799", "800", "801", "1344", "1345", "1504", "1505",
    "1800", "1801", "2321", "2322", "2699", "2700",
)
GESP8_OILI_OBJ_PIDS = (
    "1760", "1761", "1677", "1686", "1694", "1702", "1709",
    "1726", "1717", "1734", "2269", "2632", "2718",
)


def cache_oilibaitian_problems(pids: list[str]) -> int:
    try:
        import fetch_oilibaitian as fo
        client = fo.create_authenticated_client(delay=0.08)
    except Exception as e:
        print(f"[Oilibaitian] skipped (check OILIBAITIAN_USERNAME/PASSWORD in .env.local): {e}")
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
            tags = pdoc.get("tag") or []
            is_obj = "客观题" in title or "客观题" in tags
            content = str(pdoc.get("content") or "")
            if content.startswith("{"):
                try:
                    cobj = json.loads(content)
                    content = cobj.get("zh") or cobj.get("en") or next(iter(cobj.values()), content)
                except Exception:
                    pass
            max_chars = 15000 if is_obj else 4200
            if len(content) > max_chars:
                content = content[:max_chars] + "\n...(truncated)"

            precs = sorted(recs_by_pid.get(str(pid), []), key=lambda x: str(x.get("judgeAt") or ""))
            latest_code = ""
            latest_verdict = ""
            latest_score = None
            wrong_qids: list[int] = []
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
                        if is_obj:
                            for idx_tc, tc in enumerate(rdoc.get("testCases") or [], 1):
                                if tc.get("status") != 1:
                                    qid = tc.get("id") if isinstance(tc.get("id"), int) and tc.get("id") > 0 else idx_tc
                                    wrong_qids.append(int(qid))
                    except Exception:
                        pass

            payload = {
                "platform": "信奥李拜天",
                "pid": str(pid),
                "title": f"{pid} {title}",
                "url": f"https://www.oilibaitian.cn/p/{pid}",
                "tags": tags,
                "is_objective": is_obj,
                "statement": content,
                "attempts": len(precs),
                "best_score": max((x.get("score") or 0 for x in precs), default=0),
                "trajectory": traj,
                "latest_verdict": latest_verdict,
                "latest_score": latest_score,
                "latest_code": latest_code,
                **({"wrong_questions": sorted(set(wrong_qids))} if is_obj and wrong_qids else {}),
            }
            save_cache(f"oilibaitian_{pid}", payload)
            print(f"[Oilibaitian] cached {pid} ({title}) stmt={len(content)} chars code={len(latest_code)} chars")
            ok += 1
        except Exception as e:
            print(f"[Oilibaitian] WARN {pid}: {e}")
    return ok


def load_local_attempt_counts() -> dict[tuple[str, str], int]:
    """统计单平台本地提交记录数，供跨站合并行与 --incremental 精确比对。"""
    counts: dict[tuple[str, str], int] = {}
    sync_dir = WORKSPACE / "training" / "sync_logs"

    atc_path = sync_dir / "atcoder_chenyanxu.json"
    if atc_path.exists():
        try:
            raw = json.loads(atc_path.read_text(encoding="utf-8"))
            subs = raw.get("submissions", raw) if isinstance(raw, dict) else raw
            for s in subs:
                pid = str(s.get("problem_id") or "")
                if pid:
                    counts[("atcoder", pid)] = counts.get(("atcoder", pid), 0) + 1
        except Exception:
            pass

    hb_path = sync_dir / "haoba_uid957_records.json"
    if hb_path.exists():
        try:
            for r in json.loads(hb_path.read_text(encoding="utf-8")):
                pid = str(r.get("pid") or "")
                if pid:
                    counts[("haoba", pid)] = counts.get(("haoba", pid), 0) + 1
        except Exception:
            pass

    oi_path = sync_dir / "oilibaitian_uid79_records.json"
    if oi_path.exists():
        try:
            for r in json.loads(oi_path.read_text(encoding="utf-8")):
                pid = str(r.get("pid") or "")
                if pid:
                    counts[("oilibaitian", pid)] = counts.get(("oilibaitian", pid), 0) + 1
        except Exception:
            pass

    return counts


def _bucket_for_plat_name(plat_name: str) -> str | None:
    if "AtCoder" in plat_name:
        return "atcoder"
    if "好吧" in plat_name:
        return "haoba"
    if "信奥李拜天" in plat_name:
        return "oilibaitian"
    return None


def discover_unsolved_from_timeline(limit: int = 30) -> dict[str, list[tuple[str, int | None]]]:
    """从 profile/activity_timeline.md 第 二 节动态提取最近尚未 AC 的题目及单站尝试次数。"""
    found: dict[str, list[tuple[str, int | None]]] = {"atcoder": [], "haoba": [], "oilibaitian": []}
    seen: set[str] = set()
    local_counts = load_local_attempt_counts()
    md_path = WORKSPACE / "profile" / "activity_timeline.md"
    if md_path.exists():
        text = md_path.read_text(encoding="utf-8", errors="ignore")
        sec = text.split("## 二、真正尚未 AC 的独立待补题时间线")
        if len(sec) > 1:
            block = sec[1].split("\n## ")[0]
            for line in block.splitlines():
                t = line.strip()
                if not t.startswith("| 20"):
                    continue
                cols = [c.strip() for c in t.split("|")[1:-1]]
                if len(cols) < 4:
                    continue
                raw_plat_col = cols[1]
                title_col = cols[2]
                row_attempts = int(cols[3]) if cols[3].isdigit() else None

                # 处理跨平台合并行（如：洛谷`P3139` + 信奥李拜天`1941`）
                if "+" in raw_plat_col:
                    for seg in raw_plat_col.split("+"):
                        m_seg = re.search(r"([^`]+)`([^`]+)`", seg.strip())
                        if not m_seg:
                            continue
                        seg_plat, seg_pid = m_seg.group(1).strip(), m_seg.group(2).strip()
                        bucket = _bucket_for_plat_name(seg_plat)
                        if not bucket or not seg_pid:
                            continue
                        key = f"{bucket}:{seg_pid}"
                        if key not in seen:
                            seen.add(key)
                            found[bucket].append((seg_pid, local_counts.get((bucket, seg_pid))))
                    continue

                bucket = _bucket_for_plat_name(raw_plat_col.replace("`", ""))
                if not bucket:
                    continue
                m_pid = re.search(r"`([^`]+)`", title_col)
                pid = m_pid.group(1).strip() if m_pid else title_col.split()[0]
                if not pid:
                    continue
                key = f"{bucket}:{pid}"
                if key not in seen:
                    seen.add(key)
                    expected = local_counts.get((bucket, pid), row_attempts)
                    found[bucket].append((pid, expected))

    # 仅在真实工作区（存在对应同步日志时）补充近期重点课程/模拟赛未交但待攻克题
    if (WORKSPACE / "training" / "sync_logs" / "haoba_uid957_activities.json").exists():
        for seed_pid in ("5313", "5314", "5315", "5277"):
            if f"haoba:{seed_pid}" not in seen:
                found["haoba"].append((seed_pid, local_counts.get(("haoba", seed_pid))))
    if (WORKSPACE / "training" / "sync_logs" / "oilibaitian_uid79_records.json").exists():
        for seed_pid in ("2667",):
            if f"oilibaitian:{seed_pid}" not in seen:
                found["oilibaitian"].append((seed_pid, local_counts.get(("oilibaitian", seed_pid))))

    result = {k: v[:limit] for k, v in found.items()}
    # 在真实工作区（存在 oilibaitian_uid79_profile.json）自动纳管 GESP 八级全套编程与客观真题缓存（不受 limit 截断）
    if (WORKSPACE / "training" / "sync_logs" / "oilibaitian_uid79_profile.json").exists():
        existing_oi = {pid for pid, _ in result["oilibaitian"]}
        for gpid in (*GESP8_OILI_PROG_PIDS, *GESP8_OILI_OBJ_PIDS):
            if gpid not in existing_oi:
                existing_oi.add(gpid)
                result["oilibaitian"].append((gpid, local_counts.get(("oilibaitian", gpid), 0)))
    return result


def filter_uncached(prefix: str, items: list[tuple[str, int | None]], incremental: bool) -> list[str]:
    if not incremental:
        return [pid for pid, _ in items]
    todo: list[str] = []
    for pid, expected_attempts in items:
        cache_file = CACHE_DIR / f"{prefix}_{pid}.json"
        if not cache_file.exists():
            todo.append(pid)
            continue
        try:
            obj = json.loads(cache_file.read_text(encoding="utf-8"))
            has_stmt = bool(str(obj.get("statement") or "").strip())
            cached_attempts = obj.get("attempts")
            if not has_stmt:
                todo.append(pid)
            elif expected_attempts is not None and cached_attempts != expected_attempts:
                todo.append(pid)
        except Exception:
            todo.append(pid)
    return todo


def main() -> int:
    global WORKSPACE, CACHE_DIR
    parser = argparse.ArgumentParser(description="动态缓存未过题的原题面与最新提交代码")
    parser.add_argument(
        "--platform",
        choices=["all", "atcoder", "haoba", "oilibaitian"],
        default="all",
        help="只更新指定平台（默认 all）",
    )
    parser.add_argument(
        "--incremental",
        action="store_true",
        help="增量模式：已缓存且单站尝试次数未变的题目直接跳过",
    )
    parser.add_argument("--limit", type=int, default=15, help="单平台最多扫描最近未过题数量")
    parser.add_argument("--workspace", type=str, default="", help="可选：指定工作区根目录（用于隔离单测）")
    parser.add_argument("--dry-run", action="store_true", help="仅输出待抓取题号 JSON，不发起网络请求")
    args = parser.parse_args()

    if args.workspace:
        WORKSPACE = Path(args.workspace).resolve()
        CACHE_DIR = WORKSPACE / "training" / "problem_cache"

    discovered = discover_unsolved_from_timeline(limit=args.limit)
    plan: dict[str, list[str]] = {}
    for plat in ("atcoder", "haoba", "oilibaitian"):
        if args.platform in ("all", plat):
            plan[plat] = filter_uncached(plat, discovered[plat], args.incremental)

    if args.dry_run:
        print(json.dumps({"discovered": discovered, "todo": plan}, ensure_ascii=False))
        return 0

    total = 0
    if plan.get("atcoder"):
        total += cache_atcoder_problems(plan["atcoder"])
    if plan.get("haoba"):
        total += cache_haoba_problems(plan["haoba"])
    if plan.get("oilibaitian"):
        total += cache_oilibaitian_problems(plan["oilibaitian"])

    print(f"DONE: newly cached/updated {total} problem context(s) in {CACHE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
