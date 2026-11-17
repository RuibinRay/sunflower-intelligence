"""make_fixtures_derivatives.py — independent reference values for assets/js/core/derivatives.js.

Written separately in NumPy and SciPy (not translated from the JavaScript): forward and FX forward prices, forward
values, a futures margin account, discount factors, swap rates and values, hedge ratios estimated from simulated price
changes (OLS slope = minimum-variance ratio), binomial trees (with a vectorised backward induction) and Black-Scholes.
Run: python3 tests/make_fixtures_derivatives.py  (needs numpy, scipy) -> tests/fixtures-derivatives.json
"""
import json, math
import numpy as np
from scipy.stats import norm

out = {}

# ---------------------------------------------------------------- forwards
fw = []
for S, r, T, inc, sto in [(100, 0.05, 1, 0, 0), (36.0, 0.045, 0.5, 0, 0.9), (1450, 0.04, 0.75, 20, 0), (50, 0.08, 2, 3, 1)]:
    fw.append({'S': S, 'r': r, 'T': T, 'income': inc, 'storage': sto, 'F': (S - inc + sto) * (1 + r) ** T,
               'Fc': (S - inc + sto) * math.exp(r * T)})
out['forwards'] = fw
out['fx'] = [{'spot': s, 'rd': rd, 'rf': rf, 'T': T, 'F': s * (1 + rd) ** T / (1 + rf) ** T}
             for s, rd, rf, T in [(1.08, 0.045, 0.025, 0.5), (1.27, 0.045, 0.05, 1), (0.0067, 0.045, 0.001, 0.25)]]
out['forwardValue'] = [{'F': F, 'K': K, 'r': r, 'T': T, 'v': (F - K) / (1 + r) ** T}
                       for F, K, r, T in [(105, 100, 0.05, 0.5), (36.5, 38, 0.045, 0.75), (1.10, 1.0991, 0.045, 0.25)]]

# ---------------------------------------------------------------- futures margin account
def margin(prices, contracts, size, initial, maintenance, long=True):
    sign = 1 if long else -1
    p = np.array(prices, dtype=float)
    gains = sign * np.diff(p) * size * contracts
    bal, rows = initial * contracts, []
    for i, g in enumerate(gains):
        before = bal + g
        call = initial * contracts - before if before < maintenance * contracts else 0.0
        bal = before + call
        rows.append({'gain': float(g), 'before': float(before), 'call': float(call), 'balance': float(bal)})
    return rows
out['margin'] = [
    {'prices': [2.10, 2.06, 2.01, 2.05, 1.96, 1.99, 2.08], 'contracts': 2, 'size': 10000, 'initial': 6000, 'maintenance': 4500, 'long': True},
    {'prices': [150, 152, 155, 151, 158, 160], 'contracts': 3, 'size': 50, 'initial': 900, 'maintenance': 700, 'long': False},
]
for m in out['margin']:
    m['rows'] = margin(m['prices'], m['contracts'], m['size'], m['initial'], m['maintenance'], m['long'])

# ---------------------------------------------------------------- swaps
sw = []
for zeros, notional, fixed in [([0.040, 0.042, 0.043, 0.044, 0.045], 200e6, 0.045), ([0.05, 0.048, 0.047], 10e6, 0.046), ([0.03, 0.035], 1e6, 0.031)]:
    z = np.array(zeros); t = np.arange(1, len(z) + 1)
    df = 1 / (1 + z) ** t
    rate = (1 - df[-1]) / df.sum()
    value = notional - notional * (fixed * df.sum() + df[-1])          # pay fixed, receive floating (par at reset)
    sw.append({'zeros': zeros, 'df': df.tolist(), 'rate': float(rate), 'notional': notional, 'fixed': fixed, 'valuePayer': float(value)})
out['swaps'] = sw

# ---------------------------------------------------------------- minimum-variance hedge ratio from data
rng = np.random.default_rng(2028)
n = 60
dF = rng.normal(0, 0.08, n)
dS = 0.75 * dF + rng.normal(0, 0.035, n)
slope = np.polyfit(dF, dS, 1)[0]
rho = np.corrcoef(dS, dF)[0, 1]
out['hedge'] = {'dS': dS.tolist(), 'dF': dF.tolist(), 'slope': float(slope), 'rho': float(rho),
                'sdS': float(dS.std(ddof=1)), 'sdF': float(dF.std(ddof=1)), 'h': float(rho * dS.std(ddof=1) / dF.std(ddof=1))}

# ---------------------------------------------------------------- binomial trees and Black-Scholes
def crr(S, K, T, r, sigma, n, typ, american):
    dt = T / n; u = math.exp(sigma * math.sqrt(dt)); d = 1 / u
    p = (math.exp(r * dt) - d) / (u - d); disc = math.exp(-r * dt)
    j = np.arange(n + 1); ST = S * u ** j * d ** (n - j)
    v = np.maximum(ST - K, 0) if typ == 'call' else np.maximum(K - ST, 0)
    for i in range(n - 1, -1, -1):
        v = disc * (p * v[1:] + (1 - p) * v[:-1])
        if american:
            j = np.arange(i + 1); Si = S * u ** j * d ** (i - j)
            v = np.maximum(v, (Si - K) if typ == 'call' else (K - Si))
    return float(v[0])
def bs(S, K, T, r, sigma, typ):
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * math.sqrt(T)); d2 = d1 - sigma * math.sqrt(T)
    return S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2) if typ == 'call' else K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
bt = []
for S, K, T, r, s, n, typ, am in [(50, 52, 2, 0.05, 0.30, 2, 'put', False), (50, 52, 2, 0.05, 0.30, 2, 'put', True), (100, 100, 1, 0.04, 0.2, 500, 'call', False),
                                   (100, 110, 0.5, 0.045, 0.25, 400, 'put', True), (42, 40, 0.5, 0.10, 0.2, 3, 'call', False), (36, 38, 0.75, 0.045, 0.35, 200, 'call', False)]:
    bt.append({'S': S, 'K': K, 'T': T, 'r': r, 'sigma': s, 'steps': n, 'type': typ, 'american': am, 'price': crr(S, K, T, r, s, n, typ, am), 'bs': bs(S, K, T, r, s, typ)})
out['binomial'] = bt

json.dump(out, open('tests/fixtures-derivatives.json', 'w'), indent=1)
print('wrote tests/fixtures-derivatives.json:', ', '.join(f'{k} {len(v) if isinstance(v, list) else 1}' for k, v in out.items()))
