#!/usr/bin/env python3
"""Reference values for tests/audit.test.mjs: the calculation audit. Each engine is exercised on many random inputs,
plus boundary and extreme ones, and compared with an independent implementation:
  numpy-financial (NPV, IRR, MIRR), NumPy polynomial roots (every IRR), SciPy (distributions, Brent root-finding,
  SLSQP optimiser, binomial and chi-square tails), statsmodels (OLS with HC3, two-proportion z-test), and direct
  loops written here from the textbook definitions (bonds, Black-Scholes-Merton, payback, VaR, Holt-Winters).
Run:  python3 tests/make_fixtures_audit.py     (needs numpy, scipy, pandas, statsmodels, numpy-financial)
"""
import json, math, os
import numpy as np, numpy_financial as npf, scipy.stats as st, scipy.optimize as so, scipy.special as sp
import statsmodels.api as sm
from statsmodels.stats.proportion import proportions_ztest

rng = np.random.default_rng(20261110)
fx = {}
f = float
def nn(x): return None if (x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x)))) else float(x)

# ================================================================ capital budgeting
def all_irr(flows, lo=-0.99, hi=10.0):
    """Every real IRR in (lo, hi): roots of the polynomial in x = 1/(1+r)."""
    c = np.array(flows, float)
    while len(c) > 1 and c[-1] == 0: c = c[:-1]
    if len(c) < 2: return []
    roots = np.roots(c[::-1])
    out = []
    for z in roots:
        if abs(z.imag) < 1e-9 * max(1, abs(z)) and z.real > 0:
            r = 1 / z.real - 1
            if lo < r < hi: out.append(r)
    out = sorted(out); ded = []
    for r in out:
        if not ded or abs(r - ded[-1]) > 1e-7: ded.append(r)
    return ded
def payback(flows, rate=None):
    cum = 0.0
    for t, fl in enumerate(flows):
        v = fl if rate is None else fl / (1 + rate) ** t
        before = cum; cum += v
        if t == 0 and cum >= 0: return 0.0
        if t > 0 and before < 0 and cum >= 0: return t - 1 + (-before) / v
    return None
cases = []
for i in range(220):
    n = int(rng.integers(2, 13))
    kind = i % 4
    if kind == 0: fl = [-float(rng.uniform(50, 2000))] + list(rng.uniform(5, 600, n - 1))                         # conventional
    elif kind == 1: fl = [-float(rng.uniform(50, 2000))] + list(rng.uniform(-300, 700, n - 1))                    # mixed signs
    elif kind == 2: fl = list(rng.uniform(-900, 900, n))                                                          # anything
    else: fl = [-float(rng.uniform(100, 900))] + list(rng.uniform(100, 700, n - 2)) + [-float(rng.uniform(50, 1500))]   # ends with a clean-up cost
    fl = [round(float(v), 2) for v in fl]
    rate = round(float(rng.uniform(-0.2, 0.45)), 4)
    fin, rein = round(float(rng.uniform(0.02, 0.2)), 4), round(float(rng.uniform(0.02, 0.2)), 4)
    roots = all_irr(fl)
    # roots where NPV only touches zero (double roots) are numerically fragile in any solver: keep cases whose roots are simple
    simple = all(abs(sum(-t * v / (1 + r) ** (t + 1) for t, v in enumerate(fl))) > 1e-3 for r in roots)
    mirr = npf.mirr(fl, fin, rein)
    outlay = -fl[0]
    cases.append(dict(flows=fl, rate=rate, npv=f(npf.npv(rate, fl)), irrs=roots if simple else None, mirr=nn(f(mirr)), fin=fin, rein=rein,
                      payback=payback(fl), discPayback=payback(fl, rate), pi=((f(npf.npv(rate, fl)) + outlay) / outlay) if outlay > 0 else None))
