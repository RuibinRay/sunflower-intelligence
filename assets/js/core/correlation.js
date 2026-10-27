// correlation.js — correlation analysis for B05: covariance, Pearson, Spearman and Kendall's tau-b with their tests,
// Fisher's z interval and tests, comparing two correlations, partial correlation, correlation matrices with
// multiple-testing adjustments, power and sample size, and leave-one-out influence. Pure functions, no DOM; tested
// against SciPy and statsmodels in tests/correlation.test.mjs. Builds on core/stats.js and core/inference.js.
import { mean, ranks, pearson as pearsonBasic, ols } from './stats.js?v=22';
import { normCdf, normInv, tCdf, tInv } from './inference.js?v=22';

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/** Pairs where both values are numbers (pairwise deletion). Returns [xs, ys]. */
export function complete(x, y) {
  const a = [], b = [];
  for (let i = 0; i < x.length; i++) if (finite(x[i]) && finite(y[i])) { a.push(x[i]); b.push(y[i]); }
  return [a, b];
}

/** Sample covariance (n − 1) and population covariance (n). */
export function covariance(x, y, { population = false } = {}) {
  const [a, b] = complete(x, y), n = a.length;
  if (n < (population ? 1 : 2)) return NaN;
  const ma = mean(a), mb = mean(b);
  let s = 0; for (let i = 0; i < n; i++) s += (a[i] - ma) * (b[i] - mb);
  return s / (population ? n : n - 1);
}

/** The t statistic and two-sided (or one-sided) p-value for H0: ρ = 0. */
export function rTest(r, n, alternative = 'two-sided') {
  if (!finite(r) || n < 3) return { t: NaN, df: n - 2, p: NaN };
  const df = n - 2;
  if (Math.abs(r) >= 1) return { t: Math.sign(r) * Infinity, df, p: alternative === 'two-sided' ? 0 : (alternative === 'greater') === (r > 0) ? 0 : 1 };
  const t = r * Math.sqrt(df / (1 - r * r));
  const lower = tCdf(t, df);
  const p = alternative === 'less' ? lower : alternative === 'greater' ? 1 - lower : 2 * Math.min(lower, 1 - lower);
  return { t, df, p: Math.min(1, p) };
}

/** Pearson's r with its test and Fisher-z confidence interval. */
export function pearson(x, y, { conf = 0.95, alternative = 'two-sided' } = {}) {
  const [a, b] = complete(x, y), n = a.length;
  const { r } = pearsonBasic(a, b);
  return { r, n, r2: r * r, ...rTest(r, n, alternative), ci: fisherCI(r, n, conf) };
}

/** Spearman's ρ: Pearson's r on average ranks; p-value by the t approximation (as SciPy's spearmanr). */
export function spearman(x, y, { alternative = 'two-sided' } = {}) {
  const [a, b] = complete(x, y), n = a.length;
  const { r } = pearsonBasic(ranks(a), ranks(b));
  return { rho: r, n, ...rTest(r, n, alternative) };
}

/** Kendall's tau-b with ties, and its asymptotic two-sided p-value (SciPy's kendalltau with method='asymptotic'). */
export function kendall(x, y) {
  const [a, b] = complete(x, y), n = a.length;
  let concordant = 0, discordant = 0, tx = 0, ty = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const dx = Math.sign(a[i] - a[j]), dy = Math.sign(b[i] - b[j]);
    if (dx === 0 && dy === 0) continue;
    if (dx === 0) tx++; else if (dy === 0) ty++; else if (dx === dy) concordant++; else discordant++;
  }
  const n0 = n * (n - 1) / 2;
  // ties in each variable, for tau-b's denominator and the variance
  const tieSums = (v) => { const c = new Map(); for (const u of v) c.set(u, (c.get(u) || 0) + 1); let t1 = 0, v1 = 0, v2 = 0; for (const k of c.values()) { t1 += k * (k - 1) / 2; v1 += k * (k - 1) * (2 * k + 5); v2 += k * (k - 1) * (k - 2); } return { t1, v1, v2, k: [...c.values()] }; };
  const X = tieSums(a), Y = tieSums(b);
  const S = concordant - discordant;
  const tau = S / Math.sqrt((n0 - X.t1) * (n0 - Y.t1));
  const varS = (n * (n - 1) * (2 * n + 5) - X.v1 - Y.v1) / 18
    + (X.k.reduce((s, k) => s + k * (k - 1), 0) * Y.k.reduce((s, k) => s + k * (k - 1), 0)) / (2 * n * (n - 1))
    + (X.v2 * Y.v2) / (9 * n * (n - 1) * (n - 2));
  const z = S / Math.sqrt(varS);
  return { tau, n, concordant, discordant, z, p: Math.min(1, 2 * (1 - normCdf(Math.abs(z)))) };
}

