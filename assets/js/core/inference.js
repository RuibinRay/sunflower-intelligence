// inference.js — probability distributions, confidence intervals and hypothesis tests for B04 Descriptive and
// Inferential Statistics and the spreadsheet engine's statistical functions. Pure functions, no DOM. Tested against
// SciPy and statsmodels (tests/inference.test.mjs, fixtures from tests/make_fixtures_infer.py).
//
// Conventions: `alternative` is 'two-sided' (default), 'less' or 'greater', as in SciPy; a sample is an array of
// numbers or a summary { n, mean, sd }; variances and standard deviations are sample ones (n − 1) unless named
// otherwise; every p-value is computed from the tail it names, never as 1 − (a value near 1), so small p-values keep
// their precision.
import { lnGamma, betaInc, gammaP, tQuantile, normQuantile, mean as meanOf, variance as varOf, sum as sumOf } from './stats.js?v=13';

// ---------------------------------------------------------------- special functions with accurate upper tails
/** Regularized upper incomplete gamma Q(a, x) = 1 − P(a, x), computed directly in the upper tail. */
export function gammaQ(a, x) {
  if (x <= 0) return 1;
  if (x < a + 1) return 1 - gammaP(a, x);
  const lg = -x + a * Math.log(x) - lnGamma(a);
  const FPMIN = 1e-300;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i < 2000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return Math.exp(lg) * h;
}
export const lnFact = (n) => lnGamma(n + 1);
/** n! for whole n ≥ 0 (exact up to 170!, Infinity beyond, as a double can hold). */
export function factorial(n) {
  if (!(n >= 0)) return NaN;
  let f = 1; for (let i = 2; i <= n; i++) f *= i;
  return f;
}
/** Combinations C(n, k) and permutations P(n, k), rounded to whole numbers where a double holds them exactly. */
export function combin(n, k) {
  if (!(n >= 0 && k >= 0 && k <= n)) return NaN;
  k = Math.min(k, n - k);
  let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return c < 2 ** 53 ? Math.round(c) : c;
}
export function permut(n, k) {
  if (!(n >= 0 && k >= 0 && k <= n)) return NaN;
  let p = 1; for (let i = 0; i < k; i++) p *= n - i;
  return p;
}

// ---------------------------------------------------------------- the normal distribution
const SQRT2PI = Math.sqrt(2 * Math.PI);
export const normPdf = (z) => Math.exp(-0.5 * z * z) / SQRT2PI;
/** Standard normal CDF Φ(z), with each tail from the upper incomplete gamma so far tails stay accurate. */
export function normCdf(z) {
  if (Number.isNaN(z)) return NaN;
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  const q = 0.5 * gammaQ(0.5, (z * z) / 2);          // P(Z > |z|)
  return z >= 0 ? 1 - q : q;
}
export const normSf = (z) => normCdf(-z);
export const normInv = (p) => normQuantile(p);
/** N(mean, sd): density, CDF and quantile. */
export const normal = {
  pdf: (x, mu = 0, sd = 1) => normPdf((x - mu) / sd) / sd,
  cdf: (x, mu = 0, sd = 1) => normCdf((x - mu) / sd),
  sf: (x, mu = 0, sd = 1) => normCdf((mu - x) / sd),
  inv: (p, mu = 0, sd = 1) => mu + sd * normQuantile(p),
};

// ---------------------------------------------------------------- Student t
export const tPdf = (t, df) => Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
/** Upper tail P(T > t). */
export function tSf(t, df) {
  if (Number.isNaN(t)) return NaN;
  if (!Number.isFinite(t)) return t > 0 ? 0 : 1;
  const half = 0.5 * betaInc(df / (df + t * t), df / 2, 0.5);
  return t >= 0 ? half : 1 - half;
}
export const tCdf = (t, df) => tSf(-t, df);
export const tInv = (p, df) => tQuantile(p, df);

