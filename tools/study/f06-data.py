"""Generate assets/js/data/study/f06/data.js: the simulated market history F06 Investment Analysis uses.

EVERYTHING HERE IS SIMULATED. It is not real market history. The funds, the index and the three listed companies are
fictional (the companies are F05's peers). The sizes are chosen to be broadly like long-run US figures (stocks a few
points a year above bills with yearly volatility in the mid-teens; investment-grade bonds a little above bills with
much lower volatility), so that what students compute looks like what they will meet, but every number is invented.

Monthly total returns (price change plus dividends or coupons, reinvested), January 2013 – December 2027 (180 months):
  bills      the risk-free rate: one-month bill return; a smooth path, low 2013–15, ~2% by 2019, near 0 in 2020–21,
             ~5% in 2023–24 and ~4% by 2027 (annual rates, paid monthly).
  market     the Harbourline Total Market Index (all listed shares): bills + excess; the excess has sd 4.3% a month (Student t with 5 df, scaled), plus one planted crash (−17% in March 2020 then a rebound) and a
             weak 2022; the other months are then shifted so the sample mean excess return is exactly 0.70% a month.
  intl       the Harbourline International Index: 0.80 × market excess + its own noise (sd 2.9% a month) + bills.
  bonds      the Harbourline Aggregate Bond Index: bills + 0.12% a month + 0.08 × market excess + rate shocks (sd 1.2%),
             with a planted −13% across 2022 as rates rose (bond prices fall when yields rise).
  active     the Northgate Active Equity Fund: market excess + its own noise (sd 1.0%, mean zero in the sample) − 0.08% a
             month + bills: it trails the index fund by exactly 0.08% a month (0.96 points a year), a little more than
             the 0.81-point gap in fees. Its noise is mean zero but not exactly uncorrelated with the market, so its
             regression alpha is about −0.079% a month, not exactly −0.08%.
  brightcup, morrow, harbour  F05's three listed peers: bills + β × market excess + their own noise (sd 6.0%, 5.5%,
             6.0% a month). Over the last 60 months (2023–2027) their own noise is made exactly uncorrelated with the
             market and mean zero (and their 2013–2022 noise is mean zero too), so a regression of their excess returns on the market's over those months gives
             exactly F05's betas (1.05, 0.90, 1.25) and zero alpha.
The fund prices start at $10.00 (index level 1,000) on 31 December 2012; the shares at prices that end at the case's
31 December 2027 prices. NumPy PCG64, fixed seed: the file rebuilds exactly.

Run:  python3 tools/study/f06-data.py
"""
from pathlib import Path
import json
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/js/data/study/f06/data.js'
rng = np.random.Generator(np.random.PCG64(20280601))

N = 180
months = [f"{2013 + i // 12}-{i % 12 + 1:02d}" for i in range(N)]
yr = np.array([2013 + i / 12 for i in range(N)])

# ---- the risk-free rate (annual %, then monthly return)
knots_t = [2013, 2015.9, 2017, 2019.5, 2020.2, 2021.9, 2022.9, 2023.6, 2024.7, 2025.6, 2028]
knots_r = [0.05, 0.10, 0.9, 2.15, 0.10, 0.05, 3.9, 5.25, 5.20, 4.3, 4.0]
bill_ann = np.interp(yr, knots_t, knots_r)
bills = bill_ann / 100 / 12

def tnoise(sd, df=5, n=N):
    x = rng.standard_t(df, n)
    return x / np.sqrt(df / (df - 2)) * sd

# ---- the market
mkt_ex = 0.0055 + tnoise(0.043)
i_mar20 = months.index('2020-03'); i_feb20 = i_mar20 - 1
mkt_ex[i_feb20] = -0.085; mkt_ex[i_mar20] = -0.17; mkt_ex[i_mar20 + 1] = 0.125; mkt_ex[i_mar20 + 2] = 0.05
for m, v in {'2022-01': -0.05, '2022-04': -0.07, '2022-06': -0.07, '2022-09': -0.08, '2022-10': 0.07}.items():
    mkt_ex[months.index(m)] = v