edge = [dict(flows=[-100, 0, 0, 0], rate=0.1), dict(flows=[100, 50, 20], rate=0.1), dict(flows=[-100, 110], rate=0.0), dict(flows=[-100, 230, -132], rate=0.1),
        dict(flows=[-1000, 3600, -4310, 1716], rate=0.05), dict(flows=[-100, 50, 50], rate=-0.5), dict(flows=[0, 0, 0], rate=0.1), dict(flows=[-1e9, 4e8, 4e8, 4e8], rate=0.08),
        dict(flows=[-0.01, 0.004, 0.004, 0.004], rate=0.08), dict(flows=[-100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500], rate=0.12)]
for e in edge:
    fl = e['flows']; e.update(npv=f(npf.npv(e['rate'], fl)), irrs=all_irr(fl), payback=payback(fl), discPayback=payback(fl, e['rate']))
fx['invest'] = dict(cases=cases, edge=edge)

# ================================================================ bonds
def bond(face, cr, years, m, y):
    n = int(round(years * m)); c = face * cr / m; r = y / m
    cfs = [(k, c + (face if k == n else 0)) for k in range(1, n + 1)]
    P = sum(cf / (1 + r) ** k for k, cf in cfs)
    mac = sum((k / m) * cf / (1 + r) ** k for k, cf in cfs) / P
    conv = sum(cf * k * (k + 1) / (1 + r) ** (k + 2) for k, cf in cfs) / (P * m * m)
    return P, mac, mac / (1 + r), conv
bonds = []
for i in range(160):
    m = int(rng.choice([1, 2, 4])); years = int(rng.integers(1, 31)) if i % 5 else float(rng.integers(1, 20)) / m
    face = float(rng.choice([100, 1000])); cr = round(float(rng.uniform(0, 0.12)), 4) if i % 7 else 0.0
    y = round(float(rng.uniform(-0.01, 0.15)), 5) if i % 9 else 0.0
    P, mac, mod, conv = bond(face, cr, years, m, y)
    # the yield back from the price, by Brent's method on the same price function
    ytm = so.brentq(lambda z: bond(face, cr, years, m, z)[0] - P, -0.5, 3.0, xtol=1e-14)
    h = 1e-5
    dP = (bond(face, cr, years, m, y + h)[0] - bond(face, cr, years, m, y - h)[0]) / (2 * h)
    bonds.append(dict(face=face, couponRate=cr, years=years, freq=m, y=y, price=P, macaulay=mac, modified=mod, convexity=conv, ytm=ytm, numMod=-dP / P))
fx['bonds'] = bonds

# ================================================================ Black-Scholes-Merton
def bsm(S, K, T, r, q, v, kind):
    d1 = (math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * math.sqrt(T)); d2 = d1 - v * math.sqrt(T)
    N, n = st.norm.cdf, st.norm.pdf
    call = S * math.exp(-q * T) * N(d1) - K * math.exp(-r * T) * N(d2); put = K * math.exp(-r * T) * N(-d2) - S * math.exp(-q * T) * N(-d1)
    gamma = math.exp(-q * T) * n(d1) / (S * v * math.sqrt(T)); vega = S * math.exp(-q * T) * n(d1) * math.sqrt(T)
    if kind == 'call':
        delta = math.exp(-q * T) * N(d1); theta = -S * math.exp(-q * T) * n(d1) * v / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * N(d2) + q * S * math.exp(-q * T) * N(d1); rho = K * T * math.exp(-r * T) * N(d2)
    else:
        delta = -math.exp(-q * T) * N(-d1); theta = -S * math.exp(-q * T) * n(d1) * v / (2 * math.sqrt(T)) + r * K * math.exp(-r * T) * N(-d2) - q * S * math.exp(-q * T) * N(-d1); rho = -K * T * math.exp(-r * T) * N(-d2)
    return dict(price=call if kind == 'call' else put, call=call, put=put, delta=delta, gamma=gamma, vega=vega, theta=theta, rho=rho)
opts = []
for i in range(260):
    S = float(rng.uniform(5, 500)); K = S * float(rng.uniform(0.4, 1.9)) if i % 6 else S
    T = float(rng.choice([1 / 365, 7 / 365, 0.25, 0.5, 1, 2, 5, 10])); r = float(rng.uniform(-0.01, 0.12)); q = float(rng.uniform(0, 0.06)) if i % 3 else 0.0
    v = float(rng.choice([0.03, 0.1, 0.2, 0.35, 0.6, 1.2])); kind = 'call' if i % 2 else 'put'
    out = bsm(S, K, T, r, q, v, kind)
    opts.append(dict(S=S, K=K, T=T, r=r, q=q, sigma=v, type=kind, **out))
