#!/usr/bin/env python3
"""
零依赖只读抓取 好吧平台（https://haoba.vip/，Hydro 架构）学生训练数据与单题代码版本。
凭据仅从本机 .env.local（已被 .gitignore 忽略）或环境变量读取，绝不写入任何 Git 跟踪文件：
    HAOBA_USERNAME=<用户名>
    HAOBA_PASSWORD=<密码>

支持两种模式：
1. 全量同步（默认）：拉取指定域下全部课程/作业/比赛及去重提交记录，输出到 training/sync_logs/：
   python3 scripts/fetch_haoba.py sync [--domains cpptrain,Cpp2023] [--days 60]
2. 单题深度抓取（含题面、评测记录与每次提交的 .cpp 源码，用于错题复盘）：
   python3 scripts/fetch_haoba.py problem "https://haoba.vip/d/cpptrain/p/5310?tid=..." [--out-dir ...]
"""

from __future__ import annotations

import argparse
import html
import http.cookiejar
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://haoba.vip"
REPO_ROOT = Path(__file__).resolve().parent.parent
SYNC_DIR = REPO_ROOT / "training" / "sync_logs"

HYDRO_STATUS = {
    0: "Waiting",
    1: "AC",
    2: "WA",
    3: "TLE",
    4: "MLE",
    5: "OLE",
    6: "RE",
    7: "CE",
    8: "SE",
    9: "Canceled",
    10: "Etc",
    11: "Hacked",
    20: "Waiting",
    21: "Fetched",
    22: "Compiling",
    23: "Judging",
}


def load_credentials() -> tuple[str, str]:
    env_vars = dict(os.environ)
    env_file = REPO_ROOT / ".env.local"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env_vars.setdefault(k.strip(), v.strip())

    user = env_vars.get("HAOBA_USERNAME", "").strip()
    pwd = env_vars.get("HAOBA_PASSWORD", "").strip()
    if not user or not pwd:
        raise RuntimeError(
            "未找到好吧平台凭据。请在工作区根目录创建 .env.local（已在 .gitignore 忽略）并写入：\n"
            "HAOBA_USERNAME=你的用户名\nHAOBA_PASSWORD=你的密码"
        )
    return user, pwd


def status_name(code: int | None) -> str:
    return HYDRO_STATUS.get(code if code is not None else -1, f"S{code}")


def parse_iso_local(ts: str | None) -> str:
    if not ts:
        return "-"
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone()
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return ts[:16]


class HaobaClient:
    def __init__(self, delay: float = 0.12) -> None:
        self.delay = delay
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
        self.uid: int | None = None
        self.uname: str = ""

    def login(self, username: str, password: str) -> None:
        # Step 1: visit /login to initialize session cookie
        req_get = urllib.request.Request(
            f"{BASE}/login",
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome Safari"},
        )
        with self.opener.open(req_get, timeout=25) as resp:
            login_html = resp.read().decode("utf-8", "ignore")
            if re.search(r"captcha|turnstile|recaptcha|hcaptcha|geetest", login_html, re.I):
                raise RuntimeError("检测到登录页存在验证码/人机校验，脚本自动停止，请手动在浏览器登录。")

        # Step 2: submit credentials
        body = urllib.parse.urlencode({
            "uname": username,
            "password": password,
            "rememberme": "on",
            "tfa": "",
            "authnChallenge": "",
        }).encode("utf-8")
        req_post = urllib.request.Request(
            f"{BASE}/login",
            data=body,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome Safari",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
        )
        with self.opener.open(req_post, timeout=25) as resp:
            _ = resp.read()

        # Step 3: verify login & resolve current uid
        me = self.get_json("/home/security")
        udoc = me.get("udoc") or {}
        if not udoc.get("_id"):
            # Fallback: inspect /d/cpptrain/
            page = self.get_text("/d/cpptrain/")
            m = re.search(r'"_id"\s*:\s*(\d+)', page)
            if not m:
                raise RuntimeError("登录好吧平台失败，请检查 .env.local 中的用户名和密码。")
            self.uid = int(m.group(1))
            self.uname = username
        else:
            self.uid = int(udoc["_id"])
            self.uname = str(udoc.get("uname") or username)

    def get_json(self, path_or_url: str) -> dict:
        url = path_or_url if path_or_url.startswith("http") else f"{BASE}{path_or_url}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome Safari",
                "Accept": "application/json",
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
        )
        with self.opener.open(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if self.delay > 0:
            time.sleep(self.delay)
        return data

    def get_text(self, path_or_url: str) -> str:
        url = path_or_url if path_or_url.startswith("http") else f"{BASE}{path_or_url}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome Safari",
                "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
        )
        with self.opener.open(req, timeout=30) as resp:
            text = resp.read().decode("utf-8", "ignore")
        if self.delay > 0:
            time.sleep(self.delay)
        return text


