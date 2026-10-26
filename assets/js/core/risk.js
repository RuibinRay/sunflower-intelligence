// risk.js — market risk: Value at Risk and Expected Shortfall three ways, rolling backtests (Kupiec, Christoffersen,
// Basel traffic light) and stress scenarios. Losses are positive numbers throughout.
// Checked against NumPy/SciPy (tests/make_fixtures.py).
import { mean, sd, kurtosis, sorted, quantileSorted, normQuantile, chi2PUpper, lnGamma } from './stats.js?v=18';
import { mulberry32, normalGen } from './rng.js?v=18';

const SQ2PI = Math.sqrt(2 * Math.PI);
const phi = (z) => Math.exp(-0.5 * z * z) / SQ2PI;

/**
 * Historical simulation: VaR is the (1 − c) quantile of past returns (linear interpolation, as NumPy), sign flipped;
 * ES is the average of the returns at or below that quantile. A horizon above one period uses the square-root-of-time rule.
 */
export function historical(r, c, h = 1) {
  const s = sorted(r), q = quantileSorted(s, 1 - c);
  let sum = 0, k = 0; for (const v of s) { if (v > q) break; sum += v; k++; }
  const scale = Math.sqrt(h);
  return { var: -q * scale, es: -(sum / k) * scale, tail: k };
}

/** Variance–covariance (normal) VaR and ES from the sample mean and standard deviation, over h periods. */
export function parametric(r, c, h = 1) {
  const mu = mean(r) * h, sig = sd(r) * Math.sqrt(h), z = normQuantile(1 - c);
  return { var: -(mu + sig * z), es: -(mu - (sig * phi(z)) / (1 - c)), mu, sigma: sig };
}

/** Gamma(shape, 1) draws by Marsaglia and Tsang (2000). */
function gammaGen(rand, normal) {
  return function g(shape) {
    if (shape < 1) return g(shape + 1) * rand() ** (1 / shape);
    const d = shape - 1 / 3, cc = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x, v; do { x = normal(); v = 1 + cc * x; } while (v <= 0);
      v = v * v * v; const u = rand();
      if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  };
}

/** Degrees of freedom for a Student-t with the sample's excess kurtosis (method of moments: κ = 6 / (ν − 4)). */
export function tDegrees(r) { const k = kurtosis(r); return k > 0.03 ? Math.min(200, Math.max(4.2, 4 + 6 / k)) : 200; }

/**
 * Monte Carlo: draw one-period returns from a Student-t with the sample's mean, standard deviation and fat tails,
 * compound h of them, and read VaR and ES off the simulated outcomes.
 */
export function monteCarlo(r, c, h = 1, { draws = 20000, seed = 1888 } = {}) {
  const rand = mulberry32(seed), normal = normalGen(rand), gamma = gammaGen(rand, () => normal());
  const mu = mean(r), sig = sd(r), nu = tDegrees(r), scale = sig * Math.sqrt((nu - 2) / nu);
  const out = new Float64Array(draws);
  for (let i = 0; i < draws; i++) {
    let g = 1;
    for (let k = 0; k < h; k++) { const t = normal() / Math.sqrt((2 * gamma(nu / 2)) / nu); g *= 1 + mu + scale * t; }
    out[i] = g - 1;
  }
  out.sort();
  const q = quantileSorted(out, 1 - c);
  let sum = 0, k = 0; for (const v of out) { if (v > q) break; sum += v; k++; }
  return { var: -q, es: -(sum / k), nu, sims: out };
}

/** EWMA (RiskMetrics) volatility forecast for the next period from returns up to now; λ = 0.94 for daily data. */
export function ewmaSigma(r, lambda = 0.94, seedVar = null) {
  let v = seedVar ?? sd(r.slice(0, Math.min(r.length, 30))) ** 2;
  for (const x of r) v = lambda * v + (1 - lambda) * x * x;
  return Math.sqrt(v);
}

/**
 * Rolling one-step-ahead backtest. method: 'historical' | 'normal' | 'ewma'. Each forecast uses only the `window`
 * returns before that day. Returns the VaR forecasts (as positive losses) and which days broke them.
 */