fx['options'] = opts

# ================================================================ portfolio measures
def risk_return(r, periods, rf):
    r = np.asarray(r); m = r.mean(); s = r.std(ddof=1); target = rf / periods
    dd = math.sqrt(np.mean(np.minimum(0, r - target) ** 2)) * math.sqrt(periods)
    return dict(annMean=m * periods, vol=s * math.sqrt(periods), cagr=math.expm1(np.mean(np.log1p(r)) * periods), sharpe=(m * periods - rf) / (s * math.sqrt(periods)),
                sortino=((m * periods - rf) / dd) if dd > 0 else None, downsideDev=dd)
port = []
for i in range(40):
    n = int(rng.integers(30, 800)); periods = int(rng.choice([252, 52, 12])); rf = float(rng.uniform(0, 0.06))
    mk = rng.standard_t(5, n) * 0.012 + 0.0004; beta = float(rng.uniform(0.2, 1.9)); stock = 0.0002 + beta * mk + rng.normal(0, 0.01, n)
    prices = 100 * np.cumprod(1 + stock)
    peak = np.maximum.accumulate(prices); dd = prices / peak - 1
    X = sm.add_constant(mk - rf / periods); fit = sm.OLS(stock - rf / periods, X).fit()
    port.append(dict(r=stock.tolist(), market=mk.tolist(), periods=periods, rf=rf, rr=risk_return(stock, periods, rf), maxDrawdown=f(dd.min()), troughAt=int(dd.argmin()),
                     beta=f(fit.params[1]), alpha=f(fit.params[0]), betaSe=f(fit.bse[1]), r2=f(fit.rsquared)))
fx['portfolio'] = port
front = []
for i in range(24):
    k = int(rng.integers(2, 7)); Aa = rng.normal(0, 1, (k, k)); cov = Aa @ Aa.T * 0.01 + np.eye(k) * 0.002; mu = rng.uniform(0.01, 0.16, k); rf = float(rng.uniform(0, 0.03))
    cons = [dict(type='eq', fun=lambda w: w.sum() - 1)]; bnds = [(0, 1)] * k
    best = None
    for s0 in range(6):
        w0 = rng.dirichlet(np.ones(k)); res = so.minimize(lambda w: w @ cov @ w, w0, bounds=bnds, constraints=cons, method='SLSQP', options=dict(ftol=1e-15, maxiter=1000))
        if best is None or res.fun < best.fun: best = res
    bs = None
    for s0 in range(12):
        w0 = rng.dirichlet(np.ones(k)); res = so.minimize(lambda w: -(w @ mu - rf) / math.sqrt(w @ cov @ w), w0, bounds=bnds, constraints=cons, method='SLSQP', options=dict(ftol=1e-15, maxiter=1000))
        if bs is None or res.fun < bs.fun: bs = res
    target = float(best.x @ mu + 0.5 * (mu.max() - best.x @ mu))
    bt = None
    for s0 in range(8):
        w0 = rng.dirichlet(np.ones(k)); res = so.minimize(lambda w: w @ cov @ w, w0, bounds=bnds, constraints=cons + [dict(type='eq', fun=lambda w: w @ mu - target)], method='SLSQP', options=dict(ftol=1e-15, maxiter=1000))
        if res.success and (bt is None or res.fun < bt.fun): bt = res
    front.append(dict(mu=mu.tolist(), cov=cov.tolist(), rf=rf, gmvVar=f(best.fun), sharpe=f(-bs.fun), target=target, targetVar=f(bt.fun) if bt is not None else None))
fx['frontier'] = front

# ================================================================ market risk
def kupiec(x, n, p):
    ph = x / n; lr = -2 * (sp.xlogy(n - x, 1 - p) + sp.xlogy(x, p) - sp.xlogy(n - x, 1 - ph) - sp.xlogy(x, ph)); return f(lr), f(st.chi2.sf(lr, 1))
