"""Fixtures for tests/regression.test.mjs: OLS, diagnostics, nested F, logistic regression, from statsmodels.
Run: python3 tests/make_fixtures_regression.py   (writes fixtures-regression.json beside this file)"""
import json, os
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import OLSInfluence
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.diagnostic import het_breuschpagan

rng = np.random.default_rng(6061)
cases = []
for k, (n, kx, hetero) in enumerate([(12, 1, False), (30, 2, False), (60, 3, True), (200, 4, True), (25, 1, True)]):
    X = rng.normal(0, 1, (n, kx)) * rng.uniform(0.5, 20, kx) + rng.uniform(-5, 50, kx)
    beta = rng.uniform(-3, 3, kx)
    noise = rng.normal(0, 1, n) * (1 + (np.abs(X[:, 0] - X[:, 0].mean()) if hetero else 0)) * 2
    y = 10 + X @ beta + noise
    Xc = sm.add_constant(X)
    m = sm.OLS(y, Xc).fit()
    inf = OLSInfluence(m)
    x0 = X.mean(axis=0) + X.std(axis=0)
    pr = m.get_prediction(np.r_[1, x0][None, :]).summary_frame(alpha=0.05)
    hc3 = m.get_robustcov_results(cov_type='HC3')
    bp = het_breuschpagan(m.resid, Xc, robust=True)
    red = sm.OLS(y, sm.add_constant(X[:, :1])).fit() if kx > 1 else None
    c = dict(n=n, X=X.T.tolist(), y=y.tolist(), params=m.params.tolist(), bse=m.bse.tolist(), t=m.tvalues.tolist(),
             p=m.pvalues.tolist(), ci=m.conf_int().tolist(), r2=m.rsquared, adj=m.rsquared_adj, F=m.fvalue, pF=m.f_pvalue,
             sigma=float(np.sqrt(m.scale)), llf=m.llf, aic=m.aic, bic=m.bic,
             hat=inf.hat_matrix_diag.tolist(), internal=inf.resid_studentized_internal.tolist(),
             external=inf.resid_studentized_external.tolist(), cooks=inf.cooks_distance[0].tolist(), dffits=inf.dffits[0].tolist(),
             dw=durbin_watson(m.resid), bpLM=bp[0], bpP=bp[1], hc3=hc3.bse.tolist(),
             x0=x0.tolist(), yhat=float(pr['mean'].iloc[0]), ciLow=float(pr['mean_ci_lower'].iloc[0]), ciHigh=float(pr['mean_ci_upper'].iloc[0]),
             piLow=float(pr['obs_ci_lower'].iloc[0]), piHigh=float(pr['obs_ci_upper'].iloc[0]))
    if red is not None:
        F, pF, df = m.compare_f_test(red)
        c.update(nestedF=F, nestedP=pF, nestedDf=df)
    sx = X.std(axis=0, ddof=1); c['std'] = (m.params[1:] * sx / y.std(ddof=1)).tolist()
    cases.append(c)

logits = []
for k, (n, kx) in enumerate([(80, 1), (150, 2), (400, 3)]):
    X = rng.normal(0, 1, (n, kx)) * rng.uniform(0.5, 5, kx) + rng.uniform(-2, 10, kx)
    beta = rng.uniform(-1, 1, kx)
    eta = -0.5 + (X - X.mean(axis=0)) @ beta
    y = (rng.random(n) < 1 / (1 + np.exp(-eta))).astype(int)
    Xc = sm.add_constant(X)
    m = sm.Logit(y, Xc).fit(disp=0, tol=1e-12, maxiter=200)
    x0 = X.mean(axis=0)
    pr = m.get_prediction(np.r_[1, x0][None, :]).summary_frame(alpha=0.05)
    l = dict(n=n, X=X.T.tolist(), y=y.tolist(), params=m.params.tolist(), bse=m.bse.tolist(), z=m.tvalues.tolist(), p=m.pvalues.tolist(),
             llf=m.llf, llnull=m.llnull, llr=m.llr, llrP=m.llr_pvalue, prsq=m.prsquared, aic=m.aic, bic=m.bic,
             x0=x0.tolist(), prob=float(pr['predicted'].iloc[0]), probLow=float(pr['ci_lower'].iloc[0]), probHigh=float(pr['ci_upper'].iloc[0]))
    if kx > 1:
        r = sm.Logit(y, sm.add_constant(X[:, :1])).fit(disp=0, tol=1e-12, maxiter=200)
        l.update(lrStat=2 * (m.llf - r.llf), lrDf=kx - 1)
    logits.append(l)

series = rng.normal(0, 1, 50).cumsum().tolist()
out = dict(cases=cases, logits=logits, series=series, lag1=float(np.corrcoef(series[1:], series[:-1])[0, 1]))
# lag-1 autocorrelation about the overall mean (the definition regression.js uses)
s = np.array(series); m_ = s.mean(); out['lag1'] = float(((s[1:] - m_) * (s[:-1] - m_)).sum() / ((s - m_) ** 2).sum())
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures-regression.json'), 'w'))
print('cases', len(cases), 'logits', len(logits))
