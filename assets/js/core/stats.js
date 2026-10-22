// stats.js — the numerical core. Pure functions, no DOM. Tested against SciPy/statsmodels in tests/.

// ---------------------------------------------------------------- special functions
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

export function lnGamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lnGamma(1 - z);
  z -= 1;
  let x = LANCZOS[0];
  for (let i = 1; i < 9; i++) x += LANCZOS[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(x, a, b) {
  const FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 400; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-16) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a, b). */
export function betaInc(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(x, a, b) / a : 1 - bt * betacf(1 - x, b, a) / b;
}

/** Regularized lower incomplete gamma P(a, x). */
export function gammaP(a, x) {
  if (x <= 0) return 0;
  const lg = -x + a * Math.log(x) - lnGamma(a);
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 1000; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
    return sum * Math.exp(lg);
  }
  const FPMIN = 1e-300;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return 1 - Math.exp(lg) * h;
}

export function normCdf(z) {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  const p = gammaP(0.5, z * z / 2);
  return z >= 0 ? 0.5 + 0.5 * p : 0.5 - 0.5 * p;
}

/** Inverse standard normal (Acklam), refined with one Halley step. */
export function normQuantile(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425;
  let q, r, x;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const e = normCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}

/** Student t: CDF, two-sided p-value, quantile. */
export function tCdf(t, df) {
  if (!Number.isFinite(t)) return t > 0 ? 1 : 0;
  const tail = 0.5 * betaInc(df / (df + t * t), df / 2, 0.5);
  return t >= 0 ? 1 - tail : tail;
}
export const tPTwo = (t, df) => (Number.isFinite(t) ? betaInc(df / (df + t * t), df / 2, 0.5) : 0);
export function tQuantile(p, df) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  let x = normQuantile(p);
  for (let i = 0; i < 60; i++) {                       // Newton on the CDF
    const f = tCdf(x, df) - p;
    const pdf = Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log(1 + x * x / df));
    const step = f / pdf;
    x -= step;
    if (Math.abs(step) < 1e-12 * (1 + Math.abs(x))) break;
  }
  return x;
}
/** Upper-tail p-values. */
export const fPUpper = (f, d1, d2) => (f <= 0 ? 1 : betaInc(d2 / (d2 + d1 * f), d2 / 2, d1 / 2));
export const chi2PUpper = (x, k) => (x <= 0 ? 1 : 1 - gammaP(k / 2, x / 2));