def domain_prefix(domain: str) -> str:
    return "" if domain == "system" else f"/d/{domain}"


def fetch_paginated_records(client: HaobaClient, query_path: str, max_pages: int = 25) -> tuple[list[dict], dict[str, dict]]:
    all_rdocs: list[dict] = []
    pdict_merged: dict[str, dict] = {}
    seen: set[str] = set()
    for page in range(1, max_pages + 1):
        sep = "&" if "?" in query_path else "?"
        data = client.get_json(f"{query_path}{sep}page={page}")
        rdocs = data.get("rdocs") or []
        for pid, pinfo in (data.get("pdict") or {}).items():
            pdict_merged[str(pid)] = pinfo
        if not rdocs:
            break
        added = 0
        for r in rdocs:
            rid = str(r.get("_id"))
            if rid not in seen:
                seen.add(rid)
                all_rdocs.append(r)
                added += 1
        if len(rdocs) < 100 or added == 0:
            break
    return all_rdocs, pdict_merged


def resolve_activity_detail(client: HaobaClient, prefix: str, tid: str, rule: str) -> tuple[str, dict | None]:
    order = []
    if rule == "course":
        order = ["course", "homework", "contest"]
    elif rule == "homework":
        order = ["homework", "course", "contest"]
    else:
        order = ["contest", "course", "homework"]

    for kind in order:
        try:
            d = client.get_json(f"{prefix}/{kind}/{tid}")
            if d.get("tdoc"):
                return kind, d
        except Exception:
            continue
    return order[0], None