risk = []
for i in range(30):
    n = int(rng.integers(120, 3000)); r = rng.standard_t(int(rng.integers(3, 12)), n) * float(rng.uniform(0.004, 0.03)) + float(rng.uniform(-0.001, 0.001))
    c = float(rng.choice([0.9, 0.95, 0.975, 0.99])); h = int(rng.choice([1, 5, 10]))
    q = np.quantile(r, 1 - c); tail = r[r <= q]
    mu, sig = r.mean() * h, r.std(ddof=1) * math.sqrt(h); z = st.norm.ppf(1 - c)
    lam = 0.94; v = r[:min(n, 30)].std(ddof=1) ** 2
    for xx in r: v = lam * v + (1 - lam) * xx * xx
    risk.append(dict(r=r.tolist(), c=c, h=h, histVar=f(-q * math.sqrt(h)), histEs=f(-tail.mean() * math.sqrt(h)), tail=int(len(tail)), paraVar=f(-(mu + sig * z)), paraEs=f(-(mu - sig * st.norm.pdf(z) / (1 - c))), ewma=f(math.sqrt(v))))
fx['risk'] = risk
fx['kupiec'] = [dict(x=x, n=n, p=p, lr=kupiec(x, n, p)[0], pv=kupiec(x, n, p)[1]) for x, n, p in [(0, 250, 0.01), (1, 250, 0.01), (2, 250, 0.01), (5, 250, 0.01), (10, 250, 0.01), (25, 500, 0.05), (60, 1000, 0.05), (250, 250, 0.01), (3, 1000, 0.025), (40, 750, 0.025)]]
fx['binom'] = [dict(x=x, n=n, p=p, cdf=f(st.binom.cdf(x, n, p))) for x, n, p in [(0, 250, 0.01), (4, 250, 0.01), (5, 250, 0.01), (9, 250, 0.01), (10, 250, 0.01), (20, 500, 0.05), (0, 10, 0.5), (10, 10, 0.5), (700, 1000, 0.7)]]
fx['basel'] = [dict(x=x, zone='green' if x <= 4 else 'yellow' if x <= 9 else 'red') for x in range(0, 13)]     # Basel Committee (1996), 250 days at 99%
def christ(h, p):
    h = np.asarray(h, int); a, b = h[:-1], h[1:]
    n00 = int(((a == 0) & (b == 0)).sum()); n01 = int(((a == 0) & (b == 1)).sum()); n10 = int(((a == 1) & (b == 0)).sum()); n11 = int(((a == 1) & (b == 1)).sum())
    p0 = n01 / (n00 + n01) if n00 + n01 else 0; p1 = n11 / (n10 + n11) if n10 + n11 else 0; pi = (n01 + n11) / (n00 + n01 + n10 + n11)
    lr = -2 * (sp.xlogy(n00 + n10, 1 - pi) + sp.xlogy(n01 + n11, pi) - sp.xlogy(n00, 1 - p0) - sp.xlogy(n01, p0) - sp.xlogy(n10, 1 - p1) - sp.xlogy(n11, p1))
    return dict(lrInd=f(lr), pInd=f(st.chi2.sf(lr, 1)), n00=n00, n01=n01, n10=n10, n11=n11)
chs = []
for i in range(12):
    hits = (rng.random(int(rng.integers(100, 900))) < float(rng.uniform(0.005, 0.08))).astype(int)
    if i % 3 == 0:                      # clustered exceptions
        for j in range(1, len(hits)):
            if hits[j - 1] and rng.random() < 0.5: hits[j] = 1
    chs.append(dict(hits=hits.tolist(), **christ(hits, 0.01)))
fx['christoffersen'] = chs

