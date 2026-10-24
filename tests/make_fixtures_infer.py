#!/usr/bin/env python3
"""Reference values for tests/inference.test.mjs (assets/js/core/inference.js), computed with SciPy and statsmodels.

Run:  python3 tests/make_fixtures_infer.py   (writes tests/fixtures-infer.json)
"""
import json
from pathlib import Path
import numpy as np
import scipy.stats as st
from statsmodels.stats.proportion import proportions_ztest, proportion_confint
from statsmodels.stats.power import NormalIndPower, zt_ind_solve_power

rng = np.random.default_rng(2026)
a = np.round(rng.normal(250.6, 1.9, 24), 1)          # a one-sample set
b = np.round(rng.normal(249.4, 3.1, 31), 1)          # a second, more variable sample
pre = np.round(rng.normal(62, 8, 14), 0); post = np.round(pre + rng.normal(4, 5, 14), 0)
groups = [np.round(rng.normal(m, s, k), 2).tolist() for m, s, k in [(9.2, 1.1, 12), (10.4, 1.4, 15), (9.6, 0.9, 10), (11.0, 1.6, 8)]]
fx = {"data": {"a": a.tolist(), "b": b.tolist(), "pre": pre.tolist(), "post": post.tolist(), "groups": groups}}

d = fx["dist"] = {}
d["norm"] = [[x, mu, s, st.norm.pdf(x, mu, s), st.norm.cdf(x, mu, s), st.norm.sf(x, mu, s)] for x, mu, s in
             [(1000, 1004, 3), (-1.96, 0, 1), (2.5, 0, 1), (-8.2, 0, 1), (7.5, 0, 1), (12.6, 39.38, 26.1), (250, 250.6, 1.9)]]
d["normInv"] = [[p, mu, s, st.norm.ppf(p, mu, s)] for p, mu, s in [(0.01, 1004, 3), (0.975, 0, 1), (1e-9, 0, 1), (0.5, 7, 2), (0.999, 250, 2)]]
d["t"] = [[x, df, st.t.pdf(x, df), st.t.cdf(x, df), st.t.sf(x, df)] for x, df in [(2.1, 9), (-3.4, 23), (0.0, 5), (12.0, 4), (-1.3, 1.5), (2.0, 57.3)]]
d["chi2"] = [[x, k, st.chi2.pdf(x, k), st.chi2.cdf(x, k), st.chi2.sf(x, k)] for x, k in [(3.84, 1), (11.07, 5), (0.5, 2), (40.0, 6), (95.0, 20), (1.2, 3)]]
d["chi2Inv"] = [[p, k, st.chi2.ppf(p, k), st.chi2.isf(p, k)] for p, k in [(0.05, 1), (0.05, 6), (0.95, 3), (0.001, 12), (0.5, 40)]]
d["f"] = [[x, d1, d2, st.f.pdf(x, d1, d2), st.f.cdf(x, d1, d2), st.f.sf(x, d1, d2)] for x, d1, d2 in [(3.1, 3, 41), (0.4, 2, 10), (8.0, 1, 30), (1.0, 5, 5), (2.2, 12, 60)]]
d["fInv"] = [[p, d1, d2, st.f.ppf(p, d1, d2), st.f.isf(p, d1, d2)] for p, d1, d2 in [(0.05, 3, 41), (0.05, 2, 10), (0.01, 1, 30), (0.5, 5, 5), (0.9, 12, 60)]]
d["binom"] = [[k, n, p, st.binom.pmf(k, n, p), st.binom.cdf(k, n, p), st.binom.sf(k, n, p)] for k, n, p in
              [(3, 10, 0.3), (0, 20, 0.05), (12, 20, 0.45), (20, 20, 0.9), (55, 200, 0.31), (7, 12, 0.5)]]
d["binomInv"] = [[n, p, al, int(st.binom.ppf(al, n, p))] for n, p, al in [(10, 0.3, 0.5), (20, 0.05, 0.95), (200, 0.31, 0.025), (12, 0.5, 0.99)]]
d["poisson"] = [[k, lam, st.poisson.pmf(k, lam), st.poisson.cdf(k, lam), st.poisson.sf(k, lam)] for k, lam in [(0, 1.9), (2, 1.9), (5, 1.9), (10, 4.2), (30, 12.5)]]
d["expon"] = [[x, lam, st.expon.pdf(x, scale=1 / lam), st.expon.cdf(x, scale=1 / lam)] for x, lam in [(0.5, 2.0), (3.0, 0.4), (0.01, 10.0)]]

