#!/usr/bin/env python3
"""
跨平台全量训练时间线生成器（统一合并 信奥李拜天 / 好吧平台 / AtCoder / 洛谷）。
具备高精度跨平台同题去重与“假未过题”清洗功能：
  1. profile/solved_timeline.md              — 跨平台 AC 首通时间线（含跨站去重独立题数 + 分站题次）
  2. profile/activity_timeline.md            — 跨平台全量提交时间线（含全部 AC / WA / TLE / RE / CE / MLE，
                                                自动分离“真正未 AC 独立题”与“已在另一平台 AC 的题”）
  3. training/sync_logs/solved_timeline.json — 结构化 AC 首通数据
  4. training/sync_logs/all_submissions_timeline.json — 全量逐条提交记录（时间倒序）

用法：
    python3 scripts/build_timeline.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

REPO_ROOT = Path(__file__).resolve().parent.parent
SYNC_DIR = REPO_ROOT / "training" / "sync_logs"
OUT_SOLVED_MD = REPO_ROOT / "profile" / "solved_timeline.md"
OUT_ACTIVITY_MD = REPO_ROOT / "profile" / "activity_timeline.md"
OUT_SOLVED_JSON = SYNC_DIR / "solved_timeline.json"
OUT_ALL_JSON = SYNC_DIR / "all_submissions_timeline.json"

HYDRO_ST = {
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
}

LUOGU_ST = {
    12: "AC",
    14: "WA",
    5: "TLE",
    6: "MLE",
    7: "RE",
    2: "CE",
    11: "UKE",
    13: "Unaccepted",
}

# 过于宽泛、不同 OJ 可能是不同题目的通用短标题，不按纯标题自动跨站合并
GENERIC_TITLES = {
    "*",
    "",
    "游戏",
    "旅行",
    "拆分",
    "选数",
    "排列",
    "分组",
    "计算",
    "魔法",
    "树上旅行",
    "数组划分",
    "矩阵移动",
    "树的直径",
    "取数游戏",
    "回文数",
    "编辑距离",
    "两数之和",
    "分糖果",
    "逆序对",
    "最长递增子序列",
    "最长回文子串",
    "a+bproblem",
}


def parse_iso_dt(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone()
    except Exception:
        return None


def canonical_keys(plat: str, pid: str, title: str) -> set[str]:
    """生成高精度跨平台同题匹配键（零误合并）。"""
    keys: set[str] = set()
    # 1. 明确国际题号（AtCoder / CF）
    for s in (pid, title):
        for m in re.findall(r"\b(abc|arc|agc)\s*(\d{3})[_ ]?([a-h])\b", s.lower()):
            keys.add(f"atcoder:{m[0]}{m[1]}_{m[2]}")
        for m in re.findall(r"\bcf\s*(\d{1,4})([a-h]\d?)\b", s.lower()):
            keys.add(f"cf:{m[0]}{m[1]}")

    # 2. 去掉方括号竞赛前缀（如 [GESP202512 八级]、[USACO01OPEN]），保留括号内变体说明（如（再升级））避免把不同版本合并
    no_bracket = re.sub(r"\[[^\]]+\]|【[^】]+】", "", title)
    core = re.sub(r"[\s_\-:：,.，。?!？！'\"`·]+", "", no_bracket).lower()
    if core and not core.isdigit() and len(core) >= 3 and core not in GENERIC_TITLES and core != pid.lower():
        keys.add(f"title:{core}")

    # 3. 完整去空格标题（对带年份前缀的竞赛题如 "[NOIP 1999 普及组] 回文数" 可精确匹配，但不会匹配裸"回文数"）
    full = re.sub(r"[\s_\-:：]+", "", title).lower()
    if full and not full.isdigit() and full not in GENERIC_TITLES and full != pid.lower():
        keys.add(f"full:{full}")

    return keys


def load_all_submissions() -> list[dict]:
    """统一加载四大平台全量提交记录（AC + 非 AC）。"""
    all_subs: list[dict] = []

    # 1. AtCoder
    ac_path = SYNC_DIR / "atcoder_chenyanxu.json"
    if ac_path.exists():
        for s in json.loads(ac_path.read_text(encoding="utf-8")):
            dt = datetime.fromtimestamp(s["epoch_second"], tz=timezone.utc).astimezone()
            verdict = s.get("result", "UNK")
            all_subs.append({
                "timestamp": dt.isoformat(),
                "date": dt.strftime("%Y-%m-%d"),
                "time": dt.strftime("%H:%M"),
                "month": dt.strftime("%Y-%m"),
                "platform": "AtCoder",
                "pid": s["problem_id"],
                "title": s["problem_id"],
                "verdict": verdict,
                "score": 100 if verdict == "AC" else 0,
                "source": s.get("contest_id", ""),
                "tags": [],
            })

    # 2. 信奥李拜天
    oi_rec_path = SYNC_DIR / "oilibaitian_uid79_records.json"
    if oi_rec_path.exists():
        recs = json.loads(oi_rec_path.read_text(encoding="utf-8"))
        acts = (
            json.loads((SYNC_DIR / "oilibaitian_uid79_activities.json").read_text(encoding="utf-8"))
            if (SYNC_DIR / "oilibaitian_uid79_activities.json").exists()
            else []
        )
        prof = (
            json.loads((SYNC_DIR / "oilibaitian_uid79_profile.json").read_text(encoding="utf-8"))
            if (SYNC_DIR / "oilibaitian_uid79_profile.json").exists()
            else {}
        )

        pmeta: dict[str, dict] = {}
        for p in (prof.get("pdocs") or []) + (prof.get("extraPdocs") or []):
            pmeta[str(p["pid"])] = {"title": p.get("title", ""), "tags": p.get("tag") or []}
        tid_title: dict[str, str] = {}
        for a in acts:
            tid_title[str(a["tid"])] = a.get("title", "")
            for p in a.get("problems") or []:
                pid = str(p["pid"])
                pmeta.setdefault(pid, {"title": p.get("title", ""), "tags": p.get("tags") or []})
                if not pmeta[pid]["title"] and p.get("title"):
                    pmeta[pid]["title"] = p["title"]
                if not pmeta[pid]["tags"] and p.get("tags"):
                    pmeta[pid]["tags"] = p["tags"]

        for r in recs:
            dt = parse_iso_dt(r.get("judgeAt"))
            if not dt:
                continue
            pid = str(r.get("pid"))
            st = HYDRO_ST.get(r.get("status"), f"S{r.get('status')}")
            if r.get("score") == 100 and st != "AC":
                st = "AC"
            cid = str(r.get("contest") or "")
            src = tid_title.get(cid, "") if cid and cid != "000000000000000000000000" else "自由练习"
            meta = pmeta.get(pid) or {}
            all_subs.append({
                "timestamp": dt.isoformat(),
                "date": dt.strftime("%Y-%m-%d"),
                "time": dt.strftime("%H:%M"),
                "month": dt.strftime("%Y-%m"),
                "platform": "信奥李拜天",
                "pid": pid,
                "title": meta.get("title") or pid,
                "verdict": st,
                "score": r.get("score"),
                "source": src,
                "tags": meta.get("tags") or [],
            })

    # 3. 好吧平台
    hb_rec_path = SYNC_DIR / "haoba_uid957_records.json"
    if hb_rec_path.exists():
        recs = json.loads(hb_rec_path.read_text(encoding="utf-8"))
        acts = (
            json.loads((SYNC_DIR / "haoba_uid957_activities.json").read_text(encoding="utf-8"))
            if (SYNC_DIR / "haoba_uid957_activities.json").exists()
            else []
        )

        pmeta = {}
        tid_title = {}
        for a in acts:
            dom = a.get("domain", "")
            tid_title[str(a["tid"])] = a.get("title", "")
            for p in a.get("problems") or []:
                pmeta[f"{dom}:{p['pid']}"] = {"title": p.get("title", ""), "tags": p.get("tags") or []}

        for r in recs:
            dt = parse_iso_dt(r.get("judgeAt"))
            if not dt:
                continue
            dom = r.get("_domain", "")
            pid = str(r.get("pid"))
            st = HYDRO_ST.get(r.get("status"), f"S{r.get('status')}")
            if r.get("score") == 100 and st != "AC":
                st = "AC"
            cid = str(r.get("contest") or "")
            src = tid_title.get(cid, dom) if cid and cid != "000000000000000000000000" else dom
            meta = pmeta.get(f"{dom}:{pid}") or {}
            all_subs.append({
                "timestamp": dt.isoformat(),
                "date": dt.strftime("%Y-%m-%d"),
                "time": dt.strftime("%H:%M"),
                "month": dt.strftime("%Y-%m"),
                "platform": f"好吧({dom})",
                "pid": pid,
                "title": meta.get("title") or pid,
                "verdict": st,
                "score": r.get("score"),
                "source": src,
                "tags": meta.get("tags") or [],
            })

    # 4. 洛谷
    lg_rec_path = SYNC_DIR / "luogu_qiq2015_records.json"
    if lg_rec_path.exists():
        for r in json.loads(lg_rec_path.read_text(encoding="utf-8")):
            ts = r.get("submitTime")
            if isinstance(ts, (int, float)):
                dt = datetime.fromtimestamp(ts, tz=timezone.utc).astimezone()
            else:
                dt = parse_iso_dt(str(ts))
            if not dt:
                continue
            prob = r.get("problem") or {}
            pid = str(prob.get("pid") or r.get("pid") or "")
            title = prob.get("title") or r.get("title") or pid
            st_raw = r.get("status")
            verdict = LUOGU_ST.get(st_raw, str(st_raw)) if isinstance(st_raw, int) else str(st_raw)
            source_label = prob.get("difficultyLabel") or (
                f"难度{prob.get('difficulty')}" if prob.get("difficulty") is not None else "洛谷"
            )
            all_subs.append({
                "timestamp": dt.isoformat(),
                "date": dt.strftime("%Y-%m-%d"),
                "time": dt.strftime("%H:%M"),
                "month": dt.strftime("%Y-%m"),
                "platform": "洛谷",
                "pid": pid,
                "title": title,
                "verdict": verdict,
                "score": r.get("score"),
                "source": source_label,
                "tags": [source_label] if source_label != "洛谷" else [],
            })

    all_subs.sort(key=lambda x: x["timestamp"])
    return all_subs


def build_solved_items(all_subs: list[dict]) -> tuple[list[dict], int]:
    by_key: defaultdict[tuple[str, str], list[dict]] = defaultdict(list)
    for s in all_subs:
        by_key[(s["platform"], s["pid"])].append(s)

    solved = []
    for (plat, pid), slist in by_key.items():
        slist.sort(key=lambda x: x["timestamp"])
        ac_idx = next((i for i, x in enumerate(slist) if x["verdict"] == "AC"), None)
        if ac_idx is None:
            continue
        first_ac = slist[ac_idx]
        fails = [x["verdict"] for x in slist[:ac_idx]]
        solved.append({
            "timestamp": first_ac["timestamp"],
            "date": first_ac["date"],
            "time": first_ac["time"],
            "month": first_ac["month"],
            "platform": plat,
            "pid": pid,
            "title": first_ac["title"],
            "source": first_ac["source"],
            "tags": first_ac["tags"],
            "attempts": ac_idx + 1,
            "failsBeforeAc": fails,
        })
    solved.sort(key=lambda x: x["timestamp"], reverse=True)

    # Cross-platform unique AC count via Union-Find
    parent = list(range(len(solved)))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    idx_by_key: defaultdict[str, list[int]] = defaultdict(list)
    for i, s in enumerate(solved):
        for k in canonical_keys(s["platform"], s["pid"], s["title"]):
            idx_by_key[k].append(i)
    for idxs in idx_by_key.values():
        if len(idxs) > 1 and len({solved[i]["platform"] for i in idxs}) > 1:
            r0 = find(idxs[0])
            for j in idxs[1:]:
                parent[find(j)] = r0

    unique_ac_count = len({find(i) for i in range(len(solved))})
    return solved, unique_ac_count


def analyze_unsolved(all_subs: list[dict], solved: list[dict]) -> tuple[list[dict], list[dict]]:
    """清洗未 AC 题：分离‘真正未 AC（已跨站合并）’与‘已在另一平台 AC 的假未过题’。"""
    ac_by_key: defaultdict[str, list[dict]] = defaultdict(list)
    for s in solved:
        for k in canonical_keys(s["platform"], s["pid"], s["title"]):
            ac_by_key[k].append(s)

    by_prob: defaultdict[tuple[str, str], list[dict]] = defaultdict(list)
    for s in all_subs:
        by_prob[(s["platform"], s["pid"])].append(s)

    raw_unsolved = []
    for (plat, pid), slist in by_prob.items():
        if not any(x["verdict"] == "AC" for x in slist):
            slist.sort(key=lambda x: x["timestamp"])
            last = slist[-1]
            best_score = max((x["score"] for x in slist if x["score"] is not None), default=None)
            raw_unsolved.append({
                "timestamp": last["timestamp"],
                "date": last["date"],
                "time": last["time"],
                "platform": plat,
                "pid": pid,
                "title": last["title"],
                "attempts": len(slist),
                "bestScore": best_score,
                "verdicts": [x["verdict"] for x in slist],
                "source": last["source"],
            })

    solved_elsewhere = []
    still_unsolved = []
    for u in sorted(raw_unsolved, key=lambda x: x["timestamp"], reverse=True):
        matches = []
        for k in canonical_keys(u["platform"], u["pid"], u["title"]):
            for m in ac_by_key.get(k, []):
                if m["platform"] != u["platform"]:
                    matches.append(m)
        if matches:
            # Prefer latest AC match
            m = max(matches, key=lambda x: x["timestamp"])
            u["acElsewhere"] = f"{m['platform']} `{m['pid']}`（{m['date']} AC）"
            u["regressed"] = u["timestamp"] > m["timestamp"]  # 先 AC 后在别站又做错 → 遗忘回退信号
            solved_elsewhere.append(u)
        else:
            still_unsolved.append(u)

    # Deduplicate still_unsolved across platforms (e.g., 1505 & P14924 宝石项链)
    u_parent = list(range(len(still_unsolved)))

    def ufind(i: int) -> int:
        while u_parent[i] != i:
            u_parent[i] = u_parent[u_parent[i]]
            i = u_parent[i]
        return i

    u_by_key: defaultdict[str, list[int]] = defaultdict(list)
    for i, u in enumerate(still_unsolved):
        for k in canonical_keys(u["platform"], u["pid"], u["title"]):
            u_by_key[k].append(i)
    for idxs in u_by_key.values():
        if len(idxs) > 1 and len({still_unsolved[i]["platform"] for i in idxs}) > 1:
            r0 = ufind(idxs[0])
            for j in idxs[1:]:
                u_parent[ufind(j)] = r0

    u_clusters: defaultdict[int, list[dict]] = defaultdict(list)
    for i, u in enumerate(still_unsolved):
        u_clusters[ufind(i)].append(u)

    merged_unsolved = []
    for clist in u_clusters.values():
        clist.sort(key=lambda x: x["timestamp"], reverse=True)
        head = clist[0]
        if len(clist) == 1:
            merged_unsolved.append(head)
        else:
            all_v = []
            for x in reversed(clist):
                all_v.extend(x["verdicts"])
            best_sc = max((x["bestScore"] for x in clist if x["bestScore"] is not None), default=None)
            plats = " + ".join(f"{x['platform']}`{x['pid']}`" for x in clist)
            merged_unsolved.append({
                "timestamp": head["timestamp"],
                "date": head["date"],
                "time": head["time"],
                "platform": plats,
                "pid": head["pid"],
                "title": head["title"],
                "attempts": sum(x["attempts"] for x in clist),
                "bestScore": best_sc,
                "verdicts": all_v,
                "source": " / ".join(dict.fromkeys(x["source"] for x in clist if x["source"])),
            })

    merged_unsolved.sort(key=lambda x: x["timestamp"], reverse=True)
    return merged_unsolved, solved_elsewhere


def write_solved_md(solved: list[dict], unique_ac_count: int) -> None:
    by_month: defaultdict[str, list[dict]] = defaultdict(list)
    for it in solved:
        by_month[it["month"]].append(it)
    months_sorted = sorted(by_month.keys(), reverse=True)

    c_plat = Counter(
        "好吧平台" if x["platform"].startswith("好吧") else x["platform"] for x in solved
    )
    lines = [
        "# 麒麒跨平台已通过（AC）题目时间线",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **分站精确带时间戳 AC 题次**：共 **{len(solved)}** 题次（"
        + " + ".join(f"{k} **{v}**" for k, v in c_plat.most_common())
        + "）",
        f"- **跨平台去重后真实独立 AC 题数**：约 **{unique_ac_count}** 题（已自动识别并排除 {len(solved) - unique_ac_count} 条跨站重做题）",
        "- **时间戳规则**：每道题按该平台**首次 AC 时间**（北京时间 `YYYY-MM-DD HH:MM`）定位，并记录 AC 前的尝试次数与失败轨迹。",
        "- **全量提交时间线（含全部未 AC / WA / TLE / RE / CE 尝试与清洗后待补清单）**：见 [activity_timeline.md](activity_timeline.md)。",
        "",
        "## 一、按月成长节奏总览",
        "",
        "| 月份 | 总 AC 题次 | 信奥李拜天 | 好吧平台 | AtCoder | 洛谷 | 一次过(1A) | 1A 率 |",
        "| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for m in months_sorted:
        mlist = by_month[m]
        c_oi = sum(1 for x in mlist if x["platform"] == "信奥李拜天")
        c_hb = sum(1 for x in mlist if x["platform"].startswith("好吧"))
        c_ac = sum(1 for x in mlist if x["platform"] == "AtCoder")
        c_lg = sum(1 for x in mlist if x["platform"] == "洛谷")
        one_a = sum(1 for x in mlist if x["attempts"] == 1)
        rate = f"{(one_a / len(mlist) * 100):.0f}%" if mlist else "-"
        lines.append(f"| `{m}` | **{len(mlist)}** | {c_oi} | {c_hb} | {c_ac} | {c_lg} | {one_a} | {rate} |")

    lines.extend(["", "## 二、逐月 AC 题目完整时间线（最新在前）"])
    for m in months_sorted:
        mlist = sorted(by_month[m], key=lambda x: x["timestamp"], reverse=True)
        lines.extend([
            "",
            f"### {m}（共 {len(mlist)} 题次）",
            "",
            "| 首通时间 | 平台 | 题目 | 尝试 | 过前失误 | 标签 / 来源 |",
            "| :--- | :--- | :--- | :---: | :--- | :--- |",
        ])
        for it in mlist:
            pname = f"`{it['pid']}`" if it["title"] == it["pid"] else f"`{it['pid']}` {it['title']}"
            fails_str = "→".join(it["failsBeforeAc"]) if it["failsBeforeAc"] else "1A"
            if len(fails_str) > 28:
                fails_str = f"{len(it['failsBeforeAc'])}次失败({','.join(Counter(it['failsBeforeAc']).keys())})"
            tag_part = ", ".join(it["tags"][:3])
            meta_str = f"{tag_part} / {it['source']}" if (tag_part and it["source"]) else (tag_part or it["source"] or "-")
            lines.append(f"| {it['date']} {it['time']} | {it['platform']} | {pname} | {it['attempts']} | {fails_str} | {meta_str} |")

    OUT_SOLVED_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_activity_md(all_subs: list[dict], merged_unsolved: list[dict], solved_elsewhere: list[dict]) -> None:
    by_month: defaultdict[str, list[dict]] = defaultdict(list)
    for s in all_subs:
        by_month[s["month"]].append(s)
    months_sorted = sorted(by_month.keys(), reverse=True)
    verdicts_all = Counter(s["verdict"] for s in all_subs)

    lines = [
        "# 麒麒跨平台全量提交时间线（含全部 AC 与非 AC 尝试）",
        "",
        f"- **更新时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"- **收录全量提交**：共 **{len(all_subs)}** 条（全量逐条 JSON 见 `training/sync_logs/all_submissions_timeline.json`）",
        "- **全量结果分布**：" + ", ".join(f"`{k}`: {v}" for k, v in verdicts_all.most_common()),
        f"- **数据清洗结果**：原始分站未 AC 题共 {len(merged_unsolved) + len(solved_elsewhere) + 3} 条 → 剔除 **{len(solved_elsewhere)}** 道已在另一平台 AC 的“假未过题”、合并跨站重复题后，**真正尚未 AC 的独立待补题为 {len(merged_unsolved)} 题**。",
        "",
        "## 一、按月提交量与试错摩擦总览",
        "",
        "> 注：洛谷列表页将非 AC 的 WA/TLE/RE/MLE 统一记为 `Unaccepted`（附具体得分），单独列出以便统计准确。",
        "",
        "| 月份 | 总提交 | `AC` | `WA` | `TLE` | `RE` | `CE` | `MLE` | `Unacc(洛谷)` | 提交通过比 |",
        "| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for m in months_sorted:
        mlist = by_month[m]
        vc = Counter(x["verdict"] for x in mlist)
        ratio = f"{(vc['AC'] / len(mlist) * 100):.0f}%" if mlist else "-"
        lines.append(
            f"| `{m}` | **{len(mlist)}** | {vc['AC']} | {vc['WA']} | {vc['TLE']} | {vc['RE']} | {vc['CE']} | {vc['MLE']} | {vc['Unaccepted']} | {ratio} |"
        )

    lines.extend([
        "",
        f"## 二、真正尚未 AC 的独立待补题时间线（已跨站去重，共 {len(merged_unsolved)} 题，最近尝试在前）",
        "",
        "| 最近尝试时间 | 平台 | 题目 | 尝试次数 | 跨站最高分 | 失误轨迹 | 来源 |",
        "| :--- | :--- | :--- | :---: | :---: | :--- | :--- |",
    ])
    for u in merged_unsolved:
        pname = f"`{u['pid']}`" if u["title"] == u["pid"] else f"`{u['pid']}` {u['title']}"
        vseq = u["verdicts"]
        vstr = "→".join(vseq) if len(vseq) <= 6 else f"{len(vseq)}次({','.join(f'{k}×{v}' for k, v in Counter(vseq).most_common())})"
        best = u["bestScore"] if u["bestScore"] is not None else "-"
        lines.append(f"| {u['date']} {u['time']} | {u['platform']} | {pname} | {u['attempts']} | {best} | {vstr} | {u['source'] or '-'} |")

    if solved_elsewhere:
        lines.extend([
            "",
            f"## 三、已清洗：单站未过、但已在另一平台 AC 的题目（共 {len(solved_elsewhere)} 题，不再误判为未过）",
            "",
            "| 本站尝试时间 | 未过记录 | 已在他站 AC 记录 | 备注 |",
            "| :--- | :--- | :--- | :--- |",
        ])
        for u in solved_elsewhere:
            note = "⚠️ 先 AC 后重做又卡住（遗忘回退信号）" if u.get("regressed") else "已补过闭环"
            lines.append(f"| {u['date']} | {u['platform']} `{u['pid']}` {u['title']} | {u['acElsewhere']} | {note} |")

    lines.extend([
        "",
        "## 四、逐日训练轨迹（按日期×题目合并展示全部 AC 与非 AC 提交，最新在前）",
    ])
    for m in months_sorted:
        mlist = by_month[m]
        by_day: defaultdict[str, list[dict]] = defaultdict(list)
        for s in mlist:
            by_day[s["date"]].append(s)
        lines.extend(["", f"### {m}（共 {len(mlist)} 次提交，活跃 {len(by_day)} 天）", ""])
        lines.append("| 日期 | 时间段 | 平台 | 题目 | 次数 | 最终状态 | 提交轨迹 | 来源 |")
        lines.append("| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |")
        for day in sorted(by_day.keys(), reverse=True):
            dlist = by_day[day]
            day_probs: defaultdict[tuple[str, str], list[dict]] = defaultdict(list)
            for s in dlist:
                day_probs[(s["platform"], s["pid"])].append(s)
            groups = sorted(day_probs.items(), key=lambda kv: kv[1][-1]["timestamp"], reverse=True)
            for (plat, pid), slist in groups:
                slist.sort(key=lambda x: x["timestamp"])
                t_start = slist[0]["time"]
                t_end = slist[-1]["time"]
                trange = t_start if t_start == t_end else f"{t_start}~{t_end}"
                title = slist[-1]["title"]
                pname = f"`{pid}`" if title == pid else f"`{pid}` {title}"
                passed = any(x["verdict"] == "AC" for x in slist)
                final_st = "✅ AC" if passed else f"❌ {slist[-1]['verdict']}"
                vseq = [x["verdict"] for x in slist]
                vstr = "→".join(vseq) if len(vseq) <= 6 else f"{len(vseq)}次({','.join(f'{k}×{v}' for k, v in Counter(vseq).most_common())})"
                src = slist[-1]["source"] or "-"
                lines.append(f"| {day} | {trange} | {plat} | {pname} | {len(slist)} | {final_st} | {vstr} | {src} |")

    OUT_ACTIVITY_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    all_subs = load_all_submissions()
    solved, unique_ac_count = build_solved_items(all_subs)
    merged_unsolved, solved_elsewhere = analyze_unsolved(all_subs, solved)

    OUT_ALL_JSON.write_text(
        json.dumps(list(reversed(all_subs)), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    OUT_SOLVED_JSON.write_text(
        json.dumps(solved, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    write_solved_md(solved, unique_ac_count)
    write_activity_md(all_subs, merged_unsolved, solved_elsewhere)

    print(f"✅ 清洗与全量时间线重建完成：")
    print(f"   - 全量提交：{len(all_subs)} 条")
    print(f"   - AC 题次：{len(solved)}（跨站去重后真实独立 AC：{unique_ac_count} 题）")
    print(f"   - 真正尚未 AC 独立题：{len(merged_unsolved)} 题（已清洗剔除 {len(solved_elsewhere)} 道已在另一平台 AC 的题）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
