// regression.js — B06 Regression Analysis: least squares with the diagnostics a course needs (leverage, studentized
// residuals, Cook's distance, DFFITS, Durbin–Watson, normal scores), nested-model F tests, information criteria,
// dummy and interaction columns, standardized slopes, and logistic regression with its likelihood-ratio test and
// predicted probabilities. Built on stats.js ols() (QR least squares, HC3) and classify.js logit() (IRLS); each
// function here is tested against statsmodels in tests/regression.test.mjs.
import { ols, breuschPagan, vif, invert, mean, normQuantile, normCdf, tQuantile, fPUpper, chi2PUpper, tPTwo } from './stats.js?v=24';
import { logit } from './classify.js?v=24';

export { breuschPagan, vif };

/** Least squares on named columns: fit(y, { 'High (°F)': [...], … }) → stats.js ols() plus logLik, AIC and BIC
 *  (Gaussian likelihood with σ² = SSE/n, as statsmodels reports them; k counts the intercept). */
export function fit(y, xs, opts = {}) {
  const names = Object.keys(xs), cols = names.map((n) => xs[n]);
  const f = ols(cols, y, { ...opts, names });
  if (f.error) return f;
  const n = f.n, ll = -n / 2 * (Math.log(2 * Math.PI) + Math.log(f.sse / n) + 1);
  return Object.assign(f, { cols, y, logLik: ll, aic: -2 * ll + 2 * f.p, bic: -2 * ll + Math.log(n) * f.p });
}

/** Leverage (hat values), internally and externally studentized residuals, Cook's distance and DFFITS for an OLS
 *  fit of y on the columns (with an intercept). */
export function influence(Xcols, y) {
  const f = ols(Xcols, y);
  if (f.error) return f;
  const n = f.n, p = f.p, X = Array.from({ length: n }, (_, i) => [1, ...Xcols.map((c) => c[i])]);
  const h = X.map((row) => { let s = 0; for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) s += row[a] * f.XtXinv[a][b] * row[b]; return s; });
  const internal = Array.from(f.resid, (e, i) => e / Math.sqrt(f.s2 * (1 - h[i])));
  const external = internal.map((r) => r * Math.sqrt((n - p - 1) / (n - p - r * r)));
  const cooks = internal.map((r, i) => (r * r / p) * (h[i] / (1 - h[i])));
  const dffits = external.map((t, i) => t * Math.sqrt(h[i] / (1 - h[i])));
  return { n, p, hat: h, internal, external, cooks, dffits, resid: Array.from(f.resid), fitted: Array.from(f.fitted),
    /** Rules of thumb (conventions, not tests): leverage above 2p/n, |studentized| above 2 or 3, Cook's D above 4/n or 1. */
    flags: { leverage: 2 * p / n, cooks: 4 / n } };
}

/** F test of a reduced model nested in a full one (both fitted on the same rows): F = ((SSE_r − SSE_f)/q) / (SSE_f/df_f). */
export function nestedF(full, reduced) {
  const q = reduced.df - full.df;
  if (q <= 0) return { error: 'The reduced model must have fewer coefficients than the full one.' };
  const F = ((reduced.sse - full.sse) / q) / (full.sse / full.df);
  return { F, df1: q, df2: full.df, p: fPUpper(F, q, full.df) };
}

/** Durbin–Watson statistic of residuals in time order: Σ(eₜ − eₜ₋₁)² / Σeₜ². Near 2: no first-order autocorrelation. */
export function durbinWatson(resid) {
  let num = 0, den = 0;
  for (let i = 0; i < resid.length; i++) { den += resid[i] ** 2; if (i) num += (resid[i] - resid[i - 1]) ** 2; }
  return num / den;
}

/** Lag-1 autocorrelation of a series (about its mean). */
export function lag1(a) {
  const m = mean(a); let num = 0, den = 0;
  for (let i = 0; i < a.length; i++) { den += (a[i] - m) ** 2; if (i) num += (a[i] - m) * (a[i - 1] - m); }
  return num / den;
}