t = fx["tests"] = {}
def tt1(x, mu, alt):
    r = st.ttest_1samp(x, mu, alternative=alt); ci = r.confidence_interval(0.95)
    return [float(r.statistic), float(r.pvalue), float(ci.low), float(ci.high)]
t["t1"] = [[mu, alt, tt1(a, mu, alt)] for mu, alt in [(250, "two-sided"), (250, "greater"), (251, "less")]]
def tt2(eq, alt):
    r = st.ttest_ind(a, b, equal_var=eq, alternative=alt); ci = r.confidence_interval(0.95)
    return [float(r.statistic), float(r.pvalue), float(r.df), float(ci.low), float(ci.high)]
t["t2"] = [[eq, alt, tt2(eq, alt)] for eq, alt in [(True, "two-sided"), (False, "two-sided"), (False, "greater"), (True, "less")]]
rp = st.ttest_rel(post, pre); cip = rp.confidence_interval(0.95)
t["paired"] = [float(rp.statistic), float(rp.pvalue), float(cip.low), float(cip.high), float(st.pearsonr(post, pre)[0])]
z = (a.mean() - 250) / (2.0 / np.sqrt(len(a)))
t["z1"] = [250, 2.0, float(z), float(2 * st.norm.sf(abs(z)))]
fstat = a.var(ddof=1) / b.var(ddof=1); d1, d2 = len(a) - 1, len(b) - 1
t["fvar"] = [float(fstat), float(2 * min(st.f.sf(fstat, d1, d2), st.f.cdf(fstat, d1, d2)))]

zs, ps = proportions_ztest(132, 300, value=0.4, prop_var=0.4)
t["prop1"] = [132, 300, 0.4, float(zs), float(ps)]
zs2, ps2 = proportions_ztest([224, 158], [7700, 8800])
t["prop2"] = [224, 7700, 158, 8800, float(zs2), float(ps2)]
t["ciProp"] = [[x, n, list(proportion_confint(x, n, 0.05, "normal")), list(proportion_confint(x, n, 0.05, "wilson"))] for x, n in [(61, 79), (5, 40), (132, 300)]]
t["ciMean"] = [float(np.mean(a)), *st.t.interval(0.95, len(a) - 1, loc=np.mean(a), scale=st.sem(a))]

obs = [38, 41, 29, 33, 27, 36, 27]
g = st.chisquare(obs)
t["gof"] = [obs, float(g.statistic), float(g.pvalue)]
obs2, probs = [52, 61, 48, 39], [0.25, 0.3, 0.25, 0.2]
g2 = st.chisquare(obs2, np.array(probs) * sum(obs2))
t["gofProbs"] = [obs2, probs, float(g2.statistic), float(g2.pvalue)]
tab = [[48, 31, 21], [62, 29, 40]]
ci2 = st.chi2_contingency(tab, correction=False)
t["indep"] = [tab, float(ci2.statistic), float(ci2.pvalue), int(ci2.dof), np.asarray(ci2.expected_freq).tolist()]
fo = st.f_oneway(*groups)
t["anova"] = [float(fo.statistic), float(fo.pvalue), float(st.f.isf(0.05, 3, sum(len(x) for x in groups) - 4))]

p = fx["power"] = {}
p["oneSample"] = [[delta, sigma, n, float(NormalIndPower().power(effect_size=delta / sigma, nobs1=n, alpha=0.05, ratio=0, alternative="two-sided"))] for delta, sigma, n in [(1.0, 2.0, 25), (0.5, 2.0, 40), (3.0, 10.0, 60)]]
p["twoSample"] = [[delta, sigma, n, float(NormalIndPower().power(effect_size=delta / sigma, nobs1=n, alpha=0.05, ratio=1, alternative="two-sided"))] for delta, sigma, n in [(0.5, 1.0, 64), (4.0, 12.0, 100)]]
p["oneSided"] = [[delta, sigma, n, float(NormalIndPower().power(effect_size=delta / sigma, nobs1=n, alpha=0.05, ratio=0, alternative="larger"))] for delta, sigma, n in [(1.0, 2.0, 25)]]
p["nFor80"] = [[delta, sigma, float(NormalIndPower().solve_power(effect_size=delta / sigma, alpha=0.05, power=0.8, ratio=1, alternative="two-sided"))] for delta, sigma in [(0.5, 1.0), (2.0, 6.0)]]

def clean(v):
    if isinstance(v, float) and not np.isfinite(v): return "inf" if v > 0 else "-inf"
    if isinstance(v, dict): return {k: clean(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)): return [clean(x) for x in v]
    return v
Path(__file__).with_name("fixtures-infer.json").write_text(json.dumps(clean(fx), indent=1))
print("wrote tests/fixtures-infer.json")
