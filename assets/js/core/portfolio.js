// portfolio.js — stock analysis: returns, risk and drawdown, CAPM beta, and the long-only efficient frontier.
// The frontier is solved exactly: for every subset of assets the equality-constrained problem has a closed form,
// and the best subset whose weights are all non-negative is the long-only optimum (the problem is convex).
// Checked against NumPy, statsmodels and SciPy's SLSQP optimiser (tests/make_fixtures.py).
import { mean, sd, skewness, kurtosis, ols } from './stats.js?v=14';

/** Simple returns P[t] / P[t−1] − 1. */
export function returns(prices) {
  const r = new Array(prices.length - 1);
  for (let t = 1; t < prices.length; t++) r[t - 1] = prices[t] / prices[t - 1] - 1;
  return r;
}

/** Annualised summary of periodic simple returns. rf is the annual risk-free rate. */
export function riskReturn(r, { periods = 252, rf = 0 } = {}) {
  const n = r.length, m = mean(r), s = sd(r);
  const target = rf / periods;
  let down = 0, growth = 0;
  for (const v of r) { const d = Math.min(0, v - target); down += d * d; growth += Math.log1p(v); }
  const annMean = m * periods, vol = s * Math.sqrt(periods), dd = Math.sqrt(down / n) * Math.sqrt(periods);
  return {
    n, annMean, vol, cagr: Math.expm1((growth / n) * periods), sharpe: (annMean - rf) / vol, sortino: dd > 0 ? (annMean - rf) / dd : NaN,
    downsideDev: dd, best: Math.max(...r), worst: Math.min(...r), skew: skewness(r), kurt: kurtosis(r),
  };
}

/** Drawdown from the running peak at every point, and the worst one with its peak, trough and recovery. */
export function drawdowns(prices) {
  const dd = new Array(prices.length);
  let peak = prices[0], peakAt = 0, worst = 0, at = { peak: 0, trough: 0, recovery: -1 };
  for (let t = 0; t < prices.length; t++) {
    if (prices[t] > peak) { peak = prices[t]; peakAt = t; }
    dd[t] = prices[t] / peak - 1;
    if (dd[t] < worst) { worst = dd[t]; at = { peak: peakAt, trough: t, recovery: -1 }; }
  }
  for (let t = at.trough; t < prices.length; t++) if (prices[t] >= prices[at.peak]) { at.recovery = t; break; }
  return { series: dd, max: worst, ...at };
}

/** Simple moving average; the first n − 1 points are NaN. */
export function sma(values, n) {
  const out = new Array(values.length).fill(NaN);
  let s = 0;
  for (let t = 0; t < values.length; t++) {
    s += values[t]; if (t >= n) s -= values[t - n];
    if (t >= n - 1) out[t] = s / n;
  }
  return out;
}

/** CAPM regression of the stock's excess return on the market's: slope = beta, intercept = alpha per period. */
export function capm(stock, market, { rf = 0, periods = 252 } = {}) {
  const rfp = rf / periods;
  const y = stock.map((v) => v - rfp), x = market.map((v) => v - rfp);
  const fit = ols([x], y, { names: ['Market excess return'] });
  if (fit.error) return fit;
  const [a, b] = fit.coefs;
  const totalVar = sd(y) ** 2 * periods, sysVar = b.estimate ** 2 * sd(x) ** 2 * periods;
  return { fit, alpha: a, beta: b, alphaAnnual: a.estimate * periods, r2: fit.r2, systematicShare: sysVar / totalVar, totalVol: Math.sqrt(totalVar), residVol: fit.sigma * Math.sqrt(periods) };
}

/** Beta over a trailing window: cov(stock, market) / var(market). */
export function rollingBeta(stock, market, window) {
  const out = new Array(stock.length).fill(NaN);
  for (let t = window - 1; t < stock.length; t++) {
    let sx = 0, sy = 0; for (let k = t - window + 1; k <= t; k++) { sx += market[k]; sy += stock[k]; }
    const mx = sx / window, my = sy / window;
    let c = 0, v = 0; for (let k = t - window + 1; k <= t; k++) { c += (market[k] - mx) * (stock[k] - my); v += (market[k] - mx) ** 2; }
    out[t] = c / v;
  }
  return out;
}

/** Annualised mean vector and covariance matrix (n − 1 denominator) from aligned return columns. */
export function moments(cols, periods = 252) {
  const k = cols.length, n = cols[0].length, mu = cols.map((c) => mean(c));
  const cov = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let i = 0; i < k; i++) for (let j = i; j < k; j++) {
    let s = 0; for (let t = 0; t < n; t++) s += (cols[i][t] - mu[i]) * (cols[j][t] - mu[j]);
    cov[i][j] = cov[j][i] = (s / (n - 1)) * periods;
  }
  return { mu: mu.map((m) => m * periods), cov };
}

