#!/usr/bin/env python3
"""Reference values for tests/valuation.test.mjs: the valuation engine's formulas worked independently in Python
(NumPy only), from the definitions in assets/js/core/valuation.js's header comment and the HBS Online / Investopedia
references cited in finance/company-valuation/. Run:  python3 tests/make_fixtures_valuation.py"""
import json
import numpy as np

# ---------------------------------------------------------------- a small company, three years, in millions
hist = [
    dict(year=2023, revenue=900.0, cogs=540.0, opex=220.0, da=36.0, interestExpense=14.0, interestIncome=1.0, tax=22.0,
         cash=70.0, shortTermInvestments=10.0, receivables=100.0, inventory=80.0, otherCurrentAssets=12.0, ppeNet=360.0, goodwill=40.0, intangibles=15.0, otherNoncurrentAssets=8.0,
         payables=60.0, currentDebt=20.0, otherCurrentLiabilities=35.0, longTermDebt=280.0, leaseLiabilities=30.0, otherNoncurrentLiabilities=20.0, minorityInterest=5.0,
         cfo=100.0, capex=45.0, dividends=20.0, shares=50.0),
    dict(year=2024, revenue=990.0, cogs=590.0, opex=240.0, da=40.0, interestExpense=15.0, interestIncome=1.5, tax=26.0,
         cash=85.0, shortTermInvestments=10.0, receivables=110.0, inventory=86.0, otherCurrentAssets=13.0, ppeNet=372.0, goodwill=40.0, intangibles=13.0, otherNoncurrentAssets=9.0,
         payables=66.0, currentDebt=20.0, otherCurrentLiabilities=38.0, longTermDebt=280.0, leaseLiabilities=31.0, otherNoncurrentLiabilities=21.0, minorityInterest=5.0,
         cfo=118.0, capex=50.0, dividends=22.0, shares=50.0),
    dict(year=2025, revenue=1080.0, cogs=640.0, opex=258.0, da=43.0, interestExpense=15.0, interestIncome=2.0, tax=31.0,
         cash=104.0, shortTermInvestments=12.0, receivables=118.0, inventory=92.0, otherCurrentAssets=14.0, ppeNet=382.0, goodwill=40.0, intangibles=11.0, otherNoncurrentAssets=10.0,
         payables=72.0, currentDebt=20.0, otherCurrentLiabilities=41.0, longTermDebt=280.0, leaseLiabilities=32.0, otherNoncurrentLiabilities=22.0, minorityInterest=5.0,
         cfo=132.0, capex=52.0, dividends=24.0, shares=50.0),
]
market = dict(sharePrice=22.0, sharesOutstanding=50.0)
N = 5
A = dict(horizon=N, growth=[0.08, 0.07, 0.06, 0.05, 0.04], marginBasis='ebitda', margin=[0.16] * N, daPct=[0.04] * N, capexPct=[0.05] * N,
         nwcPct=[0.11] * N, taxRate=[0.25] * N, taxLosses='none',
         terminal=dict(method='perpetuity', growth=0.025, multiple=9.0, multipleBasis='ebitda'),
         discount=dict(mode='build', rf=0.04, beta=1.1, erp=0.05, kd=0.055, taxRate=0.25, weights='market', targetDebtWeight=0.2, direct=0.09),
         midYear=False, bridge=dict(includeLeases=False, nonOperatingAssets=0.0, otherClaims=0.0), fcfe=dict(debtFunding=None))

def derived(p):
    q = dict(p)
    q['grossProfit'] = q['revenue'] - q['cogs']
    q['ebitda'] = q['grossProfit'] - q['opex']
    q['ebit'] = q['ebitda'] - q['da']
    q['pretax'] = q['ebit'] - q['interestExpense'] + q['interestIncome']
    q['netIncome'] = q['pretax'] - q['tax']
    q['effectiveTax'] = q['tax'] / q['pretax']
    q['debt'] = q['currentDebt'] + q['longTermDebt']
    q['currentAssets'] = q['cash'] + q['shortTermInvestments'] + q['receivables'] + q['inventory'] + q['otherCurrentAssets']
    q['currentLiabilities'] = q['payables'] + q['currentDebt'] + q['otherCurrentLiabilities']
    q['totalAssets'] = q['currentAssets'] + q['ppeNet'] + q['goodwill'] + q['intangibles'] + q['otherNoncurrentAssets']
    q['totalLiabilities'] = q['currentLiabilities'] + q['longTermDebt'] + q['leaseLiabilities'] + q['otherNoncurrentLiabilities']
    q['equity'] = q['totalAssets'] - q['totalLiabilities'] - q['minorityInterest']
    q['nwc'] = q['receivables'] + q['inventory'] + q['otherCurrentAssets'] - q['payables'] - q['otherCurrentLiabilities']
    q['netDebt'] = q['debt'] - q['cash'] - q['shortTermInvestments']
    q['fcf'] = q['cfo'] - q['capex']
    return q

