// survey.js — survey-sampling arithmetic for M04 Market Research: allocation, stratified estimates with their standard
// errors, post-stratification weights, the Kish effective sample size, the Net Promoter Score with its standard error,
// AAPOR response rates, and cross-tabulations. Pure functions; tested in tests/survey.test.mjs against published worked
// examples and against Monte Carlo draws from a known finite population.
//
// Conventions. A stratum is { N, n, x } for a proportion (x successes among n sampled, N in the population) or
// { N, n, mean, sd } for a mean (sd = the sample standard deviation, n − 1 in the denominator). Sampling within each
// stratum is simple random sampling without replacement, so each stratum's variance carries the finite population
// correction 1 − n/N. Proportions are 0–1; scores (NPS) are reported on the usual −100 to +100 scale.
import { normInv } from './inference.js?v=17';

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const z = (conf) => normInv(1 - (1 - conf) / 2);

/** Proportional allocation of a sample of n across strata of sizes Ns, rounded by the largest-remainder method so the
 *  parts add to n exactly. */
export function proportionalAllocation(Ns, n) {
  const N = sum(Ns), raw = Ns.map((k) => (n * k) / N), base = raw.map(Math.floor);
  let left = n - sum(base);
  const order = raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) { if (left <= 0) break; base[i]++; left--; }
  return base;
}

/** Neyman allocation: n_h proportional to N_h × S_h (S_h the stratum's standard deviation), largest-remainder rounding. */
export function neymanAllocation(Ns, Ss, n) { return proportionalAllocation(Ns.map((k, i) => k * Ss[i]), n); }

/** Stratified estimate of a population proportion: p = Σ W_h p_h with W_h = N_h / N, and
 *  SE = (1/N) √(Σ N_h² (1 − n_h/N_h) s_h² / n_h), where s_h² = n_h/(n_h − 1) × p_h(1 − p_h). */
export function stratifiedProportion(strata, conf = 0.95) {
  const N = sum(strata.map((s) => s.N));
  const parts = strata.map((s) => {
    const p = s.x / s.n, s2 = s.n > 1 ? (s.n / (s.n - 1)) * p * (1 - p) : 0;
    return { ...s, W: s.N / N, p, varTerm: s.N ** 2 * (1 - s.n / s.N) * s2 / s.n };
  });
  const p = sum(parts.map((s) => s.W * s.p)), se = Math.sqrt(sum(parts.map((s) => s.varTerm))) / N, m = z(conf) * se;
  return { p, se, margin: m, low: p - m, high: p + m, strata: parts, n: sum(strata.map((s) => s.n)), N };
}

/** Stratified estimate of a population mean: Σ W_h ȳ_h with SE = (1/N) √(Σ N_h² (1 − n_h/N_h) s_h² / n_h). */
export function stratifiedMean(strata, conf = 0.95) {
  const N = sum(strata.map((s) => s.N));
  const mean = sum(strata.map((s) => (s.N / N) * s.mean));
  const se = Math.sqrt(sum(strata.map((s) => s.N ** 2 * (1 - s.n / s.N) * s.sd ** 2 / s.n))) / N, m = z(conf) * se;
  return { mean, se, margin: m, low: mean - m, high: mean + m, N, n: sum(strata.map((s) => s.n)) };
}

/** The standard error a simple random sample of the same total size would have for proportion p (with the finite
 *  population correction), and the design effect: the stratified variance ÷ that variance. */
export function designEffect(est) {
  const { p, n, N } = est;
  const seSrs = Math.sqrt((1 - n / N) * p * (1 - p) / (n - 1));
  return { seSrs, deff: (est.se / seSrs) ** 2 };
}

/** Post-stratification: each respondent in stratum h gets weight N_h / n_h (it stands for that many people), so the
 *  weighted sample matches the population's stratum sizes. `rel` rescales the weights to average 1. */
export function postStratWeights(popCounts, sampleCounts) {
  const w = popCounts.map((N, h) => (sampleCounts[h] ? N / sampleCounts[h] : 0));
  const n = sum(sampleCounts), Ntot = sum(popCounts);
  return { weights: w, rel: w.map((x) => (x * n) / Ntot) };
}

/** Weighted share of values that are 1 (or weighted mean of values) with weights w. */
export function weightedMean(values, weights) {
  const W = sum(weights);
  return sum(values.map((v, i) => v * weights[i])) / W;
}

