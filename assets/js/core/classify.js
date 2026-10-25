// classify.js — logistic regression (with odds ratios and diagnostics) and k-means clustering.
import { normCdf, normQuantile, invert, mean, sd } from './stats.js?v=15';
import { mulberry32 } from './rng.js?v=15';

// ================================================================ logistic regression
/**
 * Logistic regression by iteratively reweighted least squares (Newton–Raphson on the log-likelihood).
 * Xcols: predictor columns; y: 0/1. Returns coefficients with Wald standard errors, z, p, 95% CI and odds ratios.
 */
export function logit(Xcols, y, { names, maxIter = 50, tol = 1e-10 } = {}) {
  const n = y.length, k = Xcols.length, p = k + 1;
  if (!y.every((v) => v === 0 || v === 1)) return { error: 'The outcome has to be coded 0 and 1.' };
  const pos = y.reduce((a, v) => a + v, 0);
  if (pos === 0 || pos === n) return { error: 'The outcome never varies: every row is the same class.' };
  if (n <= p) return { error: `Needs more rows than coefficients: ${n} rows for ${p} coefficients.` };
  const X = Array.from({ length: n }, (_, i) => [1, ...Xcols.map((c) => c[i])]);
  let beta = new Array(p).fill(0);
  beta[0] = Math.log(pos / (n - pos));
  let ll = -Infinity, cov = null, converged = false, iter = 0;
  for (; iter < maxIter; iter++) {
    const H = Array.from({ length: p }, () => new Array(p).fill(0)), g = new Array(p).fill(0);
    let llNew = 0;
    for (let i = 0; i < n; i++) {
      let eta = 0; for (let j = 0; j < p; j++) eta += X[i][j] * beta[j];
      const mu = 1 / (1 + Math.exp(-eta)), w = Math.max(mu * (1 - mu), 1e-12);
      llNew += y[i] ? -Math.log1p(Math.exp(-eta)) : -Math.log1p(Math.exp(eta));
      for (let a = 0; a < p; a++) { g[a] += (y[i] - mu) * X[i][a]; for (let b = 0; b < p; b++) H[a][b] += w * X[i][a] * X[i][b]; }
    }
    cov = invert(H);
    if (!cov) return { error: 'Some predictors are perfectly collinear, so their effects can’t be separated.' };
    const step = cov.map((row) => row.reduce((s, v, j) => s + v * g[j], 0));
    beta = beta.map((b, j) => b + step[j]);
    if (Math.abs(llNew - ll) < tol * (1 + Math.abs(llNew))) { ll = llNew; converged = true; break; }
    ll = llNew;
  }
  // final pass at the solution for log-likelihood, fitted probabilities and covariance
  const H = Array.from({ length: p }, () => new Array(p).fill(0));
  const prob = new Float64Array(n); ll = 0;
  for (let i = 0; i < n; i++) {
    let eta = 0; for (let j = 0; j < p; j++) eta += X[i][j] * beta[j];
    const mu = 1 / (1 + Math.exp(-eta)); prob[i] = mu;
    ll += y[i] ? -Math.log1p(Math.exp(-eta)) : -Math.log1p(Math.exp(eta));
    const w = Math.max(mu * (1 - mu), 1e-12);
    for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) H[a][b] += w * X[i][a] * X[i][b];
  }
  cov = invert(H);
  const separated = !converged || beta.some((b) => Math.abs(b) > 25);
  const z975 = normQuantile(0.975);
  const nm = ['Intercept', ...(names || Xcols.map((_, j) => `x${j + 1}`))];
  const coefs = beta.map((b, j) => {
    const se = Math.sqrt(cov[j][j]), z = b / se;
    return { name: nm[j], estimate: b, se, z, p: 2 * (1 - normCdf(Math.abs(z))), low: b - z975 * se, high: b + z975 * se, or: Math.exp(b), orLow: Math.exp(b - z975 * se), orHigh: Math.exp(b + z975 * se) };
  });
  const ybar = pos / n, ll0 = n * (ybar * Math.log(ybar) + (1 - ybar) * Math.log(1 - ybar));
  return {
    n, p, coefs, beta, prob, ll, ll0, pseudoR2: 1 - ll / ll0, lrStat: 2 * (ll - ll0), iter, converged, separated, base: ybar,
    predict(xs) { let eta = beta[0]; xs.forEach((v, j) => { eta += beta[j + 1] * v; }); return 1 / (1 + Math.exp(-eta)); },
  };
}

/** Confusion counts and rates at a probability threshold. */
export function confusion(y, prob, threshold = 0.5) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  y.forEach((v, i) => { const hat = prob[i] >= threshold ? 1 : 0; if (hat && v) tp++; else if (hat && !v) fp++; else if (!hat && v) fn++; else tn++; });
  const n = y.length;
  return { tp, fp, tn, fn, accuracy: (tp + tn) / n, precision: tp + fp ? tp / (tp + fp) : NaN, recall: tp + fn ? tp / (tp + fn) : NaN, specificity: tn + fp ? tn / (tn + fp) : NaN };
}

