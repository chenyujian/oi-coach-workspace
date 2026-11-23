window.__ModuleLoader__.load({
  id: 'dsh-oi-coach',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const API = '/dsh-oi-coach/api'
    const PANEL_ID = 'oi-coach-board'
    const STYLE_ID = 'dsh-oi-coach-styles'

    const C = {
      text: 'var(--dsw-alias-label-primary)',
      sub: 'var(--dsw-alias-label-secondary)',
      border: 'var(--dsw-alias-border-l1)',
      layer: 'var(--dsw-alias-bg-layer-2)',
      base: 'var(--dsw-alias-bg-base)',
      accent: 'var(--dsw-alias-brand-primary)',
      err: 'var(--dsw-alias-state-error-primary)',
      ok: 'var(--dsw-alias-state-success-primary)',
      warn: 'var(--dsw-alias-state-warn-primary)',
    }

    const MATH_PRIMERS = [
      {
        id: 'combo-mod',
        title: '微卡片 1 · 组合计数与取模律',
        tag: '衔接 838 计算系数 / 794 手套配对',
        term: '标准挂牌：乘法原理 / 组合数 C(n,m) / 模运算分配律',
        questions: [
          {
            q: '从 5 个不同小球里选 2 个（不看顺序），演草纸列一列一共有几种选法？',
            options: ['A. 10 种', 'B. 20 种', 'C. 25 种'],
            ans: 0,
            explain: '先选第一个有 5 种、第二个有 4 种，但 (1,2) 和 (2,1) 算同一种，所以 5×4÷2 = 10，这就是 C(5,2)。',
          },
          {
            q: '算 (1000000000 × 1000000000) % 10007，先乘再取模会爆 long long 吗？',
            options: ['A. 不会爆', 'B. 会爆，应该先各自 % 10007 再相乘再取模'],
            ans: 1,
            explain: '10^9 × 10^9 = 10^18 接近上限，若三个数连乘必爆！乘法取模满足 (a×b)%p = ((a%p)×(b%p))%p。',
          },
          {
            q: '杨辉三角里，C(n, m) 等于上一行的哪两个数相加？',
            options: ['A. C(n-1, m-1) + C(n-1, m)', 'B. C(n-1, m) + C(n-1, m+1)'],
            ans: 0,
            explain: '选不选第 n 个元素：选了就从前 n-1 个再选 m-1 个；不选就从前 n-1 个选 m 个。',
          },
        ],
      },
      {
        id: 'tree-diff',
        title: '微卡片 2 · 树上路径与差分抵消',
        tag: '衔接 1171 / 806 松鼠的新家 / 799 割裂',
        term: '标准挂牌：树上距离 dist(u,v) = dep[u]+dep[v]-2·dep[lca] / 树上点差分',
        questions: [
          {
            q: '一棵树上 u 的深度是 5，v 的深度是 4，它们的最近公共祖先 lca 深度是 2，u 到 v 经过几条边？',
            options: ['A. 5 条', 'B. 7 条', 'C. 9 条'],
            ans: 0,
            explain: '5 + 4 - 2×2 = 5 条边！lca 到根的那段被算了两次，减掉 2×dep[lca] 刚好抵消。',
          },
          {
            q: '想给 u 到 v 路径上每个点都 +1（树上点差分），除了 d[u]++, d[v]++, d[lca]--，还需要对谁 -1？',
            options: ['A. d[fa[lca]]--', 'B. 不用再减了'],
            ans: 0,
            explain: '子树求和时 lca 自己会收到 u 和 v 传上来的 2，减一次剩 1 刚好留给 lca；再往上传到 fa[lca] 必须清零，所以 d[fa[lca]]--！',
          },
          {
            q: '如果题目问 10^5 次树上路径加 1，最后只查一次每个点的值，最稳的复杂度是？',
            options: ['A. 每次暴力跳父亲 O(Q·N)', 'B. 树上差分 + 最后一次 DFS 汇总 O(Q log N + N)'],
            ans: 1,
            explain: '离线批量修改最后统一汇总，差分把每次 O(N) 降成 O(log N) 求 LCA + O(1) 打标记！',
          },
        ],
      },
      {
        id: 'contrib-shift',
        title: '微卡片 3 · 整体平移与拆贡献',
        tag: '衔接 ABC C/D 思维题 / 机器人翻转',
        term: '标准挂牌：拆贡献（乘法分配律）/ 前后缀最值预处理',
        questions: [
          {
            q: '数组 [2, 5, 3] 所有连续子数组长度总和怎么算更快？问“中间的 5 一共出现在几个子数组里”：',
            options: ['A. 3 个', 'B. 4 个', 'C. 6 个'],
            ans: 1,
            explain: '左端点有 2 种选法（下标 1 或 2），右端点有 2 种选法（下标 2 或 3），共 2×2 = 4 个！不用枚举所有区间就能算出每个数的贡献。',
          },
          {
            q: '机器人第 i 步本来向右走 +3，如果把这一步翻成向左走 -3，后面所有位置会整体变化多少？',
            options: ['A. 全部减 3', 'B. 全部减 6（即 -2×3）'],
            ans: 1,
            explain: '从 +3 变成 -3，净变化是 -6！画数轴最不容易错，这就是“单点修改→后缀整体平移”。',
          },
          {
            q: '当 N = 2×10^5 时，两层 for 循环枚举所有区间 [L, R] 会运行约多少次？',
            options: ['A. 2×10^5 次，稳过', 'B. 2×10^10 次，必 TLE'],
            ans: 1,
            explain: '超过 10^8 就会超时！看到 N ≥ 10^5，第一反应立刻找前缀和、双指针或拆贡献降到 O(N) / O(N log N)。',
          },
        ],
      },
      {
        id: 'invariant-parity',
        title: '微卡片 4 · 奇偶性与操作不变量',
        tag: '衔接 ABC C 构造题 / 操作判定题',
        term: '标准挂牌：不变量（Invariant）/ 奇偶性守恒',
        questions: [
          {
            q: '黑板上有 3 个数 [1, 2, 4]，每次允许挑两个数同时加 1。不管怎么操作，这三个数的什么性质死活不会变？',
            options: ['A. 总和的奇偶性（永远是奇数）', 'B. 最大值和最小值的差'],
            ans: 0,
            explain: '每次总和 +2，所以总和的奇偶性永远不变！想让它们最后全相等（比如都变成偶/奇）时，先查总和奇偶性就能秒判无解。',
          },
          {
            q: '相邻交换数组里的两个元素，每交换一次“逆序对个数”的奇偶性会怎么变？',
            options: ['A. 保持不变', 'B. 每次必定翻转（奇变偶、偶变奇）'],
            ans: 1,
            explain: '相邻交换必然使逆序对 +1 或 -1，所以奇偶性严格每次翻转，这是排列构造题超常用的不变量！',
          },
          {
            q: '看不出任何算法模板的思维题，动笔写代码前第一步最该做什么？',
            options: ['A. 先写个暴力交上去看看分', 'B. 在演草本画 N=3 和 N=4 的小例子，盯“什么没变”'],
            ans: 1,
            explain: '小表实验找不变量，3 分钟草稿纸往往省掉 30 分钟连环 WA！',
          },
        ],
      },
      {
        id: 'greedy-exchange',
        title: '微卡片 5 · 邻项交换与反例证伪',
        tag: '衔接 P1080 国王游戏 / EDPC dp_x',
        term: '标准挂牌：邻项交换法（Exchange Argument）/ 极小反例检验',
        questions: [
          {
            q: '有两个任务相邻排在一起，想知道“谁排前面更优”，最稳的推导方法是？',
            options: ['A. 凭感觉按耗时从小到大排', 'B. 只写这两个任务的表达式，比较 (1在前) 和 (2在前) 谁更优'],
            ans: 1,
            explain: '这就是你过蓝题 P1080 国王游戏和 dp_x 用过的神技——邻项交换法！只看相邻两个，立刻得出精确排序条件。',
          },
          {
            q: '猜出一个贪心策略后，如果连交 2 次 WA，最有效的一步是？',
            options: ['A. 微调一下小于号成小于等于再交一次', 'B. 停手！找一组 N ≤ 4 的小数据，拿暴力答案和贪心答案对拍'],
            ans: 1,
            explain: '贪心错通常在 N=3 或 N=4 就能抓到现行反例，绝不靠盲改赌运气！',
          },
          {
            q: '在贪心/最优化题里，为什么要单独测“全相同 / N=1 / 全负数”？',
            options: ['A. 这些极值边界最容易把初始化 0 或特判逻辑打穿', 'B. 只是形式要求'],
            ans: 0,
            explain: '就像之前最大子矩阵和全负数时 ans=0 会错输出 0，极小边界永远是出题人最爱埋的坑！',
          },
        ],
      },
    ]

    const DOC_SHORTCUTS = [
      { path: 'profile/learning_journey.md', title: '30 个月完整成长路径', desc: '从 9 岁启蒙到六年级八级攻坚的七阶段轨迹' },
      { path: 'profile/reports/2026-11-22-full-diagnosis.md', title: '四平台全局诊断报告（Argon 终审版）', desc: '四维弱点雷达、核心习惯指标与家长配合清单' },
      { path: 'profile/habits_and_bugs.md', title: '高频老毛病与习惯库（H-01 ~ H-09）', desc: '含 21:15 深夜盲交、遗忘回退与防坑自查口诀' },
      { path: 'profile/skill_matrix.md', title: '四维知识点掌握矩阵', desc: '区分短期突击与隔月留存的真实掌握状态' },
      { path: 'profile/activity_timeline.md', title: '全量 2,705 条提交时间线', desc: '含全部 AC/非 AC 轨迹与清洗后 88 道真正待补题' },
      { path: 'profile/solved_timeline.md', title: 'AC 首通时间线（去重 734 题）', desc: '精确到分钟的跨平台首通记录与失误轨迹' },
    ]

    const SCOPED_CSS = `
      .oi-root {
        height: 100%;
        overflow-y: auto;
        padding: 20px 24px 36px;
        color: var(--dsw-alias-label-primary);
        box-sizing: border-box;
        font-feature-settings: "cv02", "cv03", "cv04", "cv11";
      }
      .oi-wrap {
        width: 100%;
        max-width: 1320px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
      }
      .oi-card {
        background: var(--dsw-alias-bg-layer-2);
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 12px;
        padding: 16px 18px;
      }
      .oi-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        padding: 6px 12px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease, border-color 0.15s ease;
      }
      .oi-btn:hover { opacity: 0.9; border-color: var(--dsw-alias-brand-primary); }
      .oi-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .oi-btn-primary {
        background: var(--dsw-alias-brand-primary);
        color: #fff;
        border-color: transparent;
      }
      .oi-tab {
        padding: 7px 14px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .oi-tab-active {
        background: var(--dsw-alias-bg-layer-2);
        border-color: var(--dsw-alias-border-l1);
        color: var(--dsw-alias-label-primary);
      }
      .oi-grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
      }
      .oi-grid-2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: 12px;
      }
      .oi-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        border: 1px solid var(--dsw-alias-border-l1);
      }
      .oi-textarea {
        width: 100%;
        min-height: 76px;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        padding: 10px 12px;
        font-size: 13px;
        font-family: inherit;
        resize: vertical;
      }
      .oi-modal-bg {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 24px;
      }
      .oi-modal {
        width: min(920px, 95vw);
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        background: var(--dsw-alias-bg-base);
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        overflow: hidden;
      }
    `

    function ensureStyles() {
      if (document.getElementById(STYLE_ID)) return
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = SCOPED_CSS
      document.head.appendChild(el)
    }

    const navServices = { uiWorkspace: null, layout: null }

    const listeners = new Set()
    let state = {
      loading: true,
      error: null,
      notice: null,
      busy: null,
      tab: 'today',
      data: null,
      intakeText: '',
      useAgyBrain: true,
      agyModel: 'gemini-4-neon-high',
      agyChat: {
        open: false,
        title: '',
        mode: 'coach',
        conversationId: null,
        messages: [],
        draft: '',
        sending: false,
      },
      activePrimerId: 'combo-mod',
      primerAnswers: {},
      docModal: null,
    }

    function setState(patch) {
      state = { ...state, ...patch }
      for (const fn of listeners) fn()
    }

    function useStore() {
      return React.useSyncExternalStore(
        (fn) => {
          listeners.add(fn)
          return () => listeners.delete(fn)
        },
        () => state,
      )
    }

    async function fetchJson(url, options) {
      const res = await fetch(url, { cache: 'no-store', ...options })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || `请求失败 (${res.status})`)
      }
      return json
    }

    async function loadOverview() {
      setState({ loading: !state.data, error: null })
      try {
        const res = await fetchJson(`${API}/overview`)
        setState({ loading: false, data: res.data })
      } catch (err) {
        setState({ loading: false, error: err?.message || String(err) })
      }
    }

    let activeAgyAbort = null
    let agyTimerId = null

    function cancelAgyRequest(clearMessages = false) {
      if (activeAgyAbort) {
        try { activeAgyAbort.abort() } catch { /* ignore */ }
        activeAgyAbort = null
      }
      if (agyTimerId) {
        clearInterval(agyTimerId)
        agyTimerId = null
      }
      setState({
        agyChat: {
          ...state.agyChat,
          sending: false,
          elapsed: 0,
          ...(clearMessages ? { conversationId: null, messages: [], title: '新对话' } : {}),
        },
      })
    }

    async function sendAgyMessage(text, opts = {}) {
      const msg = String(text || '').trim()
      if (!msg) return
      // 若上一轮还在思考，先干净取消旧请求，绝不叠僵尸进程或锁死界面
      if (activeAgyAbort) {
        try { activeAgyAbort.abort() } catch { /* ignore */ }
        activeAgyAbort = null
      }
      if (agyTimerId) {
        clearInterval(agyTimerId)
        agyTimerId = null
      }

      const isNew = Boolean(opts.reset)
      const prev = state.agyChat
      const title = opts.title || (isNew ? msg.slice(0, 20) : prev.title) || 'Antigravity 直连教练'
      const mode = opts.mode || (isNew ? 'coach' : prev.mode) || 'coach'
      const convId = isNew ? null : prev.conversationId
      const baseMsgs = isNew ? [] : prev.messages
      const nextMsgs = [...baseMsgs, { role: 'user', text: msg }]

      const controller = new AbortController()
      activeAgyAbort = controller
      const startedAt = Date.now()
      agyTimerId = setInterval(() => {
        if (activeAgyAbort === controller && state.agyChat.sending) {
          setState({ agyChat: { ...state.agyChat, elapsed: Math.floor((Date.now() - startedAt) / 1000) } })
        }
      }, 1000)

      setState({
        error: null,
        notice: null,
        intakeText: '',
        agyChat: {
          open: true,
          title,
          mode,
          conversationId: convId,
          messages: nextMsgs,
          draft: '',
          sending: true,
          elapsed: 0,
        },
      })

      try {
        const res = await fetchJson(`${API}/agy-chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: msg,
            model: opts.model || state.agyModel || 'gemini-4-neon-high',
            conversationId: convId || undefined,
            mode,
            parentPin: opts.parentPin || undefined,
          }),
        })
        if (activeAgyAbort !== controller) return
        activeAgyAbort = null
        if (agyTimerId) { clearInterval(agyTimerId); agyTimerId = null }
        setState({
          agyChat: {
            ...state.agyChat,
            conversationId: res.conversationId || convId,
            sending: false,
            elapsed: 0,
            messages: [
              ...nextMsgs,
              {
                role: 'assistant',
                text: res.reply || '（空回复）',
                model: res.model,
                duration: res.durationSeconds,
              },
            ],
          },
        })
      } catch (err) {
        if (activeAgyAbort === controller) {
          activeAgyAbort = null
          if (agyTimerId) { clearInterval(agyTimerId); agyTimerId = null }
        }
        if (err?.name === 'AbortError') {
          setState({ agyChat: { ...state.agyChat, sending: false, elapsed: 0 } })
          return
        }
        setState({
          error: `Antigravity 直连失败：${err?.message || err}`,
          agyChat: { ...state.agyChat, sending: false, elapsed: 0 },
        })
      }
    }

    async function launchCoachSession({ presetId = 'oi-coach', title, prompt }) {
      // 当本机 agy CLI 就绪且开启外脑直连时，直接走官方 agy CLI（Gemini 4 Neon High），零本地 CodePlan 配额消耗！
      if (state.data?.agy?.ready && state.useAgyBrain) {
        const wantsParent = !state.data?.isWindows && presetId === 'oi-parent'
        let pin
        if (wantsParent) {
          pin = typeof window !== 'undefined' && window.prompt ? window.prompt('请输入家长口令（4位数字）以进入家长教研模式：') : ''
          if (!pin) return
        }
        await sendAgyMessage(prompt, {
          reset: true,
          title,
          mode: wantsParent ? 'parent' : 'coach',
          parentPin: wantsParent ? String(pin).trim() : undefined,
        })
        return
      }
      setState({ busy: title || 'launching', error: null, notice: null })
      try {
        const res = await fetchJson(`${API}/dispatch`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ presetId, title, prompt }),
        })
        setState({
          busy: null,
          intakeText: '',
          notice: { text: `已开启对话「${res.title}」`, sessionId: res.sessionId },
        })
        if (navServices.uiWorkspace?.openSession && res.sessionId) {
          navServices.uiWorkspace.openSession(res.sessionId)
        }
      } catch (err) {
        setState({ busy: null, error: err?.message || String(err) })
      }
    }

    async function triggerSync(action, label) {
      setState({ busy: `sync:${action}`, error: null, notice: null })
      try {
        const res = await fetchJson(`${API}/sync`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action }),
        })
        setState({
          busy: null,
          notice: { text: `${label}完成！${(res.output || '').split('\n').slice(-1)[0] || ''}` },
        })
        await loadOverview()
      } catch (err) {
        setState({ busy: null, error: `${label}失败：${err?.message || err}` })
      }
    }

    async function openDoc(relPath, title) {
      setState({ docModal: { path: relPath, title: title || relPath, loading: true, content: '', error: null } })
      try {
        const res = await fetchJson(`${API}/doc?path=${encodeURIComponent(relPath)}`)
        setState({ docModal: { path: relPath, title: title || relPath, loading: false, content: res.content, error: null } })
      } catch (err) {
        setState({ docModal: { path: relPath, title: title || relPath, loading: false, content: '', error: err?.message || String(err) } })
      }
    }

    function fmtIsoShort(iso) {
      if (!iso) return '未同步'
      try {
        const d = new Date(iso)
        return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      } catch {
        return iso.slice(0, 16)
      }
    }

    function TodayTab({ data, st }) {
      const clock = data.clock || {}
      const shieldTone = clock.isFatigueZone ? C.warn : clock.isWarningZone ? C.warn : C.ok
      const shieldMsg = clock.isFatigueZone
        ? `🌙 当前 ${clock.timeStr}（已过 21:15 夜间疲劳熔断线）：大脑电量低啦！今晚只复盘不硬刚新难题——记得 1171 和 abc484_c 都是睡一觉明天白天 1 发直接 AC 的！`
        : clock.isWarningZone
          ? `⏰ 当前 ${clock.timeStr}（距离 21:15 收工熔断不到 15 分钟）：准备收尾、存好当前思路断点或错题秘籍卡吧！`
          : `☀️ 当前 ${clock.timeStr} · 精力在线！备好《麒麒的 OI 数学实验本》，先画 N=3/4 小例子再动键盘。`

      const agyReady = Boolean(data.agy?.ready)
      const agyHint = ''

      const handleQuickLaunch = (mode) => {
        const raw = st.intakeText.trim()
        if (!raw) {
          setState({ error: '先在上面输入框粘贴题目编号、链接、题意或报错信息，再点场景按钮哦！' })
          return
        }
        const prompts = {
          hint: `教练你好！我做这道题卡住了，请用 socratic-hint（六年级数学三步快桥 + 低打字摩擦报数/二选一）带我分析，绝不要直接给 AC 代码：${agyHint}\n\n${raw}`,
          wa: `教练你好！我这道题 WA 了，请用 bug-clinic 带我排查（如果我已经连错 2 次请直接给我一组 N<=4 的最小 Hack 反例，绝不要替我改代码）：${agyHint}\n\n${raw}`,
          tle: `教练你好！我这道题超时 TLE 了，请用 bug-clinic 的 4 大隐性 TLE 快筛清单帮我定位瓶颈（绝不要直接给 AC 代码）：${agyHint}\n\n${raw}`,
          re: `教练你好！我这道题 RE/CE 了，请用 bug-clinic 带我自己查出越界/初始化/语法问题：${agyHint}\n\n${raw}`,
          pm: `教练你好！我刚刚把这道题 AC 了！请按 post-mortem 的 3 秒“敲 1 确认”模式直接帮我提炼 3 行通关秘籍卡，我确认后请你调用 save_mistake_card 存入错题库：\n\n${raw}`,
        }
        const labels = { hint: '思路搭桥', wa: 'WA排错', tle: 'TLE快筛', re: 'RE/CE诊所', pm: '3秒复盘' }
        void launchCoachSession({
          presetId: 'oi-coach',
          title: `${labels[mode]} · ${raw.slice(0, 16).replace(/\s+/g, ' ')}`,
          prompt: prompts[mode],
        })
      }

      return h(
        'div',
        { style: { display: 'grid', gap: 16 } },
        // 21:15 Shield Banner
        h(
          'div',
          {
            className: 'oi-card',
            style: {
              borderColor: shieldTone,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            },
          },
          h('div', { style: { fontSize: 13.5, fontWeight: 600, color: C.text } }, shieldMsg),
          h(
            'div',
            { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
            agyReady
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn',
                    style: st.useAgyBrain ? { borderColor: C.ok, color: C.ok } : { color: C.sub },
                    title: '点击切换是否默认调用本机 Antigravity CLI (Gemini 4 Neon High) 专家外脑',
                    onClick: () => setState({ useAgyBrain: !st.useAgyBrain }),
                  },
                  st.useAgyBrain ? '🧠 外脑已开 · Gemini 4 Neon (High)' : '🧠 外脑已关（仅本地模型）',
                )
              : null,
            h('span', { className: 'oi-pill', style: { color: C.accent } }, `近7天 AC ${data.kpis30d.recent7Ac} 题`),
            h('span', { className: 'oi-pill', style: { color: C.sub } }, `AtCoder ${data.student.atcoderRating} (最高表现 ${data.student.atcoderPeakPerf})`),
          ),
        ),

        // Quick Intake Box
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 10 } },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
            h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '📥 新题快速投喂（免写长句，一键呼叫物理只读 OI 教练）'),
            h('span', { style: { fontSize: 12, color: C.sub } }, '物理只读护栏已开启：教练绝不替改源码，只会一步步启发你'),
          ),
          h('textarea', {
            className: 'oi-textarea',
            placeholder: '粘贴题号/题目链接/题面，或者写一句“我写到65分TLE了 + 贴上你的核心代码片段”…',
            value: st.intakeText,
            onChange: (e) => setState({ intakeText: e.target.value }),
          }),
          h(
            'div',
            { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
            h('button', { type: 'button', className: 'oi-btn oi-btn-primary', disabled: !!st.busy, onClick: () => handleQuickLaunch('hint') }, '🧭 没思路 · 数学三步快桥'),
            h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => handleQuickLaunch('wa') }, '🩺 WA 了 · 喂极小反例'),
            h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => handleQuickLaunch('tle') }, '⏱️ TLE 了 · 隐性超时快筛'),
            h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => handleQuickLaunch('re') }, '💥 RE / CE 排查'),
            h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => handleQuickLaunch('pm') }, '🃏 AC 了 · 3秒存秘籍卡'),
          ),
        ),

        // Recent Cleaned Unsolved Problem Wall
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 12 } },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
            h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '🎯 近期待补黄金题墙（已跨四平台清洗去重）'),
            h('span', { style: { fontSize: 12, color: C.sub } }, `共 ${data.totals.trueUnsolved} 道独立待补题，优先闭环近期高分/高频卡点`),
          ),
          h(
            'div',
            { className: 'oi-grid-2' },
            ...(data.unsolvedRecent || []).slice(0, 8).map((p, idx) =>
              h(
                'div',
                {
                  key: `${p.platform}-${p.title}-${idx}`,
                  style: {
                    border: `1px solid ${C.border}`,
                    background: C.base,
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'grid',
                    gap: 8,
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 } },
                  h('div', { style: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.35 } }, p.title),
                  h(
                    'span',
                    {
                      className: 'oi-pill',
                      style: {
                        color: Number(p.bestScore) >= 60 ? C.warn : C.err,
                        whiteSpace: 'nowrap',
                      },
                    },
                    p.bestScore && p.bestScore !== '-' && p.bestScore !== '0' ? `最高 ${p.bestScore} 分` : `${p.attempts} 次未过`,
                  ),
                ),
                h(
                  'div',
                  { style: { fontSize: 12, color: C.sub, display: 'flex', gap: 10, flexWrap: 'wrap' } },
                  h('span', null, `📍 ${p.platform}`),
                  h('span', null, `🕒 ${p.lastTry}`),
                  h('span', null, `轨迹：${p.trajectory}`),
                ),
                h(
                  'div',
                  { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 } },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn oi-btn-primary',
                      disabled: !!st.busy,
                      onClick: () =>
                        launchCoachSession({
                          presetId: 'oi-coach',
                          title: `搭桥 · ${p.title.slice(0, 16)}`,
                          prompt: `教练，我要补这道题：【${p.title}】（平台：${p.platform}，我之前交了 ${p.attempts} 次，最高 ${p.bestScore} 分，轨迹：${p.trajectory}）。请按自适应切入 + 六年级数学三步快桥（低打字摩擦报数/二选一）带我理清核心模型，不要直接给代码。${agyHint}`,
                        }),
                    },
                    '🧭 思路搭桥',
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn',
                      disabled: !!st.busy,
                      onClick: () =>
                        launchCoachSession({
                          presetId: 'oi-coach',
                          title: `排错 · ${p.title.slice(0, 16)}`,
                          prompt: `教练，我在【${p.title}】（平台：${p.platform}，轨迹：${p.trajectory}，最高 ${p.bestScore} 分）上卡住了。请用 bug-clinic（连交急刹车 + 4 大隐性 TLE 快筛）直接给我一组 N<=4 的最小反例或二选一排查问题！${agyHint}`,
                        }),
                    },
                    '🩺 排错诊所',
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn',
                      disabled: !!st.busy,
                      onClick: () =>
                        launchCoachSession({
                          presetId: 'oi-coach',
                          title: `复盘 · ${p.title.slice(0, 16)}`,
                          prompt: `教练，我刚把【${p.title}】（${p.platform}）补过 AC 啦！请按 post-mortem 的 3 秒“敲 1 确认”模式，结合我之前的失误轨迹（${p.trajectory}）帮我生成 3 行通关秘籍卡，等我敲 1 确认后调用 save_mistake_card 存档。`,
                        }),
                    },
                    '🃏 3秒存秘籍',
                  ),
                ),
              ),
            ),
          ),
        ),
      )
    }

    function MathAndMistakesTab({ data, st }) {
      const primer = MATH_PRIMERS.find((p) => p.id === st.activePrimerId) || MATH_PRIMERS[0]

      return h(
        'div',
        { style: { display: 'grid', gap: 16 } },
        // First-Principles Math Modeling Lab Entry Card
        h(
          'div',
          {
            className: 'oi-card',
            style: {
              borderColor: C.accent,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            },
          },
          h(
            'div',
            { style: { display: 'grid', gap: 4 } },
            h('div', { style: { fontWeight: 800, fontSize: 15 } }, '🧭 麒麒的 OI 读题与建模训练营（第 1 关已开放）'),
            h(
              'div',
              { style: { fontSize: 12.5, color: C.sub } },
              '动手玩明白（字母盒子 / 拼图拆括号 / 天平解方程 / 数轴翻号与划相同块）＋ 边做边讲小测验 ＋ 一键打印 A4 闯关单',
            ),
          ),
          h(
            'a',
            {
              href: '/dsh-oi-coach/math-lab',
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'oi-btn oi-btn-primary',
              style: { textDecoration: 'none' },
            },
            '🚀 打开交互网页 & 打印作业单',
          ),
        ),
        // Interactive Math Micro-Primer
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 12 } },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
            h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '🧮 周三课前「15 分钟六年级数学微卡片」（纯手算 · 配演草本）'),
            h('span', { style: { fontSize: 12, color: C.sub } }, '不写代码！先打通前置数学直觉 + 标准术语挂牌'),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
            ...MATH_PRIMERS.map((p) =>
              h(
                'button',
                {
                  key: p.id,
                  type: 'button',
                  className: `oi-btn ${p.id === primer.id ? 'oi-btn-primary' : ''}`,
                  onClick: () => setState({ activePrimerId: p.id }),
                },
                p.title.replace(/^微卡片 \d+ · /, ''),
              ),
            ),
          ),
          h(
            'div',
            {
              style: {
                border: `1px solid ${C.border}`,
                background: C.base,
                borderRadius: 10,
                padding: '14px 16px',
                display: 'grid',
                gap: 12,
              },
            },
            h(
              'div',
              { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
              h(
                'div',
                null,
                h('div', { style: { fontWeight: 700, fontSize: 14 } }, primer.title),
                h('div', { style: { fontSize: 12, color: C.sub, marginTop: 2 } }, `${primer.tag} ｜ ${primer.term}`),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'oi-btn',
                  disabled: !!st.busy,
                  onClick: () =>
                    launchCoachSession({
                      presetId: 'oi-coach',
                      title: `微卡片 · ${primer.title.slice(6)}`,
                      prompt: `教练，我刚在学习台做了「${primer.title}」（${primer.term}）。请再出 1 道六年级能用演草本 2 分钟手算完的小变形题考考我，只需让我报 1 个数字，不要长篇大论！`,
                    }),
                },
                '✨ 让教练再出 1 道变形小手算',
              ),
            ),
            ...primer.questions.map((item, qi) => {
              const key = `${primer.id}:${qi}`
              const picked = st.primerAnswers[key]
              const answered = picked !== undefined
              const isRight = picked === item.ans
              return h(
                'div',
                {
                  key,
                  style: {
                    borderTop: qi > 0 ? `1px solid ${C.border}` : 'none',
                    paddingTop: qi > 0 ? 12 : 0,
                    display: 'grid',
                    gap: 8,
                  },
                },
                h('div', { style: { fontSize: 13.5, fontWeight: 600 } }, `Q${qi + 1}. ${item.q}`),
                h(
                  'div',
                  { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                  ...item.options.map((opt, oi) =>
                    h(
                      'button',
                      {
                        key: oi,
                        type: 'button',
                        className: 'oi-btn',
                        style:
                          answered && oi === item.ans
                            ? { borderColor: C.ok, color: C.ok }
                            : answered && oi === picked && !isRight
                              ? { borderColor: C.err, color: C.err }
                              : undefined,
                        onClick: () =>
                          setState({ primerAnswers: { ...st.primerAnswers, [key]: oi } }),
                      },
                      opt,
                    ),
                  ),
                ),
                answered
                  ? h(
                      'div',
                      {
                        style: {
                          fontSize: 12.5,
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: C.layer,
                          color: isRight ? C.ok : C.warn,
                        },
                      },
                      `${isRight ? '✅ 答对了！' : '💡 差一点！'} ${item.explain}`,
                    )
                  : null,
              )
            }),
          ),
        ),

        // Cold-start retention review queue
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 12 } },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
            h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '🔁 每周「隔月旧题冷启动重斩」（专治遗忘回退）'),
            h('span', { style: { fontSize: 12, color: C.sub } }, '自动挑出 1~5 个月前交 ≥4 次才过的高摩擦旧题，3 分钟演草本口述检验'),
          ),
          h(
            'div',
            { className: 'oi-grid-3' },
            ...(data.retentionQueue || []).map((item, idx) =>
              h(
                'div',
                {
                  key: `${item.platform}-${item.pid}-${idx}`,
                  style: {
                    border: `1px solid ${C.border}`,
                    background: C.base,
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'grid',
                    gap: 6,
                  },
                },
                h('div', { style: { fontWeight: 700, fontSize: 13 } }, `${item.pid} ${item.title === item.pid ? '' : item.title}`),
                h('div', { style: { fontSize: 12, color: C.sub } }, `${item.platform} · ${item.date}（${item.ageDays} 天前 · 当时交了 ${item.attempts} 次）`),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn',
                    disabled: !!st.busy,
                    style: { justifySelf: 'start', marginTop: 4 },
                    onClick: () =>
                      launchCoachSession({
                        presetId: 'oi-coach',
                        title: `旧题重斩 · ${item.pid}`,
                        prompt: `教练，我想做每周 3 分钟旧题冷启动重斩！题目是 ${item.platform} 的 ${item.pid} ${item.title}（我 ${item.ageDays} 天前交了 ${item.attempts} 次才过）。请不要剧透解法，用 1~2 个极简二选一或填空问题考考我：不看旧代码，我还记不记得它的核心模型和最容易错的边界？`,
                      }),
                  },
                  '⚡ 3分钟冷启动口述检验',
                ),
              ),
            ),
          ),
        ),

        // Mistake Cards Wall
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 12 } },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
            h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, `🃏 通关秘籍错题墙（mistakes/ 共 ${data.mistakeCards.length} 张）`),
            h('span', { style: { fontSize: 12, color: C.sub } }, '每次 AC 后点「3秒存秘籍」，敲 1 确认自动挂到这里'),
          ),
          data.mistakeCards.length === 0
            ? h('div', { style: { fontSize: 13, color: C.sub, padding: '8px 0' } }, '还没有存入第一张通关秘籍卡！今晚或明天 AC 第一道题时，点「3秒存秘籍」试试看～')
            : h(
                'div',
                { className: 'oi-grid-3' },
                ...data.mistakeCards.map((c) =>
                  h(
                    'div',
                    {
                      key: c.file,
                      onClick: () => openDoc(c.file, c.title),
                      style: {
                        border: `1px solid ${C.border}`,
                        background: C.base,
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        display: 'grid',
                        gap: 6,
                      },
                    },
                    h(
                      'div',
                      { style: { display: 'flex', justifyContent: 'space-between', gap: 8 } },
                      h('span', { style: { fontWeight: 700, fontSize: 13 } }, c.title),
                      h('span', { className: 'oi-pill', style: { color: C.accent } }, c.dimension),
                    ),
                    c.motto ? h('div', { style: { fontSize: 12, color: C.sub } }, `口诀：${c.motto}`) : null,
                  ),
                ),
              ),
        ),
      )
    }

    function GrowthArchiveTab({ data, st }) {
      const k = data.kpis30d
      return h(
        'div',
        { style: { display: 'grid', gap: 16 } },
        // Argon 3 Goodhart-proof KPIs
        h(
          'div',
          { className: 'oi-grid-3' },
          h(
            'div',
            { className: 'oi-card', style: { display: 'grid', gap: 6 } },
            h('div', { style: { fontSize: 12, color: C.sub, fontWeight: 600 } }, '指标 1 · 近 30 天失控连交率（单题 ≥4 交）'),
            h(
              'div',
              { style: { fontSize: 28, fontWeight: 800, color: k.runawayRate > 15 ? C.warn : C.ok } },
              `${k.runawayRate}%`,
            ),
            h('div', { style: { fontSize: 12, color: C.sub } }, `${k.runawayProbs}/${k.probsAttempted} 题出现 ≥4 次提交 ｜ 目标 ≤ 15%`),
          ),
          h(
            'div',
            { className: 'oi-card', style: { display: 'grid', gap: 6 } },
            h('div', { style: { fontSize: 12, color: C.sub, fontWeight: 600 } }, '指标 2 · 近 30 天编译错误（零 CE 底线）'),
            h(
              'div',
              { style: { fontSize: 28, fontWeight: 800, color: k.ceCount > 1 ? C.err : C.ok } },
              `${k.ceCount} 次`,
            ),
            h('div', { style: { fontSize: 12, color: C.sub } }, `同期总提交 ${k.submissions} 次（TLE ${k.tleCount} 次）｜ 目标全月 ≤ 1 次`),
          ),
          h(
            'div',
            { className: 'oi-card', style: { display: 'grid', gap: 6 } },
            h('div', { style: { fontSize: 12, color: C.sub, fontWeight: 600 } }, '指标 3 · 21:15 深夜疲劳提交警报（近 30 天）'),
            h(
              'div',
              { style: { fontSize: 28, fontWeight: 800, color: k.lateShare > 15 ? C.err : C.ok } },
              `${k.lateCount} 交 (${k.lateShare}%)`,
            ),
            h('div', { style: { fontSize: 12, color: C.sub } }, `深夜 AC 仅 ${k.lateAc} 次（通过率 ${k.lateAcRate}%）｜ 21:15 必须停机`),
          ),
        ),

        // 4-Platform Sync Console
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 12 } },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
            h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, `📡 四平台全量底座（共 ${data.totals.submissions} 交 · 去重 ${data.totals.uniqueAc} 独立 AC）`),
            h(
              'div',
              { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
              !data.isWindows
                ? h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('atcoder', '同步 AtCoder') }, st.busy === 'sync:atcoder' ? '同步中…' : '🔄 同步 AtCoder')
                : null,
              !data.isWindows
                ? h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('haoba', '同步好吧平台') }, st.busy === 'sync:haoba' ? '同步中…' : '🔄 同步好吧')
                : null,
              !data.isWindows
                ? h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('timeline', '重建时间线') }, st.busy === 'sync:timeline' ? '重建中…' : '⏱️ 重建时间线')
                : null,
              h('button', { type: 'button', className: 'oi-btn oi-btn-primary', disabled: !!st.busy, onClick: () => triggerSync('git-sync', 'Git 双机同步') }, st.busy === 'sync:git-sync' ? '同步中…' : '☁️ 一键 Git 同步'),
              !data.isWindows
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn',
                      disabled: !!st.busy,
                      onClick: () =>
                        launchCoachSession({
                          presetId: 'oi-parent',
                          title: '家长教研 · 周期诊断',
                          prompt: '请结合 profile/ 与 training/sync_logs/ 的最新四平台数据，按 parent-diagnosis 技能与 3 项核心习惯指标，帮我分析麒麒最近一周的进展、21:15 深夜提交情况与下周最该补的 2 个薄弱点。',
                        }),
                    },
                    '📊 呼叫家长教研官',
                  )
                : null,
            ),
          ),
          h(
            'div',
            { className: 'oi-grid-2' },
            ...(data.platforms || []).map((pl) =>
              h(
                'div',
                {
                  key: pl.id,
                  style: {
                    border: `1px solid ${C.border}`,
                    background: C.base,
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  },
                },
                h(
                  'div',
                  null,
                  h('div', { style: { fontWeight: 700, fontSize: 13.5 } }, `${pl.name}（${pl.account}）`),
                  h('div', { style: { fontSize: 12, color: C.sub, marginTop: 2 } }, `总提交 ${pl.submissions} 条 · AC ${pl.solved} 题`),
                ),
                h('span', { style: { fontSize: 11.5, color: C.sub } }, `更新：${fmtIsoShort(pl.updatedAt)}`),
              ),
            ),
          ),
        ),

        // Core Docs Reader
        h(
          'div',
          { className: 'oi-card', style: { display: 'grid', gap: 12 } },
          h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '📚 核心长期记忆与诊断档案（点击直读）'),
          h(
            'div',
            { className: 'oi-grid-3' },
            ...DOC_SHORTCUTS.map((doc) =>
              h(
                'div',
                {
                  key: doc.path,
                  onClick: () => openDoc(doc.path, doc.title),
                  style: {
                    border: `1px solid ${C.border}`,
                    background: C.base,
                    borderRadius: 10,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: 4,
                  },
                },
                h('div', { style: { fontWeight: 700, fontSize: 13 } }, doc.title),
                h('div', { style: { fontSize: 12, color: C.sub } }, doc.desc),
              ),
            ),
          ),
        ),
      )
    }

    function AgyChatPanel({ st }) {
      const chat = st.agyChat
      if (!chat?.open) return null
      return h(
        'div',
        {
          className: 'oi-card',
          style: {
            borderColor: C.accent,
            display: 'grid',
            gap: 12,
          },
        },
        h(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
          h(
            'div',
            null,
            h('div', { style: { fontWeight: 800, fontSize: 14.5 } }, `🧠 Antigravity 直连教练 · ${chat.title || '新对话'}`),
            h(
              'div',
              { style: { fontSize: 12, color: C.sub, marginTop: 2 } },
              `官方 agy CLI 直连（零 CodePlan 消耗 · 物理只读 --mode plan）｜当前模型：${st.agyModel}`,
            ),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
            h(
              'select',
              {
                value: st.agyModel,
                onChange: (e) => setState({ agyModel: e.target.value }),
                style: {
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.base,
                  color: C.text,
                  padding: '5px 8px',
                  fontSize: 12,
                },
              },
              h('option', { value: 'gemini-4-neon-high' }, 'Gemini 4 Neon (High · 深度思考)'),
              h('option', { value: 'gemini-4-neon-medium' }, 'Gemini 4 Neon (Medium · 均衡快速)'),
              h('option', { value: 'gemini-4-argon-high' }, 'Gemini 4 Argon (High · 独立审计)'),
              h('option', { value: 'gemini-4-hydrogen-high' }, 'Gemini 4 Hydrogen (High)'),
              h('option', { value: 'gemini-3.8-flash-high' }, 'Gemini 3.8 Flash (High · 极速)'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'oi-btn',
                onClick: () => cancelAgyRequest(true),
              },
              '清空重聊',
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'oi-btn',
                onClick: () => {
                  cancelAgyRequest(false)
                  setState({ agyChat: { ...state.agyChat, open: false, sending: false, elapsed: 0 } })
                },
              },
              '收起',
            ),
          ),
        ),

        // Message list
        h(
          'div',
          {
            style: {
              maxHeight: 420,
              overflowY: 'auto',
              display: 'grid',
              gap: 10,
              padding: '4px 2px',
            },
          },
          ...chat.messages.map((m, idx) =>
            h(
              'div',
              {
                key: idx,
                style: {
                  borderRadius: 10,
                  padding: '10px 14px',
                  background: m.role === 'user' ? C.base : C.layer,
                  border: `1px solid ${m.role === 'user' ? C.border : C.accent}`,
                  justifySelf: m.role === 'user' ? 'end' : 'stretch',
                  maxWidth: m.role === 'user' ? '85%' : '100%',
                },
              },
              h(
                'div',
                { style: { fontSize: 11.5, color: C.sub, marginBottom: 4, display: 'flex', justifyContent: 'space-between', gap: 8 } },
                h('span', null, m.role === 'user' ? '👦 麒麒 / 家长' : `🧠 Antigravity (${m.model || st.agyModel})`),
                m.duration ? h('span', null, `思考 ${Number(m.duration).toFixed(1)}s`) : null,
              ),
              h(
                'div',
                {
                  style: {
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  },
                },
                m.text,
              ),
            ),
          ),
          chat.sending
            ? h(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    fontSize: 13,
                    color: C.accent,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: C.base,
                    border: `1px dashed ${C.accent}`,
                    fontWeight: 600,
                  },
                },
                h('span', null, `🧠 ${st.agyModel} 正在思考中… ${chat.elapsed || 0}s（通常 8~20 秒）`),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn',
                    style: { borderColor: C.err, color: C.err, padding: '4px 10px' },
                    onClick: () => cancelAgyRequest(false),
                  },
                  '⏹ 停止思考',
                ),
              )
            : null,
        ),

        // Quick low-friction reply pills + input
        h(
          'div',
          { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          ...['A', 'B', '1', '给我一组 N<=4 的小反例', '我算出来了，下一步呢？'].map((quick) =>
            h(
              'button',
              {
                key: quick,
                type: 'button',
                className: 'oi-btn',
                disabled: chat.sending,
                onClick: () => sendAgyMessage(quick),
              },
              quick,
            ),
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', gap: 8 } },
          h('input', {
            type: 'text',
            value: chat.draft,
            disabled: chat.sending,
            placeholder: '敲 1 个数字、选 A/B，或继续追问…（回车发送）',
            onChange: (e) => setState({ agyChat: { ...chat, draft: e.target.value } }),
            onKeyDown: (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void sendAgyMessage(chat.draft)
              }
            },
            style: {
              flex: 1,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.base,
              color: C.text,
              padding: '8px 12px',
              fontSize: 13.5,
            },
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'oi-btn oi-btn-primary',
              disabled: chat.sending || !chat.draft.trim(),
              onClick: () => sendAgyMessage(chat.draft),
            },
            chat.sending ? '思考中…' : '发送',
          ),
        ),
      )
    }

    function DocModal({ modal }) {
      if (!modal) return null
      return h(
        'div',
        { className: 'oi-modal-bg', onClick: () => setState({ docModal: null }) },
        h(
          'div',
          { className: 'oi-modal', onClick: (e) => e.stopPropagation() },
          h(
            'div',
            {
              style: {
                padding: '14px 18px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            },
            h('div', { style: { fontWeight: 700, fontSize: 14 } }, `${modal.title}（${modal.path}）`),
            h('button', { type: 'button', className: 'oi-btn', onClick: () => setState({ docModal: null }) }, '关闭'),
          ),
          h(
            'div',
            { style: { padding: '16px 20px', overflowY: 'auto', flex: 1 } },
            modal.loading
              ? h('div', { style: { color: C.sub } }, '加载中…')
              : modal.error
                ? h('div', { style: { color: C.err } }, modal.error)
                : h(
                    'pre',
                    {
                      style: {
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 12.5,
                        lineHeight: 1.65,
                      },
                    },
                    modal.content,
                  ),
          ),
        ),
      )
    }

    function OiCoachPage() {
      const st = useStore()
      React.useEffect(() => {
        void loadOverview()
      }, [])

      const data = st.data
      return h(
        'div',
        { className: 'oi-root' },
        h(
          'div',
          { className: 'oi-wrap' },
          // Header + Tabs
          h(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              },
            },
            h(
              'div',
              null,
              h('div', { style: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' } }, '🏆 麒麒 OI 学习台'),
              h('div', { style: { fontSize: 12.5, color: C.sub, marginTop: 2 } }, '小学六年级 · 启发式 OI 专属教练 · 四平台精确成长时间线底座'),
            ),
            h(
              'div',
              { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
              h('button', { type: 'button', className: `oi-tab ${st.tab === 'today' ? 'oi-tab-active' : ''}`, onClick: () => setState({ tab: 'today' }) }, '今日训练台'),
              h('button', { type: 'button', className: `oi-tab ${st.tab === 'math' ? 'oi-tab-active' : ''}`, onClick: () => setState({ tab: 'math' }) }, '数学实验 & 错题本'),
              h('button', { type: 'button', className: `oi-tab ${st.tab === 'archive' ? 'oi-tab-active' : ''}`, onClick: () => setState({ tab: 'archive' }) }, '四平台成长档案'),
              h(
                'a',
                {
                  href: '/dsh-oi-coach/math-lab',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'oi-btn',
                  style: { textDecoration: 'none' },
                },
                '🧭 读题建模训练营',
              ),
              h('button', { type: 'button', className: 'oi-btn', onClick: () => loadOverview() }, '刷新'),
            ),
          ),

          // Alert / Notice bar
          st.error || st.notice
            ? h(
                'div',
                {
                  className: 'oi-card',
                  style: {
                    borderColor: st.error ? C.err : C.ok,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  },
                },
                h('span', { style: { fontSize: 13, color: st.error ? C.err : C.ok, fontWeight: 600 } }, st.error || st.notice?.text),
                h(
                  'div',
                  { style: { display: 'flex', gap: 8 } },
                  st.notice?.sessionId
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'oi-btn oi-btn-primary',
                          onClick: () => navServices.uiWorkspace?.openSession?.(st.notice.sessionId),
                        },
                        '进入对话',
                      )
                    : null,
                  h('button', { type: 'button', className: 'oi-btn', onClick: () => setState({ error: null, notice: null }) }, '关闭'),
                ),
              )
            : null,

          h(AgyChatPanel, { st }),
          st.loading && !data
            ? h('div', { className: 'oi-card', style: { color: C.sub } }, '正在读取四平台时间线数据…')
            : data
              ? st.tab === 'today'
                ? h(TodayTab, { data, st })
                : st.tab === 'math'
                  ? h(MathAndMistakesTab, { data, st })
                  : h(GrowthArchiveTab, { data, st })
              : null,
          h(DocModal, { modal: st.docModal }),
        ),
      )
    }

    function SessionHeaderChip() {
      const now = new Date()
      const late = now.getHours() > 21 || (now.getHours() === 21 && now.getMinutes() >= 15) || now.getHours() < 5
      return h(
        'button',
        {
          type: 'button',
          className: 'oi-btn',
          title: '打开麒麒 OI 学习台',
          onClick: () => {
            try {
              navServices.layout?.selectPanel?.(PANEL_ID)
            } catch {
              // ignore
            }
          },
          style: {
            height: 26,
            padding: '0 10px',
            borderRadius: 7,
            fontSize: 11.5,
          },
        },
        h('span', {
          style: {
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: late ? C.warn : C.ok,
            display: 'inline-block',
          },
        }),
        'OI学习台',
      )
    }

    function PanelIcon({ size, active }) {
      const edge = Number.isFinite(size) ? size : 18
      return h(
        'svg',
        {
          width: edge,
          height: edge,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          style: { display: 'block', color: 'currentColor' },
        },
        h('path', {
          d: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          opacity: active ? 1 : 0.85,
        }),
        h('path', {
          d: 'm9 10-2 2 2 2m6-4 2 2-2 2m-2-5.5-2 7',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          opacity: active ? 1 : 0.85,
        }),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ensureStyles()

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: PANEL_ID }, OiCoachPage),
        )
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: PANEL_ID, order: 21, label: () => 'OI学习台' },
            PanelIcon,
          ),
        )
        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: 'oi-coach-chip',
              order: 19,
            },
            SessionHeaderChip,
          ),
        )

        ctx.inject(['uiWorkspace', 'layout'], (navCtx) => {
          navServices.uiWorkspace = navCtx.uiWorkspace
          navServices.layout = navCtx.layout
          navCtx.effect(() => () => {
            if (navServices.uiWorkspace === navCtx.uiWorkspace) navServices.uiWorkspace = null
            if (navServices.layout === navCtx.layout) navServices.layout = null
          })
        })
      },
    }
  },
})
