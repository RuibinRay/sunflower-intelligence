# Fixtures for tests/correlation.test.mjs: SciPy and statsmodels results on random data.
# Run: python3 tests/make_fixtures_correlation.py
import json, os
import numpy as np
from scipy import stats
from statsmodels.stats.multitest import multipletests
import statsmodels.api as sm
rng = np.random.default_rng(20271026)
cases = []
for k in range(14):
    n = int(rng.integers(8, 120))
    x = rng.normal(0, 1, n)
    rho = rng.uniform(-0.9, 0.9)
    y = rho * x + np.sqrt(1 - rho ** 2) * rng.normal(0, 1, n)
    if k % 3 == 0:   # ties and integer data
        x = np.round(x * 2); y = np.round(y * 2)
    if k % 4 == 1:   # a skewed variable
        y = np.exp(y)
    z = 0.5 * x + rng.normal(0, 1, n)
    w = 0.3 * y + rng.normal(0, 1, n)
    pr = stats.pearsonr(x, y)
    ci = pr.confidence_interval(0.95)
    ci90 = pr.confidence_interval(0.90)
    sr = stats.spearmanr(x, y)
    kt = stats.kendalltau(x, y, variant='b', method='asymptotic')
    # partial correlation of x, y given z (and given z, w) via residuals
    def res(v, C):
        X = sm.add_constant(np.column_stack(C)); return v - X @ np.linalg.lstsq(X, v, rcond=None)[0]
    p1 = stats.pearsonr(res(x, [z]), res(y, [z]))[0]
    p2 = stats.pearsonr(res(x, [z, w]), res(y, [z, w]))[0]
    t1 = p1 * np.sqrt((n - 3) / (1 - p1 ** 2)); pp1 = 2 * stats.t.sf(abs(t1), n - 3)
    cases.append(dict(x=x.tolist(), y=y.tolist(), z=z.tolist(), w=w.tolist(), n=n,
        cov=float(np.cov(x, y, ddof=1)[0, 1]), covp=float(np.cov(x, y, ddof=0)[0, 1]),
        r=float(pr.statistic), p=float(pr.pvalue), ci=[float(ci.low), float(ci.high)], ci90=[float(ci90.low), float(ci90.high)],
        pGreater=float(stats.pearsonr(x, y, alternative='greater').pvalue),
        rho=float(sr.statistic), rhoP=float(sr.pvalue), tau=float(kt.statistic), tauP=float(kt.pvalue),
        partial1=float(p1), partial1P=float(pp1), partial2=float(p2)))
ps = rng.uniform(0, 0.2, 15).tolist()
adj = {m: multipletests(ps, method=m)[1].tolist() for m in ['bonferroni', 'holm', 'fdr_bh']}
# power and sample size by the Fisher-z normal approximation (written out independently)
from scipy.stats import norm
pw = []
for rho, n in [(0.3, 50), (0.2, 100), (-0.5, 20), (0.1, 400)]:
    d = np.arctanh(abs(rho)) * np.sqrt(n - 3); q = norm.ppf(0.975)
    pw.append(dict(rho=rho, n=n, power=float(norm.cdf(d - q) + norm.cdf(-d - q))))
ss = [dict(rho=rho, n=int(np.ceil(((norm.ppf(0.975) + norm.ppf(0.8)) / np.arctanh(rho)) ** 2 + 3))) for rho in [0.1, 0.2, 0.3, 0.5]]
crit = [dict(n=n, r=float(stats.t.ppf(0.975, n - 2) / np.sqrt(n - 2 + stats.t.ppf(0.975, n - 2) ** 2))) for n in [10, 30, 100, 612]]
# compare independent correlations
cmp = []
for r1, n1, r2, n2 in [(0.6, 50, 0.3, 60), (0.735, 305, 0.519, 305)]:
    z = (np.arctanh(r1) - np.arctanh(r2)) / np.sqrt(1 / (n1 - 3) + 1 / (n2 - 3)); cmp.append(dict(r1=r1, n1=n1, r2=r2, n2=n2, z=float(z), p=float(2 * norm.sf(abs(z)))))
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures-correlation.json')
json.dump(dict(cases=cases, ps=ps, adj=adj, power=pw, sampleSize=ss, crit=crit, compare=cmp), open(out, 'w'))
print(len(cases), 'cases ->', out)
