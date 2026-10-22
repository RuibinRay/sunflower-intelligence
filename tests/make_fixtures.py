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
json.dump(fx, open(__file__.replace("make_fixtures.py", "fixtures.json"), "w"), indent=1)
print("ok", fit.params.round(3).tolist(), round(lm, 3), round(lmp, 4))