/** Fisher's z = atanh(r) and its standard error 1/√(n − 3). */
export const fisherZ = (r) => Math.atanh(r);
/** A confidence interval for ρ by Fisher's z (SciPy's pearsonr(...).confidence_interval()). */
export function fisherCI(r, n, conf = 0.95) {
  if (!finite(r) || n < 4) return [NaN, NaN];
  if (Math.abs(r) >= 1) return [r, r];
  const z = Math.atanh(r), se = 1 / Math.sqrt(n - 3), q = normInv(1 - (1 - conf) / 2);
  return [Math.tanh(z - q * se), Math.tanh(z + q * se)];
}
/** Test H0: ρ = ρ0 by Fisher's z (two-sided unless stated). */
export function fisherTest(r, n, rho0 = 0, alternative = 'two-sided') {
  const z = (Math.atanh(r) - Math.atanh(rho0)) * Math.sqrt(n - 3);
  const lower = normCdf(z);
  const p = alternative === 'less' ? lower : alternative === 'greater' ? 1 - lower : 2 * Math.min(lower, 1 - lower);
  return { z, p };
}
/** Compare correlations from two independent samples: z = (z1 − z2) / √(1/(n1−3) + 1/(n2−3)). */
export function compareIndependent(r1, n1, r2, n2) {
  const se = Math.sqrt(1 / (n1 - 3) + 1 / (n2 - 3));
  const z = (Math.atanh(r1) - Math.atanh(r2)) / se;
  return { z, se, p: 2 * (1 - normCdf(Math.abs(z))) };
}

/** Residuals of y regressed on the control columns (with an intercept). */
function residuals(y, controls) {
  const fit = ols(controls, y);
  return y.map((v, i) => v - fit.fitted[i]);
}
/** Partial correlation of x and y holding the control variables fixed (Pearson on residuals), with its t test on
 *  n − 2 − k degrees of freedom. Rows with any missing value are dropped. */
export function partial(x, y, controls) {
  const keep = x.map((_, i) => finite(x[i]) && finite(y[i]) && controls.every((c) => finite(c[i])));
  const X = x.filter((_, i) => keep[i]), Y = y.filter((_, i) => keep[i]), Cs = controls.map((c) => c.filter((_, i) => keep[i]));
  const n = X.length, k = Cs.length;
  const { r } = pearsonBasic(residuals(X, Cs), residuals(Y, Cs));
  const df = n - 2 - k;
  const t = r * Math.sqrt(df / (1 - r * r));
  return { r, n, k, df, t, p: 2 * (1 - tCdf(Math.abs(t), df)) };
}
/** First-order partial correlation from the three pairwise correlations (the textbook formula). */
export const partialFromR = (rxy, rxz, ryz) => (rxy - rxz * ryz) / Math.sqrt((1 - rxz * rxz) * (1 - ryz * ryz));