// ---------------------------------------------------------------- chi-square and F
export function chi2Pdf(x, k) {
  if (x < 0) return 0;
  if (x === 0) return k === 2 ? 0.5 : k < 2 ? Infinity : 0;
  return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - lnGamma(k / 2));
}
export const chi2Cdf = (x, k) => (x <= 0 ? 0 : gammaP(k / 2, x / 2));
export const chi2Sf = (x, k) => (x <= 0 ? 1 : gammaQ(k / 2, x / 2));
export function fPdf(x, d1, d2) {
  if (x < 0) return 0;
  if (x === 0) return d1 === 2 ? 1 : d1 < 2 ? Infinity : 0;
  const ln = 0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) - Math.log(x) - (lnGamma(d1 / 2) + lnGamma(d2 / 2) - lnGamma((d1 + d2) / 2));
  return Math.exp(ln);
}
export const fCdf = (x, d1, d2) => (x <= 0 ? 0 : betaInc((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2));
export const fSf = (x, d1, d2) => (x <= 0 ? 1 : betaInc(d2 / (d2 + d1 * x), d2 / 2, d1 / 2));
/** Invert a continuous CDF on [lo, ∞) by bracketing and bisection, then Newton polishing. */
function invertCdf(p, cdf, pdf, start) {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0, hi = Math.max(start, 1);
  while (cdf(hi) < p) { lo = hi; hi *= 2; if (hi > 1e12) return Infinity; }
  for (let i = 0; i < 200 && hi - lo > 1e-14 * hi; i++) { const mid = (lo + hi) / 2; if (cdf(mid) < p) lo = mid; else hi = mid; }
  let x = (lo + hi) / 2;
  for (let i = 0; i < 3; i++) { const d = pdf(x); if (!(d > 0) || !Number.isFinite(d)) break; const nx = x - (cdf(x) - p) / d; if (nx > lo && nx < hi) x = nx; }
  return x;
}
/** Upper-tail inverses work on the upper tail so tiny probabilities keep precision. */
function invertSf(q, sf, pdf, start) {
  if (q >= 1) return 0;
  if (q <= 0) return Infinity;
  let lo = 0, hi = Math.max(start, 1);
  while (sf(hi) > q) { lo = hi; hi *= 2; if (hi > 1e12) return Infinity; }
  for (let i = 0; i < 200 && hi - lo > 1e-14 * hi; i++) { const mid = (lo + hi) / 2; if (sf(mid) > q) lo = mid; else hi = mid; }
  let x = (lo + hi) / 2;
  for (let i = 0; i < 3; i++) { const d = pdf(x); if (!(d > 0) || !Number.isFinite(d)) break; const nx = x + (sf(x) - q) / d; if (nx > lo && nx < hi) x = nx; }
  return x;
}
export const chi2Inv = (p, k) => invertCdf(p, (x) => chi2Cdf(x, k), (x) => chi2Pdf(x, k), k);
export const chi2InvSf = (q, k) => invertSf(q, (x) => chi2Sf(x, k), (x) => chi2Pdf(x, k), k);
export const fInv = (p, d1, d2) => invertCdf(p, (x) => fCdf(x, d1, d2), (x) => fPdf(x, d1, d2), 1);
export const fInvSf = (q, d1, d2) => invertSf(q, (x) => fSf(x, d1, d2), (x) => fPdf(x, d1, d2), 1);

// ---------------------------------------------------------------- discrete distributions
/** Binomial(n, p): P(X = k), P(X ≤ k), P(X > k). */
export function binomPmf(k, n, p) {
  if (!(k >= 0 && k <= n) || k !== Math.floor(k)) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  // direct product where it can't overflow or underflow (exact for small cases: 0.5⁵ × 10 = 0.3125), else logarithms
  const c = n <= 1020 ? combin(n, k) : Infinity, direct = c * p ** k * (1 - p) ** (n - k);
  if (Number.isFinite(c) && direct > 1e-280) return direct;
  return Math.exp(lnFact(n) - lnFact(k) - lnFact(n - k) + k * Math.log(p) + (n - k) * Math.log1p(-p));
}
export function binomCdf(k, n, p) {
  k = Math.floor(k);
  if (k < 0) return 0;
  if (k >= n) return 1;
  if (p === 0) return 1;
  if (p === 1) return 0;
  return betaInc(1 - p, n - k, k + 1);
}
export function binomSf(k, n, p) {
  k = Math.floor(k);
  if (k < 0) return 1;
  if (k >= n) return 0;
  if (p === 0) return 0;
  if (p === 1) return 1;
  return betaInc(p, k + 1, n - k);
}
/** The smallest k with P(X ≤ k) ≥ alpha (Excel's BINOM.INV, SciPy's binom.ppf). */
export function binomInv(alpha, n, p) {
  let lo = 0, hi = n;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (binomCdf(mid, n, p) >= alpha * (1 - 1e-12)) hi = mid; else lo = mid + 1; }
  return lo;
}
/** Poisson(λ): P(X = k), P(X ≤ k), P(X > k). */
export function poissonPmf(k, lam) {
  if (!(k >= 0) || k !== Math.floor(k)) return 0;
  if (lam === 0) return k === 0 ? 1 : 0;
  if (k <= 170) { const direct = (lam ** k * Math.exp(-lam)) / factorial(k); if (Number.isFinite(direct) && direct > 1e-280) return direct; }
  return Math.exp(k * Math.log(lam) - lam - lnFact(k));
}
export const poissonCdf = (k, lam) => (Math.floor(k) < 0 ? 0 : lam === 0 ? 1 : gammaQ(Math.floor(k) + 1, lam));
export const poissonSf = (k, lam) => (Math.floor(k) < 0 ? 1 : lam === 0 ? 0 : gammaP(Math.floor(k) + 1, lam));
/** Exponential(λ): density and CDF. */
export const exponPdf = (x, lam) => (x < 0 ? 0 : lam * Math.exp(-lam * x));
export const exponCdf = (x, lam) => (x < 0 ? 0 : -Math.expm1(-lam * x));

