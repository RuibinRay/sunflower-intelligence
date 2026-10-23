// forecast.js — Holt-Winters seasonal forecasting with prediction intervals.
//
// Additive Holt-Winters (ETS(A,A,A) in Hyndman's notation), written in error-correction form:
//   ŷ_t   = ℓ_{t−1} + b_{t−1} + s_{t−m}            e_t = y_t − ŷ_t
//   ℓ_t   = ℓ_{t−1} + b_{t−1} + α e_t
//   b_t   = b_{t−1} + α β e_t                        (β is the component-form trend weight β*)
//   s_t   = s_{t−m} + γ e_t
// which is the same recursion as the component form statsmodels' ExponentialSmoothing uses.
// A seasonal pattern that grows with the level (multiplicative) is fitted on log(y) and transformed back,
// so its forecasts are medians and its intervals stay exact under a log-normal error.
// h-step variance: σ² [1 + Σ_{j=1}^{h−1} (α + αβ j + γ·[j mod m = 0])²]  (Hyndman et al. 2008, class 1 models).

import { normQuantile } from './stats.js?v=7';

/** Starting states from the first two seasons: level and trend from the seasonal means, seasonals from detrended values. */
export function initialStates(y, m) {
  const c1 = avg(y.slice(0, m)), c2 = avg(y.slice(m, 2 * m));
  const b0 = (c2 - c1) / m;
  const mid = (m - 1) / 2;
  const l0 = c1 - b0 * (mid + 1);                 // level just before the first observation
  const s = new Float64Array(m);
  for (let i = 0; i < m; i++) s[i] = ((y[i] - (c1 + b0 * (i - mid))) + (y[i + m] - (c2 + b0 * (i - mid)))) / 2;
  const sm = avg(s); for (let i = 0; i < m; i++) s[i] -= sm;
  return { l0, b0, s0: Array.from(s) };
}

/** Run the recursion; returns one-step fitted values, errors and the final states. */
export function filter(y, m, { alpha, beta, gamma }, init) {
  const n = y.length;
  let l = init.l0, b = init.b0;
  const season = init.s0.slice();                 // season[t mod m] holds s_{t−m} before step t
  const fitted = new Float64Array(n), resid = new Float64Array(n);
  let sse = 0;
  for (let t = 0; t < n; t++) {
    const k = t % m, sPrev = season[k];
    const yhat = l + b + sPrev, e = y[t] - yhat;
    fitted[t] = yhat; resid[t] = e; sse += e * e;
    const lNew = l + b + alpha * e;
    b = b + alpha * beta * e;
    l = lNew;
    season[k] = sPrev + gamma * e;
  }
  return { fitted, resid, sse, l, b, season, n };
}

/** Point forecasts and h-step variance multipliers from the end of a filtered run. */
export function project(run, m, { alpha, beta, gamma }, h) {
  const mean = new Float64Array(h), mult = new Float64Array(h);
  let acc = 1;
  for (let j = 1; j <= h; j++) {
    mean[j - 1] = run.l + j * run.b + run.season[(run.n + j - 1) % m];
    mult[j - 1] = acc;                            // 1 + Σ_{i<j} c_i²
    const c = alpha + alpha * beta * j + (j % m === 0 ? gamma : 0);
    acc += c * c;
  }
  return { mean, mult };
}

/** Fit α, β, γ by minimising the one-step squared error (Nelder–Mead on a bounded transform). */
export function fitAdditive(y, m) {
  if (y.length < 2 * m + 2) return { error: `Holt-Winters needs at least two full seasons plus a little more: ${2 * m + 2} values for a season of ${m}, and this series has ${y.length}.` };
  const init = initialStates(y, m);
  const sig = (u) => 1 / (1 + Math.exp(-u));
  const toParams = (u) => { const alpha = 0.001 + 0.998 * sig(u[0]); return { alpha, beta: 0.001 + 0.998 * sig(u[1]), gamma: (1 - alpha) * (0.001 + 0.998 * sig(u[2])) }; };
  const obj = (u) => filter(y, m, toParams(u), init).sse;
  let best = null;
  for (const start of [[-0.85, -2.2, -2.2], [0.4, -1.4, -0.4], [1.5, -3, -1.2], [-2, -2, 0.5]]) {
    const r = nelderMead(obj, start, { iters: 600 });
    if (!best || r.f < best.f) best = r;
  }
  const params = toParams(best.x);
  const run = filter(y, m, params, init);
  const nParams = 3 + 2 + (m - 1);                // smoothing weights + starting level, trend, seasonals
  const dof = Math.max(1, y.length - nParams);
  return { params, init, run, sigma2: run.sse / dof, m, n: y.length, nParams };
}

/**
 * Forecast h steps with intervals. mode: 'additive' | 'multiplicative' (fitted on logs) | 'auto'.
 * 'auto' compares the two by one-step error on the original scale.
 */