H = [derived(p) for p in hist]
L = H[-1]

def wacc(A, L, market):
    d = A['discount']
    ke = d['rf'] + d['beta'] * d['erp']
    kd_after = d['kd'] * (1 - d['taxRate'])
    E = market['sharePrice'] * market['sharesOutstanding']; Dv = L['debt']
    we, wd = E / (E + Dv), Dv / (E + Dv)
    return dict(ke=ke, kdAfter=kd_after, we=we, wd=wd, wacc=we * ke + wd * kd_after)

def forecast(A, L, cc):
    rows = []; rev = L['revenue']; nwc_prev = L['nwc']; debt_prev = L['debt']
    for t in range(1, A['horizon'] + 1):
        i = t - 1
        rev = rev * (1 + A['growth'][i])
        da = rev * A['daPct'][i]
        ebitda = rev * A['margin'][i]
        ebit = ebitda - da
        tax = max(0.0, ebit) * A['taxRate'][i]
        nopat = ebit - tax
        capex = rev * A['capexPct'][i]
        nwc = rev * A['nwcPct'][i]; dnwc = nwc - nwc_prev
        fcff = nopat + da - capex - dnwc
        interest = A['discount']['kd'] * debt_prev
        nb = cc['wd'] * (capex - da + dnwc)
        ni = (ebit - interest) - max(0.0, ebit - interest) * A['taxRate'][i]
        fcfe = ni + da - capex - dnwc + nb
        rows.append(dict(t=t, revenue=rev, ebitda=ebitda, da=da, ebit=ebit, tax=tax, nopat=nopat, capex=capex, nwc=nwc, dNwc=dnwc, fcff=fcff, interest=interest, netIncome=ni, netBorrowing=nb, fcfe=fcfe))
        nwc_prev = nwc; debt_prev += nb
    return rows

def dcf(A, L, market, mid=False, method='perpetuity'):
    cc = wacc(A, L, market); r = cc['wacc']; rows = forecast(A, L, cc); n = len(rows)
    pvs = [x['fcff'] / (1 + r) ** ((x['t'] - 0.5) if mid else x['t']) for x in rows]
    last = rows[-1]; g = A['terminal']['growth']
    if method == 'exit':
        tv = last['ebitda'] * A['terminal']['multiple']; pv_tv = tv / (1 + r) ** n
        implied_growth = (tv * r - last['fcff']) / (tv + last['fcff']); implied_multiple = None
    else:
        tv = last['fcff'] * (1 + g) / (r - g); pv_tv = tv / (1 + r) ** ((n - 0.5) if mid else n)
        implied_multiple = tv / last['ebitda']; implied_growth = None
    ev = sum(pvs) + pv_tv
    equity = ev - L['debt'] - L['minorityInterest'] + L['cash'] + L['shortTermInvestments']
    return dict(wacc=r, ke=cc['ke'], we=cc['we'], rows=rows, pv=pvs, sumPv=sum(pvs), tv=tv, pvTV=pv_tv, ev=ev, equity=equity,
                perShare=equity / market['sharesOutstanding'], tvShare=pv_tv / ev, impliedMultiple=implied_multiple, impliedGrowth=implied_growth,
                upside=equity / market['sharesOutstanding'] / market['sharePrice'] - 1)

def fcfe_model(A, L, market):
    cc = wacc(A, L, market); ke = cc['ke']; rows = forecast(A, L, cc); n = len(rows); g = A['terminal']['growth']
    pvs = [x['fcfe'] / (1 + ke) ** x['t'] for x in rows]
    tv = rows[-1]['fcfe'] * (1 + g) / (ke - g); pv_tv = tv / (1 + ke) ** n
    eq = sum(pvs) + pv_tv
    return dict(ke=ke, sumPv=sum(pvs), tv=tv, pvTV=pv_tv, equity=eq, perShare=eq / market['sharesOutstanding'])

base = dcf(A, L, market)
mid = dcf(A, L, market, mid=True)
exit_ = dcf(A, L, market, method='exit')
fe = fcfe_model(A, L, market)