// ---------------------------------------------------------------- samples
const summary = (s) => {
  if (Array.isArray(s)) { const n = s.length; return { n, mean: meanOf(s), sd: n > 1 ? Math.sqrt(varOf(s)) : NaN }; }
  return { n: s.n, mean: s.mean, sd: s.sd };
};
const pFrom = (stat, alt, sf, cdf) => (alt === 'less' ? cdf(stat) : alt === 'greater' ? sf(stat) : Math.min(1, 2 * Math.min(sf(stat), cdf(stat))));
const tP = (t, df, alt) => pFrom(t, alt, (x) => tSf(x, df), (x) => tCdf(x, df));
const zP = (z, alt) => pFrom(z, alt, normSf, normCdf);
/** The interval for a parameter: two-sided at `conf`, or the one-sided bound that matches the alternative. */
function interval(est, se, crit2, crit1, alt) {
  if (alt === 'less') return [-Infinity, est + crit1 * se];
  if (alt === 'greater') return [est - crit1 * se, Infinity];
  return [est - crit2 * se, est + crit2 * se];
}

// ---------------------------------------------------------------- confidence intervals and sample sizes
/** t interval for a mean. */
export function ciMean(sample, conf = 0.95) {
  const { n, mean, sd } = summary(sample);
  const se = sd / Math.sqrt(n), df = n - 1, t = tQuantile(1 - (1 - conf) / 2, df);
  return { n, mean, sd, se, df, crit: t, margin: t * se, low: mean - t * se, high: mean + t * se };
}
/** z interval for a mean when the population SD is known. */
export function ciMeanZ(sample, sigma, conf = 0.95) {
  const { n, mean } = summary(sample);
  const se = sigma / Math.sqrt(n), z = normQuantile(1 - (1 - conf) / 2);
  return { n, mean, se, crit: z, margin: z * se, low: mean - z * se, high: mean + z * se };
}
/** Interval for a proportion: 'wald' (p̂ ± z √(p̂(1 − p̂)/n)) or 'wilson'. */
export function ciProp(x, n, conf = 0.95, method = 'wald') {
  const p = x / n, z = normQuantile(1 - (1 - conf) / 2);
  if (method === 'wilson') {
    const den = 1 + (z * z) / n, centre = (p + (z * z) / (2 * n)) / den, half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
    return { p, n, crit: z, centre, margin: half, low: centre - half, high: centre + half };
  }
  const se = Math.sqrt((p * (1 - p)) / n);
  return { p, n, se, crit: z, margin: z * se, low: p - z * se, high: p + z * se };
}
/** Sample size for a mean to within ±E at `conf`, given a planning SD (rounded up). */
export const sampleSizeMean = (sigma, E, conf = 0.95) => Math.ceil(((normQuantile(1 - (1 - conf) / 2) * sigma) / E) ** 2 - 1e-9);
/** Sample size for a proportion to within ±E at `conf` (p = 0.5 is the most cautious planning value). */
export const sampleSizeProp = (E, conf = 0.95, p = 0.5) => Math.ceil((normQuantile(1 - (1 - conf) / 2) ** 2 * p * (1 - p)) / (E * E) - 1e-9);