# ================================================================ distributions at the extremes
fx['dist'] = dict(
    ncdf=[[z, f(st.norm.cdf(z))] for z in [-8.5, -6, -4.2, -2.33, -1e-9, 0, 1e-9, 0.67, 3.1, 5.5, 8.2]],
    nq=[[p, f(st.norm.ppf(p))] for p in [1e-12, 1e-8, 1e-4, 0.01, 0.2, 0.5, 0.8, 0.975, 0.9999, 1 - 1e-9]],
    tcdf=[[t, df, f(st.t.cdf(t, df))] for t, df in [(-12, 1), (-3.5, 2), (0.3, 1), (2.0, 4), (1.96, 30), (-1.96, 1e4), (40, 3), (-40, 3), (0, 7), (1e-6, 5)]],
    tq=[[p, df, f(st.t.ppf(p, df))] for p, df in [(0.001, 1), (0.025, 2), (0.975, 2), (0.9, 1), (0.995, 4), (0.5, 9), (0.99999, 6), (0.3, 250), (0.975, 1e5)]],
    chi2=[[x, k, f(st.chi2.sf(x, k))] for x, k in [(0.001, 1), (3.84, 1), (40, 1), (5.99, 2), (0.5, 9), (120, 30), (1e-9, 4), (300, 250)]],
    fp=[[x, a, b, f(st.f.sf(x, a, b))] for x, a, b in [(0.01, 1, 5), (4.0, 1, 30), (30, 2, 8), (1.0, 12, 200), (0.2, 40, 3), (9, 6, 6)]],
    betainc=[[x, a, b, f(sp.betainc(a, b, x))] for x, a, b in [(0.01, 0.5, 0.5), (0.5, 2, 3), (0.99, 5, 0.5), (0.3, 30, 80), (1e-6, 1, 1), (0.9999, 200, 2)]],
)

# ================================================================ OLS
ols = []
for i in range(14):
    n = int(rng.integers(8, 400)); k = int(rng.integers(1, 6)); X = rng.normal(0, 1, (n, k)) * rng.uniform(0.1, 50, k) + rng.uniform(-5, 5, k)
    if i % 5 == 0 and k > 1: X[:, 1] = X[:, 0] * 0.98 + rng.normal(0, 0.05 * X[:, 0].std(), n)        # nearly collinear
    y = X @ rng.normal(0, 2, k) + rng.normal(0, 1 + 0.5 * np.abs(X[:, 0]), n) + 3
    fit = sm.OLS(y, sm.add_constant(X)).fit(); hc3 = fit.get_robustcov_results('HC3')
    ols.append(dict(X=X.T.tolist(), y=y.tolist(), beta=fit.params.tolist(), se=fit.bse.tolist(), t=fit.tvalues.tolist(), p=fit.pvalues.tolist(), r2=f(fit.rsquared), adjR2=f(fit.rsquared_adj),
                    F=f(fit.fvalue), pF=f(fit.f_pvalue), sigma=f(math.sqrt(fit.mse_resid)), hc3=hc3.bse.tolist(), aic=f(fit.aic), bic=f(fit.bic)))
fx['ols'] = ols

# ================================================================ A/B tests
ab = []
for i in range(40):
    na, nb = int(rng.integers(40, 60000)), int(rng.integers(40, 60000)); pa = float(rng.uniform(0.005, 0.6)); pb = pa * float(rng.uniform(0.6, 1.5))
    ca, cb = int(rng.binomial(na, pa)), int(rng.binomial(nb, min(0.99, pb)))
    if ca + cb == 0 or ca + cb == na + nb: continue
    z, p = proportions_ztest([cb, ca], [nb, na])
    a_, b_ = ca / na, cb / nb; se = math.sqrt(a_ * (1 - a_) / na + b_ * (1 - b_) / nb); zc = st.norm.ppf(0.975)
    ab.append(dict(a=dict(n=na, conv=ca), b=dict(n=nb, conv=cb), z=f(z), p=f(p), low=b_ - a_ - zc * se, high=b_ - a_ + zc * se))
