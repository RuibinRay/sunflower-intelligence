// survey.test.mjs — checks for assets/js/core/survey.js. Reference values: Stat Trek's worked example of stratified
// estimation (https://stattrek.com/survey-research/stratified-sampling-analysis: 20,000 pupils, 18 boys and 18 girls,
// estimate 75, standard error 1.45), AAPOR's Standard Definitions (10th edition, 2023) formulas, and Monte Carlo draws
// from a known finite population, which check the variance formulas against what repeated sampling actually does.
import * as S from '../assets/js/core/survey.js';
import { mulberry32 } from '../assets/js/core/rng.js';

let n = 0, bad = 0;
const ok = (what, cond, extra = '') => { n++; if (!cond) { bad++; console.log(`✗ ${what} ${extra}`); } };
const near = (what, a, b, tol) => ok(what, Math.abs(a - b) <= tol, `got ${a}, expected ${b} ± ${tol}`);

// ---- allocation
{
  const a = S.proportionalAllocation([520, 1000, 150, 4330], 2004);
  ok('proportional allocation adds to n', a.reduce((x, y) => x + y, 0) === 2004, String(a));
  ok('proportional allocation values', a.join() === '174,334,50,1446', String(a));
  const b = S.proportionalAllocation([1, 1, 1], 2);
  ok('largest remainder breaks ties by order', b.join() === '1,1,0', String(b));
  const c = S.neymanAllocation([1000, 1000], [1, 3], 100);
  ok('Neyman puts more where the spread is larger', c.join() === '25,75', String(c));
}

// ---- Stat Trek's worked example (a mean)
{
  const r = S.stratifiedMean([{ N: 10000, n: 18, mean: 70, sd: Math.sqrt(105.41) }, { N: 10000, n: 18, mean: 80, sd: Math.sqrt(45.41) }]);
  near('Stat Trek estimate', r.mean, 75, 1e-12);
  near('Stat Trek standard error 1.45', r.se, 1.45, 0.005);
  near('Stat Trek margin 2.84', r.margin, 2.84, 0.01);
}

// ---- a stratified proportion by hand
{
  const r = S.stratifiedProportion([{ N: 600, n: 60, x: 30 }, { N: 400, n: 40, x: 8 }]);
  near('stratified p', r.p, 0.6 * 0.5 + 0.4 * 0.2, 1e-12);
  const v = (600 ** 2 * 0.9 * (60 / 59) * 0.25 / 60 + 400 ** 2 * 0.9 * (40 / 39) * 0.16 / 40) / 1000 ** 2;
  near('stratified SE by hand', r.se, Math.sqrt(v), 1e-12);
  const d = S.designEffect(r);
  ok('proportional stratification beats SRS here (deff < 1)', d.deff < 1, String(d.deff));
}