export const portRet = (w, mu) => w.reduce((s, v, i) => s + v * mu[i], 0);
export function portVar(w, cov) { let s = 0; for (let i = 0; i < w.length; i++) for (let j = 0; j < w.length; j++) s += w[i] * w[j] * cov[i][j]; return s; }

/** Gaussian elimination with partial pivoting; null when (numerically) singular. */
function solve(A, b) {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  let scale = 0; for (const row of A) for (const v of row) scale = Math.max(scale, Math.abs(v));
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) <= 1e-13 * (scale || 1)) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** Minimum variance over the weights of the assets in `idx`, summing to one (and returning `target` if given); no sign limits. */
function eqMinVar(idx, mu, cov, target) {
  const m = idx.length;
  if (m === 1) return target == null || Math.abs(mu[idx[0]] - target) < 1e-12 ? [1] : null;
  const S = idx.map((i) => idx.map((j) => 2 * cov[i][j]));
  const withTarget = (cons) => {
    const A = S.map((row, a) => [...row, ...cons.map((c) => c[a])]);
    cons.forEach((c) => A.push([...c, ...cons.map(() => 0)]));
    const rhs = [...new Array(m).fill(0), 1, ...(cons.length > 1 ? [target] : [])];
    const x = solve(A, rhs);
    return x ? x.slice(0, m) : null;
  };
  const ones = new Array(m).fill(1);
  if (target == null) return withTarget([ones]);
  const w = withTarget([ones, idx.map((i) => mu[i])]);
  if (w) return w;
  // the assets' returns are all equal: the return constraint is either redundant or impossible
  return idx.every((i) => Math.abs(mu[i] - target) < 1e-12) ? withTarget([ones]) : null;
}

function* subsets(k) { for (let mask = 1; mask < 1 << k; mask++) { const idx = []; for (let i = 0; i < k; i++) if (mask & (1 << i)) idx.push(i); yield idx; } }

/** Long-only minimum-variance portfolio, optionally with a target return. Returns weights or null if infeasible. */
export function minVariance(mu, cov, target = null) {
  const k = mu.length;
  if (k > 12) throw new Error('Up to 12 assets.');
  let best = null, bestV = Infinity;
  for (const idx of subsets(k)) {
    const ws = eqMinVar(idx, mu, cov, target);
    if (!ws || ws.some((v) => v < -1e-10)) continue;
    const w = new Array(k).fill(0); idx.forEach((i, a) => { w[i] = Math.max(0, ws[a]); });
    const tot = w.reduce((a, b) => a + b, 0); for (let i = 0; i < k; i++) w[i] /= tot;
    const v = portVar(w, cov);
    if (v < bestV - 1e-15) { bestV = v; best = w; }
  }
  return best;
}

/** Long-only portfolio with the highest Sharpe ratio for annual risk-free rate rf; null if no mix beats rf. */
export function maxSharpe(mu, cov, rf = 0) {
  const k = mu.length;
  let best = null, bestS = -Infinity;
  for (const idx of subsets(k)) {
    const A = idx.map((i) => idx.map((j) => cov[i][j]));
    const z = solve(A, idx.map((i) => mu[i] - rf));
    if (!z) continue;
    const tot = z.reduce((a, b) => a + b, 0);
    if (!(tot > 0) || z.some((v) => v < -1e-12 * tot)) continue;
    const w = new Array(k).fill(0); idx.forEach((i, a) => { w[i] = Math.max(0, z[a]) / tot; });
    const sh = (portRet(w, mu) - rf) / Math.sqrt(portVar(w, cov));
    if (sh > bestS) { bestS = sh; best = w; }
  }
  return best && bestS > 0 ? best : null;
}

/** The efficient (upper) part of the long-only frontier: n portfolios from the minimum-variance one to the best single asset. */
export function frontier(mu, cov, n = 40) {
  const gmv = minVariance(mu, cov);
  const lo = portRet(gmv, mu), hi = Math.max(...mu);
  const pts = [];
  for (let k = 0; k < n; k++) {
    const target = k === 0 ? lo : lo + ((hi - lo) * k) / (n - 1);
    const w = k === 0 ? gmv : minVariance(mu, cov, target);
    if (w) pts.push({ ret: portRet(w, mu), vol: Math.sqrt(portVar(w, cov)), w });
  }
  return { gmv, points: pts };
}