/** Kish's effective sample size, (Σw)² ÷ Σw², and the design effect from unequal weights, n ÷ n_eff = 1 + CV²(w). */
export function kish(weights) {
  const s1 = sum(weights), s2 = sum(weights.map((w) => w * w)), nEff = (s1 * s1) / s2;
  return { nEff, deff: weights.length / nEff };
}

/** Net Promoter Score from 0–10 answers (or from counts { promoters, passives, detractors }): promoters score 9–10,
 *  passives 7–8, detractors 0–6, and NPS = 100 × (share of promoters − share of detractors). Its standard error, from
 *  the multinomial variance of the difference of two shares, is 100 × √((p_P + p_D − (p_P − p_D)²) ÷ n). `adjusted` is
 *  Rocks's (2016) adjusted Wald interval AW(3,T). */
export function nps(input, conf = 0.95) {
  const c = Array.isArray(input)
    ? { promoters: input.filter((v) => v >= 9).length, passives: input.filter((v) => v >= 7 && v <= 8).length, detractors: input.filter((v) => v <= 6).length }
    : input;
  const n = c.promoters + c.passives + c.detractors, pP = c.promoters / n, pD = c.detractors / n;
  const score = 100 * (pP - pD), se = 100 * Math.sqrt((pP + pD - (pP - pD) ** 2) / n), m = z(conf) * se;
  // Rocks (2016), The American Statistician 70(4): the Wald interval above is too narrow on small bases; the adjusted
  // Wald interval AW(3,T) adds 3/4 to the promoters and the detractors and 3/2 to the passives, then applies the same
  // formula (the interval is centred on the adjusted score; the reported NPS stays the unadjusted one)
  const nA = n + 3, aP = (c.promoters + 0.75) / nA, aD = (c.detractors + 0.75) / nA;
  const aScore = 100 * (aP - aD), aSe = 100 * Math.sqrt((aP + aD - (aP - aD) ** 2) / nA), aM = z(conf) * aSe;
  return { ...c, n, pP, pD, score, se, margin: m, low: score - m, high: score + m,
    adjusted: { n: nA, score: aScore, se: aSe, margin: aM, low: aScore - aM, high: aScore + aM } };
}

/** AAPOR response rates (Standard Definitions): I complete interviews, P partials, R refusals and break-offs, NC
 *  non-contacts, O other non-interviews, U cases of unknown eligibility, e the estimated share of U that is eligible.
 *  RR1 = I ÷ (I + P + R + NC + O + U); RR2 counts partials as responses; RR3 = I ÷ (I + P + R + NC + O + e·U);
 *  RR4 = (I + P) ÷ (I + P + R + NC + O + e·U). */
export function responseRates({ I, P = 0, R = 0, NC = 0, O = 0, U = 0, e = 1 }) {
  const known = I + P + R + NC + O;
  return { RR1: I / (known + U), RR2: (I + P) / (known + U), RR3: I / (known + e * U), RR4: (I + P) / (known + e * U) };
}

/** Margin of error for a proportion p from n responses at the given confidence, optionally with the finite population
 *  correction for a population of N. */
export function marginOfError(p, n, conf = 0.95, N = Infinity) {
  const fpc = Number.isFinite(N) ? Math.sqrt((N - n) / (N - 1)) : 1;
  return z(conf) * Math.sqrt((p * (1 - p)) / n) * fpc;
}

/** A cross-tabulation of two categorical arrays: counts[i][j] for rowLevels[i] × colLevels[j], with row and column
 *  totals and the two kinds of percentage (share of the row, share of the column). */
export function crosstab(rows, cols, rowLevels, colLevels) {
  const counts = rowLevels.map(() => colLevels.map(() => 0));
  rows.forEach((r, k) => { const i = rowLevels.indexOf(r), j = colLevels.indexOf(cols[k]); if (i >= 0 && j >= 0) counts[i][j]++; });
  const rowTotals = counts.map(sum), colTotals = colLevels.map((_, j) => sum(counts.map((r) => r[j]))), n = sum(rowTotals);
  return {
    counts, rowTotals, colTotals, n,
    rowPct: counts.map((r, i) => r.map((c) => (rowTotals[i] ? c / rowTotals[i] : 0))),
    colPct: counts.map((r) => r.map((c, j) => (colTotals[j] ? c / colTotals[j] : 0))),
  };
}

/** Share of answers in the top k boxes of a 1–5 scale coded 1 = best (for example k = 2: "definitely" or "probably"). */
export function topBox(answers, k = 1) { return answers.filter((a) => a >= 1 && a <= k).length / answers.filter((a) => a >= 1 && a <= 5).length; }