def run_sync(args: argparse.Namespace) -> int:
    user, pwd = load_credentials()
    client = HaobaClient(delay=args.delay)
    print("1/4 登录好吧平台 (https://haoba.vip) ...")
    client.login(user, pwd)
    uid = args.uid or client.uid
    if not uid:
        raise RuntimeError("未能解析用户 UID。")
    print(f"   已登录：{client.uname} (UID {uid})")

    domains = [d.strip() for d in args.domains.split(",") if d.strip()]
    all_activities: list[dict] = []
    records_by_id: dict[str, dict] = {}
    pdict_all: dict[str, dict] = {}
    domain_stats: dict[str, dict] = {}

    for dom in domains:
        prefix = domain_prefix(dom)
        print(f"2/4 同步域 `{dom}` 的个人页与公共提交 ...")
        try:
            prof = client.get_json(f"{prefix}/user/{uid}")
        except Exception as exc:
            print(f"   [跳过] 域 {dom} 访问失败: {exc}")
            continue

        for p in prof.get("pdocs") or []:
            pid = str(p.get("docId") or p.get("_id"))
            pdict_all[f"{dom}:{pid}"] = {
                "domain": dom,
                "pid": pid,
                "title": p.get("title", ""),
                "tag": p.get("tag") or [],
            }

        gen_rdocs, gen_pdict = fetch_paginated_records(client, f"{prefix}/record?uidOrName={uid}")
        for pid, pinfo in gen_pdict.items():
            pdict_all[f"{dom}:{pid}"] = {
                "domain": dom,
                "pid": str(pid),
                "title": pinfo.get("title", ""),
                "tag": pinfo.get("tag") or [],
            }
        for r in gen_rdocs:
            r["_domain"] = dom
            records_by_id[str(r["_id"])] = r

        tdocs = prof.get("tdocs") or []
        print(f"3/4 拉取域 `{dom}` 全部 {len(tdocs)} 个课程/作业/比赛明细与专属提交 ...")
        dom_acts = 0
        for idx, t in enumerate(tdocs, 1):
            tid = str(t.get("docId") or t.get("_id"))
            rule = str(t.get("rule") or "")
            kind, detail = resolve_activity_detail(client, prefix, tid, rule)
            if not detail:
                continue

            tdoc = detail.get("tdoc") or {}
            tsdoc = detail.get("tsdoc") or {}
            act_pdict = detail.get("pdict") or {}
            for pid, pinfo in act_pdict.items():
                pdict_all[f"{dom}:{pid}"] = {
                    "domain": dom,
                    "pid": str(pid),
                    "title": pinfo.get("title", ""),
                    "tag": pinfo.get("tag") or [],
                }

            try:
                act_rdocs, rec_pdict = fetch_paginated_records(
                    client, f"{prefix}/record?tid={tid}&uidOrName={uid}", max_pages=10
                )
            except Exception:
                act_rdocs, rec_pdict = [], {}

            for pid, pinfo in rec_pdict.items():
                pdict_all.setdefault(f"{dom}:{pid}", {
                    "domain": dom,
                    "pid": str(pid),
                    "title": pinfo.get("title", ""),
                    "tag": pinfo.get("tag") or [],
                })

            recs_by_pid: defaultdict[str, list[dict]] = defaultdict(list)
            for r in act_rdocs:
                r["_domain"] = dom
                records_by_id[str(r["_id"])] = r
                recs_by_pid[str(r.get("pid"))].append(r)

            journal_by_pid: defaultdict[str, list[dict]] = defaultdict(list)
            for j in tsdoc.get("journal") or []:
                journal_by_pid[str(j.get("pid"))].append(j)

            pids = [str(x) for x in (tdoc.get("pids") or act_pdict.keys())]
            prob_entries = []
            for pid in pids:
                precs = recs_by_pid.get(pid, [])
                jlist = journal_by_pid.get(pid, [])
                pmeta = pdict_all.get(f"{dom}:{pid}") or act_pdict.get(pid) or {}
                best_score = None
                best_status = None
                verdicts = []
                if precs:
                    ordered = sorted(precs, key=lambda x: x.get("judgeAt") or "")
                    verdicts = [status_name(x.get("status")) for x in ordered]
                    best_rec = max(precs, key=lambda x: (x.get("score") or 0, 1 if x.get("status") == 1 else 0))
                    best_score = best_rec.get("score")
                    best_status = status_name(best_rec.get("status"))
                elif jlist:
                    verdicts = [status_name(x.get("status")) for x in jlist]
                    best_j = max(jlist, key=lambda x: (x.get("score") or 0, 1 if x.get("status") == 1 else 0))
                    best_score = best_j.get("score")
                    best_status = status_name(best_j.get("status"))

                prob_entries.append({
                    "pid": pid,
                    "title": pmeta.get("title", ""),
                    "tags": pmeta.get("tag") or [],
                    "submissions": max(len(precs), len(jlist)),
                    "bestScore": best_score,
                    "bestStatus": best_status,
                    "verdicts": verdicts,
                })

            # Determine best activity date
            latest_rec_dt = max((r.get("judgeAt") or "" for r in act_rdocs), default="")
            date_sort = latest_rec_dt or tsdoc.get("startAt") or tdoc.get("beginAt") or ""
            all_activities.append({
                "domain": dom,
                "tid": tid,
                "kind": kind,
                "rule": rule,
                "title": tdoc.get("title") or t.get("title", ""),
                "beginAt": tdoc.get("beginAt"),
                "endAt": tdoc.get("endAt"),
                "startAt": tsdoc.get("startAt"),
                "progress": tsdoc.get("progress"),
                "dateSort": date_sort,
                "problems": prob_entries,
            })
            dom_acts += 1
            if idx % 25 == 0 or idx == len(tdocs):
                print(f"   [{dom}] 进度: {idx}/{len(tdocs)} (累计去重提交 {len(records_by_id)} 条)")

        domain_stats[dom] = {
            "activities": dom_acts,
            "publicRecords": len(gen_rdocs),
        }

    print("4/4 保存 JSON 与生成 Markdown 汇总 ...")
    SYNC_DIR.mkdir(parents=True, exist_ok=True)
    all_records = sorted(records_by_id.values(), key=lambda x: x.get("judgeAt") or "")

    (SYNC_DIR / f"haoba_uid{uid}_activities.json").write_text(
        json.dumps(all_activities, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (SYNC_DIR / f"haoba_uid{uid}_records.json").write_text(
        json.dumps(all_records, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    md_path = SYNC_DIR / f"haoba_uid{uid}_summary.md"
    write_summary(uid, client.uname, domains, domain_stats, all_activities, all_records, pdict_all, args.days, md_path)

    print(f"✅ 好吧平台同步完成：活动 {len(all_activities)} 场，去重提交 {len(all_records)} 条！")
    print(f"📄 汇总已生成: {md_path}")
    return 0


def write_summary(
    uid: int,
    uname: str,
    domains: list[str],
    domain_stats: dict[str, dict],
    activities: list[dict],
    records: list[dict],
    pdict: dict[str, dict],
    days: int,
    md_path: Path,
) -> None:
    all_verdicts = Counter(status_name(r.get("status")) for r in records)
    now_ts = time.time()
    cutoff = now_ts - days * 86400
    recent = []
    for r in records:
        ts = r.get("judgeAt") or ""
        try:
            ep = datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
        except Exception:
            ep = 0
        if ep >= cutoff:
            recent.append(r)
    recent_verdicts = Counter(status_name(r.get("status")) for r in recent)

    ac_pids = {(r.get("_domain"), str(r.get("pid"))) for r in records if r.get("status") == 1}
    attempted_pids = {(r.get("_domain"), str(r.get("pid"))) for r in records}

    # Tag friction
    tag_fail: Counter[str] = Counter()
    tag_ac: Counter[str] = Counter()
    for dom, pid in ac_pids:
        for tg in (pdict.get(f"{dom}:{pid}") or {}).get("tag") or []:
            tag_ac[tg] += 1
    for r in records:
        if r.get("status") != 1:
            key = f"{r.get('_domain')}:{r.get('pid')}"
            for tg in (pdict.get(key) or {}).get("tag") or []:
                tag_fail[tg] += 1

    # Unfinished & unsubmitted from recent/active activities
    unfinished = []
    unsubmitted_recent = []
    for a in sorted(activities, key=lambda x: x.get("dateSort") or "", reverse=True):
        ds = (a.get("dateSort") or "")[:10]
        for p in a.get("problems") or []:
            is_ac = p.get("bestStatus") == "AC" or p.get("bestScore") == 100
            if not is_ac and p.get("submissions", 0) > 0:
                unfinished.append((ds, a["domain"], a["title"], f"{p['pid']} {p['title']}", p.get("bestScore") or 0, p["submissions"], p.get("tags") or []))
            elif not is_ac and p.get("submissions", 0) == 0 and ds >= "2026-09-01":
                unsubmitted_recent.append((ds, a["domain"], a["title"], f"{p['pid']} {p['title']}", p.get("tags") or []))

    dom_summary = ", ".join(f"`{d}`({domain_stats.get(d, {}).get('activities', 0)}场)" for d in domains)
    lines = [
        f"# 好吧平台（haoba.vip）全量同步汇总（{uname} / UID `{uid}`）",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **同步域**：{dom_summary}",
        f"- **活动总数**：**{len(activities)}** 场（课程 {sum(1 for a in activities if a['kind']=='course')} / 作业 {sum(1 for a in activities if a['kind']=='homework')} / 比赛 {sum(1 for a in activities if a['kind']=='contest')}）",
        f"- **去重提交总数**：**{len(records)}** 条（尝试独立题 **{len(attempted_pids)}** 道，已 AC **{len(ac_pids)}** 道）",
        "- **全历史提交结果分布**：" + (", ".join(f"`{k}`: {v}" for k, v in all_verdicts.most_common()) or "无"),
        f"- **近 {days} 天提交数**：{len(recent)} 次（"
        + (", ".join(f"`{k}`: {v}" for k, v in recent_verdicts.most_common()) or "无")
        + "）",
        "",
        "## 一、近期课程/作业/比赛完成度（最近 25 场）",
        "",
        "| 域 | 类型 | 活动名称 | 最近日期 | 题数 | AC | 未满分 | 未交 | 提交数 |",
        "| :--- | :---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for a in sorted(activities, key=lambda x: x.get("dateSort") or "", reverse=True)[:25]:
        probs = a.get("problems") or []
        n_ac = sum(1 for p in probs if p.get("bestStatus") == "AC" or p.get("bestScore") == 100)
        n_unsub = sum(1 for p in probs if p.get("submissions", 0) == 0)
        n_part = len(probs) - n_ac - n_unsub
        n_subs = sum(p.get("submissions", 0) for p in probs)
        lines.append(
            f"| `{a['domain']}` | {a['kind']} | {a['title']} | {(a.get('dateSort') or '-')[:10]} "
            f"| {len(probs)} | {n_ac} | {n_part} | {n_unsub} | {n_subs} |"
        )

    lines.extend([
        "",
        f"## 二、已提交但未满分题目（共 {len(unfinished)} 题，显示最近 35 题）",
        "",
        "| 日期 | 活动名称 | 题目 | 最高分 | 提交次数 | 标签 |",
        "| :--- | :--- | :--- | ---: | ---: | :--- |",
    ])
    for ds, dom, act, pname, best, subs, tags in unfinished[:35]:
        lines.append(f"| {ds or '-'} | {act} | {pname} | {best} | {subs} | {', '.join(tags[:4])} |")

    lines.extend([
        "",
        f"## 三、2026 年 9 月以来课程/模拟赛未提交题目（共 {len(unsubmitted_recent)} 题，显示前 30 题）",
        "",
        "| 日期 | 活动名称 | 题目 | 标签 |",
        "| :--- | :--- | :--- | :--- |",
    ])
    for ds, dom, act, pname, tags in unsubmitted_recent[:30]:
        lines.append(f"| {ds or '-'} | {act} | {pname} | {', '.join(tags[:4])} |")

    if tag_ac or tag_fail:
        lines.extend([
            "",
            "## 四、高频已过与高摩擦标签",
            "",
            "- **高频已过标签 Top 15**：" + (", ".join(f"`{k}`({v})" for k, v in tag_ac.most_common(15)) or "无"),
            "- **非 AC 高摩擦标签 Top 15**：" + (", ".join(f"`{k}`({v})" for k, v in tag_fail.most_common(15)) or "无"),
        ])

    tid_title = {a["tid"]: a["title"] for a in activities}
    lines.extend([
        "",
        "## 五、最近 30 条提交明细",
        "",
        "| 时间 | 域 | 题目 | 分数 | 结果 | 所属课程/作业 |",
        "| :--- | :--- | :--- | ---: | :---: | :--- |",
    ])
    for r in sorted(records, key=lambda x: x.get("judgeAt") or "", reverse=True)[:30]:
        dom = r.get("_domain", "")
        pid = str(r.get("pid"))
        ptitle = (pdict.get(f"{dom}:{pid}") or {}).get("title", "")
        cid = str(r.get("contest") or "")
        act = tid_title.get(cid, "-") if cid and cid != "000000000000000000000000" else "-"
        lines.append(
            f"| {parse_iso_local(r.get('judgeAt'))} | `{dom}` | `{pid}` {ptitle} "
            f"| {r.get('score', '-')} | `{status_name(r.get('status'))}` | {act} |"
        )

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def run_problem(args: argparse.Namespace) -> int:
    user, pwd = load_credentials()
    client = HaobaClient(delay=0.12)
    client.login(user, pwd)
    uid = args.uid or client.uid

    parsed = urllib.parse.urlparse(args.url)
    qs = urllib.parse.parse_qs(parsed.query)
    tid = qs.get("tid", [""])[0]
    m_dom = re.search(r"/d/([^/]+)", parsed.path)
    dom = m_dom.group(1) if m_dom else "system"
    prefix = domain_prefix(dom)
    m_pid = re.search(r"/p/([^/?#]+)", parsed.path)
    pid_slug = m_pid.group(1) if m_pid else "problem"

    pjson = client.get_json(args.url)
    pdoc = pjson.get("pdoc") or {}
    tdoc = pjson.get("tdoc") or {}
    pid = str(pdoc.get("docId") or pdoc.get("pid") or pid_slug)
    title = pdoc.get("title") or pid
    content = pdoc.get("content") or ""
    if isinstance(content, str) and content.strip().startswith("{"):
        try:
            content = json.loads(content).get("zh", content)
        except Exception:
            pass

    out_dir = Path(args.out_dir) if args.out_dir else (REPO_ROOT / "training" / "oj" / f"haoba-{pid}")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "submissions").mkdir(exist_ok=True)

    (out_dir / "problem.md").write_text(
        f"# {pid}. {title}\n\n- URL: {args.url}\n- Domain: `{dom}`\n- Course/Homework: {tdoc.get('title') or '-'}\n- Tags: {', '.join(pdoc.get('tag') or [])}\n\n## Statement\n\n{content}\n",
        encoding="utf-8",
    )

    q = f"{prefix}/record?pid={urllib.parse.quote(pid)}&uidOrName={uid}"
    if tid:
        q += f"&tid={urllib.parse.quote(tid)}"
    rdocs, _ = fetch_paginated_records(client, q, max_pages=5)
    rdocs.sort(key=lambda x: x.get("judgeAt") or "")

    exported = []
    for idx, r in enumerate(rdocs, 1):
        rid = str(r.get("_id"))
        rec_url = f"{prefix}/record/{rid}" + (f"?tid={urllib.parse.quote(tid)}" if tid else "")
        code = ""
        try:
            rj = client.get_json(rec_url)
            code = (rj.get("rdoc") or {}).get("code") or ""
        except Exception:
            page = client.get_text(rec_url)
            m_code = re.search(r'<pre class="line-numbers"><code[^>]*>(.*?)</code></pre>', page, re.S)
            code = html.unescape(m_code.group(1)) if m_code else ""

        entry = {
            "order": idx,
            "rid": rid,
            "judgeAt": parse_iso_local(r.get("judgeAt")),
            "score": r.get("score"),
            "status": status_name(r.get("status")),
            "timeMs": round(r.get("time") or 0),
            "memoryKB": r.get("memory"),
            "lang": r.get("lang"),
        }
        if code:
            fname = f"{idx:02d}_{rid}_{entry['score']}_{entry['status']}.cpp"
            (out_dir / "submissions" / fname).write_text(code, encoding="utf-8")
            entry["codeFile"] = f"submissions/{fname}"
        exported.append(entry)

    (out_dir / "records.json").write_text(
        json.dumps({"pid": pid, "title": title, "domain": dom, "records": exported}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"✅ 已导出单题与 {len(exported)} 份提交代码到: {out_dir}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="好吧平台 (haoba.vip) 只读数据同步与单题分析工具")
    sub = parser.add_subparsers(dest="cmd")

    p_sync = sub.add_parser("sync", help="全量同步课程/作业/比赛与提交记录")
    p_sync.add_argument("--domains", default="cpptrain,Cpp2023", help="逗号分隔的域名列表（默认 cpptrain,Cpp2023）")
    p_sync.add_argument("--uid", type=int, help="可选：指定 UID（默认自动读取当前登录账号）")
    p_sync.add_argument("--days", type=int, default=60, help="近期统计窗口天数（默认 60）")
    p_sync.add_argument("--delay", type=float, default=0.12, help="请求间隔秒数（默认 0.12）")

    p_prob = sub.add_parser("problem", help="导出单题题面、评测记录与每次提交的 .cpp 代码")
    p_prob.add_argument("url", help="题目 URL（建议保留 tid=... 参数）")
    p_prob.add_argument("--uid", type=int, help="可选：指定 UID")
    p_prob.add_argument("--out-dir", help="可选：导出目录")

    args = parser.parse_args()
    if args.cmd == "problem":
        return run_problem(args)
    if args.cmd is None:
        args.domains = "cpptrain,Cpp2023"
        args.uid = None
        args.days = 60
        args.delay = 0.12
    return run_sync(args)


if __name__ == "__main__":
    raise SystemExit(main())
