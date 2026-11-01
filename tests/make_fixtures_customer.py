"""Fixtures for tests/customer.test.mjs: customer summaries and quantile scores (pandas), NTILE groups, Kaplan–Meier with
Greenwood standard errors and the log-rank test (statsmodels), the sBG model fitted by SciPy, and DERL by SciPy's
hypergeometric function. Fader & Hardie's published data and estimates are checked in the test file itself.
Run: python3 tests/make_fixtures_customer.py   (writes fixtures-customer.json beside this file)"""
import json, os
import numpy as np, pandas as pd
from scipy import optimize, special
from statsmodels.duration.survfunc import SurvfuncRight, survdiff

rng = np.random.default_rng(6064)
out = {}

# ---- customer summaries
n = 400
tx = pd.DataFrame({'id': rng.integers(0, 90, n).astype(str), 'day': rng.integers(20000, 20300, n), 'amount': np.round(rng.lognormal(1.5, 0.6, n), 2)})
as_of = 20250
g = tx[tx.day <= as_of].groupby('id')
summ = pd.DataFrame({'first': g.day.min(), 'last': g.day.max(), 'frequency': g.size(), 'monetary': g.amount.sum().round(2)})
summ['recency'] = as_of - summ['last']; summ['tenure'] = as_of - summ['first']
out['summary'] = dict(tx=dict(id=tx.id.tolist(), day=tx.day.tolist(), amount=tx.amount.tolist()), asOf=as_of, rows=summ.reset_index().to_dict('records'))

# ---- quantile scores: pd.cut on type-7 quantile edges, right-closed (ties share)
def qscore(x, k):
    cuts = [np.quantile(x, j / k) for j in range(1, k)]
    return [1 + sum(v > c for c in cuts) for v in x], cuts
cases = []
for k, kind in [(5, 'freq'), (5, 'money'), (4, 'freq'), (3, 'money')]:
    x = rng.poisson(2, 137) + 1 if kind == 'freq' else np.round(rng.lognormal(3, 0.8, 137), 2)
    s, cuts = qscore(list(x), k)
    # check against pandas for the money case (no duplicate edges)
    if kind == 'money':
        pc = pd.cut(x, [-np.inf] + cuts + [np.inf], labels=False, right=True) + 1
        assert list(pc) == s
    # SQL NTILE: stable sort ascending, first n % k groups one larger
    order = sorted(range(len(x)), key=lambda i: (x[i], i)); base, extra = divmod(len(x), k); nt = [0] * len(x); pos = 0
    for gi in range(k):
        for _ in range(base + (gi < extra)): nt[order[pos]] = gi + 1; pos += 1
    # average-rank rule
    rk = pd.Series(x).rank(method='average').values
    rr = [int(min(k, max(1, np.ceil(k * r / len(x))))) for r in rk]
    cases.append(dict(k=k, x=[float(v) for v in x], quantile=s, cuts=[float(c) for c in cuts], ntile=nt, rank=rr))
out['scores'] = cases

# ---- Kaplan–Meier and log-rank
km = []
for n, groups in [(60, 1), (150, 2), (240, 3)]:
    t = np.ceil(rng.exponential(8, n)); c = np.ceil(rng.uniform(2, 20, n))
    time = np.minimum(t, c); ev = (t <= c).astype(int)
    gr = rng.integers(0, groups, n)
    if groups > 1: time = np.where(gr == 1, np.ceil(time * 1.4), time)
    sf = SurvfuncRight(time, ev)
    case = dict(time=time.tolist(), event=ev.tolist(), group=gr.tolist(), t=sf.surv_times.tolist(), S=sf.surv_prob.tolist(),
                se=sf.surv_prob_se.tolist(), atRisk=sf.n_risk.tolist(), events=sf.n_events.tolist(),
                median=float(sf.quantile(0.5)) if np.isfinite(sf.quantile(0.5)) else None)
    if groups > 1:
        chi2, p = survdiff(time, ev, gr); case.update(chi2=float(chi2), p=float(p))
    km.append(case)
out['km'] = km

# ---- sBG: fit simulated cohorts with SciPy
def sbg_p(a, b, t): return np.exp(special.betaln(a + 1, b + t - 1) - special.betaln(a, b))
def sbg_s(a, b, t): return np.exp(special.betaln(a, b + t) - special.betaln(a, b))
def negll(par, cohorts):
    a, b = np.exp(par); s = 0
    for alive in cohorts:
        for t in range(1, len(alive)):
            lost = alive[t - 1] - alive[t]
            if lost: s += lost * np.log(sbg_p(a, b, t))
        if alive[-1]: s += alive[-1] * np.log(sbg_s(a, b, len(alive) - 1))
    return -s
fits = []
for a0, b0, sizes, T in [(0.7, 1.2, [1000], 7), (0.4, 3.0, [300, 250, 200], 12), (2.0, 9.0, [500, 420], 18)]:
    cohorts = []
    for j, n0 in enumerate(sizes):
        theta = rng.beta(a0, b0, n0); life = rng.geometric(theta)
        TT = T - 3 * j
        cohorts.append([int((life > t).sum()) for t in range(TT + 1)])
    res = optimize.minimize(negll, [0, 0], args=(cohorts,), method='Nelder-Mead', options=dict(xatol=1e-10, fatol=1e-12, maxiter=20000))
    a, b = np.exp(res.x)
    # observed information by finite differences in (a, b)
    def nl(v): return negll(np.log(v), cohorts)
    h = np.array([a, b]) * 1e-4; H = np.zeros((2, 2)); x = np.array([a, b])
    for i in range(2):
        for j in range(2):
            ei = np.eye(2)[i] * h[i]; ej = np.eye(2)[j] * h[j]
            H[i, j] = (nl(x + ei + ej) - nl(x + ei - ej) - nl(x - ei + ej) + nl(x - ei - ej)) / (4 * h[i] * h[j])
    se = np.sqrt(np.diag(np.linalg.inv(H)))
    fits.append(dict(cohorts=cohorts, alpha=float(a), beta=float(b), ll=float(-res.fun), seAlpha=float(se[0]), seBeta=float(se[1]),
                     S=[float(sbg_s(a, b, t)) for t in range(1, 25)], r=[float(sbg_s(a, b, t) / sbg_s(a, b, t - 1)) for t in range(1, 25)]))
out['sbg'] = fits

# ---- DERL closed form (Fader & Hardie 2010, eq. 6) with SciPy's hyp2f1
derl = []
for a, b, d, n in [(3.8, 15.2, 0.10, 3), (0.704, 1.182, 0.10, 1), (0.668, 3.806, 0.08, 5), (1.2, 4.0, 0.01, 12)]:
    derl.append(dict(a=a, b=b, d=d, n=n, value=float((b + n - 1) / (a + b + n - 1) * special.hyp2f1(1, b + n, a + b + n, 1 / (1 + d)))))
out['derl'] = derl

with open(os.path.join(os.path.dirname(__file__), 'fixtures-customer.json'), 'w') as f:
    json.dump(out, f, default=lambda o: o.item() if hasattr(o, 'item') else str(o))
print('ok', {k: len(v) if isinstance(v, list) else 1 for k, v in out.items()})