/** Normal scores for a Q–Q plot: the sorted values against Blom's plotting positions Φ⁻¹((i − 3/8)/(n + 1/4)). */
export function normalScores(values) {
  const s = [...values].sort((a, b) => a - b), n = s.length;
  return s.map((v, i) => ({ theoretical: normQuantile((i + 1 - 0.375) / (n + 0.25)), sample: v }));
}

/** Slopes in standard-deviation units: bⱼ × s(xⱼ) / s(y). */
export function standardized(fitted, Xcols, y) {
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((t, v) => t + (v - m) ** 2, 0) / (a.length - 1)); };
  const off = fitted.intercept ? 1 : 0;
  return Xcols.map((c, j) => fitted.beta[j + off] * sd(c) / sd(y));
}

/** Dummy (indicator) columns for a categorical variable, leaving out the reference level:
 *  dummies(['Mon', 'Sat', …], { reference: 'Mon', name: 'Day' }) → { 'Day: Sat': [0, 1, …], … }. */
export function dummies(values, { reference = null, name = '', levels = null } = {}) {
  const lv = levels || [...new Set(values)];
  const ref = reference ?? lv[0];
  return Object.fromEntries(lv.filter((l) => l !== ref).map((l) => [`${name ? `${name}: ` : ''}${l}`, values.map((v) => (v === l ? 1 : 0))]));
}

/** The product column for an interaction term. */
export const interaction = (a, b) => a.map((v, i) => v * b[i]);

/** Logistic regression on named columns with the likelihood-ratio test against the intercept-only model, McFadden's
 *  pseudo-R², AIC and BIC, and predicted probabilities with a 95% interval (formed on the log-odds scale). */
export function logistic(y, xs, opts = {}) {
  const names = Object.keys(xs), cols = names.map((n) => xs[n]);
  const f = logit(cols, y, { ...opts, names });
  if (f.error) return f;
  const df = f.p - 1, lr = 2 * (f.ll - f.ll0);
  // covariance of the coefficients (inverse information), recomputed at the solution
  const X = Array.from({ length: f.n }, (_, i) => [1, ...cols.map((c) => c[i])]);
  const H = Array.from({ length: f.p }, () => new Array(f.p).fill(0));
  for (let i = 0; i < f.n; i++) { const w = f.prob[i] * (1 - f.prob[i]); for (let a = 0; a < f.p; a++) for (let b = 0; b < f.p; b++) H[a][b] += w * X[i][a] * X[i][b]; }
  const cov = invert(H);
  const z = normQuantile(0.975);
  return Object.assign(f, {
    names, cols, y, cov, lr, lrDf: df, lrP: chi2PUpper(lr, df), mcfadden: 1 - f.ll / f.ll0,
    aic: -2 * f.ll + 2 * f.p, bic: -2 * f.ll + Math.log(f.n) * f.p,
    /** Predicted probability for one case (values in the order of the columns), with a 95% interval. */
    predictCI(values) {
      const row = [1, ...values];
      let eta = 0; row.forEach((v, j) => { eta += v * f.beta[j]; });
      let q = 0; for (let a = 0; a < f.p; a++) for (let b = 0; b < f.p; b++) q += row[a] * cov[a][b] * row[b];
      const se = Math.sqrt(q), sig = (e) => 1 / (1 + Math.exp(-e));
      return { eta, se, p: sig(eta), low: sig(eta - z * se), high: sig(eta + z * se) };
    },
  });
}

/** Likelihood-ratio test of a reduced logistic model nested in a full one: 2(ℓ_full − ℓ_reduced) on the difference in
 *  coefficients. */
export function lrTest(full, reduced) {
  const df = full.p - reduced.p, stat = 2 * (full.ll - reduced.ll);
  return { stat, df, p: chi2PUpper(stat, df) };
}

/** Two-sided p-value for a t statistic, and the t and normal quantiles, for lessons' checks. */
export { tPTwo, tQuantile, normCdf, normQuantile };