// ---------------------------------------------------------------- descriptive statistics
export const finite = (arr) => arr.filter((v) => typeof v === 'number' && Number.isFinite(v));
export function sum(a) { let s = 0, c = 0; for (const v of a) { const y = v - c, t = s + y; c = (t - s) - y; s = t; } return s; }
export const mean = (a) => (a.length ? sum(a) / a.length : NaN);
export function variance(a, ddof = 1) {
  const n = a.length; if (n - ddof <= 0) return NaN;
  const m = mean(a); let s = 0; for (const v of a) s += (v - m) ** 2; return s / (n - ddof);
}
export const sd = (a, ddof = 1) => Math.sqrt(variance(a, ddof));
export function sorted(a) { return Float64Array.from(a).sort(); }
/** Quantile, linear interpolation between order statistics (NumPy default, R type 7). */
export function quantileSorted(s, q) {
  const n = s.length; if (!n) return NaN;
  const h = (n - 1) * q, lo = Math.floor(h), hi = Math.ceil(h);
  return s[lo] + (h - lo) * (s[hi] - s[lo]);
}
export const quantile = (a, q) => quantileSorted(sorted(a), q);
export const median = (a) => quantile(a, 0.5);
export function modes(a) {
  const counts = new Map(); let best = 0;
  for (const v of a) { const c = (counts.get(v) || 0) + 1; counts.set(v, c); if (c > best) best = c; }
  if (best < 2) return { values: [], count: 1 };
  return { values: [...counts].filter(([, c]) => c === best).map(([v]) => v).sort((x, y) => x - y), count: best };
}
/** Sample skewness (adjusted Fisher–Pearson, as pandas/Excel). */
export function skewness(a) {
  const n = a.length; if (n < 3) return NaN;
  const m = mean(a); let m2 = 0, m3 = 0;
  for (const v of a) { const d = v - m; m2 += d * d; m3 += d * d * d; }
  m2 /= n; m3 /= n;
  if (m2 === 0) return 0;
  return Math.sqrt(n * (n - 1)) / (n - 2) * (m3 / m2 ** 1.5);
}
/** Sample excess kurtosis (as pandas/Excel). */
export function kurtosis(a) {
  const n = a.length; if (n < 4) return NaN;
  const m = mean(a); let m2 = 0, m4 = 0;
  for (const v of a) { const d = (v - m) ** 2; m2 += d; m4 += d * d; }
  m2 /= n; m4 /= n;
  if (m2 === 0) return 0;
  const g2 = m4 / (m2 * m2) - 3;
  return ((n + 1) * g2 + 6) * (n - 1) / ((n - 2) * (n - 3));
}
export function describe(values, conf = 0.95) {
  const a = finite(values), n = a.length;
  const s = sorted(a);
  const m = mean(a), sdev = sd(a);
  const tq = n > 1 ? tQuantile(1 - (1 - conf) / 2, n - 1) : NaN;
  const half = tq * sdev / Math.sqrt(n);
  const q1 = quantileSorted(s, 0.25), q3 = quantileSorted(s, 0.75);
  return {
    n, missing: values.length - n, mean: m, median: quantileSorted(s, 0.5), mode: modes(a), sd: sdev, variance: variance(a),
    min: s[0], max: s[n - 1], q1, q3, iqr: q3 - q1, p5: quantileSorted(s, 0.05), p95: quantileSorted(s, 0.95),
    skewness: skewness(a), kurtosis: kurtosis(a), ciLow: m - half, ciHigh: m + half, conf,
  };
}
export function covariance(x, y) {
  const n = x.length; if (n < 2) return NaN;
  const mx = mean(x), my = mean(y); let s = 0;
  for (let i = 0; i < n; i++) s += (x[i] - mx) * (y[i] - my);
  return s / (n - 1);
}
/** Average ranks (ties share the mean rank), 1-based. */
export function ranks(a) {
  const idx = a.map((v, i) => i).sort((i, j) => a[i] - a[j]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i; while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k]] = avg;
    i = j + 1;
  }
  return r;
}
export function pearson(x, y) {
  const n = x.length;
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  const r = sxx === 0 || syy === 0 ? NaN : Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
  return { r, n, p: corrP(r, n) };
}
export function spearman(x, y) { const res = pearson(ranks(x), ranks(y)); return res; }
export function corrP(r, n) {
  if (!Number.isFinite(r) || n < 3) return NaN;
  if (Math.abs(r) >= 1) return 0;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  return tPTwo(t, n - 2);
}
/** Pairs where both values are present (pairwise deletion). */
export function pairwise(x, y) {
  const a = [], b = [];
  for (let i = 0; i < x.length; i++) if (Number.isFinite(x[i]) && Number.isFinite(y[i])) { a.push(x[i]); b.push(y[i]); }
  return [a, b];
}

