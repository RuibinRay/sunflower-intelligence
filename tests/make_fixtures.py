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
json.dump(fx, open(__file__.replace("make_fixtures.py", "fixtures.json"), "w"), indent=1)
print("ok", fit.params.round(3).tolist(), round(lm, 3), round(lmp, 4))