// ---------------------------------------------------------------- tests for means
/** One-sample t test of H0: μ = mu0. */
export function tTest1(sample, mu0 = 0, { alternative = 'two-sided', conf = 0.95 } = {}) {
  const { n, mean, sd } = summary(sample);
  const se = sd / Math.sqrt(n), df = n - 1, t = (mean - mu0) / se;
  const ci = interval(mean, se, tQuantile(1 - (1 - conf) / 2, df), tQuantile(conf, df), alternative);
  return { n, mean, sd, se, df, t, p: tP(t, df, alternative), low: ci[0], high: ci[1] };
}
/** One-sample z test of H0: μ = mu0 when the population SD is known. */
export function zTest1(sample, mu0, sigma, { alternative = 'two-sided', conf = 0.95 } = {}) {
  const { n, mean } = summary(sample);
  const se = sigma / Math.sqrt(n), z = (mean - mu0) / se;
  const ci = interval(mean, se, normQuantile(1 - (1 - conf) / 2), normQuantile(conf), alternative);
  return { n, mean, se, z, p: zP(z, alternative), low: ci[0], high: ci[1] };
}
/** Two-sample t test of H0: μ1 − μ2 = delta; Welch's (unequal variances) unless equalVar. */
export function tTest2(a, b, { equalVar = false, alternative = 'two-sided', delta = 0, conf = 0.95 } = {}) {
  const A = summary(a), B = summary(b);
  const v1 = A.sd ** 2, v2 = B.sd ** 2, diff = A.mean - B.mean;
  let se, df, pooled = null;
  if (equalVar) {
    df = A.n + B.n - 2;
    pooled = ((A.n - 1) * v1 + (B.n - 1) * v2) / df;
    se = Math.sqrt(pooled * (1 / A.n + 1 / B.n));
  } else {
    const q1 = v1 / A.n, q2 = v2 / B.n;
    se = Math.sqrt(q1 + q2);
    df = (q1 + q2) ** 2 / (q1 * q1 / (A.n - 1) + q2 * q2 / (B.n - 1));
  }
  const t = (diff - delta) / se;
  const ci = interval(diff, se, tQuantile(1 - (1 - conf) / 2, df), tQuantile(conf, df), alternative);
  return { n1: A.n, n2: B.n, mean1: A.mean, mean2: B.mean, var1: v1, var2: v2, diff, pooledVar: pooled, se, df, t, p: tP(t, df, alternative), low: ci[0], high: ci[1] };
}
/** Paired t test on the differences a − b (H0: mean difference = delta). */
export function tTestPaired(a, b, { alternative = 'two-sided', delta = 0, conf = 0.95 } = {}) {
  if (a.length !== b.length) return { error: 'A paired test needs the same number of values in each sample.' };
  const d = a.map((x, i) => x - b[i]);
  const r = tTest1(d, delta, { alternative, conf });
  const ma = meanOf(a), mb = meanOf(b);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < a.length; i++) { sxy += (a[i] - ma) * (b[i] - mb); sxx += (a[i] - ma) ** 2; syy += (b[i] - mb) ** 2; }
  return { ...r, meanDiff: r.mean, sdDiff: r.sd, mean1: ma, mean2: mb, var1: varOf(a), var2: varOf(b), r: sxy / Math.sqrt(sxx * syy) };
}
/** F test that two population variances are equal: F = s1² / s2², two-sided p as Excel's F.TEST gives. */
export function fTestVar(a, b) {
  const v1 = varOf(a), v2 = varOf(b), d1 = a.length - 1, d2 = b.length - 1, F = v1 / v2;
  return { F, df1: d1, df2: d2, p: Math.min(1, 2 * Math.min(fSf(F, d1, d2), fCdf(F, d1, d2))) };
}