// ---------------------------------------------------------------- linear algebra
/** Householder QR of an n×p matrix given as array of rows. Returns {R, qty, rank, pivotOk}. */
function qrSolve(X, y) {
  const n = X.length, p = X[0].length;
  const A = X.map((row) => Float64Array.from(row));
  const b = Float64Array.from(y);
  const R = Array.from({ length: p }, () => new Float64Array(p));
  const diag = new Float64Array(p);
  for (let k = 0; k < p; k++) {
    let norm = 0;
    for (let i = k; i < n; i++) norm += A[i][k] * A[i][k];
    norm = Math.sqrt(norm);
    if (norm === 0) { diag[k] = 0; continue; }
    const alpha = A[k][k] > 0 ? -norm : norm;
    const v = new Float64Array(n);
    v[k] = A[k][k] - alpha;
    for (let i = k + 1; i < n; i++) v[i] = A[i][k];
    let vnorm2 = 0; for (let i = k; i < n; i++) vnorm2 += v[i] * v[i];
    if (vnorm2 === 0) { diag[k] = alpha; continue; }
    for (let j = k; j < p; j++) {
      let s = 0; for (let i = k; i < n; i++) s += v[i] * A[i][j];
      const f = 2 * s / vnorm2; for (let i = k; i < n; i++) A[i][j] -= f * v[i];
    }
    let s = 0; for (let i = k; i < n; i++) s += v[i] * b[i];
    const f = 2 * s / vnorm2; for (let i = k; i < n; i++) b[i] -= f * v[i];
    diag[k] = A[k][k];
  }
  for (let i = 0; i < p; i++) for (let j = i; j < p; j++) R[i][j] = A[i][j];
  return { R, qty: b, diag };
}
function backSub(R, rhs) {
  const p = R.length, x = new Float64Array(p);
  for (let i = p - 1; i >= 0; i--) { let s = rhs[i]; for (let j = i + 1; j < p; j++) s -= R[i][j] * x[j]; x[i] = s / R[i][i]; }
  return x;
}
function upperInverse(R) {
  const p = R.length, inv = Array.from({ length: p }, () => new Float64Array(p));
  for (let j = 0; j < p; j++) {
    inv[j][j] = 1 / R[j][j];
    for (let i = j - 1; i >= 0; i--) { let s = 0; for (let k = i + 1; k <= j; k++) s += R[i][k] * inv[k][j]; inv[i][j] = -s / R[i][i]; }
  }
  return inv;
}

/**
 * Ordinary least squares.
 * @param {number[][]} Xcols predictor columns (without intercept)
 * @param {number[]} y response
 * @param {{intercept?: boolean, conf?: number, names?: string[]}} opts
 */
