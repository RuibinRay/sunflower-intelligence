#!/usr/bin/env python3
"""Reference values for tests/stats.test.mjs, computed with SciPy, pandas and statsmodels."""
import json, numpy as np, pandas as pd, scipy.stats as st
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.outliers_influence import variance_inflation_factor

rng = np.random.default_rng(42)
n = 60
x1 = rng.normal(10, 2, n); x2 = rng.normal(5, 1.5, n); x3 = 0.6 * x1 + rng.normal(0, 1, n)
y = 3 + 1.8 * x1 - 2.2 * x2 + 0.5 * x3 + rng.normal(0, 1 + 0.25 * x1, n)   # heteroscedastic on purpose
X = sm.add_constant(np.column_stack([x1, x2, x3]))
fit = sm.OLS(y, X).fit()
pred = fit.get_prediction(np.array([[1, 11.0, 4.0, 7.0]])).summary_frame(alpha=0.05)
lm, lmp, fval, fp = het_breuschpagan(fit.resid, X, robust=True)
vifs = [variance_inflation_factor(X, i) for i in range(1, 4)]
s = pd.Series(x1)
fx = {
  "dist": {
    "tcdf": [[t, df, st.t.cdf(t, df)] for t, df in [(-2.5, 3), (0.7, 10), (1.96, 1000), (4.2, 25), (-0.1, 2)]],
    "tq": [[p, df, st.t.ppf(p, df)] for p, df in [(0.975, 5), (0.975, 30), (0.995, 12), (0.9, 3), (0.025, 58)]],
    "fp": [[f, a, b, st.f.sf(f, a, b)] for f, a, b in [(3.1, 3, 56), (0.5, 2, 10), (12.0, 1, 40)]],
    "chi2p": [[x, k, st.chi2.sf(x, k)] for x, k in [(7.8, 3), (0.4, 1), (25.0, 10)]],
    "nq": [[p, st.norm.ppf(p)] for p in [0.001, 0.025, 0.3, 0.5, 0.9, 0.999]],
    "ncdf": [[z, st.norm.cdf(z)] for z in [-3.1, -1.0, 0.0, 0.5, 2.2]],
  },
  "data": {"x1": x1.tolist(), "x2": x2.tolist(), "x3": x3.tolist(), "y": y.tolist()},
  "describe": {"mean": s.mean(), "sd": s.std(), "median": s.median(), "q1": s.quantile(.25), "q3": s.quantile(.75),
               "skew": s.skew(), "kurt": s.kurt(),
               "ciLow": st.t.interval(0.95, n - 1, loc=s.mean(), scale=st.sem(x1))[0],
               "ciHigh": st.t.interval(0.95, n - 1, loc=s.mean(), scale=st.sem(x1))[1]},
  "corr": {"pearson": list(st.pearsonr(x1, y)), "spearman": [st.spearmanr(x1, y)[0], st.spearmanr(x1, y)[1]]},
  "ols": {"params": fit.params.tolist(), "bse": fit.bse.tolist(), "pvalues": fit.pvalues.tolist(),
          "ci": fit.conf_int(0.05).tolist(), "r2": fit.rsquared, "adjr2": fit.rsquared_adj, "f": fit.fvalue, "fp": fit.f_pvalue,
          "pred": {"mean": float(pred["mean"].iloc[0]), "obs_lo": float(pred["obs_ci_lower"].iloc[0]), "obs_hi": float(pred["obs_ci_upper"].iloc[0]),
                   "mean_lo": float(pred["mean_ci_lower"].iloc[0]), "mean_hi": float(pred["mean_ci_upper"].iloc[0])}},
  "bp": {"lm": lm, "p": lmp},
  "vif": vifs,
}
# robust (HC3) standard errors, t-based p-values and the robust Wald F, same heteroscedastic data
hc3 = sm.OLS(y, X).fit(cov_type="HC3", use_t=True)
fx["hc3"] = {"bse": hc3.bse.tolist(), "pvalues": hc3.pvalues.tolist(), "f": float(np.squeeze(hc3.fvalue)), "fp": float(np.squeeze(hc3.f_pvalue))}