/** Multiple-testing adjustments of p-values (statsmodels' multipletests): 'bonferroni', 'holm', 'fdr_bh'. */
export function adjust(ps, method = 'holm') {
  const m = ps.length, order = ps.map((p, i) => i).sort((i, j) => ps[i] - ps[j]), out = new Array(m);
  if (method === 'bonferroni') return ps.map((p) => Math.min(1, p * m));
  if (method === 'holm') {
    let run = 0;
    order.forEach((i, k) => { run = Math.max(run, Math.min(1, (m - k) * ps[i])); out[i] = run; });
    return out;
  }
  if (method === 'fdr_bh') {
    let run = 1;
    for (let k = m - 1; k >= 0; k--) { const i = order[k]; run = Math.min(run, ps[i] * m / (k + 1)); out[i] = Math.min(1, run); }
    return out;
  }
  throw new Error(`adjust: unknown method ${method}`);
}

/** A correlation matrix over named columns: r (or ρ), n and p for every pair (pairwise deletion), and the p-values of
 *  the m(m−1)/2 distinct pairs adjusted for multiple testing. */
export function matrix(columns, { method = 'pearson', adjustMethod = null } = {}) {
  const names = Object.keys(columns), m = names.length;
  const r = names.map(() => new Array(m).fill(1)), p = names.map(() => new Array(m).fill(0)), n = names.map(() => new Array(m).fill(0));
  const pairs = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
    if (j < i) continue;
    const res = method === 'spearman' ? spearman(columns[names[i]], columns[names[j]]) : pearson(columns[names[i]], columns[names[j]]);
    const val = method === 'spearman' ? res.rho : res.r;
    r[i][j] = r[j][i] = i === j ? 1 : val;
    p[i][j] = p[j][i] = i === j ? 0 : res.p;
    n[i][j] = n[j][i] = res.n;
    if (i < j) pairs.push([i, j]);
  }
  let pAdj = null;
  if (adjustMethod) {
    const adj = adjust(pairs.map(([i, j]) => p[i][j]), adjustMethod);
    pAdj = names.map(() => new Array(m).fill(0));
    pairs.forEach(([i, j], k) => { pAdj[i][j] = pAdj[j][i] = adj[k]; });
  }
  return { names, r, p, n, pAdj, pairs: pairs.length };
}

/** Power of the two-sided test of ρ = 0 at true correlation rho with n pairs (Fisher-z normal approximation). */
export function power(rho, n, alpha = 0.05) {
  const d = Math.atanh(Math.abs(rho)) * Math.sqrt(n - 3), q = normInv(1 - alpha / 2);
  return normCdf(d - q) + normCdf(-d - q);
}
/** Pairs needed to detect correlation rho with the given power (two-sided, Fisher z): n = ((z₁₋α/₂ + z_power)/atanh ρ)² + 3. */
export function sampleSize(rho, { alpha = 0.05, power: pw = 0.8 } = {}) {
  const n = ((normInv(1 - alpha / 2) + normInv(pw)) / Math.atanh(Math.abs(rho))) ** 2 + 3;
  return Math.ceil(n);
}
/** The smallest |r| that is significant at alpha with n pairs (two-sided t test). */
export function criticalR(n, alpha = 0.05) {
  const t = tInv(1 - alpha / 2, n - 2);
  return t / Math.sqrt(n - 2 + t * t);
}

/** Leave-one-out influence: r without each point, and the point whose removal changes r most. */
export function influence(x, y) {
  const [a, b] = complete(x, y), n = a.length, full = pearsonBasic(a, b).r;
  const without = a.map((_, i) => pearsonBasic(a.filter((_, j) => j !== i), b.filter((_, j) => j !== i)).r);
  let most = 0;
  without.forEach((r, i) => { if (Math.abs(r - full) > Math.abs(without[most] - full)) most = i; });
  return { r: full, without, most, change: without[most] - full };
}

/** Standardise to z-scores (sample SD). */
export function zScores(a) {
  const m = mean(a), s = Math.sqrt(a.reduce((t, v) => t + (v - m) ** 2, 0) / (a.length - 1));
  return a.map((v) => (v - m) / s);
}
/** r as the average product of z-scores: Σ z_x z_y / (n − 1). */
export function rFromZ(x, y) {
  const zx = zScores(x), zy = zScores(y);
  return zx.reduce((s, v, i) => s + v * zy[i], 0) / (x.length - 1);
}