export function ols(Xcols, y, opts = {}) {
  const intercept = opts.intercept !== false, conf = opts.conf ?? 0.95;
  const n = y.length, k = Xcols.length, p = k + (intercept ? 1 : 0);
  const names = (intercept ? ['Intercept'] : []).concat(opts.names || Xcols.map((_, i) => `x${i + 1}`));
  if (n <= p) return { error: `Needs more rows than coefficients: ${n} rows for ${p} coefficients.` };
  const X = new Array(n);
  for (let i = 0; i < n; i++) { const row = intercept ? [1] : []; for (let j = 0; j < k; j++) row.push(Xcols[j][i]); X[i] = row; }
  const { R, qty, diag } = qrSolve(X, y);
  let maxDiag = 0; for (const d of diag) maxDiag = Math.max(maxDiag, Math.abs(d));
  const tol = maxDiag * 1e-10 * Math.max(n, p);
  const bad = []; diag.forEach((d, i) => { if (Math.abs(d) <= tol) bad.push(names[i]); });
  if (bad.length) return { error: `These terms are perfectly collinear with the others, so their effects can't be separated: ${bad.join(', ')}.`, collinear: bad };
  const beta = backSub(R, qty.subarray(0, p));
  const fitted = new Float64Array(n), resid = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < p; j++) s += X[i][j] * beta[j]; fitted[i] = s; resid[i] = y[i] - s; }
  let sse = 0, sae = 0; for (let i = 0; i < n; i++) { sse += resid[i] ** 2; sae += Math.abs(resid[i]); }
  const ybar = mean(y); let sst = 0; for (const v of y) sst += (v - ybar) ** 2;
  if (!intercept) { sst = 0; for (const v of y) sst += v * v; }
  const df = n - p, s2 = sse / df;
  const Rinv = upperInverse(R);
  const XtXinv = Array.from({ length: p }, () => new Float64Array(p));
  for (let i = 0; i < p; i++) for (let j = 0; j < p; j++) { let s = 0; for (let m = Math.max(i, j); m < p; m++) s += Rinv[i][m] * Rinv[j][m]; XtXinv[i][j] = s; }
  const tq = tQuantile(1 - (1 - conf) / 2, df);
  const coefs = names.map((name, j) => {
    const se = Math.sqrt(s2 * XtXinv[j][j]), t = beta[j] / se;
    return { name, estimate: beta[j], se, t, p: tPTwo(t, df), low: beta[j] - tq * se, high: beta[j] + tq * se };
  });
  const r2 = sst > 0 ? 1 - sse / sst : NaN;
  const dfModel = p - (intercept ? 1 : 0);
  const adjR2 = 1 - (1 - r2) * (n - (intercept ? 1 : 0)) / df;
  const F = dfModel > 0 ? ((sst - sse) / dfModel) / s2 : NaN;
  return {
    n, p, k, df, names, beta: Array.from(beta), coefs, fitted, resid, sse, sst, s2, sigma: Math.sqrt(s2),
    r2, adjR2, F, pF: dfModel > 0 ? fPUpper(F, dfModel, df) : NaN, dfModel,
    rmse: Math.sqrt(sse / n), mae: sae / n, XtXinv, intercept, conf, tq,
    /**
     * Heteroscedasticity-consistent (HC3) standard errors, MacKinnon & White (1985):
     * V = (X'X)⁻¹ X' diag(eᵢ² / (1 − hᵢᵢ)²) X (X'X)⁻¹. t-tests keep n − p degrees of freedom;
     * the model F becomes a robust Wald test that all slopes are zero.
     */
    robust() {
      const meat = Array.from({ length: p }, () => new Float64Array(p));
      for (let i = 0; i < n; i++) {
        const xi = X[i];
        let h = 0; for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) h += xi[a] * XtXinv[a][b] * xi[b];
        const w = resid[i] ** 2 / Math.max(1e-12, (1 - h) ** 2);
        for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) meat[a][b] += w * xi[a] * xi[b];
      }
      const V = sandwich(XtXinv, meat);
      const rc = names.map((name, j) => {
        const se = Math.sqrt(V[j][j]), t = beta[j] / se;
        return { name, estimate: beta[j], se, t, p: tPTwo(t, df), low: beta[j] - tq * se, high: beta[j] + tq * se };
      });
      let Fw = NaN, pFw = NaN;
      const off = intercept ? 1 : 0, q = p - off;
      if (q > 0) {
        const Vs = Array.from({ length: q }, (_, a) => Array.from({ length: q }, (_, b) => V[a + off][b + off]));
        const Vi = invert(Vs);
        if (Vi) {
          let w = 0; for (let a = 0; a < q; a++) for (let b = 0; b < q; b++) w += beta[a + off] * Vi[a][b] * beta[b + off];
          Fw = w / q; pFw = fPUpper(Fw, q, df);
        }
      }
      return { coefs: rc, F: Fw, pF: pFw, V };
    },
    predict(xs) {
      const row = intercept ? [1, ...xs] : [...xs];
      let yhat = 0; for (let j = 0; j < p; j++) yhat += row[j] * beta[j];
      let q = 0; for (let i = 0; i < p; i++) for (let j = 0; j < p; j++) q += row[i] * XtXinv[i][j] * row[j];
      const seMean = Math.sqrt(s2 * q), sePred = Math.sqrt(s2 * (1 + q));
      return { yhat, seMean, sePred, ciLow: yhat - tq * seMean, ciHigh: yhat + tq * seMean, piLow: yhat - tq * sePred, piHigh: yhat + tq * sePred };
    },
  };
}

function sandwich(B, M) {
  const p = B.length, T = Array.from({ length: p }, () => new Float64Array(p)), V = Array.from({ length: p }, () => new Float64Array(p));
  for (let i = 0; i < p; i++) for (let j = 0; j < p; j++) { let s = 0; for (let k = 0; k < p; k++) s += B[i][k] * M[k][j]; T[i][j] = s; }
  for (let i = 0; i < p; i++) for (let j = 0; j < p; j++) { let s = 0; for (let k = 0; k < p; k++) s += T[i][k] * B[k][j]; V[i][j] = s; }
  return V;
}
/** Gauss–Jordan inverse with partial pivoting; null if singular. */
export function invert(A) {
  const n = A.length, M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-14) return null;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c]; for (let j = 0; j < 2 * n; j++) M[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c]; if (f) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j]; }
  }
  return M.map((row) => row.slice(n));
}