# Holt-Winters (ETS(A,A,A)) with known starting states: one-step fits, forecasts and h-step variance multipliers
import warnings; warnings.filterwarnings("ignore")
from statsmodels.tsa.exponential_smoothing.ets import ETSModel
hw_rng = np.random.default_rng(7); m = 12; nh = 60; tt = np.arange(nh)
hy = 100 + 0.8 * tt + 12 * np.sin(2 * np.pi * tt / m) + hw_rng.normal(0, 3, nh)
c1, c2 = hy[:m].mean(), hy[m:2 * m].mean(); b0 = (c2 - c1) / m; mid = (m - 1) / 2; l0 = c1 - b0 * (mid + 1)
s0 = np.array([((hy[i] - (c1 + b0 * (i - mid))) + (hy[i + m] - (c2 + b0 * (i - mid)))) / 2 for i in range(m)]); s0 -= s0.mean()
al, bstar, ga = 0.35, 0.12, 0.2
hs = pd.Series(hy, index=pd.RangeIndex(nh))
known = ETSModel(hs, error="add", trend="add", seasonal="add", seasonal_periods=m, initialization_method="known", initial_level=l0, initial_trend=b0, initial_seasonal=s0)
res = known.smooth([al, al * bstar, ga])
pf = res.get_prediction(start=nh, end=nh + 17).summary_frame()
var = ((pf["pi_upper"] - pf["mean"]) / st.norm.ppf(0.975)).values ** 2
best = known.fit(disp=False)
fx["hw"] = {"y": hy.tolist(), "m": m, "l0": l0, "b0": b0, "s0": s0.tolist(), "alpha": al, "beta": bstar, "gamma": ga,
            "fitted": np.asarray(res.fittedvalues).tolist(), "mean": pf["mean"].tolist(), "mult": (var / res.mse).tolist(),
            "best_sse": float(best.sse)}
# ---------------------------------------------------------------- round 3: finance, classification, A/B, learning
from scipy.optimize import brentq
from scipy import integrate
from sklearn.metrics import roc_auc_score, silhouette_score
from sklearn.cluster import KMeans
from statsmodels.stats.proportion import proportions_ztest

# Black-Scholes-Merton (formula with SciPy's normal) and Greeks by central differences
def bsm(S, K, T, r, q, v, kind):
    d1 = (np.log(S / K) + (r - q + v * v / 2) * T) / (v * np.sqrt(T)); d2 = d1 - v * np.sqrt(T)
    if kind == "call": return S * np.exp(-q * T) * st.norm.cdf(d1) - K * np.exp(-r * T) * st.norm.cdf(d2)
    return K * np.exp(-r * T) * st.norm.cdf(-d2) - S * np.exp(-q * T) * st.norm.cdf(-d1)
bs_cases = []
for S, K, T, r, q, v, kind in [(100, 105, 0.5, 0.04, 0.01, 0.25, "call"), (100, 95, 1.2, 0.05, 0.0, 0.3, "put"), (42, 40, 0.25, 0.03, 0.02, 0.45, "call")]:
    h = 1e-4
    price = bsm(S, K, T, r, q, v, kind)
    delta = (bsm(S + h, K, T, r, q, v, kind) - bsm(S - h, K, T, r, q, v, kind)) / (2 * h)
    gamma = (bsm(S + 1e-2, K, T, r, q, v, kind) - 2 * price + bsm(S - 1e-2, K, T, r, q, v, kind)) / 1e-4
    vega = (bsm(S, K, T, r, q, v + h, kind) - bsm(S, K, T, r, q, v - h, kind)) / (2 * h)
    theta = -(bsm(S, K, T + h, r, q, v, kind) - bsm(S, K, T - h, r, q, v, kind)) / (2 * h)
    rho = (bsm(S, K, T, r + h, q, v, kind) - bsm(S, K, T, r - h, q, v, kind)) / (2 * h)
    bs_cases.append({"S": S, "K": K, "T": T, "r": r, "q": q, "sigma": v, "type": kind, "price": price, "delta": delta, "gamma": gamma, "vega": vega, "theta": theta, "rho": rho})
fx["bs"] = bs_cases

# bonds: price by direct discounting, yield by Brent's method, duration and convexity by finite differences of the price
def bprice(face, cr, years, m, y):
    n = int(round(years * m)); c = face * cr / m
    return sum((c + (face if k == n else 0)) / (1 + y / m) ** k for k in range(1, n + 1))