export function holtWinters(y, m, h, { mode = 'auto', level = 0.95 } = {}) {
  if (!(m >= 2)) return { error: 'The season length has to be at least 2.' };
  if (!y.every(Number.isFinite)) return { error: 'The series has gaps. Holt-Winters needs an unbroken run of numbers.' };
  const positive = y.every((v) => v > 0);
  const z = normQuantile(1 - (1 - level) / 2);
  const build = (kind) => {
    const series = kind === 'multiplicative' ? y.map(Math.log) : y;
    const fit = fitAdditive(series, m);
    if (fit.error) return fit;
    const back = kind === 'multiplicative' ? Math.exp : (v) => v;
    const fitted = Array.from(fit.run.fitted, back);
    let se = 0, ape = 0; for (let t = m; t < y.length; t++) { se += (y[t] - fitted[t]) ** 2; if (positive) ape += Math.abs((y[t] - fitted[t]) / y[t]); }
    const pr = project(fit.run, m, fit.params, h);
    const sd = Array.from(pr.mult, (k) => Math.sqrt(fit.sigma2 * k));
    return {
      kind, params: fit.params, sigma: Math.sqrt(fit.sigma2), fitted,
      rmse: Math.sqrt(se / (y.length - m)), mape: positive ? ape / (y.length - m) : NaN,
      mean: Array.from(pr.mean, (v, i) => back(v)),
      lo: Array.from(pr.mean, (v, i) => back(v - z * sd[i])),
      hi: Array.from(pr.mean, (v, i) => back(v + z * sd[i])),
    };
  };
  const add = build('additive');
  if (add.error) return add;
  if (mode === 'additive' || !positive) return { ...add, alternative: null, reason: positive ? 'chosen' : 'non-positive' };
  const mul = build('multiplicative');
  if (mode === 'multiplicative') return { ...mul, alternative: add, reason: 'chosen' };
  return mul.rmse < add.rmse ? { ...mul, alternative: add, reason: 'auto' } : { ...add, alternative: mul, reason: 'auto' };
}

/** Hold back the last `h` values, forecast them, and compare with repeating last season (seasonal naive). */
export function backtest(y, m, h, mode) {
  const train = y.slice(0, y.length - h), test = y.slice(y.length - h);
  const res = holtWinters(train, m, h, { mode });
  if (res.error) return res;
  const naive = test.map((_, i) => train[train.length - m + (i % m)]);
  const err = (pred) => {
    let se = 0, ape = 0; const pos = test.every((v) => v > 0);
    test.forEach((v, i) => { se += (v - pred[i]) ** 2; ape += Math.abs((v - pred[i]) / v); });
    return { rmse: Math.sqrt(se / h), mape: pos ? ape / h : NaN };
  };
  const covered = test.filter((v, i) => v >= res.lo[i] && v <= res.hi[i]).length;
  return { model: err(res.mean), naive: err(naive), covered, h, kind: res.kind };
}

// ---------------------------------------------------------------- helpers
function avg(a) { let s = 0; for (const v of a) s += v; return s / a.length; }

/** Minimal Nelder–Mead simplex minimiser. */
export function nelderMead(f, x0, { iters = 500, step = 0.6, tol = 1e-10 } = {}) {
  const n = x0.length;
  let pts = [x0.slice()];
  for (let i = 0; i < n; i++) { const p = x0.slice(); p[i] += step; pts.push(p); }
  let vals = pts.map(f);
  for (let it = 0; it < iters; it++) {
    const order = vals.map((v, i) => i).sort((a, b) => vals[a] - vals[b]);
    pts = order.map((i) => pts[i]); vals = order.map((i) => vals[i]);
    if (Math.abs(vals[n] - vals[0]) <= tol * (Math.abs(vals[0]) + tol)) break;
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += pts[i][j] / n;
    const at = (t) => c.map((cj, j) => cj + t * (pts[n][j] - cj));
    const xr = at(-1), fr = f(xr);
    if (fr < vals[0]) {
      const xe = at(-2), fe = f(xe);
      if (fe < fr) { pts[n] = xe; vals[n] = fe; } else { pts[n] = xr; vals[n] = fr; }
    } else if (fr < vals[n - 1]) { pts[n] = xr; vals[n] = fr; }
    else {
      const xc = fr < vals[n] ? at(-0.5) : at(0.5), fc = f(xc);
      if (fc < Math.min(fr, vals[n])) { pts[n] = xc; vals[n] = fc; }
      else { for (let i = 1; i <= n; i++) { pts[i] = pts[i].map((v, j) => pts[0][j] + 0.5 * (v - pts[0][j])); vals[i] = f(pts[i]); } }
    }
  }
  const bi = vals.indexOf(Math.min(...vals));
  return { x: pts[bi], f: vals[bi] };
}
