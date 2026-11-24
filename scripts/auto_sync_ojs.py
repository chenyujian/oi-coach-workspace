#!/usr/bin/env python3
"""
Mac mini 常驻中枢 —— 四平台 OJ 定时增量抓题总管脚本（零 Token 消耗）。
依次执行：
  1. AtCoder 增量抓取（公开 API）
  2. 好吧平台增量抓取（.env.local HAOBA_USERNAME / HAOBA_PASSWORD）
  3. 信奥李拜天 OJ 增量抓取（.env.local OILIBAITIAN_USERNAME / OILIBAITIAN_PASSWORD）
  4. 洛谷增量抓取（Chrome 会话或 .env.local LUOGU_COOKIE；过期时静默跳过不阻断）
  5. 重建跨站去重全量时间线（build_timeline.py）
  6. 增量缓存新增未过题的原题面与最新 .cpp 源码（cache_problem_context.py --incremental）
  7. 若 --git-push 开启且检测到真实提交数据新增，仅定向提交数据文件并推送到 origin/main（绝不触碰家长未提交的开发代码！）

用法：
    python3 scripts/auto_sync_ojs.py [--git-push]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

REPO_ROOT = Path(__file__).resolve().parent.parent
CACHE_STATE = REPO_ROOT / ".dsh" / "cache" / "last_oj_sync.json"


def resolve_python_for(need_crypto: bool = False) -> str:
    if need_crypto:
        for cand in ("/opt/homebrew/bin/python3.14", "/opt/homebrew/bin/python3.13", "/opt/homebrew/bin/python3"):
            if Path(cand).exists():
                return cand
    return sys.executable or "/usr/bin/python3"


def snapshot_json_digest() -> str:
    """计算四平台核心 JSON 记录与题面缓存的摘要，忽略纯 Markdown 时间戳行变化。"""
    h = hashlib.sha256()
    targets = sorted((REPO_ROOT / "training" / "sync_logs").glob("*.json")) + sorted(
        (REPO_ROOT / "training" / "problem_cache").glob("*.json")
    )
    for p in targets:
        if p.name == "oilibaitian_uid79_profile.json":
            # fetchedAt timestamp changes every run; strip fetchedAt before hashing
            try:
                obj = json.loads(p.read_text(encoding="utf-8"))
                obj.pop("fetchedAt", None)
                h.update(json.dumps(obj, sort_keys=True, ensure_ascii=False).encode("utf-8"))
                continue
            except Exception:
                pass
        h.update(p.name.encode("utf-8"))
        h.update(p.read_bytes())
    return h.hexdigest()


def run_step(label: str, cmd: list[str], timeout: int = 150) -> dict:
    t0 = time.time()
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        out = ((proc.stdout or "") + "\n" + (proc.stderr or "")).strip()
        ok = proc.returncode == 0
        print(f"[{'OK' if ok else 'WARN'}] {label} ({time.time() - t0:.1f}s)")
        if out:
            for line in out.splitlines()[-4:]:
                print(f"    {line}")
        return {"label": label, "ok": ok, "seconds": round(time.time() - t0, 1), "summary": out.splitlines()[-1] if out else ""}
    except Exception as exc:
        print(f"[WARN] {label} failed: {exc}")
        return {"label": label, "ok": False, "seconds": round(time.time() - t0, 1), "summary": str(exc)}


def has_real_json_changes_vs_head(git_bin: str) -> bool:
    """检查相对于 Git HEAD 是否存在真实的 JSON 数据变更（自动忽略仅 fetchedAt 变动的 profile.json）。"""
    st = subprocess.run(
        [git_bin, "status", "--porcelain", "--", "training/sync_logs", "training/problem_cache"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        check=False,
    )
    for raw_line in (st.stdout or "").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        rel_path = line[2:].strip().strip('"')
        if not rel_path.endswith(".json"):
            continue
        if rel_path == "training/sync_logs/oilibaitian_uid79_profile.json":
            try:
                head_proc = subprocess.run(
                    [git_bin, "show", f"HEAD:{rel_path}"],
                    cwd=str(REPO_ROOT),
                    capture_output=True,
                    text=True,
                    check=False,
                )
                if head_proc.returncode == 0:
                    head_obj = json.loads(head_proc.stdout)
                    cur_obj = json.loads((REPO_ROOT / rel_path).read_text(encoding="utf-8"))
                    head_obj.pop("fetchedAt", None)
                    cur_obj.pop("fetchedAt", None)
                    if head_obj == cur_obj:
                        continue
            except Exception:
                pass
        return True
    return False


def scoped_git_push_if_changed() -> str:
    git_bin = shutil.which("git") or "/usr/bin/git"
    git_env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    data_paths = [
        "training/sync_logs",
        "training/problem_cache",
        "profile/activity_timeline.md",
        "profile/solved_timeline.md",
    ]
    try:
        st = subprocess.run(
            [git_bin, "status", "--porcelain", "--", *data_paths],
            cwd=str(REPO_ROOT),
            env=git_env,
            capture_output=True,
            text=True,
            check=False,
        )
        if not (st.stdout or "").strip():
            return "no_new_data"

        fetch = subprocess.run(
            [git_bin, "fetch", "origin", "main"],
            cwd=str(REPO_ROOT),
            env=git_env,
            capture_output=True,
            text=True,
            timeout=45,
            check=False,
        )
        if fetch.returncode != 0:
            return f"fetch_failed: {(fetch.stderr or '').strip()[:120]}"

        rev = subprocess.run(
            [git_bin, "rev-list", "--count", "HEAD..origin/main"],
            cwd=str(REPO_ROOT),
            env=git_env,
            capture_output=True,
            text=True,
            check=False,
        )
        behind = int((rev.stdout or "0").strip() or "0")

        if behind > 0:
            # 检查家长端是否存在 data_paths 之外的未提交开发代码；若有则绝不执行 autostash/rebase 打扰编辑器，留待下次干净状态推送
            all_st = subprocess.run(
                [git_bin, "status", "--porcelain"],
                cwd=str(REPO_ROOT),
                env=git_env,
                capture_output=True,
                text=True,
                check=False,
            )
            outside_dirty = False
            for raw in (all_st.stdout or "").splitlines():
                rel = raw[3:].strip().strip('"')
                if rel and not any(rel == dp or rel.startswith(dp + "/") for dp in data_paths):
                    outside_dirty = True
                    break
            if outside_dirty:
                return "deferred_dirty_worktree"

        subprocess.run([git_bin, "add", "--", *data_paths], cwd=str(REPO_ROOT), env=git_env, check=True)
        msg = f"sync(oj): auto refresh 4-platform submissions {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        subprocess.run([git_bin, "commit", "-m", msg, "--", *data_paths], cwd=str(REPO_ROOT), env=git_env, check=True)

        if behind > 0:
            pull = subprocess.run(
                [git_bin, "pull", "--rebase", "origin", "main"],
                cwd=str(REPO_ROOT),
                env=git_env,
                capture_output=True,
                text=True,
                timeout=60,
                check=False,
            )
            if pull.returncode != 0:
                subprocess.run([git_bin, "rebase", "--abort"], cwd=str(REPO_ROOT), env=git_env, stderr=subprocess.DEVNULL, check=False)
                return f"pull_skipped: {(pull.stderr or '').strip()[:120]}"

        push = subprocess.run([git_bin, "push", "origin", "main"], cwd=str(REPO_ROOT), env=git_env, capture_output=True, text=True, timeout=60)
        return "pushed" if push.returncode == 0 else f"push_failed: {(push.stderr or '').strip()[:120]}"
    except Exception as exc:
        return f"git_busy_or_failed: {str(exc)[:120]}"


def main() -> int:
    parser = argparse.ArgumentParser(description="四平台 OJ 自动增量同步总管")
    parser.add_argument("--git-push", action="store_true", help="检测到真实新提交数据时自动定向推送至 GitHub")
    args = parser.parse_args()

    py_std = resolve_python_for(False)
    py_crypto = resolve_python_for(True)
    git_bin = shutil.which("git") or "/usr/bin/git"

    steps = [
        run_step("AtCoder", [py_std, "scripts/fetch_atcoder.py", "--user", "chenyanxu", "--days", "30"], timeout=45),
        run_step("好吧平台", [py_std, "scripts/fetch_haoba.py", "sync", "--domains", "cpptrain,Cpp2023", "--days", "60"], timeout=150),
        run_step("信奥李拜天", [py_crypto, "scripts/fetch_oilibaitian.py", "--uid", "79", "--days", "30", "--incremental"], timeout=90),
        run_step("洛谷 Luogu", [py_crypto, "scripts/fetch_luogu.py", "--uid", "1346216", "--user", "qiq2015", "--max-pages", "3"], timeout=45),
        run_step("重建跨站时间线", [py_std, "scripts/build_timeline.py"], timeout=45),
    ]

    has_new_submissions = has_real_json_changes_vs_head(git_bin)

    if has_new_submissions:
        steps.append(run_step("增量缓存未过题题面与源码", [py_std, "scripts/cache_problem_context.py", "--incremental"], timeout=90))
    else:
        # 无任何真实 JSON 提交变动时还原纯时间戳行，避免产生无意义脏 diff
        subprocess.run(
            [
                git_bin,
                "checkout",
                "--",
                "training/sync_logs/atcoder_chenyanxu_summary.md",
                "training/sync_logs/haoba_uid957_summary.md",
                "training/sync_logs/oilibaitian_uid79_summary.md",
                "training/sync_logs/oilibaitian_uid79_profile.json",
                "training/sync_logs/luogu_qiq2015_summary.md",
                "profile/activity_timeline.md",
                "profile/solved_timeline.md",
            ],
            cwd=str(REPO_ROOT),
            stderr=subprocess.DEVNULL,
            check=False,
        )

    git_result = "skipped"
    if args.git_push and has_new_submissions:
        git_result = scoped_git_push_if_changed()

    CACHE_STATE.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
        "hasNewSubmissions": has_new_submissions,
        "gitResult": git_result,
        "steps": steps,
    }
    CACHE_STATE.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ 四平台自动同步结束：hasNewSubmissions={has_new_submissions}, git={git_result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