# sensitivity: WACC shifted through the risk-free rate, terminal growth shifted
def shifted(dw, dg):
    B = json.loads(json.dumps(A)); B['discount']['rf'] += dw; B['terminal']['growth'] += dg
    return dcf(B, L, market)['perShare']
sens = [[shifted(dw, dg) for dg in (-0.005, 0.0, 0.005)] for dw in (-0.01, 0.0, 0.01)]

# a bear scenario: parallel shifts
def scenario(deltas):
    B = json.loads(json.dumps(A))
    B['growth'] = [g + deltas['growth'] for g in B['growth']]; B['margin'] = [m + deltas['margin'] for m in B['margin']]
    B['capexPct'] = [max(0.0, c + deltas['capexPct']) for c in B['capexPct']]; B['discount']['rf'] += deltas['wacc']; B['discount']['kd'] += deltas.get('kd', 0.0)
    B['terminal']['growth'] += deltas['gT']; B['terminal']['multiple'] = max(0.0, B['terminal']['multiple'] + deltas['exitMultiple'])
    return dcf(B, L, market)
bear_d = dict(growth=-0.03, margin=-0.02, capexPct=0.005, wacc=0.01, gT=-0.005, exitMultiple=-1)
bull_d = dict(growth=0.03, margin=0.02, capexPct=-0.005, wacc=-0.01, gT=0.005, exitMultiple=1)
bear, bull = scenario(bear_d), scenario(bull_d)
# with a risk effect of margin −0.015 and kd +0.01 added to the bear case
bear_risk = scenario(dict(bear_d, margin=bear_d['margin'] - 0.015, kd=0.01))
weighted = 0.25 * bear['perShare'] + 0.5 * base['perShare'] + 0.25 * bull['perShare']

# ---------------------------------------------------------------- comparables
peers = [
    dict(name='A', price=40.0, shares=30.0, debt=200.0, cash=50.0, revenue=1500.0, ebitda=260.0, ebit=200.0, netIncome=120.0, equity=700.0, fcf=130.0),
    dict(name='B', price=25.0, shares=80.0, debt=500.0, cash=60.0, revenue=1900.0, ebitda=250.0, ebit=170.0, netIncome=95.0, equity=900.0, fcf=100.0),
    dict(name='C', price=70.0, shares=40.0, debt=600.0, cash=100.0, revenue=2100.0, ebitda=390.0, ebit=310.0, netIncome=200.0, equity=1200.0, fcf=220.0),
    dict(name='D', price=18.0, shares=130.0, debt=380.0, cash=60.0, revenue=1300.0, ebitda=190.0, ebit=150.0, netIncome=-10.0, equity=640.0, fcf=90.0),   # a loss: P/E not meaningful
]
for p in peers:
    p['marketCap'] = p['price'] * p['shares']; p['ev'] = p['marketCap'] + p['debt'] - p['cash']
target = dict(L); target['marketCap'] = market['sharePrice'] * market['sharesOutstanding']; target['ev'] = target['marketCap'] + L['debt'] + L['minorityInterest'] - L['cash'] - L['shortTermInvestments']
MULT = [('pe', 'marketCap', 'netIncome', 'equity'), ('evEbitda', 'ev', 'ebitda', 'ev'), ('evEbit', 'ev', 'ebit', 'ev'), ('evRevenue', 'ev', 'revenue', 'ev'), ('pb', 'marketCap', 'equity', 'equity'), ('pfcf', 'marketCap', 'fcf', 'equity')]
comps = {}
for mid_, num, den, basis in MULT:
    vals = [p[num] / p[den] for p in peers if p[den] > 0 and p[num] > 0]
    a = np.array(vals)
    st = dict(n=len(vals), mean=float(a.mean()), median=float(np.median(a)), min=float(a.min()), max=float(a.max()), q1=float(np.quantile(a, 0.25)), q3=float(np.quantile(a, 0.75)))
    implied = {}
    for k in ('q1', 'median', 'mean', 'q3'):
        value = st[k] * target[den]
        eq = value - (L['netDebt'] + L['minorityInterest']) if basis == 'ev' else value
        implied[k] = dict(value=value, equity=eq, perShare=eq / market['sharesOutstanding'])
    comps[mid_] = dict(values=vals, stats=st, implied=implied, own=target[num] / target[den])

# ---------------------------------------------------------------- dividend models
ke = base['ke']; dps = L['dividends'] / market['sharesOutstanding']
gordon = dps * 1.025 / (ke - 0.025)
divs = []; d = dps
for t in range(1, 6):
    d *= 1.06; divs.append(d / (1 + ke) ** t)