/** Breusch–Pagan test, Koenker's studentized form: LM = n·R² of e² on the regressors. */
export function breuschPagan(Xcols, resid) {
  const e2 = Array.from(resid, (e) => e * e);
  const aux = ols(Xcols, e2);
  if (aux.error) return { error: aux.error };
  const lm = resid.length * aux.r2, df = Xcols.length;
  return { lm, df, p: chi2PUpper(lm, df) };
}

/** Variance inflation factor for each predictor. */
export function vif(Xcols) {
  if (Xcols.length < 2) return Xcols.map(() => 1);
  return Xcols.map((col, j) => {
    const others = Xcols.filter((_, i) => i !== j);
    const fit = ols(others, col);
    return fit.error ? Infinity : 1 / Math.max(1e-12, 1 - fit.r2);
  });
}

/** Least-squares polynomial on x scaled to [-1, 1]; returns a predictor function. */
export function polyfit(x, y, degree, ridge = 0) {
  const lo = Math.min(...x), hi = Math.max(...x);
  const mid = (lo + hi) / 2, half = (hi - lo) / 2 || 1;
  const z = x.map((v) => (v - mid) / half);
  const cols = [];
  for (let d = 1; d <= degree; d++) cols.push(z.map((v) => v ** d));
  let fit;
  if (ridge > 0) {
    // augment rows for a tiny ridge so very high degrees stay solvable on few points
    const aug = cols.map((c, j) => c.concat(cols.map((_, i) => (i === j ? Math.sqrt(ridge) : 0))));
    const yAug = y.concat(cols.map(() => 0));
    const n = yAug.length;
    const X = Array.from({ length: n }, (_, i) => [i < y.length ? 1 : 0, ...aug.map((c) => c[i])]);
    const { R, qty } = qrSolve(X, yAug);
    const beta = backSub(R, qty.subarray(0, degree + 1));
    fit = { beta: Array.from(beta) };
  } else {
    fit = ols(cols, y);
    if (fit.error) return null;
  }
  const beta = fit.beta;
  return (v) => { const t = (v - mid) / half; let s = beta[0], pw = 1; for (let d = 1; d <= degree; d++) { pw *= t; s += beta[d] * pw; } return s; };
}

export function rmse(pred, actual) { let s = 0; for (let i = 0; i < actual.length; i++) s += (pred[i] - actual[i]) ** 2; return Math.sqrt(s / actual.length); }

/** Score values 1–5 by average-rank quintile; ties share a score. `higherIsBetter=false` flips it. */
export function quintileScores(values, higherIsBetter = true) {
  const n = values.length, r = ranks(values);
  return r.map((rank) => {
    const s = Math.min(5, Math.max(1, Math.ceil((5 * rank) / n)));
    return higherIsBetter ? s : 6 - s;
  });
}

/** Histogram bins with Freedman–Diaconis width, nicely rounded. */
export function histogram(values, maxBins = 30) {
  const a = sorted(finite(values)); const n = a.length;
  if (!n) return { bins: [], width: 0 };
  const lo = a[0], hi = a[n - 1];
  if (lo === hi) return { bins: [{ x0: lo - 0.5, x1: hi + 0.5, count: n }], width: 1 };
  const iqr = quantileSorted(a, 0.75) - quantileSorted(a, 0.25);
  let w = iqr > 0 ? 2 * iqr / Math.cbrt(n) : (hi - lo) / Math.ceil(Math.log2(n) + 1);
  w = niceStep((hi - lo) / Math.min(maxBins, Math.max(5, Math.ceil((hi - lo) / w))));
  const start = Math.floor(lo / w) * w;
  const count = Math.max(1, Math.ceil((hi - start) / w + 1e-9));
  const bins = Array.from({ length: count }, (_, i) => ({ x0: start + i * w, x1: start + (i + 1) * w, count: 0 }));
  for (const v of a) { let i = Math.floor((v - start) / w); if (i >= count) i = count - 1; bins[i].count++; }
  return { bins, width: w };
}
export function niceStep(raw) {
  const e = Math.floor(Math.log10(raw)), f = raw / 10 ** e;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * 10 ** e;
}
