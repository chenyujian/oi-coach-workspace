# https://haoba.vip/d/cpptrain/p/l13e02?tid=6aa4d0255ee0445aa3a2a894（haoba / https-haoba-vip）

- **复盘日期**：2026-11-28
- **核心维度**：`math`

## 三行通关秘籍卡

1. **刚才掉进的坑**：核心建模：`P` 年混搭 `N` 或 `N+1` 天总能凑出任意总天数 `D`，关键只需 `P × yearLength` 是 `dayLength` 的倍数。
2. **破局的极小规律 / 反例**：最小周期：把 `(P × yearLength) ÷ dayLength` 约掉最大公因数 `gcd(dayLength, yearLength)` 后，分母剩下的全靠 `P` 凑，故 `P = dayLength ÷ gcd(dayLength, yearLength)`。
3. **下次交前防坑口诀**：防坑验毒：`dayLength ≤ 10⁹` 从 `P = 1` 枚举必超时；用 `dayLength ÷ gcd` 直接除不溢出（若先算最小公倍数再除务必开 `long long`）。