bond_cases = []
for face, cr, years, m, y in [(1000, 0.05, 10, 2, 0.062), (100, 0.0, 5, 1, 0.04), (1000, 0.08, 3, 4, 0.035)]:
    P = bprice(face, cr, years, m, y); h = 1e-5
    dP = (bprice(face, cr, years, m, y + h) - bprice(face, cr, years, m, y - h)) / (2 * h)
    d2P = (bprice(face, cr, years, m, y + 1e-4) - 2 * P + bprice(face, cr, years, m, y - 1e-4)) / 1e-8
    target = P * 1.013
    bond_cases.append({"face": face, "couponRate": cr, "years": years, "freq": m, "y": y, "price": P, "modified": -dP / P, "convexity": d2P / P,
                       "price2": target, "ytm2": brentq(lambda yy: bprice(face, cr, years, m, yy) - target, -0.5, 1.0, xtol=1e-14)})
fx["bonds"] = bond_cases

# logistic regression (statsmodels Logit) on a churn-like sample, with AUC from scikit-learn
lr = np.random.default_rng(11); nl = 300
tenure = lr.uniform(1, 60, nl); calls = lr.poisson(2, nl).astype(float); monthly = lr.normal(70, 20, nl)
eta = 0.4 - 0.06 * tenure + 0.45 * calls + 0.015 * (monthly - 70)
yl = (lr.uniform(0, 1, nl) < 1 / (1 + np.exp(-eta))).astype(float)
XL = sm.add_constant(np.column_stack([tenure, calls, monthly]))
lf = sm.Logit(yl, XL).fit(disp=0)
fx["logit"] = {"x": [tenure.tolist(), calls.tolist(), monthly.tolist()], "y": yl.tolist(), "params": lf.params.tolist(), "bse": lf.bse.tolist(),
               "pvalues": lf.pvalues.tolist(), "llf": lf.llf, "llnull": lf.llnull, "prsquared": lf.prsquared, "auc": roc_auc_score(yl, lf.predict(XL))}

# k-means and silhouette (scikit-learn) on three separated groups
kr = np.random.default_rng(5)
pts = np.vstack([kr.normal([0, 0], 0.5, (40, 2)), kr.normal([4, 1], 0.6, (35, 2)), kr.normal([1.5, 4], 0.5, (30, 2))])
km = KMeans(n_clusters=3, n_init=50, random_state=0).fit(pts)
fx["kmeans"] = {"rows": pts.tolist(), "inertia": float(km.inertia_), "silhouette": float(silhouette_score(pts, km.labels_)), "labels": km.labels_.tolist()}

# A/B test: two-proportion z-test (statsmodels) and power at the planned sample size (statsmodels, same normal approximation)
zst, zp = proportions_ztest([260, 312], [5000, 5000])
fx["ab"] = {"a": [5000, 260], "b": [5000, 312], "z": float(-zst), "p": float(zp)}

# IRT EAP by adaptive numerical integration over a standard normal prior (independent of the site's grid)
items = [{"a": 1.2, "b": -0.5, "c": 0.2}, {"a": 0.9, "b": 0.3, "c": 0.2}, {"a": 1.5, "b": 1.0, "c": 0.2}, {"a": 1.1, "b": -1.2, "c": 0.2}, {"a": 1.3, "b": 0.6, "c": 0.2}]
resp = [1, 1, 0, 1, 1]
def lik(t):
    v = st.norm.pdf(t)
    for it, u in zip(items, resp):
        P = it["c"] + (1 - it["c"]) / (1 + np.exp(-it["a"] * (t - it["b"]))); v *= P if u else 1 - P
    return v
Z = integrate.quad(lik, -8, 8, epsabs=1e-13)[0]; m1 = integrate.quad(lambda t: t * lik(t), -8, 8, epsabs=1e-13)[0] / Z
m2 = integrate.quad(lambda t: (t - m1) ** 2 * lik(t), -8, 8, epsabs=1e-13)[0] / Z
fx["eap"] = {"items": items, "resp": resp, "theta": m1, "se": float(np.sqrt(m2))}

# ---------------------------------------------------------------- round 4: investment decisions, portfolios, market risk
import numpy_financial as npf
from scipy.optimize import milp, LinearConstraint, Bounds, minimize

def py_payback(fl, rate=None):
    cum = 0.0
    for t, f in enumerate(fl):
        f = f if rate is None else f / (1 + rate) ** t
        if t == 0 and f >= 0: return 0.0
        if cum < 0 <= cum + f and t > 0: return t - 1 + (-cum) / f
        cum += f
    return None
