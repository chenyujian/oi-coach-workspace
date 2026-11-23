#!/usr/bin/env python3
"""
只读全量拉取 信奥李拜天 OJ（www.oilibaitian.cn，Hydro 架构）学生数据。
复用本机 Chrome 已登录会话（参考 ~/.codex/skills/oilibaitian-hydro），
绝不保存任何 Cookie 或凭据到磁盘。

保存路径（training/sync_logs/）：
  - oilibaitian_uid<UID>_profile.json     （基础统计、250+ 已过题、标签分布、知识树）
  - oilibaitian_uid<UID>_activities.json  （全部作业与比赛、每题得分与未提交清单）
  - oilibaitian_uid<UID>_records.json     （全量去重提交记录：公共 + 作业 + 比赛）
  - oilibaitian_uid<UID>_summary.md       （供家长与 AI 教练阅读的结构化汇总）

用法（需安装了 pycryptodome 的 Python，如 /opt/homebrew/bin/python3.14）：
    /opt/homebrew/bin/python3.14 scripts/fetch_oilibaitian.py --uid 79
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sqlite3
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HOST = "www.oilibaitian.cn"
BASE = f"http://{HOST}"
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


def chrome_cookie_header(profile: str = "Default") -> str:
    db = Path.home() / "Library/Application Support/Google/Chrome" / profile / "Cookies"
    if not db.exists():
        raise FileNotFoundError(f"未找到 Chrome Cookie 数据库: {db}")

    password = subprocess.check_output(
        ["security", "find-generic-password", "-w", "-s", "Chrome Safe Storage"],
        stderr=subprocess.DEVNULL,
        timeout=30,
    ).decode().strip()

    try:
        from Crypto.Cipher import AES  # type: ignore
        from Crypto.Util.Padding import unpad  # type: ignore
    except Exception as exc:
        raise RuntimeError(
            "缺少 pycryptodome，请使用安装有 pycryptodome 的 Python（如 /opt/homebrew/bin/python3.14）"
        ) from exc

    with tempfile.NamedTemporaryFile(prefix="oilibaitian-cookies-", suffix=".db", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        shutil.copyfile(db, tmp_path)
        con = sqlite3.connect(tmp_path)
        rows = con.execute(
            "select host_key, name, value, encrypted_value from cookies where host_key in (?, ?)",
            (HOST, "." + HOST),
        ).fetchall()
    finally:
        tmp_path.unlink(missing_ok=True)

    cookies: list[str] = []
    for host, name, value, encrypted_value in rows:
        if name not in {"sid", "sid.sig"}:
            continue
        if value:
            val = value
        elif encrypted_value.startswith((b"v10", b"v11")):
            key = hashlib.pbkdf2_hmac("sha1", password.encode(), b"saltysalt", 1003, 16)
            plain = unpad(AES.new(key, AES.MODE_CBC, b" " * 16).decrypt(encrypted_value[3:]), 16)
            host_hash = hashlib.sha256(host.encode()).digest()
            if plain.startswith(host_hash):
                plain = plain[len(host_hash) :]
            val = plain.decode("utf-8")
        else:
            val = encrypted_value.decode("utf-8", "ignore")
        cookies.append(f"{name}={val}")

    if not cookies:
        raise RuntimeError(f"未在 Chrome 中找到 {HOST} 的登录会话，请先在 Chrome 登录。")
    return "; ".join(cookies)


class HydroClient:
    def __init__(self, cookie: str, delay: float = 0.12) -> None:
        self.cookie = cookie
        self.delay = delay
        self.opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def get_json(self, path: str) -> dict:
        url = path if path.startswith("http") else f"{BASE}{path}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome Safari",
                "Cookie": self.cookie,
                "Accept": "application/json",
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
        )
        with self.opener.open(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if self.delay > 0:
            time.sleep(self.delay)
        return data


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


def fetch_all_records_for_query(client: HydroClient, query: str) -> tuple[list[dict], dict[str, dict]]:
    all_rdocs: list[dict] = []
    pdict_merged: dict[str, dict] = {}
    seen_ids: set[str] = set()
    page = 1
    while True:
        sep = "&" if "?" in query else "?"
        data = client.get_json(f"{query}{sep}page={page}")
        rdocs = data.get("rdocs") or []
        for pid, pinfo in (data.get("pdict") or {}).items():
            pdict_merged[str(pid)] = pinfo
        if not rdocs:
            break
        new_in_page = 0
        for r in rdocs:
            rid = str(r.get("_id"))
            if rid not in seen_ids:
                seen_ids.add(rid)
                all_rdocs.append(r)
                new_in_page += 1
        if len(rdocs) < 100 or new_in_page == 0 or page >= 30:
            break
        page += 1
    return all_rdocs, pdict_merged


def collect_activities(client: HydroClient, user_tdocs: list[dict], uname: str = "") -> list[dict]:
    """仅采集属于该学生的活动：/user/<uid> 个人页列出的全部作业与比赛，
    再补充 /homework 中标题含学生姓名的作业，避免混入未参加的全站公开比赛。"""
    by_id: dict[str, dict] = {}
    for t in user_tdocs:
        tid = str(t.get("docId") or t.get("_id"))
        by_id[tid] = {
            "tid": tid,
            "title": t.get("title", ""),
            "rule": t.get("rule", ""),
            "beginAt": t.get("beginAt"),
            "endAt": t.get("endAt"),
        }

    # Supplement from /homework pages if any personalized homework wasn't in user_tdocs
    page = 1
    while page <= 5:
        try:
            data = client.get_json(f"/homework?page={page}")
        except Exception:
            break
        tdocs = data.get("tdocs") or []
        if not tdocs:
            break
        for t in tdocs:
            tid = str(t.get("docId") or t.get("_id"))
            title = t.get("title", "")
            if tid not in by_id and (not uname or uname in title):
                by_id[tid] = {
                    "tid": tid,
                    "title": title,
                    "rule": t.get("rule", "homework"),
                    "beginAt": t.get("beginAt"),
                    "endAt": t.get("endAt"),
                }
        tpcount = data.get("tpcount") or 1
        if page >= tpcount:
            break
        page += 1

    return list(by_id.values())


def generate_summary(
    uid: int,
    profile_data: dict,
    activities: list[dict],
    records: list[dict],
    pdict: dict[str, dict],
    days: int,
    md_path: Path,
) -> None:
    udoc = profile_data.get("udoc") or {}
    uname = udoc.get("uname", f"uid{uid}")
    tags = profile_data.get("tags") or []
    knowledge = (profile_data.get("lbProfileKnowledge") or {}).get("groups") or []

    all_verdicts = Counter(status_name(r.get("status")) for r in records)
    now_ts = time.time()
    cutoff = now_ts - days * 86400

    recent_recs = []
    for r in records:
        ts = r.get("judgeAt")
        if ts:
            try:
                epoch = datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
            except Exception:
                epoch = 0
        else:
            epoch = 0
        if epoch >= cutoff:
            recent_recs.append(r)

    recent_verdicts = Counter(status_name(r.get("status")) for r in recent_recs)

    hw_list = [a for a in activities if a.get("kind") == "homework"]
    ct_list = [a for a in activities if a.get("kind") == "contest"]

    # Aggregate problems across all homeworks & contests
    unsubmitted_hw: list[tuple[str, str, str, list[str]]] = []
    unfinished_hw: list[tuple[str, str, str, int, int, list[str]]] = []
    prob_sub_counts: Counter[str] = Counter()
    prob_fail_counts: Counter[str] = Counter()
    tag_fail_counts: Counter[str] = Counter()
    tag_attempt_probs: defaultdict[str, set[str]] = defaultdict(set)

    for r in records:
        pid = str(r.get("pid"))
        st = status_name(r.get("status"))
        prob_sub_counts[pid] += 1
        pinfo = pdict.get(pid) or {}
        ptags = pinfo.get("tag") or []
        for tg in ptags:
            tag_attempt_probs[tg].add(pid)
            if st != "AC":
                tag_fail_counts[tg] += 1
        if st != "AC":
            prob_fail_counts[pid] += 1

    for a in activities:
        title = a.get("title", "")
        for p in a.get("problems", []):
            pid = str(p["pid"])
            ptitle = p.get("title", "")
            ptags = p.get("tags", [])
            subs = p.get("submissions", 0)
            best = p.get("bestScore")
            if subs == 0:
                unsubmitted_hw.append((a.get("dateSort", ""), title, f"{pid} {ptitle}", ptags))
            elif (best is None or best < 100) and p.get("bestStatus") != "AC":
                unfinished_hw.append(
                    (a.get("dateSort", ""), title, f"{pid} {ptitle}", best or 0, subs, ptags)
                )

    unsubmitted_hw.sort(key=lambda x: x[0], reverse=True)
    unfinished_hw.sort(key=lambda x: x[0], reverse=True)

    lines = [
        f"# 信奥李拜天 OJ 全量同步汇总（{uname} / UID `{uid}`）",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **账号统计**：已通过 **{udoc.get('nAccept', len(profile_data.get('pdocs') or []))}** 题 | RP `{udoc.get('rp', '-')}`",
        f"- **本次抓取范围**：作业 **{len(hw_list)}** 次、比赛 **{len(ct_list)}** 场、去重提交记录共 **{len(records)}** 条（含公共 + 作业 + 比赛）",
        "- **全历史提交结果分布**：" + (", ".join(f"`{k}`: {v}" for k, v in all_verdicts.most_common()) or "无"),
        f"- **近 {days} 天提交数**：{len(recent_recs)} 次（"
        + (", ".join(f"`{k}`: {v}" for k, v in recent_verdicts.most_common()) or "无")
        + "）",
        "",
        "## 一、站内知识图谱通过分布（`lbProfileKnowledge`）",
        "",
        "| 知识模块 | 已过题数 | 细项分布（仅列 >0 项） |",
        "| :--- | ---: | :--- |",
    ]

    for g in knowledge:
        subs_str = []
        for ch in g.get("children") or []:
            if ch.get("count", 0) > 0:
                subs_str.append(f"{ch['name']}({ch['count']})")
        lines.append(f"| {g.get('name')} | {g.get('count', 0)} | {', '.join(subs_str) or '-'} |")

    lines.extend([
        "",
        "## 二、高频已过标签 Top 20",
        "",
        ", ".join(f"`{t[0]}`({t[1]})" for t in tags[:20]) if tags else "无",
        "",
        "## 三、非 AC 高摩擦标签 Top 15（按非 AC 提交次数排序）",
        "",
        "| 标签 | 涉及尝试题数 | 非 AC 提交总数 |",
        "| :--- | ---: | ---: |",
    ])
    for tg, cnt in tag_fail_counts.most_common(15):
        lines.append(f"| {tg} | {len(tag_attempt_probs[tg])} | {cnt} |")

    lines.extend([
        "",
        f"## 四、已提交但未满分题目（共 {len(unfinished_hw)} 题，按活动时间倒序）",
        "",
        "| 活动名称 | 题目 | 最高分 | 提交次数 | 标签 |",
        "| :--- | :--- | ---: | ---: | :--- |",
    ])
    for _, act, pname, best, subs, ptags in unfinished_hw[:40]:
        lines.append(f"| {act} | {pname} | {best} | {subs} | {', '.join(ptags[:4])} |")

    lines.extend([
        "",
        f"## 五、作业/比赛中未提交题目（共 {len(unsubmitted_hw)} 题，按活动时间倒序，显示前 40 题）",
        "",
        "| 活动名称 | 题目 | 标签 |",
        "| :--- | :--- | :--- |",
    ])
    for _, act, pname, ptags in unsubmitted_hw[:40]:
        lines.append(f"| {act} | {pname} | {', '.join(ptags[:4])} |")

    lines.extend([
        "",
        "## 六、近期活动完成度一览（最近 20 场作业/比赛）",
        "",
        "| 类型 | 活动名称 | 开始/最近时间 | 题数 | AC 题数 | 未满分 | 未提交 | 总提交 |",
        "| :---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: |",
    ])
    for a in sorted(activities, key=lambda x: x.get("dateSort", ""), reverse=True)[:20]:
        probs = a.get("problems") or []
        n_ac = sum(1 for p in probs if p.get("bestStatus") == "AC" or p.get("bestScore") == 100)
        n_unsub = sum(1 for p in probs if p.get("submissions", 0) == 0)
        n_part = len(probs) - n_ac - n_unsub
        n_subs = sum(p.get("submissions", 0) for p in probs)
        lines.append(
            f"| {a.get('kind')} | {a.get('title')} | {a.get('dateSort', '-')[:10]} "
            f"| {len(probs)} | {n_ac} | {n_part} | {n_unsub} | {n_subs} |"
        )

    lines.extend([
        "",
        "## 七、最近 30 条提交明细",
        "",
        "| 时间 | 题目 | 分数 | 结果 | 耗时(ms) | 所属作业/比赛 |",
        "| :--- | :--- | ---: | :---: | ---: | :--- |",
    ])
    tid_to_title = {a["tid"]: a["title"] for a in activities}
    sorted_recs = sorted(records, key=lambda x: x.get("judgeAt") or "", reverse=True)
    for r in sorted_recs[:30]:
        pid = str(r.get("pid"))
        ptitle = (pdict.get(pid) or {}).get("title", "")
        cid = str(r.get("contest") or "")
        act_name = tid_to_title.get(cid, "-") if cid and cid != "000000000000000000000000" else "-"
        tm = round(r.get("time") or 0)
        lines.append(
            f"| {parse_iso_local(r.get('judgeAt'))} | `{pid}` {ptitle} | {r.get('score', '-')} "
            f"| `{status_name(r.get('status'))}` | {tm} | {act_name} |"
        )

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="全量同步信奥李拜天 OJ（Hydro）学习数据")
    parser.add_argument("--uid", type=int, default=79, help="用户 UID（默认 79）")
    parser.add_argument("--days", type=int, default=30, help="近期统计窗口天数（默认 30）")
    parser.add_argument("--chrome-profile", default="Default", help="Chrome 配置目录（默认 Default）")
    parser.add_argument("--cookie", help="可选：手动传入 Cookie 头")
    args = parser.parse_args()

    cookie = args.cookie or chrome_cookie_header(args.chrome_profile)
    client = HydroClient(cookie, delay=0.12)

    print(f"1/4 拉取用户主页 /user/{args.uid} ...")
    profile = client.get_json(f"/user/{args.uid}")
    if not profile.get("udoc"):
        raise RuntimeError("未能获取用户信息，请检查登录会话。")

    pdict_all: dict[str, dict] = {}
    for p in profile.get("pdocs") or []:
        pid = str(p.get("docId") or p.get("_id"))
        pdict_all[pid] = {
            "pid": pid,
            "title": p.get("title", ""),
            "tag": p.get("tag") or [],
        }

    print(f"2/4 拉取公共提交记录 /record?uidOrName={args.uid} ...")
    records_by_id: dict[str, dict] = {}
    gen_rdocs, gen_pdict = fetch_all_records_for_query(client, f"/record?uidOrName={args.uid}")
    for pid, pinfo in gen_pdict.items():
        pdict_all.setdefault(str(pid), {}).update(
            {"pid": str(pid), "title": pinfo.get("title", ""), "tag": pinfo.get("tag") or []}
        )
    for r in gen_rdocs:
        records_by_id[str(r["_id"])] = r
    print(f"   公共提交共 {len(gen_rdocs)} 条。")

    uname = (profile.get("udoc") or {}).get("uname", "")
    raw_acts = collect_activities(client, profile.get("tdocs") or [], uname=uname)
    print(f"3/4 拉取全部 {len(raw_acts)} 个作业与比赛明细及专属提交 ...")
    enriched_acts: list[dict] = []

    for idx, act in enumerate(raw_acts, 1):
        tid = act["tid"]
        kind = "homework" if act.get("rule") == "homework" else "contest"
        detail = None
        for try_kind in (kind, "contest" if kind == "homework" else "homework"):
            try:
                detail = client.get_json(f"/{try_kind}/{tid}")
                kind = try_kind
                break
            except Exception:
                continue
        if not detail:
            continue

        tdoc = detail.get("tdoc") or {}
        tsdoc = detail.get("tsdoc") or {}
        act_pdict = detail.get("pdict") or {}
        for pid, pinfo in act_pdict.items():
            pdict_all[str(pid)] = {
                "pid": str(pid),
                "title": pinfo.get("title", ""),
                "tag": pinfo.get("tag") or [],
            }

        # Fetch all records belonging to this activity for uid
        try:
            act_rdocs, rec_pdict = fetch_all_records_for_query(
                client, f"/record?tid={tid}&uidOrName={args.uid}"
            )
        except Exception:
            act_rdocs, rec_pdict = [], {}

        for pid, pinfo in rec_pdict.items():
            pdict_all.setdefault(str(pid), {}).update(
                {"pid": str(pid), "title": pinfo.get("title", ""), "tag": pinfo.get("tag") or []}
            )

        recs_by_pid: defaultdict[str, list[dict]] = defaultdict(list)
        for r in act_rdocs:
            records_by_id[str(r["_id"])] = r
            recs_by_pid[str(r.get("pid"))].append(r)

        # Also check tsdoc.detail / journal for scores
        ts_detail = tsdoc.get("detail") or {}
        pids = [str(x) for x in (tdoc.get("pids") or act_pdict.keys())]

        prob_entries = []
        for pid in pids:
            precs = recs_by_pid.get(pid, [])
            pmeta = pdict_all.get(pid) or act_pdict.get(pid) or {}
            best_score = None
            best_status = None
            if precs:
                best_rec = max(precs, key=lambda x: (x.get("score") or 0, 1 if x.get("status") == 1 else 0))
                best_score = best_rec.get("score")
                best_status = status_name(best_rec.get("status"))
            elif pid in ts_detail:
                best_score = ts_detail[pid].get("score")
                best_status = status_name(ts_detail[pid].get("status"))

            prob_entries.append({
                "pid": pid,
                "title": pmeta.get("title", ""),
                "tags": pmeta.get("tag") or [],
                "submissions": len(precs),
                "bestScore": best_score,
                "bestStatus": best_status,
                "verdicts": [status_name(x.get("status")) for x in sorted(precs, key=lambda z: z.get("judgeAt") or "")],
            })

        date_sort = tdoc.get("beginAt") or tsdoc.get("startAt") or ""
        enriched_acts.append({
            "tid": tid,
            "kind": kind,
            "title": tdoc.get("title") or act.get("title", ""),
            "rule": tdoc.get("rule") or act.get("rule", ""),
            "beginAt": tdoc.get("beginAt"),
            "endAt": tdoc.get("endAt"),
            "startAt": tsdoc.get("startAt"),
            "dateSort": date_sort,
            "problems": prob_entries,
        })
        if idx % 15 == 0 or idx == len(raw_acts):
            print(f"   进度: {idx}/{len(raw_acts)} (累计去重提交 {len(records_by_id)} 条)")

    print("4/4 保存数据与生成汇总报告 ...")
    SYNC_DIR.mkdir(parents=True, exist_ok=True)
    pdoc_ids = {str(p.get("docId") or p.get("_id")) for p in (profile.get("pdocs") or [])}
    extra_pdocs = [
        {"pid": pid, "title": info.get("title", ""), "tag": info.get("tag") or []}
        for pid, info in pdict_all.items()
        if pid not in pdoc_ids and info.get("title")
    ]
    profile_slim = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "udoc": profile.get("udoc"),
        "sdoc": profile.get("sdoc"),
        "tags": profile.get("tags"),
        "lbProfileKnowledge": profile.get("lbProfileKnowledge"),
        "pdocs": [
            {
                "pid": str(p.get("docId") or p.get("_id")),
                "title": p.get("title", ""),
                "tag": p.get("tag") or [],
            }
            for p in (profile.get("pdocs") or [])
        ],
        "extraPdocs": extra_pdocs,
    }
    all_records = sorted(records_by_id.values(), key=lambda x: x.get("judgeAt") or "")

    (SYNC_DIR / f"oilibaitian_uid{args.uid}_profile.json").write_text(
        json.dumps(profile_slim, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (SYNC_DIR / f"oilibaitian_uid{args.uid}_activities.json").write_text(
        json.dumps(enriched_acts, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (SYNC_DIR / f"oilibaitian_uid{args.uid}_records.json").write_text(
        json.dumps(all_records, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    md_path = SYNC_DIR / f"oilibaitian_uid{args.uid}_summary.md"
    generate_summary(args.uid, profile_slim, enriched_acts, all_records, pdict_all, args.days, md_path)

    print(f"✅ 信奥李拜天全量同步完成：活动 {len(enriched_acts)} 场，去重提交 {len(all_records)} 条！")
    print(f"📄 汇总已生成: {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