planted = [i_feb20, i_mar20, i_mar20 + 1, i_mar20 + 2] + [months.index(m) for m in ('2022-01', '2022-04', '2022-06', '2022-09', '2022-10')]
free = [i for i in range(N) if i not in planted]
# set the sample mean excess return to 0.70% a month
mkt_ex[free] -= (mkt_ex.mean() - 0.0070) * N / len(free)
assert abs(mkt_ex.mean() - 0.0070) < 1e-12
market = bills + mkt_ex

intl = bills + 0.80 * mkt_ex + tnoise(0.029) - 0.0006
bond_noise = rng.normal(0, 0.012, N)
bonds = bills + 0.0012 + 0.08 * mkt_ex + bond_noise
i22 = [months.index(f'2022-{k:02d}') for k in range(1, 13)]
target_2022 = -0.13
cur = np.prod(1 + bonds[i22]) - 1
bonds[i22] = (1 + bonds[i22]) * ((1 + target_2022) / (1 + cur)) ** (1 / 12) - 1   # spread the planted 2022 loss across the year
an = rng.normal(0, 0.010, N); an -= an.mean()
active = bills + 1.00 * mkt_ex + an - 0.0008                          # trails the index by exactly 0.08% a month

BETAS = {'brightcup': 1.05, 'morrow': 0.90, 'harbour': 1.25}
IDIO = {'brightcup': 0.060, 'morrow': 0.055, 'harbour': 0.060}
stocks = {}
last = slice(N - 60, N)
for k, b in BETAS.items():
    e = tnoise(IDIO[k])
    # last 60 months: idiosyncratic noise exactly mean zero and uncorrelated with the market's excess return
    x = mkt_ex[last] - mkt_ex[last].mean()
    el = e[last] - e[last].mean()
    el = el - (el @ x) / (x @ x) * x
    e[last] = el
    e[:N - 60] -= e[:N - 60].mean()                                   # and mean zero over 2013–2022 too, so no stock has a planted alpha
    stocks[k] = bills + b * mkt_ex + e

# ---- checks on what the lessons will say
def ols_beta(y, x):
    X = np.column_stack([np.ones(len(x)), x]); return np.linalg.lstsq(X, y, rcond=None)[0]
for k, b in BETAS.items():
    a, bb = ols_beta(stocks[k][last] - bills[last], mkt_ex[last])
    assert abs(bb - b) < 1e-9 and abs(a) < 1e-12, (k, a, bb)
assert abs(np.prod(1 + bonds[i22]) - 1 - target_2022) < 1e-9
ann = lambda r: (np.mean(r) * 12, np.std(r, ddof=1) * np.sqrt(12))
for name, r in [('market', market), ('bonds', bonds), ('intl', intl), ('active', active), ('bills', bills)]:
    m, s = ann(r)
    print(f'{name:8s} mean {m:6.2%}  vol {s:6.2%}  growth {np.prod(1 + r) ** (12 / N) - 1:6.2%}')
assert 0.08 < ann(market)[0] < 0.14 and 0.13 < ann(market)[1] < 0.18, 'market outside the intended range: change the seed'
assert 0.01 < ann(bonds)[0] < 0.05 and 0.03 < ann(bonds)[1] < 0.07, 'bonds outside the intended range'
assert ann(active)[0] < ann(market)[0], 'the active fund should trail the index over the whole period'
print('corr market–bonds', np.corrcoef(market, bonds)[0, 1].round(3), ' market–intl', np.corrcoef(market, intl)[0, 1].round(3))

R = lambda a: [round(float(v), 6) for v in a]
cols = ['month', 'bills', 'market', 'intl', 'bonds', 'active', 'brightcup', 'morrow', 'harbour']
rows = [[months[i], *[round(float(s[i]), 6) for s in (bills, market, intl, bonds, active, stocks['brightcup'], stocks['morrow'], stocks['harbour'])]] for i in range(N)]
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(f"""// data.js — generated by tools/study/f06-data.py (do not edit by hand). SIMULATED monthly total returns, January 2013 –
// December 2027, for F06 Investment Analysis. Not real market history: the funds, the index and the companies are fictional.
// case.js describes each column and checks the planted facts (see the generator's docstring).

/** Monthly total returns as decimals (0.012 = 1.2%); bills is the one-month risk-free return. */
export const RETURN_COLUMNS = {json.dumps(cols)};
export const RETURNS = {json.dumps(rows, separators=(',', ':'))};
""")
print('wrote', OUT.relative_to(ROOT))