def all_irr(fl):
    # NPV = sum f_t x^t with x = 1/(1+r): real positive roots x give the IRRs
    roots = np.roots(fl[::-1])
    out = sorted(1 / x.real - 1 for x in roots if abs(x.imag) < 1e-9 and x.real > 0)
    return [r for r in out if -0.99 < r < 10]
flow_sets = {"A": [-1000, 300, 400, 500, 200], "B": [-1000, 600, 400, 200, 100], "small": [-100, 60, 70],
             "mine": [-1600, 10000, -10000], "late": [-500, 0, 0, 0, 900]}
fx["invest"] = {"rate": 0.1, "cases": {k: {"flows": f, "npv": npf.npv(0.1, f), "irrs": all_irr(f),
    "irr": (float(npf.irr(f)) if len(all_irr(f)) == 1 else None), "mirr": float(npf.mirr(f, 0.1, 0.12)),
    "payback": py_payback(f), "disc": py_payback(f, 0.1)} for k, f in flow_sets.items()},
    "crossAB": all_irr([a - b for a, b in zip(flow_sets["A"], flow_sets["B"])])}
projs = [(400, 120), (250, 90), (300, 85), (150, 60), (500, 140), (200, 30), (350, 110)]
budget = 1000
res = milp(c=-np.array([v for _, v in projs], float), constraints=LinearConstraint(np.array([[o for o, _ in projs]], float), -np.inf, budget),
           integrality=np.ones(len(projs)), bounds=Bounds(0, 1))
fx["ration"] = {"projects": projs, "budget": budget, "npv": float(-res.fun), "pick": [int(round(v)) for v in res.x]}

# portfolio statistics on simulated correlated returns
prng = np.random.default_rng(7)
k, T = 5, 600
L = prng.normal(0, 1, (k, k)); C = (L @ L.T) / k * 1e-4 + np.eye(k) * 4e-5
R = prng.multivariate_normal(np.array([4, 6, 3, 8, 5]) * 1e-4, C, T)
mu = R.mean(0) * 252; cov = np.cov(R.T, ddof=1) * 252
cons = [{"type": "eq", "fun": lambda w: w.sum() - 1}]
def best(fun, extra=()):
    sols = [minimize(fun, w0, method="SLSQP", bounds=[(0, 1)] * k, constraints=cons + list(extra), options={"ftol": 1e-15, "maxiter": 1000})
            for w0 in [np.ones(k) / k] + list(np.eye(k) * 0.6 + 0.4 / k)]
    sols = [s for s in sols if s.success]
    return min(sols, key=lambda s: s.fun).x
gmv = best(lambda w: w @ cov @ w)
tgt = float(mu @ gmv + 0.4 * (mu.max() - mu @ gmv))
wt = best(lambda w: w @ cov @ w, [{"type": "eq", "fun": lambda w: w @ mu - tgt}])
rf = 0.03
ms = best(lambda w: -(w @ mu - rf) / np.sqrt(w @ cov @ w))
s0 = pd.Series(R[:, 3])
dd_den = np.sqrt(np.mean(np.minimum(0, R[:, 3] - rf / 252) ** 2)) * np.sqrt(252)
price = 50 * np.cumprod(np.r_[1, 1 + R[:, 3]])
dd = price / np.maximum.accumulate(price) - 1
mk = R[:, 0] * 0.5 + R[:, 1] * 0.5
fitc = sm.OLS(R[:, 3] - rf / 252, sm.add_constant(mk - rf / 252)).fit()
rb = pd.Series(R[:, 3]).rolling(60).cov(pd.Series(mk)) / pd.Series(mk).rolling(60).var()
fx["port"] = {"R": R.tolist(), "mu": mu.tolist(), "cov": cov.tolist(), "gmv": gmv.tolist(), "gmvVar": float(gmv @ cov @ gmv),
    "target": tgt, "wt": wt.tolist(), "wtVar": float(wt @ cov @ wt), "rf": rf, "ms": ms.tolist(),
    "msSharpe": float((ms @ mu - rf) / np.sqrt(ms @ cov @ ms)),
    "stats": {"annMean": s0.mean() * 252, "vol": s0.std() * np.sqrt(252), "sortino": (s0.mean() * 252 - rf) / dd_den,
              "cagr": float(np.prod(1 + R[:, 3]) ** (252 / T) - 1), "skew": s0.skew(), "kurt": s0.kurt()},
    "mdd": float(dd.min()), "trough": int(dd.argmin()), "peak": int(np.argmax(price[: dd.argmin() + 1])),
    "capm": {"beta": fitc.params[1], "alpha": fitc.params[0], "seBeta": fitc.bse[1], "r2": fitc.rsquared},
    "rollBeta": [[i, rb[i]] for i in (59, 200, 599)]}