// ---------------------------------------------------------------- tests for proportions
/** One-proportion z test of H0: p = p0 (the standard error uses p0); the interval is Wald's. */
export function propTest1(x, n, p0, { alternative = 'two-sided', conf = 0.95 } = {}) {
  const p = x / n, se0 = Math.sqrt((p0 * (1 - p0)) / n), z = (p - p0) / se0;
  const se = Math.sqrt((p * (1 - p)) / n);
  const ci = interval(p, se, normQuantile(1 - (1 - conf) / 2), normQuantile(conf), alternative);
  return { x, n, p, se0, z, pValue: zP(z, alternative), low: ci[0], high: ci[1], expectedOk: n * p0 >= 10 && n * (1 - p0) >= 10 };
}
/** Two-proportion z test of H0: p1 = p2 (pooled standard error); the interval for p1 − p2 is unpooled. */
export function propTest2(x1, n1, x2, n2, { alternative = 'two-sided', conf = 0.95 } = {}) {
  const p1 = x1 / n1, p2 = x2 / n2, diff = p1 - p2, pool = (x1 + x2) / (n1 + n2);
  const sePool = Math.sqrt(pool * (1 - pool) * (1 / n1 + 1 / n2)), z = diff / sePool;
  const se = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
  const ci = interval(diff, se, normQuantile(1 - (1 - conf) / 2), normQuantile(conf), alternative);
  return { p1, p2, diff, pool, sePool, z, pValue: zP(z, alternative), se, low: ci[0], high: ci[1] };
}

// ---------------------------------------------------------------- chi-square tests
/** Goodness of fit: observed counts against expected counts (or probabilities, scaled to the total). */
export function chisqGof(observed, expected, { ddof = 0 } = {}) {
  const n = sumOf(observed);
  const probs = Math.abs(sumOf(expected) - 1) < 1e-9 ? expected : null;
  const exp = probs ? probs.map((q) => q * n) : expected;
  const contrib = observed.map((o, i) => (o - exp[i]) ** 2 / exp[i]);
  const stat = sumOf(contrib), df = observed.length - 1 - ddof;
  return { stat, df, p: chi2Sf(stat, df), expected: exp, contrib, minExpected: Math.min(...exp), n };
}
/** Independence in an r × c table of counts (no continuity correction). */
export function chisqIndependence(table) {
  const r = table.length, c = table[0].length;
  const rows = table.map((row) => sumOf(row)), cols = Array.from({ length: c }, (_, j) => sumOf(table.map((row) => row[j]))), n = sumOf(rows);
  const expected = table.map((_, i) => cols.map((cj) => (rows[i] * cj) / n));
  const contrib = table.map((row, i) => row.map((o, j) => (o - expected[i][j]) ** 2 / expected[i][j]));
  const stat = sumOf(contrib.flat()), df = (r - 1) * (c - 1);
  const minExpected = Math.min(...expected.flat());
  return { stat, df, p: chi2Sf(stat, df), expected, contrib, rowTotals: rows, colTotals: cols, n, minExpected, cramersV: Math.sqrt(stat / (n * Math.min(r - 1, c - 1))) };
}