fx['ab'] = ab
ss = []
for p1, p2, alpha, power in [(0.1, 0.12, 0.05, 0.8), (0.02, 0.025, 0.05, 0.9), (0.5, 0.55, 0.01, 0.8), (0.3, 0.2, 0.05, 0.95), (0.001, 0.002, 0.05, 0.8), (0.9, 0.95, 0.1, 0.8)]:
    za, zb = st.norm.ppf(1 - alpha / 2), st.norm.ppf(power); pbar = (p1 + p2) / 2
    n = (za * math.sqrt(2 * pbar * (1 - pbar)) + zb * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2
    nn_ = math.ceil(n)
    s0 = math.sqrt(2 * pbar * (1 - pbar) / nn_); s1 = math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / nn_); d = abs(p2 - p1)
    ss.append(dict(p1=p1, p2=p2, alpha=alpha, power=power, n=nn_, achieved=f(st.norm.cdf((d - za * s0) / s1) + st.norm.cdf((-d - za * s0) / s1))))
fx['sampleSize'] = ss

# ================================================================ unit economics: closed forms against brute-force sums
ue = []
for i in range(30):
    arpa = float(rng.uniform(5, 900)); margin = float(rng.uniform(0.2, 0.95)); churn = float(rng.uniform(0.004, 0.2)); cust = int(rng.integers(20, 5000)); smv = float(rng.uniform(1e3, 2e6))
    m = arpa * margin; cac = smv / cust
    ltv = sum(m * (1 - churn) ** t for t in range(0, 20000))
    cum = 0.0; pay = None
    if cac < m / churn: pay = math.log(1 - cac * churn / m) / math.log(1 - churn)
    start = float(rng.uniform(1e5, 9e6)); up = float(rng.uniform(0, 0.3)) * start; loss = float(rng.uniform(0, 0.5)) * start; nna = float(rng.uniform(-1e5, 2e6))
    ue.append(dict(inp=dict(arpa=arpa, margin=margin, churn=churn, sm=smv, newCust=cust, netNewArr=nna, startArr=start, upgrades=up, losses=loss), cac=cac, ltv=ltv, paybackSimple=cac / m, paybackChurn=pay,
                   magic=nna / smv, nrr=(start + up - loss) / start, grr=max(0, start - loss) / start))
fx['unitEconomics'] = ue

# ================================================================ Holt-Winters: the recursion and the forecast variance, written out again
def hw_init(y, m):
    c1, c2 = np.mean(y[:m]), np.mean(y[m:2 * m]); b0 = (c2 - c1) / m; mid = (m - 1) / 2; l0 = c1 - b0 * (mid + 1)
    s = np.array([((y[i] - (c1 + b0 * (i - mid))) + (y[i + m] - (c2 + b0 * (i - mid)))) / 2 for i in range(m)]); s = s - s.mean()
    return l0, b0, s
def hw_run(y, m, a, b, g, h):
    l, bb, s = hw_init(y, m); s = s.copy(); fitted = []; sse = 0.0
    for t in range(len(y)):
        k = t % m; yh = l + bb + s[k]; e = y[t] - yh; fitted.append(yh); sse += e * e
        l_new = l + bb + a * e; bb = bb + a * b * e; l = l_new; s[k] = s[k] + g * e
    mean = [l + j * bb + s[(len(y) + j - 1) % m] for j in range(1, h + 1)]
    mult = []; acc = 1.0
    for j in range(1, h + 1):
        mult.append(acc); c = a + a * b * j + (g if j % m == 0 else 0); acc += c * c
    return dict(fitted=fitted, sse=sse, mean=mean, mult=mult)
hw = []
for i in range(16):
    m = int(rng.choice([4, 7, 12])); n = m * int(rng.integers(3, 9)); t = np.arange(n)
    y = 100 + 0.8 * t + 12 * np.sin(2 * np.pi * t / m) + rng.normal(0, 3, n)
    a, b, g = float(rng.uniform(0.05, 0.9)), float(rng.uniform(0.0, 0.5)), float(rng.uniform(0.0, 0.6)); h = int(rng.integers(1, 2 * m + 3))
    hw.append(dict(y=y.tolist(), m=m, alpha=a, beta=b, gamma=g, h=h, **hw_run(y, m, a, b, g, h)))
fx['holtWinters'] = hw

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures-audit.json'), 'w') as fo: json.dump(fx, fo)
print({k: (len(v) if isinstance(v, list) else {kk: len(vv) for kk, vv in v.items()}) for k, v in fx.items()})