tv_d = d * 1.025 / (ke - 0.025); multi = sum(divs) + tv_d / (1 + ke) ** 5

# ---------------------------------------------------------------- asset-based
lines = ['cash', 'shortTermInvestments', 'receivables', 'inventory', 'otherCurrentAssets', 'ppeNet', 'goodwill', 'intangibles', 'otherNoncurrentAssets']
orderly = dict(cash=1, shortTermInvestments=0.98, receivables=0.85, inventory=0.6, otherCurrentAssets=0.5, ppeNet=0.5, goodwill=0, intangibles=0.1, otherNoncurrentAssets=0.4)
forced = dict(cash=1, shortTermInvestments=0.95, receivables=0.65, inventory=0.35, otherCurrentAssets=0.25, ppeNet=0.3, goodwill=0, intangibles=0.05, otherNoncurrentAssets=0.2)
def liq(rates):
    gross = sum(L[k] * rates[k] for k in lines); cost = gross * 0.05
    return dict(gross=gross, cost=cost, net=gross - cost - L['totalLiabilities'] - L['minorityInterest'])
asset = dict(book=L['equity'], tangible=L['equity'] - L['goodwill'] - L['intangibles'], orderly=liq(orderly), forced=liq(forced),
             adjustedNav=sum(L[k] * (1.2 if k == 'ppeNet' else 1.0) for k in lines) - L['totalLiabilities'] - L['minorityInterest'])

# ---------------------------------------------------------------- earnings-based and venture capital
epv_ev = L['ebit'] * (1 - 0.25) / base['wacc']
earnings = dict(capitalised=L['netIncome'] / (ke - 0.02), epvEv=epv_ev, epvEquity=epv_ev - L['debt'] - L['minorityInterest'] + L['cash'] + L['shortTermInvestments'], peValue=15 * L['netIncome'])
vc = dict(exitValue=300.0 * 9.0, postMoney=300.0 * 9.0 / 1.3 ** 5, preMoney=300.0 * 9.0 / 1.3 ** 5 - 100.0, ownership=100.0 / (300.0 * 9.0 / 1.3 ** 5))

# ---------------------------------------------------------------- the simple FCF-growth DCF of Finance › Valuation (defaults of that page)
def simple(fcf0=120.0, g1=0.09, years=5, path='fade', w=0.09, gT=0.025, mid=False, debt=300.0, shares=85.0):
    fcf = fcf0; pv = 0.0
    for t in range(1, years + 1):
        g = g1 + (gT - g1) * ((t - 1) / max(1, years - 1)) if path == 'fade' else g1
        fcf *= 1 + g; pv += fcf / (1 + w) ** ((t - 0.5) if mid else t)
    tv = fcf * (1 + gT) / (w - gT); pv_tv = tv / (1 + w) ** ((years - 0.5) if mid else years)
    return dict(ev=pv + pv_tv, equity=pv + pv_tv - debt, perShare=(pv + pv_tv - debt) / shares)

fx = dict(
    inputs=dict(history=hist, market=market, assumptions=A, peers=peers),
    derived=dict(ebitda=L['ebitda'], ebit=L['ebit'], netIncome=L['netIncome'], equity=L['equity'], totalAssets=L['totalAssets'], nwc=L['nwc'], netDebt=L['netDebt'], fcf=L['fcf'], effectiveTax=L['effectiveTax']),
    history_growth=dict(revenue=[None] + [(H[i]['revenue'] / H[i - 1]['revenue'] - 1) for i in range(1, 3)]),
    dcf=dict(base={k: v for k, v in base.items() if k not in ('rows', 'pv')}, rows=base['rows'], pv=base['pv'], mid={k: v for k, v in mid.items() if k not in ('rows', 'pv')}, exit={k: v for k, v in exit_.items() if k not in ('rows', 'pv')}),
    fcfe=fe, sensitivity=sens, scenarios=dict(bear=bear['perShare'], bull=bull['perShare'], bearRisk=bear_risk['perShare'], weighted=weighted),
    comps=comps, ddm=dict(dps=dps, ke=ke, gordon=gordon, multi=multi), asset=asset, earnings=earnings, vc=vc, simple=simple(), simpleMid=simple(mid=True),
)
with open(__file__.replace('make_fixtures_valuation.py', 'fixtures-valuation.json'), 'w') as f:
    json.dump(fx, f, indent=1)
print('wrote fixtures-valuation.json', 'base per share', round(base['perShare'], 4), 'wacc', round(base['wacc'], 5))