// ---- Monte Carlo: the stratified SE formula against repeated stratified samples from a known population
{
  const rand = mulberry32(42);
  const sizes = [520, 1000, 150, 4330], shares = [0.66, 0.48, 0.52, 0.28];
  const pop = sizes.map((N, h) => Array.from({ length: N }, () => (rand() < shares[h] ? 1 : 0)));
  const P = pop.map((xs) => xs.reduce((a, b) => a + b, 0) / xs.length), Ntot = sizes.reduce((a, b) => a + b, 0);
  const truth = P.reduce((a, p, h) => a + (sizes[h] / Ntot) * p, 0);
  const alloc = S.proportionalAllocation(sizes, 600);
  // the exact variance of the stratified estimator: Σ W_h² (1 − f_h) S_h² / n_h, S_h² = N_h/(N_h − 1) P_h(1 − P_h)
  const exact = Math.sqrt(sizes.reduce((a, N, h) => a + (N / Ntot) ** 2 * (1 - alloc[h] / N) * (N / (N - 1)) * P[h] * (1 - P[h]) / alloc[h], 0));
  const reps = 20000, est = [], ses = [];
  for (let k = 0; k < reps; k++) {
    const strata = pop.map((xs, h) => {
      const idx = xs.map((_, i) => i);
      for (let i = 0; i < alloc[h]; i++) { const j = i + Math.floor(rand() * (idx.length - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      let x = 0; for (let i = 0; i < alloc[h]; i++) x += xs[idx[i]];
      return { N: xs.length, n: alloc[h], x };
    });
    const r = S.stratifiedProportion(strata);
    est.push(r.p); ses.push(r.se ** 2);
  }
  const m = est.reduce((a, b) => a + b, 0) / reps, sdEmp = Math.sqrt(est.reduce((a, b) => a + (b - m) ** 2, 0) / (reps - 1));
  const meanVarHat = ses.reduce((a, b) => a + b, 0) / reps;
  near('stratified estimator is unbiased (Monte Carlo)', m, truth, 0.0015);
  near('empirical SD matches the exact formula', sdEmp, exact, exact * 0.03);
  near('the variance estimator is unbiased for the exact variance', meanVarHat, exact ** 2, exact ** 2 * 0.03);
}

// ---- post-stratification and Kish
{
  const w = S.postStratWeights([520, 1000, 150, 4330], [97, 114, 20, 318]);
  near('weight is N_h / n_h', w.weights[0], 520 / 97, 1e-12);
  near('relative weights average 1', w.rel.reduce((a, b, h) => a + b * [97, 114, 20, 318][h], 0) / 549, 1, 1e-12);
  const values = [], weights = [];
  [[97, 70], [114, 52], [20, 11], [318, 95]].forEach(([nh, xh], h) => { for (let i = 0; i < nh; i++) { values.push(i < xh ? 1 : 0); weights.push(w.weights[h]); } });
  const st = S.stratifiedProportion([{ N: 520, n: 97, x: 70 }, { N: 1000, n: 114, x: 52 }, { N: 150, n: 20, x: 11 }, { N: 4330, n: 318, x: 95 }]);
  near('post-stratified mean equals the stratified estimate', S.weightedMean(values, weights), st.p, 1e-12);
  const k = S.kish([1, 1, 2, 2]);
  near('Kish n_eff for weights 1,1,2,2', k.nEff, 3.6, 1e-12);
  near('equal weights: n_eff = n', S.kish([3, 3, 3, 3, 3]).nEff, 5, 1e-12);
  near('Kish deff = 1 + CV² of the weights', k.deff, 1 + (0.5 / 1.5) ** 2, 1e-12);
}

// ---- NPS and its standard error (Monte Carlo)
{
  const r = S.nps({ promoters: 300, passives: 150, detractors: 150 });
  near('NPS score', r.score, 25, 1e-12);
  near('NPS SE formula', r.se, 100 * Math.sqrt((0.5 + 0.25 - 0.25 ** 2) / 600), 1e-12);
  // Rocks (2016) AW(3,T) on M04's workshop participants (16 promoters, 6 passives, 5 detractors): +8.6 to +64.7
  const ws = S.nps({ promoters: 16, passives: 6, detractors: 5 });
  near('Wald interval, workshop', ws.low, 11.2, 0.05); near('Wald upper, workshop', ws.high, 70.2, 0.05);
  near('adjusted Wald (Rocks) lower', ws.adjusted.low, 8.6, 0.05); near('adjusted Wald (Rocks) upper', ws.adjusted.high, 64.7, 0.05);
  ok('adjusted interval is pulled towards zero (its centre moves in)', Math.abs(ws.adjusted.score) < Math.abs(ws.score));
  const fromScores = S.nps([10, 9, 8, 7, 6, 0, 9]);
  ok('NPS from 0–10 scores', fromScores.promoters === 3 && fromScores.passives === 2 && fromScores.detractors === 2);
  const rand = mulberry32(7), reps = 20000, nn = 400, pP = 0.45, pD = 0.2, vals = [];
  for (let k = 0; k < reps; k++) { let P = 0, D = 0; for (let i = 0; i < nn; i++) { const u = rand(); if (u < pP) P++; else if (u < pP + pD) D++; } vals.push(100 * (P - D) / nn); }
  const m = vals.reduce((a, b) => a + b, 0) / reps, sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / (reps - 1));
  const theory = 100 * Math.sqrt((pP + pD - (pP - pD) ** 2) / nn);
  near('NPS SE matches repeated samples', sd, theory, theory * 0.03);
}

// ---- AAPOR response rates
{
  const r = S.responseRates({ I: 200, P: 20, R: 50, NC: 100, O: 10, U: 120, e: 0.5 });
  near('RR1', r.RR1, 200 / 500, 1e-12);
  near('RR2', r.RR2, 220 / 500, 1e-12);
  near('RR3', r.RR3, 200 / 440, 1e-12);
  near('RR4', r.RR4, 220 / 440, 1e-12);
}

// ---- margin of error, cross-tabs, top box
{
  near('±4 points at n = 601 (B04’s plan)', S.marginOfError(0.5, 601), 0.03997, 0.00001);
  near('finite population correction shrinks the margin', S.marginOfError(0.5, 600, 0.95, 6000), S.marginOfError(0.5, 600) * Math.sqrt(5400 / 5999), 1e-12);
  const t = S.crosstab(['a', 'a', 'b', 'b', 'b'], ['x', 'y', 'x', 'x', 'y'], ['a', 'b'], ['x', 'y']);
  ok('crosstab counts', JSON.stringify(t.counts) === '[[1,1],[2,1]]');
  near('row percentage', t.rowPct[1][0], 2 / 3, 1e-12);
  near('column percentage', t.colPct[1][0], 2 / 3, 1e-12);
  near('top box', S.topBox([1, 2, 3, 4, 5, 1, 2, 2]), 2 / 8, 1e-12);
  near('top-two box', S.topBox([1, 2, 3, 4, 5, 1, 2, 2], 2), 5 / 8, 1e-12);
}

console.log(bad ? `${bad} of ${n} survey checks failed` : `all ${n} survey checks passed`);
process.exit(bad ? 1 : 0);
