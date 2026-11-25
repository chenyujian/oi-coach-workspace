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

    function buildDocShortcuts(data) {
      const subCnt = Number(data?.totals?.submissions ?? 0).toLocaleString('en-US')
      const unsolvedCnt = Number(data?.totals?.trueUnsolved ?? 0)
      const acCnt = Number(data?.totals?.uniqueAc ?? 0)
      const list = [
        { path: 'courses/notes/00-ren-teacher-modeling-playbook.md', title: '📌 号家军建模与六年级搭桥总纲', desc: '零基础数字译字母、考场手玩打表、十大转化抓手与对拍验毒' },
        { path: 'profile/learning_journey.md', title: '30 个月完整成长路径', desc: '从 9 岁启蒙到六年级八级攻坚的七阶段轨迹' },
        ...(data?.isWindows
          ? []
          : [
              {
                path: 'profile/reports/2026-11-22-full-diagnosis.md',
                title: '四平台全局诊断报告（家长教研版）',
                desc: '四维弱点雷达、核心习惯指标与家长配合清单（需口令）',
              },
            ]),
        { path: 'profile/habits_and_bugs.md', title: '高频老毛病与习惯库（H-01 ~ H-09）', desc: '含连错急刹车、遗忘回退与防坑自查口诀' },
        { path: 'profile/skill_matrix.md', title: '四维知识点掌握矩阵', desc: '区分短期突击与隔月留存的真实掌握状态' },
        { path: 'profile/activity_timeline.md', title: `全量 ${subCnt} 条提交时间线`, desc: `含全部 AC/非 AC 轨迹与清洗后 ${unsolvedCnt} 道真正待补题` },
        { path: 'profile/solved_timeline.md', title: `AC 首通时间线（去重 ${acCnt} 题）`, desc: '精确到分钟的跨平台首通记录与失误轨迹' },
      ]
      return list
    }


    const MODELING_DRILLS = [
      {
        id: 'translate-words-to-math',
        title: '破冰基石 A · 把人话与口算翻译成字母式',
        subtitle: '专为六年级数学搭桥：消除“看黑板字母公式发懵”的第一课',
        signal: '看懂题目故事，但一看到 i、j、l、r、向下取整式就发怵',
        focus: '先拿 N = 3~4 具体数字口算 1 步 → 给数字起字母外号 → 亲手把口算动作写成数学式',
      },
      {
        id: 'small-case-tabulate',
        title: '破冰基石 B · 手玩小数据与打表抓不变量',
        subtitle: '如 ABC482-D 僵尸碰撞、ABC484-D 极小移位、PJ04-T6 树构造',
        signal: '面对陌生构造、博弈或操作等价题，干瞪题面下不了笔',
        focus: '先在演草本画 N = 3~4 小图或列小表抓对称/抵消/重复现象 → 再用数学式锁死并验证',
      },
      {
        id: 'abs-prefix-suffix',
        title: '抓手 1 · 挂靠右端点、绝对值与前后缀拆解',
        subtitle: '如 PJ02 合唱团排练、ABC485-C 最近异色点、ABC483-D 翻转一步',
        signal: '看到 |i - j| 或区间 [l, r] 双变量同时动、枚举点对必超时',
        focus: '固定右端点 r（或按 j<i / j>i 去绝对值）→ 把左边 l 的最优选择变成滑动窗口或前后缀递推',
      },
      {
        id: 'contrib-separation',
        title: '抓手 2 · 翻转视角按边与元素算贡献',
        subtitle: '如 PJ06 树上染色、PJ11 路径最大边权之和、PJ05 走廊泼水节',
        signal: '看到所有点对 (u, v) 或所有子区间求和，N ≤ 10⁵ 无法两两枚举',
        focus: '反过来盯着每一条边或单个元素，算它被多少对合法点经过（如 Kruskal 首次连通 a×b）',
      },
      {
        id: 'diff-and-reverse',
        title: '抓手 3 · 先记账后结算与逆序看最后一次',
        subtitle: '如 PJ04 活动覆盖、PJ09 黑板擦写、ABC474-C / ABC477-D 覆盖操作',
        signal: '看到批量区间修改只问最终结果，或后操作覆盖前操作',
        focus: '可叠加用一维两端 / 二维四角差分记账最后前缀和还原；后盖前从 q=Q 倒着扫定稿',
      },
      {
        id: 'mod-earliest',
        title: '抓手 4 · 差转同余与只记最早位置',
        subtitle: '如 PJ06 最长 K 倍区间、ABC484-E 子段和计数',
        signal: '看到连续子段和是 K 的倍数、等于定值或满足不等式',
        focus: 'P[r] - P[l] 整除 K ⇔ 模 K 余数相同；预登 first[0]=0，负数取模写 ((sum%k)+k)%k',
      },
      {
        id: 'binary-answer',
        title: '抓手 5 · 二分答案转判定与整除消浮点',
        subtitle: '如 PJ02 分蛋糕、PJ06 树苗间隔、PJ11 切木头、PJ05 半度时钟',
        signal: '看到“最大化最小值 / 最小化最大值”单调分界，或讨厌的小数切割',
        focus: '猜参数 x 写 feasible(x) 判定；熟用 ⌊(a-1)/x⌋、(a+b-1)/b 与最小单位整数化消浮点',
      },
      {
        id: 'greedy-exchange',
        title: '抓手 6 · 贪心交换论证与遮挡淘汰证明',
        subtitle: '如 PJ07 打印排队、PJ03 紧急通知 max(i+tᵢ)、PJ10 单调栈',
        signal: '看到决定先后顺序、选点位置或单调栈/队列弹掉旧候选',
        focus: '排顺序写相邻两项交换不等式；选点做逐项对齐比较；栈队证“又老又差永无出头之日”',
      },
      {
        id: 'dp-state-slim',
        title: '抓手 7 · 状态瘦身只留影响未来的最小量',
        subtitle: '如 PJ04 单词接龙 dp[26]、PJ02 限 K 条边最短路、PJ11 换根 down/up',
        signal: '看到历史路径太长存不下，或额外多了一条 K ≤ 20 的小参数约束',
        focus: '追问“决定下一步能不能接上，最少只需记住什么？”压掉无关历史或把小约束收进维度',
      },
      {
        id: 'unique-anchor',
        title: '抓手 8 · 抓唯一中心与极小操作防重复计数',
        subtitle: '如 PJ09 最长回文 2n-1 中心、PJ10 欧拉筛、ABC484-C/D 极小移位',
        signal: '看到不同操作/不同路径会造出相同结果，计数怕重怕漏',
        focus: '给每个结果绑定唯一锚点（奇偶中心、最小质因子、首尾必异的极小操作区间 [l, r]）',
      },
      {
        id: 'break-cycle-dim',
        title: '抓手 9 · 破环按值域拓扑与二维压一维',
        subtitle: '如 PJ07 环形分糖下标升序、PJ09 最大子矩阵压列和、ABC482-C 行列解耦',
        signal: '看到围成圆圈两趟扫描失灵，或二维子矩阵四重循环超时',
        focus: '环形无端点改按数值升序排下标 ord 定稿；二维枚举上下行压成一维 colsum 跑 Kadane',
      },
      {
        id: 'graph-and-cycle',
        title: '抓手 10 · 抽象关系建图染色与尾链循环节',
        subtitle: '如 PJ07 数字变换 BFS、PJ04 树距离 2 二部染色、PJ11 传送器走 10¹⁸ 步',
        signal: '看到操作求最少步数、距离/不等式约束构造、或唯一后继走 10¹⁸ 步',
        focus: '数当点操作当边跑 BFS；距离 2 转同色连通块双星构造；大步数先扣尾链 s + (K-s)%L',
      },
    ]

    const SCOPED_CSS = `
      .oi-shell {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        box-sizing: border-box;
        font-feature-settings: "cv02", "cv03", "cv04", "cv11";
      }
      .oi-topbar {
        flex-shrink: 0;
        min-height: 54px;
        padding: 8px 24px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
        background: var(--dsw-alias-bg-base);
      }
      .oi-nav-seg {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px;
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-2);
        border: 1px solid var(--dsw-alias-border-l1);
      }
      .oi-nav-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .oi-nav-btn:hover {
        color: var(--dsw-alias-label-primary);
      }
      .oi-nav-btn-active {
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .oi-scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 24px 28px 44px;
        box-sizing: border-box;
      }
      .oi-container {
        width: 100%;
        max-width: 1080px;
        margin: 0 auto;
        display: grid;
        gap: 20px;
      }
      .oi-card {
        background: var(--dsw-alias-bg-layer-2);
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        padding: 18px 20px;
      }
      .oi-card-flat {
        background: var(--dsw-alias-bg-layer-2);
        border-radius: 14px;
        padding: 18px 20px;
      }
      .oi-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-radius: 9px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        padding: 7px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .oi-btn:hover { border-color: var(--dsw-alias-brand-primary); }
      .oi-btn:disabled { opacity: 0.48; cursor: not-allowed; }
      .oi-btn-primary {
        background: var(--dsw-alias-brand-primary);
        color: #fff;
        border-color: transparent;
      }
      .oi-btn-primary:hover { opacity: 0.92; border-color: transparent; }
      .oi-btn-ghost {
        background: transparent;
        border-color: transparent;
        color: var(--dsw-alias-label-secondary);
        padding: 6px 10px;
      }
      .oi-btn-ghost:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        border-color: transparent;
      }
      .oi-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
      }
      .oi-chip:hover {
        border-color: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-label-primary);
      }
      .oi-chip-active {
        border-color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
        color: var(--dsw-alias-brand-primary);
      }
      .oi-grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 14px;
      }
      .oi-grid-2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: 14px;
      }
      .oi-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 9px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 600;
        background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
      }
      .oi-composer {
        width: 100%;
        max-width: 740px;
        border-radius: 16px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-2);
        padding: 14px 16px 12px;
        display: grid;
        gap: 12px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
      }
      .oi-composer:focus-within {
        border-color: var(--dsw-alias-brand-primary);
      }
      .oi-textarea {
        width: 100%;
        min-height: 92px;
        box-sizing: border-box;
        border: none;
        outline: none;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        padding: 2px 2px;
        font-size: 14.5px;
        line-height: 1.65;
        font-family: inherit;
        resize: vertical;
      }
      .oi-chat-room {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .oi-chat-head {
        flex-shrink: 0;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        padding: 10px 24px;
        background: var(--dsw-alias-bg-base);
      }
      .oi-chat-head-inner {
        max-width: 840px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .oi-chat-messages {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 20px 24px 24px;
      }
      .oi-chat-stream {
        max-width: 840px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .oi-msg-assistant {
        align-self: stretch;
        background: var(--dsw-alias-bg-layer-2);
        border-radius: 16px;
        padding: 16px 20px;
        font-size: 15px;
        line-height: 1.85;
        word-break: break-word;
      }
      .oi-msg-user {
        align-self: flex-end;
        max-width: 78%;
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, var(--dsw-alias-bg-layer-2));
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent);
        border-radius: 16px 16px 4px 16px;
        padding: 11px 16px;
        font-size: 14.5px;
        line-height: 1.7;
        word-break: break-word;
      }
      .oi-chat-dock {
        flex-shrink: 0;
        border-top: 1px solid var(--dsw-alias-border-l1);
        padding: 12px 24px 16px;
        background: var(--dsw-alias-bg-base);
      }
      .oi-chat-dock-inner {
        max-width: 840px;
        margin: 0 auto;
        display: grid;
        gap: 10px;
      }
      .oi-reply-input {
        flex: 1;
        border-radius: 11px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        padding: 11px 14px;
        font-size: 14.5px;
        font-family: inherit;
        outline: none;
      }
      .oi-reply-input:focus {
        border-color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-base);
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
      .oi-math {
        display: inline-block;
        padding: 0 5px;
        margin: 0 1px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
        color: var(--dsw-alias-label-primary);
        font-family: ui-serif, Georgia, 'Times New Roman', -apple-system, sans-serif;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.2px;
        line-height: 1.35;
      }
      .oi-math-block {
        display: block;
        margin: 10px 0;
        padding: 10px 14px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);
        border-left: 3px solid var(--dsw-alias-brand-primary);
        font-family: ui-serif, Georgia, 'Times New Roman', -apple-system, sans-serif;
        font-size: 16px;
        font-weight: 700;
        text-align: center;
      }
      .oi-math sup, .oi-math-block sup {
        font-size: 0.74em;
        vertical-align: super;
        line-height: 0;
        font-weight: 700;
      }
      .oi-math sub, .oi-math-block sub {
        font-size: 0.74em;
        vertical-align: sub;
        line-height: 0;
        font-weight: 700;
      }
      .oi-frac {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        vertical-align: middle;
        margin: 0 3px;
        line-height: 1.15;
        font-size: 0.88em;
      }
      .oi-frac-num {
        padding: 0 3px 1px;
        border-bottom: 1.5px solid currentColor;
      }
      .oi-frac-den {
        padding: 1px 3px 0;
      }
      .oi-quote {
        margin: 6px 0;
        padding: 7px 12px;
        border-left: 3px solid var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 6%, transparent);
        border-radius: 0 6px 6px 0;
      }
      .oi-md-table {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;
        font-size: 13.5px;
      }
      .oi-md-table th, .oi-md-table td {
        border: 1px solid var(--dsw-alias-border-l1);
        padding: 7px 10px;
        text-align: left;
      }
      .oi-md-table th {
        background: var(--dsw-alias-bg-layer-2);
        font-weight: 700;
      }
      .oi-details {
        margin: 8px 0;
        padding: 8px 12px;
        border: 1px dashed var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-2);
      }
      .oi-details summary {
        cursor: pointer;
        font-weight: 700;
        color: var(--dsw-alias-brand-primary);
      }
      .oi-code-inline {
        display: inline-block;
        padding: 0 5px;
        margin: 0 1px;
        border-radius: 4px;
        background: color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
        font-weight: 600;
      }
      .oi-code-block {
        margin: 8px 0;
        padding: 10px 14px;
        border-radius: 8px;
        background: var(--dsw-alias-bg-base);
        border: 1px solid var(--dsw-alias-border-l1);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
        line-height: 1.55;
        overflow-x: auto;
        white-space: pre;
      }
    
      .oi-coach-layout {
        flex: 1;
        min-height: 0;
        display: flex;
        overflow: hidden;
      }
      .oi-history-rail {
        width: 256px;
        flex-shrink: 0;
        border-right: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-2);
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .oi-history-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 8px 10px 16px;
        display: grid;
        gap: 6px;
        align-content: start;
      }
      .oi-history-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 6px;
        padding: 9px 10px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        text-align: left;
        color: var(--dsw-alias-label-primary);
        transition: background 0.14s ease, border-color 0.14s ease;
      }
      .oi-history-item:hover {
        background: var(--dsw-alias-bg-base);
      }
      .oi-history-item-active {
        background: var(--dsw-alias-bg-base);
        border-color: var(--dsw-alias-brand-primary);
      }
      .oi-input-sm {
        width: 100%;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        padding: 7px 10px;
        font-size: 12.5px;
        font-family: inherit;
        outline: none;
      }
      .oi-input-sm:focus {
        border-color: var(--dsw-alias-brand-primary);
      }
      .oi-field-label {
        font-size: 12.5px;
        font-weight: 700;
        color: var(--dsw-alias-label-secondary);
        margin-bottom: 4px;
        display: block;
      }
`

    function ensureStyles() {
      const existing = document.getElementById(STYLE_ID)
      if (existing) {
        existing.textContent = SCOPED_CSS
        return
      }
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = SCOPED_CSS
      document.head.appendChild(el)
    }

    const navServices = { uiWorkspace: null, layout: null }

    function loadSavedGesp8Quiz() {
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('oi_gesp8_quiz_v1') : null
        return raw ? JSON.parse(raw) || {} : {}
      } catch {
        return {}
      }
    }

    const listeners = new Set()
    let state = {
      loading: true,
      error: null,
      notice: null,
      busy: null,
      tab: 'coach',
      gesp8SubTab: 'board',
      gesp8PackId: 'oop',
      gesp8TplId: 'dijkstra',
      gesp8QuizAnswers: loadSavedGesp8Quiz(),
      problemSubTab: 'unsolved',
      platformFilter: 'ALL',
      practiceSubTab: 'lab',
      drillLevel: 'cspj',
      archiveSubTab: 'mistakes',
      intakeMode: 'hint',
      data: null,
      intakeText: '',
      useAgyBrain: true,
      agyModel: 'gemini-4-neon-high',
      chatHistory: [],
      showHistoryRail: true,
      historyQuery: '',
      agyChat: {
        open: false,
        chatId: null,
        title: '',
        mode: 'coach',
        subMode: '',
        conversationId: null,
        previewQuery: '',
        messages: [],
        draft: '',
        sending: false,
        elapsed: 0,
      },
      problemPreview: null,
      showProblemPreview: false,
      saveCardModal: null,
      lectureDigestModal: null,
      syncStatus: null,
      showSyncModal: false,
      activePrimerId: 'combo-mod',
      primerAnswers: {},
      docModal: null,
    }
    let seenPullAt = undefined

    function formatSyncTime(iso) {
      if (!iso) return '等待首次自动巡检'
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return String(iso).slice(0, 16)
      const pad = (n) => String(n).padStart(2, '0')
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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

    async function loadChatHistory() {
      try {
        const res = await fetchJson(`${API}/chats`)
        setState({ chatHistory: Array.isArray(res.chats) ? res.chats : [] })
      } catch {
        // ignore chat history load failure
      }
    }

    async function pollSyncStatus() {
      try {
        const res = await fetchJson(`${API}/sync-status`)
        const sync = res?.sync || null
        if (!sync) return
        setState({ syncStatus: sync })
        if (seenPullAt !== undefined && sync.lastPullAt && sync.lastPullAt !== seenPullAt) {
          if (!state.agyChat?.sending && !state.busy) {
            seenPullAt = sync.lastPullAt
            void loadOverview()
          }
        }
      } catch {
        // 静默忽略网络波动，不打扰孩子思考
      }
    }

    async function loadOverview() {
      setState({ loading: !state.data, error: null })
      try {
        const [ovRes, chatsRes, syncRes] = await Promise.all([
          fetchJson(`${API}/overview`),
          fetchJson(`${API}/chats`).catch(() => ({ chats: state.chatHistory })),
          fetchJson(`${API}/sync-status`).catch(() => ({ sync: state.syncStatus })),
        ])
        const nextSync = syncRes?.sync ?? state.syncStatus
        if (seenPullAt === undefined) {
          seenPullAt = nextSync?.lastPullAt ?? null
        } else if (nextSync?.lastPullAt) {
          seenPullAt = nextSync.lastPullAt
        }
        setState({
          loading: false,
          data: ovRes.data,
          chatHistory: Array.isArray(chatsRes?.chats) ? chatsRes.chats : state.chatHistory,
          syncStatus: nextSync,
        })
      } catch (err) {
        setState({ loading: false, error: err?.message || String(err) })
      }
    }

    async function openChatFromHistory(chatId) {
      if (!chatId) return
      const meta = (state.chatHistory || []).find((c) => c.id === chatId)
      const isParentChat = meta?.mode === 'parent'
      const pin = isParentChat ? ensureParentPin('查看家长教研对话，请输入家长口令：') : ''
      if (isParentChat && !pin) return
      if (activeAgyAbort) {
        try { activeAgyAbort.abort() } catch { /* ignore */ }
        activeAgyAbort = null
      }
      if (agyTimerId) {
        clearInterval(agyTimerId)
        agyTimerId = null
      }
      setState({ error: null, notice: null })
      try {
        const res = await fetchJson(
          `${API}/chat?id=${encodeURIComponent(chatId)}`,
          pin ? { headers: { 'x-oi-parent-pin': pin } } : undefined,
        )
        const rec = res.chat
        if (!rec) return
        setState({
          tab: 'coach',
          problemPreview: null,
          showProblemPreview: false,
          agyChat: {
            open: true,
            chatId: rec.id,
            title: rec.title || rec.id,
            mode: rec.mode || 'coach',
            subMode: rec.subMode || '',
            conversationId: rec.conversationId || null,
            previewQuery: rec.previewQuery !== undefined ? String(rec.previewQuery || '') : (rec.title || ''),
            skipProblemContext: Boolean(rec.skipProblemContext),
            messages: Array.isArray(rec.messages) ? rec.messages : [],
            draft: '',
            sending: false,
            elapsed: 0,
          },
        })
        const effectivePreview = rec.previewQuery !== undefined ? String(rec.previewQuery || '') : (rec.title || '')
        if (effectivePreview && !rec.skipProblemContext) {
          void fetchProblemPreview(effectivePreview)
        }
      } catch (err) {
        if (/鉴权|口令|403/.test(String(err?.message || ''))) activeParentPin = ''
        setState({ error: `打开历史对话失败：${err?.message || err}` })
      }
    }

    async function deleteChatFromHistory(chatId) {
      if (!chatId) return
      const meta = (state.chatHistory || []).find((c) => c.id === chatId)
      const isParentChat = meta?.mode === 'parent'
      const pin = isParentChat ? ensureParentPin('删除家长教研对话，请输入家长口令：') : ''
      if (isParentChat && !pin) return
      const isCurrent = state.agyChat?.chatId === chatId
      if (isCurrent) {
        if (activeAgyAbort) {
          try { activeAgyAbort.abort() } catch { /* ignore */ }
          activeAgyAbort = null
        }
        if (agyTimerId) {
          clearInterval(agyTimerId)
          agyTimerId = null
        }
      }
      try {
        await fetchJson(`${API}/chat-delete`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(pin ? { 'x-oi-parent-pin': pin } : {}) },
          body: JSON.stringify({ id: chatId, parentPin: pin || undefined }),
        })
        const nextList = (state.chatHistory || []).filter((c) => c.id !== chatId)
        setState({
          chatHistory: nextList,
          ...(isCurrent
            ? {
                problemPreview: null,
                showProblemPreview: false,
                agyChat: {
                  open: false,
                  chatId: null,
                  title: '',
                  mode: 'coach',
                  subMode: '',
                  conversationId: null,
                  previewQuery: '',
                  skipProblemContext: false,
                  messages: [],
                  draft: '',
                  sending: false,
                  elapsed: 0,
                },
              }
            : {}),
        })
      } catch (err) {
        if (/鉴权|口令|403/.test(String(err?.message || ''))) activeParentPin = ''
        setState({ error: `删除失败：${err?.message || err}` })
      }
    }

    function inferCardDraftFromChat(chat, pv) {
      const title = String(pv?.title || chat?.title || '').replace(/^(讲义慢放|任氏建模|代数建模|讲义变式|建模|排错|复盘|旧题重斩|变形手算|建模快练)\s*·\s*/i, '').trim() || '未命名题目'
      const combined = `${pv?.platform || ''} ${title}`.toLowerCase()
      let platform = 'oj'
      if (/atcoder|abc\d+|arc\d+|agc\d+/.test(combined)) platform = 'atcoder'
      else if (/好吧|haoba/.test(combined)) platform = 'haoba'
      else if (/洛谷|luogu|\bp\d{4}\b/.test(combined)) platform = 'luogu'
      else if (/李拜天|oilibaitian/.test(combined)) platform = 'oilibaitian'
      else if (/建模快练|微卡片|讲义/.test(String(chat?.title || ''))) platform = 'drill'

      const asciiSlug = (String(pv?.pid || title).match(/[a-z0-9_-]{2,}/gi) || []).join('-').toLowerCase().slice(0, 32)
      const lastAssistant = [...(chat?.messages || [])].reverse().find((m) => m.role === 'assistant')?.text || ''
      const pickLine = (re) => {
        const m = re.exec(lastAssistant)
        return m ? m[1].replace(/\*\*/g, '').trim() : ''
      }
      const pitfall = pickLine(/(?:刚才掉进的坑|掉进的坑|卡点|坑点)\*{0,2}[：:]\s*(.+)/i) || pickLine(/^\s*1[.、]\s*(.+)/m)
      const breakthrough = pickLine(/(?:破局[^：:\n]*|关键规律|核心模型|数学转化)\*{0,2}[：:]\s*(.+)/i) || pickLine(/^\s*2[.、]\s*(.+)/m)
      const motto = pickLine(/(?:防坑口诀|口诀|下次[^：:\n]*)\*{0,2}[：:]\s*(.+)/i) || pickLine(/^\s*3[.、]\s*(.+)/m)

      return {
        title,
        platform,
        problem_slug: asciiSlug || '',
        dimension: 'math',
        pitfall,
        breakthrough,
        motto,
        saving: false,
      }
    }

    function openSaveCardModal() {
      const draft = inferCardDraftFromChat(state.agyChat, state.problemPreview)
      setState({ saveCardModal: draft })
    }

    async function submitSaveCard() {
      const m = state.saveCardModal
      if (!m || m.saving) return
      setState({ saveCardModal: { ...m, saving: true }, error: null })
      try {
        const res = await fetchJson(`${API}/save-card`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            title: m.title,
            platform: m.platform,
            problem_slug: m.problem_slug,
            dimension: m.dimension,
            pitfall: m.pitfall,
            breakthrough: m.breakthrough,
            motto: m.motto,
          }),
        })
        setState({
          saveCardModal: null,
          notice: { text: `通关秘籍卡已保存：${res.saved}` },
        })
        await loadOverview()
      } catch (err) {
        setState({
          saveCardModal: { ...m, saving: false },
          error: `保存秘籍卡失败：${err?.message || err}`,
        })
      }
    }

    async function fetchProblemPreview(queryText) {
      const q = String(queryText || '').trim()
      if (!q) {
        setState({ problemPreview: null, showProblemPreview: false })
        return
      }
      try {
        const res = await fetchJson(`${API}/problem-preview?q=${encodeURIComponent(q.slice(0, 200))}`)
        setState({
          problemPreview: res.found ? res.problem : null,
          showProblemPreview: false,
        })
      } catch {
        setState({ problemPreview: null, showProblemPreview: false })
      }
    }

    async function openMathLabInBrowser() {
      setState({ error: null })
      try {
        await fetchJson(`${API}/open-math-lab`, { method: 'POST' })
      } catch (err) {
        setState({ error: err?.message || '无法调起系统浏览器，请直接使用页面内嵌训练营。' })
      }
    }

    let activeAgyAbort = null
    let agyTimerId = null
    // 仅保留在当前页面内存态，绝不落盘到任何 JSON 文件
    let activeParentPin = ''

    function ensureParentPin(promptLabel) {
      if (state.data?.isWindows) return ''
      if (activeParentPin) return activeParentPin
      const entered =
        typeof window !== 'undefined' && typeof window.prompt === 'function'
          ? window.prompt(promptLabel || '请输入家长口令：')
          : ''
      if (!entered) return ''
      activeParentPin = String(entered).trim()
      return activeParentPin
    }

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
        ...(clearMessages ? { problemPreview: null, showProblemPreview: false } : {}),
        agyChat: {
          ...state.agyChat,
          sending: false,
          elapsed: 0,
          ...(clearMessages ? { open: false, chatId: null, conversationId: null, subMode: '', previewQuery: '', messages: [], title: '', draft: '' } : {}),
        },
      })
    }

    async function sendAgyMessage(text, opts = {}) {
      const msg = String(text || '').trim()
      if (!msg) return
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
      const title = opts.title || (isNew ? msg.slice(0, 24) : prev.title) || '新题目'
      const mode = opts.mode || (isNew ? 'coach' : prev.mode) || 'coach'
      const subMode = opts.subMode !== undefined ? String(opts.subMode || '') : isNew ? '' : String(prev.subMode || '')
      let parentPin = opts.parentPin || (mode === 'parent' ? activeParentPin : '')
      if (mode === 'parent' && !parentPin && !state.data?.isWindows) {
        parentPin = ensureParentPin('继续家长教研对话，请输入家长口令：')
        if (!parentPin) return
      }
      const convId = isNew ? null : prev.conversationId
      const chatId = isNew ? null : prev.chatId
      const previewQuery = isNew
        ? opts.previewQuery !== undefined
          ? String(opts.previewQuery || '')
          : String(title || '')
        : String(prev.previewQuery || '')
      const skipProblemContext = isNew ? Boolean(opts.skipProblemContext) : Boolean(prev.skipProblemContext)
      const baseMsgs = isNew ? [] : prev.messages
      const displayText = String(opts.displayText || msg).trim()
      const nextMsgs = [...baseMsgs, { role: 'user', text: displayText }]

      const controller = new AbortController()
      activeAgyAbort = controller
      const startedAt = Date.now()
      agyTimerId = setInterval(() => {
        if (activeAgyAbort === controller && state.agyChat.sending) {
          setState({ agyChat: { ...state.agyChat, elapsed: Math.floor((Date.now() - startedAt) / 1000) } })
        }
      }, 1000)

      setState({
        tab: 'coach',
        error: null,
        notice: null,
        intakeText: '',
        ...(isNew ? { problemPreview: null, showProblemPreview: false } : {}),
        agyChat: {
          open: true,
          chatId,
          title,
          mode,
          subMode,
          conversationId: convId,
          previewQuery,
          skipProblemContext,
          messages: nextMsgs,
          draft: '',
          sending: true,
          elapsed: 0,
        },
      })

      if (isNew && mode === 'coach' && !skipProblemContext && previewQuery) {
        void fetchProblemPreview(previewQuery)
      }

      try {
        const res = await fetchJson(`${API}/agy-chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: msg,
            displayText,
            title,
            previewQuery: previewQuery || undefined,
            skipProblemContext: skipProblemContext || undefined,
            chatId: chatId || undefined,
            model: opts.model || state.agyModel || 'gemini-4-neon-high',
            conversationId: convId || undefined,
            mode,
            subMode: subMode || undefined,
            parentPin: parentPin || undefined,
          }),
        })
        if (activeAgyAbort !== controller) return
        activeAgyAbort = null
        if (agyTimerId) { clearInterval(agyTimerId); agyTimerId = null }
        const nextPreviewQ = res.previewQuery || state.agyChat.previewQuery
        if (!isNew && mode === 'coach' && !skipProblemContext && nextPreviewQ && nextPreviewQ !== prev.previewQuery) {
          void fetchProblemPreview(nextPreviewQ)
        }
        setState({
          agyChat: {
            ...state.agyChat,
            chatId: res.chatId || chatId,
            title: res.title || state.agyChat.title,
            previewQuery: nextPreviewQ,
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
        void loadChatHistory()
      } catch (err) {
        if (activeAgyAbort === controller) {
          activeAgyAbort = null
          if (agyTimerId) { clearInterval(agyTimerId); agyTimerId = null }
        }
        if (err?.name === 'AbortError') {
          setState({ agyChat: { ...state.agyChat, sending: false, elapsed: 0 } })
          return
        }
        const isAuthFailure = mode === 'parent' && /鉴权|口令|403/.test(String(err?.message || ''))
        if (isAuthFailure) {
          activeParentPin = ''
        }
        setState({
          error: `教练连接失败：${err?.message || err}`,
          agyChat: isAuthFailure && isNew ? { ...prev, sending: false, elapsed: 0 } : { ...state.agyChat, sending: false, elapsed: 0 },
        })
      }
    }

    async function launchCoachSession({ presetId = 'oi-coach', title, prompt, displayText, previewQuery, skipProblemContext = false, subMode = '' }) {
      const wantsParent = !state.data?.isWindows && presetId === 'oi-parent'
      const pin = wantsParent ? ensureParentPin('请输入家长口令以进入家长教研模式：') : ''
      if (wantsParent && !pin) return
      if (state.data?.agy?.ready && state.useAgyBrain) {
        await sendAgyMessage(prompt, {
          reset: true,
          title,
          displayText: displayText || title || prompt,
          previewQuery: previewQuery !== undefined ? previewQuery : (title || prompt),
          skipProblemContext,
          mode: wantsParent ? 'parent' : 'coach',
          subMode: wantsParent ? '' : subMode,
          parentPin: wantsParent ? pin : undefined,
        })
        return
      }
      setState({ busy: title || 'launching', error: null, notice: null })
      try {
        const res = await fetchJson(`${API}/dispatch`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(wantsParent && pin ? { 'x-oi-parent-pin': pin } : {}) },
          body: JSON.stringify({ presetId: wantsParent ? 'oi-parent' : 'oi-coach', title, prompt, parentPin: wantsParent ? pin : undefined }),
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
        if (wantsParent && /鉴权|口令|403/.test(String(err?.message || ''))) activeParentPin = ''
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

    function answerGesp8Quiz(qid, idx) {
      const next = { ...(state.gesp8QuizAnswers || {}), [qid]: idx }
      setState({ gesp8QuizAnswers: next })
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('oi_gesp8_quiz_v1', JSON.stringify(next))
        }
      } catch {
        // ignore storage quota
      }
    }

    async function openOjUrl(url, label = '题目页') {
      if (!url) return
      try {
        await fetchJson(`${API}/open-oj`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        setState({ notice: { text: `已在浏览器打开「${label}」，提交后将自动同步点亮进度！` } })
      } catch {
        try {
          window.open?.(url, '_blank', 'noopener,noreferrer')
        } catch {
          setState({ error: `请复制链接到浏览器打开：${url}` })
        }
      }
    }

    async function openDoc(relPath, title) {
      const normRel = String(relPath || '')
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
        .replace(/^(?:\.\/|\/)+/, '')
        .toLowerCase()
      const needsPin = normRel === 'profile/reports' || normRel.startsWith('profile/reports/')
      const pin = needsPin ? ensureParentPin('查看家长诊断报告，请输入家长口令：') : ''
      if (needsPin && !pin) return
      setState({ docModal: { path: relPath, title: title || relPath, loading: true, content: '', error: null } })
      try {
        const res = await fetchJson(
          `${API}/doc?path=${encodeURIComponent(relPath)}`,
          pin ? { headers: { 'x-oi-parent-pin': pin } } : undefined,
        )
        setState({ docModal: { path: relPath, title: title || relPath, loading: false, content: res.content, error: null } })
      } catch (err) {
        if (needsPin && /鉴权|口令|403/.test(String(err?.message || ''))) activeParentPin = ''
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

    function buildQuickPrompt(mode, raw) {
      const prompts = {
        hint: `教练你好！我做这道题卡住了，请严格按【实战探索 + 数学搭桥 5 步法】（先用 N=3~4 具体小数字带我手算破冰并排掉题眼陷阱，绝不一上来甩抽象字母式 → 扶着把数字译成字母 → 让我自己发现哪步算重了、不直接塞套路菜单 → 代边界小数字慢放公式并做直观微证明 → 验毒对拍与回看讲义）从第 1 步开始，严禁首轮剧透解法方向或算法名，绝不给完整 AC 代码：\n\n${raw}`,
        wa: `教练你好！我这道题 WA 了，请先帮我核对数学模型和任氏验毒四件套边界（绝不要直接剧透正解思路或替我改代码；若已连错 2 次请先喂 1 组 N<=4 极小反例让我手算或本地暴力对拍抓虫）：\n\n${raw}`,
        tle: `教练你好！我这道题超时 TLE 了，先别告诉我怎么优化！请按【实战探索 + 数学搭桥 5 步法】先拿 1 组 N=3~4 具体小数字带我手算一遍，帮我自己看清哪一步算重了（严禁首轮剧透算法方向，绝不给 AC 代码）：\n\n${raw}`,
        re: `教练你好！我这道题 RE/CE 了，请带我自己定位数组越界、初始化或语法问题（绝不替我改代码）：\n\n${raw}`,
        pm: `教练你好！我刚刚把这道题 AC 了！请按 post-mortem 的 3 秒“敲 1 确认”模式直接帮我提炼 3 行通关秘籍卡，我确认后请你调用 save_mistake_card 存入错题库：\n\n${raw}`,
      }
      return prompts[mode] || prompts.hint
    }

    function launchProblemAction(p, kind) {
      if (kind === 'model') {
        return launchCoachSession({
          presetId: 'oi-coach',
          title: p.title,
          displayText: `我想补这道题：${p.title}（${p.platform} · ${p.trajectory}）`,
          previewQuery: p.title,
          prompt: `教练，我要补这道题：【${p.title}】（平台：${p.platform}，我之前交了 ${p.attempts} 次，最高 ${p.bestScore} 分，轨迹：${p.trajectory}）。请严格按【实战探索 + 数学搭桥 5 步法】从第 1 步开始：先拿 1 组 N=3~4 的具体小数字带我口算破冰（绝不一上来逼写抽象字母式，也严禁首轮剧透解法方向或算法名，绝不要直接给代码）。`,
        })
      }
      if (kind === 'debug') {
        return launchCoachSession({
          presetId: 'oi-coach',
          title: `排错 · ${p.title}`,
          displayText: `帮我排错：${p.title}（${p.platform} · ${p.trajectory}）`,
          previewQuery: p.title,
          prompt: `教练，我在【${p.title}】（平台：${p.platform}，轨迹：${p.trajectory}，最高 ${p.bestScore} 分）上卡住了。先别直接剧透正解方向！若是 WA 请喂 1 组 N<=4 极小反例让我手算或本地暴力对拍找错；若是 TLE 请按【实战探索 + 数学搭桥 5 步法】先拿具体小数字帮我自己看清哪步算重了。`,
        })
      }
      return launchCoachSession({
        presetId: 'oi-coach',
        title: `复盘 · ${p.title}`,
        displayText: `我刚 AC 了 ${p.title}，帮我生成 3 行通关秘籍卡`,
        previewQuery: p.title,
        prompt: `教练，我刚把【${p.title}】（${p.platform}）补过 AC 啦！请按 post-mortem 的 3 秒“敲 1 确认”模式，结合我之前的失误轨迹（${p.trajectory}）帮我生成 3 行通关秘籍卡，等我敲 1 确认后调用 save_mistake_card 存档。`,
      })
    }

    function ProblemsTab({ data, st }) {
      const unsolved = data.unsolvedRecent || []
      const retention = data.retentionQueue || []
      const platforms = ['ALL', ...Array.from(new Set(unsolved.map((p) => p.platform).filter(Boolean)))]
      const filtered =
        st.platformFilter === 'ALL'
          ? unsolved
          : unsolved.filter((p) => p.platform === st.platformFilter)

      return h(
        'div',
        { className: 'oi-scroll' },
        h(
          'div',
          { className: 'oi-container' },
          // Sub-header & Filters
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } },
            h(
              'div',
              { className: 'oi-nav-seg' },
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.problemSubTab === 'unsolved' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ problemSubTab: 'unsolved' }),
                },
                `近期待补（${unsolved.length}）`,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.problemSubTab === 'retention' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ problemSubTab: 'retention' }),
                },
                `隔月旧题重斩（${retention.length}）`,
              ),
            ),
            st.problemSubTab === 'unsolved'
              ? h(
                  'div',
                  { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                  ...platforms.map((pl) =>
                    h(
                      'button',
                      {
                        key: pl,
                        type: 'button',
                        className: `oi-chip ${st.platformFilter === pl ? 'oi-chip-active' : ''}`,
                        onClick: () => setState({ platformFilter: pl }),
                      },
                      pl === 'ALL' ? '全部平台' : pl,
                    ),
                  ),
                )
              : h('span', { style: { fontSize: 12.5, color: C.sub } }, '挑出 1~5 个月前高摩擦旧题，3 分钟口述检验是否真记住'),
          ),

          // Problem cards
          st.problemSubTab === 'unsolved'
            ? filtered.length === 0
              ? h('div', { className: 'oi-card-flat', style: { color: C.sub, textAlign: 'center', padding: '36px 20px' } }, '这个平台目前没有待补题啦！')
              : h(
                  'div',
                  { className: 'oi-grid-2' },
                  ...filtered.slice(0, 14).map((p, idx) =>
                    h(
                      'div',
                      {
                        key: `${p.platform}-${p.title}-${idx}`,
                        className: 'oi-card',
                        style: { display: 'grid', gap: 12 },
                      },
                      h(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
                        h('div', { style: { fontWeight: 700, fontSize: 14.5, lineHeight: 1.4 } }, p.title),
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
                        { style: { fontSize: 12.5, color: C.sub, display: 'flex', gap: 12, flexWrap: 'wrap' } },
                        h('span', null, p.platform),
                        h('span', null, p.lastTry),
                        h('span', null, `轨迹：${p.trajectory}`),
                      ),
                      h(
                        'div',
                        { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', paddingTop: 2 } },
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'oi-btn oi-btn-primary',
                            disabled: !!st.busy,
                            onClick: () => launchProblemAction(p, 'model'),
                          },
                          '🧮 开始建模',
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'oi-btn',
                            disabled: !!st.busy,
                            onClick: () => launchProblemAction(p, 'debug'),
                          },
                          '🩺 排错',
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'oi-btn oi-btn-ghost',
                            disabled: !!st.busy,
                            onClick: () => launchProblemAction(p, 'pm'),
                          },
                          '🃏 存秘籍',
                        ),
                      ),
                    ),
                  ),
                )
            : h(
                'div',
                { className: 'oi-grid-3' },
                ...retention.map((item, idx) =>
                  h(
                    'div',
                    {
                      key: `${item.platform}-${item.pid}-${idx}`,
                      className: 'oi-card',
                      style: { display: 'grid', gap: 10 },
                    },
                    h('div', { style: { fontWeight: 700, fontSize: 14, lineHeight: 1.4 } }, `${item.pid} ${item.title === item.pid ? '' : item.title}`),
                    h('div', { style: { fontSize: 12.5, color: C.sub } }, `${item.platform} · ${item.ageDays} 天前 · 当时 ${item.attempts} 交`),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'oi-btn',
                        disabled: !!st.busy,
                        style: { justifySelf: 'start', marginTop: 2 },
                        onClick: () =>
                          launchCoachSession({
                            presetId: 'oi-coach',
                            title: `旧题重斩 · ${item.pid}`,
                            displayText: `旧题冷启动检验：${item.pid} ${item.title === item.pid ? '' : item.title}（${item.platform}）`,
                            previewQuery: item.pid,
                            prompt: `教练，我想做每周 3 分钟旧题冷启动重斩！题目是 ${item.platform} 的 ${item.pid} ${item.title}（我 ${item.ageDays} 天前交了 ${item.attempts} 次才过）。请不要剧透解法，用 1~2 个高含金量的 A/B/C 选择考考我：不看旧代码，我还记不记得它的核心数学模型和最容易错的边界？`,
                          }),
                      },
                      '⚡ 开始 3 分钟口述检验',
                    ),
                  ),
                ),
              ),
        ),
      )
    }

    function PracticeTab({ st }) {
      const primer = MATH_PRIMERS.find((p) => p.id === st.activePrimerId) || MATH_PRIMERS[0]
      const levels = [
        { id: 'basic', label: '热身 · 六年级基础' },
        { id: 'cspj', label: '进阶 · CSP-J 复赛' },
        { id: 'plus', label: '挑战 · 提高入门' },
      ]
      const activeLevel = levels.find((l) => l.id === st.drillLevel) || levels[1]

      const startModelingDrill = (drill) => {
        void launchCoachSession({
          presetId: 'oi-coach',
          title: `建模快练 · ${drill.title}`,
          displayText: `开始「${drill.title}」专题建模快练（${activeLevel.label}）`,
          previewQuery: '',
          skipProblemContext: true,
          prompt: `教练，我想做 1 道【${drill.title}】（重点：${drill.focus}）的 10 分钟演草本建模快练（难度：${activeLevel.label}，不用急着写代码）。请你先现编 1 道简短干净的原创或变式微题，给清楚题面和 1 组 N=3~4 具体小数字例子，**绝不一上来抛复杂字母式或剧透算法名**，然后按【实战探索 + 数学搭桥 5 步法】先带我手算 1 步，再扶着把数字翻译成数学式一步步推进！`,
        })
      }

      return h(
        'div',
        { className: 'oi-chat-room' },
        // Dedicated Practice Sub-bar
        h(
          'div',
          {
            style: {
              flexShrink: 0,
              borderBottom: `1px solid ${C.border}`,
              padding: '10px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              background: C.base,
            },
          },
          h(
            'div',
            { className: 'oi-nav-seg' },
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.practiceSubTab === 'lab' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ practiceSubTab: 'lab' }),
              },
              '🧭 读题建模训练营（6 课）',
            ),
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.practiceSubTab === 'drills' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ practiceSubTab: 'drills' }),
              },
              '⚡ 专题建模快练（基石 + 10法）',
            ),
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.practiceSubTab === 'primers' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ practiceSubTab: 'primers' }),
              },
              '✏️ 手算微卡片（5 套）',
            ),
          ),
          st.practiceSubTab === 'lab'
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'oi-btn',
                  onClick: () => openMathLabInBrowser(),
                },
                '🌐 在浏览器中打开 / 打印 A4 单',
              )
            : st.practiceSubTab === 'primers'
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn',
                    disabled: !!st.busy,
                    onClick: () =>
                      launchCoachSession({
                        presetId: 'oi-coach',
                        title: `变形手算 · ${primer.title.slice(6)}`,
                        displayText: `刚做完「${primer.title}」，请再出 1 道变形小手算考考我！`,
                        prompt: `教练，我刚在学习台做了「${primer.title}」（${primer.term}）。请再出 1 道六年级能用演草本 2 分钟手算完的小变形题考考我，只需让我报 1~2 个数字，不要长篇大论！`,
                      }),
                  },
                  '✨ 让教练出 1 道变形手算题',
                )
              : h(
                  'div',
                  { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                  ...levels.map((lv) =>
                    h(
                      'button',
                      {
                        key: lv.id,
                        type: 'button',
                        className: `oi-chip ${st.drillLevel === lv.id ? 'oi-chip-active' : ''}`,
                        onClick: () => setState({ drillLevel: lv.id }),
                      },
                      lv.label,
                    ),
                  ),
                ),
        ),

        st.practiceSubTab === 'lab'
          ? h('iframe', {
              src: '/dsh-oi-coach/math-lab',
              title: '麒麒的 OI 读题与建模训练营',
              style: {
                flex: 1,
                width: '100%',
                minHeight: 0,
                border: 'none',
                display: 'block',
                background: '#f6f8fc',
              },
            })
          : st.practiceSubTab === 'drills'
            ? h(
                'div',
                { className: 'oi-scroll' },
                h(
                  'div',
                  { className: 'oi-container' },
                  h(
                    'div',
                    { style: { display: 'grid', gap: 4 } },
                    h('div', { style: { fontSize: 18, fontWeight: 800 } }, '⚡ 每日 10 分钟 · 破冰搭桥 + 号家军十大建模快练'),
                    h('div', { style: { fontSize: 13.5, color: C.sub } }, '先从“人话译字母 / 手玩小数据打表”两块基石起步，再进阶到任衍硕老师 20 场讲义提炼的十大核心转化，每轮先算具体小数字、不甩吓人符号。'),
                  ),
                  h(
                    'div',
                    { className: 'oi-grid-2' },
                    ...MODELING_DRILLS.map((drill) =>
                      h(
                        'div',
                        {
                          key: drill.id,
                          className: 'oi-card',
                          style: { display: 'grid', gap: 10 },
                        },
                        h(
                          'div',
                          null,
                          h('div', { style: { fontWeight: 800, fontSize: 15.5 } }, drill.title),
                          h('div', { style: { fontSize: 12.5, color: C.sub, marginTop: 3 } }, drill.subtitle),
                        ),
                        h('div', { style: { fontSize: 13, lineHeight: 1.6 } }, `🔍 认题信号：${drill.signal}`),
                        h('div', { style: { fontSize: 12.5, color: C.sub, lineHeight: 1.6 } }, `🧭 训练重点：${drill.focus}`),
                        h(
                          'div',
                          { style: { paddingTop: 4 } },
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'oi-btn oi-btn-primary',
                              disabled: !!st.busy,
                              onClick: () => startModelingDrill(drill),
                            },
                            '开始 5 步建模快练 →',
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              )
            : h(
                'div',
                { className: 'oi-scroll' },
                h(
                  'div',
                  { style: { maxWidth: 860, margin: '0 auto', display: 'grid', gap: 18 } },
                  h(
                    'div',
                    { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                    ...MATH_PRIMERS.map((p) =>
                      h(
                        'button',
                        {
                          key: p.id,
                          type: 'button',
                          className: `oi-chip ${p.id === primer.id ? 'oi-chip-active' : ''}`,
                          onClick: () => setState({ activePrimerId: p.id }),
                        },
                        p.title.replace(/^微卡片 \d+ · /, ''),
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'oi-card', style: { display: 'grid', gap: 18, padding: '22px 24px' } },
                    h(
                      'div',
                      null,
                      h('div', { style: { fontWeight: 800, fontSize: 16.5 } }, primer.title),
                      h('div', { style: { fontSize: 13, color: C.sub, marginTop: 4 } }, `${primer.tag} ｜ ${primer.term}`),
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
                            paddingTop: qi > 0 ? 18 : 0,
                            display: 'grid',
                            gap: 12,
                          },
                        },
                        h('div', { style: { fontSize: 15, fontWeight: 600, lineHeight: 1.65 } }, `Q${qi + 1}. ${item.q}`),
                        h(
                          'div',
                          { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
                          ...item.options.map((opt, oi) =>
                            h(
                              'button',
                              {
                                key: oi,
                                type: 'button',
                                className: 'oi-btn',
                                style:
                                  answered && oi === item.ans
                                    ? { borderColor: C.ok, color: C.ok, padding: '9px 16px', fontSize: 14 }
                                    : answered && oi === picked && !isRight
                                      ? { borderColor: C.err, color: C.err, padding: '9px 16px', fontSize: 14 }
                                      : { padding: '9px 16px', fontSize: 14 },
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
                                  fontSize: 13.5,
                                  lineHeight: 1.7,
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  background: C.base,
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
              ),
      )
    }

    function ArchiveTab({ data, st }) {
      const k = data.kpis30d
      const agyReady = Boolean(data.agy?.ready)
      const notes = data.courseNotes || []

      return h(
        'div',
        { className: 'oi-scroll' },
        h(
          'div',
          { className: 'oi-container' },
          // Sub-tabs
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } },
            h(
              'div',
              { className: 'oi-nav-seg' },
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.archiveSubTab === 'mistakes' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ archiveSubTab: 'mistakes' }),
                },
                `🃏 我的通关秘籍（${data.mistakeCards.length}）`,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.archiveSubTab === 'notes' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ archiveSubTab: 'notes' }),
                },
                `📖 课程讲义（${notes.length}）`,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.archiveSubTab === 'stats' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ archiveSubTab: 'stats' }),
                },
                data.isWindows ? '📊 成长与同步' : '📊 成长档案与家长教研',
              ),
            ),
            h(
              'div',
              { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
              h(
                'button',
                {
                  type: 'button',
                  className: 'oi-btn oi-btn-primary',
                  disabled: !!st.busy,
                  onClick: () => triggerSync('git-sync', 'Git 双机同步'),
                },
                st.busy === 'sync:git-sync' ? '同步中…' : '☁️ 一键同步进度',
              ),
            ),
          ),

          st.archiveSubTab === 'mistakes'
            ? data.mistakeCards.length === 0
              ? h(
                  'div',
                  { className: 'oi-card-flat', style: { textAlign: 'center', padding: '44px 24px', color: C.sub, fontSize: 14 } },
                  '还没有存入第一张通关秘籍卡！在教练室聊完一道题后，点顶部的「💾 存秘籍卡」就能一键归档到这里。',
                )
              : h(
                  'div',
                  { className: 'oi-grid-3' },
                  ...data.mistakeCards.map((c) =>
                    h(
                      'div',
                      {
                        key: c.file,
                        className: 'oi-card',
                        onClick: () => openDoc(c.file, c.title),
                        style: { cursor: 'pointer', display: 'grid', gap: 8 },
                      },
                      h(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 } },
                        h('span', { style: { fontWeight: 700, fontSize: 14, lineHeight: 1.4 } }, c.title),
                        h('span', { className: 'oi-pill', style: { color: C.accent } }, c.dimension),
                      ),
                      c.motto ? h('div', { style: { fontSize: 13, color: C.sub, lineHeight: 1.55 } }, `口诀：${c.motto}`) : null,
                    ),
                  ),
                )
            : st.archiveSubTab === 'notes'
              ? notes.length === 0
                ? h(
                    'div',
                    { className: 'oi-card-flat', style: { textAlign: 'center', padding: '44px 24px', color: C.sub, fontSize: 14 } },
                    'courses/notes/ 目录下还没有整理好的课程讲义。',
                  )
                : h(
                    'div',
                    { className: 'oi-grid-2' },
                    ...notes.map((n) =>
                      h(
                        'div',
                        {
                          key: n.file,
                          className: 'oi-card',
                          style: { display: 'grid', gap: 10 },
                        },
                        h(
                          'div',
                          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
                          h('div', { style: { fontWeight: 800, fontSize: 15, lineHeight: 1.4 } }, n.title),
                          n.date ? h('span', { className: 'oi-pill', style: { color: C.sub, whiteSpace: 'nowrap' } }, n.date) : null,
                        ),
                        n.summary ? h('div', { style: { fontSize: 13, color: C.sub, lineHeight: 1.6 } }, n.summary) : null,
                        h(
                          'div',
                          { style: { display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 2 } },
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'oi-btn',
                              onClick: () => openDoc(n.file, n.title),
                            },
                            '📖 阅读讲义',
                          ),
                          !n.pinned && Array.isArray(n.problems) && n.problems.length > 0
                            ? h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'oi-btn oi-btn-primary',
                                  disabled: !!st.busy,
                                  onClick: () => setState({ lectureDigestModal: n }),
                                },
                                '🧑‍🏫 带我读懂数学推导',
                              )
                            : null,
                          h(
                            'button',
                            {
                              type: 'button',
                              className: n.pinned ? 'oi-btn oi-btn-primary' : 'oi-btn',
                              disabled: !!st.busy,
                              onClick: () =>
                                launchCoachSession({
                                  presetId: 'oi-coach',
                                  title: `讲义变式 · ${n.title.slice(0, 14)}`,
                                  displayText: `基于讲义「${n.title}」出 1 道全新变式建模题练手`,
                                  previewQuery: '',
                                  skipProblemContext: true,
                                  prompt: `教练，我刚复习完课程讲义「${n.title}」（${n.summary || '建模专题'}）。请你基于同一类核心母模型，**新编 1 道变式建模微题**（附 1 组 N=3~4 具体小数字例子，不要照抄讲义原题结论，绝不剧透算法方向），按【实战探索 + 数学搭桥 5 步法】先带我手算 1 步再扶着翻译成数学式！`,
                                }),
                            },
                            '🎯 练 1 道变式建模题',
                          ),
                        ),
                      ),
                    ),
                  )
              : h(
                  'div',
                  { style: { display: 'grid', gap: 18 } },
                  // Clean summary strip
                  h(
                    'div',
                    { className: 'oi-grid-3' },
                    h(
                      'div',
                      { className: 'oi-card', style: { display: 'grid', gap: 4 } },
                      h('div', { style: { fontSize: 12.5, color: C.sub, fontWeight: 600 } }, '四平台累计独立 AC'),
                      h('div', { style: { fontSize: 28, fontWeight: 800, color: C.accent } }, `${data.totals.uniqueAc} 题`),
                      h('div', { style: { fontSize: 12.5, color: C.sub } }, `近 7 天新过 ${k.recent7Ac} 题 · 总提交 ${data.totals.submissions} 次`),
                    ),
                    h(
                      'div',
                      { className: 'oi-card', style: { display: 'grid', gap: 4 } },
                      h('div', { style: { fontSize: 12.5, color: C.sub, fontWeight: 600 } }, '近 30 天单题 ≥4 交占比'),
                      h('div', { style: { fontSize: 28, fontWeight: 800, color: k.runawayRate > 15 ? C.warn : C.ok } }, `${k.runawayRate}%`),
                      h('div', { style: { fontSize: 12.5, color: C.sub } }, `${k.runawayProbs}/${k.probsAttempted} 题 · 目标 ≤ 15%`),
                    ),
                    h(
                      'div',
                      { className: 'oi-card', style: { display: 'grid', gap: 4 } },
                      h('div', { style: { fontSize: 12.5, color: C.sub, fontWeight: 600 } }, 'AtCoder Rating / 近 30 天 CE'),
                      h('div', { style: { fontSize: 28, fontWeight: 800, color: C.text } }, `${data.student.atcoderRating} / ${k.ceCount} CE`),
                      h('div', { style: { fontSize: 12.5, color: C.sub } }, `最高表现 ${data.student.atcoderPeakPerf} · 同期 TLE ${k.tleCount} 次`),
                    ),
                  ),

                  // Parent tools (macOS only)
                  !data.isWindows
                    ? h(
                        'div',
                        { className: 'oi-card', style: { display: 'grid', gap: 12 } },
                        h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '🛠️ 家长端教研与数据同步（仅 Mac 家长端显示）'),
                        h(
                          'div',
                          { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                          h('button', { type: 'button', className: 'oi-btn oi-btn-primary', disabled: !!st.busy, onClick: () => triggerSync('all-ojs', '四平台增量抓题') }, st.busy === 'sync:all-ojs' ? '四平台抓题中…' : '⚡ 一键同步四平台'),
                          h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('oilibaitian', '同步信奥李拜天') }, st.busy === 'sync:oilibaitian' ? '同步中…' : '🔄 同步李拜天'),
                          h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('atcoder', '同步 AtCoder') }, st.busy === 'sync:atcoder' ? '同步中…' : '🔄 同步 AtCoder'),
                          h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('haoba', '同步好吧平台') }, st.busy === 'sync:haoba' ? '同步中…' : '🔄 同步好吧'),
                          h('button', { type: 'button', className: 'oi-btn', disabled: !!st.busy, onClick: () => triggerSync('timeline', '重建时间线') }, st.busy === 'sync:timeline' ? '重建中…' : '⏱️ 重建时间线'),
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'oi-btn',
                              disabled: !!st.busy,
                              onClick: () =>
                                launchCoachSession({
                                  presetId: 'oi-parent',
                                  title: '家长教研 · 周期诊断',
                                  displayText: '生成本周四维学习诊断与下周薄弱点建议',
                                  prompt: '请结合 profile/ 与 training/sync_logs/ 的最新四平台数据，按 parent-diagnosis 技能与核心习惯指标，帮我分析麒麒最近一周的进展与下周最该补的 2 个薄弱点。',
                                }),
                            },
                            '📊 呼叫家长教研官',
                          ),
                          agyReady
                            ? h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'oi-btn',
                                  style: st.useAgyBrain ? { borderColor: C.ok, color: C.ok } : { color: C.sub },
                                  onClick: () => setState({ useAgyBrain: !st.useAgyBrain }),
                                },
                                st.useAgyBrain ? '🧠 外脑直连已开' : '🧠 外脑已关（仅 DSH 模型）',
                              )
                            : null,
                        ),
                      )
                    : null,

                  // Platform breakdown
                  h(
                    'div',
                    { className: 'oi-grid-2' },
                    ...(data.platforms || []).map((pl) =>
                      h(
                        'div',
                        {
                          key: pl.id,
                          className: 'oi-card',
                          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
                        },
                        h(
                          'div',
                          null,
                          h('div', { style: { fontWeight: 700, fontSize: 14 } }, `${pl.name}（${pl.account}）`),
                          h('div', { style: { fontSize: 12.5, color: C.sub, marginTop: 3 } }, `总提交 ${pl.submissions} 条 · AC ${pl.solved} 题`),
                        ),
                        h('span', { style: { fontSize: 12, color: C.sub } }, `更新：${fmtIsoShort(pl.updatedAt)}`),
                      ),
                    ),
                  ),

                  // Core docs reader
                  h(
                    'div',
                    { style: { display: 'grid', gap: 10 } },
                    h('div', { style: { fontWeight: 700, fontSize: 14.5 } }, '📚 学习档案直读'),
                    h(
                      'div',
                      { className: 'oi-grid-3' },
                      ...buildDocShortcuts(data).map((doc) =>
                        h(
                          'div',
                          {
                            key: doc.path,
                            className: 'oi-card',
                            onClick: () => openDoc(doc.path, doc.title),
                            style: { cursor: 'pointer', display: 'grid', gap: 5 },
                          },
                          h('div', { style: { fontWeight: 700, fontSize: 13.5 } }, doc.title),
                          h('div', { style: { fontSize: 12.5, color: C.sub, lineHeight: 1.5 } }, doc.desc),
                        ),
                      ),
                    ),
                  ),
                ),
        ),
      )
    }

    function normalizeMathLatex(raw) {
      let s = String(raw || '').trim()
      // Unwrap \text{...}, \mathrm{...}, \mathbf{...}, \operatorname{...}
      for (let i = 0; i < 3; i++) {
        s = s.replace(/\\(?:text|mathrm|mathbf|mathit|operatorname|mathsf)\{([^{}]*)\}/g, '$1')
      }
      // Convert \sqrt{a}
      s = s.replace(/\\sqrt\{([^{}]+)\}/g, (_m, inner) =>
        /^[a-zA-Z0-9]$/.test(inner.trim()) ? `√${inner.trim()}` : `√(${inner.trim()})`,
      )
      // Remove sizing/spacing macros
      s = s.replace(/\\(?:left|right|displaystyle|textstyle|big|Big|bigg|Bigg)\b/g, '')
      s = s.replace(/\\(?:,|;|!|quad|qquad|:)/g, ' ')
      // Common mathematical symbols
      const symMap = [
        [/\\leq?(?![a-zA-Z])/g, ' ≤ '],
        [/\\geq?(?![a-zA-Z])/g, ' ≥ '],
        [/\\neq?(?![a-zA-Z])/g, ' ≠ '],
        [/\\approx(?![a-zA-Z])/g, ' ≈ '],
        [/\\times(?![a-zA-Z])/g, ' × '],
        [/\\cdot(?![a-zA-Z])/g, ' · '],
        [/\\div(?![a-zA-Z])/g, ' ÷ '],
        [/\\pm(?![a-zA-Z])/g, ' ± '],
        [/\\(?:to|rightarrow)(?![a-zA-Z])/g, ' → '],
        [/\\leftarrow(?![a-zA-Z])/g, ' ← '],
        [/\\Rightarrow(?![a-zA-Z])/g, ' ⇒ '],
        [/\\Leftrightarrow(?![a-zA-Z])/g, ' ⇔ '],
        [/\\infty(?![a-zA-Z])/g, '∞'],
        [/\\(?:ldots|cdots|dots)(?![a-zA-Z])/g, '…'],
        [/\\sum(?![a-zA-Z])/g, '∑'],
        [/\\prod(?![a-zA-Z])/g, '∏'],
        [/\\lfloor(?![a-zA-Z])/g, '⌊'],
        [/\\rfloor(?![a-zA-Z])/g, '⌋'],
        [/\\lceil(?![a-zA-Z])/g, '⌈'],
        [/\\rceil(?![a-zA-Z])/g, '⌉'],
        [/\\(?:bmod|pmod)(?![a-zA-Z])/g, ' mod '],
        [/\\(log|min|max|gcd|lcm|sin|cos|abs)(?![a-zA-Z])/g, '$1'],
        [/\\mid(?![a-zA-Z])/g, ' | '],
        [/\\notin(?![a-zA-Z])/g, ' ∉ '],
        [/\\in(?![a-zA-Z])/g, ' ∈ '],
        [/\\\{/g, '{'],
        [/\\\}/g, '}'],
        [/\\%/g, '%'],
        [/\\_/g, '_'],
      ]
      for (const [re, rep] of symMap) s = s.replace(re, rep)
      return s.replace(/\s{2,}/g, ' ').trim()
    }

    function renderMathNodes(raw, keyPrefix, depth = 0) {
      const norm = depth === 0 ? normalizeMathLatex(raw) : String(raw || '').trim()
      // First handle \frac{num}{den} as true textbook stacked fraction
      if (depth < 3 && norm.includes('\\frac{')) {
        const out = []
        const fracRe = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g
        let last = 0
        let idx = 0
        let m
        while ((m = fracRe.exec(norm)) !== null) {
          if (m.index > last) {
            out.push(...renderMathNodes(norm.slice(last, m.index), `${keyPrefix}-fp-${idx}`, depth + 1))
          }
          out.push(
            h(
              'span',
              { key: `${keyPrefix}-fr-${idx}`, className: 'oi-frac' },
              h('span', { className: 'oi-frac-num' }, ...renderMathNodes(m[1], `${keyPrefix}-fn-${idx}`, depth + 1)),
              h('span', { className: 'oi-frac-den' }, ...renderMathNodes(m[2], `${keyPrefix}-fd-${idx}`, depth + 1)),
            ),
          )
          idx++
          last = fracRe.lastIndex
        }
        if (last < norm.length) {
          out.push(...renderMathNodes(norm.slice(last), `${keyPrefix}-ft`, depth + 1))
        }
        if (out.length) return out
      }
      const nodes = []
      const scriptRe = /(\^|_)(?:\{([^{}]+)\}|([a-zA-Z0-9+-]))/g
      let last = 0
      let idx = 0
      let m
      while ((m = scriptRe.exec(norm)) !== null) {
        if (m.index > last) nodes.push(norm.slice(last, m.index))
        const tag = m[1] === '^' ? 'sup' : 'sub'
        const val = m[2] !== undefined ? m[2] : m[3]
        nodes.push(h(tag, { key: `${keyPrefix}-s-${idx++}` }, val))
        last = scriptRe.lastIndex
      }
      if (last < norm.length) nodes.push(norm.slice(last))
      return nodes.length ? nodes : [norm]
    }

    function renderInlineRich(line, keyPrefix) {
      // Protect escaped dollar signs (\$ -> placeholder)
      const ESC_DOLLAR = '\uE000'
      const src = String(line || '').replace(/\\\$/g, ESC_DOLLAR)
      const restore = (s) => s.replaceAll(ESC_DOLLAR, '$')
      // Match inline code, inline math ($...$ or \(...\)), or bold (**...**)
      const tokenRe = /`([^`\n]+)`|\\\((.+?)\\\)|\$(?!\s)([^$\n]+?)(?<!\s)\$|\*\*([^*\n]+?)\*\*/g
      const out = []
      let last = 0
      let idx = 0
      let m
      while ((m = tokenRe.exec(src)) !== null) {
        if (m.index > last) out.push(restore(src.slice(last, m.index)))
        if (m[1] !== undefined) {
          out.push(h('code', { key: `${keyPrefix}-c-${idx++}`, className: 'oi-code-inline' }, restore(m[1])))
        } else if (m[2] !== undefined || m[3] !== undefined) {
          const expr = restore(m[2] !== undefined ? m[2] : m[3])
          out.push(
            h(
              'span',
              { key: `${keyPrefix}-m-${idx++}`, className: 'oi-math' },
              ...renderMathNodes(expr, `${keyPrefix}-mn-${idx}`),
            ),
          )
        } else if (m[4] !== undefined) {
          out.push(
            h(
              'strong',
              { key: `${keyPrefix}-b-${idx++}`, style: { fontWeight: 700 } },
              ...renderInlineRich(restore(m[4]), `${keyPrefix}-bi-${idx}`),
            ),
          )
        }
        last = tokenRe.lastIndex
      }
      if (last < src.length) out.push(restore(src.slice(last)))
      return out.length ? out : ['']
    }

    function renderRichMessage(text, keyBase = 'r') {
      const raw = String(text || '')
      // 0. Split out <details><summary>...</summary>...</details> spoiler blocks
      const detRe = /<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi
      if (detRe.test(raw)) {
        detRe.lastIndex = 0
        const parts = []
        let last = 0
        let dm
        let idx = 0
        while ((dm = detRe.exec(raw)) !== null) {
          if (dm.index > last) {
            parts.push(...renderRichMessage(raw.slice(last, dm.index), `${keyBase}-pre-${idx}`))
          }
          parts.push(
            h(
              'details',
              { key: `${keyBase}-det-${idx}`, className: 'oi-details' },
              h('summary', null, ...renderInlineRich(dm[1].trim(), `${keyBase}-sum-${idx}`)),
              h('div', { style: { marginTop: 8 } }, ...renderRichMessage(dm[2].trim(), `${keyBase}-body-${idx}`)),
            ),
          )
          idx++
          last = detRe.lastIndex
        }
        if (last < raw.length) {
          parts.push(...renderRichMessage(raw.slice(last), `${keyBase}-tail`))
        }
        return parts
      }

      // 1. Split out fenced code blocks ```...```
      const codeSplitRe = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g
      const blocks = []
      let last = 0
      let m
      while ((m = codeSplitRe.exec(raw)) !== null) {
        if (m.index > last) blocks.push({ type: 'md', text: raw.slice(last, m.index) })
        blocks.push({ type: 'code', lang: m[1] || '', text: m[2].replace(/\n$/, '') })
        last = codeSplitRe.lastIndex
      }
      if (last < raw.length) blocks.push({ type: 'md', text: raw.slice(last) })

      const elements = []
      blocks.forEach((blk, bIdx) => {
        if (blk.type === 'code') {
          elements.push(h('pre', { key: `${keyBase}-cb-${bIdx}`, className: 'oi-code-block' }, blk.text))
          return
        }
        // 2. Split out display math blocks $$...$$ or \[...\]
        const dispRe = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g
        let dLast = 0
        let dm
        let segIdx = 0
        const pushLines = (chunk) => {
          const lines = chunk.split('\n')
          let i = 0
          while (i < lines.length) {
            const ln = lines[i]
            const trimmed = ln.trim()
            // Markdown table detection
            if (trimmed.startsWith('|') && i + 1 < lines.length && /^\|[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
              const parseRow = (row) =>
                row
                  .trim()
                  .replace(/^\|/, '')
                  .replace(/\|$/, '')
                  .split('|')
                  .map((c) => c.trim())
              const headers = parseRow(ln)
              i += 2
              const rows = []
              while (i < lines.length && lines[i].trim().startsWith('|')) {
                rows.push(parseRow(lines[i]))
                i++
              }
              elements.push(
                h(
                  'table',
                  { key: `${keyBase}-tbl-${bIdx}-${segIdx}-${i}`, className: 'oi-md-table' },
                  h(
                    'thead',
                    null,
                    h(
                      'tr',
                      null,
                      ...headers.map((cell, ci) =>
                        h('th', { key: ci }, ...renderInlineRich(cell, `${keyBase}-th-${bIdx}-${i}-${ci}`)),
                      ),
                    ),
                  ),
                  h(
                    'tbody',
                    null,
                    ...rows.map((r, ri) =>
                      h(
                        'tr',
                        { key: ri },
                        ...r.map((cell, ci) =>
                          h('td', { key: ci }, ...renderInlineRich(cell, `${keyBase}-td-${bIdx}-${i}-${ri}-${ci}`)),
                        ),
                      ),
                    ),
                  ),
                ),
              )
              continue
            }
            if (/^---+$/.test(trimmed)) {
              elements.push(
                h('hr', { key: `${keyBase}-hr-${bIdx}-${segIdx}-${i}`, style: { border: 'none', borderTop: `1px solid ${C.border}`, margin: '10px 0' } }),
              )
            } else if (/^>\s?/.test(trimmed)) {
              const qText = trimmed.replace(/^>\s?/, '')
              elements.push(
                h(
                  'div',
                  { key: `${keyBase}-q-${bIdx}-${segIdx}-${i}`, className: 'oi-quote' },
                  ...renderInlineRich(qText, `${keyBase}-qi-${bIdx}-${segIdx}-${i}`),
                ),
              )
            } else if (/^#{1,4}\s+/.test(trimmed)) {
              const titleText = trimmed.replace(/^#{1,4}\s+/, '')
              elements.push(
                h(
                  'div',
                  { key: `${keyBase}-h-${bIdx}-${segIdx}-${i}`, style: { fontWeight: 800, fontSize: 14.5, margin: '8px 0 4px' } },
                  ...renderInlineRich(titleText, `${keyBase}-hi-${bIdx}-${segIdx}-${i}`),
                ),
              )
            } else {
              elements.push(
                h(
                  'div',
                  { key: `${keyBase}-l-${bIdx}-${segIdx}-${i}`, style: { minHeight: trimmed ? undefined : 6 } },
                  ...renderInlineRich(ln, `${keyBase}-li-${bIdx}-${segIdx}-${i}`),
                ),
              )
            }
            i++
          }
        }
        while ((dm = dispRe.exec(blk.text)) !== null) {
          if (dm.index > dLast) {
            pushLines(blk.text.slice(dLast, dm.index))
            segIdx++
          }
          const expr = dm[1] !== undefined ? dm[1] : dm[2]
          elements.push(
            h(
              'div',
              { key: `${keyBase}-dm-${bIdx}-${segIdx++}`, className: 'oi-math-block' },
              ...renderMathNodes(expr, `${keyBase}-dmn-${bIdx}-${segIdx}`),
            ),
          )
          dLast = dispRe.lastIndex
        }
        if (dLast < blk.text.length) pushLines(blk.text.slice(dLast))
      })
      return elements
    }

    function HistorySidebar({ st }) {
      const all = st.chatHistory || []
      const q = String(st.historyQuery || '').trim().toLowerCase()
      const filtered = q
        ? all.filter((c) => `${c.title} ${c.lastPreview}`.toLowerCase().includes(q))
        : all

      return h(
        'div',
        { className: 'oi-history-rail' },
        h(
          'div',
          { style: { padding: '12px 12px 8px', display: 'grid', gap: 8, borderBottom: `1px solid ${C.border}` } },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 } },
            h('span', { style: { fontSize: 12.5, fontWeight: 700, color: C.sub } }, `历史对话（${all.length}）`),
            h(
              'button',
              {
                type: 'button',
                className: 'oi-btn oi-btn-primary',
                style: { padding: '4px 10px', fontSize: 12 },
                onClick: () => cancelAgyRequest(true),
              },
              '+ 新题',
            ),
          ),
          all.length > 3
            ? h('input', {
                type: 'text',
                className: 'oi-input-sm',
                value: st.historyQuery,
                placeholder: '搜索题号或关键词…',
                onChange: (e) => setState({ historyQuery: e.target.value }),
              })
            : null,
        ),
        h(
          'div',
          { className: 'oi-history-list' },
          filtered.length === 0
            ? h(
                'div',
                { style: { fontSize: 12.5, color: C.sub, padding: '20px 8px', textAlign: 'center', lineHeight: 1.6 } },
                all.length === 0 ? '聊完任意一道题后，记录会自动保存在这里，随时可以回看或继续推。' : '没有找到匹配的历史对话',
              )
            : filtered.map((item) => {
                const active = st.agyChat?.open && st.agyChat?.chatId === item.id
                return h(
                  'div',
                  {
                    key: item.id,
                    className: `oi-history-item ${active ? 'oi-history-item-active' : ''}`,
                    onClick: () => openChatFromHistory(item.id),
                  },
                  h(
                    'div',
                    { style: { minWidth: 0, flex: 1, display: 'grid', gap: 3 } },
                    h(
                      'div',
                      {
                        style: {
                          fontSize: 13,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      },
                      item.title,
                    ),
                    h(
                      'div',
                      { style: { fontSize: 11.5, color: C.sub, display: 'flex', gap: 6, flexWrap: 'wrap' } },
                      h('span', null, `${item.turns || 1} 轮`),
                      h('span', null, fmtIsoShort(item.updatedAt)),
                    ),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn oi-btn-ghost',
                      title: '删除这条历史记录',
                      style: { padding: '2px 6px', fontSize: 12, flexShrink: 0 },
                      onClick: (e) => {
                        e.stopPropagation()
                        void deleteChatFromHistory(item.id)
                      },
                    },
                    '×',
                  ),
                )
              }),
        ),
      )
    }

    function SaveCardModal({ modal }) {
      if (!modal) return null
      const update = (patch) => setState({ saveCardModal: { ...modal, ...patch } })
      const dims = [
        { id: 'math', label: '数学建模 (math)' },
        { id: 'algorithm', label: '算法思路 (algorithm)' },
        { id: 'coding', label: '编程实现 (coding)' },
        { id: 'habit', label: '习惯策略 (habit)' },
      ]
      return h(
        'div',
        { className: 'oi-modal-bg', onClick: () => setState({ saveCardModal: null }) },
        h(
          'div',
          { className: 'oi-modal', style: { width: 'min(580px, 95vw)' }, onClick: (e) => e.stopPropagation() },
          h(
            'div',
            {
              style: {
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            },
            h('div', { style: { fontWeight: 800, fontSize: 15 } }, '💾 保存 3 行通关秘籍卡到 mistakes/'),
            h('button', { type: 'button', className: 'oi-btn oi-btn-ghost', onClick: () => setState({ saveCardModal: null }) }, '关闭'),
          ),
          h(
            'div',
            { style: { padding: '18px 20px', display: 'grid', gap: 14, overflowY: 'auto' } },
            h(
              'div',
              { style: { display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10 } },
              h(
                'div',
                null,
                h('label', { className: 'oi-field-label' }, '题目名称'),
                h('input', {
                  type: 'text',
                  className: 'oi-input-sm',
                  value: modal.title,
                  onChange: (e) => update({ title: e.target.value }),
                }),
              ),
              h(
                'div',
                null,
                h('label', { className: 'oi-field-label' }, '平台'),
                h(
                  'select',
                  {
                    className: 'oi-input-sm',
                    value: modal.platform,
                    onChange: (e) => update({ platform: e.target.value }),
                  },
                  h('option', { value: 'atcoder' }, 'AtCoder'),
                  h('option', { value: 'haoba' }, '好吧平台'),
                  h('option', { value: 'oilibaitian' }, '信奥李拜天'),
                  h('option', { value: 'luogu' }, '洛谷'),
                  h('option', { value: 'drill' }, '建模快练'),
                  h('option', { value: 'oj' }, '其他 OJ'),
                ),
              ),
            ),
            h(
              'div',
              null,
              h('label', { className: 'oi-field-label' }, '四维核心根因'),
              h(
                'div',
                { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                ...dims.map((d) =>
                  h(
                    'button',
                    {
                      key: d.id,
                      type: 'button',
                      className: `oi-chip ${modal.dimension === d.id ? 'oi-chip-active' : ''}`,
                      onClick: () => update({ dimension: d.id }),
                    },
                    d.label,
                  ),
                ),
              ),
            ),
            h(
              'div',
              null,
              h('label', { className: 'oi-field-label' }, '1. 刚才掉进的坑'),
              h('input', {
                type: 'text',
                className: 'oi-input-sm',
                placeholder: '例如：没去绝对值直接两重枚举，N=30万超时',
                value: modal.pitfall,
                onChange: (e) => update({ pitfall: e.target.value }),
              }),
            ),
            h(
              'div',
              null,
              h('label', { className: 'oi-field-label' }, '2. 破局的数学变形 / 极小反例'),
              h('input', {
                type: 'text',
                className: 'oi-input-sm',
                placeholder: '例如：按 j<i 和 j>i 去绝对值后分离变量，同色时候选集合一致',
                value: modal.breakthrough,
                onChange: (e) => update({ breakthrough: e.target.value }),
              }),
            ),
            h(
              'div',
              null,
              h('label', { className: 'oi-field-label' }, '3. 下次交前一句防坑口诀'),
              h('input', {
                type: 'text',
                className: 'oi-input-sm',
                placeholder: '例如：见 |i-j| 先去绝对值分左右，无解初值设 10⁹ 不设 INT_MAX',
                value: modal.motto,
                onChange: (e) => update({ motto: e.target.value }),
              }),
            ),
            h(
              'div',
              { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 } },
              h('button', { type: 'button', className: 'oi-btn', onClick: () => setState({ saveCardModal: null }) }, '取消'),
              h(
                'button',
                {
                  type: 'button',
                  className: 'oi-btn oi-btn-primary',
                  disabled: modal.saving || (!modal.pitfall.trim() && !modal.breakthrough.trim() && !modal.motto.trim()),
                  onClick: () => submitSaveCard(),
                },
                modal.saving ? '保存中…' : '确认存入 mistakes/',
              ),
            ),
          ),
        ),
      )
    }

    function CoachRoomTab({ data, st }) {
      const chat = st.agyChat
      const scrollRef = React.useRef(null)
      const isActive = Boolean(chat?.open && (chat.messages.length > 0 || chat.sending))

      React.useEffect(() => {
        const el = scrollRef.current
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      }, [chat.messages.length, chat.sending])

      const handleStartNew = () => {
        const raw = st.intakeText.trim()
        if (!raw) {
          setState({ error: '先输入题号、题面或报错信息哦！' })
          return
        }
        const mode = st.intakeMode || 'hint'
        const labels = { hint: '探索建模', wa: 'WA 排错', tle: 'TLE 重拆', re: 'RE/CE 排查', pm: 'AC 存秘籍' }
        void launchCoachSession({
          presetId: 'oi-coach',
          title: `${labels[mode]} · ${raw.slice(0, 18).replace(/\s+/g, ' ')}`,
          displayText: raw,
          previewQuery: raw,
          prompt: buildQuickPrompt(mode, raw),
        })
      }

      const historyToggleBtn = h(
        'button',
        {
          type: 'button',
          className: `oi-btn oi-btn-ghost`,
          title: st.showHistoryRail ? '收起历史对话栏' : '展开历史对话栏',
          onClick: () => setState({ showHistoryRail: !st.showHistoryRail }),
        },
        st.showHistoryRail ? '◧ 收起历史' : `☰ 历史（${(st.chatHistory || []).length}）`,
      )

      let mainArea
      if (!isActive) {
        const quickProblems = (data?.unsolvedRecent || []).slice(0, 3)
        const modes = [
          { id: 'hint', label: '🧮 探索建模' },
          { id: 'wa', label: '🩺 WA 排错' },
          { id: 'tle', label: '⏱️ TLE 重拆' },
          { id: 'pm', label: '🃏 AC 存秘籍' },
        ]
        mainArea = h(
          'div',
          { className: 'oi-chat-room' },
          h(
            'div',
            { style: { flexShrink: 0, padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            historyToggleBtn,
            h('span', null),
          ),
          h(
            'div',
            {
              className: 'oi-scroll',
              style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingTop: 12 },
            },
            h(
              'div',
              {
                style: {
                  width: '100%',
                  maxWidth: 740,
                  display: 'grid',
                  gap: 24,
                  justifyItems: 'center',
                  paddingBottom: 24,
                },
              },
              h(
                'div',
                { style: { textAlign: 'center', display: 'grid', gap: 8 } },
                h('div', { style: { fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' } }, '今天想攻克哪道题？'),
                h('div', { style: { fontSize: 14, color: C.sub } }, '备好演草本，贴上题号、题面或卡住的代码，先拿小数字手算破冰，再一步步翻译成数学式'),
              ),
              h(
                'div',
                { className: 'oi-composer' },
                h('textarea', {
                  className: 'oi-textarea',
                  placeholder: '输入题号（如 abc485_c）、粘贴题面，或贴一段报错/超时的代码…（Ctrl/Cmd + Enter 发送）',
                  value: st.intakeText,
                  onChange: (e) => setState({ intakeText: e.target.value }),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleStartNew()
                    }
                  },
                }),
                h(
                  'div',
                  { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 } },
                  h(
                    'div',
                    { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                    ...modes.map((m) =>
                      h(
                        'button',
                        {
                          key: m.id,
                          type: 'button',
                          className: `oi-chip ${st.intakeMode === m.id ? 'oi-chip-active' : ''}`,
                          onClick: () => setState({ intakeMode: m.id }),
                        },
                        m.label,
                      ),
                    ),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn oi-btn-primary',
                      disabled: !!st.busy || !st.intakeText.trim(),
                      style: { padding: '8px 18px', fontSize: 13.5 },
                      onClick: handleStartNew,
                    },
                    '开始辅导 →',
                  ),
                ),
              ),
              quickProblems.length > 0
                ? h(
                    'div',
                    { style: { width: '100%', display: 'grid', gap: 10 } },
                    h(
                      'div',
                      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' } },
                      h('span', { style: { fontSize: 13, color: C.sub, fontWeight: 600 } }, '接着补近期卡住的题'),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'oi-btn oi-btn-ghost',
                          style: { fontSize: 12.5 },
                          onClick: () => setState({ tab: 'problems' }),
                        },
                        `查看全部 ${(data?.unsolvedRecent || []).length} 道待补题 →`,
                      ),
                    ),
                    h(
                      'div',
                      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 } },
                      ...quickProblems.map((p, idx) =>
                        h(
                          'button',
                          {
                            key: `quick-${p.platform}-${p.title}-${idx}`,
                            type: 'button',
                            className: 'oi-card',
                            disabled: !!st.busy,
                            onClick: () => launchProblemAction(p, 'model'),
                            style: {
                              textAlign: 'left',
                              cursor: 'pointer',
                              padding: '13px 15px',
                              display: 'grid',
                              gap: 5,
                              color: C.text,
                            },
                          },
                          h('div', { style: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.35 } }, p.title),
                          h('div', { style: { fontSize: 12, color: C.sub } }, `${p.platform} · ${p.trajectory}`),
                        ),
                      ),
                    ),
                  )
                : null,
            ),
          ),
        )
      } else {
        const pv = st.problemPreview
        mainArea = h(
          'div',
          { className: 'oi-chat-room' },
          h(
            'div',
            { className: 'oi-chat-head' },
            h(
              'div',
              { className: 'oi-chat-head-inner' },
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 } },
                historyToggleBtn,
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn oi-btn-ghost',
                    onClick: () => cancelAgyRequest(true),
                  },
                  '← 新题',
                ),
                h(
                  'div',
                  { style: { fontWeight: 700, fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                  chat.title || '教练对话',
                ),
              ),
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                pv && pv.statement
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: `oi-chip ${st.showProblemPreview ? 'oi-chip-active' : ''}`,
                        onClick: () => setState({ showProblemPreview: !st.showProblemPreview }),
                      },
                      st.showProblemPreview ? '📄 收起原题' : '📄 看原题',
                    )
                  : null,
                pv && pv.lectureNote && pv.lectureNote.file
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'oi-chip',
                        onClick: () => openDoc(pv.lectureNote.file, pv.lectureNote.title),
                      },
                      '📚 对应讲义',
                    )
                  : null,
                pv && pv.lectureNote && pv.lectureNote.file && chat.mode !== 'parent' && !chat.sending
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'oi-chip',
                        onClick: () =>
                          void sendAgyMessage(
                            '教练，任老师讲义里这一步的数学式子我有点看晕，能先拿两组具体小数字（比如 N=3~4 或边界数）代进去慢放算给我看，再告诉我怎么变成那个字母式子吗？',
                            { subMode: 'lecture-digest', displayText: '🧑‍🏫 请用具体小数字帮我慢放拆解这一步数学式子' },
                          ),
                      },
                      '🧑‍🏫 慢放拆解数学式',
                    )
                  : null,
                chat.messages.length >= 2 && chat.mode !== 'parent'
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'oi-chip',
                        onClick: () => openSaveCardModal(),
                      },
                      '💾 存秘籍卡',
                    )
                  : null,
                Boolean(data && !data.isWindows)
                  ? h(
                      'select',
                      {
                        value: st.agyModel,
                        onChange: (e) => setState({ agyModel: e.target.value }),
                        style: {
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: C.base,
                          color: C.sub,
                          padding: '5px 8px',
                          fontSize: 12,
                        },
                      },
                      h('option', { value: 'gemini-4-neon-high' }, 'Gemini 4 Neon (High)'),
                      h('option', { value: 'gemini-4-neon-medium' }, 'Gemini 4 Neon (Medium)'),
                      h('option', { value: 'gemini-4-argon-high' }, 'Gemini 4 Argon (High)'),
                      h('option', { value: 'gemini-3.8-flash-high' }, 'Gemini 3.8 Flash'),
                    )
                  : null,
              ),
            ),
            pv && pv.statement && st.showProblemPreview
              ? h(
                  'div',
                  {
                    style: {
                      maxWidth: 840,
                      margin: '10px auto 2px',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: C.layer,
                      border: `1px solid ${C.border}`,
                      maxHeight: 240,
                      overflowY: 'auto',
                      fontSize: 13.5,
                      lineHeight: 1.7,
                    },
                  },
                  h('div', { style: { fontWeight: 700, marginBottom: 6, fontSize: 13.5 } }, `${pv.title}（${pv.platform}）`),
                  ...renderRichMessage(pv.statement, 'pv'),
                )
              : null,
          ),

          h(
            'div',
            { ref: scrollRef, className: 'oi-chat-messages' },
            h(
              'div',
              { className: 'oi-chat-stream' },
              ...chat.messages.map((m, idx) =>
                m.role === 'user'
                  ? h('div', { key: idx, className: 'oi-msg-user' }, ...renderRichMessage(m.text, `u-${idx}`))
                  : h(
                      'div',
                      { key: idx, className: 'oi-msg-assistant' },
                      h(
                        'div',
                        { style: { fontSize: 12, color: C.sub, marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 } },
                        h('span', { style: { fontWeight: 600 } }, chat.mode === 'parent' ? '📊 家长教研官' : '🧭 OI 教练'),
                        m.duration ? h('span', null, `${Number(m.duration).toFixed(1)}s`) : null,
                      ),
                      ...renderRichMessage(m.text, `a-${idx}`),
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
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: C.layer,
                        fontSize: 13.5,
                        color: C.accent,
                        fontWeight: 600,
                      },
                    },
                    h('span', null, `思考中… ${chat.elapsed || 0}s`),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'oi-btn',
                        style: { borderColor: C.err, color: C.err, padding: '4px 10px', fontSize: 12 },
                        onClick: () => cancelAgyRequest(false),
                      },
                      '停止',
                    ),
                  )
                : null,
            ),
          ),

          h(
            'div',
            { className: 'oi-chat-dock' },
            h(
              'div',
              { className: 'oi-chat-dock-inner' },
              h(
                'div',
                { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                ...['A', 'B', 'C', '给我一组 N≤4 的小反例', '下一步呢？', '请按 3 行通关秘籍卡帮我总结这道题'].map((quick) =>
                  h(
                    'button',
                    {
                      key: quick,
                      type: 'button',
                      className: 'oi-chip',
                      disabled: chat.sending,
                      onClick: () => sendAgyMessage(quick),
                    },
                    quick,
                  ),
                ),
              ),
              h(
                'div',
                { style: { display: 'flex', gap: 10, alignItems: 'center' } },
                h('input', {
                  type: 'text',
                  className: 'oi-reply-input',
                  value: chat.draft,
                  disabled: chat.sending,
                  placeholder: '回复 A / B / C、演草纸算出的数字，或直接提问…（回车发送）',
                  onChange: (e) => setState({ agyChat: { ...chat, draft: e.target.value } }),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void sendAgyMessage(chat.draft)
                    }
                  },
                }),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn oi-btn-primary',
                    style: { padding: '11px 20px', fontSize: 14 },
                    disabled: chat.sending || !chat.draft.trim(),
                    onClick: () => sendAgyMessage(chat.draft),
                  },
                  chat.sending ? '思考中…' : '发送',
                ),
              ),
            ),
          ),
        )
      }

      return h(
        'div',
        { className: 'oi-coach-layout' },
        st.showHistoryRail ? h(HistorySidebar, { st }) : null,
        mainArea,
      )
    }

    function DocModal({ modal }) {
      const [rawView, setRawView] = React.useState(false)
      React.useEffect(() => {
        setRawView(false)
      }, [modal?.path])
      if (!modal) return null
      const isMd = /\.md$/i.test(String(modal.path || ''))
      const showRich = isMd && !rawView
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
                gap: 8,
              },
            },
            h('div', { style: { fontWeight: 700, fontSize: 14 } }, `${modal.title}（${modal.path}）`),
            h(
              'div',
              { style: { display: 'flex', gap: 6, alignItems: 'center' } },
              isMd
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn',
                      onClick: () => setRawView((v) => !v),
                    },
                    rawView ? '📖 易读数学排版' : '📄 查看原文',
                  )
                : null,
              h('button', { type: 'button', className: 'oi-btn', onClick: () => setState({ docModal: null }) }, '关闭'),
            ),
          ),
          h(
            'div',
            { style: { padding: '16px 20px', overflowY: 'auto', flex: 1 } },
            modal.loading
              ? h('div', { style: { color: C.sub } }, '加载中…')
              : modal.error
                ? h('div', { style: { color: C.err } }, modal.error)
                : showRich
                  ? h(
                      'div',
                      { style: { fontSize: 13.5, lineHeight: 1.75, wordBreak: 'break-word' } },
                      ...renderRichMessage(modal.content, 'doc'),
                    )
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

    function LectureDigestModal({ modal }) {
      if (!modal) return null
      const probs = Array.isArray(modal.problems) ? modal.problems : []
      const pickProblem = (p) => {
        const label = [p.slot, p.pid, p.title && p.title !== p.pid ? p.title : ''].filter(Boolean).join(' ')
        setState({ lectureDigestModal: null })
        void launchCoachSession({
          presetId: 'oi-coach',
          subMode: 'lecture-digest',
          title: `讲义慢放 · ${label}`,
          displayText: `请帮我慢放拆解讲义《${modal.title}》里的【${label}】的数学推导`,
          previewQuery: p.pid,
          prompt: `教练，我在看任衍硕老师讲义《${modal.title}》里的题目【${label}】时，对课堂上的数学公式推导有点接受不了。请开启【课后讲义数学慢放拆解模式】，千万别一口气把公式倒给我，先拿 1 组 N=3~4 的具体小数字带我算 1 步，再一帧帧把数字翻译成讲义里的字母推导（严禁给完整 AC 代码）！`,
        })
      }
      return h(
        'div',
        { className: 'oi-modal-bg', onClick: () => setState({ lectureDigestModal: null }) },
        h(
          'div',
          { className: 'oi-modal', style: { width: 'min(560px, 94vw)' }, onClick: (e) => e.stopPropagation() },
          h(
            'div',
            {
              style: {
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              },
            },
            h('div', { style: { fontWeight: 800, fontSize: 15 } }, '🧑‍🏫 点选哪道题的数学推导没听懂（零打字直达）'),
            h('button', { type: 'button', className: 'oi-btn oi-btn-ghost', onClick: () => setState({ lectureDigestModal: null }) }, '关闭'),
          ),
          h(
            'div',
            { style: { padding: '16px 20px', display: 'grid', gap: 14, overflowY: 'auto' } },
            h('div', { style: { fontSize: 13, color: C.sub, lineHeight: 1.6 } }, `当前讲义：${modal.title}。点下面任意一道题，教练会先用 N = 3~4 具体小数字带你算清楚，再一步步翻译成任老师的数学式子：`),
            h(
              'div',
              { style: { display: 'grid', gap: 8 } },
              ...probs.map((p) => {
                const label = [p.slot, p.pid, p.title && p.title !== p.pid ? p.title : ''].filter(Boolean).join(' · ')
                return h(
                  'button',
                  {
                    key: p.pid,
                    type: 'button',
                    className: 'oi-btn',
                    style: {
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      textAlign: 'left',
                    },
                    onClick: () => pickProblem(p),
                  },
                  h('span', { style: { fontWeight: 700, fontSize: 13.5 } }, label),
                  h(
                    'span',
                    {
                      className: 'oi-pill',
                      style: {
                        color: p.solved ? C.ok : C.warn,
                        borderColor: p.solved ? C.ok : C.warn,
                      },
                    },
                    p.solved ? '✓ 已 AC · 巩固推导' : '🔒 待补 · 慢放拆解',
                  ),
                )
              }),
            ),
          ),
        ),
      )
    }

    function SyncStatusModal({ open, sync, isWindows, busy }) {
      if (!open) return null
      const ojMeta = sync?.lastOjSync || null
      return h(
        'div',
        { className: 'oi-modal-bg', onClick: () => setState({ showSyncModal: false }) },
        h(
          'div',
          { className: 'oi-modal', style: { width: 'min(480px, 94vw)' }, onClick: (e) => e.stopPropagation() },
          h(
            'div',
            {
              style: {
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              },
            },
            h('div', { style: { fontWeight: 800, fontSize: 15 } }, '☁️ 云端无感自动同步中心'),
            h('button', { type: 'button', className: 'oi-btn oi-btn-ghost', onClick: () => setState({ showSyncModal: false }) }, '关闭'),
          ),
          h(
            'div',
            { style: { padding: '16px 20px', display: 'grid', gap: 12 } },
            h(
              'div',
              {
                style: {
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: C.layer,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: C.text,
                },
              },
              isWindows
                ? '✅ 后台自动同步已守护中：存通关秘籍卡 3 秒自动上云 · 对话停笔 45 秒自动备份 · 每 5 分钟自动收新讲义与新题单（断网静默重试，平时完全无需手动点击）。'
                : '✅ 家长中枢守护中：每 3 分钟自动接收孩子端新对话与错题卡 · 每 2 小时后台定时增量抓取四平台刷题记录并推送更新。',
            ),
            h(
              'div',
              { style: { display: 'grid', gap: 6, fontSize: 12.5, color: C.sub } },
              h('div', null, `最近云端同步：${formatSyncTime(sync?.lastSyncAt)} · ${sync?.lastMessage || '后台自动守护已就绪'}`),
              ojMeta?.updatedAt
                ? h(
                    'div',
                    null,
                    `最近四平台抓题：${formatSyncTime(ojMeta.updatedAt)}${ojMeta.hasNewSubmissions ? '（抓到新提交并已同步）' : '（四平台已是最新）'}`,
                  )
                : null,
            ),
            h(
              'div',
              { style: { display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4 } },
              h(
                'button',
                {
                  type: 'button',
                  className: 'oi-btn oi-btn-primary',
                  disabled: !!busy,
                  onClick: () => {
                    setState({ showSyncModal: false })
                    void triggerSync('git-sync', '云端双向同步')
                  },
                },
                busy === 'sync:git-sync' ? '同步中…' : '🔄 立即双向同步',
              ),
              !isWindows
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'oi-btn',
                      disabled: !!busy,
                      onClick: () => {
                        setState({ showSyncModal: false })
                        void triggerSync('all-ojs', '四平台增量抓题')
                      },
                    },
                    busy === 'sync:all-ojs' ? '抓题中…' : '⚡ 立即抓四平台新题',
                  )
                : null,
            ),
          ),
        ),
      )
    }

    const GESP8_BLIND_PACKS = [
      {
        id: 'oop',
        title: '盲区 ① · C++ 类、继承与虚函数多态',
        badge: '稳拿 6~8 分语法送分题',
        summary: '平时打算法赛只写全局数组和 struct，考八级客观题前必须把 class 权限、构造析构顺序与 virtual 多态这 6 个固定考点一次焊牢！',
        questions: [
          {
            id: 'oop-1',
            q: '在 C++ 中定义 class Box { int x; }; 与 struct Node { int x; }; 时，如果不写访问修饰符，x 的默认访问权限分别是？',
            options: ['A. 都是 private', 'B. class 默认 private，struct 默认 public', 'C. class 默认 public，struct 默认 private'],
            ans: 1,
            explain: 'C++ 唯一核心区别：class 不写标签默认全是 private（类外不能直接点出来），而 struct 默认全是 public！',
          },
          {
            id: 'oop-2',
            q: '派生类 Derived 继承自基类 Base。创建一个 Derived 对象并在作用域结束销毁时，构造函数与析构函数的调用顺序是？',
            options: [
              'A. 构造：先 Base 后 Derived；析构：先 ~Derived 后 ~Base',
              'B. 构造：先 Derived 后 Base；析构：先 ~Base 后 ~Derived',
              'C. 构造和析构都是先 Base 后 Derived',
            ],
            ans: 0,
            explain: '口诀「穿衣先穿里面（先父后子），脱衣先脱外面（先子后父）」：先有地基 Base 才能盖楼 Derived，拆楼时反过来先拆顶楼 ~Derived 再拆地基 ~Base！',
          },
          {
            id: 'oop-3',
            q: '若 class Son : public Dad，Dad 里有 protected int money; 和 private int secret;，在 Son 的成员函数内部能直接读写哪个变量？',
            options: ['A. money 和 secret 都能直接读写', 'B. 只能直接读写 protected 的 money，不能直接碰 private 的 secret', 'C. 两个都不能直接读写'],
            ans: 1,
            explain: 'protected 叫「传家宝」——外部路人不能碰，但亲儿子（派生类内部）可以直接用；private 是「私房钱」，连亲儿子也不能直接访问！',
          },
          {
            id: 'oop-4',
            q: '基类 Animal 有 virtual void cry() { cout << 1; }，子类 Cat 重写 void cry() { cout << 2; }。执行 Animal* p = new Cat(); p->cry(); 会输出什么？',
            options: ['A. 输出 1（看指针类型 Animal*）', 'B. 输出 2（加了 virtual 触发动态多态，看真实对象 Cat）', 'C. 编译报错'],
            ans: 1,
            explain: '基类函数加了 virtual 就像装了「自动识别雷达」：哪怕用父类指针指着，运行时也会认出底下其实是只真猫（Cat），输出 2！若没写 virtual 才会输出 1。',
          },
          {
            id: 'oop-5',
            q: '【高频判断题】在多态继承体系中，关于「虚构造函数」与「虚析构函数」，哪句话是正确的？',
            options: [
              'A. 构造函数可以是 virtual，析构函数不能是 virtual',
              'B. 构造函数绝不能是 virtual，而多态基类的析构函数应该声明为 virtual',
              'C. 构造函数和析构函数都可以声明为 virtual',
            ],
            ans: 1,
            explain: 'delete 父类指针时，若基类析构不是 virtual，就只会调父类析构而漏掉子类析构造成内存泄漏！反过来，构造时对象还没诞生、虚函数表还没建好，所以构造函数绝不能是 virtual！',
          },
          {
            id: 'oop-6',
            q: '类中包含纯虚函数 virtual double area() = 0; 时，这个类叫「抽象类」。下面哪个操作是非法（会编译报错）的？',
            options: ['A. 定义指向该抽象类的指针 Shape* p;', 'B. 直接创建该抽象类的对象 Shape s;', 'C. 子类 Circle 实现 area() 后创建 Circle c;'],
            ans: 1,
            explain: '纯虚函数 = 0 说明「图纸还没画完」，不能直接造出实体对象 Shape s；但可以定义指针 Shape* p 指向已经实现好 area() 的子类对象！',
          },
        ],
      },
      {
        id: 'combo',
        title: '盲区 ② · 排列组合、圆排列与杨辉三角',
        badge: '决胜 10~12 分计数大户',
        summary: '对标 2025~2026 真题最高频计数题：从 0 编号的杨辉三角、整除三位数、圆桌捆绑法、二项式系数与正难则反概率！',
        questions: [
          {
            id: 'cb-1',
            q: '【真题原味坑】杨辉三角中，行号和列号均从 0 开始计数（第 0 行只有 1 个数 1），那么第 6 行第 2 个数是多少？',
            options: ['A. 10', 'B. 15', 'C. 20'],
            ans: 1,
            explain: '从 0 开始数时，第 n 行第 m 列直接对应组合数 C(n, m)！所以第 6 行第 2 列就是 C(6, 2) = (6×5) ÷ (2×1) = 15（若误减 1 算成 C(5,1)=5 或 C(6,1)=6 就掉坑啦）！',
          },
          {
            id: 'cb-2',
            q: '用数字 0、1、2、3 组成「没有重复数字」且「能被 3 整除」的三位数，一共有多少个？',
            options: ['A. 10 个', 'B. 12 个', 'C. 18 个'],
            ans: 0,
            explain: '能被 3 整除看各位数字之和！四个数里选 3 个和是 3 的倍数只有两组：{0,1,2}（和=3）与 {1,2,3}（和=6）。{1,2,3} 随便排有 3×2×1 = 6 个；{0,1,2} 百位不能放 0，百位 2 种×十位 2 种×个位 1 种 = 4 个。合计 6 + 4 = 10 个！',
          },
          {
            id: 'cb-3',
            q: '5 个人围着圆桌坐一圈（座位不编号，整体旋转后一样算同一种坐法，但区分顺逆时针），要求甲和乙必须相邻，共有几种坐法？',
            options: ['A. 12 种', 'B. 24 种', 'C. 48 种'],
            ans: 0,
            explain: '两步秒杀：① 把甲乙绑成一个「双人包」，和另外 3 人共 4 个单位围圆桌：固定 1 个单位当参照物，剩下 3 个全排列有 (4-1)! = 6 种；② 包内甲左乙右或乙左甲右有 2 种，共 6 × 2 = 12 种！',
          },
          {
            id: 'cb-4',
            q: '二项式 (2x - 1)⁴ 展开合并同类项后，x² 项的系数是多少？',
            options: ['A. 6', 'B. -24', 'C. 24'],
            ans: 2,
            explain: '4 个括号里选 2 个贡献 2x、剩下 2 个贡献 -1：选括号有 C(4, 2) = 6 种，每个乘积是 (2x)² × (-1)² = 4x² × 1 = 4x²，合起来 6 × 4 = 24！别漏乘 2²！',
          },
          {
            id: 'cb-5',
            q: '把 7 个完全相同的苹果分给 3 个小朋友，要求每个小朋友至少分到 1 个，共有多少种分法？',
            options: ['A. 15 种', 'B. 21 种', 'C. 36 种'],
            ans: 0,
            explain: '经典「隔板法」：7 个苹果排一排，中间有 7 - 1 = 6 个空隙；往 6 个空隙里插 2 块板子就能分成非空的三份，所以是 C(6, 2) = 6×5÷2 = 15 种！',
          },
          {
            id: 'cb-6',
            q: '袋中有 3 个红球、2 个白球，从中随机一次摸出 2 个球，「至少摸到 1 个红球」的概率是？',
            options: ['A. 3/5', 'B. 7/10', 'C. 9/10'],
            ans: 2,
            explain: '遇到「至少 1 个」立刻想「正难则反（总概率减一个都没有）」！5 个球摸 2 个共 C(5,2) = 10 种等可能结果，2 个全是白球只有 C(2,2) = 1 种，所以概率是 1 - 1/10 = 9/10！',
          },
        ],
      },
      {
        id: 'graph',
        title: '盲区 ③ · 最短路、生成树、倍增与树遍历坑',
        badge: '专治判断题概念翻车',
        summary: '八级判断题最爱设文字陷阱：负权边、最小生成树唯一性、哈夫曼合并果子、先中后序还原二叉树一次排雷！',
        questions: [
          {
            id: 'gr-1',
            q: '【高频判断】「只要有向图中不存在负权环，使用堆优化 Dijkstra 算法就一定能求出正确的单源最短路径」——这句话对吗？',
            options: ['A. 正确', 'B. 错误（只要有负权边，Dijkstra 就可能算错，哪怕没有负环！）'],
            ans: 1,
            explain: '造个 3 点极小反例：1→2 权 5，1→3 权 6，3→2 权 -3。Dijkstra 先弹出距离 5 的 2 号点锁死，结果绕道 1→3→2 总长其实只要 6 - 3 = 3！有负权边必须用 Bellman-Ford / SPFA。',
          },
          {
            id: 'gr-2',
            q: '【高频判断】「若连通无向图中存在多条权值相同的边，则该图的最小生成树一定不唯一」——这句话对吗？',
            options: ['A. 正确', 'B. 错误（就算边权全部相同，只要原图本身就是一棵树，最小生成树依然唯一！）'],
            ans: 1,
            explain: '反例一秒证伪：3 个点连成一条线 1—2—3，两条边权都是 5。要让 3 个点连通这两条边全得选，只有唯一这 1 棵生成树！反过来「最小生成树不唯一 → 必有相同权值边」才是对的。',
          },
          {
            id: 'gr-3',
            q: '4 堆石子数量分别为 1、2、4、5，每次可以选「任意两堆」合并，代价为两堆石子数之和。合为一堆的最小总代价是多少？',
            options: ['A. 22', 'B. 24', 'C. 27'],
            ans: 0,
            explain: '任意两堆可合 = 哈夫曼树贪心（每次挑最小的两堆合）：① 1+2=3（代价3，剩 3,4,5）→ ② 3+4=7（代价7，剩 5,7）→ ③ 5+7=12（代价12）。总代价 3 + 7 + 12 = 22！（注意：若限定只能合相邻两堆才是区间 DP！）',
          },
          {
            id: 'gr-4',
            q: '某二叉树的先序遍历为 A B D E C F，中序遍历为 D B E A F C，则它的后序遍历序列是？',
            options: ['A. D E B F C A', 'B. D B E F C A', 'C. D E B C F A'],
            ans: 0,
            explain: '先序第一个字母 A 必是整棵树的根（后序最后一个必是 A）；去中序里找 A，左边 D B E 是左子树，右边 F C 是右子树；递归按「左右根」拼出左子树 D E B、右子树 F C，总后序就是 D E B F C A！',
          },
          {
            id: 'gr-5',
            q: '对于点数 V = 2000、边数 E ≈ 200万 的稠密无向图求最小生成树，对比朴素 Prim 算法 O(V²) 与 Kruskal 算法 O(E log E)，哪个更优？',
            options: ['A. 朴素 Prim 更优（约 400 万次操作，不需存 200 万条边排序）', 'B. Kruskal 更优'],
            ans: 0,
            explain: '口诀「稀疏图用 Kruskal（并查集 + 边排序），稠密图用朴素 Prim O(V²)」：V=2000 时 V² 才 400 万，而 200 万条边排序 E log E 要四千多万次！',
          },
          {
            id: 'gr-6',
            q: '树上倍增数组 fa[u][k] 记录从节点 u 往上跳 2^k 步到达的祖先。想从 u 往上精确跳 11 步，需要依次使用哪几个 k？',
            options: ['A. k = 3, 1, 0（因为 11 = 8 + 2 + 1 = 2³ + 2¹ + 2⁰）', 'B. k = 3, 2（8 + 4 = 12）', 'C. 只能一步步跳 11 次'],
            ans: 0,
            explain: '任意正整数都能唯一拆成二进制 2 的幂之和：11 = 8 + 2 + 1，所以只需跳 2³、2¹、2⁰ 三步就能走完 11 步，查询复杂度从 O(N) 降为 O(log N)！',
          },
        ],
      },
      {
        id: 'geom',
        title: '盲区 ④ · 初等代数几何与递推复杂度速算',
        badge: '补齐最后 6 分超纲公式',
        summary: '八级大纲明确要求的平面几何（距离、海伦公式、圆扇形、叉积）与分治递推式复杂度，记住具体算例就绝不丢分！',
        questions: [
          {
            id: 'gm-1',
            q: '归并排序把长度为 N 的区间分成两半分别递归，再用线性时间合并，递推式 T(N) = 2T(N/2) + O(N)，它的总时间复杂度是？',
            options: ['A. O(N)', 'B. O(N log N)', 'C. O(N²)'],
            ans: 1,
            explain: '画递归树：每次对半砍一共有 log₂N 层；第 0 层干 N 活，第 1 层 2 个 N/2 合起来还是干 N 活……每层总账都是 N，乘上层数就是 O(N log N)！（若合并只花 O(1)，即 T(N)=2T(N/2)+1，总复杂度才是 O(N)）。',
          },
          {
            id: 'gm-2',
            q: '已知三角形三边长分别为 3、4、5（半周长 p = (3+4+5)÷2 = 6），用海伦公式 S = √(p(p-a)(p-b)(p-c)) 求面积：',
            options: ['A. 6', 'B. 10', 'C. 12'],
            ans: 0,
            explain: '代入公式：p=6，p-a=3，p-b=2，p-c=1，乘积 6×3×2×1 = 36，开根号 √36 = 6（正好和直角三角形 3×4÷2 = 6 对上！遇到非直角一般三角形全靠海伦公式）！',
          },
          {
            id: 'gm-3',
            q: '平面直角坐标系中，点 A(-1, 2) 与点 B(3, -1) 之间的欧氏（直线）距离是多少？',
            options: ['A. 5', 'B. 7', 'C. 25'],
            ans: 0,
            explain: '横坐标差 |3 - (-1)| = 4，纵坐标差 |-1 - 2| = 3，勾股定理 √(4² + 3²) = √25 = 5！（写代码给边长排序时，尽量先存距离平方 d² = dx*dx + dy*dy 防浮点误差）。',
          },
          {
            id: 'gm-4',
            q: '【真题代数巧算】若实数满足 x + y = 9，x - y = 3，则 x × y 的值为？',
            options: ['A. 15', 'B. 18', 'C. 21'],
            ans: 1,
            explain: '两式相加得 2x = 12 → x = 6，代回得 y = 3，所以 x × y = 18！（也可以用完全平方差：(x+y)² - (x-y)² = 4xy → (81 - 9) ÷ 4 = 18）。',
          },
          {
            id: 'gm-5',
            q: '半径为 6 的圆中，圆心角为 120° 的扇形面积是多少？',
            options: ['A. 6π', 'B. 12π', 'C. 24π'],
            ans: 1,
            explain: '整圆面积 πr² = 36π；120° 占整圈 360° 的 120/360 = 1/3，所以扇形面积 = 36π × 1/3 = 12π！',
          },
          {
            id: 'gm-6',
            q: '从原点出发的两个二维向量 u = (3, 0) 与 v = (3, 4)，计算二维叉积 u × v = x₁y₂ - y₁x₂ = 3×4 - 0×3 = 12 > 0，几何意义是？',
            options: ['A. v 在 u 的逆时针方向，且以 u, v 为邻边的平行四边形面积为 12', 'B. u 与 v 互相垂直', 'C. v 在 u 的顺时针方向'],
            ans: 0,
            explain: '二维叉积符号判转向（>0 逆时针左拐，<0 顺时针右拐，=0 共线），绝对值正好等于两向量张成的平行四边形面积（除以 2 就是三角形面积 = 6）！',
          },
        ],
      },
    ]

    const GESP8_TEMPLATE_PACKS = [
      {
        id: 'dijkstra',
        title: '模板 ① · 堆优化 Dijkstra 最短路（C++14 安全版）',
        badge: 'P0 头号高频（末班车/猫和老鼠/上学）',
        skeleton: 'typedef pair<long long, int> PLI;\npriority_queue<PLI, vector<PLI>, greater<PLI>> pq;\nfill(dist, dist + n + 1, (long long)1e18);\ndist[s] = 0; pq.push(make_pair(0LL, s));\nwhile (!pq.empty()) {\n  long long d = pq.top().first; int u = pq.top().second; pq.pop();\n  if (d > dist[u]) continue; // 必写防重入队退化！\n  for (auto &e : adj[u]) {\n    int v = e.first; long long w = e.second;\n    if (dist[u] + w < dist[v]) pq.push(make_pair(dist[v] = dist[u] + w, v));\n  }\n}',
        questions: [
          {
            id: 'tpl-dij-1',
            q: 'C++ STL 的 priority_queue<pair<long long, int>> 如果不传第 3 个模板参数 greater<...>，默认先弹出谁？',
            options: ['A. 默认是大根堆（先弹出距离最大的点，导致最短路逻辑错乱/超时！）', 'B. 默认就是小根堆'],
            ans: 0,
            explain: 'STL priority_queue 默认是大根堆！写 Dijkstra 必须配 vector<PLI>, greater<PLI> 变成小根堆（且考场严禁写 C++17 的 auto [d, u]，用 pq.top().first / second 100% 兼容 C++11/14 零 CE）！',
          },
          {
            id: 'tpl-dij-2',
            q: '弹出队头拿到 d = pq.top().first 与 u = pq.top().second 后，如果漏写了 if (d > dist[u]) continue;（也没有开 vis[u] 数组），遇到稠密构造图会发生什么？',
            options: ['A. 答案不受影响，速度也一样快', 'B. 同一个点过期的旧记录会反复扫出边，复杂度退化直接 TLE！'],
            ans: 1,
            explain: '每次更新更短距离都会往堆里塞一条新记录，堆里留着的旧大距离弹出来时必须立刻 continue 扔掉，否则白跑无数遍邻接表！',
          },
          {
            id: 'tpl-dij-3',
            q: '当点数 N = 10⁵、单条边权最大 10⁹ 时，最短路最大值可达 10¹⁴。初始化无穷大 INF 写成 0x3f3f3f3f（约 10⁹）会发生什么？',
            options: ['A. 正常通过', 'B. 真最短路超过 10⁹ 的点全被误判为不可达或算错，必须用 long long + 1e18！'],
            ans: 1,
            explain: '0x3f3f3f3f 只有约 1.06×10⁹，装不下超过 10⁹ 的路径和！开 long long 时 INF 一律设 1e18（或 LLONG_MAX / 4 防加法溢出）！',
          },
        ],
      },
      {
        id: 'kruskal',
        title: '模板 ② · Kruskal 最小生成树 + 并查集',
        badge: 'P0 二号高频（线网建设/最小生成树）',
        skeleton: 'int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }\nsort(edges.begin(), edges.end()); // 按边权从小到大\nlong long ans = 0; int cnt = 0;\nfor (auto &e : edges) {\n  int u = find(e.u), v = find(e.v);\n  if (u != v) { fa[u] = v; ans += e.w; if (++cnt == n - 1) break; }\n}',
        questions: [
          {
            id: 'tpl-mst-1',
            q: '并查集 find 函数里，写 fa[x] == x ? x : find(fa[x]) 漏掉了「fa[x] =」路径压缩，最坏单次查询复杂度会变成多少？',
            options: ['A. 依然是 O(log N)', 'B. 退化成一条长链 O(N)，M 次查询变 O(NM) 直接 TLE！'],
            ans: 1,
            explain: '加上 fa[x] = find(fa[x]) 只需多敲 6 个字符，就能把整条链直接挂到根节点底下，复杂度瞬间压到近乎常数！且别忘了主函数开头先跑 iota(fa+1, fa+n+1, 1) 初始化！',
          },
          {
            id: 'tpl-mst-2',
            q: 'N 个点的图跑完 Kruskal 循环后，如何判断原图不连通（不存在生成树，应输出 -1 或 impossible）？',
            options: ['A. 看 ans 是否等于 0', 'B. 看成功合并选入的边数 cnt 是否严格小于 N - 1'],
            ans: 1,
            explain: '边权可能为 0 所以不能看 ans==0！任何 N 个点的连通树必然恰好有 N - 1 条边，cnt < N - 1 是判不连通的唯一铁律（特判 N == 1 时需要 0 条边）！',
          },
          {
            id: 'tpl-mst-3',
            q: '在平面上有 N = 2000 个坐标点，任意两点间都能拉电线（完全图），存边的数组或 vector 容量大约会有多少条边？',
            options: ['A. 约 2,000 条', 'B. N×(N-1)/2 ≈ 200 万条（开静态数组只开 2005 会当场越界 RE！）'],
            ans: 1,
            explain: '点对数量是平方级！N = 2000 时有近 200 万条边，要么用 vector<Edge> edges; edges.reserve(n*(n-1)/2); 要么数组开到 2000005！',
          },
        ],
      },
      {
        id: 'lca',
        title: '模板 ③ · 树上倍增 LCA（最近公共祖先）',
        badge: '八级树论基石（割裂/工作沟通/树上距离）',
        skeleton: 'int lca(int u, int v) {\n  if (dep[u] < dep[v]) swap(u, v);\n  for (int k = 19; k >= 0; k--)\n    if (dep[u] - (1 << k) >= dep[v]) u = fa[u][k];\n  if (u == v) return u; // 必写！\n  for (int k = 19; k >= 0; k--)\n    if (fa[u][k] != fa[v][k]) u = fa[u][k], v = fa[v][k];\n  return fa[u][0];\n}',
        questions: [
          {
            id: 'tpl-lca-1',
            q: '把较深的 u 往上跳到和 v 同一层后，如果漏写了 if (u == v) return u; 直接往下跑双点齐跳再返回 fa[u][0]，会错在哪种情况？',
            options: ['A. v 恰好本来就是 u 的祖先时，会多往上返一层变成 v 的父节点！', 'B. 所有情况都会死循环'],
            ans: 0,
            explain: '当 v 本身就是 u 的老祖宗时，对齐深度后 u 和 v 已经重合在正确答案上了！如果不立刻 return u，最后 return fa[u][0] 就会冤枉地跳到老祖宗头顶上去！',
          },
          {
            id: 'tpl-lca-2',
            q: '第二个循环双点齐跳时，条件为什么必须写 fa[u][k] != fa[v][k]（不等才跳），而不能写 ==？',
            options: ['A. 因为相等时可能跳过头到了 LCA 的更上方祖先，不等才跳能精准停在 LCA 的正下方一层！', 'B. 写 == 也能找到最近的公共祖先'],
            ans: 0,
            explain: '根节点也是公共祖先但不是「最近」的！从大步往小步试，只要跳上去还不撞车就放心跳，循环结束时 u 和 v 必定肩并肩站在 LCA 的紧挨下一层，此时 fa[u][0] 就是 LCA！',
          },
          {
            id: 'tpl-lca-3',
            q: '求树上任意两点 u, v 之间的路径长度（边权和 dist[u] 为根到 u 的距离），公式是什么？',
            options: ['A. dist[u] + dist[v] - dist[lca(u, v)]', 'B. dist[u] + dist[v] - 2 * dist[lca(u, v)]'],
            ans: 1,
            explain: '根到 lca 那一段路在 dist[u] 里算了一次、在 dist[v] 里又算了一次，一共多算了 2 次，所以必须减掉 2 * dist[lca]！',
          },
        ],
      },
      {
        id: 'comb',
        title: '模板 ④ · 快速幂 + 费马小定理逆元求 C(n, m)',
        badge: '压轴计数必背（堆石子/生成树计数）',
        skeleton: 'long long qpow(long long a, long long b) {\n  long long res = 1; a %= MOD;\n  for (; b > 0; b >>= 1) {\n    if (b & 1) res = res * a % MOD;\n    a = a * a % MOD;\n  }\n  return res;\n}\nlong long C(int n, int m) {\n  if (m < 0 || m > n) return 0;\n  return fac[n] * invFac[m] % MOD * invFac[n - m] % MOD;\n}',
        questions: [
          {
            id: 'tpl-cb-1',
            q: '当模数 MOD = 998244353 或 10⁹+7（质数）时，算组合数除以 m! 能不能写 (fac[n] / fac[m]) % MOD？',
            options: ['A. 不能！取模不能直接做整数除法，必须乘以 fac[m] 的逆元 qpow(fac[m], MOD - 2) % MOD', 'B. 可以直接先除再取模'],
            ans: 0,
            explain: 'fac[n] 早就取过模了，直接除根本除不尽还会算错！质数模下由费马小定理，除以 x 等价于乘以 x^(MOD - 2) % MOD！',
          },
          {
            id: 'tpl-cb-2',
            q: '预处理阶乘数组 fac[0..N] 时，fac[0] 应该设为多少？且如果题目询问 C(3, 5)（m > n），C 函数该返回多少？',
            options: ['A. fac[0] = 0，C(3, 5) 返回 1', 'B. fac[0] = 1（0 的阶乘为 1），m > n 时返回 0'],
            ans: 1,
            explain: '如果误设 fac[0] = 0，后面所有 fac[i] = fac[i-1] * i 乘出来全变 0 了！而从 3 个物品里选 5 个显然有 0 种选法，m < 0 || m > n 必须特判 return 0！',
          },
          {
            id: 'tpl-cb-3',
            q: '若数组 fac[] 类型写成了 int 而不是 long long，写 fac[n] * invFac[m] % MOD * invFac[n - m] % MOD 怎样防溢出？',
            options: ['A. 最后结果赋给 long long 就行', 'B. 每次乘法最前面必须加 1LL *（或直接把 fac/invFac 数组定义为 long long）'],
            ans: 1,
            explain: '两个 10⁹ 级别的 int 相乘在取模前就已经爆 int 变负数了！最省心的习惯：计数题阶乘与逆元数组一律直接开 long long！',
          },
        ],
      },
    ]

    function Gesp8SprintTab({ data, st }) {
      const g = data?.gesp8
      if (!g) {
        return h('div', { className: 'oi-scroll', style: { color: C.sub, textAlign: 'center', paddingTop: 60 } }, '正在加载八级冲刺战情室…')
      }
      const s = g.summary || {}
      const ansMap = st.gesp8QuizAnswers || {}
      const allBlindIds = GESP8_BLIND_PACKS.flatMap((p) => p.questions.map((q) => q.id))
      const blindDone = allBlindIds.filter((id) => ansMap[id] !== undefined).length
      const blindCorrect = GESP8_BLIND_PACKS.flatMap((p) => p.questions).filter((q) => ansMap[q.id] === q.ans).length
      const allTplIds = GESP8_TEMPLATE_PACKS.flatMap((p) => p.questions.map((q) => q.id))
      const tplDone = allTplIds.filter((id) => ansMap[id] !== undefined).length

      const regularObjs = (g.objectivePapers || []).filter((x) => !x.isMock)
      const mockSuites = g.mockSuites || []
      const finishedMocks = mockSuites.filter((m) => m.completedAll3 && m.totalScore !== null)
      const bestMockScore = finishedMocks.length > 0 ? Math.max(...finishedMocks.map((m) => m.totalScore)) : null

      const launchGesp8Prob = (p) => {
        const label = `${p.pid} [GESP${p.session} 八级] ${p.title}`
        void launchCoachSession({
          presetId: 'oi-coach',
          subMode: 'gesp8-coach',
          title: `八级冲刺 · ${p.pid} ${p.title}`,
          displayText: p.solved ? `口述重温八级真题【${label}】的核心建模与防坑点` : `按 80+ 双保险法攻克八级真题【${label}】`,
          previewQuery: p.pid,
          prompt: p.solved
            ? `教练，这道 GESP 八级真题【${label}】我之前做过了，现在冲刺 12.26 八级 80+ 分做防遗忘抽查：请别直接告诉我做法，考我 1 个关键建模步骤或边界坑点，看我还记不记得！`
            : `教练，我在冲刺 12月26日 GESP C++ 八级（目标稳拿 80+ 分免 CSP-S 初赛），现在要攻克历年真题【${label}】（洛谷 ${p.luoguPid || '-'}）。请开启【GESP 八级冲刺 80+ 双保险模式】：第 1 轮先拿 N = 3~4 具体小数字/小图带我手算破冰（严禁首轮剧透算法名或给代码），到第 3 步时记得先带我设计 50%~60% 高档子任务保底分，再冲 100% 正解！`,
        })
      }

      const launchObjReview = (paper) => {
        void launchCoachSession({
          presetId: 'oi-coach',
          subMode: 'gesp8-obj-review',
          title: `八级客观复盘 · ${paper.session}`,
          displayText: `慢放复盘【${paper.title}】的错题（当前最高折算 ${paper.scaledBest ?? '--'}/50 分）`,
          previewQuery: paper.pid,
          prompt: `教练，我刚在信奥李拜天交了【${paper.title}】（题号 ${paper.pid}，折算得分 ${paper.scaledBest ?? '?'}/50 分，目标 ≥ 44/50 分）。请开启【GESP 八级客观卷错题慢放清零模式】，千万别一次性列出整套卷答案！如果系统已识别出我答错的题号，请先挑第 1 道错题用六年级具体小数字带我推算；如果没有识别到具体错题号，请先问我想先复盘第几题！`,
        })
      }

      const activePack = GESP8_BLIND_PACKS.find((p) => p.id === st.gesp8PackId) || GESP8_BLIND_PACKS[0]
      const activeTpl = GESP8_TEMPLATE_PACKS.find((p) => p.id === st.gesp8TplId) || GESP8_TEMPLATE_PACKS[0]

      return h(
        'div',
        { className: 'oi-scroll' },
        h(
          'div',
          { className: 'oi-container' },
          // Top 80+ War-Room Banner
          h(
            'div',
            { className: 'oi-grid-3' },
            h(
              'div',
              { className: 'oi-card', style: { display: 'grid', gap: 4, borderColor: C.accent } },
              h('div', { style: { fontSize: 12.5, color: C.sub, fontWeight: 700 } }, s.examPassed ? '🎯 GESP C++ 八级冲刺复盘' : `🎯 距离 ${s.examDate} 八级认证`),
              h('div', { style: { fontSize: 28, fontWeight: 800, color: C.accent } }, s.examPassed ? '满级收官' : `${s.daysLeft} 天`),
              h('div', { style: { fontSize: 12.5, color: C.sub } }, '唯一目标：80+ 分直免 CSP-S 初赛（按 85 分安全垫备考）'),
            ),
            h(
              'div',
              { className: 'oi-card', style: { display: 'grid', gap: 4 } },
              h('div', { style: { fontSize: 12.5, color: C.sub, fontWeight: 700 } }, '📝 上半场 · 客观题稳定度（目标 ≥ 44/50）'),
              h(
                'div',
                {
                  style: {
                    fontSize: 28,
                    fontWeight: 800,
                    color: s.objRecentAvg50 === null ? C.text : s.objRecentAvg50 >= 44 ? C.ok : C.warn,
                  },
                },
                s.objRecentAvg50 !== null ? `${s.objRecentAvg50} / 50 分` : '待首卷摸底',
              ),
              h('div', { style: { fontSize: 12.5, color: C.sub } }, `平时真题卷 ${s.objRegularDone}/${s.objRegularTotal} 套 · 扫盲微卡已通 ${blindDone}/24 题（答对 ${blindCorrect}）`),
            ),
            h(
              'div',
              { className: 'oi-card', style: { display: 'grid', gap: 4 } },
              h('div', { style: { fontSize: 12.5, color: C.sub, fontWeight: 700 } }, '💻 下半场 · 编程真题与全真模考'),
              h('div', { style: { fontSize: 28, fontWeight: 800, color: C.ok } }, `${s.progSolved} / ${s.progTotal} 题`),
              h(
                'div',
                { style: { fontSize: 12.5, color: C.sub } },
                `P0 主力剩余 ${s.p0Remaining} 道 · 全真合卷最高 ${bestMockScore !== null ? `${bestMockScore}/100 分` : '待开启（W3/W4）'}`,
              ),
            ),
          ),

          // Sub-tab switcher
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 } },
            h(
              'div',
              { className: 'oi-nav-seg' },
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.gesp8SubTab === 'board' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ gesp8SubTab: 'board' }),
                },
                `🗺️ 编程真题棋盘（${s.progSolved}/${s.progTotal}）`,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.gesp8SubTab === 'objective' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ gesp8SubTab: 'objective' }),
                },
                `📝 客观题 44+ 特训（${blindDone}/24）`,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.gesp8SubTab === 'mock' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ gesp8SubTab: 'mock' }),
                },
                '🏆 100分全真模考舱',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `oi-nav-btn ${st.gesp8SubTab === 'templates' ? 'oi-nav-btn-active' : ''}`,
                  onClick: () => setState({ gesp8SubTab: 'templates' }),
                },
                `🛡️ 四大模板排雷卡（${tplDone}/12）`,
              ),
            ),
            h(
              'span',
              { style: { fontSize: 12.5, color: C.sub } },
              '算账口诀：客观稳拿 44 + T1 满分 25 + T2 冲满（保底 ≥ 15）= 84~94 分！',
            ),
          ),

          // Sub-tab 1: 26 Programming Past Problems Quadrant Board
          st.gesp8SubTab === 'board'
            ? h(
                'div',
                { style: { display: 'grid', gap: 16 } },
                ...(g.quadrants || []).map((qd) =>
                  h(
                    'div',
                    { key: qd.id, className: 'oi-card', style: { display: 'grid', gap: 12 } },
                    h(
                      'div',
                      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
                      h(
                        'div',
                        { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        h('span', { style: { fontWeight: 800, fontSize: 15 } }, qd.title),
                        h('span', { className: 'oi-pill', style: { color: C.accent, borderColor: C.accent } }, qd.badge),
                      ),
                      h('span', { style: { fontSize: 12.5, fontWeight: 700, color: qd.solved === qd.total ? C.ok : C.sub } }, `已攻克 ${qd.solved} / ${qd.total} 题`),
                    ),
                    h(
                      'div',
                      { className: 'oi-grid-2' },
                      ...qd.items.map((p) => {
                        const isLockedMock = p.tier === 'mock' && !p.solved && p.attempts === 0
                        const badgeColor = p.solved ? C.ok : p.tier === 'p0' ? C.warn : isLockedMock ? C.sub : C.accent
                        const badgeText = p.solved
                          ? '✓ 已攻克 (25/25)'
                          : p.tier === 'p0'
                            ? `🔥 P0 必刷 · ${p.week}`
                            : isLockedMock
                              ? `🔒 ${p.week} 封存`
                              : `P1 机动`
                        return h(
                          'div',
                          {
                            key: p.pid,
                            style: {
                              padding: '12px 14px',
                              borderRadius: 10,
                              border: `1px solid ${p.solved ? C.ok : C.border}`,
                              background: C.layer,
                              display: 'grid',
                              gap: 8,
                            },
                          },
                          h(
                            'div',
                            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 } },
                            h(
                              'div',
                              { style: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.4 } },
                              `[${p.session}] ${p.title}`,
                              h('span', { style: { fontSize: 12, color: C.sub, fontWeight: 500, marginLeft: 6 } }, `#${p.pid} / ${p.luoguPid}`),
                            ),
                            h('span', { className: 'oi-pill', style: { color: badgeColor, borderColor: badgeColor, whiteSpace: 'nowrap' } }, badgeText),
                          ),
                          h(
                            'div',
                            { style: { fontSize: 12, color: C.sub } },
                            isLockedMock
                              ? '🔒 全真模考封存（首交后自动解锁考点标签与深度复盘）'
                              : `考点：${p.tag}${p.bestScore !== null && !p.solved ? ` · 历史最高 ${p.bestScore} 分（折算 ${p.scaled25}/25 分）` : ''}`,
                          ),
                          h(
                            'div',
                            { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                            isLockedMock
                              ? h(
                                  'button',
                                  {
                                    type: 'button',
                                    className: 'oi-btn',
                                    onClick: () => setState({ gesp8SubTab: 'mock' }),
                                  },
                                  '🔒 前往全真模考舱开启 →',
                                )
                              : h(
                                  'button',
                                  {
                                    type: 'button',
                                    className: p.solved ? 'oi-btn' : 'oi-btn oi-btn-primary',
                                    disabled: !!st.busy,
                                    onClick: () => launchGesp8Prob(p),
                                  },
                                  p.solved ? '🗣️ 口述重温防忘' : '🎯 80+ 双保险辅导',
                                ),
                            !isLockedMock
                              ? h(
                                  'button',
                                  {
                                    type: 'button',
                                    className: 'oi-btn oi-btn-ghost',
                                    onClick: () => openOjUrl(p.url, `${p.pid} ${p.title}`),
                                  },
                                  '🔗 去李拜天交题',
                                )
                              : null,
                          ),
                        )
                      }),
                    ),
                  ),
                ),
              )
            : st.gesp8SubTab === 'objective'
              ? h(
                  'div',
                  { style: { display: 'grid', gap: 18 } },
                  // Part A: 4 Blind-spot interactive packs (24 questions)
                  h(
                    'div',
                    { className: 'oi-card', style: { display: 'grid', gap: 14 } },
                    h(
                      'div',
                      { style: { display: 'grid', gap: 4 } },
                      h('div', { style: { fontWeight: 800, fontSize: 15.5 } }, '⚡ 第一步：六年级四大客观题盲区扫盲闯关（24 题即点即判）'),
                      h('div', { style: { fontSize: 13, color: C.sub } }, '每天花 8 分钟点完 1 组，把平时刷算法题碰不到的 OOP 多态、圆排列/杨辉三角从 0 编号、图论文字坑与海伦公式彻底清零！'),
                    ),
                    h(
                      'div',
                      { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                      ...GESP8_BLIND_PACKS.map((pk) => {
                        const pkDone = pk.questions.filter((q) => ansMap[q.id] !== undefined).length
                        return h(
                          'button',
                          {
                            key: pk.id,
                            type: 'button',
                            className: `oi-chip ${activePack.id === pk.id ? 'oi-chip-active' : ''}`,
                            onClick: () => setState({ gesp8PackId: pk.id }),
                          },
                          `${pk.title}（${pkDone}/${pk.questions.length}）`,
                        )
                      }),
                    ),
                    h(
                      'div',
                      { style: { padding: '10px 14px', borderRadius: 10, background: C.layer, fontSize: 13, color: C.sub } },
                      `${activePack.badge} —— ${activePack.summary}`,
                    ),
                    h(
                      'div',
                      { style: { display: 'grid', gap: 12 } },
                      ...activePack.questions.map((q, idx) => {
                        const picked = ansMap[q.id]
                        const answered = picked !== undefined
                        const isRight = picked === q.ans
                        return h(
                          'div',
                          {
                            key: q.id,
                            style: {
                              padding: '13px 15px',
                              borderRadius: 10,
                              border: `1px solid ${answered ? (isRight ? C.ok : C.warn) : C.border}`,
                              background: C.base,
                              display: 'grid',
                              gap: 10,
                            },
                          },
                          h('div', { style: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.5 } }, `第 ${idx + 1} 关 · ${q.q}`),
                          h(
                            'div',
                            { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                            ...q.options.map((opt, oIdx) => {
                              const isChosen = picked === oIdx
                              const showCorrect = answered && oIdx === q.ans
                              return h(
                                'button',
                                {
                                  key: oIdx,
                                  type: 'button',
                                  className: 'oi-btn',
                                  style: showCorrect
                                    ? { borderColor: C.ok, color: C.ok, fontWeight: 700 }
                                    : isChosen
                                      ? { borderColor: C.err, color: C.err }
                                      : {},
                                  onClick: () => answerGesp8Quiz(q.id, oIdx),
                                },
                                opt,
                              )
                            }),
                          ),
                          answered
                            ? h(
                                'div',
                                {
                                  style: {
                                    fontSize: 12.5,
                                    lineHeight: 1.6,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: C.layer,
                                    color: isRight ? C.ok : C.text,
                                  },
                                },
                                `${isRight ? '✅ 稳准狠！' : '💡 踩坑排雷：'}${q.explain}`,
                              )
                            : null,
                        )
                      }),
                    ),
                  ),

                  // Part B: 11 Regular Official Objective Exam Papers on Oilibaitian
                  h(
                    'div',
                    { className: 'oi-card', style: { display: 'grid', gap: 12 } },
                    h(
                      'div',
                      { style: { display: 'grid', gap: 4 } },
                      h('div', { style: { fontWeight: 800, fontSize: 15.5 } }, '📋 第二步：信奥李拜天 11 套历年八级客观真题卷实战清零台（目标 ≥ 44/50 分）'),
                      h('div', { style: { fontSize: 13, color: C.sub } }, '点击「去李拜天作答」限时 30 分钟提交 → 系统自动同步折算为 50 分制成绩 → 交卷后点「错题逐题慢放复盘」把每道错题彻底吃透！（另有 2 套最新卷封存在全真模考舱）'),
                    ),
                    h(
                      'div',
                      { className: 'oi-grid-2' },
                      ...regularObjs.map((p) => {
                        const done = p.attempts > 0
                        return h(
                          'div',
                          {
                            key: p.pid,
                            style: {
                              padding: '12px 14px',
                              borderRadius: 10,
                              border: `1px solid ${p.meetsTarget ? C.ok : C.border}`,
                              background: C.layer,
                              display: 'grid',
                              gap: 8,
                            },
                          },
                          h(
                            'div',
                            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 } },
                            h('div', { style: { fontWeight: 700, fontSize: 13.5 } }, `${p.title}（#${p.pid}）`),
                            h(
                              'span',
                              {
                                className: 'oi-pill',
                                style: {
                                  color: p.meetsTarget ? C.ok : done ? C.warn : C.accent,
                                  borderColor: p.meetsTarget ? C.ok : done ? C.warn : C.accent,
                                },
                              },
                              done
                                ? `${p.scaledBest}/50 分 ${p.meetsTarget ? '✓ 达标' : '· 待提分'}`
                                : `推荐 ${p.week}`,
                            ),
                          ),
                          h('div', { style: { fontSize: 12, color: C.sub } }, `核心题眼：${p.focus}`),
                          h(
                            'div',
                            { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                            h(
                              'button',
                              {
                                type: 'button',
                                className: done ? 'oi-btn' : 'oi-btn oi-btn-primary',
                                onClick: () => openOjUrl(p.url, p.title),
                              },
                              done ? '🔗 再刷一遍提分' : '🔗 去李拜天独立作答',
                            ),
                            h(
                              'button',
                              {
                                type: 'button',
                                className: done ? 'oi-btn oi-btn-primary' : 'oi-btn oi-btn-ghost',
                                disabled: !!st.busy,
                                onClick: () =>
                                  done
                                    ? launchObjReview(p)
                                    : setState({ notice: { text: `请先在信奥李拜天完成交卷（#${p.pid}）并点顶栏同步，交卷后即解锁逐题慢放复盘！` } }),
                              },
                              done ? '🩺 错题逐题慢放复盘' : '🔒 交卷后解锁复盘',
                            ),
                          ),
                        )
                      }),
                    ),
                  ),
                )
              : st.gesp8SubTab === 'mock'
                ? h(
                    'div',
                    { style: { display: 'grid', gap: 16 } },
                    h(
                      'div',
                      { className: 'oi-card', style: { display: 'grid', gap: 8, borderColor: C.accent } },
                      h('div', { style: { fontWeight: 800, fontSize: 15.5 } }, '⏱️ 180 分钟全真考场 85+ 时间分配铁律'),
                      h(
                        'div',
                        { style: { fontSize: 13, color: C.sub, lineHeight: 1.7 } },
                        '① 0~40 分钟：细算做完 25 道客观题（草稿纸列式验算，稳拿 ≥ 44/50 分） → ② 40~95 分钟：拿下编程 T1 满分（25/25 分，必查 long long 与边界） → ③ 95~115 分钟：编程 T2 先写稳 50%~60% 高档子任务保底代码（先兜住 12.5~15 分，此时总分已跨过 80 分！） → ④ 115~170 分钟：全力冲击 T2 100% 正解 → ⑤ 最后 10 分钟：检查头文件、返回值、数组大小，确保全卷零 CE！',
                      ),
                    ),
                    ...mockSuites.map((m) =>
                      h(
                        'div',
                        {
                          key: m.id,
                          className: 'oi-card',
                          style: {
                            display: 'grid',
                            gap: 14,
                            borderColor: m.passed85 ? C.ok : m.passed80 ? C.accent : C.border,
                          },
                        },
                        h(
                          'div',
                          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 } },
                          h(
                            'div',
                            { style: { display: 'grid', gap: 3 } },
                            h('div', { style: { fontWeight: 800, fontSize: 16 } }, m.title),
                            h('div', { style: { fontSize: 12.5, color: C.sub } }, `${m.week} · 自动汇总信奥李拜天三项最高分折算为 100 分制标准卷`),
                          ),
                          h(
                            'div',
                            {
                              style: {
                                fontSize: 22,
                                fontWeight: 800,
                                color: m.passed85 ? C.ok : m.passed80 ? C.accent : m.started ? C.warn : C.sub,
                              },
                            },
                            m.totalScore !== null
                              ? `${m.totalScore} / 100 分 ${m.passed85 ? '🏆 稳超安全线' : m.passed80 ? '✅ 跨过 80 免初赛线' : '· 继续补完三项'}`
                              : '🔒 待限时开启（-- / 100 分）',
                          ),
                        ),
                        h(
                          'div',
                          { className: 'oi-grid-3' },
                          ...[
                            { role: '上半场 · 客观卷（50分）', item: m.obj, isObj: true },
                            { role: '下半场 · 编程 T1（25分）', item: m.t1, isObj: false },
                            { role: '下半场 · 编程 T2（25分）', item: m.t2, isObj: false },
                          ].map(({ role, item, isObj }) => {
                            const hasSub = (item?.attempts || 0) > 0
                            return h(
                              'div',
                              {
                                key: item.pid,
                                style: {
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: `1px solid ${C.border}`,
                                  background: C.layer,
                                  display: 'grid',
                                  gap: 8,
                                },
                              },
                              h('div', { style: { fontSize: 12, color: C.sub, fontWeight: 700 } }, role),
                              h('div', { style: { fontWeight: 800, fontSize: 14 } }, `#${item.pid} ${item.title}`),
                              h(
                                'div',
                                { style: { fontSize: 13, fontWeight: 700, color: hasSub ? C.ok : C.sub } },
                                hasSub ? `当前折算：${item.points} / ${item.maxPoints} 分` : `未交卷（满分 ${item.maxPoints} 分）`,
                              ),
                              h(
                                'div',
                                { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                                h(
                                  'button',
                                  {
                                    type: 'button',
                                    className: hasSub ? 'oi-btn' : 'oi-btn oi-btn-primary',
                                    onClick: () => openOjUrl(item.url, `${item.pid} ${item.title}`),
                                  },
                                  hasSub ? '🔗 查看/重交' : '🔗 开启模考作答',
                                ),
                                hasSub
                                  ? h(
                                      'button',
                                      {
                                        type: 'button',
                                        className: 'oi-btn oi-btn-primary',
                                        onClick: () =>
                                          isObj
                                            ? launchObjReview({ pid: item.pid, title: item.title, session: m.title.slice(8, 15), scaledBest: item.points })
                                            : launchGesp8Prob({ pid: item.pid, title: item.title, session: '模考复盘', solved: item.solved, tag: '全真合卷复盘' }),
                                      },
                                      '🩺 赛后复盘',
                                    )
                                  : null,
                              ),
                            )
                          }),
                        ),
                      ),
                    ),
                  )
                : h(
                    'div',
                    { className: 'oi-card', style: { display: 'grid', gap: 14 } },
                    h(
                      'div',
                      { style: { display: 'grid', gap: 4 } },
                      h('div', { style: { fontWeight: 800, fontSize: 15.5 } }, '🛡️ 八级考场四大满分模板「防手生排雷卡」（12 道致命细节自检）'),
                      h('div', { style: { fontSize: 13, color: C.sub } }, '考场上最痛的不是想不出思路，而是思路全对却因小根堆写反、忘开 long long 或 LCA 漏特判白丢 25 分！考前必通这 12 关：'),
                    ),
                    h(
                      'div',
                      { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                      ...GESP8_TEMPLATE_PACKS.map((tp) => {
                        const tpDone = tp.questions.filter((q) => ansMap[q.id] !== undefined).length
                        return h(
                          'button',
                          {
                            key: tp.id,
                            type: 'button',
                            className: `oi-chip ${activeTpl.id === tp.id ? 'oi-chip-active' : ''}`,
                            onClick: () => setState({ gesp8TplId: tp.id }),
                          },
                          `${tp.title}（${tpDone}/${tp.questions.length}）`,
                        )
                      }),
                    ),
                    h(
                      'div',
                      { style: { display: 'grid', gap: 6 } },
                      h('div', { style: { fontSize: 12.5, fontWeight: 700, color: C.accent } }, `核心标准骨架速览 · ${activeTpl.badge}`),
                      h('pre', { className: 'oi-code-block', style: { margin: 0, fontSize: 12.5, lineHeight: 1.55 } }, activeTpl.skeleton),
                    ),
                    h(
                      'div',
                      { style: { display: 'grid', gap: 12 } },
                      ...activeTpl.questions.map((q, idx) => {
                        const picked = ansMap[q.id]
                        const answered = picked !== undefined
                        const isRight = picked === q.ans
                        return h(
                          'div',
                          {
                            key: q.id,
                            style: {
                              padding: '13px 15px',
                              borderRadius: 10,
                              border: `1px solid ${answered ? (isRight ? C.ok : C.warn) : C.border}`,
                              background: C.base,
                              display: 'grid',
                              gap: 10,
                            },
                          },
                          h('div', { style: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.5 } }, `排雷点 ${idx + 1} · ${q.q}`),
                          h(
                            'div',
                            { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                            ...q.options.map((opt, oIdx) => {
                              const isChosen = picked === oIdx
                              const showCorrect = answered && oIdx === q.ans
                              return h(
                                'button',
                                {
                                  key: oIdx,
                                  type: 'button',
                                  className: 'oi-btn',
                                  style: showCorrect
                                    ? { borderColor: C.ok, color: C.ok, fontWeight: 700 }
                                    : isChosen
                                      ? { borderColor: C.err, color: C.err }
                                      : {},
                                  onClick: () => answerGesp8Quiz(q.id, oIdx),
                                },
                                opt,
                              )
                            }),
                          ),
                          answered
                            ? h(
                                'div',
                                {
                                  style: {
                                    fontSize: 12.5,
                                    lineHeight: 1.6,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: C.layer,
                                    color: isRight ? C.ok : C.text,
                                  },
                                },
                                `${isRight ? '✅ 防坑到位！' : '⚠️ 考场救命提醒：'}${q.explain}`,
                              )
                            : null,
                        )
                      }),
                    ),
                  ),
        ),
      )
    }

    function OiCoachPage() {
      const st = useStore()
      React.useEffect(() => {
        void loadOverview()
        const timer = setInterval(() => {
          void pollSyncStatus()
        }, 45_000)
        return () => clearInterval(timer)
      }, [])

      const data = st.data
      const hasLiveChat = Boolean(st.agyChat?.open && (st.agyChat.messages.length > 0 || st.agyChat.sending))
      const sync = st.syncStatus
      const isSyncing = st.busy === 'sync:git-sync' || st.busy === 'sync:all-ojs' || Boolean(sync?.running)
      const behindCount = Number(sync?.behindCount || 0)
      const hasUpgrade = Boolean(sync?.pluginUpdated || sync?.backendUpdated)

      return h(
        'div',
        { className: 'oi-shell' },
        // Clean single-row top navigation bar
        h(
          'div',
          { className: 'oi-topbar' },
          h('div', { style: { fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' } }, '🏆 麒麒 OI 学习台'),
          h(
            'div',
            { className: 'oi-nav-seg' },
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.tab === 'coach' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ tab: 'coach' }),
              },
              '💬 教练室',
              hasLiveChat
                ? h('span', {
                    style: {
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: C.ok,
                      display: 'inline-block',
                    },
                  })
                : null,
            ),
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.tab === 'gesp8' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ tab: 'gesp8' }),
              },
              data?.gesp8?.summary && !data.gesp8.summary.examPassed
                ? `🎯 八级冲刺 · ${data.gesp8.summary.daysLeft}天`
                : '🎯 八级冲刺',
            ),
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.tab === 'problems' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ tab: 'problems' }),
              },
              '📋 题单',
            ),
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.tab === 'practice' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ tab: 'practice' }),
              },
              '🧮 建模练习',
            ),
            h(
              'button',
              {
                type: 'button',
                className: `oi-nav-btn ${st.tab === 'archive' ? 'oi-nav-btn-active' : ''}`,
                onClick: () => setState({ tab: 'archive' }),
              },
              '📚 错题与档案',
            ),
          ),
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            hasUpgrade
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'oi-btn oi-btn-primary',
                    style: { height: 30, padding: '0 11px', fontSize: 12, background: C.ok, borderColor: C.ok, color: '#fff' },
                    onClick: () => {
                      if (sync?.backendUpdated) {
                        setState({
                          notice: { text: '已自动拉取最新教练服务升级，重启一次 DeepSeek Harness 即可完全生效（当前界面也可正常使用）。' },
                          syncStatus: { ...sync, pluginUpdated: false, backendUpdated: false },
                        })
                      } else if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
                        window.location.reload()
                      } else {
                        setState({ syncStatus: { ...sync, pluginUpdated: false } })
                        return loadOverview()
                      }
                    },
                  },
                  sync?.backendUpdated ? '✨ 收到新升级（重启生效）' : '✨ 收到新升级，点此更新',
                )
              : null,
            h(
              'button',
              {
                type: 'button',
                className: 'oi-btn',
                style: {
                  height: 30,
                  padding: '0 10px',
                  fontSize: 12,
                  borderColor: behindCount > 0 ? C.accent : C.border,
                },
                onClick: () => setState({ showSyncModal: !st.showSyncModal }),
              },
              h('span', {
                style: {
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isSyncing ? C.accent : sync?.lastResult === 'retry' ? C.warn : C.ok,
                  display: 'inline-block',
                },
              }),
              isSyncing ? '同步中…' : behindCount > 0 ? `有 ${behindCount} 项新记录` : '☁️ 自动同步',
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'oi-btn oi-btn-ghost',
                onClick: () => loadOverview(),
              },
              '↻ 刷新',
            ),
          ),
        ),

        // Inline toast banner (only when error/notice exists)
        st.error || st.notice
          ? h(
              'div',
              {
                style: {
                  flexShrink: 0,
                  padding: '8px 24px',
                  borderBottom: `1px solid ${st.error ? C.err : C.ok}`,
                  background: C.layer,
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
                h('button', { type: 'button', className: 'oi-btn oi-btn-ghost', onClick: () => setState({ error: null, notice: null }) }, '关闭'),
              ),
            )
          : null,

        // Main dedicated room
        st.loading && !data && st.tab !== 'practice'
          ? h('div', { className: 'oi-scroll', style: { color: C.sub, textAlign: 'center', paddingTop: 60 } }, '正在加载学习台…')
          : st.tab === 'coach'
            ? h(CoachRoomTab, { data, st })
            : st.tab === 'gesp8'
              ? h(Gesp8SprintTab, { data, st })
              : st.tab === 'problems'
              ? data
                ? h(ProblemsTab, { data, st })
                : null
              : st.tab === 'practice'
                ? h(PracticeTab, { st })
                : data
                  ? h(ArchiveTab, { data, st })
                  : null,

        h(DocModal, { modal: st.docModal }),
        h(SaveCardModal, { modal: st.saveCardModal }),
        h(LectureDigestModal, { modal: st.lectureDigestModal }),
        h(SyncStatusModal, {
          open: st.showSyncModal,
          sync: st.syncStatus,
          isWindows: data ? Boolean(data.isWindows) : true,
          busy: st.busy,
        }),
      )
    }

    function SessionHeaderChip() {
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
            background: C.ok,
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
