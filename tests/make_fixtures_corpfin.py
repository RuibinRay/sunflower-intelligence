"""Fixtures for tests/corpfin.test.mjs: project free cash flows computed independently in pandas, NPV/IRR and annuity
payments from numpy-financial, and a bond yield from numpy-financial's rate. Run: python3 tests/make_fixtures_corpfin.py"""
import json, os
import numpy as np, pandas as pd, numpy_financial as npf

rng = np.random.default_rng(605)
out = {'projects': []}
MACRS = {5: [.20, .32, .192, .1152, .1152, .0576], 7: [.1429, .2449, .1749, .1249, .0893, .0892, .0893, .0446]}
for k in range(6):
    n = int(rng.integers(3, 8)); capex = float(rng.integers(10, 80) * 1000); tax = float(rng.choice([0.21, 0.25, 0.3]))
    rev = [float(round(x, 2)) for x in rng.uniform(20000, 60000, n)]
    vshare = float(round(rng.uniform(0.3, 0.6), 2)); fixed = float(rng.integers(3, 10) * 1000)
    method = ['sl', 5, 7][k % 3]
    if method == 'sl':
        salvage_book = float(rng.integers(0, 5) * 1000); dep = [(capex - salvage_book) / n] * n
    else:
        dep = [capex * p for p in MACRS[method]][:n]
    nwcShare = float(round(rng.uniform(0.05, 0.2), 2)); salvage = float(rng.integers(0, 8) * 1000)
    df = pd.DataFrame({'t': range(n + 1)})
    df['revenue'] = [0] + rev
    df['variable'] = df.revenue * vshare
    df['fixed'] = [0] + [fixed] * n
    df['depreciation'] = [0] + dep + [0] * (n - len(dep))
    df['ebit'] = np.where(df.t >= 1, df.revenue - df.variable - df.fixed - df.depreciation, 0)
    df['ocf'] = df.ebit * (1 - tax) + df.depreciation
    nwc = [nwcShare * (rev[t] if t < n else 0) for t in range(n)] + [0]          # level held at t = share of revenue in t+1
    df['nwc'] = nwc
    df['dNwc'] = df.nwc.diff().fillna(df.nwc.iloc[0])
    book = capex - sum(dep[:n])
    df['salvage'] = [0] * n + [salvage - tax * (salvage - book)]
    df['capex'] = [capex] + [0] * n
    df['fcf'] = df.ocf - df.capex - df.dNwc + df.salvage
    rate = float(round(rng.uniform(0.06, 0.14), 3))
    fcf = df.fcf.tolist()
    out['projects'].append(dict(inputs=dict(capex=capex, years=n, revenue=rev, variableShare=vshare, fixed=fixed, dep=dep[:n], tax=tax, nwcShare=nwcShare, salvage=salvage),
                                fcf=fcf, ocf=df.ocf.tolist(), dNwc=df.dNwc.tolist(), rate=rate, npv=float(npf.npv(rate, fcf)), irr=float(npf.irr(fcf))))
out['annuity'] = [dict(pv=pv, rate=r, n=n, pmt=float(-npf.pmt(r, n, pv))) for pv, r, n in [(10000, 0.08, 5), (24000, 0.006, 48), (-3500, 0.1, 3), (50000, 0.0, 10)]]
out['ytm'] = [dict(price=p, coupon=c, years=y, freq=f, ytm=float(npf.rate(y * f, 100 * c / f, -p, 100) * f)) for p, c, y, f in [(95.2, 0.05, 5, 1), (102.4, 0.06, 7, 2), (88.0, 0.04, 10, 1)]]
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'fixtures-corpfin.json'), 'w'))
print('ok', len(out['projects']))