# market risk
qrng = np.random.default_rng(11)
rr = qrng.standard_t(4, 1500) * 0.009 + 0.0003
c = 0.99
q = np.quantile(rr, 1 - c)
mu_r, sd_r = rr.mean(), rr.std(ddof=1)
z = st.norm.ppf(1 - c)
kap = pd.Series(rr).kurt(); nu = min(200, max(4.2, 4 + 6 / kap)) if kap > 0.03 else 200
sc = sd_r * np.sqrt((nu - 2) / nu); tq = st.t.ppf(1 - c, nu)
def py_backtest(r, c, method, W=250, lam=0.94):
    hits, fc, v = [], [], None
    for t in range(W, len(r)):
        past = r[t - W:t]
        if method == "historical": VaR = -np.quantile(past, 1 - c)
        elif method == "normal": VaR = -(past.mean() + past.std(ddof=1) * st.norm.ppf(1 - c))
        else:
            v = past.std(ddof=1) ** 2 if v is None else lam * v + (1 - lam) * r[t - 1] ** 2
            VaR = -np.sqrt(v) * st.norm.ppf(1 - c)
        fc.append(VaR); hits.append(bool(r[t] < -VaR))
    return fc, hits
bt = {m: py_backtest(rr, c, m) for m in ("historical", "normal", "ewma")}
def py_kupiec(x, n, p):
    ph = x / n
    ll0 = (n - x) * np.log(1 - p) + (x * np.log(p) if x else 0)
    ll1 = ((n - x) * np.log(1 - ph) if x < n else 0) + (x * np.log(ph) if x else 0)
    lr = -2 * (ll0 - ll1); return [x, n, p, lr, st.chi2.sf(lr, 1)]
def py_christ(h):
    h = np.asarray(h, int); a, b = h[:-1], h[1:]
    n00 = int(((a == 0) & (b == 0)).sum()); n01 = int(((a == 0) & (b == 1)).sum()); n10 = int(((a == 1) & (b == 0)).sum()); n11 = int(((a == 1) & (b == 1)).sum())
    p0, p1, pi = n01 / (n00 + n01), (n11 / (n10 + n11) if n10 + n11 else 0), (n01 + n11) / (n00 + n01 + n10 + n11)
    L = lambda n, p: n * np.log(p) if n else 0.0
    lr = -2 * (L(n00 + n10, 1 - pi) + L(n01 + n11, pi) - L(n00, 1 - p0) - L(n01, p0) - L(n10, 1 - p1) - L(n11, p1))
    return [lr, st.chi2.sf(lr, 1)]
hits_demo = [0] * 40 + [1, 1, 0, 1] + [0] * 60 + [1] + [0] * 95
fx["risk"] = {"r": rr.tolist(), "c": c, "hist": [-q, -rr[rr <= q].mean()],
    "param": [-(mu_r + sd_r * z), -(mu_r - sd_r * st.norm.pdf(z) / (1 - c))],
    "param10": [-(mu_r * 10 + sd_r * np.sqrt(10) * z)],
    "tdist": {"nu": nu, "var": -(mu_r + sc * tq), "es": -(mu_r - sc * (nu + tq ** 2) / (nu - 1) * st.t.pdf(tq, nu) / (1 - c))},
    "bt": {m: {"n": len(v[0]), "x": int(sum(v[1])), "first": v[0][0], "last": v[0][-1], "hits": [int(b) for b in v[1]]} for m, v in bt.items()},
    "kupiec": [py_kupiec(8, 250, 0.01), py_kupiec(0, 250, 0.01), py_kupiec(31, 500, 0.05), py_kupiec(2, 250, 0.01)],
    "christ": {"hits": hits_demo, "out": py_christ(hits_demo), "pof": py_kupiec(sum(hits_demo), len(hits_demo), 0.01)},
    "binom": [[x, 250, 0.01, st.binom.cdf(x, 250, 0.01)] for x in (0, 4, 5, 9, 10)]}
json.dump(fx, open(__file__.replace("make_fixtures.py", "fixtures.json"), "w"), indent=1)
print("ok", fit.params.round(3).tolist(), round(lm, 3), round(lmp, 4))