export function backtest(r, c, { method = 'historical', window = 250, lambda = 0.94 } = {}) {
  const z = normQuantile(1 - c), fc = [], hit = [], at = [];
  let v = null, win = null;
  for (let t = window; t < r.length; t++) {
    const past = method === 'normal' ? r.slice(t - window, t) : null;
    let VaR;
    if (method === 'historical') {
      // keep the window sorted as it slides: drop the oldest return, insert the newest (binary search)
      if (!win) win = Array.from(sorted(r.slice(t - window, t)));
      else { win.splice(lowerBound(win, r[t - window - 1]), 1); win.splice(lowerBound(win, r[t - 1]), 0, r[t - 1]); }
      VaR = -quantileSorted(win, 1 - c);
    } else if (method === 'normal') VaR = -(mean(past) + sd(past) * z);
    else {
      if (v == null) { v = sd(r.slice(t - window, t)) ** 2; } // start from the first window's variance, then update day by day
      else v = lambda * v + (1 - lambda) * r[t - 1] ** 2;
      VaR = -Math.sqrt(v) * z;
    }
    fc.push(VaR); hit.push(r[t] < -VaR); at.push(t);
  }
  return { var: fc, hit, at, n: fc.length, exceptions: hit.filter(Boolean).length };
}

function lowerBound(a, x) { let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; } return lo; }

const xlogy = (x, y) => (x === 0 ? 0 : x * Math.log(y));

/** Kupiec's proportion-of-failures test: is the exception rate x/n consistent with p = 1 − c? */
export function kupiec(x, n, p) {
  const phat = x / n;
  const lr = -2 * (xlogy(n - x, 1 - p) + xlogy(x, p) - xlogy(n - x, 1 - phat) - xlogy(x, phat));
  return { lr, p: chi2PUpper(lr, 1), rate: phat };
}

/** Christoffersen's independence test: do exceptions bunch together? Also the joint conditional-coverage test. */
export function christoffersen(hits, p) {
  let n00 = 0, n01 = 0, n10 = 0, n11 = 0;
  for (let t = 1; t < hits.length; t++) {
    const a = hits[t - 1], b = hits[t];
    if (!a && !b) n00++; else if (!a && b) n01++; else if (a && !b) n10++; else n11++;
  }
  const p0 = n01 / (n00 + n01 || 1), p1 = n11 / (n10 + n11 || 1), pi = (n01 + n11) / (n00 + n01 + n10 + n11);
  const lrInd = -2 * (xlogy(n00 + n10, 1 - pi) + xlogy(n01 + n11, pi) - xlogy(n00, 1 - p0) - xlogy(n01, p0) - xlogy(n10, 1 - p1) - xlogy(n11, p1));
  const x = hits.filter(Boolean).length, pof = kupiec(x, hits.length, p);
  const lrCC = pof.lr + lrInd;
  return { lrInd, pInd: chi2PUpper(lrInd, 1), lrCC, pCC: chi2PUpper(lrCC, 2), n00, n01, n10, n11, afterException: p1, afterQuiet: p0 };
}

/** Binomial P(X ≤ x). */
export function binomCdf(x, n, p) {
  let s = 0;
  for (let k = 0; k <= x; k++) s += Math.exp(lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1) + xlogy(k, p) + xlogy(n - k, 1 - p));
  return Math.min(1, s);
}
/** Basel traffic light: green while P(X ≤ x) < 95%, yellow below 99.99%, red beyond (250 days at 99%: green 0–4, yellow 5–9, red 10+). */
export function trafficLight(x, n, p) {
  const cum = binomCdf(x, n, p);
  return { zone: cum < 0.95 ? 'green' : cum < 0.9999 ? 'yellow' : 'red', cum };
}

/**
 * Stress test: revalue each position under a scenario. Bonds use duration and convexity:
 * ΔP/P ≈ −D·Δy + ½·C·Δy², with credit spreads adding to Δy for the corporate bonds.
 * book: {equity, govt:{value,duration,convexity}, corp:{value,duration,convexity}, fx, commodity}
 * shock: {equity (fraction), rates (bp), spreads (bp), fx (fraction), commodity (fraction)}
 */
export function stress(book, shock) {
  const dy = shock.rates / 10000, ds = shock.spreads / 10000;
  const bond = (b, d) => b.value * (-b.duration * d + 0.5 * b.convexity * d * d);
  const lines = [
    { key: 'equity', name: 'Shares', value: book.equity, pnl: book.equity * shock.equity },
    { key: 'govt', name: 'Government bonds', value: book.govt.value, pnl: bond(book.govt, dy) },
    { key: 'corp', name: 'Corporate bonds', value: book.corp.value, pnl: bond(book.corp, dy + ds) },
    { key: 'fx', name: 'Foreign-currency assets', value: book.fx, pnl: book.fx * shock.fx },
    { key: 'commodity', name: 'Commodities', value: book.commodity, pnl: book.commodity * shock.commodity },
  ];
  const total = lines.reduce((s, l) => s + l.pnl, 0), value = lines.reduce((s, l) => s + l.value, 0);
  return { lines, total, value, pct: total / value };
}