/** ROC curve points (false-positive rate, true-positive rate) and the area under it (ties handled by averaging). */
export function roc(y, score) {
  const idx = Array.from(y.keys()).sort((a, b) => score[b] - score[a]);
  const P = y.reduce((a, v) => a + v, 0), N = y.length - P;
  const pts = [{ fpr: 0, tpr: 0, t: Infinity }];
  let tp = 0, fp = 0;
  for (let k = 0; k < idx.length; k++) {
    const i = idx[k];
    if (y[i]) tp++; else fp++;
    if (k === idx.length - 1 || score[idx[k + 1]] !== score[i]) pts.push({ fpr: fp / N, tpr: tp / P, t: score[i] });
  }
  let auc = 0; for (let k = 1; k < pts.length; k++) auc += (pts[k].fpr - pts[k - 1].fpr) * (pts[k].tpr + pts[k - 1].tpr) / 2;
  return { pts, auc };
}

// ================================================================ k-means
/** Standardise columns to mean 0, sd 1 (returns the matrix by rows and the scaling used). */
export function standardise(cols) {
  const mu = cols.map(mean), s = cols.map((c) => sd(c) || 1);
  const n = cols[0].length;
  return { rows: Array.from({ length: n }, (_, i) => cols.map((c, j) => (c[i] - mu[j]) / s[j])), mu, s };
}
const d2 = (a, b) => { let s = 0; for (let j = 0; j < a.length; j++) s += (a[j] - b[j]) ** 2; return s; };

/** k-means with k-means++ starts and several restarts; seeded so results repeat. */
export function kmeans(rows, k, { restarts = 12, maxIter = 300, seed = 1888 } = {}) {
  const n = rows.length, dim = rows[0].length;
  if (k < 1 || k > n) return { error: 'Choose between 1 cluster and as many clusters as rows.' };
  const rand = mulberry32(seed);
  let best = null;
  for (let rs = 0; rs < restarts; rs++) {
    // k-means++ seeding
    const centres = [rows[Math.floor(rand() * n)].slice()];
    const dist = rows.map((r) => d2(r, centres[0]));
    while (centres.length < k) {
      const tot = dist.reduce((a, v) => a + v, 0);
      let u = rand() * tot, pick = n - 1;
      for (let i = 0; i < n; i++) { u -= dist[i]; if (u <= 0) { pick = i; break; } }
      centres.push(rows[pick].slice());
      rows.forEach((r, i) => { dist[i] = Math.min(dist[i], d2(r, centres[centres.length - 1])); });
    }
    const labels = new Int32Array(n).fill(-1);
    for (let it = 0; it < maxIter; it++) {
      let moved = false;
      for (let i = 0; i < n; i++) {
        let bi = 0, bd = Infinity;
        for (let c = 0; c < k; c++) { const dd = d2(rows[i], centres[c]); if (dd < bd) { bd = dd; bi = c; } }
        if (labels[i] !== bi) { labels[i] = bi; moved = true; }
      }
      const sums = Array.from({ length: k }, () => new Array(dim).fill(0)), counts = new Array(k).fill(0);
      rows.forEach((r, i) => { counts[labels[i]]++; r.forEach((v, j) => { sums[labels[i]][j] += v; }); });
      for (let c = 0; c < k; c++) {
        if (counts[c]) centres[c] = sums[c].map((v) => v / counts[c]);
        else { // an empty cluster takes the point farthest from its centre
          let far = 0, fd = -1; rows.forEach((r, i) => { const dd = d2(r, centres[labels[i]]); if (dd > fd) { fd = dd; far = i; } });
          centres[c] = rows[far].slice(); labels[far] = c; moved = true;
        }
      }
      if (!moved) break;
    }
    const inertia = rows.reduce((a, r, i) => a + d2(r, centres[labels[i]]), 0);
    if (!best || inertia < best.inertia - 1e-12) best = { labels: Array.from(labels), centres: centres.map((c) => c.slice()), inertia };
  }
  // order clusters by size, largest first, so labels are stable
  const sizes = Array.from({ length: k }, (_, c) => best.labels.filter((l) => l === c).length);
  const order = sizes.map((s, c) => c).sort((a, b) => sizes[b] - sizes[a]);
  const remap = new Array(k); order.forEach((c, i) => { remap[c] = i; });
  return { labels: best.labels.map((l) => remap[l]), centres: order.map((c) => best.centres[c]), sizes: order.map((c) => sizes[c]), inertia: best.inertia, k };
}

/** Mean silhouette width (Rousseeuw 1987): how much closer each point is to its own cluster than to the next. */
export function silhouette(rows, labels) {
  const n = rows.length, k = Math.max(...labels) + 1;
  if (k < 2) return NaN;
  const D = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const v = Math.sqrt(d2(rows[i], rows[j])); D[i][j] = v; D[j][i] = v; }
  const counts = new Array(k).fill(0); labels.forEach((l) => counts[l]++);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const sums = new Array(k).fill(0);
    for (let j = 0; j < n; j++) if (j !== i) sums[labels[j]] += D[i][j];
    const own = labels[i];
    if (counts[own] <= 1) continue;                       // a singleton scores 0
    const a = sums[own] / (counts[own] - 1);
    let b = Infinity; for (let c = 0; c < k; c++) if (c !== own && counts[c]) b = Math.min(b, sums[c] / counts[c]);
    total += (b - a) / Math.max(a, b);
  }
  return total / n;
}
