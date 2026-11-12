"""Fixtures for tests/investments.test.mjs: numpy, pandas, statsmodels and numpy-financial on fixed inputs."""
import json, numpy as np, numpy_financial as npf, statsmodels.api as sm
from pathlib import Path
rng = np.random.default_rng(7)
out = {}
r = rng.normal(0.008, 0.045, 60); m = rng.normal(0.007, 0.04, 60); rf = np.full(60, 0.002)
out['series'] = {'r': r.tolist(), 'm': m.tolist(), 'rf': rf.tolist()}
out['geometric'] = float(np.prod(1 + r) ** (1 / 60) - 1)
fit = sm.OLS(r - rf, sm.add_constant(m - rf)).fit()
out['beta'] = {'alpha': float(fit.params[0]), 'beta': float(fit.params[1]), 'r2': float(fit.rsquared), 'seBeta': float(fit.bse[1]), 'seAlpha': float(fit.bse[0])}
out['cov'] = float(np.cov(r, m, ddof=1)[0, 1]); out['corr'] = float(np.corrcoef(r, m)[0, 1])
out['te'] = float(np.std(r - m, ddof=1))
# bond duration by brute force: Macaulay from PV weights, convexity by finite differences of price
def price(c, n, y, f, face=100):
    k = np.arange(1, n * f + 1); cf = np.full(len(k), face * c / f); cf[-1] += face
    return float(np.sum(cf / (1 + y / f) ** k))
bonds = []
for c, n, y, f in [(0.05, 10, 0.06, 1), (0.04, 7, 0.045, 2), (0.0, 5, 0.05, 1), (0.07, 20, 0.055, 2)]:
    k = np.arange(1, n * f + 1); cf = np.full(len(k), 100 * c / f); cf[-1] += 100
    pv = cf / (1 + y / f) ** k; P = pv.sum(); mac = float(np.sum(k / f * pv) / P)
    h = 1e-4; conv = (price(c, n, y + h, f) + price(c, n, y - h, f) - 2 * P) / (P * h * h)
    bonds.append({'c': c, 'n': n, 'y': y, 'f': f, 'price': float(P), 'mac': mac, 'mod': mac / (1 + y / f), 'conv': float(conv), 'pv_check': float(-npf.pv(y / f, n * f, 100 * c / f, 100))})
out['bonds'] = bonds
# DCF and Gordon
fcf = [100, 110, 120, 128, 135]; rate = 0.09; g = 0.025
pv = [f / (1 + rate) ** (i + 1) for i, f in enumerate(fcf)]; tv = fcf[-1] * (1 + g) / (rate - g)
out['dcf'] = {'value': sum(pv) + tv / (1 + rate) ** 5, 'tv': tv, 'npv_check': float(npf.npv(rate, [0] + fcf[:-1] + [fcf[-1] + tv]))}
Path(__file__).with_name('fixtures-investments.json').write_text(json.dumps(out))
print('ok')