// ---------------------------------------------------------------- one-way analysis of variance
/** One-way ANOVA: groups is an array of arrays. */
export function anova1(groups, { alpha = 0.05 } = {}) {
  const k = groups.length, counts = groups.map((g) => g.length), sums = groups.map((g) => sumOf(g));
  const means = groups.map((g, i) => sums[i] / counts[i]), vars = groups.map((g) => (g.length > 1 ? varOf(g) : NaN));
  const n = sumOf(counts), grand = sumOf(sums) / n;
  const ssb = sumOf(groups.map((g, i) => counts[i] * (means[i] - grand) ** 2));
  const ssw = sumOf(groups.map((g, i) => sumOf(g.map((x) => (x - means[i]) ** 2))));
  const dfb = k - 1, dfw = n - k, msb = ssb / dfb, msw = ssw / dfw, F = msb / msw;
  return { k, n, counts, sums, means, vars, grand, ssb, ssw, sst: ssb + ssw, dfb, dfw, dft: n - 1, msb, msw, F, p: fSf(F, dfb, dfw), fCrit: fInvSf(alpha, dfb, dfw), eta2: ssb / (ssb + ssw) };
}

/** Welch's (1951) one-way ANOVA: groups weighted by n ÷ s², no equal-variance assumption. */
export function anovaWelch(groups) {
  const k = groups.length, n = groups.map((g) => g.length), m = groups.map((g) => meanOf(g)), v = groups.map((g) => varOf(g));
  const w = n.map((ni, i) => ni / v[i]), W = sumOf(w), mw = sumOf(w.map((wi, i) => wi * m[i])) / W;
  const A = sumOf(w.map((wi, i) => wi * (m[i] - mw) ** 2)) / (k - 1);
  const lam = sumOf(w.map((wi, i) => (1 - wi / W) ** 2 / (n[i] - 1)));
  const F = A / (1 + ((2 * (k - 2)) / (k * k - 1)) * lam), df2 = (k * k - 1) / (3 * lam);
  return { F, df1: k - 1, df2, p: fSf(F, k - 1, df2) };
}
/** Kruskal–Wallis H with average ranks for ties and the tie correction, referred to chi-square with k − 1 df. */
export function kruskal(groups) {
  const all = groups.flatMap((g, gi) => g.map((x) => ({ x, gi }))).sort((a, b) => a.x - b.x);
  const N = all.length, ranks = new Array(N);
  let ties = 0;
  for (let i = 0; i < N;) {
    let j = i;
    while (j + 1 < N && all[j + 1].x === all[i].x) j += 1;
    for (let q = i; q <= j; q++) ranks[q] = (i + j) / 2 + 1;
    ties += (j - i + 1) ** 3 - (j - i + 1);
    i = j + 1;
  }
  const R = groups.map(() => 0);
  all.forEach((o, i) => { R[o.gi] += ranks[i]; });
  const H = ((12 / (N * (N + 1))) * sumOf(R.map((r, i) => (r * r) / groups[i].length)) - 3 * (N + 1)) / (1 - ties / (N ** 3 - N));
  return { H, df: groups.length - 1, p: chi2Sf(H, groups.length - 1), rankSums: R };
}

// ---------------------------------------------------------------- power (normal approximation)
/**
 * Power of a z test for a mean (or a difference in means with `twoSample`, n per group) to detect a true difference
 * `delta` with population SD `sigma`. The t test's power is close to this when n is moderate; B04 teaches it this way.
 */
export function powerMean({ delta, sigma, n, alpha = 0.05, alternative = 'two-sided', twoSample = false }) {
  const se = sigma * Math.sqrt((twoSample ? 2 : 1) / n), shift = delta / se;
  if (alternative === 'greater') return normSf(normQuantile(1 - alpha) - shift);
  if (alternative === 'less') return normCdf(-normQuantile(1 - alpha) - shift);
  const z = normQuantile(1 - alpha / 2);
  return normSf(z - shift) + normCdf(-z - shift);
}
/** The n (per group with twoSample) that gives `power` in that approximation, rounded up. */
export function sampleSizeForPower({ delta, sigma, alpha = 0.05, power = 0.8, alternative = 'two-sided', twoSample = false }) {
  const za = normQuantile(1 - (alternative === 'two-sided' ? alpha / 2 : alpha)), zb = normQuantile(power);
  return Math.ceil((twoSample ? 2 : 1) * ((za + zb) * sigma / delta) ** 2 - 1e-9);
}
